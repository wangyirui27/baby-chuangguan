# 10 · 部署文档 ↔ 代码核验

> 项目根：`/Users/yr/嗨洛塔少儿启蒙APP`  
> 生成：2026-08-13  
> 对照：`backend/` · `deploy/` · `.env.example`（**只列键名，禁止贴密钥**）· `tools/pack-app-www.sh`  
> 基线运维文：`docs/graphify-team/04-deploy-ops.md` · API 表：`03-backend-api.md`

**HTTP 红线：** 无 `POST /api/learning/upsert`。同步写 = `PUT /api/learning/state`（`learning.js:159`）。

---

## 0. 结论

| 项 | 结果 |
|----|------|
| 生产进程 | 根 `npm start` → `backend/src/index.js`，默认 `PORT`/`3000`，静态=仓库根 |
| env 真读 | 见 §1；`.env.example` 有一批**假旋钮**（代码不读） |
| Redis / OSS 请求路径 | **未实现 / 未挂载**（与 `04` 一致；与 `TECH.md` §4 不一致） |
| 路由 vs `03` | **对齐**（§2） |
| iOS/Android www | pack 脚本参数化输出；Android 固定 `android/app/src/main/assets/www`；iOS Archive 内 `www`（§3） |
| `apps/*` | 非本核验生产路径 |

---

## 1. `process.env` 真读（改 env 有效）

加载序（`backend/src/index.js:7-13`，`04` §2.1）：`backend/.env` → cwd `.env` → 可选 `backend/.env.mysql.local`（override）。**无** `.env.redis.local` / `.env.oss.local` 加载。

### 1.1 运行时（Express 热路径）

| 键名 | 用途 | 读取位置 |
|------|------|----------|
| `PORT` | 监听端口，默认 3000 | `index.js:30` |
| `NODE_ENV` | CORS / cookie secure / 虚拟登录 / SMS 回落 | `index.js:41`；`auth.js:41,458`；`virtual-login.js:12` |
| `CORS_ORIGINS` | 逗号白名单 | `index.js:47-50` |
| `CORS_ALLOW_NULL_ORIGIN` | `true` 才放行 `null`（严格环境） | `index.js:74` |
| `SMS_PROVIDER` | `development` / `aliyun` | `sms-provider.js:277`；`index.js:98` |
| `SMS_ALIYUN_ACCESS_KEY_ID` | 阿里云 AK | `sms-provider.js:81` |
| `SMS_ALIYUN_ACCESS_KEY_SECRET` | 阿里云 SK | `:82` |
| `SMS_ALIYUN_SIGN_NAME` | 签名 | `:83` |
| `SMS_ALIYUN_TEMPLATE_CODE` | 模板 | `:84` |
| `SMS_ALIYUN_REGION_ID` | 默认 `cn-hangzhou` | `:85` |
| `SMS_ALIYUN_ENDPOINT` | Dysms URL | `:86` |
| `SMS_ALIYUN_TEMPLATE_PARAM_KEY` | 默认 `code` | `:87` |
| `SMS_DEV_FALLBACK` | `0` 关闭开发回落 | `auth.js:43-45` |
| `AUTH_REPOSITORY` / `AUTH_BACKEND` | `mysql`/`rds` 切 Auth MySQL | `db.js:26-34` |
| `AUTH_FORCE_JSON` | `1` 强制 JSON | `db.js:22` |
| `MYSQL_HOST` `MYSQL_PORT` `MYSQL_USER` `MYSQL_PASSWORD` `MYSQL_DATABASE` `MYSQL_CONNECTION_LIMIT` | Auth 与 Learning MySQL | `db.js:44-51`；`mysql-learning-repository.js:44-50` |
| `LEARNING_REPOSITORY` / `LEARNING_BACKEND` | `mysql`/`rds` / `insforge`/`pg` / `none` | `learning-repository-factory.js:15-24` |
| `INSFORGE_URL` | factory 探测 + repository baseUrl | factory `:27`；`insforge-learning-repository.js:246` |
| `INSFORGE_SERVICE_KEY` | **仅** factory 缺省探测 + 传入 `serviceKey`（构造函数**不读**该 option） | factory `:27,72` |
| `INSFORGE_API_KEY` | repository 实际 API key | `insforge-learning-repository.js:247` |
| `VIRTUAL_LOGIN` | `0` 关（dev/test 默认开） | `virtual-login.js:17` |
| `VIRTUAL_LOGIN_STRICT` | `1` 严格 | `:26` |
| `VIRTUAL_LOGIN_CODE` | 覆盖默认 `1234` | `:33` |
| `ALLOW_VIRTUAL_LOGIN` | 生产/staging 显式开 | `:14` |
| `ADMIN_TOKEN` | 运维台 | `admin-router.js:31` |
| `MATH_COACH_AI_ENABLED` | 远程 LLM 显式 opt-in | `math-coach-ai.js:36-37` |
| `MATH_COACH_AI_API_KEY` | LLM key | `:24` |
| `MATH_COACH_AI_BASE_URL` | 默认 OpenAI URL | `:26` |
| `MATH_COACH_AI_MODEL` | 默认 `gpt-4o-mini` | `:30` |
| `MATH_COACH_AI_TIMEOUT_MS` | clamp 1000–20000 | `:31-33` |
| `OPENAI_API_KEY` `OPENAI_BASE_URL` `OPENAI_MODEL` | 上列别名；**有 key 不会自动 ENABLE** | `math-coach-ai.js:24-30,35` |
| `OSS_PUBLIC_BASE_URL` `COURSE_VIDEO_BASE` `ASSET_CDN_BASE` | 视频/CDN 前缀（目录） | `content-catalog.js:108-110` |
| `OSS_BUCKET` `OSS_ENDPOINT` `OSS_ACCESS_KEY_ID` `OSS_ACCESS_KEY_SECRET` | readiness / 签名工具 | `content-catalog.js:140-141,778-786`；`oss.js:18-21`（**模块未被 index 挂载**） |

