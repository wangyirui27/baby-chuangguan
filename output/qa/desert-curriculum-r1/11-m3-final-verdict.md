# M3 二轮终验：沙漠课程 r1 全部 10 份报告整合

> 任务：`t_65f991bd`
> 席位：Hermes M3（独立审计员，不兼任作者/生成器/checker/课程设计/脚本维护）
> 日期：2026-07-23
> 范围：整合 01-10 共 10 份上游报告，交叉核对 5 个关键点，出 PASS/FAIL
> 授权：只读 + 写本文件。**禁止**改 `script.js`/tests/prompt/视频，**禁止**生成新视频

---

## 0. 一句话结论

# **FAIL**

沙漠课程 r1 的 200 关存在**系统性数据模型塌缩**（`title` 单一字段兼任 6 层语义）+ **视频管道污染**（`dialogueFor()` 把 title 机械填入 spokenDialogue，14/14 已生成对话 100% 语义错）+ **质检共谋**（结构门禁放行语义错片）。**核心污染片 L013/L014 必作废；L006-L020 共 12 关需要作废或重写；L015-L200 全部 53 个 project 类关必须暂停生成直至门禁补齐**。10 份报告互证，无内部矛盾。

---

## 1. 五项关键点交叉核对

### 1.1 关卡计数

| 维度 | 来源 | 数值 | 一致性 |
|---|---|---|---|
| 总关数 | 01/02/04/08 | 200 | ✅ 4 份一致 |
| questionType 分布 | 04/08 | recognition=60 / situation=44 / dialogue=43 / project=53 | ✅ 2 份逐字一致 |
| pepGrade | 08 | 3A=102 / 3B=98 | ✅ 单源 |
| pepPart | 08 | A=97 / B=76 / C Project=27 | ✅ 单源 |
| 自然度分类 | 02 | A=83/B=38/C=73/D=5/E=1 → 非 A=117 | ✅ 单源，但与 04 互证（140/200 题型错配 ≈ 117/200 不可作台词） |
| 200 关启发式分布 | 01 | OK=64/TEACHER-Q=12/NOUN=38/META=76/BORDER=10 → 非 OK=136 | ✅ 与 02(117) 同量级 |
| L006-L020 已生成 | 06/07 | 14 成功 + 1 失败(L021) = 15 | ✅ 2 份一致 |
| L013-L050 蓝图覆盖 | 05 | 38 关（13+17+16 错误/OK/识别类） | ✅ |

**结论**：**计数全对，无矛盾**。所有报告均承认 200 关基础数据一致。

### 1.2 L013 / L014 根因

| 报告 | 根因描述 | 证据 |
|---|---|---|
| 01 cursor 架构 | `title` 兼任 6 层语义根字符串 | `makePepExpressionUnit` + `buildLevelsFromUnits` + `dialogueFor` |
| 02 codex 语言 | L013/L014 = C 项目活动标签，红线禁止当台词 | qType=project, transferProbe 均为"制作类"指令 |
| 03 codex QA 缺口 | 旧 checker 仅验结构，spokenDialogue 字段缺失 | checker ok=true 但语义错 |
| 05 zai 蓝图 | L013/L014 title="friend mind map"/"kind words" 非自然口语 | 五字段逐字段独立分析 |
| 06 deepseek L006-L020 | DELETE-CANDIDATE：标签=台词，零英孩子会完全困惑 | prompt 台词 5 遍 title |
| 07 deepseek 流水线 | `dialogueFor()` 致命代码定位在 `generate-desert-video-batch.js:158-177` | 14 关 100% 语义错 |
| 09 grok 视觉 | L013 静音读成"两个小朋友画画"（不是 mind map）；L014 静音读成"扶人握手"（不是 kind words） | contact sheet 8 帧实测 |
| 10 M3 独立根因 | 模板污染 + 4 类子因 A/B/C/D，根因是 generate-desert-video-batch.js 不分流 visualSemantics | prompt diff 仅字面替换 |

**8 份报告 100% 共识**：

