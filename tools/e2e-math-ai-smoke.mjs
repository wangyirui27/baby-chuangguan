#!/usr/bin/env node
/**
 * Math AI 3-5 smoke: login → math map inline quiz → wrong/right → coach/continue → parent report.
 */
import assert from 'node:assert/strict';
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'screenshots', 'math-ai-smoke');
const require = createRequire(import.meta.url);
const { MATH_STORY_WAYPOINTS } = require('../script.js');
const APP_PREFERENCES_KEY = 'baby-island-app-preferences-v1';
const MATH_STORY_CLEARED_KEY = 'baby-island-math-story-cleared-v1';
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

function startStaticServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      const rel = urlPath === '/' ? '/index.html' : urlPath;
      const filePath = path.join(ROOT, rel.replace(/^\//, ''));
      if (!filePath.startsWith(ROOT) || !existsSync(filePath)) {
        res.writeHead(404); res.end('not found'); return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
      createReadStream(filePath).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

async function shot(page, name) {
  const p = path.join(OUT, name);
  await page.screenshot({ path: p, fullPage: false });
  return p;
}

async function skipSplash(page) {
  const skip = page.locator('#splash-skip-btn, .splash-skip');
  if (await skip.count()) await skip.first().click({ force: true }).catch(() => {});
  await page.waitForSelector('#app-splash', { state: 'detached', timeout: 8_000 }).catch(() => {});
  await page.evaluate(() => document.getElementById('app-splash')?.remove());
}

async function closeReleaseDialog(page) {
  const later = page.locator('button:has-text("稍后再说"), [data-release-later]').first();
  if (await later.count()) {
    await later.click({ force: true }).catch(() => {});
  }
  await page.evaluate(() => {
    document.querySelectorAll('dialog.release-update-dialog, .release-update-dialog, dialog[open]').forEach((el) => {
      if (el.classList?.contains('login-dialog')) return;
      try { el.close?.(); } catch {}
      if (el.classList?.contains('release-update-dialog') || el.classList?.contains('map-switch-dialog') === false) {
        // keep map-switch for explicit control elsewhere
      }
    });
    document.querySelectorAll('dialog.release-update-dialog').forEach((el) => el.remove());
  });
  await page.waitForTimeout(200);
}

async function loginIfNeeded(page) {
  const dialog = page.locator('dialog.login-dialog');
  try {
    await dialog.waitFor({ state: 'visible', timeout: 4_000 });
  } catch {
    return;
  }
  await page.locator('[data-login-phone]').fill('13800138000');
  const send = page.locator('[data-login-send-code]');
  if (await send.count()) await send.click();
  await page.locator('[data-login-code]').fill('1234');
  await page.locator('[data-login-submit]').click();
  await page.waitForSelector('dialog.login-dialog', { state: 'detached', timeout: 10_000 });
}

async function continueMathStoryIfVisible(page) {
  const continueButton = page.locator('[data-math-story-continue]').first();
  if (!(await continueButton.count())) return false;
  await continueButton.waitFor({ state: 'visible', timeout: 5_000 });
  await page.waitForFunction(
    () => !document.querySelector('[data-math-story-continue]')?.disabled,
    null,
    { timeout: 12_000 },
  );
  await continueButton.click({ force: true });
  await page.waitForTimeout(500);
  return true;
}

async function ensureMathWorld(page) {
  await page.evaluate((key) => {
    const prev = JSON.parse(localStorage.getItem(key) || '{}');
    prev.mapWorld = 'math';
    prev.mapMusic = false;
    prev.autoPronunciation = true;
    localStorage.setItem(key, JSON.stringify(prev));
  }, APP_PREFERENCES_KEY);

  // Close any leftover overlay first
  await page.evaluate(() => {
    document.querySelectorAll('dialog.map-switch-dialog').forEach((d) => {
      try { d.close?.(); } catch {}
      d.remove();
    });
  });

  // Open switcher via real button
  const switchBtn = page.locator('[data-map-switch]').first();
  await switchBtn.waitFor({ state: 'visible', timeout: 8_000 });
  await switchBtn.click({ force: true });
  await page.waitForTimeout(300);

  const mathTab = page.locator('[data-map-zone-tab="math"]').first();
  await mathTab.waitFor({ state: 'visible', timeout: 5_000 });
  await mathTab.click({ force: true });
  await page.waitForTimeout(200);

  const mathWorld = page.locator('[data-map-world="math"]').first();
  await mathWorld.waitFor({ state: 'visible', timeout: 5_000 });
  await mathWorld.click({ force: true });

  // Wait picker closed
  await page.waitForFunction(() => {
    const open = document.querySelector('dialog.map-switch-dialog[open], dialog.map-switch-dialog:not([hidden])');
    // if dialog element still present but not open attribute
    const dialogs = [...document.querySelectorAll('dialog.map-switch-dialog')];
    return dialogs.every((d) => !d.open);
  }, { timeout: 8_000 }).catch(async () => {
    // force close if stuck
    await page.evaluate(() => {
      document.querySelectorAll('dialog.map-switch-dialog').forEach((d) => {
        try { d.close?.(); } catch {}
        d.remove();
      });
    });
  });

  await page.waitForTimeout(500);

  // Math inline panel must appear on map
  await page.waitForSelector('[data-math-inline-question], .math-inline-panel, .math-choice', { timeout: 10_000 });

  const world = await page.evaluate((key) => {
    try { return JSON.parse(localStorage.getItem(key) || '{}').mapWorld; } catch { return null; }
  }, APP_PREFERENCES_KEY);
  assert.equal(world, 'math', 'mapWorld should be math');
}

async function answerWrongThenRight(page) {
  // Math map uses .math-choice (not .option-card)
  const choices = page.locator('.math-choice, [data-math-options] button, .option-card');
  await choices.first().waitFor({ state: 'visible', timeout: 12_000 });
  const count = await choices.count();
  assert.ok(count >= 2, `need >=2 choices, got ${count}`);

  // Pick a wrong choice: prefer data-correct="false" or not .is-correct
  let wrong = page.locator('.math-choice[data-correct="false"], .option-card[data-correct="false"]').first();
  if (!(await wrong.count())) {
    // fallback: click first, if it was correct we'll still exercise continue path later
    wrong = choices.nth(0);
  }
  await wrong.click({ force: true });
  await page.waitForTimeout(200);

  const submit = page.locator('[data-submit]').first();
  await submit.waitFor({ state: 'visible', timeout: 5_000 });
  await submit.click({ force: true });
  await page.waitForTimeout(700);

  // Expect feedback after wrong
  const feedbackAfterWrong = await page.locator('[data-feedback]').first().innerText().catch(() => '');
  assert.ok(feedbackAfterWrong.trim().length > 0, 'feedback after wrong should show');

  // Continue after wrong (may go easier variant same level or stay)
  const cont1 = page.locator('[data-continue-map]').first();
  if (await cont1.isVisible().catch(() => false)) {
    await cont1.click({ force: true });
    await page.waitForTimeout(700);
  }

  // Answer correctly on the (possibly adapted) question
  await choices.first().waitFor({ state: 'visible', timeout: 10_000 });
  let right = page.locator('.math-choice[data-correct="true"], .option-card[data-correct="true"]').first();
  if (!(await right.count())) {
    // Try each until feedback says correct / continue advances
    const n = await choices.count();
    for (let i = 0; i < n; i += 1) {
      await choices.nth(i).click({ force: true });
      if (await submit.isVisible().catch(() => false)) {
        await submit.click({ force: true });
        await page.waitForTimeout(600);
        const fb = await page.locator('[data-feedback]').first().innerText().catch(() => '');
        if (/对|棒|正确|真厉害|加油|下一|继续/.test(fb) || await page.locator('[data-continue-map]').first().isVisible().catch(() => false)) {
          break;
        }
        // reset if still answering
      }
    }
  } else {
    await right.click({ force: true });
    await page.waitForTimeout(200);
    if (await submit.isVisible().catch(() => false)) await submit.click({ force: true });
    await page.waitForTimeout(700);
  }

  const feedback = await page.locator('[data-feedback]').first().innerText().catch(() => '');
  return feedback;
}

async function continueMath(page) {
  const cont = page.locator('[data-continue-map]').first();
  if (await cont.isVisible().catch(() => false)) {
    await cont.click({ force: true });
    await page.waitForTimeout(800);
  }
}

async function openParentReport(page) {
  // Prefer mine tab
  const mine = page.locator('[data-nav="mine"], a[href="#mine"], button:has-text("我的")').first();
  if (await mine.count()) {
    await mine.click({ force: true }).catch(() => {});
  } else {
    await page.evaluate(() => { location.hash = '#mine'; });
  }
  await page.waitForTimeout(900);
  // Math parent section
  await page.waitForSelector('[data-math-parent-report], .math-parent-report, text=数学', { timeout: 10_000 }).catch(() => {});
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const { server, baseUrl } = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  const problems = [];
  page.on('pageerror', (err) => problems.push(`pageerror ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`console ${msg.text()}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) problems.push(`http ${response.status()} ${response.url()}`);
  });

  const report = {
    ok: false,
    baseUrl,
    steps: [],
    attempts: 0,
    feedback: '',
    hasFeedbackUi: false,
    hasMathSection: false,
    screenshots: [],
    problems,
  };

  try {
    await page.addInitScript((key) => {
      try {
        localStorage.setItem(key, JSON.stringify({
          mapWorld: 'math',
          mapMusic: false,
          autoPronunciation: true,
          vipActive: true,
        }));
      } catch {}
    }, APP_PREFERENCES_KEY);
    await page.addInitScript(({ clearedKey, waypointIds }) => {
      localStorage.setItem(clearedKey, JSON.stringify(waypointIds));
    }, {
      clearedKey: MATH_STORY_CLEARED_KEY,
      waypointIds: MATH_STORY_WAYPOINTS.map((waypoint) => waypoint.id),
    });

    await page.goto(`${baseUrl}/index.html#map`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await skipSplash(page);
    report.steps.push('splash-skipped');
    await loginIfNeeded(page);
    report.steps.push('login-ok');
    await closeReleaseDialog(page);
    if (await continueMathStoryIfVisible(page)) report.steps.push('math-story-continued');
    report.screenshots.push(await shot(page, '01-after-login.png'));

    await ensureMathWorld(page);
    report.steps.push('math-world');
    report.screenshots.push(await shot(page, '02-math-map.png'));

    // Inline math should already be visible — no separate level route needed
    const feedback = await answerWrongThenRight(page);
    report.feedback = feedback;
    report.hasFeedbackUi = Boolean(feedback && feedback.trim());
    report.steps.push('answered-wrong-right');
    report.screenshots.push(await shot(page, '03-after-answer.png'));

    await continueMath(page);
    report.steps.push('continued');
    report.screenshots.push(await shot(page, '04-continued.png'));

    report.attempts = await page.evaluate((key) => {
      try {
        const raw = localStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list.length : 0;
      } catch {
        return 0;
      }
    }, 'baby-island-math-attempts-v1');

    await openParentReport(page);
    report.steps.push('parent-report');
    report.screenshots.push(await shot(page, '05-parent-report.png'));

    const bodyText = await page.locator('body').innerText();
    report.hasMathSection = /数学|正确率|建议|再练|下一关/.test(bodyText);

    // Soft asserts — core path
    assert.ok(report.hasFeedbackUi, 'feedback UI should show after answer');
    assert.ok(report.attempts >= 1, `mathAttempts should record >=1, got ${report.attempts}`);
    assert.ok(report.hasMathSection, 'parent/mine should show math section copy');

    report.ok = true;
    writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } catch (err) {
    report.error = String(err && err.stack || err);
    try { report.screenshots.push(await shot(page, 'FAIL.png')); } catch {}
    writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
    console.error(report.error);
    process.exitCode = 1;
  } finally {
    await browser.close().catch(() => {});
    server.close();
  }
}

main();
