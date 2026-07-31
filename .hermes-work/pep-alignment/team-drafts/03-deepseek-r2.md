# DeepSeek R2 · 题型闭环与数据结构缺口

> 审查日期: 2026-07-22
> 审查范围: 当前 desertLevels 数据模型 + "中文释义→英文2选1" 题型是否足以支撑 PEP 课堂迁移目标。
> 目标: 孩子在 App 里先学，上 PEP 课时惊讶发现"这个我早就学过"，并能融会贯通。

---

## 结论

**中文释义→英文2选1不够。** 它是好的基础层（输入性识别），但只能覆盖 PEP 课堂的约 15-20% 需求——即"听到/看到英文，能对应中文含义"。PEP 课堂真正考核的、让孩子产生"我学过"感受的，是**沟通功能层**（在情境中用出来）和**项目输出层**（做出东西、回答问题、表达观点）。当前题型单一停留在识别层，不改题型就无法产生课堂迁移。

**最短路径**: 不动现有数据结构的骨架（topic/words），追加 3 个字段 + 引入 3 种新题型 + 改造复习闭环为单元螺旋。

---

## 强贴合例子

以下 7 个主题与 PEP 三上/三下的单元目标高度重合，只需加字段映射即可直接生产课堂迁移效果：

| 当前沙漠主题 | 对应 PEP 单元 | 贴合等级 | 贴合理由 |
|---|---|---|---|
| 日常问候 (1-10) | 三上 U1 Making friends + 三下 U1 Meeting new people | ★★★ 强 | "Good morning / How are you / Thank you / I'm sorry" 直接是 PEP 核心词汇和功能性对话 |
| 情绪表达 (61-70) | 三下 U2 Expressing yourself (B: How do we express our feelings?) | ★★★ 强 | "I'm happy / I'm sad / I'm angry / I'm scared" 是 PEP 该单元 Part B 的情绪词簇，课堂必定考核 |
| 动物宠物 (121-130) | 三上 U3 Amazing animals (A: What pets do you know?) | ★★★ 强 | "Feed dog / Walk dog / Pet cat" 与 PEP 宠物主题直接对接 |
| 动物园 (131-140) | 三上 U3 Amazing animals (B: What wild animals do you know?) | ★★★ 强 | "See panda / Watch monkey / Big elephant / Long snake" 与 PEP 野生动物主题直接对接 |
| 颜色形状 (91-100) | 三上 U5 The colourful world (A: What colours do you see?) | ★★★ 强 | "Red and blue / Yellow sun / Green grass" 与 PEP 颜色单元核心词汇重合 |
| 数字时间 (101-110) | 三上 U6 Useful numbers + 三下 U6 Numbers in life | ★★ 中强 | "One to ten / Count to twenty / What time / Today is" 覆盖数字功能，但缺少 PEP 的 "sort / make decisions" 功能角度 |
| 学校学习 (161-170) | 三下 U3 Learning better (A: What tools help us learn?) | ★★ 中强 | "Read book / Write word / Ask question / Answer question" 是学习工具/行为，但缺少 PEP 的 "senses help us learn" 感官维度 |

**弱贴合·凑主题**（有触碰但不构成教学闭环）:

| 主题 | 问题 |
|---|---|
| 家庭互动 (71-80) | PEP 三上 U2 Different families 重点是 family members/differences/family tree；当前内容是"Help mom / Hug dad / Kiss baby"，偏向日常指令，不是家庭成员关系 |
| 一日三餐 (21-30) + 零食水果 (31-40) | PEP 三下 U4 Healthy food 重点是"what to eat vs what should we eat"（健康选择），当前内容是进餐动作短语，不是食物名称和健康判断 |
| 出行交通 (141-150) | PEP 无直接对应单元，三下 U6 有 "count and sort" 但非交通工具 |
| 购物消费 (151-160) | PEP 无直接对应单元，三下 U6 "make decisions" 可以用但非核心 |

**完全偏离·应后移或替换**:

| 主题 | 理由 |
|---|---|
| 洗漱卫生 (41-50) | PEP 全册无对应，生活英语有用但不产生课堂迁移 |
| 音乐艺术 (171-180) | PEP 无直接对应 |
| 运动比赛 (181-190) | PEP 无直接对应 |
| 职业梦想 (191-200) | PEP 无直接对应，且 "Be a doctor" 在四年级才出现 |

**完全缺失·必须补齐的 PEP 必修块**:

| PEP 单元 | 核心内容 | 当前沙漠是否覆盖 |
|---|---|---|
| 三上 U2 Different families | family members (father/mother/brother/sister), family tree | ❌ 完全缺失 |
| 三上 U4 Plants around us | plants, flowers, trees, what we get from plants, helping plants | ❌ 完全缺失 |
| 三下 U4 Healthy food | food names, healthy vs unhealthy, what should we eat | ❌ 只有吃饭动作，无食物词汇和健康判断 |
| 三下 U5 Old toys | old things, reuse, recycle | ❌ 完全缺失 |

---

## 断裂点

按根因深度排序，最深的先列：

### 断裂 1: 数据模型缺少 PEP 映射字段（根因）

当前 `desertPhraseUnits` 结构是 `{topic, words: [[english, chinese]]}`，**没有任何字段将内容锚定到 PEP 课程体系**。这导致所有"课堂迁移"都是碰运气——碰上了算贴合，碰不上算生活英语。

