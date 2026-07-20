// 宝宝英语岛 · 题目朗读音频生成器（Holly / 佩奇猪 2.0）

const dotenv = require('dotenv');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const { levels, questionPromptText } = require('../../script.js');
const { fileValid, sha256, synthesizeVoice } = require('./generate-voice-samples-v2.js');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'assets', 'audio', 'questions-holly');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'question-audio-manifest.json');
const VERSION = '20260719-question-200-nouns-v2';
const SPEAKER = 'zh_female_peiqi_uranus_bigtts';

function slugFor(level) {
  return level.title.toLowerCase().replace(/\s+/g, '-');
}

function questionAudioFile(level) {
  return `level-${String(level.id).padStart(2, '0')}-${slugFor(level)}.mp3`;
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const hasCreds = Boolean(process.env.DOUBAO_APP_ID && process.env.DOUBAO_TOKEN);
  const entries = [];
  const summary = { total: levels.length, generated: 0, skipped: 0, available: 0, failed: 0, not_attempted: 0 };
  let globalBlocked = false;

  for (const level of levels) {
    const fileName = questionAudioFile(level);
    const filePath = path.join(OUTPUT_DIR, fileName);
    const relative = `assets/audio/questions-holly/${fileName}`;
    const text = questionPromptText(level);
    const baseEntry = {
      level: level.id,
      word: level.title.toLowerCase(),
      zh: level.zhTitle,
      text,
      file: relative,
    };

    if (fileValid(filePath)) {
      const buf = fs.readFileSync(filePath);
      entries.push({ ...baseEntry, status: 'generated', size: buf.length, sha256: sha256(buf) });
      summary.skipped += 1;
      continue;
    }

    if (!hasCreds || globalBlocked) {
      entries.push({ ...baseEntry, status: hasCreds ? 'not_attempted' : 'pending', size: 0, sha256: '' });
      summary.not_attempted += 1;
      continue;
    }

    const result = await synthesizeVoice({ name: 'Holly / 佩奇猪 2.0', speaker: SPEAKER, gender: '女声', scene: '幼儿题目朗读' }, text, filePath);
    if (result.status === 'generated' && fileValid(filePath)) {
      const buf = fs.readFileSync(filePath);
      entries.push({ ...baseEntry, status: 'generated', size: buf.length, sha256: sha256(buf) });
      summary.generated += 1;
      continue;
    }

    if (result.status === 'not_attempted_global_blocker') globalBlocked = true;
    try { fs.unlinkSync(filePath); } catch (_) {}
    entries.push({
      ...baseEntry,
      status: result.status === 'not_attempted_global_blocker' ? 'not_attempted' : 'failed',
      size: 0,
      sha256: '',
      error: result.error_sanitized || result.error || 'generation failed',
    });
    if (result.status === 'not_attempted_global_blocker') summary.not_attempted += 1;
    else summary.failed += 1;
  }

  summary.available = entries.filter((entry) => entry.status === 'generated').length;
  const manifest = {
    version: VERSION,
    speaker: SPEAKER,
    resource_id: 'seed-tts-2.0',
    generated_at: new Date().toISOString(),
    entries,
    summary,
  };

  const tmpPath = `${MANIFEST_PATH}.tmp.${crypto.randomUUID()}`;
  fs.writeFileSync(tmpPath, JSON.stringify(manifest, null, 2) + '\n');
  fs.renameSync(tmpPath, MANIFEST_PATH);

  console.log(JSON.stringify(summary, null, 2));
  if (summary.failed > 0) process.exitCode = 1;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VERSION, SPEAKER, questionAudioFile, slugFor };
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[FATAL]', err);
    process.exit(1);
  });
}
