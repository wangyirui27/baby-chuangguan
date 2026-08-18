'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  resolveLearningBackendKind,
  createLearningRepositoryFromEnv,
} = require('./learning-repository-factory');

test('resolveLearningBackendKind accepts LEARNING_BACKEND alias', () => {
  assert.equal(resolveLearningBackendKind({ LEARNING_BACKEND: 'mysql' }), 'mysql');
  assert.equal(resolveLearningBackendKind({ LEARNING_REPOSITORY: 'mysql' }), 'mysql');
  assert.equal(resolveLearningBackendKind({ LEARNING_BACKEND: 'RDS' }), 'mysql');
  assert.equal(resolveLearningBackendKind({}), 'none');
  assert.equal(
    resolveLearningBackendKind({
      INSFORGE_URL: 'https://example.test',
      INSFORGE_SERVICE_KEY: 'k',
    }),
    'insforge',
  );
  assert.equal(
    resolveLearningBackendKind({
      INSFORGE_URL: 'https://example.test',
      INSFORGE_API_KEY: 'k2',
    }),
    'insforge',
  );
});

test('createLearningRepositoryFromEnv mysql returns repository when mysql2 present', () => {
  const result = createLearningRepositoryFromEnv({
    env: {
      LEARNING_BACKEND: 'mysql',
      MYSQL_HOST: '127.0.0.1',
      MYSQL_USER: 'u',
      MYSQL_PASSWORD: 'p',
      MYSQL_DATABASE: 'db',
    },
  });
  assert.equal(result.kind, 'mysql');
  assert.ok(result.repository);
  assert.equal(typeof result.repository.loadState, 'function');
});

test('createLearningRepositoryFromEnv none when unset', () => {
  const result = createLearningRepositoryFromEnv({ env: {} });
  assert.equal(result.kind, 'none');
  assert.equal(result.repository, null);
});
