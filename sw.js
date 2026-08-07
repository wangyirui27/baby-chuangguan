const CACHE_NAME = 'baby-island-shell-20260807-math-take-pool-no-blob-v1';
const WORD_AUDIO_MANIFEST_URL = './assets/audio/words/word-audio-manifest.json?v=20260801-desert-natural-dialogue-v1';
const APP_SHELL = [
  './',
  './index.html',
  './style.css?v=20260807-math-take-pool-no-blob-v1',
  './script.js?v=20260807-math-take-pool-no-blob-v1',
  './assets/brand/splash/splash.css?v=20260801-desert-decor-v13c',
  './assets/brand/splash/home_bg.webp',
  './auth/apiClient.js?v=20260801-desert-decor-v13c',
  './manifest.webmanifest?v=20260717-app-shell-v1',
  './asset-packs.json?v=20260803-asset-packs-v1',
  './assets/icons/app-icon.svg?v=20260717-app-shell-v1',
  './assets/icons/resource-star.webp?v=20260714-v1',
  './assets/icons/resource-shell.webp?v=20260714-v1',
  './assets/math-map/props/ruler-handpaint-depth-v2.webp?v=20260804-math-handpaint-v2',
  './assets/math-map/props/pencil-handpaint-depth-v2.webp?v=20260804-math-handpaint-v2',
  './assets/math-map/props/pencil-kid-figure-handpaint-v1.webp?v=20260804-math-covers-v1',
  './assets/math-map/props/plus-tile-handpaint-depth-v3.webp?v=20260804-math-handpaint-v2',
  './assets/math-map/props/equal-tile-handpaint-depth-v3.webp?v=20260804-math-handpaint-v2',
  './assets/math-map/props/teal-bead-handpaint-depth-v2.webp?v=20260804-math-handpaint-v2',
  './assets/math-map/props/red-bead-handpaint-depth-v2.webp?v=20260804-math-handpaint-v2',
  './assets/math-map/props/eraser-handpaint-topdown-v1.webp?v=20260804-math-handpaint-v2',
  './assets/math-map/props/teal-bead-handpaint-depth-v2.webp?v=20260807-math-take-pool-no-blob-v1',
  './assets/math-map/props/red-bead-handpaint-depth-v2.webp?v=20260807-math-take-pool-no-blob-v1',
  './assets/math-map/props/eraser-handpaint-topdown-v1.webp?v=20260807-math-take-pool-no-blob-v1',
  './assets/math-map/covers/math-desk-cover-v1.webp?v=20260804-math-covers-v1',
  './assets/math-map/covers/math-garden-cover-v1.webp?v=20260804-math-covers-v1',
  './assets/math-map/covers/math-star-tower-cover-v1.webp?v=20260804-math-covers-v1',
  './assets/math-map/quiz/apple-handpaint-depth-v2.webp?v=20260804-math-quiz-props-v1',
  './assets/math-map/quiz/plate-handpaint-depth-v1.webp?v=20260804-math-quiz-props-v1',
  './assets/math-map/quiz/basket-handpaint-topdown-v1.webp?v=20260807-math-take-pool-no-blob-v1',
  './assets/math-map/quiz/wood-digits/wood-digit-0-v7.webp?v=20260807-math-take-pool-no-blob-v1',
  './assets/math-map/quiz/wood-digits/wood-digit-1-v7.webp?v=20260807-math-take-pool-no-blob-v1',
  './assets/math-map/quiz/wood-digits/wood-digit-2-v7.webp?v=20260807-math-take-pool-no-blob-v1',
  './assets/math-map/quiz/wood-digits/wood-digit-3-v7.webp?v=20260807-math-take-pool-no-blob-v1',
  './assets/math-map/quiz/wood-digits/wood-digit-4-v7.webp?v=20260807-math-take-pool-no-blob-v1',
  './assets/math-map/quiz/wood-digits/wood-digit-5-v7.webp?v=20260807-math-take-pool-no-blob-v1',
  './assets/math-map/quiz/wood-digits/wood-digit-6-v7.webp?v=20260807-math-take-pool-no-blob-v1',
  './assets/math-map/quiz/wood-digits/wood-digit-7-v7.webp?v=20260807-math-take-pool-no-blob-v1',
  './assets/math-map/quiz/wood-digits/wood-digit-8-v7.webp?v=20260807-math-take-pool-no-blob-v1',
  './assets/math-map/quiz/wood-digits/wood-digit-9-v7.webp?v=20260807-math-take-pool-no-blob-v1',
  './assets/math-map/quiz/wood-digits/wood-digit-10-v7.webp?v=20260807-math-take-pool-no-blob-v1',
  './assets/math-map/quiz/wood-digits/wood-digit-q-v7.webp?v=20260807-math-take-pool-no-blob-v1',
  '',
  './assets/ocean/covers/ocean-world-cover-v1.webp?v=20260803-map-cover-v1',
  './assets/ocean/front-ocean-bg-v2-libtv.webp?v=20260720-clean-ocean-v1',
  './assets/ocean/front-ocean-loop-v4-libtv-seamless-clouds.mp4?v=20260719-handpainted-libtv-v1',
  './assets/ocean/seagull-fly.webp?v=20260720-libtv-flap-v1',
  './assets/egypt-map/background/egypt-desert-infinite-clean-bg-dreamina-v2.png?v=20260720-desert-infinite-v2',
  './assets/egypt-map/background/egypt-desert-infinite-bg-libtv-v4.mp4?v=20260720-desert-bg-v4',
  './assets/ocean/rowing-kids-boat-idle.webp?v=20260720-libtv-original-v3',
  './assets/ocean/rowing-kids-boat-sailing.webp?v=20260720-libtv-original-rowing-v3',
  './assets/egypt-map/cutouts/characters/runtime/camel-walk-frame96-idle-v6.png?v=20260720-camel-idle-walkmatch-v6',
  './assets/egypt-map/cutouts/characters/libtv/camel-idle-expressive-v6.mov?v=20260801-camel-idle-expressive-v6',
  './assets/egypt-map/cutouts/characters/libtv/camel-idle-expressive-v6.webm?v=20260801-camel-idle-expressive-v6',
  './assets/egypt-map/cutouts/characters/libtv/camel-walk-alpha-v2.mov?v=20260720-libtv-camel-v2',
  './assets/egypt-map/cutouts/characters/libtv/camel-walk-alpha-v2.webm?v=20260720-libtv-camel-v2',
  './assets/egypt-map/cutouts/decor/runtime-v2/01-cactus-cluster.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/03-sandstone-rocks.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/05-date-palm-sapling.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/06-dry-scrub-bush.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/08-boulder-slab.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/09-reed-clump.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/12-column-stub.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/13-acacia-sapling.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/15-dune-thistle.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/17-broken-clay-pot.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/18-barrel-cactus.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/19-pebble-cluster.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/20-small-stone-block.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/21-cracked-amphora-shard.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/22-tiny-gravel-scatter.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/23-small-stone-cairn.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/24-gravel-dust-foot.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/25-cactus-saguaro-y.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/26-cactus-single-arm.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/27-cactus-candelabra.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/28-cactus-short-plump.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/29-cactus-tall-thin.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/30-cactus-prickly-pear.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/31-cactus-curved-arm.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/32-cactus-seedling.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/43-foot-trail-lr.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/43b-foot-trail-lr.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/36-pottery-sherd.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/37-linen-scrap.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/38-tumbleweed.webp?v=20260801-desert-decor-v13c',
  './assets/egypt-map/cutouts/decor/runtime-v2/39-scarab-stone.webp?v=20260801-desert-decor-v13c',
  './assets/islands-v1/runtime/island-001.webp?v=20260720-underwater-fade-v3',
  './assets/islands-v1/runtime/island-002.webp?v=20260720-underwater-fade-v3',
  './assets/islands-v1/runtime/island-003.webp?v=20260720-underwater-fade-v3',
  './assets/islands-v1/runtime/island-004.webp?v=20260720-underwater-fade-v3',
  './assets/islands-v1/runtime/island-005.webp?v=20260720-underwater-fade-v3',
  './assets/audio/map-bgm.mp3',
  './assets/audio/desert-map-bgm.mp3?v=20260720-desert-bgm-v2',
  './assets/audio/math-map-bgm.mp3?v=20260804-math-bgm-v2',
  './assets/audio/words/word-audio-manifest.js?v=20260801-desert-natural-dialogue-v1',
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
  './assets/audio/feedback-holly/correct.mp3?v=20260804-peiqi-feedback-v3',
  './assets/audio/feedback-holly/wrong.mp3?v=20260804-peiqi-feedback-v3',
  './assets/audio/questions-holly/math-count-0-apple.mp3?v=20260807-math-take-pool-no-blob-v1',
  './assets/audio/questions-holly/math-count-1-apple.mp3?v=20260807-math-take-pool-no-blob-v1',
  './assets/audio/questions-holly/math-count-2-apple.mp3?v=20260807-math-take-pool-no-blob-v1',
  './assets/audio/questions-holly/math-count-3-apple.mp3?v=20260807-math-take-pool-no-blob-v1',
  './assets/audio/questions-holly/math-count-4-apple.mp3?v=20260807-math-take-pool-no-blob-v1',
  './assets/audio/questions-holly/math-count-5-apple.mp3?v=20260807-math-take-pool-no-blob-v1',
  './assets/audio/sfx/random-ambient.mp3?v=20260718-surround-ambient-v1',
  './assets/audio/sfx/random-ambient-rare.mp3?v=20260718-rare-ambient-v1',
  './assets/audio/sfx/ui-button-click.mp3?v=20260804-ui-click-v2',
  './assets/audio/sfx/math-apple-drop-blop-soft-01.mp3?v=20260804-math-sfx-v1',
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
  './assets/lottie/level-video-loading.json?v=20260803-rocking-horse-v1',
  './assets/lottie/hand-tap-data.js?v=20260718-hand-user-edit',
  './assets/lottie/hand-tap.json?v=20260718-hand-user-edit',
  './assets/lottie/correct-celebration-data.js?v=20260718-correct-lottie-v1',
  './assets/lottie/correct-celebration.json?v=20260718-correct-lottie-v1'
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

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
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
