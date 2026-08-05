'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { createMysqlLearningRepository } = require('./mysql-learning-repository');

const USER = { id: '11111111-1111-4111-8111-111111111111' };
const PROFILE = {
  id: 'profile-1',
  local_user_id: USER.id,
  child_name: '豆豆',
  child_age: 4,
  map_music: 1,
  auto_pronunciation: 0,
  show_chinese_hints: 1,
  map_world: 'desert',
  math_attempts: JSON.stringify([
    {
      attemptId: 'load-math-1',
      levelId: 3,
      targetCount: 3,
      selectedCount: 3,
      isCorrect: true,
      ts: '2026-08-04T10:00:00.000Z',
    },
  ]),
};

function makeClient(responses, calls) {
  return {
    async execute(sql, params = []) {
      calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
      if (!responses.length) throw new Error(`unexpected query: ${sql}`);
      const response = responses.shift();
      if (response instanceof Error) throw response;
      return response;
    },
  };
}

function makePool(poolResponses, connectionResponses = []) {
  const calls = [];
  const connection = {
    ...makeClient(connectionResponses, calls),
    async beginTransaction() { calls.push({ tx: 'begin' }); },
    async commit() { calls.push({ tx: 'commit' }); },
    async rollback() { calls.push({ tx: 'rollback' }); },
    release() { calls.push({ tx: 'release' }); },
  };
  return {
    calls,
    ...makeClient(poolResponses, calls),
    async getConnection() { return connection; },
  };
}

test('loadState maps MySQL rows to the existing learning state contract', async () => {
  const pool = makePool([
    [[PROFILE]],
    [[{ world_id: 'desert', completed_levels: '[1,2]', unlocked_through: 3 }]],
    [[{ activity_day: new Date('2026-07-20T00:00:00.000Z') }]],
    [[{
      world_id: 'desert',
      level_id: 2,
      word: 'pear',
      zh_title: '梨',
      selected: 'grape',
      correct: 'pear',
      mistake_count: 2,
      updated_at: new Date('2026-07-20T08:00:00.000Z'),
    }]],
  ]);
  const repository = createMysqlLearningRepository({ pool });

  const state = await repository.loadState(USER);

  assert.deepEqual(state.profile, { childName: '豆豆', childAge: '4' });
  assert.deepEqual(state.preferences, {
    mapMusic: true,
    autoPronunciation: false,
    showChineseHints: true,
    mapWorld: 'desert',
  });
  assert.deepEqual(state.progressByWorld.desert, { completed: [1, 2], unlockedThrough: 3 });
  assert.deepEqual(state.learningActivity.dates, ['2026-07-20']);
  assert.equal(state.mistakeBook.items[0].updatedAt, '2026-07-20T08:00:00.000Z');
  assert.equal(state.mathAttempts.length, 1);
  assert.equal(state.mathAttempts[0].attemptId, 'load-math-1');
  assert.equal(state.mathAttempts[0].levelId, 3);
  assert.equal(state.mathAttempts[0].isCorrect, true);
});

test('saveState writes learning fields and math attempts inside a transaction', async () => {
  const pool = makePool(
    [
      [[PROFILE]],
      [[{ world_id: 'desert', completed_levels: '[1,3]', unlocked_through: 4 }]],
      [[{ activity_day: '2026-07-21' }]],
      [[]],
    ],
    [
      [[PROFILE]],
      [{ affectedRows: 1 }],
      [[PROFILE]],
      [{ affectedRows: 1 }],
      [{ affectedRows: 1 }],
      [{ affectedRows: 1 }],
      [{ affectedRows: 1 }],
      [{ affectedRows: 1 }],
      [{ affectedRows: 1 }],
      [{ affectedRows: 1 }],
      [{ affectedRows: 1 }],
      [[]],
    ],
  );
  const repository = createMysqlLearningRepository({ pool });

  const saved = await repository.saveState(USER, {
    profile: { childName: '豆豆', childAge: '5' },
    preferences: {
      mapMusic: false,
      autoPronunciation: true,
      showChineseHints: false,
      mapWorld: 'desert',
    },
    progressByWorld: {
      ocean: { completed: [1], unlockedThrough: 2 },
      desert: { completed: [1, 3], unlockedThrough: 4 },
    },
    learningActivity: { dates: ['2026-07-21'] },
    mistakeBook: { items: [] },
    mathAttempts: [{ attemptId: 'mysql-math', levelId: 2, targetCount: 2, selectedCount: 1, isCorrect: false }],
  });

  assert.deepEqual(saved.progressByWorld.desert, { completed: [1, 3], unlockedThrough: 4 });
  assert.deepEqual(pool.calls.filter((call) => call.tx).map((call) => call.tx), ['begin', 'commit', 'release']);
  assert.ok(pool.calls.some((call) => /INSERT INTO baby_profiles/.test(call.sql)));
  assert.ok(pool.calls.some((call) => /UPDATE baby_profiles SET math_attempts/.test(call.sql)));
  const mathWrite = pool.calls.find((call) => /UPDATE baby_profiles SET math_attempts/.test(call.sql || ''));
  assert.ok(mathWrite);
  const payload = JSON.parse(mathWrite.params[0]);
  assert.equal(payload[0].attemptId, 'mysql-math');
  assert.equal(payload[0].levelId, 2);
  assert.equal(payload[0].isCorrect, false);
  assert.ok(pool.calls.some((call) => /INSERT INTO baby_world_progress/.test(call.sql)));
  assert.ok(pool.calls.some((call) => /INSERT INTO baby_learning_activity/.test(call.sql)));
  assert.ok(pool.calls.some((call) => /SELECT world_id, level_id FROM baby_mistakes/.test(call.sql)));
});
