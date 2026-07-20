'use strict';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { createAuthRouter } = require('./transport/auth-router');

function configuredCorsOrigins() {
  return (process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean);
}

function createCorsOrigin(environment = 'production') {
  return function corsOrigin(origin, cb) {
    if (!origin) return cb(null, true);
    const isStrictCorsEnv = ['production', 'staging'].includes(environment);
    const configured = configuredCorsOrigins();
    if (configured.includes('*')) return cb(null, true);
    if (origin === 'null') {
      return cb(null, process.env.CORS_ALLOW_NULL_ORIGIN === 'true' || !isStrictCorsEnv);
    }

    try {
      const parsed = new URL(origin);
      const normalized = `${parsed.protocol}//${parsed.host}`;
      const localDev = !isStrictCorsEnv && ['localhost', '127.0.0.1'].includes(parsed.hostname);
      return cb(null, localDev || configured.includes(normalized));
    } catch {
      return cb(null, false);
    }
  };
}

/**
 * Create the Express app — exported for test-server.js and smoke tests.
 * @param {{ authService: AuthService, environment?: string }} deps
 * @returns {import('express').Application}
 */
function createApp({ authService, environment = 'production' }) {
  const app = express();

  // ─── Global middleware ──────────────────────────────────────────
  app.use(cors({
    origin: createCorsOrigin(environment),
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  app.use((error, req, res, _next) => {
    if (error && error.type === 'entity.parse.failed') {
      if (req.path === '/api/auth/verify-code') {
        return res.status(400).json({ error: '手机号和验证码不能为空', code: 'PARAMS_REQUIRED' });
      }
      if (typeof error.body === 'string' && error.body.trim() === 'null') {
        return res.status(400).json({ error: '手机号不能为空', code: 'PHONE_REQUIRED' });
      }
      return res.status(400).json({ error: '手机号格式不正确', code: 'INVALID_PHONE' });
    }

    console.error('[app] unhandled error:', error);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  });

  // ─── Health check ───────────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // ─── Auth routes ───────────────────────────────────────────────
  app.use('/api/auth', createAuthRouter({ authService, environment }));

  // ─── 404 handler ──────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
  });

  // ─── Error handler (unexpected synchronous errors) ─────────────
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error('[app] unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  });

  return app;
}

module.exports = { createApp, createCorsOrigin };