具体缺失:
- 没有 `pepUnit` 字段（这个短语属于 PEP 哪个单元）
- 没有 `communicativeFunction` 字段（这个短语解决什么沟通任务：greeting / describing / asking / expressing）
- 没有 `vocabularyCluster` 字段（这个短语在 PEP 课本里和哪些词组成词簇）

### 断裂 2: 题型只有一层（识别层），没有产出层

当前唯一题型是"中文含义→选对应英文"。这是输入性识别，只覆盖 PEP 课堂的起步阶段。PEP 课堂至少需要 3 层能力:

| 能力层 | PEP 课堂典型活动 | 当前题型是否覆盖 |
|---|---|---|
| 识别 (Recognize) | 听音选图、看词选义 | ✅ 2选1覆盖 |
| 调用 (Recall/Produce) | 看图说词、补全句子、回答问题 | ❌ 完全缺失 |
| 应用 (Apply) | Make a family tree / Make a mind map / 课堂对话 | ❌ 完全缺失 |

只做识别层的后果: 孩子学了 200 关但只会"认"，PEP 课堂要求"说""写""用"时依然懵，不会产生"这个我学过"的体验。

### 断裂 3: 复习闭环是线性重复，不是螺旋提升

当前复习就是重做同一道 2 选 1 题。PEP 的复习是: U1 的词在 U3 的新情境中复现，从"认"升级到"用"。当前没有跨主题复现机制，每个短语只在自己的主题单元内循环。

### 断裂 4: 缺少 PEP 的项目/任务型输出

PEP 每单元末尾有 Project: Make a mind map of making friends / Make a family tree / Make an animal picture book / Make a paper garden / Make a colour flip book / Make a birthday card。这些是 PEP 课堂最让孩子有成就感的环节。当前 App 完全没有等效设计。

### 断裂 5: 题干文案系统性问题

沙漠全 200 关的 `question` 字段统一为 `"Which word means ${zhTitle}?"` ——把短语称为"word"。设计稿已明确应改为"英语表达/哪一句"，但代码层未同步。这不是 PEP 对齐问题但是课堂迁移的 polish 基础。

---

## 必改建议

### 一、数据结构最少追加 3 个字段

在 `desertPhraseUnits` 的每个 `words` 条目追加（不动现有字段，纯追加）:

```js
// 现有
['Good morning', '早上好']

// 改为
['Good morning', '早上好', {
  pepUnit: '3A-U1',              // PEP 单元映射: 3A=三上, 3B=三下
  pepFunction: 'greeting',        // 沟通功能: greeting / describing / asking / expressing / counting / sorting / comparing / instructing
  pepCluster: 'greetings-core',   // PEP 词簇标识，用于跨主题螺旋复习
}]
```

对于非 PEP 内容（如洗漱卫生），`pepUnit` 为空即可，不影响当前功能。

### 二、最少引入 3 种新题型

不动现有 2 选 1（保留为 Level 1 基准题），在复习闭环和 Boss 关中增加:

| 题型 | 覆盖能力层 | PEP 课堂等效 | 实现成本 |
|---|---|---|---|
| **听音选图** - 听英文短语，从 2 张图中选对应场景 | 识别（听觉+视觉） | PEP 听力题标准格式 | 低：复用现有 video clip 截图 + 干扰图 |
| **看图说词/补句** - 展示 PEP 课文情景图，屏幕上显示 "Let's ___" 选空缺短语 | 调用（半产出） | PEP fill-in-blank 题型 | 中：需补情景图素材，但可复用 PEP 教材公开插图 |
| **情境问答题** - "How do you greet a new friend?" → 4选1（Good morning / Good night / Thank you / How are you） | 应用（功能选择） | PEP 课堂 Q&A | 中：需要功能型题目生成逻辑 |

**优先级**: 听音选图 > 情境问答 > 补句。听音选图对 PEP 课堂迁移最直接且实现成本最低。

### 三、复习闭环改造为单元螺旋

当前: 每 10 关一次复习，重做同一主题的 2 选 1。

改为: 
- **阶段复习关**（每 10 关）: 跨主题抽 5 题，混合题型（2选1 + 听音选图）。抽取策略: 当前主题 3 题 + 前 3 个主题各 1 题（螺旋复现）。
- **PEP 单元预学包**（新模块，不替代当前沙漠）: 按 PEP 单元组织 6 关迷你路线: 3 关识别→2 关调用→1 关情境问答→单元 Project 动画展示。孩子选"人教版模式"时走这条线。

### 四、20 个主题的分类改造路线

| 分类 | 主题 | 动作 |
|---|---|---|
| **保持+加字段** | 日常问候、情绪表达、动物宠物、动物园、颜色形状、数字时间、学校学习 | 加 pepUnit/pepFunction/pepCluster，引入新题型 |
| **调整内容后保留** | 家庭互动→改为 family members 词簇；一日三餐+零食水果→合并改为 food names + healthy choice | 核心词汇替换为 PEP 要求词，保留主题壳 |
| **后移或降级为可选** | 洗漱卫生、音乐艺术、运动比赛、职业梦想、购物消费、出行交通 | 暂不进入 PEP 对齐路线，留在常规沙漠 |
| **新增（PEP 必修缺失块）** | Different families、Plants、Healthy food (new)、Old toys | 各 10 关，按 PEP 单元编排 |

---

## 一句话总结

当前数据结构是 "topic → phrase → zhTitle" 的短语表，要做 PEP 课堂迁移，最少需要让它变成 "pepUnit → function → cluster → phrase → zhTitle" 的课程锚定表，加上识别→调用→应用三层题型，再加上跨单元螺旋复习。
