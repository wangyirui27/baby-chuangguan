'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');

const { createLearningRouter } = require('./learning');
const { normalizeLearningSnapshot, toProfilePatch } = require('./insforge-learning-repository');

function createServer(repository) {
  const app = express();
  app.use(express.json());
  app.use('/api/learning', createLearningRouter({
    repository,
    requireAuth: (req, res, next) => {
      if (req.headers.authorization !== 'Bearer test-token') {
        return res.status(401).json({ error: '未登录', code: 'UNAUTHORIZED' });
      }
      req.user = { id: '11111111-1111-4111-8111-111111111111' };
      next();
    },
  }));

  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, baseUrl: `http://127.0.0.1:${server.address().port}` });
    });
    server.on('error', reject);
  });
}

async function request(baseUrl, method, path, body, token = 'test-token') {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data };
}

test('toProfilePatch maps client fields to database columns', () => {
  assert.deepEqual(toProfilePatch({
    childName: '小朋友小朋友小朋友小朋友',
    childAge: '5',
    mapMusic: false,
    autoPronunciation: true,
    showChineseHints: false,
    mapWorld: 'desert',
  }), {
    child_name: '小朋友小朋友小朋友小',
    child_age: 5,
    map_music: false,
    auto_pronunciation: true,
    show_chinese_hints: false,
    map_world: 'desert',
  });
});

test('normalizeLearningSnapshot fills missing worlds and sanitizes progress', () => {
  const snapshot = normalizeLearningSnapshot({
    preferences: { mapWorld: 'desert' },
    progressByWorld: {
      ocean: { completed: [3, 1, 1, 0, 201], unlockedThrough: 2 },
    },
    learningActivity: { dates: ['2026-07-20', 'bad', '2026-07-20'] },
    mistakeBook: {
      items: [
        { levelId: 3, word: 'pear', selected: 'grape', correct: 'pear', count: 2 },
        { levelId: 999, word: 'bad' },
      ],
    },
  });

  assert.deepEqual(snapshot.progressByWorld.ocean, {
    completed: [1, 3],
    unlockedThrough: 4,
  });
  assert.deepEqual(snapshot.progressByWorld.desert, { completed: [], unlockedThrough: 1 });
  assert.deepEqual(snapshot.learningActivity.dates, ['2026-07-20']);
  assert.equal(snapshot.mistakeBook.items.length, 1);
  assert.equal(snapshot.mistakeBook.items[0].worldId, 'desert');
});

test('learning routes require auth', async () => {
  const repository = { loadState: async () => ({ ok: true }) };
  const { server, baseUrl } = await createServer(repository);
  try {
    const result = await request(baseUrl, 'GET', '/api/learning/state', undefined, 'bad-token');
    assert.equal(result.status, 401);
    assert.equal(result.data.code, 'UNAUTHORIZED');
  } finally {
    server.close();
  }
});

test('PUT /api/learning/state saves normalized snapshot', async () => {
  let savedUser;
  let savedSnapshot;
  const repository = {
    saveState: async (user, snapshot) => {
      savedUser = user;
      savedSnapshot = snapshot;
      return { saved: true, snapshot };
    },
  };
  const { server, baseUrl } = await createServer(repository);
  try {
    const result = await request(baseUrl, 'PUT', '/api/learning/state', {
      profile: { childName: '豆豆', childAge: '4' },
      preferences: { mapWorld: 'desert', mapMusic: false },
      progressByWorld: {
        desert: { completed: [2, 2, 1], unlockedThrough: 1 },
      },
      learningActivity: { dates: ['2026-07-20'] },
      mistakeBook: { items: [{ levelId: 2, selected: 'pear', correct: 'grape', count: 3 }] },
    });

    assert.equal(result.status, 200);
    assert.equal(savedUser.id, '11111111-1111-4111-8111-111111111111');
    assert.equal(savedSnapshot.profile.child_name, '豆豆');
    assert.equal(savedSnapshot.profile.map_world, 'desert');
    assert.deepEqual(savedSnapshot.progressByWorld.desert, {
      completed: [1, 2],
      unlockedThrough: 3,
    });
  } finally {
    server.close();
  }
});

test('POST /api/learning/quiz-attempts validates payload', async () => {
  let savedAttempt;
  const repository = {
    recordQuizAttempt: async (_user, attempt) => {
      savedAttempt = attempt;
      return { id: `${attempt.worldId}-${attempt.levelId}` };
    },
  };
  const { server, baseUrl } = await createServer(repository);
  try {
    const bad = await request(baseUrl, 'POST', '/api/learning/quiz-attempts', { worldId: 'moon', levelId: 1 });
    assert.equal(bad.status, 400);
    assert.equal(bad.data.code, 'INVALID_QUIZ_ATTEMPT');

    const good = await request(baseUrl, 'POST', '/api/learning/quiz-attempts', {
      worldId: 'ocean',
      levelId: 1,
      selected: 'mom',
      correct: 'mom',
      isCorrect: true,
    });
    assert.equal(good.status, 201);
    assert.equal(good.data.id, 'ocean-1');
    assert.deepEqual(savedAttempt, {
      worldId: 'ocean',
      levelId: 1,
      selected: 'mom',
      correct: 'mom',
      isCorrect: true,
    });
  } finally {
    server.close();
  }
});

test('POST /api/learning/support-feedback validates message length', async () => {
  const repository = {
    createSupportFeedback: async () => ({ id: 'feedback-id' }),
  };
  const { server, baseUrl } = await createServer(repository);
  try {
    const bad = await request(baseUrl, 'POST', '/api/learning/support-feedback', { message: '短' });
    assert.equal(bad.status, 400);
    assert.equal(bad.data.code, 'INVALID_SUPPORT_FEEDBACK');

    const good = await request(baseUrl, 'POST', '/api/learning/support-feedback', {
      message: '这个按钮点了没有反应',
      context: { route: 'mine' },
    });
    assert.equal(good.status, 201);
    assert.equal(good.data.id, 'feedback-id');
  } finally {
    server.close();
  }
});
