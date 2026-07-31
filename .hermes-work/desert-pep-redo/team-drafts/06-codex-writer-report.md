# Codex Writer Report - Desert PEP R3

## Changed Files

- `script.js`: replaced the old desert life-phrase curriculum with a PEP 3A/3B 12-unit classroom-transfer curriculum; added object-entry support in `buildLevelsFromUnits`; added expression-aware `questionPromptText` and shared `questionPromptHtml`.
- `quiz.test.js`: added RED/GREEN assertions for 200 desert levels, PEP metadata, unit/type coverage, old-title removal, and renderDetail single-source prompt HTML; updated cache-version assertions.
- `index.html` / `sw.js`: bumped `script.js` and service-worker cache versions to `20260722-desert-pep-r3`.
- `docs/curriculum/desert-map-level-questions.md`: regenerated from current `desertLevels` with all 200 levels and PEP metadata.
- `docs/curriculum/desert-pep-classroom-transfer-review.md` and `docs/curriculum/level-question-design.md`: updated from R2 failure wording to R3 “已重构为 PEP 单元预学闭环”, while retaining the official-PDF audit boundary.
- `.hermes-work/desert-pep-redo/red-green.log`: appended RED/GREEN and final test outputs.

## RED

Command: `node --test --test-name-pattern desert quiz.test.js`

Expected failures were confirmed from the old implementation:

- Actual desert topics were the old 20 life themes (`日常问候`, `课堂规则`, `一日三餐`, ...), not the required 12 PEP units.
- `questionPromptText(desertLevels[0])` still returned “视频里学到的单词”.

The same broad `desert` pattern also exposed an existing unrelated decor assertion (`Math.max(...counts) >= 4`).

## GREEN

Command: `node --test --test-name-pattern "PEP classroom-transfer|classroom expression|H5 app shell registers|quiz feedback uses Holly|app splash uses" quiz.test.js`

Result: 5 tests passed, 0 failed.

The new curriculum contract passes:

- `desertLevels.length === 200`
- IDs are unique and `levelsForMapWorld('desert') === desertLevels`
- PEP units include `三上 U1 Making friends`, `三上 U4 Plants around us`, `三下 U6 Numbers in life`
- every desert level has `pepGrade`, `pepUnit`, `pepPart`, `pepFocus`, `functionTag`, `transferProbe`, `promptKind: expression`, `questionType`
- each PEP unit has at least 3 of `recognition/situation/dialogue/project`; global project coverage exists
- desert prompt no longer says “单词”; ocean prompt remains unchanged
- `renderDetail` derives `questionHtml` from the shared helper
- old off-track titles are not present in `desertLevels`

## Full Test Status

Command: `node --test quiz.test.js`

Result: 93 tests ran; 86 passed; 7 failed.

Remaining failures are outside the assigned write scope or pre-existing in the dirty tree:

- `root app asset references resolve to local files`: regex catches `assets/video（仅` from a source comment.
- `map course exposes two hundred preschool English levels`: old expected object omits current `videoFile`.
- `desert decor plan is organic`: decor density assertion unrelated to PEP curriculum.
- `map HUD source still binds world levels`: missing `assets/ocean/ocean-bg.webp`.
- `tablet CSS contracts...` and `compact journey responsive structure...`: `style.css` assertions; `style.css` is do-not-modify.
- `all levels reuse only the five approved natural square-island styles`: missing catalog asset; `assets/*` is do-not-modify.

Command: `npm run test`

Status: started and logged; it reported `ambient-sfx` failure, then continued into backend HTTP tests. I interrupted it after more than 3 minutes to avoid leaving a hanging process. Log marks `[exit 130 - interrupted after >3min]`.

## Audit Boundary

This R3 uses `.hermes-work/pep-alignment/source-notes.md` directory-level anchors. It has not been逐页 checked against official PEP PDFs or physical textbooks. If official PDFs are provided later, the next pass should map each expression to exact textbook pages and dialogue/project text.

## Remaining Risk

- Some expressions are directory-aligned prelearning prompts, not confirmed official textbook wording.
- Existing question audio manifest still covers ocean word prompts; desert expression prompt audio regeneration is a separate asset/audio task.
- Full repo test health is currently blocked by unrelated dirty-tree asset/CSS/test-contract failures.
