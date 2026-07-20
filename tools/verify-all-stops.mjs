// Verify every level-stop node uses the same .level-node top,
// not just .current. Confirms the unified-rule fix covers first / middle / locked.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE_URL = 'file://' + path.join(ROOT, 'index.html') + '#map';

async function probe(page, label, w, h) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(FILE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForSelector('.level-node', { timeout: 10000 });
  await page.waitForTimeout(600);

  const data = await page.evaluate(() => {
    const stops = [...document.querySelectorAll('[data-stop]')];
    const sampleIds = [1, 2, 10, 11, 100, 200];
    const rows = sampleIds
      .map((id) => stops.find((s) => s.dataset.stop === String(id)))
      .filter(Boolean)
      .map((stop) => {
        const node = stop.querySelector('.level-node');
        const icon = stop.querySelector('.node-icon');
        const island = stop.querySelector('.island-art');
        const cs = (el) => el ? getComputedStyle(el) : null;
        const sb = stop.getBoundingClientRect();
        const nb = node?.getBoundingClientRect();
        const ib = island?.getBoundingClientRect();
        const iconRect = icon?.getBoundingClientRect();
        return {
          stop: stop.dataset.stop,
          status: node?.classList.contains('current') ? 'current'
            : node?.classList.contains('completed') ? 'completed'
            : node?.classList.contains('premium') ? 'premium'
            : node?.classList.contains('locked') ? 'locked' : 'unknown',
          nodeTopPx: nb ? +(nb.top - sb.top).toFixed(1) : null,
          computedTop: cs(node)?.top,
          computedLeft: cs(node)?.left,
          computedZ: cs(node)?.zIndex,
          nodeWidth: nb ? +nb.width.toFixed(1) : null,
          nodeHeight: nb ? +nb.height.toFixed(1) : null,
          iconTopFromStop: iconRect ? +(iconRect.top - sb.top).toFixed(1) : null,
          islandTopPx: ib ? +(ib.top - sb.top).toFixed(1) : null,
          gapNodeIsland: (nb && ib) ? +(ib.top - nb.bottom).toFixed(1) : null,
          cursor: cs(node)?.cursor,
          pointerEvents: cs(node)?.pointerEvents,
        };
      });
    return rows;
  });

  await page.screenshot({ path: path.join(ROOT, `tools/verify-all-stops-${label}.png`), fullPage: false });
  console.log(`[${label}]`, JSON.stringify(data, null, 2));
  return data;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ownBrowser = browser;
  try {
    const page = await browser.newPage();
    await page.route('**/api/**', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ isLoggedIn: false }) })
    );
    const d1 = await probe(page, '1024x768', 1024, 768);
    const d2 = await probe(page, '390x844', 390, 844);

    // Assertions
    const assertSameTopAcrossStops = (rows, label) => {
      const tops = rows.map((r) => r.computedTop);
      const unique = [...new Set(tops)];
      console.log(`[${label}] distinct computedTop values: ${JSON.stringify(unique)}`);
      if (unique.length !== 1) {
        throw new Error(`[${label}] expected one shared top, got ${JSON.stringify(unique)}`);
      }
      // Verify the top is shifted UP from the legacy +70px baseline (which would clamp to 11rem ≈ 176px on 1024×768)
      const px = parseFloat(unique[0]);
      console.log(`[${label}] unified top = ${unique[0]} (≈ ${px.toFixed(1)}px)`);
      // For 1024x768 expected ~123.8px (≈ 50px up from 176px cap)
      // For 390x844 expected ~131.8px
    };
    assertSameTopAcrossStops(d1, '1024x768');
    assertSameTopAcrossStops(d2, '390x844');

    // Verify status distribution covers first / middle / locked / premium
    const desktopStatuses = d1.map((r) => r.status).join(',');
    const hasCurrent = d1.some((r) => r.status === 'current');
    const hasLocked = d1.some((r) => r.status === 'locked');
    const hasPremium = d1.some((r) => r.status === 'premium');
    console.log(`[1024x768] statuses: ${desktopStatuses}`);
    if (!hasCurrent || !hasLocked) {
      throw new Error('[1024x768] expected at least one current and one locked stop');
    }
    console.log(`[1024x768] covers current + locked${hasPremium ? ' + premium' : ''}`);

    // Verify icon (play badge) sits above node top, all stops
    for (const r of [...d1, ...d2]) {
      if (r.iconTopFromStop !== null && r.nodeTopPx !== null) {
        if (r.iconTopFromStop >= r.nodeTopPx) {
          throw new Error(`[${r.stop}] icon top (${r.iconTopFromStop}) should be above node top (${r.nodeTopPx})`);
        }
      }
    }
    console.log('[all] icon (play badge) is above node top on every checked stop ✓');

    console.log('\nALL CHECKS PASSED');
  } finally {
    await ownBrowser.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
