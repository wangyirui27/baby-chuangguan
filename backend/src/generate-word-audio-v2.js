/**
 * 宝宝闯关 · 关卡单词音频生成器（豆包语音合成模型 2.0 + Natasha）
 *
 * 使用方式：cd backend && node src/generate-word-audio-v2.js
 * 生产化：所有关卡单词统一使用 en_female_natasha_uranus_bigtts 声线
 * 幂等：已存在且有效的 MP3 跳过；失败支持中断重跑；manifest 原子写入
 * 安全：所有凭据仅从 .env 读取，绝不输出或写入 manifest
 *
 * API: V3 HTTP Chunked 单向流 (POST /api/v3/tts/unidirectional)
 * 鉴权: X-Api-App-Id + X-Api-Access-Key + X-Api-Resource-Id: seed-tts-2.0
 * Speaker: en_female_natasha_uranus_bigtts (固定)
 *
 * 数据源：与 script.js 的 200 关课程表保持一致，
 * 去重但保留 level_id 关联。manifest 覆盖当前所有关卡示例词。
 */

// ─── 共享 V3 实现 ──────────────────────────────────────
// 复用 generate-voice-samples-v2.js 中已验证的 JsonStreamParser、
// sha256、mp3HeaderValid、fileValid、sanitizeError，避免代码漂移。
const {
  JsonStreamParser,
  sha256,
  mp3HeaderValid,
  fileValid,
  sanitizeError,
} = require('./generate-voice-samples-v2.js');

const dotenv = require('dotenv');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const https = require('node:https');
const { levels: COURSE_LEVELS } = require('../../script.js');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// ═══════════════════════════════════════════════════════════
//  课程数据 — 直接来自 script.js，避免音频 manifest 与关卡表漂移。
// ═══════════════════════════════════════════════════════════

const CURRICULUM_UNITS = COURSE_LEVELS.reduce((units, level) => {
  const unitIndex = Math.floor((level.id - 1) / 10);
  if (!units[unitIndex]) units[unitIndex] = { topic: level.topic, words: [] };
  units[unitIndex].words.push([level.title.toLowerCase(), level.zhTitle]);
  return units;
}, []);

// ═══════════════════════════════════════════════════════════
//  提取唯一单词（去重，保留 level_id 映射）
// ═══════════════════════════════════════════════════════════

function extractWordEntries() {
  const wordMap = new Map(); // word -> { word, level_ids: [], zh, unit, unit_index }

  CURRICULUM_UNITS.forEach((unit, ui) => {
    unit.words.forEach(([word, zh], wi) => {
      const levelId = ui * 10 + wi + 1;
      if (!wordMap.has(word)) {
        wordMap.set(word, {
          word,
          level_ids: [],
          zh,
          unit: unit.topic,
          unit_index: ui,
          word_index: wi,
        });
      }
      wordMap.get(word).level_ids.push(levelId);
    });
  });

  return Array.from(wordMap.values());
}

// ═══════════════════════════════════════════════════════════
//  配置常量
// ═══════════════════════════════════════════════════════════

const APP_ID = process.env.DOUBAO_APP_ID;
const ACCESS_KEY = process.env.DOUBAO_TOKEN;

const API_URL = 'https://openspeech.bytedance.com/api/v3/tts/unidirectional';
const RESOURCE_ID = 'seed-tts-2.0';
const SPEAKER = 'en_female_natasha_uranus_bigtts'; // 本项目正式声线 Natasha
const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [2000, 4000, 8000];
const REQUEST_TIMEOUT_MS = 60000;

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const WORDS_DIR = path.join(PROJECT_ROOT, 'assets', 'audio', 'words');
const MANIFEST_PATH = path.join(WORDS_DIR, 'word-audio-manifest.json');
const MANIFEST_JS_PATH = path.join(WORDS_DIR, 'word-audio-manifest.js');

// 缓存的 speaker/model 标识（manifest 缓存键，换声线会重新生成）
const CACHE_KEY = {
  speaker: SPEAKER,
  resource: RESOURCE_ID,
  format: 'mp3',
  sample_rate: 24000,
};

const RETRYABLE_CODES = [3003, 3005, 3030, 3031, 3032, 3040, 55000000];
const GLOBAL_BLOCKER_CODES = [45000010, 45000011];

// ═══════════════════════════════════════════════════════════
//  工具函数
// ═══════════════════════════════════════════════════════════

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** 文件名安全化 */
function safeFileName(word) {
  return word.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^_|_$/g, '');
}

