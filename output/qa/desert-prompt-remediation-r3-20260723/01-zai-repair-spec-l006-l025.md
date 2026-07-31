# R3 Repair Spec — L006/L008/L011/L014/L017/L022/L025 (Greetings · Friendship · Family)

| Field | Value |
|---|---|
| Author | glm (ZAI) — R3 repair spec seat |
| Date | 2026-07-23 |
| Scope | 7 P0 levels: L006, L008, L011, L014, L017, L022, L025 |
| Role | **Spec only.** No source/prompt edits. No LibTV. No MP4. |
| Inputs read | README r3 brief; FINAL.md; 06-cursor-cross-review.md; 05-codex-automated-semantic-scan.md; 02-zai-l021-l035.md (prior ZAI r2 QA); desert-level-semantic-contracts-l006-l050.json; all 7 r2 prompt txt files |
| Target writer | Codex (only writer for contracts + r3 artifacts) |

---

## 0. Repair philosophy — why each level fails

Every level here shares one root disease: **the correct-answer option and the distractor option are not semantically separable when the audio is removed (silent-viewer) or treated as alien noise (unknown-language).** The r2 prompts amplify this disease in three ways:

1. **Distractor spoken literally** — the dialogue text contains the exact distractor string or a near-paraphrase (L006, L008, L011, L022, L025).
2. **Distractor encoded visually** — the visual anchors depict the distractor concept, so a muted viewer would pick the wrong card (L014, L017, L022/L025 paired).
3. **Thin unique anchor** — anchors 2–5 are boilerplate ("speaker face and mouth visible…") with only 1 concrete cue; silent-viewer inference is unreliable (all 7).

The repair must fix all three layers for each level: dialogue, visual anchors, and silent-viewer uniqueness. A dialogue-only fix is insufficient because the muted test still fails.

---

## 1. Cross-cutting repair rules (apply to ALL 7 levels)

### R1. Distractor ban in Dialogue
No Dialogue line may contain the distractor string, a substring of it, or a near-paraphrase that a 6-year-old would map to the same meaning. Codex must run a literal substring check AND a semantic near-match check against `answerOption.distractors[*]` on every rewritten line.

### R2. Paired Q/A asymmetry
L006↔L007, L008↔L007, L022↔L025 are quiz-option pairs. If level X teaches the question form, its paired level Y must teach ONLY the statement form — and vice versa. The question-teaching video must never speak the statement; the statement-teaching video must never speak the question.

### R3. Visual anchor minimum
Every level must have **at least 2 concrete target-specific visual cues** beyond the boilerplate "speaker face and mouth visible / no readable text." Boilerplate anchors do not count toward the minimum. This is repair invariant #7 from the README.

### R4. Silent-viewer uniqueness test
For each level, the spec must state: "A muted viewer sees [specific concrete scene] and can ONLY infer [correct answer meaning], NOT [distractor meaning]." If the distractor meaning is equally inferrable from the described visuals, the anchor is rejected.

### R5. Natural child English
- All dialogue lines must be utterable by a real 6-year-old in a real playground scenario.
- Banned: "siblings" (too formal), "How many people?" (clinical), animal sounds, slogan-style chants ("Friends share!" / "Friends help!" as standalone lines).
- Slogan lines may appear only if embedded in a natural sentence ("We share our toys.").

### R6. No prop contradictions
If the Negative Prompt bans `cards`, `flashcards`, `mind map`, `family tree`, or `picture book`, the Positive Prompt and visual anchors must not reference these props. No positive/negative contradiction.

### R7. Project sequel isolation
Project-type sequel levels (L014 follows L013, L017 follows L016) must not let the previous project's core prop dominate the frame. The current level's learning target must be the sole foreground meaning.

---

## 2. Per-level repair specs

---

### L006 — "My name is..."

| Field | r2 (broken) | r3 (required) |
|---|---|---|
| answerOption.correct | My name is... | (unchanged) |
| answerOption.distractors | ["Nice to meet you"] | (unchanged) |

