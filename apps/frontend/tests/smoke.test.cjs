/**
 * apps/frontend/tests/smoke.test.cjs
 * ─────────────────────────────────────────────────────────────────────────────
 * 浏览器烟测 — 验证现有 UI 在 mock/real 模式下正常加载且无致命错误
 *
 * 测试范围:
 *  1. 页面成功加载（HTTP 200）
 *  2. 无 JavaScript 致命错误（uncaught exception / unhandled rejection）
 *  3. 首关节点位于正确初始位置（routePoint(1) = {x:0, y:0} 不回退）
 *  4. 地图视图正确渲染
 *  5. 底部 Tab 导航存在
 *
 * 前置条件:
 *  - mock: mock server (3001) + Vite dev server (5173) 必须已启动
 *  - real:  backend server (3000) + Vite dev server (5173) 必须已启动
 *
 * 使用 Playwright（已安装于 root node_modules）。
 * ─────────────────────────────────────────────────────────────────────────────
 */
'use strict';

const { spawn } = require('child_process');
const assert = require('node:assert');
const http = require('http');

const PROGRESS_STORAGE_KEY = 'baby-island-preview-progress-v1';
const PREFERENCES_STORAGE_KEY = 'baby-island-app-preferences-v1';
const LEVEL_VIDEO_STORAGE_KEY = 'baby-island-level-videos-v1';

// ── Helpers ─────────────────────────────────────────────────────────

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForUrl(url, timeoutMs = 15_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const { status } = await httpGet(url);
      if (status === 200) return true;
    } catch { /* ignore */ }
    await sleep(500);
  }
  return false;
}

// ── 检查端口占用情况 ────────────────────────────────────────────────

