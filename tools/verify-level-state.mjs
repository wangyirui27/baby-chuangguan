import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE_URL = 'file://' + path.join(ROOT, 'index.html') + '#map';

async function checkViewport(page, label, w, h) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(FILE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForSelector('.level-state-text.current', { timeout: 10000 });
  await page.waitForTimeout(800);
  const state = page.locator('.level-state-text.current').first();
  const name = page.locator('.level-name').first();
  const node = page.locator('.level-node.current').first();
  const stop = page.locator('[data-stop]').first();
  const sb = await stop.boundingBox();
  const stb = await state.boundingBox();
  const nb = await name.boundingBox();
  const text = await state.locator('small').textContent();
  const leftOfCenter = stb && sb ? stb.x + stb.width / 2 < sb.x + sb.width / 2 : false;
  const shoreZone = stb && sb ? stb.y > sb.y + sb.height * 0.55 : false;
  const noOverlapName = stb && nb ? (stb.y + stb.height < nb.y || stb.x + stb.width < nb.x || stb.x > nb.x + nb.width) : true;
  const nodeClickable = await node.isEnabled();
  await page.screenshot({ path: path.join(ROOT, `tools/level-state-${label}.png`), fullPage: false });
  console.log(`[${label}] status="${text?.trim()}" pos=${stb ? `${Math.round(stb.x)},${Math.round(stb.y)} ${Math.round(stb.width)}x${Math.round(stb.height)}` : 'null'}`);
  console.log(`[${label}] leftOfCenter=${leftOfCenter} shoreZone=${shoreZone} noOverlapHello=${noOverlapName} nodeEnabled=${nodeClickable}`);
  return leftOfCenter && shoreZone && noOverlapName && text?.includes('学习中') && nodeClickable;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.route('**/api/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ isLoggedIn: false }) }));
  const d1 = await checkViewport(page, '1024x577', 1024, 577);
  const d2 = await checkViewport(page, '390x844', 390, 844);
  await browser.close();
  console.log(`RESULT desktop=${d1} mobile=${d2}`);
  process.exit(d1 && d2 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
