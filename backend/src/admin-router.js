// 嗨洛塔运维后台 API（用户运维 + 经营概览）
// 鉴权：Authorization: Bearer <ADMIN_TOKEN> 或 X-Admin-Token
'use strict';

const express = require('express');
const crypto = require('crypto');
const db = require('./db');
const entitlements = require('./entitlements');
const smsEvents = require('./sms-events');
const contentCatalog = require('./content-catalog');
const { getAliyunConfigStatus, createSmsProvider } = require('./sms-provider');

const router = express.Router();

function timingSafeEqualStr(a, b) {
  const aa = Buffer.from(String(a || ''), 'utf8');
  const bb = Buffer.from(String(b || ''), 'utf8');
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function extractAdminToken(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  if (req.headers['x-admin-token']) return String(req.headers['x-admin-token']).trim();
  if (req.query && req.query.token) return String(req.query.token).trim();
  return '';
}

function requireAdmin(req, res, next) {
  const expected = String(process.env.ADMIN_TOKEN || '').trim();
  if (!expected) {
    return res.status(503).json({
      error: '后台未配置 ADMIN_TOKEN',
      code: 'ADMIN_NOT_CONFIGURED',
    });
  }
  const got = extractAdminToken(req);
  if (!got || !timingSafeEqualStr(got, expected)) {
    return res.status(401).json({ error: '未授权', code: 'ADMIN_UNAUTHORIZED' });
  }
  next();
}

function maskPhone(phone) {
  const s = String(phone || '');
  const digits = s.replace(/\D/g, '');
  if (digits.length < 7) return s || '—';
  const national = digits.startsWith('86') && digits.length > 11 ? digits.slice(2) : digits;
  if (national.length === 11) {
    return `+86${national.slice(0, 3)}****${national.slice(7)}`;
  }
  return `${s.slice(0, 4)}****${s.slice(-2)}`;
}

function dayKey(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function inLastMs(iso, ms) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= ms;
}

function userPublic(u, opts = {}) {
  const vip = entitlements.getVipEntitlement(u.id);
  const sessions = [...db.sessions.values()].filter((s) => s.userId === u.id);
  const activeSessions = sessions.filter(
    (s) => !s.revoked && new Date(s.expiresAt).getTime() > Date.now(),
  ).length;
  return {
    id: u.id,
    phone: opts.fullPhone ? u.normalizedPhone : maskPhone(u.normalizedPhone),
    phoneFull: opts.fullPhone ? u.normalizedPhone : undefined,
    status: u.status === 'banned' ? 'banned' : 'active',
    bannedAt: u.bannedAt || null,
    banReason: u.banReason || null,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
    vipActive: vip.vipActive === true,
    vipProductId: vip.productId || null,
    vipUpdatedAt: vip.updatedAt || null,
    sessionCount: sessions.length,
    activeSessionCount: activeSessions,
  };
}

router.use(requireAdmin);

router.get('/health', (_req, res) => {
  let smsKind = 'unknown';
  let smsOk = false;
  try {
    const p = createSmsProvider({ nodeEnv: process.env.NODE_ENV || 'development' });
    smsKind = p.kind || 'unknown';
    smsOk = true;
  } catch (_err) {
    smsKind = 'error';
    smsOk = false;
  }
  const aliyun = getAliyunConfigStatus ? getAliyunConfigStatus() : { ok: false, missing: [] };
  res.json({
    status: 'ok',
    at: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'development',
    adminTokenConfigured: Boolean(String(process.env.ADMIN_TOKEN || '').trim()),
    smsProvider: process.env.SMS_PROVIDER || 'development',
    sms: {
      provider: process.env.SMS_PROVIDER || 'development',
      kind: smsKind,
      ready: smsOk,
      aliyunConfigOk: aliyun.ok === true,
      aliyunMissing: aliyun.missing || [],
    },
    users: db.users.size,
    sessions: db.sessions.size,
    verifications: db.verifications.size,
    counts: {
      users: db.users.size,
      sessions: db.sessions.size,
      verifications: db.verifications.size,
    },
  });
});

router.get('/stats', (_req, res) => {
  const DAY = 24 * 60 * 60 * 1000;
  const users = [...db.users.values()];
  const sessions = [...db.sessions.values()];
  const now = Date.now();

  const newUsersToday = users.filter((u) => inLastMs(u.createdAt, DAY)).length;
  const newUsers7d = users.filter((u) => inLastMs(u.createdAt, 7 * DAY)).length;
  const activeToday = users.filter((u) => inLastMs(u.lastLoginAt, DAY)).length;
  const active7d = users.filter((u) => inLastMs(u.lastLoginAt, 7 * DAY)).length;
  const banned = users.filter((u) => u.status === 'banned').length;
  const activeSessions = sessions.filter(
    (s) => !s.revoked && new Date(s.expiresAt).getTime() > now,
  ).length;

  const vipRows = entitlements.listEntitlements({ vipOnly: true, limit: 500, page: 1 });
  const vipActive = vipRows.total || 0;

  const days = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date(now - i * DAY);
    days.push(d.toISOString().slice(0, 10));
  }
  const regByDay = Object.fromEntries(days.map((d) => [d, 0]));
  const loginByDay = Object.fromEntries(days.map((d) => [d, 0]));
  for (const u of users) {
    const c = dayKey(u.createdAt);
    const l = dayKey(u.lastLoginAt);
    if (c && regByDay[c] != null) regByDay[c] += 1;
    if (l && loginByDay[l] != null) loginByDay[l] += 1;
  }

  const sms24h = smsEvents.stats(DAY);
  const sms7d = smsEvents.stats(7 * DAY);
  const pendingVerifications = [...db.verifications.values()].filter((v) => {
    if (v.used) return false;
    return new Date(v.expiresAt).getTime() > Date.now();
  }).length;

  res.json({
    generatedAt: new Date().toISOString(),
    users: {
      total: users.length,
      banned,
      newToday: newUsersToday,
      new7d: newUsers7d,
      activeToday,
      active7d,
    },
    sessions: {
      total: sessions.length,
      active: activeSessions,
    },
    vip: {
      active: vipActive,
    },
    sms: {
      sent24h: sms24h.sent,
      failed24h: sms24h.failed,
      total24h: sms24h.total,
      sent7d: sms7d.sent,
      failed7d: sms7d.failed,
      pendingVerifications,
      last24h: sms24h,
      last7d: sms7d,
    },
    series: {
      days,
      registrations: days.map((d) => regByDay[d]),
      logins: days.map((d) => loginByDay[d]),
    },
    notes: [
      'activeToday/active7d 按 lastLoginAt 近似，非埋点 DAU',
      '关卡完成率需学习数据仓库对齐后才能上板',
    ],
  });
});

