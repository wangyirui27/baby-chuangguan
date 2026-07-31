# 沙漠地图重做目录骨架（01-mimo-catalog）

> 来源：source-notes.md（PEP 三上/三下目录锚点）、desert-pep-classroom-transfer-review.md（R2 终审）、script.js desertPhraseUnits 20 主题。
> 目标：Codex 唯一写手，据此骨架重写 desertLevels。

---

## 一、PEP 12 单元 → 关卡骨架

### 三上册（3A）— 6 单元 + Revision

| 单元 | Part A 锚点 | Part B 锚点 | Part C 锚点 | Revision 锚点 | 建议关卡数 |
|---|---|---|---|---|---|
| U1 Making friends | How do we greet friends? | How can we be a good friend? | Make a mind map of making friends | — | 14 |
| U2 Different families | Who lives with you? | How are families different? | Make a family tree | — | 14 |
| U3 Amazing animals | What pets do you know? | What wild animals do you know? | Make an animal picture book | — | 14 |
| U4 Plants around us | What do we get from plants? | How can we help plants? | Make a paper garden | — | 14 |
| U5 The colourful world | What colours do you see? | How do colours help us? | Make a colour flip book | — | 14 |
| U6 Useful numbers | When do we use numbers? | How useful are numbers? | Make a birthday card | — | 14 |
| **3A Revision** | — | — | — | Being a good guest | 8 |

**3A 小计：92 关**

---

### 三下册（3B）— 6 单元 + Revision

| 单元 | Part A 锚点 | Part B 锚点 | Part C 锚点 | Revision 锚点 | 建议关卡数 |
|---|---|---|---|---|---|
| U1 Meeting new people | How do we greet new people? | How can we be polite? | — | — | 12 |
| U2 Expressing yourself | How do we describe things? | How do we express our feelings? | — | — | 12 |
| U3 Learning better | What tools help us learn? | How do our senses help us learn? | — | — | 12 |
| U4 Healthy food | What do we eat? | What shall we eat? | — | — | 12 |
| U5 Old toys | What kinds of old things do you have? | How can old things be reused? | — | — | 12 |
| U6 Numbers in life | How do numbers help us count and sort? | How do numbers help us make decisions? | — | — | 12 |
| **3B Revision** | — | — | — | Going to a school fair | 8 |

**3B 小计：80 关**

---

### 总计

| 区段 | 关卡数 |
|---|---|
| 免费体验（现有 level 1-10，不变） | 10 |
| 3A PEP 主线 | 92 |
| 3B PEP 主线 | 80 |
| **合计** | **182** |

> 现有 200 关 → 重做后 182 关。差异 -18 关来自砍掉偏离主题、压缩每单元从 10 关到 ~12-14 关（密度更高，每关都有 PEP 锚点）。如果要凑整 200，可给 3A Revision 和 3B Revision 各加 2 关 = 186，再给高频单元（U1/U3/U5）各加 1-2 关 = ~192-200。具体由 Codex 决定。

---

## 二、每单元内部结构（固定 3 层 + Revision）

每单元 12-14 关按以下模板分配：

```
Part A（5 关）:
  A-预学层（3 关）: 核心词汇/表达认读，zh→en 二选一（保留现有 UI）
  A-问法层（2 关）: 接住 Part A 驱动问题，题干改为英文情境问句

Part B（5 关）:
  B-预学层（3 关）: Part B 核心词汇/表达
  B-问法层（2 关）: 接住 Part B 驱动问题

Part C（2 关）:
  C-项目层（2 关）: 对应 Part C 微任务（mind map / family tree / picture book 等）

Revision（仅 3A U1-U6 各追加 2 关复习 / 3B 同理）:
  综合复习关（2 关）: 跨 Part A+B 混合情境题
```

3A Revision（Being a good guest）和 3B Revision（Going to a school fair）各 8 关，是跨单元综合情境。

---

## 三、旧沙漠 20 主题迁移判定

### ✅ 可直接迁移（进 PEP 单元主线）— 9 个主题

