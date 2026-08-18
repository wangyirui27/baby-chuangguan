# 嗨洛塔少儿启蒙 APP · 技术文档总入口

> 项目根：`/Users/yr/嗨洛塔少儿启蒙APP`  
> 更新：2026-08-13  
> 读者：新 session / 接手 AI / 人。先读本页 30 秒表，再按目录下钻。  
> 架构细图：`/Users/yr/嗨洛塔少儿启蒙APP/docs/graphify-team/00-cursor-architecture.md`

本文件只做索引与决策备忘。不贴密钥，不替代 OpenAPI，不把 `apps/*` 写成生产。

---

## 1. 30 秒结论

| 问题 | 答案 |
|------|------|
| 生产前端是什么？ | 仓库根 `index.html` + `script.js` + `style.css`，不是 `apps/frontend` |
| 生产后端是什么？ | 根目录 `npm start` → `backend/` Express；H5 与 `/api/*` **同端口**（默认 3000） |
| `apps/frontend`、`apps/backend`、`packages/contracts`？ | **非生产**。契约冻的是 auth/health 五条；learning 只在 `backend/` |
| 学习数据默认去哪？ | **InsForge**。RDS MySQL 必须显式 `LEARNING_REPOSITORY=mysql` |
| 登录数据默认去哪？ | **JSON 文件** `data/*.json`。MySQL auth 必须显式 `AUTH_REPOSITORY=mysql` |
| 进度怎么同步？ | `PUT /api/learning/state`。无其它 learning 全量写入 POST |
| 手机 App 是原生重写吗？ | 否。iOS `WKWebView` / Android `WebView` 加载 `tools/pack-app-www.sh` 打出的 `www/` |
| 前端能直连云厂商吗？ | **不能**。只打自家 `/api/*`；InsForge / RDS / OSS / Redis / 短信藏在 Express |
| 知识图最新数字？ | Graphify 2026-08-13：286 files · 3462 nodes · 5743 edges · 240 communities |
| 最大结构债？ | 双后端半迁移 + JSON auth + Learning 双适配器 + `script.js` 万行巨石 |

---

## 2. 目录

### 2.1 本仓技术文档

| 路径 | 用途 |
|------|------|
| `/Users/yr/嗨洛塔少儿启蒙APP/docs/TECH.md` | 本页：总入口 |
| `/Users/yr/嗨洛塔少儿启蒙APP/docs/graphify-team/00-cursor-architecture.md` | 系统架构、模块边界、原生壳、债、文档地图 |
| `/Users/yr/嗨洛塔少儿启蒙APP/docs/graphify-team/README.md` | 00–12 索引（部分目标文件尚未生成） |
| `/Users/yr/嗨洛塔少儿启蒙APP/docs/backend-architecture.md` | Express 契约不绑云厂商；阿里云目标部署与 factory 切换 |
| `/Users/yr/嗨洛塔少儿启蒙APP/docs/codegraphy.md` | 与 `graphify-out` 对齐的结构叙事、hub、读图法 |
| `/Users/yr/嗨洛塔少儿启蒙APP/graphify-out/README.md` | 2026-08-13 图指数 |
| `/Users/yr/嗨洛塔少儿启蒙APP/graphify-out/GRAPH_REPORT.md` | 社区 hub 全表 |
| `/Users/yr/嗨洛塔少儿启蒙APP/graphify-out/graph.html` | 浏览器交互图 |
| `/Users/yr/嗨洛塔少儿启蒙APP/graphify-out/wiki/index.md` | 社区 wiki 入口 |
| `/Users/yr/嗨洛塔少儿启蒙APP/AGENTS.md` | InsForge 项目名与 SDK 约定 |
| `/Users/yr/嗨洛塔少儿启蒙APP/backend/README.md` | 生产后端操作说明 |
| `/Users/yr/嗨洛塔少儿启蒙APP/packages/contracts/OWNERSHIP.md` | 契约所有权边界 |

### 2.2 `docs/graphify-team/`（00–12）

目标路径一律在 `/Users/yr/嗨洛塔少儿启蒙APP/docs/graphify-team/`：

| 文件 | 职责 |
|------|------|
| [00-cursor-architecture.md](./graphify-team/00-cursor-architecture.md) | 架构总览 |
| [01-inventory.md](./graphify-team/01-inventory.md) | 仓库指纹（目标） |
| [02-product-loop.md](./graphify-team/02-product-loop.md) | 产品闭环 |
| [03-backend-api.md](./graphify-team/03-backend-api.md) | 后端 API 表 |
| [04-deploy-ops.md](./graphify-team/04-deploy-ops.md) | 部署运维迁移（编号 04 **永远**是本文件） |
| [05-audit-gaps.md](./graphify-team/05-audit-gaps.md) | 历史审计 |
| [06-frontend-hud.md](./graphify-team/06-frontend-hud.md) | 前端 HUD（目标；仓内或有误编号 `04-frontend-hud.md`） |
| [07-data-model.md](./graphify-team/07-data-model.md) | LearningState / 表 |
| [08-doc-catalog.md](./graphify-team/08-doc-catalog.md) | 文档目录（目标） |
| [09-consistency-check.md](./graphify-team/09-consistency-check.md) | 一致性（目标） |
| [10-deploy-code-verify.md](./graphify-team/10-deploy-code-verify.md) | 部署核验（目标） |
| [11-frontend-api-verify.md](./graphify-team/11-frontend-api-verify.md) | 前端 API 终检（目标） |
| [12-complete-signoff.md](./graphify-team/12-complete-signoff.md) | 签字（目标） |

