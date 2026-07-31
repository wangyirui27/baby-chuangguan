# ZAI/GLM Semantic Audit — L021–L050

**Verdict: FAIL — 30/30 structural PASS, but 12 levels have semantic defects that block release.**

Audit date: 2026-07-23
Auditor: glm (ZAI)
Phase: **Phase A (pre-generation)**. No provider calls, no LibTV, no credits. All findings are from reading contracts + prompts + running the structural checker.

---

## Method

1. Read `desert-level-semantic-contracts-l006-l050.json` for L021–L050 (30 levels).
2. Ran `check-desert-video-prompt.js` on every latest-version prompt (r3 > r2 > v1) with `--spoken` + `--answer`.
3. Manually read every prompt's Visual semantic anchors, Dialogue, CEFR Target, and Action & Performance sections.
4. Cross-checked contracts against prompts for: layer independence, CEFR/title/answer alignment, visual specificity, dialogue/answer mixing, and segment progression.

## Commands actually run

```
node tools/video-prompts/check-desert-video-prompt.js <prompt.txt> --spoken <cefrTarget> --answer <answerOption.correct>
```
— 30 invocations, one per level L021–L050. All exited 0 (`ok: true`). This proves structural compliance only.

## Checker results (30/30 structural PASS)

All 30 prompts pass the structural checker: 5 dialogue beats, spoken target found in quoted dialogue lines, required section labels present, negative prompt complete. **Structure PASS ≠ releasable.**

---

## 30-row level-by-level verdict

