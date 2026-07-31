# FAIL

## Evidence Table

| Gate | Fresh evidence | Verdict |
|---|---|---|
| Source metadata / six layers | `script.js:27-41` still maps five row fields (`title`, `zhTitle`, `questionType`, `pepPart`, `transferProbe`). `script.js:680-705` adds six-layer defaults afterward and loads authored contracts only behind Node/CommonJS `module` + `require`; browser execution cannot load the JSON attachment and therefore retains `spokenDialogue.status=missing` / `visualSemantics.status=missing` for L006-L050. | FAIL |
| Six-layer TDD evidence | Fresh `node --test tools/video-prompts/desert-semantic-xhigh.test.mjs` passed 26/26. Tests cover semantic canaries, L013/L014, project template independence, missing-data fail-closed, manifest approval/hash gates, checker CLI and Phase B release blocking. Fresh `git log --all --oneline --grep='\[RED\]\|\[GREEN\]'` returned no commits. The suite is useful regression evidence but does not prove six independently authored source-layer fields or the required RED→GREEN history. | FAIL |
| L017 / all 117 non-A naturalness hard gate | Fresh source scan found zero `naturalnessGrade` references across `script.js`, checker, and semantic gate. No 117-level audit exists. Current `evaluateNaturalDialogue` is a generic placeholder/noun-label check, not the specified `naturalnessGrade !== 'A'` rule. | FAIL |
| Phase A prompt structure, reproducibility | Selected latest R3 where present, otherwise R2, for exactly L006-L050 (45 levels). Fresh checker with mandatory `--spoken` and `--answer` exited 0 for 45/45. Prompt SHA256 matched manifest for 45/45. However saved `checks.structure.details` matched fresh checker output for 0/45: all L006-L050 manifests are stale as recorded. | FAIL |
| Phase A independent approval | Across selected 45 manifests: `independent_prompt_qa.pass=true` 0/45; `executionApproval.approved=true` 0/45; `approved=true` 0/45; all remain dry-run. Structure PASS therefore does not authorize a LibTV call. | BLOCKED |
| Phase B release evidence | Across selected 45 manifests: ASR true 0/45, silent true 0/45, entailment true 0/45, accepted userAcceptance 0/45. Repository search found 0 `audio-transcript*`, 0 `qa-signoff*`, and no silent/entailment evidence artifact. `assertReleaseAllowed` exists and tests fail-closed, but no level satisfies it. | BLOCKED |
| Cost safety | Required `output/qa/desert-curriculum-r2/08-cost-safety.md` is absent and no replacement cost-safety evidence exists in this round. This audit invoked no provider and generated no prompt/video. Existing repository media cannot be used as zero-cost proof for earlier runs. | FAIL |
| Textbook verification | Contract JSON contains 45 L006-L050 records and all 45 have `learningObjective.needsTextbookCheck=true`. Repository search found 0 textbook verification artifact. | FAIL |

## Blocking Findings

1. Phase A is blocked before generation: the canonical source remains five-field metadata plus a Node-only contract attachment. Browser runtime does not receive the authored six-layer contract.
2. Phase A is blocked before generation: 45/45 selected manifests lack independent prompt QA and explicit single-sample execution approval.
3. The required naturalness release gate is absent: no `naturalnessGrade`, no L017-specific non-A protection, and no 117-level non-A audit.
4. The test suite passes 26/26 but is not proof of the required six-field source model or RED→GREEN history.
5. Saved checker evidence is stale for every reviewed level: L006, L007, L008, L009, L010, L011, L012, L013, L014, L015, L016, L017, L018, L019, L020, L021, L022, L023, L024, L025, L026, L027, L028, L029, L030, L031, L032, L033, L034, L035, L036, L037, L038, L039, L040, L041, L042, L043, L044, L045, L046, L047, L048, L049, L050. Fresh checks pass, but saved `checks.structure.details` are not reproducible byte-for-byte.
6. Phase B is blocked for all 45 levels: no ASR transcript alignment, silent forced-choice evidence, distractor entailment evidence, or human user acceptance exists.
7. Cost reconciliation is undelivered, and all 45 textbook-check flags remain unresolved.

## Commands Actually Run

- `node --test tools/video-prompts/desert-semantic-xhigh.test.mjs` → 26 tests, 26 pass, 0 fail.
- Offline Node audit selecting latest R3 else R2 for L006-L050 and invoking `check-desert-video-prompt.js <prompt> --spoken <manifest.spokenTarget> --answer <manifest.level.title>` → 45/45 exit 0; 45/45 SHA256 match; 0/45 saved structure details equal fresh output.
- Offline manifest inventory over those 45 selected levels → 0 independent approvals, 0 execution approvals, 0 user acceptances, 0 true ASR/silent/entailment flags.
- Contract JSON inventory → 45/45 `needsTextbookCheck=true`.
- Repository artifact searches for textbook, qa-signoff, audio-transcript, silent, entailment, and `08-cost-safety.md` → no qualifying artifacts.
- `git log --all --oneline --grep='\[RED\]\|\[GREEN\]'` → no matching commits.
- Source scan for `naturalnessGrade` in source/checker/gate → 0 references.

## Not-in-scope

- No source, prompt, manifest, or media-production file was modified.
- No `--run-libtv`, LibTV, Seedance, ASR provider, or paid generation was invoked.
- No prompt regeneration was run; provider credits and generation side effects from this audit are exactly zero.
- Existing MP4/media quality was not inspected because this card is prompt/manifest release-gate QA; their presence does not replace per-level Phase B evidence.