| 旧主题 | 迁入 PEP 单元 | 改造要点 |
|---|---|---|
| 日常问候 | 3A-U1 Making friends + 3B-U1 Meeting new people | 补回应句（How are you → I'm fine）、礼貌场景（please / excuse me） |
| 情绪表达 | 3B-U2 Expressing yourself | 补 How do you feel? 问句、描述事物（How do we describe things?） |
| 颜色形状 | 3A-U5 The colourful world | 保留颜色词，形状/混色按课本正文核验 |
| 数字时间 | 3A-U6 Useful numbers + 3B-U6 Numbers in life | 保留数字，时间/日期句式需逐页核 |
| 动物宠物 | 3A-U3 Amazing animals (Part A: pets) | 拆成 pets 词簇，动作短语改成名词认读 |
| 动物园 | 3A-U3 Amazing animals (Part B: wild animals) | 拆成 wild animals 词簇 |
| 一日三餐 | 3B-U4 Healthy food | 从"吃饭动作"改成"健康食物选择" |
| 家庭互动 | 3A-U2 Different families | 弱保留；需大改：补 family members / family tree |
| 学校学习 | 3B-U3 Learning better | 弱保留；需大改：补 tools / senses |

### ⚠️ 部分可迁移（需大幅改造）— 2 个主题

| 旧主题 | 迁入 PEP 单元 | 改造要点 |
|---|---|---|
| 零食水果 | 3B-U4 Healthy food | 合并到一日三餐单元，从"零食"改成"健康食物" |
| 玩具游戏 | 3B-U5 Old toys | 必须改成 old things / reuse，不能是普通玩游戏 |

### ❌ 必须后移（不进沙漠主线）— 9 个主题

| 旧主题 | 原因 | 建议去向 |
|---|---|---|
| 课堂规则 | PEP 无对应单元，且已有独立课堂引导 | 保留为辅助机制（非关卡主线） |
| 洗漱卫生 | PEP 三上/三下无此主题 | 城堡/高年级/泛生活支线 |
| 身体动作 | PEP 三上/三下无此主题 | 城堡/高年级/泛生活支线 |
| 天气季节 | PEP 三上/三下无此主题 | 城堡/高年级/泛生活支线 |
| 出行交通 | PEP 三上/三下无此主题 | 城堡/高年级/泛生活支线 |
| 购物消费 | PEP 三上/三下无此主题 | 城堡/高年级/泛生活支线 |
| 音乐艺术 | PEP 三上/三下无此主题 | 城堡/高年级/泛生活支线 |
| 运动比赛 | PEP 三上/三下无此主题 | 城堡/高年级/泛生活支线 |
| 职业梦想 | PEP 三上/三下无此主题 | 城堡/高年级/泛生活支线 |

---

## 四、每单元 Part A/B 锚点速查（Codex 写题用）

### 3A

| 单元 | Part A 驱动问题 | Part B 驱动问题 | Part C 项目 |
|---|---|---|---|
| U1 Making friends | How do we greet friends? | How can we be a good friend? | Make a mind map of making friends |
| U2 Different families | Who lives with you? | How are families different? | Make a family tree |
| U3 Amazing animals | What pets do you know? | What wild animals do you know? | Make an animal picture book |
| U4 Plants around us | What do we get from plants? | How can we help plants? | Make a paper garden |
| U5 The colourful world | What colours do you see? | How do colours help us? | Make a colour flip book |
| U6 Useful numbers | When do we use numbers? | How useful are numbers? | Make a birthday card |

### 3B

| 单元 | Part A 驱动问题 | Part B 驱动问题 | Part C 项目 |
|---|---|---|---|
| U1 Meeting new people | How do we greet new people? | How can we be polite? | （待核） |
| U2 Expressing yourself | How do we describe things? | How do we express our feelings? | （待核） |
| U3 Learning better | What tools help us learn? | How do our senses help us learn? | （待核） |
| U4 Healthy food | What do we eat? | What shall we eat? | （待核） |
| U5 Old toys | What kinds of old things do you have? | How can old things be reused? | （待核） |
| U6 Numbers in life | How do numbers help us count and sort? | How do numbers help us make decisions? | （待核） |

> 3B Part C 项目名 source-notes.md 未收录（原始目录页可能未列出或为新版调整）。Codex 写到 3B Part C 时需按课本正文补充，或先用通用项目题占位。

---

## 五、数据结构字段清单（每条题必填）

```
pepGrade:    "3A" | "3B"
pepUnit:     "U1" ~ "U6" | "Revision"
pepPart:     "A" | "B" | "C" | "Revision"
pepFocus:    课堂驱动问题原文（如 "How do we greet friends?"）
functionTag: greeting | feeling | describing | counting | family | animal | plant | colour | number | food | tool | sense | reuse | polite | ...
transferProbe: 上课会复现的老师问法（如 "A friend says Good morning. What do you say?"）
promptKind:  "expression"  ← 禁止写 word/单词
```

---

## 六、Codex 写手清单（一页）