| LVL | VER | CHK | Semantic | Key issue |
|-----|-----|-----|----------|-----------|
| 021 | r2  | ✓   | PASS     | Family seg; visual anchor is thin Chinese-only ("A 指着爷爷介绍；爷爷有灰发/胡须特征") but functionally sufficient |
| 022 | r3  | ✓   | **PASS** | Asking-only scene well-constructed; 4 concrete English visual anchors; no answer leakage |
| 023 | r2  | ✓   | **WARN** | Visual anchor "画面呈现一个大家庭（5-6 人围坐）" is generic; no contrast cue vs L024 |
| 024 | r2  | ✓   | **WARN** | Visual anchor "画面呈现一个小家庭（2-3 人）" is generic; no contrast cue vs L023 |
| 025 | r3  | ✓   | **PASS** | 4 concrete English visual anchors; declaration gesture well-specified |
| 026 | r2  | ✓   | **WARN** | Visual anchor "孩子指着身旁的姐妹" is 1-line Chinese-only; no sister visual distinction |
| 027 | r2  | ✓   | **WARN** | Visual anchor "孩子指着身旁的兄弟" is 1-line Chinese-only; no brother visual distinction |
| 028 | r2  | ✓   | **WARN** | Visual anchor "孩子拿着家庭合照/画作介绍" is generic; photo vs drawing ambiguous |
| 029 | r2  | ✓   | **FAIL** | CEFR target = "This is my family." but title/answer = "We love each other"; cefrTargetExpression mismatch in contract; visual "家庭成员拥抱/互相微笑" is generic mood |
| 030 | r2  | ✓   | **FAIL** | DELETE project; visual anchors are Chinese craft-description only; "family tree" is a concept, not a natural spoken expression; title cannot be spoken by a child |
| 031 | r3  | ✓   | **FAIL** | DELETE project; CEFR target = "Look! Here is my family." ≠ title "add a family photo"; dialogue line "This is my grandma." assigned to Child B but contract marks it as line 2 — attribution confusion; prompt instruction/answer mismatch |
| 032 | r2  | ✓   | **WARN** | Visual anchor "孩子在纸上/沙地上画家人画像" is 1-line Chinese-only; overlaps L030 concept |
| 033 | r3  | ✓   | **PASS** | 4 concrete English visual anchors; live-family vs tree-prop disambiguation clear |
| 034 | r3  | ✓   | **PASS** | 4 concrete English visual anchors; big-vs-small contrast well-specified |
| 035 | r2  | ✓   | **FAIL** | Visual anchors 2–4 are filler ("speaker face and mouth visible" ×3); anchor 1 "沙漠绿洲中一只小狗，孩子惊喜地指着" is 1-line Chinese-only; animal recognition risk = sticker/decoration |
| 036 | r2  | ✓   | **FAIL** | Same filler pattern; anchor 1 "绿洲中一只小猫" = 6 Chinese characters; no distinguishing action; cat could be any small animal |
| 037 | r2  | ✓   | **FAIL** | Same filler pattern; anchor 1 "绿洲水洼中一条鱼在游" = 1-line; fish recognition OK but no child action specified |
| 038 | r2  | ✓   | **FAIL** | Same filler pattern; anchor 1 "绿洲树上一只鸟" = 6 chars; bird could be decoration; no action |
| 039 | r3  | ✓   | **PASS** | 4 concrete English visual anchors; peer-to-peer listing scene; pet variety visible |
| 040 | r2  | ✓   | **WARN** | Visual anchor "孩子抚摸/指向小狗，面带笑容" is 1-line Chinese-only; generic |
| 041 | r2  | ✓   | **WARN** | Visual anchor "孩子抱着/指着自家的猫" is 1-line Chinese-only; generic |
| 042 | r3  | ✓   | **PASS** | 4 concrete English visual anchors; two-zone pet/wild classification clear |
| 043 | r2  | ✓   | **FAIL** | Same filler pattern; anchor 1 "沙漠远处/山林中的熊猫" = 1-line; panda as distant blob = animal sticker risk |
| 044 | r2  | ✓   | **FAIL** | Same filler pattern; anchor 1 "画面中的大老虎" = 6 chars; no child interaction; tiger as backdrop |
| 045 | r2  | ✓   | **FAIL** | Same filler pattern; anchor 1 "画面中的大象" = 6 chars; elephant as decoration |
| 046 | r3  | ✓   | **PASS** | 4 concrete English visual anchors; monkey action (climb/swing) specified; animal-noise ban included |
| 047 | r3  | ✓   | **PASS** | 4 concrete English visual anchors; wild-only animal list; peer listing scene |
| 048 | r2  | ✓   | **FAIL** | DELETE project; visual anchors are Chinese craft-description only; "animal picture book" is not a spoken expression; title cannot be spoken |
| 049 | r3  | ✓   | **PASS** | 4 concrete English visual anchors; standalone-sheet vs book disambiguation clear |
| 050 | r2  | ✓   | **FAIL** | L050 contradicts L049: L049 bans "picture book" but L050 says "在图画书的野生动物页上画"; L050 sourceSituation = "Add a wild animal page" implies book continuation; contract learningObjective references 图画书; visual anchor is 1-line Chinese-only |

---

## Defect categories

### A. Must rewrite before any generation (12 levels)

**L029** — CEFR target / answer mismatch
- Contract `cefrTargetExpression = "This is my family."` but `answerOption.correct = "We love each other"` and `title = "We love each other"`.
- The prompt's CEFR Target section says focus is "This is my family." — this is L028's target, not L029's.
- **Root cause**: contract author reused L028's cefrTargetExpression. The spoken dialogue does contain "We love each other" (line 3), but it was not selected as the cefrTargetExpression.
- **Fix**: set `cefrTargetExpression = "We love each other."` in the contract, regenerate prompt.

**L030** (DELETE) — project product name, not speakable
- Title "family tree" is a noun-label / project artifact. A child cannot say "family tree" as natural Pre-A1 speech.
- Visual anchors are Chinese craft-process descriptions only.
- **Fix**: per curriculum verdict DELETE, this level should be removed or fully rewritten with a speakable expression.

