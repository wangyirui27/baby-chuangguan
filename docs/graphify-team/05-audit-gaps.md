# 05 · 终验与缺口清单

> 项目根：`/Users/yr/宝宝闯关`
> 范围：交叉审计 `docs/graphify-team/02-product-loop.md`（产品闭环）与 `03-backend-api.md`（后端 API）相对仓库真实代码，以及与 `AGENTS.md` / `docs/backend-architecture.md` / `docs/handoff-backend-aliyun-2026-07-21.md` 的事实一致性。
> 生成方式：只读分析，未修改业务代码。
> 生成时间：2026-07-21

---

## 0. 总评（先看结论）

| 维度 | 评分 | 备注 |
| --- | --- | --- |
| 01-项目清单（factual） | **9 / 10** | 路径扫描准确；`apps/backend` 实情与原注释一致（5 条路由：health + 4 auth）；是仓库快照型参考文档。 |
| 02-产品闭环（factual） | **8.5 / 10** | 行号引用抽查准确；状态机逻辑与源码一致；有一处过时项（VIP 流程）和若干"分层语义模糊" |
| 03-后端 API（factual） | **7.5 / 10** | 三个事实错误 + 三处 contract drift + apps/backend/README 过时未列入，必须立刻修 |
| 04-前端架构（factual） | **7 / 10** | 行号基本准；但**序号被错位占用** —— "04-frontend-hud.md"用掉了 04，真正的"04 部署 / 运维 / 数据迁移"还没人写。同时 04 第 263-265 行有一处错路由（`/api/learning/upsert` 不存在）。 |
| 与三份"治理文档"一致性 | **9 / 10** | 01/02/03 都未与 handoff 冲突；但 03 漏写了一处 AGENTS.md 红线（schema 变更需用户确认） |

**整体结论**：

- **01 已写完**（284 行扫描），事实可靠，作为"仓库指纹"使用。
- **02 写得扎实**，按 90/100 收尾补三句即可。
- **03 准确但有"apps/backend/README + backend/README + auth 当前状态 + mysql `count` 漏 clamp + LearningState schema 缺落盘"五件事必须先动**。
- **04-frontend-hud 是误占 04 编号**：实际要塞入 04 槽位的是"部署 / 运维 / 数据迁移"，与 03 当前快照直接对应，是整个 graphify-team 工作区最关键的一份**还没写**的文档。
- **01 可后置补完**；**04 必须先解决"apps/backend 去留 + mysql count clamp + 路由错位"再下笔**，否则会把两边都错的事情混着写。

---

## 1. 已读的事实基线（证据索引）

所有结论都基于以下可定位的真实文件。引用一律带绝对路径 + 行号。

治理三层：
- `/Users/yr/宝宝闯关/AGENTS.md`（32 行）
- `/Users/yr/宝宝闯关/docs/backend-architecture.md`（75 行）
- `/Users/yr/宝宝闯关/docs/handoff-backend-aliyun-2026-07-21.md`（297 行）

Graphify-team 工作区：
- `/Users/yr/宝宝闯关/docs/graphify-team/02-product-loop.md`（408 行）
- `/Users/yr/宝宝闯关/docs/graphify-team/03-backend-api.md`（460 行）
- 01、04、05（本文件）原不存在

仓库关键代码（04 写时必须重读）：
- `/Users/yr/宝宝闯关/backend/src/index.js`
- `/Users/yr/宝宝闯关/backend/src/auth.js`
- `/Users/yr/宝宝闯关/backend/src/learning.js`
- `/Users/yr/宝宝闯关/backend/src/insforge-learning-repository.js`
- `/Users/yr/宝宝闯关/backend/src/mysql-learning-repository.js`
- `/Users/yr/宝宝闯关/backend/src/mysql-learning-repository.test.js`
- `/Users/yr/宝宝闯关/backend/src/learning.test.js`
- `/Users/yr/宝宝闯关/backend/src/db.js`
- `/Users/yr/宝宝闯关/backend/src/security.js`
- `/Users/yr/宝宝闯关/backend/src/sms-provider.js`
- `/Users/yr/宝宝闯关/backend/.env.example`
- `/Users/yr/宝宝闯关/apps/backend/src/server.js`、`apps/backend/src/app.js`、`apps/backend/README.md`、`apps/backend/package.json`
- `/Users/yr/宝宝闯关/packages/contracts/openapi/openapi.yaml`（861 行，diff +502）
- `/Users/yr/宝宝闯关/packages/contracts/OWNERSHIP.md`、`HANDOFF.md`、`schemas/`、`fixtures/`
- `/Users/yr/宝宝闯关/script.js`（3731 行）/ `auth/apiClient.js`
- `/Users/yr/宝宝闯关/migrations/`（4 个 sql 文件）

