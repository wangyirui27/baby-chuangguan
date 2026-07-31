# FAIL

## Fresh verification

- PASS — `node --test tools/video-prompts/desert-semantic-xhigh.test.mjs`: 26/26.
- PASS — `npm test`: 326/326.
- PASS — canonical R2 prompts: 45/45 checker exit 0.
- PASS — canonical R2 prompt SHA256: 45/45 matches each approval manifest.
- PASS — checker bypass probes: positional exit 2, legacy exit 2, wrong spoken target exit 1, correct spoken target exit 0.
- PASS — `--run-libtv --start 13 --end 14`: batch blocked, exit 1.
- PASS — R2 production side effects: 0 MP4, 0 `run-command.sh`, 0 production `manifest.json`.
- PASS — 45/45 approval manifests remain fail-closed: `approved=false`, `dryRun=true`, `independent_prompt_qa.pass=false`, `executionApproval.approved=false`, `userAcceptance.accepted=false`, ASR/silent/entailment all false.

## Blocking FAIL findings

- FAIL — six-field data model is not authored in the source metadata layer. `script.js:27-41` still builds `desertPhraseUnits` from five-field rows; the six-layer objects are attached later by a Node-only contract attachment path. The browser path explicitly keeps `status=missing`. This does not satisfy the acceptance contract's source-level `DesertLevelContent` requirement.
- FAIL — TDD red-green contract is not evidenced. Fresh `git log --all --grep='[RED]\|[GREEN]'` returned no commits. The existing `07-red-run.log` records module-load failure (`tests=1`, `fail=1`), not six independent red cases, and no `[RED]`/`[GREEN]` commit sequence exists.
- PASS — runtime project count is 53 and all 53 expose a runtime `spokenDialogue.status`; missing statuses are generation-blocked by `assertGenerationAllowed`. This only proves the fail-closed runtime guard, not content readiness.
- FAIL — the required L017 non-A hard gate is absent. No `naturalnessGrade` field or non-A dialogue hard rule exists in the checker, and no 117-level non-A audit is present.
- FAIL — actual audio/ASR evidence is absent. Fresh inventory found 0 `audio-transcript.json`, no local `run-asr` entry point, and no R2 video/audio artifact. The required L013/L014 old-track transcripts and at least one repaired-sample transcript do not exist.
- FAIL — user acceptance gate is absent. No R2 `qa-signoff.yaml`, no five-question human sign-off, no sample video/contact-sheet evidence, and no user acceptance record exist.
- FAIL — required cost-safety reconciliation is absent: `output/qa/desert-curriculum-r2/08-cost-safety.md` does not exist. R2 artifact inspection shows zero provider/video side effects, but the required zero-cost evidence document was not delivered.
- FAIL — production approval evidence is stale. For all 45 manifests, the saved `checks.structure.details` differs from a fresh checker run. Example L013 saved `spokenCount=4`, while the current Dialogue-only checker returns `spokenCount=1`. The current checker passes, but the manifest evidence is not reproducible as recorded.
- FAIL — textbook content remains unverified. The L006-L050 contract marks all 45 learning objectives `needsTextbookCheck=true`; no textbook verification artifact exists. This remains a subsequent single-sample gate and cannot be treated as release approval.

## Final decision

# FAIL

Code-level regression and bypass checks pass, but the R2 acceptance contract is not satisfied. Do not unlock batch generation. At most, after textbook verification, actual audio generation plus ASR, post-generation visual/semantic QA, and `yr` human sign-off are completed, one single sample may be reconsidered; no batch release is authorized.
