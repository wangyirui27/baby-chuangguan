'use strict';

/**
 * 宝宝闯关 · API Server Entry Point
 * Uses AUTH_REPOSITORY=memory (only supported backend for now).
 * Port 3000 unless PORT is set.
 */

require('dotenv').config();

const { createApp } = require('./app');
const { MemoryAuthRepository } = require('./repository/memory-auth-repository');
const { AuthService } = require('./service/auth-service');

const PORT = process.env.PORT || 3000;
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const AUTH_REPOSITORY = process.env.AUTH_REPOSITORY || 'memory';

// ─── Repository selection (memory only for now) ──────────────────
/** @type {object} */
let repository;
switch (AUTH_REPOSITORY) {
  case 'memory':
    repository = new MemoryAuthRepository();
    break;
  default:
    console.error(`[server] AUTH_REPOSITORY="${AUTH_REPOSITORY}" is not supported.`);
    console.error('[server] Supported: memory. DATABASE_URL is a future boundary only.');
    process.exit(1);
}

// ─── Development SMS provider (no real SMS) ─────────────────────
const DevelopmentSmsProvider = {
  kind: 'development',
  async send(phone, code) {
    console.log(`\n╔═════════════════════════════════════════════╗`);
    console.log(`║           [DEV SMS] 验证码                   ║`);
    console.log(`║  手机号: ${phone.replace(/(\+86)(\d{3})(\d{4})(\d{4})/, '$1$2****$4')}  ║`);
    console.log(`║  验证码: ${code}                             ║`);
    console.log(`║  有效期: 5 分钟                               ║`);
    console.log(`╚═════════════════════════════════════════════╝\n`);
  },
};

// Use environment-specific SMS provider
let smsProvider;
if (ENVIRONMENT === 'production' || ENVIRONMENT === 'staging') {
  const providerName = process.env.SMS_PROVIDER || 'development';
  if (providerName === 'development') {
    console.warn('[server] WARNING: SMS_PROVIDER=development in production/staging!');
  }
  // Real providers (aliyun/tencent) not yet implemented — fail fast
  if (providerName !== 'development') {
    console.error(`[server] SMS_PROVIDER="${providerName}" is not yet implemented.`);
    console.error('[server] Set SMS_PROVIDER=development for local testing.');
    process.exit(1);
  }
  smsProvider = DevelopmentSmsProvider;
} else {
  // development / test
  smsProvider = DevelopmentSmsProvider;
}

// ─── AuthService ──────────────────────────────────────────────────
const authService = new AuthService({
  repository,
  smsProvider,
  environment: ENVIRONMENT,
});

// ─── App + server ────────────────────────────────────────────────
const app = createApp({ authService, environment: ENVIRONMENT });

const server = app.listen(PORT, () => {
  console.log(`[server] 宝宝闯关 API listening on http://localhost:${PORT} (${ENVIRONMENT})`);
  console.log(`[server] AUTH_REPOSITORY=${AUTH_REPOSITORY}  PORT=${PORT}`);
});

// ─── Graceful shutdown ──────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n[server] Received ${signal}, shutting down...`);
  server.close(() => {
    console.log('[server] Closed.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('[server] Forced exit after timeout.');
    process.exit(1);
  }, 5000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = { app, server };
