'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { createApp } = require('../../src/app');
const { MemoryAuthRepository } = require('../../src/repository/memory-auth-repository');
const { AuthService, hashValue, normalizePhone } = require('../../src/service/auth-service');

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const FIXTURE_DIR = path.join(REPO_ROOT, 'packages/contracts/fixtures');
const FIXED_NOW = Date.parse('2025-07-16T00:00:00.000Z');
const FIXED_TOKEN = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
const FIXED_USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const FIXED_PHONE = '13800138000';
const FIXED_NORMALIZED_PHONE = '+8613800138000';
const FIXED_CODE = '123456';

function loadFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8'));
}

function verificationRecord({
  phone = FIXED_PHONE,
  code = FIXED_CODE,
  createdAt = FIXED_NOW - 1_000,
  expiresAt = FIXED_NOW + 5 * 60_000,
  attempts = 0,
  id = `verification-${createdAt}-${attempts}`,
} = {}) {
  return {
    id,
    phoneHash: hashValue(normalizePhone(phone)),
    codeHash: hashValue(code),
    createdAt: new Date(createdAt).toISOString(),
    expiresAt: new Date(expiresAt).toISOString(),
    attempts,
  };
}

function userRecord({
  id = FIXED_USER_ID,
  normalizedPhone = FIXED_NORMALIZED_PHONE,
  createdAt = FIXED_NOW,
  lastLoginAt = FIXED_NOW,
} = {}) {
  return {
    id,
    phoneHash: hashValue(normalizedPhone),
    normalizedPhone,
    createdAt: new Date(createdAt).toISOString(),
    lastLoginAt: new Date(lastLoginAt).toISOString(),
  };
}

function sessionRecord({
  token = FIXED_TOKEN,
  userId = FIXED_USER_ID,
  createdAt = FIXED_NOW,
  expiresAt = FIXED_NOW + 30 * 24 * 60 * 60_000,
  revoked = false,
} = {}) {
  const tokenHash = hashValue(token);
  return {
    id: tokenHash,
    tokenHash,
    userId,
    createdAt: new Date(createdAt).toISOString(),
    expiresAt: new Date(expiresAt).toISOString(),
    revoked,
  };
}

async function createTestServer({
  repository = new MemoryAuthRepository(),
  smsProvider = { kind: 'test', send: async () => undefined },
  environment = 'test',
  now = () => FIXED_NOW,
} = {}) {
  const authService = new AuthService({
    repository,
    smsProvider,
    environment,
    now,
    generateCode: () => FIXED_CODE,
    generateToken: () => FIXED_TOKEN,
    generateId: () => FIXED_USER_ID,
  });
  const app = createApp({ authService, environment });
  const server = await new Promise((resolve, reject) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
    listener.once('error', reject);
  });
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  async function request(method, pathname, { body, headers = {}, rawBody } = {}) {
    const response = await fetch(`${baseUrl}${pathname}`, {
      method,
      headers: {
        ...(body !== undefined || rawBody !== undefined ? { 'content-type': 'application/json' } : {}),
        ...headers,
      },
      body: rawBody !== undefined ? rawBody : body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    return {
      status: response.status,
      headers: response.headers,
      data: text ? JSON.parse(text) : null,
    };
  }

  return {
    authService,
    baseUrl,
    repository,
    request,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    }),
  };
}

module.exports = {
  FIXED_CODE,
  FIXED_NORMALIZED_PHONE,
  FIXED_NOW,
  FIXED_PHONE,
  FIXED_TOKEN,
  FIXED_USER_ID,
  createTestServer,
  loadFixture,
  sessionRecord,
  userRecord,
  verificationRecord,
};
