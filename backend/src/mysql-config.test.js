'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  resolveMysqlConfig,
  hasMysqlEnv,
  mysqlConfigError,
} = require('./mysql-config');

test('resolveMysqlConfig requires MYSQL_HOST/USER/PASSWORD/DATABASE from env', () => {
  assert.throws(
    () => resolveMysqlConfig({ env: {} }),
    (err) => err && err.code === 'MYSQL_NOT_CONFIGURED' && /MYSQL_HOST/.test(err.message),
  );
  assert.throws(
    () => resolveMysqlConfig({
      env: {
        MYSQL_HOST: 'h',
        MYSQL_USER: 'u',
        MYSQL_PASSWORD: 'p',
      },
    }),
    (err) => err && /MYSQL_DATABASE/.test(err.message),
  );
});

test('resolveMysqlConfig does not invent localhost/root/baby_island defaults', () => {
  const cfg = resolveMysqlConfig({
    env: {
      MYSQL_HOST: 'rm-example.mysql.rds.aliyuncs.com',
      MYSQL_USER: 'baobao',
      MYSQL_PASSWORD: 'secret',
      MYSQL_DATABASE: 'baobao_chuangguan',
      MYSQL_PORT: '3307',
      MYSQL_CONNECTION_LIMIT: '8',
    },
  });
  assert.equal(cfg.host, 'rm-example.mysql.rds.aliyuncs.com');
  assert.equal(cfg.user, 'baobao');
  assert.equal(cfg.password, 'secret');
  assert.equal(cfg.database, 'baobao_chuangguan');
  assert.equal(cfg.port, 3307);
  assert.equal(cfg.connectionLimit, 8);
  assert.notEqual(cfg.host, '127.0.0.1');
  assert.notEqual(cfg.user, 'root');
  assert.notEqual(cfg.database, 'baby_island');
});

test('resolveMysqlConfig port/limit fall back only when unset', () => {
  const cfg = resolveMysqlConfig({
    env: {
      MYSQL_HOST: 'h',
      MYSQL_USER: 'u',
      MYSQL_PASSWORD: 'p',
      MYSQL_DATABASE: 'd',
    },
  });
  assert.equal(cfg.port, 3306);
  assert.equal(cfg.connectionLimit, 5);
});

test('hasMysqlEnv requires full set', () => {
  assert.equal(hasMysqlEnv({}), false);
  assert.equal(hasMysqlEnv({ MYSQL_HOST: 'h' }), false);
  assert.equal(hasMysqlEnv({
    MYSQL_HOST: 'h',
    MYSQL_USER: 'u',
    MYSQL_PASSWORD: 'p',
    MYSQL_DATABASE: 'd',
  }), true);
});

test('mysqlConfigError sets code', () => {
  const err = mysqlConfigError('x');
  assert.equal(err.code, 'MYSQL_NOT_CONFIGURED');
});
