// 宝宝闯关 · 认证路由
// POST   /api/auth/send-code     — 发送验证码
// POST   /api/auth/verify-code   — 验证码校验 + 登录
// GET    /api/auth/session       — 获取当前会话用户信息
// POST   /api/auth/logout        — 登出

'use strict';

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const db = require('./db');
const { createSmsProvider, maskPhone } = require('./sms-provider');
const { ipLimiter } = require('./security');
const { isVirtualLoginCode } = require('./virtual-login');
const smsEvents = require('./sms-events');

// ─── 限流配置 ──────────────────────────────────────
const RATE_LIMIT = {
  PHONE_MAX_SENDS: 5,              // 同手机号最大发送次数
  PHONE_WINDOW_MS: 15 * 60 * 1000, // 15 分钟窗口
  COOLDOWN_MS: 60 * 1000,          // 同手机号发送冷却 60 秒
  CODE_EXPIRY_MS: 5 * 60 * 1000,   // 验证码有效期 5 分钟
  MAX_ATTEMPTS: 3,                 // 验证码最大尝试次数
  SESSION_DAYS: 30,                // 会话有效期 30 天
};

// ─── SmsProvider 实例 ──────────────────────────────
let smsProvider;

function getSmsProvider() {
  if (!smsProvider) {
    smsProvider = createSmsProvider();
  }
  return smsProvider;
}

/** 重置 SMS provider（测试用 — 环境变量变化后重新初始化） */
function resetSmsProvider() {
  smsProvider = null;
}

// ─── 中间件：提取 token (from cookie or Authorization header) ──
function extractToken(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  if (req.cookies && req.cookies.session_token) {
    return req.cookies.session_token;
  }
  return null;
}

// ─── 中间件：需要认证 ──────────────────────────────
function requireAuth(req, res, next) {
  const rawToken = extractToken(req);
  if (!rawToken) {
    return res.status(401).json({ error: '未登录', code: 'UNAUTHORIZED' });
  }

  const tokenHash = db.sha256(rawToken);
  const session = db.sessions.get(tokenHash);

  if (!session || session.revoked) {
    return res.status(401).json({ error: '会话已失效', code: 'SESSION_REVOKED' });
  }

  if (new Date(session.expiresAt) < new Date()) {
    db.sessions.delete(tokenHash);
    return res.status(401).json({ error: '会话已过期', code: 'SESSION_EXPIRED' });
  }

  const user = db.users.get(session.userId);
  if (!user) {
    db.sessions.delete(tokenHash);
    return res.status(401).json({ error: '用户不存在', code: 'USER_NOT_FOUND' });
  }

  if (user.status === 'banned') {
    return res.status(403).json({ error: '账号已停用', code: 'USER_BANNED' });
  }

  req.session = session;
  req.user = user;
  req.tokenHash = tokenHash;
  next();
}

