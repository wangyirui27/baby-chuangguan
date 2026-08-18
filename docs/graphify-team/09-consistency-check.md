# 09 · 文档声明 vs 代码事实

> 项目根：`/Users/yr/嗨洛塔少儿启蒙APP`  
> 生成：2026-08-13（只读代码；只写本文）  
> 规则：每项 = **声明** | **证据路径:行** | **PASS/FAIL**  
> Graphify SSOT：`graphify-out/README.md` — 286 files · 3462 nodes · 5743 edges · 240 communities

**HTTP 红线：** `POST /api/learning/upsert` **不是**正确 API。出现处必须标 **ERROR / 已否决**。同步唯一全量写 = `PUT /api/learning/state`。

---

## 1. Learning 同步路由名

| # | 声明 | 证据 | 结果 |
|---|------|------|------|
| 1.1 | 生产同步写 = `PUT /api/learning/state`；无 upsert HTTP | `backend/src/learning.js:159` `router.put('/state', …)`；全文件无 upsert 路由 | **PASS** |
| 1.2 | 客户端 `saveLearningState` = PUT state | `auth/apiClient.js:415-416` | **PASS** |
| 1.3 | 挂载 `/api/learning` | `backend/src/index.js:114` | **PASS** |
| 1.4 | `03` 写 PUT state、禁止 upsert 端点 | `docs/graphify-team/03-backend-api.md:15,89-97,261` | **PASS** |
| 1.5 | `PRODUCT` / `02` / `00` / `07` / `TECH` 同步 API 与代码一致 | `docs/PRODUCT.md:32,76`；`02-product-loop.md:19`；`00-cursor-architecture.md:20,181-182`；`07-data-model.md:16,165-166`；`docs/TECH.md:21` | **PASS** |
| 1.6 | 残稿宣称 `upsertSession → POST /api/learning/upsert` | `docs/graphify-team/_stale-04-frontend-hud.md.bak:15` | **FAIL · ERROR / 已否决**。方法名与路径均不存在于 `apiClient.js` 导出 |
| 1.7 | `05` 记载旧 04-HUD 错路由 `/api/learning/upsert` | `docs/graphify-team/05-audit-gaps.md:98` | **PASS（作为历史错误记录）**。该句不得解读为现行 API |
| 1.8 | `apps/backend` 无 learning 路由 | `apps/backend/src/app.js:65-70` 仅 `/api/health` + `/api/auth` | **PASS** |
| 1.9 | 存储层 InsForge `.upsert()` / MySQL `ON DUPLICATE KEY` ≠ HTTP 面 | `03-backend-api.md:97` | **PASS**（实现细节，未提升为 API） |

`rg` 生产 JS：**零** `POST /api/learning/upsert`。文档命中仅 stale bak + `05` 历史审计 + 本轮 08–12 的 **ERROR / 已否决** 标注。

---

## 2. 04 / 06 编号

| # | 声明 | 证据 | 结果 |
|---|------|------|------|
| 2.1 | **04 永远是 deploy/ops** | 磁盘：`docs/graphify-team/04-deploy-ops.md` 标题「部署 / 运维」；`00-cursor-architecture.md:313`；`PRODUCT.md:117`；`TECH.md:58` | **PASS** |
| 2.2 | **06 = frontend HUD** | `00-cursor-architecture.md:315`；`01-inventory.md:171`；`02-product-loop.md:8` | **约定 PASS** |
| 2.3 | `06-frontend-hud.md` 已存在 | `docs/graphify-team/06-frontend-hud.md` · 23423 B · 2026-08-13 17:21 | **PASS**（Cursor 落盘） |
| 2.4 | 误编号 HUD 残稿已隔离 | `_stale-04-frontend-hud.md.bak`（含 ERROR upsert） | **PASS** |
| 2.5 | `graphify-team/README.md` 链 06 + 全集完成态 | `README.md` 嗨洛塔根 · 3462/5743 · 06–12 链活 | **PASS**（编排 17:20 已刷） |
| 2.6 | `05` 07-21 节批评 04 被 HUD 占用 | `05-audit-gaps.md:98,106` | **PASS（历史）**；现网 04 已纠正 |

---

## 3. `apps/backend` vs `backend/`

| # | 声明 | 证据 | 结果 |
|---|------|------|------|
| 3.1 | 生产 API = 根 `npm start` → `backend/` | 根 `package.json` `"start": "cd backend && npm start"`；`backend/src/index.js:90` static 仓库根 | **PASS** |
| 3.2 | `apps/backend` 非生产；仅 auth/health | `apps/backend/src/app.js:65-70`；`00-cursor-architecture.md:17,336-344`；`03-backend-api.md:12-14,239-255` | **PASS** |
| 3.3 | `apps/backend` README「five frozen routes + in-memory」为生产描述 | `apps/backend/README.md:3` | **FAIL（过期）**：五条冻结是契约意图；实现无 learning；且不是生产入口 |
| 3.4 | OpenAPI 为全产品 SSOT | `packages/contracts/README.md:3`；`openapi.yaml` 仅 health+auth（`07-data-model.md:20,406`） | **FAIL（契约滞后）** |
| 3.5 | `PRODUCT`/`TECH`/`01` 写 `apps/*` 非主入口 | `docs/PRODUCT.md:10,93`；`docs/TECH.md:18`；`01-inventory.md:15,49` | **PASS** |

---

## 4. VIP `FREE_LEVEL_COUNT=10`

