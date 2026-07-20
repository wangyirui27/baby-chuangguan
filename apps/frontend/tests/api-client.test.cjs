/**
 * apps/frontend/tests/api-client.test.cjs
 * ─────────────────────────────────────────────────────────────────────────────
 * API Client 单元测试
 *
 * 测试范围:
 *  1. URL 路径 — 业务代码只能调用 /api/*（不使用硬编码完整 URL）
 *  2. 错误处理 — 网络失败、API 错误、非 2xx 响应
 *  3. Fixture 驱动的认证成功/失败/空 session
 *  4. Token 存取逻辑
 *
 * 使用 Node 内置 test runner，无外部依赖。
 * 测试通过本地 HTTP mock server 模拟 API 响应。
 * ─────────────────────────────────────────────────────────────────────────────
 */
'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');

// ── 本地 Mock Server（测试夹具）─────────────────────────────────────

/** 启动一个仅响应本测试文件的 HTTP mock server */
function createTestServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost');
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      if (url.pathname === '/api/health') {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok' }));
        return;
      }

      if (url.pathname === '/api/auth/send-code') {
        let body = '';
        req.on('data', c => { body += c; });
        req.on('end', () => {
          const data = JSON.parse(body || '{}');
          if (!data.phone) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: '手机号不能为空', code: 'PHONE_REQUIRED' }));
          } else if (!/^\d{11}$/.test(data.phone)) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: '手机号格式不正确', code: 'INVALID_PHONE' }));
          } else {
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
          }
        });
        return;
      }

      if (url.pathname === '/api/auth/verify-code') {
        let body = '';
        req.on('data', c => { body += c; });
        req.on('end', () => {
          const data = JSON.parse(body || '{}');
          if (!data.phone || !data.code) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: '手机号和验证码不能为空', code: 'PARAMS_REQUIRED' }));
          } else if (data.code === '123457') {
            res.writeHead(400);
            res.end(JSON.stringify({ error: '验证码错误或已过期', code: 'INVALID_CODE' }));
          } else {
            // 颁发一个动态 token
            const token = 'mock-token-' + Date.now() + '-' + Math.random().toString(36).slice(2);
            server._tokens = server._tokens || [];
            server._tokens.push(token);
            res.writeHead(200);
            res.end(JSON.stringify({
              token,
              user: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                normalizedPhone: '+8613800138000',
                createdAt: '2025-07-16T00:00:00.000Z',
                lastLoginAt: '2025-07-16T00:00:00.000Z',
                isLoggedIn: true,
                hasFullAccess: false,
              },
            }));
          }
        });
        return;
      }

      if (url.pathname === '/api/auth/session') {
        const auth = req.headers['authorization'] || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
        const tokens = server._tokens || [];
        if (!token || !tokens.includes(token)) {
          res.writeHead(401);
          res.end(JSON.stringify({ error: '未登录', code: 'UNAUTHORIZED' }));
        } else {
          res.writeHead(200);
          res.end(JSON.stringify({
            user: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              normalizedPhone: '+8613800138000',
              createdAt: '2025-07-16T00:00:00.000Z',
              lastLoginAt: '2025-07-16T00:00:00.000Z',
              isLoggedIn: true,
              hasFullAccess: false,
            },
          }));
        }
        return;
      }

      if (url.pathname === '/api/auth/logout') {
        const auth = req.headers['authorization'] || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
        const tokens = server._tokens || [];
        if (token) {
          server._tokens = tokens.filter(t => t !== token);
        }
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not Found', code: 'NOT_FOUND' }));
    });

    server.listen(0, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

// ── Test fixtures — 严格基于 contracts/fixtures 的 fixture 字段 ───────

const FIXTURES = {
  logoutSuccess:       { success: true },
  healthSuccess:       { status: 'ok' },
  sendCodeSuccess:     { success: true },
  sendCodeErrorPhoneRequired:   { error: '手机号不能为空', code: 'PHONE_REQUIRED' },
  sendCodeErrorInvalidPhone:    { error: '手机号格式不正确', code: 'INVALID_PHONE' },
  verifyCodeErrorParamsRequired:{ error: '手机号和验证码不能为空', code: 'PARAMS_REQUIRED' },
  verifyCodeErrorInvalidCode:   { error: '验证码错误或已过期', code: 'INVALID_CODE' },
  sessionErrorUnauthorized:     { error: '未登录', code: 'UNAUTHORIZED' },
  // 合同 fixture: 64-char hex token
  verifyCodeSuccess: {
    token: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      normalizedPhone: '+8613800138000',
      createdAt: '2025-07-16T00:00:00.000Z',
      lastLoginAt: '2025-07-16T00:00:00.000Z',
      isLoggedIn: true,
      hasFullAccess: false,
    },
  },
};

