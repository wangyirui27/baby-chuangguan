# DeepSeek Review: L005 Nice to Meet You

**Reviewer:** deepseek (deepseek-v4-pro)
**Prompt:** tools/video-prompts/desert-level-005-nice-to-meet-you-v1.txt
**Date:** 2026-07-23

---

## Verdict: PASS

---

## Per-Criterion Assessment

### 1. Unknown-Language Test — PASS
The prompt explicitly defines the unknown-language test (line 23-24) and builds every section around it. The visual plan is robust:
- Two children arriving from **different paths** (left vs right) = "these two didn't know each other before"
- **Shy pause + shy smiles** = first-meeting body language, not casual greeting
- **Gentle handshake** = universal first-meeting ritual
- No waving — "no simple arriving wave as the main action" (Anchor #4)

A zero-English child watching muted will decode: different origins → shy stop → handshake → smiles = "nice to meet you." This is the strongest-designed criterion in the prompt.

### 2. Distinguish from Hello/Hi — PASS
Clear differentiation from casual greeting:
- Handshake, not wave — the prompt explicitly excludes "only waving" and "hello greeting" from both visual anchors and negative prompt
- Shy/hesitant body language vs. casual/familiar greeting energy
- Different paths converging = "meeting for the first time," not "saying hi to someone you already know"
- "greeting old friend" is in the negative prompt

### 3. Required Semantic Anchors — PASS (all 4 present)
| Anchor | Present? | Location |
|---|---|---|
| First-time meeting | ✓ | Line 16, 29 (start apart, stop with shy smiles) |
| Two children from different paths | ✓ | Line 17, 29 (left path / right path explicit) |
| Gentle handshake | ✓ | Line 18, 29 (offer empty hand, accept, hold) |
| Not just hello greeting | ✓ | Line 19, 44 (negative prompt excludes "only waving", "hello greeting") |

### 4. Face/Mouth Visibility — PASS (with risk on 12-15s)
Each dialogue segment individually passes:
- 0-3s: Child A, "front-three-quarter face visible" ✓
- 3-6s: Child B, "face and mouth visible" ✓
- 6-9s: Child A, "clear face" ✓
- 9-12s: Child B, "clear mouth" ✓
- 12-15s: Both children together — **risk flagged below**

The camera spec (line 40) enforces front/front-three-quarter angle throughout. Negative prompt prohibits back-facing, side-profile-only, and over-the-shoulder shots.

### 5. Negative Prompt — PASS
Comprehensive. Covers: text/labels/subtitles, classroom/school artifacts, props/objects, back-facing speaking, side-profile, old-friend greeting, waving-only, 3D/plastic/neon rendering, anatomical distortion, logos/watermarks. No gaps found.

### 6. Seedance Risk Assessment

**Highest-risk ambiguity:** The **12-15 second group line** (line 36):
> "Both children, new friends standing together: 'Nice to meet you!'"

Why this is the highest risk:

1. **Two simultaneous speakers in a two-shot** — Seedance must render two visible mouths both speaking the same line in sync. The prompt says "front-facing medium two-shot" but doesn't clarify whether both mouths must be visible simultaneously or whether the camera can favor one face. A video model may default to showing one clear face + one partially obscured face, violating the mouth-visibility rule.

2. **"new friends standing together" contradicts the first-meeting frame** — At 12-15s the handshake should still be in progress (or just completing). Labeling them "new friends standing together" reads as post-meeting camaraderie, which weakens the first-meeting tension. The learner needs the handshake to still read as the active "meeting" moment.

3. **Handshake release timing is ambiguous** — Line 29 says "hold the handshake briefly, smile warmly, then relax their hands and stand side by side." In a 15-second video, the handshake may look either too abbreviated (doesn't land) or too lingering (unnatural). The prompt doesn't specify when the handshake releases relative to the dialogue lines.

**Second risk:** The dialogue repeats "Nice to meet you" 5 times in 15 seconds. Seedance may interpret this as a single frozen handshake pose with mouth movement, rather than a natural 5-beat conversational exchange. Consider whether 3 repetitions (A→B→A: "Nice to meet you" / B: "Nice to meet you, too" / Both: smile) would feel more natural and reduce sync risk.

---

## Concrete Fixes (for Seedance risk reduction)

1. **Rewrite the 12-15s line** to keep the handshake active and clarify camera:
   > "12-15s: Both children, still holding the gentle handshake, faces visible in a balanced front-facing two-shot — Child A and Child B speak together warmly: 'Nice to meet you!' Hands remain joined; do not drop the handshake until fade."

2. **Clarify handshake release timing** in Story Container (line 29): replace "relax their hands and stand side by side as new friends" with:
   > "They hold the handshake through the final spoken line, then relax their hands during a one-second gentle fade-out. The handshake remains the visual anchor for the entire spoken duration."

3. **Consider reducing dialogue to 3 turns** to lower sync complexity and make the handshake feel more natural within 15 seconds:
   - 0-5s: A approaches, shy smile, offers hand, says "Nice to meet you."
   - 5-10s: B accepts handshake, visible face, says "Nice to meet you, too."
   - 10-15s: Both hold handshake, warm smiles, visible faces, say together "Nice to meet you."

---

## Contact Sheet QA Criterion

> **QA check:** Mute the video — can a colleague who hasn't read the prompt identify (a) this is a first-time meeting (not old friends), (b) the children came from different directions, and (c) the spoken phrase means "nice to meet you"? If any of these three fail, the generation is a reject regardless of render quality.
