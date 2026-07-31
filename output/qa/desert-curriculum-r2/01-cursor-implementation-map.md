# Cursor 只读实施图：六层语义与兼容迁移接缝

| 项 | 值 |
|---|---|
| **Task** | `t_001ef88b` |
| **Assignee** | cursor |
| **Date** | 2026-07-23 |
| **Workspace** | `/Users/yr/宝宝闯关` |
| **Output** | `/Users/yr/宝宝闯关/output/qa/desert-curriculum-r2/01-cursor-implementation-map.md` |
| **Scope** | 只读。未改生产文件。未调用 LibTV / Seedance。零视频生成。 |
| **Sources** | `script.js`、`quiz.test.js`、`tools/video-prompts/generate-desert-video-batch.js`、`tools/video-prompts/check-desert-video-prompt.js`、`tools/video-prompts/desert-video-prompt-quality-contract.md` |
| **Upstream** | r1 `01-cursor-architecture.md` / `10-m3-root-cause-and-qa-gate.md` / `11-m3-final-verdict.md` |

---

## Verdict

`title` 仍是六层唯一根字符串。仓库**无** `spokenDialogue` / `visualSemantics` / `learningObjective` / `answerOption` 独立字段（runtime probe：`hasNewFields=false`）。迁移必须 **先 RED 锁语义边界，再 GREEN 最小补字段**；禁止先改 generator 再改数据——否则 checker 与 `quiz.test.js` 会把脏兼容锁死成「新 bug 也绿」。

本文件是 **实施图**，不是再写一遍架构诉苦：下列每条带函数名+行号、兼容断裂面、RED→GREEN 顺序、最小改动面。

---

## 0. 符号真名（禁止再找假入口）

| 审计用语 | 代码实体 | 行 |
|---|---|---|
| 五行源元组 | `makePepExpressionUnit` → `rows.map(([title, zhTitle, questionType, pepPart, transferProbe]) => …)` | `script.js:27-41` |
| 200 关源数据 | `desertPhraseUnits`（12 unit） | `script.js:45-342` |
| 关卡装配 | `buildLevelsFromUnits(desertPhraseUnits, {}, (phrase) => phrase)` | `script.js:563-610` |
| 运行时关卡 | `desertLevels`（id 1–200） | `script.js:610` |
| 视频挂载表 | `desertLevelVideoOverrides`（仅 1–5） | `script.js:611-674` |
| 题干文案 | `questionPromptText` / `questionPromptHtml` | `script.js:1485-1497` |
| 关卡页 | `renderDetail` | `script.js:3822+` |
| 判题 | `applyQuizAnswer` / `isCorrectAnswer` | `script.js:855-908` |
| 干扰项 | `expressionDistractorTitles` | `script.js:525-545` |
| prompt 生成 | `concreteAnchors` / `sceneFor` / `dialogueFor` / `promptFor` / `processLevel` | `generate-desert-video-batch.js:49-227, 255+` |
| prompt 质检 | `check-desert-video-prompt.js` CLI：`<prompt> <targetExpression>` | 全文；调用点 `generate-*:265` |

任务假名 `desertCurriculumEntries` / `buildPepDesertLevels`：**仓库不存在**。

---

## 1. 六层语义 → 当前落点（函数 / 行）

定义沿用 r1/M3：六层互不可替代。下表答「现在谁读什么」——迁移时每层只准动自己的消费者。

