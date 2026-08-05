import { createReadStream, existsSync, mkdirSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'screenshots', 'map-bgm-toggle');
const APP_PREFERENCES_KEY = 'baby-island-app-preferences-v1';
const STATE_KEYS = ['baobao_chuangguan_state_v1', 'baby_island_progress_v1'];
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json',
};
function startStaticServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      const rel = urlPath === '/' ? '/index.html' : urlPath;
      const filePath = path.join(ROOT, rel.replace(/^\//, ''));
      if (!filePath.startsWith(ROOT) || !existsSync(filePath)) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
      createReadStream(filePath).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, baseUrl: `http://127.0.0.1:${server.address().port}` }));
  });
}
async function skipSplash(page) {
  const skip = page.locator('#splash-skip-btn, .splash-skip');
  if (await skip.count()) await skip.first().click({ force: true }).catch(() => {});
  await page.waitForSelector('#app-splash', { state: 'detached', timeout: 8_000 }).catch(() => {});
  await page.evaluate(() => document.getElementById('app-splash')?.remove());
}
async function loginIfNeeded(page) {
  const dialog = page.locator('dialog.login-dialog');
  try { await dialog.waitFor({ state: 'visible', timeout: 4_000 }); } catch { return; }
  await page.locator('[data-login-phone]').fill('13800138000');
  const send = page.locator('[data-login-send-code]');
  if (await send.count()) await send.click();
  await page.locator('[data-login-code]').fill('1234');
  await page.locator('[data-login-submit]').click();
  await page.waitForSelector('dialog.login-dialog', { state: 'detached', timeout: 10_000 });
}
async function seedProgress(page) {
  await page.evaluate(({ prefsKey, stateKeys }) => {
    const unlock = {
      version: 1,
      user: { id: 'shot', displayName: 'shot', isVip: true },
      progressByWorld: {
        desert: { unlockedLevelId: 200, completedLevelIds: [], starsByLevelId: {} },
        ocean: { unlockedLevelId: 200, completedLevelIds: [], starsByLevelId: {} },
        math: { unlockedLevelId: 200, completedLevelIds: [1], starsByLevelId: { 1: 3 } },
      },
      preferences: { mapWorld: 'math', soundEnabled: true, musicEnabled: false },
    };
    for (const k of stateKeys) {
      try { localStorage.setItem(k, JSON.stringify(unlock)); } catch {}
    }
    const prev = JSON.parse(localStorage.getItem(prefsKey) || '{}');
    prev.mapWorld = 'math';
    prev.mapMusic = false;
    localStorage.setItem(prefsKey, JSON.stringify(prev));
  }, { prefsKey: APP_PREFERENCES_KEY, stateKeys: STATE_KEYS });
}

const { server, baseUrl } = await startStaticServer();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
mkdirSync(OUT, { recursive: true });

await page.goto(`${baseUrl}/#map`, { waitUntil: 'domcontentloaded', timeout: 30000 });
await skipSplash(page);
await loginIfNeeded(page);
await seedProgress(page);
// force reload so prefs + unlocked state apply
await page.goto(`${baseUrl}/#map`, { waitUntil: 'domcontentloaded', timeout: 30000 });
await skipSplash(page);
await page.waitForTimeout(600);

// switch to math if needed
const switchBtn = page.locator('[data-map-switch]').first();
if (await switchBtn.count()) {
  await switchBtn.click({ force: true }).catch(() => {});
  await page.waitForTimeout(250);
  const mathWorld = page.locator('[data-map-world=\"math\"]').first();
  if (await mathWorld.count()) await mathWorld.click({ force: true });
  await page.waitForTimeout(500);
}

// wait music button
await page.waitForSelector('[data-map-music-toggle]', { timeout: 12000 });
await page.evaluate(() => {
  const btn = document.querySelector('[data-map-music-toggle]');
  if (btn && !btn.classList.contains('is-muted')) btn.click();
});
await page.waitForTimeout(400);

const styles = await page.evaluate(() => {
  const el = document.querySelector('[data-map-music-toggle]');
  const cs = getComputedStyle(el);
  const after = getComputedStyle(el, '::after');
  return {
    muted: el.classList.contains('is-muted'),
    bg: cs.backgroundColor,
    color: cs.color,
    border: cs.borderTopColor,
    afterContent: after.content,
    afterBg: after.backgroundColor,
    afterColor: after.color,
    fontSize: after.fontSize,
  };
});
console.log('MUTED', JSON.stringify(styles, null, 2));
const full = path.join(OUT, 'math-music-muted-loud-v1.png');
await page.screenshot({ path: full, fullPage: false });
const box = await page.locator('.map-fab-cluster').boundingBox();
if (box) {
  await page.screenshot({
    path: path.join(OUT, 'math-music-muted-fab-crop-v1.png'),
    clip: {
      x: Math.max(0, box.x - 70),
      y: Math.max(0, box.y - 90),
      width: Math.min(1180 - Math.max(0, box.x - 70), box.width + 140),
      height: Math.min(820 - Math.max(0, box.y - 90), box.height + 150),
    },
  });
}
// ON state
await page.locator('[data-map-music-toggle]').click({ force: true });
await page.waitForTimeout(350);
const onStyles = await page.evaluate(() => {
  const el = document.querySelector('[data-map-music-toggle]');
  const cs = getComputedStyle(el);
  const after = getComputedStyle(el, '::after');
  return { muted: el.classList.contains('is-muted'), bg: cs.backgroundColor, afterContent: after.content };
});
console.log('ON', JSON.stringify(onStyles));
await page.screenshot({ path: path.join(OUT, 'math-music-on-loud-v1.png'), fullPage: false });
const box2 = await page.locator('.map-fab-cluster').boundingBox();
if (box2) {
  await page.screenshot({
    path: path.join(OUT, 'math-music-on-fab-crop-v1.png'),
    clip: {
      x: Math.max(0, box2.x - 70),
      y: Math.max(0, box2.y - 40),
      width: Math.min(1180 - Math.max(0, box2.x - 70), box2.width + 140),
      height: Math.min(820 - Math.max(0, box2.y - 40), box2.height + 80),
    },
  });
}
console.log('ok', full);
await browser.close();
server.close();