测试：本地运行 `node --test backend/src/*.test.js` → **90/90 全绿**（与 handoff 声明一致）。

---

## 2. 02-product-loop.md 审计

### 2.1 已核对的事实 ✓

| 02 引用 | 实际位置 | 结论 |
| --- | --- | --- |
| `completionUnlockText` `script.js:568` | `script.js:568` | ✓ 准 |
| `data-stage-video` `script.js:2625` | `script.js:2625` | ✓ 准 |
| `showQuizStage` `script.js:3082` | `script.js:3082` | ✓ 准 |
| `armIdleInvite` `script.js:2920` | `script.js:2920` | ✓ 准 |
| `speakQuestion` `script.js:2865` | `script.js:2865` | ✓ 准 |
| `LEVEL.activity / mistake book / preferences` localStorage keys 974-977 | `script.js:974-977` | ✓ 准 |
| `buildLevelsFromUnits` `script.js:170` | `script.js:170` 范围内 | ✓ 准 |
| `renderMap` / `renderDetail` 范围 | 同范围 | ✓ 准 |

### 2.2 与治理文档冲突点 ⚠

| 问题 | 02 写的是 | 治理文档写的是 | 建议处理 |
| --- | --- | --- | --- |
| 后端存储表述含糊 | 第 7 节图示说 "InsForge (默认) / MySQL (LEARNING_REPOSITORY=mysql)" | `handoff` 第 92 行 "默认生产行为没有改变"；`AGENTS.md` 第 24-25 行 "默认仍是 InsForge 直到 RDS schema 验证" | 02 已表述到位，但建议补一行："**当前未切生产，对用户不可见**"，避免被读者误解为已切换 |

### 2.3 时效/老化的细节 ⏳

1. **02 第 6.2 节 VIP 流程引用**：02 标"iOS webkit messageHandler / Android native bridge（script.js:899-911）"。已抽查：
   - `script.js:857` 有 `webkit?.messageHandlers?.babyIslandAppUpdate`
   - `script.js:901` 有 `webkit?.messageHandlers?.babyIslandIAP`
   - 行号范围有微差（约 899-925），不是错误，但 02 没把"AppUpdate"（OTA？）与"IAP"（内购）这两个 bridge 区分开。**补 01 时建议改写为：**
     - `babyIslandAppUpdate`：用于前端检测运行环境、可能触发 OTA 检查
     - `babyIslandIAP`：用于 VIP 内购
2. **02 第 3.2 节"2 选 1 题型"叙述**：`script.js:2600-2602` 实际是"正确答案 + 第 1 个干扰项"，并未真的从所有 `distractors` 池里随机选 1 个。**02 表述大体正确但应避免给读者"多干扰项池"的暗示**——题型实际上是"正确答案 + 1 个固定干扰"，不是干扰池采样。
3. **02 第 11 节索引里 `backend/src/learning.js`** 没列出被改后的 `mysql-learning-repository.js` 文件名链接或行号范围——但 02 是产品闭环不是技术索引，可以接受略过。

### 2.4 用户红线核对 ⛔

`handoff` 第 49-58 行明确禁止新增业务字段：宝宝生日、每关星级、答题耗时、尝试次数、是否使用提示、错音分类、VIP/卡片销售字段。

02 第 10.2 "未实现 / MVP 边界外" 节已经显式列出前 5 项；
**但少了"VIP / 卡片销售字段"**——02 的 MVP 边界没把"未来商品化"列入禁用清单，应补一句"：所有未确认的商业化/付费扩展字段都禁"。

### 2.5 02 与治理一致性打分

- 准确性高、行号引用扎实、状态机描述忠实。
- **缺陷**：VIP bridge 区分缺失 + 题型表述易误解 + 商业化红线未明文列入。
- 8.5 / 10。建议下次更新补这 3 点（不需要重写全文）。

---

## 3. 03-backend-api.md 审计

### 3.1 已核对的事实 ✓

