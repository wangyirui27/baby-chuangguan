const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { TEMP_LOCAL_FULL_ACCESS, LOCAL_QA_UNLOCK_KEY, isTempLocalUnlockEnabled, MAP_WORLDS, MATH_ATTEMPT_KEY, MATH_ATTEMPT_SCHEMA_VERSION, MATH_SKILL_LABELS, ENGLISH_ATTEMPT_KEY, ENGLISH_ATTEMPT_SCHEMA_VERSION, ACCURACY_SERIES_DAYS, activateVipPreferences, adaptMathLevel, addLearningActivityDay, appendMathAttempt, appendEnglishAttempt, accuracySparklineMarkup, accuracySparklinePoints, accuracySubjectFromWorldId, applyQuizAnswer, assetPackHasDownloadSource, assetPackLevelDownloadQueue, assetPackLevelVideoUrl, assetPackPlayableSummary, assetPackSummary, buildAccuracyOverview, buildDailyAccuracySeries, buildLearningDataExport, buildLocalRankings, buildMapJumpSegments, buildMathLevels, buildMathParentReport, buildMathVariant, calendarDays, canForceReleaseUpdate, canRegisterServiceWorker, collectAccuracyAttempts, compareAppVersions, completedLearningMinutes, completionUnlockText, curriculumAlignmentForTopic, desertLandmarkImage, desertLevels, englishZoneProgress, formatActivityDate, generateMathVariant, getLevelAccess, islandStyleId, learningDays, learningReport, learningStreak, levelVideoDownloadLabel, levelVideoStateKey, levels, levelsForMapWorld, mathCurriculumSpec, mathLevels, mathQuestionAudioRelativePath, mathQuestionAudioSlug, MATH_STORY_WAYPOINTS, MATH_STORY_THEME_AUDIO_VERSION, DISPLAY_LEVEL_COUNT, pendingMathStoryWaypoints, firstPendingMathStoryWaypoint, markMathStoryCleared, mathStoryWaypointById, mathJumpEntriesForSegment, isMathStoryCleared, mathStoryVideoSrc, mathStoryThemeAudioSrc, collectMathStoryThemeUtterances, normalizeMathStoryCleared, mathQuestionCountKey, collectMathQuestionUtterances, mathVoiceFeedback, mergeEnglishAttempts, mergeMathAttempts, networkStatusText, nextMathPathRecommendation, normalizeAssetPackStates, normalizeEnglishAttempts, normalizeLevelVideoStates, normalizeMapWorldId, normalizeMathAttempts, normalizeWorldProgress, notificationStatusText, normalizeChildProfile, normalizeLearningActivity, normalizeMistakeBook, normalizeProgress, parseRouteHash, profileAvatarText, questionPromptText, rankingScore, recordMistake, releaseUpdateInfo, requestReleaseUpdate, requestVipPurchase, requestVipRestore, resolveMathContinueLevel, resolveMathLevelStep, resolveMistake, routePoint, segmentContainingLevel, levelsInJumpSegment, supportFeedbackText, summarizeAttemptBucket, summarizeMathSkill, validateSupportMessage, wordButtonDisabled } = require('./script.js');

