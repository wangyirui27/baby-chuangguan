# 01-inventory — 仓库指纹

> 品牌：嗨洛塔 / HiRota（npm name: `baby-island-quest`）
> 项目根：`/Users/yr/嗨洛塔少儿启蒙APP`
> 快照日期：2026-08-13

---

## 1. 顶层目录表

| 目录 | 用途 | 备注 |
|---|---|---|
| `admin/` | 后台管理页面 | 独立 HTML+JS |
| `android/` | Android 原生壳 (Capacitor) | `app/src/main/assets/www/` 为打包产物 |
| `apps/` | 子应用（frontend / backend） | **非**生产主入口；backend 仅 auth/health 内存服务 |
| `assets/` | 媒体资源（图片/音视频） | Graphify 排除 |
| `auth/` | API 客户端 + 认证工具 | 含 `apiClient.js`（16,968 B） |
| `backend/` | Node.js 后端服务 | `npm start` → `node src/index.js` |
| `build/` | 构建产物（iOS sim 等） | 不入库，仅本地 |
| `data/` | 运行时数据 | 配置/种子文件 |
| `deploy/` | 部署脚本 | 编号 04=deploy/ops |
| `doc/` | 旧文档 | 单文件目录 |
| `docs/` | 团队文档（graphify-team 等） | 本文档所在位置 |
| `graphify-out/` | Graphify 图谱输出 | 286 files · 3462 nodes · 5743 edges · 240 communities |
| `ios/` | iOS 原生壳 (Capacitor) | `www/` 为打包产物 |
| `migrations/` | 数据库迁移 | InsForge / MySQL |
| `output/` | 生成产物 | 临时 |
| `packages/` | 内部包 | 预留 |
| `qa-after-fix/` | QA 修复截图 | 审计快照 |
| `scripts/` | 构建/部署脚本 | 工具集 |
| `screenshots/` | 审计截图 | |
| `site/` | 静态站点 | 官网等 |
| `tools/` | 开发工具 | e2e、审计、合约生成 |
| `website/` | 产品官网 | HiRota 产品介绍站 |

---

## 2. 生产入口真相框

| 文件 | 行数 | 体积 | 角色 |
|---|---|---|---|
| `index.html` | 95 | 4,611 B | 主入口 HTML，加载 manifest + script.js |
| `script.js` | 10,043 | 457,564 B | 核心业务逻辑（地图/关卡/测验/数学/AI） |
| `style.css` | 13,370 | 314,593 B | 全部样式（含平板/横屏/暗色适配） |

**API 入口**：`npm start` → `cd backend && node src/index.js`（端口由 `PORT` 环境变量控制）

> 三个文件合计 **776,768 B（≈758 KB）**，是整个前端的唯一生产壳。
> `apps/*` 是子应用开发环境，**不是**生产主入口。

---

## 3. 关键模块体积

| 文件 | 体积 | 行数 | 职责 |
|---|---|---|---|
| `script.js` | 457,564 B | 10,043 | 地图渲染、关卡逻辑、测验引擎、数学 AI、语音播放、VIP 支付 |
| `style.css` | 314,593 B | 13,370 | 全部 UI 样式 |
| `auth/apiClient.js` | 16,968 B | — | API 客户端（登录/验证码/会话/Learning/Math/VIP） |
| `auth/apiClient.local-mock.test.cjs` | 7,206 B | — | API 客户端本地 mock 测试 |
| `sw.js` | 15,194 B | — | Service Worker（离线缓存） |

---

## 4. package.json scripts

**根目录** (`baby-island-quest`)：

| Script | 命令 | 用途 |
|---|---|---|
| `test` | `NODE_ENV=test node --test quiz.test.js ambient-sfx.test.js ...` | 全量测试（390 pass） |
| `start` | `cd backend && npm start` | 启动后端服务 |
| `e2e` | `node tools/e2e-auth-flow.mjs` | 端到端认证流程 |
| `e2e:math` | `node tools/e2e-math-ai-smoke.mjs` | 数学 AI 冒烟测试 |
| `qa:map-iphone` | `node tools/qa-map-iphone-runtime.mjs` | iPhone 地图 QA |
| `testflight:preflight` | `bash tools/testflight-preflight.sh` | TestFlight 预检 |
| `testflight:verify-handoff` | `bash tools/verify-testflight-handoff.sh` | TestFlight 交接验证 |
| `audit:readiness` | `node tools/audit-readiness.mjs` | 发布就绪审计 |
| `audit:release` | `node tools/audit-readiness.mjs --strict` | 严格发布审计 |
| `probe:asset-packs` | `node tools/probe-asset-pack-urls.mjs` | 资源包 URL 探测 |
| `generate:contracts` | `node tools/contracts/generate.mjs` | 合约生成 |
| `generate:question-audio` | `node backend/src/generate-question-audio-v2.js` | 问题音频生成 |
| `generate:math-question-audio` | `node backend/src/generate-math-question-audio.js` | 数学问题音频 |
| `generate:math-story-theme-audio` | `node backend/src/generate-math-story-theme-audio.js` | 数学故事主题音频 |
| `import:math-story-videos` | `node backend/src/import-math-story-videos.js` | 数学故事视频导入 |
| `validate:contracts` | `node tools/contracts/validate.mjs` | 合约验证 |
| `frontend:dev:mock` | `cd apps/frontend && npm run dev:mock` | 前端 Mock 开发 |
| `frontend:dev:real` | `cd apps/frontend && npm run dev:real` | 前端真实后端开发 |
| `frontend:mock:server` | `cd apps/frontend && npm run mock:server` | Mock 服务器 |
| `frontend:build` | `cd apps/frontend && npm run build` | 前端构建 |
| `frontend:test` | `cd apps/frontend && npm run test` | 前端测试 |
| `frontend:test:mock` | `cd apps/frontend && npm run test:mock` | 前端 Mock 测试 |
| `frontend:smoke` | `cd apps/frontend && npm run test:smoke` | 前端冒烟测试 |

