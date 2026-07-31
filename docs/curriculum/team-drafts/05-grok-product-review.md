# Grok · 儿童产品体验审题与文档结构建议

> 范围：只读审题 + 文档结构建议。未改业务代码。  
> 代码锚点：`script.js`（`buildLevelsFromUnits` / `levels` / `desertLevels` / `questionPromptText` / `renderDetail`）、`quiz.test.js`。  
> 样本（任务固定）：海岛 1/7/18/29/40/61/82/103/154/200；沙漠 1/15/37/58/79/100/123/145/168/200。  
> 规模核验：`levels.length === 200`，`desertLevels.length === 200`（`script.js:255–262` 导出；运行时 `require('./script.js')` 实测）。

---

## 1. 答题页产品事实（可追溯）

| 事实 | 代码 | 含义 |
|------|------|------|
| 题干文案（播报 + 逻辑） | `questionPromptText` @ `script.js:1065–1067` | 固定模板：`小朋友，视频里学到的单词，哪一个是${level.zhTitle}的意思？` |
| 题干 UI HTML | `renderDetail` @ `script.js:3399` | 同句，中文义项加粗：`「${level.zhTitle}」` |
| 题型一展示选项 | `script.js:3393–3396` | **仅 2 张卡**：`correctWord` + `distractors[0]`（不是 4 选 1，也不是干扰池随机） |
| 4 选项仍存于数据 | `buildLevelsFromUnits` @ `script.js:232–252` | 每关 `options[4]` + `correct`；UI 裁成 2 |
| 干扰项来源 | 同上 `unit.words` 环取 | 同 unit 内相邻词；**同 topic**（免费包除外，见 §3） |
| 提交映射 | `script.js:3794–3797` | `selectedWord` → `level.options.indexOf` → `applyQuizAnswer` |
| 海岛/沙漠数据 | `levels` / `desertLevels` | 海岛单词为主；沙漠 `titleFor = phrase` 原样短语 |
| 题干音频 | `quiz.test.js:1618–1659` + `questions-holly` manifest | **仅海岛 200 关**；文案必须等于 `questionPromptText`；沙漠无独立题干音频目录 |
| 零 emoji | `quiz.test.js:983` | 正式页禁止手指/庆祝 emoji，Lottie 引导 |

字段清单（level 对象，样本 `Object.keys`）：

```
id, title, zhTitle, topic, duration, guidance, question, options, correct
(+ 部分关 videoFile / videoSrc / videoMeta)
```

- `question` 英文字段（如 `Which word means 妈妈?`）由 `buildLevelsFromUnits` 生成，**正式答题 UI 不读它**，口语/听题走 `questionPromptText`。
- `guidance`：`看一看画面，听清并跟读 ${word}`——视频阶段旁白向，不是选择题干。

---

## 2. 固定样本抽查表

### 2.1 海岛 `levels`（题型一实际 2 选项）

| id | topic | title / zhTitle | 展示 2 选 | 全量 options | 同主题？ | 儿童可读性备注 |
|----|-------|-----------------|-----------|--------------|----------|----------------|
| 1 | Free Starter · 免费体验 | Mom / 妈妈 | mom · dad | mom, dad, grandma, book | 半混 | 家人对比好；全量里混入 book |
| 7 | Free Starter · 免费体验 | Water / 水 | water · rice | water, rice, car, book | 弱 | 水/饭 语义远，2 选偏「蒙对」 |
| 18 | 水果先遣队 | Pear / 梨 | pear · grape | grape, pear, coconut, banana | 是 | 水果内对比，合适 |
| 29 | 零食甜点 | Popcorn / 爆米花 | popcorn · honey | popcorn, honey, lollipop, jelly | 是 | 零食主题一致 |
| 40 | 吃饭喝喝 | Dumpling / 饺子 | dumpling · egg | egg, bun, bread, dumpling | 是 | 食物内对比 |
| 61 | 大动物 | Panda / 熊猫 | panda · koala | panda, koala, hippo, monkey | 是 | 动物内对比 |
| 82 | 我的身体 | Eye / 眼睛 | eye · ear | ear, eye, nose, mouth | 是 | 五官最小对立，有教学价值 |
| 103 | 玩具游戏 | Balloon / 气球 | balloon · ball | ball, robot, balloon, doll | 是 | 形近/前缀近（ball*），稍难 |
| 154 | 天气天空 | Rainbow / 彩虹 | rainbow · sky | sky, rainbow, cloud, rain | 是 | 天气语义场一致 |
| 200 | 动作游戏 | Sleep / 睡觉 | sleep · jump | jump, run, swim, sleep | 是 | 动作对立清晰 |