// ─── 1. POST /api/auth/send-code ──────────────────
// IP 限流作用于本路由
router.post('/send-code', ipLimiter.middleware(), async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: '手机号不能为空', code: 'PHONE_REQUIRED' });
    }

    const normalizedPhone = db.normalizePhone(phone);

    const digits = normalizedPhone.replace(/\D/g, '');
    if (digits.length < 11) {
      return res.status(400).json({ error: '手机号格式不正确', code: 'INVALID_PHONE' });
    }

    const phoneHash = db.sha256(normalizedPhone);
    const now = Date.now();

    // ── 限流 1：同手机号 60s 冷却 ──────────────────
    let mostRecentTime = 0;
    for (const v of db.verifications.values()) {
      if (v.phoneHash === phoneHash) {
        const vTime = new Date(v.createdAt).getTime();
        if (vTime > mostRecentTime) {
          mostRecentTime = vTime;
        }
      }
    }

    if (mostRecentTime > 0 && now - mostRecentTime < RATE_LIMIT.COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RATE_LIMIT.COOLDOWN_MS - (now - mostRecentTime)) / 1000);
      return res.status(429).json({
        error: `发送太频繁，请 ${waitSeconds} 秒后再试`,
        code: 'COOLDOWN',
      });
    }

    // ── 限流 2：同手机号 5 次 / 15 分钟 ────────────
    let recentCount = 0;
    for (const v of db.verifications.values()) {
      if (v.phoneHash === phoneHash) {
        const vTime = new Date(v.createdAt).getTime();
        if (now - vTime < RATE_LIMIT.PHONE_WINDOW_MS) {
          recentCount++;
        }
      }
    }

    if (recentCount >= RATE_LIMIT.PHONE_MAX_SENDS) {
      return res.status(429).json({
        error: '发送太频繁，请稍后再试',
        code: 'RATE_LIMITED',
      });
    }

    // ── 生成并发送验证码 ──────────────────────────
    const code = db.generateCode();
    const codeHash = db.sha256(code);

    const vKey = phoneHash + ':' + codeHash;
    const verification = {
      id: vKey,
      phoneHash,
      codeHash,
      expiresAt: new Date(now + RATE_LIMIT.CODE_EXPIRY_MS).toISOString(),
      attempts: 0,
      used: false,
      createdAt: new Date(now).toISOString(),
    };

    db.verifications.set(vKey, verification);
    db.scheduleSave();

    try {
      await getSmsProvider().send(normalizedPhone, code);
      smsEvents.record({
        phone: normalizedPhone,
        ok: true,
        provider: (getSmsProvider().kind || process.env.SMS_PROVIDER || 'unknown'),
      });
    } catch (sendErr) {
      // 发送失败则回滚本条验证码，避免占用冷却/限流配额
      db.verifications.delete(vKey);
      db.scheduleSave();
      smsEvents.record({
        phone: normalizedPhone,
        ok: false,
        provider: (smsProvider && smsProvider.kind) || process.env.SMS_PROVIDER || 'unknown',
        errorCode: sendErr.code || 'SEND_FAILED',
        errorMessage: sendErr.message || String(sendErr),
      });
      throw sendErr;
    }

    console.log(`[AUTH] send-code: ${maskPhone(normalizedPhone)} — code sent`);

    // 仅当 development 环境 + development provider 时返回 debugCode 用于前端UI
    const isDevMode =
      (process.env.NODE_ENV || 'development') === 'development' &&
      (process.env.SMS_PROVIDER || 'development') === 'development';

    const response = { success: true };
    if (isDevMode) {
      response.debugCode = code;
    }
    return res.json(response);
  } catch (err) {
    // 短信供应商未配置 / 凭据缺失 / 生产误配 development → 503
    if (
      err.code === 'SMS_UNAVAILABLE' ||
      (err.message && (
        err.message.includes('SmsProvider not configured') ||
        err.message.includes('短信服务尚未接入') ||
        err.message.includes('未接入') ||
        err.message.includes('Unknown SMS_PROVIDER') ||
        err.message.includes('尚未接入') ||
        err.message.includes('not properly configured') ||
        err.message.includes('Aliyun SMS not configured') ||
        err.message.includes('Aliyun SMS credentials incomplete')
      ))
    ) {
      console.error('[AUTH] send-code: SMS provider not available');
      return res.status(503).json({
        error: '短信服务暂不可用，请稍后再试',
        code: 'SMS_UNAVAILABLE',
      });
    }
    console.error('[AUTH] send-code error');
    return res.status(500).json({ error: '发送验证码失败', code: 'SEND_FAILED' });
  }
});

