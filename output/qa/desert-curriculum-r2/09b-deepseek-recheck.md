# DeepSeek R2 二次验证：两阶段零积分与单样本边界

| 项 | 值 |
|---|---|
| **Task** | `t_94e8338a` |
| **Assignee** | deepseek（只读复核，不写码不调 provider） |
| **Date** | 2026-07-23 |
| **Workspace** | `/Users/yr/宝宝闯关` |
| **Upstream** | Cursor 07b PASS → 本卡二次独立复核 |
| **Boundary** | 零 LibTV / 零 Seedance / 零 provider 调用 / 零文件修改 / 零改 45 条 prompt 正文 |

---

## 0. Verdict

**PASS — 全部验证项通过。Cursor 07b 的两阶段门禁和边界阻断真实生效。**

---

## 1. 验证项矩阵

| # | 验证项 | 方法 | 结果 |
|---|--------|------|------|
| V1 | 45 prompt SHA256 不变 | `sha256sum` vs `07b-prompt-sha256-before.txt` diff | **PASS** — diff exit 0，空 diff |
| V2 | positional target 拒绝 | `check-desert-video-prompt.js <prompt> 'friend mind map'` | **PASS** — exit 2，"Rejected: positional target removed" |
| V3 | `--legacy-title-target` 拒绝 | `--legacy-title-target 'friend mind map'` | **PASS** — exit 2，"Rejected: --legacy-title-target removed" |
| V4 | 错 spoken（title 当 spoken）拒绝 | `--spoken 'friend mind map' --answer 'friend mind map'` | **PASS** — exit 1，spokenCount=0（Dialogue-only 计数） |
| V5 | 正确 spoken 通过 | `--spoken 'Look! She is my friend.' --answer 'friend mind map'` | **PASS** — exit 0，spokenCountSource=dialogue-quoted-lines |
| V6 | 缺失 `--spoken` / `--answer` 拒绝 | 代码第 68-77 行 | **PASS** — 二者缺一不可，exit 2 |
| V7 | batch `--run-libtv` 阻断 | `--start 13 --end 14 --version r2 --run-libtv` | **PASS** — exit 1，"single-sample only" |
| V8 | 无 approval 阻断 fake runner | processLevel(id=13, run=true, libtvRunner=fake) | **PASS** — runnerCalls=0，"independent_prompt_qa not passed" |
| V9 | 45/45 manifest fail-closed | programmatic audit | **PASS** — approved=0, executionApproval=0, userAcceptance=0, evidence all false |
| V10 | 零 mp4 / run-command.sh | `find` r2 dirs | **PASS** — 0 个 |
| V11 | 26/26 语义测试 | `node --test desert-semantic-xhigh.test.mjs` | **PASS** |
| V12 | 95/95 全量回归 | `node --test quiz.test.js` | **PASS** |
| V13 | 零 provider 调用 | 本会话零次真实 LibTV/Seedance | **PASS** |

---

## 2. 代码路径审计

### 2.1 Phase A — 生成前闸门（`assertLibtvAllowed` → `approvalManifestStatus`）

代码 `desert-semantic-gate.js:360-425`，充要条件：
- `automated_preflight.pass === true`
- `independent_prompt_qa.pass === true` + reviewer 非空且非禁
- `approved === true`
- `dryRun === false`
- `executionApproval.approved === true` + `scope === "single-sample"` + approvedBy 非空且非禁
- `promptSha256` 匹配 on-disk prompt

**当前 45/45 manifest 均不满足**：`approved=false`、`executionApproval.approved=false`、`independent_prompt_qa.pass=false` → 任何 `--run-libtv` 调用在此处阻断，runnerCalls=0。

ASR/silent/entailment **明确不在 Phase A 检查范围**（代码注释第 358 行："Does NOT require ASR/silent/entailment — those are post-generation release evidence only"）。这纠正了 Codex 08 的"F2 — missing ASR still reaches provider"误判：ASR 不在生成前门中，executionApproval 替代了它的位置。

### 2.2 Phase B — 生成后 release（`postGenerationReleaseStatus`）

代码 `desert-semantic-gate.js:454-480`，充要条件：
- `evidence.asr === true` 或有 asrTranscript 证据
- `evidence.silent === true` 或有 silentForcedChoice 证据
- `evidence.entailment === true` 或有 optionEntailment 证据
- `userAcceptance.accepted === true` + acceptedBy 非空且非禁

**当前 45/45 manifest**：`evidence.*` 全 `false`，`userAcceptance.accepted=false` → `assertReleaseAllowed` / `assertOverrideMountAllowed` / `assertBatchUnlockAllowed` 全阻断。

### 2.3 Single-sample 硬限（`assertSingleSampleRunAllowed`）

代码 `generate-desert-video-batch.js:291-300`：`shouldRun=true` 时强制 `selectedCount===1 && start===end`。已验证 batch 调用（start=13 end=14）被阻断，exit 1。

### 2.4 Checker 强制 `--spoken` + `--answer`（Dialogue-only 计数）

代码 `check-desert-video-prompt.js:57-60`：positional target → exit 2。  
代码第 66-77 行：`--spoken` 和 `--answer` 缺一不可。  
代码第 120-128 行：spokenCount **仅**在 `quotedLines`（Dialogue 区 `"..."` 内）计数，不扫描全 prompt 文本。

---

## 3. 与 Cursor 07b / Codex 08 / DeepSeek 09 的对齐

| 维度 | Codex 08 | Cursor 07b | DeepSeek 09 | **09b（本次）** |
|------|----------|------------|-------------|-----------------|
| positional/legacy 拒绝 | FAIL | PASS | 部分（仅审代码） | **PASS（实跑确认）** |
| Dialogue-only 计数 | FAIL | PASS | 未测 | **PASS（实跑确认）** |
| ASR=生成前门 | FAIL（误判） | PASS（重命名两阶段） | PASS（代码路径审） | **PASS（确认语义正确）** |
| batch run 阻断 | 未测 | PASS | 未测 | **PASS（实跑确认）** |
| executionApproval 单样本门 | — | PASS | PASS | **PASS（实跑确认）** |
| post-gen release 阻断 | — | PASS | 未测 | **PASS（代码路径审）** |
| prompt SHA256 | PASS | PASS | PASS | **PASS（diff 0）** |
| 零副作用 | PASS | PASS | PASS | **PASS（0 mp4/runCmd）** |
| 测试 | 19/19 + 95/95 | 26/26 + 95/95 | 19/19 + 95/95 | **26/26 + 95/95** |

Codex 08 的两个 FAIL（F1 checker bypass、F2 ASR 语义混淆）已在 07b 中**真正修复**，本次二次独立复核确认修复生效。

---

## 4. 审计边界

以下**不在本次复核范围**（属于后续独立 QA 卡）：
- 独立 reviewer 写入 `independent_prompt_qa.pass=true`
- 人工 `executionApproval` 写入（`approvedBy: yr`）
- 真实单样本 `--run-libtv` 生成视频
- ASR / silent / entailment 证据收集
- `desertLevelVideoOverrides` 挂载
- `userAcceptance` 写入
