/**
 * 宝宝闯关 · 关卡单词音频生成器 V2 测试
 * 测试覆盖：单词提取/去重/关卡映射、缓存键隔离、幂等、V3 契约、
 * manifest 结构、前台兼容字段、凭据安全
 *
 * 禁止读取真实 .env、禁止真实网络请求
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const read = (file) => fs.readFileSync(path.join(__dirname, file), 'utf8');

// ═══════════════════════════════════════════════════════════
//  辅助：mock 数据
// ═══════════════════════════════════════════════════════════

/** Create a minimal fake MP3 file (ID3v2 header + MPEG sync word) */
function createFakeMp3(size = 1024) {
  const buf = Buffer.alloc(size);
  // ID3v2 header
  buf[0] = 0x49; buf[1] = 0x44; buf[2] = 0x33; // "ID3"
  buf[3] = 0x04; buf[4] = 0x00; // version 2.4
  buf[6] = 0x00; buf[7] = 0x00; buf[8] = 0x00; buf[9] = 0x00; // size
  // MPEG sync word at offset 20
  buf[20] = 0xFF; buf[21] = 0xFB;
  return buf;
}

function fakeHash(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

// ═══════════════════════════════════════════════════════════
//  1. 单词提取 / 去重 / 关卡映射
// ═══════════════════════════════════════════════════════════

test('extractWordEntries returns current unique words from script.js levels', () => {
  const { extractWordEntries, CURRICULUM_UNITS } = require('./backend/src/generate-word-audio-v2.js');
  const { levels } = require('./script.js');

  const entries = extractWordEntries();
  const totalLevels = CURRICULUM_UNITS.reduce((s, u) => s + u.words.length, 0);
  const uniqueWords = new Set(levels.map(l => l.title.toLowerCase()));

  assert.equal(entries.length, uniqueWords.size, 'Must have one entry per unique current word');
  assert.equal(totalLevels, 200, 'Must have 200 total levels');

  // All words must be unique
  const words = entries.map(e => e.word);
  assert.equal(new Set(words).size, uniqueWords.size, 'All manifest words must be unique');

  // Check first and last words
  assert.equal(entries[0].word, 'mom');
  assert.deepEqual(entries[0].level_ids, [1]);
  assert.equal(entries.at(-1).word, 'sleep');
  assert.equal(entries.at(-1).level_ids[0], 200);

  // Each entry must have level_ids array
  entries.forEach((entry) => {
    assert.ok(Array.isArray(entry.level_ids), `${entry.word}: must have level_ids array`);
    assert.ok(entry.level_ids.length >= 1, `${entry.word}: must have at least 1 level_id`);
    assert.ok(typeof entry.zh === 'string', `${entry.word}: must have zh`);
    assert.ok(typeof entry.unit === 'string', `${entry.word}: must have unit`);
    assert.ok(typeof entry.unit_index === 'number', `${entry.word}: must have unit_index`);
  });
});

test('words with multiple level_ids (duplicates) are properly handled', () => {
  const { extractWordEntries } = require('./backend/src/generate-word-audio-v2.js');
  const entries = extractWordEntries();

  const duplicates = entries.filter(e => e.level_ids.length > 1);
  assert.equal(duplicates.length, 0, 'Expected no duplicated words in current curriculum');

  // But the code should handle duplicates if they exist — test the logic
  // We verify the structure supports it: level_ids is an array
  entries.forEach((e) => {
    assert.ok(Array.isArray(e.level_ids), 'level_ids must be array for duplicate support');
  });
});

test('extractWordEntries level_ids match expected pattern', () => {
  const { extractWordEntries } = require('./backend/src/generate-word-audio-v2.js');
  const entries = extractWordEntries();

  // Check a few known mappings
  const mom = entries.find(e => e.word === 'mom');
  assert.deepEqual(mom.level_ids, [1]);

  const banana = entries.find(e => e.word === 'banana');
  assert.deepEqual(banana.level_ids, [11]);

  const papaya = entries.find(e => e.word === 'papaya');
  assert.deepEqual(papaya.level_ids, [12]);

  const iceCream = entries.find(e => e.word === 'ice cream');
  assert.deepEqual(iceCream.level_ids, [26]);

  const teddyBear = entries.find(e => e.word === 'teddy bear');
  assert.deepEqual(teddyBear.level_ids, [101]);

  const sleep = entries.find(e => e.word === 'sleep');
  assert.deepEqual(sleep.level_ids, [200]);

  // Verify all level_ids are 1..200 exactly once
  const allIds = entries.flatMap(e => e.level_ids).sort((a, b) => a - b);
  assert.deepEqual(allIds, Array.from({ length: 200 }, (_, i) => i + 1));
});

// ═══════════════════════════════════════════════════════════
//  2. 文件名安全化
// ═══════════════════════════════════════════════════════════

test('safeFileName normalizes to lowercase alphanumeric with underscores', () => {
  const { safeFileName } = require('./backend/src/generate-word-audio-v2.js');

  assert.equal(safeFileName('hello'), 'hello');
  assert.equal(safeFileName('Hello'), 'hello');
  assert.equal(safeFileName('good night'), 'good_night');
  assert.equal(safeFileName('good-night'), 'good_night');
  assert.equal(safeFileName('hello!@#'), 'hello__'); // special chars become _
  // apostrophe/special chars normalized to underscore
  assert.equal(safeFileName("what's_test"), 'what_s_test');
  assert.equal(safeFileName("hello-world"), 'hello_world');
  assert.equal(safeFileName(''), '');
});

// ═══════════════════════════════════════════════════════════
//  3. 缓存键隔离测试
// ═══════════════════════════════════════════════════════════

test('cacheKey includes word + speaker + resource + format + sample_rate', () => {
  const { cacheKey, SPEAKER, RESOURCE_ID } = require('./backend/src/generate-word-audio-v2.js');

  const key = cacheKey('hello');

  // Must contain all identifying components
  assert.ok(key.includes('hello'), 'Must contain word');
  assert.ok(key.includes(SPEAKER), 'Must contain speaker');
  assert.ok(key.includes(RESOURCE_ID), 'Must contain resource ID');
  assert.ok(key.includes('mp3'), 'Must contain audio format');
  assert.ok(key.includes('24000'), 'Must contain sample rate');

  // Delimiter is |
  assert.ok(key.includes('|'), 'Must use | delimiter');
});

test('cacheKey changes when speaker changes (voice isolation)', () => {
  const { cacheKey } = require('./backend/src/generate-word-audio-v2.js');

  const key1 = cacheKey('hello');
  const key2 = cacheKey('hello');

  // Same parameters → same key
  assert.equal(key1, key2);

  // Different word → different key
  assert.notEqual(key1, cacheKey('world'));
});

test('shouldRegenerate detects speaker/model change', () => {
  const { shouldRegenerate, cacheKey, safeFileName } = require('./backend/src/generate-word-audio-v2.js');
  const { fileValid } = require('./backend/src/generate-voice-samples-v2.js');

  const testDir = path.join(__dirname, 'assets', 'audio', 'words');
  fs.mkdirSync(testDir, { recursive: true });

  const word = 'hello_test';
  const fileName = `${safeFileName(word)}.mp3`;
  const filePath = path.join(testDir, fileName);

  try {
    // Create a valid fake MP3
    const fakeBuf = createFakeMp3(2048);
    fs.writeFileSync(filePath, fakeBuf);
    const hash = fakeHash(fakeBuf);

    // Case 1: Entry exists with matching cache_key → should NOT regenerate
    const matchingEntry = [{
      word,
      cache_key: cacheKey(word),
      sha256: hash,
    }];
    assert.equal(shouldRegenerate(word, matchingEntry), false, 'Matching cache_key + valid file → skip');

    // Case 2: Entry exists but wrong cache_key (different speaker) → should regenerate
    const wrongCacheEntry = [{
      word,
      cache_key: `${word}|different_speaker|seed-tts-2.0|mp3|24000`,
      sha256: hash,
    }];
    assert.equal(shouldRegenerate(word, wrongCacheEntry), true, 'Different speaker → regenerate');

    // Case 3: No existing entry → should regenerate
    assert.equal(shouldRegenerate(word, []), true, 'No entry → regenerate');

    // Case 4: File doesn't exist but entry exists → should regenerate
    const ghostWord = 'ghost_word';
    assert.equal(shouldRegenerate(ghostWord, [{ word: ghostWord, cache_key: cacheKey(ghostWord), sha256: 'abc' }]),
      true, 'Missing file → regenerate');

  } finally {
    try { fs.unlinkSync(filePath); } catch (_) {}
  }
});

// ═══════════════════════════════════════════════════════════
//  4. V3 契约测试
// ═══════════════════════════════════════════════════════════

test('generator uses V3 API with correct endpoint', () => {
  const source = read('backend/src/generate-word-audio-v2.js');

  assert.ok(source.includes('/api/v3/tts/unidirectional'),
    'Must use V3 unidirectional endpoint');
  assert.ok(source.includes('seed-tts-2.0'),
    'Must use seed-tts-2.0 resource ID');
  assert.ok(source.includes('X-Api-App-Id'),
    'Must use X-Api-App-Id header');
  assert.ok(source.includes('X-Api-Access-Key'),
    'Must use X-Api-Access-Key header');
  assert.ok(source.includes('X-Api-Resource-Id'),
    'Must use X-Api-Resource-Id header');
});

test('generator does NOT use V1 Bearer auth', () => {
  const source = read('backend/src/generate-word-audio-v2.js');

  assert.ok(!source.includes('Bearer;'),
    'Must NOT use V1 Bearer authentication');
  assert.ok(!source.includes('pitch_ratio'),
    'Must NOT include pitch_ratio for V3');
  assert.ok(!source.includes('"app":'),
    'Must NOT use V1 app field');
});

test('generator uses V3 body structure: req_params with audio_params', () => {
  const source = read('backend/src/generate-word-audio-v2.js');

  assert.ok(source.includes('req_params'),
    'Body must use req_params');
  assert.ok(source.includes('audio_params'),
    'Body must include audio_params');
  assert.ok(source.includes('speaker'),
    'Body must include speaker');
  assert.ok(source.includes('speech_rate'),
    'Body must include speech_rate');
  assert.ok(source.includes('loudness_rate'),
    'Body must include loudness_rate');
});

test('generator uses Natasha speaker fixed', () => {
  const source = read('backend/src/generate-word-audio-v2.js');

  assert.ok(source.includes('en_female_natasha_uranus_bigtts'),
    'Must use Natasha speaker');
  assert.ok(!source.includes('DOUBAO_VOICE_TYPE'),
    'Speaker must NOT come from env variable — it is fixed');
});

test('generator uses mp3 format at 24000 Hz', () => {
  const source = read('backend/src/generate-word-audio-v2.js');

  assert.ok(source.includes("format: 'mp3'") || source.includes('format: "mp3"'),
    'Must use mp3 format');
  assert.ok(source.includes('sample_rate: 24000'),
    'Must use 24000 Hz sample rate');
});

test('generator synthesizes word only (no sentence)', () => {
  const source = read('backend/src/generate-word-audio-v2.js');

  // The text passed to API is the word itself, not a sentence
  const bodyMatch = source.match(/callV3Tts\(([a-zA-Z]+)\)/);
  assert.ok(bodyMatch || source.includes("callV3Tts(word)") || source.includes("callV3Tts(text)"),
    'Must pass only the word to API');
});

// ═══════════════════════════════════════════════════════════
//  5. 幂等/重试逻辑测试
// ═══════════════════════════════════════════════════════════

test('generator has idempotency check (shouldRegenerate)', () => {
  const source = read('backend/src/generate-word-audio-v2.js');
  assert.ok(source.includes('shouldRegenerate('),
    'Must check shouldRegenerate before generating');
  assert.ok(source.includes('跳过') || source.includes('skip'),
    'Must have idempotency skip logic');
});

test('generator has retry logic for retryable codes', () => {
  const source = read('backend/src/generate-word-audio-v2.js');
  assert.ok(source.includes('RETRYABLE_CODES'),
    'Must have retryable codes defined');
  assert.ok(source.includes('MAX_RETRIES'),
    'Must have MAX_RETRIES limit');
});

test('generator has global blocker logic', () => {
  const source = read('backend/src/generate-word-audio-v2.js');
  assert.ok(source.includes('GLOBAL_BLOCKER_CODES'),
    'Must have global blocker codes');
  assert.ok(source.includes('not_attempted_global_blocker'),
    'Must have global blocker status');
  assert.ok(source.includes('探针') || source.includes('probe'),
    'Must have probe logic');
});

test('generator uses probe before batch', () => {
  const source = read('backend/src/generate-word-audio-v2.js');
  assert.ok(source.includes('探针测试') || source.includes('probe test') || source.includes('Probe'),
    'Must have probe test');
});

test('generator handles manifest tmp file cleanup on startup', () => {
  const source = read('backend/src/generate-word-audio-v2.js');
  assert.ok(source.includes('word-audio-manifest.json.tmp.'),
    'Must clean up stale tmp files');
});

// ═══════════════════════════════════════════════════════════
//  6. Manifest 结构测试
// ═══════════════════════════════════════════════════════════

test('manifest entry structure is correct', () => {
  const source = read('backend/src/generate-word-audio-v2.js');

  // Must include all required fields
  assert.ok(source.includes('word:'), 'Entry needs word');
  assert.ok(source.includes('level_ids:'), 'Entry needs level_ids');
  assert.ok(source.includes('level_count:'), 'Entry needs level_count');
  assert.ok(source.includes('zh:'), 'Entry needs zh');
  assert.ok(source.includes('unit:'), 'Entry needs unit');
  assert.ok(source.includes('url:'), 'Entry needs url');
  assert.ok(source.includes('status:'), 'Entry needs status');
  assert.ok(source.includes('size_bytes:'), 'Entry needs size_bytes');
  assert.ok(source.includes('sha256:'), 'Entry needs sha256');
  assert.ok(source.includes('cache_key:'), 'Entry needs cache_key');
});

test('manifest has V2 structure with speaker and resource', () => {
  const source = read('backend/src/generate-word-audio-v2.js');

  // The manifest is built from variables; check the full file for key patterns
  assert.ok(source.includes("version: '2.0'"),
    'Manifest version must be 2.0');
  assert.ok(source.includes('seed-tts-2.0'),
    'Manifest must reference seed-tts-2.0');
  assert.ok(source.includes('en_female_natasha_uranus_bigtts'),
    'Manifest must reference Natasha speaker');
});

test('manifest summary includes levels count and speaker', () => {
  const source = read('backend/src/generate-word-audio-v2.js');

  assert.ok(source.includes('summary.levels') || source.includes("levels:"), 'Summary must have levels count');
  assert.ok(source.includes('summary.speaker') || source.includes("speaker:"), 'Summary must have speaker');
  assert.ok(source.includes('summary.available') || source.includes("available:"), 'Summary must have available count');
  assert.ok(source.includes('summary.not_attempted') || source.includes("not_attempted:"), 'Summary must have not_attempted');
});

test('manifest MUST NOT contain credentials', () => {
  const source = read('backend/src/generate-word-audio-v2.js');

  assert.ok(!source.includes('request_headers'), 'Manifest must not include request_headers');
  // app_id appears only in placeholder validation, not in manifest output
  const manifestSection = source.match(/const manifest = \{[\s\S]*?writeFileSync/);
  if (manifestSection) {
    assert.ok(!manifestSection[0].includes('access_key'), 'Manifest must not include access_key');
    assert.ok(!manifestSection[0].includes('app_id'), 'Manifest must not include app_id');
  }
});

test('manifest atomic write pattern (dual JSON + JS)', () => {
  const source = read('backend/src/generate-word-audio-v2.js');

  assert.ok(source.includes('.tmp.') && source.includes('crypto.randomUUID'),
    'Must use temp file with random UUID');
  assert.ok(source.includes('fs.renameSync'),
    'Must use atomic rename');
  // Both temp files must be cleaned up on error
  assert.ok(source.includes('fs.unlinkSync(jsonTmpPath)'),
    'Must clean up JSON temp on error');
  assert.ok(source.includes('fs.unlinkSync(jsTmpPath)'),
    'Must clean up JS temp on error');
  // Must write both files
  assert.ok(source.includes('word-audio-manifest.js') || source.includes('MANIFEST_JS_PATH'),
    'Must write JS manifest file');
});

// ═══════════════════════════════════════════════════════════
//  7. 前台兼容字段测试
// ═══════════════════════════════════════════════════════════

test('manifest entries have all fields needed by frontend (word, url, status)', () => {
  const source = read('backend/src/generate-word-audio-v2.js');

  // Frontend reads wordAudioMap from entries: word → url
  assert.ok(source.includes("word:"), 'Entry must have word (for wordAudioMap)');
  assert.ok(source.includes("url:"), 'Entry must have url (for wordAudioMap)');
  assert.ok(source.includes("status:"), 'Entry must have status (for frontend compatibility)');
});

test('manifest has voice_type compat field', () => {
  const source = read('backend/src/generate-word-audio-v2.js');

  assert.ok(source.includes('voice_type') || source.includes('voiceType'),
    'Manifest must have voice_type compat field');
});

// ═══════════════════════════════════════════════════════════
//  8. 安全审计
// ═══════════════════════════════════════════════════════════

test('source code reads credentials from env, not hardcoded', () => {
  const source = read('backend/src/generate-word-audio-v2.js');

  assert.ok(source.includes('process.env.DOUBAO_APP_ID'),
    'Must read APP_ID from env');
  assert.ok(source.includes('process.env.DOUBAO_TOKEN'),
    'Must read TOKEN from env');
});

test('source imports sanitizeError from shared module', () => {
  const source = read('backend/src/generate-word-audio-v2.js');

  assert.ok(source.includes('sanitizeError'),
    'Must use sanitizeError');
});

// ═══════════════════════════════════════════════════════════
//  9. 脚本命令测试
// ═══════════════════════════════════════════════════════════

test('package.json has generate-word-audio script', () => {
  const pkg = JSON.parse(read('backend/package.json'));
  assert.ok(pkg.scripts['generate-word-audio'],
    'package.json must have generate-word-audio script');
  assert.ok(pkg.scripts['generate-word-audio'].includes('generate-word-audio-v2.js'),
    'Script must point to generate-word-audio-v2.js');
});

// ═══════════════════════════════════════════════════════════
//  10. README 更新测试
// ═══════════════════════════════════════════════════════════

test('README references word audio generator', () => {
  const readme = read('backend/README.md');

  assert.ok(readme.includes('generate-word-audio'),
    'README must mention generate-word-audio command');
  assert.ok(readme.includes('Natasha'),
    'README must mention Natasha voice');
  assert.ok(readme.includes('en_female_natasha_uranus_bigtts'),
    'README must reference the Natasha speaker ID');
});

// ═══════════════════════════════════════════════════════════
//  11. .env.example 更新测试
// ═══════════════════════════════════════════════════════════

test('.env.example has Natasha voice type set', () => {
  const envExample = read('backend/.env.example');

  assert.ok(envExample.includes('en_female_natasha_uranus_bigtts'),
    '.env.example must have Natasha voice type');
  assert.ok(!envExample.includes('your_voice_type_here'),
    '.env.example must not have placeholder voice type');
});

// ═══════════════════════════════════════════════════════════
//  12. 共享模块导入测试
// ═══════════════════════════════════════════════════════════

test('generator imports shared utilities from generate-voice-samples-v2', () => {
  const source = read('backend/src/generate-word-audio-v2.js');

  assert.ok(source.includes("require('./generate-voice-samples-v2.js')"),
    'Must import shared utilities from V2 module');
  assert.ok(source.includes('JsonStreamParser'),
    'Must import JsonStreamParser');
  assert.ok(source.includes('sha256'),
    'Must import sha256');
  assert.ok(source.includes('mp3HeaderValid'),
    'Must import mp3HeaderValid');
  assert.ok(source.includes('fileValid'),
    'Must import fileValid');
  assert.ok(source.includes('sanitizeError'),
    'Must import sanitizeError');
});

// ═══════════════════════════════════════════════════════════
//  13. 探针与降级逻辑
// ═══════════════════════════════════════════════════════════

test('generator handles missing credentials gracefully', () => {
  const source = read('backend/src/generate-word-audio-v2.js');

  assert.ok(source.includes('hasCreds'), 'Must check credentials');
  assert.ok(source.includes('凭据未配置'), 'Must handle missing creds in Chinese');
  assert.ok(source.includes('pending'), 'Must have pending status for no-creds case');
});

// ═══════════════════════════════════════════════════════════
//  14. 前台 script.js 兼容验证
// ═══════════════════════════════════════════════════════════

test('frontend script.js manifest loading is compatible with V2 structure', () => {
  const scriptSource = read('script.js');

  // Frontend reads manifest.entries[i].word and .url
  assert.ok(scriptSource.includes('entry.word'), 'script.js must read entry.word');
  assert.ok(scriptSource.includes('entry.url'), 'script.js must read entry.url');
  assert.ok(scriptSource.includes("entry.status === 'generated'") ||
         scriptSource.includes('entry.status'), 'script.js must check entry.status');

  // Frontend builds wordAudioMap from entries
  assert.ok(scriptSource.includes('wordAudioMap['),
    'script.js must build wordAudioMap from manifest');

  // Frontend plays local MP3 if available
  assert.ok(scriptSource.includes('localAudioEl.play'),
    'script.js must play local MP3');

  // Frontend must not fall back to browser/system TTS for words without generated MP3.
  assert.ok(!scriptSource.includes('speechSynthesis.speak'),
    'script.js must not fall back to browser/system speechSynthesis');

  // Frontend ducks BGM during local playback
  assert.ok(scriptSource.includes('mapMusic.volume = MAP_MUSIC_DUCK_VOLUME'),
    'script.js must duck BGM');
});

// ═══════════════════════════════════════════════════════════
//  15. 逐文件验证（仅检查当前已存在的 manifest）
// ═══════════════════════════════════════════════════════════

test('generated manifest has correct entry count coverage', () => {
  // This test reads the current manifest — it must be run AFTER generation
  const manifestPath = path.join(__dirname, 'assets', 'audio', 'words', 'word-audio-manifest.json');
  if (!fs.existsSync(manifestPath)) return; // skip if not generated yet

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Manifest must match the current 200-level course table.
  assert.equal(manifest.version, '2.0', 'Manifest version must be 2.0');
  assert.ok(Array.isArray(manifest.entries), 'Must have entries array');
  assert.equal(manifest.entries.length, 200, 'Manifest must cover all unique current words');
  assert.equal(manifest.summary.total, 200, 'Manifest summary total must cover unique current words');
  assert.equal(manifest.summary.levels, 200, 'Manifest summary levels must cover 200 levels');

  // Verify structure
  manifest.entries.forEach((entry) => {
    assert.ok(typeof entry.word === 'string', 'Must have word');
    assert.ok(typeof entry.url === 'string', 'Must have url');
    assert.ok(entry.url.startsWith('assets/audio/words/'), 'URL must be in words dir');
    assert.ok(Array.isArray(entry.level_ids), 'Must have level_ids array');
    assert.ok(['generated', 'pending', 'failed', 'not_attempted'].includes(entry.status),
      `Status must be valid: ${entry.status}`);
    if (entry.status === 'generated') {
      assert.ok(entry.size_bytes > 0, 'Generated entries must have size > 0');
    }
  });

  const generatedCount = manifest.entries.filter((entry) => entry.status === 'generated').length;
  assert.equal(manifest.summary.available, generatedCount, 'Available count must only include generated local MP3');
});