| # | 声明 | 证据 | 结果 |
|---|------|------|------|
| 4.1 | 英语图前 10 关免费 | `script.js:110` `const FREE_LEVEL_COUNT = 10;` | **PASS** |
| 4.2 | `levelId > FREE_LEVEL_COUNT` 且非 VIP → `paid` | `script.js:2066` | **PASS** |
| 4.3 | `PRODUCT` / `02` 声明与常量一致 | `docs/PRODUCT.md:62`；`02-product-loop.md:21,159` | **PASS** |
| 4.4 | 数学图不做 VIP 门控 | `02-product-loop.md:21`；`PRODUCT.md:50` | **PASS** |
| 4.5 | 商品 ID `baby_island_map_vip_001` | `docs/PRODUCT.md:63`；`docs/iap-product-ids.md:7` | **PASS** |

---

## 5. Graphify 数字 vs `graphify-out/README.md`

权威行：`graphify-out/README.md:5-6` → **286** files · **3462** nodes · **5743** edges · **240** communities · 日期 **2026-08-13**。

| # | 声明处 | 数字 | 结果 |
|---|--------|------|------|
| 5.1 | `graphify-out/README.md:5-6` | 286 / 3462 / 5743 / 240 | **PASS（SSOT）** |
| 5.2 | `00-cursor-architecture.md:22,280-284` | 同 | **PASS** |
| 5.3 | `01-inventory.md:24,140-144` | 同 | **PASS** |
| 5.4 | `03-backend-api.md:4` | 同 | **PASS** |
| 5.5 | `04-deploy-ops.md:5` | 同 | **PASS** |
| 5.6 | `07-data-model.md:7` | 同 | **PASS** |
| 5.7 | `docs/PRODUCT.md:122` · `docs/TECH.md:24` · `docs/codegraphy.md:18-21` | 同 | **PASS** |
| 5.8 | `docs/graphify-team/README.md:19` | 286 / 3462 / 5743 / 240；根 `/Users/yr/嗨洛塔少儿启蒙APP` | **PASS**（已刷） |

---

## 6. 额外对照（本轮必查延伸）

| # | 声明 | 证据 | 结果 |
|---|------|------|------|
| 6.1 | Learning 默认 InsForge；`LEARNING_REPOSITORY=mysql` 才 RDS | `backend/src/learning-repository-factory.js:15-28`；`TECH.md:19`；`PRODUCT.md:80` | **PASS** |
| 6.2 | 未设 repository 时，缺省探测看 `INSFORGE_URL` **且** `INSFORGE_SERVICE_KEY` | `learning-repository-factory.js:27` | **PASS** |
| 6.3 | InsForge repository 实际读 `INSFORGE_API_KEY`（非 serviceKey 形参） | `insforge-learning-repository.js:246-247` vs factory `:70-72` | **PASS（债已记录）**；`00`/`04`/`07` 已写 |
| 6.4 | Auth 默认 JSON；仅显式 `AUTH_REPOSITORY=mysql` | `backend/src/db.js:20-36`；`07-data-model.md:18,34` | **PASS** |
| 6.5 | `TECH.md`：`REDIS_URL` 由 `security.js` 读取，失败回退内存 | `docs/TECH.md:125`；`backend/src/security.js` **无** `REDIS_URL`/`redis` | **FAIL** |
| 6.6 | `backend-architecture.md`：Redis 代码就绪（ioredis INCR） | `docs/backend-architecture.md:72`；`04-deploy-ops.md:19,167-169`；`backend/package.json` 无 redis | **FAIL** |
| 6.7 | `codegraphy.md` 限流表写 `REDIS_URL` | `docs/codegraphy.md:257` | **FAIL** |
| 6.8 | `TECH.md` OSS 键含 `OSS_ASSETS_MODE` `STATIC_ROOT` 且 `oss.js` 读取 | `docs/TECH.md:126`；`backend/src/oss.js` 无此二键；`oss.js` 未挂 `index.js`（`04-deploy-ops.md:174`） | **FAIL** |
| 6.9 | `deploy/pipeline/ci-cd.md`：仓库无 `.github/workflows/*` | `deploy/pipeline/ci-cd.md:7` vs `.github/workflows/testflight-preflight.yml`；`04-deploy-ops.md:210` | **FAIL** |
| 6.10 | `00` §6：01 / 08–12 尚未生成 | `00-cursor-architecture.md:310-321` vs 磁盘已有 `01` 与本轮 `08–12` | **FAIL（00 状态表过时）** |
| 6.11 | `05` 称 `script.js` 10043 行 | `05-audit-gaps.md:33`；`01-inventory.md:43` | **PASS** |

---

## 7. 汇总

| 桶 | PASS | FAIL | 说明 |
|----|------|------|------|
| Learning 路由 | 8 | 1 | 唯一 FAIL = stale bak **ERROR upsert**（正确：历史否决） |
| 04/06 编号 | 6 | 0 | 04=deploy · 06=HUD 已齐 · README 已刷 |
| 双后端 | 3 | 2 | 叙事对；apps/contracts README 过期 |
| VIP=10 | 5 | 0 | |
| Graphify 数字 | 8 | 0 | README 与 `graphify-out` 一致 |
| 延伸 | 4 | 6 | Redis/OSS/CI/00 状态表 — **代码债/旁系文档**，不挡矩阵完成 |

**P0 文档债（签字见 12）：** upsert 虚构已从现行 SSOT 清除，仅 bak + 05 历史句残留（必须继续标 ERROR）；04/06 编号已正；双后端已说明但未合并。

**P1（代码/旁系文档，不挡 signoff）：** 刷 `00` §6 完成态；砍 TECH/architecture/codegraphy 的 Redis 假就绪；OpenAPI 扩 learning。