| 层 | 定义 | 当前独立字段？ | 当前落点（准确） | 脏源 |
|---|---|---|---|---|
| **learningObjective** | 学完能做什么 / 教研意图 | 半碎片 | `pepFocus`/`functionTag`/`pepUnit`/`pepGrade` 经 `makePepExpressionUnit:27-41` 写入；`transferProbe` 当 Source Situation：`promptFor:183`；**无 objectiveEn 句** | 与 `title` / `zhTitle` 混谈 |
| **questionTask** | 测验问什么、怎么判 | 半独立 | `questionType`+`transferProbe` 元数据；`question` 生成：`buildLevelsFromUnits:581-583`；孩子题干：`questionPromptText:1485-1489`（只用 `zhTitle`）；判题：`applyQuizAnswer:906`（比字符串，不比层） | 正确项仍绑 `title` |
| **spokenDialogue** | 角色真实口播 | **无** | `dialogueFor:158-176`：`const target = level.title`，0-3/3-6/6-9/12-15s 全念 `title`；`promptFor:195,214-217` 嵌入；`processLevel:265` 把 `level.title` 当 checker target | **致命串层** |
| **visualSemantics** | 静音观众必懂的动作/物件 | **无** | `concreteAnchors:49-142`、`sceneFor:144-156`：对 `level.title` 正则猜；`/friend\|kind words\|hello first/` 把 L013+L014 打进同一友谊动作；L014 `kind words` **不**触发 craft/`mind map` scene | title 启发式 |
| **answerOption** | 四选一可见选项 | 绑 title | `options.splice(correct, 0, title)`：`buildLevelsFromUnits:580`；测试锁死：`quiz.test.js:1074` `options[correct]===title`；干扰：`expressionDistractorTitles:544` 返回 `candidate.title`；UI：`renderDetail:3825-3828` | 改 title 即改答案面 |
| **videoPrompt** | 生成契约全文 | 拼装产物 | `promptFor:179-226`；质检：`check-desert-video-prompt.js:49-68`（`targetCount>=8` + Dialogue 必须含 target）；契约：`desert-video-prompt-quality-contract.md`「One target English expression… in Dialogue」 | checker 与脏生成器共谋 |

### 1.1 代表证据：L013 / L014（runtime）

| id | title (= 六层根) | questionType | transferProbe | guidance（跟读） | videoSrc |
|---|---|---|---|---|---|
| 13 | `friend mind map` | project | Make a mind map of making friends. | 听清并跟读 friend mind map | **无**（未挂 override） |
| 14 | `kind words` | project | Add kind words to the mind map. | 听清并跟读 kind words | **无** |

源行：`script.js:64-65`（rows）。装配后字段键集合：**无** spoken/visual 新键（probe：`correct,duration,functionTag,guidance,id,options,pepFocus,pepGrade,pepPart,pepUnit,promptKind,question,questionType,title,topic,transferProbe,videoFile?,videoMeta?,videoSrc?,videoVersion?,zhTitle`）。

### 1.2 数据流（迁移接缝标注）

```
rows[title, zhTitle, questionType, pepPart, transferProbe]   script.js:30-35
        │
        ▼
buildLevelsFromUnits                                         :563-600
  options[correct]=title                                     :580   ← answerOption 接缝
  question=「哪一句英语表达是「${zhTitle}」？」                 :581-583 ← questionTask 接缝
  guidance=跟读 ${title}                                     :591   ← spoken 跟读污染（UI）
  title: titleFor(title)                                     :587   ← displayTitle 接缝
        │
        ▼
desertLevels[0..199]                                         :610
        │
        ├─ quiz UI
        │    questionPromptText(zhTitle)                     :1485-1489
        │    renderDetail → detail-title=level.title         :3846
        │    options / applyQuizAnswer                       :3825, 906
        │    mistakeBook.word=level.title                    :1109
        │
        └─ generate-desert-video-batch.js
             concreteAnchors/sceneFor/dialogueFor/promptFor  :49-226
             check-desert-video-prompt.js <prompt> <title>   :265
             [--run-libtv] ← 本任务禁止
```

---

## 2. Dirty 兼容风险（现在绿、一拆就红的锁）

迁移若忽略这些，会得到「代码改对了、CI/门禁全红」或更糟：「门禁仍绿、语义仍脏」。

### 2.1 测验 / 产品面（必须保持绿，或显式改断言）

| ID | 风险 | 证据 | 断裂方式 |
|---|---|---|---|
| D1 | **正确答案 === title** 全量断言 | `quiz.test.js:1074` | 把 `answerOption` 从 `title` 拆出且未同步 options → 200 关全红 |
| D2 | 题干只露 zhTitle、藏 transferProbe | `quiz.test.js:1089-1102`；`questionPromptText:1485` | 题干塞 spoken/probe → 红；正确 |
| D3 | detail-title = `第 N 关 · title`，禁 pepUnit | `quiz.test.js:1105-1112`；`renderDetail:3846` | displayTitle 改 pep 标签 → 红 |
| D4 | 可见干扰项同 unit / 同 questionType | `quiz.test.js:1115-1136`；`expressionDistractorTitles:525-544` | distractor 改读新字段但排序仍读 title → 错配对或红 |
| D5 | L001–L005 videoSrc / taskId / qa 硬钉 | `quiz.test.js:1034-1066`；overrides `:611-667` | 拆层时勿动已挂视频元数据 |
| D6 | 错题本 `word: level.title` | `normalizeMistakeBook:1109` | title 语义改成 display-only、忘记 answer 字符串 → 历史错题展示漂 |
| D7 | 跟读 guidance 嵌 title | `buildLevelsFromUnits:591`；L013 实测「跟读 friend mind map」 | 产品上孩子被要求跟读项目名；拆 spoken 后 guidance 应跟 `cefrTarget`/`spoken` 主句，不是 project 标签 |