### 2.2 沙漠 `desertLevels`（短语世界，题干仍叫「单词」）

| id | topic | title / zhTitle | 展示 2 选 | 同主题？ | 儿童可读性备注 |
|----|-------|-----------------|-----------|----------|----------------|
| 1 | 日常问候 | Good morning / 早上好 | Good morning · How are you | 是 | 问候语对比；但题干仍说「单词」 |
| 15 | 课堂规则 | Stand up / 站起来 | Stand up · Look here | 是 | 指令短语，长度适中 |
| 37 | 零食水果 | Eat slowly / 慢慢吃 | Eat slowly · No sugar | 是 | 都与吃有关，可接受 |
| 58 | 身体动作 | Shake head / 摇头 | Shake head · Turn around | 是 | 动作指令对比 |
| 79 | 家庭互动 | Get dressed / 穿好衣服 | Get dressed · Come here | 是 | 指令场一致；长度差大 |
| 100 | 颜色形状 | Mix colors / 混合颜色 | Mix colors · Red and blue | 是 | 颜色场；「混合」对 3–5 岁偏抽象 |
| 123 | 动物宠物 | Pet cat / 摸摸猫 | Pet cat · Watch fish | 是 | 动宾短语，场景清楚 |
| 145 | 出行交通 | Get on / 上车 | Get on · Get off | 是 | **最小对立 pair**，教学价值高 |
| 168 | 学校学习 | Speak English / 说英语 | Speak English · Study hard | 是 | 学习场景；对低龄「English」概念偏元 |
| 200 | 职业梦想 | Be a writer / 当作家 | Be a writer · I want to be | 是 | 干扰项是句式半截，不是同级职业（全量里才有 doctor/teacher） |

### 2.3 构造规则对体验的硬影响（必须写进教研文档）

来自 `buildLevelsFromUnits`（`script.js:232–252`）：

1. `correct = (id - 1) % 4` —— 正确答案在 4 槽位轮转，可预测。
2. 干扰 = 同 unit 内 `wordIndex+1/2/3` 环取 —— **同课表主题**，不是跨主题随机难词。
3. UI 再取 `distractors[0]`（`script.js:3395–3396`）—— 展示干扰 = 去掉正确项后 **options 数组里第一个**，不是 3 个里随机 1 个。  
   → 教研若以为「干扰池抽样」，会误判难度与覆盖（`docs/graphify-team/05-audit-gaps.md` 已提示过同类问题）。
4. 沙漠 `title` 保留短语空格（`script.js:262`）；海岛仅个别多词（实测 multi-word title：Ice Cream #26、Teddy Bear #101）。
5. 沙漠 199/200 关 title 含空格，但 `questionPromptText` **100% 仍含「单词」**（全量扫描 `phraseLabeledWord: 199`）。

---

## 3. 3–8 岁体验审题结论

### 3.1 题干是否太技术化？—— **是（偏「课标口吻」，不像口语陪读）**

证据：

- 统一模板强制「单词」「意思」（`script.js:1065–1067`，UI `3399`）。
- `quiz.test.js:76`、`1627`、`1656` 把该句锁死为回归契约；改文案必须同步题干 TTS manifest。

儿童侧问题：

| 片段 | 3–5 岁 | 6–8 岁 |
|------|--------|--------|
| 「单词」 | 学校元语言，听不懂或不必要 | 能懂，但仍像测验 |
| 「哪一个是 X 的意思」 | 「意思」抽象；孩子刚看完视频，更自然是「哪个是妈妈」 | 可接受 |
| 先视频再出中文义项 | 降低听力负担，正确；但题干又把任务说成「译意选择」 | 偏认读/配对，不是口头表达 |

**结论**：题干功能正确（中文锚点 + 二选一），**话术偏技术化/测验化**。更贴幼儿的方向是「指认/配对」口吻，而不是「定义/意思」口吻。英文字段 `question` 更技术（Which word means…），幸好 UI 未用。

