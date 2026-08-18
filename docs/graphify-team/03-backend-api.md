# 03 · 后端 API 契约

> 项目根：`/Users/yr/嗨洛塔少儿启蒙APP`（品牌：嗨洛塔 / HiRota，npm name=`baby-island-quest`）
> 生成：2026-08-13（Graphify 2026-08-13：286 files · 3462 nodes · 5743 edges · 240 communities，见 `graphify-out/README.md`）
> 方法：只读审计 `backend/` 与 `apps/backend/` 源码；只写本文档，未修改任何业务代码
> 证据规则：所有端点均给出绝对路径 + 行号，可用 `rg app.(get|post|put|delete)` 复验

---

## 0. 一句话

生产 API = 根目录 `npm start` → `backend/src/index.js`（Express 同端口托管 H5 静态 + `/api/*`，`package.json:7`）。
`apps/backend` 是合同驱动新壳，**当前不是生产入口**，仅实现 auth/health。
学习数据默认 **InsForge**（`LEARNING_REPOSITORY=mysql` 才切 MySQL）；Auth 数据默认 **JSON 文件**（`data/*.json`）。
**HTTP 层无任何 upsert 端点**；学习同步唯一入口是 `PUT /api/learning/state` 全量快照。

---

## 1. 后端全景

```
嗨洛塔少儿启蒙APP/
├── backend/                     ← 生产后端（根 npm start 实际运行）
│   ├── .env / .env.example      ← 配置（.env 不入库）
│   └── src/
│       ├── index.js             ← Express 入口：静态 + /api/health + 路由挂载 + 404
│       ├── auth.js              ← 认证路由 + requireAuth（send-code / verify-code / session / logout）
│       ├── learning.js          ← 学习路由（state / preferences / quiz-attempts / support-feedback / math-coach）
│       ├── learning-repository-factory.js  ← Learning 仓库工厂（insforge | mysql | none）
│       ├── insforge-learning-repository.js ← InsForge 适配器（默认）
│       ├── mysql-learning-repository.js    ← MySQL 适配器（显式 opt-in）
│       ├── me-router.js         ← /api/me（权益/VIP/排行）+ /api/rankings（公开）
│       ├── admin-router.js      ← /api/admin 运维后台（ADMIN_TOKEN 鉴权）
│       ├── db.js                ← auth 内存 Map + JSON 文件持久化（可切 MySQL）
│       ├── security.js          ← IpRateLimiter（内存）
│       ├── virtual-login.js     ← 虚拟登录（开发 1234 免短信）
│       ├── sms-provider.js      ← SMS（development / aliyun）
│       ├── sms-events.js        ← 短信事件日志（data/sms-events.json）
│       ├── entitlements.js      ← VIP 权益 + 排行（data/entitlements.json / ranking-scores.json）
│       ├── content-catalog.js   ← 内容目录（data/content-catalog.json）
│       ├── math-coach-ai.js     ← 数学陪练（默认本地模板，显式开启才远程 LLM）
│       ├── oss.js               ← OSS 前端（公网前缀 / 签名 URL / 本地）
│       └── *.test.js            ← 单测（npm test 覆盖）
├── apps/backend/                ← 新后端雏形：仅 auth + health，无 learning/静态/admin
│   └── src/  app.js · server.js · errors.js · utils.js · sms-provider.js · virtual-login.js
│             service/auth-service.js · transport/auth-router.js · repository/memory-auth-repository.js
├── data/                        ← JSON 持久化（users/sessions/verifications/entitlements/…）
├── packages/contracts/          ← API 合同（schema/fixtures）
├── migrations/                  ← InsForge Postgres DDL（非 RDS MySQL）
├── index.html + script.js + style.css  ← 生产 H5 前端
└── admin/index.html             ← 运维后台页面（/admin/）
```

**关键判断**：生产运行 `backend/`；`apps/backend/` 只实现了 auth 模块，没有 learning 路由。

---

## 2. 完整 API 端点表

### 2.1 健康检查与系统端点（无鉴权）

| 方法 | 路径 | 鉴权 | 响应 | 实现 |
|------|------|------|------|------|
| `GET` | `/api/health` | 无 | `{status:"ok", learningBackend, learningConfigured, smsProvider, nodeEnv}` | `backend/src/index.js:93` |
| `GET` | `/healthz` | 无 | `{status:"ok"}`（向后兼容） | `backend/src/index.js:104` |
| `GET` | `/admin` `/admin/` | 无（页面，API 需 ADMIN_TOKEN） | `admin/index.html` | `backend/src/index.js:126` |

