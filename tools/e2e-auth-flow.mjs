#!/usr/bin/env node

/**
 * 宝宝英语岛 · 当前产品端到端验收
 *
 * 覆盖当前根 H5 的真实主链路：
 * - App 启动发版更新弹窗
 * - 地图 / 我的页 / VIP 状态
 * - 第 1 关视频后答题，答错再答对
 * - 第 11 关 VIP 支付面板
 *
 * 文件名沿用 e2e-auth-flow.mjs，避免破坏既有 npm run e2e 入口。
 */

import assert from 'node:assert/strict';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = normalize(join(dirname(fileURLToPath(import.meta.url)), '..'));
const require = createRequire(import.meta.url);
const { levels } = require('../script.js');
const PROGRESS_STORAGE_KEY = 'baby-island-preview-progress-v1';
const LEARNING_ACTIVITY_KEY = 'baby-island-learning-activity-v1';
const APP_PREFERENCES_KEY = 'baby-island-app-preferences-v1';
const LEVEL_VIDEO_STORAGE_KEY = 'baby-island-level-videos-v1';
const MISTAKE_BOOK_KEY = 'baby-island-mistake-book-v1';

const MIME = {
  '.html': 'text/html;charset=utf-8',
  '.css': 'text/css;charset=utf-8',
  '.js': 'application/javascript;charset=utf-8',
  '.json': 'application/json;charset=utf-8',
  '.webmanifest': 'application/manifest+json;charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
};

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, 'http://127.0.0.1').pathname);
  const filePath = normalize(join(ROOT, pathname === '/' ? 'index.html' : pathname));
  if (!filePath.startsWith(ROOT)) return null;
  return filePath;
}

