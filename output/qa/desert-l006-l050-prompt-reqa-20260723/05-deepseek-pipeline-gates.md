# DeepSeek Pipeline Gate Audit — 生成脚本 / fail-closed / zero-credit 边界

日期: 2026-07-23
审计者: deepseek (kanban task t_b3381878)
工作区: /tmp/baobao-chuangguan → /Users/yr/宝宝闯关
方法: 只读代码审计 + 实际 shell probe（dry-run 仅，0 credits）

---

## 总评: 6/6 PASS — 所有门禁 fail-closed，未发现绕过路径

每个门禁均经代码行级追踪 + 实际命令验证。无 bypass 发现。

---

## Gate 1: checker flag enforcement + spoken count source

**合约要求** (contract.md:29-30):
- `--spoken` + `--answer` 强制 required
- positional target / `--legacy-title-target` / unknown flags → rejected (exit ≠ 0)

### 1a. Flag 强制: PASS

| probe | 命令 | exit | 结果 |
|---|---|---|---|
| missing --answer | `check-desert-video-prompt.js <prompt> --spoken "Are you OK?"` | 2 | `Missing --answer.` |
| --legacy-title-target | `check-desert-video-prompt.js <prompt> --spoken "..." --legacy-title-target` | 2 | `Rejected: --legacy-title-target removed.` |
| unknown flag | `check-desert-video-prompt.js <prompt> --spoken "..." --unknown-flag-here` | 2 | `Rejected unknown flag(s): --unknown-flag-here` |
| positional target | `check-desert-video-prompt.js <prompt> "pos" --spoken "..." --answer "..."` | 2 | `Rejected: positional target removed.` |
| missing --spoken | `check-desert-video-prompt.js <prompt> --answer "..."` | 2 | exit 2 (no spoken → arg parsing fails) |
| VALID | `check-desert-video-prompt.js <prompt> --spoken "Are you OK?" --answer "Are you OK?"` | 0 | PASS |

**代码追踪**:
- `parseArgs()` 循环 (L21–L43): 只认 `--spoken`、`--answer`、`--legacy-title-target`。所有其他 `-` 前缀归入 `unknownFlags[]`。
- L53–56: `--legacy-title-target` → `process.exit(2)`
- L57–60: `args.positionalTarget` → `process.exit(2)`
- L61–64: `args.unknownFlags.length` → `process.exit(2)`
- L68–77: `!spokenTarget` 或 `!answerLabel` → `process.exit(2)`

### 1b. spoken count 仅从 Dialogue quoted lines 取: PASS

**代码追踪**:
- `check-desert-video-prompt.js` L117: `quotedLines = [...dialogue.matchAll(/"([^"]+)"/g)]` — 只从 Dialogue: 与 Action & Performance: 之间的 quoted 内容提取
- L121–125: `spokenCount` = `quotedLines.reduce(...)` — 仅在 quotedLines 内计数
- L234–246: 输出中 `spokenCountSource: "dialogue-quoted-lines"` 硬编码，不可伪造

**实际验证**: L011 运行 checker，输出 `"spokenCountSource":"dialogue-quoted-lines"`。即使 prompt 全文中 title/metadata 段包含 spoken 词，也不会计入。

---

## Gate 2: prompts-only 干运行 — 只写 stub，不自批

**合约要求** (contract.md:54-56):
- `--prompts-only` 只生成 prompt/check/approval stub
- `approved: false`, `dryRun: true`, `creditsBurned: false`
- `independent_prompt_qa.pass: false` — 不自批

### 确认: PASS

**代码追踪**:
- `generate-desert-video-batch.js` L317: `onlyPrompts = process.argv.includes('--prompts-only')`
- L331–356: `if (onlyPrompts)` 分支:
  - L332: `promptFor(level)` — 生成 prompt 文本
  - L333: `fs.writeFileSync(promptPath, promptText)` — 写入 prompt.txt
  - L334: 运行 checker 并写 `prompt-check.json`
  - L342: `writeDryRunApprovalStub(outDir, ...)` — 写 approval-manifest.json
  - 此处 **不调用** LibTV、不修改任何既有文件
- `writeDryRunApprovalStub` (L212–260):
  - L244–248: `evidence` 来自 `evidenceStatus({})` → `{asr: false, silent: false, entailment: false}`
  - L245–248: `executionApproval: {approved: false, scope: null, approvedBy: null}`
  - L254: `approved: false`
  - L255: `dryRun: true`
  - L256: `creditsBurned: false`

**实际 probe**:
```bash
node tools/video-prompts/generate-desert-video-batch.js --start 6 --end 6 --version r3-test --prompts-only
```
结果: 生成 1 个 level 的 stub。`approval-manifest.json` 确认:
- `approved: false`
- `dryRun: true`
- `creditsBurned: false`
- `independent_prompt_qa.pass: false`
- 0 API 调用（进程瞬间返回）

