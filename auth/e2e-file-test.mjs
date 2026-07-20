// e2e test: open page via file:// and verify login works
import { chromium } from '/Users/yr/宝宝闯关/apps/frontend/node_modules/playwright/index.mjs';

const FILE_URL = 'file:///Users/yr/宝宝闯关/index.html';

const browser = await chromium.launch();
const page = await browser.newPage();

const networkLog = [];
page.on('request', (req) => networkLog.push(`>> ${req.method()} ${req.url()}`));
page.on('response', (res) => networkLog.push(`<< ${res.status()} ${res.url()} (${res.headers()['content-type'] || ''})`));
page.on('requestfailed', (req) => networkLog.push(`!! FAIL: ${req.method()} ${req.url()} (${req.failure()?.errorText})`));

console.log(`Opening ${FILE_URL}`);
await page.goto(FILE_URL, { waitUntil: 'networkidle' });
console.log('Page loaded.');

console.log('Typing phone=11111111111, code=1234...');
const phoneInput = page.locator('input[data-sms-phone]').first();
const codeInput = page.locator('input[data-sms-code]').first();
await phoneInput.fill('11111111111');
await codeInput.fill('1234');

console.log('Clicking 登录并继续...');
const submitButton = page.locator('[data-sms-submit]').first();
await submitButton.click();

await page.waitForTimeout(2000);

const errorEl = page.locator('[data-sms-error]');
const isVisible = await errorEl.isVisible().catch(() => false);
const errorText = isVisible ? await errorEl.textContent() : '(not visible)';
console.log(`Error message: "${errorText}"`);

console.log('\n=== Network Log (last 20) ===');
networkLog.slice(-20).forEach((l) => console.log(l));

await browser.close();
