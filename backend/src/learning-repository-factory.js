// 学习数据仓库工厂：mysql | insforge | none
// 兼容 LEARNING_REPOSITORY 与 LEARNING_BACKEND 两个环境变量名。
'use strict';

const {
  createInsForgeLearningRepository,
} = require('./insforge-learning-repository');
const {
  createMysqlLearningRepository,
} = require('./mysql-learning-repository');

/**
 * @returns {'mysql'|'insforge'|'none'}
 */
function resolveLearningBackendKind(env = process.env) {
  const raw = String(
    env.LEARNING_REPOSITORY || env.LEARNING_BACKEND || '',
  )
    .trim()
    .toLowerCase();

  if (raw === 'mysql' || raw === 'rds') return 'mysql';
  if (raw === 'insforge' || raw === 'postgres' || raw === 'pg') return 'insforge';
  if (raw === 'none' || raw === 'off' || raw === 'disabled') return 'none';

  // 未显式指定：有 InsForge URL + key 则默认 InsForge；否则 none（勿静默假成功）
  // 接受 INSFORGE_API_KEY（正式）或 INSFORGE_SERVICE_KEY（兼容旧名）
  if (env.INSFORGE_URL && (env.INSFORGE_API_KEY || env.INSFORGE_SERVICE_KEY)) {
    return 'insforge';
  }
  return 'none';
}

/**
 * @param {object} [options]
 * @param {NodeJS.ProcessEnv} [options.env]
 * @returns {{ kind: string, repository: object|null, reason: string|null }}
 */
function createLearningRepositoryFromEnv(options = {}) {
  const env = options.env || process.env;
  const kind = resolveLearningBackendKind(env);

  if (kind === 'none') {
    return {
      kind: 'none',
      repository: null,
      reason: 'LEARNING_REPOSITORY/BACKEND unset and InsForge not configured',
    };
  }

  if (kind === 'mysql') {
    try {
      const repository = createMysqlLearningRepository({
        host: env.MYSQL_HOST,
        port: env.MYSQL_PORT,
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE,
      });
      // 懒连接：构造不连库；getPool 时才 require mysql2
      return { kind: 'mysql', repository, reason: null };
    } catch (err) {
      return {
        kind: 'none',
        repository: null,
        reason: err && err.message ? err.message : 'mysql repository failed',
      };
    }
  }

  // insforge：传 apiKey（repository 读 apiKey）；兼容旧 env 名 SERVICE_KEY
  try {
    const repository = createInsForgeLearningRepository({
      baseUrl: env.INSFORGE_URL,
      apiKey: env.INSFORGE_API_KEY || env.INSFORGE_SERVICE_KEY,
    });
    return { kind: 'insforge', repository, reason: null };
  } catch (err) {
    return {
      kind: 'none',
      repository: null,
      reason: err && err.message ? err.message : 'insforge repository failed',
    };
  }
}

module.exports = {
  resolveLearningBackendKind,
  createLearningRepositoryFromEnv,
};