/**
 * 检查指定端口是否被占用
 * 返回 { pid, cmd } 或 null
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    exec(`lsof -i :${port} -s TCP:LISTEN -t 2>/dev/null`, (err, stdout) => {
      if (err || !stdout.trim()) return resolve(null);
      const pid = parseInt(stdout.trim(), 10);
      if (!pid) return resolve(null);
      exec(`ps -p ${pid} -o comm= 2>/dev/null`, (e2, cmd) => {
        resolve({ pid, cmd: (cmd || '').trim() });
      });
    });
  });
}

// ── Playwright 烟测 ─────────────────────────────────────────────────

async function runPlaywrightSmoke(frontendUrl) {
  let playwright;
  try {
    playwright = require('playwright');
  } catch (e) {
    // playwright 可能安装在 root node_modules
    const rootPath = require('path').resolve(__dirname, '../../../node_modules/playwright');
    try { playwright = require(rootPath); }
    catch { /* still not found */ }
  }

  if (!playwright) {
    console.warn('[smoke] Playwright not found in apps/frontend or root node_modules — skipping browser test');
    return { passed: false, reason: 'Playwright not available' };
  }

  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  const consoleWarnings = [];
  const httpErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    if (msg.type() === 'warning') consoleWarnings.push(msg.text());
  });

  page.on('pageerror', err => {
    consoleErrors.push(`[pageerror] ${err.message}`);
  });

  page.on('unhandledrejection', err => {
    consoleErrors.push(`[unhandledrejection] ${err.reason}`);
  });
  page.on('response', response => {
    if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
  });

  // 当前构建为 1.0.1；用受控的远端版本 1.0.2 专门验证更新弹窗，
  // 避免把“当前版本已是最新”误判成启动失败。
  await page.route('**/app-release.json*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      latestVersion: '1.0.2',
      minSupportedVersion: '1.0.1',
      title: '发现新版本',
      message: '请前往 App Store 更新嗨洛塔。',
      storeName: 'App Store',
      updateUrl: 'https://apps.apple.com/cn/search?term=%E5%97%A8%E6%B4%9B%E5%A1%94',
    }),
  }));

  try {
    // ── 1. 页面加载 ──────────────────────────────────────────────────
    const response = await page.goto(frontendUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 20_000,
    });

    const status = response ? response.status() : 0;
    assert.strictEqual(
      status, 200,
      `页面加载失败，HTTP 状态码: ${status}`
    );
    console.info(`[smoke] ✓ 页面加载成功 (HTTP ${status})`);

    // ── 2. 等待 DOM 稳定 ─────────────────────────────────────────────
    await page.waitForTimeout(2_000);

    // ── 3. 检查 title ────────────────────────────────────────────────
    const title = await page.title();
    assert.ok(title.length > 0, '页面 title 不能为空');
    console.info(`[smoke] ✓ 页面 title: "${title}"`);

    // ── 4. 检查 #main-content 存在 ────────────────────────────────────
    const main = await page.$('#main-content');
    assert.ok(main, '#main-content 必须存在');
    console.info('[smoke] ✓ #main-content 存在');

    // 先完成强制登录门；更新弹窗会在登录弹窗之下，登录完成后再验证其关闭行为。
    const loginDialog = page.locator('dialog.login-dialog[open]');
    await loginDialog.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
    if (await loginDialog.isVisible().catch(() => false)) {
      await page.locator('[data-login-phone]').fill('13800138000');
      const sendCode = page.locator('[data-login-send-code]');
      if (await sendCode.count()) await sendCode.click();
      await page.locator('[data-login-code]').fill('1234');
      await page.locator('[data-login-submit]').click();
      await page.locator('dialog.login-dialog').waitFor({ state: 'detached', timeout: 8_000 });
      console.info('[smoke] ✓ 强制登录门可通过');
    }

    // ── 5. 启动必须检查发版更新并弹出提示，验证后关闭 ───────────────
    const releaseDialog = page.locator('.release-update-dialog[open]');
    await releaseDialog.waitFor({ state: 'visible', timeout: 5_000 });
    const releaseText = await releaseDialog.innerText();
    assert.ok(releaseText.includes('APP 版本更新'), '启动发版更新弹窗文案必须存在');
    assert.ok(releaseText.includes('当前版本 1.0.1'), '启动发版更新弹窗必须显示当前版本');
    assert.ok(releaseText.includes('最新版本 1.0.2'), '启动发版更新弹窗必须显示最新版本');
    await page.locator('[data-release-update-close]').first().click();
    await releaseDialog.waitFor({ state: 'hidden', timeout: 5_000 });
    console.info('[smoke] ✓ 启动发版更新弹窗可展示并关闭');

    // ── 6. 检查底部 Tab 导航 ─────────────────────────────────────────
    const tabs = await page.$$('[data-tab]');
    assert.ok(tabs.length >= 3, `底部 Tab 数量应为 3+，实际 ${tabs.length}`);
    console.info(`[smoke] ✓ 底部 Tab 数量: ${tabs.length}`);

    // ── 7. 检查地图视图是否渲染（检查 route-scroll 存在）──────────────
    const routeScroll = await page.$('[data-route-scroll]');
    if (routeScroll) {
      console.info('[smoke] ✓ 地图路线 route-scroll 存在');

      // ── 8. 首关位置验证 ─────────────────────────────────────────────
      // 检查第一个 level-stop 是否在视口内（检查元素存在 + 可见）
      const firstStop = await page.$('[data-stop="1"]');
      assert.ok(firstStop, '第 1 关节点必须存在 (data-stop="1")');

      const stopBox = await firstStop.boundingBox();
      assert.ok(stopBox, '第 1 关节点必须有 boundingBox');
      // 第一个节点应该在路线起点附近（x 位置应明显小于视口宽度的一半）
      const viewportWidth = page.viewportSize ? page.viewportSize().width : 375;
      assert.ok(
        stopBox.x < viewportWidth / 2,
        `第 1 关节点 x=${stopBox.x.toFixed(0)} 应小于视口宽度一半(${viewportWidth / 2}px)`
      );
      console.info(`[smoke] ✓ 第 1 关节点位置正确 x=${stopBox.x.toFixed(0)}, y=${stopBox.y.toFixed(0)} (视口宽度=${viewportWidth})`);

      // 检查 route-scroll 的初始滚动位置（应该定位到当前关卡）
      const scrollLeft = await page.evaluate(() => {
        const el = document.querySelector('[data-route-scroll]');
        return el ? el.scrollLeft : -1;
      });
      // unlockedThrough = 1 时，第一个节点应该在视口内
      console.info(`[smoke] ✓ route-scroll 初始 scrollLeft: ${scrollLeft}`);

      const level100AudioDisabled = await page.locator('[data-stop="100"] [data-speak-word]').isDisabled();
      const level101AudioDisabled = await page.locator('[data-stop="101"] [data-speak-word]').isDisabled();
      assert.strictEqual(level100AudioDisabled, false, '第 100 关已有本地 MP3，地图喇叭应可用');
      assert.strictEqual(level101AudioDisabled, false, '第 101 关已有本地 MP3，地图喇叭应可用');
      console.info('[smoke] ✓ 已生产本地 MP3 的地图喇叭可用');
    } else {
      // 可能需要先等待地图渲染
      console.warn('[smoke] ⚠ route-scroll 未找到，可能需要登录或等待渲染');
    }

    // ── 9. 当前 App Store 版本暴露稳定的认证 API 契约 ────────────────
    const apiContract = await page.evaluate(() => ({
      exists: typeof window.babyIslandApi !== 'undefined',
      checkSession: typeof window.babyIslandApi?.checkSession === 'function',
      verifyCode: typeof window.babyIslandApi?.verifyCode === 'function',
    }));
    assert.deepEqual(apiContract, { exists: true, checkSession: true, verifyCode: true });
    console.info('[smoke] ✓ 认证 API 契约已暴露');

    // ── 10. 第 11 关会员支付面板可以直接弹出 ────────────────────────
    await page.evaluate((progressKey) => {
      localStorage.setItem(progressKey, JSON.stringify({
        completed: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        unlockedThrough: 11,
      }));
      location.hash = '#map';
    }, PROGRESS_STORAGE_KEY);
    await page.waitForSelector('[data-level="11"]', { timeout: 5_000 });
    await page.locator('[data-level="11"]').click();
    const paywallDialog = page.locator('.paywall-dialog[open]');
    await paywallDialog.waitFor({ state: 'visible', timeout: 5_000 });
    const paywallText = await paywallDialog.innerText();
    assert.ok(paywallText.includes('本地图学习卡'), '本地图支付面板标题必须存在');
    assert.ok(paywallText.includes('立即支付 ¥99'), 'VIP 支付按钮必须存在');
    assert.ok(paywallText.includes('当前预览不会扣费'), 'H5 预览必须前置说明不会扣费');
    console.info('[smoke] ✓ 第 11 关直接弹出 VIP 支付面板');
    await page.locator('[data-vip-pay]').click();
    const payNote = await page.locator('[data-vip-pay-note]').innerText();
    assert.ok(payNote.includes('正式 iPad 包会打开 App Store 支付，当前预览不会扣费'), '点击支付后必须说明正式包支付边界');
    await page.locator('[data-paywall-close]').click();

    // ── 11. VIP 后第 11–13 关进入当前 iPad 下载等待态，不渲染空视频 ───
    await page.evaluate(({ progressKey, preferencesKey }) => {
      localStorage.setItem(progressKey, JSON.stringify({
        completed: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        unlockedThrough: 11,
      }));
      localStorage.setItem(preferencesKey, JSON.stringify({ vipActive: true }));
    }, { progressKey: PROGRESS_STORAGE_KEY, preferencesKey: PREFERENCES_STORAGE_KEY });
    await page.goto(`${frontendUrl}/?vip-paid11=1#level-11`, { waitUntil: 'domcontentloaded' });
    const releaseDialogAfterVip = page.locator('.release-update-dialog[open]');
    if (await releaseDialogAfterVip.count()) await page.locator('[data-release-update-close]').first().click();
    await page.locator('[data-stage-video]').waitFor({ state: 'visible', timeout: 5_000 });
    await page.waitForFunction((key) => {
      try {
        const states = JSON.parse(localStorage.getItem(key) || '{}');
        return states['ocean:11']?.status === 'not-installed'
          && String(states['ocean:11']?.downloadUrl || '').includes('level-011-apple.mp4');
      } catch { return false; }
    }, LEVEL_VIDEO_STORAGE_KEY, { timeout: 5_000 });
    assert.strictEqual(await page.locator('[data-video]').count(), 0, 'iPad 下载完成前不能渲染空视频播放器');
    assert.strictEqual(await page.locator('[data-level-video-download-panel]').count(), 1, 'VIP 后第 11 关必须展示下载等待态');

    await page.evaluate(({ progressKey }) => {
      localStorage.setItem(progressKey, JSON.stringify({
        completed: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        unlockedThrough: 12,
      }));
    }, { progressKey: PROGRESS_STORAGE_KEY });
    await page.goto(`${frontendUrl}/?vip-paid12=1#level-12`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-stage-video]').waitFor({ state: 'visible', timeout: 5_000 });
    await page.waitForFunction((key) => {
      try {
        const states = JSON.parse(localStorage.getItem(key) || '{}');
        return states['ocean:12']?.status === 'not-installed'
          && String(states['ocean:12']?.downloadUrl || '').includes('level-012-banana.mp4');
      } catch { return false; }
    }, LEVEL_VIDEO_STORAGE_KEY, { timeout: 5_000 });
    assert.strictEqual(await page.locator('[data-video]').count(), 0, 'iPad 下载完成前不能渲染空视频播放器');
    assert.strictEqual(await page.locator('[data-level-video-download-panel]').count(), 1, 'VIP 后第 12 关必须展示下载等待态');

    await page.evaluate(({ progressKey }) => {
      localStorage.setItem(progressKey, JSON.stringify({
        completed: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        unlockedThrough: 13,
      }));
    }, { progressKey: PROGRESS_STORAGE_KEY });
    await page.goto(`${frontendUrl}/?vip-content-check=1#level-13`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const unavailableText = await page.locator('body').innerText();
    await page.waitForFunction((key) => {
      try {
        const states = JSON.parse(localStorage.getItem(key) || '{}');
        return states['ocean:13']?.status === 'not-installed'
          && String(states['ocean:13']?.downloadUrl || '').includes('level-013-orange.mp4');
      } catch { return false; }
    }, LEVEL_VIDEO_STORAGE_KEY, { timeout: 5_000 });
    assert.ok(unavailableText.includes('课程内容更新中') || unavailableText.includes('后续课程内容会随更新开放') || await page.locator('[data-level-video-download-panel]').count() === 1, 'VIP 后访问付费关必须进入下载等待态');
    assert.strictEqual(await page.locator('[data-video]').count(), 0, 'iPad 下载完成前不能渲染空视频播放器');
    console.info('[smoke] ✓ VIP 后第 11–13 关进入下载等待态，不渲染空视频页');

    // ── 12. 检查无致命控制台错误 ─────────────────────────────────────
    const onlyExpectedStaticApiFailures = httpErrors.length > 0 && httpErrors.every(e => /\/api\//.test(e));
    const fatalErrors = consoleErrors.filter(e =>
      // 过滤已知的无害警告
      !e.includes('favicon') &&
      !e.includes('manifest') &&
      !e.includes('net::ERR_FILE_NOT_FOUND') && // file:// 场景的 manifest fetch 错误
      !e.includes('401') && // 未登录时 session 检查返回 401 — 预期行为
      !(onlyExpectedStaticApiFailures && /status of (404|501)/.test(e))
    );

    if (fatalErrors.length > 0) {
      console.error('[smoke] ✗ 控制台致命错误:');
      fatalErrors.forEach(e => console.error('  ', e));
      console.error('[smoke] HTTP 错误:');
      httpErrors.forEach(e => console.error('  ', e));
    }
    assert.strictEqual(fatalErrors.length, 0, '控制台不能有致命错误');

    console.info('[smoke] ✓ 无控制台致命错误');

    console.info('[smoke] ✓ 所有烟测检查通过');

    return { passed: true };

  } catch (err) {
    console.error('[smoke] ✗ 烟测失败:', err.message);
    return { passed: false, reason: err.message, errors: consoleErrors };
  } finally {
    await browser.close();
  }
}

