# FAIL — L006-L050 提示词全面复检最终总判

日期：2026-07-23  
范围：沙漠地图 L006-L050 最新严格 r-version prompt（r3 优先，缺 r3 用 r2）  
输出目录：`output/qa/desert-l006-l050-prompt-reqa-20260723/`

## 总结论

**不能解锁批量生成。不能调用 LibTV / Seedance。**

结构层面：45/45 fresh checker PASS。  
提示词文本层面：12/45 可作为“单样本候选”，18/45 需 hold/升级，15/45 必须重写或删除。  
发布链路层面：0/45 通过 Phase A 执行门禁，0/45 通过 Phase B release 门禁。

## 团队完成状态

- Kanban：7/7 done
- 外部 CLI：Cursor 1/1 done；Codex 2/2 done
- Grok：配额 1%，按硬规则本轮排除

## 核心证据

| 证据 | 结果 |
|---|---:|
| 最新 r-version 覆盖 | 45/45 |
| latest r3 | 15 |
| latest r2 | 30 |
| fresh checker | 45/45 PASS |
| prompt SHA vs manifest | 45/45 match |
| latest r2/r3 MP4 | 0 |
| latest r2/r3 `run-command.sh` | 0 |
| latest r2/r3 production `manifest.json` | 0 |
| Cursor fresh `--prompts-only` reproduction | 45/45 PASS |
| Cursor reproduction side effects | 0 MP4 / 0 run-command / 0 production manifest |
| semantic tests | 26/26 PASS |
| quiz tests | 95/95 PASS |
| independent_prompt_qa.pass | 0/45 |
| executionApproval.approved | 0/45 |
| userAcceptance.accepted | 0/45 |
| ASR / silent / entailment evidence | 0/45 |
| needsTextbookCheck | 45/45 |

## 分组判定

### A. Prompt-wise clean：12 关

这些只表示“提示词文本可进入单样本候选”；仍缺 textbook、independent QA、executionApproval、Phase B 证据，不能直接生成/发布。

- L006, L008, L011
- L022, L025, L033, L034, L039, L042, L046, L047, L049

### B. Hold / upgrade before batch：18 关

- L007, L009, L010, L015, L016, L017, L018, L019, L020
- L021, L023, L024, L026, L027, L028, L032, L040, L041

主要问题：r2 视觉锚点过薄、跨关污染、C 类抽象标签与 spoken line 不一致、family/pet 单点视觉差异不足。

### C. Must rewrite/remove before any generation：15 关

- L012 — helper/helpee 角色逻辑反转
- L013 — DELETE；friend mind map 三层断裂
- L014 — DELETE；Scene 有 “craft mat” 与 “no craft mat” 自相矛盾
- L029 — `cefrTargetExpression` 错用 L028 的 `This is my family.`；同时 Codex 发现 `--spoken=<title>` 误传仍可 PASS 风险
- L030 — DELETE；family tree 是项目产物名，不是自然可说表达
- L031 — DELETE；add family photo 指令/答案不匹配，台词归属混乱
- L035, L036, L037, L038 — pet noun 视觉锚点过薄，动物贴纸风险
- L043, L044, L045 — wild animal 视觉锚点过薄，动物贴纸/背景装饰风险
- L048 — DELETE；animal picture book 是项目产物名，不是自然可说表达
- L050 — 与 L049 的 standalone sheet / picture book 约束矛盾

## 跨卡关键发现

1. **M3 release gate：FAIL**  
   `script.js` 仍是五字段 source row + Node-only contract attach；浏览器侧 L006-L050 authored six-layer contract 不成立。自然度 hard gate / 117-level non-A audit 也不存在。

2. **Codex bypass：FAIL**  
   L029 暴露 checker 边界：checker 只验证调用方传入的 `--spoken` 是否出现在 Dialogue quoted lines；没有核对它是否等于 level contract resolved spoken target。结果：误传 `--spoken="We love each other"` 仍可 PASS。

3. **DeepSeek pipeline：门禁代码 PASS，但发布状态 FAIL**  
   checker flag、Dialogue-only count、prompts-only dry-run、single-sample limit、Phase A/B 分离都 fail-closed。问题不在门禁实现，而在内容/证据没有通过门禁。

4. **DeepSeek inventory / Codex release：30 个 r2 saved evidence 陈旧**  
   L007, L009, L010, L012, L013, L015, L016, L018, L019, L020, L021, L023, L024, L026, L027, L028, L029, L030, L032, L035, L036, L037, L038, L040, L041, L043, L044, L045, L048, L050 的 saved `prompt-check.json` / manifest structure details 与 fresh checker 语义不一致。

5. **ZAI L006-L020：FAIL**  
   L012/L013/L014 阻断；L007/L009/L010/L015/L016/L017/L018-L020 hold；仅 L006/L008/L011 prompt-wise advance。

6. **ZAI L021-L050：FAIL**  
   12 关阻断：L029/L030/L031/L035-L038/L043-L045/L048/L050。

7. **MiniMax longform：0 hard prompt-text FAIL，但 35 WARN**  
   MiniMax 认为 45 个 prompt 都达到文本 floor，但 5 个 DELETE、30 个 r2 stale drift、Phase A/B 全阻断仍成立。该意见不能覆盖 ZAI/M3/Codex 的 release blockers。

## 最短下一步

1. 先修 **15 个 must rewrite/remove**，尤其 L012/L014/L029/L050 和 DELETE 5 关。
2. 给 checker / 调用链加 contract target 校验：`--spoken` 必须等于 level resolved `cefrTargetExpression`，否则 L029 类错误会再发生。
3. 30 个 r2 重新保存 fresh `prompt-check.json` 与 manifest `checks.structure.details`，清除 stale evidence。
4. 补 browser/source-level six-layer contract，不能只靠 Node-only attach。
5. textbook verification 45/45 落 artifact。
6. 只选 1 个 clean 候选做单样本，必须先写入 independent prompt QA + `executionApproval={approved:true,scope:"single-sample",approvedBy:"yr"}`。生成后再做 ASR/silent/entailment/userAcceptance。

## 产物索引

- `01-m3-release-gate-audit.md` — FAIL gate audit
- `02-minimax-prompt-rubric-full.md` — 45 prompt full-text rubric
- `03-zai-l006-l020-semantic-audit.md` — L006-L020 semantic FAIL
- `04-zai-l021-l050-semantic-audit.md` — L021-L050 semantic FAIL
- `05-deepseek-pipeline-gates.md` — fail-closed pipeline audit
- `06-deepseek-latest-r-inventory.md` / `.csv` — latest r inventory
- `07-mimo-summary.md` / `.csv` — bulk ledger
- `08-cursor-fresh-prompts-only-run.md` — Cursor dry-run reproduction PASS
- `09-codex-dialogue-count-bypass.md` — Codex bypass FAIL
- `10-codex-release-readiness-crosscheck.md` — Codex release readiness FAIL
- `11-hermes-final-verdict.md` — this final total verdict
