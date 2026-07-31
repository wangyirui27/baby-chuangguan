# ZAI Semantic Audit — L006–L020

**Verdict: FAIL — 3 levels blocking (L012/L013/L014); 9 levels hold (semantic weakness); 3 levels advance (L006/L008/L011)**

Audit date: 2026-07-23
Auditor: glm (ZAI)
Sources read: quality-contract.md, semantic-contracts-l006-l050.json, desert-semantic-gate.js, check-desert-video-prompt.js, 15 prompt files (latest version per level), 5 approval-manifest.json (r3 levels)
Commands actually run:
- `node tools/video-prompts/check-desert-video-prompt.js <prompt> --spoken <cefr> --answer <label>` × 15 → all PASS (exit 0)
- `node _run_gate.js` (assertGenerationAllowed + evaluateNaturalDialogue + evaluateSpokenDialogue) × 15 → all PASS
- Manual semantic cross-read of contract JSON ↔ prompt TXT for all 15 levels

Phase: **Phase A (pre-generation).** No video exists for any L006–L020 level. No Phase B evidence (ASR/silent/entailment) available or claimed. 0 provider calls made. 0 credits consumed.

---

## Per-level gate table

| L  | Ver | Title               | Cat | CurrVerdict    | Checker | Gate | SilentTest | Verdict      |
|----|-----|---------------------|-----|----------------|---------|------|------------|--------------|
| 006| r3  | My name is...       | D   | REGENERATE     | PASS    | PASS | strong     | ADVANCE      |
| 007| r2  | What's your name?   | A   | REGENERATE     | PASS    | PASS | weak       | HOLD         |
| 008| r3  | I'm Chen Jie        | E   | REGENERATE     | PASS    | PASS | strong     | ADVANCE      |
| 009| r2  | Let's play together | A   | REGENERATE     | PASS    | PASS | weak       | HOLD         |
| 010| r2  | Share with friends  | C   | REGENERATE     | PASS    | PASS | weak       | HOLD         |
| 011| r3  | Are you OK?         | A   | REGENERATE     | PASS    | PASS | strong     | ADVANCE      |
| 012| r2  | I can help          | A   | REGENERATE     | PASS    | PASS | weak       | FAIL         |
| 013| r2  | friend mind map     | C   | DELETE         | PASS    | PASS | n/a        | FAIL         |
| 014| r3  | kind words          | C   | DELETE         | PASS    | PASS | medium     | FAIL         |
| 015| r2  | help a friend       | C   | REGENERATE     | PASS    | PASS | weak       | HOLD         |
| 016| r2  | say hello first     | C   | REGENERATE     | PASS    | PASS | weak       | HOLD         |
| 017| r3  | be a good friend    | C   | REGENERATE     | PASS    | PASS | strong     | HOLD         |
| 018| r2  | This is my mum      | A   | REGENERATE     | PASS    | PASS | weak       | HOLD         |
| 019| r2  | This is my dad      | A   | REGENERATE     | PASS    | PASS | weak       | HOLD         |
| 020| r2  | This is my grandma  | A   | REGENERATE     | PASS    | PASS | weak       | HOLD         |

---

## MUST REWRITE (blocking)

### L012 "I can help" (r2) — dialogue role logic contradiction

Dialogue:
- 0-3s A: "I can help!" (A offers help)
- 3-6s B: "Let me help you." (B also offers help — role flip)
- 6-9s A: "Thank you!" (A thanks B — A is now helpee)
- 9-12s B: "You're welcome."
- 12-15s Both: "We did it!"

Visual says "B掉了东西/搬不动，A主动帮忙" — B drops something, A helps. But by beat 2, B says "Let me help you" and by beat 3 A says "Thank you!" — the helper/helpee roles flip mid-dialogue. A child watching this hears A offer help, then B offer help back, then A thank B. The spoken narrative contradicts the visual narrative.

**Fix:** Rewrite beats 2-5 so B is consistently the helpee: B should say "Thank you!" at beat 2 (not "Let me help you"), then proceed to "You're welcome" → A, celebration closer.

### L013 "friend mind map" (r2) — curriculumVerdict DELETE, three layers disconnected

- Title "friend mind map" is an unspeakable noun label — no child says this phrase.
- spokenDialogue cefrTarget = "Look! She is my friend." — friendship expressions, not mind-map vocabulary.
- visualSemantics = mind-map craft process (drawing branches, connecting icons).
- Quiz asks "哪一句英语表达是「朋友思维导图」?" but no spoken line in the video contains or means "friend mind map".

