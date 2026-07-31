# Mimo Audit Plan: R3 Manifest/Canonical Verification

Audit date: 2026-07-23
Auditor: mimo (plan + script draft)
Scope: exactly 15 P0 r3 prompt directories

## Pre-Conditions

r3 directories do NOT exist yet. This plan is for the **post-generation** gate
check that runs after Codex writes r3 prompts. The 15 P0 levels:

| #  | Level | Directory slug (expected)                        |
|----|-------|--------------------------------------------------|
| 1  | L006  | desert-level-006-my-name-is-r3                   |
| 2  | L008  | desert-level-008-i-m-chen-jie-r3                 |
| 3  | L011  | desert-level-011-are-you-ok-r3                   |
| 4  | L014  | desert-level-014-kind-words-r3                   |
| 5  | L017  | desert-level-017-be-a-good-friend-r3             |
| 6  | L022  | desert-level-022-who-lives-with-you-r3           |
| 7  | L025  | desert-level-025-i-live-with-my-parents-r3       |
| 8  | L031  | desert-level-031-add-a-family-photo-r3           |
| 9  | L033  | desert-level-033-talk-about-family-r3            |
| 10 | L034  | desert-level-034-different-families-r3           |
| 11 | L039  | desert-level-039-what-pets-do-you-know-r3        |
| 12 | L042  | desert-level-042-is-it-a-pet-r3                  |
| 13 | L046  | desert-level-046-a-monkey-r3                     |
| 14 | L047  | desert-level-047-what-wild-animals-do-you-know-r3|
| 15 | L049  | desert-level-049-draw-a-pet-r3                   |

**Important**: directory slugs are derived from existing r2 slugs with `-r2`
replaced by `-r3`. Actual names may differ if Codex uses a different naming
convention. The script below auto-discovers r3 dirs by glob pattern.

---

## Check 1: Directory Count

**What**: exactly 15 r3 directories exist under `output/media-production/`.
**How**: glob `desert-level-*-r3/` and count.
**Pass**: count == 15.
**Fail**: count != 15 (missing or extra dirs).

## Check 2: Prompt File Existence

**What**: each r3 dir contains `prompts/level-NNN-*-r3.txt`.
**How**: for each r3 dir, glob `prompts/*.txt`.
**Pass**: exactly 1 .txt file per dir.
**Fail**: 0 or >1 .txt files.

## Check 3: Prompt-Check (Structural)

**What**: `prompt-check.json` exists and `ok == true` in each r3 dir.
**How**: read JSON, assert `ok: true`.
**Pass**: 15/15 ok=true.
**Fail**: any ok=false or missing file.

**Note**: the existing checker (`check-desert-video-prompt.js`) validates:
- Required sections present (Duration, Format, Cinematic Style, etc.)
- Spoken dialogue lines count
- Character count
- Target expression presence
- Face/mouth visibility mentions
- Natural dialogue scoring

## Check 4: SHA256 Consistency

**What**: sha256 of the prompt .txt file matches `approval-manifest.json.promptSha256`.
**How**: `sha256sum prompts/*.txt` → compare to manifest's `promptSha256` field.
**Pass**: 15/15 match.
**Fail**: any mismatch (prompt was edited after manifest was written, or vice versa).

## Check 5: Approval-Manifest Blocked State

**What**: all 4 manifests gates are in the safe blocked state.
**How**: read `approval-manifest.json`, assert all 4 fields:

| Field                        | Required Value | Meaning                          |
|------------------------------|----------------|----------------------------------|
| `approved`                   | `false`        | video gen not authorized         |
| `dryRun`                     | `true`         | no real generation attempted     |
| `creditsBurned`              | `false`        | no API credits consumed          |
| `independent_prompt_qa.pass` | `false`        | awaiting independent review      |

**Pass**: 15/15 all 4 fields correct.
**Fail**: any field wrong (accidental approval or credit burn = critical).

## Check 6: Structure & Preflight Checks in Manifest

**What**: `checks.structure.pass == true` and `checks.automated_preflight.pass == true`.
**How**: read manifest JSON.
**Pass**: 15/15 both true.
**Fail**: any false (prompt didn't pass the structural checker).

## Check 7: Old r2 Preservation

**What**: the original r2 directories are NOT deleted or modified.
**How**: for each P0 level, verify:
  - `desert-level-NNN-*-r2/` directory exists
  - `desert-level-NNN-*-r2/prompts/level-NNN-*-r2.txt` still exists
  - sha256 of r2 prompt matches r2's `approval-manifest.json.promptSha256`
**Pass**: 15/15 r2 dirs intact with matching sha256.
**Fail**: any r2 dir missing, deleted, or sha256 drifted.

## Check 8: Old v1 Preservation

**What**: v1 directories remain untouched.
**How**: for each P0 level, verify `desert-level-NNN-*-v1/` exists.
**Pass**: 15/15 v1 dirs exist.
**Fail**: any v1 dir missing.

## Check 9: No Media Artifacts (Raw/Final/Contact-Sheets)

**What**: r3 dirs contain NO video/image artifacts.
**How**: for each r3 dir, check:
  - `raw/` is empty or absent
  - `final/` is empty or absent
  - `contact-sheets/` is empty or absent
  - no `.mp4`, `.mov`, `.png`, `.jpg` files anywhere in the r3 dir
**Pass**: 15/15 no media files.
**Fail**: any media file found (accidental generation = critical).