function serveStatic() {
  const server = createServer((req, res) => {
    const filePath = resolveRequestPath(req.url || '/');
    if (!filePath || !existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const stat = statSync(filePath);
    const ext = extname(filePath);
    const contentType = MIME[ext] || 'application/octet-stream';
    const range = req.headers.range;

    if (range && /\.(mp3|mp4)$/i.test(filePath)) {
      const match = range.match(/^bytes=(\d+)-(\d*)$/);
      if (match) {
        const start = Number(match[1]);
        const end = match[2] ? Number(match[2]) : stat.size - 1;
        res.writeHead(206, {
          'Accept-Ranges': 'bytes',
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Content-Length': String(end - start + 1),
          'Content-Type': contentType,
        });
        createReadStream(filePath, { start, end }).pipe(res);
        return;
      }
    }

    res.writeHead(200, {
      'Content-Length': String(stat.size),
      'Content-Type': contentType,
    });
    createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

async function closeReleaseDialog(page, required = false) {
  const dialog = page.locator('.release-update-dialog[open]');
  try {
    await dialog.waitFor({ state: 'visible', timeout: required ? 5_000 : 500 });
  } catch {
    // 同版本启动时没有更新弹窗是正常路径；强制更新专测在
    // runForcedReleaseUpdateSmoke 中直接断言弹窗，不依赖这里的旧参数。
    return false;
  }

  const text = await dialog.innerText();
  assert.match(text, /APP 版本更新/);
  assert.match(text, /当前版本 1\.0\.0/);
  assert.match(text, /最新版本 1\.0\.1/);
  assert.match(text, /去 App Store 更新/);
  await assertElementInViewport(page, '.release-update-dialog', 'release update dialog');
  await assertElementInViewport(page, '.access-dialog-close[data-release-update-close]', 'release update close button');
  await assertElementInViewport(page, '[data-release-update-primary]', 'release update primary button');
  await page.locator('[data-release-update-close]').first().click();
  await dialog.waitFor({ state: 'hidden', timeout: 5_000 });
  return true;
}

async function enterQuiz(page) {
  await page.locator('[data-stage-video]').waitFor({ state: 'visible', timeout: 5_000 });
  await page.locator('[data-video]').evaluate((video) => {
    video.dispatchEvent(new Event('ended'));
  });
  await page.locator('[data-stage-quiz]').waitFor({ state: 'visible', timeout: 5_000 });
}

async function answer(page, correct) {
  const correctIndex = await page.evaluate(() => window.__correctIndex);
  const index = correct ? correctIndex : correctIndex === 0 ? 1 : 0;
  await page.locator('.option-card').nth(index).click({ force: true });
  await page.locator('[data-submit]').waitFor({ state: 'visible', timeout: 2_000 });
  await assertElementInViewport(page, '[data-submit]', 'quiz submit button');
  await page.locator('[data-submit]').click({ force: true });
}

async function assertElementInViewport(page, selector, label) {
  const box = await page.locator(selector).boundingBox();
  assert.ok(box, `${label} must be visible`);
  const viewport = page.viewportSize();
  assert.ok(viewport, `${label} needs a viewport`);
  assert.ok(box.x >= -1, `${label} left edge is outside viewport: ${JSON.stringify(box)}`);
  assert.ok(box.x + box.width <= viewport.width + 1, `${label} right edge is outside viewport: ${JSON.stringify(box)}`);
  assert.ok(box.y >= -1, `${label} top edge is outside viewport: ${JSON.stringify(box)}`);
  assert.ok(box.y + box.height <= viewport.height + 1, `${label} bottom edge is outside viewport: ${JSON.stringify(box)}`);
}

async function waitForText(page, selector, pattern, label) {
  await page.waitForFunction(({ selector, source, flags }) => {
    const text = document.querySelector(selector)?.textContent || '';
    return new RegExp(source, flags).test(text);
  }, { selector, source: pattern.source, flags: pattern.flags }, { timeout: 5_000 });
  assert.match(await page.locator(selector).innerText(), pattern, label);
}

async function assertQuizLayoutInViewport(page, label) {
  const metrics = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const sw = document.documentElement.scrollWidth;
    const question = document.querySelector('.question-card')?.getBoundingClientRect();
    const options = Array.from(document.querySelectorAll('.option-card')).map((option) => {
      const rect = option.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      };
    });
    return {
      vw,
      vh,
      sw,
      question: question && {
        left: question.left,
        right: question.right,
        top: question.top,
        bottom: question.bottom,
      },
      options,
      listenDisabled: document.querySelector('[data-listen-question]')?.disabled,
    };
  });

  assert.ok(metrics.sw <= metrics.vw + 1, `${label} has horizontal overflow: ${JSON.stringify(metrics)}`);
  assert.equal(metrics.listenDisabled, false, `${label} question audio button must be enabled`);
  assert.ok(metrics.question, `${label} question card must exist`);
  assert.ok(metrics.question.left >= -1 && metrics.question.right <= metrics.vw + 1, `${label} question card outside viewport: ${JSON.stringify(metrics.question)}`);
  assert.equal(metrics.options.length, 2, `${label} must render two option cards`);
  metrics.options.forEach((option) => {
    assert.ok(option.left >= -1 && option.right <= metrics.vw + 1, `${label} option outside viewport: ${JSON.stringify(option)}`);
    assert.ok(option.bottom <= metrics.vh + 1, `${label} option below viewport: ${JSON.stringify(option)}`);
    assert.ok(option.width >= 290 && option.height >= 90, `${label} option touch target too small: ${JSON.stringify(option)}`);
  });
}

async function waitForCondition(check, message, timeout = 5_000) {
  const startedAt = Date.now();
  while (!check()) {
    if (Date.now() - startedAt > timeout) throw new Error(message);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

function collectRuntimeProblems(page, baseUrl) {
  const problems = [];
  page.on('pageerror', (err) => problems.push(`pageerror ${err.message}`));
  page.on('console', (msg) => {
    // Static H5 server intentionally has no /api backend; the matching browser
    // 404 console line is covered separately by the response filter below.
    const isExpectedApi404 = /Failed to load resource: the server responded with a status of 404 \(Not Found\)/.test(msg.text());
    if (msg.type() === 'error' && !isExpectedApi404 && !/net::ERR_ABORTED/.test(msg.text())) {
      problems.push(`console ${msg.text()}`);
    }
  });
  page.on('requestfailed', (request) => {
    const failure = request.failure()?.errorText || '';
    if (request.url().startsWith(baseUrl) && !/ERR_ABORTED/.test(failure)) {
      problems.push(`requestfailed ${request.url()} ${failure}`);
    }
  });
  page.on('response', (response) => {
    const url = new URL(response.url());
    const isStaticApiFallback = response.url().startsWith(baseUrl) && url.pathname.startsWith('/api/');
    if (response.status() >= 400 && !isStaticApiFallback) {
      problems.push(`HTTP ${response.status()} ${response.url()}`);
    }
  });
  return problems;
}


async function dismissSplashIfPresent(page) {
  const splash = page.locator('#app-splash');
  if (await splash.count()) {
    const skip = page.locator('#app-splash-skip, #splash-skip-btn, .splash-skip, [data-splash-skip]');
    if (await skip.count()) {
      await skip.first().click({ force: true }).catch(() => {});
    }
    await page.waitForSelector('#app-splash', { state: 'detached', timeout: 8_000 }).catch(() => {});
  }
}

async function ensureLoggedIn(page) {
  await dismissSplashIfPresent(page);
  // already past gate?
  const dialog = page.locator('dialog.login-dialog[open], dialog.login-dialog');
  const visible = await dialog.count();
  if (!visible) {
    // may still be checking — wait briefly for dialog or map
    try {
      await Promise.race([
        page.waitForSelector('dialog.login-dialog', { timeout: 3_000 }),
        page.waitForSelector('[data-route-scroll], .map-stage, [data-tab]', { timeout: 3_000 }),
      ]);
    } catch (_) {}
  }
  if (await page.locator('dialog.login-dialog').count()) {
    await page.locator('[data-login-phone]').fill('13800138000');
    const send = page.locator('[data-login-send-code]');
    if (await send.count()) {
      await send.click();
      await page.waitForTimeout(200);
    }
    await page.locator('[data-login-code]').fill('1234');
    await page.locator('[data-login-submit]').click();
    await page.waitForSelector('dialog.login-dialog', { state: 'detached', timeout: 8_000 });
  }
  // map / shell should be interactive
  await page.waitForSelector('[data-tab], [data-stage-video], [data-route-scroll]', { timeout: 8_000 });
}

async function newPage(browser, viewport, baseUrl) {
  const context = await browser.newContext({ viewport, locale: 'zh-CN' });
  const page = await context.newPage();
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.fulfill({
    status: 200,
    contentType: 'text/css',
    body: '',
  }));
  return { context, page, problems: collectRuntimeProblems(page, baseUrl) };
}

async function runPrimaryFlow(browser, baseUrl) {
  const { context, page, problems } = await newPage(browser, { width: 1366, height: 1024 }, baseUrl);
  const audioRequests = [];
  page.on('request', (request) => {
    if (/assets\/audio\//.test(request.url())) audioRequests.push(request.url());
  });

  await page.goto(`${baseUrl}/#map`, { waitUntil: 'networkidle' });
  await ensureLoggedIn(page);
  await closeReleaseDialog(page, true);
  const releaseRefresh = page.waitForResponse(
    (response) => response.url().includes('/app-release.json') && response.status() === 200,
  );
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await releaseRefresh;
  await page.waitForTimeout(250);
  assert.equal(await page.locator('.release-update-dialog[open]').count(), 0);

  assert.equal(await page.locator('[data-tab]').count(), 3);
  assert.ok(await page.locator('[data-route-scroll]').isVisible());
  assert.equal(await page.locator('[data-stop="1"]').count(), 1);
  assert.equal(await page.locator('[data-stop="200"]').count(), 1);
  assert.match(await page.locator('body').innerText(), /200 座魔法岛|200 MAGIC ISLANDS/);

  await page.locator('[data-tab="mine"]').click();
  await page.waitForSelector('.mine-layout', { timeout: 5_000 });
  const mineText = await page.locator('.mine-layout').innerText();
  assert.doesNotMatch(mineText, /非 VIP|开通 VIP|VIP 已开通/);
  assert.match(mineText, /检查内容更新/);

  await page.goto(`${baseUrl}/#level-1`, { waitUntil: 'networkidle' });
  await closeReleaseDialog(page);
  assert.match(await page.locator('[data-video]').getAttribute('src'), /level-01-mom\.mp4/);

  await enterQuiz(page);
  assert.match(await page.locator('.question-card').innerText(), /哪一个是\s*「妈妈」\s*的意思/);
  assert.equal(await page.locator('.option-card').count(), 2);
  await assertQuizLayoutInViewport(page, 'primary quiz layout');

  await answer(page, false);
  await page.waitForSelector('.feedback-banner.wrong:not([hidden])', { timeout: 5_000 });
  await assertElementInViewport(page, '.feedback-banner.wrong', 'wrong feedback');
  assert.match(await page.locator('.feedback-banner.wrong').innerText(), /再试一次/);
  await page.waitForFunction(() => window.__quizState === 'answering', null, { timeout: 6_000 });

  await answer(page, true);
  await page.waitForSelector('.feedback-banner.correct:not([hidden])', { timeout: 5_000 });
  await assertElementInViewport(page, '.feedback-banner.correct', 'correct feedback');
  await assertElementInViewport(page, '[data-continue-map]', 'continue map button');
  assert.match(await page.locator('.feedback-banner.correct').innerText(), /答对啦/);
  await waitForCondition(
    () => audioRequests.some((url) => url.includes('questions-holly/level-01-mom.mp3'))
      && audioRequests.some((url) => url.includes('feedback-holly/wrong.mp3'))
      && audioRequests.some((url) => url.includes('feedback-holly/correct.mp3')),
    `Missing expected quiz audio requests: ${audioRequests.join(', ')}`,
  );

  await page.evaluate((progressKey) => {
    localStorage.setItem(progressKey, JSON.stringify({
      completed: Array.from({ length: 10 }, (_, index) => index + 1),
      unlockedThrough: 11,
    }));
  }, PROGRESS_STORAGE_KEY);
  await page.goto(`${baseUrl}/#map`, { waitUntil: 'networkidle' });
  await ensureLoggedIn(page);
  await closeReleaseDialog(page);
  const seededProgress = await page.evaluate((progressKey) => JSON.parse(localStorage.getItem(progressKey)), PROGRESS_STORAGE_KEY);
  assert.deepEqual(seededProgress, {
    completed: Array.from({ length: 10 }, (_, index) => index + 1),
    unlockedThrough: 11,
  });
  await page.goto(`${baseUrl}/?vip-paid11=1#level-11`, { waitUntil: 'networkidle' });
  await closeReleaseDialog(page);
  const paywall = page.locator('.paywall-dialog[open]');
  await paywall.waitFor({ state: 'visible', timeout: 5_000 });
  const paywallText = await paywall.innerText();
  assert.match(paywallText, /本地图学习卡/);
  assert.match(paywallText, /立即支付 ¥99/);
  assert.match(paywallText, /当前预览不会扣费/);
  await page.locator('[data-vip-pay]').click();
  assert.match(
    await page.locator('[data-vip-pay-note]').innerText(),
    /正式 iPad 包会打开 App Store 支付，当前预览不会扣费/,
  );
  await page.locator('[data-paywall-close]').click();
  await paywall.waitFor({ state: 'hidden', timeout: 5_000 });

  await page.goto(`${baseUrl}/#level-11`, { waitUntil: 'networkidle' });
  await closeReleaseDialog(page);
  const callbackPaywall = page.locator('.paywall-dialog[open]');
  await callbackPaywall.waitFor({ state: 'visible', timeout: 5_000 });
  await page.evaluate(() => window.BabyIslandIAPComplete());
  await callbackPaywall.waitFor({ state: 'hidden', timeout: 5_000 });
  const purchasePreferences = await page.evaluate((preferencesKey) => JSON.parse(localStorage.getItem(preferencesKey)), APP_PREFERENCES_KEY);
  assert.equal(purchasePreferences.vipActive, true);
  await page.goto(`${baseUrl}/#level-11`, { waitUntil: 'networkidle' });
  await closeReleaseDialog(page);
  await page.locator('[data-stage-video]').waitFor({ state: 'visible', timeout: 5_000 });
  await page.waitForFunction(({ storageKey, expected }) => {
    try {
      const states = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return states[`ocean:${expected.levelId}`]?.status === 'not-installed'
        && String(states[`ocean:${expected.levelId}`]?.downloadUrl || '').includes(expected.file);
    } catch { return false; }
  }, { storageKey: LEVEL_VIDEO_STORAGE_KEY, expected: { levelId: 11, file: 'level-011-apple.mp4' } }, { timeout: 5_000 });
  assert.equal(await page.locator('[data-video]').count(), 0);
  assert.equal(await page.locator('[data-level-video-download-panel]').count(), 1);
  await page.evaluate(({ progressKey }) => {
    localStorage.setItem(progressKey, JSON.stringify({
      completed: Array.from({ length: 11 }, (_, index) => index + 1),
      unlockedThrough: 12,
    }));
  }, { progressKey: PROGRESS_STORAGE_KEY });
  await page.goto(`${baseUrl}/?vip-paid12=1#level-12`, { waitUntil: 'networkidle' });
  await closeReleaseDialog(page);
  await page.locator('[data-stage-video]').waitFor({ state: 'visible', timeout: 5_000 });
  await page.waitForFunction(({ storageKey, expected }) => {
    try {
      const states = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return states[`ocean:${expected.levelId}`]?.status === 'not-installed'
        && String(states[`ocean:${expected.levelId}`]?.downloadUrl || '').includes(expected.file);
    } catch { return false; }
  }, { storageKey: LEVEL_VIDEO_STORAGE_KEY, expected: { levelId: 12, file: 'level-012-banana.mp4' } }, { timeout: 5_000 });
  assert.equal(await page.locator('[data-video]').count(), 0);
  assert.equal(await page.locator('[data-level-video-download-panel]').count(), 1);
  await page.goto(`${baseUrl}/#mine`, { waitUntil: 'networkidle' });
  await closeReleaseDialog(page);
  const vipMineText = await page.locator('.mine-layout').innerText();
  assert.doesNotMatch(vipMineText, /非 VIP|开通 VIP|VIP 已开通|VIP 权益已生效/);
  assert.match(vipMineText, /检查内容更新/);

  assert.deepEqual(problems, []);
  await context.close();
}

async function runOfflineShell(browser, baseUrl) {
  const { context, page, problems } = await newPage(browser, { width: 820, height: 600 }, baseUrl);

  await page.goto(`${baseUrl}/#map`, { waitUntil: 'networkidle' });
  await ensureLoggedIn(page);
  await closeReleaseDialog(page, true);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'networkidle' });
  await closeReleaseDialog(page);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 5_000 });

  problems.length = 0;
  await context.setOffline(true);
  await page.goto(`${baseUrl}/#map`, { waitUntil: 'domcontentloaded' });
  await closeReleaseDialog(page);
  await page.locator('[data-route-scroll]').waitFor({ state: 'visible', timeout: 5_000 });
  assert.match(await page.locator('body').innerText(), /200 座魔法岛|200 MAGIC ISLANDS/);
  assert.deepEqual(problems.filter((problem) => problem.includes('app-release.json')), []);
  const freeLessonResources = levels.slice(0, 10).flatMap((level) => {
    const videoFile = level.videoSrc;
    const questionAudioFile = videoFile.match(/level-\d+-[^.?]+/)?.[0];
    assert.ok(questionAudioFile, `level ${level.id} question audio filename can be derived`);
    return [
      [videoFile, /video\/mp4/.source],
      [`assets/audio/questions-holly/${questionAudioFile}.mp3?v=20260719-question-200-nouns-v2`, /audio\/mpeg/.source],
    ];
  });
  const offlineResources = await page.evaluate(async (resources) => Promise.all(resources.map(async ([url, expectedType]) => {
    const response = await fetch(url);
    return {
      url,
      status: response.status,
      ok: response.ok,
      type: response.headers.get('content-type') || '',
      expectedType,
    };
  })), [
    ['assets/ocean/front-ocean-bg-v2-libtv.webp', /image\/webp/.source],
    ['assets/ocean/front-ocean-loop-v4-libtv-seamless-clouds.mp4?v=20260719-handpainted-libtv-v1', /video\/mp4/.source],
    ['assets/ocean/rowing-kids-boat-idle.webp?v=20260720-libtv-original-v3', /image\/webp/.source],
    ['assets/icons/resource-star.webp?v=20260714-v1', /image\/webp/.source],
    ['assets/audio/map-bgm.mp3', /audio\/mpeg/.source],
    ['assets/audio/words/mom.mp3', /audio\/mpeg/.source],
    ['assets/audio/words/toy.mp3', /audio\/mpeg/.source],
    ...freeLessonResources,
  ]);
  offlineResources.forEach((item) => {
    assert.equal(item.ok, true, item.url);
    assert.match(item.type, new RegExp(item.expectedType), item.url);
  });
  const releaseProbe = await page.evaluate(async () => {
    const response = await fetch('app-release.json?t=offline-probe');
    const sample = await response.clone().text().catch(() => '');
    return {
      status: response.status,
      startsHtml: /^\s*<!doctype html/i.test(sample.slice(0, 100)),
    };
  });
  assert.equal(releaseProbe.status, 503);
  assert.equal(releaseProbe.startsHtml, false);
  await context.setOffline(false);

  assert.deepEqual(problems.filter((problem) => (
    !problem.includes('app-release.json')
    && !problem.includes('console Failed to load resource: the server responded with a status of 503 (Offline)')
  )), []);
  await context.close();
}