### 2.2 视频 prompt / checker 共谋（脏绿）

| ID | 风险 | 证据 | 为何叫 dirty |
|---|---|---|---|
| D8 | checker 第二参 = `level.title`，且 `targetCount >= 8` | `generate-*:265`；`check-*:49-50` | 合法「少念 title、多念自然口语」会被判失败 |
| D9 | Dialogue 必须含 target 字面 | `check-*:66-68` | 正确拆层后若仍把 target 当 title，强制角色念项目名 |
| D10 | 台词长度：含 target 时 `maxWords = max(5, targetWordCount)` | `check-*:59-64` | 长 title 抬高上限；短自然句反而更严——激励继续塞 title |
| D11 | quality contract：「target… in timed Dialogue」 | `desert-video-prompt-quality-contract.md` §Non-negotiable | 文档层把 answer/label 与口播绑死；改代码不改契约 = 评审口径打架 |
| D12 | `dialogueFor` 无 missing 分支 | `generate-*:158-176` | 无 spoken → 不跳过、用 title 填坑（r1 F2） |
| D13 | `concreteAnchors` friend\|kind words 合并 | `generate-*:96-102` | L013/L014 同学友谊动作；L014 无 mind-map scene（`sceneFor:152` 只看 title） |
| D14 | slug / 目录名绑 title | `processLevel:256-260` | 改 displayTitle 会改 output 路径；已生成产物 orphan |

### 2.3 挂载与冻结（兼容边界）

| ID | 状态 | 证据 | 迁移约束 |
|---|---|---|---|
| D15 | overrides **仅 1–5**；L013/L014 **未挂** | `script.js:611-674`；runtime `videoFile=null` | 拆层期间禁止 `desertLevelVideoOverrides[13\|14]` |
| D16 | r1 作废 L013/L014 final mp4；冻结旧 prompt | `11-m3-final-verdict.md` §5 | 新 spoken/visual **不得**复用旧 prompt 当 GREEN 证据 |
| D17 | `module.exports` 已导出 `desertLevels` | `script.js:1534` | 外挂工具 `require('../../script.js').desertLevels`（`generate-*:5`）——新字段必须出现在同一对象，勿另起平行数组除非 generator 同步 |

### 2.4 脏兼容总判

> **当前「绿」= 测验契约绿 + prompt 结构绿 + title 字面重复绿。**  
> **不是** 六层语义绿。  
> 迁移策略：**扩大 RED 覆盖面先抓住串层**，再让最小实现 GREEN；禁止只改 generator 让旧 checker 继续绿。

---

## 3. RED → GREEN 顺序（实施序列）

原则：每步可独立验证；LibTV 全程关门；先测后码；先门禁后数据批量。

### Phase R0 — 冻结（零代码，纪律）

1. 禁止 `--run-libtv` / Seedance。
2. 禁止挂 `desertLevelVideoOverrides[13..]`。
3. 旧 L013/L014 mp4 保持作废；旧 prompt 只读对照。

**出口**：纪律确认（本文件 + r1 verdict）。无生产 diff。

### Phase R1 — RED：语义契约测试（只加测，先失败）

**最小测试面（建议新文件或 `quiz.test.js` 新 block，名称示意）：**

| 序 | RED 断言（期望失败于现状） | 针对 |
|---|---|---|
| R1.1 | `desertLevels[12].spokenDialogue` 存在且 `status==='authored'`（或等价）；主口播 **≠** `title` 当 `questionType==='project'` | L013 串层 |
| R1.2 | 同理 L014；且 visual mustShow 含 mind-map **延续**动作（add-to-map），不得仅 friendship body language | D13 |
| R1.3 | 对 project 样本：`dialogueFor` 输出（或未来纯函数）**禁止**五拍复读 `level.title` | D8–D12 |
| R1.4 | checker 新模式：传入 `cefrTarget` / `spokenPrimary` 时，**不要求** `answerOption/title` 在 Dialogue 出现 ≥8 | D8–D11 |
| R1.5 | 保持既有绿：`options[correct]===title`（或显式 `===answerOption` 且默认 answerOption===title） | D1 兼容 |