产品 / TestFlight / 截图类交接（非架构 SSOT，发船时另读）：`docs/dev-handoff-testflight.md`、`docs/handoff-testflight-full-2026-08-07.md`、`docs/testflight-checklist.md`。

### 2.3 代码入口（对照文档用）

| 角色 | 绝对路径 |
|------|----------|
| 生产 H5 | `/Users/yr/嗨洛塔少儿启蒙APP/index.html` |
| 巨石逻辑 | `/Users/yr/嗨洛塔少儿启蒙APP/script.js` |
| API 客户端 | `/Users/yr/嗨洛塔少儿启蒙APP/auth/apiClient.js` |
| 生产 Express | `/Users/yr/嗨洛塔少儿启蒙APP/backend/src/index.js` |
| 非生产前端 | `/Users/yr/嗨洛塔少儿启蒙APP/apps/frontend` |
| 非生产后端 | `/Users/yr/嗨洛塔少儿启蒙APP/apps/backend` |
| 契约 | `/Users/yr/嗨洛塔少儿启蒙APP/packages/contracts` |

---

## 3. 本地开发 / 测试命令

在 `/Users/yr/嗨洛塔少儿启蒙APP` 执行。

| 命令 | 作用 |
|------|------|
| `npm start` | 生产路径：`cd backend && npm start` → Express 静态+API，默认 `http://localhost:3000` |
| `npm test` | 根测试集：`quiz.test.js`、`ambient-sfx.test.js`、语音生成测试、`native-shell.test.js`、`auth/apiClient.local-mock.test.cjs`、`backend/src/*.test.js`、`apps/backend/test/*.test.js`、`apps/frontend/tests/api-client.test.cjs` |
| `npm run e2e` | `tools/e2e-auth-flow.mjs` |
| `npm run e2e:math` | `tools/e2e-math-ai-smoke.mjs` |
| `npm run frontend:dev:mock` | Vite mock，proxy `/api` → `:3001`（**非生产**） |
| `npm run frontend:dev:real` | Vite real，proxy `/api` → `:3000`（**非生产壳**，API 仍应是已启动的 `backend/`） |
| `npm run generate:contracts` / `validate:contracts` | 契约生成与校验 |
| `npm run audit:readiness` | 发船就绪审计 |
| `npm run testflight:preflight` | TestFlight 预检（含 pack www） |
| `bash tools/pack-app-www.sh /tmp/hirota-www-check` | 打原生 www，不改业务代码 |
| `bash tools/ship-android-apk.sh` | pack www 后打 Android APK |

`backend/` 内：`npm start` / `npm run dev`（`--watch`）/ `npm test`。

单测时 Auth 走 JSON（`NODE_ENV=test`）。不要用生产 `.env` 的 MySQL 解释测试结果。

开发短信：`SMS_PROVIDER=development` 时验证码打终端；虚拟登录见 `VIRTUAL_LOGIN*` 键名类别（下节）。**不要**在生产开 development SMS。

---

## 4. 关键环境变量类别（只写键名，不贴值）

密钥放 `.env` / `backend/.env` / `.env.local`，**禁止**写入文档、前端、commit。类别如下。