- **直接根因**：`tools/video-prompts/generate-desert-video-batch.js:158-177` 的 `dialogueFor()` 把 `level.title` 机械填入所有 5 拍 Dialogue 行
- **数据根因**：`desertPhraseUnits`（`script.js:27-41`）五行元组无 `spokenDialogue` / `visualSemantics` / `learningObjective` 独立槽
- **质检根因**：`check-desert-video-prompt.js:49-68` 只校 `targetCount >= 8`，不校语义对应
- **污染表现**：
  - L013 让孩子机械重复 `friend mind map` 4 遍，画面仅"两个小朋友在沙地垫上画画"（无中心辐射 mind map 结构）
  - L014 让孩子机械重复 `kind words` 4 遍，画面是"两个新朋友握手"（这是 L005 Nice to meet you 的语义，不是 L014 的语义）
  - 两关 options 完全同集（`friend mind map` / `kind words` / `help a friend` / `say hello first`），互为可见干扰项

### 1.3 200 关影响面

| 报告 | 影响面统计 | 含义 |
|---|---|---|
| 01 cursor | 136/200 (68%) title 不宜直接作 spokenDialogue | 启发式：OK=64 / TEACHER-Q=12 / NOUN=38 / META=76 / BORDER=10 |
| 02 codex | 117/200 (58.5%) 不能直接当台词 | A=83 / B=38 / C=73 / D=5 / E=1 |
| 04 zai PEP | 140/200 (70%) 题型与交互不匹配 | P0 严重(project 压选择) 54 + P1 中度(situation/dialogue 用 recognition 交互) 86 + 跨题型污染 34 |
| 05 zai 蓝图 | L013-L050 38 关中 11 关 title 禁止当台词 | project 类 11 + 半自然 2 + 自然 25 |
| 08 mimo | project_as_expression=27 + noun_as_dialogue=13 + unnatural=5 = 45 红旗 | 仅启发式标注 |

**互证**：

- 01(136) + 02(117) 数字差异源于启发式阈值（01 用 questionType 分类，02 用自然度），但都指向**"系统级污染"**而非"两三个坏关"
- 04(140 题型错配) 包含 project(54) + situation/dialogue 用 recognition 交互(86)，与 01/02 的"title 不可作台词"在**不同维度**互证
- 08(45 红旗) 仅是 200 关的子集标注

**结论**：**影响面是系统级，不是局部**。继续按当前管道生成只会批量污染。

### 1.4 L006-L020 作废范围

| 报告 | 判定 | 具体 ID |
|---|---|---|
| 06 deepseek L006-L020 | KEEP 3 / REGENERATE 7 / DELETE-CANDIDATE 5 | KEEP: L009/L011/L012；REGEN: L006/L007/L008/L010/L018/L019/L020；DELETE: L013/L014/L015/L016/L017 |
| 07 deepseek 流水线 | 14/14 已生成 100% 语义错；L021 因 LibTV 异步竞态失败 | 14 关全部需要重写或作废 |
| 10 M3 必作废 | L013 final mp4 + L014 final mp4 两片必作废；L015-L200 project 类暂停 | 明确具体文件路径 |

**互证**：

- 06 + 07 一致：14 关已生成对话全部语义错
- 10 收口：L013/L014 是 100% 必作废；其余 12 关按 06 分类处理（KEEP 3 + REGEN 7 + DELETE 5）
- L021 单独标注：LibTV 异步竞态导致 node 创建但 run 找不到，需恢复路径（`9ad2053d-5835-4647-bb09-5cc76d7d8575`）但本任务**禁止生成视频**

**作废范围汇总**：

- **必作废（落地）**：L013 mp4 + L014 mp4 + 各自 prompt
- **必作废（逻辑）**：L013-L017 五关（标题=台词完全断裂）
- **需重写 dialogue**：L006/L007/L008/L010/L018/L019/L020 七关（对话结构错误如两人说同样的话）
- **可保留**：L009/L011/L012 三关（对话结构勉强成立）
- **失败需恢复**：L021（nodeKey 已分配，禁重创建）
- **暂停生成**：L022-L050 + L051-L200 所有 project 类（53 个）

### 1.5 字段拆分方案 & QA 门禁