**出口**：新断言 RED；旧 `quiz.test.js` desert 块仍 GREEN。

### Phase G1 — GREEN：最小数据接缝（script.js 数据层 only）

**最小改动函数：**

1. 扩展 `makePepExpressionUnit` 五行 → 可选第 6+ 列或并行 map：`spokenDialogue` / `visualSemantics`（可先 **仅 L013/L014**）。
2. `buildLevelsFromUnits`：**透传**新 meta（已有 `...metadata`：`:595`）——通常 **零逻辑改** 即可带上字段。
3. **不改** `options[correct]=title`、`questionPromptText`、`renderDetail` title 展示（保 D1–D5）。

**出口**：R1.1/R1.2 GREEN；R1.3/R1.4 仍可能 RED（generator/checker 未动）。

### Phase G2 — GREEN：generator 读新字段（tools only）

**最小改动函数（按优先级）：**

| 函数 | 行 | 改法 |
|---|---|---|
| `dialogueFor` | `158-176` | `const target = level.spokenDialogue?.primary \|\| level.spokenLines?.[0] \|\| null`；**missing → throw/skip**，禁止 fallback `level.title`（对 project；recognition 口语=title 可显式 authored 拷贝） |
| `concreteAnchors` | `49-142` | 若 `level.visualSemantics?.mustShow` 存在则用之；删除对 L013/L014 有害的 `/friend\|kind words/` 误合并依赖 |
| `sceneFor` | `144-156` | 读 `visualSemantics.sceneHint`；L014 必须 craft/mind-map，不靠 title 正则 |
| `promptFor` | `179-226` | CEFR / Zero-beginner 的「target expression」= `cefrTargetExpression`（可 = spoken 主表达），**不是** displayTitle；Source Situation 可继续 `transferProbe` |
| `processLevel` | `265` | checker 第二参改为 `cefrTargetExpression` 或 spoken primary，**不是**盲目 `level.title` |

**出口**：`--only-prompts` dry-run 对 L013/L014 产出新 prompt；旧 L001–L005 回归仍过（recognition 类 spoken===title 显式 authored）。

### Phase G3 — GREEN：checker + contract 去共谋

| 文件 | 行 / 节 | 改法 |
|---|---|---|
| `check-desert-video-prompt.js` | `49-68` | 分参：`--answer`（可选，不计 Dialogue 强制）/ `--spoken`（Dialogue 必须）/ 保留结构片段检查 |
| 同文件 | `70-103` | 特例语义锚（Good morning 等）保留；**新增** project 样本锚（mind map / add words）可选 |
| `desert-video-prompt-quality-contract.md` | Non-negotiable | 改写：「Dialogue 含 **spokenDialogue**；answerOption/title **不得**默认要求出现在口播」 |

**出口**：R1.3/R1.4 GREEN；脏 title 复读 prompt 变 RED。

### Phase G4 — 测验跟读文案（可选、产品）

- `guidance:591`：project 关改为跟读 spoken 主句，或「看画面完成任务」——**单独 PR**，因触达孩子可见文案。
- `normalizeMistakeBook:1109`：`word` 可继续用 title/answerOption（稳定 id 语义），不必改。

### Phase G5 — 才允许重新生成视频

满足 r1 `11` §6 重启条件子集（本实施图最小集）：

1. L013/L014 六字段齐全 + R1 全绿  
2. checker 不再强制 title∈Dialogue  
3. dry-run prompt 人工过 silent-viewer / unknown-language  
4. **然后**才 LibTV；过签才写 `desertLevelVideoOverrides`

---

## 4. 最小改动面（文件 / 函数清单）

### 4.1 必改（语义拆层闭环）

