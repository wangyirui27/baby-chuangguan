# FAIL

45 关汇总：L006-L050 最新严格 `rN` 覆盖 45/45，其中 latest r3=15、latest r2=30。fresh checker 45/45 PASS；release readiness 0/45 PASS。30 个 latest r2 的 saved `prompt-check.json` / approval manifest 内嵌 structure details 与 fresh checker 不一致，15 个 latest r3 与 fresh checker 一致。

## Verdict

结构 PASS 不等于可发布。当前状态：

- Phase A（生成前）：45/45 prompt SHA 匹配、45/45 structure checker fresh PASS；但 45/45 `approved=false`、`dryRun=true`、`independent_prompt_qa.pass=false`、`executionApproval.approved=false`。因此 45/45 不允许 LibTV/Seedance 执行。
- Phase B（生成后 release）：45/45 无 MP4、无 ASR、无 silent forced-choice、无 option entailment、无 `userAcceptance`。因此 45/45 不允许 release / override mount / batch unlock。
- 本轮没有调用 provider，没有执行 `--run-libtv`，没有生成新 prompt。

## Commands Run

只读命令；唯一写入是本报告。

| Purpose | Command / actual invocation |
|---|---|
| Read contract/checker/generator/gate | `rtk sed -n ... tools/video-prompts/check-desert-video-prompt.js`, `generate-desert-video-batch.js`, `lib/desert-semantic-gate.js`, `desert-video-prompt-quality-contract.md` |
| Locate latest r-version dirs | `rtk node - <<'NODE'` enumerating `output/media-production` with `^desert-level-(\\d{3})-.+-r(\\d+)$`, selecting max `r` for L006-L050 |
| Fresh checker x45 | Inline Node loop invoking `node tools/video-prompts/check-desert-video-prompt.js <absolute prompt> --spoken <approval-manifest.spokenTarget> --answer <approval-manifest.level.title>` once per latest level |
| Compare saved vs fresh | Same inline Node loop comparing fields `ok,promptPath,spokenTarget,answerLabel,spokenCount,spokenCountSource,dialogueLines,chars,targetExpression,targetCount` |
| Approval/side-effect audit | Same inline Node loop reading `approval-manifest.json`, SHA256, `*.mp4`, `run-command.sh`, root `manifest.json` |
| Source/browser attach probe | `rtk node` requiring `./script.js`, then `rtk node` VM-running `script.js` without `module/require/document` |
| Evidence file search | `rtk proxy find output/qa output/media-production tools -type f (...)` for textbook, ASR, silent, entailment, `qa-signoff.yaml`, `08-cost-safety.md` |
| Old gate source scans | `rtk rg -n "naturalnessGrade|non-A|117|hard gate" ...`; `rtk git log --all --grep='\\[RED\\]\\|\\[GREEN\\]' --oneline -- script.js tools/video-prompts` |

## Fresh Checker vs Saved

Fresh checker result: 45/45 exit 0. `prompt-check.json` equals `approval-manifest.json.checks.structure.details` for 45/45, so stale structure evidence is duplicated into the manifest, not a separate disagreement between those two saved files.

Inconsistent saved fields:

- 30/45 levels: `spokenCount`, missing saved `spokenCountSource`, and `targetCount`.
- 15/45 levels: no compared field drift after using absolute prompt paths.

Stale levels: L007, L009, L010, L012, L013, L015, L016, L018, L019, L020, L021, L023, L024, L026, L027, L028, L029, L030, L032, L035, L036, L037, L038, L040, L041, L043, L044, L045, L048, L050.

## Approval Manifest Audit

| Check | Result |
|---|---:|
| latest r-version dirs | 45/45 |
| promptSha256 matches current prompt | 45/45 |
| saved `prompt-check.json` equals manifest structure details | 45/45 |
| `approved=true` | 0/45 |
| `dryRun=true` | 45/45 |
| `independent_prompt_qa.pass=true` | 0/45 |
| `executionApproval.approved=true` | 0/45 |
| `userAcceptance.accepted=true` | 0/45 |
| ASR evidence present | 0/45 |
| silent forced-choice evidence present | 0/45 |
| option entailment evidence present | 0/45 |

Sample gate probe on L006 r3:

- Phase A: blocked, `contract: independent_prompt_qa not passed (checker must not self-approve)`.
- Phase B: blocked, `ASR/silent/entailment evidence incomplete`.

## Side Effects

Scoped to latest strict r2/r3 dirs for L006-L050:

| Artifact | Count | Levels |
|---|---:|---|
| `*.mp4` | 0 | none |
| `run-command.sh` | 0 | none |
| production root `manifest.json` | 0 | none |

No provider command was run by this audit. Older v1 media dirs were not used for this release-readiness decision.

## Old FAIL Recheck

| Old blocking item | Current evidence | Reproduced? |
|---|---|---|
| Source-level six-field model not authored in `script.js` rows | `script.js:27-41` still maps five-field rows `[title, zhTitle, questionType, pepPart, transferProbe]`. | YES |
| Browser source-level issue | `script.js:676-705` defaults `spokenDialogue/visualSemantics` to `missing`; Node-only `require('./tools/video-prompts/lib/attach-desert-semantic-contracts.js')` attaches contracts. VM browser-like probe without `module/require` returned L006/L013/L050 `spokenStatus=missing`, `visualStatus=missing`. | YES |
| Node attach works but does not prove browser release | `require('./script.js')` returned L006/L013/L050 `spokenStatus=authored`, `visualStatus=authored`, `needsTextbookCheck=true`. | YES, Node-only |
| Textbook verification missing | Contract JSON has 45/45 `learningObjective.needsTextbookCheck=true`; evidence search found no textbook verification artifact. | YES |
| ASR/silent/entailment missing | Evidence search found no `audio-transcript.json`, silent forced-choice, or entailment artifact; manifest flags are 0/45. | YES |
