# 04 · 部署 / 运维（deploy / ops）

> 项目根：`/Users/yr/嗨洛塔少儿启蒙APP`（品牌：嗨洛塔 / HiRota；npm name=`baby-island-quest`）
> 生成：2026-08-13（对照本仓库代码重写；旧版 2026-07-21 指向 `/Users/yr/宝宝闯关`，已作废）
> Graphify 2026-08-13：286 files · 3462 nodes · 5743 edges · 240 communities（`graphify-out/README.md:5-6`）
> 证据：`package.json`、`backend/package.json`、`backend/src/index.js`、`backend/src/db.js`、`backend/src/learning-repository-factory.js`、`backend/src/security.js`、`backend/src/auth.js`、`tools/*.sh`、`deploy/`
> 约束：本文只描述**现状 + 目标**；未确认的迁移步骤不得当生产 SOP 擅自执行。

---

## 0. 一句话

| 点 | 事实 |
|----|------|
| **生产 H5** | 仓库根 `index.html` + `script.js` + `style.css`（`tools/pack-app-www.sh:22`） |
| **生产 API** | 根 `npm start` → `backend/src/index.js`（Express 同端口托管静态 + `/api/*`） |
| **本机开发库** | 以 `backend/.env` 为准；团队现状为 **阿里云 RDS**（`AUTH_REPOSITORY=mysql` + `LEARNING_REPOSITORY=mysql` + `MYSQL_HOST=rm-….rds.aliyuncs.com`），**不是**本机 mysqld。SOP：`docs/deploy-server.md` |
| **Learning** | 默认按 `LEARNING_REPOSITORY` 解析：`mysql`/`rds` → MySQL；`insforge`/`pg` → InsForge；缺省看凭据；都无 → `none` |
| **Auth** | 默认 JSON 文件（`data/*.json`）；`AUTH_REPOSITORY=mysql` 且配齐 `MYSQL_*` 才切 MySQL |
| **Redis 限流** | **未实现**：`security.js` 的 `IpRateLimiter` 是纯内存 Map，代码无 `REDIS_URL` 读取、无 redis 依赖 |
| **OSS 静态** | **未挂载**：`backend/src/oss.js` 存在但全库无 `require('./oss')`；生产请求路径走 `express.static` 本地 |
| **apps/\*** | 非生产入口；`apps/backend` 仅 auth/health 契约壳 |
| **同步 API** | `PUT /api/learning/state`（**无** upsert，`learning.js:159`） |

---

## 1. 进程与目录

| 角色 | 命令 / 路径 | 端口默认 | 证据 |
|------|-------------|----------|------|
| **生产/本地一体服务** | 根 `npm start` ≡ `cd backend && npm start` → `node src/index.js` | `PORT` 或 `3000` | `package.json:7`；`backend/package.json:8`；`index.js:30` |
| 开发热重载 | `cd backend && npm run dev`（`node --watch`） | 同上 | `backend/package.json:9` |
| 契约 auth 新后端（非生产） | `cd apps/backend && npm start` → `src/server.js` | 3000（勿与生产混用） | `apps/backend/package.json` |
| 前端 Vite 壳（非生产） | 根 `npm run frontend:dev:mock` / `frontend:dev:real` | Vite 默认 | `package.json:22-23` |
| 静态根 | `express.static(path.resolve(__dirname,'..','..'))` = **仓库根** | — | `index.js:90` |
| 运维后台 | `GET /admin`、`GET /admin/` → `admin/index.html` | 同端口 | `index.js:126-128` |

- 启动判定：`require.main === module` 才 `start()`（`index.js:197-199`）。
- 优雅关闭：SIGINT/SIGTERM → `server.close` → `db.flushAsync()/saveAll()` 落盘 → 5 秒强制退出（`index.js:165-183`）。
- 启动日志（`index.js:146-161`）依次打印：Auth repository、SMS provider、Learning backend（含未配置原因）、Math coach AI、Admin console、ADMIN_TOKEN 是否配置——上线后以日志与 `GET /api/health` 为准。

---

## 2. 环境变量：真读 vs 硬编码

### 2.1 加载顺序（`index.js:4-13`）