| 03 引用 | 实际 | 结论 |
| --- | --- | --- |
| `backend/src/index.js:77` `/api/health` | 76-79 行 ✓ | 准 |
| `backend/src/index.js:82` `/healthz` | 82-84 行 ✓ | 准 |
| `backend/src/auth.js:88` `/send-code` | 88 行 ✓ | 准 |
| `backend/src/auth.js:209` `/verify-code` | 209 行 ✓ | 准 |
| `backend/src/auth.js:358` `/session` | 358 行 ✓ | 准 |
| `backend/src/auth.js:372` `/logout` | 372 行 ✓ | 准 |
| `backend/src/learning.js:13` `writeLimiter = 180 / 15 min` | `learning.js:13` ✓ | 准 |
| IP 限流 `20次/15分钟` (`security.js`) | `security.js:78` 默认 `20` ✓ | 准 |
| 同手机号 5次/15min 60s 冷却 (RATE_LIMIT) | `auth.js:19-26` ✓ | 准 |
| 虚拟登录 1234 默认开启 | `virtual-login.js`、`auth.js:228-232` ✓ | 准 |
| migration 文件 4 个文件名 | `migrations/` 实际存在 ✓ | 准 |
| `packages/contracts/openapi/openapi.yaml:1-861` | 861 行 ✓ | 准 |

### 3.2 事实错误（必须修正）❌

#### 错误 1：`apps/backend/README.md` 表态过时

`apps/backend/README.md:2-3` 原文：

> "Contract-backed Express API for 宝宝闯关. Implements the **five** frozen routes in `packages/contracts/openapi/openapi.yaml` with an **in-memory repository**."

事实：
1. 当前 **9 个路由**（4 auth + health + /healthz + 5 learning）。"five" 表述来自更早的 contract 冻结阶段，已经过时。
2. 实际仓库内 **apps/backend 只有 4 auth + health，没 in-memory repository 实现 learning**。"in-memory repository" 的措辞把 `backend/src/db.js`（json 文件 + Map）和 apps/backend 的 `MemoryAuthRepository`（纯内存、无持久化）混淆了。
3. apps/backend 同时被 packages/contracts/openapi.yaml 里新增的 5 个 learning routes 完全无视——这两套实现目前没有任何 learning 路由。

**最小修正**：
```diff
- Contract-backed Express API for 宝宝闯关. Implements the five frozen routes
- in `packages/contracts/openapi/openapi.yaml` with an in-memory repository.
+ Contract-backed Express API for 宝宝闯关. Implements only the auth portion
+ of `packages/contracts/openapi/openapi.yaml` using a pure in-memory
+ repository (no persistence). Production still runs `backend/`'s dual-store
+ version, which supports 9 endpoints including /api/learning/*.
```

#### 错误 2：`backend/README.md` 第 28 行仍提 PostgreSQL

`backend/README.md:28` 原文：

> "PostgreSQL / `DATABASE_URL` 仅为未来边界，当前未连接。"

事实：
- 当前生产学习数据后端是 **Postgres via InsForge**（不是 PostgreSQL 直连，本地 socket）。
- `backend/package.json` 显示 `@insforge/sdk` 是 devDep。
- 未来边界应是 **RDS MySQL**，PostgreSQL 是 InsForge 默认后端不再保留的目标。

修法：

```diff
- PostgreSQL / `DATABASE_URL` 仅为未来边界，当前未连接。
+ InsForge (Postgres-backed) is the default learning-store backend. Use
+ `LEARNING_REPOSITORY=mysql` to opt into RDS MySQL.
```

#### 错误 3：第 5.3 节"完成情况"表里漏 `auth` 改造行

03 的 "迁移文件" 章节（markdown 第 9 节）和 6.1 节"完成情况"表里清楚标了 learning 数据已抽象完成，但**没有把"auth 数据层仍用 json 文件 Map"的现状放进同一张表**。建议补一行：

```
| auth 数据层（users / sessions / verifications） | ❌ 仍用 backend/src/db.js JSON 文件 + Map；未迁 |
| auth 仓库抽象（`AUTH_REPOSITORY` 变量）         | 🟡 apps/backend 预留，backend/ 未实现          |
```

### 3.3 与 contract 的 drift（schema 与实现错位）🔀

#### drift 1：`baby_mistakes.mistake_count` 范围不一致

- `packages/contracts/openapi/openapi.yaml:721-725`：`LearningMistakeItem.count` 定义 `minimum: 1, maximum: 99`。
- `/Users/yr/宝宝闯关/backend/src/insforge-learning-repository.js:128`：`clampInteger(item?.count, 1, 99, 1)`。
- `/Users/yr/宝宝闯关/backend/src/mysql-learning-repository.js:260-280`：`syncMistakes` 写入时**没有 clamp**——直接把 `item.count` 写入库。