#### Failure diagnosis
1. **Distractor spoken literally.** Dialogue line 5 (12–15s): `"Nice to meet you!"` — this is the exact distractor string in the mouth of both children. A child who hears this line learns the distractor, not (or equally with) the correct answer.
2. **Silent-viewer ambiguity.** Anchor 1 (`手指胸口 + 微笑 + 面对新朋友`) is a generic greeting cue. A muted viewer sees two children smiling at each other → equally infers "Nice to meet you" (greeting) and "My name is…" (self-introduction). No unique visual separates them.
3. **Thin anchors.** Anchors 2–4 are boilerplate. Only 1 concrete cue exists; minimum is 2.

#### Required Dialogue rewrite
```
0-3s  Child A: "My name is Tom."
3-6s  Child B: "My name is Lily."
6-9s  Child A: "I'm Tom."            ← name confirmation, NOT name-asking
9-12s Child B: "I'm Lily."            ← name confirmation
12-15s Both:   "Tom and Lily!"        ← name-pairing celebration, no greeting language
```
**Banned lines:** `Nice to meet you`, `Glad to meet you`, `Happy to meet you`, any "meet" + greeting construction. The distractor semantic field (meeting/greeting) must not appear in any beat.

#### Required visual anchors (minimum 2 concrete, target-specific)
1. `Child A points to own chest with index finger while speaking — "this is ME" gesture, not a wave or handshake`
2. `Both children face each other at close conversational distance; no waving, no handshake, no high-five (those encode greeting = distractor)`
3. `A simple desert-oasis path; foreground shows only the two children — no "welcome" or "meeting" stage prop`

#### Silent-viewer uniqueness statement
"A muted viewer sees Child A point to own chest and say something, then Child B point to own chest and say something back. The chest-pointing gesture + name-exchange turn structure can ONLY be inferred as self-introduction (My name is…), NOT as greeting (Nice to meet you) because there is no wave, handshake, or 'meeting' body language."

#### Paired-level note
L007 ("What's your name?") is the asking counterpart. L006 must teach ONLY the name-statement; it must not include any asking beat. The r2 line "I'm Tom. What's your name?" (beat 6–9s) must be changed to name-confirmation only.

---

### L008 — "I'm Chen Jie"

| Field | r2 (broken) | r3 (required) |
|---|---|---|
| answerOption.correct | I'm Chen Jie | (unchanged) |
| answerOption.distractors | ["What's your name?"] | (unchanged) |

#### Failure diagnosis
1. **Distractor co-uttered with answer in same beat.** Line 1 (0–3s): `"I'm Chen Jie. What's your name?"` — the correct answer and the distractor are spoken in one breath by the same child. The learner cannot separate them.
2. **Silent-viewer cannot encode a proper name.** "Chen Jie" is a specific Chinese name. A muted viewer cannot infer a name they don't already know from visual cues alone (nametags are banned). The anchor "A 做自我介绍，B 倾听后回应" is too generic to distinguish name-statement from name-asking.
3. **CEFR anchor repeat bleeds the distractor.** The prompt's stability anchor repeats `"I'm Chen Jie. What's your name?"` — reinforcing the distractor in the generation seed.

#### Required Dialogue rewrite
```
0-3s  Child A: "I'm Chen Jie."                    ← answer ONLY, no question appended
3-6s  Child B: "Hi, Chen Jie."                    ← B acknowledges the name (listening response)
6-9s  Child A: "Yes, I'm Chen Jie."               ← name confirmation
9-12s Child B: "I'm Mike."                        ← B gives own name (statement, not asking)
12-15s Both:   "Chen Jie and Mike!"               ← name-pairing close
```
**Banned lines:** `What's your name?`, `What is your name?`, `Your name?`, any interrogative-name construction. B must respond with a neutral acknowledgment or their own name statement — never with the question.

