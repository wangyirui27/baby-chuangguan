# 宝宝闯关 — 产品闭环与学习流程

> 只读分析，不改业务代码。基于 `script.js`、`index.html`、`auth/apiClient.js`、`backend/src/learning.js`、`packages/contracts/openapi/openapi.yaml`、`docs/` 等源文件。审计日期 2026-07-21。

---

## 1. 产品定位

- 面向 3–6 岁幼儿（但不限死年龄段，年龄选填不拦截）的英语启蒙 H5
- 核心体验：看视频 → 听单词 → 选答案 → 挣星星 → 解锁下一关
- 平台：iPad 横屏为主，兼容移动浏览器
- 当前状态：海岛地图 200 关已上线（前 10 关免费），沙漠地图 200 关内容已就绪，城堡地图 coming soon

---

## 2. 学习闭环五环节

### 2.1 输入目标

用户在地图页看到当前关卡进度（已完成/总数），知道"下一关该做什么"。

- 进度展示：地图顶栏圆形进度徽章（`renderCompactJourney`，script.js:1845）
- 当前关高亮：`levelStatus` → `current`（script.js:1829 / 2022）
- 下一关提示：答对后的反馈文案 `completionUnlockText`（script.js:568 / 733–740）

### 2.2 练习

练习 = 看视频 + 答题，一个关卡一轮。

**视频阶段**（`data-stage-video`，script.js:2625）
- 视频来源：`assets/video/free-levels/level-{id}-{word}.mp4`（前 10 关有手工视频）
- 11 关起视频尚未制作，`lessonUnavailableMessage` 阻止进入（script.js:264）
- 视频播放结束（`ended` 事件）→ 自动切入答题阶段（`showQuizStage`，script.js:3624）
- 视频加载失败也放行（不卡死）
- 用户可随时点"再看一遍"重新播放（`rewatchVideo`，script.js:3642）

**答题阶段**（`data-stage-quiz`，script.js:2642 / 3184）
- 题型一：2 选 1（正确单词 + 1 干扰项），适配幼儿大触控区
- 干扰项从同一主题单元中取（`buildLevelsFromUnits`，script.js:170）
- 每轮选项随机洗牌（`shuffle`，script.js:3338）
- 题目文案：`小朋友，视频里学到的单词，哪一个是「{zhTitle}」的意思？`
- 可点"听题目"按钮再听一遍（`speakQuestion`，script.js:2865）
- 每个选项卡片有发音按钮（优先播放本地 MP3，fallback 到 `new Audio`）
- 8 秒无操作触发 idle 提示动画 + Lottie 手指引导（`armIdleInvite`，script.js:2920）
- 选择后必须点提交按钮确认（防误触）

### 2.3 反馈

| 场景 | 反馈行为 | 代码位置 |
|------|----------|----------|
| 选择选项 | 播放音效 + 发音 + Lottie 手指指向提交 | script.js:2984–2989 |
| 答对 | 正确音效（上升三音）+ 正确音频 + Lottie 庆祝 + 进度更新 + 解锁下一关 | script.js:3547–3585 |
| 答错 | 错误音效（下降两音）+ 错误音频 + 红色标记 + 3.4 秒后自动重来 | script.js:3586–3614 |
| 超时无操作 | 选项闪烁提示 + 手指动画循环 | script.js:2920 |

答对反馈内容包含：
- 下一关解锁文案（`completionUnlockText`）
- VIP 付费提示（如果下一关 > 10 且非 VIP）
- 2.6 秒后自动播放正确单词发音（script.js:3581–3585）

答错不惩罚：不扣分、不退关、清空选中状态、选项随机洗牌重新来。

### 2.4 复习

当前复习机制比较轻量：

**错题本**（script.js:514–558）
- 答错时自动记录到 `mistakeBook`：单词、错误选项、正确答案、错误次数、时间
- 答对时自动从错题本移除（`resolveMistake`，script.js:557）
- 最多保存 50 条（`normalizeMistakeBook`，script.js:535）
- "我的"页展示待复习数量

**已完成关卡可重做**
- 已完成关卡状态变为 `completed` 但仍可点击进入
- 重复答对不影响进度（已是 completed），只刷新完成日期
- 重复答错会更新错题本记录

**注意：当前没有独立的"阶段复习关"或"错题专项练习"模式。** 复习只能通过：
1. 回到已完成的关卡重新做（地图上点任意已完成关）
2. 在地图页点击单词发音按钮听单词

### 2.5 进度沉淀

进度数据流（双重存储）：

```
答题结果 → 本地 localStorage（即时）→ 后端同步（600ms 延迟）
```