### 3.2 短语是否应叫「表达」？—— **沙漠世界：应该；海岛单词世界：保持「单词」或更口语的「英文」**

证据：

- 沙漠数据是 phrase units（`desertLevels = buildLevelsFromUnits(desertPhraseUnits, {}, phrase => phrase)`）。
- 样本 10/10 沙漠 title 均为多词表达；题干却全部「单词」。
- 海岛 198/200 为单词语；叫「单词」基本成立。

**产品命名建议（文档层，不改代码）**：

| 世界 | 对内字段建议 | 对儿童 UI 建议 | 对家长文档建议 |
|------|--------------|----------------|----------------|
| 海岛 | `itemType: word` | 「刚才学的英文」/「哪个是妈妈」 | 单词 / 词汇 |
| 沙漠 | `itemType: phrase` | 「哪句是在说：早上好」 | **表达 / 短句**（不要写单词） |

「表达」比「句子」更适合 3–8 岁家长话术（不暗示主谓宾完整句）；比「短语」更少术语感。

### 3.3 2 选 1 是否过易？—— **对 3–6 岁 MVP：合理；作「学会了吗」筛子：偏松**

证据与机制：

- 产品意图写在代码注释：`题型一：2 选项…适配幼儿大触控区`（`script.js:3394`）；CSS 合约要求大触控（`quiz.test.js:987` min-height 96px）。
- 答错不扣命、清空重来（产品 loop 文档与 `renderDetail` 错题路径一致）→ **最终都会过关**，测验不承担淘汰。
- 随机基线 50%；再叠加「题干已给出中文义项 + 刚看完视频 + 可点发音」，认知负荷低。
- 同主题最小对立（eye/ear、get on/get off、balloon/ball）时，2 选 1 仍有辨别价值；跨义场（water/rice）时接近形状/运气题。

分层判断：

| 年龄 | 2 选 1 | 建议 |
|------|--------|------|
| 3–5 | 合适 | 保持；靠视频+发音+庆祝闭环，不靠加选项 |
| 6–8 | 偏易 | 可在**后置关卡/复习关**再上 3 选 1，不在首学关加负 |
| 全年龄 | 过关门槛松 | 用错题本/阶段复习补「是否记住」，不要用首学 4 选加压 |

**不过易到需要立刻改成 4 选 1**——那会直接违反当前幼儿触控与题型一产品形（skill + 测试合约）。真问题是：**难度区分几乎只靠干扰语义距离，而展示干扰算法固定取 `distractors[0]`，教研无法精细控难度。**

### 3.4 干扰项是否同主题？—— **付费主题单元：是；免费包：经常否；沙漠末关展示对：结构不对等**

| 区段 | 同主题？ | 证据 |
|------|----------|------|
| 海岛主题 unit（样本 18–200） | 是 | 同 `topic` 词表环取 |
| Free Starter 1–10 | **经常否** | #1 全量含 book；#7 water/rice/car/book 大杂烩（`quiz.test.js:60–74` 锁死） |
| 沙漠样本 | 是 | 同 topic；但 #200 展示干扰 `I want to be` 与 `Be a writer` 不对等（句式支架 vs 职业目标） |
| 形近/最小对 | 少量高价值 | balloon/ball；get on/get off；peach/pear（全量 prefix 扫描） |

免费包「主题杂」可以解释为体验包广撒网，但家长若以为「第 1 单元=家庭」，会看到 book 干扰而困惑——文档应标明 **Free Starter = 综合体验包，不是单一语义场**。

---

## 4. 不超过 8 条产品级改进建议

1. **题干儿童化（海岛）**  
   将「单词/意思」改为指认口吻，例如：「小朋友，刚才视频里，哪个是「妈妈」？」  
   约束：改 `questionPromptText` 必须重生成 `questions-holly` 并改 `quiz.test.js` 断言。

2. **沙漠题干去「单词」，改「说法/表达」**  
   `questionPromptText(level)` 按世界或 `itemType` 分支；沙漠示例：「哪一句是在说「早上好」？」  
   现状 199 关短语仍播「单词」，是文案与内容类型错配。

3. **展示干扰不要写死 `distractors[0]`**  
   在同 unit 的 3 个干扰里按策略选：优先最小对立 / 控制形近 / 避免句式不对等（如 `I want to be` vs `Be a writer`）。  
   文档与实现都要写清「2 选 1 = 正确 + 1 个策略干扰」，避免「干扰池」误解。