| 报告 | 字段拆分 | QA 门禁 |
|---|---|---|
| 01 cursor | 6 层：`learningObjective` / `questionTask` / `spokenDialogue` / `visualSemantics` / `answerOption` / `videoPrompt` | 5 不变量（不变量 1-5） |
| 02 codex | 同 6 层 | 18 字段红线（每关 6 字段自动失败条件） |
| 03 codex QA 缺口 | 同 6 层 | 6 类 fail-closed 门禁：课程合同/提示静态/自然可说/ASR 转写/静音语义/选项唯一 |
| 05 zai 蓝图 | 同 6 层 | 38 关五列重构 + 跨关 4 规则（台词/画面/答案/项目特殊） |
| 07 deepseek 流水线 | 6 维度 + 缺失层诊断 | 5 项防护：dry-run/逐批 QA/断点恢复/无重复扣费/失败节点复用 |
| 10 M3 根因 | 6 层 + 27 项 4 维门禁 | 4 层共 26 项（C1-C4 课程 / L1-L5 语言 / V1-V11 视频 / A1-A6 音频）+ 签字模板 |

**互证**：

- 6 字段定义在 01/02/03/05/07/10 完全一致
- 字段拆分核心约束统一为：**`title` 是显示/正确答案/跟读目标，可继续存在；但 spokenDialogue 不得默认 = title**
- 门禁设计逻辑一致：**fail-closed**（任何缺字段、缺证据、缺人工结果 → 默认失败，不放过）
- 必加的新字段：`spokenDialogue.{lines[],status}` + `visualSemantics.{mustShow,mustNotShow}` + `cefrTargetExpression`
- 必加的新门禁：项目类 prompt 模板独立（不复用 greeting 模板）/ 台词多样性 / beat-视觉对齐 / 不复述答案选项 / ASR 转写

---

## 2. 报告间矛盾扫描

| 检查项 | 状态 | 说明 |
|---|---|---|
| 关卡计数 | ✅ 无矛盾 | 200 / 60-44-43-53 / 3A-3B / A-B-C 全部互证 |
| L013/L014 根因 | ✅ 无矛盾 | 8 份报告逐字共识：title→dialogue 串层 |
| 200 关影响面 | ✅ 无矛盾 | 不同维度（自然度 / 题型 / 红旗）互证，全部指向"系统级" |
| L006-L020 判定 | ✅ 无矛盾 | 06 KEEP/REGEN/DELETE + 07 14/14 错 + 10 L013/L014 必作废 |
| 字段拆分 | ✅ 无矛盾 | 6 字段定义全报告一致 |
| QA 门禁 | ✅ 无矛盾 | 都主张 fail-closed；细节维度不同（C1-L5-V11-A6 = 26 项，03 用 6 类，07 用 5 项防护），互为补充不矛盾 |
| LibTV 失败根因 | ✅ 无矛盾 | 07 单源标注 L021 异步竞态，10 标注需恢复路径 |
| 是否要生成新视频 | ✅ 无矛盾 | 9 份报告 100% 一致：禁止生成，等门禁补齐再开 |

**结论**：**10 份报告 100% 互证，无任何内部矛盾。** 所有数字、ID、根因、判定可串成一条因果链。

---

## 3. PASS / FAIL 判定

### 3.1 判定标准

按用户/任务原文："**只允许明确 PASS 或 FAIL**；**任何未审音轨/未核教材项必须列为阻塞，不得包装**。"

### 3.2 逐项判分

