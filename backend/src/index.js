// 宝宝闯关 · 后端统一服务入口
// 静态文件 + API 同端口，支持 file:// 降级

const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./db');
const authRouter = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── CORS 配置 ──────────────────────────────────────
// 支持 null origin (file:// 场景) 和可配置 origin 白名单
function corsOrigin(origin, callback) {
  // 允许无 origin 的请求（file://、curl、等）
  if (!origin) {
    return callback(null, true);
  }

  // 开发模式允许本地地址
  const allowedOrigins = [];

  // 从环境变量读取自定义白名单（逗号分隔）
  const envOrigins = process.env.CORS_ORIGINS;
  if (envOrigins) {
    allowedOrigins.push(...envOrigins.split(',').map(s => s.trim()));
  }

  // 默认允许 localhost 和 null
  const defaultAllowed = [
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
    return callback(null, true);
  }

  callback(null, true); // 安全起见，允许所有（产品环境应限制）
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
  res.status(200).json({ status: 'ok' });
});

// 向后兼容
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ─── 认证路由 ──────────────────────────────────────
app.use('/api/auth', authRouter);

// ─── 404 兜底 ──────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
});

// ─── 启动 ──────────────────────────────────────────
function start() {
  // 从磁盘加载持久化数据
  db.loadAll();

  const server = app.listen(PORT, () => {
    const mode = process.env.NODE_ENV || 'development';
    console.log(`[INFO] Server listening on http://localhost:${PORT} (${mode})`);
    console.log(`[INFO] SMS provider: ${process.env.SMS_PROVIDER || 'development'}`);
  });

  // 优雅关闭：保存数据到磁盘
  const shutdown = (signal) => {
    console.log(`\n[INFO] Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      db.saveAll();
      process.exit(0);
    });
    // 强制退出超时
    setTimeout(() => {
      console.error('[FATAL] Forced shutdown after timeout');
      process.exit(1);
    }, 5000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// 导出 app 供测试使用（测试时不会自动启动）
module.exports = { app, start };

// 如果直接运行，自动启动
if (require.main === module) {
  start();
}
