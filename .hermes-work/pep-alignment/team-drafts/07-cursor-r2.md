# Cursor Auto 席 · R2 只读交叉检查

- 席位：Cursor Auto
- 范围：只读；不改业务代码
- 锚点：`.hermes-work/pep-alignment/source-notes.md`、`docs/curriculum/desert-map-level-questions.md`、`script.js`（`desertPhraseUnits` / `desertLevels` / `buildLevelsFromUnits` / `questionPromptText` / `renderDetail`）
- 用户目标：沙漠地图强贴人教版/PEP 课堂 → 上课惊讶「我早就学过」+ 能迁移到课堂问答/项目/表达；不是泛生活英语

## 总判

**当前题库 + 题型达不到用户目标。**

工程事实：沙漠关 = 生活主题短语库 + 中文释义→英文识别（UI 实为 2 选 1）；数据结构无 PEP 单元/Part/功能锚点。产品结果：主题层偶有撞车（颜色/数字/动物/情绪/问候），但不是课堂同构；孩子认对 App 短语 ≠ 能接住 PEP Part A 问句、Part B 功能表达、Part C 项目。

---

## 1. 当前题库和题型能否产生课堂迁移？

**结论：几乎不能。最多形成「见过类似英文」的弱熟悉感，达不到「课堂问答/项目可迁移」。**

工程链路：

1. `desertPhraseUnits`：20 主题 × 10 短语，`[en, zh]` 二元组。
2. `buildLevelsFromUnits` 生成 level：`title/zhTitle/topic/guidance/question/options/correct`；`question` 固定 `Which word means ${zhTitle}?`；同主题滚动干扰项，4 选项。
3. `levelsForMapWorld('desert')` → `desertLevels`（200 关）。
4. `renderDetail` 注释写明「题型一：2 选项」；实际只取正确项 + `distractors[0]`。
5. `questionPromptText` / `renderDetail` HTML 统一：「视频里学到的**单词**，哪一个是「${zhTitle}」的意思？」

产品结果：

| 迁移所需能力 | 当前是否练到 |
|---|---|
| 听见老师 PEP 问句能对上功能 | 否；只练中文释义→英文串 |
| 在对话位选/说出合适表达 | 否；无情境、无话轮 |
| 单词/句型进 Project（mind map / family tree / picture book…） | 否；无产出任务 |
| 同类表达最小对立辨析（Hands up vs Raise your hand） | 弱；2 选 1 + 同主题邻项，非功能对立设计 |
| 「我早就学过」对应课本同一锚点 | 否；无 `pepUnit`/`pepPart` 绑定 |

设计稿自述（`desert-map-level-questions.md` L3）：类型 =「**生活英语表达/短句**」。与用户目标直接冲突。

---

## 2. 题库 vs PEP 三上/三下：贴合点与断裂点

依据 `source-notes.md` 目录（电子课本网公开目录；非官方接口，产品审题够用）。

### 2.1 主题层贴合（弱/中，非课堂同构）

| App 主题（关号） | PEP 目录锚点 | 贴合性质 | 断点 |
|---|---|---|---|
| 日常问候 1–10 | 三上 U1 Making friends；三下 U1 Meeting new people | 问候/礼貌表层 | 缺 How do we greet / be a good friend / be polite；无 mind map |
| 情绪表达 61–70 | 三下 U2 Expressing yourself · feelings | 情绪词表层 | 缺 describe things；无课堂表达框架 |
| 颜色形状 91–100 | 三上 U5 The colourful world | 颜色主题 | 「Yellow sun / Mix colors」≠ How colours help us / flip book |
| 数字时间 101–110 | 三上 U6 Useful numbers；三下 U6 Numbers in life | 数字主题 | 「Plus one / What time」≠ When do we use numbers / count&sort / decide；无 birthday card |
| 动物宠物·动物园 121–140 | 三上 U3 Amazing animals | 动物主题 | 「Feed dog / See panda」动作短语 ≠ What pets/wild animals do you know；无 picture book |
| 一日三餐·零食 21–40 | 三下 U4 Healthy food | 食物主题 | 「Cut apple / Have breakfast」操作语 ≠ What do/shall we eat |
| 家庭互动 71–80 | 三上 U2 Different families | 家庭人物表层 | 「Help mom」≠ Who lives with you / How families different / family tree |
| 玩具游戏 81–90 | 三下 U5 Old toys | 玩具表层弱 | 「Play ball / I win」≠ What old things / How reused |
| 学校学习 161–170 | 三下 U3 Learning better | 学习表层弱 | 「Read book / Study hard」≠ tools / senses help learn |

### 2.2 硬断裂（三上/三下目录有、App 无对应单元）

- 三上 U4 Plants around us（整单元空）
- 各 Unit Part C Project（mind map / family tree / animal picture book / paper garden / colour flip book / birthday card）
- 三下 Revision Going to a school fair
- 三上 Revision Being a good guest（仅散落 Thank you / Excuse me，无做客情境）
- Appendix Songs/Chants/Useful expressions/Alphabet：无挂接字段

### 2.3 App 重仓、PEP 三年级目录不覆盖（泛生活）

课堂规则、洗漱卫生、身体动作、天气季节、出行交通、购物消费、音乐艺术、运动比赛、职业梦想 —— 约占沙漠关卡 **半数以上**。这些关卡再刷分，也推不出「PEP 课堂上见过」的惊讶感。

### 2.4 表达形态断裂

