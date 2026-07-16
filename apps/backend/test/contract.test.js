'use strict';

const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const { validateSchema } = require('./helpers/schema-validator');
const {
  FIXED_CODE,
  FIXED_NOW,
  FIXED_PHONE,
  FIXED_TOKEN,
  createTestServer,
  loadFixture,
  sessionRecord,
  userRecord,
  verificationRecord,
} = require('./helpers/test-server');
const fixturesIndex = require('../../../packages/contracts/src/tests/fixtures-index.json');

const SCHEMAS_BY_ENDPOINT = {
  health: 'health.json',
  'send-code': 'send-code-response.json',
  'verify-code': 'verify-code-response.json',
  session: 'session-response.json',
  logout: 'logout-response.json',
};

const CONTRACT_CASES = Object.entries(fixturesIndex.endpoints).flatMap(([endpoint, definition]) => (
  Object.entries(definition.fixtures).map(([statusKey, fixtureDefinition]) => {
    const file = path.basename(fixtureDefinition.file);
    return {
      file,
      status: Number.parseInt(statusKey, 10),
      schema: statusKey.startsWith('2') ? SCHEMAS_BY_ENDPOINT[endpoint] : 'error.json',
      data: loadFixture(file),
    };
  })
));
const FIXTURE_COUNT = CONTRACT_CASES.length;
const casesByFile = new Map(CONTRACT_CASES.map((contractCase) => [contractCase.file, contractCase]));
const coveredFixtures = new Set();

function fixture(file) {
  const contractCase = casesByFile.get(file);
  assert.ok(contractCase, `generated contract case missing for ${file}`);
  coveredFixtures.add(file);
  return contractCase;
}

function assertFixture(response, file) {
  const contractCase = fixture(file);
  assert.equal(response.status, contractCase.status);
  assert.deepEqual(response.data, contractCase.data);
  assert.deepEqual(validateSchema(contractCase.schema, response.data), []);
}

async function withServer(options, run) {
  const server = await createTestServer(options);
  try {
    await run(server);
  } finally {
    await server.close();
  }
}

test('GET /api/health matches health-success fixture', async () => {
  await withServer({}, async ({ request }) => {
    assertFixture(await request('GET', '/api/health'), 'health-success.json');
  });
});

test('POST /api/auth/send-code matches normal success fixture', async () => {
  await withServer({ smsProvider: { kind: 'test', send: async () => undefined } }, async ({ request }) => {
    assertFixture(
      await request('POST', '/api/auth/send-code', { body: { phone: FIXED_PHONE } }),
      'send-code-success.json',
    );
  });
});

test('POST /api/auth/send-code matches development success fixture', async () => {
  await withServer({
    environment: 'development',
    smsProvider: { kind: 'development', send: async () => undefined },
  }, async ({ request }) => {
    assertFixture(
      await request('POST', '/api/auth/send-code', { body: { phone: FIXED_PHONE } }),
      'send-code-success-dev.json',
    );
  });
});

test('POST /api/auth/send-code matches phone-required fixture', async () => {
  await withServer({}, async ({ request }) => {
    assertFixture(
      await request('POST', '/api/auth/send-code', { body: {} }),
      'send-code-error-phone-required.json',
    );
  });
});

test('POST /api/auth/send-code matches invalid-phone fixture', async () => {
  await withServer({}, async ({ request }) => {
    assertFixture(
      await request('POST', '/api/auth/send-code', { body: { phone: 'not-a-phone' } }),
      'send-code-error-invalid-phone.json',
    );
  });
});

test('POST /api/auth/send-code matches cooldown fixture', async () => {
  await withServer({}, async ({ repository, request }) => {
    repository.saveVerification(verificationRecord({ createdAt: FIXED_NOW - 18_000 }));
    assertFixture(
      await request('POST', '/api/auth/send-code', { body: { phone: FIXED_PHONE } }),
      'send-code-error-cooldown.json',
    );
  });
});

test('POST /api/auth/send-code matches phone rate-limit fixture', async () => {
  await withServer({}, async ({ repository, request }) => {
    for (let index = 0; index < 5; index += 1) {
      repository.saveVerification(verificationRecord({
        id: `rate-${index}`,
        createdAt: FIXED_NOW - 61_000 - index * 1_000,
      }));
    }
    assertFixture(
      await request('POST', '/api/auth/send-code', { body: { phone: FIXED_PHONE } }),
      'send-code-error-rate-limited.json',
    );
  });
});

