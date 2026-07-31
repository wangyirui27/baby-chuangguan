# 后端与 API 边界

> 生成时间：2026-07-21（2026-07-21 二刷：对照 backend/src 同步 env/硬编码/OSS/Redis/auth-MySQL）
> 只读分析，未修改业务代码

---

## 1. 项目后端全景

本项目处于 **新旧后端并存** 的过渡期。目录层面有两个后端代码库：

```
宝宝闯关/
├── backend/                     ← 旧后端（生产当前实际运行的）
│   └── src/
│       ├── index.js             ← Express 入口（静态文件 + API 同端口）
│       ├── auth.js              ← 认证路由（send-code / verify-code / session / logout）
│       ├── learning.js          ← 学习路由 + 仓库工厂（GET/PUT state 等）
│       ├── db.js                ← 内存 Map + JSON 文件持久化（json 模式）；也支持 MySQL 持久化（mysql 模式）
│       ├── insforge-learning-repository.js   ← InsForge 适配器（默认）
│       ├── mysql-learning-repository.js      ← MySQL 适配器（显式切换）
│       ├── sms-provider.js      ← SMS 供应商（development / aliyun）
│       ├── virtual-login.js     ← 虚拟登录（开发环境 1234 免短信）
│       ├── security.js          ← IP 限流器（内存/Redis 双后端）
│       ├── oss.js               ← OSS 静态资源（本地优先，可选 redirect 到签名/公网 OSS）
│       └── ...                  ← TTS/音频生成工具
│
├── apps/backend/                ← 新后端（合同驱动，仅含 auth，无 learning）
│   └── src/
│       ├── server.js            ← 服务入口
│       ├── app.js               ← Express 应用工厂
│       ├── service/auth-service.js       ← 认证业务逻辑
│       ├── transport/auth-router.js      ← 认证 HTTP 路由
│       ├── repository/memory-auth-repository.js  ← 内存认证仓库
│       ├── sms-provider.js      ← 复用 old backend 的实现
│       ├── virtual-login.js     ← 复用 old backend 的实现
│       └── errors.js            ← 合同错误类型
│
├── packages/contracts/          ← API 合同唯一真相源
│   ├── schemas/                 ← JSON Schema 每个端点
│   ├── fixtures/                ← MSW mock fixture
│   └── OWNERSHIP.md             ← 归属边界规则
│
├── migrations/                  ← Postgres DDL（InsForge 用，非 RDS MySQL）
│
├── auth/apiClient.js            ← 前端 API 客户端（H5 版，root index.html 使用）
├── script.js                    ← 前端主逻辑（直接调用 apiClient）
├── index.html                   ← 当前实际运行的 H5 入口
│
└── apps/frontend/               ← 新前端（Vite 构建，开发中，尚未切换为入口）
```

**关键判断**：`apps/backend/` 是新后端的雏形，目前只实现了 auth 模块，**没有 learning 路由**。生产实际运行的是 `backend/` 旧后端。

---

## 2. 完整 API 端点表

### 2.1 认证端点（两个后端都实现）

| 方法 | 路径 | 请求体 | 成功响应 | 旧后端实现 | 新后端实现 |
|------|------|--------|----------|-----------|-----------|
| `GET` | `/api/health` | — | `{status:"ok", learningBackend, authBackend, redisBackend, staticBackend}` | ✅ `index.js:103-111` | ✅ `app.js:65`（仅 `{status:"ok"}`） |
| `POST` | `/api/auth/send-code` | `{phone: string}` | `{success:true}` 或 `{success:true, debugCode}` | ✅ `auth.js:88` | ✅ `auth-router.js:86` |
| `POST` | `/api/auth/verify-code` | `{phone, code}` | `{token, user}` | ✅ `auth.js:209` | ✅ `auth-router.js:106` |
| `GET` | `/api/auth/session` | — | `{user}`（含 cookie） | ✅ `auth.js:358` | ✅ `auth-router.js:132` |
| `POST` | `/api/auth/logout` | — | `{success:true}` | ✅ `auth.js:372` | ✅ `auth-router.js:150` |
| `GET` | `/healthz` | — | `{status:"ok"}` | ✅ `index.js:114` | ❌ 不存在 |

