# 02 · 产品闭环与学习流程

> 品牌：嗨洛塔 / HiRota（npm `baby-island-quest`）  
> 项目根：`/Users/yr/嗨洛塔少儿启蒙APP`  
> 只读核验：`script.js`、`index.html`、`auth/apiClient.js`、`backend/src/learning.js`、`backend/src/index.js`、`backend/src/auth.js`、`backend/src/me-router.js`、`backend/src/learning-repository-factory.js`  
> 审计日期：2026-08-13  
> **禁止改业务 JS/CSS/后端**；本文件只描述已落地行为。  
> 编号约定：04=deploy/ops · 06=frontend · 05=审计快照（见同目录 README）。

---

## 0. 30 秒结论

| 点 | 事实 | 证据 |
|----|------|------|
| 生产 H5 | `index.html` + `script.js` + `style.css` | `/Users/yr/嗨洛塔少儿启蒙APP/index.html`；`package.json` name=`baby-island-quest` |
| 生产 API | 根 `npm start` → `backend/`（静态根目录 + `/api/*`） | `package.json` `start`；`backend/src/index.js:90-122` |
| 主闭环 | 登录 → 地图 → 视频/题 → 反馈 → learning 同步 | 下文 §1–§5 |
| 同步 API | **`PUT /api/learning/state`**（完整 snapshot 保存；**路由层无 upsert 名**） | `auth/apiClient.js:415-416`；`backend/src/learning.js:159-167` |
| Learning 默认 | 有 InsForge 凭据 → InsForge；**仅** `LEARNING_REPOSITORY=mysql`（或 `rds`）才 MySQL | `backend/src/learning-repository-factory.js:15-28` |
| VIP | 英语图前 10 关免费；11–200 需本地图 VIP；**数学图不做 VIP 门控** | `script.js:110` `FREE_LEVEL_COUNT`；`getLevelAccess` `script.js:2062-2068` |
| 非生产 | `apps/*` 非主入口；`apps/backend` 仅 auth/health 内存 | `apps/backend/README.md` |

---

## 1. 产品定位

| 项 | 现行事实 |
|----|----------|
| 品牌 | 嗨洛塔少儿启蒙APP / HiRota |
| 对象 | 家庭场景 3–6 岁启蒙（年龄选填，不硬拦） |
| 形态 | iPad 横屏为主的 H5 + Capacitor/原生壳 IAP |
| 学科 | **英语地图**（海岛词 + 沙漠句）+ **数学小桌**（计数/序数等） |
| 关卡规模 | 每可玩地图 **200** 关（`DISPLAY_LEVEL_COUNT = 200`，`script.js:134`） |

---

## 2. 主闭环（编号固定，勿改序）

```
① 登录  →  ② 地图  →  ③ 视频/题  →  ④ 反馈  →  ⑤ learning 同步
                 ↑__________________________________|
```

| 步 | 名称 | 用户感知 | 关键实现 |
|----|------|----------|----------|
| ① | 登录 | 手机号 + 验证码；新号自动注册 | `openLoginDialog` `script.js:4578`；`POST /api/auth/send-code` · `POST /api/auth/verify-code` · `GET /api/auth/session`（`backend/src/auth.js:155,326,472`） |
| ② | 地图 | `#map` 海岛/沙漠/数学；底栏 ranking/mine 等 | `parseRouteHash` `script.js:2785-2794`；`renderMap` `script.js:6181`；`MAP_WORLDS` `script.js:1735-1800` |
| ③ | 视频/题 | 英语：`#level-N` 先视频后 2 选 1；数学：地图内联关卡 | 英语 `renderDetail` `script.js:8591`；数学 `showInlineMathLevel` `script.js:5308`；入口 `requestLevelAccess` `script.js:5337` |
| ④ | 反馈 | 对/错音效、庆祝、错题本、解锁文案 | `applyQuizAnswer` `script.js:1838`；`completionUnlockText` `script.js:2124`；错题 `normalizeMistakeBook`/`resolveMistake` `script.js:2015,2058` |
| ⑤ | learning 同步 | 本地 localStorage 即时；登录后 600ms 防抖整包上传 | `persistLearningStateLocal` `script.js:3216`；`scheduleLearningSync`/`flushLearningSync` `script.js:3481-3500`；`api.saveLearningState` → **`PUT /api/learning/state`** |

### 2.1 ① 登录

