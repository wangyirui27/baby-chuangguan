# FAIL

日期: 2026-07-23
审计者: Codex gpt-5.5/xhigh 席
工作区: `/tmp/baobao-chuangguan` -> `/Users/yr/宝宝闯关`
范围: 只读代码 / prompt / manifest；未改 `script.js`、`tools/video-prompts/**`、`output/media-production/**`。

## 结论

结构 checker 的基础防绕过是有效的：位置 target、`--legacy-title-target`、缺 `--spoken`、缺 `--answer`、unknown flag 全部 fail-closed；`spokenCountSource` 全部来自 `dialogue-quoted-lines`。

但本轮按 FAIL 优先：L029 暴露了调用方误传 `--spoken=<title>` 时仍可 PASS 的风险，因为 title/answer 真实出现在 Dialogue quoted line 里一次，而 checker 不与 L029 合同里的 `spokenDialogue.cefrTargetExpression` 交叉核对。另：所有样本的 Phase A LibTV 执行门禁仍 blocked，Phase B release 证据仍 blocked；结构 PASS 不等于可生成或可发布。

## 样本

按现有 r3 优先、无 r3 则 r2 取样：

| Level | Type | Prompt | Contract spoken | Answer/title |
|---|---|---|---|---|
| L006 | situation | `output/media-production/desert-level-006-my-name-is-r3/prompts/level-006-my-name-is-r3.txt` | `My name is Tom.` | `My name is...` |
| L007 | dialogue | `output/media-production/desert-level-007-what-s-your-name-r2/prompts/level-007-what-s-your-name-r2.txt` | `What's your name?` | `What's your name?` |
| L013 | project | `output/media-production/desert-level-013-friend-mind-map-r2/prompts/level-013-friend-mind-map-r2.txt` | `Look! She is my friend.` | `friend mind map` |
| L014 | project | `output/media-production/desert-level-014-kind-words-r3/prompts/level-014-kind-words-r3.txt` | `Here you go.` | `kind words` |
| L029 | situation | `output/media-production/desert-level-029-we-love-each-other-r2/prompts/level-029-we-love-each-other-r2.txt` | `This is my family.` | `We love each other` |
| L030 | project | `output/media-production/desert-level-030-family-tree-r2/prompts/level-030-family-tree-r2.txt` | `Look! This is me.` | `family tree` |
| L031 | project | `output/media-production/desert-level-031-add-a-family-photo-r3/prompts/level-031-add-a-family-photo-r3.txt` | `Look! Here is my family.` | `add a family photo` |
| L047 | dialogue | `output/media-production/desert-level-047-what-wild-animals-do-you-know-r3/prompts/level-047-what-wild-animals-do-you-know-r3.txt` | `What wild animals do you know?` | `What wild animals do you know?` |
| L048 | project | `output/media-production/desert-level-048-animal-picture-book-r2/prompts/level-048-animal-picture-book-r2.txt` | `Look! A dog!` | `animal picture book` |

## Probe 矩阵

每个样本跑 7 个 checker probe，共 63 次。`correct` 全部 exit 0，输出均为 `spokenCountSource: dialogue-quoted-lines`、`dialogueLines: 5`、`spokenCount: 1`。