The three layers (title/quiz, spoken, visual) point in three different directions. A child cannot transfer from classroom expression to this video because the quiz answer label has no spoken representation.

**Fix:** Honor DELETE verdict. Remove from production queue.

### L014 "kind words" (r3) — curriculumVerdict DELETE + Scene copy-paste contamination

Two issues:

1. **Scene contamination (L013→L014 residue):** The r3 Scene line reads:
   > "A shaded desert-oasis craft mat on the ground. A simple open desert-oasis blanket where two children sit together, give thanks, and share one small toy; **no craft mat**, mind map, diagram, branches, icons, cards, or flashcards."

   The opener "A shaded desert-oasis craft mat on the ground" is copy-paste residue from L013's craft-mat scene. The rest of the sentence explicitly bans craft mats. This is self-contradictory — a generation model will be confused by "craft mat on the ground" + "no craft mat" in the same sentence.

2. **Title/quiz disconnect:** Title "kind words" is an abstract slogan. spokenDialogue cefrTarget = "Here you go." The r3 visualSemantics are clean (proper giving/thanking/sharing scene, explicit mind-map ban). But the quiz answer label "kind words" doesn't map to any single spoken line. Distractor is "friend mind map" — cross-referencing L013.

**Fix:** If level is kept despite DELETE verdict: (a) rewrite Scene to remove "craft mat" opener; (b) resolve quiz label with curriculum team. If DELETE is honored: remove from queue.

---

## CAN HOLD (structure PASS, semantic weakness to fix before release)

### L007 "What's your name?" (r2) — meet-you contamination + thin visual

- Dialogue beats 3-4: "Nice to meet you, Lily." / "Nice to meet you too!" — this is L005's target expression occupying 2/5 beats of a name-asking level. Cross-level contamination.
- r2 visualSemantics: only anchor 1 is level-specific ("两人面对面，A好奇地询问"). Anchors 2-4 are generic "speaker face and mouth visible" filler. Silent-viewer test is weak: a muted viewer cannot distinguish "What's your name?" from any other face-to-face question.

### L009 "Let's play together" (r2) — repeated line + thin visual

- Dialogue beat 5 "Let's play together!" is identical to beat 1. 2/5 beats are the same line. forbiddenAutofillFromTitle=false allows this structurally, but it wastes 20% of screen time on repetition.
- r2 visualSemantics: only anchor 1 is specific ("A伸手邀请，B接受一起玩"). Silent-viewer test cannot distinguish "Let's play together" from "Come here" or "Let's go".

### L010 "Share with friends" (r2) — slogan title + thin visual

- Title category C (project label). cefrTarget = "Here, you can have this." — the spoken line is clean but disconnected from the quiz label "Share with friends".
- r2 visualSemantics: anchor 1 "分享玩具/食物的具体动作" is vague. The remaining anchors are filler.

### L015 "help a friend" (r2) — dialogue clone of L012 + project label

- Dialogue is structurally identical to L012: "Let me help you!" / "Here you go." / "Thank you!" / "You're welcome." / "Friends help!" — same help/thank/welcome/celebration pattern.
- Title category C. The spoken content overlaps heavily with L012 "I can help", making the two levels semantically indistinguishable from audio alone.

### L016 "say hello first" (r2) — cefrTarget collides with L001

- cefrTarget = "Hello!" — this is identical to L001's target expression. A child who already learned L001 gets no new spoken content from L016.
- Dialogue also includes "I'm Tom. Let's play!" — mixing name-intro (L006/L008) and play-invite (L009) into a hello level.
- r2 visualSemantics thin: anchor 1 "一个落单孩子犹豫，另一个主动走过去先打招呼" is the only level-specific cue. Silent-viewer test cannot distinguish "say hello first" from a generic greeting.

### L017 "be a good friend" (r3) — strong visual, slogan title gap

- r3 visualSemantics are rich: share → help → celebrate progression, explicit ban on greeting wave and first-meeting approach. This is the highest quality visual design in the C-category group.
- But title "be a good friend" is a behavioral slogan. cefrTarget = "You are my friend." The quiz asks for "be a good friend" but no child says that phrase. Same quiz-label gap as other C levels.
- HOLD pending curriculum decision on whether the slogan label is acceptable or needs a speakable replacement.

### L018/L019/L020 "This is my mum/dad/grandma" (r2) — thin visual, weak differentiation