router.get('/users', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  const status = String(req.query.status || 'all');
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const fullPhone = req.query.fullPhone === '1' || req.query.fullPhone === 'true';

  let rows = [...db.users.values()];
  if (status === 'banned') rows = rows.filter((u) => u.status === 'banned');
  if (status === 'active') rows = rows.filter((u) => u.status !== 'banned');
  if (q) {
    rows = rows.filter((u) => {
      const phone = String(u.normalizedPhone || '').toLowerCase();
      const id = String(u.id || '').toLowerCase();
      return phone.includes(q) || id.includes(q) || maskPhone(u.normalizedPhone).toLowerCase().includes(q);
    });
  }
  rows.sort((a, b) => String(b.lastLoginAt || '').localeCompare(String(a.lastLoginAt || '')));
  const total = rows.length;
  const start = (page - 1) * limit;
  const items = rows.slice(start, start + limit).map((u) => userPublic(u, { fullPhone }));
  res.json({
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit) || 1),
    items,
  });
});

router.get('/users/:id', (req, res) => {
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: '用户不存在', code: 'USER_NOT_FOUND' });
  const sessions = [...db.sessions.values()]
    .filter((s) => s.userId === user.id)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, 30)
    .map((s) => ({
      tokenHashPrefix: String(s.tokenHash || '').slice(0, 10),
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      revoked: !!s.revoked,
      active: !s.revoked && new Date(s.expiresAt).getTime() > Date.now(),
    }));
  res.json({
    user: userPublic(user, { fullPhone: true }),
    sessions,
    vip: entitlements.getVipEntitlement(user.id),
  });
});

