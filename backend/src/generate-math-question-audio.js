// 嗨洛塔 · 数学题干朗读（火山引擎佩奇）
// 按 format+参数 slug 烘焙：count/numeral/take/compose/sequence/most/least
// 兼容旧文件 math-count-0..5-apple.mp3

const dotenv = require('dotenv');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const {
  collectMathQuestionUtterances,
  mathQuestionAudioRelativePath,
  mathQuestionAudioSlug,
  mathLevels,
} = require('../../script.js');
const { fileValid, sha256, synthesizeVoice } = require('./generate-voice-samples-v2.js');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'assets', 'audio', 'questions-holly');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'math-question-audio-manifest.json');
// 文案漂移强制重烤时 bump（与 script.js MATH_QUESTION_AUDIO_VERSION 对齐）
const VERSION = '20260806-math-q-compose-drag-v1';
const SPEAKER = 'zh_female_peiqi_uranus_bigtts';
const FORCE_ALL = process.env.MATH_Q_AUDIO_FORCE === '1';
const FORCE_PREFIX = String(process.env.MATH_Q_AUDIO_FORCE_PREFIX || '').trim(); // e.g. compose-

function fileNameForSlug(slug) {
  const legacy = /^count-([0-5])-apple$/.exec(slug);
  if (legacy) return `math-count-${legacy[1]}-apple.mp3`;
  return `math-q-${slug}.mp3`;
}

function loadPrevManifest() {
  try {
    const raw = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const map = new Map();
    for (const entry of raw.entries || []) {
      if (entry && entry.slug) map.set(entry.slug, entry);
    }
    return map;
  } catch (_) {
    return new Map();
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const utterances = collectMathQuestionUtterances(mathLevels);
  const prevBySlug = loadPrevManifest();
  const hasCreds = Boolean(process.env.DOUBAO_APP_ID && process.env.DOUBAO_TOKEN);
  const entries = [];
  const summary = {
    total: utterances.length,
    generated: 0,
    skipped: 0,
    available: 0,
    failed: 0,
    not_attempted: 0,
    text_drift: 0,
  };
  let globalBlocked = false;

  console.log(`[math-q-audio] utterances=${utterances.length} creds=${hasCreds} forceAll=${FORCE_ALL} forcePrefix=${FORCE_PREFIX || '-'}`);

  for (const { slug, text } of utterances) {
    const fileName = fileNameForSlug(slug);
    const filePath = path.join(OUTPUT_DIR, fileName);
    const relative = `assets/audio/questions-holly/${fileName}`;
    const baseEntry = { slug, text, file: relative, speaker: SPEAKER };
    const prev = prevBySlug.get(slug);
    const textDrift = Boolean(prev && prev.text && prev.text !== text);
    const forceThis = FORCE_ALL || (FORCE_PREFIX && slug.startsWith(FORCE_PREFIX)) || textDrift;

    if (fileValid(filePath) && !forceThis) {
      const buf = fs.readFileSync(filePath);
      entries.push({ ...baseEntry, status: 'generated', size: buf.length, sha256: sha256(buf) });
      summary.skipped += 1;
      continue;
    }

    if (textDrift) summary.text_drift += 1;
    if (forceThis && fileValid(filePath)) {
      try { fs.unlinkSync(filePath); } catch (_) {}
      console.log(`[regen] ${slug}${textDrift ? ' (text-drift)' : ' (force)'}`);
    }

    if (!hasCreds || globalBlocked) {
      entries.push({
        ...baseEntry,
        status: hasCreds ? 'not_attempted' : 'pending',
        size: 0,
        sha256: '',
      });
      summary.not_attempted += 1;
      continue;
    }

    const result = await synthesizeVoice(
      { name: 'Holly / 佩奇猪 2.0', speaker: SPEAKER, gender: '女声', scene: '数学题干朗读' },
      text,
      filePath,
    );
    if (result.status === 'generated' && fileValid(filePath)) {
      const buf = fs.readFileSync(filePath);
      entries.push({ ...baseEntry, status: 'generated', size: buf.length, sha256: sha256(buf) });
      summary.generated += 1;
      console.log(`[ok] ${slug} → ${fileName}`);
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
    console.warn(`[fail] ${slug}`, result.error_sanitized || result.error || result.status);
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
  fs.writeFileSync(tmpPath, `${JSON.stringify(manifest, null, 2)}\n`);
  fs.renameSync(tmpPath, MANIFEST_PATH);

  // sanity: L169 path must not be legacy count-3 when sequence
  const sample169 = mathLevels.find((l) => l.id === 169);
  if (sample169) {
    console.log('[sample L169]', {
      slug: mathQuestionAudioSlug(sample169),
      path: mathQuestionAudioRelativePath(sample169),
    });
  }

  console.log(JSON.stringify(summary, null, 2));
  if (summary.failed > 0 || summary.available < summary.total) process.exitCode = 1;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VERSION, SPEAKER, fileNameForSlug };
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[FATAL]', err);
    process.exit(1);
  });
}