**health 端点响应（旧后端）**：

```json
{
  "status": "ok",
  "learningBackend": "insforge" 或 "mysql",
  "authBackend": "json" 或 "mysql",
  "redisBackend": "memory" 或 "redis",
  "staticBackend": "local" 或 "signed-oss" 或 "oss"
}
```

**新旧后端 auth 差异**：

| 特性 | 旧后端 `backend/` | 新后端 `apps/backend/` |
|------|------------------|----------------------|
| 代码结构 | 路由 + 逻辑耦合在 `auth.js` | 分层：transport → service → repository |
| 数据层 | `db.js`（json/mysql 双后端，由 `AUTH_REPOSITORY` + MYSQL_* 控制） | `MemoryAuthRepository`（纯内存，无持久化） |
| 错误处理 | 直接 `res.status()` | `ContractError` 异常 + 统一捕获 |
| IP 限流 | `security.js` 中间件 → send-code；内存/Redis 双后端（REDIS_URL 控制） | `AuthService` 内部 IpRateLimiter（仅内存） |
| 可扩展仓库 | `AUTH_REPOSITORY=mysql` 环境变量（切换 auth 持久化） | `AUTH_REPOSITORY` 环境变量预留（当前只支持 memory） |
| session cookie | 手动设置 | 手动设置（行为一致） |
| 虚拟登录 | 内置 | 通过 `virtual-login.js` 复用 |

### 2.2 学习端点（仅旧后端实现）

| 方法 | 路径 | 认证 | 请求体 | 成功响应 | 实现文件 |
|------|------|------|--------|----------|---------|
| `GET` | `/api/learning/state` | `requireAuth` | — | `{profile, preferences, progressByWorld, learningActivity, mistakeBook, syncedAt}` | `learning.js:71` |
| `PUT` | `/api/learning/state` | `requireAuth` | 完整 snapshot | 同上（保存后返回最新） | `learning.js:79` |
| `PATCH` | `/api/learning/preferences` | `requireAuth` | 部分偏好 | 同上 | `learning.js:90` |
| `POST` | `/api/learning/quiz-attempts` | `requireAuth` | `{worldId, levelId, selected, correct, isCorrect}` | `{id}` (201) | `learning.js:101` |
| `POST` | `/api/learning/support-feedback` | `requireAuth` | `{message, context?}` | `{id}` (201) | `learning.js:113` |

**所有学习端点共享中间件**：
- `requireAuth`（来自 `auth.js`，验证 Bearer token 或 session cookie）
- `writeLimiter` 用于写操作（IP 限流，180 次/15 分钟，**硬编码**于 `learning.js:13`）

**学习数据快照结构**（由 `insforge-learning-repository.js` 的 `normalizeSnapshot` 定义）：

```json
{
  "profile": {
    "childName": "string",
    "childAge": "string"
  },
  "preferences": {
    "mapMusic": "boolean",
    "autoPronunciation": "boolean",
    "showChineseHints": "boolean",
    "mapWorld": "string (ocean|desert|castle)"
  },
  "progressByWorld": {
    "ocean": { "completed": [1,2,3,...], "unlockedThrough": 4 },
    "desert": { ... },
    "castle": { ... }
  },
  "learningActivity": {
    "dates": ["2026-07-01", "2026-07-02", ...]
  },
  "mistakeBook": {
    "items": [
      {
        "levelId": 1,
        "worldId": "ocean",
        "word": "cat",
        "zhTitle": "猫",
        "selected": "dog",
        "correct": "cat",
        "count": 3,
        "updatedAt": "2026-07-20T10:00:00.000Z"
      }
    ]
  },
  "syncedAt": "2026-07-21T...Z"
}
```

---

## 3. Express 入口

### 3.1 旧后端入口 — `backend/src/index.js`

**文件路径**：`/Users/yr/宝宝闯关/backend/src/index.js`