| 项 | 事实 |
|----|------|
| UI | `<dialog class="login-dialog">`，文案「嗨洛塔少儿启蒙」 |
| 客户端 | `auth/apiClient.js`：`sendCode` / `verifyCode` / `checkSession` / `logout` |
| 后端挂载 | `app.use('/api/auth', authRouter)` · `backend/src/index.js:109` |
| 同步门槛 | `hydrateLearningStateFromBackend` 要求 session 已登录后才 `learningSyncReady=true`（`script.js:3502-3533`） |

### 2.2 ② 地图世界

| worldId | 标题 | zone | 可玩 | 说明 |
|---------|------|------|------|------|
| `ocean` | 魔法海岛 | english | 是 | 词关；前 10 关包内视频 |
| `desert` | 沙漠奇境 | english | 是 | 句/短语关 |
| `math` | 数学小桌 | math | 是 | 地图内联答题；`usesVideoAssets: false` |
| `castle` | 魔法城堡 | english | **comingSoon** | 占位 |
| `math58` | 数学花园 | math | **comingSoon** | 占位 |
| `math912` | 数学星塔 | math | **comingSoon** | 占位 |

证据：`MAP_WORLDS` `script.js:1735-1800`。默认世界：`normalizeMapWorldId` 非法值回落 `ocean`（`script.js:2148-2149`）。

**Hash 路由（生产前端）**

| hash | type |
|------|------|
| `#` / `#map` | map |
| `#level-{n}` | level |
| `#ranking` `#mine` `#support` `#accuracy` | 同名 type |
| `#privacy` `#terms` `#about` | info |
| 其它 | not-found |

证据：`parseRouteHash` `script.js:2785-2794`。

### 2.3 ③ 视频 / 题

#### 英语（ocean / desert）

| 阶段 | DOM / 行为 | 证据 |
|------|------------|------|
| 进关 | `requestLevelAccess` → `navigate('level-N')` | `script.js:5337-5349` |
| 渲染 | `renderDetail(level)`：`data-stage-video` → `data-stage-quiz` | `script.js:8591+` |
| 题型 | **题型一**：正确项 + 1 干扰项（2 选项，大触控） | 注释与构造 `script.js:8600-8603` |
| 题干 | 海岛：单词义；沙漠：哪一句在说「zhTitle」 | `questionPromptText` `script.js:2797-2811` |
| 无视频 | 非本地 QA 解锁时走下载卡；本地预览可 `data-skip-to-quiz` | `script.js:8608-8630` 一带 |

#### 数学（math）

| 项 | 事实 | 证据 |
|----|------|------|
| 不进 `#level-N` 详情壳 | `renderDetail` 若 math 则改 `mapWorld=math` 并 `showInlineMathLevel` | `script.js:8591-8598` |
| 进关 | `requestLevelAccess` → `showInlineMathLevel` | `script.js:5342-5347` |
| 小片子 | 关前 story 路点（`mathStoryCleared`）；截图模式可 bypass | `script.js:5308-5326`；`shouldBypassMathStoryForCapture` |
| 自适应 | 本地 `adaptMathLevel` + 可选 `POST /api/learning/math-coach` | `backend/src/learning.js:205-215`；`localMathCoachPlan` `learning.js:112-129` |

### 2.4 ④ 反馈

| 场景 | 行为 | 证据锚点 |
|------|------|----------|
| 判定 | `applyQuizAnswer(progress, levelId, selected, correct, total)` | `script.js:1838` |
| 连续进度 | `normalizeProgress` 强制 completed 为 `1..N` 连续；断档截断 | `script.js:1817-1825` |
| 通关写入 | `completeLevel`：仅 `levelId ≤ unlockedThrough` 才推进 | `script.js:1829+` |
| 解锁文案 | `completionUnlockText`；下一关 paid → `paidAccessMessage` | `script.js:2124-2137`；`paidAccessMessage` `script.js:243` |
| 错题本 | 答错写入 / 答对 `resolveMistake` 移除；规范化 `normalizeMistakeBook` | `script.js:2015,2058` |
| 英语/数学 attempt 日志 | `englishAttempts` / `mathAttempts` 本地 key + 进 snapshot | `script.js:1146,1385,3226-3270,3198-3213` |

答错：**不扣星、不退关**；需重答对才推进（连续解锁规则）。

### 2.5 ⑤ learning 同步

```
答题/偏好变更
  → persistLearningStateLocal()          // 即时 localStorage
  → scheduleLearningSync()               // 600ms debounce
  → flushLearningSync()
       → api.saveLearningState(snapshot) // PUT /api/learning/state
```

