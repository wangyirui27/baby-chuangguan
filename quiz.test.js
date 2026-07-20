const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { MAP_WORLDS, activateVipPreferences, addLearningActivityDay, applyQuizAnswer, buildLearningDataExport, buildLocalRankings, calendarDays, canForceReleaseUpdate, canRegisterServiceWorker, compareAppVersions, completedLearningMinutes, completionUnlockText, desertLandmarkImage, desertLevels, formatActivityDate, getLevelAccess, islandStyleId, learningDays, learningReport, learningStreak, levels, levelsForMapWorld, membershipSummary, networkStatusText, normalizeMapWorldId, normalizeWorldProgress, notificationStatusText, normalizeChildProfile, normalizeLearningActivity, normalizeMistakeBook, normalizeProgress, parseRouteHash, profileAvatarText, questionPromptText, rankingScore, recordMistake, releaseUpdateInfo, requestReleaseUpdate, requestVipPurchase, requestVipRestore, resolveMistake, routePoint, supportFeedbackText, validateSupportMessage, wordButtonDisabled } = require('./script.js');

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
  const lastLevel = { completed: Array.from({ length: 199 }, (_, index) => index + 1), unlockedThrough: 200 };

  assert.deepEqual(applyQuizAnswer(lastLevel, 200, 0, 0, 200), {
    correct: true,
    progress: { completed: Array.from({ length: 200 }, (_, index) => index + 1), unlockedThrough: 200 },
  });
});

test('completion feedback does not claim paid or unpublished levels are unlocked', () => {
  const afterNine = { completed: Array.from({ length: 9 }, (_, index) => index + 1), unlockedThrough: 10 };
  const afterTen = { completed: Array.from({ length: 10 }, (_, index) => index + 1), unlockedThrough: 11 };
  const afterEleven = { completed: Array.from({ length: 11 }, (_, index) => index + 1), unlockedThrough: 12 };
  const afterTwelve = { completed: Array.from({ length: 12 }, (_, index) => index + 1), unlockedThrough: 13 };

  assert.equal(completionUnlockText(levels[8], afterNine, false), '第 10 关已解锁。');
  assert.equal(completionUnlockText(levels[9], afterTen, false), '第 11 关起是会员关卡，后续课程内容会随更新开放。');
  assert.equal(completionUnlockText(levels[9], afterTen, true), '这关视频还在准备中，请先复习前 10 关。');
  assert.equal(completionUnlockText(levels[10], afterEleven, true), '这关视频还在准备中，请先复习前 10 关。');
  assert.equal(completionUnlockText(levels[11], afterTwelve, true), '这关视频还在准备中，请先复习前 10 关。');
  assert.equal(completionUnlockText(levels[199], afterTen, true), '全部关卡已完成！');
});

test('first ten free starter levels stay fixed for conversion', () => {
  const fixedFreeLevels = [
    ['Mom', '妈妈', 'mom', ['mom', 'dad', 'grandma', 'book']],
    ['Dad', '爸爸', 'dad', ['dad', 'mom', 'grandpa', 'car']],
    ['Grandma', '奶奶', 'grandma', ['grandma', 'mom', 'grandpa', 'dad']],
    ['Grandpa', '爷爷', 'grandpa', ['grandpa', 'dad', 'grandma', 'mom']],
    ['Hand', '手', 'hand', ['hand', 'book', 'water', 'dog']],
    ['Rice', '饭', 'rice', ['rice', 'water', 'book', 'dog']],
    ['Water', '水', 'water', ['water', 'rice', 'car', 'book']],
    ['Car', '车', 'car', ['car', 'dog', 'book', 'water']],
    ['Dog', '狗', 'dog', ['dog', 'car', 'book', 'hand']],
    ['Book', '书', 'book', ['book', 'hand', 'car', 'water']],
  ];

  fixedFreeLevels.forEach(([title, zhTitle, correctWord, options], index) => {
    const level = levels[index];
    assert.equal(level.id, index + 1);
    assert.equal(level.title, title);
    assert.equal(level.zhTitle, zhTitle);
    assert.equal(level.topic, 'Free Starter · 免费体验');
    assert.equal(level.options[level.correct], correctWord);
    assert.deepEqual(level.options, options);
    assert.equal(level.videoSrc, `assets/video/free-levels/level-${String(index + 1).padStart(2, '0')}-${correctWord}.mp4?v=20260720-map-switch-cards-v13`);
    assert.equal(questionPromptText(level), `小朋友，视频里学到的单词，哪一个是${zhTitle}的意思？`);
  });
});

