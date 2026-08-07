'use strict';

const crypto = require('crypto');
const {
  WORLD_IDS,
  clampInteger,
  normalizeLearningSnapshot,
  stateFromRows,
  toProfilePatch,
} = require('./insforge-learning-repository');

const PROFILE_COLUMNS = [
  'id',
  'local_user_id',
  'child_name',
  'child_age',
  'map_music',
  'auto_pronunciation',
  'show_chinese_hints',
  'map_world',
  'math_attempts',
];

function mysqlConfigError(message, code = 'MYSQL_NOT_CONFIGURED') {
  const err = new Error(message);
  err.code = code;
  return err;
}

function requireConfig(value, name) {
  if (!value) throw mysqlConfigError(`${name} is not configured`);
  return value;
}

function createMysqlPool(options = {}) {
  let mysql;
  try {
    mysql = require('mysql2/promise');
  } catch (_) {
    throw mysqlConfigError('mysql2 is not installed', 'MYSQL_DRIVER_NOT_INSTALLED');
  }

  return mysql.createPool({
    host: requireConfig(options.host || process.env.MYSQL_HOST, 'MYSQL_HOST'),
    port: Number(options.port || process.env.MYSQL_PORT || 3306),
    user: requireConfig(options.user || process.env.MYSQL_USER, 'MYSQL_USER'),
    password: requireConfig(options.password || process.env.MYSQL_PASSWORD, 'MYSQL_PASSWORD'),
    database: requireConfig(options.database || process.env.MYSQL_DATABASE, 'MYSQL_DATABASE'),
    waitForConnections: true,
    connectionLimit: Number(options.connectionLimit || process.env.MYSQL_CONNECTION_LIMIT || 5),
  });
}

async function executeRows(client, sql, params = []) {
  const [rows] = await client.execute(sql, params);
  return rows;
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function formatDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value || '').slice(0, 10);
}

function formatDateTime(value) {
  if (value instanceof Date) return value.toISOString();
  return String(value || '');
}

function normalizeProfileRow(row) {
  return {
    ...row,
    map_music: Boolean(row.map_music),
    auto_pronunciation: Boolean(row.auto_pronunciation),
    show_chinese_hints: Boolean(row.show_chinese_hints),
  };
}

function normalizeProgressRow(row) {
  return {
    ...row,
    completed_levels: parseJsonArray(row.completed_levels),
  };
}

function normalizeActivityRow(row) {
  return {
    ...row,
    activity_day: formatDate(row.activity_day),
  };
}

function normalizeMistakeRow(row) {
  return {
    ...row,
    updated_at: formatDateTime(row.updated_at),
  };
}

class MysqlLearningRepository {
  constructor(options = {}) {
    this.pool = options.pool || null;
    this.poolOptions = options;
    this._schemaReady = false;
  }

  getPool() {
    if (!this.pool) this.pool = createMysqlPool(this.poolOptions);
    return this.pool;
  }

  /** 对齐生产 RDS：缺 math_attempts 时自动补列（幂等） */
  async ensureSchema(client = this.getPool()) {
    if (this._schemaReady) return;
    // 注入 mock pool 的单测不跑 information_schema（避免消耗 mock 响应队列）
    if (this.poolOptions.skipEnsureSchema || this.poolOptions.pool) {
      this._schemaReady = true;
      return;
    }
    try {
      const rows = await executeRows(
        client,
        `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'baby_profiles'
           AND COLUMN_NAME = 'math_attempts'`,
      );
      if (!rows[0] || Number(rows[0].c) === 0) {
        await client.execute('ALTER TABLE baby_profiles ADD COLUMN math_attempts JSON NULL');
      }
      this._schemaReady = true;
    } catch (err) {
      // 无权限改表时继续；后续 SQL 会报更明确错误
      this._schemaReady = true;
      if (err && err.code !== 'ER_DUP_FIELDNAME') {
        console.warn('[learning/mysql] ensureSchema soft-fail:', err.message || err);
      }
    }
  }

  async ensureProfile(user, profilePatch = null, client = this.getPool()) {
    await this.ensureSchema(client);
    const localUserId = user.id;
    const patch = toProfilePatch(profilePatch);
    const existingRows = await executeRows(
      client,
      `SELECT ${PROFILE_COLUMNS.join(', ')} FROM baby_profiles WHERE local_user_id = ? LIMIT 1`,
      [localUserId],
    );
    const existing = existingRows[0] ? normalizeProfileRow(existingRows[0]) : null;
    if (existing && Object.keys(patch).length === 0) return existing;

    const id = existing?.id || crypto.randomUUID();
    const patchColumns = Object.keys(patch);
    const columns = ['id', 'local_user_id', ...patchColumns];
    const placeholders = columns.map(() => '?').join(', ');
    const updates = patchColumns.length
      ? patchColumns.map((column) => `${column} = VALUES(${column})`).join(', ')
      : 'local_user_id = VALUES(local_user_id)';

    await client.execute(
      `INSERT INTO baby_profiles (${columns.join(', ')})
       VALUES (${placeholders})
       ON DUPLICATE KEY UPDATE ${updates}`,
      [id, localUserId, ...patchColumns.map((column) => patch[column])],
    );

    const rows = await executeRows(
      client,
      `SELECT ${PROFILE_COLUMNS.join(', ')} FROM baby_profiles WHERE local_user_id = ? LIMIT 1`,
      [localUserId],
    );
    if (!rows[0]) throw mysqlConfigError('baby profile was not saved', 'MYSQL_REQUEST_FAILED');
    return normalizeProfileRow(rows[0]);
  }