// ─── 2. POST /api/auth/verify-code ────────────────
router.post('/verify-code', async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: '手机号和验证码不能为空', code: 'PARAMS_REQUIRED' });
    }

    const normalizedPhone = db.normalizePhone(phone);
    const digits = normalizedPhone.replace(/\D/g, '');
    // 国内 11 位（去掉 86 后）
    const national = digits.startsWith('86') && digits.length === 13 ? digits.slice(2) : digits;
    if (!/^1\d{10}$/.test(national)) {
      return res.status(400).json({ error: '手机号格式不正确', code: 'INVALID_PHONE' });
    }

    const phoneHash = db.sha256(normalizedPhone);
    const now = Date.now();

    // ── 虚拟登录：开发态任意 11 位手机号 + 任意 4–6 位验证码，无需先发短信 ──
    if (isVirtualLoginCode(code)) {
      console.log(`[AUTH] verify-code: virtual login for ${maskPhone(normalizedPhone)}`);
      return issueLoginSession(res, normalizedPhone, phoneHash, now);
    }

    // 同一条验证码：用 key 追踪，找到后可直接删除
    /** @type {Array<{key: string, record: object}>} */
    const candidates = [];

    for (const [key, v] of db.verifications.entries()) {
      if (v.phoneHash === phoneHash && !v.used && new Date(v.expiresAt).getTime() > now) {
        candidates.push({ key, record: v });
      }
    }

    if (candidates.length === 0) {
      return res.status(400).json({
        error: '验证码错误或已过期',
        code: 'VERIFICATION_EXPIRED',
      });
    }

    // 取最新的一条验证码
    candidates.sort((a, b) => {
      return new Date(b.record.createdAt).getTime() - new Date(a.record.createdAt).getTime();
    });
    const { key: vKey, record: verification } = candidates[0];

    // ── 检查尝试次数上限 ──────────────────────────
    if (verification.attempts >= RATE_LIMIT.MAX_ATTEMPTS) {
      // 立即从数据库删除——验证码已失效
      db.verifications.delete(vKey);
      return res.status(400).json({
        error: '验证码错误或已过期',
        code: 'ATTEMPTS_EXCEEDED',
      });
    }

    // ── 校验验证码 ──────────────────────────────
    const inputCodeHash = db.sha256(String(code));

    if (inputCodeHash !== verification.codeHash) {
      verification.attempts += 1;
      if (verification.attempts >= RATE_LIMIT.MAX_ATTEMPTS) {
        db.verifications.delete(vKey);
      }
      return res.status(400).json({
        error: '验证码错误或已过期',
        code: 'INVALID_CODE',
      });
    }

    // ═══════════════════════════════════════════════
    // 验证成功 — 一次性消费，立即从数据库删除哈希
    // ═══════════════════════════════════════════════
    db.verifications.delete(vKey);
    db.scheduleSave();

    return issueLoginSession(res, normalizedPhone, phoneHash, now);
  } catch (err) {
    console.error('[AUTH] verify-code error');
    return res.status(500).json({ error: '验证失败', code: 'VERIFY_FAILED' });
  }
});

/**
 * 签发 session cookie + token + user（正式验证与虚拟登录共用）
 */
function issueLoginSession(res, normalizedPhone, phoneHash, now) {
  // 查找或创建用户
  const existingUser = Array.from(db.users.values()).find(
    (u) => db.sha256(u.normalizedPhone) === phoneHash
  );

  let user;
  if (existingUser) {
    if (existingUser.status === 'banned') {
      return res.status(403).json({ error: '账号已停用', code: 'USER_BANNED' });
    }
    user = existingUser;
    user.lastLoginAt = new Date(now).toISOString();
    db.scheduleSave();
  } else {
    user = {
      id: db.uid(),
      normalizedPhone,
      status: 'active',
      createdAt: new Date(now).toISOString(),
      lastLoginAt: new Date(now).toISOString(),
    };
    db.users.set(user.id, user);
    db.scheduleSave();
  }

  const rawToken = db.generateToken();
  const tokenHash = db.sha256(rawToken);
  const expiresAt = new Date(now + RATE_LIMIT.SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const session = {
    id: tokenHash,
    tokenHash,
    userId: user.id,
    createdAt: new Date(now).toISOString(),
    expiresAt,
    revoked: false,
  };
  db.sessions.set(tokenHash, session);
  db.scheduleSave();

  res.cookie('session_token', rawToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: RATE_LIMIT.SESSION_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  });

  console.log('[AUTH] verify-code: login success');

  return res.json({
    token: rawToken,
    user: {
      id: user.id,
      normalizedPhone: user.normalizedPhone,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      isLoggedIn: true,
      hasFullAccess: false,
    },
  });
}

// ─── 3. GET /api/auth/session ──────────────────
router.get('/session', requireAuth, (req, res) => {
  return res.json({
    user: {
      id: req.user.id,
      normalizedPhone: req.user.normalizedPhone,
      createdAt: req.user.createdAt,
      lastLoginAt: req.user.lastLoginAt,
      isLoggedIn: true,
      hasFullAccess: false,
    },
  });
});

// ─── 4. POST /api/auth/logout ────────────────────
router.post('/logout', (req, res) => {
  const rawToken = extractToken(req);

  if (rawToken) {
    const tokenHash = db.sha256(rawToken);
    const session = db.sessions.get(tokenHash);
    if (session) {
      session.revoked = true;
      db.scheduleSave();
    }
  }

  res.clearCookie('session_token', { path: '/' });

  return res.json({ success: true });
});

module.exports = router;
module.exports.requireAuth = requireAuth;
module.exports.resetSmsProvider = resetSmsProvider;
