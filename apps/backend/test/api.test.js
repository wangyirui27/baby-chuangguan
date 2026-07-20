'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  FIXED_CODE,
  FIXED_NOW,
  FIXED_PHONE,
  FIXED_TOKEN,
  createTestServer,
  sessionRecord,
  userRecord,
  verificationRecord,
} = require('./helpers/test-server');
const { createCorsOrigin } = require('../src/app');

async function withServer(options, run) {
  const server = await createTestServer(options);
  try {
    await run(server);
  } finally {
    await server.close();
  }
}

function checkCorsOrigin(environment, origin) {
  return new Promise((resolve, reject) => {
    createCorsOrigin(environment)(origin, (err, allowed) => {
      if (err) reject(err);
      else resolve(allowed);
    });
  });
}

test('CORS rejects unknown production origins and exact-matches configured origins', async () => {
  const originalOrigins = process.env.CORS_ORIGINS;
  const originalNullOrigin = process.env.CORS_ALLOW_NULL_ORIGIN;
  delete process.env.CORS_ORIGINS;
  delete process.env.CORS_ALLOW_NULL_ORIGIN;
  try {
    assert.equal(await checkCorsOrigin('development', 'http://localhost:5173'), true);
    assert.equal(await checkCorsOrigin('production', 'https://parent-preview.example'), false);
    assert.equal(await checkCorsOrigin('staging', 'null'), false);

    process.env.CORS_ORIGINS = 'https://parent-preview.example,http://localhost:5173';
    assert.equal(await checkCorsOrigin('production', 'https://parent-preview.example'), true);
    assert.equal(await checkCorsOrigin('production', 'https://parent-preview.example.evil.test'), false);

    process.env.CORS_ALLOW_NULL_ORIGIN = 'true';
    assert.equal(await checkCorsOrigin('production', 'null'), true);
  } finally {
    if (originalOrigins === undefined) delete process.env.CORS_ORIGINS;
    else process.env.CORS_ORIGINS = originalOrigins;
    if (originalNullOrigin === undefined) delete process.env.CORS_ALLOW_NULL_ORIGIN;
    else process.env.CORS_ALLOW_NULL_ORIGIN = originalNullOrigin;
  }
});

test('only the frozen methods and paths are exposed', async () => {
  await withServer({}, async ({ request }) => {
    assert.equal((await request('GET', '/api/health')).status, 200);
    assert.equal((await request('POST', '/api/health')).status, 404);
    assert.equal((await request('GET', '/api/auth/send-code')).status, 404);
    assert.equal((await request('GET', '/api/unknown')).status, 404);
    assert.deepEqual((await request('GET', '/api/unknown')).data, {
      error: 'Not found',
      code: 'NOT_FOUND',
    });
  });
});

test('send-code rejects malformed and schema-invalid requests', async () => {
  await withServer({}, async ({ request }) => {
    const cases = [
      { rawBody: '{', code: 'INVALID_PHONE' },
      { body: null, code: 'PHONE_REQUIRED' },
      { body: [], code: 'PHONE_REQUIRED' },
      { body: {}, code: 'PHONE_REQUIRED' },
      { body: { phone: 13800138000 }, code: 'INVALID_PHONE' },
      { body: { phone: FIXED_PHONE, extra: true }, code: 'INVALID_PHONE' },
      { body: { phone: '123' }, code: 'INVALID_PHONE' },
    ];

    for (const requestCase of cases) {
      const response = await request('POST', '/api/auth/send-code', requestCase);
      assert.equal(response.status, 400);
      assert.equal(response.data.code, requestCase.code);
    }
  });
});

test('verify-code rejects malformed, extra, and invalid fields', async () => {
  await withServer({}, async ({ request }) => {
    const bodies = [
      { rawBody: '{' },
      { body: null },
      { body: [] },
      { body: {} },
      { body: { phone: FIXED_PHONE } },
      { body: { phone: FIXED_PHONE, code: 123456 } },
      { body: { phone: FIXED_PHONE, code: '12345' } },
      { body: { phone: 'bad', code: FIXED_CODE } },
      { body: { phone: FIXED_PHONE, code: FIXED_CODE, extra: true } },
    ];

    for (const body of bodies) {
      const response = await request('POST', '/api/auth/verify-code', body);
      assert.equal(response.status, 400);
      assert.equal(response.data.code, 'PARAMS_REQUIRED');
    }
  });
});