async function runForcedReleaseUpdateSmoke(browser, baseUrl) {
  const noChannel = await newPage(browser, { width: 820, height: 600 }, baseUrl);
  await noChannel.page.route('**/app-release.json*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      latestVersion: '1.0.2',
      minSupportedVersion: '1.0.1',
      title: '需要更新后继续使用',
      message: '请先更新到最新版本。',
      storeName: 'App Store',
    }),
  }));

  await noChannel.page.goto(`${baseUrl}/#map`, { waitUntil: 'networkidle' });
  const noChannelDialog = noChannel.page.locator('.release-update-dialog[open]');
  await noChannelDialog.waitFor({ state: 'visible', timeout: 5_000 });
  assert.match(await noChannelDialog.innerText(), /需要更新后继续使用/);
  assert.ok(await noChannel.page.locator('[data-release-update-close]').count() > 0);
  await noChannel.page.evaluate(() => document.querySelector('.access-secondary-button[data-release-update-close]')?.click());
  await noChannel.page.waitForFunction(() => !document.querySelector('.release-update-dialog[open]'), null, { timeout: 5_000 });
  assert.deepEqual(noChannel.problems, []);
  await noChannel.context.close();

  const { context, page, problems } = await newPage(browser, { width: 820, height: 600 }, baseUrl);
  await page.route('**/app-release.json*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      latestVersion: '1.0.2',
      minSupportedVersion: '1.0.2',
      force: true,
      title: '需要更新后继续使用',
      message: '请先更新到最新版本。',
      storeName: 'App Store',
      updateUrl: 'https://apps.apple.com/app/id123456789',
    }),
  }));

  await page.goto(`${baseUrl}/#map`, { waitUntil: 'networkidle' });
  const dialog = page.locator('.release-update-dialog[open]');
  await dialog.waitFor({ state: 'visible', timeout: 5_000 });
  assert.match(await dialog.innerText(), /需要更新后继续使用/);
  assert.equal(await page.locator('[data-release-update-close]').count(), 0);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  assert.equal(await page.locator('.release-update-dialog[open]').count(), 1);

  assert.deepEqual(problems, []);
  await context.close();
}

