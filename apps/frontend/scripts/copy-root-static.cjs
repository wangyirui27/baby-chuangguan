const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..', '..');
const dist = path.join(root, 'apps', 'frontend', 'dist');

// 与 tools/pack-app-www.sh 一致：非视频运行时必进；草稿/raw 禁入
const SKIP_DIR_NAMES = new Set([
  '_cut',
  '_picked',
  '_prompts',
  'candidates',
  'dreamina',
  'raw',
  'raw-v2',
  'front-ocean-v1-video',
]);

function shouldSkipName(name) {
  if (!name) return false;
  if (name.startsWith('_gen') || name.startsWith('_dreamina')) return true;
  if (name.startsWith('_qa-') || name.startsWith('_preview-')) return true;
  if (name.startsWith('raw-')) return true;
  if (SKIP_DIR_NAMES.has(name)) return true;
  if (name.includes('.before-') || name.includes('.bak-')) return true;
  return false;
}

function copyFilter(src) {
  const base = path.basename(src);
  return !shouldSkipName(base);
}

function copy(relativePath) {
  const src = path.join(root, relativePath);
  const dest = path.join(dist, relativePath);
  if (!fs.existsSync(src)) throw new Error(`Missing root static asset: ${relativePath}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true, filter: copyFilter });
}

[
  'script.js',
  'style.css',
  'sw.js',
  'manifest.webmanifest',
  'app-release.json',
  'asset-packs.json',
  'assets/audio/boat',
  'assets/audio/feedback-holly',
  'assets/audio/map-bgm.mp3',
  'assets/audio/math-map-bgm.mp3',
  'assets/audio/questions-holly',
  'assets/audio/sfx',
  'assets/audio/words',
  'assets/brand',
  'assets/icons',
  'assets/egypt-map',
  'assets/islands-v1/runtime',
  'assets/lottie',
  'assets/math-map',
  'assets/ocean/covers/ocean-world-cover-v1.webp',
  'assets/ocean/front-ocean-bg-v2-libtv.webp',
  'assets/ocean/front-ocean-loop-v4-libtv-seamless-clouds.mp4',
  'assets/ocean/rowing-kids-boat-idle.webp',
  'assets/ocean/rowing-kids-boat-sailing.webp',
  'assets/ocean/seagull-fly.webp',
  'assets/vendor',
  'assets/video/free-levels',
].forEach(copy);
