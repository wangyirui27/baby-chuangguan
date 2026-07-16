import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE_URL = 'file://' + path.join(ROOT, 'index.html') + '#map';

async function measure(page, label, w, h) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(FILE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForSelector('.level-node.current', { timeout: 10000 });
  await page.waitForTimeout(800);
  const data = await page.evaluate(() => {
    const stop = document.querySelector('[data-stop]');
    const node = document.querySelector('.level-node.current');
    const island = stop?.querySelector('.island-art');
    const icon = node?.querySelector('.node-icon');
    const scroll = document.querySelector('.route-scroll');
    const stage = document.querySelector('.route-stage');
    const rect = (el) => el ? el.getBoundingClientRect() : null;
    const cs = (el) => el ? getComputedStyle(el) : null;
    const sb = rect(stop), nb = rect(node), ib = rect(island), scb = rect(scroll), stb = rect(stage);
    const ncs = cs(node), scs = cs(stop);
    return {
      stopH: sb?.height, stopW: sb?.width,
      nodeTopPx: nb ? nb.top - sb.top : null,
      nodeTopPct: sb && nb ? ((nb.top - sb.top) / sb.height * 100).toFixed(1) : null,
      nodeBottomPx: nb ? nb.bottom - sb.top : null,
      islandTopPx: ib ? ib.top - sb.top : null,
      islandTopPct: sb && ib ? ((ib.top - sb.top) / sb.height * 100).toFixed(1) : null,
      gapNodeIsland: ib && nb ? (ib.top - nb.bottom).toFixed(1) : null,
      computedTop: ncs?.top,
      scrollH: scb?.height,
      stagePadTop: cs(stage)?.paddingTop,
      nodeFromScrollTop: scb && nb ? (nb.top - scb.top).toFixed(1) : null,
      iconTop: rect(icon) ? (rect(icon).top - sb.top).toFixed(1) : null,
      stopPos: scs?.position,
    };
  });
  await page.screenshot({ path: path.join(ROOT, `tools/measure-${label}.png`), fullPage: false });
  console.log(`[${label}]`, JSON.stringify(data, null, 2));
  return data;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ isLoggedIn: false }) }));
    await measure(page, '1024x768', 1024, 768);
    await measure(page, '390x844', 390, 844);
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