**Backend** (`baby-quest-backend`)：

| Script | 命令 |
|---|---|
| `start` | `node src/index.js` |

---

## 5. npm test 覆盖列表

执行命令：`npm run test`（`NODE_ENV=test node --test ...`）

**总计：390 tests · 15 suites · 0 fail · 887 ms**

| 测试文件 | 归属 | 覆盖范围 |
|---|---|---|
| `quiz.test.js` | 核心前端 | 200 关卡、正确/错误答题、进度、排名、错题本、VIP 付费、数学 AI、平板横屏、语音、资源包 |
| `ambient-sfx.test.js` | 核心前端 | 背景音效、按钮音、地图 BGM 切换 |
| `voice-samples-v2.test.js` | 语音生成 | V2 语音样本生成器、凭据安全、manifest 结构 |
| `generate-word-audio-v2.test.js` | 语音生成 | 单词音频 V3 API、manifest V2、去重、凭据隔离 |
| `native-shell.test.js` | 原生壳 | iOS H5 桥、购买/恢复、TestFlight、资源包 |
| `auth/apiClient.local-mock.test.cjs` | API 客户端 | 本地 mock fallback、登录/会话/登出周期、Learning/Math API |
| `backend/src/auth.test.js` | 后端 | 认证全流程、短信验证码、限流、凭据安全 |
| `backend/src/admin.test.js` | 后端 | 管理后台 API、用户列表、封禁、VIP |
| `backend/src/learning.test.js` | 后端 | Learning 状态同步、MySQL 存储 |
| `backend/src/learning-repository-factory.test.js` | 后端 | 存储后端工厂（InsForge/MySQL/none） |
| `backend/src/math-coach-ai.test.js` | 后端 | 数学 AI 教练配置、模板回退 |
| `backend/src/math-migrations.test.js` | 后端 | 数学迁移（math_attempts JSONB） |
| `backend/src/me-router.test.js` | 后端 | 用户信息路由、VIP、排名 |
| `backend/src/mysql-learning-repository.test.js` | 后端 | MySQL 存储实现 |
| `backend/src/sms-provider-aliyun.test.js` | 后端 | 阿里云短信 provider |
| `backend/src/virtual-login.test.js` | 后端 | 虚拟登录（测试环境免短信） |
| `apps/backend/test/api.test.js` | 子应用后端 | 合约 fixtures、路由匹配 |
| `apps/backend/test/contract.test.js` | 子应用后端 | OpenAPI 合约验证 |
| `apps/frontend/tests/api-client.test.cjs` | 子应用前端 | API 客户端 URL 路径、验证规则、Mock 行为 |
| `apps/frontend/tests/smoke.test.cjs` | 子应用前端 | 前端冒烟测试（未在 npm test 中，需 `frontend:smoke`） |

---

## 6. Graphify 数字引用

来源：`/Users/yr/嗨洛塔少儿启蒙APP/graphify-out/README.md`

| 指标 | 值 |
|---|---|
| 聚焦文件数 | 286 |
| 节点数 | 3,462 |
| 边数 | 5,743 |
| 社区数 | 240 |
| 排除 | `assets/**` 媒体、node_modules、output、.git |

输出文件：
- `graphify-out/GRAPH_REPORT.md` — 完整图谱报告
- `graphify-out/graph.html` — 浏览器可视化
- `graphify-out/graph.json` — 图谱数据
- `graphify-out/wiki/` — 模块 wiki

---

## 7. 同步 API 说明

- **Learning 状态同步**：`PUT /api/learning/state`（无 upsert，全量替换）
- **Learning 存储后端**：默认 InsForge；设置 `LEARNING_REPOSITORY=mysql` 时使用 MySQL
- **API 根**：`npm start` → `backend/` → `node src/index.js`

---

## 8. 编号约定

| 编号 | 主题 |
|---|---|
| 01 | 本文件（仓库指纹） |
| 02 | 产品闭环（product-loop） |
| 03 | 后端 API |
| 04 | 部署/运维 |
| 05 | 审计快照 |
| 06 | 前端 HUD |
| 07 | 数据模型 |
