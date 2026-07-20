const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..', '..');
const dist = path.join(root, 'apps', 'frontend', 'dist');

function copy(relativePath) {
  const src = path.join(root, relativePath);
  const dest = path.join(dist, relativePath);
  if (!fs.existsSync(src)) throw new Error(`Missing root static asset: ${relativePath}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true });
}

[
  'script.js',
  'style.css',
  'sw.js',
  'manifest.webmanifest',
  'app-release.json',
  'assets/audio/boat',
  'assets/audio/feedback-holly',
  'assets/audio/map-bgm.mp3',
  'assets/audio/questions-holly',
  'assets/audio/sfx',
  'assets/audio/words',
  'assets/icons',
  'assets/egypt-map',
  'assets/islands-v1/runtime',
  'assets/lottie',
  'assets/ocean/front-ocean-bg-v2-libtv.webp',
  'assets/ocean/front-ocean-loop-v4-libtv-seamless-clouds.mp4',
  'assets/ocean/rowing-kids-boat-idle.webp',
  'assets/ocean/rowing-kids-boat-sailing.webp',
  'assets/ocean/seagull-fly.webp',
  'assets/vendor',
  'assets/video/free-levels',
].forEach(copy);
