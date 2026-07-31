# DeepSeek must-rewrite — 15 levels contract+prompt fix

Date: 2026-07-23
Version: r4-batchready-20260723
Phase: A (pre-generation, prompts-only)
Provider calls: 0
Credits burned: 0

## Summary

15 C-group levels (from final verdict `11-hermes-final-verdict.md`) processed:
- 10 levels: contract rewritten + new r4 prompt generated, checker PASS
- 5 levels: DELETE verdict honored — `skipGeneration:true`, removed from generation queue

## DELETE 5 levels — Option A (skip generation)

| Level | Title | Action |
|-------|-------|--------|
| L013  | friend mind map | `skipGeneration:true`, removed from queue |
| L014  | kind words | `skipGeneration:true`, removed from queue |
| L030  | family tree | `skipGeneration:true`, removed from queue |
| L031  | add a family photo | `skipGeneration:true`, removed from queue |
| L048  | animal picture book | `skipGeneration:true`, removed from queue |

All 5: `curriculumVerdict=DELETE` in contract. Generator now skips them with status `skipped` (not failed). No prompts generated for these levels.

## Rewrite 10 levels — contract + prompt

### L012 "I can help" — helper/helpee role fix
- Root cause: dialogue had role flip mid-scene (A helps → B helps back → A thanks)
- Fix: A stays helper throughout; B stays helpee throughout
  - New dialogue: A:"I can help!" / B:"Thank you!" / A:"You're welcome." / B:"You are so kind!" / Both:"We did it!"
- Visual anchors: 5 concrete English anchors showing drop → help → return → thank → celebrate
- Checker: PASS (`spoken="I can help!"`, answer="I can help")

### L029 "We love each other" — CEFR target fix
- Root cause: `cefrTargetExpression` was "This is my family." (L028's target, copy-paste)
- Fix: `cefrTargetExpression = "We love each other."`
- New dialogue: love/hug family scene — "We love each other." / "Mum gives me a hug." / "Dad gives me a hug too." / "Family is love!"
- Visual anchors: group hug, mum hug, dad hug, warm eye contact
- Checker: PASS (`spoken="We love each other."`, answer="We love each other")

### L035-L038 — pet species-specific visual anchors
Root cause: anchors 2-4 were filler ("speaker face...×3"); anchor 1 was 1-line Chinese. Animal sticker risk.

| Level | Animal | New species-specific anchors |
|-------|--------|------------------------------|
| L035  | dog    | wagging tail, child kneeling to pet, child pointing |
| L036  | cat    | pointed ears/whiskers, paw-licking, child crouching nearby |
| L037  | fish   | fins/tail visible, side-to-side swimming, two children kneeling by water |
| L038  | bird   | wings/beak/feathers, flap and fly between branches, child pointing at flight |

All 4: 4 concrete English anchors each, alive-and-moving animal, child-animal physical interaction visible.
Checker: all PASS.

### L043-L045 — wild animal species-specific visual anchors
Root cause: same filler pattern as pets. Animal as decoration/blob risk.

| Level | Animal | New species-specific anchors |
|-------|--------|------------------------------|
| L043  | panda  | black/white fur, eating bamboo with paws, safe observation distance |
| L044  | tiger  | orange/black stripes, walking, children behind low natural barrier |
| L045  | elephant | long trunk swing, big flapping ears, child mimicking ears |

All 3: 4 concrete English anchors, species-distinctive features, safe observation framing.
Checker: all PASS.

### L050 "draw a wild animal" — standalone sheet alignment with L049
- Root cause: L050 referenced "图画书/picture book" but L049 explicitly bans book/project-book
- Fix: aligned with L049's standalone-sheet pattern
  - Learning objective: "独立纸张或沙画板上" (not book)
  - Visual anchors: standalone sheet/drawing pad, no picture book/page-turning/album
  - Dialogue: "What a nice tiger!" (not "Now our book has...")
  - mustNotShow: added "picture book, 图画书, book page, page-turning, album, our book"
- Checker: PASS (`spoken="Now I'm drawing a tiger!"`, answer="draw a wild animal")

## Code changes

### 1. `tools/video-prompts/desert-level-semantic-contracts-l006-l050.json`
- 15 levels modified (10 rewritten + 5 skipGeneration added)
- All changes are in the spokenDialogue, visualSemantics, learningObjective, and skipGeneration fields

### 2. `tools/video-prompts/lib/attach-desert-semantic-contracts.js`
- Added: `skipGeneration` field pass-through from contract to level object
- Removed: hardcoded L013/L014 mind-map visual overrides in `ensureProjectVisualFloor`

### 3. `tools/video-prompts/generate-desert-video-batch.js`
- Added: `skipGeneration` check in batch loop — skipped levels logged as `status:'skipped'` (not failed)
- Added: `skipped` count in summary output

## Checker results — 10/10 PASS

```
L012: PASS (spoken="I can help!", answer="I can help")
L029: PASS (spoken="We love each other.", answer="We love each other")
L035: PASS (spoken="Look! A pet dog!", answer="a pet dog")
L036: PASS (spoken="Look! A little cat!", answer="a little cat")
L037: PASS (spoken="Look! A fish!", answer="a fish")
L038: PASS (spoken="Look! A bird!", answer="a bird")
L043: PASS (spoken="Look! A wild panda!", answer="a wild panda")
L044: PASS (spoken="Look! A big tiger!", answer="a big tiger")
L045: PASS (spoken="Look! An elephant!", answer="an elephant")
L050: PASS (spoken="Now I'm drawing a tiger!", answer="draw a wild animal")
```

All checks run with explicit `--spoken <cefrTargetExpression> --answer <answerOption.correct>`. No --legacy-title-target, no positional target.

## Generated prompt directories (10)

```
output/media-production/desert-level-012-i-can-help-r4-batchready-20260723/
output/media-production/desert-level-029-we-love-each-other-r4-batchready-20260723/
output/media-production/desert-level-035-a-pet-dog-r4-batchready-20260723/
output/media-production/desert-level-036-a-little-cat-r4-batchready-20260723/
output/media-production/desert-level-037-a-fish-r4-batchready-20260723/
output/media-production/desert-level-038-a-bird-r4-batchready-20260723/
output/media-production/desert-level-043-a-wild-panda-r4-batchready-20260723/
output/media-production/desert-level-044-a-big-tiger-r4-batchready-20260723/
output/media-production/desert-level-045-an-elephant-r4-batchready-20260723/
output/media-production/desert-level-050-draw-a-wild-animal-r4-batchready-20260723/
