// 虚拟登录单测：任意 11 位手机号 + 任意 4–6 位验证码

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const express = require('express');
const cookieParser = require('cookie-parser');

process.env.NODE_ENV = 'test';
process.env.SMS_PROVIDER = 'development';
// 显式开启（test 环境默认也是开）
process.env.VIRTUAL_LOGIN = '1';
delete process.env.VIRTUAL_LOGIN_STRICT;
process.env.VIRTUAL_LOGIN_CODE = '1234';

const db = require('./db');
const {
  isVirtualLoginEnabled,
  isVirtualLoginCode,
  getVirtualLoginCode,
  isVirtualLoginStrict,
} = require('./virtual-login');

test('virtual login helpers default on in test (any 4-6 digit)', () => {
  assert.equal(isVirtualLoginEnabled(), true);
  assert.equal(isVirtualLoginStrict(), false);
  assert.equal(getVirtualLoginCode(), '1234');
  assert.equal(isVirtualLoginCode('1234'), true);
  assert.equal(isVirtualLoginCode('0000'), true);
  assert.equal(isVirtualLoginCode('999999'), true);
  assert.equal(isVirtualLoginCode('12'), false);
});

test('virtual login strict mode only accepts fixed code', () => {
  const orig = process.env.VIRTUAL_LOGIN_STRICT;
  try {
    process.env.VIRTUAL_LOGIN_STRICT = '1';
    assert.equal(isVirtualLoginCode('1234'), true);
    assert.equal(isVirtualLoginCode('0000'), false);
  } finally {
    if (orig === undefined) delete process.env.VIRTUAL_LOGIN_STRICT;
    else process.env.VIRTUAL_LOGIN_STRICT = orig;
  }
});

test('virtual login disabled in production unless ALLOW_VIRTUAL_LOGIN=1', () => {
  const origEnv = process.env.NODE_ENV;
  const origAllow = process.env.ALLOW_VIRTUAL_LOGIN;
  const origVirtual = process.env.VIRTUAL_LOGIN;
  const origStrict = process.env.VIRTUAL_LOGIN_STRICT;
  try {
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOW_VIRTUAL_LOGIN;
    delete process.env.VIRTUAL_LOGIN_STRICT;
    assert.equal(isVirtualLoginEnabled(), false);
    assert.equal(isVirtualLoginCode('1234'), false);

    process.env.ALLOW_VIRTUAL_LOGIN = '1';
    assert.equal(isVirtualLoginEnabled(), true);
    assert.equal(isVirtualLoginCode('5678'), true);
    process.env.VIRTUAL_LOGIN_STRICT = '1';
    assert.equal(isVirtualLoginCode('1234'), true);
    assert.equal(isVirtualLoginCode('5678'), false);
  } finally {
    process.env.NODE_ENV = origEnv;
    if (origAllow === undefined) delete process.env.ALLOW_VIRTUAL_LOGIN;
    else process.env.ALLOW_VIRTUAL_LOGIN = origAllow;
    if (origVirtual === undefined) delete process.env.VIRTUAL_LOGIN;
    else process.env.VIRTUAL_LOGIN = origVirtual;
    if (origStrict === undefined) delete process.env.VIRTUAL_LOGIN_STRICT;
    else process.env.VIRTUAL_LOGIN_STRICT = origStrict;
  }
});

function createServer() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vl-'));
  db.setDataDir(tmp);
  db.users.clear();
  db.sessions.clear();
  db.verifications.clear();

  // reset auth provider cache
  delete require.cache[require.resolve('./auth')];
  const authRouter = require('./auth');
  if (authRouter.resetSmsProvider) authRouter.resetSmsProvider();

  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', authRouter);

  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, tmp, base: `http://127.0.0.1:${port}` });
    });
  });
}

function postJson(base, p, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(p, base);
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => { raw += c; });
        res.on('end', () => {
          let parsed = null;
          try { parsed = JSON.parse(raw); } catch { parsed = raw; }
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

test('HTTP: any 11-digit phone + any 4-digit code logs in without send-code', async () => {
  const { server, base, tmp } = await createServer();
  try {
    const phone = '18812345678';
    const { status, data } = await postJson(base, '/api/auth/verify-code', {
      phone,
      code: '8888',
    });
    assert.equal(status, 200, JSON.stringify(data));
    assert.ok(data.token && data.token.length >= 32);
    assert.equal(data.user.isLoggedIn, true);
    assert.equal(data.user.hasFullAccess, false);
    assert.ok(data.user.normalizedPhone.includes('188') || data.user.normalizedPhone.startsWith('+86'));
  } finally {
    server.close();
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});

test('HTTP: short code still fails without prior SMS', async () => {
  const { server, base, tmp } = await createServer();
  try {
    const { status, data } = await postJson(base, '/api/auth/verify-code', {
      phone: '18812345679',
      code: '12',
    });
    assert.equal(status, 400);
    assert.ok(data.code === 'VERIFICATION_EXPIRED' || data.code === 'PARAMS_REQUIRED' || data.code === 'INVALID_CODE');
  } finally {
    server.close();
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* ignore */ }
  }
});