1. `dotenv.config({ path: backend/.env })` —— **backend 目录优先**
2. `dotenv.config()` —— 回退 `cwd/.env`（仓库根 `.env`）
3. `dotenv.config({ path: backend/.env.mysql.local, override: true })` —— 可选 MySQL 覆盖（gitignore，不存在时静默跳过）

> ⚠️ 旧文档的 `.env.redis.local` / `.env.oss.local` 加载**不存在**于当前代码。

### 2.2 代码真读 `process.env` 的变量（改 env 有效）

| 变量 | 用途 | 代码位置 |
|------|------|----------|
| `PORT` | 监听端口（默认 3000） | `index.js:30` |
| `NODE_ENV` | CORS 严格度 / 虚拟登录 / SMS 回落 / cookie secure | `index.js:41`；`virtual-login.js:12`；`auth.js:41,458` |
| `CORS_ORIGINS` | 逗号分隔白名单 | `index.js:47-50` |
| `CORS_ALLOW_NULL_ORIGIN` | `true` 才放行 `null` origin（生产） | `index.js:74` |
| `SMS_PROVIDER` | `development`/`aliyun` | `sms-provider.js:277`；`index.js:98` |
| `SMS_ALIYUN_ACCESS_KEY_ID` / `_SECRET` / `_SIGN_NAME` / `_TEMPLATE_CODE` / `_TEMPLATE_PARAM_KEY` / `_REGION_ID` / `_ENDPOINT` | 阿里云短信 | `sms-provider.js:81-87` |
| `SMS_DEV_FALLBACK` | `0` 关闭开发态回落（生产/staging 永不回落） | `auth.js:40-46` |
| `AUTH_REPOSITORY` / `AUTH_BACKEND` | `mysql`/`rds` 切 MySQL auth（需 `MYSQL_HOST`） | `db.js:25-34` |
| `AUTH_FORCE_JSON` | `1` 强制 JSON 存储 | `db.js:22` |
| `LEARNING_REPOSITORY` / `LEARNING_BACKEND` | learning 仓库选择 | `learning-repository-factory.js:15-29` |
| `INSFORGE_URL` / `INSFORGE_SERVICE_KEY` | 默认分支探测 InsForge | `learning-repository-factory.js:27` |
| `INSFORGE_URL` / `INSFORGE_API_KEY` | InsForge repository 实际读取 | `insforge-learning-repository.js:246-247,254-255` |
| `MYSQL_HOST` / `_PORT` / `_USER` / `_PASSWORD` / `_DATABASE` / `_CONNECTION_LIMIT` | MySQL（auth + learning） | `db.js:44-51`；`mysql-learning-repository.js:44-50` |
| `VIRTUAL_LOGIN` / `VIRTUAL_LOGIN_STRICT` / `VIRTUAL_LOGIN_CODE` / `ALLOW_VIRTUAL_LOGIN` | 虚拟登录 | `virtual-login.js:12-33` |
| `ADMIN_TOKEN` | 后台 Bearer / X-Admin-Token | `admin-router.js:23-34,109` |
| `MATH_COACH_AI_*`（`_ENABLED`/`_API_KEY`/`_BASE_URL`/`_MODEL`/`_TIMEOUT_MS`） | 数学 coach 远程 LLM（默认关闭） | `index.js:112-113`；`.env.example:74-79` |
| `OSS_PUBLIC_BASE_URL` / `COURSE_VIDEO_BASE` / `ASSET_CDN_BASE` | 视频 CDN 前缀（content-catalog / admin 关卡目录） | `content-catalog.js:108-110` |
| `OSS_BUCKET` / `OSS_ENDPOINT` / `OSS_ACCESS_KEY_ID` / `OSS_ACCESS_KEY_SECRET` | OSS 签名/探测（content-catalog readiness） | `content-catalog.js:140-141,778-786` |
| `DOUBAO_APP_ID` / `DOUBAO_TOKEN` / `DOUBAO_CLUSTER` / `DOUBAO_SAMPLE_RATE` / `DOUBAO_AUDIO_FORMAT` | TTS 预录工具（非运行时必需） | `generate-tts.js:34-36`；`generate-voice-samples.js:62-65` |
| `MATH_STORY_VIDEO_FORCE` / `MATH_STORY_VIDEO_SRC` | 数学故事视频导入工具 | `import-math-story-videos.js:23-26` |

