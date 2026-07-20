#!/usr/bin/env node
// apps/frontend/src/mock-server/server.cjs
// ─────────────────────────────────────────────────────────────────────────────
// 独立 Mock Server — 端口 3001
// 严格基于 packages/contracts/fixtures/*.json 数据响应，
// 不手写漂移字段，不修改业务逻辑。
//
// 用法：
//   node src/mock-server/server.cjs
//
// API 端点（严格匹配 openapi.yaml）：
//   GET  /api/health           → 200 + health-success fixture
//   POST /api/auth/send-code   → 200 + send-code-success fixture
//                                  400 + send-code-error-phone-required (无 phone)
//                                  400 + send-code-error-invalid-phone (格式错误)
//                                  429 + send-code-error-cooldown (模拟冷却)
//   POST /api/auth/verify-code → 200 + verify-code-success fixture (任意6位数字)
//                                  400 + verify-code-error-params-required (参数缺失)
//                                  400 + verify-code-error-invalid-code (123457)
//                                  400 + verify-code-error-expired (000000)
//                                  400 + verify-code-error-attempts-exceeded (111111)
//   GET  /api/auth/session    → 200 + session-success fixture (带 Authorization header)
//                                  401 + session-error-unauthorized (无 token)
//   POST /api/auth/logout     → 200 + logout-success fixture
//
// 启动时输出 PID 和监听端口，便于进程管理和清理验证。
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

const http = require('http');
const path = require('path');

// ── Fixture 数据（来自 packages/contracts/fixtures/）───────────────
const FIXTURES = {
  'health-success':               { status: 'ok' },
  'logout-success':               { success: true },
  'send-code-success':            { success: true },
  'send-code-success-dev':        { success: true, debugCode: '123456' },
  'send-code-error-phone-required': { error: '手机号不能为空', code: 'PHONE_REQUIRED' },
  'send-code-error-invalid-phone':  { error: '手机号格式不正确', code: 'INVALID_PHONE' },
  'send-code-error-cooldown':       { error: '发送太频繁，请 42 秒后再试', code: 'COOLDOWN' },
  'send-code-error-rate-limited':   { error: '发送太频繁，请稍后再试', code: 'RATE_LIMITED' },
  'send-code-error-sms-unavailable':{ error: '短信服务暂不可用，请稍后再试', code: 'SMS_UNAVAILABLE' },
  'verify-code-success': {
    token: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      normalizedPhone: '+8613800138000',
      createdAt: '2025-07-16T00:00:00.000Z',
      lastLoginAt: '2025-07-16T00:00:00.000Z',
      isLoggedIn: true,
      hasFullAccess: false,
    },
  },
  'verify-code-error-params-required':  { error: '手机号和验证码不能为空', code: 'PARAMS_REQUIRED' },
  'verify-code-error-invalid-code':     { error: '验证码错误或已过期', code: 'INVALID_CODE' },
  'verify-code-error-expired':          { error: '验证码错误或已过期', code: 'VERIFICATION_EXPIRED' },
  'verify-code-error-attempts-exceeded':{ error: '验证码错误或已过期', code: 'ATTEMPTS_EXCEEDED' },
  'session-success': {
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      normalizedPhone: '+8613800138000',
      createdAt: '2025-07-16T00:00:00.000Z',
      lastLoginAt: '2025-07-16T00:00:00.000Z',
      isLoggedIn: true,
      hasFullAccess: false,
    },
  },
  'session-error-unauthorized': { error: '未登录', code: 'UNAUTHORIZED' },
  'session-error-revoked':       { error: '会话已失效', code: 'SESSION_REVOKED' },
  'session-error-expired':       { error: '会话已过期', code: 'SESSION_EXPIRED' },
};

// ── 配置 ────────────────────────────────────────────────────────
const PORT = process.env.MOCK_PORT || 3001;
const HOST = process.env.MOCK_HOST || 'localhost';

// In-memory "session store" — tokens issued by verify-code responses.
const validTokens = new Set([
  'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
]);

// Per-IP cooldown tracker
const ipCooldown = new Map();
const COOLDOWN_MS = 42_000; // 42 seconds

// ── Helper ───────────────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function jsonResponse(res, statusCode, body) {
  // JSON.stringify(undefined) returns undefined, breaking Buffer.byteLength
  const payload = JSON.stringify(body == null ? null : body);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    // Allow cross-origin requests from the Vite dev server.
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(payload);
}

function sendCorsPreflight(res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  });
  res.end();
}