**本地存储 key（script.js:973–977）：**
| key | 内容 |
|-----|------|
| `baby-island-preview-progress-v1` | 按世界分的完成关卡 + 解锁位置（`progressByWorld`） |
| `baby-island-learning-activity-v1` | 学习日历（活跃日期数组） |
| `baby-island-app-preferences-v1` | 设置（音乐、发音、中文提示、地图世界、宝宝档案、VIP） |
| `baby-island-mistake-book-v1` | 错题本 |

**后端同步（script.js:1061–1200）：**
- `flushLearningSync`：600ms 防抖后批量上传快照（`learningSnapshot`）
- `recordQuizAttemptSync`：每笔答题即时上报
- `mergeLearningStateFromCloud`（script.js:1290）：本地 + 远程取并集（completed 取 max）
- 同步前提：`learningSyncReady`（后端 session 有效）

---

## 3. 答题状态机

答题页面内部用一个局部变量 `quizState` 驱动（script.js:3229），共四个状态。严格串行，不可跳级：

```
                    ┌─────────────────────────────────┐
                    │           地图页 (#map)           │
                    │  海岛 / 沙漠 / 城堡(coming soon)  │
                    └──────┬──────────────────┬────────┘
                           │                  │
                    点击关卡                底部 tab
                           │                  │
                    ┌──────▼──────┐    ┌───────┴───────┐
                    │ 关卡详情页  │    │ ranking / mine │
                    │ (#level-N) │    │  / support     │
                    └──────┬──────┘    └───────────────┘
                           │
                    ┌──────▼──────┐
                    │  视频阶段   │
                    │ (无 quizState)│
                    └──────┬──────┘
                           │ ended / error
                    ┌──────▼──────┐
                    │  答题阶段   │
                    │ answering   │ ◄────────── 答错 3.4s 后重来
                    └──────┬──────┘              │
                           │ 选完 + 点提交        │
                    ┌──────▼──────┐         ┌────┘
                    │  judging    │     答错 │
                    └──┬───────┬──┘         │
                   正确      错误     ┌──────▼──────┐
                     │         └─────→│ answering   │
              ┌──────▼──┐             │ (洗牌重出题) │
              │ correct │             └─────────────┘
              │ 庆祝动画 │
              │ 返回地图 │
              └─────────┘
```

状态流转规则（script.js:3229–3614）：

| 当前状态 | 触发条件 | 目标状态 | 附加行为 |
|----------|----------|----------|----------|
| (视频阶段) | video `ended` / 加载失败 | `answering` | `showQuizStage()` + `speakQuestion()` + 2.2s 后手指引导 |
| `answering` | 点选项 → 点提交按钮 | `judging` | 提交按钮防误触二次确认 |
| `judging` → 正确 | `applyQuizAnswer` 返回 `correct: true` | `correct` | 进度更新 + 错题移除 + 庆祝动画 + 显示"返回地图"按钮 |
| `judging` → 错误 | `applyQuizAnswer` 返回 `correct: false` | `answering`（3.4s 后） | 错题记录 + 红色标记 + 音效 → 清空选中 → 重新洗牌出题 |
| `correct` | 点"返回地图"按钮 | (退出答题页) | `goBackMap()` → `history.back()` 或 `#map` |

关键约束：
- `judging` 是瞬时判断态，不会停留——立即分叉到 `correct` 或回到 `answering`
- 答错后必须重新答对本关才能解锁下一关，不存在"跳过本题"
- 答对后必须手动点"返回地图"（`data-continue-map`，script.js:3205），不会自动跳转

---

## 4. 地图与闯关（跳关规则）

### 4.1 地图世界（`MAP_WORLDS`，script.js:294）

| 世界 | 主题 | 关卡数 | 状态 |
|------|------|--------|------|
| ocean | 魔法海岛 | 200 | 上线（前 10 免费视频，11–200 视频待制作） |
| desert | 沙漠奇境 | 200 | 内容就绪，可切换进入 |
| castle | 魔法城堡 | — | coming soon |

- 地图切换：地图顶栏按钮 → dialog 选择（script.js:2138）
- 每个世界有独立进度（`progressByWorld`）
- 每个世界有专属 BGM、背景视频、地标图片、交通工具

### 4.2 关卡状态（`levelStatus`，script.js:725 / 2022）

| 状态 | 条件 | 行为 |
|------|------|------|
| `completed` | `completed` 包含该 id | 绿色勾，可重入（复习） |
| `current` | `id ≤ unlockedThrough` 且未 completed | 黄色播放，默认定位 |
| `locked` | `id > unlockedThrough` | 灰色锁，点击提示"先完成第 N 关" |
| `premium` | `id > 10` 且非 VIP | 锁 + VIP 图标，点击弹出付费弹窗 |
| `missing` | id 超出范围 | 不渲染 |

### 4.3 跳关规则（不可跳级 + 可回看）

**核心原则：进度严格连续，不允许跳关。**

