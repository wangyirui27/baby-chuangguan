// App 端「我的」相关 API：权益 + 排行（登录用户）
// 不替代 App Store 收据密码学校验；先把登录用户的服务端账本打通。
'use strict';

const express = require('express');
const entitlements = require('./entitlements');

/**
 * @param {{ requireAuth: Function }} options
 */
function createMeRouter(options = {}) {
  const requireAuth = options.requireAuth;
  if (typeof requireAuth !== 'function') {
    throw new Error('createMeRouter requires requireAuth');
  }

  const router = express.Router();

  router.get('/entitlements', requireAuth, (req, res) => {
    const vip = entitlements.getVipEntitlement(req.user.id);
    return res.json({
      hasFullAccess: vip.vipActive === true,
      vip,
    });
  });

  /**
   * 客户端 IAP 成功后上报（或运维侧等效）。
   * 生产应再加 App Store Server API 验票；此处至少写入服务端账本，防「纯 localStorage 改 VIP」。
   */
  router.post('/entitlements/vip', requireAuth, (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const productId = String(body.productId || body.product_id || 'vip_map_unlock').slice(0, 80);
    const platform = String(body.platform || 'unknown').slice(0, 20);
    const source = String(body.source || 'iap').slice(0, 40);
    const receipt = body.receipt || body.transactionId || body.transaction_id || null;

    const vip = entitlements.activateVip(req.user.id, {
      productId,
      platform,
      source,
      receipt,
    });

    return res.json({
      ok: true,
      hasFullAccess: vip.vipActive === true,
      vip,
    });
  });

  router.post('/ranking', requireAuth, (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const row = entitlements.upsertRankingScore(req.user.id, {
      starsAll: body.starsAll ?? body.stars_all,
      stars7d: body.stars7d ?? body.stars_7d,
      childName: body.childName ?? body.child_name,
    });
    return res.json({ ok: true, ranking: row });
  });

  return router;
}

/**
 * 公开排行榜（无需登录；不含手机号）
 */
function createRankingsRouter() {
  const router = express.Router();
  router.get('/', (req, res) => {
    const windowDays = Number(req.query.windowDays || req.query.window_days || 7);
    const limit = Number(req.query.limit || 20);
    return res.json(entitlements.listRankings({ windowDays, limit }));
  });
  return router;
}

module.exports = {
  createMeRouter,
  createRankingsRouter,
};
