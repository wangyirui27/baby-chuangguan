# L005 Nice to Meet You — Prompt Audit (mimo)

**Date**: 2026-07-17
**Reviewer**: mimo
**Prompt**: tools/video-prompts/desert-level-005-nice-to-meet-you-v1.txt

---

## Verdict: PASS (with one high-risk flag)

---

### 1. Unknown-Language Test — PASS

The prompt explicitly defines the zero-English test (line 23) and maps the visual formula:

> two new children come from different paths + shy pause + gentle handshake + warm smiles = nice to meet you

Four distinct visual anchors are defined (lines 15–19): different paths, first-time meeting, gentle handshake, not just hello. If the video generator follows the story container, a muted viewer will see: unfamiliar children → approach from opposite directions → shy stop → handshake → smile. This is enough to decode "nice to meet you" without any audio.

---

### 2. Distinguish from Hello/Hi — PASS

The prompt explicitly guards against the hello conflation in three places:

- Source Situation: "not just a casual hello greeting" (line 9)
- Visual anchor #4: "no simple arriving wave as the main action" (line 19)
- Negative Prompt: includes "only waving, greeting old friend, hello greeting, not just a hello greeting" (line 44)

The "different paths" setup is the strongest differentiator — two children converging from separate directions is visually distinct from two friends waving at each other.

---

### 3. Required Semantic Anchors — PASS

All four anchors present and reinforced across multiple sections (Visual anchors, Story Container, Silent-viewer test, Unknown-language test):

1. ✅ first-time meeting: "begin apart and unfamiliar, then stop with shy friendly smiles"
2. ✅ two children from different paths: "Child A comes from the left path and Child B comes from the right path"
3. ✅ gentle handshake: "offer and hold a gentle empty-handed handshake in the center"
4. ✅ not just hello: explicitly excluded in negative prompt

---

### 4. Face/Mouth Visibility — PASS

Every dialogue line specifies face/mouth visibility:

- 0–3s: "front-three-quarter face visible" ✅
- 3–6s: "face and mouth visible" ✅
- 6–9s: "clear face" ✅
- 9–12s: "clear mouth" ✅
- 12–15s: "Both children, new friends standing together" — both faces should be visible in the final two-shot ✅

Negative prompt covers: "back-facing speaking, mouths to camera while speaking, mouth not visible while speaking, side-profile-only speaking, pure side-profile conversation."

---

### 5. Negative Prompt — PASS

Comprehensive negative prompt covers all required exclusions:

- Text/subtitles/logos ✅
- Classroom/blackboard/flashcards ✅
- Props/holding objects ✅
- Back-facing/side-profile speaking ✅
- Drill/presenter energy ✅
- Glossy 3D/neon/vector ✅

---

### 6. Seedance Risk — HIGH-RISK FLAG

**Highest risk: Dialogue repetition makes the video feel like a vocabulary drill.**

Five identical "Nice to meet you" lines in 15 seconds (lines 32–36) is the #1 risk for Seedance. Even though the prompt says "No repeat-after-me drill" and "No presenter energy" and "No flat recitation" in the negative prompt, the dialogue structure itself is 5× identical sentences. Seedance models tend to interpret identical repeated dialogue as a drill pattern and generate a rhythmic, chant-like delivery — exactly what the negative prompt tries to prevent.

The prompt does say "emotionally specific" and "Quiet, tender" (line 38), but these are performance instructions that Seedance may ignore in favor of the dialogue pattern.

**Exact prompt sentence to change if needed:**

Current (lines 32–36):
```
0-3s: Child A, front-three-quarter face visible, shy smile: "Nice to meet you."
3-6s: Child B, face and mouth visible, reaches for handshake: "Nice to meet you."
6-9s: Child A, gentle handshake, clear face: "Nice to meet you."
9-12s: Child B, warm smile, clear mouth: "Nice to meet you."
12-15s: Both children, new friends standing together: "Nice to meet you!"
```