  async loadState(user) {
    const pool = this.getPool();
    const profile = await this.ensureProfile(user);

    const progressRows = await executeRows(
      pool,
      'SELECT world_id, completed_levels, unlocked_through FROM baby_world_progress WHERE profile_id = ?',
      [profile.id],
    );
    const activityRows = await executeRows(
      pool,
      'SELECT activity_day FROM baby_learning_activity WHERE profile_id = ? ORDER BY activity_day ASC',
      [profile.id],
    );
    const mistakeRows = await executeRows(
      pool,
      `SELECT world_id, level_id, word, zh_title, selected, correct, mistake_count, updated_at
       FROM baby_mistakes
       WHERE profile_id = ? AND resolved_at IS NULL
       ORDER BY updated_at DESC
       LIMIT 50`,
      [profile.id],
    );

    return stateFromRows(
      profile,
      progressRows.map(normalizeProgressRow),
      activityRows.map(normalizeActivityRow),
      mistakeRows.map(normalizeMistakeRow),
    );
  }

  async withTransaction(work) {
    const connection = await this.getPool().getConnection();
    try {
      await connection.beginTransaction();
      const result = await work(connection);
      await connection.commit();
      return result;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async saveState(user, snapshot) {
    const safeSnapshot = normalizeLearningSnapshot(snapshot);
    await this.withTransaction(async (connection) => {
      const profile = await this.ensureProfile(user, safeSnapshot.profile, connection);
      await connection.execute(
        'UPDATE baby_profiles SET math_attempts = ? WHERE id = ?',
        [JSON.stringify(safeSnapshot.mathAttempts), profile.id],
      );

      for (const worldId of WORLD_IDS) {
        const progress = safeSnapshot.progressByWorld[worldId];
        await connection.execute(
          `INSERT INTO baby_world_progress (profile_id, world_id, completed_levels, unlocked_through)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             completed_levels = VALUES(completed_levels),
             unlocked_through = VALUES(unlocked_through)`,
          [profile.id, worldId, JSON.stringify(progress.completed), progress.unlockedThrough],
        );
      }

      for (const day of safeSnapshot.learningActivity.dates) {
        await connection.execute(
          `INSERT INTO baby_learning_activity (profile_id, activity_day)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE activity_day = VALUES(activity_day)`,
          [profile.id, day],
        );
      }

      await this.syncMistakes(connection, profile.id, safeSnapshot.mistakeBook.items);
    });

    return this.loadState(user);
  }

  async savePreferences(user, profilePatch) {
    await this.ensureProfile(user, toProfilePatch(profilePatch));
    return this.loadState(user);
  }

  async syncMistakes(client, profileId, items) {
    const current = await executeRows(
      client,
      'SELECT world_id, level_id FROM baby_mistakes WHERE profile_id = ? AND resolved_at IS NULL',
      [profileId],
    );
    const activeKeys = new Set(items.map((item) => `${item.worldId}:${item.levelId}`));

    for (const row of current.filter((item) => !activeKeys.has(`${item.world_id}:${item.level_id}`))) {
      await client.execute(
        `UPDATE baby_mistakes
         SET resolved_at = CURRENT_TIMESTAMP(3)
         WHERE profile_id = ? AND world_id = ? AND level_id = ? AND resolved_at IS NULL`,
        [profileId, row.world_id, row.level_id],
      );
    }

    for (const item of items) {
      await client.execute(
        `INSERT INTO baby_mistakes
           (profile_id, world_id, level_id, word, zh_title, selected, correct, mistake_count, resolved_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
         ON DUPLICATE KEY UPDATE
           word = VALUES(word),
           zh_title = VALUES(zh_title),
           selected = VALUES(selected),
           correct = VALUES(correct),
           mistake_count = VALUES(mistake_count),
           resolved_at = NULL,
           updated_at = CURRENT_TIMESTAMP(3)`,
        [
          profileId,
          item.worldId,
          item.levelId,
          item.word,
          item.zhTitle,
          item.selected,
          item.correct,
          // Align with InsForge + openapi LearningMistakeItem.count (1..99).
          clampInteger(item.count, 1, 99, 1),
        ],
      );
    }
  }

  async recordQuizAttempt(user, attempt) {
    const pool = this.getPool();
    const profile = await this.ensureProfile(user);
    const [result] = await pool.execute(
      `INSERT INTO baby_quiz_attempts (profile_id, world_id, level_id, selected, correct, is_correct)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [profile.id, attempt.worldId, attempt.levelId, attempt.selected, attempt.correct, attempt.isCorrect ? 1 : 0],
    );
    return { id: String(result.insertId || '') };
  }

  async createSupportFeedback(user, feedback) {
    const pool = this.getPool();
    const profile = await this.ensureProfile(user);
    const [result] = await pool.execute(
      'INSERT INTO baby_support_feedback (profile_id, message, context) VALUES (?, ?, ?)',
      [profile.id, feedback.message, JSON.stringify(feedback.context || {})],
    );
    return { id: String(result.insertId || '') };
  }
}

module.exports = {
  MysqlLearningRepository,
  createMysqlLearningRepository: (options) => new MysqlLearningRepository(options),
  createMysqlPool,
};
