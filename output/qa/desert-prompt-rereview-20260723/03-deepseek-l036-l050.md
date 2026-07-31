# DeepSeek QA: Desert L036-L050 r2 Prompts

**Reviewer**: DeepSeek (deepseek-v4-pro)
**Date**: 2026-07-23
**Scope**: L036-L050, 15 levels, r2 canonical prompts
**Status**: ALL PASS with 2 LOW risks, 0 FAIL

---

## 1. Structure & Integrity Check

| Check | Result |
|-------|--------|
| 15/15 prompt files exist | PASS |
| prompt-check.json all `ok: true` | PASS |
| SHA256 matches approval-manifest.json | PASS (15/15 verified) |
| approval-manifest `approved=false` | PASS (15/15) |
| approval-manifest `dryRun=true` | PASS (15/15) |
| approval-manifest `creditsBurned=false` | PASS (15/15) |
| `independent_prompt_qa.pass=false` (awaiting review) | PASS (correct pre-QA state) |

### SHA256 Verification Detail

| Level | Expected (manifest) | Actual | Match |
|-------|---------------------|--------|-------|
| L036 a-little-cat | fe32eadb... | fe32eadb... | PASS |
| L037 a-fish | bcf12284... | bcf12284... | PASS |
| L038 a-bird | d86834b4... | d86834b4... | PASS |
| L039 what-pets-do-you-know | 3a8f9243... | 3a8f9243... | PASS |
| L040 i-like-dogs | 65e0bb7a... | 65e0bb7a... | PASS |
| L041 i-have-a-cat | 2db21654... | 2db21654... | PASS |
| L042 is-it-a-pet | d76f37d6... | d76f37d6... | PASS |
| L043 a-wild-panda | d5b73e05... | d5b73e05... | PASS |
| L044 a-big-tiger | c262bbc6... | c262bbc6... | PASS |
| L045 an-elephant | 8dbaf6d7... | 8dbaf6d7... | PASS |
| L046 a-monkey | 1b769e4c... | 1b769e4c... | PASS |
| L047 what-wild-animals-do-you-know | 7b02f616... | 7b02f616... | PASS |
| L048 animal-picture-book | 4d34cbef... | 4d34cbef... | PASS |
| L049 draw-a-pet | bdfc75d0... | bdfc75d0... | PASS |
| L050 draw-a-wild-animal | 45696b6d... | 45696b6d... | PASS |

---

## 2. Label as Natural Spoken Words (pet/animal/object label check)

**Criterion**: answerOption/title/label must NOT be mechanically read as dialogue. Labels must appear naturally in child conversation or be abstracted into concrete action.

### Pet group (L036-L041)

| Lvl | Answer Label | How it appears in Dialogue | Verdict |
|-----|-------------|---------------------------|---------|
| L036 | a little cat | "Look! A little cat!" → natural noticing exclamation | PASS |
| L037 | a fish | "Look! A fish!" → natural noticing exclamation | PASS |
| L038 | a bird | "Look! A bird!" → natural noticing exclamation | PASS |
| L039 | What pets do you know? | Direct line from Child A, natural question in conversation | PASS |
| L040 | I like dogs | "I like dogs." → natural preference statement, followed by "Why?" | PASS |
| L041 | I have a cat | "I have a cat." → natural introduction, followed by "What's its name?" | PASS |
| L042 | Is it a pet? | "Is it a pet?" → natural classification question in sorting game | PASS |

### Wild animal group (L043-L047)

| Lvl | Answer Label | How it appears in Dialogue | Verdict |
|-----|-------------|---------------------------|---------|
| L043 | a wild panda | "Look! A wild panda!" → natural noticing | PASS |
| L044 | a big tiger | "Look! A big tiger!" → natural noticing | PASS |
| L045 | an elephant | "Look! An elephant!" → natural noticing | PASS |
| L046 | a monkey | "Look! A monkey!" → natural noticing | PASS |
| L047 | What wild animals do you know? | Direct line from Child A, natural question | PASS |

### Project/action group (L048-L050)

| Lvl | Answer Label | How it appears in Dialogue | Verdict |
|-----|-------------|---------------------------|---------|
| L048 | animal picture book | NOT chanted. Dialogue uses "Look! A dog!" / "We made a book about animals!" — label abstracted into concrete actions | PASS |
| L049 | draw a pet | NOT chanted. "I'm drawing a cat!" / "Now our book has a cat page!" — action-specific | PASS |
| L050 | draw a wild animal | NOT chanted. "Now I'm drawing a tiger!" / "Now our book has wild animals too!" — action-specific | PASS |

**Verdict**: 15/15 PASS. No label is mechanically recited. Project labels (L048-L050) are correctly abstracted into concrete child actions. Answer labels in dialogue group (L039, L042, L047) are used as natural conversation openers, not drills.

---

## 3. Pet vs Wild Animal Visual Distinguishability

**Criterion**: Can the silent-viewer distinguish pet from wild animal? Can they tell dog vs cat vs fish vs bird vs panda vs tiger just from the picture?

### Per-level silent-viewer anchor analysis

