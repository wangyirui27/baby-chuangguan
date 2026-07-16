// 宝宝闯关 · 豆包美式英语音色试听库生成脚本
// 使用方式：cd backend && npm run generate-voice-samples
// 幂等：已存在且有效的 MP3 跳过
// 安全：所有凭据仅从 .env 读取，绝不在日志中输出完整凭据
//
// 分类：
//   A. 小模型 V1 — 官方主表，cluster=volcano_tts，支持 pitch_ratio
//   B. 大模型 1.0 — 官方主表，cluster=volcano_mega，部分不支持的参数不发送
//   C. 候选 — 主音色表未确认，标注 candidate，实际尝试

const dotenv = require('dotenv');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const https = require('node:https');

dotenv.config();

// ═══════════════════════════════════════════════════════════
//  音色定义
// ═══════════════════════════════════════════════════════════

const SAMPLE_TEXT =
  'Hello friends! Welcome to our English class. Look at the red apple and the blue sky. Can you count with me? One, two, three! What\'s your favorite animal?';

/** @type {Array<{voiceType:string, name:string, label:string, category:string, gender:string, style:string, official:string, cluster:string, noPitchRatio:boolean}>} */
const VOICES = [
  // ── A. 小模型 V1 原生（官方主表）──────────────────────
  { voiceType: 'BV511_streaming', name: '慵懒女声-Ava', label: 'Ava', category: '小模型 V1', gender: '女声', style: '慵懒', official: 'confirmed', cluster: 'volcano_tts', noPitchRatio: false },
  { voiceType: 'BV505_streaming', name: '议论女声-Alicia', label: 'Alicia', category: '小模型 V1', gender: '女声', style: '议论', official: 'confirmed', cluster: 'volcano_tts', noPitchRatio: false },
  { voiceType: 'BV138_streaming', name: '情感女声-Lawrence', label: 'Lawrence', category: '小模型 V1', gender: '女声', style: '情感', official: 'confirmed', cluster: 'volcano_tts', noPitchRatio: false },
  { voiceType: 'BV027_streaming', name: '美式女声-Amelia', label: 'Amelia', category: '小模型 V1', gender: '女声', style: '美式', official: 'confirmed', cluster: 'volcano_tts', noPitchRatio: false },
  { voiceType: 'BV502_streaming', name: '讲述女声-Amanda', label: 'Amanda', category: '小模型 V1', gender: '女声', style: '讲述', official: 'confirmed', cluster: 'volcano_tts', noPitchRatio: false },
  { voiceType: 'BV503_streaming', name: '活力女声-Ariana', label: 'Ariana', category: '小模型 V1', gender: '女声', style: '活力', official: 'confirmed', cluster: 'volcano_tts', noPitchRatio: false },
  { voiceType: 'BV504_streaming', name: '活力男声-Jackson', label: 'Jackson', category: '小模型 V1', gender: '男声', style: '活力', official: 'confirmed', cluster: 'volcano_tts', noPitchRatio: false },
  { voiceType: 'BV506_streaming', name: '天真萌娃-Lily', label: 'Lily', category: '小模型 V1', gender: '女童', style: '天真', official: 'confirmed', cluster: 'volcano_tts', noPitchRatio: false },
  { voiceType: 'BV421_streaming', name: '天才少女（多语种）', label: 'Genius Girl', category: '小模型 V1', gender: '女声', style: '多语种', official: 'confirmed', cluster: 'volcano_tts', noPitchRatio: false },
  { voiceType: 'BV702_streaming', name: 'Stefan（多语种）', label: 'Stefan', category: '小模型 V1', gender: '男声', style: '多语种', official: 'confirmed', cluster: 'volcano_tts', noPitchRatio: false },

  // ── B. 大模型 1.0 官方主表 ────────────────────────────
  { voiceType: 'en_female_candice_emo_v2_mars_bigtts', name: 'Candice', label: 'Candice', category: '大模型 1.0', gender: '女声', style: '情感', official: 'confirmed', cluster: 'volcano_mega', noPitchRatio: true },
  { voiceType: 'en_female_skye_emo_v2_mars_bigtts', name: 'Serena', label: 'Serena', category: '大模型 1.0', gender: '女声', style: '情感', official: 'confirmed', cluster: 'volcano_mega', noPitchRatio: true },
  { voiceType: 'en_female_nadia_tips_emo_v2_mars_bigtts', name: 'Nadia', label: 'Nadia', category: '大模型 1.0', gender: '女声', style: '情感', official: 'confirmed', cluster: 'volcano_mega', noPitchRatio: true },
  { voiceType: 'en_male_glen_emo_v2_mars_bigtts', name: 'Glen', label: 'Glen', category: '大模型 1.0', gender: '男声', style: '情感', official: 'confirmed', cluster: 'volcano_mega', noPitchRatio: true },
  { voiceType: 'en_male_sylus_emo_v2_mars_bigtts', name: 'Sylus', label: 'Sylus', category: '大模型 1.0', gender: '男声', style: '情感', official: 'confirmed', cluster: 'volcano_mega', noPitchRatio: true },
  { voiceType: 'en_male_corey_emo_v2_mars_bigtts', name: 'Corey', label: 'Corey', category: '大模型 1.0', gender: '男声', style: '情感', official: 'confirmed', cluster: 'volcano_mega', noPitchRatio: true },
  { voiceType: 'zh_female_cancan_mars_bigtts', name: '灿灿/Shiny', label: 'Shiny', category: '大模型 1.0', gender: '女声', style: '标准', official: 'confirmed', cluster: 'volcano_mega', noPitchRatio: true },
  { voiceType: 'zh_female_shuangkuaisisi_moon_bigtts', name: '爽快思思/Skye', label: 'Skye', category: '大模型 1.0', gender: '女声', style: '爽快', official: 'confirmed', cluster: 'volcano_mega', noPitchRatio: true },
  { voiceType: 'zh_male_wennuanahu_moon_bigtts', name: '温暖阿虎/Alvin', label: 'Alvin', category: '大模型 1.0', gender: '男声', style: '温暖', official: 'confirmed', cluster: 'volcano_mega', noPitchRatio: true },
  { voiceType: 'zh_male_shaonianzixin_moon_bigtts', name: '少年梓辛/Brayan', label: 'Brayan', category: '大模型 1.0', gender: '男声', style: '少年', official: 'confirmed', cluster: 'volcano_mega', noPitchRatio: true },

  // ── C. 候选（主音色表未确认）─────────────────────────
  { voiceType: 'en_female_lauren_moon_bigtts', name: 'Lauren', label: 'Lauren', category: '候选', gender: '女声', style: '标准', official: 'candidate', cluster: 'volcano_mega', noPitchRatio: true },
  { voiceType: 'en_female_amanda_mars_bigtts', name: 'Amanda（大模型候选）', label: 'Amanda', category: '候选', gender: '女声', style: '标准', official: 'candidate', cluster: 'volcano_mega', noPitchRatio: true },
  { voiceType: 'en_male_jackson_mars_bigtts', name: 'Jackson（大模型候选）', label: 'Jackson', category: '候选', gender: '男声', style: '标准', official: 'candidate', cluster: 'volcano_mega', noPitchRatio: true },
];

