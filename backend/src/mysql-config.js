// MySQL / RDS 连接配置：一律从环境变量读取，禁止 silent localhost/root 默认值。
'use strict';

function mysqlConfigError(message, code = 'MYSQL_NOT_CONFIGURED') {
  const err = new Error(message);
  err.code = code;
  return err;
}

/**
 * @param {unknown} value
 * @param {string} name
 * @returns {string}
 */
function requireConfig(value, name) {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw mysqlConfigError(`${name} is not configured`);
  }
  return String(value);
}

/**
 * 解析 MySQL 连接参数。host/user/password/database 必须来自 env（或显式 options），
 * 不得回落 127.0.0.1 / root / baby_island。
 *
 * @param {object} [options]
 * @param {NodeJS.ProcessEnv|Record<string, string|undefined>} [options.env]
 * @param {string} [options.host]
 * @param {string|number} [options.port]
 * @param {string} [options.user]
 * @param {string} [options.password]
 * @param {string} [options.database]
 * @param {string|number} [options.connectionLimit]
 * @returns {{ host: string, port: number, user: string, password: string, database: string, connectionLimit: number, waitForConnections: true, timezone: 'Z' }}
 */
function resolveMysqlConfig(options = {}) {
  const env = options.env || process.env;
  const portRaw = options.port ?? env.MYSQL_PORT;
  const limitRaw = options.connectionLimit ?? env.MYSQL_CONNECTION_LIMIT;

  return {
    host: requireConfig(options.host ?? env.MYSQL_HOST, 'MYSQL_HOST'),
    port: Number(portRaw !== undefined && portRaw !== '' ? portRaw : 3306),
    user: requireConfig(options.user ?? env.MYSQL_USER, 'MYSQL_USER'),
    password: requireConfig(options.password ?? env.MYSQL_PASSWORD, 'MYSQL_PASSWORD'),
    database: requireConfig(options.database ?? env.MYSQL_DATABASE, 'MYSQL_DATABASE'),
    waitForConnections: true,
    connectionLimit: Number(limitRaw !== undefined && limitRaw !== '' ? limitRaw : 5),
    timezone: 'Z',
  };
}

/**
 * @param {NodeJS.ProcessEnv|Record<string, string|undefined>} [env]
 * @returns {boolean}
 */
function hasMysqlEnv(env = process.env) {
  return Boolean(
    env.MYSQL_HOST
    && env.MYSQL_USER
    && env.MYSQL_PASSWORD
    && env.MYSQL_DATABASE,
  );
}

module.exports = {
  mysqlConfigError,
  requireConfig,
  resolveMysqlConfig,
  hasMysqlEnv,
};
