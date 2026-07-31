# 沙漠地图 × 人教版/PEP 课堂迁移 R3 终审

> 用户目标：孩子在 App 里先学，之后上人教版/PEP 三上/三下课堂时产生“这个我早就学过”，并能迁移到课堂问答、对话、项目、表达和课文学习。  
> 依据：`script.js` 当前 `desertLevels` 200 关、`docs/curriculum/desert-map-level-questions.md`、`docs/curriculum/level-question-design.md`、`.hermes-work/pep-alignment/source-notes.md`。

## 结论

**沙漠题库已重构为 PEP 单元预学闭环。**

R2 的问题是“20 个生活短语主题 × 中文释义到英文二选一”。R3 已改为 **PEP 三上/三下 12 单元 × recognition / situation / dialogue / project**，并在每关补齐 PEP 元数据和课堂迁移探针。孩子在 App 里不只是认短语，还会反复遇到课堂会复现的 How / What / Who 问法、对话回应和项目输出入口。

## R3 覆盖

| PEP 单元 | 年级 | 关卡 | 数量 | Part 覆盖 | 题型覆盖 | 课堂驱动问题 |
|---|---|---:|---:|---|---|---|
| 三上 U1 Making friends | 3A | 1-17 | 17 | A / B / C Project | recognition / situation / dialogue / project | How do we greet friends? / How can we be a good friend? |
| 三上 U2 Different families | 3A | 18-34 | 17 | A / B / C Project | recognition / dialogue / situation / project | Who lives with you? / How are families different? |
| 三上 U3 Amazing animals | 3A | 35-51 | 17 | A / B / C Project | recognition / dialogue / situation / project | What pets do you know? / What wild animals do you know? |
| 三上 U4 Plants around us | 3A | 52-68 | 17 | A / B / C Project | recognition / situation / dialogue / project | What do we get from plants? / How can we help plants? |
| 三上 U5 The colourful world | 3A | 69-85 | 17 | A / B / C Project | recognition / dialogue / situation / project | What colours do you see? / How do colours help us? |
| 三上 U6 Useful numbers | 3A | 86-102 | 17 | A / B / C Project | recognition / dialogue / situation / project | When do we use numbers? / How useful are numbers? |
| 三下 U1 Meeting new people | 3B | 103-119 | 17 | A / B | situation / recognition / dialogue / project | How do we greet new people? / How can we be polite? |
| 三下 U2 Expressing yourself | 3B | 120-136 | 17 | B / A | recognition / dialogue / situation / project | How do we describe things? / How do we express our feelings? |
| 三下 U3 Learning better | 3B | 137-152 | 16 | A / B | recognition / situation / dialogue / project | What tools help us learn? / How do our senses help us learn? |
| 三下 U4 Healthy food | 3B | 153-168 | 16 | A / B | recognition / situation / dialogue / project | What do we eat? / What shall we eat? |
| 三下 U5 Old toys | 3B | 169-184 | 16 | A / B | recognition / dialogue / situation / project | What kinds of old things do you have? / How can old things be reused? |
| 三下 U6 Numbers in life | 3B | 185-200 | 16 | A / B | recognition / dialogue / situation / project | How do numbers help us count and sort? / How do numbers help us make decisions? |

## 已修正的实现点

- 沙漠主线从旧生活主题切到 PEP 12 单元：Making friends、Different families、Amazing animals、Plants around us、The colourful world、Useful numbers、Meeting new people、Expressing yourself、Learning better、Healthy food、Old toys、Numbers in life。
- 每个沙漠关卡都带 `pepGrade`、`pepUnit`、`pepPart`、`pepFocus`、`functionTag`、`transferProbe`、`promptKind`、`questionType`。
- 沙漠题干使用“课堂情境/英语表达”，海岛题干继续使用旧“单词”文案。
- `renderDetail` 的屏幕题干改由统一 helper 派生，避免朗读题干和页面题干分叉。

## 旧偏离标题处理

| 旧标题 | R3 状态 |
|---|---|
| Flush toilet | 已移出沙漠主线 |
| Too expensive | 已移出沙漠主线 |
| Traffic light | 已移出沙漠主线 |
| Score goal | 已移出沙漠主线 |
| Be a writer | 已移出沙漠主线 |

## 审计边界

已审：沙漠 200 关结构、PEP 12 单元覆盖、题型覆盖、实现字段、题干文案、旧偏离标题移除。  
未逐页核：官方教材 PDF/实体书正文逐页词句、页码级 Let's talk/Project 逐句对应、视频内容是否完全承托每个表达、真实课堂迁移数据。

后续若用户提供官方 PDF/实体书，以官方页码为唯一真相源做逐页词句精修；本版先满足目录级 PEP 课堂迁移 R3。