/**
 * 缓存键：word + speaker + resource + format + sample_rate
 * 确保换声线后会重新生成而不会误命中旧文件。
 */
function cacheKey(word) {
  return `${word}|${CACHE_KEY.speaker}|${CACHE_KEY.resource}|${CACHE_KEY.format}|${CACHE_KEY.sample_rate}`;
}

/**
 * 验证已有文件是否匹配当前缓存键。
 * 检查：文件存在、MP3 有效、manifest 中同词的 cache_key 一致。
 */
function shouldRegenerate(word, existingEntries) {
  if (!existingEntries || !Array.isArray(existingEntries)) return true;
  const existing = existingEntries.find((e) => e.word === word);
  if (!existing) return true;
  // 检查缓存键一致性（换声线则重新生成）
  if (existing.cache_key && existing.cache_key !== cacheKey(word)) return true;
  // 检查 MP3 文件有效性
  const filePath = path.join(WORDS_DIR, `${safeFileName(word)}.mp3`);
  if (!fileValid(filePath)) return true;
  // 检查 manifest 中 hash 与文件一致
  if (existing.sha256) {
    try {
      const buf = fs.readFileSync(filePath);
      if (sha256(buf) !== existing.sha256) return true;
    } catch {
      return true;
    }
  }
  return false;
}

// ═══════════════════════════════════════════════════════════
//  V3 API 调用 — HTTP Chunked Unidirectional
// ═══════════════════════════════════════════════════════════