async function runPhoneSmoke(browser, baseUrl) {
  const { context, page, problems } = await newPage(browser, { width: 390, height: 844 }, baseUrl);
  await page.goto(`${baseUrl}/#map`, { waitUntil: 'networkidle' });
  await ensureLoggedIn(page);
  await closeReleaseDialog(page, true);
  assert.equal(await page.locator('[data-tab]').count(), 3);
  assert.ok(await page.locator('[data-route-scroll]').isVisible());
  const phoneMap = await page.evaluate(() => {
    const locate = document.querySelector('[data-locate-progress]');
    const tabs = document.querySelector('.bottom-tabs');
    const journey = document.querySelector('.journey-compact');
    const resource = document.querySelector('.resource-strip');
    if (!locate || !tabs) return { hasLocate: Boolean(locate), hasTabs: Boolean(tabs) };
    const rect = locate.getBoundingClientRect();
    const tabsRect = tabs.getBoundingClientRect();
    const topEl = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return {
      hasLocate: true,
      hasTabs: true,
      locateBottom: rect.bottom,
      tabsTop: tabsRect.top,
      locateCenterClickable: topEl === locate || locate.contains(topEl),
      journeyDisplay: journey ? getComputedStyle(journey).display : 'missing',
      resourceDisplay: resource ? getComputedStyle(resource).display : 'missing',
    };
  });
  assert.equal(phoneMap.hasLocate, true, '手机竖屏必须有当前关卡定位按钮');
  assert.equal(phoneMap.hasTabs, true, '手机竖屏必须有底部导航');
  assert.equal(phoneMap.locateCenterClickable, true, `手机竖屏定位按钮中心不能被遮挡: ${JSON.stringify(phoneMap)}`);
  assert.ok(phoneMap.locateBottom <= phoneMap.tabsTop - 8, `手机竖屏定位按钮必须浮在底栏上方: ${JSON.stringify(phoneMap)}`);
  assert.ok(['none', 'missing'].includes(phoneMap.journeyDisplay), `390px 竖屏不应显示航程胶囊挤压顶栏: ${JSON.stringify(phoneMap)}`);
  assert.equal(phoneMap.resourceDisplay, 'none', '390px 竖屏不应显示资源胶囊挤压顶栏');
  await page.goto(`${baseUrl}/#level-1`, { waitUntil: 'networkidle' });
  await closeReleaseDialog(page);
  await enterQuiz(page);
  assert.equal(await page.locator('.option-card').count(), 2);
  await assertQuizLayoutInViewport(page, 'phone quiz layout');

  await page.evaluate((progressKey) => {
    localStorage.setItem(progressKey, JSON.stringify({
      completed: Array.from({ length: 10 }, (_, index) => index + 1),
      unlockedThrough: 11,
    }));
  }, PROGRESS_STORAGE_KEY);
  await page.goto(`${baseUrl}/#level-11`, { waitUntil: 'networkidle' });
  await closeReleaseDialog(page);
  await page.locator('.paywall-dialog[open]').waitFor({ state: 'visible', timeout: 5_000 });
  await assertElementInViewport(page, '.paywall-card', 'phone paywall card');
  await assertElementInViewport(page, '[data-paywall-close]', 'phone paywall close button');
  await assertElementInViewport(page, '[data-vip-pay]', 'phone paywall pay button');
  assert.deepEqual(problems, []);
  await context.close();
}

