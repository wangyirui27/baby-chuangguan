# 关卡题目设计总览（海岛 + 沙漠）

> 数据源：`script.js` 当前导出的 `levels` 与 `desertLevels`；正式题型一为 2 选 1：正确答案 + 第一个非正确 `option`。  
> 生成时间：2026-07-22。

## 关键结论

1. 海岛 200 关保持旧单词首学合同：`questionPromptText(levels[0])` 仍是“视频里学到的单词”。
2. 沙漠 200 关已重构为 PEP 单元预学闭环：12 个 PEP 三上/三下单元，覆盖 recognition / situation / dialogue / project，且每关带完整 PEP metadata。
3. 沙漠题干已经改为“课堂情境/英语表达”，屏幕 HTML 由 `questionPromptText(level)` 的统一 helper 派生。
4. 沙漠正式二选一干扰项已精修：优先同 PEP 单元 + 同 questionType + 同 Part，避免把 dialogue 题配 project 词、把单元末尾题配到下一单元。
5. 本版依据目录级锚点实现；未逐页核官方教材 PDF/实体书，后续拿到官方页码后再做逐页精修。

## 沙漠 PEP 单元覆盖

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

## 沙漠抽样审题

| 关 | PEP 单元 | 题型 | 课堂迁移探针 | 正确表达 | 2选1干扰项 |
|---:|---|---|---|---|---|
| 1 | 三上 U1 Making friends | recognition | How do we greet friends? | Hello | Hi |
| 4 | 三上 U1 Making friends | recognition | How do we greet friends? | Goodbye | Good morning |
| 12 | 三上 U1 Making friends | dialogue | A friend needs help. | I can help | Are you OK? |
| 17 | 三上 U1 Making friends | project | Tell the class one good-friend rule. | be a good friend | say hello first |
| 25 | 三上 U2 Different families | dialogue | Answer: Who lives with you? | I live with my parents | Who lives with you? |
| 40 | 三上 U3 Amazing animals | situation | Tell one pet you like. | I like dogs | What pets do you know? |
| 60 | 三上 U4 Plants around us | dialogue | What do we get from plants? | We get wood | We get vegetables |
| 80 | 三上 U5 The colourful world | situation | Say how colours change. | mix colours | colour signs |
| 100 | 三上 U6 Useful numbers | project | Finish the birthday card. | make a birthday card | count candles |
| 120 | 三下 U2 Expressing yourself | recognition | How do we express our feelings? | I'm happy | I'm sad |
| 140 | 三下 U3 Learning better | recognition | What tools help us learn? | my bag | my book |
| 160 | 三下 U4 Healthy food | dialogue | Talk about food. | I like rice | What do we eat? |
| 180 | 三下 U5 Old toys | dialogue | Teacher asks for a reuse idea. | How can we reuse it? | What old things do you have? |
| 200 | 三下 U6 Numbers in life | project | Share numbers you found. | numbers in life | sort and count project |

## 海岛边界

海岛仍是 3-5 岁词汇首学地图，旧题干“视频里学到的单词”保留；本轮不改海岛题库和音频合同。
