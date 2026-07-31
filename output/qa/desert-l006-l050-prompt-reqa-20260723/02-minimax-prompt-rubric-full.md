- L038 r2 — WARN — saved prompt-check.json field drift vs fresh checker: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- L040 r2 — WARN — saved prompt-check.json field drift vs fresh checker: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- L041 r2 — WARN — saved prompt-check.json field drift vs fresh checker: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- L043 r2 — WARN — saved prompt-check.json field drift vs fresh checker: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- L044 r2 — WARN — saved prompt-check.json field drift vs fresh checker: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- L045 r2 — WARN — saved prompt-check.json field drift vs fresh checker: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1
- L048 r2 [DELETE] — WARN — DELETE-level: scene mustShow coverage 4/5
- L050 r2 — WARN — saved prompt-check.json field drift vs fresh checker: spokenCount: saved=4 fresh=1; spokenCountSource: saved=None fresh='dialogue-quoted-lines'; targetCount: saved=4 fresh=1

## Commands and Files Actually Read

| Step | Path / command | What |
|---|---|---|
| 1 | tools/video-prompts/desert-video-prompt-quality-contract.md | Quality contract — section list, non-negotiable rules, two-phase gates |
| 2 | tools/video-prompts/desert-level-semantic-contracts-l006-l050.json | Per-level learningObjective / questionTask / spokenDialogue / visualSemantics / answerOption / videoPromptInput (45 records, key = levelId) |
| 3 | output/qa/desert-l006-l050-prompt-reqa-20260723/06-deepseek-latest-r-inventory.csv | Latest strict r2/r3 prompt path + fresh checker output per level (45 rows) |
| 4 | output/media-production/desert-level-NNN-*-r2|r3/prompts/level-NNN-*-r2|r3.txt (45 files) | Full prompt text read for semantic QA |
| 5 | output/qa/.../01-m3-release-gate-audit.md, 10-codex-release-readiness-crosscheck.md | Pre-existing cross-card audit findings (Phase A/B blockers, saved drift inventory) — used to confirm my own read of the data |

Files written by this card: only 02-minimax-prompt-rubric-full.md. No prompt files, no manifests, no source under script.js / tools/video-prompts/** were modified.

## Side Effects

- Provider calls: 0 (no --run-libtv, no LibTV, no Seedance, no ASR, no payment provider)
- Prompt files written: 0
- Manifests updated: 0
- Source code modified: 0
- Files written: 1 (output/qa/desert-l006-l050-prompt-reqa-20260723/02-minimax-prompt-rubric-full.md)

## Not Done / Out of Scope

- Did not regenerate any prompt (no --prompts-only run). All 45 read are the latest-existing prompts.
- Did not run check-desert-video-prompt.js — pre-existing fresh runs in card 06-deepseek-latest-r-inventory.csv are the source of spokenCount and field-drift facts.
- Did not inspect MP4 / silent / ASR / entailment evidence because none exists for these 45 levels (0/45 in card 01-m3-release-gate-audit.md).
- Did not modify the 6-layer source model in script.js; browser-attach path is unchanged.
- Did not sign any independent approval or execution approval.

## Blocking Items for Human Sign-Off

1. Approve independent_prompt_qa on all 45. This card per-level semantic read is the MiniMax-side QA. Codex (09-codex-dialogue-count-bypass.md) and DeepSeek (05-deepseek-pipeline-gates.md) have already signed structure; the consolidated human pass is still missing.
2. Decide DELETE-level disposition. L013/L014/L030/L031/L048: keep DELETE and skip generation, or re-author dialogue timing so CEFR line fires when artifact is used.
3. Re-save prompt-check.json on 30 r2 levels to clear the saved-vs-fresh drift (data fix only).
4. Textbook verification for the 45 contract records flagged needsTextbookCheck=true — no artifact exists.
5. Cost-safety reconciliation — required 08-cost-safety.md is absent.
6. L006/L008 curriculum decision on placeholder titles (D and E categories per the contract).