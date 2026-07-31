# DeepSeek R3 Repair Spec — L031, L033, L034, L039, L042, L046, L047, L049

Date: 2026-07-23
Reviewer: DeepSeek (leaf seat, prompt-only QA)
Scope: 8 P0 levels assigned to this seat within the 15-level rewrite set
Inputs: Cursor F6-F10 findings, Codex automated scan, FINAL.md summary, canonical r2 prompts

Boundary: Report only. No prompt/code edits. No LibTV/Seedance.

---

## Failure Summary

| Level | Title | Primary Failure Class | Evidence Source |
|------:|-------|----------------------|----------------|
| L031 | add a family photo | project-prop bleed | Cursor F6 |
| L033 | talk about family | project-prop bleed | Cursor F7 |
| L034 | different families | visual anchor too few specific | Codex |
| L039 | What pets do you know? | teacher cue conflict | Cursor F8 / Codex |
| L042 | Is it a pet? | pet-vs-wild classification missing | Cursor F9 |
| L046 | a monkey | non-English animal sound | Codex |
| L047 | What wild animals do you know? | teacher cue conflict (risk) | Codex / Cursor risk |
| L049 | draw a pet | project-prop bleed + distractor endorsement | Cursor F10 |

---

## Per-Level Repair Spec

### L031 — add a family photo

**R2 failure**: The prompt says "延续家庭树: 场景与 L030 一致：沙地手工垫上已有家庭树，本关往上面添加新人物". The photo/person is added **onto the existing family tree** prop from L030. A silent viewer sees a child editing a family tree — picks distractor "family tree". The word "photo" in the answer label never maps to a distinct photo object; it's drawn or pasted as an icon on the tree.

**Root cause**: Project-sequel bleed. L031 reuses L030's family tree as its visual anchor, making the two levels visually indistinguishable in mute. The "add" action + tree prop = "family tree" to a zero-English viewer, not "add a family photo".

**Repair spec**:
1. **Sever the tree**. Remove all references to "家庭树 / family tree" and "延续 L030". The visual anchor must be a standalone, picture-only family photo (a real printed photo or polaroid, not a tree).
2. **Concrete photo prop**. Anchor 1 must describe: a child holding or placing a real family photograph into a simple picture frame or album page — distinct from any tree/craft prop.
3. **Distinct surface**. The surface must be a frame, a wall, or a sand-table photo album — not the hand-drawn tree from L030.
4. **Dialogue**: Keep "Look! Here is my family." only if visible context is a real photo. Replace or remove "My grandma! Let me add her." and "Here, grandma goes here." — these reinforce tree-node placement. Instead, lines should be about looking at and talking about the photo: "This is my grandma." / "She has a nice smile."
5. **Source Situation**: Change to "Share a real family photo with a friend." Remove all tree/add language.

---

### L033 — talk about family

**R2 failure**: "孩子拿着画好的家庭树，向同伴逐一介绍家人" — child holds the family tree prop from L030 and points at it while talking. Mute viewer sees a child with a family tree → picks "family tree" from project unit, or "Who lives with you?" from the question unit. The prop dominates the "talk about family" action.

**Root cause**: Project-prop bleed. The family tree from L030 carries over as the dominant visual element. "Talking about family" while holding a family tree is visually identical to the tree-project levels (L030, L031, L032). The action of pointing at tree nodes = "family tree" in silent-forced-choice.

**Repair spec**:
1. **Drop the tree prop entirely**. No family tree, no drawn chart, no paper prop from prior levels.
2. **Live family members as anchors**. The child talks about family while standing with or pointing at actual silent family members in the courtyard — mum, dad, sibling visible in the scene. This creates a distinct visual from all project/craft levels.
3. **At least 2 concrete specific anchors** beyond face/mouth boilerplate:
   - Anchor 1: Child A stands near silent family members (mum + dad + sibling visible background), gestures toward them while speaking
   - Anchor 2: Child B nods and points to a specific family member in return
4. **Silent-viewer test**: A muted viewer must see "talking in front of family members" as uniquely distinct from "building a family tree" and "asking who lives with you."
5. **Dialogue**: Keep conversational lines ("This is my family." / "Tell me more!") but ensure they're spoken while indicating live people, not tree nodes.

---

### L034 — different families