**L031** (DELETE) — instruction/answer mismatch + dialogue attribution
- Title "add a family photo" is a project instruction, not a spoken expression.
- CEFR target = "Look! Here is my family." ≠ title.
- Dialogue line 2 "This is my grandma." is marked as Child B's line in the prompt but is grammatically Child A's (A is showing the photo). Attribution confusion.
- **Fix**: per curriculum verdict DELETE, remove or rewrite.

**L035–L038** (pet nouns) — animal sticker risk
- L035 "沙漠绿洲中一只小狗，孩子惊喜地指着" — visual anchor is 1 short Chinese line.
- L036 "绿洲中一只小猫" — 6 chars, no action.
- L037 "绿洲水洼中一条鱼在游" — 1 line, no child interaction specified.
- L038 "绿洲树上一只鸟" — 6 chars, no action.
- Anchors 2–4 are identical filler: "speaker face and mouth visible in front or three-quarter view" repeated 3×.
- **Risk**: text-to-video model will produce a decorative animal (sticker/blob) with no clear connection to the spoken word. Silent-viewer test will fail because "a cat in an oasis" looks like any small animal.
- **Fix**: rewrite visual anchors with species-distinguishing action (dog wags tail, cat licks paw, fish swims in water bowl, bird flies from branch). Minimum 2 concrete English anchors per level.

**L043–L045** (wild animal nouns) — same animal sticker risk
- L043 "沙漠远处/山林中的熊猫" — distant panda = unrecognizable blob.
- L044 "画面中的大老虎" — 6 chars, no child interaction.
- L045 "画面中的大象" — 6 chars, elephant as decoration.
- Same filler pattern as L035–L038.
- **Fix**: rewrite with species-distinguishing action (panda eating bamboo, tiger stripes visible, elephant trunk). L043 dialogue already says "eating bamboo" — visual anchor must match.

**L048** (DELETE) — project product name, not speakable
- Title "animal picture book" is a noun-label. Not natural child speech.
- Visual anchors are Chinese craft-process descriptions.
- **Fix**: per curriculum verdict DELETE, remove or rewrite.

**L050** — contradicts L049, book-reference inconsistency
- L049 `mustNotShow` explicitly bans "picture book, 图画书, book page, page-turning, album, our book".
- L050 `learningObjective` says "学会在图画书的野生动物页上画一种野生动物" and `questionTask.learnerAction` = "Add a wild animal page."
- L050 `visualSemantics.mustShow[0]` = "孩子在图画书的野生动物页上画一只老虎/大象".
- **Contradiction**: L049 and L050 are adjacent levels (same unit). L049 says "draw on a standalone sheet, NOT a book". L050 says "draw on a book page". These cannot both be correct.
- **Fix**: decide whether L050 is a book-page activity or standalone. If standalone (consistent with L049), rewrite learningObjective + visual anchors + source situation. If book, then L049's ban needs a scope exception.

### B. Can ship single sample but visual anchors are thin (8 levels)

L021, L023, L024, L026, L027, L028, L032, L040, L041 — visual semantic anchors contain only 1-line Chinese descriptions with no English action specification. These will likely generate acceptable video but carry elevated silent-viewer-test risk. The r3 versions of sibling levels (L022, L025, L033, L034) demonstrate the target quality: 4 concrete English anchors with specific gestures and disambiguation.

**Recommendation**: upgrade to r3 with expanded English visual anchors before batch generation, but single-sample generation is acceptable for evaluation.

### C. Clean for single-sample generation (10 levels)

L022, L025, L033, L034, L039, L042, L046, L047, L049 — these have 4 concrete English visual anchors, clear disambiguation, and no layer-mixing issues. They match the L001/L002 quality bar.

---

## Segment progression check

### Family segment (L021–L034)
- L021 (grandpa) → L022 (who lives with you) → L023/L024 (big/small family) → L025 (live with parents) → L026/L027 (sister/brother) → L028 (this is my family) → L029 (we love each other): **progression is logical**.
- L030 (family tree) → L031 (add photo) → L032 (draw family) → L033 (talk about family) → L034 (different families): **L030/L031 are DELETE verdicts and break the chain**. L032–L034 recover with concrete scenes.
- **Issue**: L029 CEFR target mismatch breaks the emotional climax of the family segment.

