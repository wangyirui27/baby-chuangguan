// e2e test: open page in headless browser via preview server and verify login works
import { chromium } from '/Users/yr/宝宝闯关/apps/frontend/node_modules/playwright/index.mjs';

const URL = 'http://127.0.0.1:4173/';

const browser = await chromium.launch();
const page = await browser.newPage();

const networkLog = [];
page.on('request', (req) => networkLog.push(`>> ${req.method()} ${req.url()}`));
page.on('response', (res) => networkLog.push(`<< ${res.status()} ${res.url()} (${res.headers()['content-type'] || ''})`));

const consoleLog = [];
page.on('console', (msg) => consoleLog.push(`[${msg.type()}] ${msg.text()}`));

console.log(`Opening ${URL}`);
await page.goto(URL, { waitUntil: 'networkidle' });
console.log('Page loaded.');

// First click a level button (level 6+) to trigger the login dialog
console.log('Clicking a level to trigger the login dialog...');
const levelButtons = page.locator('[data-level]');
const levelCount = await levelButtons.count();
console.log(`Found ${levelCount} level buttons`);

if (levelCount > 0) {
  // Click the last level (most likely to be locked)
  await levelButtons.nth(levelCount - 1).click({ force: true });
  await page.waitForTimeout(1500);
}

console.log('Typing phone=11111111111, code=1234...');
const phoneInput = page.locator('input[data-sms-phone]').first();
const codeInput = page.locator('input[data-sms-code]').first();
await phoneInput.fill('11111111111');
await codeInput.fill('1234');

console.log('Clicking 登录并继续...');
const submitButton = page.locator('[data-sms-submit]').first();
await submitButton.click();

// Wait a bit for the response to be processed
await page.waitForTimeout(2000);

const errorEl = page.locator('[data-sms-error]');
const isVisible = await errorEl.isVisible().catch(() => false);
const errorText = isVisible ? await errorEl.textContent() : '(not visible)';
console.log(`Error message: "${errorText}"`);

// Check if login was successful by looking at the state
const state = await page.evaluate(() => {
  // Try to find any indicators of successful login
  const dialog = document.querySelector('[data-access-dialog]');
  return {
    dialogOpen: dialog ? dialog.hasAttribute('open') : null,
  };
});
console.log('Dialog state:', JSON.stringify(state));

console.log('\n=== Network Log ===');
networkLog.forEach((l) => console.log(l));

console.log('\n=== Console Log ===');
consoleLog.forEach((l) => console.log(l));

await browser.close();
