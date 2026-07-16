const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { applyQuizAnswer, getLevelAccess, islandStyleId, levels, normalizeProgress, routePoint, wordButtonDisabled } = require('./script.js');

const read = (file) => fs.readFileSync(path.join(__dirname, file), 'utf8');

const progress = { completed: [1, 2], unlockedThrough: 3 };

test('correct answer completes current level and unlocks next', () => {
  assert.deepEqual(applyQuizAnswer(progress, 3, 0, 0, 100), {
    correct: true,
    progress: { completed: [1, 2, 3], unlockedThrough: 4 },
  });
});

test('wrong answer leaves progress unchanged', () => {
  assert.deepEqual(applyQuizAnswer(progress, 3, 1, 0, 10), {
    correct: false,
    progress,
  });
});

test('last level does not unlock beyond boundary', () => {
  const lastLevel = { completed: Array.from({ length: 99 }, (_, index) => index + 1), unlockedThrough: 100 };

  assert.deepEqual(applyQuizAnswer(lastLevel, 100, 0, 0, 100), {
    correct: true,
    progress: { completed: Array.from({ length: 100 }, (_, index) => index + 1), unlockedThrough: 100 },
  });
});

test('new users start at level one and stored progress cannot skip levels', () => {
  assert.deepEqual(normalizeProgress(null, 100), { completed: [], unlockedThrough: 1 });
  assert.deepEqual(normalizeProgress({ completed: [1, 2, 4], unlockedThrough: 99 }, 100), {
    completed: [1, 2],
    unlockedThrough: 3,
  });

  const source = read('script.js');
  assert.match(source, /baby-island-preview-progress-v1/);
  assert.match(source, /localStorage\.setItem\(PREVIEW_PROGRESS_KEY/);
});




test('level entry checks login, sequence, then payment', () => {
  const loggedOut = { isLoggedIn: false, hasFullAccess: false };
  const freeAccount = { isLoggedIn: true, hasFullAccess: false };
  const paidAccount = { isLoggedIn: true, hasFullAccess: true };

  assert.equal(getLevelAccess(1, { completed: [], unlockedThrough: 1 }, loggedOut), 'login-required');
  assert.equal(getLevelAccess(50, { completed: [], unlockedThrough: 1 }, loggedOut), 'login-required');
  assert.equal(getLevelAccess(5, { completed: [1, 2, 3], unlockedThrough: 4 }, freeAccount), 'locked');
  assert.equal(getLevelAccess(5, { completed: [1, 2, 3, 4], unlockedThrough: 5 }, freeAccount), 'allowed');
  assert.equal(getLevelAccess(6, { completed: [1, 2, 3, 4], unlockedThrough: 5 }, freeAccount), 'locked');
  assert.equal(getLevelAccess(6, { completed: [1, 2, 3, 4, 5], unlockedThrough: 6 }, freeAccount), 'payment-required');
  assert.equal(getLevelAccess(6, { completed: [1, 2, 3, 4, 5], unlockedThrough: 6 }, paidAccount), 'allowed');
});

test('no stamina/energy gate — repeated level entry and retry are never blocked by stamina', () => {
  const source = read('script.js');
  // No stamina check in getLevelAccess (only login → unlock → payment)
  const accessFn = source.match(/function getLevelAccess[\s\S]*?\n\}/)?.[0] ?? '';
  assert.doesNotMatch(accessFn, /stamina|energy|体力|能量|爱心|life|hearts/i,
    'getLevelAccess must not contain stamina/energy checks');
  assert.doesNotMatch(accessFn, /remaining|attempt|次数/,
    'getLevelAccess must not contain remaining-attempt checks');

  // No stamina deduction in applyQuizAnswer (only progress logic)
  const quizFn = source.match(/function applyQuizAnswer[\s\S]*?\n\}/)?.[0] ?? '';
  assert.doesNotMatch(quizFn, /stamina|energy|体力|能量|爱心|life|hearts/i,
    'applyQuizAnswer must not contain stamina/energy deduction');

  // The word "体力" must be completely absent from script.js
  assert.doesNotMatch(source, /体力/u, 'script.js must not contain 体力');

  // Repeated retry works: wrong answer does not consume stamina
  const retryProgress = { completed: [1], unlockedThrough: 2 };
  const firstRetry = applyQuizAnswer(retryProgress, 2, 0, 0, 100);
  assert.equal(firstRetry.correct, true, 'correct answer on first retry');
  const secondRetry = applyQuizAnswer(retryProgress, 2, 1, 0, 100);
  assert.equal(secondRetry.correct, false, 'wrong answer on second retry — no stamina block');
  assert.deepEqual(secondRetry.progress, retryProgress, 'wrong retry does not regress progress');
  const thirdRetry = applyQuizAnswer(retryProgress, 2, 0, 0, 100);
  assert.equal(thirdRetry.correct, true, 'correct answer on third retry after wrong — no stamina depletion');
  assert.deepEqual(thirdRetry.progress.completed, [1, 2], 'retry with correct answer still unlocks level');
});

test('map clicks and direct level routes share the same access gate', () => {
  const source = read('script.js');

  assert.match(source, /requestLevelAccess\(Number\(button\.dataset\.level\), button\)/);
  assert.match(source, /getLevelAccess\(route\.id, state\.progress, state\.account\)/);
  assert.match(read('index.html'), /<dialog class="access-dialog"[\s\S]*?data-access-dialog-content/);
});

test('curriculum has one hundred preschool English levels in ten units', () => {
  assert.equal(levels.length, 100);
  assert.equal(new Set(levels.map(({ id }) => id)).size, 100);
  assert.deepEqual(levels.slice(0, 3).map(({ title }) => title), ['Hello', 'Red', 'Flower']);
  assert.deepEqual(levels.slice(-3).map(({ title }) => title), ['Shoes', 'Bath', 'Good Night']);
  assert.equal(new Set(levels.map(({ topic }) => topic)).size, 10);
  levels.forEach((level) => assert.equal(level.options[level.correct].toLowerCase(), level.title.toLowerCase()));
  assert.deepEqual(levels[2], {
    id: 3,
    title: 'Flower',
    zhTitle: '花朵',
    topic: 'First Words · 初见英语',
    duration: '3 分钟',
    guidance: '看一看画面，听清并跟读 flower。',
    question: 'Which word means 花朵?',
    options: ['bye', 'yes', 'flower', 'no'],
    correct: 2,
  });
});