| Lvl | Visual Anchor (from prompt) | Can silent viewer distinguish? |
|-----|---------------------------|-------------------------------|
| L036 | 绿洲中一只小猫 | YES — cat is visibly present |
| L037 | 绿洲水洼中一条鱼在游 | YES — fish swimming in water |
| L038 | 绿洲树上一只鸟 | YES — bird on tree |
| L039 | Child A asking; various pets around | YES — multiple pets visible (ensemble context) |
| L040 | 孩子抚摸/指向小狗，面带笑容 | YES — child petting/pointing at dog |
| L041 | 孩子抱着/指着自家的猫 | YES — child holding/pointing at cat |
| L042 | Child A 指着一个动物问 Child B | **RISK LOW** — single animal; silent viewer sees pointing+asking but classification intent unclear without audio |
| L043 | 沙漠远处/山林中的熊猫 | YES — panda visible in wild context |
| L044 | 画面中的大老虎 | YES — tiger visible |
| L045 | 画面中的大象 | YES — elephant visible |
| L046 | 画面中的猴子（树上/岩石上） | YES — monkey on tree/rock |
| L047 | Child A asking; various wild animals around | YES — multiple wild animals (ensemble) |
| L048 | 图画书制作: two children flipping through homemade picture book, each page shows a different animal | YES — diverse animals per page (dog/cat/fish/bird) |
| L049 | 孩子在图画书的宠物页上画一只猫/狗 | YES — drawing cat/dog on pet page |
| L050 | 孩子在图画书的野生动物页上画一只老虎/大象 | YES — drawing tiger/elephant on wild animal page |

### Animal type differentiation

Within the pet group, each animal has a distinct visual anchor:
- L036 cat → visible cat in oasis
- L037 fish → fish swimming in water (unambiguous, different from land animals)
- L038 bird → bird on tree (unambiguous)
- L040 dogs → child interacting with dog
- L041 cat → child holding cat

Within the wild group:
- L043 panda → panda in mountain/desert
- L044 tiger → tiger (with stripes unique)
- L045 elephant → elephant (with trunk unique)
- L046 monkey → monkey on tree/rock

**Verdict**: 14/15 PASS. L042 flagged as RISK LOW. The silent viewer sees one child pointing at one animal — this visually reads as "what's that?" not "is it a pet (vs wild)?" The sorting concept relies on audio/dialogue context. The anchor would be stronger with two visible animals (one pet, one wild) for comparison.

---

## 4. Natural Children's English

**Criterion**: Dialogue must sound like real child-to-child talk, not teacher drill or vocabulary chant.

### Dialogue samples

**L036** a-little-cat:
```
0-3s:  "Look! A little cat!"
3-6s:  "It's so small!"         ← natural reaction
6-9s:  "Hello, little cat!"     ← child talking to animal
9-12s: "It's so soft!"           ← sensory observation
12-15s:"Cats are cute!"          ← emotional response
```
Verdict: PASS. Genuine child wonder. No drill pattern.

**L038** a-bird:
```
3-6s:  "It can fly!"            ← observation
6-9s:  "Can you hear it?"       ← natural question
9-12s: "Yes, tweet tweet!"      ← child onomatopoeia, playful
12-15s:"Birds can sing!"        ← conclusion
```
Verdict: PASS.

**L040** i-like-dogs:
```
0-3s:  "I like dogs."
3-6s:  "Why?"                    ← natural back-and-forth
6-9s:  "They are fun and cute!"  ← child-like reasoning
9-12s: "I like cats."            ← contrast, NOT a drill
12-15s:"We like different pets!" ← acceptance, not correction
```
Verdict: PASS. Real conversation, includes genuine child reasoning.

**L042** is-it-a-pet:
```
0-3s:  "Is it a pet?"
3-6s:  "No, it's a wild animal."   ← clear categorization
6-9s:  "What about this one?"      ← follow-up
9-12s: "Yes, that's a pet!"        ← positive affirmation
12-15s:"Pets and wild animals!"    ← synthesis
```
Verdict: PASS. Natural sorting dialogue.

**L046** a-monkey:
```
3-6s:  "It's so funny!"
6-9s:  "It can climb trees!"
9-12s: "Ooh ooh aah aah!"       ← NOTE: onomatopoeic monkey imitation
12-15s:"Monkeys are silly!"
```
Verdict: PASS with note. "Ooh ooh aah aah" is deliberate onomatopoeia (child mimicking monkey), not gibberish. The negative prompt bans "gibberish" but this line is authored as character imitation — different category. The Audio section requires "No whisper, mumble, gibberish" but this is neither — it's a recognizable monkey sound imitation by a child character, semantically coherent with "a monkey" theme.

**L049** draw-a-pet:
```
0-3s:  "I'm drawing a cat!"
3-6s:  "Oh, nice!"               ← encouragement
6-9s:  "Look, here are the ears." ← showing detail
9-12s: "It looks like a real cat!"← compliment
12-15s:"Now our book has a cat page!"
```
Verdict: PASS. Action-specific, not project-label-chant.

| Check | Result |
|-------|--------|
| All dialogue is 5-beat (3s each) | PASS (all 15) |
| No Chinese speech in dialogue | PASS |
| No narrator | PASS |
| No "repeat after me" drill | PASS |
| No title/project label chant | PASS |
| Sentences are short (≤8 words each) | PASS |
| Natural back-and-forth (not recitation) | PASS |

**Verdict**: 15/15 PASS. Dialogue is authentic child conversation across all levels.

