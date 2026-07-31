# 07 — Mimo 45-Level Bulk Ledger

Generated: 2026-07-23 | Source: contract JSON + r2/r3 approval-manifest.json + prompt-check.json
Workspace: /tmp/baobao-chuangguan (symlink to /Users/yr/宝宝闯关)

---

## Coverage

- **45/45 levels** covered (L006–L050)
- Latest version: **r3**: 15 levels, **r2**: 30 levels
- **0 levels** missing from manifest dirs

## Curriculum Verdict

- **REGENERATE**: 40 levels
- **DELETE**: 5 levels (L013, L014, L030, L031, L048)

## Key Counts

| Metric | Count |
|--------|-------|
| Approved | 0/45 |
| DryRun | 45/45 |
| NeedsTextbookCheck | 45/45 |
| Independent QA pass | 0/45 |
| SHA mismatch | 0/45 |
| Evidence (ASR/Silent/Entailment) all false | 45/45 |
| MP4 files generated | 0 |
| Run commands executed | 0 |

## Risk Breakdown

| Risk | Count |
|------|-------|
| needsTextbookCheck | 45 |
| not-approved | 45 |
| dryRun | 45 |
| no-independent-QA | 45 |
| no-evidence | 45 |
| REGENERATE | 40 |
| DELETE | 5 |

## DELETE Levels (5)

| Level | Title |
|-------|-------|
| L013 | friend mind map |
| L014 | kind words |
| L030 | family tree |
| L031 | add a family photo |
| L048 | animal picture book |

## Top 10 Levels Most Worth Human Review

All 45 levels share the same baseline risk profile (REGENERATE + no approval + no QA + no evidence + dryRun only). The 5 DELETE levels are highest priority because they may need removal or re-scoping. After those, the first 5 REGENERATE levels in the sequence are listed as representative.

| Rank | Level | Title | Verdict | Why |
|------|-------|-------|---------|-----|
| 1 | L013 | friend mind map | DELETE | DELETE + no approval + no QA + no evidence |
| 2 | L014 | kind words | DELETE | DELETE + no approval + no QA + no evidence |
| 3 | L030 | family tree | DELETE | DELETE + no approval + no QA + no evidence |
| 4 | L031 | add a family photo | DELETE | DELETE + no approval + no QA + no evidence |
| 5 | L048 | animal picture book | DELETE | DELETE + no approval + no QA + no evidence |
| 6 | L006 | My name is... | REGENERATE | First level; textbook check needed; r3 spokenCount=1 vs r2 spokenCount=4 |
| 7 | L007 | What's your name? | REGENATE | No r3 yet; textbook check needed |
| 8 | L008 | I'm Chen Jie | REGENERATE | r3 remediation; textbook check needed |
| 9 | L022 | Who lives with you? | REGENERATE | r3 remediation; family unit entry |
| 10 | L025 | I live with my parents | REGENERATE | r3 remediation; family unit mid-point |

## Observations

1. **Zero releases in progress.** All 45 levels are dryRun=True, approved=False. No MP4 files exist in any r2/r3 directory. No run-command.sh scripts found. This is Phase A (pre-generation) state.
2. **All 45 need textbook check.** The contract marks every learningObjective as needsTextbookCheck=true. This is a blocker for Phase B (generation).
3. **SHA integrity: clean.** All 45 levels have manifestShaMatchesPrompt=MATCH. The prompt files on disk match the sha256 recorded in approval-manifest.json.
4. **15 levels have r3 remediation.** These are the ones that went through a second contract pass. The remaining 30 are still at r2.
5. **No independent QA anywhere.** Every approval-manifest has independent_prompt_qa.pass=false with details "awaiting independent Codex/DeepSeek/M3 prompt QA". This is by design — automated checker must not self-approve.
6. **5 DELETE levels need decision.** L013 (friend mind map), L014 (kind words), L030 (family tree), L031 (add a family photo), L048 (animal picture book) are marked DELETE. They still have r2 prompts on disk. Decision needed: remove from pipeline or regenerate with new curriculum.

## Commands Run

- `read_file` on `tools/video-prompts/desert-level-semantic-contracts-l006-l050.json` (2952 lines)
- `search_files` for `desert-level*`, `*manifest*`, `*check*`, `*prompt*` under `output/`
- `read_file` on sample r2/r3 prompt-check.json and approval-manifest.json
- Python script: parsed contract JSON, iterated 45 levels, read all prompt-check.json + approval-manifest.json, computed SHA match, generated CSV

## Blockers

- None for this ledger task. All 45 levels read successfully.
- For Phase B: textbook check on all 45 levels is the primary blocker.