**R2 failure**: Only 1 specific anchor — "两个孩子各拿自己的家庭树，一个大一个小，互相比较" — and 4 boilerplate face/mouth slots. Codex flags VISUAL_ANCHOR_TOO_FEW_SPECIFIC. Cursor rates RISK because the two-tree comparison is a valid comparison concept, but the anchors are too thin.

**Root cause**: Anchor under-specification. The concept "different families" needs the viewer to see two contrasting groups AND understand the comparison action. One Chinese-text anchor + four boilerplate repeats is insufficient. Additionally, the "family tree" prop still dominates — even though two trees for comparison is more semantically justified than L031/L033, the visual still centers on trees rather than families.

**Repair spec**:
1. **At least 3 concrete specific anchors beyond boilerplate**.
2. **Live contrast, not tree contrast**. Replace "两个孩子各拿自己的家庭树" with:
   - Anchor 1: Two groups of family members stand on left and right sides of the frame — left group has 5-6 people (big family), right group has 2-3 people (small family). Children stand between them, comparing.
   - Anchor 2: Child A points to the big family group, counts on fingers; Child B points to small family group, shows "small" gesture with hands close together.
   - Anchor 3: Both children turn to face each other, then each gestures to their own family group — clear "different families" composition.
3. **No tree dominance**. The comparison must be of the families themselves, not of drawn representations. Family trees may appear as secondary/background props but must not be the primary anchor.
4. **Silent-viewer test**: Muted viewer sees two distinctly sized family groups and children comparing them → uniquely "different families", not confusable with "My family is big" (L023) or "My family is small" (L024) which each show only one family.

---

### L039 — What pets do you know?

**R2 failure**: Visual anchor 1 says "Child A（教师角色）问 Child B；周围有各种宠物". Source Situation says "Teacher asks about pets." The Negative Prompt explicitly bans "teacher." This is a hard provider conflict — the positive prompt instructs a teacher role, and the negative prompt forbids it. The video generator receives contradictory signals.

Secondary risk: The mute viewer sees a child asking about pets with animals visible — this can also read as "I have a cat" (L041 distractor) if a pet is being held or close.

**Root cause**: Teacher cue conflict. The prompt frames the asking child as a teacher/authority figure. For pre-A1 children, an asker who points at animals and quizzes a peer visually reads as a teacher-figure regardless of clothing. The "various pets around" anchor doesn't distinguish the question form from possession statements.

**Repair spec**:
1. **Delete "教师角色" and "Teacher" from all fields**. Source Situation → "Two children talk about pets they know." Visual anchor 1 → "Child A asks Child B; several pets visible nearby (dog, cat, fish, bird)."
2. **Peer-to-peer framing only**. Both children must appear as equals — similar age, similar posture, no pointing-at/chalkboard/quiz-master stance. The asking child should look curious, not instructional.
3. **Question-form visual cue**. Add a specific interrogative anchor: Child A has an open palm gesture (asking) while looking at Child B, with pets visible but not held. Child B looks thoughtful (considering). This distinguishes the question situation from "I have a cat" (possession = holding/petting) and "I like dogs" (preference = smiling at one animal).
4. **Ensure at least 2 target-specific visual cues beyond face/mouth boilerplate**:
   - Cue 1: Open-palm asking gesture toward peer + multiple distinct pets visible in scene
   - Cue 2: Peer's thinking/listing response gesture (counting on fingers, looking around at animals)
5. **Verify Negative Prompt still says "teacher"** — it does and should stay. The fix is removing teacher from positive prompt, not weakening the ban.

---

### L042 — Is it a pet?

**R2 failure**: "Child A 指着一个动物问 Child B" — pointing at a single animal. This is a classification level (pet vs wild), but the visual contract only shows one animal and pointing. Mute viewer sees "what's that animal?" — cannot derive the pet/wild classification question. Distractor "I have a cat" is also viable if the animal shown is pet-like.

**Root cause**: Classification missing two-category contrast. A question that asks "is this category A or B?" must visually present both categories. Showing one animal + pointing = identification question, not classification question.

**Repair spec**:
1. **Two-zone layout required**. The frame must show two distinct animal areas simultaneously:
   - Zone 1 (left/near): A pet animal (dog or cat) with a child or near-home setting — visually "pet" zone
   - Zone 2 (right/far): A wild animal (tiger or monkey) behind a low safe barrier or in natural habitat — visually "wild" zone