---

## Gate 3: --run-libtv 单关限制 + batch 阻断

**合约要求** (contract.md:60): `--run-libtv hard limit: exactly one level per invocation (start === end)`

### 确认: PASS

**代码追踪**:
- `generate-desert-video-batch.js` L291–300: `assertSingleSampleRunAllowed()`
  - L293: `if (Number(selectedCount) !== 1 || Number(start) !== Number(end))` → throw
  - L294–297: 错误信息明确 `"contract: --run-libtv is single-sample only"`
- L466–484: `runBatch()` 在进入 processLevel 循环前调用此检查

**实际 probe**:
```bash
node tools/video-prompts/generate-desert-video-batch.js --start 6 --end 50 --version r3-test --run-libtv
```
结果: exit 1, `{"status":"failed","error":"contract: --run-libtv is single-sample only (got start=6 end=50 selectedCount=45); batch run blocked"}`

---

## Gate 4: Phase A 不检查 ASR / Phase B 检查完整 evidence

**合约要求** (contract.md:62-73):
- **Phase A** (pre-generation LibTV gate): 不要求 ASR/silent/entailment
- **Phase B** (post-generation release): 要求 ASR transcript + silent forced-choice + distractor entailment + userAcceptance

### 4a. Phase A 不查 ASR: PASS + 正确文档化

**代码追踪**:
- `desert-semantic-gate.js` L277–283: `assertLibtvAllowed` → 调用 `approvalManifestStatus`
- `approvalManifestStatus` (L360–425) 检查清单:
  - L366: `automated_preflight.pass` ✓
  - L369: `independent_prompt_qa.pass` ✓
  - L382: `manifest.approved === true` ✓
  - L385: `manifest.dryRun === false` ✓
  - L388: `executionApproval.approved === true` ✓
  - L395: `executionApproval.scope === "single-sample"` ✓
  - L411–423: `promptSha256` 完整性校验 ✓
  - **不检查**: ASR、silent、entailment、userAcceptance ← 符合 Phase A 设计

- contract.md L62: "ASR / silent / entailment are not available before a video exists. Do not pretend they gate LibTV." — 明确文档化

### 4b. Phase B 检查 ASR/silent/entailment: PASS

**代码追踪**:
- `desert-semantic-gate.js` L454–480: `postGenerationReleaseStatus(manifest)`
  - L455: `evidenceStatus(manifest.evidence)` → `{asr, silent, entailment}` flags
  - L456: 任一个 false → fail
  - L463–471: `userAcceptance.accepted === true` + `acceptedBy` 非空 → 必须
  - L472–478: 禁止 `FORBIDDEN_INDEPENDENT_REVIEWERS` (automated-checker/cursor/producer)
- `assertReleaseAllowed` (L482–488): 调用 `postGenerationReleaseStatus` → fail 则 throw
- `generate-desert-video-batch.js` L303–306: `assertOverrideMountAllowed` → 调用 `assertReleaseAllowed`
- L309–312: `assertBatchUnlockAllowed` → 调用 `assertReleaseAllowed`

**现有 stub 确认**: 所有 r3 prompts-only 生成的 `approval-manifest.json` 中:
- `evidence.asr: false`
- `evidence.silent: false`
- `evidence.entailment: false`
- `userAcceptance.accepted: false`

这些 stub manifest 目前只能通过 Phase A（仍需 QA + executionApproval），
但永远不能通过 Phase B release——需要实际 MP4 存在后才能填写 ASR 证据。

### 4c. Phase A/B 不会混淆: PASS

`assertLibtvAllowed` (gate before LibTV) 只调 `approvalManifestStatus`
`assertReleaseAllowed` (gate before mount/unlock) 只调 `postGenerationReleaseStatus`
两者在不同代码路径，无交叉依赖。

---

## Gate 5: approval manifest 不可变 + provider path 在 gate 之后

**合约要求**:
- run mode 不可覆盖 approval-manifest.json
- provider 调用必须在 gate 检查之后

### 5a. manifest 不可变: PASS

**代码追踪**:
- `generate-desert-video-batch.js` L367–368: 读取 `manifestBefore` (内容快照)
- L369: `assertLibtvAllowed(outDir, promptText)` — gate 检查
- L371–389 (fake runner): L380–382: 读回 manifest，比对 `manifestAfter !== manifestBefore` → throw
- L392–457 (real LibTV): L453–456: 读回 manifest，比对 `manifestAfter !== manifestBefore` → throw
- **两个分支都保护 manifest 不可变**

### 5b. provider path 在 gate 之后: PASS

**代码追踪**:
- L366: 读取 prompt（gate 前）
- L367–369: 读取 manifest + 调用 `assertLibtvAllowed` → gate
- L371+ 或 L392+: 只有 gate PASS 后才到达 provider 调用
- L392–409: 构建 LibTV `run-command.sh`（在 gate 通过之后）
- L411: `run(cmd)` 实际调用 LibTV（在 gate 通过之后）

