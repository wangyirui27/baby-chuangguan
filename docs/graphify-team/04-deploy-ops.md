# 04 · 部署 / 运维 / 数据迁移

> 项目根：`/Users/yr/宝宝闯关`  
> 生成：2026-07-21（补齐 graphify-team 原缺槽）  
> 二刷：2026-07-21 — 对照 backend/src 同步 env/硬编码/OSS/Redis/auth-MySQL  
> 证据：`backend/src/index.js`、`backend/.env.example`、根 `.env.example`、`migrations/`、`docs/handoff-backend-aliyun-2026-07-21.md`、`AGENTS.md`、`package.json`  
> 约束：本文描述**现状 + 目标**；未确认的迁移步骤不得当生产 SOP 擅自执行。

---

## 0. 一句话

**生产进程入口 = 根目录 `npm start` → `backend/src/index.js`（Express 同端口托管 H5 静态 + `/api/*`）。**  
`apps/backend` / `apps/frontend` 是合同驱动新壳，**当前不是生产入口**。  
学习数据默认 **InsForge**；`LEARNING_REPOSITORY=mysql` 才切 RDS MySQL。  
Auth 数据默认 **JSON 文件**；`AUTH_REPOSITORY=mysql` 切 MySQL auth。  
IP 限流默认**内存**；`REDIS_URL` 切 Redis。  
静态资源默认**本地**；`OSS_ASSETS_MODE=redirect` + OSS 凭据切 OSS。

---

## 1. 进程与目录

| 角色 | 命令 / 路径 | 端口默认 |
|------|-------------|----------|
| **生产/本地一体服务** | 根 `npm start` ≡ `cd backend && npm start` → `node src/index.js` | `PORT` 或 `3000` |
| 开发热重载 | `cd backend && npm run dev` | 同上 |
| 契约 auth 新后端（非生产） | `cd apps/backend && npm start` | 3000（勿与生产混用） |
| 前端 Vite mock/real（非生产） | 根 `npm run frontend:dev:mock` / `frontend:dev:real` | Vite 5173 类 |
| 静态根 | `backend/src/index.js`：`express.static(…/宝宝闯关)` | 整个 monorepo 根作静态根 |

静态资源（含 `index.html`、`script.js`、`assets/`）由 **同一 Node 进程** 提供，无需单独 nginx 才能本地跑通；生产可前挂 SLB/Nginx，但 **公网业务入口仍应到 ECS 上的该进程（或反向代理到它）**。

---

## 2. 环境变量全表

来源：代码 `process.env.*` 扫描 + `backend/.env.example` + 根 `.env.example`。  
**密钥只放服务端 `.env`，禁止进前端与 git。**

### 2.1 启动加载顺序

`backend/src/index.js` 启动时按顺序加载 env：

1. `dotenv.config()` → 读根 `.env`
2. `dotenv.config({ path: '.env.mysql.local', override: true })` → MySQL 本地覆盖
3. `dotenv.config({ path: '.env.redis.local', override: true })` → Redis 本地覆盖
4. `dotenv.config({ path: '.env.oss.local', override: true })` → OSS 本地覆盖

> `.env.*.local` 不存在时不报错，静默跳过。

### 2.2 服务器

| 变量 | 必填 | 开发 | 预发/生产 | 说明 |
|------|------|------|-----------|------|
| `PORT` | 否 | 3000 | 按机房 | 监听端口 |
| `NODE_ENV` | 否 | `development` | `staging` / `production` | 影响 CORS 严格度、SMS development 禁止策略、Redis rate limit 测试禁用 |

### 2.3 认证 / 短信 / Session

**代码真实读取 `process.env` 的变量：**

| 变量 | 必填 | 开发 | 预发/生产 | 说明 |
|------|------|------|-----------|------|
| `SMS_PROVIDER` | 否 | `development` | **`aliyun`** | 生产禁止 development |
| `SMS_ALIYUN_ACCESS_KEY_ID` | aliyun 时 | — | ✓ | RAM AK |
| `SMS_ALIYUN_ACCESS_KEY_SECRET` | aliyun 时 | — | ✓ | |
| `SMS_ALIYUN_SIGN_NAME` | aliyun 时 | — | ✓ | |
| `SMS_ALIYUN_TEMPLATE_CODE` | aliyun 时 | — | ✓ | 模板变量默认 `code` |
| `SMS_ALIYUN_TEMPLATE_PARAM_KEY` | 否 | `code` | 同左 | |
| `SMS_ALIYUN_REGION_ID` | 否 | `cn-hangzhou` | | |
| `SMS_ALIYUN_ENDPOINT` | 否 | 官方 endpoint | | |
| `VIRTUAL_LOGIN` | 否 | 默认开（dev） | **关** | `0` 关闭 |
| `VIRTUAL_LOGIN_CODE` | 否 | `1234` | 勿开 | |
| `ALLOW_VIRTUAL_LOGIN` | 否 | — | **勿设 1** | 生产强开虚拟登录开关 |

**硬编码常量（改 env 无效）— 代码位置明确标注：**