async function gestureScrollToStop(page, stopId) {
  await page.locator('[data-route-scroll]').dispatchEvent('pointerdown', {
    pointerType: 'touch',
    clientX: 200,
    clientY: 500,
    bubbles: true,
  });
  await page.evaluate((id) => {
    const scroll = document.querySelector('[data-route-scroll]');
    const stop = document.querySelector(`[data-stop="${id}"]`);
    const previousSnap = scroll.style.scrollSnapType;
    const previousBehavior = scroll.style.scrollBehavior;
    scroll.style.scrollSnapType = 'none';
    scroll.style.scrollBehavior = 'auto';
    scroll.scrollLeft = Math.max(0, stop.offsetLeft - (scroll.clientWidth - stop.offsetWidth) / 2);
    scroll.dispatchEvent(new Event('scroll'));
    scroll.style.scrollSnapType = previousSnap;
    scroll.style.scrollBehavior = previousBehavior;
  }, stopId);
  await page.waitForFunction(
    (id) => document.querySelector('.level-stop.is-centered')?.dataset.stop === String(id),
    stopId,
    { timeout: 2_000 },
  );
}

async function boatMetrics(page) {
  return page.evaluate(() => {
    const boat = document.querySelector('[data-current-boat]');
    const idle = boat?.querySelector('[data-boat-asset-idle]');
    const sailing = boat?.querySelector('[data-boat-asset-sailing]');
    const centered = document.querySelector('.level-stop.is-centered');
    const boatRect = boat?.getBoundingClientRect();
    const centeredRect = centered?.getBoundingClientRect();
    return {
      centered: centered?.dataset.stop,
      boatX: getComputedStyle(boat).getPropertyValue('--boat-x').trim(),
      sailing: boat?.classList.contains('is-sailing'),
      boatVisible: !!boatRect && boatRect.width > 80 && boatRect.height > 50,
      boatCenterX: boatRect ? Math.round(boatRect.left + boatRect.width / 2) : null,
      centeredX: centeredRect ? Math.round(centeredRect.left + centeredRect.width / 2) : null,
      idleVisibility: idle ? getComputedStyle(idle).visibility : null,
      sailingVisibility: sailing ? getComputedStyle(sailing).visibility : null,
    };
  });
}

