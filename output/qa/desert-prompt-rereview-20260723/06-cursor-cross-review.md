# Cursor Auto cross-review — Desert L006–L050 r2 prompts

| Field | Value |
|---|---|
| Reviewer | Cursor Auto (human-semantic QA seat) |
| Date | 2026-07-23 |
| Workspace | `/tmp/baby-chuangguan` → `/Users/yr/宝宝闯关` |
| Canonical | `output/media-production/desert-level-XXX-*-r2/prompts/*-r2.txt` |
| Boundary | **Prompt-only.** No prompt/code edits. No LibTV/Seedance. No MP4 / contact-sheet / ASR / audio QA (raw/final/contact-sheets/audio-check empty for sampled dirs). |
| Inputs read | 45 r2 prompts; `desert-level-semantic-contracts-l006-l050.json`; quality contract; parent machine audit `00-*`; DeepSeek `03-*` (cross-check, not rubber-stamp) |

## 0. Verdict

**FAIL (batch).** Do not flip `independent_prompt_qa.pass=true`. Do not approve LibTV.

Checker floor can stay green while human semantic gates fail. DeepSeek L036–L050 “ALL PASS” is too soft on L042 / L049 distractor bleed and L039 teacher-role conflict.

Counts (human-semantic, fail-closed):

| Bucket | Count | Levels |
|---|---:|---|
| FAIL | 12 | L006, L008, L011, L014, L022, L025, L031, L033, L039, L042, L049 + L017 (montage/distractor) |
| RISK | 10 | L007, L009, L015, L028, L029, L034, L040, L047, L048, L050 |
| PASS (keepable on prompt text) | 23 | rest — still need Phase B evidence after any future MP4 |

Provider hard-constraint text (negative prompt / front–¾ face / mouth visible / no readable text) is **structurally present on all 45**. Failures below are mostly **semantic uniqueness**, not missing negative bans.

---

## 1. Scope (explicit)

| Audited | Not audited |
|---|---|
| Prompt Dialogue / Silent-viewer / Unknown-language / Camera / Negative Prompt | Real MP4 frames |
| Contract `answerOption` vs Dialogue / visual anchors | Contact sheets |
| Distractor uniqueness on **described** situation | ASR / volume / lip-sync |
| Project-label / title-as-dialogue / unnatural speech | App binding / quiz UX |

Empty artifact dirs sampled (`raw/`, `final/`, `contact-sheets/`, `audio-check/`): no video evidence to read.

---

## 2. High-risk deep dives

### F1. L006 `My name is...` — FAIL — distractor spoken + weak mute cue

- Distractor: `Nice to meet you`
- Dialogue closes: `"Nice to meet you!"` (12–15s) — **exact distractor in mouth**
- Mute anchors: `手指胸口 + 微笑 + 面对新朋友` — equally reads as greeting / nice-to-meet-you
- Unknown-language: alien noise maps to “meeting a new friend,” not uniquely to name-formula
- Fix direction: drop closing meet-you line; keep finger-to-chest + clear name-exchange beats only; ban meet-you gesture at end

### F2. L008 `I'm Chen Jie` — FAIL — distractor inside opening line

- Distractor: `What's your name?`
- Opening: `"I'm Chen Jie. What's your name?"` — **answer + distractor same beat**
- Mute: `A 做自我介绍，B 倾听后回应` — cannot encode proper name “Chen Jie”; also looks like name-asking scene
- Specific personal name is not a silent-viewable object without banned nametag text
- Fix: split turns — A only states name; B answers separately; never co-utter the quiz distractor

### F3. L011 `Are you OK?` — FAIL — help language / action bleed

- Distractor: `I can help`
- Dialogue 6–9s: `"Let me help you."` after concern
- Action allows helping; mute setup is fall + run-to-care, which often becomes physical help
- Forced-choice silent: clip supports both “Are you OK?” and “I can help”
- Fix: concern-only beats (kneel, check, soft question); no help utterance / no lift-assist until a different level

### F4. L014 `kind words` — FAIL — visual is still friend mind map

- Distractor: `friend mind map`
- Anchors explicitly: `延续思维导图` / `existing mind map` / add icons onto **L013 map**
- Mute viewer sees mind-map craft → picks distractor
- Dialogue (`Here you go` / `You're nice` / `Let's share`) is kindness-OK, but picture teaches mind-map project
- Also: `friendly-word icon or card` risks card/prop that fights “no cards” hard gate
- Fix: leave mind map; show live kindness acts only (offer, smile, share) with no map prop

### F5. L022 / L025 — FAIL — Q↔A pair cross-contaminates Dialogue

**L022** answer `Who lives with you?` / distractor `I live with my parents`  
Dialogue includes both question **and** `"I live with my mum and dad."` (≈ distractor).

**L025** answer `I live with my parents` / distractor `Who lives with you?`  
Opens with `"Who lives with you?"` then answer — **distractor is line 1**.

Mute home scene supports both quiz options. Unknown-language cannot decide question vs statement.