| 层 | 名称 / 路径 | 证据 |
|----|-------------|------|
| 本地 key | `baby-island-preview-progress-v1` / `learning-activity` / `app-preferences` / `mistake-book` / `math-attempts` / `english-attempts` / `math-story-cleared` | `script.js:3078-3082,1028,1146,1385` |
| Snapshot 字段 | `profile, preferences, progressByWorld, learningActivity, mistakeBook, mathAttempts, englishAttempts, mathStoryCleared` | `learningSnapshot` `script.js:3198-3213` |
| 合并下行 | `mergeLearningStateFromCloud`：进度 max 并集、attempt merge | `script.js:3447-3478` |
| 客户端 API | `loadLearningState` GET · `saveLearningState` **PUT** · `recordQuizAttempt` POST | `auth/apiClient.js:412-424` |
| 后端路由 | 全部 `requireAuth`：`GET/PUT /state`，`PATCH /preferences`，`POST /quiz-attempts`，`POST /support-feedback`，`POST /math-coach` | `backend/src/learning.js:149-215` |
| 挂载 | `app.use('/api/learning', createLearningRouter(...))` | `backend/src/index.js:114-118` |
| 仓库选择 | 默认 InsForge（凭据在）；**显式** `LEARNING_REPOSITORY=mysql` → MySQL | `learning-repository-factory.js:15-28` |

**「无 upsert」口径（验收）**

| 允许说 | 禁止说 |
|--------|--------|
| 对外同步 API = **`PUT /api/learning/state`**，handler 调 `repository.saveState` | 文档写成客户端/OpenAPI 主路径叫 `upsertLearningState` / `POST .../upsert` |
| 仓库内部若用 DB upsert 语义是实现细节 | 把内部表 upsert 写成产品对外 API 名 |

---

## 3. 门控：进度锁 + VIP

### 3.1 访问矩阵 `getLevelAccess`

| 条件（顺序） | 返回 | 证据 |
|--------------|------|------|
| id 非法 | `missing` | `script.js:2063` |
| 本地 QA 全开 `isTempLocalUnlockEnabled()` | `allowed` | `script.js:2064` |
| **`worldId === 'math'`** | **`allowed`（不做 VIP）** | `script.js:2065` |
| `levelId > FREE_LEVEL_COUNT(10)` 且非 VIP | `paid` | `script.js:2066` |
| `levelId > unlockedThrough` | `locked` | `script.js:2067` |
| 否则 | `allowed` | `script.js:2068` |

地图节点展示 `levelStatus`（`script.js:5226-5238`）：

| status | 英语图条件 | 数学图 |
|--------|------------|--------|
| `completed` | completed 含 id | 同左 |
| `current` | ≤ unlockedThrough 且未完成 | **非 completed 即 current**（无 premium/locked 展示） |
| `premium` | id>10 且非 vip | 不出现 |
| `locked` | id>unlockedThrough | 不出现 |

点击：`requestLevelAccess`（`script.js:5337-5355`）  
- `allowed` → 进关  
- `paid` → `showMapMessage(paidAccessMessage)` + **`openPaywallDialog`**  
- 其它 →「先完成第 N 关」

### 3.2 VIP / paywall

| 项 | 事实 | 证据 |
|----|------|------|
| 产品 ID | `baby_island_map_vip_001` | `script.js:242`；`docs/iap-product-ids.md` |
| 定价文案 | ¥99 **买断本地图**；新地图另购 | `openPaywallDialog` `script.js:5361-5413` |
| 权益文案 | 第 11–200 关、会员权益、内容更新、进度记录 | 同上 |
| 支付 | iOS `webkit.messageHandlers.babyIslandIAP` / Android bridge；预览不扣费 | `script.js:2948-2971,5367-5373` |
| 成功回调 | `BabyIslandIAPComplete` / `babyIslandIAPComplete` → `completeVipPurchase` | `script.js:5455+` 一带 |
| 服务端账本 | `POST /api/me/entitlements/vip`；读取 `GET /api/me/entitlements` | `backend/src/me-router.js:19-31`；`auth/apiClient.js:436-441` |
| 登录灌权 | session `hasFullAccess` 或 entitlements → `activateVipPreferences` | `script.js:3507-3518` |

**现行 paywall 形态**：本地图套餐卡 + 权益 chips + 立即支付 / 恢复购买（**不是**旧文档里的三列「私教 vs 线下班 vs 我们」矩阵；以 `script.js:5386-5413` 为准）。

---

## 4. 数学 vs 英语边界

