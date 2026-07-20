import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();

try {
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: '/Users/yr/宝宝闯关/screenshots/portrait-verify.png',
    fullPage: true,
  });
  console.log('Portrait screenshot saved');
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await browser.close();
}