### F6. L031 `add a family photo` — FAIL — visual = family tree edit

- Distractor: `family tree`
- Anchors: `延续家庭树` / add person **onto existing family tree**
- Mute: tree craft dominates → selects `family tree`
- “Photo” never required as a distinct photo object (vs drawn person icon)
- Fix: show real picture-only photo prop being placed into a simple frame/album — not onto a tree

### F7. L033 `talk about family` — FAIL — holding family tree

- Distractor: `Who lives with you?`
- Anchor: `孩子拿着画好的家庭树，向同伴逐一介绍家人`
- Mute reads as L030 project reprise, not “talk about family” as distinct option; also overlaps family-tree unit
- Fix: talk while pointing at live silent family members in courtyard — no tree prop

### F8. L039 `What pets do you know?` — FAIL — teacher role vs hard bans

- Anchor / Scene: `Child A（教师角色）`
- Same prompt bans `classroom` / `teacher` in Negative Prompt and Scene
- Mute: “teacher asks, pets around” ≠ unique vs distractor `I have a cat` (possession can look the same if one pet is hugged)
- Title used as first Dialogue line is OK for question-type **only if** visual is peer Q&A without teacher framing

### F9. L042 `Is it a pet?` — FAIL — mute cannot teach classification

- Anchor only: `Child A 指着一个动物问 Child B`
- Dialogue implies pet vs wild, but **visual contract does not require** two-category contrast on screen
- Mute forced-choice: looks like generic “what’s that?” / can support distractor `I have a cat` if pet is held
- Fix: simultaneous pet + wild animal; sort/point left-right; clear habitat contrast

### F10. L049 `draw a pet` — FAIL — closes on picture-book ownership

- Distractor: `animal picture book`
- Visual: drawing **on picture-book pet page**
- Dialogue end: `"Now our book has a cat page!"` — explicitly endorses book project
- Mute + alien-noise both support distractor as strongly as “draw a pet”
- Disagree with DeepSeek PASS here
- Fix: single sheet/sand drawing of pet; ban “book page” framing; leave book to L048

### F11. L017 `be a good friend` — FAIL (borderline → fail-closed)

- Distractor: `say hello first`
- Anchor montage: `打招呼→分享→帮助` then hug — **includes distractor action**
- Mute can select “say hello first” from greeting beat
- Fix: no greeting-first beat; only share+help+celebrate, or single non-hello friendship cue

---

## 3. Compact table — every level ≥1 row

Legend: **P** PASS · **R** RISK · **F** FAIL. Focus columns: Mute / Alien / DistUniq / Dialogue natural / Provider text.

