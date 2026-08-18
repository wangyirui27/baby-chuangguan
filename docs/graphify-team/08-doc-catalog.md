# 08 · 全仓文档目录索引

> 项目根：`/Users/yr/嗨洛塔少儿启蒙APP`  
> 生成：2026-08-13（只写 Markdown，未改业务代码）  
> 范围：`docs/` + `doc/` + 全仓 `README*` + 根 `AGENTS.md`  
> Graphify 2026-08-13：286 files · 3462 nodes · 5743 edges · 240 communities（`graphify-out/README.md`）

**HTTP 红线：** `POST /api/learning/upsert` = **ERROR / 已否决**。正确同步 = `PUT /api/learning/state`。

---

## 0. 推荐入口（先读这三份）

| 角色 | 路径 | 为什么 |
|------|------|--------|
| **技术总入口** | [`docs/TECH.md`](../TECH.md) | 生产 vs 非生产、Learning 默认 InsForge、`PUT /api/learning/state`、env 键名类别 |
| **产品总入口** | [`docs/PRODUCT.md`](../PRODUCT.md) | 五步闭环、VIP `FREE_LEVEL_COUNT=10`、学科边界、MVP 非目标 |
| **架构 / 图谱队** | [`docs/graphify-team/00-cursor-architecture.md`](./00-cursor-architecture.md) | 模块边界、双后端、原生 pack、00–12 地图 |

下钻：API → `03`；发船 → `04`；前端 HUD → `06`；表 → `07`；本轮核验 → `09–12`。

Graphify 数字 SSOT = `graphify-out/README.md`；矩阵索引 = [`README.md`](./README.md)（2026-08-13 已刷：嗨洛塔根 · 3462n/5743e）。

---

## 1. 状态图例

| 标记 | 含义 |
|------|------|
| **SSOT** | 现行权威；改事实先改它 |
| **现行** | 可用，专题或交接；非总入口 |
| **历史** | 快照 / 暂停交接；行号可能漂 |
| **过期** | 与 2026-08-13 代码冲突，勿当现状 |
| **重复** | 与 SSOT 重叠；以推荐入口为准 |
| **ERROR** | 错误陈述；已否决，不可当正确 API |
| **缺** | 编号约定有、磁盘无 |

---

## 2. `docs/graphify-team/`（00–12）

| 路径 | 一句话用途 | 状态 | 推荐入口 |
|------|------------|------|----------|
| `docs/graphify-team/README.md` | 00–12 索引 | **现行（2026-08-13）**：嗨洛塔根 · Graphify 286/3462/5743/240 · signoff 98/100 | `TECH.md` / `00` |
| `docs/graphify-team/00-cursor-architecture.md` | 系统架构、生产路径、原生壳、债 | **SSOT（架构）**。若 §6 仍写「01/08–12 尚未生成」则该句过时（磁盘已齐） | `TECH.md` |
| `docs/graphify-team/01-inventory.md` | 仓库指纹：目录、入口体积、scripts、测试清单 | **现行** | `00` |
| `docs/graphify-team/02-product-loop.md` | 登录→地图→题→反馈→`PUT state` 闭环 | **SSOT（产品详版）** | `PRODUCT.md` |
| `docs/graphify-team/03-backend-api.md` | 生产 `backend/` 全端点表 + factory | **SSOT（API）** | `TECH.md` |
| `docs/graphify-team/04-deploy-ops.md` | 部署 / 运维 / 迁移；env 真读 vs 硬编码 | **SSOT（运维）**。编号 **04 永远是本文件** | `TECH.md` |
| `docs/graphify-team/05-audit-gaps.md` | 07-21 审计快照 + 08-13 现况复核 | **历史真相**。§0-0721 记载旧 HUD 稿曾写 `POST /api/learning/upsert`——**ERROR / 已否决**，不是现行 API | 缺口看本文件 §0.7 |
| `docs/graphify-team/06-frontend-hud.md` | 前端 HUD / 地图 / 答题 | **SSOT（前端）** · Cursor 23KB · `PUT /api/learning/state` | `02` / `PRODUCT.md` |
| `docs/graphify-team/_stale-04-frontend-hud.md.bak` | 误占 04 号的 HUD 残稿 | **ERROR**：写 `upsertSession → POST /api/learning/upsert`。**已否决**。勿当 06 | 忽略 |
| `docs/graphify-team/07-data-model.md` | LearningState / 表 / Auth JSON / entitlements | **SSOT（数据）** | `TECH.md` |
| `docs/graphify-team/08-doc-catalog.md` | 本文：文档目录 | **现行（本轮 · 核验后修订）** | — |
| `docs/graphify-team/09-consistency-check.md` | 文档 vs 代码对照 | **现行（本轮 · 核验后修订）** | — |
| `docs/graphify-team/10-deploy-code-verify.md` | env / 路由 / pack www 核验 | **现行（本轮）** | `04` |
| `docs/graphify-team/11-frontend-api-verify.md` | `window.babyIslandApi` → HTTP | **现行（本轮）** | `03` |
| `docs/graphify-team/12-complete-signoff.md` | P0 / 质量分 / deferred / 判据 | **现行（本轮）** | — |