`/api/health` 实际响应字段（`index.js:93-101`）：`learningBackend`（`insforge|mysql|none`）、`learningConfigured`、`smsProvider`、`nodeEnv`。

### 2.2 认证端点 — 挂载 `/api/auth`（`index.js:109` → `auth.js`）

| 方法 | 路径 | 鉴权 | 请求体 | 成功响应 | 实现 |
|------|------|------|--------|----------|------|
| `POST` | `/api/auth/send-code` | IP 限流 20 次/15 分钟（`security.js:78`） | `{phone}` | `{success:true}`（开发模式含 `debugCode`） | `auth.js:155` |
| `POST` | `/api/auth/verify-code` | 无 | `{phone, code}` | `{token, user}` + HttpOnly cookie | `auth.js:326` |
| `GET` | `/api/auth/session` | `requireAuth` | — | `{user}` | `auth.js:472` |
| `POST` | `/api/auth/logout` | 无（幂等） | — | `{success:true}` | `auth.js:479` |

限流硬编码常量（`auth.js:82-89`）：同号 5 次/15 分钟、同号冷却 60 秒、验证码有效期 5 分钟、最多尝试 3 次、会话 30 天。
token 传递：`Authorization: Bearer <token>` 或 `session_token` cookie（HttpOnly + SameSite=Lax），`auth.js:107-116`。
虚拟登录（`virtual-login.js`）：development/test 默认开启（`VIRTUAL_LOGIN=0` 关闭）；production/staging 默认关闭（`ALLOW_VIRTUAL_LOGIN=1` 开启）；默认虚拟码 `1234`（`VIRTUAL_LOGIN_CODE` 可覆盖，`virtual-login.js:6`）。

### 2.3 学习端点 — 挂载 `/api/learning`（`index.js:114` → `learning.js`）

**全部端点先过 `requireAuth`**（`learning.js:149`），写操作再过 `writeLimiter`（IP 180 次/15 分钟，硬编码 `learning.js:12`）。

| 方法 | 路径 | 鉴权 | 请求体 | 成功响应 | 实现 |
|------|------|------|--------|----------|------|
| `GET` | `/api/learning/state` | `requireAuth` | — | 学习快照 | `learning.js:151` |
| `PUT` | `/api/learning/state` | `requireAuth` | 完整快照 | 保存后最新快照 | `learning.js:159` |
| `PATCH` | `/api/learning/preferences` | `requireAuth` | 部分偏好 | 最新快照 | `learning.js:170` |
| `POST` | `/api/learning/quiz-attempts` | `requireAuth` | `{worldId, levelId, selected, correct, isCorrect}` | `{id}` (201) | `learning.js:181` |
| `POST` | `/api/learning/support-feedback` | `requireAuth` | `{message, context?}` | `{id}` (201) | `learning.js:193` |
| `POST` | `/api/learning/math-coach` | `requireAuth` | `{levelId, targetCount, attempts, …}` | 陪练计划 | `learning.js:205` |

**同步语义**：`PUT /api/learning/state` 是**全量快照覆盖**，**无 upsert 端点、无增量 patch**（HTTP 层）。
存储层实现细节（非 API 契约）：InsForge 适配器内部用 SDK `.upsert()`（`insforge-learning-repository.js:276,326,335,381`），MySQL 适配器用 `ON DUPLICATE KEY UPDATE`（`mysql-learning-repository.js:248,259,297`）——这是持久化手段，对外 HTTP 面不暴露。

学习快照结构（`normalizeSnapshot`，`insforge-learning-repository.js:181-196`）：

```json
{
  "profile": { "childName": "string", "childAge": "string" },
  "preferences": { "mapMusic": "boolean", "autoPronunciation": "boolean",
                   "showChineseHints": "boolean", "mapWorld": "ocean|desert|math|math58|math912|castle" },
  "progressByWorld": { "<worldId>": { "completed": [1,2,3], "unlockedThrough": 4 } },
  "learningActivity": { "dates": ["2026-08-01", "…"] },
  "mistakeBook": { "items": [ { "levelId", "worldId", "word", "zhTitle",
                               "selected", "correct", "count", "updatedAt" } ] },
  "mathAttempts": [ { "attemptId", "schemaVersion", "ts", "worldId": "math", "levelId",
                      "skill", "targetCount", "selected", "selectedCount", "correct",
                      "isCorrect", "mode": "easier|same|harder", "responseMs" } ]
}
```