test('POST /api/auth/send-code matches SMS-unavailable fixture', async () => {
  const unavailableProvider = {
    kind: 'unavailable',
    send: async () => {
      const error = new Error('provider unavailable');
      error.code = 'SMS_UNAVAILABLE';
      throw error;
    },
  };
  await withServer({ smsProvider: unavailableProvider }, async ({ request }) => {
    assertFixture(
      await request('POST', '/api/auth/send-code', { body: { phone: FIXED_PHONE } }),
      'send-code-error-sms-unavailable.json',
    );
  });
});

test('POST /api/auth/verify-code matches success fixture', async () => {
  await withServer({}, async ({ repository, request }) => {
    repository.saveVerification(verificationRecord());
    assertFixture(
      await request('POST', '/api/auth/verify-code', {
        body: { phone: FIXED_PHONE, code: FIXED_CODE },
      }),
      'verify-code-success.json',
    );
  });
});

test('POST /api/auth/verify-code matches params-required fixture', async () => {
  await withServer({}, async ({ request }) => {
    assertFixture(
      await request('POST', '/api/auth/verify-code', { body: {} }),
      'verify-code-error-params-required.json',
    );
  });
});

test('POST /api/auth/verify-code matches expired fixture', async () => {
  await withServer({}, async ({ repository, request }) => {
    repository.saveVerification(verificationRecord({ expiresAt: FIXED_NOW - 1 }));
    assertFixture(
      await request('POST', '/api/auth/verify-code', {
        body: { phone: FIXED_PHONE, code: FIXED_CODE },
      }),
      'verify-code-error-expired.json',
    );
  });
});

test('POST /api/auth/verify-code matches invalid-code fixture', async () => {
  await withServer({}, async ({ repository, request }) => {
    repository.saveVerification(verificationRecord());
    assertFixture(
      await request('POST', '/api/auth/verify-code', {
        body: { phone: FIXED_PHONE, code: '654321' },
      }),
      'verify-code-error-invalid-code.json',
    );
  });
});

test('POST /api/auth/verify-code matches attempts-exceeded fixture', async () => {
  await withServer({}, async ({ repository, request }) => {
    repository.saveVerification(verificationRecord({ attempts: 3 }));
    assertFixture(
      await request('POST', '/api/auth/verify-code', {
        body: { phone: FIXED_PHONE, code: FIXED_CODE },
      }),
      'verify-code-error-attempts-exceeded.json',
    );
  });
});

test('GET /api/auth/session matches success fixture', async () => {
  await withServer({}, async ({ repository, request }) => {
    repository.saveUser(userRecord());
    repository.saveSession(sessionRecord());
    assertFixture(
      await request('GET', '/api/auth/session', {
        headers: { authorization: `Bearer ${FIXED_TOKEN}` },
      }),
      'session-success.json',
    );
  });
});

test('GET /api/auth/session matches empty-session fixture', async () => {
  await withServer({}, async ({ request }) => {
    assertFixture(
      await request('GET', '/api/auth/session'),
      'session-error-unauthorized.json',
    );
  });
});

test('GET /api/auth/session matches revoked fixture', async () => {
  await withServer({}, async ({ repository, request }) => {
    repository.saveUser(userRecord());
    repository.saveSession(sessionRecord({ revoked: true }));
    assertFixture(
      await request('GET', '/api/auth/session', {
        headers: { authorization: `Bearer ${FIXED_TOKEN}` },
      }),
      'session-error-revoked.json',
    );
  });
});

test('GET /api/auth/session matches expired fixture', async () => {
  await withServer({}, async ({ repository, request }) => {
    repository.saveUser(userRecord());
    repository.saveSession(sessionRecord({ expiresAt: FIXED_NOW - 1 }));
    assertFixture(
      await request('GET', '/api/auth/session', {
        headers: { authorization: `Bearer ${FIXED_TOKEN}` },
      }),
      'session-error-expired.json',
    );
  });
});

test('POST /api/auth/logout matches success fixture and revokes token', async () => {
  await withServer({}, async ({ repository, request }) => {
    repository.saveUser(userRecord());
    repository.saveSession(sessionRecord());
    const response = await request('POST', '/api/auth/logout', {
      headers: { authorization: `Bearer ${FIXED_TOKEN}` },
    });
    assertFixture(response, 'logout-success.json');
    assert.equal(repository.findSessionByTokenHash(sessionRecord().tokenHash).revoked, true);
    assert.match(response.headers.get('set-cookie'), /session_token=;/);
  });
});

test('all generated contract fixtures are exercised', () => {
  assert.equal(FIXTURE_COUNT, 18);
  assert.deepEqual([...coveredFixtures].sort(), [...casesByFile.keys()].sort());
});