| 类别 | 键名（代表） | 谁读 |
|------|----------------|------|
| 进程 | `PORT` `NODE_ENV` | Express |
| CORS | `CORS_ORIGINS` `CORS_ALLOW_NULL_ORIGIN` | `backend/src/index.js` |
| 短信 | `SMS_PROVIDER` `SMS_ALIYUN_*` `SMS_DEV_FALLBACK` | `sms-provider.js` / `auth.js` |
| 虚拟登录 | `VIRTUAL_LOGIN` `VIRTUAL_LOGIN_CODE` `VIRTUAL_LOGIN_STRICT` `ALLOW_VIRTUAL_LOGIN` | `virtual-login.js` |
| Session / 限流（部分仍硬编码） | `SESSION_*` `PHONE_*` `CODE_*` `IP_RATE_LIMIT_*` | auth；以代码为准 |
| **Learning 切换** | `LEARNING_REPOSITORY`（别名 `LEARNING_BACKEND`） | factory：**缺省 InsForge**；`mysql` 显式才 RDS |
| InsForge | `INSFORGE_URL` `INSFORGE_API_KEY` `INSFORGE_SERVICE_KEY` | 仅服务端。factory 缺省判定看 SERVICE_KEY；SDK 构造看 API_KEY |
| Auth 切换 | `AUTH_REPOSITORY`（别名 `AUTH_BACKEND`）`AUTH_FORCE_JSON` | `db.js`；默认 json |
| MySQL | `MYSQL_HOST` `MYSQL_PORT` `MYSQL_USER` `MYSQL_PASSWORD` `MYSQL_DATABASE` `MYSQL_CONNECTION_LIMIT` | learning mysql **且/或** auth mysql |
| Redis 限流 | `REDIS_URL` `DISABLE_REDIS_RATE_LIMIT` `REDIS_RATE_LIMIT_IN_TEST` | `security.js`；失败回退内存 |
| OSS / CDN | `OSS_ASSETS_MODE` `OSS_ACCESS_KEY_ID` `OSS_ACCESS_KEY_SECRET` `OSS_ENDPOINT` `OSS_BUCKET` `OSS_PUBLIC_BASE_URL` `COURSE_VIDEO_BASE` `ASSET_CDN_BASE` `STATIC_ROOT` | `oss.js` / `content-catalog.js` |
| 运维台 | `ADMIN_TOKEN` | `admin-router.js` |
| 数学陪练 LLM | `MATH_COACH_AI_ENABLED` `MATH_COACH_AI_API_KEY` `MATH_COACH_AI_BASE_URL` `MATH_COACH_AI_MODEL` `MATH_COACH_AI_TIMEOUT_MS`（及 `OPENAI_*` 别名） | 默认关；须 ENABLED=1 **且** key |
| 豆包 TTS（预录工具，非请求热路径） | `DOUBAO_APP_ID` `DOUBAO_TOKEN` `DOUBAO_CLUSTER` `DOUBAO_VOICE_TYPE` 等 | 生成脚本 |
| 前端 Vite 模式 | `VITE_API_MODE` 等 | **仅** `apps/frontend` 开发 |

InsForge 项目（AGENTS.md）：**baobao-chuangguan**，API base 在服务端配置，不进 `script.js`。

---

## 5. 架构决策：为何 Express 契约不绑云厂商

**决策：** 浏览器与 WebView 只调用本项目 `/api/*`。云厂商、BaaS、数据库、对象存储只出现在 `backend/src` 的 repository / adapter。换 InsForge、Supabase、阿里云 RDS/OSS 时，**不改** `index.html` / `script.js` / `auth/apiClient.js` 的路径。

**原因：**

1. **客户端寿命长于厂商合同。** H5 打进 IPA/APK。把 SDK URL 写进 `script.js` = 换 BaaS 必须发版。Express 当反腐层，厂商替换是服务端开关。  
2. **儿童产品鉴权必须停在自家 session。** InsForge RLS / Auth UID 不搬到 MySQL；H5 也不拿 service key。权限 = Express `requireAuth` + repository。  
3. **契约面已经存在。** `POST /api/auth/*`、`GET|PUT /api/learning/state` 等是产品协议。OpenAPI 目前只冻 auth/health，但生产 Express 已按同一风格扩 learning。前端相对路径在「同端口静态托管」和「原生注入 `BABY_ISLAND_API_BASE`」两种部署下都能用。  
4. **双适配器证明点。** Learning 已用 factory：默认 InsForge，`LEARNING_REPOSITORY=mysql` 切 RDS，路由不变。这就是「契约不绑云」的落地，不是口号。  
5. **不要把 `apps/backend` 的内存仓当成云无关的终态。** 它证明分层，但生产能力在 `backend/`。云切换改的是 `backend/src/*-repository.js`，不是再开第三套 HTTP 面。

**禁止：**

- 前端 `createClient(INSFORGE_URL)` 或直连 RDS/Redis/OSS。  
- AccessKey 进前端、日志、文档正文。  
- 把 Redis 当唯一数据源、把 OSS 当数据库。  
- 用非 `PUT /api/learning/state` 的路径当学习全量同步接口。

证据：`/Users/yr/嗨洛塔少儿启蒙APP/docs/backend-architecture.md`、`/Users/yr/嗨洛塔少儿启蒙APP/backend/src/learning-repository-factory.js`、`/Users/yr/嗨洛塔少儿启蒙APP/auth/apiClient.js`。

---

## 6. 建议阅读顺序

1. 本页 30 秒表  
2. `docs/graphify-team/00-cursor-architecture.md`  
3. `docs/codegraphy.md` + 浏览器打开 `graphify-out/graph.html`  
4. 按任务：API → `03-backend-api.md` + `backend-architecture.md`；表 → `07-data-model.md`；发船 → `04-deploy-ops.md` + TestFlight 交接  

路径一律用 `/Users/yr/嗨洛塔少儿启蒙APP/...`。旧文若写 `/Users/yr/宝宝闯关`，当历史别名，不要当当前根。