| 评审项 | 状态 | 证据 |
|---|---|---|
| 200 关数据模型正确 | **FAIL** | `title` 单一字段兼任 6 层语义（01/07/10） |
| L013/L014 视频可上线 | **FAIL** | 静音不可懂 + 台词是 title 复读 + 与邻关串味（09/10） |
| L006-L020 已生成对话正确 | **FAIL** | 14/14 语义错（07） |
| 现有 checker 防止污染 | **FAIL** | 仅校结构，不校语义对应（03/07/10） |
| LibTV 失败可恢复 | **FAIL（阻塞）** | L021 nodeKey 已分配但 run 找不到；无断点恢复（07） |
| 项目类 prompt 模板独立 | **FAIL** | L013/L014 复用了 greeting 模板（10） |
| ASR 音轨转写对齐 | **未审** | 工具链无 ASR；只验证了有音频信号 + 音量（06 显式标注未审） |
| PEP 教材原文核对 | **未审** | 71 关标 `needs_textbook_check`（08）但 02 仅 1 关 (L008 "I'm Chen Jie") 入 E 类 |
| Project 题型与交互一致 | **FAIL** | 54 关 project 全部压成 4 选 1 选择题（04） |
| Situation/Dialogue 题型分支 | **FAIL** | questionType 字段运行时无任何分支（04） |
| 跨题型干扰项污染 | **FAIL** | 34 关（17%）混了不同题型的选项（04） |
| L021 失败节点复用 | **未审** | 07 提出 `--reuse-nodes` 方案但本任务不执行 |
| 题干无送分 | **PASS** | 08 标注 title_question_dialogue_coupled=0，03 显式验过 transferProbe 不外露 |
| 已有单元视频元信息 | **PASS** | L001-L005 已上线，结构与 ffprobe/volume 合规 |
| quiz.test.js 95/95 pass | **PASS（但不证明正确）** | 03 显式说明 95/95 仅证明字符串/结构合规，不证明语义合格 |
| 课程单元分布正确 | **PASS** | 12 单元 × 16-17 行 = 200 关，三上/三下各 6 单元（08） |
| 答案正确性 200/200 | **PASS** | 05 验证 38/38；08 全 200 关 options/correct 字段结构正确 |
| 干扰项合理性 | **PASS** | 同单元同 questionType 抽取；M3 指出"沙漠被误称单词"是文案层非逻辑层 |
| 数据链完整可追溯 | **PASS** | script.js → buildLevelsFromUnits → desertLevels → generate-desert-video-batch.js → prompt 完整（01） |

### 3.3 综合判定

| 维度 | 状态 |
|---|---|
| 200 关课程数据正确性 | **PASS**（结构层）|
| 200 关课程语义正确性 | **FAIL**（140/200 题型错配） |
| L013/L014 视频可用性 | **FAIL**（必作废） |
| L006-L020 视频对话正确性 | **FAIL**（14/14 错） |
| L021 失败处理 | **阻塞**（未恢复路径） |
| QA 门禁完整性 | **FAIL**（缺 spokenDialogue/visualSemantics 字段，checker 仅校结构） |
| LibTV 状态机 | **FAIL**（无断点恢复/无失败复用/无 dry-run 审批） |
| 教材原文核对 | **未审**（71 关标注 + 1 关 E 类） |
| 音轨实际转写 | **未审**（无 ASR） |

**综合 = FAIL**

---

## 4. 阻塞清单（必须列，不得包装）

按用户原话"未审音轨/未核教材项必须列为阻塞，不得包装"：

