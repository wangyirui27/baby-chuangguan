# 11 · 前端 API 终检（`window.babyIslandApi`）

> 项目根：`/Users/yr/嗨洛塔少儿启蒙APP`  
> 生成：2026-08-13  
> 源：`auth/apiClient.js`（IIFE，导出 `:459-484`）  
> 对照：`03-backend-api.md`；目标 `06-frontend-hud.md`（**磁盘不存在**）  
> 生产调用方：根 `script.js`（非 `apps/frontend`）

**HTTP 红线：** 客户端**没有** `POST /api/learning/upsert`。全量保存 = `saveLearningState` → **`PUT /api/learning/state`**。任何 upsert 路由名 = **ERROR / 已否决**。

---

## 0. 传输约定

| 项 | 事实 | 证据 |
|----|------|------|
| 相对路径 | `apiRequest(method, path)` 拼 `API_BASE + path` | `auth/apiClient.js:70` |
| 壳注入 | `window.BABY_ISLAND_API_BASE` → `setApiBase` | `:309-312`；`:295-297` |
| 鉴权 | `Authorization: Bearer` 和/或 cookie；file:// 用 sessionStorage token | `:38-48` 一带 |
| 本地 mock | `file:` 或无后端时 `tryLocalMock`：auth + math-coach；**不** mock PUT state | `:183-249` |
| 非生产双份 | `apps/frontend/src/api/` 存在；**不是** TestFlight 客户端 | `00` §7.1 |

---

## 1. 完整导出 → HTTP 表

`window.babyIslandApi` 键（`auth/apiClient.js:459-484`）：

### 1.1 有 HTTP 的方法

| 导出方法 | HTTP | 路径 | `03` | 结果 |
|----------|------|------|------|------|
| `sendVerificationCode` | POST | `/api/auth/send-code` | `03:74` | **对齐** `:325-328` |
| `verifyCode` | POST | `/api/auth/verify-code` | `03:75` | **对齐** `:351-354` |
| `checkSession` | GET | `/api/auth/session` | `03:76` | **对齐** `:379-382` |
| `logout` | POST | `/api/auth/logout` | `03:77` | **对齐** `:400-401` |
| `loadLearningState` | GET | `/api/learning/state` | `03:89` | **对齐** `:411-412` |
| **`saveLearningState`** | **PUT** | **`/api/learning/state`** | `03:90` | **对齐** `:415-416` |
| `saveLearningPreferences` | PATCH | `/api/learning/preferences` | `03:91` | **对齐** `:419-420` |
| `recordQuizAttempt` | POST | `/api/learning/quiz-attempts` | `03:92` | **对齐** `:423-424` |
| `sendSupportFeedback` | POST | `/api/learning/support-feedback` | `03:93` | **对齐** `:427-428` |
| `generateMathCoachPlan` | POST | `/api/learning/math-coach` | `03:94` | **对齐** `:431-432` |
| `getEntitlements` | GET | `/api/me/entitlements` | `03:122` | **对齐** `:435-436` |
| `claimVipEntitlement` | POST | `/api/me/entitlements/vip` | `03:123` | **对齐** `:440-441` |
| `submitRankingScore` | POST | `/api/me/ranking` | `03:124` | **对齐** `:444-445` |
| `loadRankings` | GET | `/api/rankings?windowDays&limit` | `03:125` | **对齐** `:448-454` |

**无 upsert 行。** `rg upsert auth/apiClient.js` 应为 0。

### 1.2 无 HTTP（壳 / 测试辅助）

| 导出 | 作用 | 行 |
|------|------|----|
| `setApiBase` / `getApiBase` | 原生注入 API origin | `:295-301` |
| `isLocalMockEnabled` | mock 开关查询 | `:304-306` |
| `getLastDevCode` | 开发态 `debugCode` | `:316-318` |
| `getToken` / `clearToken` | 本地 token | `:38-64` |
| `isFileProtocol` | `file:` 检测 | `:28` |
| `_resetDevCode` | 测试 | `:482` |
| `_canUseLocalMock` | 测试 | `:483` |

---

## 2. 相对 `03` 的覆盖差

| 后端有、客户端无封装 | 说明 |
|----------------------|------|
| `GET /api/health` `GET /healthz` | 运维/壳探测，H5 不经 `babyIslandApi` |
| `/api/admin/*` | 只走 `admin/` 页，不进生产 H5 客户端 |
| `GET /admin` | 页面，非 JSON API |

前端**没有**多封装一条 learning 全量 POST。与 `03` §7.1「禁止 upsert 端点」一致。

---

## 3. 06 偏差（目标文件缺失）

| 检查 | 结果 |
|------|------|
| `docs/graphify-team/06-frontend-hud.md` | **缺**。无法做「06 vs apiClient」逐条 diff |
| 暂代 HUD 叙事 | `02-product-loop.md`：`saveLearningState` → PUT state（`02:19,51`）— 与本表 **无偏差** |
| stale 残稿 | `_stale-04-frontend-hud.md.bak:13-16` 写 `getSession` + `upsertSession → POST /api/learning/upsert` |

**06 偏差（若把 bak 误当成 06）：**

| bak 声明 | 代码事实 | 判定 |
|----------|----------|------|
| `getSession(token) → GET /api/auth/session` | 导出是 `checkSession`（无 token 实参） | **偏差** |
| `upsertSession → POST /api/learning/upsert` | 导出 `saveLearningState` → **PUT** `/api/learning/state` | **ERROR / 已否决** |

补 06 时必须抄本表，禁止从 bak 恢复 upsert。

---

## 4. `script.js` 消费（抽查，不写 HUD 全文）

| 行为 | 符号（`02` 已引用） | API |
|------|---------------------|-----|
| 登录后 hydrate | `hydrateLearningStateFromBackend` | `loadLearningState` GET |
| 防抖上传 | `scheduleLearningSync` / `flushLearningSync` | `saveLearningState` PUT |
| 单笔英语答题流水 | `recordQuizAttempt` | POST quiz-attempts |
| 数学陪练 | `generateMathCoachPlan` | POST math-coach |
| VIP 账本 | `getEntitlements` / `claimVipEntitlement` | `/api/me/entitlements*` |

本地权威 key 见 `07` §7。未登录不云同步（`PRODUCT.md` MVP 非目标）。

---

## 5. 本地 mock 与 upsert

`tryLocalMock` 只识别：

- POST `/api/learning/math-coach`
- POST `/api/auth/verify-code`
- POST `/api/auth/send-code`
- GET `/api/auth/session`
- POST `/api/auth/logout`

**不**识别 `/api/learning/upsert`。file:// 预览若无 `BABY_ISLAND_API_BASE`，PUT state 会走真实 fetch 失败，而不是假 upsert 成功。这与「无 upsert 路由」一致。