2. **Sorting/contrast action**. Replace "指着一个动物问" with:
   - Anchor 1: Child A gestures broadly at both zones, then points with a questioning expression at Child B
   - Anchor 2: Child B points to the pet zone → then points to the wild zone → showing the comparison
   - Anchor 3: A third animal (ambiguous) enters the scene, and both children look at it, making the classification question live
3. **Visual distinction between zones**: Pet zone has home elements (bowl, leash, cushion); wild zone has habitat elements (trees, rocks, distance).
4. **Silent-viewer test**: Muted viewer sees two visually distinct animal zones + children sorting/gesturing between them → "is this a pet or wild?" is the only reading. Single-animal pointing must not be sufficient.
5. **Dialogue**: Keep "Is it a pet?" / "No, it's a wild animal." / "Yes, that's a pet!" — but ensure each line corresponds to a specific zone gesture.

---

### L046 — a monkey

**R2 failure**: Dialogue line at 9-12s: Child B says "Ooh ooh aah aah!" — this is non-English animal sound / gibberish. The prompt's own Audio section and Negative Prompt both forbid "gibberish, non-English speech." Codex flags DIALOGUE_NON_ENGLISH_SOUND.

**Root cause**: Animal sound mimicry inserted as dialogue. The writer likely intended "child imitates monkey" but the hard gate requires all spoken audio to be natural child English. Mimicked animal sounds are not English and violate the contract.

**Repair spec**:
1. **Replace the sound line with English observation**. Change 9-12s line to a natural English comment about the monkey. Options:
   - "It can climb so fast!" (ties to prior line "It can climb trees!")
   - "Look, it's swinging!" (action-focused)
   - "It makes funny faces!" (observation)
2. **No animal sound imitation anywhere**. Not just this line — audit that no other Dialogue lines in the 8-level set contain mimicry.
3. **Rest of dialogue is fine**: "Look! A monkey!" / "It's so funny!" / "It can climb trees!" / "Monkeys are silly!" — all natural child English.

---

### L047 — What wild animals do you know?

**R2 failure**: Source Situation says "Teacher asks about wild animals." While the r2 visual anchors removed explicit "（教师角色）" (unlike L039 which retained it), the Source Situation still frames the scene as teacher-led. Codex flags this as POSITIVE_TEACHER_CUE risk. Cursor rates as RISK: "ensemble must stay wild not pet."

**Root cause**: Residual teacher framing in Source Situation + structural similarity to L039 (both are "What X do you know?" with animal ensembles). The prompt may generate a scene where one child takes a teacher-like questioning stance toward the other. Additionally, the "各种野生动物" ensemble risks visual overlap with pet levels if the animals appear in a domestic/courtyard setting.

**Repair spec**:
1. **Remove "Teacher" from Source Situation**. Change to "Two children talk about wild animals they know."
2. **Ensure peer Q&A framing**. Confirm visual anchor 1 does NOT contain any teacher/presenter/quiz-master language. Current: "Child A 问 Child B；周围有各种野生动物" — this is already peer-framed in r2, which is correct. But add the same interrogative gesture cues as L039: open palm asking, peer thinking response.
3. **Wild-only animal ensemble with habitat contrast**. The animals around the children must be unambiguously wild:
   - All animals in natural habitat settings (trees, rocks, distant savanna/forest backdrop) — NOT in courtyard/domestic setting
   - No pet animals (dog, cat, fish bowl, birdcage) visible — this prevents mute viewer from picking "What pets do you know?" (L039)
4. **At least 2 specific anchors beyond face/mouth**:
   - Cue 1: Child A gestures broadly at a wild animal scene (multiple wild animals in natural setting) while asking
   - Cue 2: Child B points at distant wild animals one by one, listing on fingers — natural counting/listing gesture
5. **Cross-check against L039**: L039 courtyard + pets, L047 wild habitat + wild animals. The two must be visually disjoint to prevent mute confusion.

---

### L049 — draw a pet

**R2 failure**: Three interlocking problems:
1. **Project-prop bleed**: "孩子在图画书的宠物页上画一只猫/狗" — drawing ON a picture-book page. Source Situation: "Add a pet page." This makes the visual identical to L048 (animal picture book).
2. **Distractor endorsement**: Dialogue closes with "Now our book has a cat page!" — explicitly names the book as the project artifact. The distractor is "animal picture book" — the prompt literally says the book has the page.
3. **Learning objective text**: "学会在图画书的宠物页上画一种宠物" — the objective itself embeds the book framing.