4. **Free Starter 单独标注「综合体验」，或收紧家人/物品子场**  
   现 options 合约被测试锁死；若保持杂主题，家长文档必须说明，避免「单元名 vs 干扰词」预期破裂。

5. **2 选 1 保留为首学关；难度放在复习关**  
   不建议幼儿首学直接 4 选项。6–8 岁或「阶段复习」再引入 3 选 1 / 听音选图。符合当前「答错重来、不扣命」闭环。

6. **沙漠补题干音频与选项长词排版验收**  
   现只有海岛 `questions-holly` 200 条；沙漠短语更长，更依赖听题与 `has-very-long-text` 样式。无沙漠题干音频时，低龄更难独立完成。

7. **废弃或降级 UI 不可见的英文字段 `question`**  
   或改为与中文题干一一对应的「教研备注」，避免未来有人接错字段导致中英两套题干。

8. **家长/教研文档增加「本关在练什么」一行人话**  
   用 `topic + zhTitle + 对抗词（展示干扰中文义）」写成：`水果 · 梨 vs 葡萄（看视频后点选）`。  
   不要只甩 `options[]` 和 `correct` 下标。

---

## 5. 最终文档结构建议（家长 / 教研一眼能懂）

目标读者：家长扫一眼；教研能回改词表；工程能对上 `script.js` 字段。  
建议路径（正式稿，非本 draft）：`docs/curriculum/README.md` + 分世界表。

### 5.1 一页纸总览（README）

```markdown
# 课程一览
- 谁在学：3–8 岁（首学偏 3–6）
- 两个世界：海岛=单词认读；沙漠=生活表达（短句）
- 怎么玩：看视频 → 听题 → 2 选 1 → 对了回地图；错了重来（不扣命）
- 一道题在练什么：听清 + 把「中文意思」配到刚学的英文
- 不在练什么：拼写、语法讲解、限时淘汰
```

### 5.2 关卡表字段（家长列 vs 工程列）

| 文档列名（给人看） | 对应代码字段 | 备注口径 |
|--------------------|--------------|----------|
| 关卡号 | `id` | 地图岛序号 |
| 世界 | mapWorld / 表名 | 海岛 `levels` · 沙漠 `desertLevels` |
| 主题 | `topic` | 家长可见单元名；Free Starter 注明「综合」 |
| 中文意思 | `zhTitle` | 题干锚点，孩子听得懂的词 |
| 英文（本关目标） | `title`（展示）/ `options[correct]` | 海岛单词；沙漠整段表达 |
| 类型 | 派生 `word` \| `phrase` | 文档必写；代码暂无字段 |
| 跟谁分不清（练习点） | 展示用干扰的中文义 | 由 `distractors[0]` 反查词表中文，**不要只写英文** |
| 备选干扰（未上场） | 其余 `options` | 教研用；标明「当前 App 不展示」 |
| 正确槽位 | `correct` | 仅工程/测试；家长表可隐藏 |
| 视频 | `videoSrc` / 有无成片 | 无成片时写「准备中」 |
| 题干原话 | `questionPromptText(level)` | 与 TTS 一致；改文案要改音频 |
| 时长标签 | `duration` | 现为 `id%10===0 → 4 分钟` else 3 分钟，**是标签不是测时** |
| 学习提示 | `guidance` | 视频向「看一看…跟读」 |

### 5.3 推荐目录

```
docs/curriculum/
  README.md                 # 一页纸：怎么玩、两世界差异、年龄定位
  island-words.csv|md       # 200 行：家长列为主
  desert-phrases.csv|md     # 200 行：类型=表达；题干禁写「单词」
  distractor-policy.md      # 2 选 1 如何选干扰；与 script 行为对齐
  voice-over-script.md      # 题干/反馈口播规范（儿童口吻）
  team-drafts/              # 各模型草稿（本文件）
```

### 5.4 单行示例（家长表）

```text
海岛 · 第 82 关 · 主题「我的身体」
中文：眼睛
英文：eye
这关练：看完视频，从 eye / ear 里点出「眼睛」
类型：单词 · 2 选 1 · 答错重来
```

```text
沙漠 · 第 145 关 · 主题「出行交通」
中文：上车
英文表达：Get on
