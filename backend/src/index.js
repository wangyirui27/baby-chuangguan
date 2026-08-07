// 宝宝闯关 · 后端统一服务入口
// 静态文件 + API 同端口，支持 file:// 降级

const dotenv = require('dotenv');
const path = require('path');
// 支持从仓库根目录启动：优先 backend/.env，再回退 cwd/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();
// 可选 MySQL 覆盖文件（gitignore）
dotenv.config({
  path: path.join(__dirname, '..', '.env.mysql.local'),
  override: true,
});

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./db');
const authRouter = require('./auth');
const { createLearningRouter, localMathCoachPlan } = require('./learning');
const { createMathCoachProvider } = require('./math-coach-ai');
const { createLearningRepositoryFromEnv } = require('./learning-repository-factory');
const entitlements = require('./entitlements');
const smsEvents = require('./sms-events');
const contentCatalog = require('./content-catalog');
const adminRouter = require('./admin-router');
const { createMeRouter, createRankingsRouter } = require('./me-router');

const app = express();
const PORT = process.env.PORT || 3000;
const mathCoach = createMathCoachProvider({ fallback: localMathCoachPlan });
const learningBackend = createLearningRepositoryFromEnv();

// ─── CORS 配置 ──────────────────────────────────────
// 支持 null origin (file:// 场景) 和可配置 origin 白名单
function corsOrigin(origin, callback) {
  // 允许无 origin 的请求（file://、curl、等）
  if (!origin) {
    return callback(null, true);
  }
  const isStrictCorsEnv = ['production', 'staging'].includes(process.env.NODE_ENV);

  // 开发模式允许本地地址
  const allowedOrigins = [];

  // 从环境变量读取自定义白名单（逗号分隔）
  const envOrigins = process.env.CORS_ORIGINS;
  if (envOrigins) {
    allowedOrigins.push(...envOrigins.split(',').map(s => s.trim()));
  }

  // 开发/测试默认允许本地调试；生产/staging 必须显式配置 CORS_ORIGINS。
  const defaultAllowed = isStrictCorsEnv ? [] : [
    'null',           // file:// 场景
    'http://localhost',
    `http://localhost:${PORT}`,
    'http://127.0.0.1',
    `http://127.0.0.1:${PORT}`,
  ];

  const allAllowed = [...allowedOrigins, ...defaultAllowed];

  if (allAllowed.includes(origin)) {
    return callback(null, true);
  }

  // 通配符 * 允许所有
  if (allAllowed.includes('*')) {
    return callback(null, true);
  }

  // 检查是否是 null origin 字符串
  if (origin === 'null') {
    return callback(null, process.env.CORS_ALLOW_NULL_ORIGIN === 'true' || !isStrictCorsEnv);
  }

  callback(null, !isStrictCorsEnv);
}

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

// ─── 请求解析 ────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ─── 静态文件 ────────────────────────────────────────
app.use(express.static(path.resolve(__dirname, '..', '..')));

// ─── 健康检查 ──────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    learningBackend: learningBackend.kind,
    learningConfigured: Boolean(learningBackend.repository),
    smsProvider: process.env.SMS_PROVIDER || 'development',
    nodeEnv: process.env.NODE_ENV || 'development',
  });
});

// 向后兼容
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ─── 认证路由 ──────────────────────────────────────
app.use('/api/auth', authRouter);

// ─── 学习数据路由 ──────────────────────────────────
// math-coach: default = local rules (streak → easier/harder). Remote LLM only if
// MATH_COACH_AI_ENABLED=1 and a key are set; any failure falls back to localMathCoachPlan.
app.use('/api/learning', createLearningRouter({
  repository: learningBackend.repository,
  requireAuth: authRouter.requireAuth,
  mathCoach,
}));

// ─── 登录用户权益 / 公开排行 ──────────────────────
app.use('/api/me', createMeRouter({ requireAuth: authRouter.requireAuth }));
app.use('/api/rankings', createRankingsRouter());

// ─── 运维后台 API + 页面入口 ──────────────────────
app.use('/api/admin', adminRouter);
app.get(['/admin', '/admin/'], (_req, res) => {
  res.sendFile(path.resolve(__dirname, '..', '..', 'admin', 'index.html'));
});

// ─── 404 兜底 ──────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
});

// ─── 启动 ──────────────────────────────────────────
function start() {
  // 鉴权：json 本地文件 或 mysql(RDS) → 内存 Map
  const boot = Promise.resolve()
    .then(() => (typeof db.loadAllAsync === 'function' ? db.loadAllAsync() : (db.loadAll(), 'json')))
    .then((authBackend) => {
      entitlements.loadAll();
      smsEvents.load();
      contentCatalog.load();

      const server = app.listen(PORT, () => {
        const mode = process.env.NODE_ENV || 'development';
        console.log(`[INFO] Server listening on http://localhost:${PORT} (${mode})`);
        console.log(`[INFO] Auth repository: ${authBackend}`);
        console.log(`[INFO] SMS provider: ${process.env.SMS_PROVIDER || 'development'}`);
        console.log(
          `[INFO] Learning backend: ${learningBackend.kind}` +
            (learningBackend.repository ? '' : ' (not configured)') +
            (learningBackend.reason ? ` — ${learningBackend.reason}` : ''),
        );
        console.log(
          `[INFO] Math coach AI: ${mathCoach.config.enabled ? `on (${mathCoach.config.model})` : 'off → local-template'}`,
        );
        console.log(`[INFO] Admin console: http://localhost:${PORT}/admin/`);
        console.log(
          `[INFO] Admin token: ${process.env.ADMIN_TOKEN ? 'configured' : 'MISSING (set ADMIN_TOKEN)'}`,
        );
      });

      // 优雅关闭：保存数据到磁盘 / RDS
      const shutdown = (signal) => {
        console.log(`\n[INFO] Received ${signal}, shutting down gracefully...`);
        server.close(async () => {
          try {
            if (typeof db.flushAsync === 'function') await db.flushAsync();
            else db.saveAll();
          } catch (err) {
            console.error('[DB] flush on shutdown failed:', err && err.message ? err.message : err);
          }
          process.exit(0);
        });
        setTimeout(() => {
          console.error('[FATAL] Forced shutdown after timeout');
          process.exit(1);
        }, 5000);
      };

      process.on('SIGINT', () => shutdown('SIGINT'));
      process.on('SIGTERM', () => shutdown('SIGTERM'));
    })
    .catch((err) => {
      console.error('[FATAL] Boot failed:', err && err.message ? err.message : err);
      process.exit(1);
    });

  return boot;
}

// 导出 app 供测试使用（测试时不会自动启动）
module.exports = { app, corsOrigin, start, learningBackend };

// 如果直接运行，自动启动
if (require.main === module) {
  start();
}