> 注：`.env.example`（根 `:38-39`、`:42-48`）注释中的 `SESSION_SECRET`、`SESSION_MAX_DAYS`、`PHONE_MAX_SENDS`、`PHONE_WINDOW_MINUTES` 等 **代码不读取**——见下表，勿当生产旋钮。

### 2.3 硬编码常量（改 env 无效）—— 代码位置明确标注

| 常量 | 值 | 代码位置 |
|------|----|---------|
| `PHONE_MAX_SENDS` | 5 次 / 同手机号 | `auth.js:83`（`RATE_LIMIT`） |
| `PHONE_WINDOW_MS` | 15 × 60 × 1000（15 分钟） | `auth.js:84` |
| `COOLDOWN_MS` | 60 × 1000（60 秒） | `auth.js:85` |
| `CODE_EXPIRY_MS` | 5 × 60 × 1000（5 分钟） | `auth.js:86` |
| `MAX_ATTEMPTS` | 3 次 | `auth.js:87` |
| `SESSION_DAYS` | 30 天 | `auth.js:88` |
| auth IP 限流 | 20 次 / 15 分钟（全局单例） | `security.js:78`（`new IpRateLimiter(20, 15*60*1000)`） |
| learning 写限流 | 180 次 / 15 分钟 | `learning.js:12` |
| 虚拟登录默认码 | `'1234'` | `virtual-login.js:6` |
| 数据防抖写间隔 | 500 ms | `db.js:194` |
| session token | `crypto.randomBytes(32)`，无 `SESSION_SECRET` | `db.js:223-225` |
| 静态根 | 固定仓库根 | `index.js:90` |
| MySQL host/user/password/database | **无硬编码默认**；缺则 `MYSQL_NOT_CONFIGURED` | `mysql-config.js` `resolveMysqlConfig` |
| MySQL port / connectionLimit 未设时 | `3306` / `5`（仅端口与池大小） | `mysql-config.js` |

> 需要可配置 → 改代码读 env 后发版；在此之前 `.env.example` 注释里的同名变量是**假旋钮**。

---

## 3. Learning / Auth 切换

### 3.1 Learning 仓库解析（`learning-repository-factory.js:15-29`）

| `LEARNING_REPOSITORY` 值 | 结果 |
|--------------------------|------|
| `mysql` / `rds` | **mysql**（`mysql-learning-repository.js`，缺 `MYSQL_HOST` 等必填项 → 构造抛错 → 回落 `none` 并记 reason） |
| `insforge` / `postgres` / `pg` | **insforge**（`insforge-learning-repository.js`，读 `INSFORGE_URL` + `INSFORGE_API_KEY`） |
| `none` / `off` / `disabled` | **none**（`repository: null`，不静默假成功） |
| 未显式设置 | `INSFORGE_URL` **且** `INSFORGE_SERVICE_KEY` 存在 → insforge；否则 → **none** |

- MySQL 为**懒连接**：构造不连库，`getPool` 时才 require mysql2（`learning-repository-factory.js:57`）。
- ⚠️ **已知不一致**：默认分支探测用的是 `INSFORGE_SERVICE_KEY`（factory:27），repository 实际读取 `INSFORGE_API_KEY`（insforge-learning-repository.js:247），而 `.env.example` 示例的是 `INSFORGE_API_KEY`。若只按 example 配置且未显式设 `LEARNING_REPOSITORY`，默认探测判 `none`。**结论：生产应显式 `LEARNING_REPOSITORY=insforge`，并配 `INSFORGE_URL` + `INSFORGE_API_KEY`，不要依赖默认探测。**
- 验证：`GET /api/health` 返回 `learningBackend`（kind）与 `learningConfigured`（`index.js:93-101`）。

### 3.2 Auth 存储切换（`db.js:19-36`）

| 条件 | 结果 |
|------|------|
| `NODE_ENV=test` 或 `AUTH_FORCE_JSON=1` | **json**（强制） |
| `AUTH_REPOSITORY`/`AUTH_BACKEND` = `mysql`/`rds` 且 `MYSQL_HOST` 已设 | **mysql** |
| 其他 | **json**（默认） |

