# 嗨洛塔 / HiRota · 全面整理文档索引

> 更新：**2026-08-13**  
> 项目根：`/Users/yr/嗨洛塔少儿启蒙APP`  
> 方法：Graphify AST + 五席文档矩阵（Cursor / Mimo / Grok / DeepSeek / K3）+ 编排核验  
> **状态：文档工程完整**（signoff **98/100** · [`12-complete-signoff.md`](./12-complete-signoff.md)）

---

## 0. 30 秒结论

| 点 | 事实 |
|----|------|
| **生产 H5** | `index.html` + `script.js` + `style.css` |
| **生产 API** | 根 `npm start` → `backend/` Express 同端口静态 + `/api/*` |
| **Learning** | 默认 InsForge；`LEARNING_REPOSITORY=mysql` 显式 opt-in |
| **新壳** | `apps/*` + contracts：**非生产入口** |
| **同步 API** | **`PUT /api/learning/state`**（**无** upsert 路由） |
| **知识图** | `graphify-out/`：**286** files · **3462** nodes · **5743** edges · **240** communities（排除 `assets/` 媒体） |

总入口：

- 产品 → [`../PRODUCT.md`](../PRODUCT.md)  
- 技术 → [`../TECH.md`](../TECH.md)  
- Codegraphy → [`../codegraphy.md`](../codegraphy.md)  

---

## 1. 推荐阅读顺序

1. [本 README](./README.md)  
2. [00-cursor-architecture.md](./00-cursor-architecture.md) — 架构 + 文档地图  
3. [01-inventory.md](./01-inventory.md) — 仓库指纹  
4. [02-product-loop.md](./02-product-loop.md) — 产品闭环  
5. [03-backend-api.md](./03-backend-api.md) — 后端 API  
6. [04-deploy-ops.md](./04-deploy-ops.md) — **部署 / 运维 / 迁移**  
7. [06-frontend-hud.md](./06-frontend-hud.md) — 前端 HUD  
8. [07-data-model.md](./07-data-model.md) — 表与 LearningState  
9. [11-frontend-api-verify.md](./11-frontend-api-verify.md) — API 终检  
10. [12-complete-signoff.md](./12-complete-signoff.md) — 签字  
11. Graphify：`../../graphify-out/GRAPH_REPORT.md` · `graph.html` · `wiki/`

---

## 2. 全集目录

| # | 文件 | 职责 |
|---|------|------|
| 00 | [00-cursor-architecture.md](./00-cursor-architecture.md) | 架构总览 |
| 01 | [01-inventory.md](./01-inventory.md) | 目录/入口 |
| 02 | [02-product-loop.md](./02-product-loop.md) | 产品闭环 |
| 03 | [03-backend-api.md](./03-backend-api.md) | 后端 API |
| 04 | [04-deploy-ops.md](./04-deploy-ops.md) | 部署运维迁移 |
| 05 | [05-audit-gaps.md](./05-audit-gaps.md) | 审计快照 |
| 06 | [06-frontend-hud.md](./06-frontend-hud.md) | 前端 HUD |
| 07 | [07-data-model.md](./07-data-model.md) | 数据模型 |
| 08 | [08-doc-catalog.md](./08-doc-catalog.md) | 文档目录 |
| 09 | [09-consistency-check.md](./09-consistency-check.md) | 一致性 |
| 10 | [10-deploy-code-verify.md](./10-deploy-code-verify.md) | 部署↔代码 |
| 11 | [11-frontend-api-verify.md](./11-frontend-api-verify.md) | 前端 API 终检 |
| 12 | [12-complete-signoff.md](./12-complete-signoff.md) | 完整度签字 |

### Graphify

| 路径 | 说明 |
|------|------|
| `/Users/yr/嗨洛塔少儿启蒙APP/graphify-out/GRAPH_REPORT.md` | 结构报告 |
| `.../graph.html` | 交互图 |
| `.../graph.json` | GraphRAG |
| `.../wiki/` | 社区 wiki |
| `.../README.md` | 跑次摘要 |

---

## 3. 编号铁律

| 号 | 含义 |
|----|------|
| **04** | **永远** deploy/ops/migration |
| **06** | frontend HUD（禁止再占 04） |
| **05** | 审计历史快照 |
| **08–12** | 第二轮核验与签字 |

---

## 4. P0 摘要

详见 [12-complete-signoff.md](./12-complete-signoff.md)：upsert 虚构关闭、编号纠正、Graphify 刷新、生产入口写死。

开放代码债（不挡文档完成）：`script.js` 巨石、OpenAPI 扩面、IAP 验票、双后端收敛。

---

## 5. 本地命令

```bash
npm test
npm start
# Graphify 刷新（串行 AST）
"$(cat graphify-out/.graphify_python)" graphify-out/_run_ast.py
```
