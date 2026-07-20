import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const URL = process.env.FRONTEND_URL || 'http://localhost:5173/#map';
const VIEWPORTS = [
  { width: 1024, height: 577, name: '1024x577' },
  { width: 390, height: 844, name: '390x844' },
];

async function closeReleaseDialog(page) {
  const close = page.locator('[data-release-update-close]').first();
  if (await close.count()) await close.click();
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: vp,
      deviceScaleFactor: 2,
    });

    // Mock session API to return logged-in user so map renders fully
    await context.route('**/api/auth/session', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isLoggedIn: true,
          user: { hasFullAccess: true, phone: '13800138000' },
        }),
      });
    });

    await context.addInitScript(() => {
      localStorage.setItem('baby-island-preview-progress-v1', JSON.stringify({
        completed: Array.from({ length: 42 }, (_, i) => i + 1),
        unlockedThrough: 43,
      }));
      localStorage.setItem('baby-island-app-preferences-v1', JSON.stringify({
        vipActive: true,
      }));
    });

    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    await closeReleaseDialog(page);
    await page.waitForTimeout(3000);

    // Take full-page screenshot
    await page.screenshot({
      path: path.join(ROOT, `pinchtab-${vp.name}.png`),
      fullPage: true,
    });
    console.log(`Captured ${vp.name}`);

    // Debug: locate button
    const locateBtn = await page.$('[data-locate-progress]');
    if (locateBtn) {
      const box = await locateBtn.boundingBox();
      const visible = await locateBtn.isVisible();
      const zIndex = await locateBtn.evaluate(el => getComputedStyle(el).zIndex);
      const pos = await locateBtn.evaluate(el => getComputedStyle(el).position);
      console.log(`  locate-btn: visible=${visible}, pos=${pos}, zIdx=${zIndex}`);
      console.log(`    rect: ${JSON.stringify(box)}`);

      // Verify clickable
      const clickable = await locateBtn.evaluate(el => {
        const rect = el.getBoundingClientRect();
        const center = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
        const topEl = document.elementFromPoint(center.x, center.y);
        return topEl === el || el.contains(topEl);
      });
      console.log(`  locate-btn clickable from center: ${clickable}`);
    } else {
      console.log(`  locate-btn NOT FOUND`);
    }

    // Debug: topbar structure
    const topbar = await page.$('.map-topbar');
    if (topbar) {
      const rect = await topbar.boundingBox();
      console.log(`  topbar rect: ${JSON.stringify(rect)}`);
    } else {
      console.log(`  .map-topbar NOT FOUND`);
    }

    // Debug: journey-compact
    const journey = await page.$('.journey-compact');
    if (journey) {
      const rect = await journey.boundingBox();
      console.log(`  journey-compact rect: ${JSON.stringify(rect)}`);
      const badge = await journey.$('.j-badge');
      const pearls = await journey.$('.j-pearls');
      const next = await journey.$('.j-next');
      console.log(`  journey parts: badge=${Boolean(badge)} pearls=${Boolean(pearls)} next=${Boolean(next)}`);
    } else {
      console.log(`  .journey-compact NOT FOUND`);
    }

    // Debug: route-scroll height
    const routeScroll = await page.$('[data-route-scroll]');
    if (routeScroll) {
      const rect = await routeScroll.boundingBox();
      console.log(`  route-scroll rect: ${JSON.stringify(rect)}`);
    }

    await context.close();
  }

  await browser.close();
  console.log('Screenshots complete.');
}

main().catch(err => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