世界白名单：`['ocean', 'desert', 'math', 'math58', 'math912', 'castle']`（`insforge-learning-repository.js:3`）；错题上限 50 条、数学记录上限 80 条（同文件 :6,:136）。

### 2.4 我的 / 排行 — 挂载 `/api/me`、`/api/rankings`（`index.js:121-122` → `me-router.js`）

| 方法 | 路径 | 鉴权 | 成功响应 | 实现 |
|------|------|------|----------|------|
| `GET` | `/api/me/entitlements` | `requireAuth` | `{hasFullAccess, vip}` | `me-router.js:19` |
| `POST` | `/api/me/entitlements/vip` | `requireAuth` | `{ok, hasFullAccess, vip}` | `me-router.js:31` |
| `POST` | `/api/me/ranking` | `requireAuth` | `{ok, ranking}` | `me-router.js:52` |
| `GET` | `/api/rankings` | 无（公开，不含手机号） | 排行列表（`windowDays`/`limit` 查询参数） | `me-router.js:70` |

### 2.5 运维后台 — 挂载 `/api/admin`（`index.js:125` → `admin-router.js`）

**全部端点先过 `requireAdmin`**（`admin-router.js:91`）：`ADMIN_TOKEN` 环境变量，`Authorization: Bearer` / `X-Admin-Token` / `?token=` 三种传递（`admin-router.js:22-43`）；未配置 ADMIN_TOKEN 返回 503 `ADMIN_NOT_CONFIGURED`。

| 方法 | 路径 | 实现 |
|------|------|------|
| `GET` | `/api/admin/health` | `admin-router.js:93` |
| `GET` | `/api/admin/stats` | `admin-router.js:129` |
| `GET` | `/api/admin/users` | `admin-router.js:207` |
| `GET` | `/api/admin/users/:id` | `admin-router.js:237` |
| `POST` | `/api/admin/users/:id/ban` / `unban` | `admin-router.js:258` / `:275` |
| `POST` | `/api/admin/users/:id/revoke-sessions` | `admin-router.js:285` |
| `POST` | `/api/admin/users/:id/vip` / `vip/revoke` | `admin-router.js:299` / `:311` |
| `GET` | `/api/admin/sessions` | `admin-router.js:318` |
| `GET` | `/api/admin/sms-events` | `admin-router.js:341` |
| `GET` | `/api/admin/verifications` | `admin-router.js:353` |
| `GET` | `/api/admin/vips` | `admin-router.js:379` |
| `GET` | `/api/admin/rankings` | `admin-router.js:389` |
| `GET` | `/api/admin/content/overview` | `admin-router.js:397` |
| `GET` / `PATCH` / `PUT` | `/api/admin/content/oss` | `admin-router.js:401` / `:405` / `:408` |
| `GET` | `/api/admin/content/maps` | `admin-router.js:412` |
| `PATCH` | `/api/admin/content/maps/:mapId` | `admin-router.js:416` |
| `GET` | `/api/admin/content/levels` | `admin-router.js:420` |
| `GET` / `PUT` | `/api/admin/content/levels/:mapId/:levelId` | `admin-router.js:432` / `:438` |
| `POST` | `/api/admin/content/levels/:mapId/:levelId/bind-video` | `admin-router.js:449` |
| `POST` | `/api/admin/content/levels/:mapId/:levelId/unbind-video` | `admin-router.js:464` |
| `GET` / `POST` | `/api/admin/content/videos` | `admin-router.js:475` / `:486` |
| `PATCH` | `/api/admin/content/videos/:id` | `admin-router.js:496` |
| `POST` | `/api/admin/content/scan-local` | `admin-router.js:507` |
| `POST` | `/api/admin/content/publish-asset-packs` | `admin-router.js:511` |

### 2.6 验收核对

`rg "app\.(get|post|put|delete)" backend/src` 结果：仅 `index.js` 3 处 `app.get`（`/api/health` :93、`/healthz` :104、`/admin` 页面 :126）。
其余全部 API 均为 `router.*` 定义后经 `app.use` 挂载（`index.js:109,114,121,122,125`），与上表一一对应，无遗漏、无编造。

