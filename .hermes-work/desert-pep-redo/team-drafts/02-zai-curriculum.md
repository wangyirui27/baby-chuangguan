# 沙漠地图 PEP 重排 · 课程推理稿（ZAI / GLM 席）

> 席位：ZAI / GLM。任务：中文课程推理。
> 依据：`.hermes-work/pep-alignment/source-notes.md`（PEP 三上/三下目录锚点）、`docs/curriculum/desert-pep-classroom-transfer-review.md`（R2 终审）、`docs/curriculum/desert-map-level-questions.md`（当前 200 关全表）、`01-mimo-source-inventory.md`（数据结构）。
> 目标用户：6-8 岁刚入学或即将入学、使用人教版 PEP 教材的孩子。
> 核心产品目标：孩子在 App 里先学 → 上课时惊喜"这个我学过" → 能迁移到课堂问答、Let's talk 对话、Part C 项目、课文表达。
> 红线遵守：未读/写 .env；未改 script.js / quiz.test.js / index.html / sw.js；输出仅落本文。

---

## 一、根因判断（为什么现在不行）

R2 终审已诊断清楚，这里只补一个课程视角的因果链：

```
骨架按 20 个生活主题排（问候/三餐/洗漱/身体/天气/购物…）
    ↓
每个主题 10 关，全部是"中文意思→英文二选一"
    ↓
孩子练到的是"认得这 200 个表达"
    ↓
但 PEP 课堂要的是：接住 How/What/Who 问句、完成 Part C 项目、读懂课文对话
    ↓
课堂迁移断裂：孩子认得 Good morning，但老师问 How do we greet friends? 时不会把 Good morning 当作"答案"用出来
```

**一句话**：当前是"短语包"，用户要的是"课本抢跑包"。不是内容选错了，是骨架和组织逻辑错了。

---

## 二、重排总方案：12 个 PEP 单元做主线

### 2.1 单元清单与关卡分配

PEP 三上有 6 个单元 + 1 个 Revision；三下有 6 个单元 + 1 个 Revision。合计 12 个主单元 + 2 个 Revision。

200 关重新分配为 12 个单元列，每个单元列内设 **三层关卡**：

| 层 | 名称 | 关卡数 | 目标 | 对应 PEP |
|---|---|---|---|---|
| 第 1 层 | 预学层 | 4-5 关 | 先认核心词/表达 | Part A Let's talk / Let's learn |
| 第 2 层 | 课堂问法层 | 3-4 关 | 接住老师 How/What/Who 问句 | Part A/B 驱动问题 |
| 第 3 层 | 项目迁移层 | 2-3 关 | 对应 Part C 微任务输出 | Part C Project |

每单元列约 10-12 关（预学 + 课堂问法 + 项目迁移），12 单元 × ~16 关 ≈ 192 关，留 8 关给 2 个 Revision 支线。

### 2.2 排布顺序：严格按课本学期顺序

孩子一学期先上三上、再上三下。App 的沙漠主线也按这个顺序排，让孩子边上课边发现"我前面学过"。

| 关卡区间 | PEP 单元 | 单元名 | 学期 |
|---|---|---|---|
| 1-16 | 三上 U1 | Making friends | 2024 秋 |
| 17-32 | 三上 U2 | Different families | 2024 秋 |
| 33-48 | 三上 U3 | Amazing animals | 2024 秋 |
| 49-64 | 三上 U4 | Plants around us | 2024 秋 |
| 65-80 | 三上 U5 | The colourful world | 2024 秋 |
| 81-96 | 三上 U6 | Useful numbers | 2024 秋 |
| 97-104 | 三上 Revision | Being a good guest | 2024 秋 |
| 105-120 | 三下 U1 | Meeting new people | 2025 春 |
| 121-136 | 三下 U2 | Expressing yourself | 2025 春 |
| 137-152 | 三下 U3 | Learning better | 2025 春 |
| 153-168 | 三下 U4 | Healthy food | 2025 春 |
| 169-184 | 三下 U5 | Old toys | 2025 春 |
| 185-200 | 三下 U6 | Numbers in life | 2025 春 |

> 三下 Revision（Going to a school fair）不单独占段，融入 U5/U6 项目迁移层。

### 2.3 为什么按学期序而不是按"难度序"