async function runBoatQuickReturnSmoke(browser, baseUrl) {
  const { context, page, problems } = await newPage(browser, { width: 820, height: 600 }, baseUrl);
  await page.addInitScript((progressKey) => {
    localStorage.setItem(progressKey, JSON.stringify({
      completed: Array.from({ length: 10 }, (_, index) => index + 1),
      unlockedThrough: 11,
    }));
  }, PROGRESS_STORAGE_KEY);

  await page.goto(`${baseUrl}/#map`, { waitUntil: 'networkidle' });
  await ensureLoggedIn(page);
  await closeReleaseDialog(page, true);
  await page.locator('[data-route-scroll]').waitFor({ state: 'visible', timeout: 5_000 });
  await page.waitForTimeout(300);

  await gestureScrollToStop(page, 9);
  await page.waitForFunction(
    () => document.querySelector('[data-current-boat]')?.classList.contains('is-sailing'),
    null,
    { timeout: 3_000 },
  );

  await gestureScrollToStop(page, 8);
  await page.waitForFunction(
    () => document.querySelector('[data-current-boat]')?.classList.contains('is-sailing'),
    null,
    { timeout: 3_000 },
  );
  await page.waitForFunction(
    () => !document.querySelector('[data-current-boat]')?.classList.contains('is-sailing'),
    null,
    { timeout: 5_000 },
  );
  const final = await boatMetrics(page);
  assert.equal(final.centered, '8', `boat should return to level 8: ${JSON.stringify(final)}`);
  assert.equal(final.sailing, false, `boat should stop rowing: ${JSON.stringify(final)}`);
  assert.ok(Math.abs(Number.parseFloat(final.boatX) || 0) < 1, `boat should dock at center: ${JSON.stringify(final)}`);
  assert.equal(final.idleVisibility, 'visible', `idle boat should be visible: ${JSON.stringify(final)}`);
  assert.equal(final.sailingVisibility, 'hidden', `sailing boat should be hidden: ${JSON.stringify(final)}`);
  assert.ok(final.boatVisible, `boat should stay visible: ${JSON.stringify(final)}`);
  assert.ok(Math.abs(final.boatCenterX - final.centeredX) <= 1, `boat should align with centered stop: ${JSON.stringify(final)}`);

  assert.deepEqual(problems, []);
  await context.close();
}

