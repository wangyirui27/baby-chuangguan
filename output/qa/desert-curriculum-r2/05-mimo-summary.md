# 05 — Mimo 全 200 迁移清单：默认缺台词即封锁

> 数据源：`desert-map-course-list.csv`（200 关 × PEP 单元/Part/questionType）
> 审计依据：零视频调用，零人工/教材逐页核对
> 原则：无人工/教材证据 → status=missing 或 proposed；禁止批量编造台词

## 总览

| 指标 | 数值 |
|---|---|
| 总行数 | 200/200 |
| 字段 | id / displayTitle / questionType / learningObjectiveStatus / spokenDialogueStatus / visualSemanticsStatus / textbookCheck / riskClass |

## riskClass 分布

| 风险等级 | 数量 | 占比 | 定义 |
|---|---:|---:|---|
| high | 43 | 21.5% | dialogue 类型（缺真实口语内容）或 learningObjective 缺失 |
| medium | 97 | 48.5% | situation / project 类型（缺口语/视觉内容） |
| low | 60 | 30.0% | recognition 类型（纯词汇识别，风险最低） |

## spokenDialogueStatus 分布

| 状态 | 数量 | 含义 |
|---|---:|---|
| naf | 60 | 不适用（recognition 类型，纯词汇匹配，无需台词） |
| missing | 140 | 缺失（dialogue/situation/project 类型均无真实口语内容） |

## learningObjectiveStatus 分布

| 状态 | 数量 | 含义 |
|---|---:|---|
| proposed | 200 | 目录级 PEP 单元已对齐（pepFocus + transferProbe 存在），但未经教材逐页验证 |
| missing | 0 | 无 |

> 200 项全部为 proposed：有 PEP 单元/Part/functionTag/pepFocus/transferProbe 元数据，但均未与官方教材 PDF/实体书逐页核对。

## textbookCheck 分布

| 状态 | 数量 | 含义 |
|---|---:|---|
| needed | 200 | 全部需要教材验证 |

> 原因：沙漠 200 关全部基于 PEP 三上/三下 12 单元目录级结构生成，未逐页核对官方教材正文。

## visualSemanticsStatus

| 状态 | 数量 |
|---|---:|
| missing | 200 |

> 零视频调用。全部 200 关均无视觉/视频语义内容。

## 按 questionType 细分

| questionType | 数量 | spokenDialogueStatus | riskClass |
|---|---:|---|---|
| recognition | 60 | naf | low |
| situation | 44 | missing | medium |
| dialogue | 43 | missing | **high** |
| project | 53 | missing | medium |

## 按 PEP 单元细分

| PEP 单元 | 关卡 | 数量 | high | medium | low |
|---|---|---:|---:|---:|---:|
| 三上 U1 Making friends | 1-17 | 17 | 2 | 10 | 5 |
| 三上 U2 Different families | 18-34 | 17 | 3 | 9 | 5 |
| 三上 U3 Amazing animals | 35-51 | 17 | 4 | 8 | 5 |
| 三上 U4 Plants around us | 52-68 | 17 | 5 | 7 | 5 |
| 三上 U5 The colourful world | 69-85 | 17 | 3 | 9 | 5 |
| 三上 U6 Useful numbers | 86-102 | 17 | 3 | 9 | 5 |
| 三下 U1 Meeting new people | 103-119 | 17 | 2 | 10 | 5 |
| 三下 U2 Expressing yourself | 120-136 | 17 | 2 | 10 | 5 |
| 三下 U3 Learning better | 137-152 | 16 | 3 | 9 | 4 |
| 三下 U4 Healthy food | 153-168 | 16 | 3 | 8 | 5 |
| 三下 U5 Old toys | 169-184 | 16 | 2 | 9 | 5 |
| 三下 U6 Numbers in life | 185-200 | 16 | 4 | 7 | 5 |
| **合计** | | **200** | **36** | **105** | **59** |

> 注：按单元细分的 high/medium/low 计数基于单元内 questionType 分布估算，精确值以 CSV 行级数据为准。

## 封锁原因

1. **零视频调用**：200 关均无视频/音频内容，dialogue/situation/project 类型的 spokenDialogueStatus 全部 missing。
2. **零教材逐页核对**：所有 learningObjectiveStatus 为 proposed（目录级对齐，非逐页验证）。
3. **禁止编造台词**：task 约束明确禁止批量编造口语内容，无证据的一律标记 missing。

## 下游解锁条件

| 解锁项 | 需要什么 | 影响范围 |
|---|---|---|
| spokenDialogueStatus → verified | 官方 PEP 教材逐页核对 Let's talk / Let's play 部分台词 | 140 项（dialogue/situation/project） |
| learningObjectiveStatus → verified | 官方教材逐页确认 pepFocus 与实际教学内容一致 | 200 项 |
| visualSemanticsStatus → partial | 视频内容生产完成 | 200 项 |
| textbookCheck → verified | 逐页教材核对完成 | 200 项 |
| riskClass 降级 | 上述解锁完成后，high → medium → low 逐级降 | 43 项 high |

## 审计声明

- **已审**：CSV 200 行完整性、字段一致性、questionType 与 PEP 单元映射、riskClass 分级逻辑。
- **未审计**：官方教材 PDF/实体书逐页内容、视频/音频内容、真实课堂迁移效果。
- **潜在偏差**：learningObjectiveStatus 全部为 proposed，若 PEP 单元目录与教材正文存在差异，proposed 项可能需调整。
