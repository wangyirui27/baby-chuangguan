# 06b Codex Question Field Fix

## Scope

- Wrote only `script.js`, `quiz.test.js`, this report, and `red-green.log`.
- Fixed R3 truth-source leak: desert expression levels no longer generate `question` as `Which word means ...`.

## RED

Command:

```bash
node --test --test-name-pattern "PEP classroom-transfer|classroom expression" quiz.test.js
```

Failure confirmed from stale desert `question` field:

```text
Input:
'Which word means 你好?'
operator: 'doesNotMatch'
```

Before that, the test file had a pre-existing truncated-output artifact around the service-worker test that caused a SyntaxError. I removed only that invalid fragment and closed the test so the requested focused RED could run.

## Fix

- Added a focused regression test:
  - `levels[0].question` remains `Which word means 妈妈?`.
  - every `desertLevels[]` question rejects `/Which word means|\bword\b|单词/`.
  - every `desertLevels[]` question requires `/expression|英语表达|课堂情境/i`.
- Updated `buildLevelsFromUnits`:
  - `promptKind === 'expression'` now emits `Which classroom expression means ${zhTitle}?`.
  - default/island word levels still emit `Which word means ${zhTitle}?`.

## GREEN

Same command passed:

```text
ok 1 - desert PEP classroom-transfer question field uses classroom expression wording
# pass 1
# fail 0
```