#### Required visual anchors
1. `Child A points to own chest while saying name — "I'm Chen Jie" self-identification gesture`
2. `Child B nods and smiles in listening posture during A's line, then points to own chest for own name — mutual self-introduction, NOT one asking and one answering`
3. `Children stand facing each other; B's body language is "I'm listening," not "I'm about to ask"`

#### Silent-viewer uniqueness statement
"A muted viewer sees two children take turns pointing to their own chests and speaking — a symmetric self-introduction exchange. This can ONLY be inferred as name-giving (I'm…), NOT as name-asking (What's your name?) because neither child does an asking gesture (tilted head, questioning hand, confused look)."

#### CEFR anchor fix
Change stability anchor from `"I'm Chen Jie. What's your name?"` to `"I'm Chen Jie."` only. The question must not appear in any generation-stability repeat.

---

### L011 — "Are you OK?"

| Field | r2 (broken) | r3 (required) |
|---|---|---|
| answerOption.correct | Are you OK? | (unchanged) |
| answerOption.distractors | ["I can help"] | (unchanged) |

#### Failure diagnosis
1. **Distractor near-paraphrase spoken.** Line 3 (6–9s): `"Let me help you."` — this is a near-paraphrase of distractor `"I can help"`. A child maps both to the help semantic field. The concern question and the help offer become indistinguishable.
2. **Visual action implies physical help.** Anchor 1 (`B 摔倒/看起来难过，A 跑过去关心`) plus "Let me help you" in dialogue → the muted scene reads as help-giving, not concern-checking. A fall + running over + reaching hand = helping, not asking.
3. **L012 ("I can help") is the paired help level.** L011 must teach ONLY concern; L012 teaches help. r2 L011 steals L012's target.

#### Required Dialogue rewrite
```
0-3s  Child A: "Are you OK?"                       ← concern question ONLY
3-6s  Child B: "I'm OK."                           ← B reassures
6-9s  Child A: "Are you hurt?"                     ← follow-up concern check (NOT help offer)
9-12s Child B: "I'm fine. Thank you."              ← B confirms OK
12-15s Both:   "You are brave."                    ← emotional close, no help action
```
**Banned lines:** `Let me help you`, `I can help`, `Let me help`, `I'll help you`, `Can I help?`, any help-offer construction. The help semantic field belongs to L012 only.

#### Required visual anchors
1. `Child B trips/sits on ground looking mildly upset; Child A kneels beside B at eye level — concern posture, NOT lifting or pulling B up`
2. `Child A's hands stay visible but empty and open — no reaching-to-lift, no pulling-up gesture; A checks B's face/expression, not B's body`
3. `Scene stays at ground level (both children seated/kneeling); no standing-help action at any beat`

#### Silent-viewer uniqueness statement
"A muted viewer sees Child B sitting on the ground looking upset, Child A kneeling beside and checking B's face with a worried expression. This can ONLY be inferred as concern-checking (Are you OK?), NOT as helping (I can help) because A does not lift, pull, or physically assist B — A only checks and waits."

#### Paired-level note
L012 ("I can help") must retain the help action. L011 and L012 must be visually asymmetric: L011 = concern-only (kneel, check, ask); L012 = help-action (lift, carry, fix). The concern question must not appear in L012, and the help offer must not appear in L011.

---

### L014 — "kind words"

| Field | r2 (broken) | r3 (required) |
|---|---|---|
| answerOption.correct | kind words | (unchanged) |
| answerOption.distractors | ["friend mind map"] | (unchanged) |

#### Failure diagnosis
1. **Distractor concept dominates the entire visual frame.** Anchors 1–4 all reference "延续思维导图" / "existing mind map" / "add icon/card to mind map." The entire scene is a mind-map craft activity. A muted viewer sees mind-map drawing → picks "friend mind map" (the distractor).
2. **Positive/negative contradiction.** Anchor 4 references `friendly-word icon or card`; the Negative Prompt bans `cards`, `flashcards`. This is a hard contradiction.
3. **Project sequel prop bleed.** L013 ("friend mind map") is the project that creates the mind map. L014 is the sequel that adds to it — but the sequel must teach "kind words," not re-teach the mind map. The mind map prop steals the lesson.

