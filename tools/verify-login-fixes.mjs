#!/usr/bin/env node
/**
 * 验证四项终检修复的 Playwright 测试
 * 
 * 1. 移动端付费弹窗不受登录样式污染
 * 2. 登录弹窗底部贴合（底部 sheet）
 * 3. 验证码发送按钮在输入容器右侧
 * 4. Esc 关闭清倒计时
 */

import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, statSync } from 'fs';
import { resolve, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

let passed = 0;
let failed = 0;

function ok(desc) { passed++; console.log(`${GREEN}  ✓ ${desc}${RESET}`); }
function fail(desc, err) { failed++; console.log(`${RED}  ✗ ${desc}${RESET}`); if (err) console.log(`    ${err.message || err}`); }
function heading(text) { console.log(`\n${CYAN}═══ ${text} ═══${RESET}`); }

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.webp': 'image/webp', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg',
};

let server;
let PORT;

function startServer() {
  return new Promise((resolve2, reject) => {
    server = createServer((req, res) => {
      const url = new URL(req.url, `http://127.0.0.1:${PORT || 0}`);
      const pathname = url.pathname;

      // Mock API endpoints first
      if (pathname.startsWith('/api/')) {
        res.setHeader('Content-Type', 'application/json');
        if (pathname === '/api/health') {
          res.end(JSON.stringify({ status: 'ok' }));
          return;
        }
        if (pathname === '/api/auth/send-code') {
          let body = '';
          req.on('data', c => body += c);
          req.on('end', () => {
            res.end(JSON.stringify({ success: true, debugCode: '123456', message: '验证码已发送' }));
          });
          return;
        }
        if (pathname === '/api/auth/verify-code') {
          let body = '';
          req.on('data', c => body += c);
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (data.code === '123456') {
                res.end(JSON.stringify({ success: true, token: 'mock-token-abc123', user: { hasFullAccess: false } }));
              } else {
                res.statusCode = 401;
                res.end(JSON.stringify({ error: '验证码错误' }));
              }
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid request' }));
            }
          });
          return;
        }
        if (pathname === '/api/auth/session') {
          res.statusCode = 401;
          res.end(JSON.stringify({ error: '未登录' }));
          return;
        }
        if (pathname === '/api/auth/logout') {
          res.end(JSON.stringify({ success: true }));
          return;
        }
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Not found' }));
        return;
      }

      // Static files
      let filePath = resolve(ROOT, pathname.slice(1) || 'index.html');
      try {
        const stat = statSync(filePath);
        if (!stat.isFile()) throw new Error('Not file');
        const ext = extname(filePath).toLowerCase();
        res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
        res.end(readFileSync(filePath));
      } catch {
        res.statusCode = 404;
        res.end('Not found');
      }
    });
    server.listen(0, '127.0.0.1', () => {
      PORT = server.address().port;
      console.log(`  ${YELLOW}  测试服务器: http://127.0.0.1:${PORT}${RESET}`);
      resolve2();
    });
  });
}