| 维度 | 英语 ocean/desert | 数学 math |
|------|-------------------|-----------|
| zone | `english` | `math` |
| 主交互壳 | `#level-N` 全屏详情 | 地图内联 + 可选 story |
| 媒体 | 关卡视频 + 词句音频 | 一般无关卡视频；有 math-story / 题干音频 |
| 题型 | 2 选 1 词/句 | count / subitize / take / compose / sequence / numeral 等 |
| VIP | 11+ 需 VIP | **`getLevelAccess` 直接 allowed** |
| 进度 key | `progressByWorld.ocean` / `.desert` | `progressByWorld.math` |
| 正确率科目 | `accuracySubjectFromWorldId` → `english` | → `math`（`script.js:1426-1428`） |
| 服务端附加 | `POST /api/learning/quiz-attempts` | 另有 `POST /api/learning/math-coach` |
| coming soon | castle | math58 / math912 |

---

## 5. MVP 非目标（当前不做 / 未闭环）

| 非目标 | 说明 | 依据 |
|--------|------|------|
| 英语「阶段复习关 / Boss 关」 | 无独立阶段复习路由；复习=重做已完成关 + 错题本 | 无 `#review` 路由；`parseRouteHash` 仅 map/level/mine… |
| 全库假数据排行当生产真相 | `rankings` 仍有静态 peer 名（展示用）；真实分数另有 `/api/me/ranking`、`/api/rankings` | `script.js:1802-1811`；`backend/src/index.js:121-122` |
| `apps/*` 当生产主入口 | 生产仍是根目录三件套 + `backend/` | 任务全局约束；`apps/backend/README.md` |
| 默认同步到 MySQL | 必须显式 `LEARNING_REPOSITORY=mysql` | `learning-repository-factory.js` |
| 对外 Learning **upsert** 路由 | 仅 `PUT /state` 整包保存 | `learning.js:159`；`apiClient.js:415-416` |
| 数学花园 / 星塔 / 城堡可玩内容 | `comingSoon: true` | `MAP_WORLDS` |
| 未登录云同步 | `learningSyncReady` 依赖 session | `hydrateLearningStateFromBackend` |
| App Store 服务器侧完整验票 | me-router 注释：生产应再加 Server API 验票；现至少写账本 | `backend/src/me-router.js:29` 一带 |

---

## 6. 后端 API 速查（产品相关）

| Method | Path | 作用 |
|--------|------|------|
| POST | `/api/auth/send-code` | 发验证码 |
| POST | `/api/auth/verify-code` | 登录/注册 |
| GET | `/api/auth/session` | 会话 |
| POST | `/api/auth/logout` | 登出 |
| GET | `/api/learning/state` | 拉学习快照 |
| **PUT** | **`/api/learning/state`** | **存学习快照（主同步）** |
| PATCH | `/api/learning/preferences` | 偏好补丁 |
| POST | `/api/learning/quiz-attempts` | 单笔答题 |
| POST | `/api/learning/support-feedback` | 反馈 |
| POST | `/api/learning/math-coach` | 数学陪练计划 |
| GET | `/api/me/entitlements` | VIP 权益 |
| POST | `/api/me/entitlements/vip` | 声明/写入 VIP |
| GET | `/api/health` | 健康（含 `learningBackend` kind） |

挂载总览：`backend/src/index.js:93-122`。

---

## 7. 与 Graphify / 编号

| 项 | 值 |
|----|-----|
| Graphify | 2026-08-13：286 files；3462 nodes · 5743 edges · 240 communities → `graphify-out/README.md` |
| 本文编号 | **02** = 产品闭环（本文件） |
| 关联 | 产品总入口 → [`../PRODUCT.md`](../PRODUCT.md)；后端细节 → `03-backend-api.md`；部署 → `04-deploy-ops.md`；前端 HUD → `06`（历史文件名可能仍为 `04-frontend-hud.md`，以编号语义 06=frontend 为准）；数据 → `07-data-model.md` |

---

## 8. 核验命令（只读）

```bash
cd "/Users/yr/嗨洛塔少儿启蒙APP"
rg -n "function (openLoginDialog|requestLevelAccess|openPaywallDialog|renderDetail|flushLearningSync|getLevelAccess|parseRouteHash)" script.js
rg -n "router\.(get|put|post|patch)\(" backend/src/learning.js backend/src/auth.js backend/src/me-router.js
rg -n "saveLearningState|/api/learning/state|LEARNING_REPOSITORY" auth/apiClient.js backend/src/learning-repository-factory.js
```

---

**文档状态**：2026-08-13 按现行 `script.js` / `backend` 重写；旧版「三列对比 paywall / 假人榜已退役 / 航程胶囊」等表述已按代码废弃或更正。