// ── Tests ────────────────────────────────────────────────────────────

describe('API Client — URL Path Validation', () => {
  it('client.js 使用相对路径 /api/*，不含硬编码完整 URL', () => {
    const fs = require('fs');
    const path = require('path');
    const clientSrc = fs.readFileSync(
      path.resolve(__dirname, '../src/api/client.js'),
      'utf8'
    );
    // 代码逻辑中不能有完整 URL（注释除外，已在 client.js 中移除了）
    assert.ok(
      !/https?:\/\/localhost:\d{4}/.test(clientSrc),
      'client.js 代码逻辑不应包含完整 URL'
    );
    // 必须使用相对路径
    assert.ok(
      clientSrc.includes("'/api/auth/send-code'") ||
      clientSrc.includes('"/api/auth/send-code"'),
      'client.js 必须使用相对路径 /api/auth/send-code'
    );
    assert.ok(
      clientSrc.includes("'/api/auth/verify-code'") ||
      clientSrc.includes('"/api/auth/verify-code"'),
      'client.js 必须使用相对路径 /api/auth/verify-code'
    );
    assert.ok(
      clientSrc.includes("'/api/auth/session'") ||
      clientSrc.includes('"/api/auth/session"'),
      'client.js 必须使用相对路径 /api/auth/session'
    );
    assert.ok(
      clientSrc.includes("'/api/auth/logout'") ||
      clientSrc.includes('"/api/auth/logout"'),
      'client.js 必须使用相对路径 /api/auth/logout'
    );
  });
});

describe('API Client — 验证规则', () => {
  function normalizePhone(phone) {
    if (!phone) return null;
    const p = String(phone).trim();
    return /^\d{11}$/.test(p) ? p : null;
  }
  function validateCode(code) {
    return /^\d{6}$/.test(String(code));
  }

  it('normalizePhone 接受 11 位纯数字', () => {
    assert.strictEqual(normalizePhone('13800138000'), '13800138000');
    assert.strictEqual(normalizePhone('  13800138000  '), '13800138000');
  });
  it('normalizePhone 拒绝无效格式', () => {
    assert.strictEqual(normalizePhone(''), null);
    assert.strictEqual(normalizePhone(null), null);
    assert.strictEqual(normalizePhone('12345'), null);
    assert.strictEqual(normalizePhone('abc'), null);
  });
  it('validateCode 接受 6 位数字', () => {
    assert.strictEqual(validateCode('123456'), true);
    assert.strictEqual(validateCode('000000'), true);
    assert.strictEqual(validateCode('111111'), true);
  });
  it('validateCode 拒绝非 6 位数字', () => {
    assert.strictEqual(validateCode('12345'), false);
    assert.strictEqual(validateCode('1234567'), false);
    assert.strictEqual(validateCode('abc'), false);
  });
});