// ═══════════════════════════════════════════════════════════
//  配置常量
// ═══════════════════════════════════════════════════════════

const APP_ID = process.env.DOUBAO_APP_ID;
const TOKEN = process.env.DOUBAO_TOKEN;
const SAMPLE_RATE = Number(process.env.DOUBAO_SAMPLE_RATE) || 24000;
const AUDIO_FORMAT = process.env.DOUBAO_AUDIO_FORMAT || 'mp3';

const API_URL = 'https://openspeech.bytedance.com/api/v1/tts';
const MAX_RETRIES = 5;
const RETRY_DELAYS_MS = [2000, 4000, 8000, 16000, 32000];
const REQUEST_TIMEOUT_MS = 60000;

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'assets', 'audio', 'voice-samples');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'voice-samples-manifest.json');

// ── 检查凭据（不泄露具体值） ────────────────────────────

function checkCredentials() {
  const missing = [];
  if (!APP_ID || APP_ID === 'your_app_id_here') missing.push('DOUBAO_APP_ID');
  if (!TOKEN || TOKEN === 'your_access_token_here') missing.push('DOUBAO_TOKEN');

  if (missing.length > 0) {
    console.error('');
    console.error('═══════════════════════════════════════════════');
    console.error('  凭据未配置 — 将生成占位 manifest');
    console.error('═══════════════════════════════════════════════');
    console.error('');
    console.error('  缺少：');
    missing.forEach((n) => console.error(`    - ${n}`));
    console.error('');
    console.error('  配置：');
    console.error('    1. cd backend && cp .env.example .env');
    console.error('    2. 编辑 .env 填入真实值');
    console.error('    3. 重新运行');
    console.error('');
    return false;
  }
  return true;
}

// ── 工具函数 ────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

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

// ═══════════════════════════════════════════════════════════
//  API 调用（符合官方 V1 契约）
// ═══════════════════════════════════════════════════════════

