'use strict';

/**
 * 宝宝闯关 · API Server Entry Point
 * Uses AUTH_REPOSITORY=memory (only supported backend for now).
 * Port 3000 unless PORT is set.
 *
 * SMS: SMS_PROVIDER=development | aliyun
 * Aliyun credentials via env (see .env.example).
 */

// Prefer monorepo root backend/.env (shared with legacy backend + 影关 SMS keys)
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const monorepoEnv = path.resolve(__dirname, '../../../backend/.env');
const localEnv = path.resolve(__dirname, '../../.env');
if (fs.existsSync(monorepoEnv)) dotenv.config({ path: monorepoEnv });
else if (fs.existsSync(localEnv)) dotenv.config({ path: localEnv });
else dotenv.config();

const { createApp } = require('./app');
const { MemoryAuthRepository } = require('./repository/memory-auth-repository');
const { AuthService } = require('./service/auth-service');
const { createSmsProvider, getAliyunConfigStatus } = require('./sms-provider');

const PORT = process.env.PORT || 3000;
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const AUTH_REPOSITORY = process.env.AUTH_REPOSITORY || 'memory';
const SMS_PROVIDER_NAME = (process.env.SMS_PROVIDER || 'development').toLowerCase();

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

// ─── SMS provider ────────────────────────────────────────────────
/** @type {object} */
let smsProvider;
try {
  smsProvider = createSmsProvider({ nodeEnv: ENVIRONMENT });
} catch (err) {
  console.error(`[server] SMS provider init failed: ${err.message}`);
  if (SMS_PROVIDER_NAME === 'aliyun') {
    const status = getAliyunConfigStatus();
    if (!status.ok) {
      console.error(`[server] Missing Aliyun env: ${status.missing.join(', ')}`);
      console.error('[server] Fill credentials in .env (see .env.example), then restart.');
    }
  }
  if (ENVIRONMENT === 'production' || ENVIRONMENT === 'staging') {
    process.exit(1);
  }
  // 非生产：启动失败也退出，避免 silent 无短信
  process.exit(1);
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
  console.log(`[server] AUTH_REPOSITORY=${AUTH_REPOSITORY}  SMS_PROVIDER=${SMS_PROVIDER_NAME}  PORT=${PORT}`);
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