```
启动流程：
  1. dotenv 加载 .env
  2. 加载 .env.mysql.local（override）
  3. 加载 .env.redis.local（override）
  4. 加载 .env.oss.local（override）

中间件顺序：
  cors → express.json() → cookieParser()
     → [OSS 启用时] /assets → assetsRedirectMiddleware（本地优先，不存在才 302）
     → express.static(root)  ← 服务整站静态文件（OSS 模式无默认 index）
     → GET /api/health
     → GET /healthz（向后兼容）
     → /api/auth → authRouter
     → /api/learning → createLearningRouter({requireAuth})
     → 404 兜底
```

- 启动时调用 `db.loadAll()` 从 JSON 文件或 MySQL 加载持久化数据
- 优雅关闭时调用 `db.saveAll()` 写回磁盘/MySQL
- 监听端口：`process.env.PORT || 3000`

### 3.2 新后端入口 — `apps/backend/src/server.js`

**文件路径**：`/Users/yr/宝宝闯关/apps/backend/src/server.js`

```
中间件顺序（来自 createApp in apps/backend/src/app.js）：
  cors(origin validator) → express.json() → cookieParser()
     → JSON parse error handler
     → GET /api/health
     → /api/auth → createAuthRouter({authService, environment})
     → 404 兜底
     → 全局错误 handler
```

- 无静态文件服务（这是纯 API 服务）
- 无 learning 路由
- 启动时初始化 `AuthService`，依赖注入 `MemoryAuthRepository` + SMS Provider
- `AUTH_REPOSITORY` 环境变量预留（当前只支持 `memory`）

---

## 4. 认证流程详解

### 4.1 SMS 验证码登录（新旧后端逻辑一致）

```
POST /api/auth/send-code { phone }
  → IP 限流（20次/15分钟，硬编码于 security.js:200）
  → 手机号规范化（+86 前缀）
  → SHA-256 哈希手机号
  → 手机冷却检查（同号 60 秒，硬编码于 auth.js:22）
  → 手机限流检查（5次/15分钟，硬编码于 auth.js:20-21）
  → 生成 6 位码，存储 SHA-256(codeHash)
  → SMS provider.send(phone, code)
  → 返回 { success: true }
  → 开发模式额外返回 debugCode

POST /api/auth/verify-code { phone, code }
  → 手机号校验（11 位国内号）
  → 虚拟登录检测（code === 1234，开发默认开启）
  → 查找最新未过期验证码
  → 尝试次数检查（最多 3 次，硬编码于 auth.js:24）
  → SHA-256 比对验证码
  → 消费验证码（删除）
  → 查找或创建用户
  → 签发 session token（SHA-256 hash，30 天有效，硬编码于 auth.js:25）
  → 设置 HttpOnly cookie + 返回 { token, user }
```

### 4.2 虚拟登录

**文件路径**：`/Users/yr/宝宝闯关/backend/src/virtual-login.js`

- 开发/测试默认开启（`VIRTUAL_LOGIN=0` 可关闭）
- 生产/预发默认关闭（`ALLOW_VIRTUAL_LOGIN=1` 可开启）
- 默认虚拟码：`1234`（可通过 `VIRTUAL_LOGIN_CODE` 覆盖；代码默认值硬编码于 `virtual-login.js:6`）
- 逻辑：任意合法 11 位手机号 + 虚拟码 → 直接签发 session（无需先调 send-code）

### 4.3 Session 管理

**Token 传递方式**：
1. `Authorization: Bearer ***
2. `session_token` cookie（新/旧都设置 HttpOnly + SameSite=Lax）

**新旧 session 数据结构差异**：

| 字段 | 旧后端 | 新后端 |
|------|--------|--------|
| token 存储 | `sha256(rawToken)` → session | `hashValue(rawToken)`（SHA-256） |
| 存储位置 | `db.js`（json/mysql 双后端） | `memory-auth-repository` (纯内存) |
| 15 分钟 IP 限流 | `security.js` 作为中间件（内存/Redis 双后端） | `AuthService` 内部 IpRateLimiter |

---

## 5. 仓库模式

### 5.1 Learning Repository（学习数据）

**两层抽象**：

```
LEARNING_REPOSITORY=insforge  ← 默认值，InsForge SDK
LEARNING_REPOSITORY=mysql     ← 显式切换，MySQL（mysql2 驱动）