router.post('/users/:id/ban', (req, res) => {
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: '用户不存在', code: 'USER_NOT_FOUND' });
  user.status = 'banned';
  user.bannedAt = new Date().toISOString();
  user.banReason = (req.body && req.body.reason) || null;
  let revoked = 0;
  for (const s of db.sessions.values()) {
    if (s.userId === user.id && !s.revoked) {
      s.revoked = true;
      revoked += 1;
    }
  }
  db.scheduleSave();
  res.json({ ok: true, revokedSessions: revoked, user: userPublic(user, { fullPhone: true }) });
});

router.post('/users/:id/unban', (req, res) => {
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: '用户不存在', code: 'USER_NOT_FOUND' });
  user.status = 'active';
  user.bannedAt = null;
  user.banReason = null;
  db.scheduleSave();
  res.json({ ok: true, user: userPublic(user, { fullPhone: true }) });
});

router.post('/users/:id/revoke-sessions', (req, res) => {
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: '用户不存在', code: 'USER_NOT_FOUND' });
  let revoked = 0;
  for (const s of db.sessions.values()) {
    if (s.userId === user.id && !s.revoked) {
      s.revoked = true;
      revoked += 1;
    }
  }
  db.scheduleSave();
  res.json({ ok: true, revokedSessions: revoked });
});

router.post('/users/:id/vip', (req, res) => {
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: '用户不存在', code: 'USER_NOT_FOUND' });
  const productId = (req.body && req.body.productId) || 'baby_island_map_vip_001';
  const vip = entitlements.activateVip(user.id, {
    source: 'admin',
    productId,
    platform: 'admin',
  });
  res.json({ ok: true, vip });
});

router.post('/users/:id/vip/revoke', (req, res) => {
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: '用户不存在', code: 'USER_NOT_FOUND' });
  const vip = entitlements.deactivateVip(user.id);
  res.json({ ok: true, vip });
});

router.get('/sessions', (req, res) => {
  const userId = String(req.query.userId || '').trim();
  const activeOnly = req.query.active === '1' || req.query.active === 'true';
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
  let rows = [...db.sessions.values()];
  if (userId) rows = rows.filter((s) => s.userId === userId);
  if (activeOnly) {
    rows = rows.filter((s) => !s.revoked && new Date(s.expiresAt).getTime() > Date.now());
  }
  rows.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  res.json({
    total: rows.length,
    items: rows.slice(0, limit).map((s) => ({
      userId: s.userId,
      tokenHashPrefix: String(s.tokenHash || '').slice(0, 10),
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      revoked: !!s.revoked,
      active: !s.revoked && new Date(s.expiresAt).getTime() > Date.now(),
    })),
  });
});

router.get('/sms-events', (req, res) => {
  const page = smsEvents.list({
    page: req.query.page,
    limit: req.query.limit,
    onlyFail: req.query.onlyFail,
  });
  res.json({
    ...page,
    stats24h: smsEvents.stats(24 * 60 * 60 * 1000),
  });
});

router.get('/verifications', (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
  const now = Date.now();
  const all = [...db.verifications.values()]
    .map((v) => ({
      idPrefix: String(v.id || '').slice(0, 12),
      phoneHashPrefix: String(v.phoneHash || '').slice(0, 10),
      createdAt: v.createdAt,
      expiresAt: v.expiresAt,
      attempts: v.attempts || 0,
      used: !!v.used,
      expired: new Date(v.expiresAt).getTime() <= now,
    }))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const total = all.length;
  const start = (page - 1) * limit;
  res.json({
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit) || 1),
    items: all.slice(start, start + limit),
  });
});

router.get('/vips', (req, res) => {
  res.json(
    entitlements.listEntitlements({
      vipOnly: req.query.all !== '1',
      page: req.query.page,
      limit: Number(req.query.limit) || 20,
    }),
  );
});

router.get('/rankings', (req, res) => {
  const windowDays = Number(req.query.windowDays) > 0 ? Number(req.query.windowDays) : 7;
  const limit = Number(req.query.limit) || 20;
  res.json(entitlements.listRankings({ windowDays, limit }));
});

// ── 内容：关卡 / 视频 / OSS 映射 ──