test('session accepts the HttpOnly cookie issued by verify-code', async () => {
  await withServer({}, async ({ repository, request }) => {
    repository.saveVerification(verificationRecord());
    const verifyResponse = await request('POST', '/api/auth/verify-code', {
      body: { phone: FIXED_PHONE, code: FIXED_CODE },
    });
    const cookie = verifyResponse.headers.get('set-cookie');

    assert.equal(verifyResponse.status, 200);
    assert.match(cookie, /session_token=/);
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=Lax/i);

    const sessionResponse = await request('GET', '/api/auth/session', {
      headers: { cookie },
    });
    assert.equal(sessionResponse.status, 200);
    assert.equal(sessionResponse.data.user.id, verifyResponse.data.user.id);
  });
});

test('session reports a missing user with the frozen error code', async () => {
  await withServer({}, async ({ repository, request }) => {
    repository.saveSession(sessionRecord());
    const response = await request('GET', '/api/auth/session', {
      headers: { authorization: `Bearer ${FIXED_TOKEN}` },
    });

    assert.equal(response.status, 401);
    assert.deepEqual(response.data, { error: '用户不存在', code: 'USER_NOT_FOUND' });
  });
});

test('send-code maps unexpected provider failures without leaking details', async () => {
  const smsProvider = {
    kind: 'test',
    send: async () => {
      throw new Error('secret provider detail');
    },
  };
  await withServer({ smsProvider }, async ({ request }) => {
    const response = await request('POST', '/api/auth/send-code', {
      body: { phone: FIXED_PHONE },
    });

    assert.equal(response.status, 500);
    assert.deepEqual(response.data, { error: '发送验证码失败', code: 'SEND_FAILED' });
    assert.equal(JSON.stringify(response.data).includes('secret'), false);
  });
});

test('verify-code maps unexpected repository failures', async () => {
  const repository = {
    findLatestVerification: () => {
      throw new Error('storage detail');
    },
  };
  await withServer({ repository }, async ({ request }) => {
    const response = await request('POST', '/api/auth/verify-code', {
      body: { phone: FIXED_PHONE, code: FIXED_CODE },
    });

    assert.equal(response.status, 500);
    assert.deepEqual(response.data, { error: '验证失败', code: 'VERIFY_FAILED' });
  });
});

test('send-code enforces the frozen IP rate-limit error', async () => {
  await withServer({}, async ({ authService }) => {
    for (let index = 0; index < 20; index += 1) {
      await authService.sendCode(`1380013${String(index).padStart(4, '0')}`, 'test-ip');
    }

    await assert.rejects(
      () => authService.sendCode('13900139000', 'test-ip'),
      (error) => {
        assert.equal(error.status, 429);
        assert.equal(error.code, 'IP_RATE_LIMITED');
        return true;
      },
    );
  });
});

test('logout without a session is idempotent and clears the cookie', async () => {
  await withServer({}, async ({ request }) => {
    const response = await request('POST', '/api/auth/logout');
    assert.equal(response.status, 200);
    assert.deepEqual(response.data, { success: true });
    assert.match(response.headers.get('set-cookie'), /session_token=;/);
  });
});

test('bearer session lifecycle survives normal requests in memory', async () => {
  await withServer({}, async ({ repository, request }) => {
    repository.saveUser(userRecord());
    repository.saveSession(sessionRecord({ createdAt: FIXED_NOW }));

    assert.equal((await request('GET', '/api/auth/session', {
      headers: { authorization: `Bearer ${FIXED_TOKEN}` },
    })).status, 200);
    assert.equal((await request('POST', '/api/auth/logout', {
      headers: { authorization: `Bearer ${FIXED_TOKEN}` },
    })).status, 200);
    assert.equal((await request('GET', '/api/auth/session', {
      headers: { authorization: `Bearer ${FIXED_TOKEN}` },
    })).data.code, 'SESSION_REVOKED');
  });
});