function makeTtsRequest(voiceInfo, text) {
  const reqid = crypto.randomUUID();

  const audioParams = {
    voice_type: voiceInfo.voiceType,
    encoding: AUDIO_FORMAT,
    rate: SAMPLE_RATE,
    speed_ratio: 1.0,
    volume_ratio: 1.0,
  };

  // 小模型支持 pitch_ratio；大模型 1.0 不支持，不发送该字段
  if (!voiceInfo.noPitchRatio) {
    audioParams.pitch_ratio = 1.0;
  }

  // V1 官方文档：app.token 可任意非空字符串，真实鉴权仅走 Authorization Header
  const body = JSON.stringify({
    app: {
      appid: APP_ID,
      token: 'not_used',
      cluster: voiceInfo.cluster,
    },
    user: {
      uid: 'voice_samples_gen',
    },
    audio: audioParams,
    request: {
      reqid,
      text,
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
        'Authorization': `Bearer;${TOKEN}`,
      },
      timeout: REQUEST_TIMEOUT_MS,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`JSON parse failed: ${err.message}, raw prefix: ${data.slice(0, 100)}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(body);
    req.end();
  });
}

// ── 合成单个音色（带重试） ─────────────────────────────

async function synthesizeVoice(voiceInfo, text, outputPath) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await makeTtsRequest(voiceInfo, text);

      if (result.code === 3000 && result.data) {
        const audioBuf = Buffer.from(result.data, 'base64');
        fs.writeFileSync(outputPath, audioBuf);
        return {
          status: 'generated',
          size_bytes: audioBuf.length,
          sha256: sha256(audioBuf),
          error: null,
          api_code: 3000,
        };
      }

      // 可重试的错误码
      const retryableCodes = [3003, 3005, 3030, 3031, 3032, 3040];
      const isRetryable = retryableCodes.includes(result.code);

      if (!isRetryable || attempt >= MAX_RETRIES) {
        // 非重试错误 / 重试耗尽
        const msg = `code=${result.code} message=${result.message || 'no message'}`;
        return {
          status: 'failed',
          size_bytes: 0,
          sha256: '',
          error: `API ${msg}`,
          api_code: result.code,
        };
      }

      console.warn(`  [RETRY ${attempt + 1}/${MAX_RETRIES}] ${result.message || `code=${result.code}`}`);
      await sleep(RETRY_DELAYS_MS[attempt] || 32000);
    } catch (err) {
      if (attempt >= MAX_RETRIES) {
        return {
          status: 'failed',
          size_bytes: 0,
          sha256: '',
          error: `Network error: ${err.message}`,
          api_code: -1,
        };
      }
      console.warn(`  [RETRY ${attempt + 1}/${MAX_RETRIES}] network: ${err.message}`);
      await sleep(RETRY_DELAYS_MS[attempt] || 32000);
    }
  }

  return { status: 'failed', size_bytes: 0, sha256: '', error: 'Exhausted all retries', api_code: -1 };
}

// ── 脱敏错误信息（用于 manifest 和试听页） ──────────────

function sanitizeError(error) {
  if (!error) return null;
  // 不泄露 token、appid 等凭据
  let safe = error
    .replace(/Bearer;[A-Za-z0-9_\-]+/g, 'Bearer;***')
    .replace(/token["' ]*[:=]["' ]*[A-Za-z0-9_\-]+/gi, 'token=***')
    .replace(/appid["' ]*[:=]["' ]*\d+/gi, 'appid=***');
  return safe;
}

// ═══════════════════════════════════════════════════════════
//  主流程
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  豆包美式英语音色试听库 · 批量生成');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log(`  目标音色: ${VOICES.length} 个`);
  console.log(`  输出目录: ${OUTPUT_DIR}`);
  console.log(`  试听文本: "${SAMPLE_TEXT.slice(0, 50)}..."`);
  console.log('');

  const hasCreds = checkCredentials();

  // 确保目录存在
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // 清理残留临时文件
  try {
    const existing = fs.readdirSync(OUTPUT_DIR);
    existing.forEach((name) => {
      if (name.startsWith('voice-samples-manifest.json.tmp.')) {
        try { fs.unlinkSync(path.join(OUTPUT_DIR, name)); } catch (_) {}
      }
    });
  } catch (_) {}

  const entries = [];
  const summary = {
    total: VOICES.length,
    generated: 0,
    skipped: 0,
    available: 0,
    failed: 0,
    pending: 0,
    // 分类统计
    small_model: { total: 0, generated: 0, skipped: 0, available: 0, failed: 0 },
    big_model: { total: 0, generated: 0, skipped: 0, available: 0, failed: 0 },
    candidate: { total: 0, generated: 0, skipped: 0, available: 0, failed: 0 },
  };

  for (const voice of VOICES) {
    const safeFileName = voice.voiceType.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const filePath = path.join(OUTPUT_DIR, `${safeFileName}.${AUDIO_FORMAT}`);
    const relativeUrl = `assets/audio/voice-samples/${safeFileName}.${AUDIO_FORMAT}`;

    // 分类汇总累加
    const catKey = voice.category === '小模型 V1' ? 'small_model'
      : voice.category === '大模型 1.0' ? 'big_model'
      : 'candidate';
    summary[catKey].total += 1;

    const nameStr = `${voice.name} (${voice.label})`;
    console.log(`[${voice.category}] ${nameStr}`);
    console.log(`  voice_type: ${voice.voiceType}`);
    console.log(`  → ${relativeUrl}`);

    // 幂等检查
    if (fileExistsAndValid(filePath)) {
      const stat = fs.statSync(filePath);
      const buf = fs.readFileSync(filePath);
      console.log(`  ✅ 已存在 (${stat.size} bytes)，跳过`);
      entries.push({
        voice_type: voice.voiceType,
        name: voice.name,
        label: voice.label,
        category: voice.category,
        gender: voice.gender,
        style: voice.style,
        official: voice.official,
        status: 'generated',
        url: relativeUrl,
        size_bytes: stat.size,
        sha256: sha256(buf),
        error: null,
        error_sanitized: null,
        api_code: 3000,
        sample_text: SAMPLE_TEXT,
      });
      summary.skipped += 1;
      summary[catKey].skipped += 1;
      continue;
    }

    if (!hasCreds) {
      console.log(`  ⏸ 占位（凭据未配置）`);
      entries.push({
        voice_type: voice.voiceType,
        name: voice.name,
        label: voice.label,
        category: voice.category,
        gender: voice.gender,
        style: voice.style,
        official: voice.official,
        status: 'pending',
        url: relativeUrl,
        size_bytes: 0,
        sha256: '',
        error: 'Credentials not configured',
        error_sanitized: 'Credentials not configured',
        api_code: null,
        sample_text: SAMPLE_TEXT,
      });
      summary.pending += 1;
      continue;
    }

    // 调用 API
    const result = await synthesizeVoice(voice, SAMPLE_TEXT, filePath);

    if (result.status === 'generated') {
      console.log(`  ✅ 生成成功 (${result.size_bytes} bytes)`);
      summary.generated += 1;
      summary[catKey].generated += 1;
    } else {
      console.log(`  ❌ 失败: ${sanitizeError(result.error)}`);
      summary.failed += 1;
      summary[catKey].failed += 1;
      // 删除残损文件
      try { fs.unlinkSync(filePath); } catch (_) {}
    }

    entries.push({
      voice_type: voice.voiceType,
      name: voice.name,
      label: voice.label,
      category: voice.category,
      gender: voice.gender,
      style: voice.style,
      official: voice.official,
      status: result.status,
      url: relativeUrl,
      size_bytes: result.size_bytes,
      sha256: result.sha256,
      error: result.error,
      error_sanitized: sanitizeError(result.error),
      api_code: result.api_code,
      sample_text: SAMPLE_TEXT,
    });
  }

  summary.available = summary.generated + summary.skipped;
  summary.small_model.available = summary.small_model.generated + summary.small_model.skipped;
  summary.big_model.available = summary.big_model.generated + summary.big_model.skipped;
  summary.candidate.available = summary.candidate.generated + summary.candidate.skipped;

  // ── 写 manifest（原子写入） ────────────────────────────
  const manifest = {
    version: '1.0',
    generated_at: new Date().toISOString(),
    sample_text: SAMPLE_TEXT,
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
    try { fs.unlinkSync(tmpPath); } catch (_) {}
    throw err;
  }

  // ── 报告 ──────────────────────────────────────────────
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  生成报告');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log(`  Manifest → ${MANIFEST_PATH}`);
  console.log(`  试听页    → voice-samples.html（项目根目录）`);
  console.log('');
  console.log(`  总计      ${summary.total} 个音色`);
  console.log(`  新生成    ${summary.generated}`);
  console.log(`  跳过(已存在) ${summary.skipped}`);
  console.log(`  有效      ${summary.available}`);
  console.log(`  失败      ${summary.failed}`);
  console.log(`  占位      ${summary.pending}`);
  console.log('');
  console.log('  ── 分类明细 ──');
  console.log(`  小模型 V1  ${summary.small_model.total} 个 → ${summary.small_model.available} 有效 / ${summary.small_model.failed} 失败`);
  console.log(`  大模型 1.0 ${summary.big_model.total} 个 → ${summary.big_model.available} 有效 / ${summary.big_model.failed} 失败`);
  console.log(`  候选       ${summary.candidate.total} 个 → ${summary.candidate.available} 有效 / ${summary.candidate.failed} 失败`);

  if (!hasCreds) {
    console.log('');
    console.log('  要生成真实 MP3，请配置 backend/.env 后重试');
  }
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