const read = (file) => fs.readFileSync(path.join(__dirname, file), 'utf8');
const mapAudioTargets = () => [...levels, ...desertLevels].map((level) => ({
  word: level.title.toLowerCase().replace(/[.!?]+$/g, ''),
  levelId: level.id,
  worldId: desertLevels.includes(level) ? 'desert' : 'ocean',
}));
const ONLINE_RECONNECT_HANDLER_RE = /window\.addEventListener\('online', \(\) => \{\s*\n\s*updateNetworkStatus\(true\);\s*\n\s*checkReleaseUpdate\(\);\s*\n\s*if \(authGatePassed\) hydrateLearningStateFromBackend\(\);\s*\n\s*\}\)/;

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
  assert.equal(completionUnlockText(levels[9], afterTen, true), '第 11 关已解锁。');
  assert.equal(completionUnlockText(levels[10], afterEleven, true), '第 12 关已解锁。');
  assert.equal(completionUnlockText(levels[11], afterTwelve, true), '第 13 关已解锁。');
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
    assert.equal(level.videoSrc, `assets/video/free-levels/level-${String(index + 1).padStart(2, '0')}-${correctWord}.mp4?v=20260807-workbench-island-final`);
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
  const script = read('script.js');
  assert.ok(css.includes('.math-sequence-ref'));
  assert.ok(css.includes('.math-sequence-rail'));
  assert.ok(css.includes('.math-sequence-slot'));
  assert.ok(css.includes('.math-sequence-slot-well'));
  assert.ok(css.includes('.math-sequence-slot-fill'));
  assert.match(script, /setSequenceSlotPreview/);
  assert.match(script, /clearSequenceSlotPreview/);
  assert.match(script, /is-slot-preview/);
  assert.doesNotMatch(script, /math-sequence-slot-ghost/);
  assert.doesNotMatch(script, /math-sequence-slot-pad/);
  assert.doesNotMatch(script, /mathWoodDigitMarkup\('q'/);
  assert.ok(css.includes('.math-wood-digit'));
  assert.match(css, /\.math-choice--numeral-only/);
  assert.match(script, /math-choice--numeral-only/);
  assert.match(script, /math-choice--wood-digit/);
  assert.match(script, /math-choice--seq-piece/);
  assert.match(script, /data-math-seq-slot/);
  assert.match(script, /bindSeqPiecePointer/);
  assert.match(script, /placeSequencePiece/);
  assert.match(script, /mathWoodDigitMarkup\(/);
  assert.match(script, /wood-digits\/wood-digit-/);
  assert.match(script, /math-q-compose-drag/);
  assert.match(script, /wood-digit-\$\{key\}-v7\.webp/);
  assert.match(script, /is-wood-blocks/);
  assert.doesNotMatch(script, /math-sequence-kicker/);
  assert.doesNotMatch(script, /math-sequence-hint/);
  assert.doesNotMatch(script, /把下面的木数字拖进空位/);
  assert.match(script, /numeralOnly \? '' :/);
  // sequence pure wood digits: no duplicate under-label
  assert.match(script, /const numeralOnly = format === 'sequence'/);
  assert.match(css, /data-math-format=\"sequence\"\] \.math-question-card/);
  assert.match(css, /max-width:\s*min\(6\.6rem/);
  assert.match(css, /\.math-sequence-slot\.is-preview/);
  assert.match(css, /is-slot-preview/);
  assert.doesNotMatch(css, /\.math-sequence-slot-ghost/);
  assert.doesNotMatch(css, /\.math-sequence-slot-pad/);

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
  assert.match(html, /style\.css\?v=20260807-math-take-pool-no-blob-v1/);
  assert.match(html, /script\.js\?v=20260807-math-take-pool-no-blob-v1/);
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
  assert.match(source, ONLINE_RECONNECT_HANDLER_RE);
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
    message: '请前往 App Store 更新嗨洛塔少儿启蒙APP。',
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
  }), false);

  const source = read('script.js');
  const css = read('style.css');
  const releaseConfig = JSON.parse(read('app-release.json'));

  assert.equal(releaseConfig.latestVersion, '1.0.1');
  assert.match(releaseConfig.updateUrl, /^https:\/\/apps\.apple\.com\/cn\/search\?term=/);
  assert.match(source, /APP_RELEASE_VERSION = '1\.0\.1'/);
  assert.match(source, /APP_RELEASE_UPDATE_URL = 'app-release\.json'/);
  assert.match(source, /function checkReleaseUpdate\(\)/);
  assert.match(source, /const releaseUpdateUrl = String\(window\.BABY_ISLAND_RELEASE_UPDATE_URL \|\| APP_RELEASE_UPDATE_URL\)/);
  assert.match(source, /const separator = releaseUpdateUrl\.includes\('\?'\) \? '&' : '\?'/);
  assert.match(source, /fetch\(`\$\{releaseUpdateUrl\}\$\{separator\}t=\$\{Date\.now\(\)\}`/);
  assert.match(source, /openReleaseUpdateDialog\(releaseUpdateInfo/);
  assert.doesNotMatch(source, /更新地址待配置/);
  assert.match(source, /requestReleaseUpdate\(updateInfo, window\)/);
  assert.match(source, /请打开 \$\{updateInfo\.storeName\} 搜索嗨洛塔少儿启蒙APP更新/);
  assert.match(source, /const mustBlockForUpdate = canForceReleaseUpdate\(updateInfo, window\)/);
  assert.match(source, /if \(mustBlockForUpdate\) event\.preventDefault\(\)/);
  assert.match(source, /let promptedReleaseVersion = ''/);
  assert.match(source, /if \(!updateInfo\.force && promptedReleaseVersion === updateInfo\.latestVersion\) return/);
  assert.match(source, /if \(!updateInfo\.force\) promptedReleaseVersion = updateInfo\.latestVersion/);
  assert.match(source, ONLINE_RECONNECT_HANDLER_RE);
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
  assert.equal(requestReleaseUpdate({ ...updateInfo, updateUrl: '' }, androidRuntime), false);
  assert.equal(androidUrl, null);

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
  assert.match(source, /function showToast\(message, preferredHost\)/);
  assert.match(source, /toastEl\.textContent = message/);
  assert.match(source, /toastTimer = setTimeout\(\(\) => \{[\s\S]*?toastEl\.hidden = true;[\s\S]*?\}, 2200\)/);
  assert.match(source, /showToast\(`\$\{preferenceLabels\[key\]\}已\$\{value \? '开启' : '关闭'\}`\)/);
  assert.match(source, /showToast\('反馈已保存在本机'\)/);
  assert.match(source, /showToast\('已退出登录'\);/);
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
  assert.match(source, /type === 'info' \|\| type === 'support' \|\| type === 'accuracy' \? 'mine'/);
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
  // sessionStorage used by auth token persistence (forced login)
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
  }), '嗨洛塔少儿启蒙APP反馈\n问题：喇叭没有声音\n当前关卡：第 6 关\n完成关卡：5/200\n设备信息：iPad Safari');

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
  assert.match(source, /帮助与反馈 · 嗨洛塔少儿启蒙APP/);
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
  assert.equal(manifest.name, '嗨洛塔少儿启蒙APP');
  assert.equal(manifest.short_name, '嗨洛塔');
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
  assert.match(html, /<meta name="apple-mobile-web-app-title" content="嗨洛塔少儿启蒙APP">/);
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

  assert.match(html, /style\.css\?v=20260807-math-take-pool-no-blob-v1/);
  assert.match(html, /script\.js\?v=20260807-math-take-pool-no-blob-v1/);
  assert.match(source, /function registerServiceWorker\(\)/);
  assert.match(source, /navigator\.serviceWorker\.register\('\.\/sw\.js(\?[^']*)?'\)/);
  assert.match(source, /canRegisterServiceWorker\(location\.protocol\)/);
  assert.match(source, /registration\.addEventListener\('updatefound'/);
  assert.match(source, /worker\.state === 'installed' && navigator\.serviceWorker\.controller/);
  assert.match(worker, /CACHE_NAME = 'baby-island-shell-20260807-math-take-pool-no-blob-v1'/);
  assert.match(worker, /APP_SHELL = \[/);
  assert.match(worker, /style\.css\?v=20260807-math-take-pool-no-blob-v1/);
  assert.match(worker, /script\.js\?v=20260807-math-take-pool-no-blob-v1/);
  assert.match(worker, /assets\/ocean\/front-ocean-bg-v2-libtv\.webp\?v=20260720-clean-ocean-v1/);
  assert.match(worker, /assets\/ocean\/front-ocean-loop-v4-libtv-seamless-clouds\.mp4\?v=20260719-handpainted-libtv-v1/);
  assert.match(worker, /assets\/ocean\/seagull-fly\.webp\?v=20260720-libtv-flap-v1/);
  assert.match(worker, /assets\/egypt-map\/background\/egypt-desert-infinite-clean-bg-dreamina-v2\.png\?v=20260720-desert-infinite-v2/);
  assert.match(worker, /assets\/egypt-map\/background\/egypt-desert-infinite-bg-libtv-v4\.mp4\?v=20260720-desert-bg-v4/);
  assert.match(worker, /assets\/ocean\/rowing-kids-boat-idle\.webp\?v=20260720-libtv-original-v3/);
  assert.match(worker, /assets\/ocean\/rowing-kids-boat-sailing\.webp\?v=20260720-libtv-original-rowing-v3/);
  assert.match(worker, /assets\/lottie\/level-video-loading\.json\?v=20260803-rocking-horse-v1/);
  assert.match(worker, /assets\/math-map\/covers\/math-desk-cover-v1\.webp\?v=20260804-math-covers-v1/);
  assert.match(worker, /assets\/math-map\/covers\/math-garden-cover-v1\.webp\?v=20260804-math-covers-v1/);
  assert.match(worker, /assets\/math-map\/covers\/math-star-tower-cover-v1\.webp\?v=20260804-math-covers-v1/);
  assert.match(worker, /assets\/icons\/resource-star\.webp\?v=20260714-v1/);
  assert.match(worker, /assets\/audio\/map-bgm\.mp3/);
  assert.match(worker, /assets\/audio\/math-map-bgm\.mp3\?v=20260804-math-bgm-v2/);
  assert.match(worker, /assets\/audio\/sfx\/math-apple-drop-blop-soft-01\.mp3\?v=20260804-math-sfx-v1/);
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
  assert.match(worker, /auth\/apiClient\.js\?v=20260807-backend-fix-v1/);
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
  const packScript = read('tools/pack-app-www.sh');
  const requiredRuntimeAssets = [
    'script.js',
    'style.css',
    'sw.js',
    'manifest.webmanifest',
    'app-release.json',
    'asset-packs.json',
    'assets/audio/math-map-bgm.mp3',
    'assets/audio/words',
    'assets/audio/questions-holly',
    'assets/video/free-levels',
    'assets/egypt-map',
    'assets/islands-v1/runtime',
    'assets/math-map',
    'assets/ocean/front-ocean-loop-v4-libtv-seamless-clouds.mp4',
  ];

  assert.match(frontendPackage.scripts.build, /vite build && node scripts\/copy-root-static\.cjs/);
  assert.match(viteConfig, /base:\s*'\.\/'/);
  requiredRuntimeAssets.forEach((name) => {
    assert.match(copyScript, new RegExp(`'${name.replace('.', '\\.')}'`));
  });
  assert.match(copyScript, /fs\.cpSync\(src, dest, \{ recursive: true, force: true, filter: copyFilter \}\)/);
  assert.match(copyScript, /_dreamina/);
  assert.match(copyScript, /shouldSkipName/);
  assert.match(packScript, /copy_dir "assets\/math-map"/);
  assert.match(packScript, /非视频的基本运行时素材必须打进 App/);
  assert.match(packScript, /_dreamina\*/);
  assert.match(packScript, /runtime asset gate OK/);
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

test('local QA unlock stays off for TestFlight by default', () => {
  assert.equal(TEMP_LOCAL_FULL_ACCESS, false);
  assert.equal(typeof isTempLocalUnlockEnabled, 'function');
  const unlockSrc = isTempLocalUnlockEnabled.toString();
  assert.match(unlockSrc, /localQa/);
  assert.match(unlockSrc, /LOCAL_QA_UNLOCK_KEY|localStorage/);
  assert.doesNotMatch(unlockSrc, /capacitor:|file:/);
  // Node 无 location → 不误开解锁，单元测试保持真实付费墙语义
  assert.equal(isTempLocalUnlockEnabled(), false);

  const source = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
  assert.match(source, /allowQuizWithoutVideo/);
  assert.match(source, /data-skip-to-quiz/);
  assert.match(source, /本地预览 · 第 \$\{level\.id\} 关暂无视频，可直接答题/);
  // 废弃 pear/grape 样片不得挂回 11/12（另有专项测试）；本地预览靠无视频直进答题
  assert.doesNotMatch(source, /lessonOverrides[\s\S]{0,800}level-11-pear\.mp4/);
});

test('math step arrows escape paid zone leftward instead of trapping on paywall both ways', () => {
  const freeDone = {
    completed: Array.from({ length: 10 }, (_, index) => index + 1),
    unlockedThrough: 11,
  };
  // 卡在第 12 关：左键应回到最近可玩免费关 10，而不是在 11 再弹付费
  const leftFrom12 = resolveMathLevelStep(12, -1, freeDone, false);
  assert.equal(leftFrom12.action, 'go');
  assert.equal(leftFrom12.levelId, 10);
  assert.equal(leftFrom12.skipped, true);

  // 右键仍是会员墙
  const rightFrom12 = resolveMathLevelStep(12, 1, freeDone, false);
  assert.equal(rightFrom12.action, 'paid');
  assert.equal(rightFrom12.levelId, 13);

  // 正常从 10 往右：邻关 11 即会员墙
  const rightFrom10 = resolveMathLevelStep(10, 1, freeDone, false);
  assert.equal(rightFrom10.action, 'paid');
  assert.equal(rightFrom10.levelId, 11);

  // 正常邻关切换
  const leftFrom10 = resolveMathLevelStep(10, -1, freeDone, false);
  assert.equal(leftFrom10.action, 'go');
  assert.equal(leftFrom10.levelId, 9);
  assert.equal(leftFrom10.skipped, false);

  // VIP 且进度已开到 13：会员区可正常一步一步走
  const vipProgress = {
    completed: Array.from({ length: 12 }, (_, index) => index + 1),
    unlockedThrough: 13,
  };
  const vipRight = resolveMathLevelStep(12, 1, vipProgress, true);
  assert.equal(vipRight.action, 'go');
  assert.equal(vipRight.levelId, 13);

  // VIP 但进度未开：右键是 locked，不是 paid
  const vipLocked = resolveMathLevelStep(12, 1, freeDone, true);
  assert.equal(vipLocked.action, 'locked');
  assert.equal(vipLocked.levelId, 13);
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
  assert.match(source, /navigate\(`level-\$\{levelId\}`/);
  assert.match(source, /function levelVideoDownloadMarkup\(level\)/);
  assert.match(source, /ensureLevelVideoDownload\(level\)/);
  assert.match(source, /data-level-video-download-panel/);
  assert.match(source, /window\.babyIslandLevelVideoEvent/);
  assert.doesNotMatch(source, /lessonUnavailableMessage/);
  assert.match(source, /openPaywallDialog\(levelId, trigger\)/);
  assert.match(source, /openPaywallDialog\(route\.id\)/);
  assert.doesNotMatch(source, /openAccessDialog|payment-required|login-required/);
  assert.doesNotMatch(read('index.html'), /data-access-dialog-content/);
});

test('paid levels open a per-map payment panel instead of a notice-only dialog', () => {
  const source = read('script.js');
  const css = read('style.css');
  const paywallFn = source.match(/function openPaywallDialog[\s\S]*?function closePaywallDialog/)?.[0] ?? '';

  assert.match(paywallFn, /paywall-card/);
  assert.match(paywallFn, /本地图学习卡/);
  assert.match(paywallFn, /购买本地图，解锁本图会员关/);
  assert.doesNotMatch(paywallFn, /开通 VIP|VIP 学习卡/);
  assert.doesNotMatch(paywallFn, /魔法岛|单词发音练习|答题闯关记录/);
  assert.match(paywallFn, /内容持续更新/);
  assert.match(paywallFn, /闯关进度记录/);
  assert.match(paywallFn, /mapWorld\.chipPrefix|mapLabel/);
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
  assert.match(paywallFn, /完成后本地图权益立即生效/);
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
  assert.match(source, /function completeVipPurchase\(/);
  assert.match(source, /state\.preferences = activateVipPreferences\(state\.preferences\)/);
  assert.match(source, /localStorage\.setItem\(APP_PREFERENCES_KEY, JSON\.stringify\(state\.preferences\)\)/);
  assert.match(source, /closePaywallDialog\(\)/);
  assert.match(source, /showToast\('本地图权益已生效'\)/);
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
  const { curriculum: grandmaCurriculum, ...grandmaLevel } = levels[2];
  assert.deepEqual(grandmaLevel, {
    id: 3,
    title: 'Grandma',
    zhTitle: '奶奶',
    topic: 'Free Starter · 免费体验',
    duration: '3 分钟',
    guidance: '看一看画面，听清并跟读 grandma。',
    question: 'Which word means 奶奶?',
    options: ['grandma', 'mom', 'grandpa', 'dad'],
    correct: 0,
    videoSrc: 'assets/video/free-levels/level-03-grandma.mp4?v=20260807-workbench-island-final',
    videoMeta: {
      source: 'libtv',
      taskId: '20260718163203980876515',
      qa: 'no-lip-sync-book-narration',
      audio: 'native-libtv',
    },
    worldId: 'ocean',
    itemType: 'word',
  });
  assert.deepEqual(grandmaCurriculum.pepUnits, ['PEP三上 U2 Different families', 'PEP三上 U1 Making friends']);
});

test('map worlds keep independent progress while castle is coming soon', () => {
  const source = read('script.js');
  const oceanLevels = levelsForMapWorld('ocean');
  const desertLevels = levelsForMapWorld('desert');
  const mathMapLevels = levelsForMapWorld('math');
  const migratedProgress = normalizeWorldProgress({ completed: [1, 2], unlockedThrough: 3 });

  assert.equal(normalizeMapWorldId('missing'), 'ocean');
  assert.doesNotMatch(source, /function mapWorldForLevel/);
  assert.equal(oceanLevels.length, 200);
  assert.equal(desertLevels.length, 200);
  assert.equal(mathMapLevels, mathLevels);
  assert.equal(mathMapLevels.length, 200);
  assert.deepEqual([oceanLevels[0].id, oceanLevels.at(-1).id], [1, 200]);
  assert.deepEqual([desertLevels[0].id, desertLevels.at(-1).id], [1, 200]);
  assert.deepEqual([mathMapLevels[0].id, mathMapLevels.at(-1).id], [1, 200]);
  assert.deepEqual(migratedProgress.ocean, { completed: [1, 2], unlockedThrough: 3 });
  assert.deepEqual(migratedProgress.desert, { completed: [], unlockedThrough: 1 });
  assert.deepEqual(migratedProgress.math, { completed: [], unlockedThrough: 1 });
  assert.deepEqual(normalizeWorldProgress({
    ocean: { completed: [1], unlockedThrough: 2 },
    desert: { completed: [1, 2, 3], unlockedThrough: 4 },
    math: { completed: [1], unlockedThrough: 2 },
  }), {
    ocean: { completed: [1], unlockedThrough: 2 },
    desert: { completed: [1, 2, 3], unlockedThrough: 4 },
    math: { completed: [1], unlockedThrough: 2 },
    math58: { completed: [], unlockedThrough: 1 },
    math912: { completed: [], unlockedThrough: 1 },
    castle: { completed: [], unlockedThrough: 1 },
  });
  assert.match(desertLandmarkImage(1), /01-great-pyramid-complex/);
  assert.match(desertLandmarkImage(1), /v6-sand-blend/);
  assert.match(desertLandmarkImage(1), /desert-landmarks-v30/);
  assert.match(desertLandmarkImage(200), /10-monumental-city-gate/);
  assert.match(source, /ocean-world-cover-v1\.webp/);
  assert.match(source, /assets\/ocean\/covers\/ocean-world-cover-v1\.webp/);
  assert.match(source, /desert-world-cover-v1\.webp/);
  assert.match(source, /assets\/egypt-map\/covers\/desert-world-cover-v1\.webp/);
  assert.match(source, /assets\/math-map\/covers\/math-desk-cover-v1\.webp/);
  assert.match(source, /assets\/math-map\/covers\/math-garden-cover-v1\.webp/);
  assert.match(source, /assets\/math-map\/covers\/math-star-tower-cover-v1\.webp/);
  // 10 座沙漠地标文件必须齐（缺失则地图建筑空白）
  const desertLandmarkDir = path.join(__dirname, 'assets/egypt-map/cutouts/buildings/v6-sand-blend');
  const desertLandmarks = [
    '01-great-pyramid-complex.webp',
    '02-large-sphinx-monument.webp',
    '03-pharaoh-palace-facade.webp',
    '04-grand-egyptian-temple.webp',
    '05-abu-simbel-rock-temple.webp',
    '06-step-pyramid-monument.webp',
    '07-obelisk-plaza.webp',
    '08-desert-royal-palace.webp',
    '09-valley-kings-tomb-facade.webp',
    '10-monumental-city-gate.webp',
  ];
  for (const name of desertLandmarks) {
    const filePath = path.join(desertLandmarkDir, name);
    assert.ok(fs.existsSync(filePath), `missing desert landmark ${name}`);
    assert.ok(fs.statSync(filePath).size > 50_000, `desert landmark too small: ${name}`);
  }
  const oceanCover = path.join(__dirname, 'assets/ocean/covers/ocean-world-cover-v1.webp');
  assert.ok(fs.existsSync(oceanCover), 'missing ocean world cover thumb');
  assert.ok(fs.statSync(oceanCover).size > 10_000, 'ocean cover too small');
  const desertCover = path.join(__dirname, 'assets/egypt-map/covers/desert-world-cover-v1.webp');
  assert.ok(fs.existsSync(desertCover), 'missing desert world cover thumb');
  assert.ok(fs.statSync(desertCover).size > 10_000, 'desert cover too small');
  [
    'math-desk-cover-v1.webp',
    'math-garden-cover-v1.webp',
    'math-star-tower-cover-v1.webp',
  ].forEach((name) => {
    const filePath = path.join(__dirname, 'assets/math-map/covers', name);
    assert.ok(fs.existsSync(filePath), `missing math world cover ${name}`);
    assert.ok(fs.statSync(filePath).size > 10_000, `math world cover too small: ${name}`);
  });
  assert.equal(MAP_WORLDS.ocean.startLevel, 1);
  assert.equal(MAP_WORLDS.ocean.endLevel, 200);
  assert.equal(MAP_WORLDS.desert.startLevel, 1);
  assert.equal(MAP_WORLDS.desert.endLevel, 200);
  assert.equal(MAP_WORLDS.math.startLevel, 1);
  assert.equal(MAP_WORLDS.math.endLevel, 200);
  assert.equal(MAP_WORLDS.math.usesVideoAssets, false);
  assert.equal(MAP_WORLDS.math58.comingSoon, true);
  assert.equal(MAP_WORLDS.math58.zone, 'math');
  assert.equal(MAP_WORLDS.math58.title, '数学花园');
  assert.equal(MAP_WORLDS.math912.comingSoon, true);
  assert.equal(MAP_WORLDS.math912.zone, 'math');
  assert.equal(MAP_WORLDS.math912.title, '数学星塔');
  assert.equal(MAP_WORLDS.ocean.title, '魔法海岛');
  assert.equal(MAP_WORLDS.desert.title, '沙漠奇境');
  assert.equal(MAP_WORLDS.math.title, '数学小桌');
  assert.equal(MAP_WORLDS.castle.comingSoon, true);
  assert.equal(mathMapLevels[0].itemType, 'count');
  assert.equal(mathMapLevels[0].skill, 'count');
  assert.equal(mathMapLevels[0].targetCount, 1);
  assert.equal(mathMapLevels[0].title, '只有一个');
  assert.equal(mathMapLevels[0].options[mathMapLevels[0].correct], '1 个苹果');
  assert.equal(mathMapLevels[0].videoSrc, undefined);
  assert.equal(questionPromptText(mathMapLevels[0]), '小朋友，哪一组是1 个苹果？');
  assert.equal(mathQuestionCountKey(mathMapLevels[1]), 2);
  assert.equal(mathQuestionAudioRelativePath(2), 'assets/audio/questions-holly/math-count-2-apple.mp3');
  assert.equal(questionPromptText({ worldId: 'math', targetCount: 0 }), '小朋友，哪一组是0 个苹果？');
  // 3-5 岁课表：不能再 200 关死循环「数到 1–5」
  const mathSkills = new Set(mathMapLevels.map((level) => level.skill));
  const mathFormats = new Set(mathMapLevels.map((level) => level.math?.format || level.itemType));
  const mathThemes = new Set(mathMapLevels.map((level) => level.curriculum?.theme).filter(Boolean));
  const mathMaxDomain = Math.max(...mathMapLevels.map((level) => Number(level.math?.numberMax) || 0));
  assert.ok(mathSkills.has('count'));
  assert.ok(mathSkills.has('subitize'));
  assert.ok(mathSkills.has('numeral'));
  assert.ok(mathSkills.has('compare'));
  assert.ok(mathSkills.has('take'));
  assert.ok(mathSkills.has('compose'));
  assert.ok(mathSkills.has('sequence'));
  assert.ok(mathFormats.has('take'));
  assert.ok(mathFormats.has('compose'));
  assert.ok(mathFormats.has('most') || mathFormats.has('least'));
  assert.ok(mathThemes.size >= 8, `expected ≥8 themes, got ${mathThemes.size}`);
  assert.ok(mathMaxDomain >= 10, `number domain should reach 10, got ${mathMaxDomain}`);
  assert.equal(buildMathLevels().length, 200);
  assert.equal(mathCurriculumSpec(1).skill, 'count');
  assert.equal(mathCurriculumSpec(90).format, 'take');
  assert.equal(mathCurriculumSpec(120).format, 'compose');
  assert.ok(MATH_SKILL_LABELS.take);
  // 取物关：池子 > 目标，正确选项文案仍可读
  const takeLevel = mathMapLevels.find((level) => level.math?.format === 'take');
  assert.ok(takeLevel);
  assert.ok(takeLevel.math.poolCount > takeLevel.targetCount);
  assert.ok(takeLevel.math.objectKind);
  assert.ok(takeLevel.math.objectName);
  assert.match(takeLevel.options[takeLevel.correct], new RegExp(takeLevel.math.objectName));
  // 多物道具：200 关覆盖苹果/红珠/青珠/橡皮，且渲染写 data-kind
  const mathCss = read('style.css');
  const objectKinds = new Set(mathMapLevels.map((level) => level.math?.objectKind).filter(Boolean));
  assert.ok(objectKinds.has('apple'));
  assert.ok(objectKinds.has('bead-red'));
  assert.ok(objectKinds.has('bead-teal'));
  assert.ok(objectKinds.has('eraser'));
  assert.ok(mathMapLevels.filter((level) => level.math?.objectKind && level.math.objectKind !== 'apple').length >= 100);
  assert.equal(mathMapLevels[0].math.objectKind, 'apple');
  const beadLevel = mathMapLevels.find((level) => level.math?.objectKind === 'bead-red' && (level.math?.format === 'count' || level.math?.format === 'subitize'));
  assert.ok(beadLevel);
  assert.match(beadLevel.question, /红珠/);
  assert.match(mathQuestionAudioSlug(beadLevel), /bead-red/);
  assert.match(mathQuestionAudioRelativePath(beadLevel), /math-q-count-.*bead-red|math-count-.*bead-red/);
  assert.match(source, /data-kind="\$\{objectKind\}"/);
  assert.match(source, /const MATH_OBJECTS =/);
  assert.match(source, /function mathPickObjectKind\(/);
  assert.match(mathCss, /data-kind="bead-red"/);
  assert.match(mathCss, /red-bead-handpaint-depth-v2/);
  assert.match(mathCss, /teal-bead-handpaint-depth-v2/);
  assert.match(mathCss, /eraser-handpaint-topdown-v1/);
  // 分合关：盘内先有 left，拖入凑成 whole（无 +/=、无选项）
  const composeLevel = mathMapLevels.find((level) => level.math?.format === 'compose');
  assert.ok(composeLevel);
  assert.equal(
    Number(composeLevel.math.leftCount) + Number(composeLevel.targetCount),
    Number(composeLevel.math.whole),
  );
  assert.match(composeLevel.question, /已经有.*再拖进来.*凑成/);
  assert.doesNotMatch(composeLevel.question, /[+=]/);
  assert.doesNotMatch(composeLevel.question, /还差几个|合成/);
  assert.ok(Number(composeLevel.math.poolCount) >= Number(composeLevel.targetCount));
  assert.equal(Array.isArray(composeLevel.math.groups) ? composeLevel.math.groups.length : -1, 0);
  assert.match(source, /data-math-compose/);
  assert.match(source, /data-math-compose-item/);
  assert.match(source, /data-math-compose-plate/);
  assert.match(source, /bindComposeItemPointer/);
  assert.match(source, /scheduleComposeAutoSubmit|composePlateTotal/);
  assert.match(source, /runComposeDragDemo/);
  assert.doesNotMatch(source, /math-compose-op/);
  assert.doesNotMatch(source, /math-compose-unknown/);
  // CSS 仅保留 legacy 隐藏钩；JS 不再产出这些节点
  assert.doesNotMatch(source, /class=\\"math-compose-total/);
  assert.match(mathCss, /\.math-compose-board/);
  assert.match(mathCss, /\.math-compose-plate-disk/);
  assert.match(mathCss, /\.math-compose-item/);
  assert.doesNotMatch(mathCss, /\.math-compose-op\s*\{/);
  assert.doesNotMatch(mathCss, /\.math-compose-unknown\s*\{/);
  // .math-compose-total 允许仅作 display:none 残留钩
  assert.match(source, /function mathQuestionAudioSrcFor\(/);
  assert.match(source, /function mathQuestionAudioSlug\(/);
  assert.match(source, /function collectMathQuestionUtterances\(/);
  assert.match(source, /function speakMathQuestion\(/);
  assert.match(source, /data-listen-question/);
  assert.match(source, /math-sequence-ref/);
  assert.match(source, /requestAnimationFrame\(\(\) => \{\s*if \(quizState === 'answering'\) speakMathQuestion\(/);
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/audio/questions-holly/math-count-2-apple.mp3')));
  // 169 数序：语音 slug 不能再误绑成 count-N 苹果
  const seq169 = mathMapLevels.find((level) => level.id === 169);
  assert.ok(seq169);
  assert.equal(seq169.math?.format, 'sequence');
  assert.match(mathQuestionAudioSlug(seq169), /^seq-(next|prev)-\d+$/);
  assert.match(mathQuestionAudioRelativePath(seq169), /math-q-seq-/);
  assert.doesNotMatch(mathQuestionAudioRelativePath(seq169), /math-count-\d+-apple/);
  // 正式课表 166–185：数序主线全部进正式关，木积木 v7 资产齐全
  const formalSeq = mathMapLevels.filter((level) => level.id >= 166 && level.id <= 185);
  assert.equal(formalSeq.length, 20);
  formalSeq.forEach((level) => {
    assert.equal(level.math?.format, 'sequence', `L${level.id} format`);
    assert.equal(level.skill, 'sequence', `L${level.id} skill`);
    assert.ok(Number(level.math?.sequenceAnchor) >= 1 && Number(level.math?.sequenceAnchor) <= 8, `L${level.id} anchor`);
    assert.ok(['next', 'prev'].includes(level.math?.sequenceDirection), `L${level.id} dir`);
    assert.ok(fs.existsSync(path.join(__dirname, mathQuestionAudioRelativePath(level).split('?')[0])), `L${level.id} audio`);
  });
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((n) => {
    assert.ok(
      fs.existsSync(path.join(__dirname, `assets/math-map/quiz/wood-digits/wood-digit-${n}-v7.webp`)),
      `wood digit ${n}`,
    );
  });
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/math-map/quiz/wood-digits/wood-digit-q-v7.webp')));
  assert.match(source, /mathWoodDigitMarkup/);
  assert.match(source, /data-math-seq-slot/);
  assert.match(source, /math-choice--wood-digit/);
  // take 语音与 count 苹果模板分离
  assert.match(mathQuestionAudioRelativePath(takeLevel), /math-q-take-/);
  const mathManifest = JSON.parse(read('assets/audio/questions-holly/math-question-audio-manifest.json'));
  assert.equal(mathManifest.speaker, 'zh_female_peiqi_uranus_bigtts');
  const count2Entry = mathManifest.entries.find((entry) => entry.count === 2 || entry.slug === 'count-2-apple');
  assert.ok(count2Entry);
  assert.equal(count2Entry.text, '小朋友，哪一组是2 个苹果？');
  const utterances = collectMathQuestionUtterances(mathMapLevels);
  assert.ok(utterances.length >= 40, `expected broad prompt set, got ${utterances.length}`);
  assert.ok(utterances.some((u) => u.slug.startsWith('seq-')));
  assert.ok(utterances.some((u) => u.slug.startsWith('take-')));
  assert.ok(utterances.some((u) => u.slug.startsWith('compose-')));
  assert.ok(utterances.some((u) => u.slug.includes('bead-red')));
  assert.ok(utterances.some((u) => u.slug.includes('eraser')));
  assert.match(source, /state\.progressByWorld\[nextWorldId\]/);
  assert.match(source, /JSON\.stringify\(state\.progressByWorld\)/);
  assert.match(source, /英语区/);
  assert.match(source, /数学区/);
  assert.match(source, /worldIds:\s*\['math',\s*'math58',\s*'math912'\]/);
  assert.match(source, /math58:\s*\{\s*ageRange:\s*'5-8'/);
  assert.match(source, /math912:\s*\{\s*ageRange:\s*'9-12'/);
  assert.match(source, /world\.zone === 'math' \? mathPlaceholder : castlePlaceholder/);
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
  // 嗨洛塔品牌名在 document.title，不作为 map h1 硬编码
  assert.match(source, /嗨洛塔少儿启蒙APP/);
  assert.doesNotMatch(source, /宝宝英语岛/);
  assert.match(source, /data-map-world="\$\{activeWorld\.id\}"/);
  assert.match(source, /data-route-scroll/);
  assert.match(source, /data-locate-progress/);
  assert.match(source, /data-locate-progress[^>]*aria-label="回到第 \$\{progressLevelId\} 关最新进度"/);
  assert.match(source, /class="locate-progress-icon"/);
  assert.match(source, /data-map-jump/);
  assert.match(source, /class="map-fab-cluster"/);
  assert.match(source, /class="map-jump-btn"/);
  assert.match(source, /data-map-music-toggle/);
  assert.match(source, /class="map-music-btn/);
  assert.match(source, /function paintMapMusicToggle/);
  assert.match(source, /setPreference\('mapMusic',\s*state\.preferences\.mapMusic === false\)/);
  assert.doesNotMatch(source, /data-locate-progress>定位第/);
  assert.match(source, /routeScroll\.scrollTo/);
  assert.match(source, /resource-strip/);
  assert.equal((source.match(/class="resource-glyph(?:\s|")/g) || []).length, 1);
  assert.equal((source.match(/src="assets\/icons\/resource-star\.webp/g) || []).length, 1);
  assert.doesNotMatch(source, /resource-glyph--gem/);
  assert.doesNotMatch(source, /resource-icon gem/);
  assert.doesNotMatch(source, /<small>宝石<\/small>/);
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
  assert.match(source, /math:\s*'assets\/audio\/math-map-bgm\.mp3\?v=20260804-math-bgm-v2'/);
  assert.match(source, /const MATH_MAP_MUSIC_VOLUME = 0\.3/);
  assert.match(source, /state\.preferences\.mapWorld === 'math'\) return MATH_MAP_MUSIC_VOLUME/);
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/audio/map-bgm.mp3')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/audio/math-map-bgm.mp3')));
  assert.ok(fs.statSync(path.join(__dirname, 'assets/audio/math-map-bgm.mp3')).size > 100_000);
  Array.from({ length: 10 }, (_, index) => index + 1).forEach((number) => {
    assert.ok(fs.existsSync(path.join(__dirname, `assets/ocean/island-${String(number).padStart(2, '0')}.webp`)));
    const cutout = path.join(__dirname, `assets/ocean/scene-island-cutout-${String(number).padStart(2, '0')}.webp`);
    assert.ok(fs.existsSync(cutout));
    assert.ok(fs.statSync(cutout).size < 250_000);
  });
});

test('math AI local attempts keep a bounded count-learning log', () => {
  let log = [];
  for (let index = 0; index < 84; index += 1) {
    log = appendMathAttempt(log, {
      attemptId: `attempt-${index}`,
      ts: index + 1,
      levelId: (index % 5) + 1,
      skill: 'count',
      targetCount: (index % 5) + 1,
      selected: `${index % 5} 个苹果`,
      selectedCount: index % 5,
      correct: `${(index % 5) + 1} 个苹果`,
      isCorrect: index % 3 !== 0,
      mode: 'same',
      responseMs: index * 100,
    });
  }

  assert.equal(MATH_ATTEMPT_KEY, 'baby-island-math-attempts-v1');
  assert.equal(MATH_ATTEMPT_SCHEMA_VERSION, 1);
  assert.equal(log.length, 80);
  assert.equal(log[0].ts, 5);
  assert.equal(log[0].attemptId, 'attempt-4');
  assert.equal(log[0].schemaVersion, 1);
  assert.equal(log[0].responseMs, 400);
  assert.equal(log.at(-1).worldId, 'math');
  assert.equal(log.at(-1).skill, 'count');
  assert.equal(normalizeMathAttempts({ nope: true }).length, 0);
  assert.equal(normalizeMathAttempts([{ levelId: 1, responseMs: 999999 }])[0].responseMs, 600000);
  assert.equal(summarizeMathSkill(log, { window: 6 }).total, 6);
});

test('math AI attempts merge local and cloud logs without duplicates', () => {
  const remote = [
    { attemptId: 'old', ts: 1, levelId: 1, targetCount: 1, selectedCount: 1, isCorrect: true },
    { attemptId: 'shared', ts: 2, levelId: 2, targetCount: 2, selectedCount: 1, isCorrect: false },
  ];
  const local = [
    { attemptId: 'shared', ts: 3, levelId: 2, targetCount: 2, selectedCount: 2, isCorrect: true },
    { attemptId: 'new', ts: 4, levelId: 3, targetCount: 3, selectedCount: 3, isCorrect: true },
  ];

  assert.deepEqual(mergeMathAttempts(local, remote).map((entry) => [entry.attemptId, entry.ts]), [
    ['old', 1],
    ['shared', 3],
    ['new', 4],
  ]);
});

test('math AI adapts repeated misses without changing map progress rules', () => {
  const level = mathLevels[3];
  const wrongLog = [
    { levelId: level.id, skill: 'count', targetCount: level.targetCount, selected: '3 个苹果', selectedCount: 3, correct: level.options[level.correct], isCorrect: false, mode: 'same' },
    { levelId: level.id, skill: 'count', targetCount: level.targetCount, selected: '5 个苹果', selectedCount: 5, correct: level.options[level.correct], isCorrect: false, mode: 'same' },
  ];
  const adapted = adaptMathLevel(level, wrongLog);
  const result = applyQuizAnswer({ completed: [1, 2, 3], unlockedThrough: level.id }, level.id, adapted.correct, adapted.correct, mathLevels.length);

  assert.equal(adapted.math.adaptiveMode, 'easier');
  assert.equal(adapted.options.length, 3);
  assert.equal(adapted.math.groups.length, 3);
  assert.equal(adapted.options[adapted.correct], level.options[level.correct]);
  assert.deepEqual(result.progress, { completed: [1, 2, 3, level.id], unlockedThrough: level.id + 1 });
});

test('math AI harder mode is a visible variant after a correct streak', () => {
  const level = mathLevels[1];
  const correctLog = [
    { levelId: 1, skill: 'count', targetCount: 1, selected: '1 个苹果', selectedCount: 1, correct: '1 个苹果', isCorrect: true, mode: 'same' },
    { levelId: 2, skill: 'count', targetCount: 2, selected: '2 个苹果', selectedCount: 2, correct: '2 个苹果', isCorrect: true, mode: 'same' },
    { levelId: 3, skill: 'count', targetCount: 3, selected: '3 个苹果', selectedCount: 3, correct: '3 个苹果', isCorrect: true, mode: 'same' },
  ];
  const same = buildMathVariant(level, 'same');
  const harder = adaptMathLevel(level, correctLog);

  assert.equal(harder.math.adaptiveMode, 'harder');
  assert.equal(harder.options.length, 3);
  assert.equal(harder.math.groups.length, 3);
  assert.notDeepEqual(harder.options, same.options);
  assert.equal(harder.options[harder.correct], level.options[level.correct]);
  // level 2 target=2：近邻干扰应是 1 和 3
  assert.deepEqual(harder.math.groups.map((group) => group.count).sort((a, b) => a - b), [1, 2, 3]);
});

test('math AI planning interfaces use a backend coach with local fallback', () => {
  const level = mathLevels[1];
  const attempts = [
    { levelId: level.id, skill: 'count', targetCount: 2, selected: '1 个苹果', selectedCount: 1, correct: '2 个苹果', isCorrect: false, mode: 'same' },
    { levelId: level.id, skill: 'count', targetCount: 2, selected: '3 个苹果', selectedCount: 3, correct: '2 个苹果', isCorrect: false, mode: 'same' },
  ];
  const variant = generateMathVariant(level, { mode: 'easier' });
  const report = buildMathParentReport(attempts);
  const exported = buildLearningDataExport(
    { completed: [1], unlockedThrough: 2 },
    { dates: ['2026-08-04'] },
    { childName: '小禾', childAge: '4' },
    { items: [] },
    null,
    levels,
    '2026-08-04T08:00:00.000Z',
    attempts,
  );

  assert.equal(buildMathVariant(level, 'easier').options.length, 3);
  assert.equal(variant.math.adaptiveMode, 'easier');
  assert.equal(variant.math.groups.length, 3);
  const path = nextMathPathRecommendation(attempts, level.id);
  assert.equal(path.levelId, level.id);
  assert.equal(path.reason, 'repeat-current');
  assert.match(path.reasonText, /连续错了|正确率偏低|巩固|继续练/);
  assert.equal(mathVoiceFeedback('wrong-easier', { targetCount: 2 }).provider, 'local-template');
  assert.equal(report.mastery, '建议陪练');
  assert.match(report.reasonText || '', /连续错了|正确率偏低|巩固|继续练/);
  assert.ok(Array.isArray(report.skillBreakdown));
  assert.ok(report.skillBreakdown.some((row) => row.skill === 'count'));
  assert.equal(report.skillLabel, '点数');
  assert.equal(exported.mathAiReport.totalAttempts, 2);
  assert.match(read('auth/apiClient.js'), /function generateMathCoachPlan\(payload\)/);
});

test('math AI runtime is current-page local logic with no frontend AI secret', () => {
  const source = read('script.js');

  assert.match(source, /MATH_ATTEMPT_KEY = 'baby-island-math-attempts-v1'/);
  assert.match(source, /localStorage\.setItem\(MATH_ATTEMPT_KEY, JSON\.stringify\(state\.mathAttempts\)\)/);
  assert.match(source, /mathAttempts:\s*normalizeMathAttempts\(state\.mathAttempts\)/);
  assert.match(source, /mathCoachPlans:\s*\{\}/);
  assert.match(source, /state\.mathAttempts = mergeMathAttempts\(state\.mathAttempts,\s*remote\.mathAttempts\)/);
  assert.match(source, /recordLocalMathAttempt\(\s*level,\s*(?:isTake \|\| isCompose \? level\.correct : selectedIndex|isTake \? level\.correct : selectedIndex|selectedIndex),\s*result\.correct,\s*endedAt - startedAt/);
  assert.match(source, /delete state\.mathCoachPlans\[level\.id\]/);
  assert.match(source, /requestMathCoachPlan\(level,\s*attempt\)/);
  assert.match(source, /api\.generateMathCoachPlan\(mathCoachPayload\(level,\s*attempt\)\)/);
  assert.match(source, /latestCoachPlan = rememberMathCoachPlan\(level,\s*plan\) \|\| plan/);
  assert.match(source, /function mathLevelForCoachPlan\(level\)/);
  assert.match(source, /const questionLevel = mathLevelForCoachPlan\(level\)/);
  assert.match(source, /bindInlineMathQuestion\(inlineMathPanel,\s*mathLevelForCoachPlan\(currentLevel\)\)/);
  assert.match(source, /function speakMathVoiceFeedback\(feedbackText,\s*forceCorrect\)/);
  assert.match(source, /function playMathCoachFeedbackTone\(kind\)/);
  assert.match(source, /function speakMathQuestion\(/);
  assert.match(source, /MATH_QUESTION_AUDIO_VERSION = '20260806-math-q-compose-drag-v1'/);
  assert.match(source, /mathQuestionAudioSrcFor\(level\)/);
  assert.match(source, /requestAnimationFrame\(\(\) => \{\s*if \(quizState === 'answering'\) speakMathQuestion\(\)/);
  assert.match(source, /const src = MATH_COACH_FEEDBACK_AUDIO_SRC\[normalized\]/);
  assert.match(source, /const mathCoachAudio = new Audio\(src\)/);
  assert.match(source, /mapMusic\.volume = MAP_MUSIC_DUCK_VOLUME/);
  // Math correct/wrong SFX = island feedback-holly MP3, play immediately (not after coach).
  assert.match(source, /playMathCoachFeedbackTone\('correct'\);\s*celebrate\(\);/);
  assert.match(source, /playMathCoachFeedbackTone\('wrong'\);/);
  assert.match(source, /function bindInlineMathQuestion\([\s\S]*?function celebrate\(\)[\s\S]*?__CORRECT_CELEBRATION_LOTTIE_DATA[\s\S]*?celebrate\(\);/);
  assert.match(source, /function mathQuestionTableMarkup\([\s\S]*?data-celebration[\s\S]*?data-celebration-lottie/);
  assert.match(source, /mathVoiceFeedback\(shouldRefreshEasier \? 'wrong-easier' : 'wrong'/);
  assert.match(source, /if \(detail\) detail\.textContent = plan\.feedbackText;/);
  assert.doesNotMatch(source, /if \(quizState === 'correct'\) speakMathVoiceFeedback\(plan\.feedbackText,\s*true\)/);
  assert.doesNotMatch(source, /speakMathVoiceFeedback\(plan\.feedbackText,\s*false\)/);
  assert.match(source, /setTimeout\(\(\) => \{[\s\S]*?coachPlanPromise\.then\(\(plan\) => \{[\s\S]*?const plannedMode = plan\?\.variantMode/);
  assert.match(source, /function generateMathVariant\(level,\s*context = \{\}\)/);
  assert.match(source, /function buildMathParentReport\(log = \[\]\)/);
  assert.match(source, /reasonText:/);
  assert.doesNotMatch(source, /new SpeechSynthesisUtterance\(message\)/);
  assert.doesNotMatch(source, /window\.speechSynthesis\.speak\(mathUtterance\)/);
  assert.doesNotMatch(source, /OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY|apiKey\s*[:=]|sk-[A-Za-z0-9]{12,}/);
});

test('math AI report and path recommendation are visible without adding a new page', () => {
  const source = read('script.js');
  const wrongLog = [
    { levelId: 4, skill: 'count', targetCount: 4, selectedCount: 3, selected: '3 个苹果', correct: '4 个苹果', isCorrect: false },
    { levelId: 4, skill: 'count', targetCount: 4, selectedCount: 5, selected: '5 个苹果', correct: '4 个苹果', isCorrect: false },
  ];

  assert.equal(resolveMathContinueLevel([], 4).levelId, 5);
  assert.equal(resolveMathContinueLevel([], 4).reason, 'next-level');
  assert.match(resolveMathContinueLevel([], 4).reasonText || '', /继续第 5 关/);
  assert.equal(resolveMathContinueLevel(wrongLog, 4).levelId, 4);
  assert.equal(resolveMathContinueLevel(wrongLog, 4).reason, 'repeat-current');
  assert.match(resolveMathContinueLevel(wrongLog, 4).reasonText || '', /连续错了|正确率偏低|巩固|继续练/);
  assert.match(source, /data-math-ai-report/);
  assert.match(source, /buildMathParentReport\(state\.mathAttempts\)/);
  assert.match(source, /mathRec\.reasonText/);
  assert.match(source, /data-open-math-recommended data-level="\$\{mathRec\.levelId\}"/);
  assert.match(source, /function openMathRecommendedLevel\(levelId\)/);
  assert.match(source, /state\.preferences\.mapWorld = 'math'/);
  assert.match(source, /openMathRecommendedLevel\(Number\(mathRecommendedBtn\.dataset\.level\)\)/);
  // 从「我的」进数学图：走 showInlineMathLevel，不带常驻「已打开第 N 关」toast
  assert.match(source, /function openMathRecommendedLevel\(levelId\)[\s\S]*?showInlineMathLevel\(levelId\)/);
  assert.doesNotMatch(source, /function openMathRecommendedLevel\(levelId\)[\s\S]*?renderMap\(`已打开第/);
  // 任意直调 renderMap（含从我的进图）必须挂 map-game-active，否则不是沉浸全屏数学图
  assert.match(source, /function renderMap\(initialMessage = ''\)\s*\{[\s\S]*?document\.body\.classList\.add\('map-game-active'\)/);
  assert.match(source, /function showInlineMathLevel\([\s\S]*?renderMap\(\);\s*if \(message\) showMapMessage\(message\)/);
  assert.match(source, /function resolveMathCoachContinueTarget\(plan,\s*levelId\)/);
  assert.match(source, /resolveMathCoachContinueTarget\(latestCoachPlan,\s*level\.id\)[\s\S]*?resolveMathContinueLevel\(state\.mathAttempts,\s*level\.id/);
});

test('math voice answer feature is removed; tap choices only', () => {
  const source = read('script.js');
  const css = read('style.css');
  assert.doesNotMatch(source, /说答案/);
  assert.doesNotMatch(source, /data-math-voice-answer/);
  assert.doesNotMatch(source, /bindVoiceAnswer/);
  assert.doesNotMatch(source, /matchMathVoiceChoice/);
  assert.doesNotMatch(source, /parseMathVoiceTranscript/);
  assert.doesNotMatch(source, /SpeechRecognition/);
  assert.doesNotMatch(css, /math-voice-answer/);
  // correct/wrong still use local Peiqi MP3 feedback, not system TTS
  assert.match(source, /MATH_VOICE_FEEDBACK_MODE = 'correct-wrong-mp3'/);
  assert.doesNotMatch(source, /mathUtterance\.lang|mathUtterance\.rate|new SpeechSynthesisUtterance/);
});

test('asset pack status model drives iPad map download UI', () => {
  const source = read('script.js');
  const manifest = JSON.parse(read('asset-packs.json'));
  const states = normalizeAssetPackStates({
    ocean: { status: 'downloading', progress: 42, bytesDone: 420, bytesTotal: 1000 },
    desert: { status: 'paused', bytesDone: 250, bytesTotal: 1000 },
  });
  const levelStates = normalizeLevelVideoStates({
    [levelVideoStateKey('ocean', 11)]: { mapId: 'ocean', levelId: 11, status: 'ready', localUrl: 'asset-pack://ocean/11.mp4' },
    [levelVideoStateKey('ocean', 12)]: { mapId: 'ocean', levelId: 12, status: 'downloading', bytesDone: 25, bytesTotal: 100 },
  });

  const notInstalledPlayable = assetPackPlayableSummary('ocean', normalizeAssetPackStates(null));
  const downloadingPlayable = assetPackPlayableSummary('ocean', states);
  const downloadingPlayableWithReadyLevel = assetPackPlayableSummary('ocean', states, { levelVideoStates: levelStates });
  const outOfOrderPlayable = assetPackPlayableSummary('ocean', normalizeAssetPackStates(null), {
    levelVideoStates: normalizeLevelVideoStates({
      [levelVideoStateKey('ocean', 12)]: { mapId: 'ocean', levelId: 12, status: 'ready', localUrl: 'asset-pack://ocean/12.mp4' },
    }),
  });
  const ready = assetPackSummary('desert', normalizeAssetPackStates({ desert: { status: 'ready' } }), { bridgeAvailable: true, sourceAvailable: true });
  const downloading = assetPackSummary('ocean', states, { bridgeAvailable: true, sourceAvailable: true, levelVideoStates: levelStates });
  const paused = assetPackSummary('desert', states, { bridgeAvailable: true, sourceAvailable: true });
  const noBridge = assetPackSummary('ocean', states, { bridgeAvailable: false, sourceAvailable: true });
  const noSource = assetPackSummary('ocean', normalizeAssetPackStates(null), { bridgeAvailable: true, sourceAvailable: false });

  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.app.bridge, 'babyIslandAssetPack');
  assert.equal(manifest.app.bundledThroughLevel, 10);
  assert.equal(manifest.maps[0].levelVideoUrlTemplate, '');
  // workbench 定稿 1:1 后，L11–200 用 levels[] 精确下载 URL（含 multi 定稿文件名）
  assert.equal(manifest.maps[0].mapId, 'ocean');
  assert.equal(manifest.maps[0].levels.length, 190);
  assert.equal(manifest.maps[0].levels[0].levelId, 11);
  assert.equal(manifest.maps[0].levels[189].levelId, 200);
  assert.match(String(manifest.maps[0].levels[0].downloadUrl || ''), /level-011-apple\.mp4$/);
  assert.doesNotMatch(JSON.stringify(manifest), /cdn\.example|example\.hirota|localhost|127\.0\.0\.1/i);
  const desertMap = manifest.maps.find((m) => m.mapId === 'desert');
  assert.ok(desertMap);
  assert.equal(desertMap.levels.length, 190);
  const desert107 = desertMap.levelMedia.find((x) => x.levelId === 107);
  assert.ok(String(desert107?.ossKey || '').includes('five-pencils_2'), desert107?.ossKey);
  assert.match(String(desert107?.downloadUrl || ''), /^https:\/\/baobao-chuangguan\.oss-cn-shanghai\.aliyuncs\.com\/assets\/video\/desert\//);
  assert.equal(notInstalledPlayable.text, '已可玩 10/200 关');
  assert.equal(downloadingPlayable.text, '已可玩 10/200 关');
  assert.equal(downloadingPlayableWithReadyLevel.text, '已可玩 11/200 关');
  assert.equal(outOfOrderPlayable.text, '已可玩 10/200 关');
  assert.equal(ready.playableText, '已可玩 200/200 关');
  assert.equal(ready.label, '已完成');
  assert.equal(downloading.status, 'downloading');
  assert.equal(downloading.downloadProgress, 42);
  assert.equal(downloading.progress, 6);
  assert.equal(downloading.playableText, '已可玩 11/200 关');
  assert.match(downloading.label, /下载中 42%/);
  assert.equal(downloading.action, 'pause');
  assert.equal(paused.downloadProgress, 25);
  assert.equal(paused.progress, 5);
  assert.equal(paused.playableText, '已可玩 10/200 关');
  assert.equal(paused.action, 'resume');
  assert.equal(noBridge.disabled, false);
  assert.equal(noSource.disabled, false);
  assert.equal(noSource.stateLabel, '未下载');
  assert.equal(noSource.note, '后面的关卡视频可以在后台下载');
  assert.equal(noSource.actionLabel, '下载');
  assert.match(source, /ASSET_PACK_MANIFEST_URL = 'asset-packs\.json'/);
  assert.match(source, /function assetPackPlayableSummary/);
  assert.match(source, /downloadOrder:\s*'level-ascending'/);
  assert.match(source, /levelQueue/);
  assert.match(source, /targetLevelId:\s*level\.id/);
  assert.match(source, /levelId:\s*nextQueued\?\.levelId \|\| level\.id/);
  assert.match(source, /已可玩 \$\{playable\}\/\$\{totalLevels\} 关/);
  assert.match(source, /已可玩 \$\{totalPlayable\}\/\$\{totalLevels\} 关/);
  assert.match(source, /window\.babyIslandAssetPackEvent/);
  assert.match(source, /function assetPackOverview/);
  assert.match(source, /return \{ status: 'downloading', progress, playableText, label: `下载中 \$\{progress\}%`/);
  assert.match(source, /return \{ status: 'queued', progress, playableText, label: progress \? `下载中 \$\{progress\}%` : '下载中'/);
  assert.match(source, /return \{ status: 'paused', progress, playableText, label: `已暂停 \$\{progress\}%`/);
  assert.match(source, /return \{ status: 'not-installed', progress: 0, playableText/);
  assert.match(source, /function assetPackStatusButtonMarkup/);
  assert.match(source, /function openAssetPackDialog/);
  assert.match(source, /function handleAssetPackActionClick/);
  assert.match(source, /dialog\.addEventListener\('click', \(event\) => \{[\s\S]*?data-asset-pack-action/);
  assert.match(source, /data-asset-pack-panel/);
  assert.match(source, /data-asset-pack-status/);
  assert.match(source, /map-pack-progress-ring/);
  assert.match(source, /map-pack-download-arrow/);
  assert.match(source, /map-pack-attention-dot/);
  assert.match(source, /data-asset-pack-list/);
  assert.match(source, /data-asset-pack-action/);
  assert.match(source, /babyIslandAssetPack/);
  assert.match(source, /<div class="asset-pack-meter"[\s\S]*?<\/div>\s*<button class="asset-pack-action"/);
  assert.doesNotMatch(source, /(地图资源包|资源包|待配置|源站|配置后)/);
  assert.match(read('style.css'), /\.asset-pack-dialog\s*\{[^}]*?--dialog-width:\s*50rem/);
  assert.match(read('style.css'), /\.map-switch-dialog\s*\{[^}]*?width:\s*min\(calc\(100% - 2rem\),\s*var\(--dialog-width,\s*28rem\)\)/);
  assert.match(read('style.css'), /\.map-switch-card\.asset-pack-dialog-card\s*\{[^}]*?justify-items:\s*stretch/);
  assert.match(read('style.css'), /\.asset-pack-list\s*\{[^}]*?width:\s*100%/);
  assert.match(read('style.css'), /\.asset-pack-dialog-card > p:not\(\.paywall-eyebrow\)\s*\{[^}]*?max-width:\s*38rem/);
  assert.match(read('style.css'), /\.asset-pack-row\s*\{[^}]*?grid-template-columns:\s*minmax\(7\.5rem,\s*0\.95fr\)\s*minmax\(14rem,\s*1\.65fr\)\s*auto/);
  assert.match(read('style.css'), /\.asset-pack-row\s*\{[^}]*?text-align:\s*left/);
  assert.match(read('style.css'), /\.asset-pack-copy\s*\{[^}]*?justify-self:\s*start[\s\S]*?text-align:\s*left/);
  assert.match(read('style.css'), /\.asset-pack-action\s*\{[^}]*?justify-self:\s*end/);
  assert.match(read('style.css'), /\.asset-pack-action\[data-asset-pack-action="pause"\]\s*\{[\s\S]*?background:\s*var\(--focus\)/);
  assert.match(read('style.css'), /\.asset-pack-action\[data-asset-pack-action="start"\],[\s\S]*?\.asset-pack-action\[data-asset-pack-action="resume"\]\s*\{[\s\S]*?background:\s*#0e9d8c/);
  assert.match(read('style.css'), /\.asset-pack-meter\s*\{[^}]*?height:\s*0\.52rem/);
  assert.doesNotMatch(read('style.css'), /\.asset-pack-meter\s*\{[^}]*?grid-column:\s*1 \/ -1/);
  assert.match(read('style.css'), /\.asset-pack-row\.is-downloading,[\s\S]*?\.asset-pack-row\.is-queued\s*\{[\s\S]*?border-color:\s*rgba\(14,\s*157,\s*140,\s*0\.26\)[\s\S]*?background:\s*#f5fffb/);
  assert.match(read('style.css'), /\.asset-pack-row\.is-downloading \.asset-pack-meter > span,[\s\S]*?\.asset-pack-row\.is-queued \.asset-pack-meter > span\s*\{[\s\S]*?background:\s*linear-gradient\(90deg,\s*#3bd7c6,\s*#0e9d8c\)/);
  assert.match(read('style.css'), /\.asset-pack-row\.is-not-installed \.asset-pack-meter > span\s*\{[\s\S]*?background:\s*rgba\(121,\s*79,\s*39,\s*0\.26\)/);
  assert.match(read('style.css'), /\.asset-pack-row\.is-downloading \.asset-pack-meter > span,[\s\S]*?\.asset-pack-row\.is-queued \.asset-pack-meter > span\s*\{[\s\S]*?animation:\s*asset-pack-fill-pulse/);
  assert.match(read('style.css'), /\.asset-pack-row\.is-downloading \.asset-pack-meter::after,[\s\S]*?\.asset-pack-row\.is-queued \.asset-pack-meter::after\s*\{[\s\S]*?animation:\s*asset-pack-track-flow/);
  assert.match(read('style.css'), /\.asset-pack-row\.is-downloading \.asset-pack-meter > span::after,[\s\S]*?\.asset-pack-row\.is-queued \.asset-pack-meter > span::after\s*\{[\s\S]*?animation:\s*asset-pack-meter-sheen/);
  assert.match(read('style.css'), /@keyframes\s+asset-pack-track-flow[\s\S]*?translateX\(-100%\)[\s\S]*?translateX\(100%\)/);
  assert.match(read('style.css'), /@keyframes\s+asset-pack-meter-sheen[\s\S]*?translateX\(-120%\)[\s\S]*?translateX\(120%\)/);
  assert.match(source, /LEVEL_VIDEO_LOADING_LOTTIE_URL = 'assets\/lottie\/level-video-loading\.json'/);
  assert.match(source, /function mountLevelVideoLoadingLottie\(root = document\)/);
  assert.match(source, /video-frame video-frame--download[\s\S]*?class="level-video-loading-close" type="button" data-back-map aria-label="返回闯关地图"[\s\S]*?levelVideoDownloadMarkup\(level\)/);
  assert.match(source, /querySelectorAll\('\[data-back-map\]'\)\.forEach/);
  assert.match(source, /data-level-video-loading-lottie/);
  assert.match(source, /level-video-loading-dots/);
  assert.match(read('style.css'), /\.level-video-loading-close\s*\{[\s\S]*?position:\s*fixed[\s\S]*?env\(safe-area-inset-right,\s*0px\)[\s\S]*?border-radius:\s*50%/);
  assert.match(read('style.css'), /@keyframes\s+level-video-loading-dot/);
  assert.doesNotMatch(source, /本关视频下载完成后/);
  assert.doesNotMatch(source, /level-video-download-copy|level-video-download-action|level-video-download-ring/);
  assert.doesNotMatch(read('style.css'), /level-video-download-spin|level-video-download-ring|level-video-download-action/);
  assert.doesNotMatch(source, /class="surface asset-pack-card"/);
});

test('level video waiting page uses the small rocking-horse lottie', () => {
  const lottiePath = path.join(__dirname, 'assets/lottie/level-video-loading.json');
  const lottie = JSON.parse(fs.readFileSync(lottiePath, 'utf8'));
  const preview = read('__level_loading_preview.html');

  assert.equal(lottie.nm, 'racking-horse');
  assert.ok(fs.statSync(lottiePath).size < 60_000);
  assert.match(preview, /assets\/vendor\/lottie\.min\.js/);
  assert.match(preview, /assets\/lottie\/level-video-loading\.json\?v=20260803-rocking-horse-v1/);
  assert.match(preview, /class="level-video-loading-close" type="button" aria-label="关闭预览"/);
  assert.match(preview, /data-level-video-loading-lottie/);
  assert.match(preview, /level-video-loading-dots/);
  assert.doesNotMatch(preview, /progress-card|motion-shell|map-bg-disc|map-actor|video-progress-track|video-progress-fill/);
});

test('level video download model starts unavailable lessons at zero progress', () => {
  const states = normalizeLevelVideoStates({
    [levelVideoStateKey('desert', 12)]: { mapId: 'desert', levelId: 12, status: 'downloading', bytesDone: 25, bytesTotal: 100 },
    bad: { levelId: 0, status: 'ready' },
  });

  assert.equal(states['desert:12'].status, 'downloading');
  assert.equal(states['desert:12'].progress, 25);
  assert.equal(states.bad, undefined);
  assert.equal(levelVideoDownloadLabel('not-installed', 0), '未下载');
  assert.equal(levelVideoDownloadLabel('downloading', 42), '下载中 42%');
  assert.equal(levelVideoDownloadLabel('ready', 100), '已下载');
});

test('level video downloads build an ascending queue before the requested lesson', () => {
  const pack = normalizeAssetPackStates({
    ocean: {
      levelVideoUrlTemplate: 'https://cdn.example.test/{mapId}/level-{levelId3}.mp4',
      levels: [
        { levelId: 14, downloadUrl: 'https://cdn.example.test/ocean/custom-014.mp4', bytesTotal: 1400, sha256: 'abc' },
        { levelId: 12, downloadUrl: 'https://cdn.example.test/ocean/custom-012.mp4', bytesTotal: 1200, sha256: 'def' },
      ],
    },
  });
  const states = normalizeLevelVideoStates({
    [levelVideoStateKey('ocean', 11)]: { mapId: 'ocean', levelId: 11, status: 'ready', localUrl: 'asset-pack://ocean/011.mp4' },
    [levelVideoStateKey('ocean', 13)]: { mapId: 'ocean', levelId: 13, status: 'downloading', bytesDone: 1, bytesTotal: 10 },
  });
  const queue = assetPackLevelDownloadQueue('ocean', pack.ocean, states, { throughLevel: 14 });

  assert.equal(assetPackHasDownloadSource('ocean', pack.ocean), true);
  assert.equal(assetPackLevelVideoUrl('ocean', 12, pack.ocean), 'https://cdn.example.test/ocean/custom-012.mp4');
  assert.deepEqual(queue.map((item) => item.levelId), [12, 13, 14]);
  assert.deepEqual(queue.map((item) => item.downloadUrl), [
    'https://cdn.example.test/ocean/custom-012.mp4',
    'https://cdn.example.test/ocean/level-013.mp4',
    'https://cdn.example.test/ocean/custom-014.mp4',
  ]);
  assert.deepEqual(queue.map((item) => item.bytesTotal), [1200, 0, 1400]);
});

test('desert map uses the fixed 200 natural expression curriculum', () => {
  const desert = levelsForMapWorld('desert');

  assert.equal(desert, desertLevels);
  assert.equal(desert.length, 200);
  assert.equal(new Set(desert.map(({ id }) => id)).size, 200);
  assert.deepEqual(desert.slice(0, 10).map(({ title }) => title), ['Good morning!', 'How are you?', 'See you later!', 'Good night!', 'Have fun!', 'Goodbye!', 'Thank you!', "You're welcome!", 'Excuse me.', "I'm sorry."]);
  assert.deepEqual(desert.slice(0, 10).map(({ zhTitle }) => zhTitle), ['早上好', '你好吗', '待会儿见', '晚安', '玩得开心', '再见', '谢谢你', '不用谢', '打扰一下', '对不起']);
  assert.deepEqual(desert.slice(10, 20).map(({ topic }) => topic), Array(10).fill('课堂规则'));
  assert.equal(desert[20].title, "Let's have breakfast.");
  assert.equal(desert[33].title, "Let's share this cookie.");
  assert.equal(desert[60].title, "I'm happy.");
  assert.equal(desert[75].title, 'Can you tell me a story?');
  assert.equal(desert[89].title, 'Good game!');
  assert.equal(desert[140].title, "Let's take the bus.");
  assert.equal(desert[199].title, 'What do you want to be?');
  assert.equal(desert[199].zhTitle, '你想当什么');
  assert.equal(new Set(desert.map(({ topic }) => topic)).size, 20);
  desert.forEach((level) => assert.equal(level.options[level.correct], level.title));
  assert.deepEqual(levels.slice(0, 10).map(({ title }) => title), ['Mom', 'Dad', 'Grandma', 'Grandpa', 'Hand', 'Rice', 'Water', 'Car', 'Dog', 'Book']);
});

test('map levels carry PEP and 2022-standard alignment metadata', () => {
  const allMapLevels = [...levels, ...desertLevels];
  const validAlignment = new Set(['core', 'bridge', 'extension']);

  allMapLevels.forEach((level) => {
    assert.equal(level.curriculum.standard, '义务教育英语课程标准2022 预备级-一级');
    assert.equal(level.curriculum.claim, '参考人教PEP主题，做6-8岁场景化先修与拓展');
    assert.ok(validAlignment.has(level.curriculum.alignment), `${level.title} has invalid alignment`);
    assert.ok(level.curriculum.theme, `${level.title} must name a theme`);
    assert.ok(Array.isArray(level.curriculum.pepUnits), `${level.title} must have PEP theme bridges`);
    assert.ok(level.curriculum.pepUnits.length >= 1, `${level.title} must have at least one PEP theme bridge`);
  });

  assert.ok(levels[0].curriculum.pepUnits.includes('PEP三上 U2 Different families'));
  assert.ok(levels[56].curriculum.pepUnits.includes('PEP三上 U3 Amazing animals'));
  assert.ok(desertLevels[0].curriculum.pepUnits.includes('PEP三上 U1 Making friends'));
  assert.ok(desertLevels[90].curriculum.pepUnits.includes('PEP三上 U5 The colourful world'));
  assert.ok(desertLevels[100].curriculum.pepUnits.includes('PEP三上 U6 Useful numbers'));
  assert.equal(desertLevels[150].topic, '购物消费');
  assert.equal(desertLevels[150].curriculum.alignment, 'extension');
});

test('desert levels use natural expressions instead of bare labels', () => {
  assert.equal(desertLevels.length, 200);
  assert.equal(desertLevels[33].title, "Let's share this cookie.");
  assert.equal(desertLevels[75].title, 'Can you tell me a story?');
  assert.equal(desertLevels[89].title, 'Good game!');
  assert.equal(questionPromptText(desertLevels[33]), '小朋友，视频里的英语，哪一句是在说「我们分享这块饼干吧」？');

  const banned = new Set(['share cookie', 'tell a story', 'you lose', 'sell that', 'cheap price', 'high price']);
  desertLevels.forEach((level) => {
    assert.equal(level.itemType, 'expression');
    assert.equal(level.worldId, 'desert');
    assert.ok(!banned.has(level.title.toLowerCase()), `banned desert label survived: ${level.title}`);
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
  assert.match(source, /嗨洛塔少儿启蒙APP/);
  ['宝宝视频闯关', '安全过马路', '情绪认知'].forEach((copy) => {
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
  assert.match(css, /\.map-pack-btn/);
  assert.match(css, /\.map-locate-btn,[\s\S]*?\.map-jump-btn,[\s\S]*?\.map-music-btn\s*\{[\s\S]*?min-width:\s*44px[\s\S]*?min-height:\s*44px/);
  assert.match(css, /\.map-fab-label\s*\{/);
  assert.match(css, /\.map-locate-btn,[\s\S]*?\.map-jump-btn,[\s\S]*?\.map-music-btn\s*\{[\s\S]*?border-radius:\s*999px/);
  assert.match(css, /\.map-locate-btn,[\s\S]*?\.map-jump-btn,[\s\S]*?\.map-music-btn\s*\{[\s\S]*?width:\s*3rem[\s\S]*?height:\s*3rem/);
  assert.match(css, /\.map-fab-label\s*\{[\s\S]*?border-radius:\s*999px[\s\S]*?position:\s*absolute|[\s\S]*?position:\s*absolute[\s\S]*?border-radius:\s*999px/);
  assert.match(script, /class="map-fab-label">背景音乐</);
  assert.match(script, /class="map-fab-label">跳关</);
  assert.match(script, /class="map-fab-label">定位</);
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
  assert.match(css, /\.route-ocean\[data-map-theme="math"\]\s*\{[\s\S]*?repeating-linear-gradient\(90deg[\s\S]*?#dfb77b/);
  assert.match(css, /\.route-ocean\[data-map-theme="math"\]::before\s*\{[\s\S]*?repeating-linear-gradient\(0deg[\s\S]*?#fffdf0|#f8f6dd/);
  assert.match(css, /\.route-ocean\[data-map-theme="math"\] \.ocean-loop,[\s\S]*?\.route-ocean\[data-map-theme="math"\] \.flying-seagull/);
  assert.match(css, /\.math-map-decor\s*\{[\s\S]*?pointer-events:\s*none/);
  assert.match(css, /ruler-handpaint-depth-v2\.webp\?v=20260804-math-handpaint-v2/);
  assert.match(css, /pencil-handpaint-depth-v2\.webp\?v=20260804-math-handpaint-v2/);
  assert.match(css, /eraser-handpaint-topdown-v1\.webp\?v=20260806-math-q-compose-drag/);
  assert.match(css, /\.math-map-prop--eraser\s*\{[\s\S]*?top:\s*25\.5%[\s\S]*?left:\s*5\.2%[\s\S]*?transform:\s*rotate\(28deg\)/);
  assert.match(css, /math-map-prop--eraser/);
  assert.match(script, /math-map-prop--eraser/);
  assert.match(css, /pencil-kid-figure-handpaint-v1\.webp\?v=20260804-math-covers-v1/);
  assert.match(css, /plus-tile-handpaint-depth-v3\.webp\?v=20260804-math-handpaint-v2/);
  assert.match(css, /equal-tile-handpaint-depth-v3\.webp\?v=20260804-math-handpaint-v2/);
  assert.match(css, /teal-bead-handpaint-depth-v2\.webp\?v=20260804-math-handpaint-v2/);
  assert.match(css, /red-bead-handpaint-depth-v2\.webp\?v=20260804-math-handpaint-v2/);
  assert.match(css, /apple-handpaint-depth-v2\.webp\?v=20260804-math-quiz-props-v1/);
  assert.match(css, /plate-handpaint-depth-v1\.webp\?v=20260804-math-quiz-props-v1/);
  const mathObjectBlock = css.match(/\n\s{2}\.math-object\s*\{[^}]*\}/)?.[0] || '';
  const mathObjectSetBlock = css.match(/\n\s{2}\.math-object-set\s*\{[^}]*\}/)?.[0] || '';
  const mathPlateBlock = css.match(/\n\s{2}\.math-plate\s*\{[^}]*\}/)?.[0] || '';
  const mathTableBlock = css.match(/\n  \.math-table\s*\{[^}]*\}/)?.[0] || '';
  const mathQuestionCardBlock = css.match(/\n  \.math-question-card\s*\{[^}]*\}/)?.[0] || '';
  assert.match(script, /math-question-prompt/);
  assert.match(script, /math-question-prompt[\s\S]*?question-text[\s\S]*?listen-question-btn/);
  assert.match(css, /\.math-question-prompt\s*\{[\s\S]*?inline-flex/);
  const mathChoiceBlock = css.match(/\n  \.math-choice\s*\{[^}]*\}/)?.[0] || '';
  const mathAppleDropStart = css.indexOf('@keyframes math-apple-drop-in');
  const mathAppleShadowStart = css.indexOf('@keyframes math-apple-shadow-drop-in', mathAppleDropStart);
  const mathAppleDropEnd = css.indexOf('.math-inline-panel .math-table', mathAppleDropStart);
  const mathAppleBodyDropBlock = css.slice(mathAppleDropStart, mathAppleShadowStart);
  const mathAppleDropBlock = css.slice(mathAppleDropStart, mathAppleDropEnd);
  assert.doesNotMatch(mathObjectBlock, /radial-gradient/);
  assert.doesNotMatch(mathObjectBlock, /filter:/);
  assert.doesNotMatch(mathPlateBlock, /radial-gradient/);
  assert.doesNotMatch(mathPlateBlock, /grid-template-columns/);
  assert.match(mathPlateBlock, /place-items:\s*center/);
  assert.match(mathPlateBlock, /isolation:\s*isolate/);
  assert.match(mathPlateBlock, /overflow:\s*visible/);
  assert.match(mathPlateBlock, /aspect-ratio:\s*1/);
  assert.match(mathPlateBlock, /width:\s*min\(100%,\s*clamp\(8\.1rem,\s*23vh,\s*10\.8rem\)\)/);
  assert.match(mathPlateBlock, /border-radius:\s*50%/);
  assert.match(mathObjectSetBlock, /position:\s*absolute/);
  assert.match(mathObjectSetBlock, /inset:\s*13%/);
  assert.match(mathObjectSetBlock, /z-index:\s*1/);
  assert.match(mathObjectSetBlock, /max-width:\s*none/);
  assert.match(mathObjectBlock, /width:\s*var\(--math-object-size,\s*clamp\(2\.55rem,\s*7\.2vh,\s*3\.55rem\)\)/);
  assert.match(mathObjectBlock, /translate:\s*-50%\s*-50%/);
  assert.match(mathObjectBlock, /max-width:\s*38%/);
  // 骰子落点（:has + nth-child），禁止再 flex 换行掉出盘压标签
  assert.match(css, /\.math-object-set:has\(> \.math-object:nth-child\(5\):last-child\)/);
  assert.match(css, /\.math-choice-label\s*\{[\s\S]*?z-index:\s*4/);
  assert.match(css, /transform-origin:\s*50%\s*40%/);
  assert.match(script, /class="math-object-set"[^>]*data-count=/);
  // 苹果统一尺寸：禁止按 data-count 1–5 改 --math-object-size；6–10 允许整体缩小以塞进盘
  assert.doesNotMatch(css, /\.math-object-set\[data-count="1"\]\s*\{[^}]*--math-object-size/);
  assert.doesNotMatch(css, /\.math-object-set\[data-count="2"\]\s*\{[^}]*--math-object-size/);
  assert.doesNotMatch(css, /\.math-object-set\[data-count="3"\]\s*\{[^}]*--math-object-size/);
  assert.doesNotMatch(css, /\.math-object-set\[data-count="4"\]\s*\{[^}]*--math-object-size/);
  assert.doesNotMatch(css, /\.math-object-set\[data-count="5"\]/);
  assert.match(css, /\.math-object-set\[data-count="6"\]/);
  assert.match(css, /\.math-object-set\[data-count="10"\]/);
  assert.match(css, /\.math-take-board/);
  // 取物：关掉盘内苹果的 max-width/translate，否则按钮内苹果缩成细条/白圈
  assert.match(css, /\.math-take-item\s+\.math-object\s*\{[\s\S]*?translate:\s*none[\s\S]*?max-width:\s*none/);
  assert.match(css, /\.math-take-item\s*\{[\s\S]*?min-width:\s*56px[\s\S]*?min-height:\s*56px/);
  assert.match(css, /\.math-take-item\s*\{[\s\S]*?width:\s*clamp\(4\.6rem,\s*11\.5vh,\s*5\.9rem\)/);
  // 跟手幽灵：比池内大 + 弹起态
  assert.match(css, /\.math-take-ghost\s*\{[\s\S]*?min-width:\s*112px[\s\S]*?min-height:\s*112px/);
  assert.match(css, /\.math-take-ghost\.is-lifted/);
  assert.match(script, /TAKE_GHOST_SCALE\s*=\s*1\.5/);
  assert.match(script, /TAKE_GHOST_MIN_PX\s*=\s*112/);
  assert.match(script, /classList\.add\('is-lifted'\)/);
  assert.match(script, /ghostSize\s*\/\s*2/);
  // 取物拖拽：桌上苹果 + 俯视手绘藤篮（单层）+ 幽灵 + touch-action:none（不是两个框）
  assert.match(css, /\.math-take-basket/);
  assert.match(css, /\.math-take-basket-art/);
  assert.match(css, /\.math-take-basket-stage/);
  assert.match(css, /\.math-take-basket-back/);
  assert.match(css, /\.math-take-basket-mouth/);
  assert.match(css, /\.math-take-basket-hint/);
  assert.match(css, /\.math-take-ghost/);
  assert.match(css, /\.math-take-item\s*\{[\s\S]*?touch-action:\s*none/);
  // 俯视口居中落果，不再前缘下沉
  assert.match(css, /\.math-take-basket \.math-take-item\s*\{[\s\S]*?transform:\s*none/);
  assert.match(script, /data-math-take-basket-items/);
  assert.match(script, /math-take-basket-art/);
  assert.match(script, /basket-handpaint-topdown-v1\.webp/);
  assert.match(script, /data-basket-view="topdown"/);
  assert.match(script, /math-take-basket-stage/);
  assert.match(script, /function bindTakeItemPointer\(/);
  assert.match(script, /function placeTakeItem\(/);
  assert.match(script, /math-take-ghost/);
  assert.match(script, /已取出 \$\{count\} \$\{obj\.measure\}，要找 \$\{target\} \$\{obj\.measure\}/);
  // 禁侧视前后唇分层资产（俯视单层）
  assert.doesNotMatch(script, /basket-handpaint-empty-v1\.webp/);
  assert.doesNotMatch(script, /basket-handpaint-front-v1\.webp/);
  assert.doesNotMatch(script, /math-take-basket-front/);
  // 篮内果禁止青环贴纸感
  assert.match(css, /\.math-take-basket \.math-take-item\.is-selected[\s\S]*?outline:\s*0/);
  // 禁止纯 CSS 假编织篮零件
  assert.doesNotMatch(script, /math-take-basket-handle/);
  assert.doesNotMatch(script, /math-take-basket-rim/);
  assert.doesNotMatch(script, /math-take-basket-bowl/);
  assert.doesNotMatch(css, /\.math-take-basket-handle\s*\{/);
  assert.doesNotMatch(css, /\.math-take-basket-rim\s*\{/);
  assert.doesNotMatch(css, /\.math-take-basket-bowl\s*\{/);
  // 答题时藏中间关卡胶囊，避免挡题干
  assert.match(css, /map-game-active:has\(\[data-math-inline-question\] \.math-quiz\) \.math-level-switch-indicator/);
  // 禁止双框点选隐喻
  assert.doesNotMatch(script, /苹果在这里/);
  assert.doesNotMatch(script, /拖到这里/);
  assert.doesNotMatch(css, /\.math-take-zone-label/);
  // 取物左池禁大椭圆软垫/脏阴影块（道具直接落桌面格子）
  assert.match(css, /\.math-take-pool\s*\{[\s\S]*?background:\s*transparent/);
  assert.match(css, /\.math-take-pool::before\s*\{[\s\S]*?(?:content:\s*none|display:\s*none)/);
  assert.doesNotMatch(css, /\.math-take-pool::before\s*\{[\s\S]*?radial-gradient\(ellipse at 50% 40%,\s*rgba\(196,\s*150,\s*88/);
  assert.doesNotMatch(css, /\.math-take-pool\s*\{[\s\S]*?radial-gradient\(ellipse 72% 48%/);
  assert.match(css, /\.math-compose-ref/);
  assert.doesNotMatch(script, /math-empty-mark/);
  assert.doesNotMatch(css, /\.math-empty-mark/);
  assert.match(mathTableBlock, /background:\s*transparent/);
  assert.doesNotMatch(mathTableBlock, /border:/);
  assert.doesNotMatch(mathTableBlock, /box-shadow:/);
  assert.doesNotMatch(mathQuestionCardBlock, /border:/);
  assert.doesNotMatch(mathQuestionCardBlock, /background:/);
  assert.doesNotMatch(mathQuestionCardBlock, /box-shadow:/);
  assert.match(mathChoiceBlock, /border:\s*0/);
  assert.match(mathChoiceBlock, /background:\s*transparent/);
  assert.doesNotMatch(mathChoiceBlock, /box-shadow:/);
  assert.match(css, /\.math-choice\.is-selected \.math-plate,[\s\S]*?\.math-choice\.is-correct \.math-plate\s*\{[\s\S]*?transform:\s*translateY\(-0\.1rem\) scale\(var\(--math-selected-plate-scale,\s*1\.16\)\)/);
  assert.match(css, /\.math-options\s*\{[\s\S]*?--math-selected-ring-border:\s*0\.52rem[\s\S]*?--math-selected-plate-scale:\s*1\.16/);
  assert.match(css, /\.math-options--count-2\s*\{[\s\S]*?--math-selected-ring-border:\s*0\.48rem[\s\S]*?--math-selected-plate-scale:\s*1\.14/);
  assert.match(css, /\.math-plate::before\s*\{[\s\S]*?border:\s*var\(--math-selected-ring-border\) solid rgba\(9,\s*161,\s*139,\s*0\)/);
  assert.match(css, /\.math-plate::before\s*\{[\s\S]*?inset:\s*var\(--math-selected-ring-inset/);
  assert.match(css, /\.math-choice\.is-selected \.math-plate::before,[\s\S]*?\.math-choice\.is-correct \.math-plate::before\s*\{[\s\S]*?border-color:\s*#0a9a84[\s\S]*?box-shadow:\s*none/);
  assert.match(css, /\.math-choice\.is-selected \.math-plate\s*\{[\s\S]*?animation:\s*math-selected-plate-breathe 1\.8s/);
  assert.match(css, /\.math-choice\.is-selected \.math-plate::before\s*\{[\s\S]*?animation:\s*math-selected-ring-breathe 1\.8s/);
  assert.match(css, /@keyframes math-selected-plate-breathe[\s\S]*?--math-selected-plate-scale,\s*1\.16[\s\S]*?\* 1\.04\)/);
  assert.match(css, /@keyframes math-selected-ring-breathe[\s\S]*?50%[\s\S]*?scale\(1\.02\)/);
  assert.doesNotMatch(css, /--math-selected-ring-gold/);
  assert.doesNotMatch(css, /--math-selected-ring-outer/);
  assert.doesNotMatch(css, /--math-selected-ring-size/);
  assert.doesNotMatch(css, /#f2c94d/);
  assert.doesNotMatch(css, /math-selected-plate-pop/);
  assert.doesNotMatch(css, /math-selected-ring-pop/);
  assert.doesNotMatch(css, /math-selected-breathe[-\w]/);
  assert.doesNotMatch(css, /--math-selected-plate-scale:\s*1\.02/);
  assert.doesNotMatch(css, /scale\(1\.065\)/);
  assert.doesNotMatch(css, /border:\s*0\.24rem solid rgba\(9,\s*161,\s*139/);
  assert.doesNotMatch(css, /\.math-object::before/);
  assert.doesNotMatch(css, /border-radius:\s*50%\s*\/\s*38%/);
  assert.match(css, /\.math-object::after\s*\{[\s\S]*?radial-gradient/);
  assert.match(css, /\.level-stop\[data-map-theme="math"\] \.island-art::before\s*\{[\s\S]*?content:\s*attr\(data-math-symbol\)/);
  assert.match(script, /data-math-symbol="\$\{mathSymbol\}"/);
  assert.match(script, /MATH_APPLE_DROP_SFX_SRC = 'assets\/audio\/sfx\/math-apple-drop-blop-soft-01\.mp3\?v=20260804-math-sfx-v1'/);
  assert.match(script, /MATH_APPLE_DROP_IMPACT_OFFSET_MS = 620/);
  assert.match(script, /function playMathAppleDropSounds\(root\)/);
  assert.match(script, /querySelectorAll\('\.math-inline-panel\.is-dropping-in \.math-object'\)/);
  assert.match(script, /getComputedStyle\(object\)\.getPropertyValue\('--math-object-delay'\)/);
  assert.match(script, /new Audio\(MATH_APPLE_DROP_SFX_SRC\)/);
  assert.match(script, /setTimeout\(play,\s*delayMs \+ MATH_APPLE_DROP_IMPACT_OFFSET_MS\)/);
  assert.match(script, /function showInlineMathLevel[\s\S]*?history\.replaceState\(null,\s*'',\s*'#map'\)/);
  assert.match(script, /function requestLevelAccess[\s\S]*?state\.preferences\.mapWorld === 'math'[\s\S]*?nextMathLevelId !== currentMathLevelId \? 'drop' : ''/);
  assert.match(script, /data-math-level-switch-indicator/);
  // 左侧关卡列表已删除：不渲染 rail DOM / 不绑定 rail 逻辑 / 无 rail 样式
  assert.doesNotMatch(script, /data-math-level-rail/);
  assert.doesNotMatch(script, /data-math-rail-level/);
  assert.doesNotMatch(script, /mathMapLevelRailMarkup/);
  assert.doesNotMatch(script, /is-math-rail-active/);
  assert.doesNotMatch(script, /paintRailDialArc/);
  assert.doesNotMatch(css, /\.math-level-rail\b/);
  assert.doesNotMatch(css, /is-math-rail-active/);
  assert.match(css, /\.math-map-play-area\s*\{[\s\S]*?left:\s*clamp\(3rem,\s*7cqw,\s*7rem\)/);
  assert.match(script, /当前第 \$\{currentLevel\.id\} 关，共 \$\{DISPLAY_LEVEL_COUNT\} 关/);
  assert.match(script, /mathMapTransition === 'drop' \? ' is-changing' : ''/);
  assert.match(script, /aria-label=\"\$\{escapeHtml\(mathLevelSwitchAria\)\}\"/);
  assert.match(script, /必经小片子/);
  assert.match(script, /is-story-stop/);
  assert.match(script, /<strong><span>第 \$\{currentLevel\.id\}<\/span><small>\/ \$\{DISPLAY_LEVEL_COUNT\} 关<\/small><\/strong>/);
  assert.match(script, /function showInlineMathLevel[\s\S]*?renderMap\(\);\s*if \(message\) showMapMessage\(message\)/);
  assert.doesNotMatch(script, /已切到第/);
  assert.match(script, /data-math-inline-question/);
  assert.match(script, /data-math-step="-1"/);
  assert.match(script, /data-math-step="1"/);
  assert.match(script, /math-level-step-icon/);
  assert.match(script, /stroke-linecap="round"/);
  assert.match(script, /stroke-linejoin="round"/);
  assert.match(css, /\.math-level-step-icon/);
  assert.doesNotMatch(css, /\.math-level-step::before/);
  assert.match(script, /bindInlineMathQuestion\(inlineMathPanel,\s*mathLevelForCoachPlan\(currentLevel\)\)/);
  assert.match(script, /playMathAppleDropSounds\(inlineMathPanel\)/);
  assert.match(script, /mathMapTransition:\s*''/);
  assert.match(script, /function showInlineMathLevel\(levelId,\s*message = '',\s*transition = ''\)/);
    assert.match(script, /function transitionToInlineMathLevel[\s\S]*?classList\.add\('is-switching-out'\)[\s\S]*?showInlineMathLevel\(nextId,[\s\S]*?'drop'\)/);
    assert.match(script, /function resolveMathLevelStep\(/);
    assert.match(script, /resolveMathLevelStep\(/);
    assert.match(script, /已回到可玩的第/);
    // 数学跳关：会员关直接付费墙，不把人扔进会员关题面
    assert.match(script, /onDepart:[\s\S]*?currentMapTheme === 'math'[\s\S]*?getLevelAccess\(levelId[\s\S]*?openPaywallDialog\(levelId/);
    assert.match(script, /stepButtons\.forEach[\s\S]*?transitionToInlineMathLevel\(level\.id \+ Number\(button\.dataset\.mathStep\),\s*button\)/);
    assert.match(script, /window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches/);
  assert.match(script, /route\.type === 'level'[\s\S]*?state\.preferences\.mapWorld === 'math'[\s\S]*?history\.replaceState\(null,\s*'',\s*'#map'\)/);
  assert.match(css, /\.math-inline-header\s*\{[\s\S]*?display:\s*none/);
  assert.match(css, /\.math-level-step\s*\{[\s\S]*?position:\s*relative/);
  assert.match(css, /\.math-level-step\s*\{[\s\S]*?border:\s*2px solid rgba\(110,\s*70,\s*24,\s*0\.55\)[\s\S]*?background:\s*rgba\(255,\s*248,\s*220,\s*0\.98\)/);
  assert.match(css, /\.math-inline-panel\s*\{[\s\S]*?grid-template-areas:[\s\S]*?prev header next[\s\S]*?prev layout next/);
  assert.match(css, /\.math-level-step--prev\s*\{[\s\S]*?grid-area:\s*prev/);
  assert.match(css, /\.math-level-step--next\s*\{[\s\S]*?grid-area:\s*next/);
  assert.match(css, /\.math-inline-panel\.is-switching-out \.math-table\s*\{[\s\S]*?opacity:\s*0/);
  assert.match(script, /--math-object-delay:\$\{objectIndex\+\+ \* 190\}ms/);
  assert.match(css, /\.math-inline-panel\.is-dropping-in \.math-object\s*\{[\s\S]*?will-change:\s*transform,\s*opacity/);
  assert.match(css, /\.math-inline-panel\.is-dropping-in \.math-object\s*\{[\s\S]*?animation:\s*math-apple-drop-in 0\.82s cubic-bezier\(0\.56,\s*0\.06,\s*0\.8,\s*0\.34\)/);
  assert.match(css, /\.math-inline-panel\.is-dropping-in \.math-object::after\s*\{[\s\S]*?animation:\s*math-apple-shadow-drop-in 0\.82s cubic-bezier\(0\.56,\s*0\.06,\s*0\.8,\s*0\.34\)/);
  assert.match(css, /@keyframes math-apple-drop-in[\s\S]*?0%[\s\S]*?scale\(3\.65\)[\s\S]*?12%[\s\S]*?opacity:\s*1[\s\S]*?76%,\s*100%[\s\S]*?scale\(1\)/);
  assert.match(css, /@keyframes math-apple-shadow-drop-in[\s\S]*?scale\(0\.1\)[\s\S]*?76%[\s\S]*?opacity:\s*0\.66[\s\S]*?scale\(1\.42\)[\s\S]*?88%[\s\S]*?scale\(0\.98\)[\s\S]*?scale\(1\)/);
  assert.doesNotMatch(mathAppleDropBlock, /blur\(/);
  assert.doesNotMatch(mathAppleBodyDropBlock, /translate(?:3d|X|Y)?\(/);
  assert.doesNotMatch(mathAppleBodyDropBlock, /rotate\(/);
  assert.doesNotMatch(mathAppleBodyDropBlock, /scale\([^)]*,/);
  assert.doesNotMatch(mathAppleBodyDropBlock, /scale\(0\./);
  assert.doesNotMatch(mathAppleBodyDropBlock, /34%|58%|68%/);
  assert.match(css, /\.math-level-switch-indicator\s*\{[\s\S]*?position:\s*sticky[\s\S]*?grid-template-columns:\s*auto auto minmax\(0,\s*1fr\)/);
  assert.match(css, /\.math-level-switch-indicator\.is-changing\s*\{[\s\S]*?animation:\s*math-level-switch-pop/);
  assert.match(css, /\.math-level-switch-indicator\.is-changing strong span\s*\{[\s\S]*?animation:\s*math-level-number-pop/);
  // toast 与「当前关卡」并存；禁止再 display:none 顶掉胶囊
  assert.doesNotMatch(css, /\.map-message:not\(\[hidden\]\) \+ \.math-level-switch-indicator\s*\{[^}]*display:\s*none/);
  assert.match(css, /\.map-message:not\(\[hidden\]\) \+ \.math-level-switch-indicator\s*\{[^}]*margin-top:/);
  assert.match(css, /@keyframes math-level-switch-pop[\s\S]*?var\(--math-level-switch-base-transform\)/);
  assert.match(css, /@keyframes math-level-number-pop/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.math-level-switch-indicator\.is-changing/);
  assert.match(css, /\.math-map-play-area\s*\{[\s\S]*?position:\s*absolute/);
  // ✓ 确认钮必须抬离底栏：play-area bottom 用 --bottom-tabs-space，禁止再写死小 inset
  assert.match(css, /--bottom-tabs-space:\s*calc\(var\(--bottom-tabs-height\)\s*\+\s*0\.7rem\)/);
  assert.match(css, /\.math-map-play-area\s*\{[\s\S]*?bottom:\s*calc\(var\(--bottom-tabs-space\)\s*\+\s*env\(safe-area-inset-bottom/);
  assert.doesNotMatch(css, /\.math-map-play-area\s*\{[\s\S]{0,280}?bottom:\s*clamp\(2\.6rem/);
  assert.match(css, /\.math-inline-panel\s+\.quiz-footer\s*\{[\s\S]*?z-index:\s*8/);
  assert.match(css, /\.route-ocean\[data-map-theme="math"\] \.route-scroll\s*\{[\s\S]*?overflow-x:\s*hidden[\s\S]*?scrollbar-width:\s*none/);
  assert.match(css, /\.route-ocean\[data-map-theme="math"\] \.route-scroll::-webkit-scrollbar\s*\{[\s\S]*?display:\s*none/);
  assert.match(css, /\.route-ocean\[data-map-theme="math"\] \.boat-dock\s*\{[\s\S]*?display:\s*none/);
  assert.match(css, /\.route-ocean\[data-map-theme="math"\] \.toy-steamboat\.is-math-rider\s*\{[\s\S]*?display:\s*none/);
  assert.match(css, /\.toy-steamboat\.is-math-rider\.is-sailing \.steamboat-body\s*\{[\s\S]*?animation:\s*none/);
  assert.match(css, /\.route-ocean\[data-map-theme="math"\] \.level-stop \.island-art\s*\{[\s\S]*?opacity:\s*0/);
  assert.match(css, /\.route-ocean\[data-map-theme="math"\] \.level-stop \.level-node,[\s\S]*?\.route-ocean\[data-map-theme="math"\] \.level-stop \.level-state-text,[\s\S]*?visibility:\s*hidden/);
  assert.doesNotMatch(script, /math-map-prop--one">\+/);
  assert.doesNotMatch(script, /math-map-prop--two">=/);
  assert.match(script, /math-map-prop--ruler/);
  assert.match(script, /math-map-prop--kid-doodle/);
  assert.match(script, /currentMapTheme === 'math' \? 'is-math-rider'/);
  assert.match(css, /\.route-ocean\[data-map-theme="desert"\] \.route-stage\s*\{\s*--level-stop-width:\s*min\(62cqw,\s*62rem\)/);
  assert.match(css, /\.route-ocean\[data-map-theme="ocean"\] \.level-stop\.square-island \.island-art\s*\{\s*width:\s*30cqw/);
  assert.match(css, /egypt-desert-infinite-clean-bg-dreamina-v2\.png\?v=20260720-desert-infinite-v2/);
  assert.match(script, /egypt-desert-infinite-bg-libtv-v4\.mp4\?v=20260720-desert-bg-v4/);
  assert.match(css, /\.route-ocean\[data-map-theme="desert"\] \.ocean-loop--desert\s*\{[\s\S]*?height:\s*42%[\s\S]*?object-position:\s*center top[\s\S]*?mask-image:\s*linear-gradient\(to bottom,\s*#000 0 64%,\s*transparent 100%\)/);
  assert.match(css, /\.level-stop\[data-map-theme="desert"\] \.island-art\s*\{[\s\S]*?mask-image:\s*linear-gradient/);
  assert.match(css, /\.level-stop\[data-map-theme="desert"\] \.island-art\s*\{[\s\S]*?filter:\s*sepia\(0\.12\) saturate\(0\.86\)/);
  assert.match(css, /\.level-stop\[data-map-theme="desert"\]::before\s*\{[\s\S]*?radial-gradient\(ellipse at center,\s*rgba\(132,\s*83,\s*34,\s*0\.17\)/);
  assert.match(css, /\.level-stop\[data-map-theme="desert"\]::after\s*\{[\s\S]*?linear-gradient\(180deg,\s*rgba\(246,\s*216,\s*150,\s*0\)/);
  assert.doesNotMatch(`${script}\n${css}`, /egypt-railway-bg-libtv-v1|egypt-desert-rail-bg|lizard|蜥蜴/);
  assert.match(script, /data-desert-decor/);
  assert.match(script, /runtime-v2\/\$\{slot\.asset\}\?v=\$\{DESERT_DECOR_VERSION\}/);
  assert.match(script, /DESERT_DECOR_VERSION = '20260801-desert-decor-v13c'/);
  assert.match(script, /DESERT_DECOR_BY_KIND/);
  assert.match(script, /DESERT_DECOR_CACTUS_STYLES/);
  assert.match(script, /pickCactus/);
  assert.match(script, /25-cactus-saguaro-y/);
  assert.match(script, /26-cactus-single-arm/);
  assert.match(script, /27-cactus-candelabra/);
  assert.match(script, /28-cactus-short-plump/);
  assert.match(script, /29-cactus-tall-thin/);
  assert.match(script, /30-cactus-prickly-pear/);
  assert.match(script, /31-cactus-curved-arm/);
  assert.match(script, /32-cactus-seedling/);
  assert.match(script, /DESERT_DECOR_FOOTPRINTS/);
  assert.match(script, /DESERT_DECOR_MICRO/);
  assert.match(script, /43-foot-trail-lr/);
  assert.match(script, /43b-foot-trail-lr/);
  assert.doesNotMatch(script, /DESERT_DECOR_FOOTPRINTS[\s\S]*?33-footprint-sandal/);
  assert.doesNotMatch(script, /DESERT_DECOR_FOOTPRINTS[\s\S]*?40-sandal-trail-lr/);
  assert.doesNotMatch(script, /DESERT_DECOR_FOOTPRINTS[\s\S]*?41-animal-trail-lr/);
  assert.doesNotMatch(script, /DESERT_DECOR_FOOTPRINTS[\s\S]*?42-oval-print/);
  assert.match(script, /36-pottery-sherd/);
  assert.match(script, /37-linen-scrap/);
  assert.match(script, /38-tumbleweed/);
  assert.match(script, /39-scarab-stone/);
  assert.match(script, /kind: 'footprint'|pushGround\('footprint'/);
  assert.match(script, /pushGround\('micro'/);
  assert.match(css, /data-decor-kind=\"footprint\"/);
  assert.match(css, /rotateX\(/);
  assert.match(css, /data-decor-kind=\"micro\"/);
  assert.match(script, /17-broken-clay-pot/);
  assert.match(script, /18-barrel-cactus/);
  assert.match(script, /19-pebble-cluster/);
  assert.match(script, /20-small-stone-block/);
  assert.match(script, /21-cracked-amphora-shard/);
  assert.match(script, /22-tiny-gravel-scatter/);
  assert.match(script, /23-small-stone-cairn/);
  assert.match(script, /24-gravel-dust-foot/);
  assert.match(script, /data-decor-kind/);
  assert.match(script, /DESERT_DECOR_TEMPLATES/);
  assert.match(script, /data-decor-template/);
  assert.match(script, /lone_hero|almost_clean|cactus_pair/);
  assert.match(script, /kind: 'plant'|push\('plant'/);
  assert.match(script, /kind: 'pot'|push\('pot'/);
  assert.match(script, /kind: 'pebble'|push\('pebble'/);
  assert.match(script, /kind: 'stone'|push\('stone'/);
  assert.match(script, /DESERT_DECOR_NATURAL_SIZE/);
  // 体量跨度：石子必须明显小于棕榈/巨石
  assert.match(script, /'19-pebble-cluster\.webp': 0\.[3-5][0-9]/);
  assert.match(script, /'22-tiny-gravel-scatter\.webp': 0\.[2-4][0-9]/);
  assert.match(script, /'05-date-palm-sapling\.webp': 1\.[2-9]/);
  assert.match(script, /'08-boulder-slab\.webp': 1\.[0-9]/);

  assert.match(script, /is-\$\{slot\.layer\}/);
  assert.match(script, /08-boulder-slab\.webp/);
  assert.match(script, /12-column-stub\.webp/);
  assert.doesNotMatch(script, /14-clay-water-jug|02-dry-grass-tuft|16-stone-block|04-terracotta-jar|10-woven-basket/);
  assert.match(css, /--decor-size/);
  assert.match(css, /\.desert-decor\s*\{[\s\S]*?calc\(var\(--decor-size/);
  assert.match(script, /DESERT_DECOR_NATURAL_SIZE/);
  assert.match(script, /--decor-size:\$\{size\.toFixed\(2\)\}/);
  assert.match(css, /\.desert-decor\s*\{[\s\S]*?background:\s*var\(--decor-image\) center bottom \/ contain no-repeat/);
  assert.match(css, /\.desert-decor\.is-back\s*\{/);
  assert.match(worker, /assets\/egypt-map\/cutouts\/decor\/runtime-v2\/01-cactus-cluster\.webp\?v=20260801-desert-decor-v13c/);
  assert.match(worker, /assets\/egypt-map\/cutouts\/decor\/runtime-v2\/17-broken-clay-pot\.webp\?v=20260801-desert-decor-v13c/);
  assert.match(worker, /assets\/egypt-map\/cutouts\/decor\/runtime-v2\/19-pebble-cluster\.webp\?v=20260801-desert-decor-v13c/);
  assert.match(worker, /assets\/egypt-map\/cutouts\/decor\/runtime-v2\/22-tiny-gravel-scatter\.webp\?v=20260801-desert-decor-v13c/);
  assert.match(worker, /assets\/egypt-map\/cutouts\/decor\/runtime-v2\/24-gravel-dust-foot\.webp\?v=20260801-desert-decor-v13c/);
  assert.match(worker, /assets\/egypt-map\/cutouts\/decor\/runtime-v2\/43-foot-trail-lr\.webp\?v=20260801-desert-decor-v13c/);
  assert.match(worker, /assets\/egypt-map\/cutouts\/decor\/runtime-v2\/43b-foot-trail-lr\.webp\?v=20260801-desert-decor-v13c/);
  assert.match(worker, /assets\/egypt-map\/cutouts\/decor\/runtime-v2\/39-scarab-stone\.webp\?v=20260801-desert-decor-v13c/);
  assert.match(worker, /baby-island-shell-20260807-math-take-pool-no-blob-v1/);
  assert.match(worker, /assets\/math-map\/covers\/math-desk-cover-v1\.webp\?v=20260804-math-covers-v1/);
  assert.match(worker, /assets\/math-map\/covers\/math-garden-cover-v1\.webp\?v=20260804-math-covers-v1/);
  assert.match(worker, /assets\/math-map\/covers\/math-star-tower-cover-v1\.webp\?v=20260804-math-covers-v1/);
  assert.match(worker, /assets\/audio\/math-map-bgm\.mp3\?v=20260804-math-bgm-v2/);
  assert.match(worker, /assets\/math-map\/quiz\/apple-handpaint-depth-v2\.webp\?v=20260804-math-quiz-props-v1/);
  assert.match(worker, /assets\/math-map\/quiz\/plate-handpaint-depth-v1\.webp\?v=20260804-math-quiz-props-v1/);
  assert.match(worker, /assets\/math-map\/quiz\/basket-handpaint-topdown-v1\.webp\?v=20260807-math-take-pool-no-blob-v1/);
  assert.doesNotMatch(worker, /basket-handpaint-empty-v1\.webp/);
  assert.doesNotMatch(worker, /basket-handpaint-front-v1\.webp/);
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/01-cactus-cluster.webp')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/13-acacia-sapling.webp')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/17-broken-clay-pot.webp')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/18-barrel-cactus.webp')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/25-cactus-saguaro-y.webp')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/30-cactus-prickly-pear.webp')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/32-cactus-seedling.webp')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/43-foot-trail-lr.webp')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/43b-foot-trail-lr.webp')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/36-pottery-sherd.webp')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/37-linen-scrap.webp')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/38-tumbleweed.webp')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/39-scarab-stone.webp')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/19-pebble-cluster.webp')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/20-small-stone-block.webp')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/21-cracked-amphora-shard.webp')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/22-tiny-gravel-scatter.webp')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/23-small-stone-cairn.webp')));
  assert.ok(fs.existsSync(path.join(__dirname, 'assets/egypt-map/cutouts/decor/runtime-v2/24-gravel-dust-foot.webp')));
  assert.doesNotMatch(`${script}\n${css}\n${worker}`, /vulture|desert-vulture|data-desert-vulture|data-vulture-clip|DESERT_VULTURE|scareDesertVulture/);
  assert.match(css, /\.island-art\s*\{[\s\S]*?background:\s*var\(--island-image\) center \/ contain no-repeat/);
  const lockedIslandArtBlock = css.match(/\.level-stop:has\(\.locked\) \.island-art\s*\{([^}]*)\}/)?.[1] ?? '';
  assert.doesNotMatch(lockedIslandArtBlock, /grayscale/);
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
    assert.match(script, /const MAP_STOP_BEFORE_VEHICLE_MS = 1000/);
    assert.match(script, /const BOAT_HOLD_MS = 0/);
    assert.match(script, /const BOAT_SAIL_MS = 2800/);
    assert.match(script, /const sailMs = BOAT_SAIL_MS/);
    assert.doesNotMatch(script, /distanceScale/);
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
    assert.match(script, /feedbackTimer = setTimeout\(confirmIslandSwitch, MAP_STOP_BEFORE_VEHICLE_MS\)/);
    assert.match(script, /boatPhase = 'holding'/);
    assert.match(script, /boatPhase = 'sailing'/);
    assert.match(script, /setProperty\('--boat-x'/);
    assert.match(script, /getStopOffsetX/);
    assert.doesNotMatch(script, /fromCurrent/);
    assert.match(script, /boatHomeStop = departStop;[\s\S]*?scheduleBoatCrossing\(travelDirection\);[\s\S]*?if \(!state\.preferences\.autoPronunciation\)/);
    assert.doesNotMatch(script, /settleBoatAfterScroll|if \(feedbackArmed\) setBoatSailing\(true\)|setTimeout\(\(\) => setBoatSailing\(false\), 620\)/);
    assert.doesNotMatch(script, /is-entering|--boat-enter-x|sailBoatToCenteredStop/);
    assert.doesNotMatch(script, /--boat-facing|pendingBoatDirection|scaleX\(var\(--boat-facing/);
    assert.match(script, /camel-walk-alpha-v2\.mov\?v=20260720-libtv-camel-v2/);
    assert.match(script, /camel-walk-alpha-v2\.webm\?v=20260720-libtv-camel-v2/);
    assert.match(script, /camel-walk-frame96-idle-v6\.png\?v=20260720-camel-idle-walkmatch-v6/);
    assert.match(script, /camel-idle-expressive-v6\.mov\?v=20260801-camel-idle-expressive-v6/);
    assert.match(script, /camel-idle-expressive-v6\.webm\?v=20260801-camel-idle-expressive-v6/);
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
    assert.ok(fs.statSync(path.join(__dirname, 'assets/egypt-map/cutouts/characters/libtv/camel-idle-expressive-v6.mov')).size > 1_000_000);
    assert.ok(fs.statSync(path.join(__dirname, 'assets/egypt-map/cutouts/characters/libtv/camel-idle-expressive-v6.webm')).size > 1_000_000);
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
    assert.doesNotMatch(script, /freezeBoatHomeAtCurrentX/);
    assert.match(script, /const hardCancelBoatMotion = \(\) => \{[\s\S]*?boatHomeFrozen = false;[\s\S]*?setBoatSailing\(false\);[\s\S]*?\}/);
    assert.match(script, /const settleBoatAtLastConfirmedStop = \(\) => \{[\s\S]*?if \(boatPhase === 'idle'\) return false;[\s\S]*?hardCancelBoatMotion\(\);[\s\S]*?boatHomeStop = lastFeedbackStop;[\s\S]*?boatHomeFrozen = false;[\s\S]*?snapBoatToHome\(\);[\s\S]*?return true;[\s\S]*?\}/);
    assert.match(script, /const interruptBoatSail = \(\) => \{[\s\S]*?settleBoatAtLastConfirmedStop\(\);[\s\S]*?\}/);
    assert.doesNotMatch(script, /getBoatDepartureStop/);
    assert.match(script, /centeredStop = nextStop;[\s\S]*?if \(boatPhase === 'idle'\) \{[\s\S]*?boatHomeStop = lastFeedbackStop;/);
    assert.match(script, /const departStop = lastFeedbackStop;[\s\S]*?lastFeedbackStop = centeredStop;[\s\S]*?boatHomeStop = departStop;[\s\S]*?scheduleBoatCrossing\(travelDirection\);/);
    assert.doesNotMatch(script, /boatHomeStop = centeredStop;[\s\S]*?lastFeedbackStop = centeredStop;[\s\S]*?setBoatX\(0\)/);
    assert.match(script, /const handleRouteIntent = \(\) => \{[\s\S]*?settleBoatAtLastConfirmedStop\(\);[\s\S]*?armIslandFeedback\(\);[\s\S]*?\}/);
    assert.match(script, /if \(Math\.hypot\(dx, dy\) < BOAT_DRAG_INTERRUPT_PX\) return;[\s\S]*?routePointerStart = null;[\s\S]*?settleBoatAtLastConfirmedStop\(\);[\s\S]*?armIslandFeedback\(\);/);
    assert.match(script, /routeScroll\.addEventListener\('scroll', \(\) => \{[\s\S]*?settleBoatAtLastConfirmedStop\(\);[\s\S]*?requestAnimationFrame/);
    assert.match(script, /routeScroll\.addEventListener\('pointerdown', onRoutePointerDown/);
    assert.match(script, /routeScroll\.addEventListener\('pointermove', onRoutePointerMove/);
    assert.match(script, /routeScroll\.addEventListener\('pointerup', onRoutePointerEnd/);
    assert.match(script, /routeScroll\.addEventListener\('pointercancel', onRoutePointerEnd/);
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

test('map FAB cluster: locate + jump beside, absolute in route-ocean', () => {
  const css = read('style.css');
  const script = read('script.js');

  // 1) cluster owns absolute bottom-right; buttons are relative inside
  assert.match(css, /\.map-fab-cluster\s*\{[^}]*?position:\s*absolute[^}]*?\}/);
  assert.doesNotMatch(css, /\.map-fab-cluster\s*\{[^}]*?position:\s*fixed[^}]*?\}/);
  assert.match(css, /\.map-locate-btn,[\s\S]*?\.map-jump-btn,[\s\S]*?\.map-music-btn\s*\{[^}]*?position:\s*relative/);

  // 2) Proper z-index on cluster + buttons
  assert.match(css, /\.map-fab-cluster\s*\{[^}]*?z-index:\s*5/);
  assert.match(css, /\.map-locate-btn,[\s\S]*?\.map-jump-btn,[\s\S]*?\.map-music-btn\s*\{[^}]*?z-index:\s*5/);

  // 3) Positioned at bottom-right of ocean container
  assert.match(css, /\.map-fab-cluster\s*\{[^}]*?bottom:\s*clamp/);
  assert.match(css, /\.map-fab-cluster\s*\{[^}]*?right:\s*clamp/);
  assert.match(css, /\.map-fab-cluster\s*\{[^}]*?top:\s*auto/);
  assert.match(css, /\.map-fab-cluster\s*\{[^}]*?gap:\s*1rem/);

  // 4) markup: music + jump beside locate
  assert.match(script, /data-current-level=/);
  assert.match(script, /data-asset-pack-panel/);
  assert.match(script, /data-map-jump/);
  assert.match(script, /data-map-music-toggle/);
  assert.match(script, /map-fab-cluster/);

  // 5) ::after label shows "第 N 关" text (base); immersive map hides it
  assert.match(script, /class=\"map-fab-label\">定位</);
  assert.doesNotMatch(css, /\.map-locate-btn::after\s*\{[^}]*content:\s*[\"']第/);

  // 6) Hit area ≥44px preserved on FABs
  assert.match(css, /\.map-locate-btn,[\s\S]*?\.map-jump-btn,[\s\S]*?\.map-music-btn\s*\{[^}]*?min-width:\s*44px[^}]*?min-height:\s*44px/);

  // 7) focus-visible + split semantics
  assert.match(css, /\.map-locate-btn:focus-visible,[\s\S]*?\.map-jump-btn:focus-visible,[\s\S]*?\.map-music-btn:focus-visible\s*\{[^}]*?outline:\s*3px\s+solid\s+var\(--mint\);\s*outline-offset:\s*3px/);
  assert.match(script, /aria-label=\"回到第/);
  assert.match(script, /title=\"回到当前最新进度/);
  assert.match(script, /aria-label=\"跳关，仅移动地图到某一关/);
  assert.match(script, /关闭背景音乐/);
  assert.match(script, /打开背景音乐/);
});

test('map asset pack HUD lives in topbar and exposes live progress outside dialog', () => {
  const css = read('style.css');
  const script = read('script.js');
  const routeOceanBlock = script.match(/<div class="route-ocean"[\s\S]*?<div class="map-fab-cluster"/)?.[0] ?? '';

  assert.match(script, /<div class="map-brand">[\s\S]*?<div class="map-brand-card">[\s\S]*?<\/div>\s*<div class="map-pack-status-hud" data-asset-pack-status>/);
  assert.match(script, /const globalUpdateStatusMarkup = currentMapTheme === 'math' \? '' : `[\s\S]*?<div class="map-pack-status-hud" data-global-update-status>[\s\S]*?\$\{globalUpdateButtonMarkup\(\)\}/);
  assert.match(script, /\$\{globalUpdateStatusMarkup\}/);
  assert.match(script, /host\.innerHTML = activeWorld\?\.usesVideoAssets === false \? '' : assetPackStatusButtonMarkup\(\)/);
  assert.doesNotMatch(routeOceanBlock, /map-pack-status-hud/);
  assert.match(script, /style="--pack-progress:\$\{summary\.progress\}%"/);
  assert.match(script, /is-\$\{summary\.status\}\$\{liveClass\}/);
  assert.match(script, /<span class="map-pack-status-copy"><strong>\$\{playableText\}<\/strong><small>\$\{stateText\}<\/small><\/span>/);
  assert.match(script, /has-attention/);
  assert.doesNotMatch(script, /map-fab-cluster[\s\S]{0,420}class="map-pack-btn"/);
  assert.match(css, /\.map-pack-status-hud\s*\{[^}]*?position:\s*relative[^}]*?flex:\s*0 0 auto/);
  assert.doesNotMatch(css, /\.map-pack-status-hud\s*\{[^}]*?position:\s*absolute/);
  assert.match(css, /\.map-pack-attention-dot\s*\{/);
  assert.match(css, /\.map-pack-progress-ring\s*\{[^}]*?conic-gradient/);
  assert.match(css, /\.map-pack-progress-ring::after\s*\{[^}]*?display:\s*none/);
  assert.match(css, /\.map-pack-btn\.is-downloading \.map-pack-download-arrow,[\s\S]*?\.map-pack-btn\.is-queued \.map-pack-download-arrow\s*\{[\s\S]*?animation:\s*pack-download-arrow-drop/);
  assert.match(css, /@keyframes\s+pack-download-arrow-drop[\s\S]*?translateY\(-0\.34rem\)[\s\S]*?translateY\(0\.36rem\)/);
  assert.doesNotMatch(css, /pack-ring-spin|pack-core-pulse/);
  assert.match(css, /\.map-topbar \.map-pack-btn\s*\{[^}]*?min-height:\s*3\.75rem/);
  assert.doesNotMatch(css, /\.map-game-active \.map-pack-status-hud\s*\{[^}]*?top:/);
});

test('math map locate returns to progress level via showInlineMathLevel, not hidden route scroll', () => {
  const source = read('script.js');
  assert.match(source, /data-current-level=\"\$\{progressLevelId\}\"/);
  assert.match(source, /currentMapTheme === 'math'[\s\S]*?showInlineMathLevel\(homeId/);
  assert.match(source, /currentMapTheme === 'math'[\s\S]*?showInlineMathLevel\(levelId/);
  assert.match(source, /locateToLevelId\(progressLevelId, 'smooth'\)/);
  assert.doesNotMatch(source, /locateBtn\?\.addEventListener\('click', \(\) => \{\s*locateToLevelId\(currentLevel\.id/);
});

test('initial map locate bypasses smooth scroll so boat docks at current level after refresh', () => {
  const script = read('script.js');

  assert.match(script, /const locateProgress = \(behavior = 'smooth'\) => locateToStop\(currentStop, behavior\)/);
  assert.match(script, /const previousScrollBehavior = routeScroll\.style\.scrollBehavior/);
  assert.match(script, /if \(behavior === 'auto'\) routeScroll\.style\.scrollBehavior = 'auto'/);
  assert.match(script, /routeScroll\.scrollTo\(\{ left, behavior \}\)/);
  assert.match(script, /if \(behavior === 'auto'\) routeScroll\.style\.scrollBehavior = previousScrollBehavior/);
  assert.match(script, /requestAnimationFrame\(\(\) => \{[\s\S]*?locateProgress\('auto'\)[\s\S]*?setBoatX\(0\)/);
});

test('map vehicle arrival keeps a fixed natural duration', () => {
  const script = read('script.js');

  assert.match(script, /const startBoatSailToCenter = \(\) => \{[\s\S]*?const sailMs = BOAT_SAIL_MS;[\s\S]*?requestAnimationFrame\(tick\)/);
  assert.doesNotMatch(script, /distanceScale|BOAT_SAIL_MS \* distanceScale/);
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

  // FAB cluster: dock-right companion, not stuck in screen corner
  assert.match(
    css,
    /\.map-game-active\s+\.map-fab-cluster\s*\{[^}]*?right:\s*max\(2rem,\s*calc\(env\(safe-area-inset-right\)\s*\+\s*1\.5rem\)\)/,
  );
  assert.match(
    css,
    /\.map-game-active\s+\.map-fab-cluster\s*\{[^}]*?bottom:\s*max\(2\.15rem,\s*calc\(env\(safe-area-inset-bottom\)\s*\*\s*0\.35\s*\+\s*2\.4rem\)\)/,
  );
  assert.match(css, /\.map-game-active\s+\.map-fab-cluster\s*\{[^}]*?z-index:\s*15/);
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
  assert.match(source, /class="level-stop square-island \$\{stopClass\}\$\{isSelectedMathLevel \? ' is-selected' : ''\}"/);
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
  assert.equal(manifest.speaker, 'mixed', 'Top-level speaker must mark mixed map voices');
  assert.equal(manifest.speakers?.ocean, 'en_female_natasha_uranus_bigtts');
  assert.equal(manifest.speakers?.desert, 'en_female_hayley_uranus_bigtts');
  assert.equal(manifest.audio_format, 'mp3');
  assert.equal(manifest.sample_rate, 24000);
  assert.ok(Array.isArray(manifest.entries));
  const uniqueTargets = new Set(mapAudioTargets().map(({ word }) => word));
  assert.equal(manifest.entries.length, uniqueTargets.size, 'Must cover all unique current map audio targets');
  assert.ok(typeof manifest.summary === 'object');
  assert.ok(typeof manifest.summary.total === 'number');
  assert.equal(manifest.summary.total, uniqueTargets.size);
  assert.ok(typeof manifest.summary.generated === 'number');
  assert.ok(typeof manifest.summary.skipped === 'number');
  assert.ok(typeof manifest.summary.available === 'number');
  assert.equal(
    manifest.summary.available,
    manifest.entries.filter((entry) => entry.status === 'generated').length
  );
  assert.ok(typeof manifest.summary.failed === 'number');
  assert.ok(typeof manifest.summary.levels === 'number');
  assert.equal(manifest.summary.levels, 400);
  assert.ok(typeof manifest.summary.speaker === 'string');

  manifest.entries.forEach((entry) => {
    assert.ok(typeof entry.word === 'string');
    assert.ok(typeof entry.tts_text === 'string');
    assert.ok(typeof entry.speaker === 'string');
    assert.ok(Array.isArray(entry.level_ids), 'Must have level_ids array');
    assert.ok(entry.level_ids.length >= 1, 'Must have at least 1 level_id');
    assert.ok(Array.isArray(entry.level_refs), 'Must have level_refs array');
    assert.ok(entry.level_refs.length >= 1, 'Must have at least 1 level_ref');
    assert.ok(Array.isArray(entry.world_ids), 'Must have world_ids array');
    assert.ok(typeof entry.level_count === 'number');
    assert.ok(typeof entry.zh === 'string');
    assert.ok(typeof entry.url === 'string');
    assert.ok(entry.url.startsWith('assets/audio/words/'));
    assert.ok(entry.url.endsWith('.mp3'));
    assert.ok(typeof entry.cache_key === 'string', 'Must have cache_key');
    assert.ok(entry.cache_key.includes(entry.speaker), 'cache_key must include per-entry speaker');
    assert.ok(['generated', 'pending', 'failed', 'not_attempted'].includes(entry.status));
    if (entry.status === 'generated') {
      assert.ok(entry.size_bytes > 0);
      const mp3File = path.join(__dirname, entry.url);
      assert.ok(fs.existsSync(mp3File));
      assert.equal(fs.statSync(mp3File).size, entry.size_bytes);
    }
  });
});

test('manifest matches current ocean and desert map pronunciation targets', () => {
  const manifest = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'assets', 'audio', 'words', 'word-audio-manifest.json'), 'utf8'));

  const expectedByWord = new Map();
  mapAudioTargets().forEach(({ word, levelId, worldId }) => {
    if (!expectedByWord.has(word)) expectedByWord.set(word, { levelIds: [], refs: [], worldIds: [] });
    expectedByWord.get(word).levelIds.push(levelId);
    expectedByWord.get(word).refs.push({ world_id: worldId, level_id: levelId });
    if (!expectedByWord.get(word).worldIds.includes(worldId)) expectedByWord.get(word).worldIds.push(worldId);
  });

  assert.equal(manifest.entries.length, expectedByWord.size, 'Must have all unique current map targets');

  // Check first 10
  levels.slice(0, 10).forEach((level, index) => {
    const word = level.title.toLowerCase();
    assert.equal(manifest.entries[index].word, word);
    assert.deepEqual(manifest.entries[index].level_ids, expectedByWord.get(word).levelIds);
    assert.deepEqual(manifest.entries[index].world_ids, ['ocean']);
  });

  const byWord = new Map(manifest.entries.map(entry => [entry.word, entry]));
  expectedByWord.forEach(({ levelIds, refs, worldIds }, word) => {
    assert.deepEqual(byWord.get(word)?.level_ids, levelIds, `${word} level_ids`);
    assert.deepEqual(byWord.get(word)?.level_refs.map(({ world_id, level_id }) => ({ world_id, level_id })), refs, `${word} level_refs`);
    assert.deepEqual(byWord.get(word)?.world_ids, worldIds, `${word} world_ids`);
  });
  assert.equal(manifest.entries.at(-1).word, 'what do you want to be');
  assert.deepEqual(manifest.entries.at(-1).level_ids, [200]);
  assert.deepEqual(manifest.entries.at(-1).world_ids, ['desert']);

  // Verify all map refs are covered exactly once.
  const allRefs = manifest.entries
    .flatMap((entry) => entry.level_refs.map((ref) => `${ref.world_id}:${ref.level_id}`))
    .sort();
  const expectedRefs = ['ocean', 'desert']
    .flatMap((worldId) => Array.from({ length: 200 }, (_, i) => `${worldId}:${i + 1}`))
    .sort();
  assert.deepEqual(allRefs, expectedRefs);
});

test('script.js loads word-audio manifest and uses only local MP3 playback', () => {
  const source = read('script.js');

  // Must reference manifest loading
  assert.match(source, /word-audio-manifest\.json/);
  assert.match(source, /WORD_AUDIO_MANIFEST_VERSION = '20260801-desert-natural-dialogue-v1'/);
  assert.match(source, /loadWordAudioManifest\(\)/);
  assert.match(source, /wordAudioMap/);

  // Must use local URL for playback.
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

  assert.doesNotMatch(source, /new SpeechSynthesisUtterance\(String\(word\)\)/);
  assert.doesNotMatch(source, /utterance\.lang = 'en-US'/);
  assert.doesNotMatch(source, /speechSynthesis\.speak\(utterance\)/);
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
  assert.match(html, /word-audio-manifest\.js\?v=20260801-desert-natural-dialogue-v1/);
  assert.match(worker, /word-audio-manifest\.json\?v=20260801-desert-natural-dialogue-v1/);
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

test('quiz and math AI feedback use local MP3 instead of Chinese system TTS', () => {
  const source = read('script.js');
  const html = read('index.html');
  const worker = read('sw.js');
  const correctPath = path.join(__dirname, 'assets', 'audio', 'feedback-holly', 'correct.mp3');
  const wrongPath = path.join(__dirname, 'assets', 'audio', 'feedback-holly', 'wrong.mp3');

  assert.ok(fs.existsSync(correctPath));
  assert.ok(fs.statSync(correctPath).size > 1_000);
  assert.ok(fs.existsSync(wrongPath));
  assert.ok(fs.statSync(wrongPath).size > 1_000);
  assert.match(source, /const FEEDBACK_AUDIO_VERSION = '20260804-peiqi-feedback-v3'/);
  assert.match(source, /FEEDBACK_AUDIO_SRC = \{[\s\S]*?correct: `assets\/audio\/feedback-holly\/correct\.mp3\?v=\$\{FEEDBACK_AUDIO_VERSION\}`/);
  assert.match(source, /wrong: `assets\/audio\/feedback-holly\/wrong\.mp3\?v=\$\{FEEDBACK_AUDIO_VERSION\}`/);
  assert.match(source, /MATH_COACH_FEEDBACK_AUDIO_SRC = \{[\s\S]*?correct: FEEDBACK_AUDIO_SRC\.correct,[\s\S]*?wrong: FEEDBACK_AUDIO_SRC\.wrong/);
  assert.match(source, /const mathCoachAudio = new Audio\(src\);/);
  assert.match(source, /playFileAudio\(feedback, FEEDBACK_AUDIO_SRC\.correct, FEEDBACK_AUDIO_VOLUME\)/);
  assert.match(source, /playFileAudio\(feedback, FEEDBACK_AUDIO_SRC\.wrong, FEEDBACK_AUDIO_VOLUME\)/);
  assert.match(source, /function speakMathVoiceFeedback\(feedbackText,\s*forceCorrect\)/);
  assert.match(source, /return playMathCoachFeedbackTone\(isCorrect \? 'correct' : 'wrong'\)/);
  // Math path mirrors island: immediate correct/wrong MP3 on judge, not delayed coach voice.
  assert.match(source, /playMathCoachFeedbackTone\('correct'\);\s*celebrate\(\);/);
  assert.match(source, /playMathCoachFeedbackTone\('wrong'\);/);
  assert.match(source, /\}, 2600\)/);
  assert.match(source, /\}, 3400\)/);
  assert.doesNotMatch(source, /function speakChinese|SpeechSynthesisUtterance\(text\)|speakChinese\(/);
  assert.doesNotMatch(source, /new SpeechSynthesisUtterance\(message\)|window\.speechSynthesis\.speak\(mathUtterance\)/);
  assert.match(html, /script\.js\?v=20260807-math-take-pool-no-blob-v1/);
  assert.match(worker, /assets\/audio\/feedback-holly\/correct\.mp3\?v=20260804-peiqi-feedback-v3/);
  assert.match(worker, /assets\/audio\/feedback-holly\/wrong\.mp3\?v=20260804-peiqi-feedback-v3/);
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
    assert.ok(fs.statSync(videoPath).size > 2_000_000, `${videoName} must be a real workbench-final scene video, not a tiny placeholder`);
    assert.ok(fs.existsSync(wordPath), `${word}.mp3 must exist`);
    assert.ok(fs.statSync(wordPath).size > 1_000, `${word}.mp3 must have audio data`);
    assert.ok(source.includes(`videoSrc: \`assets/video/free-levels/${videoName}?v=\${FREE_LEVEL_VIDEO_VERSION}\``));
    assert.ok(worker.includes(`assets/video/free-levels/${videoName}?v=20260807-workbench-island-final`));
    assert.ok(worker.includes(`assets/audio/words/${word}.mp3`), `${word}.mp3 must be available offline for quiz option playback`);
  });

  assert.match(source, /FREE_LEVEL_VIDEO_VERSION = '20260807-workbench-island-final'/);
  assert.doesNotMatch(source, /interactive-examples\.mdn\.mozilla\.net|flower\.mp4|flowerVideoUrl/);
  assert.match(source, /src="\$\{escapeHtml\(videoSource\)\}"/);
  assert.match(source, /data-video-source="\$\{escapeHtml\(level\.videoMeta\?\.source \|\| 'local'\)\}"/);
  assert.match(source, /data-video-task-id="\$\{escapeHtml\(level\.videoMeta\?\.taskId \|\| ''\)\}"/);
  assert.match(source, /data-video-qa="\$\{escapeHtml\(level\.videoMeta\?\.qa \|\| ''\)\}"/);
  assert.match(source, /data-video-audio="\$\{escapeHtml\(level\.videoMeta\?\.audio \|\| ''\)\}"/);
  assert.match(source, /wordAudioSrcFor\(word\)/);
  assert.match(html, /script\.js\?v=20260807-math-take-pool-no-blob-v1/);
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

test('word-audio button disabled logic is wired into source rendering with manifest MP3 only', () => {
  const source = read('script.js');

  // wordButtonDisabled pure function exported for testing
  assert.match(source, /function wordButtonDisabled\(/);
  assert.match(source, /module\.exports.*wordButtonDisabled/);

  // renderMap template enables words that have local MP3.
  assert.match(source, /wordCanPronounce\(level\.title\) \? '' : ' disabled'/);

  // wordCanPronounce bridges runtime wordAudioMap.
  assert.match(source, /function wordHasLocalAudio\(/);
  assert.match(source, /function wordCanPronounce\(/);
  assert.match(source, /if \(!wordCanPronounce\(centeredStop\.dataset\.word\)\) return;/);

  // manifest load callback updates ALL buttons after async fetch
  assert.match(source, /document\.querySelectorAll\('\[data-speak-word\]'\)\.forEach/);
  assert.match(source, /button\.disabled = !wordCanPronounce\(w\)/);

  // playWordPronunciation must not fall back to browser/system TTS.
  assert.match(source, /if \(!word\) return false/);
  assert.doesNotMatch(source, /new SpeechSynthesisUtterance\(String\(word\)\)/);
  assert.doesNotMatch(source, /speechSynthesis\.speak\(utterance\)/);
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

test('word-audio manifest covers current map targets and only marks real local MP3s generated', () => {
  // The manifest was generated by generate-word-audio-v2.js with V3 map-specific voices
  const manifest = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'assets', 'audio', 'words', 'word-audio-manifest.json'), 'utf8'));
  const uniqueTargets = new Set(mapAudioTargets().map(({ word }) => word));

  assert.equal(manifest.version, '2.0');
  assert.equal(manifest.summary.total, uniqueTargets.size);
  assert.equal(manifest.summary.failed, 0);
  assert.equal(manifest.summary.levels, 400);

  const generatedEntries = manifest.entries.filter((entry) => entry.status === 'generated');
  assert.equal(manifest.summary.available, generatedEntries.length);
  assert.ok(generatedEntries.length >= 200, 'Existing production batch must remain available');

  generatedEntries.forEach((entry) => {
    assert.equal(entry.status, 'generated');
    assert.ok(entry.size_bytes > 0);
    assert.ok(entry.cache_key.includes(entry.speaker));
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
  assert.match(html, /豆包音色试听总表/);

  // Must include the current consolidated voice libraries
  assert.match(html, /SeedTTS 2\.0 English Voices/);
  assert.match(html, /SeedTTS 2\.0 Chinese Female Voices/);
  assert.match(html, /id="voice-data"/);

  // Must use native <audio> controls
  assert.match(html, /<audio controls preload="metadata"/);

  // Must render from embedded generated manifests and pause other audio
  assert.match(html, /data\.libraries\.map/);
  assert.match(html, /document\.addEventListener\('play'/);
  assert.match(html, /audio !== event\.target\) audio\.pause\(\)/);

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

  // Must contain the current first and last map audio targets.
  assert.ok(content.includes('"mom"'), 'Must contain current first word');
  assert.ok(content.includes('"what_do_you_want_to_be.mp3"') || content.includes('"what do you want to be"'), 'Must contain last map target');
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
  assert.equal(jsManifest.entries.length, new Set(mapAudioTargets().map(({ word }) => word)).size,
    'Must have one entry per unique current map target');

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
  assert.equal(jsManifest.summary.total, new Set(mapAudioTargets().map(({ word }) => word)).size);
  assert.equal(jsManifest.summary.levels, 400);
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
  assert.match(html, /word-audio-manifest\.js\?v=20260801-desert-natural-dialogue-v1/);
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
  assert.match(source, /if \(localUrl\) \{[\s\S]*?localAudioEl\.play\(\)\.catch\(restoreMusic\);[\s\S]*?return true;/);
  assert.doesNotMatch(source, /new SpeechSynthesisUtterance\(String\(word\)\)/);
  assert.doesNotMatch(source, /speechSynthesis\.speak\(utterance\)/);
  assert.match(source, /return false;\s*\n  }\s*\n\s*function routeFromHash/);
});

test('generator exports generateJsManifestContent and produces valid output', () => {
  const { generateJsManifestContent, extractWordEntries, cacheKey } = require('./backend/src/generate-word-audio-v2.js');

  const entries = extractWordEntries();
  const mockManifest = {
    version: '2.0',
    generated_at: new Date().toISOString(),
    speaker: 'mixed',
    speakers: {
      ocean: 'en_female_natasha_uranus_bigtts',
      desert: 'en_female_hayley_uranus_bigtts',
    },
    voice_type: 'mixed',
    audio_format: 'mp3',
    sample_rate: 24000,
    entries: entries.map((e) => ({
      word: e.word,
      tts_text: e.tts_text,
      speaker: e.world_ids.includes('desert') ? 'en_female_hayley_uranus_bigtts' : 'en_female_natasha_uranus_bigtts',
      emotion: e.world_ids.includes('desert') ? 'happy' : undefined,
      speech_rate: 0,
      level_ids: e.level_ids,
      level_refs: e.level_refs,
      world_ids: e.world_ids,
      level_count: e.level_ids.length,
      zh: e.zh,
      unit: e.unit,
      url: 'assets/audio/words/' + e.word.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.mp3',
      status: 'generated',
      size_bytes: 1024,
      sha256: 'abc123',
      cache_key: cacheKey(e),
    })),
    summary: {
      total: entries.length,
      generated: entries.length,
      skipped: 0,
      available: entries.length,
      failed: 0,
      not_attempted: 0,
      levels: 400,
      speaker: 'mixed',
      speakers: {
        ocean: 'en_female_natasha_uranus_bigtts',
        desert: 'en_female_hayley_uranus_bigtts',
      },
    },
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
  assert.equal(parsed.speaker, 'mixed', 'Speaker must match');
  // SHA256 and cache_key must NOT be in JS manifest
  parsed.entries.forEach((entry) => {
    assert.ok(!entry.sha256, 'JS manifest must NOT contain sha256');
    assert.ok(!entry.cache_key, 'JS manifest must NOT contain cache_key');
  });
});

// ─── 航程胶囊 HUD 已下线 ──────────────────────────

test('map topbar no longer embeds voyage/journey capsule', () => {
  const source = read('script.js');
  assert.doesNotMatch(source, /renderCompactJourney/);
  assert.doesNotMatch(source, /journey-header[\s\S]*?journey-voyage[\s\S]*?<\/section>/);
  assert.doesNotMatch(source, /class="journey-compact"/);
  assert.doesNotMatch(source, /j-pearl--/);
  assert.match(source, /data-locate-progress/);
  assert.match(source, /route-ocean[\s\S]*?map-fab-cluster[\s\S]*?map-music-btn[\s\S]*?map-jump-btn[\s\S]*?map-locate-btn/);
  assert.match(source, /data-current-level=/);
  assert.match(source, /<h1 id="map-title">\$\{activeWorld\.title\}<\/h1>/);
});

test('front-end forced login gate + account runtime for learning sync', () => {
  const source = read('script.js');
  const html = read('index.html');
  const worker = read('sw.js');
  const css = read('style.css');

  assert.match(source, /function openLoginDialog/);
  assert.match(source, /function runAuthBootGate/);
  assert.match(source, /babyIslandApi/);
  assert.match(source, /checkSession/);
  assert.match(source, /isLocalMockEnabled/);
  assert.match(source, /内容内测可填任意 11 位手机号/);
  assert.match(source, /请输入短信验证码/);
  assert.match(source, /hydrateLearningStateFromBackend/);
  assert.match(source, /function openPaywallDialog/);
  assert.match(source, /paywall-dialog/);
  assert.match(html, /auth\/apiClient\.js\?v=20260807-backend-fix-v1/);
  assert.doesNotMatch(html, /data-access-dialog/);
  assert.match(css, /\.login-dialog/);
  assert.doesNotMatch(css, /sms-login|data-kind="login"|logout-button|setting-row-logout|profile-login-button|access-hero\.login/);
  assert.match(worker, /auth\/apiClient\.js\?v=20260807-backend-fix-v1/);
  assert.doesNotMatch(worker, /babyIslandApi|sms-login/);
});

// ─── responsive / narrow-screen map topbar ─────────

test('map topbar responsive structure without voyage capsule', () => {
  const css = read('style.css');
  assert.match(css, /grid-template-areas:\s*["']brand resource["']/);
  assert.match(css, /\.journey-compact[\s\S]*?display:\s*none/);
  assert.match(css, /@media\s*\(max-width:\s*899px\)[\s\S]*?grid-template-columns/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?grid-template-areas:\s*"brand"/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.map-game-active \.resource-strip\s*\{[\s\S]*?display:\s*none/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.map-game-active \.map-level-chip\s*\{[\s\S]*?text-overflow:\s*ellipsis/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.map-game-active \.level-name\s*\{[\s\S]*?top:\s*64%/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.map-game-active \.word-audio-button\s*\{[\s\S]*?width:\s*3rem/);
  assert.match(css, /@media\s*\(orientation:\s*portrait\)[\s\S]*?\.map-game-active \.map-fab-cluster\s*\{[\s\S]*?bottom:\s*calc\(var\(--bottom-tabs-height\) \+ max\(0\.75rem, env\(safe-area-inset-bottom\)\)\)/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.map-fab-label\s*\{[^}]*font-size:\s*0\.56rem/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
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
  assert.match(css, /\.map-switch-picker-dialog\s*\{[\s\S]*?width:\s*min\(calc\(100% - 2\.5rem\),\s*41rem\)/);
  assert.doesNotMatch(css, /\.map-switch-picker-dialog\s*\{[\s\S]*?80rem/);
  assert.match(css, /\.map-switch-picker-card \.map-world-options\s*\{[\s\S]*?grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*10\.4rem\),\s*1fr\)\)/);
  assert.match(css, /\.map-switch-picker-card \.map-world-option\s*\{[\s\S]*?flex-direction:\s*column[\s\S]*?min-height:\s*16\.8rem/);
  assert.match(css, /@media\s*\(min-width:\s*700px\)\s*\{[\s\S]*?\.map-switch-picker-card \.map-world-options\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.doesNotMatch(css, /\.map-switch-picker-card \.map-world-group--math \.map-world-options/);
  assert.match(css, /\.map-world-option--math58/);
  assert.match(css, /\.map-world-option--math912/);
  assert.match(css, /\.map-world-option\.is-coming-soon\s*\{[\s\S]*?border-style:\s*dashed[\s\S]*?filter:\s*none/);
  assert.match(css, /\.map-world-option\.is-coming-soon \.map-world-art,\s*\.map-world-option\.is-coming-soon \.map-world-copy\s*\{[\s\S]*?filter:\s*saturate\(0\.48\)\s*brightness\(0\.95\)/);
  assert.match(css, /\.map-world-option\.is-coming-soon \.map-world-art::before\s*\{[^}]*background:\s*rgba\(46,\s*38,\s*68,\s*0\.32\)[^}]*\}/);
  // 选择冒险世界弹窗：禁止多层渐变，统一单色块（只扫规则块本身，不跨文件）
  const mapSwitchFlatBlocks = [
    css.match(/\.map-zone-tab\[aria-selected="true"\]\s*\{[^}]*\}/)?.[0] ?? '',
    css.match(/\.map-world-option--ocean\s*\{[^}]*\}/)?.[0] ?? '',
    css.match(/\.map-world-option--desert\s*\{[^}]*\}/)?.[0] ?? '',
    css.match(/\.map-world-option--math\s*\{[^}]*\}/)?.[0] ?? '',
    css.match(/\.map-world-option--math58\s*\{[^}]*\}/)?.[0] ?? '',
    css.match(/\.map-world-option--math912\s*\{[^}]*\}/)?.[0] ?? '',
    css.match(/\.map-world-option--castle\s*\{[^}]*\}/)?.[0] ?? '',
    css.match(/\.map-world-recommend\s*\{[^}]*\}/)?.[0] ?? '',
    css.match(/\.map-world-playing\s*\{[^}]*\}/)?.[0] ?? '',
    css.match(/\.map-world-check\s*\{[^}]*\}/)?.[0] ?? '',
    css.match(/\.map-world-progress\s*>\s*span\s*\{[^}]*\}/)?.[0] ?? '',
    css.match(/\.map-world-option\.is-active \.map-world-progress\s*>\s*span\s*\{[^}]*\}/)?.[0] ?? '',
    css.match(/\.map-world-soon-badge\s*\{[^}]*\}/)?.[0] ?? '',
    css.match(/\.map-world-option\.is-coming-soon \.map-world-art::before\s*\{[^}]*\}/)?.[0] ?? '',
    css.match(/\.map-world-art-placeholder\s*\{[^}]*\}/)?.[0] ?? '',
    css.match(/\.map-world-art-placeholder--math\s*\{[^}]*\}/)?.[0] ?? '',
  ];
  mapSwitchFlatBlocks.forEach((block, index) => {
    assert.ok(block, `map-switch flat style block ${index} must exist`);
    assert.doesNotMatch(block, /gradient/i, `map-switch style block ${index} must not use gradient`);
  });
  assert.match(css, /\.map-world-soon-badge\s*\{[\s\S]*?top:\s*50%[\s\S]*?left:\s*50%[\s\S]*?min-width:\s*min\(8\.6rem,\s*calc\(100% - 1rem\)\)[\s\S]*?transform:\s*translate\(-50%,\s*-50%\)\s*rotate\(-4deg\)/);
  assert.match(css, /\.map-switch-picker-card \.map-world-soon-badge\s*\{[\s\S]*?font-size:\s*0\.86rem/);
  assert.match(css, /\.map-world-option--math \.map-world-art img\s*\{[\s\S]*?object-position:\s*center 50%/);
  assert.match(css, /\.map-world-option--math58 \.map-world-art img\s*\{[\s\S]*?object-position:\s*center 48%/);
  assert.match(css, /\.map-world-option--math912 \.map-world-art img\s*\{[\s\S]*?object-position:\s*center 42%/);
  assert.doesNotMatch(css, /\.map-switch-picker-card \.map-world-option\s*\{[\s\S]*?grid-template-columns:\s*(?:5\.2rem|8\.4rem)/);
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
  assert.match(source, /type === 'info' \|\| type === 'support' \|\| type === 'accuracy' \? 'mine'/);

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

test('mine page has no membership entitlement card or VIP upgrade CTA', () => {
  const source = read('script.js');
  const mineFn = source.match(/function renderMine\(\)[\s\S]*?function renderAccuracy/)?.[0] ?? '';

  assert.match(source, /vipActive:\s*(?:isTempLocalUnlockEnabled\(\)\s*\|\|\s*)?saved\?\.vipActive === true/);
  assert.match(source, /getLevelAccess\(route\.id, state\.progress, state\.preferences\.vipActive === true\)/);
  // 「我的」不展示体验版/本地图权益卡；付费只在地图点会员关时弹出
  assert.doesNotMatch(mineFn, /membership-card/);
  assert.doesNotMatch(mineFn, /data-membership-status/);
  assert.doesNotMatch(mineFn, /membershipSummary/);
  assert.doesNotMatch(mineFn, /免费体验中|体验版|本地图已开通|免费关卡/);
  assert.doesNotMatch(source, /function membershipSummary/);
  assert.doesNotMatch(mineFn, /data-open-vip-paywall/);
  assert.doesNotMatch(mineFn, /开通 VIP/);
  assert.doesNotMatch(mineFn, /membership-upgrade-button/);
  assert.doesNotMatch(mineFn, /membershipAction/);
  assert.doesNotMatch(source, /openPaywallDialog\(FREE_LEVEL_COUNT \+ 1, vipButton\)/);
});

test('mine page branding is HiRota, not English Island', () => {
  const source = read('script.js');
  const css = read('style.css');
  const mineFn = source.match(/function renderMine\(\)[\s\S]*?function renderAccuracy/)?.[0] ?? '';
  const about = source.match(/about:\s*\{[\s\S]*?\},\s*\};/)?.[0] ?? '';
  const supportFn = source.match(/function renderSupport\(\)[\s\S]*?function renderInfoPage/)?.[0] ?? '';
  const notFoundFn = source.match(/function renderNotFound\(\)[\s\S]*?function setActiveTab/)?.[0] ?? '';

  assert.match(mineFn, /MY HIROTA/);
  assert.match(mineFn, /id="mine-title">我的</);
  assert.match(mineFn, /嗨洛塔小小探索家/);
  assert.match(mineFn, /家长总览：英语、数学，以及即将开放的语文/);
  assert.match(mineFn, /学科进度/);
  assert.match(mineFn, /data-subject="english"/);
  assert.match(mineFn, /data-subject="math"/);
  assert.match(mineFn, /data-subject="chinese"/);
  assert.match(mineFn, /英语区/);
  assert.match(mineFn, /数学区/);
  assert.match(mineFn, /语文区/);
  assert.match(mineFn, /即将开放/);
  assert.match(mineFn, /data-open-english-map/);
  assert.match(mineFn, /data-open-math-recommended/);
  assert.match(mineFn, /数学题数/);
  assert.match(mineFn, /学会的单词/);
  assert.match(mineFn, /地图播放背景音乐/);
  assert.match(source, /function englishZoneProgress/);
  assert.match(source, /function openEnglishMap/);
  assert.match(css, /\.subject-cards\s*\{/);
  assert.match(css, /\.subject-card-chinese/);
  assert.doesNotMatch(mineFn, /我的英语岛|MY ENGLISH JOURNEY|Island progress|岛屿进度|英语小小探索家|英语学习站点|带回小岛|小岛地图|小岛中文|英语学习统计/);
  assert.match(about, /英语地图、数学启蒙/);
  assert.match(about, /多地图闯关/);
  assert.doesNotMatch(about, /海岛闯关|海岛地图/);
  assert.doesNotMatch(supportFn, /下一座小岛/);
  assert.doesNotMatch(notFoundFn, /LOST ISLAND|小岛入口/);
});

test('english zone progress aggregates ocean and desert for parent overview', () => {
  const oceanLevels = levelsForMapWorld('ocean', levels);
  const desertLevelsList = levelsForMapWorld('desert', levels);
  const summary = englishZoneProgress({
    ocean: { completed: [1, 2, 3], unlockedThrough: 4 },
    desert: { completed: [1], unlockedThrough: 2 },
  }, { dates: ['2026-08-01', '2026-08-02'] }, levels);

  assert.equal(summary.completed, 4);
  assert.equal(summary.total, oceanLevels.length + desertLevelsList.length);
  assert.equal(summary.activeDays, 2);
  assert.equal(summary.continueWorldId, 'ocean');
  assert.equal(summary.maps.length, 2);
  assert.match(summary.suggestion, /魔法海岛|沙漠/);
  assert.ok(summary.learnedWords.length >= 1);
});

test('accuracy overview builds daily series and subject totals from attempts', () => {
  const dayMs = 24 * 60 * 60 * 1000;
  const today = new Date('2026-08-05T12:00:00.000Z');
  const mathAttempts = [
    { attemptId: 'm1', levelId: 1, targetCount: 3, selectedCount: 3, isCorrect: true, ts: Date.parse('2026-08-05T08:00:00.000Z'), mode: 'same', skill: 'count-to-5' },
    { attemptId: 'm2', levelId: 2, targetCount: 4, selectedCount: 2, isCorrect: false, ts: Date.parse('2026-08-05T09:00:00.000Z'), mode: 'same', skill: 'count-to-5' },
    { attemptId: 'm3', levelId: 3, targetCount: 5, selectedCount: 5, isCorrect: true, ts: Date.parse('2026-08-04T10:00:00.000Z'), mode: 'same', skill: 'subitize' },
  ];
  const englishAttempts = [
    { attemptId: 'e1', worldId: 'ocean', levelId: 1, selected: 'hi', correct: 'hi', isCorrect: true, ts: Date.parse('2026-08-05T07:00:00.000Z') },
    { attemptId: 'e2', worldId: 'desert', levelId: 2, selected: 'cat', correct: 'dog', isCorrect: false, ts: Date.parse('2026-08-03T11:00:00.000Z') },
  ];

  assert.equal(accuracySubjectFromWorldId('math'), 'math');
  assert.equal(accuracySubjectFromWorldId('ocean'), 'english');
  assert.equal(ACCURACY_SERIES_DAYS, 14);
  assert.equal(ENGLISH_ATTEMPT_SCHEMA_VERSION, 1);
  assert.match(ENGLISH_ATTEMPT_KEY, /english-attempts/);

  const merged = appendEnglishAttempt([], {
    attemptId: 'e3',
    worldId: 'ocean',
    levelId: 4,
    selected: 'apple',
    correct: 'apple',
    isCorrect: true,
    ts: Date.now(),
  });
  assert.equal(normalizeEnglishAttempts(merged).length, 1);
  assert.equal(mergeEnglishAttempts(merged, englishAttempts).length, 3);

  const overview = buildAccuracyOverview(mathAttempts, englishAttempts, { days: 5, today });
  assert.equal(overview.total, 5);
  assert.equal(overview.correct, 3);
  assert.equal(overview.wrong, 2);
  assert.equal(overview.accuracy, 60);
  assert.equal(overview.errorRate, 40);
  assert.equal(overview.math.total, 3);
  assert.equal(overview.english.total, 2);
  assert.equal(overview.series.length, 5);

  const todayRow = overview.series.find((row) => row.date === '2026-08-05');
  assert.equal(todayRow.total, 3);
  assert.equal(todayRow.correct, 2);
  assert.equal(todayRow.accuracy, 67);

  const points = accuracySparklinePoints(overview.series, 280, 120, 14);
  assert.ok(points.line);
  assert.ok(points.dots.length >= 2);
  assert.match(accuracySparklineMarkup(overview.series), /accuracy-chart-svg|accuracy-chart-line/);

  const allAttempts = collectAccuracyAttempts(mathAttempts, englishAttempts);
  assert.equal(allAttempts.length, 5);
  assert.ok(allAttempts.every((item) => item.subject === 'math' || item.subject === 'english'));
  assert.equal(buildDailyAccuracySeries(allAttempts, { days: 3, today }).length, 3);
  // silence unused var lint-style
  assert.ok(dayMs > 0);
});

test('mine cards open dedicated accuracy analysis page', () => {
  const source = read('script.js');
  const css = read('style.css');
  const mineFn = source.slice(source.indexOf('function renderMine'), source.indexOf('function renderAccuracy'));
  const accuracyFn = source.slice(source.indexOf('function renderAccuracy'), source.indexOf('function renderSupport'));

  assert.deepEqual(parseRouteHash('#accuracy'), { type: 'accuracy' });
  assert.match(source, /hash === 'ranking' \|\| hash === 'mine' \|\| hash === 'support' \|\| hash === 'accuracy'/);
  assert.match(source, /else if \(route\.type === 'accuracy'\) \{\s*renderAccuracy\(\);/);
  assert.match(source, /type === 'accuracy' \? 'mine'/);
  assert.match(source, /const hideBottomTabs = route\.type === 'accuracy'/);
  assert.match(source, /bottomTabs\.hidden = hideBottomTabs/);
  assert.match(source, /appShell\.classList\.toggle\('detail-shell', hideBottomTabs\)/);
  assert.match(source, /ENGLISH_ATTEMPT_KEY/);
  assert.match(source, /recordLocalEnglishAttempt/);
  assert.match(source, /function buildAccuracyOverview/);
  assert.match(source, /function accuracySparklineMarkup/);

  assert.match(mineFn, /data-nav-route="accuracy"/);
  assert.match(mineFn, /答题正确率/);
  assert.match(mineFn, /查看分析/);
  assert.match(mineFn, /正确率分析/);
  assert.match(mineFn, /accuracy-entry-card/);

  assert.match(accuracyFn, /答题正确率分析/);
  assert.match(accuracyFn, /近\$\{overview\.days\}天正确率曲线/);
  assert.match(accuracyFn, /每日明细/);
  assert.match(accuracyFn, /accuracy-day-list/);
  assert.match(accuracyFn, /access-dialog-close/);
  assert.match(accuracyFn, /accuracy-close/);
  assert.match(accuracyFn, /data-nav-route="mine"/);
  assert.match(accuracyFn, /aria-label="关闭，返回我的"/);
  assert.doesNotMatch(accuracyFn, /accuracy-back/);
  assert.doesNotMatch(accuracyFn, /secondary-button accuracy-back|>返回我的</);
  assert.match(css, /\.accuracy-close\s*\{/);
  assert.match(css, /\.accuracy-header\s*\{[\s\S]*?position:\s*relative/);

  assert.match(css, /\.accuracy-entry-card\s*\{/);
  assert.match(css, /\.accuracy-chart-svg\s*\{/);
  assert.match(css, /\.accuracy-day-row\s*\{/);
  assert.match(css, /min-height:\s*44px/);
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

  assert.equal(exported.app, '嗨洛塔少儿启蒙APP');
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
  const worker = read('sw.js');

  // 内容资源更新是全局入口（地图顶栏 + 我的页），答题页不挂入口；发版更新另走启动居中弹窗
  assert.match(source, /function globalUpdateButtonMarkup\(\)/);
  assert.match(source, /data-global-update/);
  assert.match(source, /globalUpdateButtonMarkup\(\)/);
  assert.doesNotMatch(source, /globalUpdateButtonMarkup\('level'\)/);
  assert.doesNotMatch(source, /global-update-btn--level/);
  // level-quiz topbar: back + level pill + status only — no content-update chip
  assert.match(source, /class="view level-quiz"[\s\S]*?<nav class="topbar">[\s\S]*?data-detail-state[\s\S]*?<\/nav>/);
  assert.doesNotMatch(source, /class="view level-quiz"[\s\S]{0,900}data-global-update/);
  assert.match(source, /data-check-update/);
  assert.match(source, /data-check-update-note/);
  assert.match(source, /data-check-update-state/);
  assert.match(source, /data-check-update-status="idle"/);
  assert.match(source, /检查内容更新/);
  assert.match(source, /function checkAppUpdate\(\)/);
  assert.match(source, /function setCheckUpdateFeedback\(status, message\)/);
  assert.match(source, /document\.querySelectorAll\('\[data-check-update\]'\)/);
  assert.doesNotMatch(source, /const button = document\.querySelector\('\[data-check-update\]'\)/);
  assert.match(source, /buttons\.forEach\(\(button\) =>/);
  assert.match(source, /button\.disabled = status === 'checking'/);
  assert.match(source, /button\.setAttribute\('aria-busy', String\(status === 'checking'\)\)/);
  // 每次打开应用主动检查热更新，而不是依赖浏览器 24h 间隔的被动检查
  assert.match(source, /serviceWorkerRegistration = registration;\s*\n\s*\/\/[^\n]*\n\s*registration\.update\(\)/);
  // 手动检查的三种状态反馈
  assert.match(source, /setCheckUpdateFeedback\('checking', '正在检查更新…'\)/);
  assert.match(source, /正在检查更新…/);
  assert.match(source, /当前已是最新版本/);
  assert.match(source, /发现内容更新，点顶部「立即更新」生效/);
  assert.match(source, /网络不可用，请稍后重试/);
  assert.match(source, /showToast\('正在检查内容更新'\)/);
  assert.match(source, /finish\('current', '当前已是最新版本'\)/);
  assert.match(source, /finish\('retry', err && err\.name === 'InvalidStateError'/);
  // 发现新版本仍走既有 banner + 立即更新流程
  assert.match(source, /showAppUpdateReady/);
  assert.match(source, /function applyAppUpdate\(\)/);
  assert.match(source, /waitingWorker\.postMessage\(\{ type: 'SKIP_WAITING' \}\)/);
  assert.match(source, /navigator\.serviceWorker\.addEventListener\('controllerchange'/);
  assert.match(worker, /event\.data\?\.type === 'SKIP_WAITING'/);
  assert.match(worker, /self\.skipWaiting\(\)/);
  assert.match(read('style.css'), /\.setting-check-status\s*\{/);
  assert.match(read('style.css'), /\.global-update-btn\s*\{/);
  assert.doesNotMatch(read('style.css'), /\.level-quiz \.global-update-btn/);
  assert.match(read('style.css'), /\.setting-button\[data-check-update-status="checking"\]\s*\{/);
  assert.match(read('style.css'), /@keyframes\s+check-update-spin/);
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


// ─── 强制登录门禁 ─────────────────────────────────
test('forced login gate sources exist with Animal-Island login dialog', () => {
  const source = read('script.js');
  const css = read('style.css');
  const html = read('index.html');
  assert.match(source, /function openLoginDialog/);
  assert.match(source, /function runAuthBootGate/);
  assert.match(source, /is-required/);
  assert.match(source, /登录 \/ 注册/);
  assert.match(source, /新号码自动注册|自动注册/);
  assert.match(source, /app-splash-finished/);
  assert.match(source, /LAST_STAY_KEY|baby-island-last-stay/);
  assert.match(source, /runAuthBootGate\(\)/);
  assert.match(source, /nudgeMustLogin/);
  assert.match(source, /请先登录后继续探险/);
  assert.match(source, /clickedOutsideCard|!card\.contains/);
  assert.match(source, /data-dialog-toast/);
  assert.match(html, /auth\/apiClient\.js/);
  assert.match(css, /\.login-dialog/);
  assert.match(css, /\.login-submit/);
  assert.match(css, /body\.auth-lock/);
  assert.match(css, /login-card-nudge/);
  assert.match(css, /app-toast-in-dialog/);
  // 无关闭按钮路径（强制）
  assert.doesNotMatch(source, /data-login-close/);
});

test('map jump segments are every 20 levels with two-step copy', () => {
  const {
    buildMapJumpSegments,
    segmentContainingLevel,
    levelsInJumpSegment,
    MAP_JUMP_COPY,
    MAP_JUMP_SEGMENT_SIZE,
    levels,
  } = require('./script.js');
  assert.equal(MAP_JUMP_SEGMENT_SIZE, 20);
  assert.equal(MAP_JUMP_COPY.title, '要去哪里');
  assert.equal(MAP_JUMP_COPY.segmentsLabel, '路线段');
  assert.equal(MAP_JUMP_COPY.levelsHint, '共 200 关 · 左边选段，右边点关，再出发');
  assert.equal(MAP_JUMP_COPY.totalLevels, 200);
  assert.equal(MAP_JUMP_COPY.depart, '出发前往');
  assert.equal(MAP_JUMP_COPY.arrived, '已到达');
  assert.ok(!('quickGo' in MAP_JUMP_COPY));

  const segs = buildMapJumpSegments(200, 20);
  assert.equal(segs.length, 10);
  assert.deepEqual(
    segs.map((s) => [s.start, s.end]),
    [[1,20],[21,40],[41,60],[61,80],[81,100],[101,120],[121,140],[141,160],[161,180],[181,200]],
  );
  assert.equal(segmentContainingLevel(11, segs).label, '1–20 关');
  assert.equal(segmentContainingLevel(37, segs).start, 21);
  assert.equal(segmentContainingLevel(200, segs).end, 200);

  const inFirst = levelsInJumpSegment(levels, segs[0]);
  assert.ok(inFirst.length <= 20);
  assert.ok(inFirst.every((lv) => lv.id >= 1 && lv.id <= 20));
});


test('math jump dialog marks cleared vs uncleared levels', () => {
  const source = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
  const { MAP_JUMP_COPY } = require('./script.js');

  assert.equal(MAP_JUMP_COPY.cleared, '已通关');
  assert.equal(MAP_JUMP_COPY.uncleared, '未通关');
  assert.equal(MAP_JUMP_COPY.clearedCount, '已通');

  // 数学跳关强制 passMarkMode=cleared，并传入 completedIds
  assert.match(source, /passMarkMode:\s*currentMapTheme\s*===\s*'math'\s*\?\s*'cleared'\s*:\s*'default'/);
  assert.match(source, /completedIds:\s*state\.progress\.completed/);
  assert.match(source, /mapWorld:\s*currentMapTheme/);
  assert.match(source, /data-jump-cleared=/);
  assert.match(source, /data-jump-pass=/);
  assert.match(source, /isLevelCleared/);
  assert.match(source, /segmentClearCount/);
  // 当前关也保留通关标注
  assert.match(source, /MAP_JUMP_COPY\.current\} · \$\{pass\}/);
  // 未通关标签
  assert.match(source, /MAP_JUMP_COPY\.uncleared/);
  assert.match(css, /\.jump-level-btn\.is-cleared/);
  assert.match(css, /\.jump-level-btn\.is-uncleared/);
  assert.match(css, /data-jump-pass=\"cleared\"/);
  assert.match(css, /data-jump-pass=\"uncleared\"/);
  assert.match(css, /\.jump-pass-mark/);
  assert.match(css, /\.jump-pass-check/);
  assert.match(source, /jump-pass-check|jumpPassCheckMarkup/);
  assert.match(source, /jump-pass-mark/);
  assert.match(source, /jump-meta-sr/);
});

test('jump dialog sources cover 200 levels with left-right segments', () => {
  const source = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
  assert.match(source, /function openMapJumpDialog/);
  assert.match(source, /function buildMapJumpSegments/);
  assert.match(source, /locateToLevelId/);
  assert.match(source, /openMapJumpDialog\(/);
  assert.match(source, /禁跨段飞|不跨岛连飞/);
  assert.match(source, /data-jump-segment/);
  assert.match(source, /data-jump-level/);
  assert.match(source, /data-jump-depart/);
  assert.match(source, /data-map-jump/);
  assert.match(source, /data-jump-body/);
  assert.match(source, /data-jump-rail/);
  // 无数字输入跳关
  assert.doesNotMatch(source, /data-jump-quick-input/);
  assert.doesNotMatch(source, /data-jump-quick-go/);
  // 200 关硬边界：跳关 total 以 DISPLAY_LEVEL_COUNT 为准
  assert.match(source, /Math\.max\(DISPLAY_LEVEL_COUNT, dataMax/);
  assert.match(source, /DISPLAY_LEVEL_COUNT = 200/);
  // 定位与跳关分钮：定位只回进度，跳关才开弹窗
  assert.match(source, /locateBtn\?\.addEventListener\('click'/);
  assert.match(source, /jumpBtn\?\.addEventListener\('click'/);
  assert.match(source, /locateProgress\('auto'\)/);
  // 跳关不写 unlockedThrough / 通关进度
  assert.match(source, /仅移动地图\/切题，不写通关进度/);
  assert.match(css, /\.jump-dialog/);
  assert.match(css, /\.jump-body/);
  assert.match(css, /\.jump-rail/);
  assert.match(css, /\.jump-segments/);
  assert.match(css, /\.jump-levels/);
  assert.match(css, /jump-depart-btn/);
  assert.doesNotMatch(css, /\.jump-quick/);
  assert.match(css, /\.jump-segment-btn\.is-active\s*\{/);
  assert.match(css, /\.jump-segment-btn\.is-current-seg:not\(\.is-active\)/);
  // 禁：当前段与浏览段共用同一套满高亮（会导致双选中）
  assert.doesNotMatch(css, /\.jump-segment-btn\.is-active\s*,\s*\n?\s*\.jump-segment-btn\.is-current-seg\s*\{/);
  // 左栏路线段：两行排版 + 足够宽，禁止 small 单行 nowrap 裁切「已通 n/m · 片n」
  assert.match(css, /\.jump-segment-btn\s*\{[^}]*flex-direction:\s*column/s);
  assert.match(css, /\.jump-segment-btn\s+small\s*\{[^}]*white-space:\s*normal/s);
  assert.match(css, /\.jump-rail\s*\{[^}]*flex:\s*0\s+0\s+11rem/s);
  assert.doesNotMatch(css, /\.jump-rail\s*\{[^}]*flex-basis:\s*7\.6rem/s);
  assert.match(css, /\.map-fab-cluster/);
  assert.match(css, /\.map-jump-btn/);
  assert.match(css, /\.map-music-btn/);
  assert.match(css, /\.map-music-btn\.is-muted/);
  // 禁 1fr 珠串布局
  assert.doesNotMatch(css, /\.jump-segments\s*\{[^}]*grid-template-columns:\s*repeat\([^)]*1fr/s);
});

test('map FAB exposes background-music toggle wired to mapMusic preference', () => {
  const source = read('script.js');
  const css = read('style.css');

  assert.match(source, /mapMusicOn:\s*'[^']*map-music-icon/);
  assert.match(source, /mapMusicOff:\s*'[^']*map-music-icon/);
  assert.match(source, /data-map-music-toggle/);
  assert.match(source, /function paintMapMusicToggle/);
  assert.match(source, /if \(key === 'mapMusic'\) paintMapMusicToggle\(\)/);
  assert.match(source, /setPreference\('mapMusic',\s*state\.preferences\.mapMusic === false\)/);
  assert.match(source, /aria-label="\$\{state\.preferences\.mapMusic === false \? '打开背景音乐' : '关闭背景音乐'\}"/);
  assert.match(source, /shouldPlayMapAudio\(route = routeFromHash\(\)\)[\s\S]*?return route\.type === 'map' && state\.preferences\.mapMusic/);
  assert.match(css, /\.map-locate-btn,[\s\S]*?\.map-jump-btn,[\s\S]*?\.map-music-btn\s*\{[\s\S]*?min-width:\s*44px[\s\S]*?min-height:\s*44px/);
  assert.match(css, /\.map-music-btn\.is-muted\s*\{/);
  assert.match(css, /\.map-music-btn\.is-muted\s*\{[\s\S]*?(?:#d4533f|#c23a28)/);
  assert.match(source, /class="map-fab-label">背景音乐</);
  assert.match(source, /class="map-fab-label">跳关</);
  assert.match(source, /class="map-fab-label">定位</);
  assert.doesNotMatch(css, /content:\s*["']静音["']/);
  assert.match(css, /@keyframes\s+map-music-muted-nudge/);
  assert.match(css, /\.map-music-btn svg path\s*\{[\s\S]*?stroke:\s*currentColor/);
});

test('math quiz reuses island hand-tap lottie tip API', () => {
  const script = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
  assert.match(script, /function armMathQuizHints\s*\(/);
  assert.match(script, /function showGlobalHintAt\s*\(/);
  assert.match(script, /window\.__HAND_TAP_LOTTIE_DATA/);
  assert.match(script, /armMathQuizHints\(root, level/);
  assert.match(script, /math-hint-selection/);
  assert.match(script, /is-drag-demo/);
  assert.match(script, /runTakeDragDemo|format === 'take'/);
  assert.match(css, /\.hint-hand\s*\{[\s\S]*?z-index:\s*80/);
  assert.match(css, /\.hint-hand\.is-drag-demo/);
});

test('math story waypoints: 31 only for math map gates, not level ids', () => {
  assert.equal(MATH_STORY_WAYPOINTS.length, 31);
  const ids = MATH_STORY_WAYPOINTS.map((w) => w.id);
  assert.equal(new Set(ids).size, 31);
  const slugs = MATH_STORY_WAYPOINTS.map((w) => w.videoSlug);
  assert.equal(new Set(slugs).size, 31);
  for (const wp of MATH_STORY_WAYPOINTS) {
    assert.ok(Number.isInteger(wp.beforeLevel) && wp.beforeLevel >= 1 && wp.beforeLevel <= DISPLAY_LEVEL_COUNT);
    assert.match(wp.videoSlug, /^level-\d{3}-/);
    assert.ok(String(wp.themeSpoken || '').trim());
    assert.ok(String(wp.title || '').trim());
  }
  // 0–10 外形记忆标题（禁旧空盘课名）
  const byId = Object.fromEntries(MATH_STORY_WAYPOINTS.map((w) => [w.id, w]));
  assert.equal(byId['num-00'].title, '圆圈的零');
  assert.equal(byId['num-01'].title, '竖立的一');
  assert.equal(byId['num-05'].title, '钩子的五');
  assert.equal(byId['num-10'].title, '一和零');
  assert.ok(!MATH_STORY_WAYPOINTS.some((w) => /空盘/.test(w.title)));
  // 0–10 自我介绍台词（片内+入口主题音）
  assert.match(byId['num-00'].themeSpoken, /我是零/);
  assert.match(byId['num-06'].themeSpoken, /大圆在下面/);
  assert.match(byId['num-09'].themeSpoken, /大圆在上面/);
  assert.match(byId['num-10'].themeSpoken, /我们是十/);
  // 第 1 关前：0 与 1 两段数字介绍
  const l1 = pendingMathStoryWaypoints(1, []);
  assert.deepEqual(l1.map((w) => w.id), ['num-00', 'num-01']);
  const afterZero = pendingMathStoryWaypoints(1, ['num-00']);
  assert.deepEqual(afterZero.map((w) => w.id), ['num-01']);
  assert.equal(firstPendingMathStoryWaypoint(1, ['num-00', 'num-01']), null);
  // renderMap 冷启动必须能从 pending 填 mathActiveStoryId（不能只靠 showInlineMathLevel）
  const scriptSrc = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
  assert.match(scriptSrc, /冷启动\/直进 #map 不会走 showInlineMathLevel/);
  assert.match(scriptSrc, /firstPendingMathStoryWaypoint\(focusedLevelId/);
  // 不算关卡：cleared 不影响 DISPLAY_LEVEL_COUNT
  assert.equal(DISPLAY_LEVEL_COUNT, 200);
  assert.equal(mathLevels.length, 200);
  // 标记 cleared 可累积
  const marked = markMathStoryCleared(['num-00'], 'num-01');
  assert.deepEqual(marked, ['num-00', 'num-01']);
  // 素材路径
  const wp = mathStoryWaypointById('ep-01');
  assert.match(mathStoryVideoSrc(wp), /level-001-roll-call\.mp4/);
  assert.match(mathStoryThemeAudioSrc(wp), /ep-01\.mp3/);
  assert.match(mathStoryThemeAudioSrc(wp), /story-theme-v9-ep20-finish-ten/);
  const utterances = collectMathStoryThemeUtterances();
  assert.equal(utterances.length, 31);
  assert.match(utterances.find((u) => u.id === 'num-00').text, /我是零/);
  assert.match(utterances.find((u) => u.id === 'ep-02').text, /全亮/);
  assert.match(utterances.find((u) => u.id === 'ep-20').text, /终点是十|到啦/);
});

test('math story jump dialog uses distinct story chips and window player', () => {
  const source = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');

  // 段内交错：片子在对应 beforeLevel 关卡之前
  const entries = mathJumpEntriesForSegment(1, 3);
  assert.ok(entries.some((e) => e.kind === 'story' && e.id === 'num-00'));
  assert.ok(entries.some((e) => e.kind === 'story' && e.id === 'num-01'));
  assert.ok(entries.some((e) => e.kind === 'story' && e.id === 'num-02'));
  assert.equal(entries.findIndex((e) => e.kind === 'story' && e.id === 'num-00')
    < entries.findIndex((e) => e.kind === 'level' && e.id === 1), true);
  assert.equal(entries.filter((e) => e.kind === 'level').length, 3);

  assert.equal(isMathStoryCleared(['ep-01'], 'ep-01'), true);
  assert.equal(isMathStoryCleared([], 'ep-01'), false);

  // 跳关：数学世界插片子 + 独立出发
  assert.match(source, /function mathJumpEntriesForSegment/);
  assert.match(source, /includeStories/);
  assert.match(source, /jump-story-btn/);
  assert.match(source, /data-jump-story=/);
  assert.match(source, /onDepartStory/);
  assert.match(source, /mathForcedStoryId/);
  assert.match(source, /jump-dialog--math-stories/);
  assert.match(source, /看片子/);

  // 主界面：桌面直铺 + 单行主题文案（无四行同义堆叠）
  assert.match(source, /math-story-window/);
  assert.match(source, /math-story-window--desk/);
  assert.match(source, /math-story-window--one-line/);
  assert.match(source, /math-story-scrim/);
  assert.match(source, /aria-label="小片子：/);
  assert.match(source, /data-math-story-theme-line/);
  assert.match(source, /math-story-phase-sr/);
  assert.doesNotMatch(source, /math-story-window-badge/);
  assert.doesNotMatch(source, /math-story-window-cap/);
  assert.doesNotMatch(source, /看完再进第/);
  assert.match(css, /\.math-story-window/);
  assert.match(css, /\.math-story-scrim\s*\{[^}]*display:\s*none/);
  assert.match(css, /:has\(\[data-math-story-stop\]\) \.math-level-switch-indicator/);
  assert.match(css, /\.math-story-phase-sr/);
  assert.match(css, /\.jump-story-btn/);
  assert.match(css, /\.jump-story-play/);
  assert.match(css, /\.jump-story-title/);
  assert.match(css, /#2a1c0e/);
  assert.match(source, /jump-story-title/);
  assert.match(source, /jumpPassCheckMarkup|jump-pass-check/);
  assert.match(css, /width: min\(68rem/);
  assert.match(css, /--math-story-vid-max-h/);
  assert.match(css, /object-fit:\s*cover/);
});

test('workbench selected videoPath maps 1:1 to desert+ocean levels', () => {
  const mapPath = path.join(__dirname, 'data', 'workbench-level-video-map.json');
  const catPath = path.join(__dirname, 'data', 'content-catalog.json');
  assert.ok(fs.existsSync(mapPath), 'workbench-level-video-map.json must exist');
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const cat = JSON.parse(fs.readFileSync(catPath, 'utf8'));
  assert.match(String(map.rule || ''), /当前选中|videoPath|定稿/);
  for (const mapId of ['desert', 'ocean']) {
    const block = map.maps[mapId];
    assert.equal(block.levelCount, 200, `${mapId} must have 200 levels`);
    assert.deepEqual(block.missingLevels, [], `${mapId} must not miss levels`);
    const seen = new Set();
    for (const row of block.levels) {
      assert.ok(row.levelId >= 1 && row.levelId <= 200);
      assert.ok(row.selectedVideoPath, `${mapId} L${row.levelId} needs selectedVideoPath`);
      assert.ok(row.selectedFileName.endsWith('.mp4'));
      assert.equal(seen.has(row.levelId), false, `dup level ${mapId}:${row.levelId}`);
      seen.add(row.levelId);
      // 多候选只绑定选中路径，不拿 alternate 顶替
      if (row.alternateCandidatePaths?.length) {
        assert.ok(!row.alternateCandidatePaths.includes(row.selectedVideoPath));
      }
    }
    assert.equal(seen.size, 200);
  }
  // multi-version finals keep exact selected basename (e.g. _2)
  const d107 = cat.levels.find((l) => l.mapId === 'desert' && l.levelId === 107);
  const o113 = cat.levels.find((l) => l.mapId === 'ocean' && l.levelId === 113);
  assert.ok(d107?.ossKey.includes('five-pencils_2'), d107?.ossKey);
  assert.ok(o113?.ossKey.includes('girl_2'), o113?.ossKey);
  assert.equal(cat.levels.filter((l) => l.mapId === 'desert').length, 200);
  assert.equal(cat.levels.filter((l) => l.mapId === 'ocean').length, 200);
  assert.equal(cat.levels.filter((l) => l.videoId).length, 400);

  // desert free L1-10 package + script videoSrc
  const { desertLevels } = require('./script.js');
  for (let i = 1; i <= 10; i += 1) {
    const level = desertLevels.find((l) => l.id === i);
    assert.ok(level?.videoSrc?.includes('assets/video/desert-levels/'), level?.videoSrc);
    const file = level.videoSrc.split('?')[0];
    assert.ok(fs.existsSync(path.join(__dirname, file)), file);
  }
  assert.equal(desertLevels.find((l) => l.id === 11)?.videoSrc, undefined);
});