| L | Title | Type risk | Mute | Alien | DistUniq | Dialogue | Prov | Result | One-line note |
|---:|---|---|---|---|---|---|---|---|---|
| 6 | My name is... | intro | weak | weak | **F** | natural but closes on distractor | ok | **F** | `Nice to meet you!` = distractor |
| 7 | What's your name? | ask | weak | weak | R | ok | ok | **R** | ask pose OK vs name-state; still thin anchors |
| 8 | I'm Chen Jie | name | fail | fail | **F** | packs distractor Q | ok | **F** | `"I'm Chen Jie. What's your name?"` |
| 9 | Let's play together | invite | ok | ok | R | chant×2 natural | ok | **R** | ensure no share-object prop |
| 10 | Share with friends | share | ok | ok | P | natural | ok | **P** | give/receive object clear |
| 11 | Are you OK? | care | R | R | **F** | help line | ok | **F** | `Let me help you.` |
| 12 | I can help | help | ok | ok | P | natural | ok | **P** | assist action vs care-only |
| 13 | friend mind map | project | ok | ok | P | no label chant | ok | **P** | branch map ≠ kind-words |
| 14 | kind words | project | **F** | **F** | **F** | ok speech | card risk | **F** | map continuation = distractor |
| 15 | help a friend | project | ok | ok | R | ok | ok | **R** | vs kind words OK if help-only |
| 16 | say hello first | project | ok | ok | P | natural Hello | ok | **P** | approach+greet clear |
| 17 | be a good friend | project | **F** | R | **F** | ok | ok | **F** | montage includes hello |
| 18 | This is my mum | family | ok | ok | P | natural | ok | **P** | adult mum must be visually distinct |
| 19 | This is my dad | family | ok | ok | P | natural | ok | **P** | same |
| 20 | This is my grandma | family | ok | ok | P | natural | ok | **P** | age cue needed in render |
| 21 | This is my grandpa | family | ok | ok | P | natural | ok | **P** | age cue needed in render |
| 22 | Who lives with you? | ask | R | R | **F** | speaks ≈distractor | ok | **F** | answer line ≈ `I live with my parents` |
| 23 | My family is big | size | ok | ok | P | natural | ok | **P** | 5–6 people specified |
| 24 | My family is small | size | ok | ok | P | natural | ok | **P** | must stay 2–3 people in render |
| 25 | I live with my parents | state | R | R | **F** | opens with distractor | ok | **F** | line1 = `Who lives with you?` |
| 26 | I have a sister | sib | ok | ok | P | natural | ok | **P** | girl sibling visible |
| 27 | I have a brother | sib | ok | ok | P | natural | ok | **P** | boy sibling visible |
| 28 | This is my family | group | R | R | R | natural | ok | **R** | vs love — need present/point not hug-only |
| 29 | We love each other | affection | R | R | R | natural | ok | **R** | hug must beat “small family” |
| 30 | family tree | project | ok | ok | P | no label chant | ok | **P** | tree nodes clear vs photo |
| 31 | add a family photo | project | **F** | **F** | **F** | ok | ok | **F** | edits tree = distractor |
| 32 | draw my family | project | ok | ok | P | drawing talk | ok | **P** | free draw ≠ photo add |
| 33 | talk about family | talk | **F** | R | **F** | ok | ok | **F** | holds family tree prop |
| 34 | different families | compare | R | R | R | ok | ok | **R** | two trees; watch vs draw |
| 35 | a pet dog | pet | ok | ok | P | natural | ok | **P** | dog visible |
| 36 | a little cat | pet | ok | ok | P | natural | ok | **P** | cat visible |
| 37 | a fish | pet | ok | ok | P | natural | ok | **P** | water+fish |
| 38 | a bird | pet | ok | ok | P | natural | ok | **P** | bird on tree |
| 39 | What pets do you know? | ask | R | R | R | title-as-Q OK | **F** teacher | **F** | `教师角色` vs teacher ban |
| 40 | I like dogs | pref | ok | ok | R | also `I like cats` | ok | **R** | mute dog-pet OK; keep dog dominant |
| 41 | I have a cat | own | ok | ok | P | natural | ok | **P** | hold/own cat |
| 42 | Is it a pet? | classify | **F** | **F** | **F** | ok speech | ok | **F** | point≠pet/wild sort |
| 43 | a wild panda | wild | ok | ok | P | natural | ok | **P** | panda+wild setting |
| 44 | a big tiger | wild | ok | ok | P | natural | ok | **P** | stripes |
| 45 | an elephant | wild | ok | ok | P | natural | ok | **P** | trunk |
| 46 | a monkey | wild | ok | ok | P | natural | ok | **P** | climb |
| 47 | What wild animals…? | ask | R | R | R | title-as-Q | ok | **R** | ensemble must stay wild not pet |
| 48 | animal picture book | project | ok | ok | R | no label chant | ok | **R** | flip book; avoid active draw |
| 49 | draw a pet | project | **F** | **F** | **F** | book-page close | ok | **F** | `"our book has a cat page!"` |
| 50 | draw a wild animal | project | ok | ok | R | ok | ok | **R** | tiger draw OK if not pet-like |

---

## 4. Pattern failures (cross-cutting)

1. **Paired quiz options share one Dialogue script** (L006/meet-you, L008/name-Q, L011/help, L022↔L025). Checker does not catch “distractor substring in Dialogue.”
2. **Project sequel levels reuse prior project prop** (L014 on mind map, L031 on family tree, L033 holding tree, L049 on book) → silent viewer selects previous project label.
3. **Anchor padding**: slots 2–5 often only repeat `speaker face and mouth visible…` — concrete mute cue is 1/5. Parent audit flag is directionally right; not every such level is human-FAIL if that one cue is strong (e.g. L023 size).
4. **Question-form answers** (L007/L022/L039/L042/L047) need visible interrogative situation + option uniqueness without speaking the sibling statement/question.
5. **Provider text OK ≠ semantic OK.** Face/mouth/negative bans look complete on all 45; batch still blocked on meaning.

---

## 5. Keepable vs blocking

### Keepable (prompt text, still Phase-B later)

L010, L012, L013, L016, L018–L021, L023–L024, L026–L027, L030, L032, L035–L038, L041, L043–L046 (and several RISK with minor copy fixes).

### Blocking before any LibTV / `independent_prompt_qa.pass`

Must rewrite at least: **L006, L008, L011, L014, L017, L022, L025, L031, L033, L039, L042, L049**.

Also re-check RISK cluster after fixes so Q↔A pairs stay asymmetric.

---

## 6. Disagreements with other seats

| Seat | Claim | Cursor stance |
|---|---|---|
| DeepSeek 03 | L036–L050 ALL PASS | Reject: L039 teacher conflict, L042 mute fail, L049 book distractor |
| Parent 00 machine | many FAIL for generic anchors | Agree direction; not all generic-anchor FAILs equal severity — prioritize distractor-in-dialogue + project-prop bleed |
| Structure checker | likely PASS | Irrelevant to this seat’s FAIL set |

---

## 7. Final gate statement

- Prompt-only independent cross-review: **FAIL**
- `independent_prompt_qa.pass` must stay **false**
- No MP4/ASR/contact-sheet claims made; none available to read
- Next human work: rewrite blocking twelve; re-run this semantic matrix; only then consider single-sample LibTV
)