test('island map advances from level one to one hundred in a horizontal lane', () => {
  const first = routePoint(1);
  const last = routePoint(100);
  const source = read('script.js');

  assert.deepEqual(first, { x: 0, y: 0 });
  assert.deepEqual(last, { x: 38016, y: 0 });
  assert.ok(first.x < last.x);
  assert.match(source, /100 MAGIC ISLANDS/);
  assert.match(source, /100 座魔法岛/);
  // 宝宝英语岛 remains in document.title but not as map h1
  assert.match(source, /宝宝英语岛/);
  // map-brand has 100 MAGIC ISLANDS eyebrow and h1
  assert.match(source, /MAGIC ISLANDS/);
  assert.match(source, /data-route-scroll/);
  assert.match(source, /data-locate-progress/);
  assert.match(source, /data-locate-progress[^>]*aria-label="定位到第 \$\{state\.progress\.unlockedThrough\} 关"/);
  assert.match(source, /class="locate-progress-icon"/);
  assert.doesNotMatch(source, /data-locate-progress>定位第/);
  assert.match(source, /routeScroll\.scrollTo/);
  assert.match(source, /resource-strip/);
  assert.equal((source.match(/class="resource-glyph"/g) || []).length, 2);
  assert.equal((source.match(/src="assets\/icons\/resource-(?:star|shell)\.webp/g) || []).length, 2);
  ['star', 'shell'].forEach((name) => {
    const icon = path.join(__dirname, `assets/icons/resource-${name}.webp`);
    assert.ok(fs.existsSync(icon));
    assert.ok(fs.statSync(icon).size < 15_000);
  });
  assert.doesNotMatch(source, /data-reward|今日奖励|完成\s*1\s*关领取|reward-chip|reward-icon|resource-reward/);
  const css = read('style.css');
  assert.doesNotMatch(css, /data-reward|今日奖励|完成\s*1\s*关领取|reward-chip|reward-icon|resource-reward/);
  assert.doesNotMatch(source, />[★♥🎁]</);
  assert.match(source, /class="ocean-loop"[^>]*autoplay[^>]*muted[^>]*loop[^>]*playsinline/);
  assert.match(source, /class="ocean-loop"[^>]*preload="auto"/);
  assert.match(source, /class="flying-seagull"[^>]*alt=""[^>]*aria-hidden="true"/);
  assert.match(source, /class="flying-seagull-pair"[\s\S]*?<img[\s\S]*?<img/);
  assert.doesNotMatch(source, /Math\.sin|route-svg/);
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/ocean/ocean-bg.webp')));
  const seagullAsset = path.join(__dirname, 'assets/ocean/seagull-fly.webp');
  assert.ok(fs.existsSync(seagullAsset));
  assert.ok(fs.statSync(seagullAsset).size < 1_000_000);
  const oceanLoopAsset = path.join(__dirname, 'assets/ocean/front-ocean-loop-v4-libtv-seamless-clouds.mp4');
  assert.ok(fs.existsSync(oceanLoopAsset));
  assert.ok(fs.statSync(oceanLoopAsset).size < 4_000_000);
  assert.match(source, /front-ocean-loop-v4-libtv-seamless-clouds\.mp4/);
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/ocean/front-ocean-bg-v2-libtv.webp')));
  const oceanSource = source.match(/<source src="([^"?]+\.mp4)/)?.[1];
  assert.ok(oceanSource);
  assert.ok(fs.existsSync(path.join(__dirname, oceanSource)));
  assert.match(read('index.html'), /id="map-music"[^>]*map-bgm\.mp3[^>]*loop/);
  assert.match(source, /route\.type === 'map'[^\n]*mapMusic\.play/);
  assert.match(source, /else mapMusic\.pause\(\)/);
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/audio/map-bgm.mp3')));
  Array.from({ length: 10 }, (_, index) => index + 1).forEach((number) => {
    assert.ok(fs.existsSync(path.join(__dirname, `assets/ocean/island-${String(number).padStart(2, '0')}.webp`)));
    const cutout = path.join(__dirname, `assets/ocean/scene-island-cutout-${String(number).padStart(2, '0')}.webp`);
    assert.ok(fs.existsSync(cutout));
    assert.ok(fs.statSync(cutout).size < 250_000);
  });
});

test('source keeps three tabs and removes obsolete generic course copy', () => {
  const source = `${read('index.html')}\n${read('script.js')}`;
  assert.equal((read('index.html').match(/data-tab=/g) || []).length, 3);
  assert.match(source, /bottomTabs\.hidden = true/);
  assert.match(source, /bottomTabs\.hidden = false/);
  assert.match(source, /appShell\.classList\.add\('detail-shell'\)/);
  assert.match(source, /appShell\.classList\.remove\('detail-shell'\)/);
  assert.match(read('style.css'), /\.app-shell\.detail-shell\s*\{[^}]*padding-bottom:/);
  assert.match(read('style.css'), /\.bottom-tabs\[hidden\]\s*\{[^}]*display:\s*none/);
  assert.match(source, /宝宝英语岛/);
  ['宝宝视频闯关', '自然观察', '数学启蒙', '安全过马路', '情绪认知'].forEach((copy) => {
    assert.doesNotMatch(source, new RegExp(copy));
  });
});

test('tablet CSS contracts cover landscape, portrait, safe areas, and touch sizes', () => {
  const css = read('style.css');
  const script = read('script.js');
  assert.match(css, /min-height:\s*100dvh/);
  assert.match(css, /env\(safe-area-inset-(?:top|right|bottom|left)\)/);
  assert.doesNotMatch(css, /width:\s*min\(100%,\s*430px\)/);
  assert.match(css, /@media\s*\(orientation:\s*landscape\)[\s\S]*?\.detail-learning-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(24rem,\s*1fr\)/);
  assert.match(css, /@media\s*\(orientation:\s*portrait\)[\s\S]*?\.detail-learning-grid[\s\S]*?grid-template-columns:\s*1fr/);
  assert.match(script, /class="video-shell"[\s\S]*?class="guidance-card subtitle-card"/);
  assert.match(css, /\.option-copy\s*\{[\s\S]*?min-height:\s*4\.5rem/);
  assert.match(css, /\.tab-button[\s\S]*?min-height:\s*4\.75rem/);
  assert.match(css, /\.level-node\s*\{[\s\S]*?display:\s*inline-grid[\s\S]*?place-items:\s*center/);
  assert.match(css, /\.current \.node-icon\s*\{[\s\S]*?animation:\s*play-button-pop/);
  assert.match(css, /\.map-topbar\s*\{/);
  assert.match(css, /\.map-locate-btn\s*\{[\s\S]*?width:\s*3rem[\s\S]*?height:\s*3rem[\s\S]*?min-width:\s*44px[\s\S]*?min-height:\s*44px/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.map-locate-btn\s*\{[^}]*width:\s*2\.75rem[^}]*height:\s*2\.75rem/);
  assert.match(css, /\.map-locate-btn svg circle\s*\{[\s\S]*?fill:\s*var\(--focus\)/);
  assert.match(css, /\.resource-strip\s*\{/);
  assert.match(css, /\.route-scroll\s*\{[\s\S]*?overflow-x:\s*auto/);
  assert.match(css, /\.ocean-loop\s*\{[\s\S]*?pointer-events:\s*none/);
  assert.match(css, /\.flying-seagull\s*\{[\s\S]*?pointer-events:\s*none/);
  assert.match(css, /\.flying-seagull,[\s\S]*?\.flying-seagull-pair\s*\{[\s\S]*?z-index:\s*4/);
  assert.match(css, /\.flying-seagull\s*\{[\s\S]*?right:\s*-7rem[\s\S]*?width:\s*clamp\(4rem,\s*7vw,\s*6\.5rem\)/);
  assert.match(css, /\.flying-seagull-pair img\s*\{[\s\S]*?width:\s*58%/);
  assert.match(css, /\.flying-seagull-pair img:last-child\s*\{[\s\S]*?width:\s*36%[\s\S]*?margin-top:\s*clamp\(1\.8rem,\s*2\.4vw,\s*2\.4rem\)/);
  assert.match(css, /@keyframes\s+seagull-cross/);
  assert.match(css, /@keyframes\s+seagull-pair-cross[\s\S]*?scale\(0\.46\)[\s\S]*?scale\(0\.94\)/);
  assert.match(script, /animationiteration[\s\S]*?randomizeSeagullFlight/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.flying-seagull-pair\s*\{\s*display:\s*none/);
  assert.match(css, /scroll-snap-type:\s*x mandatory/);
  assert.match(css, /touch-action:\s*pan-x/);
  assert.match(css, /\.route-ocean\s*\{[\s\S]*?front-ocean-bg-v2-libtv\.webp/);
  assert.match(css, /\.route-ocean\s*\{[\s\S]*?container-type:\s*inline-size/);
  assert.match(css, /--level-stop-width:\s*min\(50cqw,\s*42rem\)/);
  assert.match(css, /\.island-art\s*\{[\s\S]*?background:\s*var\(--island-image\) center \/ contain no-repeat/);
  assert.doesNotMatch(css, /\.level-stop:has\(\.locked\) \.island-art\s*\{[\s\S]*?grayscale/);
  assert.match(script, /status === 'locked' \|\| status === 'premium' \? icons\.islandLock : ''/);
  assert.match(css, /\.island-lock\s*\{[\s\S]*?width:\s*clamp\(5\.75rem,\s*8\.5vw,\s*7rem\)[\s\S]*?border-radius:\s*50%[\s\S]*?background:\s*radial-gradient[\s\S]*?pointer-events:\s*none/);
  assert.match(css, /\.level-stop:not\(\.is-centered\) \.island-art\s*\{[\s\S]*?opacity:\s*0\.88/);
  assert.doesNotMatch(css.match(/\.island-art\s*\{([^}]*)\}/)?.[1] ?? '', /mask-image:/);
  assert.match(css, /\.level-stop\.is-centered \.island-art\s*\{[\s\S]*?scale\(1\.06\)/);
  assert.match(css, /@keyframes\s+island-jelly-pop[\s\S]*?scaleX\(1\.075\)[\s\S]*?scaleY\(1\.075\)/);
  assert.match(css, /\.level-stop\.is-centered \.island-art\s*\{[\s\S]*?island-ocean-float 4\.8s ease-in-out 0\.56s infinite/);
  assert.match(css, /@keyframes\s+island-ocean-float[\s\S]*?translate:\s*0 -0\.55rem/);
  assert.doesNotMatch(script, /scene-island-cutout/);
  assert.match(script, /assets\/islands-v1\/runtime\/island-\$\{islandId\}\.webp/);
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/islands-v1/runtime/island-003.webp')));
  assert.match(css, /\.level-stop\.square-island \.island-art\s*\{[\s\S]*?top:\s*64%[\s\S]*?width:\s*min\(42cqw,\s*32rem\)[\s\S]*?aspect-ratio:\s*1[\s\S]*?-webkit-mask-image:\s*linear-gradient\([\s\S]*?#000 0 62%[\s\S]*?transparent 98%/);
  assert.match(script, /navigator\.vibrate\?\.\(30\)/);
  assert.match(script, /createOscillator\(\)/);
  assert.doesNotMatch(css, /background-attachment:\s*fixed/);
});

test('map-locate-btn inside route-ocean absolute with visible label', () => {
  const css = read('style.css');
  const script = read('script.js');

  // 1) position: absolute inside route-ocean, not fixed (must NOT be fixed within its own block)
  assert.match(css, /\.map-locate-btn\s*\{[^}]*?position:\s*absolute[^}]*?\}/);
  assert.doesNotMatch(css, /\.map-locate-btn\s*\{[^}]*?position:\s*fixed[^}]*?\}/);

  // 2) Proper z-index (above ocean but below dialog)
  assert.match(css, /\.map-locate-btn\s*\{[^}]*?z-index:\s*5/);

  // 3) Positioned at top-right of ocean container
  assert.match(css, /\.map-locate-btn\s*\{[^}]*?top:\s*clamp/);
  assert.match(css, /\.map-locate-btn\s*\{[^}]*?right:\s*clamp/);

  // 4) data-current-level attribute in HTML for ::after label
  assert.match(script, /data-current-level=/);

  // 5) ::after label shows "第 N 关" text
  assert.match(css, /\.map-locate-btn::after\s*\{[^}]*?content:\s*\"第[\s\S]*?关\"/);

  // 6) Hit area ≥44px preserved
  assert.match(css, /\.map-locate-btn\s*\{[^}]*?min-width:\s*44px[^}]*?min-height:\s*44px/);

  // 7) focus-visible and aria unchanged
  assert.match(css, /\.map-locate-btn:focus-visible\s*\{[^}]*?outline:\s*3px\s+solid\s+var\(--mint\);\s*outline-offset:\s*3px/);
  assert.match(script, /aria-label="定位到第/);
  assert.match(script, /title="定位到当前关卡/);
});

test('all levels reuse only the five approved natural square-island styles', () => {
  const catalogFile = path.join(__dirname, 'assets/islands-v1/catalog.csv');
  assert.ok(fs.existsSync(catalogFile));

  const [header, ...rows] = fs.readFileSync(catalogFile, 'utf8').trim().split('\n');
  assert.equal(header, 'id,unit,theme_en,theme_zh,landmark,profile,shoreline,palette');
  assert.equal(rows.length, 100);

  const records = rows.map((row) => row.split(','));
  assert.equal(new Set(records.map((record) => record[0])).size, 100);
  assert.equal(new Set(records.map((record) => record[2])).size, 100);
  assert.equal(new Set(records.map((record) => record[4])).size, 100);
  assert.equal(records[2][2], 'Ferris Wheel');

  Array.from({ length: 5 }, (_, index) => index + 1).forEach((number) => {
    const asset = path.join(__dirname, `assets/islands-v1/runtime/island-${String(number).padStart(3, '0')}.webp`);
    assert.ok(fs.existsSync(asset));
    assert.ok(fs.statSync(asset).size < 600_000);
  });

  assert.deepEqual([1, 5, 6, 10, 11, 100].map(islandStyleId), [1, 5, 1, 5, 1, 5]);
  const source = read('script.js');
  assert.match(source, /assets\/islands-v1\/runtime\/island-\$\{islandId\}\.webp/);
  assert.match(source, /const islandId = String\(islandStyleId\(level\.id\)\)/);
  assert.match(source, /class="level-stop square-island"/);
  assert.doesNotMatch(source, /level\.id <= 10 \? ' square-island' : ''/);
  assert.doesNotMatch(source, /scene-island-cutout/);

  const css = read('style.css');
  assert.match(css, /\.level-stop\.square-island \.island-art\s*\{[\s\S]*?top:\s*64%[\s\S]*?aspect-ratio:\s*1/);
});

test('island words can be heard and learning states use child-readable icons', () => {
  const source = read('script.js');
  const css = read('style.css');

  assert.match(source, /data-speak-word="\$\{level\.title\}"/);
  assert.match(source, /aria-label="播放 \$\{level\.title\} 发音"/);
  assert.match(source, /new SpeechSynthesisUtterance\(word\)/);
  assert.match(source, /speechSynthesis\.cancel\(\)/);
  assert.match(source, /speechSynthesis\.speak\(utterance\)/);
  assert.match(source, /utterance\.lang = 'en-US'/);
  assert.match(source, /confirmIslandSwitch[\s\S]*?playWordPronunciation/);
  assert.match(source, /level-state-icon[\s\S]*?state-completed/);
  assert.match(source, /level-state-icon[\s\S]*?state-current/);
  assert.match(css, /\.word-audio-button\s*\{[\s\S]*?width:\s*3\.75rem[\s\S]*?height:\s*3\.75rem/);
  assert.match(css, /@keyframes\s+word-audio-jelly[\s\S]*?scaleX\(1\.18\)[\s\S]*?scaleY\(1\.16\)/);
  assert.match(css, /\.level-state-icon\s*\{[\s\S]*?width:\s*2\.35rem[\s\S]*?height:\s*2\.35rem/);
});

test('level-node buttons centered above each island — yellow circle centre matches .level-stop centre, play badge overflows', () => {
  const css = read('style.css');

  // 1) Level node must be horizontally centered: left: 50%, not right-aligned
  assert.match(css, /\.level-node\s*\{[\s\S]*?left:\s*50%[\s\S]*?\}/);
  assert.match(css, /\.level-node\s*\{[\s\S]*?transform:\s*translateX\(-50%\)/);

  // 2) Old right-aligned position must NOT exist
  assert.doesNotMatch(css, /\.level-node\s*\{[^}]*?right:\s*0?\.?5rem[^}]*?\}/);

  // 3) No fixed width/height on level-node — it auto-sizes to level-number only.
  //    Since .node-icon is position:absolute, it is out of flow and does NOT
  //    inflate the button box.  The yellow circle centre therefore equals the
  //    button centre = .level-stop centre.
  assert.doesNotMatch(css, /\.level-node\s*\{[\s\S]*?min-width:\s*6\.25rem/);
  assert.doesNotMatch(css, /\.level-node\s*\{[\s\S]*?\bwidth:\s*6\.25rem\b/);
  assert.doesNotMatch(css, /\.level-node\s*\{[\s\S]*?\bheight:\s*6\.25rem\b/);

  // 4) Play badge (.node-icon) is positioned with negative offsets so it
  //    protrudes from the top-right of the yellow circle, never participating
  //    in the centering calculation.
  assert.match(css, /\.node-icon\s*\{[\s\S]*?position:\s*absolute[\s\S]*?top:\s*-0\.35rem[\s\S]*?right:\s*-0\.45rem/);
  assert.match(css, /\.current \.node-icon\s*\{[\s\S]*?top:\s*-0\.55rem[\s\S]*?right:\s*-0\.6rem/);

  // 5) Hover/active/keyframe transforms preserve X centering
  assert.match(css, /\.level-node:hover\s*\{[\s\S]*?transform:\s*translate\(-50%,\s*-2px\)/);
  assert.match(css, /\.level-node:active\s*\{[\s\S]*?transform:\s*translate\(-50%,\s*2px\)/);
  assert.match(css, /@keyframes\s+current-pulse[\s\S]*?translate\(-50%,\s*0\)[\s\S]*?translate\(-50%,\s*-3px\)/);

  // 6) All 100 levels reuse the same .level-node class for completed/current/locked
  assert.match(css, /\.level-node\.completed\s*\{/);
  assert.match(css, /\.level-node\.current\s*\{/);
  assert.match(css, /\.level-node\.locked\s*\{/);
});

test('yellow circle centering is independent of play badge — badge uses negative position offsets, not fixed container width', () => {
  const css = read('style.css');

  // The node-icon MUST use negative offsets to overlap outside the auto-sized
  // level-node, proving it does not enlarge the centering box.
  assert.match(css, /\.node-icon\s*\{[\s\S]*?top:\s*-/);
  assert.match(css, /\.current \.node-icon\s*\{[\s\S]*?top:\s*-/);
});

test('no linear-gradient / radial-gradient remains on the three target circular UI selectors', () => {
  const css = read('style.css');

  // 1) Word-audio pronunciation button — must be pure solid colour
  const wordAudioBlock = css.match(/\.word-audio-button\s*\{[^}]*\}/)?.[0] ?? '';
  assert.doesNotMatch(wordAudioBlock, /gradient/,
    '.word-audio-button must not contain any gradient');
  assert.match(wordAudioBlock, /background:\s*#[A-Fa-f0-9]{6}/,
    '.word-audio-button background must be a solid hex colour');

  // 2) Access-hero premium (payment dialog circular icon) — solid colour
  assert.doesNotMatch(css, /\.access-hero\.premium\s*\{[^}]*gradient/,
    '.access-hero.premium must not contain any gradient');
  assert.match(css, /\.access-hero\.premium\s*\{[^}]*background:\s*#[A-Fa-f0-9]{6}/,
    '.access-hero.premium background must be a solid hex colour');

  // 3) Map-switch dialog hero inline style — solid colour in script.js
  const script = read('script.js');
  const mapSwitchHeroMatch = script.match(/background:[^;]*;/g);
  const hasGradient = mapSwitchHeroMatch?.some(s => /gradient/i.test(s)) ?? false;
  assert.equal(hasGradient, false,
    'No inline background gradient must exist in script.js for map-switch hero');

  // 4) Access-primary-button ("知道了") — already solid, verify
  const primaryBlock = css.match(/\.access-primary-button\s*\{[^}]*\}/)?.[0] ?? '';
  assert.doesNotMatch(primaryBlock, /gradient/,
    '.access-primary-button must not contain any gradient');

  // 5) Island-lock is an art-layer lock icon (part of island visual), NOT part of
  //    the three target circular UI components; its gradient is left intact.
});

test('hover/active/pulse states on target circles do not reintroduce gradients', () => {
  const css = read('style.css');

  // Hover/pulse on level-node should only affect transform, not background
  assert.match(css, /\.level-node:hover\s*\{[^}]*transform:\s*translate\(-50%/);
  assert.doesNotMatch(css, /\.level-node:hover\s*\{[^}]*background-image/);

  // Word-audio-button hover/active — check there's no gradient
  // (the button only has :active, no :hover — but check pseudo-elements)
  const fullCss = css;
  assert.doesNotMatch(fullCss, /\.word-audio-button:active\s*\{[^}]*gradient/);

  // Access-primary-button states are solid
  assert.doesNotMatch(fullCss, /\.access-primary-button:active\s*\{[^}]*gradient/);
});

// ─── 豆包 TTS 预录 · 本地 MP3 接入 ──────────────────────

test('word-audio manifest exists and has V2 valid structure', () => {
  const manifestPath = path.join(__dirname, 'assets', 'audio', 'words', 'word-audio-manifest.json');
  assert.ok(fs.existsSync(manifestPath));

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.version, '2.0');
  assert.equal(manifest.model, '豆包语音合成模型2.0');
  assert.ok(manifest.speaker.includes('hayley'), 'Must use Hayley speaker');
  assert.equal(manifest.audio_format, 'mp3');
  assert.equal(manifest.sample_rate, 24000);
  assert.ok(Array.isArray(manifest.entries));
  assert.equal(manifest.entries.length, 100, 'Must have all 100 unique words');
  assert.ok(typeof manifest.summary === 'object');
  assert.ok(typeof manifest.summary.total === 'number');
  assert.equal(manifest.summary.total, 100);
  assert.ok(typeof manifest.summary.generated === 'number');
  assert.ok(typeof manifest.summary.skipped === 'number');
  assert.ok(typeof manifest.summary.available === 'number');
  assert.equal(manifest.summary.available, manifest.summary.generated + manifest.summary.skipped);
  assert.ok(typeof manifest.summary.failed === 'number');
  assert.ok(typeof manifest.summary.levels === 'number');
  assert.equal(manifest.summary.levels, 100);
  assert.ok(typeof manifest.summary.speaker === 'string');

  manifest.entries.forEach((entry) => {
    assert.ok(typeof entry.word === 'string');
    assert.ok(Array.isArray(entry.level_ids), 'Must have level_ids array');
    assert.ok(entry.level_ids.length >= 1, 'Must have at least 1 level_id');
    assert.ok(typeof entry.level_count === 'number');
    assert.ok(typeof entry.zh === 'string');
    assert.ok(typeof entry.url === 'string');
    assert.ok(entry.url.startsWith('assets/audio/words/'));
    assert.ok(entry.url.endsWith('.mp3'));
    assert.ok(typeof entry.cache_key === 'string', 'Must have cache_key');
    assert.ok(entry.cache_key.includes(manifest.speaker), 'cache_key must include speaker');
    assert.ok(['generated', 'pending', 'failed', 'not_attempted'].includes(entry.status));
    if (entry.status === 'generated') {
      assert.ok(entry.size_bytes > 0);
      const mp3File = path.join(__dirname, entry.url);
      assert.ok(fs.existsSync(mp3File));
      assert.equal(fs.statSync(mp3File).size, entry.size_bytes);
    }
  });
});

test('manifest contains all 100 unique words with correct level mapping', () => {
  const manifest = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'assets', 'audio', 'words', 'word-audio-manifest.json'), 'utf8'));

  const expectedFirst10 = [
    { word: 'hello', level_ids: [1] },
    { word: 'red', level_ids: [2] },
    { word: 'flower', level_ids: [3] },
    { word: 'bye', level_ids: [4] },
    { word: 'yes', level_ids: [5] },
    { word: 'no', level_ids: [6] },
    { word: 'please', level_ids: [7] },
    { word: 'thanks', level_ids: [8] },
    { word: 'friend', level_ids: [9] },
    { word: 'happy', level_ids: [10] },
  ];

  assert.equal(manifest.entries.length, 100, 'Must have all 100 words');

  // Check first 10
  expectedFirst10.forEach((expected, index) => {
    assert.equal(manifest.entries[index].word, expected.word);
    assert.deepEqual(manifest.entries[index].level_ids, expected.level_ids);
  });

  // Check last 3
  assert.equal(manifest.entries[97].word, 'shoes');
  assert.deepEqual(manifest.entries[97].level_ids, [98]);
  assert.equal(manifest.entries[98].word, 'bath');
  assert.deepEqual(manifest.entries[98].level_ids, [99]);
  assert.equal(manifest.entries[99].word, 'good night');
  assert.deepEqual(manifest.entries[99].level_ids, [100]);

  // Verify all level IDs 1-100 are covered exactly once
  const allIds = manifest.entries.flatMap(e => e.level_ids).sort((a, b) => a - b);
  assert.deepEqual(allIds, Array.from({ length: 100 }, (_, i) => i + 1));
});

test('script.js loads word-audio manifest and prefers local MP3 over speechSynthesis', () => {
  const source = read('script.js');

  // Must reference manifest loading
  assert.match(source, /word-audio-manifest\.json/);
  assert.match(source, /loadWordAudioManifest\(\)/);
  assert.match(source, /wordAudioMap/);

  // Must prefer local URL before speechSynthesis
  assert.match(source, /localUrl = wordAudioMap\[/);
  assert.match(source, /优先本地 MP3/);

  // Must create Audio element for local playback
  assert.match(source, /new Audio\(\)/);
  assert.match(source, /localAudioEl\.play/);

  // Must duck BGM for local audio
  assert.match(source, /mapMusic\.volume = 0\.12/);

  // Must cancel local audio on cancelWordPronunciation
  assert.match(source, /localAudioEl\.pause\(\)/);
  assert.match(source, /localAudioEl\.currentTime = 0/);

  // Must still have speechSynthesis fallback
  assert.match(source, /speechSynthesis\.speak\(utterance\)/);
  assert.match(source, /new SpeechSynthesisUtterance\(word\)/);
});

test('word-audio button disabled only when both speechSynthesis and local MP3 are unavailable', () => {
  const localAudioUrls = { hello: 'assets/audio/words/hello.mp3', red: 'assets/audio/words/red.mp3' };

  // pronunciationAvailable=true → never disabled, regardless of local audio
  assert.equal(wordButtonDisabled('hello', true, localAudioUrls), false);
  assert.equal(wordButtonDisabled('hello', true, {}), false);
  assert.equal(wordButtonDisabled('flower', true, localAudioUrls), false);
  assert.equal(wordButtonDisabled('flower', true, {}), false);

  // pronunciationAvailable=false → disabled ONLY when word lacks local MP3
  assert.equal(wordButtonDisabled('hello', false, localAudioUrls), false);   // has local → enabled
  assert.equal(wordButtonDisabled('red', false, localAudioUrls), false);     // has local → enabled
  assert.equal(wordButtonDisabled('flower', false, localAudioUrls), true);   // no local → disabled
  assert.equal(wordButtonDisabled('bye', false, localAudioUrls), true);      // no local → disabled

  // Edge cases
  assert.equal(wordButtonDisabled('', true, localAudioUrls), true);          // empty word → disabled
  assert.equal(wordButtonDisabled(null, true, localAudioUrls), true);        // null word → disabled
  assert.equal(wordButtonDisabled(undefined, true, localAudioUrls), true);   // undefined word → disabled
  assert.equal(wordButtonDisabled('Hello', false, localAudioUrls), false);   // case-insensitive match
  assert.equal(wordButtonDisabled('HELLO', false, localAudioUrls), false);   // case-insensitive match
});

test('word-audio button disabled logic is wired into source rendering with manifest fallback', () => {
  const source = read('script.js');

  // wordButtonDisabled pure function exported for testing
  assert.match(source, /function wordButtonDisabled\(/);
  assert.match(source, /module\.exports.*wordButtonDisabled/);

  // renderMap template uses dual-condition check (pronunciationAvailable OR wordHasLocalAudio)
  assert.match(source, /pronunciationAvailable \|\| wordHasLocalAudio\(level\.title\)/);

  // wordHasLocalAudio bridges runtime wordAudioMap with the pure decision
  assert.match(source, /function wordHasLocalAudio\(/);

  // manifest load callback updates ALL buttons after async fetch
  assert.match(source, /document\.querySelectorAll\('\[data-speak-word\]'\)\.forEach/);
  assert.match(source, /pronunciationAvailable && !wordHasLocalAudio/);

  // playWordPronunciation still falls back to speechSynthesis for non-local words
  assert.match(source, /if \(!word\) return false/);
  assert.match(source, /降级.*speechSynthesis/);
  assert.match(source, /new Audio\(\)/);
  assert.match(source, /localAudioEl\.play/);
  assert.match(source, /mapMusic\.volume = 0\.12/);
  assert.match(source, /localAudioEl\.pause\(\)/);
});

test('generator script is idempotent and credential-safe', () => {
  const genScript = path.join(__dirname, 'backend', 'src', 'generate-tts.js');
  assert.ok(fs.existsSync(genScript));

  const source = fs.readFileSync(genScript, 'utf8');

  // Must read all credentials from env, no hardcoded values
  assert.match(source, /process\.env\.DOUBAO_APP_ID/);
  assert.match(source, /process\.env\.DOUBAO_TOKEN/);
  assert.match(source, /process\.env\.DOUBAO_VOICE_TYPE/);

  // Must NOT contain any real-seeming API keys or tokens
  assert.doesNotMatch(source, /([A-Za-z0-9_+/]{30,}={0,2})/);

  // Must have idempotency check
  assert.match(source, /fileExistsAndValid/);
  assert.match(source, /已存在/);

  // Must have retry logic
  assert.match(source, /MAX_RETRIES/);
  assert.match(source, /RETRY_DELAYS_MS/);

  // Must handle missing credentials gracefully
  assert.match(source, /checkCredentials/);
  assert.match(source, /凭据未配置/);
  assert.match(source, /占位/);

  // Must use temp file + atomic rename for manifest persistence
  assert.match(source, /\.tmp\./);
  assert.match(source, /fs\.renameSync/);
  assert.match(source, /fs\.unlinkSync\(tmpPath\)/);

  // Must clean up stale temp files from previous interrupted runs
  assert.match(source, /startsWith\('word-audio-manifest\.json\.tmp\.'\)/);
  assert.match(source, /残留/);

  // Summary semantics: generated=新生成, skipped=已存在, available=有效总数
  assert.match(source, /summary\.available = summary\.generated \+ summary\.skipped/);

  // V1 auth: body app.token is NON-sensitive placeholder; Authorization header still uses real TOKEN
  assert.match(source, /app:\s*\{[\s\S]*?token:\s*'not_used'/);
  assert.match(source, /Authorization.*Bearer.*\$\{TOKEN\}/);
});

test('word-audio manifest shows all 100 words generated with V3 Hayley speaker', () => {
  // The manifest was generated by generate-word-audio-v2.js with V3 Hayley voice
  const manifest = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'assets', 'audio', 'words', 'word-audio-manifest.json'), 'utf8'));

  assert.equal(manifest.version, '2.0');
  assert.equal(manifest.summary.total, 100);
  assert.equal(manifest.summary.available, 100);
  assert.equal(manifest.summary.failed, 0);
  assert.equal(manifest.summary.levels, 100);
  assert.ok(manifest.summary.generated + manifest.summary.skipped === 100);

  // All entries should be generated with valid MP3 files
  manifest.entries.forEach((entry) => {
    assert.equal(entry.status, 'generated');
    assert.ok(entry.size_bytes > 0);
    assert.ok(entry.cache_key.includes(manifest.speaker));
    const mp3File = path.join(__dirname, entry.url);
    assert.ok(fs.existsSync(mp3File));
    assert.equal(fs.statSync(mp3File).size, entry.size_bytes);
  });
});

// ─── 豆包美式英语音色试听库 · 生成脚本与清单 ────────────

test('voice-samples generator script exists and is credential-safe', () => {
  const genScript = path.join(__dirname, 'backend', 'src', 'generate-voice-samples.js');
  assert.ok(fs.existsSync(genScript));

  const source = fs.readFileSync(genScript, 'utf8');

  // Must read credentials from env, not hardcoded
  assert.match(source, /process\.env\.DOUBAO_APP_ID/);
  assert.match(source, /process\.env\.DOUBAO_TOKEN/);

  // Must NOT contain any real-seeming API keys or tokens (40+ char base64-like strings, no underscore)
  // Note: voice_type names like en_female_candice_emo_v2_mars_bigtts use underscores so excluded
  assert.doesNotMatch(source, /([A-Za-z0-9+/]{40,}={0,2})/);

  // Must have idempotency check
  assert.match(source, /fileExistsAndValid/);
  assert.match(source, /已存在/);

  // Must have retry logic
  assert.match(source, /MAX_RETRIES/);

  // Must handle missing credentials gracefully
  assert.match(source, /checkCredentials/);
  assert.match(source, /凭据未配置/);

  // Must use temp file + atomic rename for manifest
  assert.match(source, /\.tmp\./);
  assert.match(source, /fs\.renameSync/);

  // Must sanitize errors before manifest output
  assert.match(source, /sanitizeError/);

  // Must define all 23 voice types across three categories
  assert.match(source, /VOICES\s*=\s*\[/);
  // Count voiceType: '...' — each voice definition has exactly one, plus one usage in makeTtsRequest
  const voiceCount = (source.match(/voiceType:\s*'/g) || []).length;
  assert.equal(voiceCount, 23, `Expected 23 voice definitions, found ${voiceCount}`);

  // Must define A. small model voices (BVxxx_streaming)
  assert.match(source, /小模型 V1/);
  assert.match(source, /BV511_streaming/);
  assert.match(source, /BV505_streaming/);
  assert.match(source, /BV138_streaming/);
  assert.match(source, /BV027_streaming/);
  assert.match(source, /BV502_streaming/);
  assert.match(source, /BV503_streaming/);
  assert.match(source, /BV504_streaming/);
  assert.match(source, /BV506_streaming/);
  assert.match(source, /BV421_streaming/);
  assert.match(source, /BV702_streaming/);

  // Must define B. big model voices (en_female_xxx_bigtts / zh_female_xxx_bigtts)
  assert.match(source, /大模型 1\.0/);
  assert.match(source, /en_female_candice/);
  assert.match(source, /en_female_skye/);
  assert.match(source, /en_female_nadia/);
  assert.match(source, /en_male_glen/);
  assert.match(source, /en_male_sylus/);
  assert.match(source, /en_male_corey/);
  assert.match(source, /zh_female_cancan/);
  assert.match(source, /zh_female_shuangkuaisisi/);
  assert.match(source, /zh_male_wennuanahu/);
  assert.match(source, /zh_male_shaonianzixin/);

  // Must define C. candidate voices
  assert.match(source, /候选/);
  assert.match(source, /en_female_lauren_moon_bigtts/);
  assert.match(source, /en_female_amanda_mars_bigtts/);
  assert.match(source, /en_male_jackson_mars_bigtts/);

  // Big model voices should not send pitch_ratio
  assert.match(source, /noPitchRatio/);

  // Must use proper V1 endpoint
  assert.match(source, /openspeech\.bytedance\.com\/api\/v1\/tts/);
  assert.match(source, /Authorization.*Bearer/);

  // V1 auth: body app.token is NON-sensitive placeholder; Authorization header still uses real TOKEN
  assert.match(source, /app:\s*\{[\s\S]*?token:\s*'not_used'/);
  assert.match(source, /Authorization.*Bearer.*\$\{TOKEN\}/);
});

test('voice-samples manifest exists and has correct structure', () => {
  const manifestPath = path.join(__dirname, 'assets', 'audio', 'voice-samples', 'voice-samples-manifest.json');
  assert.ok(fs.existsSync(manifestPath));

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.version, '1.0');
  assert.ok(typeof manifest.sample_text === 'string');
  assert.equal(manifest.audio_format, 'mp3');
  assert.ok(Array.isArray(manifest.entries));
  assert.equal(manifest.entries.length, 23, 'Must have 23 voice entries');

  // Verify summary structure
  assert.ok(typeof manifest.summary === 'object');
  assert.equal(manifest.summary.total, 23);
  assert.ok(typeof manifest.summary.generated === 'number');
  assert.ok(typeof manifest.summary.skipped === 'number');
  assert.ok(typeof manifest.summary.available === 'number');
  assert.ok(typeof manifest.summary.failed === 'number');
  assert.equal(manifest.summary.available, manifest.summary.generated + manifest.summary.skipped);

  // Verify category breakdowns
  assert.ok(typeof manifest.summary.small_model === 'object');
  assert.equal(manifest.summary.small_model.total, 10);
  assert.ok(typeof manifest.summary.big_model === 'object');
  assert.equal(manifest.summary.big_model.total, 10);
  assert.ok(typeof manifest.summary.candidate === 'object');
  assert.equal(manifest.summary.candidate.total, 3);

  // Verify each entry has required fields
  manifest.entries.forEach((entry) => {
    assert.ok(typeof entry.voice_type === 'string');
    assert.ok(typeof entry.name === 'string');
    assert.ok(typeof entry.category === 'string');
    assert.ok(typeof entry.status === 'string');
    assert.ok(typeof entry.url === 'string');
    assert.ok(entry.url.startsWith('assets/audio/voice-samples/'));
    assert.ok(entry.url.endsWith('.mp3'));
    assert.ok(typeof entry.sample_text === 'string');
    assert.ok(['generated', 'failed', 'pending', 'skipped'].includes(entry.status));
    // Must have error_sanitized (not raw credentials)
    assert.ok(entry.hasOwnProperty('error_sanitized'));
    // error_sanitized must not contain raw credentials
    if (entry.error_sanitized) {
      assert.doesNotMatch(entry.error_sanitized, /AJs67w4J/);
      assert.doesNotMatch(entry.error_sanitized, /2554981680/);
    }
  });

  // Verify all 23 specific voice_types are present
  const voiceTypes = manifest.entries.map(e => e.voice_type);
  const expectedTypes = [
    'BV511_streaming', 'BV505_streaming', 'BV138_streaming', 'BV027_streaming',
    'BV502_streaming', 'BV503_streaming', 'BV504_streaming', 'BV506_streaming',
    'BV421_streaming', 'BV702_streaming',
    'en_female_candice_emo_v2_mars_bigtts', 'en_female_skye_emo_v2_mars_bigtts',
    'en_female_nadia_tips_emo_v2_mars_bigtts', 'en_male_glen_emo_v2_mars_bigtts',
    'en_male_sylus_emo_v2_mars_bigtts', 'en_male_corey_emo_v2_mars_bigtts',
    'zh_female_cancan_mars_bigtts', 'zh_female_shuangkuaisisi_moon_bigtts',
    'zh_male_wennuanahu_moon_bigtts', 'zh_male_shaonianzixin_moon_bigtts',
    'en_female_lauren_moon_bigtts', 'en_female_amanda_mars_bigtts',
    'en_male_jackson_mars_bigtts',
  ];
  expectedTypes.forEach((vt) => {
    assert.ok(voiceTypes.includes(vt), `Missing voice_type: ${vt}`);
  });

  // Verify category assignments
  manifest.entries.forEach((entry) => {
    if (entry.voice_type.startsWith('BV')) {
      assert.equal(entry.category, '小模型 V1');
    } else if (entry.official === 'candidate') {
      assert.equal(entry.category, '候选');
    } else {
      assert.equal(entry.category, '大模型 1.0');
    }
  });
});

test('voice-samples generator script produces correct summary when run without credentials', () => {
  const manifest = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'assets', 'audio', 'voice-samples', 'voice-samples-manifest.json'), 'utf8'));

  assert.equal(manifest.summary.total, 23);

  // All entries must have a status (whatever that status is)
  manifest.entries.forEach((entry) => {
    assert.ok(['generated', 'failed', 'pending'].includes(entry.status));
  });
});

test('voice-samples audition page exists with required structure', () => {
  const htmlPath = path.join(__dirname, 'voice-samples.html');
  assert.ok(fs.existsSync(htmlPath));

  const html = fs.readFileSync(htmlPath, 'utf8');

  // Must be HTML
  assert.match(html, /<html/);
  assert.match(html, /lang="zh-CN"/);

  // Must have Chinese title
  assert.match(html, /豆包美式英语音色试听库/);

  // Must have three category sections
  assert.match(html, /小模型 V1/);
  assert.match(html, /大模型 1\.0/);
  assert.match(html, /候选/);

  // Must use native <audio> controls
  assert.match(html, /<audio controls preload="metadata"/);

  // Must have filter checkbox
  assert.match(html, /只显示已生成/);

  // Must have pause all button
  assert.match(html, /全部暂停/);

  // Must load manifest from relative path
  assert.match(html, /voice-samples-manifest\.json/);

  // Must handle failed/pending states
  assert.match(html, /failed/);
  assert.match(html, /占位/);

  // Must support responsive layout
  assert.match(html, /@media/);
  assert.match(html, /grid-template-columns/);

  // Must NOT contain any credential patterns
  assert.doesNotMatch(html, /AJs67w4J/);
  assert.doesNotMatch(html, /2554981680/);
  assert.doesNotMatch(html, /your_access_token/);
});

// ─── V1 鉴权契约：body app.token 为占位，真实凭据仅在 Header ──

test('V1 auth: both generator scripts send placeholder in body.token and real token in Authorization header', () => {
  for (const scriptPath of [
    'backend/src/generate-tts.js',
    'backend/src/generate-voice-samples.js',
  ]) {
    const source = fs.readFileSync(path.join(__dirname, scriptPath), 'utf8');

    // body JSON has app.token='not_used' (placeholder, not the TOKEN variable)
    assert.match(source, /app:\s*\{[\s\S]*?token:\s*'not_used'/,
      `${scriptPath}: body app.token must be literal 'not_used' placeholder`);

    // Authorization header still interpolates the real TOKEN variable
    assert.match(source, /Authorization.*Bearer;.*\$\{TOKEN\}/,
      `${scriptPath}: Authorization header must use \${TOKEN} variable`);

    // The TOKEN variable MUST still be read from environment (for the header)
    assert.match(source, /process\.env\.DOUBAO_TOKEN/,
      `${scriptPath}: TOKEN must still be read from env`);

    // Body MUST NOT reference TOKEN variable in the app.token position
    const appBlock = source.match(/app:\s*\{[^}]+token:\s*([^,}]+)/);
    if (appBlock) {
      assert.doesNotMatch(appBlock[1], /TOKEN/,
        `${scriptPath}: app.token must NOT reference TOKEN variable`);
    }
  }
});

// ─── JS Manifest (file:// 兼容注入) ───────────────────────

test('word-audio-manifest.js exists and sets window.WORD_AUDIO_MANIFEST', () => {
  const jsPath = path.join(__dirname, 'assets', 'audio', 'words', 'word-audio-manifest.js');
  assert.ok(fs.existsSync(jsPath), 'JS manifest must exist');

  const content = fs.readFileSync(jsPath, 'utf8');
  assert.match(content, /^window\.WORD_AUDIO_MANIFEST\s*=\s*\{/, 'Must start with window.WORD_AUDIO_MANIFEST = {');
  assert.match(content, /;\n$/, 'Must end with semicolon and newline');

  // Must contain enough entries to pass the 100-word check
  assert.ok(content.includes('"hello"'), 'Must contain hello entry');
  assert.ok(content.includes('"good_night.mp3"') || content.includes('"good night"'), 'Must contain last word');
});

test('JS manifest and JSON manifest have same 100 entries with same URLs', () => {
  const jsPath = path.join(__dirname, 'assets', 'audio', 'words', 'word-audio-manifest.js');
  const jsonPath = path.join(__dirname, 'assets', 'audio', 'words', 'word-audio-manifest.json');

  const jsonManifest = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const jsContent = fs.readFileSync(jsPath, 'utf8');
  const jsMatch = jsContent.match(/window\.WORD_AUDIO_MANIFEST\s*=\s*(\{[\s\S]*?});?\n?$/);
  assert.ok(jsMatch, 'Cannot extract JS manifest object');
  const jsManifest = JSON.parse(jsMatch[1]);

  // Same entry count
  assert.equal(jsManifest.entries.length, jsonManifest.entries.length,
    'Both manifests must have same number of entries');
  assert.equal(jsManifest.entries.length, 100, 'Must have 100 entries');

  // Same URLs for each word
  const jsByWord = {};
  jsManifest.entries.forEach(e => { jsByWord[e.word] = e.url; });
  const jsonByWord = {};
  jsonManifest.entries.forEach(e => { jsonByWord[e.word] = e.url; });

  Object.keys(jsByWord).sort().forEach((word) => {
    assert.equal(jsByWord[word], jsonByWord[word],
      `URL mismatch for word "${word}": JS="${jsByWord[word]}" vs JSON="${jsonByWord[word]}"`);
  });

  // Same version and speaker metadata
  assert.equal(jsManifest.version, jsonManifest.version);
  assert.equal(jsManifest.speaker, jsonManifest.speaker);
  assert.equal(jsManifest.voice_type, jsonManifest.voice_type);
});

test('JS manifest summary matches JSON summary (key fields)', () => {
  const jsPath = path.join(__dirname, 'assets', 'audio', 'words', 'word-audio-manifest.js');
  const jsonPath = path.join(__dirname, 'assets', 'audio', 'words', 'word-audio-manifest.json');

  const jsonManifest = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const jsContent = fs.readFileSync(jsPath, 'utf8');
  const jsMatch = jsContent.match(/window\.WORD_AUDIO_MANIFEST\s*=\s*(\{[\s\S]*?});?\n?$/);
  const jsManifest = JSON.parse(jsMatch[1]);

  assert.equal(jsManifest.summary.total, jsonManifest.summary.total);
  assert.equal(jsManifest.summary.available, jsonManifest.summary.available);
  assert.equal(jsManifest.summary.levels, jsonManifest.summary.levels);
  assert.equal(jsManifest.summary.speaker, jsonManifest.summary.speaker);
  assert.equal(jsManifest.summary.total, 100);
  assert.equal(jsManifest.summary.levels, 100);
});

test('JS manifest does not contain credentials', () => {
  const jsContent = fs.readFileSync(
    path.join(__dirname, 'assets', 'audio', 'words', 'word-audio-manifest.js'), 'utf8');

  assert.doesNotMatch(jsContent, /access_key/i, 'JS manifest must not contain access_key');
  assert.doesNotMatch(jsContent, /app_id/i, 'JS manifest must not contain app_id');
  assert.doesNotMatch(jsContent, /token/i, 'JS manifest must not contain token');
  assert.doesNotMatch(jsContent, /auth/i, 'JS manifest must not contain auth');
  assert.doesNotMatch(jsContent, /AJs67w4J/, 'JS manifest must not contain real credentials');
  assert.doesNotMatch(jsContent, /2554981680/, 'JS manifest must not contain real credentials');
});

test('index.html loads JS manifest before script.js', () => {
  const html = read('index.html');

  // Find both script tags in order
  const jsMatch = html.match(/word-audio-manifest\.js/);
  const scriptMatch = html.match(/script\.js/);

  assert.ok(jsMatch, 'index.html must reference word-audio-manifest.js');
  assert.ok(scriptMatch, 'index.html must reference script.js');

  // word-audio-manifest.js must appear before script.js in the file
  const jsIndex = html.indexOf('word-audio-manifest.js');
  const scriptIndex = html.indexOf('script.js');
  assert.ok(jsIndex < scriptIndex,
    'word-audio-manifest.js must be loaded BEFORE script.js');
});

test('script.js reads window.WORD_AUDIO_MANIFEST first (file:// compatibility)', () => {
  const source = read('script.js');

  // Must check window.WORD_AUDIO_MANIFEST before fetch
  assert.match(source, /window\.WORD_AUDIO_MANIFEST/,
    'script.js must check window.WORD_AUDIO_MANIFEST');
  assert.match(source, /优先.*全局.*JS.*manifest/,
    'Must have comment explaining priority JS manifest path');
  assert.match(source, /file:\/\//,
    'Must mention file:// protocol in comment');
  // fetch must still exist for HTTP fallback
  assert.match(source, /word-audio-manifest\.json/,
    'Must still have JSON fetch fallback');
  assert.match(source, /\.catch\(/,
    'Must have catch on fetch');
});

test('script.js fetch failure does NOT clear existing wordAudioMap', () => {
  const source = read('script.js');

  // In the catch handler, there must be no reference to clearing wordAudioMap
  const catchMatch = source.match(/\.catch\(\(\)\s*=>\s*\{[\s\S]*?\}\)/);
  assert.ok(catchMatch, 'Must have fetch catch block');
  assert.doesNotMatch(catchMatch[0], /wordAudioMap\s*=/, 'Catch must not clear wordAudioMap');
  assert.match(catchMatch[0], /file:\/\//, 'Catch must mention file:// scenario');
});

test('playWordPronunciation prefers local Audio over speechSynthesis', () => {
  const source = read('script.js');

  // Must check localUrl first
  assert.match(source, /localUrl = wordAudioMap\[/,
    'Must look up local URL');
  assert.match(source, /if \(localUrl\) \{/,
    'Must have local URL check');
  assert.match(source, /localAudioEl\.play\(\)/,
    'Must play local audio');
  // speechSynthesis must be inside the else (fallback) block
  const localBlock = source.match(/if \(localUrl\) \{[\s\S]*?\n  \}/);
  assert.ok(localBlock, 'Must have local URL block');
  assert.match(source, /降级[^]*speechSynthesis/,
    'Must have speechSynthesis fallback with comment');
});

test('generator exports generateJsManifestContent and produces valid output', () => {
  const { generateJsManifestContent, extractWordEntries, cacheKey } = require('./backend/src/generate-word-audio-v2.js');

  const entries = extractWordEntries();
  const mockManifest = {
    version: '2.0',
    generated_at: new Date().toISOString(),
    speaker: 'en_female_hayley_uranus_bigtts',
    voice_type: 'en_female_hayley_uranus_bigtts',
    audio_format: 'mp3',
    sample_rate: 24000,
    entries: entries.map((e) => ({
      word: e.word,
      level_ids: e.level_ids,
      level_count: e.level_ids.length,
      zh: e.zh,
      unit: e.unit,
      url: 'assets/audio/words/' + e.word.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.mp3',
      status: 'generated',
      size_bytes: 1024,
      sha256: 'abc123',
      cache_key: cacheKey(e.word),
    })),
    summary: { total: 100, generated: 100, skipped: 0, available: 100, failed: 0, not_attempted: 0, levels: 100, speaker: 'en_female_hayley_uranus_bigtts' },
  };

  const result = generateJsManifestContent(mockManifest);
  assert.match(result, /^window\.WORD_AUDIO_MANIFEST /, 'Must start with window.WORD_AUDIO_MANIFEST');
  assert.match(result, /;\n$/, 'Must end with semicolon + newline');

  // Parse the payload back
  const payloadMatch = result.match(/window\.WORD_AUDIO_MANIFEST = (\{[\s\S]*?});?\n?$/);
  assert.ok(payloadMatch, 'Must contain JSON payload');
  const parsed = JSON.parse(payloadMatch[1]);
  assert.equal(parsed.entries.length, 100, 'Must have 100 entries');
  assert.equal(parsed.summary.total, 100, 'Summary must match');
  assert.equal(parsed.speaker, 'en_female_hayley_uranus_bigtts', 'Speaker must match');
  // SHA256 and cache_key must NOT be in JS manifest
  parsed.entries.forEach((entry) => {
    assert.ok(!entry.sha256, 'JS manifest must NOT contain sha256');
    assert.ok(!entry.cache_key, 'JS manifest must NOT contain cache_key');
  });
});

// ─── 紧凑航线进度（5里程碑 SVG 路线）测试 ──────────────────────

test('renderCompactJourney builds 5 compact milestones (20, 40, 60, 80, 100) with SVG path', () => {
  const source = read('script.js');
  assert.match(source, /renderCompactJourney/);
  // 5 milestones at 20/40/60/80/100
  assert.match(source, /msLabels\s*=\s*\[20,\s*40,\s*60,\s*80,\s*100\]/,
    'Must use 5 milestones: [20, 40, 60, 80, 100]');
  // SVG-based journey
  assert.match(source, /<svg.*class="j-svg"/);
  assert.match(source, /j-boat/);
  assert.match(source, /j-treasure/);
});

test('compact journey handles all progress states: zero, mid, and 100/100', () => {
  const source = read('script.js');
  assert.match(source, /allCompleted/);
  // State classes: j-milestone-done / j-milestone-pending
  assert.match(source, /j-milestone-done/);
  assert.match(source, /j-milestone-pending/);
  // Next milestone calculation
  assert.match(source, /nextMilestone/);
  // All-completed badge shown
  assert.match(source, /群岛通关/);
  // Text info: completed count + current level
  assert.match(source, /已完成[\s\S]*?strong[\s\S]*?completed[\s\S]*?\/\s*100/);
  assert.match(source, /下一站/);
});

test('compact journey embedded in map-topbar (journey-header/voyage removed)', () => {
  const source = read('script.js');
  // The old journey-header section is removed
  assert.doesNotMatch(source, /journey-header[\s\S]*?journey-voyage[\s\S]*?<\/section>/);
  assert.doesNotMatch(source, /journey-header surface/);
  // Compact journey is inside map-topbar via renderCompactJourney call
  assert.match(source, /renderCompactJourney\(completed/);
  // locate button is in route-ocean with absolute positioning
  assert.match(source, /data-locate-progress/);
  assert.match(source, /route-ocean[\s\S]*?map-locate-btn/);
  // data-current-level attribute on locate button
  assert.match(source, /data-current-level=/);
  // map-brand still has title
  assert.match(source, /<h1 id="map-title">100 座魔法岛/);
});

// ─── SMS 登录测试 ──────────────────────────────────

test('validatePhone rejects invalid and accepts valid Chinese phone numbers', () => {
  const source = read('script.js');
  // validatePhone expects 11-digit string
  assert.match(source, /function validatePhone/);
  assert.match(source, /\^\\d\{11\}\$/);
});

test('validateCode accepts exactly 6 digits', () => {
  const source = read('script.js');
  assert.match(source, /function validateCode/);
  assert.match(source, /\^\\d\{6\}\$/);
});

test('60-second countdown resets on new login dialog open', () => {
  const source = read('script.js');
  // clearSmsCountdown must be called when opening access dialog
  assert.match(source, /clearSmsCountdown\(\)/);
  assert.match(source, /smsCountdownTimer/);
  assert.match(source, /startSmsCountdown/);
});

test('login flow has loading state, error display, and close button', () => {
  const source = read('script.js');
  assert.match(source, /is-loading/);
  assert.match(source, /dialogSubmitBtn/);
  assert.match(source, /sms-login-error/);
  assert.match(source, /data-access-close/);
  // aria attributes
  assert.match(source, /aria-label=.*关闭/);
  assert.match(source, /role.*alert/);
  assert.match(source, /data-sms-phone/);
  assert.match(source, /data-sms-code/);
});

test('login form uses sms-login-form and handles submit via API', () => {
  const source = read('script.js');
  assert.match(source, /sms-login-form/);
  assert.match(source, /handleSmsLogin/);
  assert.match(source, /verifyCode\(phone, code\)/);
  assert.match(source, /sendVerificationCode\(phone\)/);
  assert.match(source, /accessDialog\.close\(\)/);
  // After login success: resume pending operation
  assert.match(source, /pendingLevelId/);
  assert.match(source, /requestLevelAccess/);
});

test('session check restores login state on page load', () => {
  const source = read('script.js');
  assert.match(source, /checkSession\(\)/);
  assert.match(source, /isLoggedIn/);
  assert.match(source, /clearToken\(\)/);
  assert.match(source, /_sessionChecked/);
});

test('logout clears session and resets state', () => {
  const source = read('script.js');
  assert.match(source, /handleLogout/);
  assert.match(source, /logout\(\)/);
  assert.match(source, /isLoggedIn\s*=\s*false/);
  assert.match(source, /render\(\)/);
  assert.match(source, /data-logout/);
});

// ─── responsive / narrow-screen journey layout test ─────────

test('compact journey responsive structure: narrow screens simplify but keep key info', () => {
  const css = read('style.css');
  // Responsive map-topbar grid breakpoints
  assert.match(css, /@media\s*\(max-width:\s*899px\)[\s\S]*?grid-template-columns/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)/);
  // Compact journey info text adjusts
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?j-info-next[\s\S]*?display:\s*none/);
  // Narrow hides locate label
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?map-locate-btn::after[\s\S]*?display:\s*none/);
  // prefers-reduced-motion respected
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /animation-duration:\s*0\.01ms/);
});

// ─── 地图切换按钮 ─────────────────────────────────────

test('map-switch button exists in map-brand as flex item with correct structure', () => {
  const source = read('script.js');
  const css = read('style.css');

  // button element with data-map-switch inside map-brand
  assert.match(source, /data-map-switch/);
  // "切换地图" visible in aria-label + title (not as visible text span)
  assert.match(source, /aria-label="切换地图"/);
  assert.match(source, /title="切换地图"/);
  // No visible text "切换地图" span
  assert.doesNotMatch(source, /<span>切换地图<\/span>/);
  assert.match(source, /class="map-switch-btn"/);
  // aria-label and title for accessibility
  assert.match(source, /aria-label="切换地图"/);
  assert.match(source, /title="切换地图"/);
  // Contains SVG icon (mapSwitch in icons)
  assert.match(source, /mapSwitch/);
  assert.match(source, /mapSwitchHero/);
  // New mapSwitch SVG uses viewBox 1024 (replaced old Feather style)
  assert.match(source, /mapSwitch.*viewBox="0 0 1024 1024"/);
  // New SVG has the user-provided path (rotating arrows), fill=#383838
  assert.match(source, /mapSwitch.*M242\.42 370\.04/);
  assert.match(source, /mapSwitch.*m539\.17 283\.93/);
  assert.match(source, /mapSwitch.*fill="#383838"/);
  // Old paths (M187.456 / M836.48) removed — zero residual
  assert.doesNotMatch(source, /M187\.456 425\.024/);
  assert.doesNotMatch(source, /M836\.48 599\.04/);
  // Old Feather-style stroke attributes removed from mapSwitch (not mapSwitchHero)
  assert.doesNotMatch(source, /mapSwitch:.*stroke-linecap/);
  assert.doesNotMatch(source, /mapSwitch:.*stroke-linejoin/);
  assert.doesNotMatch(source, /mapSwitch:.*fill="none"/);
  // Chevron removed (button is now pure icon)
  assert.doesNotMatch(source, /chevron/);
  // map-brand has display:flex so button sits right of content
  assert.match(css, /\.map-brand\s*\{[^}]*display:\s*flex/);
  // Circular 44×44 icon button with ≥44px touch area
  assert.match(css, /\.map-switch-btn\s*\{[^}]*width:\s*44px/);
  assert.match(css, /\.map-switch-btn\s*\{[^}]*height:\s*44px/);
  // Circle (50% border-radius)
  assert.match(css, /\.map-switch-btn\s*\{[^}]*border-radius:\s*50%/);
});

test('map-switch button does not trigger login dialog or navigation', () => {
  const source = read('script.js');

  // Click handler is openMapSwitchDialog, not requestLevelAccess or openAccessDialog
  assert.match(source, /data-map-switch.*addEventListener.*openMapSwitchDialog/);
  // No data-level attribute on switch button
  assert.doesNotMatch(source, /data-map-switch[^>]*data-level/);
  // No access-dialog opened from switch click
  assert.doesNotMatch(source, /data-map-switch[^>]*openAccessDialog/);
});

test('map-switch dialog: openMapSwitchDialog creates dialog with correct a11y and content', () => {
  const source = read('script.js');

  // Function exists
  assert.match(source, /function openMapSwitchDialog/);
  assert.match(source, /function closeMapSwitchDialog/);
  // Dialog created with role=dialog and aria-modal
  assert.match(source, /role.*dialog/);
  assert.match(source, /aria-modal.*true/);
  // aria-labelledby for title reference
  assert.match(source, /aria-labelledby.*map-switch-title/);
  // Title content
  assert.match(source, /更多地图开发中/);
  // Body text
  assert.match(source, /新的冒险地图正在准备中，敬请期待/);
  // Close button with "知道了"
  assert.match(source, /知道了/);
  // Close triggers closeMapSwitchDialog
  assert.match(source, /data-map-switch-close/);
  assert.match(source, /closeMapSwitchDialog/);
  // Backdrop click close
  assert.match(source, /event\.target === mapSwitchDialog/);
});

test('map-switch dialog: close on Esc, close button, backdrop, no duplicate overlay', () => {
  const source = read('script.js');

  // Esc is handled via native <dialog> close event
  assert.match(source, /mapSwitchDialog\.addEventListener\('close'/);
  // Close button uses closeMapSwitchDialog
  assert.match(source, /data-map-switch-close[\s\S]{0,100}closeMapSwitchDialog/);
  // Backdrop click
  assert.match(source, /event\.target === mapSwitchDialog[\s\S]{0,200}closeMapSwitchDialog/);
  // No duplicate: if already open, returns early
  assert.match(source, /if \(mapSwitchDialog\.open\) return/);
  // Focus returns to switch button on close
  assert.match(source, /returnFocusToSwitchButton/);
  assert.match(source, /data-map-switch\][\s\S]{0,50}\.focus/);
  // Focus enters dialog on open
  assert.match(source, /firstBtn\.focus/);
});

test('map-switch dialog created dynamically, not reusing access-dialog', () => {
  const source = read('script.js');

  // Creates its own <dialog> element
  assert.match(source, /document\.createElement\('dialog'\)/);
  // Uses its own class
  assert.match(source, /map-switch-dialog/);
  // Does NOT query the existing access-dialog element
  assert.doesNotMatch(source, /openMapSwitchDialog[\s\S]{0,200}data-access-dialog/);
  // Does not call openAccessDialog from within openMapSwitchDialog function body
  const fnBody = source.match(/function openMapSwitchDialog[\s\S]*?\n  \}/)?.[0] ?? '';
  assert.doesNotMatch(fnBody, /openAccessDialog/);
  // Dialog content does not include SMS or payment elements
  assert.doesNotMatch(source, /更多地图开发中[\s\S]{0,200}data-sms-/);
});

test('map-switch card styles exist', () => {
  const css = read('style.css');

  assert.match(css, /\.map-switch-dialog\s*\{/);
  assert.match(css, /\.map-switch-dialog::backdrop\s*\{/);
  assert.match(css, /\.map-switch-card\s*\{/);
  assert.match(css, /更多地图开发中/);
  assert.match(css, /backdrop-filter:\s*blur/);
});

test('map-switch button narrow-screen responsive styles exist', () => {
  const css = read('style.css');

  // Narrow screen: brand wraps (map-switch-btn container wraps)
  assert.match(css, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.map-brand\b/);
  // Narrow screen no longer overrides SVG size — inherits base 1.5rem for consistent 24px
  assert.doesNotMatch(css, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.map-switch-btn\s*svg/);
  // Base SVG size now 1.5rem (≈24px), visually full inside 44×44 button
  assert.match(css, /\.map-switch-btn\s*svg\s*\{[^}]*width:\s*1\.5rem/);
  assert.match(css, /\.map-switch-btn\s*svg\s*\{[^}]*height:\s*1\.5rem/);
  // aria-label still present
  const source = read('script.js');
  assert.match(source, /data-map-switch[^>]*aria-label="切换地图"/);
});
