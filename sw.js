const CACHE_NAME = 'baby-island-shell-20260720-v169';
const WORD_AUDIO_MANIFEST_URL = './assets/audio/words/word-audio-manifest.json?v=20260720-word-manifest-200-v1';
const APP_SHELL = [
  './',
  './index.html',
  './style.css?v=20260720-camel-idle-stable-v3',
  './script.js?v=20260720-camel-idle-walkmatch-v1',
  './auth/apiClient.js?v=20260720-learning-sync-v1',
  './manifest.webmanifest?v=20260717-app-shell-v1',
  './assets/icons/app-icon.svg?v=20260717-app-shell-v1',
  './assets/icons/resource-star.webp?v=20260714-v1',
  './assets/icons/resource-shell.webp?v=20260714-v1',
  './assets/ocean/front-ocean-bg-v2-libtv.webp?v=20260720-clean-ocean-v1',
  './assets/ocean/front-ocean-loop-v4-libtv-seamless-clouds.mp4?v=20260719-handpainted-libtv-v1',
  './assets/ocean/seagull-fly.webp?v=20260720-libtv-flap-v1',
  './assets/egypt-map/background/egypt-desert-infinite-clean-bg-dreamina-v2.png?v=20260720-desert-infinite-v2',
  './assets/egypt-map/background/egypt-desert-infinite-bg-libtv-v4.mp4?v=20260720-desert-bg-v4',
  './assets/ocean/rowing-kids-boat-idle.webp?v=20260720-libtv-original-v3',
  './assets/ocean/rowing-kids-boat-sailing.webp?v=20260720-libtv-original-rowing-v3',
  './assets/egypt-map/cutouts/characters/runtime/camel-walk-frame96-idle-v6.png?v=20260720-camel-idle-walkmatch-v6',
  './assets/egypt-map/cutouts/characters/libtv/camel-idle-alpha-v6.mov?v=20260720-camel-idle-walkmatch-v6',
  './assets/egypt-map/cutouts/characters/libtv/camel-idle-alpha-v6.webm?v=20260720-camel-idle-walkmatch-v6',
  './assets/egypt-map/cutouts/characters/libtv/camel-walk-alpha-v2.mov?v=20260720-libtv-camel-v2',
  './assets/egypt-map/cutouts/characters/libtv/camel-walk-alpha-v2.webm?v=20260720-libtv-camel-v2',
  './assets/egypt-map/cutouts/decor/runtime-v1/01-cactus-cluster.webp?v=20260720-desert-decor-v1',
  './assets/egypt-map/cutouts/decor/runtime-v1/02-dry-grass-clump.webp?v=20260720-desert-decor-v1',
  './assets/egypt-map/cutouts/decor/runtime-v1/03-rock-pile.webp?v=20260720-desert-decor-v1',
  './assets/egypt-map/cutouts/decor/runtime-v1/04-terracotta-jar.webp?v=20260720-desert-decor-v1',
  './assets/egypt-map/cutouts/decor/runtime-v1/05-column-fragment.webp?v=20260720-desert-decor-v1',
  './assets/egypt-map/cutouts/decor/runtime-v1/06-obelisk-fragment.webp?v=20260720-desert-decor-v1',
  './assets/egypt-map/cutouts/decor/runtime-v1/07-ruined-wall.webp?v=20260720-desert-decor-v1',
  './assets/egypt-map/cutouts/decor/runtime-v1/08-sandstone-archway.webp?v=20260720-desert-decor-v1',
  './assets/egypt-map/cutouts/decor/runtime-v1/09-dry-bush.webp?v=20260720-desert-decor-v1',
  './assets/egypt-map/cutouts/decor/runtime-v1/10-reed-grass.webp?v=20260720-desert-decor-v1',
  './assets/egypt-map/cutouts/decor/runtime-v1/11-stone-tablet.webp?v=20260720-desert-decor-v1',
  './assets/egypt-map/cutouts/decor/runtime-v1/12-wooden-crate.webp?v=20260720-desert-decor-v1',
  './assets/islands-v1/runtime/island-001.webp?v=20260720-underwater-fade-v3',
  './assets/islands-v1/runtime/island-002.webp?v=20260720-underwater-fade-v3',
  './assets/islands-v1/runtime/island-003.webp?v=20260720-underwater-fade-v3',
  './assets/islands-v1/runtime/island-004.webp?v=20260720-underwater-fade-v3',
  './assets/islands-v1/runtime/island-005.webp?v=20260720-underwater-fade-v3',
  './assets/audio/map-bgm.mp3',
  './assets/audio/desert-map-bgm.mp3?v=20260720-desert-bgm-v2',
  './assets/audio/words/word-audio-manifest.js?v=20260720-word-manifest-200-v1',
  WORD_AUDIO_MANIFEST_URL,
  './assets/audio/words/ice_cream.mp3?v=20260718-ice-cream-word-v1',
  './assets/audio/words/mom.mp3',
  './assets/audio/words/dad.mp3',
  './assets/audio/words/grandma.mp3',
  './assets/audio/words/grandpa.mp3',
  './assets/audio/words/hand.mp3',
  './assets/audio/words/rice.mp3',
  './assets/audio/words/water.mp3',
  './assets/audio/words/car.mp3',
  './assets/audio/words/dog.mp3',
  './assets/audio/words/book.mp3',
  './assets/audio/questions-holly/level-01-mom.mp3?v=20260719-question-200-nouns-v2',
  './assets/audio/questions-holly/level-02-dad.mp3?v=20260719-question-200-nouns-v2',
  './assets/audio/questions-holly/level-03-grandma.mp3?v=20260719-question-200-nouns-v2',
  './assets/audio/questions-holly/level-04-grandpa.mp3?v=20260719-question-200-nouns-v2',
  './assets/audio/questions-holly/level-05-hand.mp3?v=20260719-question-200-nouns-v2',
  './assets/audio/questions-holly/level-06-rice.mp3?v=20260719-question-200-nouns-v2',
  './assets/audio/questions-holly/level-07-water.mp3?v=20260719-question-200-nouns-v2',
  './assets/audio/questions-holly/level-08-car.mp3?v=20260719-question-200-nouns-v2',
  './assets/audio/questions-holly/level-09-dog.mp3?v=20260719-question-200-nouns-v2',
  './assets/audio/questions-holly/level-10-book.mp3?v=20260719-question-200-nouns-v2',
  './assets/audio/feedback-holly/correct.mp3?v=20260718-holly-feedback-v1',
  './assets/audio/feedback-holly/wrong.mp3?v=20260718-holly-feedback-v1',
  './assets/audio/sfx/random-ambient.mp3?v=20260718-surround-ambient-v1',
  './assets/audio/sfx/random-ambient-rare.mp3?v=20260718-rare-ambient-v1',
  './assets/audio/boat/rowing-paddle.mp3?v=20260717-paddle-v1',
  './assets/video/free-levels/level-01-mom.mp4?v=20260720-map-switch-cards-v13',
  './assets/video/free-levels/level-02-dad.mp4?v=20260720-map-switch-cards-v13',
  './assets/video/free-levels/level-03-grandma.mp4?v=20260720-map-switch-cards-v13',
  './assets/video/free-levels/level-04-grandpa.mp4?v=20260720-map-switch-cards-v13',
  './assets/video/free-levels/level-05-hand.mp4?v=20260720-map-switch-cards-v13',
  './assets/video/free-levels/level-06-rice.mp4?v=20260720-map-switch-cards-v13',
  './assets/video/free-levels/level-07-water.mp4?v=20260720-map-switch-cards-v13',
  './assets/video/free-levels/level-08-car.mp4?v=20260720-map-switch-cards-v13',
  './assets/video/free-levels/level-09-dog.mp4?v=20260720-map-switch-cards-v13',
  './assets/video/free-levels/level-10-book.mp4?v=20260720-map-switch-cards-v13',
  './assets/vendor/lottie.min.js',
  './assets/lottie/hand-tap-data.js?v=20260718-hand-user-edit',
  './assets/lottie/hand-tap.json?v=20260718-hand-user-edit',
  './assets/lottie/correct-celebration-data.js?v=20260718-correct-lottie-v1',
  './assets/lottie/correct-celebration.json?v=20260718-correct-lottie-v1',
];

function cacheGeneratedWordAudio(cache) {
  return cache.match(WORD_AUDIO_MANIFEST_URL)
    .then((response) => (response ? response.json() : null))
    .then((manifest) => {
      if (!manifest || !Array.isArray(manifest.entries)) return;
      const urls = manifest.entries
        .filter((entry) => entry.status === 'generated')
        .map((entry) => String(entry.url || ''))
        .filter((url) => url.startsWith('assets/audio/words/') && url.endsWith('.mp3'))
        .map((url) => `./${url}`);
      return Promise.allSettled([...new Set(urls)].map((url) => cache.add(url)));
    })
    .catch(() => {});
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => (
    cache.addAll(APP_SHELL).then(() => cacheGeneratedWordAudio(cache))
  )));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then((response) => {
      const url = new URL(event.request.url);
      const canCache = response.ok
        && url.origin === self.location.origin
        && ['document', 'manifest', 'script', 'style'].includes(event.request.destination);
      if (canCache) {
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
      }
      return response;
    }).catch(() => caches.match(event.request).then((cached) => {
      if (cached) return cached;
      if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        return caches.match('./index.html');
      }
      return new Response('', { status: 503, statusText: 'Offline' });
    })),
  );
});
