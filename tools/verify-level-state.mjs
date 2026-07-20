import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE_URL = 'file://' + path.join(ROOT, 'index.html') + '#map';

async function checkViewport(page, label, w, h) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(FILE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForSelector('.level-state-text.current', { state: 'attached', timeout: 10000 });
  await page.waitForTimeout(800);
  const state = page.locator('.level-state-text.current').first();
  const node = page.locator('.level-node.current').first();
  const text = await state.locator('small').textContent();
  const aria = await state.getAttribute('aria-label');
  const display = await state.evaluate(el => getComputedStyle(el).display);
  const nodeClickable = await node.isEnabled();
  await page.screenshot({ path: path.join(ROOT, `tools/level-state-${label}.png`), fullPage: false });
  console.log(`[${label}] status="${text?.trim()}" aria="${aria}" display=${display} nodeEnabled=${nodeClickable}`);
  return text?.includes('学习中') && aria?.includes('学习中') && display === 'none' && nodeClickable;
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