---

## 3. Express 入口与中间件链（`backend/src/index.js`）

```
1. dotenv 加载：backend/.env → cwd/.env → backend/.env.mysql.local（override，:7-13）
2. CORS：corsOrigin（:36-78）— 无 origin 放行；生产/预发必须显式 CORS_ORIGINS；
   开发默认放行 localhost/null；CORS_ALLOW_NULL_ORIGIN 控制 null 来源
3. express.json() + cookieParser()（:86-87）
4. express.static(仓库根)（:90）— 同端口托管 index.html / script.js / style.css / admin/
5. GET /api/health（:93）
6. GET /healthz（:104）
7. /api/auth → authRouter（:109）
8. /api/learning → createLearningRouter({repository, requireAuth, mathCoach})（:114）
9. /api/me + /api/rankings（:121-122）
10. /api/admin → adminRouter（:125）+ /admin 页面（:126）
11. 404 兜底 JSON（:131-133）
12. 启动（:136-191）：db.loadAllAsync() → entitlements/smsEvents/contentCatalog 加载
    → listen(PORT || 3000) → SIGINT/SIGTERM 优雅关闭 flush
```

依赖（`backend/package.json`）：`express ^4.21`、`@insforge/sdk ^1.4.5`、`mysql2 ^3.23`（懒加载）。

---

## 4. Learning Repository 工厂（`backend/src/learning-repository-factory.js`）

**唯一决策点**：`resolveLearningBackendKind`（:15-29），兼容 `LEARNING_REPOSITORY` 与 `LEARNING_BACKEND` 两个变量名：

| 环境变量值 | 结果 | 说明 |
|-----------|------|------|
| `mysql` / `rds` | `mysql` | 显式切 MySQL 适配器（MYSQL_HOST/PORT/USER/PASSWORD/DATABASE） |
| `insforge` / `postgres` / `pg` | `insforge` | InsForge 适配器 |
| `none` / `off` / `disabled` | `none` | 显式关闭 |
| **未设置** | `insforge`（若 `INSFORGE_URL` + `INSFORGE_SERVICE_KEY` 都在）否则 `none` | 默认 InsForge，缺凭据时**不静默假成功** |

- `createLearningRepositoryFromEnv`（:36-82）：`mysql` 分支懒连接（构造不连库）；`insforge` 分支直接构造。
- 入口消费（`index.js:32`）：`learningBackend = createLearningRepositoryFromEnv()`，`/api/health` 上报 `learningBackend.kind`。
- **发现的差异（只读记录，未修改）**：工厂向 InsForge 适配器传 `serviceKey: env.INSFORGE_SERVICE_KEY`（:72），但 `InsForgeLearningRepository` 构造函数读取的是 `options.apiKey || process.env.INSFORGE_API_KEY`（`insforge-learning-repository.js:247`）——`serviceKey` 形参当前不被消费；实际生效的 key 来自 `INSFORGE_API_KEY`（client 构建 :253-256）。若两变量都未设，请求将 503 `LEARNING_BACKEND_NOT_CONFIGURED`（`learning.js:133-135`）。

InsForge 存储表（`insforge-learning-repository.js` 使用，DDL 见 `migrations/`）：`baby_profiles`（:276）、`baby_world_progress`（:326）、`baby_learning_activity`（:335）、`baby_mistakes`（:381）、`baby_quiz_attempts`（:389 insert）、`baby_support_feedback`（:407 insert）。

MySQL 适配器（`mysql-learning-repository.js`）：懒建池（:43-53）、`ensureSchema`（:123）、`saveState` 走事务（:219-268）。

---

## 5. Auth 数据现状：`data/users.json`

**存储层**（`backend/src/db.js`）：
- 数据目录 `DATA_DIR = backend/../data`（:13），即 `/Users/yr/嗨洛塔少儿启蒙APP/data/`
- 三个内存 Map：`users` / `sessions` / `verifications`（:154-160）
- 持久化文件：`data/users.json`、`data/sessions.json`、`data/verifications.json`（:15-17）
- 写盘：防抖 500ms（:194）+ 原子写（tmp + rename，:296-306）
- 仓库选择 `resolveAuthRepository`（:20-36）：`NODE_ENV=test` 或 `AUTH_FORCE_JSON=1` → 强制 json；`AUTH_REPOSITORY`/`AUTH_BACKEND=mysql|rds` 且 `MYSQL_HOST` 存在 → mysql；否则 json。**仅显式 AUTH_* 才切 mysql**，不会因 LEARNING_BACKEND=mysql 隐式切换（:30）
- MySQL 模式：启动全量灌入内存（`loadAllFromMysql` :57-100），写盘为 **DELETE 全表 + INSERT 全量重写**（`saveAllToMysql` :102-138），表 `baby_auth_users` / `baby_auth_sessions` / `baby_auth_verifications`