---

## 3. `docs/` 根级（技术 / 产品 / 架构）

| 路径 | 一句话用途 | 状态 | 推荐入口 |
|------|------------|------|----------|
| `docs/TECH.md` | 技术总入口 | **SSOT**。§4 Redis / `OSS_ASSETS_MODE` / `STATIC_ROOT` 键名超前，以 `04`+`10` 为准 | 本列 |
| `docs/PRODUCT.md` | 产品总入口 | **SSOT** | 本列 |
| `docs/codegraphy.md` | Graphify 读图 + 生产叙事 | **现行**。限流段仍提 `REDIS_URL`（过期，见 `09`） | `TECH.md` + `graphify-out/README.md` |
| `docs/backend-architecture.md` | Express 不绑云厂商；阿里云目标部署 | **部分过期**：Redis/OSS 写成「代码就绪」，`04` 证明未挂载；标题仍「宝宝闯关」 | `00` / `04` |
| `docs/admin-console.md` | `/admin` 运维台用法 | **现行** | `03` §2.5 / `04` |
| `docs/iap-product-ids.md` | IAP `baby_island_map_vip_001` | **现行** | `PRODUCT.md` |

---

## 4. TestFlight / 发船交接

| 路径 | 一句话用途 | 状态 | 推荐入口 |
|------|------------|------|----------|
| `docs/handoff-testflight-full-2026-08-07.md` | TF 全量交接 | **现行（发船）**；非架构 SSOT | 根 `README.md` |
| `docs/dev-handoff-testflight.md` | 开发打包交接 | **现行**（约 1.0.1 (6)） | 同上 |
| `docs/testflight-checklist.md` | 工程清单 | **现行** | 同上 |
| `docs/testflight-smoke.md` | 真机冒烟 | **现行** | 同上 |
| `docs/testflight-asc-form.md` | ASC 表单草稿 | **现行** | 同上 |
| `docs/testflight-secrets.md` | 签名/上传**键名**（无值） | **现行** | 同上 |
| `docs/testflight-github-actions-template.yml` | Actions 模板 | **现行模板**；仓内已有 `.github/workflows/testflight-preflight.yml` | `04` §6.3 |
| `docs/handoff-backend-aliyun-2026-07-21.md` | 阿里云后端 handoff | **历史**（07-21） | `04` / `03` |
| `docs/handoff-math-ai-3-5-2026-08-04.md` | 数学陪练 / AI 策略 | **现行（数学）** | `02` / `PRODUCT.md` |
| `docs/handoff-current-paused-goal-2026-08-04.md` | 08-04 暂停目标 | **历史** | 勿当当前里程碑 |

---

## 5. App Store / 营销 / 法律页

| 路径 | 一句话用途 | 状态 | 推荐入口 |
|------|------------|------|----------|
| `docs/app-store-screenshot-story.md` | 截图产品故事（真实功能） | **现行（商店）** | `PRODUCT.md` |
| `docs/screenshot-claims-audit-2026-08-11.md` | 截图卖点 vs 代码审计 | **现行**；当时 `script.js` 9941 行，现 10043 | `PRODUCT.md` |
| `docs/marketing/app-store-parent-conversion-brief-2026-08-11.md` | 家长转化漏斗 | **现行（营销）** | `PRODUCT.md` |
| `docs/marketing/app-store-visual-strategy-2026-08-11.md` | 预览图视觉策划 | **现行（营销）** | 上条 |
| `docs/hosted-legal-pages/index.html` | 法律页索引 | **现行托管稿** | 法务/ASC，非技术 SSOT |
| `docs/hosted-legal-pages/privacy.html` | 隐私政策 HTML | **现行托管稿** | 同上 |
| `docs/hosted-legal-pages/terms.html` | 用户协议 HTML | **现行托管稿** | 同上 |
| `docs/hosted-legal-pages/children-privacy.html` | 儿童隐私 HTML | **现行托管稿** | 同上 |

---

## 6. 课程 / 媒体（非运行时 SSOT）

题库与关卡组装的**运行时权威**是根目录 `script.js`，不是下列文案库。