证据：
```js
// mysql-learning-repository.js:268-277
[
  profileId,
  item.worldId,
  item.levelId,
  item.word,
  item.zhTitle,
  item.selected,
  item.correct,
  item.count,   // ← 直接写入，未做 1..99 clamp
],
```

要么 mysql 适配器对称补 clamp（推荐，与 insforge 行为对齐），要么 contract 把 `count.maximum: 99` 放宽到"无上限"。**这件事不属于 04 范畴，但应在 04 之前决定**。

#### drift 2：`LearningQuizAttemptRequest.selected/correct` 没声明长度限制

- `packages/contracts/openapi/openapi.yaml:804-810`：只声明 `selected: string, correct: string`，无 `maxLength`。
- `backend/src/learning.js:31-32`：`String(...).trim().slice(0, 40)` —— 实际写入 40 字符硬截断。

**风险**：client 可能传 1000 字符，被静默截断到 40，contract 没声明这条规则。03 现状没标。**建议**：在 contract 给 `selected` 和 `correct` 补 `maxLength: 40`，或在 backend 改成抛 400 错误（更安全）。

#### drift 3：`packages/contracts/schemas/` 缺 learning 系列 schema

`packages/contracts/schemas/` 实际只有 10 个 auth/健康相关 schema。`LearningStateResponse`、`LearningPreferencesPatch`、`LearningQuizAttemptRequest`、`LearningSupportFeedbackRequest` 在 `openapi.yaml` 已经定义，但**没有对应的 JSON Schema 文件**。

下游消费者（`packages/contracts/src/dto/`、MSW fixtures）会找不到 schema 源。**建议 04 加一节"contract 资产补全 PR"** 把这 5 个 learning schema 落盘。

### 3.4 治理红线遗漏 ⛔

`AGENTS.md:29-30`：

> "Never hardcode or commit keys. Admin/API keys are server-only. **Database schema changes require explicit user confirmation before writing migrations.**"

03 全文没有一处显式把这条规则列入"约束"或"决策记录"节。第 11 节"关键决策记录"第 5 行虽然提了"不新增业务字段（birth_date 等已回滚）"，但**没有把"先列字段、用例、回滚方案，再等确认"这套流程写出来**。建议 04 单独开辟"Schema 变更 SOP"节。

### 3.5 03 与治理一致性打分

- 9.5 成准、新旧后端结构识别准确、迁移文件事实正确。
- **三处错误必须改**（apps/backend/README 描述、backend/README PostgreSQL 提法、auth 当前状态行缺失）。
- **三处 drift 需在 04 写前确认走向**（count 上限、selected 长度、Learning schema 落盘）。

---

## 4. 01-inventory.md 审计

01 已写完。是仓库静态扫描型文档，**对错位维护细节敏感**。

### 4.1 已核对的事实 ✓

| 01 引用 | 实际 | 结论 |
| --- | --- | --- |
| 顶层目录结构 | 实际 `ls /Users/yr/宝宝闯关` 路径准确 | ✓ |
| `AGENTS.md` / `docs/backend-architecture.md` / handoff 摘要 | 已读，三个文档摘要在第 73-75 行无误 | ✓ |
| `migrations/` 4 个文件名 | 实际目录存在 ✓ | ✓ |
| `apps/backend/test/helpers/{schema-validator,test-server}.js` | 实际存在 ✓ | ✓ |
| `apps/backend/.env.example` / `apps/frontend/.env.example` | 实际存在 ✓ | ✓ |
| `auth/apiClient.local-mock.test.cjs` 等测试文件 | 已确认存在 ✓ | ✓ |
| `.libtv / .reasonix / .workbuddy / .insforge / .alma / .hermes` 等 | 实际为 Hermes 配置 / 工具目录 | ✓ |

### 4.2 风险/含糊点 ⚠

1. **第 29 行 "apps/backend/ | 新后端：契约分层 API，内存存储，实现 5 条冻结路由"**：
   - 5 条 = `GET /api/health` + 4 auth = 是 apps/backend 真实挂载数，**这是事实准确**。
   - 但 handoff 第 27 行明确说"开发模式还没有彻底前后端分离"，且 `apps/backend` 目前没有任何 learning 路由。01 没标这一点。
   - **建议加一行小字**："apps/backend 当前只跑 auth/health，learning 仍走 `backend/`"。

2. **第 134 行 "apps/backend/src/transport/auth-router.js | 新认证路由 | 5 条冻结路由实现"**：