- 与旧版差异：**`LEARNING_REPOSITORY=mysql` 不再隐式切 auth**（`db.js:30` 注释明确：仅显式 `AUTH_*` 切 mysql）。
- mysql 模式：启动 `loadAllFromMysql` 灌入内存 Map（`db.js:57-100`），写入时事务内 **DELETE 全表 + INSERT 全量**（`db.js:102-138`），并本地 JSON 镜像一份便于排障回退（`db.js:326-331`）。

### 3.3 数据层一览

| 域 | 实现 | 持久化 | 切换方式 |
|----|------|--------|---------|
| users / sessions / verifications | `backend/src/db.js`（Map + 文件）或 MySQL | `data/*.json` 或 `baby_auth_*` 三表 | `AUTH_REPOSITORY=mysql`（显式） |
| learning 全量 | InsForge SDK | InsForge Postgres | `LEARNING_REPOSITORY=insforge`（显式）或默认探测 |
| learning 全量 | `MysqlLearningRepository` | RDS MySQL | `LEARNING_REPOSITORY=mysql` |
| IP 限流 / 冷却 | `security.js` IpRateLimiter | **内存 Map（重启清零）** | 无 Redis 选项（见 §5） |
| 静态资源 | `express.static` 仓库根 | **本地文件** | 无 OSS 重定向（见 §5） |

---

## 4. users.json 风险（JSON 存储模式）

现状（`data/`，2026-08-13 实测）：

| 文件 | 大小 | 内容 |
|------|------|------|
| `data/users.json` | 217 B（1 用户） | id、`normalizedPhone`（**脱敏**，如 `+861****1823`）、status、createdAt、lastLoginAt |
| `data/sessions.json` | 339 B | `token_hash`（SHA-256）、user_id、expires_at、revoked |
| `data/verifications.json` | 450 B | `phone_hash`、`code_hash`（SHA-256）、expires_at、attempts、used |
| `data/sms-events.json` | 144 KB（无轮转） | 仅 `phoneMasked` + `phoneHash`，不存明文（`sms-events.js:63-75`） |
| `data/content-catalog.json` 等 | — | 关卡目录 / 权益 / 排行缓存 |

风险清单（json 模式的固有限制，非 bug）：

1. **单机单进程**：多实例部署会互相覆盖（无锁、无 CAS）；只适合单 ECS。
2. **崩溃丢窗口**：写入为 500 ms 防抖 + 原子写（tmp+rename，`db.js:296-306`），进程崩溃最多丢最后 ~500 ms；且 `scheduleSave` 失败**静默**（`db.js:202-204`）。
3. **无备份/轮转**：`data/` 被部署 rsync `--exclude data` 排除（`deploy-ecs.sh`）——不会误传，但也意味着部署流程不备份数据；`sms-events.json` 持续增长无轮转。
4. **手机号脱敏非哈希**：`normalizedPhone` 是掩码（`+861****1823`）而非不可逆哈希；验证码/session token 才是 SHA-256。
5. **鉴权靠内存**：auth 数据启动时从文件灌入内存 Map，运行期以内存为准（`db.js:311-336`）；重启 = 重新加载，异常关机丢失防抖窗口。

> 结论：`data/` 目录必须纳入备份（或尽早切 `AUTH_REPOSITORY=mysql` + RDS）；删除/导出用户走代码内 API，勿手改 JSON。

---

## 5. Redis / OSS —— 诚实未完成

### 5.1 Redis 限流：**未实现**

- `backend/src/security.js` 的 `IpRateLimiter` 为**纯内存 Map** 实现（`security.js:10-75`），无 Redis 分支、无 `REDIS_URL` 读取。
- `backend/package.json` 依赖中**没有 redis 包**（仅 `@insforge/sdk`、`cookie-parser`、`cors`、`dotenv`、`express`、`mysql2`）。
- 全 `backend/` 代码扫描 `REDIS_URL`/`redis`：业务代码 0 命中。
- 后果：限流计数随进程重启清零；多实例无共享计数。