| 路径 | 一句话用途 | 状态 | 推荐入口 |
|------|------------|------|----------|
| `docs/curriculum/level-question-design.md` | 海岛+沙漠题型总览 | **现行（课程）**；生成 2026-07-22 | `02` |
| `docs/curriculum/ocean-map-level-questions.md` | 海岛关题面 | **现行（课程）** | 上条 |
| `docs/curriculum/desert-map-level-questions.md` | 沙漠关题面 | **现行（课程）** | 上条 |
| `docs/curriculum/desert-200-natural-expression-list-20260801.md` | 沙漠自然表达清单 | **现行（课程）** | 上条 |
| `docs/curriculum/desert-video-semantic-qc-20260801.md` | 沙漠视频语义 QC | **现行（课程）** | 上条 |
| `docs/curriculum/desert-pep-classroom-transfer-review.md` | 沙漠↔PEP 迁移评审 | **现行（课程）** | 上条 |
| `docs/curriculum/island-200-prompt-qc-20260802.md` | 海岛 200 prompt QC | **现行（课程）** | 上条 |
| `docs/curriculum/toddler-noun-handcrafted-prompts-20260801.md` | 幼儿名词手写 prompt | **现行（课程）** | 上条 |
| `docs/curriculum/workbench-map-levels-20260801.md` | 工作台关卡映射 | **现行（课程）** | 上条 |
| `docs/curriculum/team-drafts/*.md`（01–07 + island-pending-qc） | 五人队课程草稿 / 审计 | **历史草稿** | 勿覆盖 `script.js` |
| `docs/curriculum/table-tricks-s1/` | 数学故事 S1 分镜 / prompt / keyframes（大量 txt/json） | **制作工作区**，非架构 | `handoff-math-ai-3-5` / `02` |
| `docs/media-generation-workflow-for-models.md` | 豆包 TTS + LibTV 视频边界 | **现行（媒体）**；标题仍「宝宝英语岛」 | `doc/API_SPEC.md`（TTS 规格） |
| `docs/journey-progress-redesign.md` | 航线进度 UI 历史草案 | **历史**（文内自陈不作为现行定稿） | `02` / `style.css` |
| `docs/journey-progress-mock.html` | 航线 mock 页 | **历史 / QA** | 同上 |

---

## 7. `doc/`（单文件旧目录）

| 路径 | 一句话用途 | 状态 | 推荐入口 |
|------|------------|------|----------|
| `doc/API_SPEC.md` | 豆包（火山）TTS HTTP 规格 v1.1（2025-07-15） | **现行（TTS 工具）**。**不是**产品 `/api/*` 契约。禁止与 `03` 混淆 | 媒体生成；产品 API 用 `03` |

---

## 8. 全仓 `README*` 与根治理

| 路径 | 一句话用途 | 状态 | 推荐入口 |
|------|------------|------|----------|
| `README.md` | 仓库门面：H5 快启 + TF 链接 | **现行门面**；clone URL 仍 `baby-chuangguan` | 产品/技术再进 `PRODUCT`/`TECH` |
| `AGENTS.md` | InsForge 项目 **baobao-chuangguan**、SDK 约定 | **现行（代理）** | `TECH.md` |
| `docs/graphify-team/README.md` | 见 §2 | **过期** | `TECH.md` / `00` |
| `backend/README.md` | 生产后端启动 + TTS 生成 | **现行操作**；偏 TTS，Learning 以 `03`/`04` 更准 | `TECH.md` / `04` |
| `apps/backend/README.md` | 契约后端 | **过期**：仍写 “five frozen routes” + 内存仓，未标明非生产、无 learning | `00` §7.1 / `03` §6 |
| `apps/frontend/README.md` | Vite 壳占位 | **过期/过薄**（“Sprint 6”） | `00`：非生产 |
| `packages/contracts/README.md` | OpenAPI 自称为 SSOT | **部分过期**：OpenAPI 0.1.0 只冻 auth/health；learning 在 `backend/` | `03` / `07` §8 |
| `site/README.md` | 官网静态预览（非 App） | **现行（官网）** | 与生产 H5 隔离 |
| `graphify-out/README.md` | Graphify **数字 SSOT** | **SSOT（图谱指数）** | `codegraphy.md` |
| `graphify-out/wiki/README.md.md` | wiki 自动页（双后缀） | 生成物，非手写 SSOT | `graphify-out/wiki/` |

`deploy/pipeline/ci-cd.md` 不在 `docs/`，但运维常误读：声称「当前仓库没有提交 `.github/workflows/*`」——**过期**（已有 `testflight-preflight.yml`）。以 `04` §6.3 为准。

---

## 9. 重复与冲突（压缩）

| 主题 | 多处出现 | 以谁为准 |
|------|----------|----------|
| 生产入口 | `TECH` `PRODUCT` `00` `01` 根 README | 根 `index.html` + `backend/` |
| Learning 同步 HTTP | 上列 + `03` `07` `02` | **`PUT /api/learning/state`**。任何 `POST /api/learning/upsert` = **ERROR / 已否决** |
| Graphify 数字 | `graphify-out/README.md` vs `graphify-team/README.md` | **`graphify-out/README.md`**（286 / 3462 / 5743 / 240） |
| Redis 限流 | `TECH` `backend-architecture` `codegraphy` vs `04` | **`04`：未实现**（`10` 复验） |
| 04 编号 | 旧 HUD 残稿 vs `04-deploy-ops.md` | **永远 deploy**；HUD=06（缺） |
| `apps/*` | contracts README / apps README vs `00` | **非生产** |

---

## 10. 本轮未逐文件展开的非 Markdown

`docs/curriculum/table-tricks-s1/` 下大量 `.txt` / `.json` / 生成脚本；`docs/hosted-legal-pages/*.html` 已列入 §5。不把 prompt 草稿当 API/架构事实。
