# Desert LibTV Gold Bar — L006 / L007 / L008

**用户确认（2026-07-24）：** 这批品质相当高。后续沙漠关必须延续此水准。

参考成片（真源）：

| 关 | version | spoken 教什么 |
|----|---------|----------------|
| L006 | `r4-batchready-20260723` | `My name is Tom.` 自我介绍 |
| L007 | 同上 | `What's your name?` 问名字 |
| L008 | 同上 | `I'm Chen Jie.` 另一套自报句型 |

路径：`output/media-production/desert-level-00{6,7,8}-*-r4-batchready-20260723/`

---

## 四条必须同时成立

### 1. 逻辑正确（teach the right thing）

- 本关 **CEFR spoken** = 孩子要学会的口语句，**不是** quiz 标题标签。
- 画面动作与 spoken **同构**（问=掌心问；自报=胸口指；分享=递物…）。
- 必须写清 **反混淆**：本关不是 Nice to meet you / 不是握手礼 / 不是课堂带读。
- Source Situation 用 **一句话故事** 写清因果，禁止只贴标签。

### 2. 对话不死板（natural turns）

固定 5 拍 `A / B / A / B / Both`，且：

| 要 | 不要 |
|----|------|
| 目标句清晰出现 1 次（问句禁止 2 次） | 标题/标签当台词复读 |
| 有回应、有称呼、有收束动作 | `We are friends!` 空口号结尾 |
| 人设全程一致（A=Tom 就别突然变 Lily） | `Tom and Lily!` 齐喊 |
| 每拍推进剧情 | `Yes, I'm X` 废话确认 |
| 像小朋友真说话 | `My name is X` + `I'm X` 同名叠床 |

金标范例结构：

```
目标句（A）→ 对方实质回应（B）→ 推进/互报（A）→ 点名招呼（B）→ 一起行动（Both: Let's play!）
```

### 3. 画面丰富但不抢戏（rich, single lesson）

- 水彩故事书：cream / sand / clay / mint，纸纹，软铅笔线。
- 前景 **只有一个可学意义**；环境有层次（oasis path、植物、光）但不塞第二学习点。
- `mustShow` ≥ 4 条 **可拍动作**，不是形容词情绪。
- 说话人始终 **正面/四分之三**，口型可见；禁背身/纯侧脸对白。
- Silent-viewer：静音也能看懂本关功能。

### 4. 把该教的教了（learning payload）

每关交付检查：

1. 听完能否复述 **目标句**？  
2. 静音能否看出 **同一功能**？  
3. 会不会误学成相邻关（问候/握手/帮助）？  
4. Quiz 标签是否 **只在卡上**、没被嘴念成标签？

---

## 生成前硬门禁（已自动化）

| 门 | 工具 |
|----|------|
| 蠢台词 | `evaluateDialogueCraft`（generate + checker） |
| 结构 | `check-desert-video-prompt.js` |
| 金标清单 | `node tools/video-prompts/check-desert-gold-bar.js --level N` |
| 全量扫 | `python3 tools/video-prompts/audit-stupid-dialogue.py` |

**未过金标 = 不得 `--run-libtv`。**  
单关：`--start N --end N`；禁止多关并行烧分。

---

## 生成后验收（成片）

对照 L006–008 contact sheet：

1. 脸/口是否始终可见？  
2. 目标动作是否比表情更抢眼？  
3. 对白是否自然、非齐读？  
4. 环境是否「好看」但仍是同一课？  
5. 不合格 → **改 contract 台词/mustShow 后重跑**，禁止只调色蒙混。

---

## 写手纪律

- 改台词先改 `desert-level-semantic-contracts-l006-l050.json`，再 `--prompts-only`。  
- 禁止为了过 checker 塞空口号或标签 chant。  
- 新关先对齐 L006–008 故事形状，再谈花活。  
- 用户点名「延续这批水准」= 本文件优先于任何「先出数量」压力。
