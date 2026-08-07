// 宝宝闯关 · 内存数据库 + 幂等文件持久化
// 使用 Map 存储 users / sessions / verifications
// 启动时从 data/*.json 加载，每次写入后异步持久化
// 验证码仅存 SHA-256 哈希，不存明文

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ─── 可配置数据目录（测试时可通过 setDataDir 隔离） ──────
let DATA_DIR = path.resolve(__dirname, '..', '..', 'data');

const USERS_FILE = () => path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = () => path.join(DATA_DIR, 'sessions.json');
const VERIFICATIONS_FILE = () => path.join(DATA_DIR, 'verifications.json');

/** @returns {'json'|'mysql'} */
function resolveAuthRepository() {
  // 单测必须隔离到本地 JSON，避免读到 backend/.env 的 mysql 配置拖垮 npm test
  if (process.env.NODE_ENV === 'test' || process.env.AUTH_FORCE_JSON === '1') {
    return 'json';
  }
  const raw = String(
    process.env.AUTH_REPOSITORY
      || process.env.AUTH_BACKEND
      || '',
  ).trim().toLowerCase();
  // 仅显式 AUTH_* 切 mysql；不要因 LEARNING_BACKEND=mysql 隐式改鉴权
  if (raw === 'mysql' || raw === 'rds') {
    if (!process.env.MYSQL_HOST) return 'json';
    return 'mysql';
  }
  return 'json';
}

let _mysqlPool = null;
function getMysqlPool() {
  if (_mysqlPool) return _mysqlPool;
  // lazy require so unit tests without mysql2 still load db.js
  // eslint-disable-next-line global-require
  const mysql = require('mysql2/promise');
  _mysqlPool = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'baby_island',
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 5),
    timezone: 'Z',
  });
  return _mysqlPool;
}

async function loadAllFromMysql() {
  const pool = getMysqlPool();
  const [userRows] = await pool.query(
    'SELECT id, normalized_phone, created_at, last_login_at FROM baby_auth_users',
  );
  const [sessionRows] = await pool.query(
    'SELECT token_hash, user_id, created_at, expires_at, revoked FROM baby_auth_sessions',
  );
  const [verRows] = await pool.query(
    'SELECT id, phone_hash, code_hash, expires_at, attempts, used, created_at FROM baby_auth_verifications',
  );
  users.clear();
  sessions.clear();
  verifications.clear();
  for (const row of userRows) {
    users.set(row.id, {
      id: row.id,
      normalizedPhone: row.normalized_phone,
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at,
    });
  }
  for (const row of sessionRows) {
    sessions.set(row.token_hash, {
      id: row.token_hash,
      tokenHash: row.token_hash,
      userId: row.user_id,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      revoked: Boolean(row.revoked),
    });
  }
  for (const row of verRows) {
    verifications.set(row.id, {
      id: row.id,
      phoneHash: row.phone_hash,
      codeHash: row.code_hash,
      expiresAt: row.expires_at,
      attempts: Number(row.attempts) || 0,
      used: Boolean(row.used),
      createdAt: row.created_at,
    });
  }
}