- 产品目标是课堂迁移，不是泛英语启蒙。孩子上课进度就是主线进度。
- 难度自然递进：三上从问候/交朋友开始（最简单），三下进到表达感受/学习工具（更抽象）。
- 家长一眼看到单元名能对上孩子的课本目录，产生信任感。

---

## 三、逐单元列设计

> 每个单元列固定结构：
> - **驱动问题**：老师上课会问的 How/What/Who 问题（PEP 每单元的核心驱动问题）
> - **孩子课堂上会听到/要说的话**：Let's talk 对话核心句型
> - **预学层**：先认什么（核心词/表达）
> - **课堂问法层**：App 二选一怎么变成课堂情境题
> - **项目迁移层**：对应 Part C 微任务

---

### 单元 1：三上 U1 Making friends（关卡 1-16）

**PEP 驱动问题**：
- Part A: How do we greet friends?（我们怎么和朋友打招呼？）
- Part B: How can we be a good friend?（怎么做一个好朋友？）

**孩子课堂会听到/要说的**：
- Good morning! / Good afternoon! / Hello! / Hi!
- I'm ... / My name is ... / Nice to meet you!
- Let's play! / Let's be friends!
- Thank you! / You're welcome!

**预学层（4 关）**：认核心表达
1. Good morning（早上好）
2. Hello / Hi（你好）
3. I'm ... / My name is ...（我叫……）
4. Nice to meet you（很高兴认识你）

→ 直接复用旧主题"日常问候"1-10 关里的 Good morning / How are you / Goodbye / Thank you / You're welcome。删掉 Have fun（不在三上 U1 课文里）。

**课堂问法层（5 关）**：老师怎么问、孩子怎么答
- 题型转变示范：
  - 旧题干：哪一句是在说「早上好」？→ Good morning
  - 新题干：老师走进教室说 Good morning, class! 你应该回哪一句？→ Good morning, teacher!
- 核心问法对：
  1. `How do we greet friends?` → Hello! / Hi!
  2. `How do we greet in the morning?` → Good morning!
  3. `How do we introduce ourselves?` → I'm ... / My name is ...
  4. `How do we say nice to meet you?` → Nice to meet you too!
  5. `How do we say goodbye?` → Goodbye! / See you!

**项目迁移层（3 关）**：Part C — Make a mind map of making friends
- 课堂任务：画一张"交友思维导图"——打招呼方式 → 自我介绍 → 好朋友行为
- App 题：
  1. 画思维导图时，打招呼这个分支你写哪句？→ Hello!
  2. 自我介绍这个分支你写哪句？→ My name is ...
  3. 好朋友会做的事，你选哪句？→ Let's play!

**旧主题处置**：日常问候（旧 1-10）保留 Good morning / How are you / See you later / Goodbye / Thank you / You're welcome / I'm sorry / Excuse me，删 Have fun（后移到城堡/泛生活）。补 My name is / Nice to meet you / Let's be friends。

---

### 单元 2：三上 U2 Different families（关卡 17-32）

**PEP 驱动问题**：
- Part A: Who lives with you?（谁和你住一起？）
- Part B: How are families different?（家庭有什么不同？）

**孩子课堂会听到/要说的**：
- This is my mom / dad / grandpa / grandma / brother / sister.
- Who's that man/woman? → He's/She's my ...
- I have a big/small family.
- This is my family tree.

**预学层（4 关）**：认家庭成员词
1. mom / mother（妈妈）
2. dad / father（爸爸）
3. grandpa / grandma（爷爷/奶奶）
4. brother / sister（哥哥/姐姐）

→ 注意：海岛地图已有家庭成员词（mom/dad 等），沙漠这里要做的是**短语表达层**：This is my mom / Who's that man?

**课堂问法层（5 关）**：
1. `Who lives with you?` → This is my mom / dad / grandpa.
2. `Who's that man?` → He's my dad.
3. `Who's that woman?` → She's my mom.
4. `How many people in your family?` → I have a big/small family.
5. `Is this your brother/sister?` → Yes, he/she is.

**项目迁移层（3 关）**：Part C — Make a family tree
1. 家谱最上面一排你写谁？→ grandpa and grandma
2. 中间一排你写谁？→ mom and dad
3. 最下面是你——你怎么说？→ This is me!
