// 宝宝闯关 · 本机 JSON 权益/排行账本（不依赖 InsForge schema）
// 真生产 IAP 收据校验可再接 App Store Server API；此处先做「登录用户服务端权益」防纯本地改 storage。
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let DATA_DIR = path.resolve(__dirname, '..', '..', 'data');
const ENTITLEMENTS_FILE = () => path.join(DATA_DIR, 'entitlements.json');
const RANKING_FILE = () => path.join(DATA_DIR, 'ranking-scores.json');

/** @type {Map<string, object>} */
const entitlements = new Map();
/** @type {Map<string, object>} */
const rankingScores = new Map();

let _saveTimer = null;

function setDataDir(dir) {
  DATA_DIR = path.resolve(dir);
}

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadJson(file, map) {
  map.clear();
  try {
    if (!fs.existsSync(file)) return;
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (raw && typeof raw === 'object') {
      Object.entries(raw).forEach(([k, v]) => {
        if (v && typeof v === 'object') map.set(k, v);
      });
    }
  } catch (err) {
    console.error('[ENTITLEMENTS] load failed', file, err && err.message);
  }
}

function saveJson(file, map) {
  ensureDir();
  const obj = {};
  map.forEach((v, k) => {
    obj[k] = v;
  });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, file);
}

function scheduleSave() {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    _saveTimer = null;
    try {
      saveJson(ENTITLEMENTS_FILE(), entitlements);
      saveJson(RANKING_FILE(), rankingScores);
    } catch (err) {
      console.error('[ENTITLEMENTS] save failed', err && err.message);
    }
  }, 300);
}

function loadAll() {
  loadJson(ENTITLEMENTS_FILE(), entitlements);
  loadJson(RANKING_FILE(), rankingScores);
}

function getVipEntitlement(userId) {
  const row = entitlements.get(String(userId));
  if (!row || row.vipActive !== true) {
    return { vipActive: false, source: null, updatedAt: null, productId: null };
  }
  return {
    vipActive: true,
    source: row.source || 'server',
    updatedAt: row.updatedAt || null,
    productId: row.productId || null,
  };
}

function activateVip(userId, options = {}) {
  const id = String(userId);
  const now = new Date().toISOString();
  const row = {
    vipActive: true,
    source: String(options.source || 'iap').slice(0, 40),
    productId: String(options.productId || 'vip_map_unlock').slice(0, 80),
    // 收据原文不落盘明文过长：只存哈希，便于审计「有没有提交过」
    receiptHash: options.receipt
      ? crypto.createHash('sha256').update(String(options.receipt)).digest('hex')
      : (options.receiptHash || null),
    platform: String(options.platform || 'unknown').slice(0, 20),
    updatedAt: now,
    createdAt: (entitlements.get(id) && entitlements.get(id).createdAt) || now,
  };
  entitlements.set(id, row);
  scheduleSave();
  return getVipEntitlement(id);
}

function clearUser(userId) {
  const id = String(userId);
  entitlements.delete(id);
  rankingScores.delete(id);
  scheduleSave();
}

function maskName(name) {
  const text = String(name || '同学').trim() || '同学';
  const chars = Array.from(text);
  if (chars.length <= 1) return `${chars[0] || '同'}*`;
  if (chars.length === 2) return `${chars[0]}*`;
  return `${chars[0]}**`;
}

function upsertRankingScore(userId, payload = {}) {
  const id = String(userId);
  const now = new Date().toISOString();
  const prev = rankingScores.get(id) || {};
  const starsAll = Math.max(0, Math.min(999999, Number(payload.starsAll) || 0));
  const stars7d = Math.max(0, Math.min(999999, Number(payload.stars7d) || 0));
  const childName = String(payload.childName || prev.childName || '同学').slice(0, 10);
  const row = {
    userId: id,
    childName,
    displayName: maskName(childName),
    starsAll,
    stars7d,
    updatedAt: now,
  };
  rankingScores.set(id, row);
  scheduleSave();
  return row;
}

function listRankings(options = {}) {
  const windowDays = Number(options.windowDays) > 0 ? Number(options.windowDays) : 7;
  const use7d = windowDays <= 14;
  const limit = Math.min(50, Math.max(1, Number(options.limit) || 20));
  const rows = [...rankingScores.values()]
    .map((row) => ({
      name: row.displayName || maskName(row.childName),
      score: use7d ? (row.stars7d || 0) : (row.starsAll || 0),
      starsAll: row.starsAll || 0,
      stars7d: row.stars7d || 0,
      updatedAt: row.updatedAt,
      userId: row.userId,
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || String(b.updatedAt).localeCompare(String(a.updatedAt)))
    .slice(0, limit)
    .map((row, index) => ({
      rank: index + 1,
      name: row.name,
      score: row.score,
      isCurrent: false,
    }));
  return {
    windowDays,
    generatedAt: new Date().toISOString(),
    items: rows,
  };
}

loadAll();

module.exports = {
  setDataDir,
  loadAll,
  getVipEntitlement,
  activateVip,
  clearUser,
  upsertRankingScore,
  listRankings,
  maskName,
};