#### Required Dialogue rewrite
The r2 dialogue is semantically acceptable (`Here you go` / `Thank you` / `You're nice` / `Let's share`). Keep the kindness speech but verify naturalness. Minor adjustment for child-speak:
```
0-3s  Child A: "Here you go."           ← offering, unchanged
3-6s  Child B: "Thank you!"              ← unchanged
6-9s  Child A: "You're nice."            ← unchanged (or "You're so nice.")
9-12s Child B: "Let's share."            ← unchanged
12-15s Both:   "We are good friends!"    ← unchanged
```
**No dialogue change needed.** The fix is entirely in the visual layer.

#### Required visual anchors (full rewrite — remove ALL mind-map references)
1. `Two children sit together on a desert-oasis blanket; Child A hands a small toy/object to Child B — visible giving action (kindness = offering)`
2. `Child B smiles warmly and says thank you with eye contact — visible gratitude reaction`
3. `Both children share the object together (both hold it / play with it side by side) — visible sharing action`
4. `Foreground shows only the children and the shared object — NO mind map, NO drawn diagram, NO craft mat with branches/nodes/icons, NO card or flashcard prop`
5. `Warm cream daylight, soft sand background — uncluttered; the kindness exchange is the sole foreground meaning`

**Banned visual elements:** `mind map`, `思维导图`, `existing mind map`, `diagram`, `branch`, `node`, `icon`, `card`, `flashcard`, `craft mat with symbols`, any structured/branching visual prop. The Negative Prompt's `flashcards`, `cards` ban must be respected in the positive prompt.

#### Silent-viewer uniqueness statement
"A muted viewer sees two children exchanging an object with warm gestures — giving, thanking, sharing. This can ONLY be inferred as kindness exchange (kind words), NOT as a mind-map craft (friend mind map) because there is no diagram, map, branches, or structured drawing anywhere in the frame."

#### Scene rewrite
Change Scene from `"A shaded desert-oasis craft mat on the ground. 延续思维导图…"` to `"A simple open desert-oasis blanket where two children sit together. Foreground shows only the children and a shared object — no craft mat, no mind map, no diagram."` Remove the L013 prop reference entirely.

#### Learning objective note
The objective `在 L013 思维导图基础上` must be updated to remove the L013 dependency. New objective: `理解"友好的话"是维系友谊的具体方式。通过真实的友好行为（给予、感谢、分享）展示友善表达。` The curriculum link to L013 is a pedagogical connection, not a visual-prop mandate.

---

### L017 — "be a good friend"

| Field | r2 (broken) | r3 (required) |
|---|---|---|
| answerOption.correct | be a good friend | (unchanged) |
| answerOption.distractors | ["say hello first"] | (unchanged) |

#### Failure diagnosis
1. **Distractor action in visual montage.** Anchor 1: `回顾 U1 友好行为（打招呼→分享→帮助），以拥抱/击掌结束` — the montage explicitly includes 打招呼 (saying hello) as the first beat. A muted viewer sees a greeting → picks "say hello first" (the distractor).
2. **Slogan-style dialogue.** Lines 3–4 (`"Friends share."` / `"Friends help."`) are slogan chants, not natural 6-year-old speech. A child says "Let's share our toys," not "Friends share."
3. **Celebration ending encodes greeting-adjacent body language.** 拥抱/击掌 (hug/high-five) at the end can read as a greeting reunion, not a friendship summary.

#### Required Dialogue rewrite
```
0-3s  Child A: "You are my friend."                ← unchanged
3-6s  Child B: "You are my friend too."            ← unchanged