### Pet segment (L035–L042)
- L035 (dog) → L036 (cat) → L037 (fish) → L038 (bird) → L039 (what pets do you know) → L040 (I like dogs) → L041 (I have a cat) → L042 (is it a pet?): **progression is logical**.
- **Issue**: L035–L038 visual anchors are critically thin. The recognition nouns (dog/cat/fish/bird) become interchangeable decorations without species-specific action. L039 (r3) and L042 (r3) are well-constructed.
- **No题目/答案/台词/画面混层 found** in the pet segment. Dialogue lines are natural and independent from answer labels.

### Wild animal segment (L043–L050)
- L043 (panda) → L044 (tiger) → L045 (elephant) → L046 (monkey) → L047 (what wild animals) → L048 (animal picture book) → L049 (draw a pet) → L050 (draw a wild animal): **progression has a structural break**.
- L046 (r3) and L047 (r3) are well-constructed with concrete English anchors.
- L043–L045 have the same thin-anchor problem as L035–L038.
- L048 is DELETE verdict.
- L049 → L050 transition has the book/standalone contradiction.
- **No题目/答案混层** in the wild segment; L043–L046 dialogue correctly uses "Look! A [animal]!" pattern, not title-as-dialogue.

---

## Layer independence check

Six layers checked per level: learningObjective, questionTask, spokenDialogue, visualSemantics, answerOption, videoPromptInput.

- **No title-autofill dialogue found**: all 30 levels have `spokenCount ≥ 1` from dialogue-quoted lines, not title/metadata.
- **No answer-option leakage into dialogue**: answer labels appear in Dialogue only when they ARE the spoken target (A-class titles). Project levels (C-class) correctly keep the answer label out of dialogue.
- **L029 is the one exception**: the cefrTargetExpression is wrong, creating a soft layer entanglement where the "focus" line belongs to a different level.

---

## Phase A / Phase B distinction

This audit is **Phase A only** (pre-generation). Findings are about prompt/contract quality before any video exists.

Phase B evidence (ASR transcript alignment, silent forced-choice, distractor entailment, human userAcceptance) is **not available** and **not assessed**. None of these prompts have generated MP4s yet.

The `postGenerationReleaseStatus` gate will fail-closed for all 30 levels until Phase B evidence is produced — this is by design, not a defect.

---

## Summary grouping

### Must rewrite contract + prompt before generation (5 levels)
- **L029**: fix cefrTargetExpression → "We love each other."
- **L030**: DELETE verdict — remove or rewrite with speakable expression
- **L031**: DELETE verdict — remove or rewrite; fix dialogue attribution
- **L048**: DELETE verdict — remove or rewrite with speakable expression
- **L050**: fix L049/L050 book contradiction; decide standalone vs book

### Must rewrite prompt visual anchors before generation (7 levels)
- **L035, L036, L037, L038**: rewrite with species-specific action anchors (pet segment)
- **L043, L044, L045**: rewrite with species-specific action anchors (wild segment)

### Can proceed to single-sample generation (10 levels)
- **L022, L025, L033, L034, L039, L042, L046, L047, L049** — clean
- (L021 is borderline but acceptable for evaluation)

### Upgrade recommended before batch (8 levels)
- **L021, L023, L024, L026, L027, L028, L032, L040, L041** — thin visual anchors, acceptable for single-sample but not batch

---

## Unverified items

- No MP4 exists for any L021–L050 level. All visual-anchor risk assessments are predictive, not confirmed by actual generation.
- The `approval-manifest.json` files in r2/r3 directories were not individually audited for `executionApproval` status — this audit focused on prompt/contract semantics, not approval-chain completeness.
- The `generate-desert-video-batch.js` tool was not run (by design — `--prompts-only` would still be a dry-run; no new prompts were generated in this audit).
