# L005 Nice to meet you — grok prompt audit

**Verdict: REJECT**

**Prompt:** `tools/video-prompts/desert-level-005-nice-to-meet-you-v1.txt`  
**Target:** Nice to meet you / 很高兴见到你  
**Checker floor:** `check-desert-video-prompt.js` → ok (structure only; not final approval)

---

## Strongest reason

Self-contradiction on the first speech beat. Zero-beginner clarity rule correctly says a simple wave/smile alone is not enough, yet Dialogue `0-3s` has Child A speak "Nice to meet you" with only `shy smile` — handshake is deferred to `3-6s` (reach) / `6-9s` (hold). Whenever the phrase is spoken, the image must already carry first-meeting meaning; beat 1 fails that rule and will often read as Hello/Hi if Seedance compresses the approach.

---

## Criterion checklist

| # | Criterion | Result | Notes |
|---|-----------|--------|-------|
| 1 | Unknown-language test (巴拉巴拉 → meaning from image) | FAIL on timing | Recipe is right (different paths + shy pause + handshake + smiles), but first spoken line is not locked to handshake/approach completion |
| 2 | Distinguish from Hello/Hi | PARTIAL | Anchors exist on paper; first 3s under-spec'd so collapse to smile-greeting is likely |
| 3 | Semantic anchors (first meet / different paths / handshake / not hello) | PASS (text) | All four stated in Visual semantic anchors + Story Container + negatives |
| 4 | Face/mouth visibility every line | PASS (text) | Front / front-three-quarter required; negatives ban back, OTS, pure side-profile |
| 5 | Negative prompt coverage | PASS | Text/subs/logo/classroom/blackboard/flashcards/props/holding objects all banned |
| 6 | Seedance highest-risk ambiguity | FAIL | See below |

---

## Seedance highest-risk ambiguity

**Risk:** Opposite-path approach + continuous front-facing medium two-shot + delayed handshake.

Model likely shortcuts to: two kids already center-frame, smiling, maybe waving — losing "came from different paths" and delaying/softening handshake. Compounded by Dialogue beat 1 = smile-only speech.

**Exact sentence to change (Dialogue block):**

Current:
```text
0-3s: Child A, front-three-quarter face visible, shy smile: "Nice to meet you."
3-6s: Child B, face and mouth visible, reaches for handshake: "Nice to meet you."
```

Replace with (recommended):
```text
0-3s: Child A, front-three-quarter face visible, offers empty hand for a gentle handshake: "Nice to meet you."
3-6s: Child B, face and mouth visible, accepts the empty-handed handshake: "Nice to meet you."
```

Also tighten Story Container so the offer/accept is not only prose later in the paragraph but matched to those beats, and add an explicit ban on starting already together.

---

## Concrete fixes (3)

1. **Lock differentiating gesture on every speech beat, especially 0-3s.** Child A must offer the empty handshake hand while saying the first line; Child B accept on the second line; hold through 6-9s. Do not allow smile-only or wave-only speech beats.

2. **Force readable path-arrival before speech.** Open with Child A still on the left path and Child B on the right path (gap visible), short approach, stop, then handshake+speech. Add negative fragments: `already standing together from the first frame`, `friends who already know each other`, `no opposite-path approach`, `casual hello wave instead of handshake`.

3. **Resolve approach vs camera conflict in one sentence.** Keep the continuous front-facing medium two-shot, but specify: bodies angle slightly toward each other while faces stay open to camera (front / front-three-quarter); left and right path ribbons stay visible behind each child — not pure side-profile walking into each other.

Optional non-blocking polish: title `Desert School Path` slightly biases classroom; prefer `Desert Oasis Path`. Five identical lines match project beat pattern but raise drill risk — goodbye-style micro-variation is safer if audio still lands the full target phrase at least twice clearly.

---

## Contact sheet QA criterion (one line)

Mute the clip: reject unless you see left-path + right-path arrival, then a clear empty-handed handshake held while every speech beat shows the speaker front/three-quarter with mouth visible — any smile/wave-only speech beat or already-together-from-frame-1 staging fails.

---

## What already works (do not strip)

- Contract anchors for Nice to meet you are named correctly (first-time meeting, different paths, gentle handshake, not just hello).
- Silent-viewer + Unknown-language tests are explicit and correctly worded.
- Face/mouth rules and negative list match the quality contract rejection bar.
- Empty hands = no props is right; keep handshake as the allowed hand contact, not a held object.
