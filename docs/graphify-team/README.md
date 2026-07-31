# 宝宝闯关 · 全面整理文档索引（完整版）

> 更新：2026-07-21  
> 项目根：`/Users/yr/宝宝闯关`  
> 方法：Graphify + 五人队两轮（Cursor / Mimo / ZAI / DeepSeek / MiniMax-M3）  
> **状态：可宣告文档整理完成**（M3 signoff **92.5/100**；开放项见 `12-complete-signoff.md` §3）

---

## 0. 30 秒结论

| 点 | 事实 |
|----|------|
| **生产 H5** | `index.html` + `script.js` + `style.css` |
| **生产 API** | 根 `npm start` → `backend/` Express 同端口静态+`/api/*` |
| **Learning** | 默认 InsForge；`LEARNING_REPOSITORY=mysql` 显式 opt-in；**未默认切生产 MySQL** |
| **新壳** | `apps/*` + `packages/contracts`：**非生产入口**；apps/backend 仅 auth/health |
| **同步 API** | `PUT /api/learning/state`（**无** upsert） |
| **知识图** | `graphify-out/`：1243 nodes / 1961 edges / 81 社区 |

---

## 1. 推荐阅读顺序

1. [本 README](./README.md)  
2. [00-cursor-architecture.md](./00-cursor-architecture.md) — 架构总览 + 文档地图  
3. [01-inventory.md](./01-inventory.md) — 仓库指纹  
4. [02-product-loop.md](./02-product-loop.md) — 产品闭环  
5. [03-backend-api.md](./03-backend-api.md) — 后端 API  
6. [04-deploy-ops.md](./04-deploy-ops.md) — **部署 / 运维 / 迁移**  
7. [06-frontend-hud.md](./06-frontend-hud.md) — 前端 HUD / 地图 / 答题  
8. [07-data-model.md](./07-data-model.md) — 表与 LearningState  
9. [12-complete-signoff.md](./12-complete-signoff.md) — **完整度签字**  
10. Graphify：`../../graphify-out/GRAPH_REPORT.md` · `graph.html` · `wiki/index.md`

---

## 2. 全集目录

| # | 文件 | 职责 | 作者波次 |
|---|------|------|----------|
| 00 | [00-cursor-architecture.md](./00-cursor-architecture.md) | 架构总览 | Cursor |
| 01 | [01-inventory.md](./01-inventory.md) | 目录/入口/测试清单 | Mimo |
| 02 | [02-product-loop.md](./02-product-loop.md) | 产品闭环 | ZAI |
| 03 | [03-backend-api.md](./03-backend-api.md) | 后端 API | DeepSeek |
| 04 | [04-deploy-ops.md](./04-deploy-ops.md) | 部署运维迁移 | Hermes+核验 |
| 05 | [05-audit-gaps.md](./05-audit-gaps.md) | 首轮审计（历史真相） | M3 |
| 06 | [06-frontend-hud.md](./06-frontend-hud.md) | 前端 HUD | MiniMax |
| 07 | [07-data-model.md](./07-data-model.md) | 数据模型 | Hermes |
| 08 | [08-doc-catalog.md](./08-doc-catalog.md) | 文档目录与交叉链接 | Mimo |
| 09 | [09-consistency-check.md](./09-consistency-check.md) | 产品-数据-部署一致性 | ZAI |
| 10 | [10-deploy-code-verify.md](./10-deploy-code-verify.md) | 部署文 ↔ 代码核验 | DeepSeek |
| 11 | [11-frontend-api-verify.md](./11-frontend-api-verify.md) | 前端 API 终检 | MiniMax |
| 12 | [12-complete-signoff.md](./12-complete-signoff.md) | 完整度签字 | M3 |

**Graphify**

| 路径 | 说明 |
|------|------|
| `/Users/yr/宝宝闯关/graphify-out/GRAPH_REPORT.md` | 结构报告 |
| `/Users/yr/宝宝闯关/graphify-out/graph.html` | 交互图 |
| `/Users/yr/宝宝闯关/graphify-out/graph.json` | GraphRAG |
| `/Users/yr/宝宝闯关/graphify-out/wiki/index.md` | 社区 wiki |

语料：排除 `assets/` 媒体后 **146** 代码/文档文件入图（全库 1146 含视频图）。

---

## 3. 编号规范

| 号 | 含义 |
|----|------|
| 04 | **永远是** deploy/ops/migration |
| 06 | frontend HUD（曾误占 04，已改名） |
| 05 | 审计快照，保留历史，不假装“当前缺口未修” |
| 08–12 | 第二轮核验与签字 |

---

## 4. P0 关闭摘要（详见 12）

| 项 | 状态 |
|----|------|
| apps/backend README 过时 | ✅ 已重写 |
| 04 编号冲突 | ✅ 04=deploy / 06=frontend |
| 错路由 upsert | ✅ 全文改为 saveLearningState |
| mysql mistake_count clamp | ✅ 代码 `clampInteger(1,99)` + 测试绿 |
| 部署运维文档 | ✅ 04-deploy-ops |
| Learning JSON Schema 落盘 | ⏳ deferred（contracts 生成器） |
| apps/backend 去留产品决策 | ⏳ deferred（非文档阻塞） |
| env 表误把硬编码当可配 | ✅ 04 已按 10 号核验改正 |

---

## 5. 代码侧本轮改动（文档任务附带纠偏）

| 文件 | 改动 |
|------|------|
| `backend/src/mysql-learning-repository.js` | mistakes `count` clamp 1..99 |
| `backend/src/insforge-learning-repository.js` | export `clampInteger` |
| `apps/backend/README.md` | auth-only 事实 |

测试：`backend` learning/mysql 相关 **10/10 pass**（父级复跑）。

---

## 6. 仍开放（不阻塞整理完成）

1. OpenAPI 为 selected/correct 补 `maxLength: 40`（实现已 slice）  
2. `packages/contracts/schemas` learning JSON Schema 生成落盘  
3. 限流/session 天数等若需可配 → 改代码读 env（现硬编码）  
4. 生产监控 / Redis / OSS / ECS 部署 — 工程议题，见 04  
5. `01` 个别措辞可再打磨（入口真相已补）

---

## 7. 父级终验清单

- [x] Graphify 非空图 + report + html + wiki  
- [x] 00–12 文档齐（含核验与 signoff）  
- [x] 生产入口 / API / learning 默认路径写清  
- [x] 审计 P0 文档项关闭或 deferred 有承接  
- [x] README 链接与编号正确  
- [x] 五人两轮均有产物  

**宣告：宝宝闯关 Graphify 全面整理文档工作完成。**
