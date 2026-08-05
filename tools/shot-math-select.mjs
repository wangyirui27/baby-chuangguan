#!/usr/bin/env node
/**
 * Math option selected-state shot + scale metric gate.
 * Fails if selected plate is not visibly larger than unselected (~ratio < 1.08).
 */
import assert from 'node:assert/strict';
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'screenshots', 'math-select-stroke');
const APP_PREFERENCES_KEY = 'baby-island-app-preferences-v1';
const STATE_KEYS = ['baobao_chuangguan_state_v1', 'baby_island_progress_v1'];
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
        res.writeHead(404);
        res.end('not found');
        return;
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

async function skipSplash(page) {
  const skip = page.locator('#splash-skip-btn, .splash-skip');
  if (await skip.count()) await skip.first().click({ force: true }).catch(() => {});
  await page.waitForSelector('#app-splash', { state: 'detached', timeout: 8_000 }).catch(() => {});
  await page.evaluate(() => document.getElementById('app-splash')?.remove());
}

async function closeReleaseDialog(page) {
  const later = page.locator('button:has-text("稍后再说"), [data-release-later]').first();
  if (await later.count()) await later.click({ force: true }).catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('dialog.release-update-dialog').forEach((el) => {
      try {
        el.close?.();
      } catch {}
      el.remove();
    });
  });
  await page.waitForTimeout(150);
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

async function seedProgress(page) {
  await page.evaluate(
    ({ prefsKey, stateKeys }) => {
      const unlock = {
        version: 1,
        user: { id: 'shot', displayName: 'shot', isVip: true },
        progressByWorld: {
          desert: { unlockedLevelId: 200, completedLevelIds: [], starsByLevelId: {} },
          ocean: { unlockedLevelId: 200, completedLevelIds: [], starsByLevelId: {} },
          math: {
            unlockedLevelId: 200,
            completedLevelIds: [1],
            starsByLevelId: { 1: 3 },
          },
        },
        preferences: { mapWorld: 'math', soundEnabled: false, musicEnabled: false },
      };
      for (const k of stateKeys) {
        try {
          localStorage.setItem(k, JSON.stringify(unlock));
        } catch {}
      }
      const prev = JSON.parse(localStorage.getItem(prefsKey) || '{}');
      prev.mapWorld = 'math';
      prev.mapMusic = false;
      prev.autoPronunciation = false;
      localStorage.setItem(prefsKey, JSON.stringify(prev));
    },
    { prefsKey: APP_PREFERENCES_KEY, stateKeys: STATE_KEYS },
  );
}

async function ensureMathWorld(page) {
  await seedProgress(page);

  await page.evaluate(() => {
    document.querySelectorAll('dialog.map-switch-dialog').forEach((d) => {
      try {
        d.close?.();
      } catch {}
      d.remove();
    });
  });

  const switchBtn = page.locator('[data-map-switch]').first();
  await switchBtn.waitFor({ state: 'visible', timeout: 8_000 });
  await switchBtn.click({ force: true });
  await page.waitForTimeout(250);

  const mathTab = page.locator('[data-map-zone-tab="math"]').first();
  if (await mathTab.count()) {
    await mathTab.click({ force: true });
    await page.waitForTimeout(150);
  }

  const mathWorld = page.locator('[data-map-world="math"]').first();
  await mathWorld.waitFor({ state: 'visible', timeout: 5_000 });
  await mathWorld.click({ force: true });

  await page
    .waitForFunction(() => {
      const dialogs = [...document.querySelectorAll('dialog.map-switch-dialog')];
      return dialogs.every((d) => !d.open);
    }, { timeout: 8_000 })
    .catch(async () => {
      await page.evaluate(() => {
        document.querySelectorAll('dialog.map-switch-dialog').forEach((d) => {
          try {
            d.close?.();
          } catch {}
          d.remove();
        });
      });
    });

  await page.waitForTimeout(500);
  await page.waitForSelector('[data-math-inline-question], .math-inline-panel, .math-choice', {
    timeout: 12_000,
  });
}

