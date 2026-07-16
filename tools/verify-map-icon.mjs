// PinchTab-independent verification: headless Playwright (no user Chrome)
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const PORT = 9999;

const MIME = {
  '.html': 'text/html;charset=utf-8',
  '.css': 'text/css;charset=utf-8',
  '.js': 'application/javascript;charset=utf-8',
  '.json': 'application/json;charset=utf-8',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

const server = createServer((req, res) => {
  // Strip query string from path
  const pathname = req.url.split('?')[0];
  let filePath = pathname === '/' ? join(ROOT, 'index.html') : join(ROOT, pathname);
  const ext = extname(filePath);
  try {
    const content = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

async function verifyIcon(page, label) {
  // Check map-switch button exists
  const btn = page.locator('[data-map-switch]');
  await btn.waitFor({ state: 'visible', timeout: 5000 });

  // Check button dimensions
  const box = await btn.boundingBox();
  if (!box) throw new Error(`[${label}] map-switch button not found`);
  const w = Math.round(box.width);
  const h = Math.round(box.height);
  console.log(`  [${label}] button dimensions: ${w}x${h}`);
  if (w < 40 || h < 40) throw new Error(`[${label}] button too small: ${w}x${h} (expected ~44)`);

  // Check SVG inside button is visible
  const svg = btn.locator('svg');
  const svgCount = await svg.count();
  console.log(`  [${label}] SVGs inside button: ${svgCount}`);
  if (svgCount < 1) throw new Error(`[${label}] no SVG found in button`);

  // Verify SVG has viewBox 1024 (new icon)
  const vb = await svg.getAttribute('viewBox');
  console.log(`  [${label}] SVG viewBox: ${vb}`);
  if (vb !== '0 0 1024 1024') throw new Error(`[${label}] unexpected viewBox "${vb}" (expected "0 0 1024 1024")`);

  // Verify aria-label and title
  const ariaLabel = await btn.getAttribute('aria-label');
  const title = await btn.getAttribute('title');
  console.log(`  [${label}] aria-label="${ariaLabel}" title="${title}"`);
  if (ariaLabel !== '切换地图') throw new Error(`[${label}] wrong aria-label: "${ariaLabel}"`);
  if (title !== '切换地图') throw new Error(`[${label}] wrong title: "${title}"`);

  // Check SVG is not cropped: SVG should be inside button bounds
  const svgBox = await svg.boundingBox();
  if (svgBox) {
    console.log(`  [${label}] SVG box: ${Math.round(svgBox.width)}x${Math.round(svgBox.height)} at (${Math.round(svgBox.x)},${Math.round(svgBox.y)})`);
    const inside = svgBox.x >= box.x && svgBox.y >= box.y &&
      (svgBox.x + svgBox.width) <= (box.x + box.width) &&
      (svgBox.y + svgBox.height) <= (box.y + box.height);
    console.log(`  [${label}] SVG inside button: ${inside}`);
  }

  return btn;
}

async function run() {
  server.listen(PORT);
  console.log(`Server listening on http://localhost:${PORT}`);

  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    // Test 1: 1024x577 (tablet landscape)
    console.log('\n=== Viewport 1024×577 ===');
    const ctx1 = await browser.newContext({ viewport: { width: 1024, height: 577 } });
    const page1 = await ctx1.newPage();
    // Mock API to avoid timeout and abort external fonts
    await page1.route('**/api/auth/session', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ isLoggedIn: false }) });
    });
    await page1.route('**/api/**', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await page1.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
    await page1.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle', timeout: 10000 });
    await page1.waitForTimeout(1000);
    await verifyIcon(page1, '1024x577');
    // Take screenshot
    await page1.screenshot({ path: 'pinchtab-1024x577-mapicon.png', fullPage: false });
    console.log('  [1024x577] screenshot saved');

    // Click the map-switch button to open dialog
    const btn1 = page1.locator('[data-map-switch]');
    await btn1.click();
    await page1.waitForTimeout(500);

    // Check dialog opened (dialog is created with showModal, check open property)
    const dialogOpen = await page1.evaluate(() => {
      const d = document.querySelector('.map-switch-dialog');
      return d ? d.open : false;
    });
    console.log(`  [1024x577] dialog open property: ${dialogOpen}`);
    await page1.screenshot({ path: 'pinchtab-1024x577-dialog.png', fullPage: false });
    console.log('  [1024x577] dialog screenshot saved');

    // Close dialog via "知道了" button (second data-map-switch-close element)
    const closeBtn = page1.locator('[data-map-switch-close]').last();
    await closeBtn.click();
    await page1.waitForTimeout(300);
    const dialogClosed = await page1.evaluate(() => {
      const d = document.querySelector('.map-switch-dialog');
      return d ? !d.open : true;
    });
    console.log(`  [1024x577] dialog closed after close button: ${dialogClosed}`);

    results.push({ viewport: '1024x577', dialogOpened: dialogOpen, dialogClosed: dialogClosed });
    await ctx1.close();

    // Test 2: 390x844 (mobile)
    console.log('\n=== Viewport 390×844 ===');
    const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page2 = await ctx2.newPage();
    await page2.route('**/api/auth/session', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ isLoggedIn: false }) });
    });
    await page2.route('**/api/**', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await page2.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
    await page2.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle', timeout: 10000 });
    await page2.waitForTimeout(1000);
    await verifyIcon(page2, '390x844');
    await page2.screenshot({ path: 'pinchtab-390x844-mapicon.png', fullPage: false });
    console.log('  [390x844] screenshot saved');

    // Click and check dialog
    const btn2 = page2.locator('[data-map-switch]');
    await btn2.click();
    await page2.waitForTimeout(500);
    const dialog2Open = await page2.evaluate(() => {
      const d = document.querySelector('.map-switch-dialog');
      return d ? d.open : false;
    });
    console.log(`  [390x844] dialog open property: ${dialog2Open}`);
    await page2.screenshot({ path: 'pinchtab-390x844-dialog.png', fullPage: false });
    console.log('  [390x844] dialog screenshot saved');

    // Close via "知道了" button
    const closeBtn2 = page2.locator('[data-map-switch-close]').last();
    await closeBtn2.click();
    await page2.waitForTimeout(300);
    const dialog2Closed = await page2.evaluate(() => {
      const d = document.querySelector('.map-switch-dialog');
      return d ? !d.open : true;
    });
    console.log(`  [390x844] dialog closed after close button: ${dialog2Closed}`);

    results.push({ viewport: '390x844', dialogOpened: dialog2Open, dialogClosed: dialog2Closed });
    await ctx2.close();
  } finally {
    await browser.close();
    server.close();
  }

  // Report
  console.log('\n========================================');
  console.log('VERIFICATION RESULTS');
  console.log('========================================');
  for (const r of results) {
    console.log(`  ${r.viewport}: dialog opened=${r.dialogOpened}, dialog closed=${r.dialogClosed}`);
    if (!r.dialogOpened) throw new Error(`FAIL: ${r.viewport} - dialog did not open`);
    if (!r.dialogClosed) throw new Error(`FAIL: ${r.viewport} - dialog did not close`);
  }
  console.log('\nAll checks passed ✓');
}

run().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