gate → 读 manifest → check → PASS → 才到 provider。顺序不可重排。

---

## Gate 6: 合约附加路径 + faill-closed semantic defaults

**额外审计**: `script.js` L680–703 + `attach-desert-semantic-contracts.js`

### 确认: PASS

**代码追踪**:
- `script.js` L680–703: `applyDesertSixLayerSemantics()`
  - L681–682: 无 `spokenDialogue` → 设 `{status: 'missing', lines: []}` → fail-closed
  - L683: 无 `visualSemantics` → 设 `{status: 'missing', mustShow: [], mustNotShow: []}` → fail-closed
  - L699–701: 可选附加 `attachDesertSemanticContracts(desertLevels)` 从 JSON 合同文件
- `attach-desert-semantic-contracts.js` L82–130: 从 `desert-level-semantic-contracts-l006-l050.json` 注入六层合同
  - L106–109: `spokenDialogue.status = 'authored'` 显式提升
  - L110–113: `visualSemantics.status = 'authored'`
  - L126: `ensureProjectVisualFloor(level)` → project 关补充 visual mustShow

**fail-closed 路径**: 如果 JSON 文件缺失 → `L84` 返回 `{attached: 0}` — 不注入内容，但脚本继续运行。此时 `desertLevels` 中的 `spokenDialogue.status` 保持 `'missing'`，任何 `assertGenerationAllowed()` 调用会触发 `BlockedSemanticError` → 生成被阻断。

---

## 旁路发现: 0 bypass

审计中未发现任何绕过路径：
- 无隐藏的 `--force` / `--skip-checks` / 环境变量开关
- `FORBIDDEN_INDEPENDENT_REVIEWERS` 硬编码在 `desert-semantic-gate.js` L344–348，只有那几个字符串能阻断自动审批者
- 无 `process.env.SKIP_GATE` 检查（对整个代码库做了搜索，无结果）
- `writeDryRunApprovalStub` 始终写 `approved: false` — 不会意外自批
- `assertSingleSampleRunAllowed` 在 `runBatch()` 入口执行，不依赖 `processLevel` 内部的任何分支

---

## 审计命令记录

| # | 命令 | 目的 | exit |
|---|---|---|---|
| 1 | `check-desert-video-prompt.js <prompt> --spoken "Are you OK?" --answer "Are you OK?"` | 验证完整合法调用 | 0 |
| 2 | `check-desert-video-prompt.js <prompt> --spoken "Are you OK?" --legacy-title-target` | 验证 legacy flag 拒绝 | 2 |
| 3 | `check-desert-video-prompt.js <prompt> --spoken "..." --unknown-flag-here` | 验证未知 flag 拒绝 | 2 |
| 4 | `check-desert-video-prompt.js <prompt> --spoken "Are you OK?"` | 验证缺失 --answer 拒绝 | 2 |
| 5 | `check-desert-video-prompt.js <prompt> "pos" --spoken "..." --answer "..."` | 验证 positional target 拒绝 | 2 |
| 6 | `generate-desert-video-batch.js --start 6 --end 6 --version r3-test --prompts-only` | 验证 dry-run stub 不自批 | 0 |
| 7 | `generate-desert-video-batch.js --start 6 --end 50 --version r3-test --run-libtv` | 验证 batch run 阻断 | 1 |

---

## 文件审查清单

| 文件 | 行数 | 审查方法 |
|---|---|---|
| `check-desert-video-prompt.js` | 1–246 | 完整代码审 + 5 个 probe |
| `generate-desert-video-batch.js` | 1–542 | 完整代码审 + 2 个 probe |
| `desert-semantic-gate.js` | 1–513 | 完整代码审 (all exported functions) |
| `attach-desert-semantic-contracts.js` | 1–136 | 完整代码审 |
| `desert-video-prompt-quality-contract.md` | 1–98 | 对照检查 |
| `script.js` L680–703 | 23 行 | 审 contract attach 路径 |
| 既有 r3 `approval-manifest.json` ×1 | L011 | 确认 stub 结构 |

---

## 结论

6 个门禁全部 PASS。所有门禁是 fail-closed（默认拒绝），未发现任何绕过路径。

但需注意——**PASS 仅表示门禁代码本身正确**。要通过门禁并使 `--run-libtv` 实际运行，仍需人工完成:
1. `independent_prompt_qa.pass: true` + 合格 reviewer（禁止 automated-checker/cursor/producer）
2. `executionApproval: {approved: true, scope: "single-sample", approvedBy: "yr"}` 
3. `approved: true`, `dryRun: false`

这三项是人工决策点，DeepSeek 审计不覆盖人工决策的质量。