function callV3Tts(text) {
  const reqid = crypto.randomUUID();

  const body = JSON.stringify({
    user: {
      uid: 'word_audio_gen_v2',
    },
    req_params: {
      text,
      speaker: SPEAKER,
      audio_params: {
        format: 'mp3',
        sample_rate: 24000,
        speech_rate: 0,
        loudness_rate: 0,
      },
    },
  });

  return new Promise((resolve, reject) => {
    const url = new URL(API_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Api-App-Id': APP_ID,
        'X-Api-Access-Key': ACCESS_KEY,
        'X-Api-Resource-Id': RESOURCE_ID,
        'X-Api-Request-Id': reqid,
      },
      timeout: REQUEST_TIMEOUT_MS,
    };

    const req = https.request(options, (res) => {
      const parser = new JsonStreamParser();
      const audioChunks = [];
      let finalCode = null;
      let finalMessage = '';
      let parseError = null;

      res.on('data', (chunk) => {
        const jsonObjects = parser.feed(chunk.toString('utf8'));
        if (parser.error) {
          parseError = parser.error;
          return;
        }
        for (const obj of jsonObjects) {
          const h = obj.header || obj;
          const code = h.code;
          const message = h.message || '';
          const payload = obj.payload;

          if (code === 0 && payload && payload.data) {
            audioChunks.push(payload.data);
          } else if (code === 20000000) {
            finalCode = 20000000;
            finalMessage = message || 'Normal end';
          } else if (code !== 0 && code !== undefined && code !== 20000000) {
            finalCode = code;
            finalMessage = message || 'Unknown error';
          }
          // Flat JSON format: {"code":0,"data":"base64..."}
          // Handle when payload format is not used and obj has data directly
          if (code === 0 && !payload && obj.data) {
            audioChunks.push(obj.data);
          }
        }
      });

      res.on('end', () => {
        if (parseError) {
          reject(new Error(parseError));
          return;
        }
        // Flat JSON format: {"code":0,"data":"base64..."} (no 20000000 end marker)
        // If we have audio but finalCode was never set, treat as success
        if (finalCode === null && audioChunks.length > 0) {
          finalCode = 20000000;
          finalMessage = 'Normal end (flat format)';
        }
        resolve({
          code: finalCode,
          message: finalMessage,
          audioBase64: audioChunks.join(''),
          hasAudio: audioChunks.length > 0,
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.write(body);
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════
//  合成单个单词（带重试）
// ═══════════════════════════════════════════════════════════

async function synthesizeWord(word, outputPath) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await callV3Tts(word);

      if (result.code === 20000000 && result.hasAudio) {
        const audioBuf = Buffer.from(result.audioBase64, 'base64');
        fs.writeFileSync(outputPath, audioBuf);
        return {
          status: 'generated',
          size_bytes: audioBuf.length,
          sha256: sha256(audioBuf),
        };
      }

      if (result.code !== 0 && result.code !== 20000000) {
        if (GLOBAL_BLOCKER_CODES.includes(result.code)) {
          return {
            status: 'not_attempted_global_blocker',
            error: `Global auth error: code=${result.code} ${result.message || ''}`,
            error_sanitized: sanitizeError(`Global auth error: code=${result.code} ${result.message || ''}`),
          };
        }

        const isRetryable = RETRYABLE_CODES.includes(result.code);
        if (!isRetryable || attempt >= MAX_RETRIES) {
          return {
            status: 'failed',
            error: `API code=${result.code} message=${result.message || ''}`,
            error_sanitized: sanitizeError(`API code=${result.code} ${result.message || ''}`),
          };
        }

        console.warn(`  [RETRY ${attempt + 1}/${MAX_RETRIES}] ${result.message || `code=${result.code}`}`);
        await sleep(RETRY_DELAYS_MS[attempt] || 8000);
      }
    } catch (err) {
      if (attempt >= MAX_RETRIES) {
        const isAuth = err.message && (
          err.message.includes('401') || err.message.includes('403') ||
          err.message.includes('authenticate') || err.message.includes('grant')
        );
        return {
          status: isAuth ? 'not_attempted_global_blocker' : 'failed',
          error: `Network: ${err.message}`,
          error_sanitized: sanitizeError(`Network: ${err.message}`),
        };
      }
      console.warn(`  [RETRY ${attempt + 1}/${MAX_RETRIES}] network: ${err.message}`);
      await sleep(RETRY_DELAYS_MS[attempt] || 8000);
    }
  }

  return { status: 'failed', error: 'Exhausted all retries', error_sanitized: 'Exhausted all retries' };
}

// ═══════════════════════════════════════════════════════════
//  JS Manifest 生成（file:// 兼容注入）
//  从同一 manifest 对象生成 window.WORD_AUDIO_MANIFEST 赋值语句
// ═══════════════════════════════════════════════════════════

function generateJsManifestContent(m) {
  // 精简摘要：只保留前台关心的字段
  const safeSummary = {
    total: m.summary.total,
    available: m.summary.available,
    levels: m.summary.levels,
    speaker: m.summary.speaker,
  };
  const safeEntries = m.entries.map((e) => ({
    word: e.word,
    level_ids: e.level_ids,
    level_count: e.level_count,
    zh: e.zh,
    unit: e.unit,
    url: e.url,
    status: e.status,
    size_bytes: e.size_bytes,
  }));
  const payload = JSON.stringify({
    version: m.version,
    generated_at: m.generated_at,
    speaker: m.speaker,
    voice_type: m.voice_type,
    audio_format: m.audio_format,
    sample_rate: m.sample_rate,
    entries: safeEntries,
    summary: safeSummary,
  });
  return `window.WORD_AUDIO_MANIFEST = ${payload};\n`;
}

// ═══════════════════════════════════════════════════════════
//  主流程
// ═══════════════════════════════════════════════════════════

async function main() {
  // ── 横幅 ─────────────────────────────────────────────
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  关卡单词音频生成器 (V3 · Natasha)');
  console.log('  豆包语音合成模型 2.0 · en_female_natasha_uranus_bigtts');
  console.log('═══════════════════════════════════════════════');
  console.log('');

  // ── 提取单词 ─────────────────────────────────────────
  const wordEntries = extractWordEntries();
  const totalLevels = CURRICULUM_UNITS.reduce((s, u) => s + u.words.length, 0);
  console.log(`  课程单元: ${CURRICULUM_UNITS.length}`);
  console.log(`  关卡总数: ${totalLevels}`);
  console.log(`  唯一单词: ${wordEntries.length}`);
  console.log(`  输出目录: ${WORDS_DIR}`);
  console.log(`  声线: ${SPEAKER}`);
  console.log(`  资源 ID: ${RESOURCE_ID}`);
  console.log('');

  // ── 凭据检查 ─────────────────────────────────────────
  const hasCreds = !!(APP_ID && ACCESS_KEY &&
    APP_ID !== 'your_app_id_here' && ACCESS_KEY !== 'your_access_token_here');

  if (!hasCreds) {
    console.warn('  ⚠️  凭据未配置 — 将生成占位 manifest');
    console.warn('  配置：cd backend && cp .env.example .env 后编辑');
    console.warn('');
  }

  // ── 确保输出目录 ─────────────────────────────────────
  fs.mkdirSync(WORDS_DIR, { recursive: true });

  // 清理临时文件
  try {
    const existing = fs.readdirSync(WORDS_DIR);
    existing.forEach((name) => {
      if (name.startsWith('word-audio-manifest.json.tmp.') || name.startsWith('word-audio-manifest.js.tmp.')) {
        try { fs.unlinkSync(path.join(WORDS_DIR, name)); } catch (_) {}
      }
    });
  } catch (_) {}

  // ── 从已有 manifest 加载幂等状态 ──────────────────────
  let existingManifest = {};
  try {
    existingManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch (_) {}

  const existingEntries = existingManifest.entries || [];
  let globalBlocked = false;

  // ── 探针策略 ─────────────────────────────────────────
  if (hasCreds) {
    console.log('  🔍 探针测试: 合成 "hello" 验证 Natasha V3 可用');
    const probePath = path.join(WORDS_DIR, '_probe_test.mp3');
    const probeResult = await synthesizeWord('hello', probePath);

    if (probeResult.status === 'generated') {
      console.log(`  ✅ 探针成功 (${probeResult.size_bytes} bytes) — 继续全量生成`);
      try { fs.unlinkSync(probePath); } catch (_) {}
    } else if (probeResult.status === 'not_attempted_global_blocker') {
      console.log('  ❌ 探针失败：全局鉴权错误 — 停止');
      globalBlocked = true;
      try { fs.unlinkSync(probePath); } catch (_) {}
    } else {
      console.log(`  ❌ 探针失败: ${probeResult.error_sanitized} — 停止`);
      globalBlocked = true;
      try { fs.unlinkSync(probePath); } catch (_) {}
    }
  }

  // ── 批量生成 ─────────────────────────────────────────
  const entries = [];
  const summary = {
    total: wordEntries.length,
    generated: 0,
    skipped: 0,
    available: 0,
    failed: 0,
    not_attempted: 0,
    levels: totalLevels,
    speaker: SPEAKER,
    resource_id: RESOURCE_ID,
    audio_format: 'mp3',
    sample_rate: 24000,
  };

  for (const we of wordEntries) {
    const fileBase = safeFileName(we.word);
    const fileName = `${fileBase}.mp3`;
    const filePath = path.join(WORDS_DIR, fileName);
    const relativeUrl = `assets/audio/words/${fileName}`;

    const levelIds = we.level_ids.sort((a, b) => a - b);
    const levelIdsStr = levelIds.join(',');
    const levelCount = levelIds.length;

    console.log(`[${levelIdsStr}] ${we.word}${' '.repeat(Math.max(0, 14 - we.word.length))}→ ${relativeUrl}`);

    // 幂等检查：缓存键一致性 + 文件有效 + hash 匹配
    if (!shouldRegenerate(we.word, existingEntries)) {
      const stat = fs.statSync(filePath);
      const buf = fs.readFileSync(filePath);
      const ck = cacheKey(we.word);
      console.log(`  ✅ 有效 (${stat.size} bytes) — 跳过`);
      entries.push({
        word: we.word,
        level_ids: levelIds,
        level_count: levelCount,
        zh: we.zh,
        unit: we.unit,
        unit_index: we.unit_index,
        url: relativeUrl,
        status: 'generated',
        size_bytes: stat.size,
        sha256: sha256(buf),
        cache_key: ck,
      });
      summary.skipped += 1;
      continue;
    }

    // 全局阻断
    if (globalBlocked) {
      console.log(`  ⏸ 全局阻断 — 未尝试`);
      entries.push({
        word: we.word,
        level_ids: levelIds,
        level_count: levelCount,
        zh: we.zh,
        unit: we.unit,
        unit_index: we.unit_index,
        url: relativeUrl,
        status: 'not_attempted',
        size_bytes: 0,
        sha256: '',
        cache_key: cacheKey(we.word),
      });
      summary.not_attempted += 1;
      continue;
    }

    if (!hasCreds) {
      console.log(`  ⏸ 占位（凭据未配置）`);
      entries.push({
        word: we.word,
        level_ids: levelIds,
        level_count: levelCount,
        zh: we.zh,
        unit: we.unit,
        unit_index: we.unit_index,
        url: relativeUrl,
        status: 'pending',
        size_bytes: 0,
        sha256: '',
        error: 'Credentials not configured',
        cache_key: cacheKey(we.word),
      });
      summary.not_attempted += 1;
      continue;
    }

    // 调用 API
    const result = await synthesizeWord(we.word, filePath);

    if (result.status === 'generated') {
      const stat = fs.statSync(filePath);
      console.log(`  ✅ 生成成功 (${stat.size} bytes)`);
      summary.generated += 1;
      entries.push({
        word: we.word,
        level_ids: levelIds,
        level_count: levelCount,
        zh: we.zh,
        unit: we.unit,
        unit_index: we.unit_index,
        url: relativeUrl,
        status: 'generated',
        size_bytes: stat.size,
        sha256: result.sha256,
        cache_key: cacheKey(we.word),
      });
    } else if (result.status === 'not_attempted_global_blocker') {
      console.log(`  ⏸ 全局阻断`);
      summary.not_attempted += 1;
      entries.push({
        word: we.word,
        level_ids: levelIds,
        level_count: levelCount,
        zh: we.zh,
        unit: we.unit,
        unit_index: we.unit_index,
        url: relativeUrl,
        status: 'not_attempted',
        size_bytes: 0,
        sha256: '',
        error_sanitized: result.error_sanitized,
        cache_key: cacheKey(we.word),
      });
    } else {
      console.log(`  ❌ 失败: ${result.error_sanitized}`);
      summary.failed += 1;
      try { fs.unlinkSync(filePath); } catch (_) {}
      entries.push({
        word: we.word,
        level_ids: levelIds,
        level_count: levelCount,
        zh: we.zh,
        unit: we.unit,
        unit_index: we.unit_index,
        url: relativeUrl,
        status: 'failed',
        size_bytes: 0,
        sha256: '',
        error_sanitized: result.error_sanitized,
        cache_key: cacheKey(we.word),
      });
    }
  }

  summary.available = summary.generated + summary.skipped;

  // ── 写 manifest（原子写入 JSON + JS 双份） ────────────
  const manifest = {
    version: '2.0',
    model: '豆包语音合成模型2.0',
    resource_id: RESOURCE_ID,
    speaker: SPEAKER,
    generated_at: new Date().toISOString(),
    audio_format: 'mp3',
    sample_rate: 24000,
    // 前台兼容字段
    voice_type: SPEAKER,
    entries,
    summary,
  };

  // 生成 JS manifest 内容（无凭据，仅供 file:// 协议注入 window 全局）
  const jsonTmpPath = MANIFEST_PATH + '.tmp.' + crypto.randomUUID();
  const jsTmpPath = MANIFEST_JS_PATH + '.tmp.' + crypto.randomUUID();
  try {
    fs.writeFileSync(jsonTmpPath, JSON.stringify(manifest, null, 2) + '\n');
    fs.writeFileSync(jsTmpPath, generateJsManifestContent(manifest));
    fs.renameSync(jsonTmpPath, MANIFEST_PATH);
    fs.renameSync(jsTmpPath, MANIFEST_JS_PATH);
  } catch (err) {
    try { fs.unlinkSync(jsonTmpPath); } catch (_) {}
    try { fs.unlinkSync(jsTmpPath); } catch (_) {}
    throw err;
  }

  // ── 报告 ──────────────────────────────────────────────
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  生成报告');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log(`  JSON → ${MANIFEST_PATH}`);
  console.log(`  JS   → ${MANIFEST_JS_PATH}`);
  console.log(`  声线: ${SPEAKER}`);
  console.log('');
  console.log(`  关卡总数   ${totalLevels}`);
  console.log(`  唯一单词   ${wordEntries.length}`);
  console.log(`  新生成     ${summary.generated}`);
  console.log(`  跳过(存在) ${summary.skipped}`);
  console.log(`  有效       ${summary.available}`);
  console.log(`  失败       ${summary.failed}`);
  console.log(`  未尝试     ${summary.not_attempted}`);

  if (!hasCreds) {
    console.log('');
    console.log('  要生成真实 MP3，请配置 backend/.env 后重试');
  }
  if (globalBlocked) {
    console.log('');
    console.log('  ⚠️  全局阻断 — 请检查凭据和 resource_id 授权');
  }
}

// ── 导出（用于测试） ─────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extractWordEntries,
    safeFileName,
    cacheKey,
    shouldRegenerate,
    generateJsManifestContent,
    CURRICULUM_UNITS,
    SPEAKER,
    RESOURCE_ID,
  };
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[FATAL]', err);
    process.exit(1);
  });
}
