// 宝宝闯关 · 豆包 TTS 批量预录脚本
// 使用方式：cd backend && node src/generate-tts.js
// 幂等：目标 MP3 已存在且 >0 bytes 时跳过；失败支持重跑
// 安全：所有凭据仅从 .env 读取，绝不硬编码或输出

const dotenv = require('dotenv');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const https = require('node:https');

dotenv.config();

// ─── 词表：curriculumUnits 前 10 个唯一英文单词 ──────────
const TARGET_WORDS = [
  { word: 'hello',   unitIdx: 0, wordIdx: 0, levelId: 1 },
  { word: 'red',     unitIdx: 0, wordIdx: 1, levelId: 2 },
  { word: 'flower',  unitIdx: 0, wordIdx: 2, levelId: 3 },
  { word: 'bye',     unitIdx: 0, wordIdx: 3, levelId: 4 },
  { word: 'yes',     unitIdx: 0, wordIdx: 4, levelId: 5 },
  { word: 'no',      unitIdx: 0, wordIdx: 5, levelId: 6 },
  { word: 'please',  unitIdx: 0, wordIdx: 6, levelId: 7 },
  { word: 'thanks',  unitIdx: 0, wordIdx: 7, levelId: 8 },
  { word: 'friend',  unitIdx: 0, wordIdx: 8, levelId: 9 },
  { word: 'happy',   unitIdx: 0, wordIdx: 9, levelId: 10 },
];

// ─── 路径配置 ──────────────────────────────────────────
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const WORDS_DIR = path.join(PROJECT_ROOT, 'assets', 'audio', 'words');
const MANIFEST_PATH = path.join(WORDS_DIR, 'word-audio-manifest.json');

// ─── 环境变量读取（严禁硬编码） ─────────────────────────
const APP_ID = process.env.DOUBAO_APP_ID;
const TOKEN = process.env.DOUBAO_TOKEN;
const CLUSTER = process.env.DOUBAO_CLUSTER || 'volcano_tts';
const VOICE_TYPE = process.env.DOUBAO_VOICE_TYPE;
const SAMPLE_RATE = Number(process.env.DOUBAO_SAMPLE_RATE) || 24000;
const AUDIO_FORMAT = process.env.DOUBAO_AUDIO_FORMAT || 'mp3';

const API_URL = 'https://openspeech.bytedance.com/api/v1/tts';
const MAX_RETRIES = 5;
const RETRY_DELAYS_MS = [2000, 4000, 8000, 16000, 32000];
const REQUEST_TIMEOUT_MS = 30000;

// ─── 工具函数 ─────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/** 探测文件是否为合法 MP3（检查同步字 0xFF 0xFB/0xF3/0xF2/0xFA） */
function isMp3HeaderValid(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    if (buf.length < 4) return false;
    return buf[0] === 0xFF && (buf[1] & 0xE0) === 0xE0;
  } catch {
    return false;
  }
}

function fileExistsAndValid(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.isFile() && stat.size > 0 && isMp3HeaderValid(filePath);
  } catch {
    return false;
  }
}

// ─── API 调用 ─────────────────────────────────────────

function makeTtsRequest(wordText) {
  const reqid = crypto.randomUUID();
  // V1 官方文档：app.token 可任意非空字符串，真实鉴权仅走 Authorization Header
  const body = JSON.stringify({
    app: {
      appid: APP_ID,
      token: 'not_used',
      cluster: CLUSTER,
    },
    user: {
      uid: 'baby_quiz_batch_gen',
    },
    audio: {
      voice_type: VOICE_TYPE,
      encoding: AUDIO_FORMAT,
      rate: SAMPLE_RATE,
      speed_ratio: 1.0,
      volume_ratio: 1.0,
      pitch_ratio: 1.0,
    },
    request: {
      reqid,
      text: wordText,
      text_type: 'plain',
      operation: 'query',
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
        Authorization: `Bearer;${TOKEN}`,
      },
      timeout: REQUEST_TIMEOUT_MS,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (err) {
          reject(new Error(`JSON parse failed: ${err.message}, raw: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${REQUEST_TIMEOUT_MS}ms`));
    });

    req.write(body);
    req.end();
  });
}

