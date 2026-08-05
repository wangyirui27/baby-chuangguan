const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const read = (file) => fs.readFileSync(path.join(__dirname, file), 'utf8');

test('map randomly plays both ambient sounds over the original BGM', () => {
  const source = read('script.js');
  const html = read('index.html');
  const worker = read('sw.js');

  assert.ok(fs.existsSync(path.join(__dirname, 'assets/audio/map-bgm.mp3')));
  assert.ok(fs.statSync(path.join(__dirname, 'assets/audio/sfx/random-ambient.mp3')).size > 100_000);
  assert.ok(fs.statSync(path.join(__dirname, 'assets/audio/sfx/random-ambient-rare.mp3')).size > 50_000);
  assert.match(html, /id="map-music"[^>]*assets\/audio\/map-bgm\.mp3[^>]*loop/);
  assert.match(source, /const MAP_MUSIC_VOLUME = 0\.16/);
  assert.match(source, /const DESERT_MAP_MUSIC_VOLUME = 0\.2/);
  assert.match(source, /const MAP_MUSIC_DUCK_VOLUME = 0\.05/);
  assert.match(source, /const MAP_AMBIENT_VOLUME = 0\.28/);
  assert.match(source, /MAP_AMBIENT_SRC = 'assets\/audio\/sfx\/random-ambient\.mp3\?v=20260718-surround-ambient-v1'/);
  assert.match(source, /MAP_AMBIENT_MIN_DELAY_MS = 4000/);
  assert.match(source, /MAP_AMBIENT_MAX_DELAY_MS = 12000/);
  assert.match(source, /MAP_RARE_AMBIENT_SRC = 'assets\/audio\/sfx\/random-ambient-rare\.mp3\?v=20260718-rare-ambient-v1'/);
  assert.match(source, /mapAmbientAudio\.volume = MAP_AMBIENT_VOLUME/);
  assert.match(source, /MAP_RARE_AMBIENT_VOLUME = 0\.16/);
  assert.match(source, /MAP_RARE_AMBIENT_MIN_DELAY_MS = 25000/);
  assert.match(source, /MAP_RARE_AMBIENT_MAX_DELAY_MS = 55000/);
  assert.match(source, /mapMusic\.volume = MAP_MUSIC_VOLUME/);
  assert.match(source, /localAudioEl\.volume = WORD_AUDIO_VOLUME/);
  assert.match(source, /mapMusic\.volume = MAP_MUSIC_DUCK_VOLUME/);
  assert.match(source, /const BOAT_PADDLE_VOLUME = 0\.48/);
  assert.match(source, /const WORD_AUDIO_VOLUME = 1/);
  assert.match(source, /const QUESTION_AUDIO_VOLUME = 1/);
  assert.match(source, /const FEEDBACK_AUDIO_VOLUME = 0\.72/);
  assert.match(source, /function tone\(freq, start, duration, type = 'sine', gain = 0\.1\)/);
  // Correct/wrong quiz feedback uses local MP3, not WebAudio triangle tone(220).
  assert.doesNotMatch(source, /tone\(220,\s*0,\s*0\.22,\s*'triangle',\s*0\.07\)/);
  assert.match(source, /tone\(440, 0, 0\.09, 'sine', 0\.05\)/);
  assert.match(source, /const soundCorrect = \(\) => \{ \};/);
  assert.match(source, /const soundWrong = \(\) => \{ \};/);
  assert.match(source, /function playFileAudio\(btn, src, volume = WORD_AUDIO_VOLUME\)/);
  assert.match(source, /audio\.volume = volume/);
  assert.match(source, /playFileAudio\(listenQuestionBtn, questionAudio, QUESTION_AUDIO_VOLUME\)/);
  assert.match(source, /playFileAudio\(feedback, FEEDBACK_AUDIO_SRC\.correct, FEEDBACK_AUDIO_VOLUME\)/);
  assert.match(source, /playFileAudio\(feedback, FEEDBACK_AUDIO_SRC\.wrong, FEEDBACK_AUDIO_VOLUME\)/);
  assert.match(source, /function playMathCoachFeedbackTone\(kind\)/);
  assert.match(source, /mathCoachAudio\.volume = FEEDBACK_AUDIO_VOLUME/);
  assert.match(source, /function scheduleMapAmbient\(route = routeFromHash\(\)\)/);
  assert.match(source, /function scheduleMapRareAmbient\(route = routeFromHash\(\)\)/);
  assert.match(source, /mapAmbientTimer = setTimeout\(playMapAmbient, randomMapAmbientDelay\(\)\)/);
  assert.match(source, /mapRareAmbientTimer = setTimeout\(playMapRareAmbient, randomMapRareAmbientDelay\(\)\)/);
  assert.match(source, /mapAmbientAudio\.play\(\)\.catch\(\(\) => scheduleMapAmbient\(\)\)/);
  assert.match(source, /mapRareAmbientAudio\.play\(\)\.catch\(\(\) => scheduleMapRareAmbient\(\)\)/);
  assert.match(source, /mapAmbientAudio\.addEventListener\('ended', \(\) => scheduleMapAmbient\(\)\)/);
  assert.match(source, /mapRareAmbientAudio\.addEventListener\('ended', \(\) => scheduleMapRareAmbient\(\)\)/);
  assert.match(source, /const playPromise = mapMusic\.play\(\)/);
  assert.match(source, /playPromise\.then\(scheduleMapSounds\)/);
  assert.match(source, /mapMusic\.pause\(\)/);
  assert.match(source, /stopMapAmbient\(\)/);
  assert.match(source, /stopMapRareAmbient\(\)/);
  assert.doesNotMatch(source, /createStereoPanner|createMediaElementSource|MAP_AMBIENT_MUSIC_DUCK_VOLUME|mapMusic\.volume = 0(?:;|\n)/);
  assert.match(html, /script\.js\?v=20260804-math-apple-uniform-v1/);
  assert.match(worker, /script\.js\?v=20260804-math-apple-uniform-v1/);
  assert.match(worker, /assets\/audio\/sfx\/random-ambient\.mp3\?v=20260718-surround-ambient-v1/);
  assert.match(worker, /assets\/audio\/sfx\/random-ambient-rare\.mp3\?v=20260718-rare-ambient-v1/);
});

