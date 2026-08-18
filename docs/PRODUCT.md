# 嗨洛塔 / HiRota · 产品总入口

| 字段 | 值 |
|------|-----|
| 品牌 | 嗨洛塔少儿启蒙APP · HiRota |
| npm name | `baby-island-quest` |
| 项目根 | `/Users/yr/嗨洛塔少儿启蒙APP` |
| 生产 H5 | `index.html` + `script.js` + `style.css` |
| 生产 API | 根目录 `npm start` → `backend/`（Express：静态站点 + `/api/*`） |
| 非生产 | `apps/*`（含 `apps/backend` 仅 auth/health 内存）**不是**主入口 |
| 文档日 | 2026-08-13 |
| 闭环详版 | [`graphify-team/02-product-loop.md`](./graphify-team/02-product-loop.md) |

本文是**产品事实总入口**：只写已落地闭环与边界；证据为绝对路径 + 符号/行号。不改业务代码。

---

## 1. 一句话

面向家庭的 3–6 岁启蒙 H5：孩子在**地图上闯关**（英语看视频答题 / 数学桌面互动），家长侧登录同步进度；英语地图 **前 10 关免费，其后按本地图 VIP（¥99 买断）**；数学地图**当前不做 VIP 门控**。

---

## 2. 主闭环（固定五步编号）

| # | 步骤 | 用户动作 | 系统落点 |
|---|------|----------|----------|
| ① | **登录** | 手机号 + 验证码 | `openLoginDialog` · `POST /api/auth/send-code` · `POST /api/auth/verify-code` |
| ② | **地图** | 选英语海岛/沙漠或数学小桌，点关卡 | `#map` · `MAP_WORLDS` · `renderMap` / `requestLevelAccess` |
| ③ | **视频/题** | 英语先视频后 2 选 1；数学地图内联题 | `renderDetail` / `showInlineMathLevel` |
| ④ | **反馈** | 对错反馈、庆祝、错题、解锁下一关 | `applyQuizAnswer` · `completionUnlockText` · mistakeBook |
| ⑤ | **learning 同步** | 登录后云端合并 + 防抖上传整包 | 本地 key → **`PUT /api/learning/state`**（**无 upsert 路由名**） |

详表与状态机：→ [`graphify-team/02-product-loop.md`](./graphify-team/02-product-loop.md)。

```
①登录 → ②地图 → ③视频/题 → ④反馈 → ⑤PUT /api/learning/state
              ↑__________________________________|
```

---

## 3. 学科边界

| | 英语 | 数学 |
|--|------|------|
| 地图 | `ocean` 魔法海岛 · `desert` 沙漠奇境 | `math` 数学小桌 |
| 内容 | 词 / 句视频 + 2 选项 | 计数等技能；关前可有小片子 |
| 路由壳 | `#level-{n}` | 留在 `#map` 内联 |
| VIP | 第 11–200 关需本地图 VIP | **不门控**（`getLevelAccess` 对 math 恒 allowed） |
| 进度 | `progressByWorld.ocean|desert` | `progressByWorld.math` |
| 占位未开 | `castle` | `math58` 数学花园 · `math912` 数学星塔 |

证据：`script.js` `MAP_WORLDS` ≈1735；`getLevelAccess` ≈2062。

---

## 4. VIP / Paywall

| 项 | 事实 |
|----|------|
| 免费 | `FREE_LEVEL_COUNT = 10`（英语图） |
| 商品 | `VIP_PRODUCT_ID = baby_island_map_vip_001` |
| 售卖 | ¥99 **买断当前地图**；文案明确新地图另购 |
| UI | `openPaywallDialog`：权益列表 + 立即支付 / 恢复购买 |
| 原生 | App Store / Android IAP bridge；H5 预览不扣费 |
| 服务端 | `GET/POST /api/me/entitlements` · `.../vip`（账本；完整 Store 验票仍为增强项） |

---

## 5. 数据与同步