async function synthesizeWord(wordText, outputPath) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await makeTtsRequest(wordText);

      if (result.code === 3000 && result.data) {
        // 成功 — 解码 base64 写入文件
        const audioBuf = Buffer.from(result.data, 'base64');
        fs.writeFileSync(outputPath, audioBuf);

        return {
          status: 'generated',
          size_bytes: audioBuf.length,
          duration_ms: Number(result.addition?.duration) || 0,
          sha256: sha256(audioBuf),
          error: null,
        };
      }

      // 可重试错误码
      const retryable = [3003, 3005, 3030, 3031, 3032, 3040].includes(result.code);
      if (!retryable || attempt >= MAX_RETRIES) {
        return {
          status: 'failed',
          size_bytes: 0,
          duration_ms: 0,
          sha256: '',
          error: `API error code=${result.code} message=${result.message}`,
        };
      }

      console.warn(`  [RETRY] attempt ${attempt + 1}/${MAX_RETRIES} — code=${result.code} message=${result.message}`);
      await sleep(RETRY_DELAYS_MS[attempt] || 32000);
    } catch (err) {
      if (attempt >= MAX_RETRIES) {
        return {
          status: 'failed',
          size_bytes: 0,
          duration_ms: 0,
          sha256: '',
          error: `Network error: ${err.message}`,
        };
      }
      console.warn(`  [RETRY] attempt ${attempt + 1}/${MAX_RETRIES} — ${err.message}`);
      await sleep(RETRY_DELAYS_MS[attempt] || 32000);
    }
  }

  // 兜底：不应到达此处
  return {
    status: 'failed',
    size_bytes: 0,
    duration_ms: 0,
    sha256: '',
    error: 'Exhausted all retries',
  };
}

// ─── 凭据校验 ─────────────────────────────────────────

function checkCredentials() {
  const missing = [];
  if (!APP_ID || APP_ID === 'your_app_id_here') missing.push('DOUBAO_APP_ID');
  if (!TOKEN || TOKEN === 'your_access_token_here') missing.push('DOUBAO_TOKEN');
  if (!VOICE_TYPE || VOICE_TYPE === 'your_voice_type_here') missing.push('DOUBAO_VOICE_TYPE');

  if (missing.length > 0) {
    console.error('');
    console.error('══════════════════════════════════════════════');
    console.error('  豆包 TTS 凭据未配置 — 将生成占位 manifest');
    console.error('══════════════════════════════════════════════');
    console.error('');
    console.error('  缺少以下环境变量：');
    missing.forEach((name) => console.error(`    - ${name}`));
    console.error('');
    console.error('  配置步骤：');
    console.error('    1. cd backend');
    console.error('    2. cp .env.example .env');
    console.error('    3. 编辑 .env 填入从火山引擎控制台获取的真实值');
    console.error('       https://console.volcengine.com/speech/app');
    console.error('    4. 重新运行: node src/generate-tts.js');
    console.error('');
    return false;
  }
  return true;
}

// ─── 主流程 ───────────────────────────────────────────

