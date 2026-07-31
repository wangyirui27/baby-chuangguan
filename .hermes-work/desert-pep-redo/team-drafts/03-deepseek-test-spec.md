# 03-deepseek-test-spec: 沙漠 PEP 重构 — 测试契约设计

> 席位：DeepSeek
> 任务：只读分析 → 输出测试断言规范
> 依据：`script.js` 当前 desertLevels / buildLevelsFromUnits / questionPromptText / renderDetail；锚点文档 source-notes.md / desert-pep-classroom-transfer-review.md；现有 quiz.test.js 测试模式。

---

## 1. 当前实现关键片段（基线）

### 1.1 buildLevelsFromUnits (L232-253)

```js
function buildLevelsFromUnits(units, overrides = {}, titleFor = ...) {
  return units.flatMap((unit, unitIndex) =>
    unit.words.map(([word, zhTitle], wordIndex) => {
      const id = unitIndex * 10 + wordIndex + 1;
      const correct = (id - 1) % 4;
      const options = [1, 2, 3].map((offset) =>
        unit.words[(wordIndex + offset) % unit.words.length][0]
      );
      options.splice(correct, 0, word);
      return {
        id, title: titleFor(word), zhTitle, topic: unit.topic,
        duration: ..., guidance: ..., question: `Which word means ${zhTitle}?`,
        options, correct,
      };
    })
  );
}
```

**关键约束：** id = unitIndex*10 + wordIndex + 1，每单元固定 10 条，options 从本单元内轮转。重做后仍需满足 id 1-200、每个 PEP 单元分配关卡数之和 = 200。

### 1.2 desertLevels (L262)

```js
const desertLevels = buildLevelsFromUnits(desertPhraseUnits, {}, (phrase) => phrase);
```

当前 `desertPhraseUnits` 有 20 个 topic × 10 条。重做后需替换为 PEP 12 单元数据。

### 1.3 questionPromptText (L1065-1067)

```js
function questionPromptText(level) {
  return `小朋友，视频里学到的单词，哪一个是${level.zhTitle}的意思？`;
}
```

**问题：** 写死"单词"。沙漠内容是短语/表达，不是单词。重做后题干需随 level.promptKind 变化。

### 1.4 renderDetail (L3390-3466)

```js
function renderDetail(level) {
  ...
  const questionHtml = `小朋友，视频里学到的单词，<br>哪一个是 <strong>「${level.zhTitle}」</strong> 的意思？`;
  ...
}
```

**问题：** 同样硬编码"单词"。两处（spoken + HTML）必须一起修。

---

## 2. 必须新增/更新的测试断言

按实现顺序排列。所有测试放在 `quiz.test.js`，沿用 `node:test` + `node:assert/strict`，不动 script.js / index.html / sw.js。

### 2.1 数据结构与数量

#### T1: desertLevels 仍是 200 关且 id 不重复

```js
test('desert PEP redo: 200 levels, 1-200 ids, no gaps', () => {
  const desert = levelsForMapWorld('desert');
  assert.equal(desert, desertLevels);
  assert.equal(desert.length, 200);
  assert.deepEqual(
    desert.map((l) => l.id).sort((a, b) => a - b),
    Array.from({ length: 200 }, (_, i) => i + 1)
  );
});
```

#### T2: 每个 level 包含 PEP 元数据字段

```js
test('desert PEP redo: every level has pep metadata fields', () => {
  desertLevels.forEach((level) => {
    assert.ok(typeof level.pepGrade === 'string', `L${level.id}: pepGrade missing`);
    assert.ok(['3A', '3B'].includes(level.pepGrade), `L${level.id}: pepGrade not 3A/3B`);
    assert.ok(typeof level.pepUnit === 'string', `L${level.id}: pepUnit missing`);
    assert.ok(typeof level.pepPart === 'string', `L${level.id}: pepPart missing`);
    assert.ok(['A', 'B', 'C', 'Revision'].includes(level.pepPart), `L${level.id}: pepPart bad value`);
    assert.ok(typeof level.pepFocus === 'string', `L${level.id}: pepFocus missing`);
    assert.ok(typeof level.functionTag === 'string', `L${level.id}: functionTag missing`);
    assert.ok(typeof level.transferProbe === 'string', `L${level.id}: transferProbe missing`);
    assert.ok(typeof level.promptKind === 'string', `L${level.id}: promptKind missing`);
    // promptKind must not be "word" or "单词"
    assert.notEqual(level.promptKind, 'word');
    assert.notEqual(level.promptKind, '单词');
  });
});
```

#### T3: 12 个 PEP 单元全部覆盖

```js
test('desert PEP redo: all 12 PEP units represented', () => {
  const units = new Set(desertLevels.map((l) => l.pepUnit));
  // 12 unique PEP unit names from source-notes.md
  const expected = new Set([
    'Making friends',
    'Different families',
    'Amazing animals',
    'Plants around us',
    'The colourful world',
    'Useful numbers',
    'Meeting new people',
    'Expressing yourself',
    'Learning better',
    'Healthy food',
    'Old toys',
    'Numbers in life',
  ]);
  assert.deepEqual(units, expected);
});
```

#### T4: pepGrade 分布 — 三上 6 单元 + 三下 6 单元

```js
test('desert PEP redo: 3A and 3B both present', () => {
  const a = desertLevels.filter((l) => l.pepGrade === '3A');
  const b = desertLevels.filter((l) => l.pepGrade === '3B');
  assert.ok(a.length >= 80 && a.length <= 120, `3A has ${a.length}, expected ~100`);
  assert.ok(b.length >= 80 && b.length <= 120, `3B has ${b.length}, expected ~100`);
  assert.equal(a.length + b.length, 200);
});
```

### 2.2 旧偏离主题清理

#### T5: 旧生活短语偏移主题不在沙漠主线

```js
test('desert PEP redo: off-topic life-phrase themes are gone from main line', () => {
  const topics = new Set(desertLevels.map((l) => l.topic || ''));
  // These 6 legacy groups should not appear as desert main-line topics
  const banned = ['洗漱卫生', '天气季节', '出行交通', '购物消费', '运动比赛', '职业梦想'];
  banned.forEach((t) => {
    assert.ok(!topics.has(t), `off-topic group "${t}" still in desert main line`);
  });
  // The total topic count should be 12 (one per PEP unit), not 20
  assert.equal(topics.size, 12);
});
```

#### T6: 旧 topic 名全部替换为 PEP 单元名

```js
test('desert PEP redo: topic field matches PEP unit', () => {
  const oldTopics = [
    '日常问候', '课堂规则', '一日三餐', '零食水果', '洗漱卫生', '身体动作',
    '情绪表达', '家庭互动', '玩具游戏', '颜色形状', '数字时间', '天气季节',
    '动物宠物', '动物园', '出行交通', '购物消费', '学校学习', '音乐艺术',
    '运动比赛', '职业梦想',
  ];
  const currentTopics = new Set(desertLevels.map((l) => l.topic));
  oldTopics.forEach((t) => {
    assert.ok(!currentTopics.has(t), `old topic "${t}" still present`);
  });
});
```

### 2.3 questionPromptText 和 renderDetail — 不再硬编码"单词"

#### T7: questionPromptText 不包含"单词"