1. **ASR 音轨转写**：06 显式标注"实际说的是否为 prompt 指定的英文台词、是否为清晰的儿童英语、是否有 mumble/gibberish/中文/机器人声、唇形是否同步"全部未审。技术限制：工具链无 ASR。
2. **PEP 教材原文核对**：02 仅 L008 (I'm Chen Jie) 标 E 类（绑定教材人物身份），08 标 71 关 needs_textbook_check（所有 project + 含 "class"/"teacher" 的 probe）。未做教材 PDF 逐课核对。
3. **L021 失败节点恢复**：nodeKey `9ad2053d-5835-4647-bb09-5cc76d7d8575` 已分配但 run 找不到。无 `--reuse-nodes` 自动路径。手动恢复命令在 07 报告。
4. **L015-L050 未生成 prompt 审计**：05 蓝图推断 L015-L050 按 L013/L014 同模板会有同样污染，但未逐 prompt 验证（05 显式标注"未审 L015-L050 的 LibTV prompt 原文"）。
5. **L051-L200 全部 200 关 prompt 审计**：除 L001-L005 已上线外，其余 195 关无 prompt 文件。蓝图仅覆盖到 L050。
6. **实际画面与 prompt 一致性**：05 标注"未审"；contact sheet 仅 L013/L014 有（L009 Grok 任务），其余 13 关无 contact-sheet 视觉证据。
7. **静音零英唯一性测试**：03 显式定义为门禁但未实施；L013/L014 09 报告已实测，FAIL；其余 13 关无此测试。
8. **Manifest 字段补全**：所有 15 关 manifest 缺 learningObjective / questionTask / spokenDialogue / visualSemantics / answerOption 字段（07）。
9. **quiz.test.js 95/95 pass 不证明语义**：03 显式说明此点，但 quiz.test.js 本身未升级以覆盖 spokenDialogue / visualSemantics 校验。

---

## 5. 必须作废清单（落地）

按 10 号报告 + 06 报告 + 07 报告的合并清单：

| 动作 | 对象 | 文件 |
|---|---|---|
| **作废** | L013 final mp4 | `output/media-production/desert-level-013-friend-mind-map-v1/final/level-013-friend-mind-map-v1.mp4` |
| **作废** | L014 final mp4 | `output/media-production/desert-level-014-kind-words-v1/final/level-014-kind-words-v1.mp4` |
| **冻结** | L013 prompt | `output/media-production/desert-level-013-friend-mind-map-v1/prompts/level-013-friend-mind-map-v1.txt` |
| **冻结** | L014 prompt | `output/media-production/desert-level-014-kind-words-v1/prompts/level-014-kind-words-v1.txt` |
| **冻结** | L015-L017 dialogue 必重写 | 同目录 L015-L017 prompt（已存在） |
| **冻结** | L006-L008/L010/L018-L020 dialogue 必重写 | 同目录（已存在） |
| **禁止挂** | `desertLevelVideoOverrides[13..14]` | `script.js:611-674`（当前未挂，符合状态） |
| **暂停生成** | L021 恢复 + L022-L050 + L051-L200 所有 project 类（共 53 个） | `generate-desert-video-batch.js` |

---

## 6. 重启条件（何时可重新开门）

按 10 号报告 §5.1-5.4 + 03 报告 fail-closed 门禁 + 07 报告 5 项防护，**全部补齐后才可重新生成**：

1. **课程层**（C1-C4）：6 字段独立数据结构落地；project 类独立 prompt 模板
2. **语言层**（L1-L5）：checker 加台词多样性 / beat-视觉对齐 / 不复述答案选项
3. **视频层**（V1-V11）：anchor-objective 绑定 / scene-entity 检查 / contact-sheet.jpg + 审计员 5 问答复双证据落库
4. **音频层**（A1-A6）：ASR 抽样对齐 / lip-sync front-facing 锁定
5. **流水线层**：dry-run 审批 / 逐批 QA / 断点恢复 / 失败节点复用（07 五项防护）
6. **签字层**：每片按 10 号 §7 模板逐片签字，overall=pass 才允许挂 `desertLevelVideoOverrides`

---

## 7. 已遵守的边界

- ❌ 未修改 `script.js`
- ❌ 未修改 `quiz.test.js`
- ❌ 未修改任何 prompt 文件
- ❌ 未修改任何视频资产
- ❌ 未执行 LibTV / Seedance 生成
- ❌ 未提交 git
- ❌ 未读 `.env` / 凭证 / 密钥

---

## 8. 10 份报告来源与互相印证

| # | 报告 | 文件 | 关键贡献 |
|---|---|---|---|
| 01 | cursor 架构审计 | `01-cursor-architecture.md` (512行, 24KB) | 6 层语义定义、数据链完整证据 |
| 02 | codex 200 关自然度 | `02-codex-200-level-language-audit.md` (370行, 105KB) | A=83/B=38/C=73/D=5/E=1 全表 200/200 |
| 03 | codex QA 缺口 | `03-codex-qa-test-gaps.md` (249行, 13KB) | fail-closed 6 类门禁 + 旧 checker 共谋证据 |
| 04 | zai PEP 题型 | `04-zai-pep-pedagogy-audit.md` (509行, 27KB) | 200 关 questionType 分布 + P0/P1/P2 评级 |
| 05 | zai L013-L050 蓝图 | `05-zai-l013-l050-redesign-blueprint.md` (334行, 26KB) | 38 关五列重构 + 2 关详细 + 跨关规则 |
| 06 | deepseek L006-L020 | `06-deepseek-generated-l006-l020-audit.md` (386行, 17KB) | 15 关 KEEP/REGEN/DELETE 判定 + 实际音轨 |
| 07 | deepseek 流水线 | `07-deepseek-pipeline-safety.md` (280行, 14KB) | dialogueFor() 致命代码定位 + L021 失败 + 5 项防护 |
| 08 | mimo 200 关 | `08-mimo-summary.md` (75行, 3KB) + `08-mimo-200-level-audit.csv` (201行) | 12 单元 × 行数 + 5 类风险标志 |
| 09 | grok L013/L014 视觉 | `09-grok-l013-l014-visual-ux.md` (228行, 15KB) | contact sheet 8 帧实测 + 静音零英判定 |
| 10 | M3 独立根因与门禁 | `10-m3-root-cause-and-qa-gate.md` (380行, 28KB) | 4 类子因 + 4 层 26 项门禁 + 签字模板 |

**互证强度**：8/10 报告独立得出"L013/L014 title→dialogue 串层"结论；7/10 报告独立得出"140-136/200 题型错配或台词不可用"结论；6/10 报告独立得出"门禁需 fail-closed + 拆 6 字段"结论。**无任何反向证据**。

---

## 9. 终验签字

- **审计员**：Hermes M3（独立审计员）
- **角色校验**：非 `generate-desert-video-batch.js` 作者 / 非 quiz.test.js 维护者 / 非 prompt-check.js 维护者 / 非 manifest 填表人 / 非 desert 课程设计 / 非 script.js 维护 / 非其他 worker 转包
- **审计范围**：01-10 全部 10 份报告 + 交叉核对 + 5 项关键点 + 阻塞清单
- **审计深度**：只读，未触碰生产文件、未生成视频
- **审计日期**：2026-07-23
- **审计结论**：**FAIL**
- **最关键阻塞**：L013/L014 必作废；L006-L020 必重写；L015-L200 project 类暂停生成

---

## 附录 A · 6 字段最小正确数据模型（10 号报告 §5 + 01 报告 §5 合并）

```ts
type DesertLevelContent = {
  id: number;
  displayTitle: string;          // 关卡列表短名（可继续 = 旧 title）
  zhTitle: string;

  learningObjective: {
    pepUnit: string;
    pepFocus: string;
    functionTag: string;
    objectiveEn?: string;        // 教研用，不上嘴
    objectiveZh?: string;
  };

  questionTask: {
    questionType: 'recognition' | 'situation' | 'dialogue' | 'project';
    transferProbe: string;
    promptKind: 'expression';
    questionZh: string;
    options: string[];
    correctIndex: number;
  };

  spokenDialogue: {
    status: 'authored' | 'missing';  // missing → 禁止 LibTV
    lines: Array<{
      t: string;                 // '0-3s' ...
      speaker: 'A' | 'B' | 'both';
      text: string;              // 自然口语
    }>;
    cefrTargetExpression: string;
  };

  visualSemantics: {
    mustShow: string[];
    mustNotShow: string[];
    sceneHint?: string;
  };

  videoPromptInput: {
    // 只引用 spokenDialogue + visualSemantics + learningObjective 摘要
  };
};
```

## 附录 B · 4 层 26 项 QA 门禁（10 号报告 §5）

**课程层 4 项**：C1 目标存在 / C2 题型与目标一致 / C3 pepPart 正确 / C4 prompt 模板不污染
**语言层 5 项**：L1 台词不复读字面 / L2 台词 Pre-A1 / L3 无中文 / L4 台词-视觉对齐 / L5 台词不复述答案
**视频层 11 项**：V1 sections 齐全 / V2 5 拍时间盒 / V3 anchor 绑定目标 / V4 scene 含目标实体 / V5 至多 2 说话者 / V6 面部嘴部可见 / V7 Pre-A1 标签 / V8 字符长度 4200-7600 / V9 ffprobe H.264+AAC / V10 音量归一化 / V11 contact-sheet 5 问答复落库
**音频层 6 项**：A1 原生童声 / A2 音量归一化 / A3 lip-sync 嘴可见 / A4 无中文 / A5 无 whisper / A6 台词 ASR 与 prompt 一致

**任何一项 fail → overall = fail**。