### 5.2 OSS 静态：**未挂载**

- `backend/src/oss.js`（签名 URL 工具，`module.exports` 于 :146）**存在但全库无 `require('./oss')`** —— 未挂载到 `index.js` 生产入口，请求路径上不生效。
- 生产静态全部走 `express.static` 仓库根（`index.js:90`）。
- OSS 相关 env 目前只被 `content-catalog.js` 消费：`OSS_PUBLIC_BASE_URL`/`COURSE_VIDEO_BASE`/`ASSET_CDN_BASE`（:108-110，admin 关卡目录/asset-packs 探测），以及 readiness 探针（:778-786）。
- `backend/.env` 中存在 `OSS_PUBLIC_BASE_URL` 键（值属密钥环境，不在此列明）。

> 含义：当前生产形态 = 内存限流 + 本地静态。**若要上 Redis/OSS，需新增实现并挂载后发版**，本文不把它当已上线能力描述。

---

## 6. TF / APK 打包脚本

### 6.1 脚本清单（`tools/`）

| 脚本 | 用途 | 关键点 |
|------|------|--------|
| `tools/pack-app-www.sh` | H5 www / IPA bundle 打包（通用前置） | 打包 `index.html`+`script.js`+`style.css`+`sw.js`（:22）；种子视频 ocean L01–L10 + desert L001–L010 + math-story×31 + theme-audio×31（:109-165）；**排除 drafts/raw/生成目录**；git-ignored 文件泄漏即失败（exit 15）；运行时非视频引用完整性检查（exit 11） |
| `tools/ship-testflight.sh` | TestFlight 一键发船（需 Xcode + Apple ID） | `--static-check` / `--archive` / `--upload`；`DEVELOPMENT_TEAM`、`ASC_KEY_ID`/`ASC_ISSUER_ID`/`ASC_KEY_PATH`（或 `ASC_KEY_P8_BASE64`）；Archive → `/tmp/hirota-BabyEnglishIsland.xcarchive`；`ExportOptions-TestFlight.plist` |
| `tools/ship-android-apk.sh` | Android APK（debug / release） | 先 `pack-app-www.sh` → `android/app/src/main/assets/www`；`JAVA_HOME`=openjdk@21、`ANDROID_HOME`=commandlinetools；`./gradlew :app:assembleDebug/Release`；产物 → `build/android/` |
| `tools/testflight-preflight.sh` | 无 Xcode 内容/壳预检 | 检查 node/npm/rsync/python3 + `npm ci` 依赖 + 内容契约 |
| `tools/verify-testflight-handoff.sh` | 验证 TestFlight handoff 包 | — |
| `tools/enable-testflight-workflow.sh` | 启用 TF workflow | — |
| `tools/assert-ios-archive-contract.mjs` / `assert-testflight-bundle-media.mjs` | 归档/媒体契约断言 | — |
| `tools/scan-no-apple-secrets.sh` | Apple 密钥泄漏扫描 | — |

### 6.2 npm 侧快捷命令（`package.json`）

| 命令 | 作用 |
|------|------|
| `npm run testflight:preflight` | `bash tools/testflight-preflight.sh` |
| `npm run testflight:verify-handoff` | `bash tools/verify-testflight-handoff.sh` |
| `npm run audit:readiness` / `audit:release` | `node tools/audit-readiness.mjs [--strict]` |
| `npm run probe:asset-packs` | `node tools/probe-asset-pack-urls.mjs`（OSS URL 抽样探测） |

### 6.3 CI

- `.github/workflows/testflight-preflight.yml`：`push main` / `pull_request` / `workflow_dispatch`，ubuntu-latest + Node 20，跑内容与壳 handoff 预检（可手动触发 OSS URL 抽样探测）。
- `.github/workflows/deploy-ecs.yml`：tag `v*` / `workflow_dispatch` 应急 → backend 单测 → `deploy-ecs.sh`（Secrets：`ECS_HOST` / `ECS_SSH_KEY`）。说明：`deploy/pipeline/ci-cd.md`。`push main` **不**部署。

---

## 7. ECS / systemd 部署（deploy/）