test('all real button clicks share the global UI click sound', () => {
  const source = read('script.js');
  const worker = read('sw.js');
  const clickPath = path.join(__dirname, 'assets/audio/sfx/ui-button-click.mp3');

  assert.ok(fs.existsSync(clickPath));
  assert.ok(fs.statSync(clickPath).size > 1_000);
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(clickPath)).digest('hex'), 'd23843892b898231f57f9d69f1c2fa070662e7e524cb158c97af1bae37a04480');
  assert.match(source, /UI_BUTTON_CLICK_SFX_SRC = 'assets\/audio\/sfx\/ui-button-click\.mp3\?v=20260804-ui-click-v2'/);
  assert.match(source, /UI_BUTTON_CLICK_SFX_VOLUME = 0\.45/);
  assert.match(source, /const uiButtonClickAudio = new Audio\(UI_BUTTON_CLICK_SFX_SRC\)/);
  assert.match(source, /function playUiButtonClickSfx\(\)/);
  assert.match(source, /uiButtonClickAudio\.currentTime = 0/);
  assert.match(source, /uiButtonClickAudio\.play\(\)\.catch\(\(\) => \{\}\)/);
  assert.match(source, /function handleUiButtonClickSfx\(event\)/);
  assert.match(source, /event\.target instanceof Element/);
  assert.match(source, /closest\('button, \[role="button"\], input\[type="button"\], input\[type="submit"\], input\[type="reset"\]'\)/);
  assert.match(source, /button\.disabled \|\| button\.closest\('\[disabled\], \[aria-disabled="true"\]'\)/);
  assert.match(source, /document\.addEventListener\('click', handleUiButtonClickSfx, true\)/);
  assert.match(worker, /assets\/audio\/sfx\/ui-button-click\.mp3\?v=20260804-ui-click-v2/);
});

test('map background music switches between independent ocean and desert tracks', () => {
  const source = read('script.js');
  const worker = read('sw.js');
  const oceanBgm = path.join(__dirname, 'assets/audio/map-bgm.mp3');
  const desertBgm = path.join(__dirname, 'assets/audio/desert-map-bgm.mp3');

  assert.ok(fs.existsSync(oceanBgm));
  assert.ok(fs.existsSync(desertBgm));
  assert.ok(fs.statSync(desertBgm).size > 100_000);
  assert.notEqual(fs.statSync(oceanBgm).size, fs.statSync(desertBgm).size);
  assert.match(source, /const MAP_MUSIC_BY_WORLD = \{[\s\S]*?ocean: 'assets\/audio\/map-bgm\.mp3'[\s\S]*?desert: 'assets\/audio\/desert-map-bgm\.mp3\?v=20260720-desert-bgm-v2'/);
  assert.match(source, /function mapMusicSrcForWorld\(worldId\)/);
  assert.match(source, /function currentMapMusicVolume\(\)[\s\S]*?DESERT_MAP_MUSIC_VOLUME[\s\S]*?MAP_MUSIC_VOLUME/);
  assert.match(source, /mapMusic\.pause\(\);[\s\S]*?mapMusic\.currentTime = 0;[\s\S]*?mapMusic\.src = nextMusicSrc;[\s\S]*?mapMusic\.load\(\)/);
  assert.match(source, /state\.preferences\.mapWorld === 'ocean'/);
  assert.match(source, /renderMap\(`\$\{MAP_WORLDS\[nextWorldId\]\.title\}\u5df2\u6253\u5f00`\);\s*syncMapMusic\(\)/);
  assert.match(worker, /assets\/audio\/map-bgm\.mp3/);
  assert.match(worker, /assets\/audio\/desert-map-bgm\.mp3\?v=20260720-desert-bgm-v2/);
});