- All three are template clones: only the family-member word changes.
- r2 visualSemantics per level: 1 vague anchor ("A指着身旁的妈妈/爸爸/奶奶介绍") + 3 filler anchors. The silent-viewer test is critically weak: a muted viewer sees a child pointing at an adult — but the only visual differentiators between mum/dad/grandma are "男性外貌特征" (dad) and "灰发特征" (grandma). These are too thin for a text-to-video model to reliably generate distinct results.
- L018/019/20 dialogue is identical except for the family word — 4/5 lines are template clones.

---

## CAN ADVANCE to single-sample generation (Phase A approved)

These three levels have r3 rewrites with level-specific, multi-anchor visualSemantics and clean layer separation:

### L006 "My name is..." (r3)
- visualSemantics explicitly bans meet-you gestures: "no greeting handshake, high-five, or meet-you gesture", "no wave, handshake". mustNotShow includes "Nice to meet you gesture, handshake, greeting wave".
- Name self-intro (chest-pointing) is visually distinct from meet-you (handshake).
- spokenDialogue is natural: "My name is Tom." / "My name is Lily." / "I'm Tom." / "I'm Lily." / "Tom and Lily!"
- Title category D (placeholder "...") is the only concern — curriculum team should replace "..." with a real name for the app display label.

### L008 "I'm Chen Jie" (r3)
- visualSemantics properly distinguishes name-statement from name-question: "showing self-identification rather than asking", "no questioning hand gesture", "listening nods replace any name-asking gesture".
- spokenDialogue is natural and textbook-bound (Chen Jie is a PEP character).
- Clean four-anchor visual with specific anti-contamination cues.

### L011 "Are you OK?" (r3)
- visualSemantics are the richest in this range: child sits after stumble, other kneels at eye level, hands open and low (not lifting/pulling), both stay seated/kneeling (no standing help action).
- This explicitly separates concern-checking from L012's helping action.
- spokenDialogue is natural: "Are you OK?" / "I'm OK." / "Are you hurt?" / "I'm fine. Thank you." / "You are brave."

---

## Cross-level findings

1. **r2 visualSemantics systemic weakness:** 9 of 15 levels (all r2) have only 1 level-specific visual anchor; the remaining 2-4 anchors are generic "speaker face and mouth visible" filler copied from the template. The silent-viewer test for these levels rests on a single anchor. An r2→r3 visual upgrade (matching L006/L008/L011 quality) is needed before release.

2. **C-category quiz label gap:** L010/L013/L014/L015/L016/L017 all have project-label or slogan titles that don't appear in any spoken line. The child learns a specific expression from the video but the quiz asks for the abstract label. This is a curriculum design issue, not a prompt structure issue — the gate correctly passes because forbiddenAutofillFromTitle prevents the title from being forced into dialogue.

3. **Cross-level dialogue contamination:** L007 borrows "Nice to meet you" from L005 (2 beats). L016 borrows "Hello!" from L001 (cefrTarget collision) and "I'm Tom. Let's play!" from L006/L009. L015 clones L012's dialogue structure. These reduce inter-level distinguishability.

4. **L013/L014 contamination zone confirmed:** L014 r3 Scene still carries the "craft mat" opener from L013 despite the r3 visualSemantics being cleaned. This is classic copy-paste pollution: the derived Scene field wasn't updated when the source visualSemantics were rewritten.

5. **questionType field missing from contracts JSON:** All 15 levels have questionType undefined in the semantic contracts JSON. The approval-manifest.json files for r3 levels do carry questionType (situation/dialogue/project), but the contract JSON — which the gate reads — does not. This means evaluateProjectTemplates() never activates for L013/L014/L017 (which are project-type in the manifest). The project-template independence check is effectively bypassed.

---

## Commands run (evidence)

```
# Structure checker — all 15 levels
node tools/video-prompts/check-desert-video-prompt.js output/media-production/desert-level-006-my-name-is-r3/prompts/level-006-my-name-is-r3.txt --spoken "My name is Tom." --answer "My name is..."
# → PASS (×15, one per level)

# Semantic gate — all 15 levels
node output/qa/desert-l006-l050-prompt-reqa-20260723/_run_gate.js
# → L6-L20: GATE-PASS | natural.ok=true spoken.ok=true

# 0 provider calls. 0 credits consumed. 0 LibTV/Seedance invocations.
```

Structural PASS ≠ publishable. The gate catches mechanical autofill and placeholder dialogue but cannot detect: dialogue role logic contradictions (L012), cross-layer semantic disconnection (L013), Scene copy-paste contamination (L014), or cross-level dialogue bleed (L007/L015/L016). These require human semantic audit — which is what this report provides.