async function saveAllToMysql() {
  const pool = getMysqlPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM baby_auth_verifications');
    await conn.query('DELETE FROM baby_auth_sessions');
    await conn.query('DELETE FROM baby_auth_users');
    for (const u of users.values()) {
      await conn.execute(
        `INSERT INTO baby_auth_users (id, normalized_phone, created_at, last_login_at)
         VALUES (?, ?, ?, ?)`,
        [u.id, u.normalizedPhone, u.createdAt, u.lastLoginAt],
      );
    }
    for (const s of sessions.values()) {
      await conn.execute(
        `INSERT INTO baby_auth_sessions (token_hash, user_id, created_at, expires_at, revoked)
         VALUES (?, ?, ?, ?, ?)`,
        [s.tokenHash, s.userId, s.createdAt, s.expiresAt, s.revoked ? 1 : 0],
      );
    }
    for (const v of verifications.values()) {
      await conn.execute(
        `INSERT INTO baby_auth_verifications (id, phone_hash, code_hash, expires_at, attempts, used, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [v.id, v.phoneHash, v.codeHash, v.expiresAt, v.attempts || 0, v.used ? 1 : 0, v.createdAt],
      );
    }
    await conn.commit();
  } catch (err) {
    try { await conn.rollback(); } catch (_) {}
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * 设置数据目录（用于测试隔离）
 * @param {string} dir
 */
function setDataDir(dir) {
  DATA_DIR = path.resolve(dir);
}

function getDataDir() {
  return DATA_DIR;
}

// ─── 内存集合 ──────────────────────────────────────
/** @type {Map<string, UserRecord>} */
const users = new Map();

/** @type {Map<string, SessionRecord>} */
const sessions = new Map();

/** @type {Map<string, VerificationRecord>} */
const verifications = new Map();

// ─── 类型定义（JSDoc）─────────────────────────────────

/**
 * @typedef {Object} UserRecord
 * @property {string} id - crypto.randomUUID()
 * @property {string} normalizedPhone - e.g. +8613800138000
 * @property {string} createdAt - ISO 8601
 * @property {string} lastLoginAt - ISO 8601
 */

/**
 * @typedef {Object} SessionRecord
 * @property {string} tokenHash - SHA-256 of raw token
 * @property {string} userId - references UserRecord.id
 * @property {string} createdAt - ISO 8601
 * @property {string} expiresAt - ISO 8601 (30 days from creation)
 * @property {boolean} revoked
 */

/**
 * @typedef {Object} VerificationRecord
 * @property {string} phoneHash - SHA-256 of normalized phone
 * @property {string} codeHash - SHA-256 of the 6-digit code
 * @property {string} expiresAt - ISO 8601 (5 min from creation)
 * @property {number} attempts - failed verification attempts
 * @property {boolean} used - consumed after successful verify
 * @property {string} createdAt - ISO 8601
 * @property {string} id - unique id for keying in the Map
 */

// ─── 自动持久化（防抖写入） ──────────────────────────
let _saveTimer = null;
const SAVE_DEBOUNCE_MS = 500;

function scheduleSave() {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    _saveTimer = null;
    try {
      saveAll();
    } catch (_) {
      // 静默处理持久化失败，不中断业务
    }
  }, SAVE_DEBOUNCE_MS);
}

// ─── 工具函数 ──────────────────────────────────────

/**
 * SHA-256 哈希
 * @param {string} data
 * @returns {string} hex string
 */
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * 生成安全 session token (64 hex chars)
 * @returns {string} hex string
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 规范化手机号：去除非数字字符，统一 +86 前缀
 * @param {string} phone
 * @returns {string}
 */
function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  // 如果已含 86 前缀
  if (digits.startsWith('86')) {
    return '+' + digits;
  }
  // 否则补 86
  return '+86' + digits;
}

/**
 * 生成 6 位数字验证码
 * @returns {string}
 */
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * 生成唯一 id
 * @returns {string}
 */
function uid() {
  return crypto.randomUUID();
}

// ─── 持久化操作 ──────────────────────────────────────

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * 从 JSON 文件加载数据到 Map
 * @param {string} filePath
 * @param {Map} map
 * @param {string} label - for logging
 */
function loadMap(filePath, map, label) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        map.clear();
        for (const item of arr) {
          if (item.id) {
            map.set(item.id, item);
          }
        }
      }
    }
  } catch (err) {
    console.error(`[DB] Error loading ${label}: ${err.message}`);
  }
}

/**
 * 将 Map 序列化为数组并写入 JSON 文件（原子写入：先写临时文件后 rename）
 * @param {string} filePath
 * @param {Map} map
 */
function saveMap(filePath, map) {
  try {
    ensureDataDir();
    const arr = Array.from(map.values());
    const tmpPath = filePath + '.tmp';
    fs.writeFileSync(tmpPath, JSON.stringify(arr, null, 2), 'utf-8');
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    console.error(`[DB] Error saving ${path.basename(filePath)}: ${err.message}`);
  }
}

/**
 * 从磁盘加载所有数据
 */
function loadAll() {
  ensureDataDir();
  loadMap(USERS_FILE(), users, 'users');
  loadMap(SESSIONS_FILE(), sessions, 'sessions');
  loadMap(VERIFICATIONS_FILE(), verifications, 'verifications');
}

/**
 * 异步加载：mysql 模式从 RDS 灌进内存 Map；json 模式同 loadAll。
 * @returns {Promise<'json'|'mysql'>}
 */
async function loadAllAsync() {
  ensureDataDir();
  if (resolveAuthRepository() === 'mysql') {
    await loadAllFromMysql();
    // 本地 JSON 镜像一份，便于排障与回退
    try {
      saveMap(USERS_FILE(), users);
      saveMap(SESSIONS_FILE(), sessions);
      saveMap(VERIFICATIONS_FILE(), verifications);
    } catch (_) {}
    return 'mysql';
  }
  loadAll();
  return 'json';
}

/**
 * 保存所有数据到磁盘（幂等）；mysql 模式同时刷 RDS。
 */
function saveAll() {
  saveMap(USERS_FILE(), users);
  saveMap(SESSIONS_FILE(), sessions);
  saveMap(VERIFICATIONS_FILE(), verifications);
  if (resolveAuthRepository() === 'mysql') {
    // fire-and-forget；失败打日志，不阻断请求路径
    saveAllToMysql().catch((err) => {
      console.error('[DB] MySQL auth save failed:', err && err.message ? err.message : err);
    });
  }
}

/**
 * 测试/关服：等待 mysql 刷盘完成
 * @returns {Promise<void>}
 */
async function flushAsync() {
  saveMap(USERS_FILE(), users);
  saveMap(SESSIONS_FILE(), sessions);
  saveMap(VERIFICATIONS_FILE(), verifications);
  if (resolveAuthRepository() === 'mysql') {
    await saveAllToMysql();
  }
}

/**
 * 清除所有内存数据（用于测试）
 */
function clearAll() {
  users.clear();
  sessions.clear();
  verifications.clear();
}

// ─── 暴露的 API ────────────────────────────────────

module.exports = {
  // 集合（只读引用，供 auth.js 读写）
  users,
  sessions,
  verifications,

  // 工具函数
  sha256,
  generateToken,
  generateCode,
  normalizePhone,
  uid,

  // 持久化
  loadAll,
  loadAllAsync,
  saveAll,
  flushAsync,
  clearAll,
  scheduleSave,
  setDataDir,
  getDataDir,
  resolveAuthRepository,

  // 常量
  DATA_DIR: getDataDir,
};