test('new users start at level one and stored progress cannot skip levels', () => {
  assert.deepEqual(normalizeProgress(null, 100), { completed: [], unlockedThrough: 1 });
  assert.deepEqual(normalizeProgress({ completed: [1, 2, 4], unlockedThrough: 99 }, 100), {
    completed: [1, 2],
    unlockedThrough: 3,
  });

  const source = read('script.js');
  const e2eSource = read('tools/e2e-auth-flow.mjs');
  const smokeSource = read('apps/frontend/tests/smoke.test.cjs');
  assert.match(source, /baby-island-preview-progress-v1/);
  assert.match(source, /localStorage\.setItem\(PREVIEW_PROGRESS_KEY/);
  assert.match(e2eSource, /PROGRESS_STORAGE_KEY = 'baby-island-preview-progress-v1'/);
  assert.match(smokeSource, /PROGRESS_STORAGE_KEY = 'baby-island-preview-progress-v1'/);
  assert.match(smokeSource, /PREFERENCES_STORAGE_KEY = 'baby-island-app-preferences-v1'/);
});

test('mine page learning stats come from progress and local activity, not demo numbers', () => {
  assert.equal(completedLearningMinutes([1, 2, 10], levels), 10);
  assert.equal(formatActivityDate(new Date(2026, 6, 17, 23, 30)), '2026-07-17');
  assert.deepEqual(normalizeLearningActivity({ dates: ['bad', '2026-07-17', '2026-07-16', '2026-07-17'] }), {
    dates: ['2026-07-16', '2026-07-17'],
  });
  assert.deepEqual(addLearningActivityDay({ dates: ['2026-07-16'] }, new Date(2026, 6, 17)), {
    dates: ['2026-07-16', '2026-07-17'],
  });
  assert.equal(learningDays({ dates: [] }, { completed: [], unlockedThrough: 1 }), 0);
  assert.equal(learningDays({ dates: [] }, { completed: [1], unlockedThrough: 2 }), 1);
  assert.equal(learningDays({ dates: ['2026-07-16', '2026-07-17'] }, { completed: [1], unlockedThrough: 2 }), 2);

  const source = read('script.js');
  assert.match(source, /LEARNING_ACTIVITY_KEY = 'baby-island-learning-activity-v1'/);
  assert.match(source, /recordLearningActivity\(\)/);
  assert.match(source, /learningReport\(state\.progress, state\.learningActivity, levels\)/);
  assert.doesNotMatch(source, /stat-value">3<\/span><span class="stat-label">学习天数/);
  assert.doesNotMatch(source, /stat-value">18<\/span><span class="stat-label">学习分钟/);
});

test('learning report summarizes real local progress for parent review', () => {
  assert.deepEqual(learningReport({ completed: [1, 2, 4], unlockedThrough: 99 }, { dates: ['2026-07-16'] }, levels), {
    completed: 2,
    activeDays: 1,
    learningMinutes: 6,
    progressPercent: 1,
    learnedWords: ['mom', 'dad'],
    recentWords: ['dad', 'mom'],
    nextLevelText: '第 3 关 · Grandma',
  });
});

test('ranking page inserts the current child from local progress', () => {
  const progress = { completed: [1, 2, 3, 4, 5], unlockedThrough: 6 };
  const base = [
    { name: '第一名', score: 80 },
    { name: '第二名', score: 30 },
  ];
  const rows = buildLocalRankings(progress, { childName: '小雨', childAge: '5' }, base, 200);
  const current = rows.find((row) => row.isCurrent);

  assert.equal(rankingScore(progress, 200), 60);
  assert.equal(current.name, '小雨同学');
  assert.equal(current.score, 60);
  assert.equal(current.rank, 2);
  assert.deepEqual(rows.map((row) => row.name), ['第一名', '小雨同学', '第二名']);

  const source = read('script.js');
  assert.match(source, /const allRankings = buildLocalRankings\(state\.progress, state\.preferences\)/);
  assert.match(source, /data-current-user="true"/);
  assert.match(source, /我的排名/);
  assert.doesNotMatch(source, /const allRankings = rankings \|\| \[\]/);
});

test('ranking and mine layouts collapse to one column on phone width', () => {
  const css = read('style.css');

  assert.match(css, /@media \(max-width: 899px\)\s*\{[\s\S]*?\.ranking-layout,\s*\n\s*\.mine-layout\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 899px\)\s*\{[\s\S]*?\.ranking-stats\s*\{[\s\S]*?flex-wrap:\s*wrap/);
  assert.doesNotMatch(css, /@media \(max-width: 899px\)\s*\{\s*\/\* intentional no-op/);
});

test('learning calendar builds recent days and current streak from local activity', () => {
  const today = new Date(2026, 6, 17, 12);
  const activity = { dates: ['2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17'] };
  const days = calendarDays(activity, today, 7);

  assert.equal(days.length, 7);
  assert.deepEqual(days[0], { date: '2026-07-11', day: '11', label: '7/11', active: false, today: false });
  assert.deepEqual(days[6], { date: '2026-07-17', day: '17', label: '7/17', active: true, today: true });
  assert.equal(days.filter((day) => day.active).length, 4);
  assert.equal(learningStreak(activity, today), 4);
  assert.equal(learningStreak({ dates: ['2026-07-15'] }, today), 0);
  assert.deepEqual(calendarDays(activity, 'bad-date'), []);
});

test('mistake book records wrong answers and clears after correct retry', () => {
  const level = levels[2];
  const wrongOption = level.options.find((_, index) => index !== level.correct);
  const first = recordMistake(null, level, wrongOption, new Date('2026-07-17T08:00:00.000Z'));
  assert.deepEqual(first.items, [{
    levelId: 3,
    word: 'Grandma',
    zhTitle: '奶奶',
    selected: wrongOption,
    correct: 'grandma',
    count: 1,
    updatedAt: '2026-07-17T08:00:00.000Z',
  }]);

  const second = recordMistake(first, level, wrongOption, new Date('2026-07-17T09:00:00.000Z'));
  assert.equal(second.items[0].count, 2);
  assert.deepEqual(resolveMistake(second, level.id), { items: [] });
  assert.deepEqual(normalizeMistakeBook({ items: [{ levelId: 999 }, { levelId: 1, selected: '<bad>', count: -2 }] }).items[0], {
    levelId: 1,
    word: 'Mom',
    zhTitle: '妈妈',
    selected: '<bad>',
    correct: 'mom',
    count: 1,
    updatedAt: '',
  });
});

test('quiz submissions persist mistake book entries locally', () => {
  const source = read('script.js');

  assert.match(source, /state\.mistakeBook = recordMistake\(state\.mistakeBook, level, level\.options\[selected\]\)/);
  assert.match(source, /state\.mistakeBook = resolveMistake\(state\.mistakeBook, level\.id\)/);
  assert.match(source, /localStorage\.setItem\(MISTAKE_BOOK_KEY, JSON\.stringify\(state\.mistakeBook\)\)/);
});

test('unknown hash routes show a branded not-found screen instead of silently falling back', () => {
  assert.deepEqual(parseRouteHash(''), { type: 'map' });
  assert.deepEqual(parseRouteHash('#map'), { type: 'map' });
  assert.deepEqual(parseRouteHash('#ranking'), { type: 'ranking' });
  assert.deepEqual(parseRouteHash('#mine'), { type: 'mine' });
  assert.deepEqual(parseRouteHash('#support'), { type: 'support' });
  assert.deepEqual(parseRouteHash('#account'), { type: 'not-found', hash: 'account' });
  assert.deepEqual(parseRouteHash('#calendar'), { type: 'not-found', hash: 'calendar' });
  assert.deepEqual(parseRouteHash('#reminders'), { type: 'not-found', hash: 'reminders' });
  assert.deepEqual(parseRouteHash('#report'), { type: 'not-found', hash: 'report' });
  assert.deepEqual(parseRouteHash('#mistakes'), { type: 'not-found', hash: 'mistakes' });
  assert.deepEqual(parseRouteHash('#level-3'), { type: 'level', id: 3 });
  assert.deepEqual(parseRouteHash('#privacy'), { type: 'info', page: 'privacy' });
  assert.deepEqual(parseRouteHash('#terms'), { type: 'info', page: 'terms' });
  assert.deepEqual(parseRouteHash('#about'), { type: 'info', page: 'about' });
  assert.deepEqual(parseRouteHash('#abc'), { type: 'not-found', hash: 'abc' });

  const source = read('script.js');
  const css = read('style.css');
  const html = read('index.html');
  assert.match(source, /function renderNotFound\(\)/);
  assert.match(source, /页面走丢了/);
  assert.match(source, /data-return-map/);
  assert.match(source, /navigate\('map'\)/);
  assert.match(css, /\.not-found-view\s*\{[\s\S]*?place-items:\s*center/);
  assert.match(css, /\.not-found-icon\s*\{[\s\S]*?border-radius:\s*50%/);
  assert.match(html, /style\.css\?v=20260720-camel-idle-stable-v3/);
  assert.match(html, /script\.js\?v=20260720-camel-idle-walkmatch-v1/);
});

test('app shell exposes child-safe network status for offline use', () => {
  assert.equal(networkStatusText(false), '当前离线：进度会先保存在本机');
  assert.equal(networkStatusText(true), '');
  assert.equal(networkStatusText(true, true), '已重新连接');

  const html = read('index.html');
  const source = read('script.js');
  const css = read('style.css');

  assert.match(html, /data-network-status[^>]*role="status"[^>]*aria-live="polite"[^>]*hidden/);
  assert.match(source, /function updateNetworkStatus\(restored = false\)/);
  assert.match(source, /window\.addEventListener\('offline', \(\) => updateNetworkStatus\(false\)\)/);
  assert.match(source, /window\.addEventListener\('online', \(\) => \{\s*\n\s*updateNetworkStatus\(true\);\s*\n\s*checkReleaseUpdate\(\);\s*\n\s*hydrateLearningStateFromBackend\(\);\s*\n\s*\}\)/);
  assert.match(source, /networkStatus\.dataset\.state = navigator\.onLine \? 'online' : 'offline'/);
  assert.match(source, /function showAppUpdateReady\(\)/);
  assert.match(source, /data-app-refresh/);
  assert.match(source, /location\.reload\(\)/);
  assert.match(css, /\.network-banner\s*\{[\s\S]*?border-radius:\s*var\(--pill-radius\)[\s\S]*?box-shadow:\s*0 3px 10px rgba\(61, 52, 40, 0\.12\)/);
  assert.match(css, /\.network-banner\[data-state="offline"\]\s*\{[\s\S]*?background:\s*rgba\(255, 241, 171, 0\.95\)/);
  assert.match(css, /\.network-banner\[data-state="online"\]\s*\{[\s\S]*?background:\s*rgba\(230, 249, 246, 0\.95\)/);
  assert.match(css, /\.network-banner\[data-state="update"\]\s*\{[\s\S]*?display:\s*inline-flex[\s\S]*?background:\s*rgba\(230, 249, 246, 0\.96\)/);
  assert.match(css, /\.network-refresh-button\s*\{[\s\S]*?border-radius:\s*var\(--pill-radius\)[\s\S]*?box-shadow:\s*0 0\.16rem 0 #dba90e/);
  assert.match(css, /\.map-game-active \.network-banner\s*\{[\s\S]*?top:\s*clamp\(5\.8rem, 10dvh, 7rem\)/);
});

test('app startup checks App Store release version and opens centered update dialog', () => {
  assert.equal(compareAppVersions('1.0.1', '1.0.0'), 1);
  assert.equal(compareAppVersions('1.0.0', '1.0.1'), -1);
  assert.equal(compareAppVersions('1.0', '1.0.0'), 0);
  assert.equal(releaseUpdateInfo({ latestVersion: '1.0.0' }, '1.0.0'), null);
  assert.deepEqual(releaseUpdateInfo({
    latestVersion: '1.0.1',
    minSupportedVersion: '1.0.0',
    releaseNotes: ['视频更稳定'],
  }, '1.0.0'), {
    currentVersion: '1.0.0',
    latestVersion: '1.0.1',
    force: false,
    title: '发现新版本',
    message: '请前往 App Store 更新宝宝英语岛。',
    releaseNotes: ['视频更稳定'],
    storeName: 'App Store',
    updateUrl: '',
  });
  assert.equal(releaseUpdateInfo({ latestVersion: '1.0.2', minSupportedVersion: '1.0.1' }, '1.0.0').force, true);
  assert.equal(releaseUpdateInfo({
    latestVersion: '1.0.2',
    minSupportedVersion: '1.0.1',
    updateUrl: 'https://apps.apple.com/app/id123456789',
  }, '1.0.0').force, true);
  assert.equal(canForceReleaseUpdate({
    latestVersion: '1.0.2',
    force: true,
    updateUrl: '',
  }, {}), false);
  assert.equal(canForceReleaseUpdate({
    latestVersion: '1.0.2',
    force: true,
    updateUrl: 'https://apps.apple.com/app/id123456789',
  }, {}), true);
  assert.equal(canForceReleaseUpdate({
    latestVersion: '1.0.2',
    force: true,
    updateUrl: '',
  }, {
    webkit: { messageHandlers: { babyIslandAppUpdate: { postMessage() {} } } },
  }), true);

  const source = read('script.js');
  const css = read('style.css');
  const releaseConfig = JSON.parse(read('app-release.json'));

  assert.equal(releaseConfig.latestVersion, '1.0.1');
  assert.match(releaseConfig.updateUrl, /^https:\/\/apps\.apple\.com\/cn\/search\?term=/);
  assert.match(source, /APP_RELEASE_VERSION = '1\.0\.0'/);
  assert.match(source, /APP_RELEASE_UPDATE_URL = 'app-release\.json'/);
  assert.match(source, /function checkReleaseUpdate\(\)/);
  assert.match(source, /const releaseUpdateUrl = String\(window\.BABY_ISLAND_RELEASE_UPDATE_URL \|\| APP_RELEASE_UPDATE_URL\)/);
  assert.match(source, /const separator = releaseUpdateUrl\.includes\('\?'\) \? '&' : '\?'/);
  assert.match(source, /fetch\(`\$\{releaseUpdateUrl\}\$\{separator\}t=\$\{Date\.now\(\)\}`/);
  assert.match(source, /openReleaseUpdateDialog\(releaseUpdateInfo/);
  assert.doesNotMatch(source, /更新地址待配置/);
  assert.match(source, /requestReleaseUpdate\(updateInfo, window\)/);
  assert.match(source, /请打开 \$\{updateInfo\.storeName\} 搜索宝宝英语岛更新/);
  assert.match(source, /const mustBlockForUpdate = canForceReleaseUpdate\(updateInfo, window\)/);
  assert.match(source, /if \(mustBlockForUpdate\) event\.preventDefault\(\)/);
  assert.match(source, /let promptedReleaseVersion = ''/);
  assert.match(source, /if \(!updateInfo\.force && promptedReleaseVersion === updateInfo\.latestVersion\) return/);
  assert.match(source, /if \(!updateInfo\.force\) promptedReleaseVersion = updateInfo\.latestVersion/);
  assert.match(source, /window\.addEventListener\('online', \(\) => \{\s*\n\s*updateNetworkStatus\(true\);\s*\n\s*checkReleaseUpdate\(\);\s*\n\s*hydrateLearningStateFromBackend\(\);\s*\n\s*\}\)/);
  assert.match(source, /APP 版本更新/);
  assert.match(source, /checkReleaseUpdate\(\)/);
  assert.match(css, /\.release-update-dialog\s*\{/);
  assert.match(css, /\.release-update-card\s*\{/);
  assert.match(css, /\.release-update-actions\s*\{/);
});

test('release update button prefers native app-update bridge before URL fallback', () => {
  const updateInfo = {
    latestVersion: '1.0.2',
    updateUrl: 'https://apps.apple.com/app/id123456789',
    storeName: 'App Store',
  };

  let iosPayload = null;
  const iosRuntime = {
    webkit: {
      messageHandlers: {
        babyIslandAppUpdate: {
          postMessage(payload) {
            iosPayload = payload;
          },
        },
      },
    },
  };
  assert.equal(requestReleaseUpdate(updateInfo, iosRuntime), true);
  assert.deepEqual(iosPayload, updateInfo);

  let androidUrl = null;
  const androidRuntime = {
    BabyIslandAppUpdate: {
      openStore(updateUrl) {
        androidUrl = updateUrl;
      },
    },
  };
  assert.equal(requestReleaseUpdate({ ...updateInfo, updateUrl: '' }, androidRuntime), true);
  assert.equal(androidUrl, '');

  let opened = null;
  assert.equal(requestReleaseUpdate(updateInfo, {
    open(url, target, features) {
      opened = { url, target, features };
    },
  }), true);
  assert.deepEqual(opened, {
    url: updateInfo.updateUrl,
    target: '_blank',
    features: 'noopener',
  });
  assert.equal(requestReleaseUpdate({ latestVersion: '1.0.2', updateUrl: '', storeName: 'App Store' }, {}), false);
});

test('app shell has a reusable Animal-style toast for common app feedback', () => {
  const html = read('index.html');
  const source = read('script.js');
  const css = read('style.css');

  assert.match(html, /data-app-toast[^>]*role="status"[^>]*aria-live="polite"[^>]*hidden/);
  assert.match(source, /const appToast = document\.querySelector\('\[data-app-toast\]'\)/);
  assert.match(source, /function showToast\(message\)/);
  assert.match(source, /appToast\.textContent = message/);
  assert.match(source, /toastTimer = setTimeout\(\(\) => \{ appToast\.hidden = true; \}, 1800\)/);
  assert.match(source, /showToast\(`\$\{preferenceLabels\[key\]\}已\$\{value \? '开启' : '关闭'\}`\)/);
  assert.match(source, /showToast\('反馈已保存在本机'\)/);
  assert.doesNotMatch(source, /家长登录成功|已退出登录/);
  assert.match(css, /\.app-toast\s*\{[\s\S]*?border-radius:\s*var\(--pill-radius\)[\s\S]*?background:\s*rgba\(247, 243, 223, 0\.96\)[\s\S]*?box-shadow:\s*0 3px 10px rgba\(61, 52, 40, 0\.14\)/);
  assert.match(css, /\.app-toast\[hidden\]\s*\{[\s\S]*?display:\s*none/);
  assert.match(css, /@keyframes\s+toast-pop/);
});

test('mine page exposes app info, privacy and terms pages', () => {
  const source = read('script.js');
  const css = read('style.css');

  assert.match(source, /appInfoPages\s*=\s*\{/);
  assert.match(source, /data-nav-route="privacy"/);
  assert.match(source, /data-nav-route="terms"/);
  assert.match(source, /data-nav-route="about"/);
  assert.match(source, /data-nav-route="support"/);
  assert.match(source, /function renderInfoPage\(page\)/);
  assert.match(source, /返回我的/);
  assert.match(source, /type === 'info' \|\| type === 'support' \? 'mine'/);
  assert.match(source, /家长查看数据使用说明/);
  assert.match(source, /关卡顺序与使用边界/);
  assert.match(source, /当前不收集账号信息。/);
  assert.match(source, /当前版本 v\$\{APP_RELEASE_VERSION\}/);
  assert.match(source, /适配 iPad 横屏与移动浏览器。/);
  assert.doesNotMatch(source, /正式账号接入前/);
  assert.doesNotMatch(source, /H5 预览版 v0\.1/);
  assert.doesNotMatch(source, /后续会用于 iOS 和安卓封包/);
  assert.doesNotMatch(source, /data-nav-route="(?:account|calendar|reminders|report|mistakes)"/);
  assert.doesNotMatch(source, /分享应用|清理缓存|数据管理/);
  assert.match(css, /\.info-view\s*\{/);
  assert.match(css, /\.info-card\s*\{/);
  assert.match(css, /\.setting-link-button\s*\{/);
});

test('mine page removes nonessential account UI, reminder, report, calendar, and mistake routes', () => {
  const source = read('script.js');

  assert.doesNotMatch(source, /function render(?:Account|Report|Calendar|Reminders|Mistakes)\(/);
  assert.doesNotMatch(source, /账号与会员|本周英语报告|学习日历|学习提醒|错题本/);
  assert.doesNotMatch(source, /data-open-login|data-logout|data-request-notification|data-reminder-time|data-open-mistake-clear/);
  assert.doesNotMatch(source, /state\.account|sessionStorage/);
  assert.match(source, /babyIslandApi/);
});

test('mine page help and feedback saves a validated local draft', () => {
  assert.equal(validateSupportMessage(''), '请先写下要反馈的问题。');
  assert.equal(validateSupportMessage('abc'), '请至少写 4 个字，方便家长回看。');
  assert.equal(validateSupportMessage('a'.repeat(301)), '反馈内容最多 300 个字。');
  assert.equal(validateSupportMessage('喇叭没有声音'), '');
  assert.equal(supportFeedbackText(' 喇叭没有声音 ', {
    currentLevel: 6,
    completed: 5,
    userAgent: 'iPad Safari',
  }), '宝宝英语岛反馈\n问题：喇叭没有声音\n当前关卡：第 6 关\n完成关卡：5/200\n设备信息：iPad Safari');

  const source = read('script.js');
  const css = read('style.css');

  assert.match(source, /SUPPORT_DRAFT_KEY = 'baby-island-support-draft-v1'/);
  assert.match(source, /data-nav-route="support"/);
  assert.match(source, /function renderSupport\(\)/);
  assert.match(source, /data-support-form/);
  assert.match(source, /data-copy-support/);
  assert.match(source, /function copySupportFeedback\(form\)/);
  assert.match(source, /supportFeedbackText\(message/);
  assert.match(source, /navigator\.clipboard\.writeText\(text\)/);
  assert.match(source, /localStorage\.setItem\(SUPPORT_DRAFT_KEY, message\)/);
  const copySupportFn = source.match(/function copySupportFeedback\(form\) \{[\s\S]*?\n  \}/)?.[0] || '';
  assert.match(copySupportFn, /saveSupportDraft\(message\);[\s\S]*if \(!navigator\.clipboard\?\.writeText \|\| !window\.isSecureContext\)/);
  assert.match(source, /已复制反馈内容，可粘贴给客服或家长。/);
  assert.match(source, /先把问题保存在本机，家长可以复制后发给客服或老师。/);
  assert.match(source, /复制给客服/);
  assert.doesNotMatch(source, /正式客服通道接入/);
  assert.match(source, /学习记录优先保存在本机，清理浏览器数据会影响本地记录。/);
  assert.doesNotMatch(source, /当前 H5 预览/);
  assert.match(source, /当前浏览器不能自动复制，请手动长按复制。/);
  assert.match(source, /帮助与反馈 · 宝宝英语岛/);
  assert.match(source, /关卡顺序/);
  assert.doesNotMatch(source, /第 6 关开始需要家长登录并解锁/);
  assert.match(css, /\.support-view\s*\{/);
  assert.match(css, /\.support-card\s*\{/);
  assert.match(css, /\.support-form textarea\s*\{/);
  assert.match(css, /\.support-actions\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.support-error\[hidden\],[\s\S]*?\.support-status\[hidden\]/);
});

test('H5 app shell has install metadata for tablet packaging', () => {
  const html = read('index.html');
  const manifestPath = path.join(__dirname, 'manifest.webmanifest');
  const iconPath = path.join(__dirname, 'assets/icons/app-icon.svg');

  assert.ok(fs.existsSync(manifestPath));
  assert.ok(fs.existsSync(iconPath));

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.name, '宝宝英语岛');
  assert.equal(manifest.short_name, '英语岛');
  assert.equal(manifest.start_url, './#map');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.orientation, 'landscape');
  assert.equal(manifest.theme_color, '#f8f8f0');
  assert.ok(manifest.categories.includes('education'));
  assert.ok(manifest.categories.includes('games'));
  assert.deepEqual(manifest.icons[0], {
    src: 'assets/icons/app-icon.svg',
    sizes: 'any',
    type: 'image/svg+xml',
    purpose: 'any maskable',
  });
  assert.deepEqual(manifest.shortcuts.map((item) => item.url), ['./#map', './#ranking', './#mine']);

  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest\?v=20260717-app-shell-v1">/);
  assert.match(html, /<meta name="mobile-web-app-capable" content="yes">/);
  assert.match(html, /<meta name="apple-mobile-web-app-capable" content="yes">/);
  assert.match(html, /<meta name="apple-mobile-web-app-title" content="宝宝英语岛">/);
  assert.match(html, /<link rel="icon" href="assets\/icons\/app-icon\.svg\?v=20260717-app-shell-v1" type="image\/svg\+xml">/);
  assert.match(html, /<link rel="apple-touch-icon" href="assets\/icons\/app-icon\.svg\?v=20260717-app-shell-v1">/);
});

test('H5 app shell registers a minimal offline cache', () => {
  assert.equal(canRegisterServiceWorker('http:'), true);
  assert.equal(canRegisterServiceWorker('https:'), true);
  assert.equal(canRegisterServiceWorker('file:'), false);

  const html = read('index.html');
  const source = read('script.js');
  const worker = read('sw.js');

  assert.match(html, /style\.css\?v=20260720-camel-idle-stable-v3/);
  assert.match(html, /script\.js\?v=20260720-camel-idle-walkmatch-v1/);
  assert.match(source, /function registerServiceWorker\(\)/);
  assert.match(source, /navigator\.serviceWorker\.register\('\.\/sw\.js(\?[^']*)?'\)/);
  assert.match(source, /canRegisterServiceWorker\(location\.protocol\)/);
  assert.match(source, /registration\.addEventListener\('updatefound'/);
  assert.match(source, /worker\.state === 'installed' && navigator\.serviceWorker\.controller/);
  assert.match(worker, /CACHE_NAME = 'baby-island-shell-20260720-v169'/);
  assert.match(worker, /APP_SHELL = \[/);
  assert.match(worker, /style\.css\?v=20260720-camel-idle-stable-v3/);
  assert.match(worker, /script\.js\?v=20260720-camel-idle-walkmatch-v1/);
  assert.match(worker, /assets\/ocean\/front-ocean-bg-v2-libtv\.webp\?v=20260720-clean-ocean-v1/);
  assert.match(worker, /assets\/ocean\/front-ocean-loop-v4-libtv-seamless-clouds\.mp4\?v=20260719-handpainted-libtv-v1/);
  assert.match(worker, /assets\/ocean\/seagull-fly\.webp\?v=20260720-libtv-flap-v1/);
  assert.match(worker, /assets\/egypt-map\/background\/egypt-desert-infinite-clean-bg-dreamina-v2\.png\?v=20260720-desert-infinite-v2/);
  assert.match(worker, /assets\/egypt-map\/background\/egypt-desert-infinite-bg-libtv-v4\.mp4\?v=20260720-desert-bg-v4/);
  assert.match(worker, /assets\/ocean\/rowing-kids-boat-idle\.webp\?v=20260720-libtv-original-v3/);
  assert.match(worker, /assets\/ocean\/rowing-kids-boat-sailing\.webp\?v=20260720-libtv-original-rowing-v3/);
  assert.match(worker, /assets\/icons\/resource-star\.webp\?v=20260714-v1/);
  assert.match(worker, /assets\/audio\/map-bgm\.mp3/);
  assert.match(worker, /assets\/audio\/words\/word-audio-manifest\.json/);
  assert.match(worker, /function cacheGeneratedWordAudio\(cache\)/);
  assert.match(worker, /entry\.status === 'generated'/);
  assert.match(worker, /Promise\.allSettled/);
  assert.match(worker, /assets\/islands-v1\/runtime\/island-005\.webp\?v=20260720-underwater-fade-v3/);
  assert.match(worker, /self\.addEventListener\('install'/);
  assert.match(worker, /self\.addEventListener\('activate'/);
  assert.match(worker, /self\.addEventListener\('fetch'/);
  assert.match(worker, /caches\.match\('\.\/index\.html'\)/);
  assert.match(worker, /event\.request\.destination === 'document'/);
  assert.match(worker, /new Response\('', \{ status: 503, statusText: 'Offline' \}\)/);
  for (const match of worker.matchAll(/'(\.\/[^']*)'/g)) {
    const clean = match[1].replace(/^\.\//, '').split(/[?#]/)[0];
    if (!clean) continue;
    assert.ok(fs.existsSync(path.join(__dirname, clean)), `service worker cached file must exist: ${match[1]}`);
  }
  assert.match(worker, /auth\/apiClient\.js\?v=20260720-learning-sync-v1/);
  assert.doesNotMatch(worker, /sms-login|babyIslandApi/);
  assert.doesNotMatch(worker, /assets\/audio\/sfx\/(?:correct|wrong)\.mp3/);
});

test('root app asset references resolve to local files', () => {
  const filesToScan = ['index.html', 'script.js', 'style.css', 'sw.js', 'manifest.webmanifest'];
  const refs = new Set(['app-release.json']);
  const assetRef = /(?:^|["'`(\s])((?:\.\/)?(?:assets\/|manifest\.webmanifest|app-release\.json|script\.js|style\.css|sw\.js)[^"'`)\s,]*)/g;

  filesToScan.forEach((file) => {
    for (const match of read(file).matchAll(assetRef)) {
      const ref = match[1].replace(/^\.\//, '').split(/[?#]/)[0];
      if (ref && !ref.includes('${')) refs.add(ref);
    }
  });

  levels.slice(0, 10).forEach((level) => refs.add(level.videoSrc.split(/[?#]/)[0]));
  const wordManifest = JSON.parse(read('assets/audio/words/word-audio-manifest.json'));
  wordManifest.entries
    .filter((entry) => entry.status === 'generated')
    .forEach((entry) => refs.add(entry.url.split(/[?#]/)[0]));

  const missing = [...refs].filter((ref) => !fs.existsSync(path.join(__dirname, ref))).sort();
  assert.deepEqual(missing, []);
});

test('frontend production build carries the root static app shell', () => {
  const frontendPackage = JSON.parse(read('apps/frontend/package.json'));
  const viteConfig = read('apps/frontend/vite.config.js');
  const copyScript = read('apps/frontend/scripts/copy-root-static.cjs');
  const requiredRuntimeAssets = [
    'script.js',
    'style.css',
    'sw.js',
    'manifest.webmanifest',
    'app-release.json',
    'assets/audio/words',
    'assets/audio/questions-holly',
    'assets/video/free-levels',
    'assets/egypt-map',
    'assets/islands-v1/runtime',
    'assets/ocean/front-ocean-loop-v4-libtv-seamless-clouds.mp4',
  ];

  assert.match(frontendPackage.scripts.build, /vite build && node scripts\/copy-root-static\.cjs/);
  assert.match(viteConfig, /base:\s*'\.\/'/);
  requiredRuntimeAssets.forEach((name) => {
    assert.match(copyScript, new RegExp(`'${name.replace('.', '\\.')}'`));
  });
  assert.match(copyScript, /fs\.cpSync\(src, dest, \{ recursive: true, force: true \}\)/);
  assert.doesNotMatch(copyScript, /'assets'/);
  assert.doesNotMatch(copyScript, /free-levels-libtv-downloads|generated|voice-samples/);
});

test('level video stage gives the lesson video enough landscape presence', () => {
  const css = read('style.css');

  assert.match(css, /\.stage-video-inner\s*\{[\s\S]*?padding:\s*0\.15rem 0 0\.35rem/);
  assert.match(css, /\.video-card\s*\{[\s\S]*?width:\s*min\(880px,\s*82vw\)/);
  assert.match(css, /\.video-card\s*\{[\s\S]*?padding:\s*clamp\(0\.75rem,\s*1\.4vw,\s*1rem\)/);
  assert.match(css, /\.video-frame\s*\{[\s\S]*?aspect-ratio:\s*16 \/ 9/);
  assert.match(css, /@media \(max-width: 760px\), \(orientation: portrait\)[\s\S]*?\.video-card \{ width: 100%; \}/);
  assert.doesNotMatch(css, /width:\s*min\(680px,\s*62vw\)/);
});




test('level entry keeps first ten free and gates level eleven as paid', () => {
  assert.equal(getLevelAccess(1, { completed: [], unlockedThrough: 1 }), 'allowed');
  assert.equal(getLevelAccess(5, { completed: [1, 2, 3], unlockedThrough: 4 }), 'locked');
  assert.equal(getLevelAccess(5, { completed: [1, 2, 3, 4], unlockedThrough: 5 }), 'allowed');
  assert.equal(getLevelAccess(6, { completed: [1, 2, 3, 4], unlockedThrough: 5 }), 'locked');
  assert.equal(getLevelAccess(6, { completed: [1, 2, 3, 4, 5], unlockedThrough: 6 }), 'allowed');
  assert.equal(getLevelAccess(10, { completed: Array.from({ length: 9 }, (_, index) => index + 1), unlockedThrough: 10 }), 'allowed');
  assert.equal(getLevelAccess(11, { completed: Array.from({ length: 10 }, (_, index) => index + 1), unlockedThrough: 11 }), 'paid');
  assert.equal(getLevelAccess(50, { completed: [], unlockedThrough: 1 }), 'paid');
  assert.equal(getLevelAccess(11, { completed: Array.from({ length: 10 }, (_, index) => index + 1), unlockedThrough: 11 }, true), 'allowed');
  assert.equal(getLevelAccess(50, { completed: [], unlockedThrough: 1 }, true), 'locked');
  assert.equal(getLevelAccess(0, { completed: [], unlockedThrough: 1 }, true), 'missing');
  assert.equal(getLevelAccess(201, { completed: Array.from({ length: 200 }, (_, index) => index + 1), unlockedThrough: 200 }, true), 'missing');
  assert.equal(getLevelAccess(1.5, { completed: [], unlockedThrough: 1 }, true), 'missing');
});

test('no stamina/energy gate — repeated level entry and retry are never blocked by stamina', () => {
  const source = read('script.js');
  // No stamina or login check in getLevelAccess.
  const accessFn = source.match(/function getLevelAccess[\s\S]*?\n\}/)?.[0] ?? '';
  assert.doesNotMatch(accessFn, /stamina|energy|体力|能量|爱心|life|hearts/i,
    'getLevelAccess must not contain stamina/energy checks');
  assert.doesNotMatch(accessFn, /remaining|attempt|次数/,
    'getLevelAccess must not contain remaining-attempt checks');
  assert.doesNotMatch(accessFn, /login|account|hasFullAccess|isLoggedIn|登录/i,
    'getLevelAccess must not contain login checks');
  assert.match(accessFn, /FREE_LEVEL_COUNT/);

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
  assert.match(source, /getLevelAccess\(route\.id, state\.progress, state\.preferences\.vipActive === true\)/);
  assert.match(source, /lessonUnavailableMessage = '这关视频还在准备中，请先复习前 10 关。'/);
  assert.match(source, /if \(!level\?\.videoSrc\) \{[\s\S]*?showMapMessage\(lessonUnavailableMessage\)/);
  assert.match(source, /if \(!level\.videoSrc\) \{[\s\S]*?renderMap\(lessonUnavailableMessage\)/);
  assert.match(source, /openPaywallDialog\(levelId, trigger\)/);
  assert.match(source, /openPaywallDialog\(route\.id\)/);
  assert.doesNotMatch(source, /openAccessDialog|payment-required|login-required/);
  assert.doesNotMatch(read('index.html'), /data-access-dialog-content/);
});

test('paid levels open a VIP payment panel instead of a notice-only dialog', () => {
  const source = read('script.js');
  const css = read('style.css');
  const paywallFn = source.match(/function openPaywallDialog[\s\S]*?function closePaywallDialog/)?.[0] ?? '';

  assert.match(paywallFn, /paywall-card/);
  assert.match(paywallFn, /VIP 学习卡/);
  assert.match(paywallFn, /立即支付 ¥99/);
  assert.match(paywallFn, /data-vip-pay/);
  assert.match(paywallFn, /data-vip-restore/);
  assert.match(paywallFn, /恢复购买/);
  // iPad App 方向：数字内容必须走 Apple IAP，微信/支付宝等第三方支付入口严禁出现在应用内（合规，勿恢复）
  assert.doesNotMatch(paywallFn, /data-vip-method/);
  assert.doesNotMatch(paywallFn, /微信支付|支付宝/);
  assert.match(paywallFn, /通过 App Store 安全支付/);
  assert.match(paywallFn, /canOpenNativePurchase/);
  assert.match(paywallFn, /initialPayNote/);
  assert.match(paywallFn, /当前预览不会扣费/);
  // ¥99 为单张地图买断价，文案必须明确范围、不得暗示全产品通用
  assert.match(paywallFn, /class="vip-price">¥99/);
  assert.match(paywallFn, /买断本地图/);
  assert.match(paywallFn, /后续新地图独立发售/);
  assert.match(paywallFn, /会员关卡权益/);
  assert.match(paywallFn, /后续课程内容更新后自动开放/);
  assert.match(paywallFn, /完成后会员权益立即生效/);
  assert.doesNotMatch(paywallFn, /全图解锁|完整视频课程|解锁全部会员关卡|一次买断解锁本地图全部课程|完成后自动解锁全部关卡/);
  assert.doesNotMatch(paywallFn, /收银台确认/);
  assert.doesNotMatch(paywallFn, /待接入/);
  assert.match(paywallFn, /requestVipPurchase\(levelId, window\)/);
  assert.match(paywallFn, /requestVipRestore\(window\)/);
  assert.match(paywallFn, /已打开系统支付，请按提示完成开通/);
  assert.match(paywallFn, /正在向 App Store 检查已有购买/);
  assert.match(paywallFn, /正式 iPad 包内可恢复购买/);
  assert.match(paywallFn, /正式 iPad 包会打开 App Store 支付，当前预览不会扣费/);
  assert.match(paywallFn, /请在正式 iPad 包内完成 App Store 支付/);
  assert.doesNotMatch(paywallFn, /知道了/);
  assert.doesNotMatch(paywallFn, /第 \$\{levelId\} 关是会员关卡/);
  assert.match(source, /paidAccessMessage = `第 \$\{FREE_LEVEL_COUNT \+ 1\} 关起是会员关卡，后续课程内容会随更新开放。`/);
  assert.match(css, /\.paywall-dialog\s*\{/);
  assert.match(css, /\.paywall-card\s*\{/);
  assert.match(css, /\.vip-plan\s*\{/);
  assert.doesNotMatch(css, /\.vip-pay-method/);
  assert.match(css, /\.paywall-card \.vip-pay-button\s*\{/);
});

test('VIP payment requests native purchase bridge when available', () => {
  let iosPayload = null;
  const iosRuntime = {
    webkit: {
      messageHandlers: {
        babyIslandIAP: {
          postMessage(payload) {
            iosPayload = payload;
          },
        },
      },
    },
  };
  assert.equal(requestVipPurchase(11, iosRuntime), true);
  assert.deepEqual(iosPayload, { productId: 'baby_island_map_vip_001', levelId: 11 });

  let androidProduct = '';
  const androidRuntime = {
    BabyIslandIAP: {
      purchase(productId) {
        androidProduct = productId;
      },
    },
  };
  assert.equal(requestVipPurchase(12, androidRuntime), true);
  assert.equal(androidProduct, 'baby_island_map_vip_001');
  assert.equal(requestVipPurchase(13, {}), false);
});

test('VIP restore requests native restore bridge when available', () => {
  let iosPayload = null;
  const iosRuntime = {
    webkit: {
      messageHandlers: {
        babyIslandIAP: {
          postMessage(payload) {
            iosPayload = payload;
          },
        },
      },
    },
  };
  assert.equal(requestVipRestore(iosRuntime), true);
  assert.deepEqual(iosPayload, { productId: 'baby_island_map_vip_001', action: 'restore' });

  let androidProduct = '';
  const androidRuntime = {
    BabyIslandIAP: {
      restore(productId) {
        androidProduct = productId;
      },
    },
  };
  assert.equal(requestVipRestore(androidRuntime), true);
  assert.equal(androidProduct, 'baby_island_map_vip_001');
  assert.equal(requestVipRestore({}), false);
});

test('native VIP payment success callback activates and persists VIP state', () => {
  assert.deepEqual(activateVipPreferences({ mapMusic: false, childName: '小禾' }), {
    mapMusic: false,
    childName: '小禾',
    vipActive: true,
  });

  const source = read('script.js');
  assert.match(source, /function completeVipPurchase\(\)/);
  assert.match(source, /state\.preferences = activateVipPreferences\(state\.preferences\)/);
  assert.match(source, /localStorage\.setItem\(APP_PREFERENCES_KEY, JSON\.stringify\(state\.preferences\)\)/);
  assert.match(source, /closePaywallDialog\(\)/);
  assert.match(source, /showToast\('VIP 已开通，会员权益已生效'\)/);
  assert.match(source, /window\.BabyIslandIAPComplete = completeVipPurchase/);
  assert.match(source, /window\.babyIslandIAPComplete = completeVipPurchase/);
});

test('map course exposes two hundred preschool English levels', () => {
  assert.equal(levels.length, 200);
  assert.equal(new Set(levels.map(({ id }) => id)).size, 200);
  assert.deepEqual(levels.slice(0, 10).map(({ title }) => title), ['Mom', 'Dad', 'Grandma', 'Grandpa', 'Hand', 'Rice', 'Water', 'Car', 'Dog', 'Book']);
  assert.deepEqual(levels.slice(0, 10).map(({ zhTitle }) => zhTitle), ['妈妈', '爸爸', '奶奶', '爷爷', '手', '饭', '水', '车', '狗', '书']);
  const paidUnits = [
    ['水果先遣队', [['banana', '香蕉'], ['papaya', '木瓜'], ['mango', '芒果'], ['lemon', '柠檬'], ['kiwi', '猕猴桃'], ['apple', '苹果'], ['peach', '桃子'], ['pear', '梨'], ['grape', '葡萄'], ['coconut', '椰子']]],
    ['零食甜点', [['lollipop', '棒棒糖'], ['jelly', '果冻'], ['candy', '糖果'], ['cookie', '饼干'], ['chocolate', '巧克力'], ['ice cream', '冰激凌'], ['cake', '蛋糕'], ['donut', '甜甜圈'], ['popcorn', '爆米花'], ['honey', '蜂蜜']]],
    ['吃饭喝喝', [['egg', '鸡蛋'], ['bun', '包子'], ['bread', '面包'], ['milk', '牛奶'], ['juice', '果汁'], ['yogurt', '酸奶'], ['cheese', '奶酪'], ['soup', '汤'], ['noodle', '面条'], ['dumpling', '饺子']]],
    ['蔬菜大餐', [['tomato', '西红柿'], ['potato', '土豆'], ['pizza', '披萨'], ['burger', '汉堡'], ['salad', '沙拉'], ['carrot', '胡萝卜'], ['corn', '玉米'], ['pumpkin', '南瓜'], ['mushroom', '蘑菇'], ['sandwich', '三明治']]],
    ['萌宠动物', [['puppy', '小狗'], ['kitty', '小猫'], ['bunny', '小兔'], ['duck', '鸭子'], ['chick', '小鸡'], ['pig', '猪'], ['cow', '奶牛'], ['cat', '猫'], ['sheep', '绵羊'], ['horse', '马']]],
    ['大动物', [['panda', '熊猫'], ['koala', '考拉'], ['hippo', '河马'], ['monkey', '猴子'], ['tiger', '老虎'], ['lion', '狮子'], ['zebra', '斑马'], ['giraffe', '长颈鹿'], ['elephant', '大象'], ['kangaroo', '袋鼠']]],
    ['小小动物', [['butterfly', '蝴蝶'], ['fish', '鱼'], ['frog', '青蛙'], ['bee', '蜜蜂'], ['bird', '小鸟'], ['turtle', '乌龟'], ['crab', '螃蟹'], ['ant', '蚂蚁'], ['snail', '蜗牛'], ['ladybug', '瓢虫']]],
    ['我的身体', [['tummy', '小肚子'], ['eye', '眼睛'], ['ear', '耳朵'], ['nose', '鼻子'], ['mouth', '嘴巴'], ['head', '头'], ['hair', '头发'], ['foot', '脚'], ['leg', '腿'], ['arm', '手臂']]],
    ['穿衣出门', [['pajamas', '睡衣'], ['shoes', '鞋子'], ['socks', '袜子'], ['hat', '帽子'], ['dress', '裙子'], ['jacket', '夹克'], ['shirt', '上衣'], ['pants', '裤子'], ['coat', '外套'], ['boots', '靴子']]],
    ['玩具游戏', [['teddy bear', '泰迪熊'], ['bubble', '泡泡'], ['balloon', '气球'], ['ball', '球'], ['robot', '机器人'], ['doll', '娃娃'], ['kite', '风筝'], ['block', '积木'], ['puzzle', '拼图'], ['slide', '滑梯']]],
    ['身边的人', [['baby', '宝宝'], ['boy', '男孩'], ['girl', '女孩'], ['sister', '姐妹'], ['brother', '兄弟'], ['aunt', '阿姨'], ['uncle', '叔叔'], ['friend', '朋友'], ['teacher', '老师'], ['family', '家人']]],
    ['客厅卧室', [['sofa', '沙发'], ['bed', '床'], ['pillow', '枕头'], ['blanket', '被子'], ['lamp', '台灯'], ['clock', '时钟'], ['mirror', '镜子'], ['door', '门'], ['window', '窗户'], ['chair', '椅子']]],
    ['厨房餐桌', [['cup', '杯子'], ['bowl', '碗'], ['spoon', '勺子'], ['plate', '盘子'], ['bottle', '瓶子'], ['box', '盒子'], ['bag', '包'], ['table', '桌子'], ['fork', '叉子'], ['chopsticks', '筷子']]],
    ['洗漱浴室', [['potty', '小马桶'], ['shampoo', '洗发水'], ['soap', '肥皂'], ['towel', '毛巾'], ['tissue', '纸巾'], ['brush', '刷子'], ['comb', '梳子'], ['bathtub', '浴缸'], ['toilet', '马桶'], ['toothbrush', '牙刷']]],
    ['天气天空', [['moon', '月亮'], ['sun', '太阳'], ['star', '星星'], ['rainbow', '彩虹'], ['sky', '天空'], ['cloud', '云'], ['rain', '雨'], ['snow', '雪'], ['wind', '风'], ['umbrella', '雨伞']]],
    ['大自然', [['flower', '花'], ['tree', '树'], ['grass', '草地'], ['leaf', '树叶'], ['sea', '大海'], ['beach', '海滩'], ['shell', '贝壳'], ['sand', '沙子'], ['river', '河'], ['mountain', '山']]],
    ['交通工具', [['taxi', '出租车'], ['bus', '公交车'], ['bike', '自行车'], ['train', '火车'], ['plane', '飞机'], ['boat', '小船'], ['ship', '大船'], ['subway', '地铁'], ['scooter', '滑板车'], ['ambulance', '救护车']]],
    ['常去的场所', [['zoo', '动物园'], ['park', '公园'], ['home', '家'], ['farm', '农场'], ['school', '学校'], ['store', '商店'], ['playground', '游乐场'], ['supermarket', '超市'], ['hospital', '医院'], ['library', '图书馆']]],
    ['动作游戏', [['jump', '跳'], ['run', '跑'], ['swim', '游泳'], ['dance', '跳舞'], ['sing', '唱歌'], ['play', '玩'], ['eat', '吃'], ['drink', '喝'], ['walk', '走'], ['sleep', '睡觉']]],
  ];

  paidUnits.flatMap(([topic, words]) => words.map(([word, zhTitle]) => ({ topic, word, zhTitle })))
    .forEach((expected, index) => {
      const level = levels[index + 10];
      assert.equal(level.id, index + 11);
      assert.equal(level.topic, expected.topic);
      assert.equal(level.title.toLowerCase(), expected.word);
      assert.equal(level.zhTitle, expected.zhTitle);
    });
  assert.deepEqual(levels.slice(-3).map(({ title }) => title), ['Drink', 'Walk', 'Sleep']);
  assert.equal(new Set(levels.map(({ topic }) => topic)).size, 20);
  assert.equal(levels.filter((level) => /Colors|Numbers|Actions/.test(level.topic)).length, 0);
  assert.deepEqual(levels.filter((level) => ['love', 'bath', 'good night'].includes(level.title.toLowerCase())), []);
  levels.forEach((level) => assert.equal(level.options[level.correct].toLowerCase(), level.title.toLowerCase()));
  assert.deepEqual(levels[2], {
    id: 3,
    title: 'Grandma',
    zhTitle: '奶奶',
    topic: 'Free Starter · 免费体验',
    duration: '3 分钟',
    guidance: '看一看画面，听清并跟读 grandma。',
    question: 'Which word means 奶奶?',
    options: ['grandma', 'mom', 'grandpa', 'dad'],
    correct: 0,
    videoSrc: 'assets/video/free-levels/level-03-grandma.mp4?v=20260720-map-switch-cards-v13',
    videoMeta: {
      source: 'libtv',
      taskId: '20260718163203980876515',
      qa: 'no-lip-sync-book-narration',
      audio: 'native-libtv',
    },
  });
});

test('map worlds keep independent progress while castle is coming soon', () => {
  const source = read('script.js');
  const oceanLevels = levelsForMapWorld('ocean');
  const desertLevels = levelsForMapWorld('desert');
  const migratedProgress = normalizeWorldProgress({ completed: [1, 2], unlockedThrough: 3 });

  assert.equal(normalizeMapWorldId('missing'), 'ocean');
  assert.doesNotMatch(source, /function mapWorldForLevel/);
  assert.equal(oceanLevels.length, 200);
  assert.equal(desertLevels.length, 200);
  assert.deepEqual([oceanLevels[0].id, oceanLevels.at(-1).id], [1, 200]);
  assert.deepEqual([desertLevels[0].id, desertLevels.at(-1).id], [1, 200]);
  assert.deepEqual(migratedProgress.ocean, { completed: [1, 2], unlockedThrough: 3 });
  assert.deepEqual(migratedProgress.desert, { completed: [], unlockedThrough: 1 });
  assert.deepEqual(normalizeWorldProgress({
    ocean: { completed: [1], unlockedThrough: 2 },
    desert: { completed: [1, 2, 3], unlockedThrough: 4 },
  }), {
    ocean: { completed: [1], unlockedThrough: 2 },
    desert: { completed: [1, 2, 3], unlockedThrough: 4 },
    castle: { completed: [], unlockedThrough: 1 },
  });
  assert.match(desertLandmarkImage(1), /01-great-pyramid-complex/);
  assert.match(desertLandmarkImage(1), /v6-sand-blend/);
  assert.match(desertLandmarkImage(200), /10-monumental-city-gate/);
  assert.equal(MAP_WORLDS.ocean.startLevel, 1);
  assert.equal(MAP_WORLDS.ocean.endLevel, 200);
  assert.equal(MAP_WORLDS.desert.startLevel, 1);
  assert.equal(MAP_WORLDS.desert.endLevel, 200);
  assert.equal(MAP_WORLDS.ocean.title, '魔法海岛');
  assert.equal(MAP_WORLDS.desert.title, '沙漠奇境');
  assert.equal(MAP_WORLDS.castle.comingSoon, true);
  assert.match(source, /state\.progressByWorld\[nextWorldId\]/);
  assert.match(source, /JSON\.stringify\(state\.progressByWorld\)/);
  assert.match(source, /共 \$\{DISPLAY_LEVEL_COUNT\} 关/);
  assert.match(source, /const worldLevels = levelsForMapWorld\(activeWorldId\)/);
  assert.match(source, /const levelNodes = worldLevels\.map/);
  assert.doesNotMatch(source, /const levelNodes = levels\.map/);
  assert.match(source, /class="map-brand-card"/);
  assert.match(source, /class="eyebrow map-brand-kicker">\$\{activeWorld\.kicker\}/);
  assert.match(source, /<h1 id="map-title">\$\{activeWorld\.title\}<\/h1>/);
  assert.match(source, /class="map-level-chip"/);
  // 营销受众文案不属于游戏 HUD，已从头部移除
  assert.doesNotMatch(source, /learner-badge/);
  // 宝宝英语岛 remains in document.title but not as map h1
  assert.match(source, /宝宝英语岛/);
  assert.match(source, /data-map-world="\$\{activeWorld\.id\}"/);
  assert.match(source, /data-route-scroll/);
  assert.match(source, /data-locate-progress/);
  assert.match(source, /data-locate-progress[^>]*aria-label="定位到第 \$\{currentLevel\.id\} 关"/);
  assert.match(source, /class="locate-progress-icon"/);
  assert.doesNotMatch(source, /data-locate-progress>定位第/);
  assert.match(source, /routeScroll\.scrollTo/);
  assert.match(source, /resource-strip/);
  assert.equal((source.match(/class="resource-glyph(?:\s|")/g) || []).length, 2);
  assert.equal((source.match(/src="assets\/icons\/resource-star\.webp/g) || []).length, 1);
  assert.match(source, /resource-glyph--gem/);
  assert.match(source, /<small>宝石<\/small>/);
  const starIcon = path.join(__dirname, 'assets/icons/resource-star.webp');
  assert.ok(fs.existsSync(starIcon));
  assert.ok(fs.statSync(starIcon).size < 15_000);
  assert.doesNotMatch(source, /data-reward|今日奖励|完成\s*1\s*关领取|reward-chip|reward-icon|resource-reward/);
  const css = read('style.css');
  assert.doesNotMatch(css, /data-reward|今日奖励|完成\s*1\s*关领取|reward-chip|reward-icon|resource-reward/);
  assert.doesNotMatch(source, />[★♥🎁]</);
  assert.match(source, /class="ocean-loop[^"]*"[^>]*autoplay[^>]*muted[^>]*loop[^>]*playsinline/);
  assert.match(source, /class="ocean-loop[^"]*"[^>]*preload="auto"/);
  assert.match(source, /class="flying-seagull"[^>]*alt=""[^>]*aria-hidden="true"/);
  assert.match(source, /class="flying-seagull-pair"[\s\S]*?<img[\s\S]*?<img/);
  assert.doesNotMatch(source, /Math\.sin|route-svg/);
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/ocean/ocean-bg.webp')));
  const seagullAsset = path.join(__dirname, 'assets/ocean/seagull-fly.webp');
  assert.ok(fs.existsSync(seagullAsset));
  const seagullWebp = fs.readFileSync(seagullAsset);
  assert.ok(seagullWebp.includes(Buffer.from('ANIM')), 'seagull webp must be animated from LibTV frames');
  assert.ok(seagullWebp.includes(Buffer.from('ALPH')), 'seagull webp must keep green-screen transparency');
  assert.ok(seagullWebp.length > 200_000, 'seagull asset should be a real multi-frame flap loop');
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
  assert.match(source, /route\.type === 'map' && state\.preferences\.mapMusic/);
  assert.match(source, /const playPromise = mapMusic\.play\(\)/);
  assert.match(source, /mapMusic\.pause\(\)/);
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/audio/map-bgm.mp3')));
  Array.from({ length: 10 }, (_, index) => index + 1).forEach((number) => {
    assert.ok(fs.existsSync(path.join(__dirname, `assets/ocean/island-${String(number).padStart(2, '0')}.webp`)));
    const cutout = path.join(__dirname, `assets/ocean/scene-island-cutout-${String(number).padStart(2, '0')}.webp`);
    assert.ok(fs.existsSync(cutout));
    assert.ok(fs.statSync(cutout).size < 250_000);
  });
});

test('desert map uses the fixed 200 phrase curriculum', () => {
  const desert = levelsForMapWorld('desert');

  assert.equal(desert, desertLevels);
  assert.equal(desert.length, 200);
  assert.equal(new Set(desert.map(({ id }) => id)).size, 200);
  assert.deepEqual(desert.slice(0, 10).map(({ title }) => title), ['Good morning', 'How are you', 'See you later', 'Good night', 'Have fun', 'Goodbye', 'Thank you', "You're welcome", 'Excuse me', "I'm sorry"]);
  assert.deepEqual(desert.slice(0, 10).map(({ zhTitle }) => zhTitle), ['早上好', '你好吗', '待会儿见', '晚安', '玩得开心', '再见', '谢谢你', '不用谢', '打扰一下', '对不起']);
  assert.deepEqual(desert.slice(10, 20).map(({ topic }) => topic), Array(10).fill('课堂规则'));
  assert.equal(desert[20].title, 'Have breakfast');
  assert.equal(desert[60].title, "I'm happy");
  assert.equal(desert[140].title, 'By bus');
  assert.equal(desert[199].title, 'Be a writer');
  assert.equal(desert[199].zhTitle, '当作家');
  assert.equal(new Set(desert.map(({ topic }) => topic)).size, 20);
  desert.forEach((level) => assert.equal(level.options[level.correct], level.title));
  assert.deepEqual(levels.slice(0, 10).map(({ title }) => title), ['Mom', 'Dad', 'Grandma', 'Grandpa', 'Hand', 'Rice', 'Water', 'Car', 'Dog', 'Book']);
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
  const html = read('index.html');
  const worker = read('sw.js');
  assert.match(css, /min-height:\s*100dvh/);
  assert.match(css, /env\(safe-area-inset-(?:top|right|bottom|left)\)/);
  assert.doesNotMatch(css, /width:\s*min\(100%,\s*430px\)/);
  // 题型一正式答题页：视频阶段 → 答题阶段（横屏左右分栏）
  assert.match(css, /\.level-quiz\s*\{/);
  assert.match(css, /\.quiz-layout\s*\{[\s\S]*?grid-template-columns:\s*5fr\s+7fr/);
  assert.match(css, /@media\s*\(max-width:\s*760px\),\s*\(orientation:\s*portrait\)[\s\S]*?\.quiz-layout\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
  assert.match(script, /data-level-quiz|class="view level-quiz"/);
  assert.match(script, /data-stage-video[\s\S]*?data-stage-quiz/);
  assert.match(script, /data-play-overlay[\s\S]*?ended[\s\S]*?showQuizStage|video\.addEventListener\('ended'/);
  assert.match(script, /applyQuizAnswer\(state\.progress, level\.id/);
  assert.match(script, /__HAND_TAP_LOTTIE_DATA|hand-tap-data/);
  assert.match(script, /__CORRECT_CELEBRATION_LOTTIE_DATA|correct-celebration-data/);
  assert.match(script, /lottie\.loadAnimation|loadAnimation/);
  assert.match(html, /assets\/vendor\/lottie\.min\.js/);
  assert.match(html, /hand-tap-data\.js/);
  assert.match(html, /correct-celebration-data\.js\?v=20260718-correct-lottie-v1/);
  assert.doesNotMatch(script, /👆|🎉|👀|🎯|💪|⭐|✨|🌟|💫/);
  assert.doesNotMatch(script, /sparkBurst|spark-burst|cele-burst/);
  assert.match(css, /\.celebration-lottie,[\s\S]*?\.celebration-lottie svg\s*\{[\s\S]*?width:\s*clamp\(12rem, 32vh, 18rem\)/);
  assert.match(css, /\.hint-hand\s*\{[\s\S]*?width:\s*4\.75rem/);
  assert.match(css, /\.option-card\s*\{[\s\S]*?min-height:\s*96px/);
  assert.match(css, /\.option-card\s*\{[\s\S]*?min-width:\s*0[\s\S]*?overflow:\s*hidden/);
  // 答错/答对角标必须在卡内：option-card overflow:hidden，负 inset 会被裁成残缺小红点
  assert.match(css, /\.result-badge\s*\{[\s\S]*?top:\s*0\.55rem[\s\S]*?right:\s*0\.55rem/);
  assert.doesNotMatch(css, /\.result-badge\s*\{[^}]*\btop:\s*-\d/);
  assert.match(css, /\.option-card\.is-wrong \.result-badge::before\s*\{[\s\S]*?translate\(-50%,\s*-50%\)\s*rotate\(45deg\)/);
  assert.match(css, /\.option-card\.is-wrong \.result-badge::after\s*\{[\s\S]*?translate\(-50%,\s*-50%\)\s*rotate\(-45deg\)/);
  assert.match(css, /\.option-word\s*\{[\s\S]*?overflow-wrap:\s*anywhere[\s\S]*?word-break:\s*break-word/);
  assert.match(css, /\.option-card\.has-very-long-text \.option-word\s*\{[\s\S]*?font-size:\s*clamp\(0\.9rem/);
  assert.match(script, /card\.classList\.add\('has-long-text'\)/);
  assert.match(script, /card\.classList\.add\('has-very-long-text'\)/);
  assert.match(script, /<span class="option-word">\$\{escapeHtml\(wordText\)\}<\/span>/);
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
  assert.match(css, /\.route-ocean\s*\{[\s\S]*?front-ocean-bg-v2-libtv\.webp\?v=20260720-clean-ocean-v1/);
  assert.match(css, /\.route-ocean\s*\{[\s\S]*?container-type:\s*inline-size/);
  assert.match(css, /--level-stop-width:\s*min\(50cqw,\s*42rem\)/);
  assert.match(css, /\.route-ocean\[data-map-theme="ocean"\] \.route-stage\s*\{\s*--level-stop-width:\s*60cqw/);
  assert.match(css, /\.route-ocean\[data-map-theme="desert"\] \.route-stage\s*\{\s*--level-stop-width:\s*min\(62cqw,\s*62rem\)/);
  assert.match(css, /\.route-ocean\[data-map-theme="ocean"\] \.level-stop\.square-island \.island-art\s*\{\s*width:\s*30cqw/);
  assert.match(css, /egypt-desert-infinite-clean-bg-dreamina-v2\.png\?v=20260720-desert-infinite-v2/);
  assert.match(script, /egypt-desert-infinite-bg-libtv-v4\.mp4\?v=20260720-desert-bg-v4/);
  assert.match(css, /\.route-ocean\[data-map-theme="desert"\] \.ocean-loop--desert\s*\{[\s\S]*?height:\s*42%[\s\S]*?object-position:\s*center top[\s\S]*?mask-image:\s*linear-gradient\(to bottom,\s*#000 0 64%,\s*transparent 100%\)/);
  assert.match(css, /\.level-stop\[data-map-theme="desert"\] \.island-art\s*\{[\s\S]*?mask-image:\s*linear-gradient/);
  assert.match(css, /\.level-stop\[data-map-theme="desert"\] \.island-art\s*\{[\s\S]*?filter:\s*sepia\(0\.08\) saturate\(0\.84\)/);
  assert.match(css, /\.level-stop\[data-map-theme="desert"\]::before\s*\{[\s\S]*?radial-gradient\(ellipse at center,\s*rgba\(132,\s*83,\s*34,\s*0\.17\)/);
  assert.match(css, /\.level-stop\[data-map-theme="desert"\]::after\s*\{[\s\S]*?linear-gradient\(180deg,\s*rgba\(246,\s*216,\s*150,\s*0\)/);
  assert.doesNotMatch(`${script}\n${css}`, /egypt-railway-bg-libtv-v1|egypt-desert-rail-bg|lizard|蜥蜴/);
  assert.match(script, /data-desert-decor/);
  assert.match(script, /assets\/egypt-map\/cutouts\/decor\/runtime-v1\/\$\{asset\}\?v=20260720-desert-decor-v1/);
  assert.match(css, /\.desert-decor\s*\{[\s\S]*?width:\s*clamp\(3rem,\s*5\.8cqw,\s*6\.5rem\)/);
  assert.match(css, /\.desert-decor\s*\{[\s\S]*?background:\s*var\(--decor-image\) center bottom \/ contain no-repeat/);
  assert.match(worker, /assets\/egypt-map\/cutouts\/decor\/runtime-v1\/01-cactus-cluster\.webp\?v=20260720-desert-decor-v1/);
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v1/01-cactus-cluster.webp')));
  assert.doesNotMatch(`${script}\n${css}\n${worker}`, /vulture|desert-vulture|data-desert-vulture|data-vulture-clip|DESERT_VULTURE|scareDesertVulture/);
  assert.match(css, /\.island-art\s*\{[\s\S]*?background:\s*var\(--island-image\) center \/ contain no-repeat/);
  assert.doesNotMatch(css, /\.level-stop:has\(\.locked\) \.island-art\s*\{[\s\S]*?grayscale/);
  assert.match(script, /status === 'locked' \|\| status === 'premium' \? icons\.islandLock : ''/);
  assert.match(css, /\.island-lock\s*\{[\s\S]*?width:\s*clamp\(5\.75rem,\s*8\.5vw,\s*7rem\)[\s\S]*?border-radius:\s*50%[\s\S]*?background:\s*radial-gradient[\s\S]*?pointer-events:\s*none/);
  assert.match(css, /\.level-stop:not\(\.is-centered\) \.island-art\s*\{[\s\S]*?opacity:\s*0\.88/);
  assert.doesNotMatch(css.match(/\.island-art\s*\{([^}]*)\}/)?.[1] ?? '', /mask-image:/);
  assert.match(css, /\.level-stop\.is-centered \.island-art\s*\{[\s\S]*?scale\(1\.16\)/);
  assert.match(css, /@keyframes\s+island-jelly-pop[\s\S]*?scale\(1\.16\)/);
  assert.match(css, /\.level-stop\.is-centered \.island-art\s*\{[\s\S]*?island-ocean-float 4\.8s ease-in-out 0\.56s infinite/);
  assert.match(css, /@keyframes\s+island-ocean-float[\s\S]*?translate:\s*0 -0\.55rem/);
  assert.match(css, /\.level-stop\[data-map-theme="desert"\] \.island-art\s*\{[\s\S]*?width:\s*min\(48cqw,\s*40rem\)/);
  assert.match(css, /\.level-stop\[data-map-theme="desert"\]:not\(\.is-centered\) \.level-name\s*\{[\s\S]*?opacity:\s*0/);
  assert.match(css, /\.level-stop\[data-map-theme="desert"\]\.is-centered \.island-art\s*\{[\s\S]*?animation:\s*desert-landmark-pop 0\.46s ease-out both;/);
  assert.doesNotMatch(css, /desert-landmark-float/);
  assert.match(css, /\.map-game-active \.level-stop\[data-map-theme="desert"\] \.level-name\s*\{\s*top:\s*56%/);
  assert.match(css, /\.map-game-active \.route-ocean\[data-map-theme="desert"\] \.route-stage\s*\{[\s\S]*?--level-stop-width:\s*min\(62cqw,\s*62rem\)/);
  assert.match(css, /\.map-game-active \.toy-steamboat\.is-desert-rider\s*\{[\s\S]*?width:\s*clamp\(13rem,\s*23vw,\s*21rem\)[\s\S]*?bottom:\s*calc\(var\(--bottom-tabs-height\) \+ max\(0\.05rem/);
  assert.doesNotMatch(script, /scene-island-cutout/);
  assert.match(script, /assets\/islands-v1\/runtime\/island-\$\{islandId\}\.webp/);
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/islands-v1/runtime/island-003.webp')));
  assert.match(script, /function assetHref\(path\)/);
  assert.match(script, /new URL\(path, document\.baseURI\)\.href/);
  assert.match(script, /const islandImage = assetHref\(`assets\/islands-v1\/runtime\/island-\$\{islandId\}\.webp\?v=20260720-underwater-fade-v3`\)/);
  assert.match(css, /\.level-stop\.square-island \.island-art\s*\{[\s\S]*?top:\s*63%[\s\S]*?width:\s*min\(36cqw,\s*27rem\)[\s\S]*?aspect-ratio:\s*1[\s\S]*?-webkit-mask-image:\s*linear-gradient\([\s\S]*?transparent 100%/);
  assert.match(css, /\.level-stop\.square-island::after\s*\{[\s\S]*?z-index:\s*1[\s\S]*?repeating-linear-gradient[\s\S]*?pointer-events:\s*none/);
  assert.match(script, /data-current-boat/);
    assert.match(script, /assets\/ocean\/rowing-kids-boat-idle\.webp/);
    assert.match(script, /assets\/ocean\/rowing-kids-boat-sailing\.webp/);
    assert.match(script, /rowing-kids-boat-idle\.webp\?v=20260720-libtv-original-v3/);
    assert.doesNotMatch(script, /rowing-idle-static/);
    assert.doesNotMatch(script, /steam-puff/);
    assert.ok(fs.existsSync(path.join(__dirname, 'assets/ocean/rowing-kids-boat-idle.webp')));
    assert.ok(fs.existsSync(path.join(__dirname, 'assets/ocean/rowing-kids-boat-sailing.webp')));
    // Idle must stay animated (wave), not a single static frame.
    const idleWebp = fs.readFileSync(path.join(__dirname, 'assets/ocean/rowing-kids-boat-idle.webp'));
    const sailingWebp = fs.readFileSync(path.join(__dirname, 'assets/ocean/rowing-kids-boat-sailing.webp'));
    assert.ok(idleWebp.includes(Buffer.from('ANIM')), 'idle webp must be animated (ANIM chunk)');
    assert.ok(sailingWebp.includes(Buffer.from('ANIM')), 'sailing webp must be animated (ANIM chunk)');
    assert.ok(idleWebp.length > 500_000, 'idle animated webp should be a LibTV multi-frame loop, not a static still');
    assert.ok(sailingWebp.length > 500_000, 'sailing animated webp should be multi-frame, not a static still');
    assert.ok(fs.statSync(path.join(__dirname, 'assets/ocean/rowing-kids-boat-idle.webp')).size < 2_200_000);
    assert.ok(fs.statSync(path.join(__dirname, 'assets/ocean/rowing-kids-boat-sailing.webp')).size < 2_200_000);
    assert.doesNotMatch(script, /const delta = routeScroll\.scrollLeft - lastScrollLeft/);
    assert.doesNotMatch(script, /pendingBoatDirection|--boat-facing|recordBoatFacing/);
    assert.match(script, /const BOAT_HOLD_MS = 300/);
    assert.match(script, /const BOAT_SAIL_MS = 2800/);
    assert.match(script, /const eased = t/);
    assert.doesNotMatch(script, /1 - \(\(1 - t\) \*\* 3\)/);
    assert.match(script, /scheduleBoatCrossing/);
    assert.match(script, /startBoatSailToCenter/);
    assert.match(script, /currentBoat\.classList\.toggle\('is-sailing', isSailing\)/);
    assert.match(script, /data-boat-asset-idle/);
    assert.match(script, /data-boat-asset-sailing/);
    assert.match(css, /\.steamboat-asset--idle-video,[\s\S]*?\.steamboat-asset--sailing-video\s*\{\s*visibility:\s*hidden/);
    assert.match(css, /\.toy-steamboat\.has-idle-video:not\(\.is-sailing\) \.steamboat-asset--idle-video\s*\{\s*visibility:\s*visible/);
    assert.match(css, /\.toy-steamboat\.is-sailing \.steamboat-asset--sailing\s*\{\s*visibility:\s*visible/);
    assert.match(script, /setTimeout\(startBoatSailToCenter, BOAT_HOLD_MS\)/);
    assert.match(script, /boatPhase = 'holding'/);
    assert.match(script, /boatPhase = 'sailing'/);
    assert.match(script, /setProperty\('--boat-x'/);
    assert.match(script, /getStopOffsetX/);
    assert.match(script, /scheduleBoatCrossing\(travelDirection\);[\s\S]*?if \(!state\.preferences\.autoPronunciation\)/);
    assert.doesNotMatch(script, /settleBoatAfterScroll|if \(feedbackArmed\) setBoatSailing\(true\)|setTimeout\(\(\) => setBoatSailing\(false\), 620\)/);
    assert.doesNotMatch(script, /is-entering|--boat-enter-x|sailBoatToCenteredStop/);
    assert.doesNotMatch(script, /--boat-facing|pendingBoatDirection|scaleX\(var\(--boat-facing/);
    assert.match(script, /camel-walk-alpha-v2\.mov\?v=20260720-libtv-camel-v2/);
    assert.match(script, /camel-walk-alpha-v2\.webm\?v=20260720-libtv-camel-v2/);
    assert.match(script, /camel-walk-frame96-idle-v6\.png\?v=20260720-camel-idle-walkmatch-v6/);
    assert.match(script, /camel-idle-alpha-v6\.mov\?v=20260720-camel-idle-walkmatch-v6/);
    assert.match(script, /camel-idle-alpha-v6\.webm\?v=20260720-camel-idle-walkmatch-v6/);
    assert.match(script, /data-boat-idle-video/);
    assert.match(script, /idleVideo\.play\(\)[\s\S]*?has-idle-video/);
    assert.doesNotMatch(script, /if \(activeMapTheme === 'desert'\) \{\s*idleVideo\.pause\(\);\s*currentBoat\.classList\.remove\('has-idle-video'\);\s*\}/);
    assert.match(script, /centeredStop\.classList\.add\('is-centered'\);[\s\S]*?setBoatX\(0\);[\s\S]*?setBoatSailing\(false\);/);
    assert.match(script, /data-boat-video/);
    assert.match(script, /sailingVideo\.playbackRate = currentVehicle\.playbackRate \|\| 1/);
    assert.match(script, /const travelDirection = centeredStop\.offsetLeft < lastFeedbackStop\.offsetLeft \? -1 : 1/);
    assert.match(script, /setCamelFacing\(direction\)/);
    assert.match(script, /currentBoat\.classList\.add\('is-camel-turning'\)/);
    assert.match(script, /setProperty\('--camel-facing', String\(nextFacing\)\)/);
    assert.match(css, /\.toy-steamboat\.is-desert-rider \.steamboat-body\s*\{[\s\S]*?scaleX\(var\(--camel-facing, 1\)\)/);
    assert.match(css, /\.toy-steamboat\.is-desert-rider \.steamboat-body\s*\{[\s\S]*?animation:\s*none/);
    assert.doesNotMatch(css, /@keyframes\s+camel-map-idle/);
    assert.doesNotMatch(css, /\.toy-steamboat\.is-desert-rider\.is-camel-turning \.steamboat-body\s*\{/);
    assert.doesNotMatch(css, /transition:\s*opacity 90ms ease, filter 90ms ease, scale 90ms ease/);
    assert.match(css, /\.toy-steamboat\.is-desert-rider\.is-camel-turning::after\s*\{[\s\S]*?animation:\s*camel-turn-dust 260ms ease-out both/);
    assert.match(css, /@keyframes\s+camel-turn-dust[\s\S]*?opacity:\s*0\.84[\s\S]*?scaleX\(1\.12\)/);
    assert.doesNotMatch(css, /rotateY\(var\(--camel-yaw/);
    assert.ok(fs.statSync(path.join(__dirname, 'assets/egypt-map/cutouts/characters/libtv/camel-walk-alpha-v2.mov')).size > 1_000_000);
    assert.ok(fs.statSync(path.join(__dirname, 'assets/egypt-map/cutouts/characters/libtv/camel-walk-alpha-v2.webm')).size > 1_000_000);
    assert.ok(fs.statSync(path.join(__dirname, 'assets/egypt-map/cutouts/characters/runtime/camel-walk-frame96-idle-v6.png')).size > 100_000);
    assert.ok(fs.statSync(path.join(__dirname, 'assets/egypt-map/cutouts/characters/libtv/camel-idle-alpha-v6.mov')).size > 100_000);
    assert.ok(fs.statSync(path.join(__dirname, 'assets/egypt-map/cutouts/characters/libtv/camel-idle-alpha-v6.webm')).size > 100_000);
    assert.match(css, /\.toy-steamboat\s*\{[\s\S]*?pointer-events:\s*none/);
    assert.match(css, /\.boat-dock\s*\{[\s\S]*?position:\s*sticky[\s\S]*?z-index:\s*30/);
    assert.match(css, /\.toy-steamboat\s*\{[\s\S]*?z-index:\s*30/);
    assert.match(css, /\.toy-steamboat\s*\{[\s\S]*?--boat-x:\s*0px/);
    assert.match(css, /\.toy-steamboat\s*\{[\s\S]*?translate3d\(calc\(-50% \+ var\(--boat-x,\s*0px\)\),\s*-50%,\s*0\)/);
    assert.match(css, /\.toy-steamboat\.is-sailing::before\s*\{[\s\S]*?z-index:\s*0[\s\S]*?rgba\(0,\s*126,\s*151,\s*0\.58\)/);
    assert.match(css, /\.steamboat-body\s*\{[\s\S]*?z-index:\s*2/);
    assert.match(script, /route-canvas[\s\S]*?boat-dock[\s\S]*?data-current-boat[\s\S]*?route-stage/);
    assert.match(css, /\.route-canvas\s*\{[\s\S]*?display:\s*flex/);
    assert.match(css, /\.boat-dock\s*\{[\s\S]*?position:\s*sticky[\s\S]*?z-index:\s*30/);
    assert.match(css, /\.toy-steamboat\s*\{[\s\S]*?left:\s*50cqw/);
    assert.doesNotMatch(css, /\.toy-steamboat\.is-entering|@keyframes\s+steamboat-enter|--boat-enter-x/);
    assert.doesNotMatch(css, /--boat-facing|scaleX\(var\(--boat-facing/);
    assert.match(css, /\.steamboat-body\s*\{[\s\S]*?animation:\s*steamboat-bob/);
    assert.doesNotMatch(css.match(/\.steamboat-body\s*\{([^}]*)\}/)?.[1] ?? '', /transition:\s*transform|scaleX/);
    assert.doesNotMatch(css, /\.steamboat-hull|\.steamboat-cabin|\.steamboat-stack|\.steam-puff|steamboat-smoke/);
    assert.match(css, /@keyframes\s+steamboat-bob/);
    assert.doesNotMatch(css, /@keyframes\s+steamboat-row/);
    assert.match(css, /\.toy-steamboat\.is-sailing \.steamboat-body\s*\{[\s\S]*?animation-duration:\s*1\.1s/);
    assert.match(script, /rowing-kids-boat-sailing\.webp\?v=20260720-libtv-original-rowing-v3/);
    assert.match(script, /assets\/audio\/boat\/rowing-paddle\.mp3\?v=20260717-paddle-v1/);
    assert.match(script, /paddleBuffer\s*=\s*decoded|src\.playbackRate\.value\s*=\s*BOAT_PADDLE_RATE/);
    assert.match(script, /startPaddleSfx\(\)/);
    assert.match(script, /stopPaddleSfx\(\)/);
    assert.match(script, /const interruptBoatSail = \(\) =>/);
    assert.doesNotMatch(script, /const settledStop = boatHomeStop\?\.dataset\?\.stop \? boatHomeStop : centeredStop/);
    assert.match(script, /let boatHomeFrozen = false/);
    assert.match(script, /const freezeBoatHomeAtCurrentX = \(\) =>/);
    assert.match(script, /const interruptBoatSail = \(\) => \{[\s\S]*?freezeBoatHomeAtCurrentX\(\);[\s\S]*?cancelBoatSail\(\);/);
    assert.match(script, /else if \(!boatHomeFrozen\) \{\s*boatHomeStop = lastFeedbackStop;/);
    assert.match(script, /const getBoatDepartureStop = \(targetStop, direction\) =>/);
    assert.match(script, /const departIndex = targetIndex - \(direction < 0 \? -1 : 1\)/);
    assert.match(script, /centeredStop = nextStop;[\s\S]*?if \(boatPhase !== 'sailing'\) \{[\s\S]*?boatHomeStop = getBoatDepartureStop\(centeredStop, travelDirection\);/);
    assert.match(script, /boatHomeStop = getBoatDepartureStop\(centeredStop, travelDirection\)/);
    assert.doesNotMatch(script, /boatHomeStop = centeredStop;[\s\S]*?lastFeedbackStop = centeredStop;[\s\S]*?setBoatX\(0\)/);
    assert.match(script, /routeScroll\.addEventListener\('pointerdown', handleRouteIntent/);
    assert.match(script, /routeScroll\.addEventListener\('touchstart', handleRouteIntent/);
    assert.match(script, /routeScroll\.addEventListener\('wheel', handleRouteIntent/);
    assert.match(script, /routeScroll\.addEventListener\('keydown', handleRouteIntent\)/);
    assert.match(script, /decodeAudioData\(buf\)/);
    assert.match(script, /paddleAudio\.playbackRate\s*=\s*BOAT_PADDLE_RATE/);
    assert.match(script, /navigator\.vibrate\?\.\(30\)/);
    assert.match(script, /createOscillator\(\)/);
    assert.doesNotMatch(css, /background-attachment:\s*fixed/);
  });

test('landscape map promotes the ocean into a full-screen game stage', () => {
  const css = read('style.css');
  const source = read('script.js');

  assert.match(source, /document\.body\.classList\.toggle\('map-game-active', route\.type === 'map'\)/);
  assert.match(css, /body\.map-game-active\s*\{[\s\S]*?overflow:\s*hidden/);
  assert.match(css, /\.map-game-active \.app-shell\s*\{[\s\S]*?max-width:\s*none[\s\S]*?padding:\s*0/);
  assert.match(css, /\.map-game-active \.map-view \.route-card\.surface\s*\{[\s\S]*?inset:\s*0[\s\S]*?border:\s*0[\s\S]*?border-radius:\s*0/);
  assert.match(css, /\.map-game-active \.map-view \.route-ocean,[\s\S]*?\.map-game-active \.map-view \.route-scroll\s*\{[\s\S]*?height:\s*100%[\s\S]*?border-radius:\s*0/);
  assert.match(css, /\.map-game-active \.map-topbar\.surface\s*\{[\s\S]*?position:\s*absolute[\s\S]*?z-index:\s*8/);
  assert.match(css, /\.map-game-active \.bottom-tabs\s*\{[\s\S]*?background:\s*rgba\(248, 248, 240, 0\.94\)/);
  assert.match(css, /\.bottom-tabs\s*\{[\s\S]*?border-radius:\s*2rem/);
  assert.match(css, /\.tab-icon\s*\{/);
  assert.match(css, /\.tab-button\[aria-current="page"\]\s*\{[\s\S]*?var\(--mint\)/);
  assert.match(css, /@media \(min-width: 700px\) and \(max-width: 899px\) and \(orientation: landscape\)[\s\S]*?\.map-game-active \.route-stage\s*\{[\s\S]*?padding-top:/);
});

test('map-locate-btn inside route-ocean absolute with visible label', () => {
  const css = read('style.css');
  const script = read('script.js');

  // 1) position: absolute inside route-ocean, not fixed (must NOT be fixed within its own block)
  assert.match(css, /\.map-locate-btn\s*\{[^}]*?position:\s*absolute[^}]*?\}/);
  assert.doesNotMatch(css, /\.map-locate-btn\s*\{[^}]*?position:\s*fixed[^}]*?\}/);

  // 2) Proper z-index (above ocean but below dialog)
  assert.match(css, /\.map-locate-btn\s*\{[^}]*?z-index:\s*5/);

  // 3) Positioned at bottom-right of ocean container
  assert.match(css, /\.map-locate-btn\s*\{[^}]*?bottom:\s*clamp/);
  assert.match(css, /\.map-locate-btn\s*\{[^}]*?right:\s*clamp/);
  assert.match(css, /\.map-locate-btn\s*\{[^}]*?top:\s*auto/);

  // 4) data-current-level attribute in HTML for ::after label
  assert.match(script, /data-current-level=/);

  // 5) ::after label shows "第 N 关" text (base); immersive map hides it
  assert.match(css, /\.map-locate-btn::after\s*\{[^}]*?content:\s*\"第[\s\S]*?关\"/);
  assert.match(css, /\.map-game-active\s+\.map-locate-btn::after\s*\{[^}]*?display:\s*none/);

  // 6) Hit area ≥44px preserved
  assert.match(css, /\.map-locate-btn\s*\{[^}]*?min-width:\s*44px[^}]*?min-height:\s*44px/);

  // 7) focus-visible and aria unchanged
  assert.match(css, /\.map-locate-btn:focus-visible\s*\{[^}]*?outline:\s*3px\s+solid\s+var\(--mint\);\s*outline-offset:\s*3px/);
  assert.match(script, /aria-label="定位到第/);
  assert.match(script, /title="定位到当前关卡/);
});

test('initial map locate bypasses smooth scroll so boat docks at current level after refresh', () => {
  const script = read('script.js');

  assert.match(script, /const locateProgress = \(behavior = 'smooth'\) => \{/);
  assert.match(script, /const previousScrollBehavior = routeScroll\.style\.scrollBehavior/);
  assert.match(script, /if \(behavior === 'auto'\) routeScroll\.style\.scrollBehavior = 'auto'/);
  assert.match(script, /routeScroll\.scrollTo\(\{ left, behavior \}\)/);
  assert.match(script, /if \(behavior === 'auto'\) routeScroll\.style\.scrollBehavior = previousScrollBehavior/);
  assert.match(script, /requestAnimationFrame\(\(\) => \{[\s\S]*?locateProgress\('auto'\)[\s\S]*?setBoatX\(0\)/);
});

test('map stage vertical rhythm: name under island, boat above dock, locate FAB dock-aligned', () => {
  const css = read('style.css');

  // Level name anchors under island (top%), not to stage floor
  assert.match(css, /\.level-name\s*\{[^}]*?top:\s*76%[^}]*?bottom:\s*auto/);
  assert.match(css, /\.map-game-active\s+\.level-name\s*\{[^}]*?top:\s*74%[^}]*?bottom:\s*auto/);

  // Boat: bottom-anchored under dock (oar tips tuck); no top% drift across tablets
  assert.match(css, /\.toy-steamboat\s*\{[\s\S]*?--boat-half-h:\s*calc\(clamp\(10\.5rem,\s*17vw,\s*15rem\)\s*\*\s*0\.5625\)/);
  assert.match(css, /\.map-game-active\s+\.toy-steamboat\s*\{[\s\S]*?top:\s*auto/);
  assert.match(css, /\.map-game-active\s+\.toy-steamboat\s*\{[\s\S]*?bottom:\s*calc\(/);
  assert.match(css, /\.map-game-active\s+\.toy-steamboat\s*\{[\s\S]*?translate3d\(calc\(-50% \+ var\(--boat-x,\s*0px\)\),\s*0,\s*0\)/);

  // Island smaller + lower; level number floats above island art
  assert.match(css, /\.level-stop\.square-island \.island-art\s*\{[\s\S]*?top:\s*63%[\s\S]*?width:\s*min\(36cqw,\s*27rem\)/);
  assert.match(css, /\.level-node\s*\{[\s\S]*?top:\s*30%/);
  assert.match(css, /\.map-game-active\s+\.level-node\s*\{[^}]*?top:\s*31%/);

  // Locate FAB: dock-right companion, not stuck in screen corner
  assert.match(
    css,
    /\.map-game-active\s+\.map-locate-btn\s*\{[^}]*?right:\s*max\(2rem,\s*calc\(env\(safe-area-inset-right\)\s*\+\s*1\.5rem\)\)/,
  );
  assert.match(
    css,
    /\.map-game-active\s+\.map-locate-btn\s*\{[^}]*?bottom:\s*max\(2\.15rem,\s*calc\(env\(safe-area-inset-bottom\)\s*\*\s*0\.35\s*\+\s*2\.4rem\)\)/,
  );
  assert.match(css, /\.map-game-active\s+\.map-locate-btn\s*\{[^}]*?z-index:\s*15/);
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

  assert.deepEqual([1, 5, 6, 10, 11, 100, 200].map(islandStyleId), [1, 5, 1, 5, 1, 5, 5]);
  const source = read('script.js');
  assert.match(source, /assets\/islands-v1\/runtime\/island-\$\{islandId\}\.webp/);
  assert.match(source, /const islandId = String\(islandStyleId\(level\.id\)\)/);
  assert.match(source, /class="level-stop square-island \$\{stopClass\}"/);
  assert.doesNotMatch(source, /level\.id <= 10 \? ' square-island' : ''/);
  assert.doesNotMatch(source, /scene-island-cutout/);

  const css = read('style.css');
  assert.match(css, /\.level-stop\.square-island \.island-art\s*\{[\s\S]*?top:\s*63%[\s\S]*?aspect-ratio:\s*1/);
});

test('island words can be heard and learning states use child-readable icons', () => {
  const source = read('script.js');
  const css = read('style.css');

  assert.match(source, /data-speak-word="\$\{level\.title\}"/);
  assert.match(source, /aria-label="播放 \$\{level\.title\} 发音"/);
  assert.doesNotMatch(source, /new SpeechSynthesisUtterance\(word\)/);
  assert.doesNotMatch(source, /speechSynthesis\.speak\(utterance\)/);
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

  // 6) All map levels reuse the same .level-node class for completed/current/locked
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

  // 2) Removed payment/login dialog styles from the runtime surface.
  assert.doesNotMatch(read('script.js'), /accessPremium|data-access-purchase/);

  // 3) Dialog hero inline style — solid colour in script.js
  const script = read('script.js');
  const inlineBackgrounds = script.match(/background:[^;]*;/g);
  const hasGradient = inlineBackgrounds?.some(s => /gradient/i.test(s)) ?? false;
  assert.equal(hasGradient, false,
    'No inline background gradient must exist in script.js dialog heroes');

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
  assert.ok(manifest.speaker.includes('natasha'), 'Must use Natasha speaker');
  assert.equal(manifest.audio_format, 'mp3');
  assert.equal(manifest.sample_rate, 24000);
  assert.ok(Array.isArray(manifest.entries));
  const uniqueWords = new Set(levels.map(level => level.title.toLowerCase()));
  assert.equal(manifest.entries.length, uniqueWords.size, 'Must cover all unique current words');
  assert.ok(typeof manifest.summary === 'object');
  assert.ok(typeof manifest.summary.total === 'number');
  assert.equal(manifest.summary.total, uniqueWords.size);
  assert.ok(typeof manifest.summary.generated === 'number');
  assert.ok(typeof manifest.summary.skipped === 'number');
  assert.ok(typeof manifest.summary.available === 'number');
  assert.equal(
    manifest.summary.available,
    manifest.entries.filter((entry) => entry.status === 'generated').length
  );
  assert.ok(typeof manifest.summary.failed === 'number');
  assert.ok(typeof manifest.summary.levels === 'number');
  assert.equal(manifest.summary.levels, 200);
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

test('manifest matches current 200-level course word mapping', () => {
  const manifest = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'assets', 'audio', 'words', 'word-audio-manifest.json'), 'utf8'));

  const expectedByWord = new Map();
  levels.forEach((level) => {
    const word = level.title.toLowerCase();
    if (!expectedByWord.has(word)) expectedByWord.set(word, []);
    expectedByWord.get(word).push(level.id);
  });

  assert.equal(manifest.entries.length, expectedByWord.size, 'Must have all unique current words');

  // Check first 10
  levels.slice(0, 10).forEach((level, index) => {
    const word = level.title.toLowerCase();
    assert.equal(manifest.entries[index].word, word);
    assert.deepEqual(manifest.entries[index].level_ids, expectedByWord.get(word));
  });

  const byWord = new Map(manifest.entries.map(entry => [entry.word, entry]));
  expectedByWord.forEach((levelIds, word) => {
    assert.deepEqual(byWord.get(word)?.level_ids, levelIds, `${word} level_ids`);
  });
  assert.equal(manifest.entries.at(-1).word, 'sleep');
  assert.deepEqual(manifest.entries.at(-1).level_ids, [200]);

  // Verify all level IDs 1-200 are covered exactly once
  const allIds = manifest.entries.flatMap(e => e.level_ids).sort((a, b) => a - b);
  assert.deepEqual(allIds, Array.from({ length: 200 }, (_, i) => i + 1));
});

test('script.js loads word-audio manifest and uses only local MP3 for word pronunciation', () => {
  const source = read('script.js');

  // Must reference manifest loading
  assert.match(source, /word-audio-manifest\.json/);
  assert.match(source, /WORD_AUDIO_MANIFEST_VERSION = '20260720-word-manifest-200-v1'/);
  assert.match(source, /loadWordAudioManifest\(\)/);
  assert.match(source, /wordAudioMap/);

  // Must prefer local URL and avoid browser/system TTS fallback
  assert.match(source, /localUrl = wordAudioSrcFor\(word\)/);
  assert.match(source, /优先本地 MP3/);

  // Must create Audio element for local playback
  assert.match(source, /new Audio\(\)/);
  assert.match(source, /localAudioEl\.play/);

  // Must duck BGM for local audio
  assert.match(source, /localAudioEl\.volume = WORD_AUDIO_VOLUME/);
  assert.match(source, /mapMusic\.volume = MAP_MUSIC_DUCK_VOLUME/);

  // Must cancel local audio on cancelWordPronunciation
  assert.match(source, /localAudioEl\.pause\(\)/);
  assert.match(source, /localAudioEl\.currentTime = 0/);

  assert.doesNotMatch(source, /speechSynthesis\.speak\(utterance\)/);
  assert.doesNotMatch(source, /new SpeechSynthesisUtterance\(word\)/);
});

test('papaya has generated local word audio so level 12 pronunciation is enabled', () => {
  const html = read('index.html');
  const worker = read('sw.js');
  const manifest = JSON.parse(read('assets/audio/words/word-audio-manifest.json'));
  const papaya = manifest.entries.find((entry) => entry.word === 'papaya');
  const papayaPath = path.join(__dirname, 'assets', 'audio', 'words', 'papaya.mp3');

  assert.equal(levels[11].title, 'Papaya');
  assert.equal(papaya?.status, 'generated');
  assert.deepEqual(papaya?.level_ids, [12]);
  assert.equal(papaya?.url, 'assets/audio/words/papaya.mp3');
  assert.ok(fs.existsSync(papayaPath));
  assert.ok(fs.statSync(papayaPath).size > 1_000);
  assert.match(html, /word-audio-manifest\.js\?v=20260720-word-manifest-200-v1/);
  assert.match(worker, /word-audio-manifest\.json\?v=20260720-word-manifest-200-v1/);
});

test('quiz question narration uses per-level Peppa local MP3 for released free levels', () => {
  const source = read('script.js');
  const html = read('index.html');
  const worker = read('sw.js');
  const rootPackage = JSON.parse(read('package.json'));
  const backendPackage = JSON.parse(read('backend/package.json'));
  const generatorSource = read('backend/src/generate-question-audio-v2.js');
  const manifest = JSON.parse(read('assets/audio/questions-holly/question-audio-manifest.json'));

  assert.equal(questionPromptText(levels[2]), '小朋友，视频里学到的单词，哪一个是奶奶的意思？');
  assert.equal(manifest.version, '20260719-question-200-nouns-v2');
  assert.equal(manifest.speaker, 'zh_female_peiqi_uranus_bigtts');
  assert.ok(manifest.entries.length >= 10);
  assert.ok(manifest.summary.available >= 10);
  assert.match(source, /QUESTION_AUDIO_VERSION = '20260719-question-200-nouns-v2'/);
  assert.match(source, /function questionAudioSrcFor\(level\)/);
  assert.match(source, /level-\$\{String\(level\.id\)\.padStart\(2, '0'\)\}-\$\{slug\}\.mp3\?v=\$\{QUESTION_AUDIO_VERSION\}/);
  assert.match(source, /const questionSpoken = questionPromptText\(level\)/);
  assert.match(source, /听题目：\$\{escapeHtml\(questionSpoken\)\}/);
  assert.match(source, /playFileAudio\(listenQuestionBtn, questionAudio, QUESTION_AUDIO_VOLUME\)/);
  assert.doesNotMatch(source, /QUESTION_AUDIO_SRC\s*=\s*\{/);
  assert.doesNotMatch(html, /question-audio-manifest\.js/);
  assert.equal(rootPackage.scripts['generate:question-audio'], 'node backend/src/generate-question-audio-v2.js');
  assert.equal(backendPackage.scripts['generate-question-audio'], 'node src/generate-question-audio-v2.js');
  assert.match(generatorSource, /zh_female_peiqi_uranus_bigtts/);
  assert.match(generatorSource, /synthesizeVoice/);

  levels.slice(0, 10).forEach((level) => {
    const audioName = `level-${String(level.id).padStart(2, '0')}-${level.title.toLowerCase().replace(/\s+/g, '-')}.mp3`;
    const audioPath = path.join(__dirname, 'assets', 'audio', 'questions-holly', audioName);
    const manifestEntry = manifest.entries[level.id - 1];
    assert.equal(manifestEntry.level, level.id);
    assert.equal(manifestEntry.file, `assets/audio/questions-holly/${audioName}`);
    assert.equal(manifestEntry.text, questionPromptText(level));
    assert.ok(fs.existsSync(audioPath), `${audioName} must exist`);
    assert.ok(fs.statSync(audioPath).size > 10_000, `${audioName} must have question narration`);
    assert.ok(worker.includes(`assets/audio/questions-holly/${audioName}?v=20260719-question-200-nouns-v2`));
  });
});

test('quiz feedback uses Holly local MP3 instead of Chinese system TTS', () => {
  const source = read('script.js');
  const html = read('index.html');
  const worker = read('sw.js');
  const correctPath = path.join(__dirname, 'assets', 'audio', 'feedback-holly', 'correct.mp3');
  const wrongPath = path.join(__dirname, 'assets', 'audio', 'feedback-holly', 'wrong.mp3');

  assert.ok(fs.existsSync(correctPath));
  assert.ok(fs.statSync(correctPath).size > 1_000);
  assert.ok(fs.existsSync(wrongPath));
  assert.ok(fs.statSync(wrongPath).size > 1_000);
  assert.match(source, /FEEDBACK_AUDIO_SRC = \{[\s\S]*?correct: 'assets\/audio\/feedback-holly\/correct\.mp3\?v=20260718-holly-feedback-v1'/);
  assert.match(source, /wrong: 'assets\/audio\/feedback-holly\/wrong\.mp3\?v=20260718-holly-feedback-v1'/);
  assert.match(source, /playFileAudio\(feedback, FEEDBACK_AUDIO_SRC\.correct, FEEDBACK_AUDIO_VOLUME\)/);
  assert.match(source, /playFileAudio\(feedback, FEEDBACK_AUDIO_SRC\.wrong, FEEDBACK_AUDIO_VOLUME\)/);
  assert.match(source, /\}, 2600\)/);
  assert.match(source, /\}, 3400\)/);
  assert.doesNotMatch(source, /function speakChinese|SpeechSynthesisUtterance\(text\)|speakChinese\(/);
  assert.match(html, /script\.js\?v=20260720-camel-idle-walkmatch-v1/);
  assert.match(worker, /assets\/audio\/feedback-holly\/correct\.mp3\?v=20260718-holly-feedback-v1/);
  assert.match(worker, /assets\/audio\/feedback-holly\/wrong\.mp3\?v=20260718-holly-feedback-v1/);
});

test('first ten free levels use local 15s videos and Natasha word MP3s', () => {
  const source = read('script.js');
  const html = read('index.html');
  const worker = read('sw.js');

  const freeWords = ['mom', 'dad', 'grandma', 'grandpa', 'hand', 'rice', 'water', 'car', 'dog', 'book'];
  freeWords.forEach((word, index) => {
    const videoName = `level-${String(index + 1).padStart(2, '0')}-${word}.mp4`;
    const videoPath = path.join(__dirname, 'assets', 'video', 'free-levels', videoName);
    const wordPath = path.join(__dirname, 'assets', 'audio', 'words', `${word}.mp3`);
    assert.ok(fs.existsSync(videoPath), `${videoName} must exist`);
    assert.ok(fs.statSync(videoPath).size > 6_000_000, `${videoName} must be the LibTV scene video, not the old card placeholder`);
    assert.ok(fs.existsSync(wordPath), `${word}.mp3 must exist`);
    assert.ok(fs.statSync(wordPath).size > 1_000, `${word}.mp3 must have audio data`);
    assert.ok(source.includes(`videoSrc: \`assets/video/free-levels/${videoName}?v=\${FREE_LEVEL_VIDEO_VERSION}\``));
    assert.ok(worker.includes(`assets/video/free-levels/${videoName}?v=20260720-map-switch-cards-v13`));
    assert.ok(worker.includes(`assets/audio/words/${word}.mp3`), `${word}.mp3 must be available offline for quiz option playback`);
  });

  assert.match(source, /FREE_LEVEL_VIDEO_VERSION = '20260720-map-switch-cards-v13'/);
  assert.doesNotMatch(source, /interactive-examples\.mdn\.mozilla\.net|flower\.mp4|flowerVideoUrl/);
  assert.match(source, /src="\$\{level\.videoSrc\}"/);
  assert.match(source, /data-video-source="\$\{level\.videoMeta\?\.source \|\| 'local'\}"/);
  assert.match(source, /data-video-task-id="\$\{level\.videoMeta\?\.taskId \|\| ''\}"/);
  assert.match(source, /data-video-qa="\$\{level\.videoMeta\?\.qa \|\| ''\}"/);
  assert.match(source, /data-video-audio="\$\{level\.videoMeta\?\.audio \|\| ''\}"/);
  assert.match(source, /wordAudioSrcFor\(word\)/);
  assert.match(html, /script\.js\?v=20260720-camel-idle-walkmatch-v1/);
});

test('new paid course table does not bind stale pear and grape videos to levels 11 and 12', () => {
  const source = read('script.js');
  const worker = read('sw.js');

  assert.equal(levels[10].id, 11);
  assert.equal(levels[10].title, 'Banana');
  assert.equal(levels[10].zhTitle, '香蕉');
  assert.equal(levels[10].videoSrc, undefined);
  assert.equal(levels[11].id, 12);
  assert.equal(levels[11].title, 'Papaya');
  assert.equal(levels[11].zhTitle, '木瓜');
  assert.equal(levels[11].videoSrc, undefined);
  assert.doesNotMatch(source, /level-11-pear\.mp4|level-12-grape\.mp4/);
  assert.doesNotMatch(worker, /level-11-pear|level-12-grape/);
});

test('grandma lesson video carries LibTV no-lip-sync QA metadata in the page program', () => {
  const source = read('script.js');
  const grandma = levels[2];

  assert.deepEqual(grandma.videoMeta, {
    source: 'libtv',
    taskId: '20260718163203980876515',
    qa: 'no-lip-sync-book-narration',
    audio: 'native-libtv',
  });
  assert.doesNotMatch(source, /grandma-bad-redub|grandma-original-audio|post[- ]?dub|后期硬换音轨/);
});

test('word-audio button is enabled only when local MP3 is available', () => {
  const localAudioUrls = { hello: 'assets/audio/words/hello.mp3', red: 'assets/audio/words/red.mp3', 'ice cream': 'assets/audio/words/ice_cream.mp3' };

  assert.equal(wordButtonDisabled('hello', true, localAudioUrls), false);
  assert.equal(wordButtonDisabled('hello', true, {}), true);
  assert.equal(wordButtonDisabled('flower', true, localAudioUrls), true);
  assert.equal(wordButtonDisabled('flower', true, {}), true);

  assert.equal(wordButtonDisabled('hello', false, localAudioUrls), false);   // has local → enabled
  assert.equal(wordButtonDisabled('red', false, localAudioUrls), false);     // has local → enabled
  assert.equal(wordButtonDisabled('ice cream', false, localAudioUrls), false); // extra local → enabled
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

  // renderMap template enables only words backed by a local MP3
  assert.match(source, /wordHasLocalAudio\(level\.title\) \? '' : ' disabled'/);

  // wordHasLocalAudio bridges runtime wordAudioMap with the pure decision
  assert.match(source, /function wordHasLocalAudio\(/);
  assert.match(source, /if \(!wordHasLocalAudio\(centeredStop\.dataset\.word\)\) return;/);

  // manifest load callback updates ALL buttons after async fetch
  assert.match(source, /document\.querySelectorAll\('\[data-speak-word\]'\)\.forEach/);
  assert.match(source, /button\.disabled = !wordHasLocalAudio\(w\)/);

  // playWordPronunciation never falls back to browser/system TTS
  assert.match(source, /if \(!word\) return false/);
  assert.doesNotMatch(source, /降级.*speechSynthesis/);
  assert.match(source, /new Audio\(\)/);
  assert.match(source, /localAudioEl\.play/);
  assert.match(source, /mapMusic\.volume = MAP_MUSIC_DUCK_VOLUME/);
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

test('word-audio manifest covers current course words and only marks real local MP3s generated', () => {
  // The manifest was generated by generate-word-audio-v2.js with V3 Natasha voice
  const manifest = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'assets', 'audio', 'words', 'word-audio-manifest.json'), 'utf8'));
  const uniqueWords = new Set(levels.map(level => level.title.toLowerCase()));

  assert.equal(manifest.version, '2.0');
  assert.equal(manifest.summary.total, uniqueWords.size);
  assert.equal(manifest.summary.failed, 0);
  assert.equal(manifest.summary.levels, 200);

  const generatedEntries = manifest.entries.filter((entry) => entry.status === 'generated');
  assert.equal(manifest.summary.available, generatedEntries.length);
  assert.ok(generatedEntries.length >= 100, 'First production batch must remain available');

  generatedEntries.forEach((entry) => {
    assert.equal(entry.status, 'generated');
    assert.ok(entry.size_bytes > 0);
    assert.ok(entry.cache_key.includes(manifest.speaker));
    const mp3File = path.join(__dirname, entry.url);
    assert.ok(fs.existsSync(mp3File));
    assert.equal(fs.statSync(mp3File).size, entry.size_bytes);
  });

  manifest.entries.filter((entry) => entry.status !== 'generated').forEach((entry) => {
    assert.equal(entry.size_bytes, 0);
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

  // Must contain the current first and last course words.
  assert.ok(content.includes('"mom"'), 'Must contain current first word');
  assert.ok(content.includes('"sleep.mp3"') || content.includes('"sleep"'), 'Must contain last word');
});

test('JS manifest and JSON manifest have same entries with same URLs', () => {
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
  assert.equal(jsManifest.entries.length, new Set(levels.map(level => level.title.toLowerCase())).size,
    'Must have one entry per unique current word');

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
  assert.equal(jsManifest.summary.total, new Set(levels.map(level => level.title.toLowerCase())).size);
  assert.equal(jsManifest.summary.levels, 200);
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
  assert.match(html, /word-audio-manifest\.js\?v=20260720-word-manifest-200-v1/);
  assert.ok(scriptMatch, 'index.html must reference script.js');

  // word-audio-manifest.js must appear before script.js in the file
  const jsIndex = html.indexOf('word-audio-manifest.js');
  const scriptIndex = html.indexOf('script.js');
  assert.ok(jsIndex < scriptIndex,
    'word-audio-manifest.js must be loaded BEFORE script.js');
});

test('script.js reads window.WORD_AUDIO_MANIFEST first (file:// compatibility)', () => {
  const source = read('script.js');
  const manifestFunction = source.match(/function loadWordAudioManifest\(\) \{[\s\S]*?\n  \}/)?.[0] || '';

  // Must check window.WORD_AUDIO_MANIFEST before fetch
  assert.match(manifestFunction, /window\.WORD_AUDIO_MANIFEST/,
    'script.js must check window.WORD_AUDIO_MANIFEST');
  assert.match(manifestFunction, /优先.*全局.*JS.*manifest/,
    'Must have comment explaining priority JS manifest path');
  assert.match(manifestFunction, /file:\/\//,
    'Must mention file:// protocol in comment');
  // fetch must still exist for HTTP fallback
  assert.match(manifestFunction, /word-audio-manifest\.json/,
    'Must still have JSON fetch fallback');
  assert.match(manifestFunction, /\.catch\(/,
    'Must have catch on fetch');
});

test('script.js fetch failure does NOT clear existing wordAudioMap', () => {
  const source = read('script.js');
  const manifestFunction = source.match(/function loadWordAudioManifest\(\) \{[\s\S]*?\n  \}/)?.[0] || '';

  // In the catch handler, there must be no reference to clearing wordAudioMap
  const catchMatch = manifestFunction.match(/\.catch\(\(\)\s*=>\s*\{[\s\S]*?\}\)/);
  assert.ok(catchMatch, 'Must have fetch catch block');
  assert.doesNotMatch(catchMatch[0], /wordAudioMap\s*=/, 'Catch must not clear wordAudioMap');
  assert.match(catchMatch[0], /file:\/\//, 'Catch must mention file:// scenario');
});

test('playWordPronunciation uses local Audio and rejects missing local MP3', () => {
  const source = read('script.js');

  // Must check localUrl first
  assert.match(source, /localUrl = wordAudioSrcFor\(word\)/,
    'Must look up local URL');
  assert.match(source, /if \(localUrl\) \{/,
    'Must have local URL check');
  assert.match(source, /localAudioEl\.play\(\)/,
    'Must play local audio');
  const localBlock = source.match(/if \(localUrl\) \{[\s\S]*?\n  \}/);
  assert.ok(localBlock, 'Must have local URL block');
  assert.match(source, /if \(localUrl\) \{[\s\S]*?localAudioEl\.play\(\)\.catch\(restoreMusic\);[\s\S]*?return true;[\s\S]*?\n    \}\n\n    return false;/);
  assert.doesNotMatch(source, /new SpeechSynthesisUtterance\(word\)/);
});

test('generator exports generateJsManifestContent and produces valid output', () => {
  const { generateJsManifestContent, extractWordEntries, cacheKey } = require('./backend/src/generate-word-audio-v2.js');

  const entries = extractWordEntries();
  const mockManifest = {
    version: '2.0',
    generated_at: new Date().toISOString(),
    speaker: 'en_female_natasha_uranus_bigtts',
    voice_type: 'en_female_natasha_uranus_bigtts',
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
    summary: { total: entries.length, generated: entries.length, skipped: 0, available: entries.length, failed: 0, not_attempted: 0, levels: 200, speaker: 'en_female_natasha_uranus_bigtts' },
  };

  const result = generateJsManifestContent(mockManifest);
  assert.match(result, /^window\.WORD_AUDIO_MANIFEST /, 'Must start with window.WORD_AUDIO_MANIFEST');
  assert.match(result, /;\n$/, 'Must end with semicolon + newline');

  // Parse the payload back
  const payloadMatch = result.match(/window\.WORD_AUDIO_MANIFEST = (\{[\s\S]*?});?\n?$/);
  assert.ok(payloadMatch, 'Must contain JSON payload');
  const parsed = JSON.parse(payloadMatch[1]);
  assert.equal(parsed.entries.length, entries.length, 'Must have one entry per unique current word');
  assert.equal(parsed.summary.total, entries.length, 'Summary must match');
  assert.equal(parsed.speaker, 'en_female_natasha_uranus_bigtts', 'Speaker must match');
  // SHA256 and cache_key must NOT be in JS manifest
  parsed.entries.forEach((entry) => {
    assert.ok(!entry.sha256, 'JS manifest must NOT contain sha256');
    assert.ok(!entry.cache_key, 'JS manifest must NOT contain cache_key');
  });
});

// ─── 航程胶囊 HUD（珍珠里程碑）测试 ──────────────────────

test('renderCompactJourney builds voyage capsule with 5 pearl milestones', () => {
  const source = read('script.js');
  assert.match(source, /renderCompactJourney/);
  assert.match(source, /msCheck\s*=\s*\[1,\s*2,\s*3,\s*4,\s*5\]\.map/);
  assert.match(source, /\(mVal \/ totalLevels\) \* 100/);
  assert.match(source, /class="j-capsule"/);
  assert.match(source, /class="j-badge/);
  assert.match(source, /class="j-pearls"/);
  assert.match(source, /j-pearl--/);
  assert.doesNotMatch(source, /j-boat/);
  assert.doesNotMatch(source, /j-treasure/);
  assert.doesNotMatch(source, /j-svg/);
});

test('compact journey handles all progress states: zero, mid, and completed total', () => {
  const source = read('script.js');
  assert.match(source, /allCompleted/);
  // states assembled as j-pearl-- + done|pending|active
  assert.match(source, /j-pearl--['"]?\s*\+\s*state|state\s*=\s*['"]done['"]/);
  assert.match(source, /state\s*=\s*['"]done['"]/);
  assert.match(source, /state\s*=\s*['"]pending['"]/);
  assert.match(source, /state\s*=\s*['"]active['"]/);
  assert.match(source, /nextMilestone/);
  assert.match(source, /群岛通关/);
  assert.match(source, /j-count/);
  assert.match(source, /j-slash/);
  assert.match(source, /j-badge-num/);
  assert.match(source, /下一阶段/);
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
  // map-brand still has the active world's title
  assert.match(source, /<h1 id="map-title">\$\{activeWorld\.title\}<\/h1>/);
});

test('front-end app surface has no SMS login UI and keeps account runtime for learning sync only', () => {
  const source = read('script.js');
  const html = read('index.html');
  const worker = read('sw.js');

  assert.doesNotMatch(source, /function validatePhone|function validateCode|handleSmsLogin|handleLogout/);
  assert.doesNotMatch(source, /sms-login|data-sms-|clearToken|sessionStorage/);
  assert.match(source, /babyIslandApi/);
  assert.match(source, /checkSession/);
  assert.match(source, /hydrateLearningStateFromBackend/);
  assert.doesNotMatch(source, /openAccessDialog|data-access-purchase|payment-required|login-required/);
  assert.match(source, /function openPaywallDialog/);
  assert.match(source, /paywall-dialog/);
  assert.match(html, /auth\/apiClient\.js\?v=20260720-learning-sync-v1/);
  assert.doesNotMatch(html, /data-access-dialog/);
  assert.doesNotMatch(read('style.css'), /sms-login|data-kind="login"|logout-button|setting-row-logout|profile-login-button|access-hero\.login/);
  assert.match(worker, /auth\/apiClient\.js\?v=20260720-learning-sync-v1/);
  assert.doesNotMatch(worker, /babyIslandApi|sms-login/);
});

// ─── responsive / narrow-screen journey layout test ─────────

test('compact journey responsive structure: narrow screens simplify but keep key info', () => {
  const css = read('style.css');
  // Responsive map-topbar grid breakpoints
  assert.match(css, /@media\s*\(max-width:\s*899px\)[\s\S]*?grid-template-columns/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)/);
  // Narrow map hides side HUDs so the brand/current-level chip cannot be clipped.
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?grid-template-areas:\s*"brand"/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.map-game-active \.journey-compact,[\s\S]*?\.map-game-active \.resource-strip\s*\{[\s\S]*?display:\s*none/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.map-game-active \.map-level-chip\s*\{[\s\S]*?text-overflow:\s*ellipsis/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.map-game-active \.level-name\s*\{[\s\S]*?top:\s*64%/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.map-game-active \.word-audio-button\s*\{[\s\S]*?width:\s*3rem/);
  assert.match(css, /@media\s*\(orientation:\s*portrait\)[\s\S]*?\.map-game-active \.map-locate-btn\s*\{[\s\S]*?bottom:\s*calc\(var\(--bottom-tabs-height\) \+ max\(0\.75rem, env\(safe-area-inset-bottom\)\)\)/);
  assert.match(css, /\.j-capsule/);
  assert.match(css, /\.j-pearl/);
  // Narrow hides locate label
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?map-locate-btn::after[\s\S]*?display:\s*none/);
  // prefers-reduced-motion respected
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /animation-duration:\s*0\.01ms/);
});

// ─── 地图切换入口恢复保护 ───────────────────────────────────

test('map switch entry opens the world picker', () => {
  const source = read('script.js');
  const css = read('style.css');

  assert.match(source, /mapSwitch:/);
  assert.match(source, /viewBox="0 0 48 48"/);
  assert.match(source, /function openMapSwitchDialog\(trigger = null\)/);
  assert.match(source, /data-map-switch/);
  assert.match(source, /openMapSwitchDialog\(event\.currentTarget\)/);
  assert.match(source, /选择冒险世界/);
  assert.match(source, /data-map-world/);
  assert.match(source, /class="map-switch-btn"/);
  assert.match(css, /\.map-switch-btn\s*\{/);
  assert.match(css, /\.map-switch-btn svg\s*\{[\s\S]*?fill:\s*none;[\s\S]*?stroke:\s*currentColor;/);
  assert.match(css, /\.map-switch-btn\s*\{[\s\S]*?width:\s*clamp\(2\.75rem,\s*4vw,\s*3rem\)/);
  assert.match(css, /\.map-switch-btn\s*\{[\s\S]*?min-width:\s*44px/);
  assert.match(css, /\.map-switch-hero/);
  assert.match(css, /\.map-brand\s*\{[^}]*display:\s*flex/);
});

test('shared modal card styles cover map switch, VIP, and release update dialogs', () => {
  const css = read('style.css');
  const source = read('script.js');

  assert.match(css, /\.map-switch-dialog\s*\{/);
  assert.match(css, /\.map-switch-dialog::backdrop\s*\{/);
  assert.match(css, /\.map-switch-card\s*\{/);
  assert.match(css, /\.map-switch-dialog\s*\{[\s\S]*?max-height:\s*calc\(100dvh - 2rem\)/);
  assert.match(css, /\.map-switch-dialog\s*\{[\s\S]*?overflow:\s*auto/);
  assert.match(css, /\.map-switch-card\s*\{[\s\S]*?box-sizing:\s*border-box/);
  assert.match(source, /mapSwitchDialog\.className = 'map-switch-dialog map-switch-picker-dialog'/);
  assert.match(source, /paywallDialog\.className = 'map-switch-dialog paywall-dialog'/);
  assert.match(source, /releaseUpdateDialog\.className = 'map-switch-dialog release-update-dialog'/);
  assert.match(css, /backdrop-filter:\s*blur/);
});

test('mine page settings are real app switches with persisted preferences', () => {
  const source = read('script.js');
  const css = read('style.css');

  assert.deepEqual(normalizeChildProfile({ childName: '  星星宝宝很长很长  ', childAge: '8' }), {
    childName: '星星宝宝很长很长',
    childAge: '4',
  });
  assert.deepEqual(normalizeChildProfile({ childName: '安安', childAge: '5' }), {
    childName: '安安',
    childAge: '5',
  });
  assert.equal(profileAvatarText('小禾同学'), '小禾');

  assert.match(source, /APP_PREFERENCES_KEY = 'baby-island-app-preferences-v1'/);
  assert.match(source, /localStorage\.setItem\(APP_PREFERENCES_KEY, JSON\.stringify\(state\.preferences\)\)/);
  assert.match(source, /data-preference="\$\{key\}" role="switch" aria-checked="\$\{checked\}"/);
  assert.match(source, /setPreference\(prefBtn\.dataset\.preference, prefBtn\.getAttribute\('aria-checked'\) !== 'true'\)/);
  assert.match(source, /childName:\s*'小禾'/);
  assert.match(source, /childAge:\s*'4'/);
  assert.match(source, /function setChildProfile\(field, value\)/);
  assert.match(source, /data-child-profile="childName"/);
  assert.match(source, /data-child-profile="childAge"/);
  assert.match(source, /profileAvatarText\(childProfile\.childName\)/);
  assert.match(source, /宝宝昵称已保存/);
  assert.doesNotMatch(source, /dailyReminder|reminderTime|REMINDER_TIME_RE|Notification\.requestPermission/);
  assert.doesNotMatch(source, /data-open-login|data-nav-route="account"|data-nav-route="calendar"|data-nav-route="reminders"|data-nav-route="mistakes"/);
  assert.match(source, /待复习/);
  assert.doesNotMatch(source, /function renderMistakes\(\)|data-open-mistake-clear|data-clear-mistakes|错题本已清空/);
  assert.match(source, /type === 'info' \|\| type === 'support' \? 'mine'/);

  assert.match(css, /\.setting-row-control\s*\{[\s\S]*?display:\s*block[\s\S]*?padding:\s*0/);
  assert.match(css, /\.setting-switch\s*\{[\s\S]*?min-width:\s*52px[\s\S]*?height:\s*28px[\s\S]*?border:\s*2\.5px solid var\(--border\)[\s\S]*?box-shadow:\s*inset 0 2px 4px rgba\(114, 93, 66, 0\.15\)/);
  assert.match(css, /\.setting-button\[aria-checked="true"\] \.setting-switch\s*\{[\s\S]*?background:\s*#86d67a/);
  assert.match(css, /\.setting-button\[aria-checked="true"\] \.setting-switch span\s*\{[\s\S]*?left:\s*calc\(100% - 24px\)/);
  assert.match(css, /\.setting-profile-select\s*\{[\s\S]*?border:\s*2\.5px solid var\(--border\)[\s\S]*?border-radius:\s*var\(--pill-radius\)/);
  assert.match(css, /\.setting-profile-select:focus-visible\s*\{[\s\S]*?border-color:\s*var\(--focus\)/);
  assert.match(css, /body\.pref-hide-chinese-hints \.level-name-copy small/);
  assert.match(source, /data-nav-route="privacy"/);
  assert.match(source, /data-nav-route="terms"/);
  assert.match(source, /data-nav-route="support"/);
  assert.match(source, /data-nav-route="about"/);
});

test('mine page distinguishes VIP and non-VIP status', () => {
  const free = membershipSummary({ vipActive: false });
  const vip = membershipSummary({ vipActive: true });
  const source = read('script.js');
  const css = read('style.css');

  assert.equal(free.status, 'free');
  assert.equal(free.title, '非 VIP 体验中');
  assert.equal(free.count, '10');
  assert.equal(free.action, '开通 VIP');
  assert.equal(vip.status, 'vip');
  assert.equal(vip.title, 'VIP 已开通');
  assert.equal(vip.count, '200');
  assert.equal(vip.countLabel, '规划关卡');
  assert.equal(vip.action, 'VIP 权益已生效');

  assert.match(source, /vipActive:\s*saved\?\.vipActive === true/);
  assert.match(source, /getLevelAccess\(route\.id, state\.progress, state\.preferences\.vipActive === true\)/);
  assert.match(source, /membershipSummary\(state\.preferences\)/);
  assert.match(source, /data-membership-status="\$\{membership\.status\}"/);
  assert.match(source, /membership-card is-\$\{membership\.status\}/);
  assert.match(source, /VIP 权益已生效；第 \$\{FREE_LEVEL_COUNT \+ 1\}-\$\{DISPLAY_LEVEL_COUNT\} 关会随课程内容更新开放。/);
  assert.doesNotMatch(source, /已解锁第 \$\{FREE_LEVEL_COUNT \+ 1\}-\$\{DISPLAY_LEVEL_COUNT\} 关会员内容。/);
  assert.match(source, /data-open-vip-paywall/);
  assert.match(source, /openPaywallDialog\(FREE_LEVEL_COUNT \+ 1, vipButton\)/);
  assert.match(css, /\.membership-card\s*\{/);
  assert.match(css, /\.membership-card\.is-free\s*\{/);
  assert.match(css, /\.membership-card\.is-vip\s*\{/);
  assert.match(css, /\.membership-upgrade-button\s*\{/);
  assert.match(css, /\.membership-active-note\s*\{/);
});

test('mine page removes local data management, cache, and share entries', () => {
  const source = read('script.js');
  const exported = buildLearningDataExport(
    { completed: [1, 2], unlockedThrough: 99 },
    { dates: ['2026-07-16', '2026-07-17'] },
    { childName: '安安', childAge: '5', mapMusic: false, autoPronunciation: true, showChineseHints: true },
    { items: [{ levelId: 3, selected: 'red', count: 2, updatedAt: '2026-07-17T00:00:00.000Z' }] },
    null,
    levels,
    '2026-07-17T08:00:00.000Z',
  );

  assert.equal(exported.app, '宝宝英语岛');
  assert.equal(exported.version, 1);
  assert.deepEqual(exported.childProfile, { childName: '安安', childAge: '5' });
  assert.deepEqual(exported.progress, { completed: [1, 2], unlockedThrough: 3 });
  assert.equal(exported.report.completed, 2);
  assert.equal(exported.report.learningMinutes, 6);
  assert.equal(exported.mistakeBook.items[0].levelId, 3);
  assert.equal('account' in exported, false);

  assert.doesNotMatch(source, /function clearLocalAppData\(\)|function exportLocalAppData\(\)|function clearOfflineCache\(\)|function shareApp\(\)/);
  assert.doesNotMatch(source, /data-open-data-management|data-export-local-data|data-clear-local-data|data-clear-offline-cache|data-share-app/);
  assert.match(source, /function registerServiceWorker\(\)/);
  assert.match(source, /serviceWorkerRegistration = registration/);
});

test('mine page exposes manual content update check and app checks hot update on every open', () => {
  const source = read('script.js');

  // 我的页手动检查内容资源更新，发版更新另走启动居中弹窗
  assert.match(source, /data-check-update/);
  assert.match(source, /data-check-update-note/);
  assert.match(source, /检查内容更新/);
  assert.match(source, /function checkAppUpdate\(\)/);
  // 每次打开应用主动检查热更新，而不是依赖浏览器 24h 间隔的被动检查
  assert.match(source, /serviceWorkerRegistration = registration;\s*\n\s*\/\/[^\n]*\n\s*registration\.update\(\)/);
  // 手动检查的三种状态反馈
  assert.match(source, /正在检查更新…/);
  assert.match(source, /当前已是最新版本/);
  assert.match(source, /发现内容更新，点顶部「立即更新」生效/);
  assert.match(source, /网络不可用，请稍后重试/);
  // 发现新版本仍走既有 banner + 立即更新流程
  assert.match(source, /showAppUpdateReady/);
});

test('mine word bank caps chip list behind an expander instead of unbounded growth', () => {
  const source = read('script.js');
  const css = read('style.css');

  // 一关一词，本地图学完 200 个词牌（后续新地图还会更多），词库卡片必须限高：默认露出最近 N 个，其余 +N 展开
  assert.match(source, /WORD_CHIP_PREVIEW/);
  assert.match(source, /data-word-chips/);
  assert.match(source, /data-words-expand/);
  assert.match(source, /learnedWords\.slice\(\)\.reverse\(\)/);
  assert.match(css, /\.word-bank-words:not\(\.expanded\) \.word-chips span:nth-of-type\(n\+13\)/);
  assert.match(css, /\.word-bank-words\.expanded \.word-chips[\s\S]*?overflow-y:\s*auto/);
});

test('quiz hand hint cycles between both answer options before selection', () => {
  const source = read('script.js');

  assert.match(source, /let hintOptionTimer = 0/);
  assert.match(source, /function showNextOptionHint\(\)/);
  assert.match(source, /showHintAt\(choices\[hintOptionIndex % choices\.length\]\)/);
  assert.match(source, /selectedIndex !== null/);
  assert.match(source, /setInterval\(showNextOptionHint, 1200\)/);
  assert.match(source, /function hintToSubmit\(\)\s*\{\s*stopOptionHintLoop\(\);\s*showHintAt\(submitBtn\);/);
  assert.doesNotMatch(source, /function hintToOptions\(\)\s*\{\s*showHintAt\(optionsBox\.children\[0\]\);\s*\}/);
});

test('quiz hand hint is removed when leaving level view and ignores stale targets', () => {
  const source = read('script.js');

  assert.match(source, /function removeGlobalHintHand\(\)\s*\{[\s\S]*?data-global-hint-hand[\s\S]*?hand\.remove\(\)/);
  assert.match(source, /if \(route\.type !== 'level'\) removeGlobalHintHand\(\)/);
  assert.match(source, /function isCurrentQuizView\(\)\s*\{[\s\S]*?route\.type === 'level'[\s\S]*?route\.id === level\.id[\s\S]*?stageQuiz\.isConnected/);
  assert.match(source, /if \(!el \|\| !el\.isConnected \|\| !isCurrentQuizView\(\)\)\s*\{[\s\S]*?hideHint\(\);[\s\S]*?return;/);
});