**现状快照（2026-08-13，`data/`）**：

| 文件 | 大小 | 内容 |
|------|------|------|
| `users.json` | 217 B | **1 个用户**（`+861****1823`，status=active，2026-08-07 创建） |
| `sessions.json` | 339 B | 会话记录 |
| `verifications.json` | 450 B | 验证码哈希（仅 SHA-256，无明文，`db.js:4`） |
| `entitlements.json` | 866 B | VIP 权益账本 |
| `ranking-scores.json` | 483 B | 排行分数 |
| `sms-events.json` | 144 KB | 短信事件日志 |
| `content-catalog.json` | 488 KB | 内容目录（关卡/视频映射） |
| `workbench-level-video-map.json` | 262 KB | 关卡-视频工作台映射 |

用户记录形状（`data/users.json` 实样 + `db.js:164-170` JSDoc）：`{id(uuid), normalizedPhone(+86…), status, createdAt, lastLoginAt}`。

**requireAuth 校验链**（`auth.js:119-148`）：token 缺失 → 401；session 不存在/吊销 → 401；过期 → 删除并 401；用户不存在 → 401；`status=banned` → 403。

---

## 6. `apps/backend` 对照（新壳，非生产）

| 维度 | 旧后端 `backend/` | 新后端 `apps/backend/` |
|------|------------------|----------------------|
| 入口 | `index.js`（静态 + API 同端口） | `server.js` + `app.js`（纯 API，无静态） |
| 端点 | health/healthz + auth + learning + me/rankings + admin（~40 条） | health + auth 4 条（`app.js:65,70`；`auth-router.js:86,106,132,150`） |
| learning | ✅ 完整（state/preferences/attempts/feedback/math-coach） | ❌ 无 |
| admin | ✅ 30 端点 | ❌ 无 |
| 数据层 | `db.js`（json/mysql 双后端） | `MemoryAuthRepository`（纯内存，`memory-auth-repository.js`） |
| 启动仓库 | `AUTH_REPOSITORY=json|mysql` | 仅 `memory`，其他值 `process.exit(1)`（`server.js`） |
| 错误处理 | 路由内 `res.status()` | `ContractError` + 统一 error handler（`app.js:49-62,79-82`） |
| 请求体校验 | 手写校验 | 契约校验 `additionalProperties: false`（`auth-router.js:30-75`） |
| 限流 | `security.js` IpRateLimiter 中间件 | `AuthService` 内置 IpRateLimiter（`auth-service.js`） |
| 常量 | `RATE_LIMIT`（`auth.js:82-89`） | 同值常量（`auth-service.js`：60s 冷却 / 5 次 / 15min / 3 次尝试 / 30 天会话） |
| 静态 | ✅ 仓库根 | ❌ |
| 依赖 | express + @insforge/sdk + mysql2 | express（复用 backend/.env，`server.js`） |

**结论**：`apps/backend` 是合同驱动重构的起点，与生产后端 auth 行为对齐（token/cookie/虚拟登录一致），但 learning/admin/静态全部缺失，**不可作为生产替代**。

---

## 7. 关键约定（防回归）

1. **禁止 upsert 端点**：HTTP 层不得新增 `/upsert` 类接口；学习同步唯一入口 = `PUT /api/learning/state`（全量快照）。存储层 upsert（InsForge SDK `.upsert()` / MySQL `ON DUPLICATE KEY UPDATE`）属于实现细节，不得提升为 API。
2. **生产入口不变**：根 `npm start` → `backend/`；`apps/*` 不接管生产。
3. **默认后端**：Learning 默认 InsForge；Auth 默认 JSON 文件；切换必须显式环境变量（`LEARNING_REPOSITORY=mysql` / `AUTH_REPOSITORY=mysql`）。
4. **证据可复验**：本表全部行号来自 2026-08-13 快照；改路由后必须同步更新本文档。