async function main() {
  console.log('[TTS] 宝宝闯关 · 豆包 TTS 批量预录');
  console.log(`[TTS] 目标词数: ${TARGET_WORDS.length}`);
  console.log(`[TTS] 音频格式: ${AUDIO_FORMAT} @ ${SAMPLE_RATE}Hz`);
  console.log(`[TTS] 输出目录: ${WORDS_DIR}`);
  console.log('');

  const hasCreds = checkCredentials();

  // 确保输出目录存在
  fs.mkdirSync(WORDS_DIR, { recursive: true });

  // 清理可能残留的临时文件（上次进程中断遗留的 .tmp.*-* 文件）
  try {
    const existing = fs.readdirSync(WORDS_DIR);
    existing.forEach((name) => {
      if (name.startsWith('word-audio-manifest.json.tmp.')) {
        const tmpFull = path.join(WORDS_DIR, name);
        try { fs.unlinkSync(tmpFull); } catch (_) { /* best-effort */ }
      }
    });
  } catch (_) { /* directory listing failure is non-fatal */ }

  const entries = [];
  const summary = { total: TARGET_WORDS.length, generated: 0, skipped: 0, available: 0, failed: 0, pending: 0 };

  for (const item of TARGET_WORDS) {
    const filePath = path.join(WORDS_DIR, `${item.word}.${AUDIO_FORMAT}`);
    const relativeUrl = `assets/audio/words/${item.word}.${AUDIO_FORMAT}`;

    console.log(`[TTS] ${item.word}${' '.repeat(Math.max(0, 12 - item.word.length))}→ ${relativeUrl}`);

    // 幂等检查：已存在且有效则跳过（generated 仅计数本次新生成，skipped 计数已存在）
    if (fileExistsAndValid(filePath)) {
      const stat = fs.statSync(filePath);
      const buf = fs.readFileSync(filePath);
      console.log(`       ✅ 已存在 (${stat.size} bytes)，跳过`);
      entries.push({
        word: item.word,
        unit_index: item.unitIdx,
        word_index: item.wordIdx,
        level_id: item.levelId,
        url: relativeUrl,
        status: 'generated',
        size_bytes: stat.size,
        duration_ms: 0,
        sha256: sha256(buf),
        error: null,
      });
      summary.skipped += 1;
      continue;
    }

    if (!hasCreds) {
      // 无凭据：写入占位条目
      console.log(`       ⏸ 占位（凭据未配置）`);
      entries.push({
        word: item.word,
        unit_index: item.unitIdx,
        word_index: item.wordIdx,
        level_id: item.levelId,
        url: relativeUrl,
        status: 'pending',
        size_bytes: 0,
        duration_ms: 0,
        sha256: '',
        error: 'Credentials not configured — set DOUBAO_APP_ID, DOUBAO_TOKEN, DOUBAO_VOICE_TYPE in backend/.env',
      });
      summary.pending += 1;
      continue;
    }

    // 有凭据：调用 API
    const result = await synthesizeWord(item.word, filePath);

    if (result.status === 'generated') {
      console.log(`       ✅ 生成成功 (${result.size_bytes} bytes, ${result.duration_ms}ms)`);
      summary.generated += 1;
    } else {
      console.log(`       ❌ 失败: ${result.error}`);
      summary.failed += 1;
    }

    entries.push({
      word: item.word,
      unit_index: item.unitIdx,
      word_index: item.wordIdx,
      level_id: item.levelId,
      url: relativeUrl,
      status: result.status,
      size_bytes: result.size_bytes,
      duration_ms: result.duration_ms,
      sha256: result.sha256,
      error: result.error,
    });
  }

  // 计算最终有效总数（本次新生成 + 已存在跳过的）
  summary.available = summary.generated + summary.skipped;

  // 写 manifest：先写同目录临时文件，再原子 rename，防止进程中断遗留半截 JSON
  const manifest = {
    version: '1.0',
    generated_at: new Date().toISOString(),
    voice_type: VOICE_TYPE || 'not-configured',
    audio_format: AUDIO_FORMAT,
    sample_rate: SAMPLE_RATE,
    entries,
    summary,
  };

  const tmpPath = MANIFEST_PATH + '.tmp.' + crypto.randomUUID();
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(manifest, null, 2) + '\n');
    fs.renameSync(tmpPath, MANIFEST_PATH);
  } catch (err) {
    // 清理临时文件，避免遗留垃圾
    try { fs.unlinkSync(tmpPath); } catch (_) { /* best-effort */ }
    throw err;
  }
  console.log('');
  console.log(`[TTS] Manifest → ${MANIFEST_PATH}`);
  console.log(`[TTS] 统计: ${summary.generated} 新生成, ${summary.skipped} 跳过, ${summary.available} 有效, ${summary.failed} 失败, ${summary.pending} 占位`);

  if (!hasCreds) {
    console.log('');
    console.log('──────────────────────────────────────────────');
    console.log('  要生成真实 MP3，请完成以下步骤：');
    console.log('');
    console.log('  必需环境变量:');
    console.log('    DOUBAO_APP_ID      应用 ID');
    console.log('    DOUBAO_TOKEN       Access Token');
    console.log('    DOUBAO_VOICE_TYPE  音色 ID (如 BV700_streaming)');
    console.log('');
    console.log('  可选环境变量 (已有默认值):');
    console.log('    DOUBAO_CLUSTER=volcano_tts');
    console.log('    DOUBAO_SAMPLE_RATE=24000');
    console.log('    DOUBAO_AUDIO_FORMAT=mp3');
    console.log('');
    console.log('  执行: cd backend && node src/generate-tts.js');
    console.log('──────────────────────────────────────────────');
  }
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