function extractToken(req) {
  // Bearer token in Authorization header
  const auth = req.headers['authorization'] || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  // session_token cookie
  const cookie = req.headers['cookie'] || '';
  const match = cookie.match(/(?:^|;\s*)session_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function checkCooldown(req, res) {
  const ip = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const last = ipCooldown.get(ip) || 0;
  if (now - last < COOLDOWN_MS) {
    const remaining = Math.ceil((COOLDOWN_MS - (now - last)) / 1000);
    const body = { error: `发送太频繁，请 ${remaining} 秒后再试`, code: 'COOLDOWN' };
    jsonResponse(res, 429, body);
    return true;
  }
  return false;
}

function applyCooldown(req) {
  const ip = req.socket.remoteAddress || 'unknown';
  ipCooldown.set(ip, Date.now());
}

// ── Route handlers ───────────────────────────────────────────────

async function handleHealth(req, res) {
  jsonResponse(res, 200, FIXTURES['health-success']);
}

async function handleSendCode(req, res) {
  if (checkCooldown(req, res)) return;

  let body = {};
  try { body = JSON.parse(await readBody(req)); } catch { /* ignore */ }

  if (!body.phone) {
    jsonResponse(res, 400, FIXTURES['send-code-error-phone-required']);
    return;
  }
  if (!/^\d{11}$/.test(body.phone)) {
    jsonResponse(res, 400, FIXTURES['send-code-error-invalid-phone']);
    return;
  }

  applyCooldown(req);
  // 始终返回不带 debugCode（dev 模式由真实后端处理，这里只是 mock）
  jsonResponse(res, 200, FIXTURES['send-code-success']);
}

async function handleVerifyCode(req, res) {
  let body = {};
  try { body = JSON.parse(await readBody(req)); } catch { /* ignore */ }

  if (!body.phone || !body.code) {
    jsonResponse(res, 400, FIXTURES['verify-code-error-params-required']);
    return;
  }

  // Phone must be 11 digits (matches local mock validation)
  if (!/^\d{11}$/.test(String(body.phone))) {
    jsonResponse(res, 400, FIXTURES['verify-code-error-invalid-phone']);
    return;
  }

  // Must be 6 digits, or virtual login code 1234
  if (!/^\d{6}$/.test(String(body.code)) && String(body.code) !== '1234') {
    jsonResponse(res, 400, FIXTURES['verify-code-error-invalid-code']);
    return;
  }

  // 000000 → expired
  if (body.code === '000000') {
    jsonResponse(res, 400, FIXTURES['verify-code-error-expired']);
    return;
  }
  // 111111 → attempts exceeded
  if (body.code === '111111') {
    jsonResponse(res, 400, FIXTURES['verify-code-error-attempts-exceeded']);
    return;
  }
  // 123457 → hardcoded invalid code (contract fixture)
  if (body.code === '123457') {
    jsonResponse(res, 400, FIXTURES['verify-code-error-invalid-code']);
    return;
  }
  // 1234 或任意其它合法 6 位码 → 成功
  const newToken = 'mock-token-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  validTokens.add(newToken);
  jsonResponse(res, 200, {
    token: newToken,
    user: FIXTURES['verify-code-success'].user,
  });
}

async function handleSession(req, res) {
  const token = extractToken(req);
  if (!token || !validTokens.has(token)) {
    jsonResponse(res, 401, FIXTURES['session-error-unauthorized']);
    return;
  }
  jsonResponse(res, 200, FIXTURES['session-success']);
}

async function handleLogout(req, res) {
  const token = extractToken(req);
  if (token) validTokens.delete(token);
  jsonResponse(res, 200, FIXTURES['logout-success']);
}

// ── Router ───────────────────────────────────────────────────────

async function route(req, res) {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  const pathname = url.pathname;
  const method = req.method.toUpperCase();

  // Preflight
  if (method === 'OPTIONS') {
    sendCorsPreflight(res);
    return;
  }

  // GET /api/health
  if (method === 'GET' && pathname === '/api/health') {
    return handleHealth(req, res);
  }

  // POST /api/auth/send-code
  if (method === 'POST' && pathname === '/api/auth/send-code') {
    return handleSendCode(req, res);
  }

  // POST /api/auth/verify-code
  if (method === 'POST' && pathname === '/api/auth/verify-code') {
    return handleVerifyCode(req, res);
  }

  // GET /api/auth/session
  if (method === 'GET' && pathname === '/api/auth/session') {
    return handleSession(req, res);
  }

  // POST /api/auth/logout
  if (method === 'POST' && pathname === '/api/auth/logout') {
    return handleLogout(req, res);
  }

  // Unknown endpoint
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found', code: 'NOT_FOUND' }));
}

// ── Server ───────────────────────────────────────────────────────

const server = http.createServer(route);

server.listen(PORT, HOST, () => {
  console.info(`[mock-server] Listening on http://${HOST}:${PORT} (PID=${process.pid})`);
  console.info('[mock-server] Endpoints:');
  console.info('  GET  /api/health');
  console.info('  POST /api/auth/send-code');
  console.info('  POST /api/auth/verify-code');
  console.info('  GET  /api/auth/session');
  console.info('  POST /api/auth/logout');
  console.info('[mock-server] Test code: 123456 (success), 000000 (expired), 111111 (attempts exceeded), 123457 (invalid)');
});

// Graceful shutdown — record PID so verification scripts can clean up.
process.on('SIGTERM', () => {
  console.info('[mock-server] SIGTERM received, shutting down...');
  server.close(() => {
    console.info('[mock-server] Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.info('[mock-server] SIGINT received, shutting down...');
  server.close(() => process.exit(0));
});

// Expose PID for external verification scripts.
console.info(`[mock-server] PID=${process.pid}`);