| 优先级 | 路径 | 函数 / 区段 | 为何最小 |
|---|---|---|---|
| P0 | `script.js` | `makePepExpressionUnit:27-41` + L013/L014 rows `:64-65`（可扩列） | 数据根；先两关样本 |
| P0 | `script.js` | `buildLevelsFromUnits:563-600` | 仅确认 meta 透传；避免重写 options/question |
| P0 | `generate-desert-video-batch.js` | `dialogueFor` / `concreteAnchors` / `sceneFor` / `promptFor` / `processLevel` 的 target 取值 | 串层发生地 |
| P0 | `check-desert-video-prompt.js` | `targetCount` + Dialogue 含 target：`49-68` | 去掉共谋 |
| P0 | `quiz.test.js` | **新增** R1 块；**不改** `:1074` 除非同步引入 `answerOption` 别名 | 先 RED 后 GREEN |
| P1 | `desert-video-prompt-quality-contract.md` | Non-negotiable / Generation gate | 文档与门禁一致 |

### 4.2 明确不改（本迁移）

| 路径 | 理由 |
|---|---|
| `renderDetail` 主体 / `applyQuizAnswer` | 判题与 UI 壳不依赖 spoken |
| `desertLevelVideoOverrides` 1–5 | D5 硬钉；勿顺手「清理」 |
| `expressionDistractorTitles` 排序键 | 仍可用 title 作 option 字面；除非 answerOption≠title |
| 后端 `/api/*`、InsForge、学习同步 | 无 spoken 字段需求；错题仍存 option 字符串 |
| 已生成 `output/media-production/**` | 只读；不作 GREEN |
| 任意 LibTV CLI | 任务禁止 |

### 4.3 改动半径估计

- **样本闭环（L013/L014 only）**：约 2 rows 数据 + 4 generator 函数分支 + checker 参数语义 + 1 组测试。  
- **200 关全量 authored spoken**：内容工程，不在「最小改动面」；应用同一 schema 分批，**生成器 missing→拒绝** 已在 G2 锁死。

---

## 5. 兼容迁移接缝（字段策略）

推荐 **加字段、不改旧字段含义**（dirty-compatible）：

```text
title              → 继续 = displayTitle = answerOption（默认）
zhTitle            → 不变
questionType       → 不变
transferProbe      → 继续服务 questionTask / Source Situation
+ spokenDialogue   → { status, lines[], cefrTargetExpression }
+ visualSemantics  → { mustShow[], mustNotShow[], sceneHint? }
```

规则：

1. **Recognition / 多数 dialogue**：允许 `spokenDialogue.lines` 显式等于 `title`（authored 拷贝），不是隐式 fallback。  
2. **Project / meta-label / noun phrase**：`spoken ≠ title` 强制；missing → generator fail-closed。  
3. 日后若 `answerOption !== title`：先改 `buildLevelsFromUnits:580` + `quiz.test.js:1074` + distractor map，**单独 PR**，勿与 spoken 拆层绑死。

---

## 6. 与 r1 的差分（本文件新增价值）

| r1 已有 | 本 r2 实施图补上 |
|---|---|
| 六层定义 + 根因 | **逐函数改动顺序**与最小面 |
| F1–F9 发现 | **D1–D17 dirty 兼容锁**（测/checker/错题/路径） |
| 重启条件清单 | **RED→GREEN 可执行相位**（R0→G5） |
| 6 字段 TS 草图 | **兼容策略：加字段、title 语义冻结为 answer/display** |

---

## 7. 完成校验

| 检查项 | 结果 |
|---|---|
| 输出文件非空 | 是（本文件） |
| 只读生产代码 | 是（未改 `script.js` / tests / prompts / 视频） |
| 零 LibTV 调用 | 是 |
| 含准确函数/行 | 是（§0–§1、§4） |
| 含 dirty 兼容风险 | 是（§2 D1–D17） |
| 含 RED→GREEN 顺序 | 是（§3） |
| 含最小改动面 | 是（§4） |

### 路径摘要

```
output/qa/desert-curriculum-r2/01-cursor-implementation-map.md
```

绝对路径：`/Users/yr/宝宝闯关/output/qa/desert-curriculum-r2/01-cursor-implementation-map.md`

审阅锚点：

- `script.js:27-41, 45-342, 525-545, 563-674, 906, 1109, 1485-1497, 3822-3846`
- `quiz.test.js:1006-1136`
- `tools/video-prompts/generate-desert-video-batch.js:49-226, 255-265`
- `tools/video-prompts/check-desert-video-prompt.js:49-68`
- `tools/video-prompts/desert-video-prompt-quality-contract.md`