| 文件 | 作用 |
|------|------|
| `deploy/pipeline/deploy-ecs.sh` | 一键同步 + 安装 + 可选迁移 + 重启。env：`ECS_HOST`、`ECS_USER`（默认 `baobao`）、`ECS_SSH_KEY_PATH` **或** `ECS_SSH_KEY`（PEM）、`APP_DIR`（默认 `/opt/apps/baobao/backend`）、`RUN_MIGRATE`（默认 0） |
| `deploy/pipeline/verify-ecs.sh` | 远端 health 验收：HTTP 200 + 四个 backend 字段；不打印响应体 |
| `deploy/ecs/baobao-backend.service` | systemd unit：`User=baobao`、`WorkingDirectory=/opt/apps/baobao/backend`、`EnvironmentFile=-/etc/baobao-backend.env`、`ExecStart=/usr/bin/node backend/src/index.js`、`Restart=on-failure`、`NoNewPrivileges`/`PrivateTmp` |

deploy-ecs.sh 流程：

1. rsync `--delete`（排除 `node_modules` / `.git` / `.github` / `android` / `ios` / `data` / `.env*` / `*.log`）→ 远端 `APP_DIR`；rsync 走同一把 SSH 私钥
2. `cd backend && npm ci --omit=dev`
3. `RUN_MIGRATE=1` 时：source `/etc/baobao-backend.env` → 有 `MYSQL_HOST`/`MYSQL_URL`/`DATABASE_URL` 才跑 `node scripts/mysql-apply-migration.js`，否则跳过
4. `sudo systemctl restart baobao-backend`（无 unit 则提示手动重启）

> 部署注意：rsync 排除 `data/` 与 `.env*`，远端密钥由 `/etc/baobao-backend.env` 提供（unit 的 EnvironmentFile）；脚本本身不含云密钥（`deploy-ecs.sh:3-4`）。

---

## 8. 数据迁移 SOP（migrations/）

现有迁移（6 个，均 InsForge Postgres 版 DDL）：

| 文件 | 内容 |
|------|------|
| `20260720141941_create-learning-backend.sql` | learning 基础表 |
| `20260720142634_harden-learning-backend.sql` | 加固 |
| `20260720223312_add-learning-report-metrics.sql` | 报表指标字段 |
| `20260720224601_rollback-learning-report-metrics.sql` | 上述回滚范例 |
| `20260804142000_add-math-worlds-to-learning-backend.sql` | 数学世界 |
| `20260804150000_add-math-attempts-to-learning-profile.sql` | 数学尝试字段 |

Schema 变更硬性步骤：

1. **先写**：字段 / 用途 / 调用方 / 回滚 SQL / 是否破坏前端契约
2. 落草稿到 `migrations/`，**未确认不得对生产库执行**
3. 等用户明确确认
4. 同步 OpenAPI / contracts / repository normalize
5. 测试：`cd backend && npm test` + 相关 e2e
6. 灰度：先 InsForge 或只读校验，再写路径

**禁止新增（未确认）**：宝宝生日、每关星级、答题耗时、尝试次数、是否使用提示、错音分类、VIP/商品销售字段等。

---

## 9. 运维速查

| 动作 | 命令 / 端点 |
|------|-------------|
| 健康检查 | `GET /api/health`（status / learningBackend / learningConfigured / smsProvider / nodeEnv）；`GET /healthz` 兼容 |
| 本地上线验证 | 根 `npm start` → 日志核对 Auth/SMS/Learning/Admin token 四行（`index.js:146-161`） |
| 后台 | `GET /admin/`；`Authorization: Bearer $ADMIN_TOKEN` 或 `X-Admin-Token`（`admin-router.js:23-26`）；**未配 ADMIN_TOKEN 则拒绝**（:31-34） |
| 测试 | `npm test`（根，`package.json:6`） |
| 发布前审计 | `npm run audit:release`、`npm run testflight:preflight` |
| 生产短信 | `SMS_PROVIDER=aliyun` + 阿里云凭据；`NODE_ENV=production` 时禁虚拟登录、禁 dev 回落（`virtual-login.js:13-14`、`auth.js:40-46`） |
| 数据备份 | 见 §4：`data/` 需自行备份或切 MySQL auth |