async function runFreeLevelLessonsSmoke(browser, baseUrl) {
  const { context, page, problems } = await newPage(browser, { width: 820, height: 600 }, baseUrl);
  const audioRequests = [];
  const videoRequests = [];
  page.on('request', (request) => {
    const url = request.url();
    if (/assets\/audio\//.test(url)) audioRequests.push(url);
    if (/assets\/video\//.test(url)) videoRequests.push(url);
  });
  await page.addInitScript((progressKey) => {
    localStorage.setItem(progressKey, JSON.stringify({
      completed: Array.from({ length: 9 }, (_, index) => index + 1),
      unlockedThrough: 10,
    }));
  }, PROGRESS_STORAGE_KEY);

  for (const level of levels.slice(0, 10)) {
    audioRequests.length = 0;
    videoRequests.length = 0;
    await page.goto(`${baseUrl}/#level-${level.id}`, { waitUntil: 'networkidle' });
    if (level.id === 1) await ensureLoggedIn(page);
    await closeReleaseDialog(page, level.id === 1);
    await page.locator('[data-stage-video]').waitFor({ state: 'visible', timeout: 5_000 });
    assert.equal(await page.locator('[data-video]').getAttribute('src'), level.videoSrc);
    assert.ok(
      videoRequests.some((url) => url.includes(level.videoSrc.split('?')[0])),
      `level ${level.id} video request missing: ${videoRequests.join(', ')}`,
    );

    await enterQuiz(page);
    assert.match(await page.locator('.question-card').innerText(), new RegExp(level.zhTitle));
    assert.equal(await page.locator('[data-listen-question]').isDisabled(), false);
    await page.locator('[data-listen-question]').click({ force: true });
    const questionAudioFile = level.videoSrc
      .match(/level-\d+-[^.?]+/)?.[0]
      .replace(/^/, 'questions-holly/')
      .replace(/$/, '.mp3');
    assert.ok(questionAudioFile, `level ${level.id} question audio filename can be derived`);
    await waitForCondition(
      () => audioRequests.some((url) => url.includes(questionAudioFile)),
      `level ${level.id} question audio missing ${questionAudioFile}: ${audioRequests.join(', ')}`,
    );

    const optionWords = await page.locator('.option-card .option-word')
      .evaluateAll((items) => items.map((item) => item.textContent.trim().toLowerCase()));
    assert.equal(optionWords.length, 2, `level ${level.id} should show two options`);
    assert.equal(new Set(optionWords).size, 2, `level ${level.id} options must be unique`);
    assert.ok(optionWords.includes(level.options[level.correct].toLowerCase()), `level ${level.id} correct option missing: ${optionWords.join(', ')}`);

    await answer(page, true);
    await page.waitForSelector('.feedback-banner.correct:not([hidden])', { timeout: 5_000 });
    const feedbackText = await page.locator('.feedback-banner.correct').innerText();
    if (level.id === 10) {
      assert.match(feedbackText, /第 11 关起是会员关卡，后续课程内容会随更新开放。/);
      assert.doesNotMatch(feedbackText, /第 11 关已解锁/);
    }
  }

  assert.deepEqual(problems, []);
  await context.close();
}

async function runMapAudioRuntimeSmoke(browser, baseUrl) {
  const { context, page, problems } = await newPage(browser, { width: 820, height: 600 }, baseUrl);
  await page.addInitScript((preferencesKey) => {
    localStorage.setItem(preferencesKey, JSON.stringify({ mapMusic: true, autoPronunciation: false, showChineseHints: true }));
  }, APP_PREFERENCES_KEY);
  await page.addInitScript(() => {
    Math.random = () => 0;
    window.__mediaPlayCalls = [];
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function patchedPlay() {
      window.__mediaPlayCalls.push(this.currentSrc || this.src || this.id || this.tagName);
      return originalPlay.call(this);
    };
  });
  const audioRequests = [];
  page.on('request', (request) => {
    if (/assets\/audio\//.test(request.url())) audioRequests.push(request.url());
  });

  await page.goto(`${baseUrl}/#map`, { waitUntil: 'networkidle' });
  await ensureLoggedIn(page);
  await closeReleaseDialog(page, true);
  await page.locator('[data-route-scroll]').waitFor({ state: 'visible', timeout: 5_000 });
  await page.locator('[data-route-scroll]').click({ position: { x: 320, y: 300 }, force: true });
  await page.waitForFunction(() => {
    const music = document.querySelector('#map-music');
    return music && !music.paused && music.volume === 0.16;
  }, null, { timeout: 5_000 });
  await page.waitForFunction(
    () => window.__mediaPlayCalls.some((src) => String(src).includes('random-ambient.mp3')),
    null,
    { timeout: 7_000 },
  );
  assert.ok(audioRequests.some((url) => url.includes('map-bgm.mp3')), `missing bgm request: ${audioRequests.join(', ')}`);
  assert.ok(audioRequests.some((url) => url.includes('random-ambient.mp3')), `missing ambient request: ${audioRequests.join(', ')}`);

  await page.goto(`${baseUrl}/#level-1`, { waitUntil: 'networkidle' });
  await closeReleaseDialog(page);
  await enterQuiz(page);
  assert.equal(await page.evaluate(() => document.querySelector('#map-music').volume), 0.16);
  await page.locator('.option-card').first().locator('.speak-btn').click({ force: true });
  await page.waitForFunction(() => document.querySelector('#map-music').volume === 0.05, null, { timeout: 5_000 });
  await page.waitForFunction(
    () => window.__mediaPlayCalls.some((src) => String(src).includes('/assets/audio/words/')),
    null,
    { timeout: 5_000 },
  );
  await page.waitForFunction(() => document.querySelector('#map-music').volume === 0.16, null, { timeout: 5_000 });

  assert.deepEqual(problems, []);
  await context.close();
}

async function runCorruptedStorageSmoke(browser, baseUrl) {
  const { context, page, problems } = await newPage(browser, { width: 820, height: 600 }, baseUrl);
  await page.addInitScript((keys) => {
    for (const key of Object.values(keys)) localStorage.setItem(key, '{bad json');
  }, {
    progress: PROGRESS_STORAGE_KEY,
    learningActivity: LEARNING_ACTIVITY_KEY,
    preferences: APP_PREFERENCES_KEY,
    mistakeBook: MISTAKE_BOOK_KEY,
  });

  await page.goto(`${baseUrl}/#map`, { waitUntil: 'networkidle' });
  await ensureLoggedIn(page);
  await closeReleaseDialog(page, true);
  await page.locator('[data-route-scroll]').waitFor({ state: 'visible', timeout: 5_000 });
  assert.equal(await page.locator('[data-stop="1"]').count(), 1);

  await page.goto(`${baseUrl}/#mine`, { waitUntil: 'networkidle' });
  await closeReleaseDialog(page);
  assert.match(await page.locator('.mine-layout').innerText(), /我的|英语区|检查内容更新/);

  assert.deepEqual(problems, []);
  await context.close();
}

async function runLongOptionLayoutSmoke(browser, baseUrl) {
  const { context, page, problems } = await newPage(browser, { width: 820, height: 600 }, baseUrl);
  await page.goto(`${baseUrl}/#level-1`, { waitUntil: 'networkidle' });
  await ensureLoggedIn(page);
  await closeReleaseDialog(page, true);
  await enterQuiz(page);

  const longText = '这是一段超过两百个汉字的选项内容，用来模拟未来题库里出现很长解释或家长误填长答案时，按钮文字仍然必须留在卡片里面，不能压住发音按钮，也不能冲出答题区域。小朋友可能看不懂这段字，但页面必须稳定，方便家长协助和测试人员发现布局问题。';
  await page.evaluate((text) => {
    document.querySelectorAll('.option-card').forEach((card, index) => {
      card.classList.add('has-long-text', 'has-very-long-text');
      const word = card.querySelector('.option-word');
      if (word) word.textContent = index === 0 ? text : `${text}另一个选项`;
    });
  }, longText);

  const metrics = await page.evaluate(() => Array.from(document.querySelectorAll('.option-card')).map((card) => {
    const word = card.querySelector('.option-word');
    const speak = card.querySelector('.speak-btn');
    const cardRect = card.getBoundingClientRect();
    const wordRect = word.getBoundingClientRect();
    const speakRect = speak.getBoundingClientRect();
    const wordStyle = getComputedStyle(word);
    return {
      cardBottom: cardRect.bottom,
      cardRight: cardRect.right,
      wordBottom: wordRect.bottom,
      wordRight: wordRect.right,
      speakWidth: speakRect.width,
      speakHeight: speakRect.height,
      overflowWrap: wordStyle.overflowWrap,
    };
  }));

  metrics.forEach((item) => {
    assert.ok(item.wordBottom <= item.cardBottom + 1, `long option text overflowed vertically: ${JSON.stringify(item)}`);
    assert.ok(item.wordRight <= item.cardRight + 1, `long option text overflowed horizontally: ${JSON.stringify(item)}`);
    assert.ok(item.speakWidth >= 60 && item.speakHeight >= 60, `speak button was squeezed: ${JSON.stringify(item)}`);
    assert.equal(item.overflowWrap, 'anywhere');
  });

  assert.deepEqual(problems, []);
  await context.close();
}

async function runSecondaryRoutes(browser, baseUrl) {
  const { context, page, problems } = await newPage(browser, { width: 820, height: 600 }, baseUrl);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    if (!localStorage.getItem('baby-island-preview-progress-v1')) {
      localStorage.setItem('baby-island-preview-progress-v1', JSON.stringify({
        completed: Array.from({ length: 20 }, (_, index) => index + 1),
        unlockedThrough: 21,
      }));
    }
    if (!localStorage.getItem('baby-island-app-preferences-v1')) {
      localStorage.setItem('baby-island-app-preferences-v1', JSON.stringify({
        childName: '测试宝宝',
        childAge: '5',
      }));
    }
  });

  await page.goto(`${baseUrl}/#ranking`, { waitUntil: 'networkidle' });
  await ensureLoggedIn(page);
  await closeReleaseDialog(page, true);
  const rankingText = await page.locator('body').innerText();
  assert.match(rankingText, /本周积分/);
  assert.match(rankingText, /测试宝宝同学/);
  assert.match(rankingText, /我的排名/);
  assert.match(rankingText, /我的英语星/);
  assert.equal(await page.locator('[data-current-user="true"]').count(), 1);
  assert.equal(await page.locator('[data-tab="ranking"][aria-current="page"]').count(), 1);

  await page.goto(`${baseUrl}/#mine`, { waitUntil: 'networkidle' });
  await closeReleaseDialog(page);
  await page.locator('[data-word-chips]').waitFor({ state: 'visible', timeout: 5_000 });
  const collapsedWordBank = await page.evaluate(() => ({
    visible: Array.from(document.querySelectorAll('.word-chips span'))
      .filter((word) => getComputedStyle(word).display !== 'none').length,
    total: document.querySelectorAll('.word-chips span').length,
    toggle: document.querySelector('[data-words-expand]')?.textContent?.trim(),
    expanded: document.querySelector('[data-words-expand]')?.getAttribute('aria-expanded'),
  }));
  assert.deepEqual(collapsedWordBank, {
    visible: 12,
    total: 20,
    toggle: '+8 词',
    expanded: 'false',
  });
  await page.locator('[data-words-expand]').click();
  const expandedWordBank = await page.evaluate(() => ({
    visible: Array.from(document.querySelectorAll('.word-chips span'))
      .filter((word) => getComputedStyle(word).display !== 'none').length,
    toggle: document.querySelector('[data-words-expand]')?.textContent?.trim(),
    expanded: document.querySelector('[data-words-expand]')?.getAttribute('aria-expanded'),
  }));
  assert.deepEqual(expandedWordBank, {
    visible: 20,
    toggle: '收起',
    expanded: 'true',
  });
  await page.locator('[data-preference="showChineseHints"]').click();
  assert.equal(await page.locator('[data-preference="showChineseHints"]').getAttribute('aria-checked'), 'false');
  await page.locator('[data-child-profile="childName"]').fill('小雨');
  await page.locator('[data-child-profile="childName"]').dispatchEvent('change', { bubbles: true });
  assert.match(await page.locator('.profile-card').innerText(), /小雨同学/);
  await page.locator('[data-check-update]').click();
  await page.waitForFunction(() => {
    const note = document.querySelector('[data-check-update-note]');
    return note && note.textContent !== '检查课程资源和页面内容更新';
  }, null, { timeout: 5_000 });
  assert.match(
    await page.locator('[data-check-update-note]').innerText(),
    /正在检查更新|当前已是最新版本|发现内容更新|内容更新已准备好|更新服务尚未就绪|当前环境不支持自动更新|网络不可用/,
  );

  for (const route of ['privacy', 'terms', 'about']) {
    await page.goto(`${baseUrl}/#${route}`, { waitUntil: 'networkidle' });
    await closeReleaseDialog(page);
    assert.ok(await page.locator('.info-card').isVisible());
    await page.locator('[data-nav-route="mine"]').click();
    await page.waitForSelector('.mine-layout', { timeout: 5_000 });
  }

  await page.goto(`${baseUrl}/#support`, { waitUntil: 'networkidle' });
  await closeReleaseDialog(page);
  await page.locator('[data-support-message]').fill('坏');
  await page.locator('[data-support-form]').evaluate((form) => form.requestSubmit());
  await waitForText(page, '[data-support-error]', /至少写 4 个字/, 'support validation');
  await page.locator('[data-support-message]').fill('第 3 关喇叭没有声音');
  await page.locator('[data-copy-support]').click();
  await waitForText(page, '[data-support-status]', /不能自动复制|复制失败|已复制/, 'support copy status');
  assert.equal(
    await page.evaluate(() => localStorage.getItem('baby-island-support-draft-v1')),
    '第 3 关喇叭没有声音',
  );

  await page.goto(`${baseUrl}/#mine`, { waitUntil: 'networkidle' });
  await closeReleaseDialog(page);
  await page.reload({ waitUntil: 'networkidle' });
  await closeReleaseDialog(page);
  assert.match(await page.locator('.profile-card').innerText(), /小雨同学/);
  assert.equal(await page.locator('[data-preference="showChineseHints"]').getAttribute('aria-checked'), 'false');

  assert.deepEqual(problems, []);
  await context.close();
}

async function main() {
  const { server, baseUrl } = await serveStatic();
  const browser = await chromium.launch({ headless: true });
  try {
    await runPrimaryFlow(browser, baseUrl);
    await runSecondaryRoutes(browser, baseUrl);
    await runPhoneSmoke(browser, baseUrl);
    await runBoatQuickReturnSmoke(browser, baseUrl);
    await runFreeLevelLessonsSmoke(browser, baseUrl);
    await runMapAudioRuntimeSmoke(browser, baseUrl);
    await runCorruptedStorageSmoke(browser, baseUrl);
    await runLongOptionLayoutSmoke(browser, baseUrl);
    await runOfflineShell(browser, baseUrl);
    await runForcedReleaseUpdateSmoke(browser, baseUrl);
    console.log('E2E PASS: release update, forced release update, map, mobile map layout, boat quick-return, free level lessons, map audio runtime, local ranking, mine, VIP state, content update check, settings, support, quiz, audio, VIP paywall, corrupted storage, long options, offline shell');
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exit(1);
});