PEP 目录问句是功能型（How / What / Who / When）；App 条目是祈使/碎片短语（Listen up、Cut apple、Be a doctor）。孩子 App 答对 ≠ 能回答老师「How do we greet friends?」。

---

## 3. 「中文释义→英文 2 选 1」是否够融会贯通？

**不够。该题型只测单向词汇识别，不测贯通。**

工程事实：

- 题干固定：给 `zhTitle`，选英文串。
- UI：2 选 1（从 4 选项池砍到正确 + 第一干扰）。
- 通过条件：`applyQuizAnswer` 字符串相等即可过关。
- 文案层仍叫「单词」（`questionPromptText` L1066；`renderDetail` L3399），设计稿要求「英语表达/哪一句」——实现与设计稿、与短语本质均错位。

融会贯通缺口：

1. **无反向**：不会考英文→中文 / 英文→情境。
2. **无功能**：不会考「此时该说哪句」。
3. **无话轮**：不会考接话、问答对。
4. **无听辨任务独立于视频回忆**（听题音频仍绑同一 zh→en）。
5. **无产出**：无跟读判定以外的说/做/贴/画项目。
6. **干扰项策略=同主题邻项轮转**，非 PEP 易混功能对（问候 vs 道别、宠物 vs 野兽）。
7. **2 选 1 偶然率高**，过关 ≠ 掌握。

因此：题型适合低龄「认一认」，不适合「课堂迁移 + 融会贯通」。

---

## 4. 达标最少补丁：数据结构 + 题型

> 最小集：能支撑「按 PEP 单元选题 / 出情境题 / 验迁移」；不是完整教材数字化。

### 4.1 Level / Item 最少新字段

| 字段 | 用途 |
|---|---|
| `pepGrade` | `3A` / `3B` |
| `pepUnit` | 如 `U1 Making friends` |
| `pepPart` | `A` / `B` / `C` / `Revision` |
| `pepFocus` | 目录原问句，如 `How do we greet friends?` |
| `pepAnchors` | 课本目标词/句数组（官方核验后填） |
| `functionTag` | `greet` / `describe` / `feel` / `count` / `name-animal` … |
| `itemType` | 见下 |
| `promptKind` | `expression`（禁再写死「单词」） |
| `situationZh` | 课堂/生活情境一句（情境题用） |
| `transferProbe` | 上课可复现的老师问法/任务一句 |
| `distractorPolicy` | `same-function` / `minimal-pair` / `cross-unit-false-friend` |

可选但强烈建议：`projectHook`（对应 Part C 微任务 id）。

现有可保留：`title`（英文表达）、`zhTitle`、`topic`（可降为内部生活簇，不再当课程主轴）、`options`/`correct`（识别题仍用）。

### 4.2 最少题型（在现有 2 选 1 识别之外）

1. **`zh2en_recognize`**（现状改良）：文案改「哪一句」；干扰项按 `distractorPolicy`；仅作入门关。
2. **`situation_choose`**：给课堂情境 → 选功能正确表达（直打「上课能用」）。
3. **`dialogue_complete`**：缺一句的问答对 → 选填（迁移课堂问答）。
4. **`focus_match`**：出示 `pepFocus`（可中英）→ 选能回答该问句的表达/词（对齐 Part A/B）。
5. **`project_mini`**（每单元末 1 关即可）：按 Part C 缩微清单（选 3 个词做 mind map / 给家庭树贴标签）——产出选择即可，不必自由输入。

未达最小集前：沙漠地图不应宣传「人教/PEP 同步」。

### 4.3 题库内容最少改向（产品，非本席改码）

- 按 PEP 12 个 Unit（+2 Revision）重排主轴；生活主题降为辅线或删。
- 每 Unit 覆盖 Part A 功能问句 + Part B 扩展 + 至少 1 个 Part C 微项目关。
- 短语优先用课本 Useful expressions / 目录问句可答项，少造「Cut apple / Shear sheep」类无三年级锚点动作语。

---

## 5. 工程证据速查

```27:48:script.js
const desertPhraseUnits = [
  { topic: '日常问候', words: [['Good morning', '早上好'], ...
  // ... 生活主题簇，无 pep* 字段
];
```

```232:252:script.js
function buildLevelsFromUnits(...) {
  // question: Which word means ${zhTitle}?
  // options: 同 unit 邻项；无教材锚点
}
```

```1065:1067:script.js
function questionPromptText(level) {
  return `小朋友，视频里学到的单词，哪一个是${level.zhTitle}的意思？`;
}
```

```3390:3399:script.js
// 题型一：2 选项（正确 + 1 干扰项）
const lessonOptions = [correctWord, distractors[0] || correctWord];
const questionHtml = `...学到的单词...「${level.zhTitle}」的意思？`;
```

```3:4:docs/curriculum/desert-map-level-questions.md
> 类型：生活英语表达/短句。
> 当前 App 仍由 questionPromptText 和 renderDetail 硬编码“单词”
```

运行核验：`desertLevels.length === 200`；样本无任何 `pep*` key；topic 列表为 20 个生活主题。

---

## 席位结论（给 Hermes 汇总）

1. **课堂迁移：不能** — 只有 zh→en 识别闭环。  
2. **PEP 贴合：主题弱重合、单元/Part/Project 硬断裂**；半数主题不在三年级目录。  
3. **2 选 1 释义题：不够融会贯通**。  
4. **最少补丁：pepGrade/Unit/Part/Focus/Anchors + situation/dialogue/focus_match/project_mini；题库主轴改挂 PEP，不挂生活主题。**
`)
