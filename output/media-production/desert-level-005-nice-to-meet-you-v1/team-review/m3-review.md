# L005 Nice to meet you — m3 review

Project: /Users/yr/宝宝闯关
Prompt: tools/video-prompts/desert-level-005-nice-to-meet-you-v1.txt
Target: Nice to meet you / 很高兴见到你
Reviewer: m3
Mode: read-only prompt audit (no project file modified)

---

## Verdict: PASS

The prompt satisfies the desert video-quality contract for "Nice to meet you" on every required axis. Below is the per-check judgment plus one low-risk tightening note. No blocking fix is required before generation.

### 1. Unknown-language test — PASS

The picture plan translates "巴拉巴拉" into meaning through three concrete, time-stable cues that are all forced into the opening frames by Story Container and Scene:

- two children starting apart, walking toward the center from a left path and a right path (anchored in Story Container: "Start with Child A on the left path and Child B on the right path, both walking gently toward the center")
- a shy pause with shy friendly smiles before any dialogue ("stop at a comfortable distance with shy smiles, showing this is a first-time meeting")
- a gentle empty-handed handshake in the center of the frame ("gentle handshake", repeated 7 times; anchored in beats 3-6s, 6-9s, 9-12s)

Unknown-language test, silent-viewer test, and the four Visual semantic anchors all explicitly enumerate these three visual facts. A zero-English viewer can map the alien sound to first-meeting+friendly without reading any English.

### 2. Distinguish from Hello/Hi — PASS

The prompt goes out of its way to disambiguate from a casual hello:

- "first-time meeting" appears 4 times (Source Situation, Zero-beginner clarity, anchors #1, Story Container)
- "not just a hello greeting" / "greeting old friend" / "only waving" appear in anchors, Zero-beginner rule, and the negative prompt
- The Visual semantic anchor #4 is dedicated to this: "no simple arriving wave as the main action; the scene must read as new friends meeting for the first time."
- "Like new classmates meeting before a friendly adventure" plus the age/classroom-clean separation ("No classroom, no flashcards, no written labels") makes it clear this is a first encounter, not a returning friend wave.

This is the strongest part of the prompt — it is harder for Seedance to misinterpret "first-time meeting" here than it was for L002/L003/L004 because all three cues (different paths + shy pause + handshake) must appear together.

### 3. Required semantic anchors — PASS, all four present and explicit

| Anchor required by contract                          | Present in prompt?                                       |
| ---                                                  | ---                                                      |
| first-time meeting                                   | yes — 4 hits, plus anchor #1 + Story Container           |
| two children come from different paths               | yes — Scene + Visual semantic anchor #2 + Story Container|
| gentle handshake (or equivalent first-meeting gesture)| yes — 7 hits, anchors #3, beats 3-6s/6-9s/9-12s          |
| not just a hello greeting                            | yes — anchors #4 + Zero-beginner rule + negative prompt |

Contractual checker `node tools/video-prompts/check-desert-video-prompt.js ... "Nice to meet you"` returns ok:true with targetCount 16, 5 quoted dialogue lines, 7349 chars. Length is inside the 4200–7600 Seedance reliability window.

### 4. Face/mouth visibility — PASS

Every one of the 5 dialogue beats explicitly fixes the speaker's face/mouth orientation:

- 0-3s: front-three-quarter face visible
- 3-6s: face and mouth visible
- 6-9s: clear face
- 9-12s: clear mouth
- 12-15s: both children (final stance, both faces readable)

Camera section locks the entire video to "front-facing medium two-shot" / "front or front-three-quarter angle, not side profile". The negative prompt bans every relevant back-facing and side-profile framing: back-facing speaking, backs to camera while speaking, both children facing away, rear-view dialogue, speaking away from camera, mouth not visible while speaking, face hidden while speaking, side-profile-only speaking, pure side-profile conversation, over-the-shoulder shot, profile-only conversation, silhouette faces, only waving. All 22 contractually-banned phrases are present (verified with case-insensitive scan against the negative-prompt block).

### 5. Negative prompt — PASS

Full scan of the Negative Prompt block against the contract's 22 banned phrases returns all-OK. Subtitles, captions, readable text, written words, flashcards, blackboard, classroom, robotic voice, logo, watermark are all banned. Props/objects (toy, book, card, ball, cup, bowl, plate, spoon, food, animal, foreground prop, child holding an object, confusing object near the children) are all banned. Style drift blocks (glossy 3D, plastic toy texture, neon, hard vector, anime parody, signature, watermark) and quality blocks (distorted hands, incorrect lip sync, tight mouth close-ups, ugly faces, asymmetrical eyes, deformed face, fast cuts, scary elements) are present.

### 6. Seedance risk — highest-risk ambiguity identified

After reading the prompt against known Seedance failure modes (handshake morphing, two-shot cropping that drops the path cue, "shy smile" rendering as a casual hello), the single highest-risk sentence is in the Camera section. It currently reads:

> "Keep faces, upper bodies, empty hands, the handshake, and the two paths visible."

The phrasing keeps faces, hands, handshake, and the two paths visible — but does not anchor WHEN (in which beat) the two paths must be visible. Story Container correctly states the children walk in from opposite paths before any dialogue, but Story Container and Scene are description text, not the "do not crop" instruction that Seedance weights most. The Camera section is the de facto shot list. If Seedance interprets the Camera as "tight two-shot, faces + handshake only" — which is what "front-facing medium two-shot" plus "keep faces ... visible" often produces — the "two curved paths meet" disambiguation silently disappears for the first two beats, and beat 0-3s becomes "two children smile at each other in tight close-up", which the contract forbids ("first-time meeting visually unambiguous through new-person approach + handshake/first-meeting gesture, not just waving").

Secondary lower-rank risks, all currently mitigated but worth flagging:

- Handshake hand-distortion. Negative prompt bans "distorted hands", but Seedance often delivers "four-finger merged handshake" within an otherwise clean frame. Mitigation already in place: "gentle handshake in the center of the frame" + "empty-handed handshake" + "distorted hands" ban.
- Two children = polite "you"? The line "Nice to meet you" is structurally a 4-word sentence with no contraction. L2/L3 already proved Seedance handles this line cleanly, so no special treatment needed.

---

## Recommended fixes (suggestion only, not blocking)

Apply whichever is acceptable to the team. None is required for the prompt to clear the contract.

1. (Camera section, recommended) Replace
   > "Keep faces, upper bodies, empty hands, the handshake, and the two paths visible."
   
   with
   
   > "Keep faces, upper bodies, empty hands, the handshake, AND the two curved paths converging from the left and right visible in EVERY beat of the 15 seconds — even the opening wide before the children meet at the center. Do not crop in tighter than a medium two-shot, and never frame out the two paths."
   
   Rationale: makes the "different-paths" cue survive Seedance's tendency to crop into a face two-shot the moment dialogue starts.