`oss.js` 另读 `OSS_PUBLIC_BASE_URL`（`:8`）。全库无 `require('./oss')` → 请求链不走 OSS 302。

### 1.2 工具脚本（非请求热路径）

| 键名 | 谁读 |
|------|------|
| `DOUBAO_APP_ID` `DOUBAO_TOKEN` `DOUBAO_CLUSTER` `DOUBAO_VOICE_TYPE` `DOUBAO_SAMPLE_RATE` `DOUBAO_AUDIO_FORMAT` | `generate-tts.js` / `generate-voice-samples*.js` / `generate-*-audio*.js` |
| `MATH_STORY_VIDEO_FORCE` `MATH_STORY_VIDEO_SRC` | `import-math-story-videos.js:23-26` |
| `MATH_STORY_THEME_FORCE` | `generate-math-story-theme-audio.js:22` |
| `MATH_Q_AUDIO_FORCE` `MATH_Q_AUDIO_FORCE_PREFIX` | `generate-math-question-audio.js:26-27` |

### 1.3 代码**不读**（`.env.example` 假旋钮）

根 `.env.example` 注释出现、运行时**无效**：

| 键名 | 证据 |
|------|------|
| `SESSION_SECRET` | `.env.example:38`；token=`crypto.randomBytes(32)`（`db.js:223-225`，`04` §2.3） |
| `SESSION_MAX_DAYS` | `.env.example:39`；硬编码 30 天 `auth.js:88` |
| `PHONE_MAX_SENDS` `PHONE_WINDOW_MINUTES` `PHONE_COOLDOWN_SECONDS` | `.env.example:42-44`；`auth.js:83-85` |
| `CODE_EXPIRY_MINUTES` `CODE_MAX_ATTEMPTS` | `.env.example:45-46`；`auth.js:86-87` |
| `IP_RATE_LIMIT_MAX` `IP_RATE_LIMIT_WINDOW_MINUTES` | `.env.example:47-48`；`security.js:78` 写死 20/15min |

### 1.4 文档声称读取、代码**零命中**

| 键名 | 文档 | 代码 |
|------|------|------|
| `REDIS_URL` `DISABLE_REDIS_RATE_LIMIT` `REDIS_RATE_LIMIT_IN_TEST` | `TECH.md:125`；`backend-architecture.md:72` | `security.js` 无；`backend/package.json` 无 redis 包 |
| `OSS_ASSETS_MODE` `STATIC_ROOT` | `TECH.md:126` | `oss.js` / `index.js` 无 |

`apps/backend/.env.example` 另有 `AUTH_REPOSITORY=memory`、`DATABASE_URL`（注释）。`apps/backend` **不是**生产；`DATABASE_URL` 生产 Express 不读。

`apps/frontend/.env.example`：`VITE_API_MODE` `VITE_API_BASE_URL` `VITE_DEBUG_PROXY` — 仅 Vite 壳。

### 1.5 example 缺、生产却要显式设的键

根与 `backend/.env.example` **未列出** `LEARNING_REPOSITORY` / `AUTH_REPOSITORY` / `MYSQL_*` / `INSFORGE_SERVICE_KEY` / `CORS_ALLOW_NULL_ORIGIN`。`04` 已建议生产显式 `LEARNING_REPOSITORY=insforge` + `INSFORGE_URL` + `INSFORGE_API_KEY`，避免 SERVICE_KEY 探测与 API_KEY 读取分裂。

