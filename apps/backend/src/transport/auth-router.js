'use strict';

const express = require('express');
const { ContractError, PHONE_REQUIRED, INVALID_PHONE, PARAMS_REQUIRED } = require('../errors');
const { isAcceptableLoginCodeFormat } = require('../virtual-login');

/**
 * Extract raw session token from request.
 * Tries Authorization: Bearer header first, then session_token cookie.
 * @param {import('express').Request} req
 * @returns {string|null}
 */
function extractToken(req) {
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  if (req.cookies && req.cookies.session_token) {
    return req.cookies.session_token;
  }
  return null;
}

/**
 * Validate SendCodeRequest body — enforces additionalProperties: false
 * and correct error codes per contract.
 * @param {*} body
 * @returns {{ phone: string }}
 */
function validateSendCode(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw PHONE_REQUIRED('手机号不能为空');
  }

  if (!Object.prototype.hasOwnProperty.call(body, 'phone') || body.phone === '') {
    throw PHONE_REQUIRED('手机号不能为空');
  }

  const keys = Object.keys(body);
  if (keys.length !== 1 || typeof body.phone !== 'string') {
    throw INVALID_PHONE('手机号格式不正确');
  }

  return { phone: body.phone };
}

/**
 * Validate VerifyCodeRequest body — enforces additionalProperties: false
 * and correct error codes per contract.
 * @param {*} body
 * @returns {{ phone: string, code: string }}
 */
function validateVerifyCode(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw PARAMS_REQUIRED('手机号和验证码不能为空');
  }

  const keys = Object.keys(body);
  const hasRequiredFields =
    Object.prototype.hasOwnProperty.call(body, 'phone') &&
    Object.prototype.hasOwnProperty.call(body, 'code');

  if (
    keys.length !== 2 ||
    !hasRequiredFields ||
    typeof body.phone !== 'string' ||
    typeof body.code !== 'string' ||
    !/^\d{11}$/.test(body.phone) ||
    !isAcceptableLoginCodeFormat(body.code)
  ) {
    throw PARAMS_REQUIRED('手机号和验证码不能为空');
  }

  return { phone: body.phone, code: body.code };
}

/**
 * Create the auth transport router.
 * @param {{ authService: AuthService, environment: string }} deps
 * @returns {import('express').Router}
 */
function createAuthRouter({ authService, environment }) {
  const router = express.Router();

  // ─── POST /api/auth/send-code ──────────────────────────────────
  router.post('/send-code', async (req, res) => {
    try {
      const { phone } = validateSendCode(req.body);
      const ip =
        req.ip ||
        req.socket?.remoteAddress ||
        req.connection?.remoteAddress ||
        '127.0.0.1';
      const result = await authService.sendCode(phone, ip);
      return res.json(result);
    } catch (err) {
      if (err instanceof ContractError) {
        return res.status(err.status).json({ error: err.message, code: err.code });
      }
      console.error('[auth-router] send-code unexpected error:', err);
      return res.status(500).json({ error: '发送验证码失败', code: 'SEND_FAILED' });
    }
  });

  // ─── POST /api/auth/verify-code ─────────────────────────────────
  router.post('/verify-code', async (req, res) => {
    try {
      const { phone, code } = validateVerifyCode(req.body);
      const result = await authService.verifyCode(phone, code);

      // Set HttpOnly cookie for session
      const cookieOptions = {
        httpOnly: true,
        sameSite: 'lax',
        secure: environment === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
        path: '/',
      };
      res.cookie('session_token', result.token, cookieOptions);

      return res.json(result);
    } catch (err) {
      if (err instanceof ContractError) {
        return res.status(err.status).json({ error: err.message, code: err.code });
      }
      console.error('[auth-router] verify-code unexpected error:', err);
      return res.status(500).json({ error: '验证失败', code: 'VERIFY_FAILED' });
    }
  });

  // ─── GET /api/auth/session ──────────────────────────────────────
  router.get('/session', (req, res) => {
    try {
      const token = extractToken(req);
      if (!token) {
        return res.status(401).json({ error: '未登录', code: 'UNAUTHORIZED' });
      }
      const { user } = authService.getSession(token);
      return res.json({ user });
    } catch (err) {
      if (err instanceof ContractError) {
        return res.status(err.status).json({ error: err.message, code: err.code });
      }
      console.error('[auth-router] session unexpected error:', err);
      return res.status(500).json({ error: '验证失败', code: 'VERIFY_FAILED' });
    }
  });

  // ─── POST /api/auth/logout ───────────────────────────────────────
  router.post('/logout', (req, res) => {
    try {
      const token = extractToken(req);
      authService.logout(token);
      res.clearCookie('session_token', { path: '/' });
      return res.json({ success: true });
    } catch (err) {
      if (err instanceof ContractError) {
        return res.status(err.status).json({ error: err.message, code: err.code });
      }
      console.error('[auth-router] logout unexpected error:', err);
      return res.json({ success: true }); // logout is idempotent
    }
  });

  return router;
}

module.exports = { createAuthRouter };
