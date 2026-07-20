import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

try {
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Page loaded:', page.url());
  await page.waitForTimeout(1000);
  
  // Click ranking tab and wait for title
  await page.click('button[data-tab="ranking"]');
  await page.waitForSelector('#ranking-title', { timeout: 5000 });
  await page.waitForTimeout(1500);
  
  // Scroll to ensure full view
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  
  const title = await page.title();
  console.log('Page title:', title);
  
  await page.screenshot({ path: '/Users/yr/宝宝闯关/screenshots/before-leaderboard.jpg', fullPage: true, type: 'jpeg', quality: 90 });
  console.log('Screenshot saved');
} catch (e) {
  console.error('Error:', e.message);
  await page.screenshot({ path: '/Users/yr/宝宝闯关/screenshots/error.jpg', fullPage: true });
} finally {
  await browser.close();
}