---

## 2. 路由注册表 vs `03`

生产挂载：`backend/src/index.js`。

| Method | Path | `index.js` / router | `03` | 核验 |
|--------|------|---------------------|------|------|
| GET | `/api/health` | `index.js:93` | `03:64` | **对齐** |
| GET | `/healthz` | `index.js:104` | `03:65` | **对齐** |
| GET | `/admin` `/admin/` | `index.js:126` | `03:66` | **对齐** |
| POST | `/api/auth/send-code` | `auth.js:155` via `index.js:109` | `03:74` | **对齐** |
| POST | `/api/auth/verify-code` | `auth.js:326` | `03:75` | **对齐** |
| GET | `/api/auth/session` | `auth.js:472` | `03:76` | **对齐** |
| POST | `/api/auth/logout` | `auth.js:479` | `03:77` | **对齐** |
| GET | `/api/learning/state` | `learning.js:151` via `index.js:114` | `03:89` | **对齐** |
| **PUT** | **`/api/learning/state`** | `learning.js:159` | `03:90` | **对齐** |
| PATCH | `/api/learning/preferences` | `learning.js:170` | `03:91` | **对齐** |
| POST | `/api/learning/quiz-attempts` | `learning.js:181` | `03:92` | **对齐** |
| POST | `/api/learning/support-feedback` | `learning.js:193` | `03:93` | **对齐** |
| POST | `/api/learning/math-coach` | `learning.js:205` | `03:94` | **对齐** |
| GET | `/api/me/entitlements` | `me-router.js:19` via `index.js:121` | `03:122` | **对齐** |
| POST | `/api/me/entitlements/vip` | `me-router.js:31` | `03:123` | **对齐** |
| POST | `/api/me/ranking` | `me-router.js:52` | `03:124` | **对齐** |
| GET | `/api/rankings` | `me-router.js:70` via `index.js:122` | `03:125` | **对齐** |
| * | `/api/admin/*` | `admin-router.js` via `index.js:125` | `03:133-156` | **对齐**（未逐行重数；抽查 health/stats/vip/content 存在） |

**不存在：** `POST /api/learning/upsert`（**ERROR / 已否决**）。`rg router.*upsert backend/src` 应为空。

`apps/backend`（非生产）：`GET /api/health`（`app.js:65`）+ auth 四条。**无** `/healthz`、**无** learning/me/admin。与 `03` §6 一致。

---

## 3. iOS / Android pack `www` 路径

| 角色 | 路径 / 命令 | 证据 |
|------|-------------|------|
| Pack 脚本 | `tools/pack-app-www.sh <out-www-dir>` | 脚本 `:16-22`：拷 `index.html` `script.js` `style.css` `sw.js` |
| Android 目标 | `android/app/src/main/assets/www` | `tools/ship-android-apk.sh:7,23-24` 先 pack 再 gradle |
| iOS Archive www | `$TARGET_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH/www` | `ios/BabyEnglishIsland.xcodeproj/project.pbxproj` Build Phase **Copy H5 app** `:164-171` 调同一 pack 脚本 |
| 源树缓存 | `ios/BabyEnglishIsland/www/` | 工作区副本；**不是** Xcode 脚本的输出目录。`05` 记 `www/script.js` 与根目录行数漂移 |

铁律（`pack-app-www.sh:4-9`）：非视频运行时进包；课程 mp4 仅种子 L01–L10；数学 story×31 + 主题音进包；L11+ 下载/CDN；drafts 不准进包。

Vite `apps/frontend` **不**进入 pack。

---

## 4. `deploy/` 对照

| 文件 | 代码事实 | vs `04` |
|------|----------|---------|
| `deploy/ecs/baobao-backend.service` | `WorkingDirectory=/opt/apps/baobao/backend`；`ExecStart=/usr/bin/node backend/src/index.js`；`EnvironmentFile=-/etc/baobao-backend.env` | `04` §7 **对齐** |
| `deploy/pipeline/deploy-ecs.sh` | rsync 排除 `node_modules` `.git` `data` `.env*`；远端 `npm ci --omit=dev`；可选 migrate；`systemctl restart baobao-backend` | `04` §7 **对齐** |
| `deploy/pipeline/ci-cd.md:7` | 写「没有 `.github/workflows/*`」 | **过期**。实际：`.github/workflows/testflight-preflight.yml`（`04:210`） |

systemd 跑的是 **`backend/`**，不是 `apps/backend`。

---

## 5. 密钥纪律

本文与 `04` **只列键名**。禁止把 `.env` 值、`ADMIN_TOKEN`、InsForge key、阿里云 AK/SK、ASC `.p8` 写入 graphify-team。扫描：`tools/scan-no-apple-secrets.sh`。