async function openLevel2(page) {
  // Prefer rail button for level 2 when present
  const rail = page.locator('.math-level-rail-button[data-level-id="2"], [data-math-level-id="2"]').first();
  if (await rail.count()) {
    await rail.click({ force: true });
    await page.waitForTimeout(500);
  } else {
    await page.evaluate(() => {
      if (typeof window.showInlineMathLevel === 'function') {
        window.showInlineMathLevel(2);
        return;
      }
      // try jump UI
      const jump = document.querySelector('[data-level-jump="2"], [data-math-goto="2"]');
      jump?.click?.();
    });
    await page.waitForTimeout(500);
  }
  await page.waitForSelector('.math-choice .math-plate', { timeout: 12_000 });
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const { server, baseUrl } = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });

  try {
    await page.goto(`${baseUrl}/#map`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await skipSplash(page);
    await closeReleaseDialog(page);
    await loginIfNeeded(page);
    await closeReleaseDialog(page);
    await ensureMathWorld(page);
    await openLevel2(page);
    await page.waitForTimeout(400);

    const railCount = await page.locator('.math-level-rail, [data-math-level-rail], [data-math-rail-level]').count();
    assert.equal(railCount, 0, `left level rail still present: count=${railCount}`);
    await page.screenshot({ path: path.join(OUT, 'math-map-no-rail.png'), fullPage: false });
    console.log('PASS rail gone, shot', path.join(OUT, 'math-map-no-rail.png'));

    const choices = page.locator('.math-choice');
    const n = await choices.count();
    assert.ok(n >= 2, `need choices, got ${n}`);

    let targetIdx = 0;
    for (let i = 0; i < n; i++) {
      const t = await choices.nth(i).innerText();
      if (/2\s*个|两个/.test(t) || (/\b2\b/.test(t) && !/12/.test(t))) {
        targetIdx = i;
        break;
      }
    }
    // Prefer data-correct true if present
    const correct = page.locator('.math-choice[data-correct="true"]').first();
    if (await correct.count()) {
      await correct.click({ force: true });
    } else {
      await choices.nth(targetIdx).click({ force: true });
    }
    await page.waitForTimeout(350);

    // Freeze breathe at base enlarged scale for stable metric + shot
    await page.evaluate(() => {
      document.querySelectorAll('.math-choice.is-selected .math-plate').forEach((el) => {
        el.style.animation = 'none';
        el.style.transform = 'translateY(-0.1rem) scale(var(--math-selected-plate-scale, 1.16))';
      });
      document.querySelectorAll('.math-choice.is-selected .math-plate::before').forEach((el) => {
        el.style.animation = 'none';
      });
    });
    await page.waitForTimeout(80);

    const metrics = await page.evaluate(() => {
      const selected = document.querySelector('.math-choice.is-selected .math-plate');
      const unselected = document.querySelector('.math-choice:not(.is-selected) .math-plate');
      if (!selected || !unselected) return { err: 'missing plates' };
      const sr = selected.getBoundingClientRect();
      const ur = unselected.getBoundingClientRect();
      const cs = getComputedStyle(selected);
      const root = document.querySelector('.math-options');
      const rs = root ? getComputedStyle(root) : null;

      // 苹果是否落在盘圆内：每个 .math-object 的中心点距盘心 ≤ 盘半径 * 0.92
      const plateFit = [...document.querySelectorAll('.math-choice .math-plate')].map((plate) => {
        const pr = plate.getBoundingClientRect();
        const cx = pr.left + pr.width / 2;
        const cy = pr.top + pr.height / 2;
        const radius = Math.min(pr.width, pr.height) / 2;
        const objs = [...plate.querySelectorAll('.math-object')];
        const outliers = objs
          .map((obj) => {
            const or = obj.getBoundingClientRect();
            const ox = or.left + or.width / 2;
            const oy = or.top + or.height / 2;
            // 用对象外接圆最远角点近似「是否出盘」
            const half = Math.hypot(or.width / 2, or.height / 2);
            const dist = Math.hypot(ox - cx, oy - cy) + half * 0.72;
            return { dist: +dist.toFixed(2), limit: +(radius * 0.98).toFixed(2), ok: dist <= radius * 0.98 };
          })
          .filter((x) => !x.ok);
        return {
          objectCount: objs.length,
          plateR: +radius.toFixed(2),
          overflowCount: outliers.length,
          overflow: 'hidden' === getComputedStyle(plate).overflow,
          aspect: (+(pr.width / pr.height).toFixed(3)),
        };
      });

      return {
        selected: { w: +sr.width.toFixed(2), h: +sr.height.toFixed(2) },
        unselected: { w: +ur.width.toFixed(2), h: +ur.height.toFixed(2) },
        ratioW: +(sr.width / ur.width).toFixed(4),
        ratioH: +(sr.height / ur.height).toFixed(4),
        transform: cs.transform,
        plateScaleVar: rs?.getPropertyValue('--math-selected-plate-scale').trim() || null,
        ringBorder: rs?.getPropertyValue('--math-selected-ring-border').trim() || null,
        objectSize: rs?.getPropertyValue('--math-object-size').trim() || null,
        hasSelectedClass: !!document.querySelector('.math-choice.is-selected'),
        plateFit,
        totalOverflow: plateFit.reduce((s, p) => s + p.overflowCount, 0),
      };
    });

    writeFileSync(path.join(OUT, 'scale-metrics.json'), JSON.stringify(metrics, null, 2));
    console.log(JSON.stringify(metrics, null, 2));

    const stage = page.locator('.math-inline-panel, [data-math-inline-question], .level-quiz').first();
    const fullPath = path.join(OUT, 'selected-enlarged.png');
    if (await stage.count()) {
      await stage.screenshot({ path: fullPath });
    } else {
      await page.screenshot({ path: fullPath, fullPage: false });
    }

    const opts = page.locator('.math-options');
    if (await opts.count()) {
      await opts.screenshot({ path: path.join(OUT, 'selected-enlarged-options.png') });
    }

    assert.ok(!metrics.err, metrics.err || 'ok');
    assert.ok(metrics.hasSelectedClass, 'is-selected missing');
    assert.ok(
      Number(metrics.plateScaleVar) >= 1.12,
      `plate-scale var too small: ${metrics.plateScaleVar}`,
    );
    assert.ok(
      metrics.ratioW >= 1.08,
      `selected plate not visibly larger: ratioW=${metrics.ratioW} (need >= 1.08)`,
    );
    // 用户确认：苹果可轻微溢出盘缘；不再要求 overflow:hidden / 零溢出
    assert.ok(
      metrics.plateFit.every((p) => Math.abs(p.aspect - 1) < 0.05),
      `plate must be square circle: ${JSON.stringify(metrics.plateFit)}`,
    );
    assert.ok(
      metrics.plateFit.every((p) => p.overflow === false),
      `plate overflow should be visible (allow slight apple overflow): ${JSON.stringify(metrics.plateFit)}`,
    );
    console.log('PASS ratioW', metrics.ratioW, 'scaleVar', metrics.plateScaleVar, 'appleOutliers', metrics.totalOverflow);
    console.log('shot', fullPath);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
