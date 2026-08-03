#!/usr/bin/env node
// Test for the local mock fallback in auth/apiClient.js
// Verifies that login still works when API is unavailable
// (preview server, file://, or backend not running).

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Helper: load the apiClient.js into a sandbox and return
// { window, getToken, setToken, babyIslandApi }.
function loadApiClient({ token = null, cookies = '', fileProtocol = false, fetchImpl = null } = {}) {
  const filePath = path.join(__dirname, 'apiClient.js');
  const source = fs.readFileSync(filePath, 'utf8');

  const sandbox = {};
  sandbox.window = sandbox; // apiClient.js attaches to window
  sandbox.document = { cookie: cookies };
  sandbox.sessionStorage = {
    _s: {},
    getItem(k) { return this._s[k] || null; },
    setItem(k, v) { this._s[k] = String(v); },
    removeItem(k) { delete this._s[k]; },
  };
  sandbox.localStorage = sandbox.sessionStorage;
  sandbox.console = console;
  sandbox.fetch = fetchImpl || (() => Promise.reject(new TypeError('fetch failed (test)')));
  sandbox.location = { protocol: fileProtocol ? 'file:' : 'http:' };
  if (token) sandbox.sessionStorage.setItem('baby-island-auth-token', token);

  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);

  return {
    window: sandbox,
    cookies: () => sandbox.document.cookie,
    babyIslandApi: sandbox.babyIslandApi,
  };
}

test('local mock fallback: verifyCode with valid 11-digit phone + any 4-6 digit code returns token', async () => {
  const { babyIslandApi } = loadApiClient();
  // The fetch in this sandbox is configured to reject (simulating no backend).
  const data = await babyIslandApi.verifyCode('11111111111', '5678');
  assert.ok(data, 'verifyCode should resolve');
  assert.equal(typeof data.token, 'string', 'token should be a string');
  assert.ok(data.token.length > 0, 'token should be non-empty');
  assert.ok(data.user, 'user object should be present');
  assert.equal(data.user.isLoggedIn, true);
  assert.match(data.user.normalizedPhone, /^\+8611111111111$/);
});

test('local mock fallback: verifyCode with empty/short code throws', async () => {
  const { babyIslandApi } = loadApiClient();
  await assert.rejects(
    () => babyIslandApi.verifyCode('11111111111', '12'),
    /验证码|请输入/
  );
});

test('local mock fallback: verifyCode with invalid phone throws', async () => {
  const { babyIslandApi } = loadApiClient();
  await assert.rejects(
    () => babyIslandApi.verifyCode('123', '1234'),
    /手机号格式不正确/
  );
});

test('local mock fallback: sendVerificationCode returns success', async () => {
  const { babyIslandApi } = loadApiClient();
  const data = await babyIslandApi.sendVerificationCode('11111111111');
  assert.equal(data.success, true);
});

test('local mock fallback: checkSession returns isLoggedIn=false when no token', async () => {
  const { babyIslandApi } = loadApiClient();
  const r = await babyIslandApi.checkSession();
  assert.equal(r.isLoggedIn, false);
});

test('local mock fallback: checkSession returns isLoggedIn=true after verifyCode', async () => {
  const { babyIslandApi } = loadApiClient();
  await babyIslandApi.verifyCode('11111111111', '1234');
  const r = await babyIslandApi.checkSession();
  assert.equal(r.isLoggedIn, true);
  assert.ok(r.user);
});

test('local mock fallback: logout clears the token', async () => {
  // file:// mode → storage works properly (removeItem leaves null)
  const { babyIslandApi, window } = loadApiClient({ fileProtocol: true });
  await babyIslandApi.verifyCode('11111111111', '1234');
  assert.ok(window.babyIslandApi.getToken(), 'token should be set after login');
  await babyIslandApi.logout();
  assert.equal(window.babyIslandApi.getToken(), null, 'token should be cleared after logout');
});

test('integration: login → checkSession → logout → checkSession cycle', async () => {
  const { babyIslandApi, window } = loadApiClient({ fileProtocol: true });
  // 1. Login
  const r1 = await babyIslandApi.verifyCode('13800138000', '1234');
  assert.ok(r1.token);
  assert.equal(r1.user.isLoggedIn, true);
  // 2. Session is logged in
  const r2 = await babyIslandApi.checkSession();
  assert.equal(r2.isLoggedIn, true);
  // 3. Logout
  await babyIslandApi.logout();
  // 4. Session is no longer logged in
  const r3 = await babyIslandApi.checkSession();
  assert.equal(r3.isLoggedIn, false);
});

test('learning API methods use relative /api/learning paths', async () => {
  const calls = [];
  const { babyIslandApi } = loadApiClient({
    fetchImpl: (url, options) => {
      calls.push({ url, options });
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ ok: true }),
      });
    },
  });

  await babyIslandApi.loadLearningState();
  await babyIslandApi.saveLearningState({ progressByWorld: {} });
  await babyIslandApi.saveLearningPreferences({ mapWorld: 'ocean' });
  await babyIslandApi.recordQuizAttempt({ worldId: 'ocean', levelId: 1 });
  await babyIslandApi.sendSupportFeedback({ message: '这个按钮点了没有反应' });

  assert.deepEqual(calls.map((call) => `${call.options.method} ${call.url}`), [
    'GET /api/learning/state',
    'PUT /api/learning/state',
    'PATCH /api/learning/preferences',
    'POST /api/learning/quiz-attempts',
    'POST /api/learning/support-feedback',
  ]);
});