`normalizeProgress`（script.js:455）强制约束：
- `completed` 数组必须是 `[1, 2, 3, ..., N]` 连续序列
- 如果存储中出现断档（如 `[1, 2, 4]`），会被截断为 `[1, 2]`，`unlockedThrough` 回到 3
- `completeLevel`（script.js:472）只在 `levelId ≤ unlockedThrough` 时才写入——跳级答题不生效

地图上的三种跳转行为：

| 操作 | 允许？ | 说明 |
|------|--------|------|
| 点已完成关（`completed`） | 允许 | 回看复习，重复答对不增加进度 |
| 点当前关（`current`） | 允许 | 正常推进 |
| 点未解锁关（`locked`） | 拒绝 | toast 提示"先完成第 N 关"（script.js:2091） |
| 点会员关（`premium`） | 拒绝 | 弹出 VIP 付费弹窗 |

地图定位逻辑（`renderMap`，script.js:2250）：默认 focus 到 `unlockedThrough` 对应的关卡，即"当前该做的关"，用户不需要手动找。

### 4.4 关卡内容结构（script.js:170–193）

每个关卡由 `buildLevelsFromUnits` 生成：
- `curriculumUnits`（10 个主题 × 10 词 = 100 关）+ `additionalLevelUnits`（10 个主题 × 10 词 = 100 关）= 海岛 200 关
- `desertPhraseUnits`（20 个主题 × 10 短语 = 200 关）= 沙漠 200 关
- 前 10 关通过 `lessonOverrides` 硬编码固定（确保转化稳定）
- 每关 3 分钟（每 10 关 4 分钟）
- 4 选项自动生成，正确答案固定在 position 0（通过洗牌隐藏）

---

## 5. VIP 矩阵付费

### 5.1 付费门控

- 产品 ID：`baby_island_map_vip_001`（script.js:92）
- 前 10 关免费（`FREE_LEVEL_COUNT = 10`），11 关起 VIP（`DISPLAY_LEVEL_COUNT = 200`）
- 付费触发：`requestLevelAccess` 检测到 `premium` 状态 → `openPaywallDialog`（script.js:2098）
- 支付通道：iOS webkit messageHandler / Android native bridge（script.js:1069–1092）

### 5.2 矩阵式付费弹窗

当前 paywall（script.js:2098–2226）不是简单价格牌，而是一张三列对比矩阵，把宝宝英语岛 VIP 和两种主流替代方案并排比较：

| 维度 | 线上一对一私教 | 线下少儿英语班 | 宝宝英语岛 VIP（推荐） |
|------|---------------|---------------|---------------------|
| 价格 | ~¥200/节 | ~¥150+/课时 | ¥99/本地图（买断） |
| 每天练 | ✗ 约不上就断 | ✗ 一周一两次 | ✓ 打开就能练 |
| 家长负担 | ✗ 约课催课 | ✗ 接送排期 | ✓ 孩子自己开 |
| 开口效果 | ✗ 一节就没了 | ✗ 开口机会少 | ✓ 每天都能开口 |

弹窗结构（script.js:2119–2186）：
- Hero：`VIP 学习卡` + `¥99 买断本地图`
- 矩阵表：3 列（私教 / 线下班 / 我们），我们这列高亮 `is-ours` + `推荐` 徽章
- 权益清单（sr-only）：第 11–200 关 / 会员关卡权益 / 单词发音练习 / 答题闯关记录
- 操作按钮：`立即支付 ¥99` / `狠心拒绝` / `恢复购买`
- 支付提示文案区分原生 / 预览：原生 = "通过 App Store 安全支付"；预览 = "正式 iPad 包会打开 App Store 支付，当前预览不会扣费"

### 5.3 VIP 激活

- 支付成功后 native bridge 回调 `BabyIslandIAPComplete` / `babyIslandIAPComplete`（script.js:2243–2244）
- `completeVipPurchase`（script.js:2234）：写入 `vipActive: true` → localStorage → 关弹窗 → toast → 重新渲染
- `activateVipPreferences`（script.js:1099）：只改 `vipActive` 字段，不动其他偏好

---

## 6. 排行榜（近 7 天滚动 + 英语星成长）

### 6.1 核心规则

**假人榜已退役。** `const rankings = []`（script.js:396），冷启动不插虚拟用户，peer 行只来自真实数据（当前只有本地孩子自己）。

- 积分单位：**英语星**（`STAR_PER_LEVEL = 12`，script.js:397）——每通关 1 关 +12 星
- 时间窗口：**近 7 天滚动**（`RANKING_WINDOW_DAYS_DEFAULT = 7`，script.js:398），不是周一清空
- 窗口算法：`windowCutoffDate`（script.js:501）算出 cutoff 日期（今天 - 6 天），只统计 `completedAt ≥ cutoff` 的关卡