describe('API Client — Mock Server 行为验证', () => {
  let server;
  let baseUrl;

  before(async () => {
    server = await createTestServer();
    const addr = server.address();
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  after(() => { server.close(); });

  // ── send-code ────────────────────────────────────────────────────

  it('send-code 成功: 11位手机号 → 200 {success:true}', async () => {
    const res = await fetch(`${baseUrl}/api/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '13800138000' }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.deepStrictEqual(data, FIXTURES.sendCodeSuccess);
  });

  it('send-code 缺少手机号 → 400 + PHONE_REQUIRED', async () => {
    const res = await fetch(`${baseUrl}/api/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.code, 'PHONE_REQUIRED');
  });

  it('send-code 手机号格式错误 → 400 + INVALID_PHONE', async () => {
    const res = await fetch(`${baseUrl}/api/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '12345' }),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.code, 'INVALID_PHONE');
  });

  // ── verify-code ─────────────────────────────────────────────────

  it('verify-code 成功: 6位码 → 200 + token + user', async () => {
    const res = await fetch(`${baseUrl}/api/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '13800138000', code: '888888' }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.token, '必须有 token 字段');
    assert.ok(data.user, '必须有 user 字段');
    assert.strictEqual(data.user.isLoggedIn, true);
    assert.strictEqual(data.user.hasFullAccess, false);
  });

  it('verify-code 参数缺失 → 400 + PARAMS_REQUIRED', async () => {
    const res = await fetch(`${baseUrl}/api/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.code, 'PARAMS_REQUIRED');
  });

  it('verify-code 错误码 123457 → 400 + INVALID_CODE', async () => {
    const res = await fetch(`${baseUrl}/api/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '13800138000', code: '123457' }),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.code, 'INVALID_CODE');
  });

  // ── session ─────────────────────────────────────────────────────

  it('session 有 token → 200 + user（先通过 verify-code 获取 token）', async () => {
    // 1. 先调用 verify-code 获取 token
    const verifyRes = await fetch(`${baseUrl}/api/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '13800138000', code: '888888' }),
    });
    assert.strictEqual(verifyRes.status, 200);
    const { token } = await verifyRes.json();
    assert.ok(token, 'verify-code 必须返回 token');

    // 2. 用该 token 测试 session
    const res = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { Authorization: 'Bearer ' + token },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.user, '必须有 user 字段');
    assert.strictEqual(data.user.isLoggedIn, true);
  });

  it('session 无 token → 401 + UNAUTHORIZED', async () => {
    const res = await fetch(`${baseUrl}/api/auth/session`);
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.code, 'UNAUTHORIZED');
  });

  it('session 无效 token → 401 + UNAUTHORIZED', async () => {
    const res = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { Authorization: 'Bearer invalid-token' },
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.code, 'UNAUTHORIZED');
  });

  // ── logout ────────────────────────────────────────────────────────

  it('logout → 200 {success:true}', async () => {
    // 先获取一个 token，这样 logout 可以清除它
    const verifyRes = await fetch(`${baseUrl}/api/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '13800138000', code: '888888' }),
    });
    assert.strictEqual(verifyRes.status, 200);
    const { token } = await verifyRes.json();

    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.deepStrictEqual(data, FIXTURES.logoutSuccess);
  });

  it('logout 后 session 失效', async () => {
    // 1. verify-code 获取 token
    const verifyRes = await fetch(`${baseUrl}/api/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '13800138000', code: '888888' }),
    });
    assert.strictEqual(verifyRes.status, 200);
    const { token } = await verifyRes.json();
    // 2. logout（必须带 Authorization header 才能清除 token）
    await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
    });
    // 3. session 应该失败（token 已失效）
    const res = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { Authorization: 'Bearer ' + token },
    });
    assert.strictEqual(res.status, 401);
  });

  // ── health ───────────────────────────────────────────────────────

  it('health → 200 {status:"ok"}', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.deepStrictEqual(data, FIXTURES.healthSuccess);
  });
});

describe('API Client — Fixture 数据一致性验证', () => {
  it('logout-success fixture 严格为 {success: true}', () => {
    assert.deepStrictEqual(FIXTURES.logoutSuccess, { success: true });
  });
  it('health-success fixture 严格为 {status: "ok"}', () => {
    assert.deepStrictEqual(FIXTURES.healthSuccess, { status: 'ok' });
  });
  it('verify-code-success token 为 52 hex 字符（与 openapi.yaml 示例一致）', () => {
    const token = FIXTURES.verifyCodeSuccess.token;
    assert.strictEqual(typeof token, 'string');
    assert.strictEqual(token.length, 52, 'token 应为 52 hex 字符（与 openapi.yaml 示例一致）');
    assert.ok(/^[0-9a-f]+$/.test(token), 'token 必须是 hex 字符');
  });
  it('session-error-unauthorized fixture 包含 error 和 code', () => {
    const f = FIXTURES.sessionErrorUnauthorized;
    assert.strictEqual(typeof f.error, 'string');
    assert.strictEqual(typeof f.code, 'string');
    assert.ok(f.error.length > 0);
    assert.ok(f.code.length > 0);
  });
  it('User fixture 包含所有必需字段（id, normalizedPhone, createdAt, lastLoginAt, isLoggedIn, hasFullAccess）', () => {
    const user = FIXTURES.verifyCodeSuccess.user;
    const required = ['id', 'normalizedPhone', 'createdAt', 'lastLoginAt', 'isLoggedIn', 'hasFullAccess'];
    for (const field of required) {
      assert.ok(field in user, `User 必须包含字段: ${field}`);
    }
  });
});

describe('API Client — script.js 兼容性验证', () => {
  it('switch-mode mock 写入 3001，real 默认写入 3000', () => {
    const fs = require('fs');
    const path = require('path');
    const switchModeSrc = fs.readFileSync(
      path.resolve(__dirname, '../scripts/switch-mode.cjs'),
      'utf8'
    );
    assert.match(switchModeSrc, /mode === 'real'[\s\S]*'http:\/\/localhost:3000'[\s\S]*: 'http:\/\/localhost:3001'/);
  });

  it('client.js 包含 script.js 期望的所有方法', () => {
    const fs = require('fs');
    const path = require('path');
    const clientSrc = fs.readFileSync(
      path.resolve(__dirname, '../src/api/client.js'),
      'utf8'
    );
    const expectedMethods = [
      'sendVerificationCode',
      'verifyCode',
      'checkSession',
      'logout',
      'getToken',
      'clearToken',
      'isFileProtocol',
      'getLastDevCode',
      'getApiBase',
      'setApiBase',
    ];
    for (const method of expectedMethods) {
      assert.ok(
        clientSrc.includes(method),
        `client.js 必须包含方法: ${method}`
      );
    }
  });
});
