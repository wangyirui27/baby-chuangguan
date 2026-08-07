// 嗨洛塔 · 数学必经小片子主题朗读（火山引擎佩奇）
// 输出 assets/audio/math-story-theme/{id}.mp3

const dotenv = require('dotenv');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const {
  collectMathStoryThemeUtterances,
  MATH_STORY_THEME_AUDIO_VERSION,
} = require('../../script.js');
const { fileValid, sha256, synthesizeVoice } = require('./generate-voice-samples-v2.js');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'assets', 'audio', 'math-story-theme');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'math-story-theme-manifest.json');
const VERSION = '20260807-story-theme-v9-ep20-finish-ten';
const SPEAKER = 'zh_female_peiqi_uranus_bigtts';
const FORCE_ALL = process.env.MATH_STORY_THEME_FORCE === '1';

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const utterances = collectMathStoryThemeUtterances();
  const hasCreds = Boolean(process.env.DOUBAO_APP_ID && process.env.DOUBAO_TOKEN);
  const entries = [];
  const summary = { total: utterances.length, generated: 0, skipped: 0, available: 0, failed: 0, not_attempted: 0 };

  console.log(`[math-story-theme] n=${utterances.length} creds=${hasCreds} force=${FORCE_ALL} ver=${VERSION}`);

  for (const { id, text, file } of utterances) {
    const filePath = path.join(PROJECT_ROOT, file);
    const base = { id, text, file, speaker: SPEAKER };
    if (fileValid(filePath) && !FORCE_ALL) {
      const buf = fs.readFileSync(filePath);
      entries.push({ ...base, status: 'generated', size: buf.length, sha256: sha256(buf) });
      summary.skipped += 1;
      continue;
    }
    if (!hasCreds) {
      entries.push({ ...base, status: 'pending', size: 0, sha256: '' });
      summary.not_attempted += 1;
      continue;
    }
    if (FORCE_ALL && fileValid(filePath)) {
      try { fs.unlinkSync(filePath); } catch (_) {}
    }
    const result = await synthesizeVoice(
      { name: 'Holly / 佩奇猪 2.0', speaker: SPEAKER, gender: '女声', scene: '数学小片子主题' },
      text,
      filePath,
    );
    if (result.status === 'generated' && fileValid(filePath)) {
      const buf = fs.readFileSync(filePath);
      entries.push({ ...base, status: 'generated', size: buf.length, sha256: sha256(buf) });
      summary.generated += 1;
      console.log(`[ok] ${id}`);
      continue;
    }
    try { fs.unlinkSync(filePath); } catch (_) {}
    entries.push({
      ...base,
      status: result.status === 'not_attempted_global_blocker' ? 'not_attempted' : 'failed',
      size: 0,
      sha256: '',
      error: result.error_sanitized || result.error || result.status,
    });
    if (result.status === 'not_attempted_global_blocker') summary.not_attempted += 1;
    else summary.failed += 1;
    console.warn(`[fail] ${id}`, result.error_sanitized || result.error || result.status);
  }

  summary.available = entries.filter((e) => e.status === 'generated').length;
  const manifest = {
    version: VERSION,
    scriptVersion: MATH_STORY_THEME_AUDIO_VERSION || VERSION,
    speaker: SPEAKER,
    generated_at: new Date().toISOString(),
    entries,
    summary,
  };
  const tmp = `${MANIFEST_PATH}.tmp.${crypto.randomUUID()}`;
  fs.writeFileSync(tmp, `${JSON.stringify(manifest, null, 2)}\n`);
  fs.renameSync(tmp, MANIFEST_PATH);
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failed > 0) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[FATAL]', err);
    process.exit(1);
  });
}

module.exports = { VERSION, SPEAKER };