| Level | whole title hits / Dialogue title hits | correct `--spoken/--answer` | title as spoken | positional target | legacy target | missing spoken | missing answer | unknown flag |
|---|---:|---|---|---|---|---|---|---|
| L006 | 3 / 0 | PASS(0) | FAIL(1), Dialogue count 0 | FAIL(2) | FAIL(2) | FAIL(2) | FAIL(2) | FAIL(2) |
| L007 | 8 / 1 | PASS(0) | PASS(0), benign: title is contract spoken | FAIL(2) | FAIL(2) | FAIL(2) | FAIL(2) | FAIL(2) |
| L013 | 3 / 0 | PASS(0) | FAIL(1), Dialogue count 0 | FAIL(2) | FAIL(2) | FAIL(2) | FAIL(2) | FAIL(2) |
| L014 | 6 / 0 | PASS(0) | FAIL(1), Dialogue count 0 | FAIL(2) | FAIL(2) | FAIL(2) | FAIL(2) | FAIL(2) |
| L029 | 4 / 1 | PASS(0) | PASS(0), risk: wrong spoken accepted from Dialogue hit | FAIL(2) | FAIL(2) | FAIL(2) | FAIL(2) | FAIL(2) |
| L030 | 6 / 0 | PASS(0) | FAIL(1), Dialogue count 0 | FAIL(2) | FAIL(2) | FAIL(2) | FAIL(2) | FAIL(2) |
| L031 | 3 / 0 | PASS(0) | FAIL(1), Dialogue count 0 | FAIL(2) | FAIL(2) | FAIL(2) | FAIL(2) | FAIL(2) |
| L047 | 7 / 1 | PASS(0) | PASS(0), benign: title is contract spoken | FAIL(2) | FAIL(2) | FAIL(2) | FAIL(2) | FAIL(2) |
| L048 | 4 / 0 | PASS(0) | FAIL(1), Dialogue count 0 | FAIL(2) | FAIL(2) | FAIL(2) | FAIL(2) | FAIL(2) |

Probe 汇总: checker invocations 63；exit 0 共 12；exit 非 0 共 51。非 0 包含 6 个 title-as-spoken reject、9 个 positional reject、9 个 legacy reject、9 个 missing-spoken reject、9 个 missing-answer reject、9 个 unknown-flag reject。

## Dialogue-only / Metadata 计数

验证结果: whole-prompt metadata/title 出现不算 spoken。证据是 L006/L013/L014/L030/L031/L048 的 title 在全文出现 3-6 次，但 Dialogue quoted lines 中出现 0 次；把 title 当 `--spoken` 传入时均 exit 1，错误为 `spoken expression appears too few times in Dialogue quoted lines: 0`。

L029 不是 metadata 计数绕过：它的 title 在 Dialogue quoted lines 中真实出现 1 次，所以 checker 通过了错误的 `--spoken="We love each other"`。这说明 checker 当前验证的是调用方传入的 spoken 字符串是否在 Dialogue 中出现，而不是验证该字符串是否等于 level contract 的 resolved spoken target。

## Project Title Chant

对 L013/L014/L030/L031/L048 构造 synthetic project spokenDialogue：`[title, title, title, "Good.", title]`，未写入任何 prompt。`titleAutofillLineCount` 均为 4，`evaluateSpokenDialogue` 均返回 fail：

| Level | title | autofill count | gate |
|---|---|---:|---|
| L013 | `friend mind map` | 4 | FAIL: title autofill blocked |
| L014 | `kind words` | 4 | FAIL: title autofill blocked |
| L030 | `family tree` | 4 | FAIL: title autofill blocked |
| L031 | `add a family photo` | 4 | FAIL: title autofill blocked |
| L048 | `animal picture book` | 4 | FAIL: title autofill blocked |

备注: `evaluateNaturalDialogue` 单独不是完整保护层，L013/L031 的 synthetic chant 在 natural gate 上未拦住；真正拦截来自 `evaluateSpokenDialogue` 的 title-autofill >= 3 规则。

## Phase A / Phase B 状态

9/9 样本都有 `prompt-check.json` 和 `approval-manifest.json`。9/9 `automated_preflight.pass=true`、`dryRun=true`、`creditsBurned=false`。

Phase A pre-generation structure: 9/9 checker PASS。

Phase A LibTV execution gate: 9/9 BLOCKED。原因一致：`independent_prompt_qa not passed (checker must not self-approve)`；同时 `approved=false`、`executionApproval.approved=false`。

Phase B release gate: 9/9 BLOCKED。原因一致：ASR/silent/entailment evidence incomplete；9/9 `asr=false`、`silent=false`、`entailment=false`。未验证 MP4 画面、ASR、silent forced-choice、distractor entailment、human userAcceptance。

## 实际跑过的命令

- 只读文件: `rtk sed -n ... tools/video-prompts/check-desert-video-prompt.js`、`rtk sed -n ... tools/video-prompts/lib/desert-semantic-gate.js`、`rtk sed -n ... tools/video-prompts/generate-desert-video-batch.js`、`rtk sed -n ... tools/video-prompts/desert-video-prompt-quality-contract.md`、`rtk sed -n ... script.js`。
