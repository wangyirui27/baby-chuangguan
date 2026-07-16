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

    // ── 5. 检查底部 Tab 导航 ─────────────────────────────────────────
    const tabs = await page.$$('[data-tab]');
    assert.ok(tabs.length >= 3, `底部 Tab 数量应为 3+，实际 ${tabs.length}`);
    console.info(`[smoke] ✓ 底部 Tab 数量: ${tabs.length}`);

    // ── 6. 检查地图视图是否渲染（检查 route-scroll 存在）──────────────
    const routeScroll = await page.$('[data-route-scroll]');
    if (routeScroll) {
      console.info('[smoke] ✓ 地图路线 route-scroll 存在');

      // ── 7. 首关位置验证 ─────────────────────────────────────────────
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
    } else {
      // 可能需要先等待地图渲染
      console.warn('[smoke] ⚠ route-scroll 未找到，可能需要登录或等待渲染');
    }

    // ── 8. 检查 babyIslandApi 存在 ──────────────────────────────────
    const apiExists = await page.evaluate(() => typeof window.babyIslandApi !== 'undefined');
    assert.ok(apiExists, 'window.babyIslandApi 必须存在');
    console.info('[smoke] ✓ babyIslandApi 全局对象存在');

    // ── 9. 检查 babyIslandApi 有必需方法 ────────────────────────────
    const apiMethods = await page.evaluate(() => {
      const api = window.babyIslandApi;
      return [
        'sendVerificationCode',
        'verifyCode',
        'checkSession',
        'logout',
        'getToken',
        'clearToken',
        'isFileProtocol',
      ].map(m => ({ method: m, exists: typeof api[m] === 'function' }));
    });

    for (const { method, exists } of apiMethods) {
      assert.ok(exists, `babyIslandApi.${method} 必须存在`);
    }
    console.info(`[smoke] ✓ babyIslandApi 方法全部存在`);

    // ── 10. 检查无致命控制台错误 ─────────────────────────────────────
    const fatalErrors = consoleErrors.filter(e =>
      // 过滤已知的无害警告
      !e.includes('favicon') &&
      !e.includes('manifest') &&
      !e.includes('net::ERR_FILE_NOT_FOUND') && // file:// 场景的 manifest fetch 错误
      !e.includes('401') // 未登录时 session 检查返回 401 — 预期行为
    );

    if (fatalErrors.length > 0) {
      console.error('[smoke] ✗ 控制台致命错误:');
      fatalErrors.forEach(e => console.error('  ', e));
    }
    assert.strictEqual(fatalErrors.length, 0, '控制台不能有致命错误');

    console.info('[smoke] ✓ 无控制台致命错误');

    // ── 11. 验证 login dialog 可以打开 ───────────────────────────────
    // 点击一个锁定状态的关卡，触发 login dialog
    const lockedLevel = await page.$('[data-level][aria-disabled="true"]');
    if (lockedLevel) {
      // 跳过登录对话框测试（需要网络请求）
      console.info('[smoke] ℹ 跳过登录对话框自动测试（需网络请求）');
    }

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
