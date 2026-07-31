# Mimo Manifest & Canonical-Path Audit: L006-L050

Audit date: 2026-07-23 19:08
Auditor: mimo (automated + manifest cross-check)
Scope: desert-level-006 to desert-level-050, r2 canonical only

## Summary

| Check | Result |
|-------|--------|
| Prompt files (r2) | **45/45** ✓ |
| prompt-check.json | **45/45** ✓ |
| approval-manifest.json | **45/45** ✓ |
| SHA256: file ↔ manifest | **45/45** match ✓ |
| approved=false | **45/45** ✓ |
| dryRun=true | **45/45** ✓ |
| creditsBurned=false | **45/45** ✓ |
| independent_prompt_qa.pass=false | **45/45** ✓ |
| structure.pass=true | **45/45** ✓ |
| automated_preflight.pass=true | **45/45** ✓ |
| raw/ empty | **45/45** ✓ |
| final/ empty | **45/45** ✓ |
| contact-sheets/ empty | **45/45** ✓ |
| v1 preserved (not counted as pass) | **45/45** ✓ |
| v1 ↔ r2 isolation | **45/45** clean ✓ |

**Verdict: ALL 45 LEVELS PASS. No issues found.**

## Gate Status Explanation

All 45 manifests are in `prompts-only stub` state:
- `approved: false` — video generation not authorized
- `dryRun: true` — no real generation attempted
- `creditsBurned: false` — no API credits consumed
- `independent_prompt_qa.pass: false` — awaiting independent human/AI review

This is the correct safe state. No manifest has been accidentally approved or executed.

## SHA256 Consistency

For each level, the sha256 of the actual r2 prompt file on disk matches `approval-manifest.json.promptSha256`. No drift detected.

Note: `prompt-check.json` does not store a sha256 field — it only contains checker output (ok, spokenTarget, answerLabel, dialogueLines, etc.). The sha256 lives only in the manifest, which is the correct single source of truth for integrity.

## Canonical vs Old

- All 45 r2 directories are canonical (per README: `output/media-production/desert-level-XXX-*-r2/prompts/level-XXX-*-r2.txt`)
- All 45 corresponding v1 directories exist and are preserved as failure evidence
- No v1 directory contains r2 prompt files — clean separation confirmed

## Media Artifacts

All 45 levels have empty `raw/`, `final/`, and `contact-sheets/` directories (or directories don't exist). No video generation has occurred, consistent with the `dryRun=true` / `creditsBurned=false` gate state.

## Per-Level Detail

| Level | Title | Chars | SHA256 Match | approved | dryRun | burned | qa_pass | struct | preflight |
|-------|-------|-------|-------------|----------|--------|--------|---------|--------|-----------|
| L006 | My name is... | 6894 | ✓ | False | True | False | False | True | True |
| L007 | What's your name? | 6927 | ✓ | False | True | False | False | True | True |
| L008 | I'm Chen Jie | 6945 | ✓ | False | True | False | False | True | True |
| L009 | Let's play together | 6902 | ✓ | False | True | False | False | True | True |
| L010 | Share with friends | 6917 | ✓ | False | True | False | False | True | True |
| L011 | Are you OK? | 6837 | ✓ | False | True | False | False | True | True |
| L012 | I can help | 6802 | ✓ | False | True | False | False | True | True |
| L013 | friend mind map | 7452 | ✓ | False | True | False | False | True | True |
| L014 | kind words | 7253 | ✓ | False | True | False | False | True | True |
| L015 | help a friend | 6875 | ✓ | False | True | False | False | True | True |
| L016 | say hello first | 6854 | ✓ | False | True | False | False | True | True |
| L017 | be a good friend | 6991 | ✓ | False | True | False | False | True | True |
| L018 | This is my mum | 6920 | ✓ | False | True | False | False | True | True |
| L019 | This is my dad | 6906 | ✓ | False | True | False | False | True | True |
| L020 | This is my grandma | 6923 | ✓ | False | True | False | False | True | True |
| L021 | This is my grandpa | 6991 | ✓ | False | True | False | False | True | True |
| L022 | Who lives with you? | 7046 | ✓ | False | True | False | False | True | True |
| L023 | My family is big | 6952 | ✓ | False | True | False | False | True | True |
| L024 | My family is small | 6892 | ✓ | False | True | False | False | True | True |
| L025 | I live with my parents | 6981 | ✓ | False | True | False | False | True | True |
| L026 | I have a sister | 6886 | ✓ | False | True | False | False | True | True |
| L027 | I have a brother | 6864 | ✓ | False | True | False | False | True | True |
| L028 | This is my family | 6883 | ✓ | False | True | False | False | True | True |
| L029 | We love each other | 6899 | ✓ | False | True | False | False | True | True |
| L030 | family tree | 7233 | ✓ | False | True | False | False | True | True |
| L031 | add a family photo | 7199 | ✓ | False | True | False | False | True | True |
| L032 | draw my family | 6875 | ✓ | False | True | False | False | True | True |
| L033 | talk about family | 6944 | ✓ | False | True | False | False | True | True |
| L034 | different families | 7023 | ✓ | False | True | False | False | True | True |
| L035 | a pet dog | 6825 | ✓ | False | True | False | False | True | True |
| L036 | a little cat | 6726 | ✓ | False | True | False | False | True | True |
| L037 | a fish | 6684 | ✓ | False | True | False | False | True | True |
| L038 | a bird | 6661 | ✓ | False | True | False | False | True | True |
| L039 | What pets do you know? | 6946 | ✓ | False | True | False | False | True | True |
| L040 | I like dogs | 6775 | ✓ | False | True | False | False | True | True |
| L041 | I have a cat | 6759 | ✓ | False | True | False | False | True | True |
| L042 | Is it a pet? | 6815 | ✓ | False | True | False | False | True | True |
| L043 | a wild panda | 6861 | ✓ | False | True | False | False | True | True |
| L044 | a big tiger | 6804 | ✓ | False | True | False | False | True | True |
| L045 | an elephant | 6781 | ✓ | False | True | False | False | True | True |
| L046 | a monkey | 6826 | ✓ | False | True | False | False | True | True |
| L047 | What wild animals do you know? | 7020 | ✓ | False | True | False | False | True | True |
| L048 | animal picture book | 7036 | ✓ | False | True | False | False | True | True |
| L049 | draw a pet | 6849 | ✓ | False | True | False | False | True | True |
| L050 | draw a wild animal | 6987 | ✓ | False | True | False | False | True | True |

## What This Audit Does NOT Cover

Per README requirement #9, this audit only checks prompt artifacts and manifest gates. The following are **NOT audited** and **not available on disk**:

- Real MP4 video files (none generated — dryRun=true)
- Audio tracks / ASR output
- Contact sheets (directory empty)
- Silent-view semantic verification against real video
- Speaker face/mouth visibility in real frames

These require actual video generation first, which is blocked by the current gate state.

## Prompt Content QA (Separate Task)

This report covers **artifact completeness and gate integrity only**. Prompt content quality (dialogue naturalness, visual semantics, distractor uniqueness, etc.) is covered by the sibling M3/GLM/Codex QA tasks (reports 01-03).