| 层 | 事实 |
|----|------|
| 本地优先 | progress / activity / preferences / mistakeBook / math·english attempts 等 localStorage |
| 上行主 API | **`PUT /api/learning/state`** ← `auth/apiClient.js` `saveLearningState` |
| 下行 | `GET /api/learning/state` + `mergeLearningStateFromCloud` |
| 单笔答题 | `POST /api/learning/quiz-attempts` |
| 数学陪练 | `POST /api/learning/math-coach`（默认本地 streak 规则） |
| Learning 后端 | **默认 InsForge**（有 `INSFORGE_URL`+`SERVICE_KEY`）；**仅** `LEARNING_REPOSITORY=mysql` 切 MySQL |
| 验收用语 | 对外同步 = PUT saveState；**不要**写成产品级 `upsert` API |

---

## 6. 生产 vs 非生产入口

| 路径 | 角色 |
|------|------|
| `/Users/yr/嗨洛塔少儿启蒙APP/index.html` | 生产 UI |
| `/Users/yr/嗨洛塔少儿启蒙APP/script.js` | 生产逻辑 |
| `/Users/yr/嗨洛塔少儿启蒙APP/style.css` | 生产样式 |
| `/Users/yr/嗨洛塔少儿启蒙APP/backend/` | 生产 API（`npm start`） |
| `apps/frontend` · `apps/backend` | 实验/合约壳，**非**生产主路径 |
| `quiz-type1-demo.html` 等 | Demo / QA，非商店主路径 |

---

## 7. MVP 非目标（产品不承诺）

1. 英语独立「阶段复习 / Boss」玩法（当前靠重做 + 错题本）。  
2. 城堡 / 数学花园 / 数学星塔可玩内容（`comingSoon`）。  
3. 未登录云同步。  
4. 默认写入阿里云 MySQL learning（必须显式 env）。  
5. 以 `apps/*` 替换根目录三件套。  
6. 对外 Learning **upsert** 接口命名。  
7. 排行榜静态 peer 当「全网真实榜」对外承诺（UI 可有展示数据；上报另走 `/api/me/ranking`）。  
8. 支付链路在无原生壳时的真实扣费。

---

## 8. 文档地图（graphify-team 编号）

| 编号 | 含义 | 文件 |
|------|------|------|
| 02 | **产品闭环**（本文详版） | `docs/graphify-team/02-product-loop.md` |
| 03 | 后端 API | `docs/graphify-team/03-backend-api.md` |
| **04** | **deploy / ops / 迁移** | `docs/graphify-team/04-deploy-ops.md` |
| **05** | **审计快照**（历史） | `docs/graphify-team/05-audit-gaps.md` |
| **06** | **frontend HUD**（语义；磁盘或仍见 `04-frontend-hud.md`） | `docs/graphify-team/` |
| 07 | 数据模型 / LearningState | `docs/graphify-team/07-data-model.md` |
| — | 索引 | `docs/graphify-team/README.md` |
| — | Graphify 2026-08-13：286 files · 3462 nodes · 5743 edges · 240 communities | `graphify-out/README.md` |

---

## 9. 只读核验

```bash
cd "/Users/yr/嗨洛塔少儿启蒙APP"
test -f index.html && test -f script.js && test -f style.css
node -e "console.log(require('./package.json').name)"   # baby-island-quest
rg -n "PUT.*learning/state|saveLearningState|FREE_LEVEL_COUNT|openPaywallDialog|MAP_WORLDS" script.js auth/apiClient.js
rg -n "router\.(get|put)\('/state'|LEARNING_REPOSITORY" backend/src/learning.js backend/src/learning-repository-factory.js
```

---

## 10. 相关产品文档（非闭环专章）

| 文档 | 用途 |
|------|------|
| `docs/iap-product-ids.md` | IAP 商品 ID |
| `docs/backend-architecture.md` | 后端架构摘要 |
| `docs/handoff-math-ai-3-5-2026-08-04.md` | 数学 AI/陪练 handoff |
| `docs/testflight-*.md` | TestFlight 发布 |

**维护规则**：产品确认的闭环/收费/学科边界变更，须同任务更新 **本文 + `02-product-loop.md`**；未确认方案只标 proposed，不写进上表「事实」。