router.get('/content/overview', (_req, res) => {
  res.json(contentCatalog.overview());
});

router.get('/content/oss', (_req, res) => {
  res.json(contentCatalog.getOssStatus());
});

router.patch('/content/oss', (req, res) => {
  res.json(contentCatalog.updateOssConfig(req.body || {}));
});
router.put('/content/oss', (req, res) => {
  res.json(contentCatalog.updateOssConfig(req.body || {}));
});

router.get('/content/maps', (_req, res) => {
  res.json({ items: contentCatalog.listMaps() });
});

router.patch('/content/maps/:mapId', (req, res) => {
  res.json({ ok: true, map: contentCatalog.updateMap(req.params.mapId, req.body || {}) });
});

router.get('/content/levels', (req, res) => {
  res.json(
    contentCatalog.listLevels({
      mapId: req.query.mapId,
      status: req.query.status,
      q: req.query.q,
      page: req.query.page,
      limit: req.query.limit,
    }),
  );
});

router.get('/content/levels/:mapId/:levelId', (req, res) => {
  const row = contentCatalog.getLevel(req.params.mapId, req.params.levelId);
  if (!row) return res.status(404).json({ error: '关卡不存在', code: 'LEVEL_NOT_FOUND' });
  res.json(row);
});

router.put('/content/levels/:mapId/:levelId', (req, res) => {
  try {
    const row = contentCatalog.upsertLevel(req.params.mapId, req.params.levelId, req.body || {});
    res.json({ ok: true, level: row });
  } catch (err) {
    const code = err.code || 'LEVEL_UPSERT_FAILED';
    const status = code === 'INVALID_LEVEL' ? 400 : 500;
    res.status(status).json({ error: err.message || '更新失败', code });
  }
});

router.post('/content/levels/:mapId/:levelId/bind-video', (req, res) => {
  try {
    const videoId = req.body && req.body.videoId;
    if (!videoId) {
      return res.status(400).json({ error: '需要 videoId', code: 'VIDEO_ID_REQUIRED' });
    }
    const level = contentCatalog.bindLevelVideo(req.params.mapId, req.params.levelId, videoId);
    res.json({ ok: true, level });
  } catch (err) {
    const code = err.code || 'BIND_FAILED';
    const status = code === 'VIDEO_NOT_FOUND' ? 404 : 400;
    res.status(status).json({ error: err.message || '绑定失败', code });
  }
});

router.post('/content/levels/:mapId/:levelId/unbind-video', (req, res) => {
  try {
    const level = contentCatalog.unbindLevelVideo(req.params.mapId, req.params.levelId);
    res.json({ ok: true, level });
  } catch (err) {
    const code = err.code || 'UNBIND_FAILED';
    const status = code === 'LEVEL_NOT_FOUND' ? 404 : 400;
    res.status(status).json({ error: err.message || '解绑失败', code });
  }
});

router.get('/content/videos', (req, res) => {
  res.json(
    contentCatalog.listVideos({
      q: req.query.q,
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit,
    }),
  );
});

router.post('/content/videos', (req, res) => {
  try {
    const video = contentCatalog.registerVideo(req.body || {});
    res.status(201).json({ ok: true, video });
  } catch (err) {
    const code = err.code || 'REGISTER_FAILED';
    res.status(400).json({ error: err.message || '登记失败', code });
  }
});

router.patch('/content/videos/:id', (req, res) => {
  try {
    const video = contentCatalog.updateVideo(req.params.id, req.body || {});
    res.json({ ok: true, video });
  } catch (err) {
    const code = err.code || 'UPDATE_FAILED';
    const status = code === 'VIDEO_NOT_FOUND' ? 404 : 400;
    res.status(status).json({ error: err.message || '更新失败', code });
  }
});

router.post('/content/scan-local', (_req, res) => {
  res.json({ ok: true, ...contentCatalog.scanLocalVideos() });
});

router.post('/content/publish-asset-packs', (_req, res) => {
  try {
    const result = contentCatalog.publishAssetPacks();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || '发布失败', code: 'PUBLISH_FAILED' });
  }
});

module.exports = router;
module.exports.requireAdmin = requireAdmin;
module.exports.maskPhone = maskPhone;