| 常量 | 值 | 代码位置 |
|------|----|---------|
| PHONE_MAX_SENDS | 5 | `auth.js:20` |
| PHONE_WINDOW_MS | 15 × 60 × 1000 (15分钟) | `auth.js:21` |
| COOLDOWN_MS | 60 × 1000 (60秒) | `auth.js:22` |
| CODE_EXPIRY_MS | 5 × 60 × 1000 (5分钟) | `auth.js:23` |
| MAX_ATTEMPTS | 3 | `auth.js:24` |
| SESSION_DAYS | 30 | `auth.js:25` |
| auth IP 限流 | 20次 / 15分钟 | `security.js:200` (`new IpRateLimiter(20, 15*60*1000)`) |
| learning writeLimiter | 180次 / 15分钟 | `learning.js:13` (`new IpRateLimiter(180, 15*60*1000)`) |
| 虚拟登录默认码 | `'1234'` | `virtual-login.js:6` (`DEFAULT_VIRTUAL_CODE`) |
| MYSQL_CONNECTION_LIMIT 默认 | 5 | `db.js:37` |
| SAVE_DEBOUNCE_MS (防抖写入间隔) | 500ms | `db.js:104` |

> `SESSION_SECRET` 不存在于代码中；token = `crypto.randomBytes(32)`（`db.js:132`）。  
> 若需可配置化以上常量，改代码读 env 后发版；在此之前勿把 env example 注释当生产旋钮。

### 2.4 CORS

| 变量 | 必填 | 开发 | 预发/生产 | 说明 |
|------|------|------|-----------|------|
| `CORS_ORIGINS` | 生产建议 | 可空（默认 localhost） | **显式白名单** | 逗号分隔 |
| `CORS_ALLOW_NULL_ORIGIN` | 否 | 默认放行 null | 需 `true` 才放行 `null`（file://） | 见 `backend/src/index.js` |

**行为矩阵（生产 backend）**

| `NODE_ENV` | 无 Origin | `null` | localhost | 白名单外 |
|-----------|-----------|--------|-----------|----------|
| development/test | 允许 | 允许（非 strict） | 允许 | 非 strict 仍可能放行 |
| production/staging | 允许 | 仅 `CORS_ALLOW_NULL_ORIGIN=true` | 仅白名单 | **拒绝** |

`apps/backend` CORS 实现与上表**略有分叉**（`apps/backend/src/app.js`）：仅本地契约开发时关心，**不要按 apps/backend 配生产**。

### 2.5 学习数据 · InsForge（默认）

| 变量 | 必填 | 说明 |
|------|------|------|
| `LEARNING_REPOSITORY` | 否 | 缺省 / `insforge` = InsForge |
| `INSFORGE_URL` | 默认同步时 | 项目 URL，**仅服务端** |
| `INSFORGE_API_KEY` | 默认同步时 | admin/server key，**禁止前端** |

### 2.6 学习数据 · RDS MySQL（opt-in）

| 变量 | 必填（当 mysql） | 说明 |
|------|------------------|------|
| `LEARNING_REPOSITORY` | `mysql` | **显式**才启用 |
| `MYSQL_HOST` | ✓ | |
| `MYSQL_PORT` | 否 3306 | |
| `MYSQL_USER` | ✓ | |
| `MYSQL_PASSWORD` | ✓ | |
| `MYSQL_DATABASE` | ✓ | |
| `MYSQL_CONNECTION_LIMIT` | 否 5 | |

### 2.7 认证数据 · MySQL Auth（opt-in）

| 变量 | 必填（当 mysql auth） | 说明 |
|------|----------------------|------|
| `AUTH_REPOSITORY` | `mysql` | **显式**才启用 auth MySQL |

> 同时设置 `LEARNING_REPOSITORY=mysql` 也会触发 auth 走 MySQL（`db.js:17-18`）。  
> Auth MySQL 复用 2.6 的 MYSQL_* 连接配置，共用同一连接池。

### 2.8 IP 限流 · Redis（opt-in）

| 变量 | 必填 | 说明 |
|------|------|------|
| `REDIS_URL` | 切 Redis 时 | Redis 连接串（如 `redis://host:6379`） |
| `DISABLE_REDIS_RATE_LIMIT` | 否 | 设为 `1` 强制内存模式 |
| `REDIS_RATE_LIMIT_IN_TEST` | 否 | 设为 `0` 禁用测试中的 Redis |

> `security.js`（`IpRateLimiter` 构造函数）：设置 `REDIS_URL` 且未禁用时自动用 Redis INCR + PEXPIRE 限流；Redis 连接失败自动回退内存。

### 2.9 OSS 静态资源（opt-in）

| 变量 | 必填 | 说明 |
|------|------|------|
| `OSS_ASSETS_MODE` | 否 | `redirect` 切 OSS；默认 `local`（本地 serve） |
| `OSS_ACCESS_KEY_ID` | 签名 OSS 时 | RAM AK |
| `OSS_ACCESS_KEY_SECRET` | 签名 OSS 时 | |
| `OSS_ENDPOINT` | 签名 OSS 时 | 如 `oss-cn-hangzhou.aliyuncs.com` |
| `OSS_BUCKET` | 签名 OSS 时 | |
| `OSS_PUBLIC_BASE_URL` | 公网 OSS 时 | 如 `https://cdn.example.com` |
| `STATIC_ROOT` | 否 | 自定义静态根目录，默认 monorepo 根 |