// ── CLI 入口 ────────────────────────────────────────────────────────

async function main() {
  console.info('═'.repeat(60));
  console.info('  宝宝英语岛 — 浏览器烟测');
  console.info('═'.repeat(60));

  // 检查必要端口
  console.info('\n[smoke] 检查端口占用...');
  const checks = await Promise.all([
    checkPort(5173),
    checkPort(3001),
    checkPort(3000),
  ]);

  const vite = checks[0];
  const mock = checks[1];
  const real = checks[2];

  console.info(`  Vite  (5173): ${vite ? `PID=${vite.pid} (${vite.cmd})` : '未运行'}`);
  console.info(`  Mock  (3001): ${mock ? `PID=${mock.pid} (${mock.cmd})` : '未运行'}`);
  console.info(`  Real  (3000): ${real ? `PID=${real.pid} (${real.cmd})` : '未运行'}`);

  if (!vite) {
    console.error('\n[smoke] ✗ Vite dev server (5173) 未运行');
    console.error('         请先启动: npm run dev:mock  或  npm run dev:real');
    process.exit(1);
  }

  const frontendUrl = 'http://localhost:5173';

  // 等待 Vite 真正就绪
  console.info(`\n[smoke] 等待 Vite (${frontendUrl}) 就绪...`);
  const ready = await waitForUrl(frontendUrl, 10_000);
  if (!ready) {
    console.error(`[smoke] ✗ Vite 未在 ${frontendUrl} 就绪`);
    process.exit(1);
  }
  console.info(`[smoke] ✓ Vite 已就绪`);

  // 打印测试配置信息
  console.info(`\n[smoke] 测试模式: ${mock ? 'mock (3001)' : real ? 'real (3000)' : 'unknown'}`);
  console.info(`[smoke] Frontend URL: ${frontendUrl}\n`);

  // 运行烟测
  const result = await runPlaywrightSmoke(frontendUrl);

  // ── 资源清理提示 ─────────────────────────────────────────────────
  console.info('\n[smoke] 端口/进程状态（烟测结束时）:');
  const endChecks = await Promise.all([
    checkPort(5173),
    checkPort(3001),
    checkPort(3000),
    checkPort(5432),
  ]);
  const names = ['Vite 5173', 'Mock 3001', 'Real 3000', 'DB 5432'];
  for (let i = 0; i < endChecks.length; i++) {
    const c = endChecks[i];
    console.info(`  ${names[i]}: ${c ? `PID=${c.pid}` : '空闲'}`);
  }

  console.info('═'.repeat(60));

  if (!result.passed) {
    console.error(`[smoke] ✗ 烟测失败: ${result.reason}`);
    if (result.errors) result.errors.forEach(e => console.error('  ', e));
    process.exit(1);
  }

  console.info('[smoke] ✓ 烟测全部通过');
  process.exit(0);
}

main().catch(err => {
  console.error('[smoke] ✗ 烟测异常:', err.message);
  process.exit(1);
});