**Root cause**: The level was designed as a book-project sequel (adding a page to the animal picture book from L048), same pattern as L014 (kind words on mind map) and L031 (photo on family tree). All three fail the same way: the sequel prop (mind map / family tree / picture book) becomes the dominant visual identifier, making the level indistinguishable from its predecessor in mute.

**Repair spec**:
1. **Sever the book**. Remove ALL references to "图画书 / picture book / book page / our book". This includes:
   - Source Situation: Change to "Draw a pet animal."
   - Visual anchor 1: Change to "孩子在一张独立的纸上/沙画板上画一只猫或狗" — standalone sheet or sand drawing pad, NOT a book page.
   - Learning objective: Change to "理解'画一种宠物'的项目动作。学会独立画出一种宠物。" — remove "在图画书的宠物页上".
2. **Standalone drawing surface only**. The drawing surface must be:
   - A single loose sheet of craft paper on a sand mat
   - OR a sand drawing pad / portable sketchpad (not book-bound)
   - OR a child drawing directly on sand/ground with a stick
   - Must NOT be: a book, a multi-page album, a continuing project from L048
3. **Dialogue rewrite**. Replace closing line. Change "Now our book has a cat page!" to something that celebrates the drawing itself, not its place in a book:
   - "What a nice cat!" / "I love your drawing!" / "Let's show everyone!"
4. **Ensure 2+ concrete visual anchors beyond face/mouth**:
   - Anchor 1: Child drawing on standalone sheet/sand pad with drawing tool visible (crayon, stick)
   - Anchor 2: The partially-drawn animal is clearly visible on the drawing surface — ears, tail, or paws forming
5. **Cross-check against L048**: L048 = flipping through a pre-made animal picture book (book prop, no drawing action). L049 = actively drawing on a standalone surface (drawing action, no book). These must be visually disjoint.

---

## Cross-Cutting Remediation Rules

These apply to all 8 levels and should be verified by a re-scan:

### Rule 1: Project-prop bleed (L031, L033, L049)
Any project-sequel level must NOT use the prior project's prop as its primary visual anchor. The new level's action must be distinguishable from the old level's artifact in silent forced-choice.

### Rule 2: Teacher cue conflict (L039, L047)
"No teacher" means no role, no stance, no questioning posture that reads as teacher-to-student. Peer Q&A only. Open-palm asking gesture + thinking response gesture as visual cues.

### Rule 3: Pet-vs-wild classification (L042)
Classification levels require simultaneous two-category visual contrast on screen. One animal + pointing is identification, not classification.

### Rule 4: Non-English animal sound (L046)
All spoken audio must be natural child English. Animal sound mimicry ("Ooh ooh aah aah!", "woof woof", "meow meow") is banned. Use English observations instead.

### Rule 5: Visual anchor specificity (L034)
Each level must have at least 2 concrete, target-specific visual anchors beyond the face/mouth/no-text boilerplate. Boilerplate in slots 2-5 counts as 1 anchor, not 5.

---

## Verification Checklist for Codex Writer

After rewriting r3 prompts, the Codex writer must verify:

- [ ] L031: No "家庭树 / family tree" in prompt text. Real photo prop described.
- [ ] L033: No "家庭树 / family tree" prop. Live family members as visual anchors.
- [ ] L034: 3+ specific anchors beyond boilerplate. Live family groups, not tree comparison.
- [ ] L039: No "教师角色 / Teacher" in positive prompt or Source Situation. Peer Q&A framing.
- [ ] L042: Two-zone layout with pet zone + wild zone. Sorting/contrast action.
- [ ] L046: No animal sound mimicry in Dialogue. All lines are natural English.
- [ ] L047: No "Teacher" in Source Situation. Wild habitat setting only, no pets visible.
- [ ] L049: No "图画书 / book / page" in any field. Standalone drawing surface.

---

## Not Audited

- Real MP4 frames, contact sheets, ASR, audio, volume, lip-sync (no video generated)
- Non-assigned P0 levels (L006, L008, L011, L014, L017, L022, L025 — covered by other seats)
- Prompt-check.json / manifest sha256 / approval manifest validation (Mimo audit seat)