**OSS 行为矩阵**：

| `OSS_ASSETS_MODE` | OSS 凭据 | 行为 |
|-------------------|---------|------|
| `local`（默认） | 忽略 | 所有静态走 `express.static(ROOT_DIR)` |
| `redirect` + 签名 OSS 凭据 | 四件套完整 | `/assets/*` 本地文件存在 → 本地；不存在 → 签名 URL 302 |
| `redirect` + 公网 OSS URL | `OSS_PUBLIC_BASE_URL` | `/assets/*` 本地文件存在 → 本地；不存在 → 公网 URL 302 |

> 本地文件优先策略（`oss.js:110-112`）：`/assets/*` 请求先检查本地文件，存在则走 `express.static`，避免 video/audio 跨域问题。

### 2.10 TTS（预录工具，非运行时必需）

| 变量 | 说明 |
|------|------|
| `DOUBAO_APP_ID` / `DOUBAO_TOKEN` / `DOUBAO_VOICE_TYPE` / `DOUBAO_CLUSTER` | 批量生成词音/题音 |
| `DOUBAO_SAMPLE_RATE` / `DOUBAO_AUDIO_FORMAT` | 可选 |

运行时 H5 播的是已生成的 `assets/` 静态音频，**不在请求路径上实时调豆包**（除非另行接入）。

---

## 3. API 面（生产 `backend/`）

| Method | Path | 模块 |
|--------|------|------|
| GET | `/api/health` | index（返回 status + learningBackend + authBackend + redisBackend + staticBackend） |
| GET | `/healthz` | index 兼容 |
| POST | `/api/auth/send-code` | auth |
| POST | `/api/auth/verify-code` | auth |
| GET | `/api/auth/session` | auth |
| POST | `/api/auth/logout` | auth |
| GET | `/api/learning/state` | learning |
| PUT | `/api/learning/state` | learning |
| PATCH | `/api/learning/preferences` | learning |
| POST | `/api/learning/quiz-attempts` | learning |
| POST | `/api/learning/support-feedback` | learning |

**不存在** `POST /api/learning/upsert`。

前端客户端：`auth/apiClient.js` → `window.babyIslandApi.*`（见 `06-frontend-hud.md`）。

---

## 4. 数据层现状

| 域 | 实现 | 持久化 | 切换方式 |
|----|------|--------|---------|
| users / sessions / verifications | `backend/src/db.js` | **json**（JSON 文件 + 内存 Map）或 **mysql**（baby_auth_users/sessions/verifications 表） | `AUTH_REPOSITORY=mysql` 或 `LEARNING_REPOSITORY=mysql` |
| learning 全量 | InsForge SDK | InsForge Postgres | 默认（`LEARNING_REPOSITORY` 缺省） |
| learning 全量 | `MysqlLearningRepository` | RDS MySQL | `LEARNING_REPOSITORY=mysql` |
| IP 限流 / 冷却 | `security.js` IpRateLimiter | **内存**（默认）或 **Redis** | `REDIS_URL` |
| OSS 静态 | `oss.js` assetsRedirectMiddleware | **本地**（默认）或 **签名 OSS** 或 **公网 OSS** | `OSS_ASSETS_MODE=redirect` |

**MySQL 表集合**：
- Learning（6 张，DDL 已有 InsForge Postgres 版，MySQL 版待写）：`baby_profiles`、`baby_world_progress`、`baby_learning_activity`、`baby_mistakes`、`baby_quiz_attempts`、`baby_support_feedback`
- Auth（3 张，代码引用但 DDL 待写）：`baby_auth_users`（id, normalized_phone, created_at, last_login_at）、`baby_auth_sessions`（token_hash, user_id, created_at, expires_at, revoked）、`baby_auth_verifications`（id, phone_hash, code_hash, expires_at, attempts, used, created_at）

字段以 `migrations/20260720141941_create-learning-backend.sql` + harden/rollback 为准；**禁止擅自加业务字段**（生日、星级、耗时等已回滚先例）。

---

## 5. Schema 变更 SOP（硬性）

来源：`AGENTS.md` + handoff。

1. **先写**：字段 / 用途 / 调用方 / 回滚 SQL / 是否破坏前端契约  
2. **落草稿**到 `migrations/`，**不要**未确认就对生产库执行  
3. **等用户明确确认**  
4. 同步：OpenAPI /（建议）`packages/contracts/schemas` / repository normalize  
5. 测试：`node --test backend/src/*.test.js` + 相关 e2e  
6. 灰度：先 InsForge 或只读校验，再写路径  

回滚范例：`migrations/20260720224601_rollback-learning-report-metrics.sql`。

**禁止新增（未确认）**：宝宝生日、每关星级、答题耗时、尝试次数、是否使用提示、错音分类、VIP/商品销售字段等。

---