async function main() {
  console.log(`\n${YELLOW}🔍 登录弹窗四项修复验证${RESET}`);
  console.log(`   ${new Date().toISOString()}`);
  console.log(`   ${'-'.repeat(50)}`);

  await startServer();
  const BASE = `http://127.0.0.1:${PORT}`;

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const pageErrors = [];

  try {
    // ═══════════════════════════════════════════════════════
    // FIX 1: 移动端付费弹窗不受登录样式污染
    // ═══════════════════════════════════════════════════════
    heading('Fix 1: 移动端付费弹窗不受登录样式污染');

    const ctx1 = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
    const p1 = await ctx1.newPage();
    p1.on('pageerror', e => pageErrors.push(`[Fix1] ${e.message}`));
    p1.on('console', msg => {
      if (msg.type() === 'error') pageErrors.push(`[Fix1 console.error] ${msg.text()}`);
    });

    await p1.goto(BASE, { waitUntil: 'domcontentloaded' });
    // Wait for the script to run and render the map
    await p1.waitForFunction(() => {
      return document.querySelector('[data-level]');
    }, { timeout: 10000 });

    ok('页面加载完成，地图已渲染');

    // Open login dialog via JS
    await p1.evaluate(() => {
      document.querySelector('[data-level="6"]').click();
    });
    await p1.waitForTimeout(500);

    const loginOpen = await p1.$('[data-access-dialog][open]');
    if (loginOpen) {
      ok('移动390×844: 登录弹窗已打开');

      const kindActive = await p1.evaluate(() => document.querySelector('[data-access-dialog]').dataset.kindActive);
      if (kindActive === 'login') ok('弹窗 data-kind-active="login"');
      else fail('data-kind-active 不正确', { message: `got: ${kindActive}` });

      // Bottom sheet: dialog should be near bottom
      const dlgBox = await loginOpen.boundingBox();
      if (dlgBox && dlgBox.y + dlgBox.height >= 840) {
        ok(`登录弹窗底部贴合: bottom=${Math.round(dlgBox.y + dlgBox.height)}`);
      } else {
        fail(`登录弹窗未底部贴合`, { message: `y=${dlgBox?.y}, h=${dlgBox?.height}` });
      }

      // Card bottom-radius = 0
      const br = await p1.evaluate(() => getComputedStyle(document.querySelector('.access-dialog-card')).borderBottomLeftRadius);
      if (br === '0px') ok('登录卡片底部圆角=0');
      else fail(`登录卡片底部圆角=${br}`);

      await p1.screenshot({ path: resolve(ROOT, 'tools', 'fix1-login-mobile.png') });
      ok('截图: fix1-login-mobile.png');
    } else {
      fail('登录弹窗未打开');
    }

    // Close login dialog
    await p1.evaluate(() => { const d = document.querySelector('[data-access-dialog]'); if (d?.open) d.close(); });
    await p1.waitForTimeout(300);

    // Open payment dialog
    await p1.evaluate(() => {
      const content = document.querySelector('[data-access-dialog-content]');
      const dialog = document.querySelector('[data-access-dialog]');
      content.dataset.kind = 'payment';
      dialog.dataset.kindActive = 'payment';
      content.innerHTML = `
        <button class="access-dialog-close" type="button" data-access-close aria-label="关闭">
          <svg aria-hidden="true" viewBox="0 0 32 32"><path d="m9 9 14 14M23 9 9 23"/></svg>
        </button>
        <div class="access-hero premium" aria-hidden="true">
          <svg class="access-hero-svg" viewBox="0 0 72 72"><path d="M21 31V20c0-10 6-16 15-16s15 6 15 16v11"/><rect x="10" y="29" width="52" height="36" rx="13"/><path d="M36 43v10"/><circle cx="36" cy="42" r="4"/></svg>
        </div>
        <p class="eyebrow">PARENT ACCESS</p>
        <h2>请家长来解锁</h2>
        <p class="access-dialog-description">前 5 关免费。</p>
        <div class="access-dialog-actions">
          <button class="access-primary-button" type="button">家长解锁</button>
          <button class="access-secondary-button" type="button" data-access-close>先复习前 5 关</button>
        </div>
      `;
      if (!dialog.open) dialog.showModal();
    });
    await p1.waitForTimeout(500);

    const payOpen = await p1.$('[data-access-dialog][open]');
    if (payOpen) {
      const payBox = await payOpen.boundingBox();

      // Width check: should NOT be full-width (390px)
      if (payBox.width < 380) {
        ok(`付费弹窗宽度未被登录样式污染: ${Math.round(payBox.width)}px`);
      } else {
        fail(`付费弹窗宽度被登录样式污染: ${Math.round(payBox.width)}px ≈ 全宽`);
      }

      // Hero exists
      const hero = await p1.$('.access-hero.premium');
      if (hero) {
        const heroBox = await hero.boundingBox();
        if (heroBox && heroBox.width > 50) ok(`付费弹窗 hero: ${Math.round(heroBox.width)}×${Math.round(heroBox.height)}px`);
        else fail('hero 过小');
      } else fail('缺少 .access-hero.premium');

      // Border preserved (thick border from base style)
      const borderWidth = await p1.evaluate(() => getComputedStyle(document.querySelector('.access-dialog-card')).borderTopWidth);
      if (borderWidth === '3.52px' || parseFloat(borderWidth) > 2) {
        ok(`付费弹窗保持原始粗边框: ${borderWidth}`);
      } else {
        fail(`付费弹窗边框被登录样式覆盖: ${borderWidth}`);
      }

      // Centered vertically (not bottom-sheet)
      const center = payBox.y + payBox.height / 2;
      if (Math.abs(center - 422) < 300) {
        ok(`付费弹窗居中: center Y≈${Math.round(center)}`);
      } else {
        fail(`付费弹窗未居中: center Y=${Math.round(center)}`);
      }

      await p1.screenshot({ path: resolve(ROOT, 'tools', 'fix1-payment-mobile.png') });
      ok('截图: fix1-payment-mobile.png');
    } else {
      fail('付费弹窗未打开');
    }

    await p1.close();
    await ctx1.close();

    // ═══════════════════════════════════════════════════════
    // FIX 2: 底部 sheet 定位（390×844 和 320px）
    // ═══════════════════════════════════════════════════════
    heading('Fix 2: 底部 sheet 定位验证');

    for (const [w, h, label] of [[390, 844, '390x844'], [320, 568, '320x568']]) {
      const ctx2 = await browser.newContext({ viewport: { width: w, height: h }, locale: 'zh-CN' });
      const p2 = await ctx2.newPage();
      p2.on('pageerror', e => pageErrors.push(`[Fix2-${label}] ${e.message}`));
      await p2.goto(BASE, { waitUntil: 'domcontentloaded' });
      await p2.waitForFunction(() => document.querySelector('[data-level]'), { timeout: 10000 });
      await p2.evaluate(() => document.querySelector('[data-level="6"]').click());
      await p2.waitForTimeout(500);

      const dlg = await p2.$('[data-access-dialog][open]');
      if (dlg) {
        const box = await dlg.boundingBox();
        if (box.y + box.height >= h - 5) {
          ok(`${label}: 底部贴合 (bottom=${Math.round(box.y + box.height)})`);
        } else {
          fail(`${label}: 未底部贴合 (bottom=${Math.round(box.y + box.height)}, expected≈${h})`);
        }

        const card = await p2.$('.access-dialog-card[data-kind="login"]');
        if (card) {
          const cBox = await card.boundingBox();
          const topSpace = h - cBox.height;
          if (topSpace > 40) ok(`${label}: 海岛背景可见 (${Math.round(topSpace)}px 顶部空间)`);
          else fail(`${label}: 卡片过高 (${Math.round(topSpace)}px 顶部)`);

          const noOverflow = await p2.evaluate(() => {
            const c = document.querySelector('.access-dialog-card[data-kind="login"]');
            return c.scrollWidth <= c.clientWidth;
          });
          if (noOverflow) ok(`${label}: 无横向溢出`);
          else fail(`${label}: 横向溢出`);
        }
        await p2.screenshot({ path: resolve(ROOT, 'tools', `fix2-${label}.png`) });
        ok(`截图: fix2-${label}.png`);
      } else {
        fail(`${label}: 登录弹窗未打开`);
      }
      await p2.close();
      await ctx2.close();
    }

    // ═══════════════════════════════════════════════════════
    // FIX 3: 发送按钮在输入容器右侧
    // ═══════════════════════════════════════════════════════
    heading('Fix 3: 验证码发送控件在输入容器右侧');

    const ctx3 = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
    const p3 = await ctx3.newPage();
    p3.on('pageerror', e => pageErrors.push(`[Fix3] ${e.message}`));
    await p3.goto(BASE, { waitUntil: 'domcontentloaded' });
    await p3.waitForFunction(() => document.querySelector('[data-level]'), { timeout: 10000 });
    await p3.evaluate(() => document.querySelector('[data-level="6"]').click());
    await p3.waitForTimeout(500);

    // Send button inside input group
    const sendInGroup = await p3.evaluate(() => {
      const btn = document.querySelector('[data-sms-send]');
      const group = document.querySelector('.sms-login-input-group-code');
      if (!btn || !group) return { found: false };
      return { found: true, isInside: group.contains(btn), parentClass: btn.parentElement.className };
    });
    if (sendInGroup.found && sendInGroup.isInside) {
      ok('发送按钮在 .sms-login-input-group-code 内');
    } else {
      fail('发送按钮不在输入容器内', { message: JSON.stringify(sendInGroup) });
    }

    // Button right of input
    const posInfo = await p3.evaluate(() => {
      const input = document.querySelector('[data-sms-code]');
      const btn = document.querySelector('[data-sms-send]');
      if (!input || !btn) return null;
      const ir = input.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      return { inputRight: ir.right, btnLeft: br.left, isRight: br.left >= ir.right - 5 };
    });
    if (posInfo?.isRight) {
      ok(`发送按钮在输入右侧 (input R=${Math.round(posInfo.inputRight)}, btn L=${Math.round(posInfo.btnLeft)})`);
    } else {
      fail('发送按钮不在输入右侧', { message: JSON.stringify(posInfo) });
    }

    // Data attributes preserved
    const attrs = await p3.evaluate(() => {
      const btn = document.querySelector('[data-sms-send]');
      return { has: btn.hasAttribute('data-sms-send'), tag: btn.tagName, type: btn.type, aria: btn.getAttribute('aria-label') };
    });
    if (attrs.has && attrs.tag === 'BUTTON') {
      ok(`data-sms-send 保留, tag=${attrs.tag}, type=${attrs.type}, aria=${attrs.aria}`);
    } else {
      fail('属性丢失', { message: JSON.stringify(attrs) });
    }

    // Text-level style (no big border)
    const btnStyle = await p3.evaluate(() => {
      const cs = getComputedStyle(document.querySelector('[data-sms-send]'));
      return { border: cs.borderTopWidth, bg: cs.backgroundColor };
    });
    if (btnStyle.border === '0px' || btnStyle.border === '0') {
      ok('发送按钮为文字级样式 (无边框)');
    } else {
      fail(`发送按钮有边框: ${btnStyle.border}`);
    }

    // 320px - input usable
    const ctx3b = await browser.newContext({ viewport: { width: 320, height: 568 }, locale: 'zh-CN' });
    const p3b = await ctx3b.newPage();
    await p3b.goto(BASE, { waitUntil: 'domcontentloaded' });
    await p3b.waitForFunction(() => document.querySelector('[data-level]'), { timeout: 10000 });
    await p3b.evaluate(() => document.querySelector('[data-level="6"]').click());
    await p3b.waitForTimeout(500);
    const iw = await p3b.evaluate(() => {
      const input = document.querySelector('[data-sms-code]');
      return input ? input.getBoundingClientRect().width : 0;
    });
    if (iw > 50) ok(`320px 验证码输入可用 (${Math.round(iw)}px)`);
    else fail(`320px 验证码输入被压缩 (${Math.round(iw)}px)`);

    await p3.screenshot({ path: resolve(ROOT, 'tools', 'fix3-send-button.png') });
    await p3b.screenshot({ path: resolve(ROOT, 'tools', 'fix3-320px.png') });
    await p3b.close(); await ctx3b.close();
    await p3.close(); await ctx3.close();

    // ═══════════════════════════════════════════════════════
    // FIX 4: Esc 关闭清倒计时
    // ═══════════════════════════════════════════════════════
    heading('Fix 4: 所有关闭路径清理倒计时');

    const ctx4 = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
    const p4 = await ctx4.newPage();
    p4.on('pageerror', e => pageErrors.push(`[Fix4] ${e.message}`));
    await p4.goto(BASE, { waitUntil: 'domcontentloaded' });
    await p4.waitForFunction(() => document.querySelector('[data-level]'), { timeout: 10000 });

    // Helper: open dialog, fill phone, send code, check countdown via button text
    async function setupCountdown(page) {
      await page.evaluate(() => document.querySelector('[data-level="6"]').click());
      await page.waitForTimeout(500);
      await page.fill('[data-sms-phone]', '13800138000');
      await page.waitForTimeout(300);
      await page.click('[data-sms-send]');
      await page.waitForTimeout(1000);
      // Observable: button text shows countdown (e.g. "重新发送 (58s)")
      const btnText = await page.$eval('[data-sms-send]', el => el.textContent);
      const isCountingDown = /\d+s\)/.test(btnText);
      return { btnText, isCountingDown };
    }

    // Helper: check if countdown has stopped (button shows "获取验证码" and is enabled)
    async function isCountdownCleared(page) {
      const info = await page.evaluate(() => {
        const btn = document.querySelector('[data-sms-send]');
        const dialog = document.querySelector('[data-access-dialog]');
        return {
          btnText: btn ? btn.textContent : null,
          btnDisabled: btn ? btn.disabled : null,
          dialogOpen: dialog ? dialog.open : null,
          // Check for countdown pattern
          hasCountdown: btn ? /\d+s\)/.test(btn.textContent) : false,
        };
      });
      return info;
    }

    // 4a: Esc
    heading('4a. Esc 关闭');
    let s4a = await setupCountdown(p4);
    if (s4a.isCountingDown) ok(`倒计时运行: ${s4a.btnText}`);
    else fail('倒计时未启动', { message: s4a.btnText });

    await p4.keyboard.press('Escape');
    await p4.waitForTimeout(300);
    const after4a = await isCountdownCleared(p4);
    if (!after4a.dialogOpen && !after4a.hasCountdown) ok('Esc 后弹窗关闭、倒计时已清理');
    else fail('Esc 后未清理', { message: JSON.stringify(after4a) });

    // 4b: Close button
    heading('4b. 关闭按钮');
    let s4b = await setupCountdown(p4);
    if (s4b.isCountingDown) ok(`倒计时运行: ${s4b.btnText}`);
    await p4.click('.access-dialog-close');
    await p4.waitForTimeout(300);
    const after4b = await isCountdownCleared(p4);
    if (!after4b.dialogOpen && !after4b.hasCountdown) ok('关闭按钮后弹窗关闭、倒计时已清理');
    else fail('关闭按钮后未清理', { message: JSON.stringify(after4b) });

    // 4c: "暂不登录"
    heading('4c. 暂不登录');
    let s4c = await setupCountdown(p4);
    if (s4c.isCountingDown) ok(`倒计时运行: ${s4c.btnText}`);
    await p4.click('.access-text-button');
    await p4.waitForTimeout(300);
    const after4c = await isCountdownCleared(p4);
    if (!after4c.dialogOpen && !after4c.hasCountdown) ok('"暂不登录"后弹窗关闭、倒计时已清理');
    else fail('"暂不登录"后未清理', { message: JSON.stringify(after4c) });

    // 4d: Backdrop click
    heading('4d. 遮罩点击');
    let s4d = await setupCountdown(p4);
    if (s4d.isCountingDown) ok(`倒计时运行: ${s4d.btnText}`);
    // Dispatch click on dialog element itself (backdrop)
    await p4.evaluate(() => {
      const dialog = document.querySelector('[data-access-dialog]');
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'target', { value: dialog, writable: false });
      dialog.dispatchEvent(event);
    });
    await p4.waitForTimeout(300);
    const after4d = await isCountdownCleared(p4);
    if (!after4d.dialogOpen && !after4d.hasCountdown) ok('遮罩点击后弹窗关闭、倒计时已清理');
    else fail('遮罩点击后未清理', { message: JSON.stringify(after4d) });

    // 4e: Login success
    heading('4e. 登录成功');
    await p4.evaluate(() => document.querySelector('[data-level="6"]').click());
    await p4.waitForTimeout(500);
    await p4.fill('[data-sms-phone]', '13800138000');
    await p4.waitForTimeout(300);
    await p4.click('[data-sms-send]');
    await p4.waitForTimeout(1000);
    const s4e = await p4.evaluate(() => {
      const btn = document.querySelector('[data-sms-send]');
      return { btnText: btn?.textContent, hasCD: /\d+s\)/.test(btn?.textContent || '') };
    });
    if (s4e.hasCD) ok(`倒计时运行: ${s4e.btnText}`);
    await p4.fill('[data-sms-code]', '123456');
    await p4.waitForTimeout(300);
    await p4.evaluate(() => {
      const form = document.querySelector('[data-sms-login-form]');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
    await p4.waitForTimeout(1500);
    const after4e = await isCountdownCleared(p4);
    if (!after4e.hasCountdown) ok('登录成功后倒计时已清理');
    else fail('登录成功后倒计时未清理', { message: JSON.stringify(after4e) });

    await p4.close(); await ctx4.close();

    // ═══════════════════════════════════════════════════════
    // 桌面对照
    // ═══════════════════════════════════════════════════════
    heading('桌面对照: 登录+付费弹窗');

    const ctxD = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'zh-CN' });
    const pD = await ctxD.newPage();
    pD.on('pageerror', e => pageErrors.push(`[Desktop] ${e.message}`));
    await pD.goto(BASE, { waitUntil: 'domcontentloaded' });
    await pD.waitForFunction(() => document.querySelector('[data-level]'), { timeout: 10000 });

    // Desktop login
    await pD.evaluate(() => document.querySelector('[data-level="6"]').click());
    await pD.waitForTimeout(500);
    const dLogin = await pD.$('[data-access-dialog][open]');
    if (dLogin) {
      const dBox = await dLogin.boundingBox();
      if (dBox.width < 600) ok(`桌面登录弹窗: ${Math.round(dBox.width)}px (非全宽)`);
      else fail(`桌面登录弹窗过宽: ${Math.round(dBox.width)}px`);
      await pD.screenshot({ path: resolve(ROOT, 'tools', 'fix-desktop-login.png') });
      ok('截图: fix-desktop-login.png');
    }

    // Close and open payment
    await pD.evaluate(() => { const d = document.querySelector('[data-access-dialog]'); if (d?.open) d.close(); });
    await pD.waitForTimeout(300);
    await pD.evaluate(() => {
      const content = document.querySelector('[data-access-dialog-content]');
      const dialog = document.querySelector('[data-access-dialog]');
      content.dataset.kind = 'payment';
      dialog.dataset.kindActive = 'payment';
      content.innerHTML = `
        <button class="access-dialog-close" type="button" data-access-close><svg viewBox="0 0 32 32"><path d="m9 9 14 14M23 9 9 23"/></svg></button>
        <div class="access-hero premium" aria-hidden="true"><svg class="access-hero-svg" viewBox="0 0 72 72"><path d="M21 31V20c0-10 6-16 15-16s15 6 15 16v11"/><rect x="10" y="29" width="52" height="36" rx="13"/></svg></div>
        <p class="eyebrow">PARENT ACCESS</p><h2>请家长来解锁</h2><p class="access-dialog-description">前5关免费</p>
        <div class="access-dialog-actions"><button class="access-primary-button" type="button">家长解锁</button><button class="access-secondary-button" type="button" data-access-close>先复习</button></div>
      `;
      if (!dialog.open) dialog.showModal();
    });
    await pD.waitForTimeout(500);
    const dPay = await pD.$('[data-access-dialog][open]');
    if (dPay) {
      await pD.screenshot({ path: resolve(ROOT, 'tools', 'fix-desktop-payment.png') });
      ok('截图: fix-desktop-payment.png');
    }

    await pD.close(); await ctxD.close();

    // ═══════════════════════════════════════════════════════
    // JS pageerror 检查
    // ═══════════════════════════════════════════════════════
    heading('JS 错误检查');
    if (pageErrors.length === 0) {
      ok('无 JS pageerror');
    } else {
      fail(`${pageErrors.length} 个 JS 错误:`);
      pageErrors.forEach(e => console.log(`    ${e}`));
    }

  } catch (err) {
    console.error(`${RED}Fatal:${RESET}`, err.message);
    failed++;
  } finally {
    await browser.close();
    if (server) server.close();
  }

  console.log(`\n${CYAN}═══ 验证结果 ═══${RESET}`);
  console.log(`  ${GREEN}通过: ${passed}${RESET}`);
  if (failed > 0) console.log(`  ${RED}失败: ${failed}${RESET}`);
  console.log(`  共执行: ${passed + failed} 项\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
