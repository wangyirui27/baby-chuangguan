# Independent Prompt QA — L006 / L008 / L011

日期：2026-07-23  
Reviewer：`hermes-parent`（非 automated-checker / cursor / producer）  
范围：prompt + contract 六层语义；**不含**成片 / ASR / silent 实拍  
方法：读 r4 prompt 全文 + contract JSON；对照 quality 合同；**不**用 checker 结果当自批

---

## 总表

| 关 | spoken | r4 dir | QA | 可申请 single-sample？ |
|----|--------|--------|----|------------------------|
| L006 | My name is Tom. | `desert-level-006-my-name-is-r4-batchready-20260723` | **PASS** | 是（等 yr） |
| L008 | I'm Chen Jie. | `desert-level-008-i-m-chen-jie-r4-batchready-20260723` | **PASS** | 建议 L006 后再批 |
| L011 | Are you OK? | `desert-level-011-are-you-ok-r4-batchready-20260723` | **PASS** | 建议 L006 后再批 |

---

## L006 — My name is...

### 合同摘要
- **Learning**：用 "My name is [name]" 自我介绍；指向自己；**不是**见面问候  
- **Target spoken**：`My name is Tom.`  
- **Dialogue**：Tom / Lily 轮流报名 + I'm Tom/Lily + 收束  
- **Visual mustShow**：胸口指认、轮流、无握手/挥手见面礼、前景干净  
- **mustNot**：Nice to meet you 手势、握手、greeting wave、文字/教室道具  
- **Answer label**：`My name is...`（quiz 卡，不强迫进台词）

### Prompt 核对
| # | 检查项 | 结果 |
|---|--------|------|
| 1 | spoken 出现在 Dialogue 且为焦点句 | PASS — 0-3s `"My name is Tom."` |
| 2 | 台词非 title 复读 | PASS — 五句有名字轮换，不是 "My name is..."×5 |
| 3 | 目标≠见面问候 | PASS — mustNot + visual 明确禁 handshake/wave/meet-you |
| 4 | silent 可懂（自介） | PASS — 胸口指认写进 anchors 与 silent-viewer 段 |
| 5 | 无已知毒句 | PASS — 无 nice to meet you / mind map 等 |
| 6 | 负向提示覆盖文字/教室/背身说话 | PASS |
| 7 | promptSha256 与文件一致 | PASS |
| 8 | 非 DELETE / 未 skipGeneration | PASS |

### 残留风险（不阻 QA pass，阻 Phase B）
- curriculumVerdict 仍为 **REGENERATE**（缺 textbook 签字）  
- 成片是否真做出胸口指认：要 post-gen silent 验  

### QA 结论
**PASS** — 允许进入「等 yr single-sample」状态。  
已写入该关 `approval-manifest.json` → `checks.independent_prompt_qa.pass=true`。  
**未**写 `approved` / `executionApproval` / `dryRun=false`。

---

## L008 — I'm Chen Jie

### 合同摘要
- **Learning**：`I'm Chen Jie` 陈述自己的名字；区分陈述 vs 询问  
- **Dialogue**：I'm Chen Jie / Hi, Chen Jie / Yes I'm Chen Jie / I'm Mike / 收束  
- **mustShow**：胸口指认、轮流、无提问手势、无 nametag 文字  
- **mustNot**：questioning gesture、可读名牌/文字/教室

### Prompt 核对
| # | 检查项 | 结果 |
|---|--------|------|
| 1 | spoken 在对话中 | PASS（contract lines 含 I'm Chen Jie.） |
| 2 | 非纯 title 复读 | PASS |
| 3 | 与 L007 What's your name 边界 | PASS — 陈述句为主，无把本关做成提问关 |
| 4 | mustNot 文字/名牌 | PASS（contract + 通用 negative） |
| 5 | SHA 一致 | PASS |
| 6 | 毒句 | PASS |

### 残留风险
- title ≈ spoken（`I'm Chen Jie`）——可接受，因 dialogue 有 Mike 轮换，非 title autofill  
- 仍 REGENERATE / 无 textbook  

### QA 结论
**PASS（报告层）**。  
**未**改 manifest（避免多关同时进入可批队列；先闭环 L006）。

---

## L011 — Are you OK?

### 合同摘要
- **Learning**：`Are you OK?` 表达关心；**只问安、不搀扶**  
- **Dialogue**：Are you OK? / I'm OK. / Are you hurt? / I'm fine. Thank you. / You are brave.  
- **mustShow**：B 轻摔坐地、A 蹲下平视、手低开不拉人、保持坐/跪  
- **mustNot**：helping lift / pulling up / carrying（与 L012 I can help 切割）

### Prompt 核对
| # | 检查项 | 结果 |
|---|--------|------|
| 1 | spoken 为关心问句 | PASS |
| 2 | 帮助动作被禁止 | PASS — mustNot 明确 |
| 3 | 与 help 关边界 | PASS |
| 4 | silent：关心 vs 救助 | PASS（设计层写清；成片仍要验） |
| 5 | SHA / 非 DELETE | PASS |

### 残留风险
- 模型容易「演成扶起来」——生成后 silent 必验  
- REGENERATE / 无 textbook  

### QA 结论
**PASS（报告层）**。manifest 同 L008，先不写 pass。

---

## 非本报告范围

- 教材 PEP 对齐签字  
- LibTV / Seedance 调用  
- ASR / silent forced-choice 实据  
- userAcceptance / Phase B unlock  
- L007,L009–L010,L012+ 的 independent QA  

---

## 签名

- reviewer: hermes-parent  
- role: independent prompt QA（pre-generation only）  
- not: execution approver  
- date: 2026-07-23  
