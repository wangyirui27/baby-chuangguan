'use strict';

const express = require('express');
const { IpRateLimiter } = require('./security');
const {
  WORLD_IDS,
  createInsForgeLearningRepository,
  normalizeLearningSnapshot,
  toProfilePatch,
} = require('./insforge-learning-repository');

const writeLimiter = new IpRateLimiter(180, 15 * 60 * 1000);

function jsonError(res, status, error, code) {
  return res.status(status).json({ error, code });
}

function requireObject(body) {
  return body && typeof body === 'object' && !Array.isArray(body);
}

function validateQuizAttempt(body) {
  if (!requireObject(body)) return null;
  const worldId = WORLD_IDS.includes(body.worldId) ? body.worldId : null;
  const levelId = Number(body.levelId);
  if (!worldId || !Number.isInteger(levelId) || levelId < 1 || levelId > 200) return null;
  return {
    worldId,
    levelId,
    selected: String(body.selected || '').trim().slice(0, 40),
    correct: String(body.correct || '').trim().slice(0, 40),
    isCorrect: body.isCorrect === true,
  };
}

function validateFeedback(body) {
  if (!requireObject(body)) return null;
  const message = String(body.message || '').trim();
  if (message.length < 4 || message.length > 300) return null;
  return {
    message,
    context: requireObject(body.context) ? body.context : {},
  };
}

function clampInteger(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isInteger(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function boundedInteger(value, min, max) {
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max ? number : null;
}

function validateMathCoachAttempt(entry) {
  if (!requireObject(entry)) return null;
  const levelId = boundedInteger(entry.levelId, 1, 200);
  const targetCount = clampInteger(entry.targetCount, 0, 10, 0);
  const responseMs = Number.isInteger(Number(entry.responseMs))
    ? clampInteger(Math.round(Number(entry.responseMs)), 0, 600000, 0)
    : null;
  if (!levelId) return null;
  return {
    levelId,
    skill: String(entry.skill || 'count').slice(0, 24),
    targetCount,
    selectedCount: Number.isInteger(Number(entry.selectedCount))
      ? clampInteger(entry.selectedCount, 0, 10, 0)
      : null,
    isCorrect: entry.isCorrect === true,
    mode: ['easier', 'same', 'harder'].includes(entry.mode) ? entry.mode : 'same',
    responseMs,
  };
}

function validateMathCoachRequest(body) {
  if (!requireObject(body)) return null;
  const levelId = boundedInteger(body.levelId, 1, 200);
  const targetCount = clampInteger(body.targetCount, 0, 10, 0);
  const responseMs = Number.isInteger(Number(body.responseMs))
    ? clampInteger(Math.round(Number(body.responseMs)), 0, 600000, 0)
    : null;
  if (!levelId) return null;
  const attempts = Array.isArray(body.attempts)
    ? body.attempts.map(validateMathCoachAttempt).filter(Boolean).slice(-20)
    : [];
  return {
    worldId: 'math',
    levelId,
    skill: String(body.skill || 'count').slice(0, 24),
    targetCount,
    selectedCount: Number.isInteger(Number(body.selectedCount))
      ? clampInteger(body.selectedCount, 0, 10, 0)
      : null,
    isCorrect: body.isCorrect === true,
    responseMs,
    attempts,
  };
}

function streak(attempts, expected) {
  let count = 0;
  for (let index = attempts.length - 1; index >= 0; index -= 1) {
    if (attempts[index].isCorrect !== expected) break;
    count += 1;
  }
  return count;
}

function localMathCoachPlan(request) {
  const correctStreak = streak(request.attempts, true);
  const wrongStreak = streak(request.attempts, false);
  const variantMode = wrongStreak >= 2 ? 'easier' : correctStreak >= 3 ? 'harder' : 'same';
  const nextLevelId = variantMode === 'easier' ? request.levelId : Math.min(200, request.levelId + 1);
  return {
    provider: 'local-template',
    variantMode,
    feedbackText: request.isCorrect
      ? '答对啦！'
      : variantMode === 'easier'
        ? `换成两盘，再找${request.targetCount || 1}个。`
        : '再数一数，从左往右数。',
    recommendation: {
      levelId: nextLevelId,
      reason: variantMode === 'easier' ? 'repeat-current' : 'next-level',
    },
  };
}

function handleLearningError(res, err) {
  if (err && err.code === 'INSFORGE_NOT_CONFIGURED') {
    return jsonError(res, 503, '学习数据服务尚未配置', 'LEARNING_BACKEND_NOT_CONFIGURED');
  }
  console.error('[LEARNING] request failed:', err && err.code ? err.code : err);
  return jsonError(res, 500, '学习数据同步失败', 'LEARNING_SYNC_FAILED');
}

function createLearningRouter(options = {}) {
  const repository = options.repository || createInsForgeLearningRepository();
  const mathCoach = options.mathCoach || { generatePlan: localMathCoachPlan };
  const requireAuth = options.requireAuth;
  if (typeof requireAuth !== 'function') {
    throw new Error('createLearningRouter requires requireAuth middleware');
  }

  const router = express.Router();
  router.use(requireAuth);

  router.get('/state', async (req, res) => {
    try {
      return res.json(await repository.loadState(req.user));
    } catch (err) {
      return handleLearningError(res, err);
    }
  });

  router.put('/state', writeLimiter.middleware(), async (req, res) => {
    if (!requireObject(req.body)) {
      return jsonError(res, 400, '学习数据格式不正确', 'INVALID_LEARNING_STATE');
    }
    try {
      return res.json(await repository.saveState(req.user, normalizeLearningSnapshot(req.body)));
    } catch (err) {
      return handleLearningError(res, err);
    }
  });

  router.patch('/preferences', writeLimiter.middleware(), async (req, res) => {
    if (!requireObject(req.body)) {
      return jsonError(res, 400, '偏好设置格式不正确', 'INVALID_PREFERENCES');
    }
    try {
      return res.json(await repository.savePreferences(req.user, toProfilePatch(req.body)));
    } catch (err) {
      return handleLearningError(res, err);
    }
  });

  router.post('/quiz-attempts', writeLimiter.middleware(), async (req, res) => {
    const attempt = validateQuizAttempt(req.body);
    if (!attempt) {
      return jsonError(res, 400, '答题记录格式不正确', 'INVALID_QUIZ_ATTEMPT');
    }
    try {
      return res.status(201).json(await repository.recordQuizAttempt(req.user, attempt));
    } catch (err) {
      return handleLearningError(res, err);
    }
  });

  router.post('/support-feedback', writeLimiter.middleware(), async (req, res) => {
    const feedback = validateFeedback(req.body);
    if (!feedback) {
      return jsonError(res, 400, '反馈内容格式不正确', 'INVALID_SUPPORT_FEEDBACK');
    }
    try {
      return res.status(201).json(await repository.createSupportFeedback(req.user, feedback));
    } catch (err) {
      return handleLearningError(res, err);
    }
  });

  router.post('/math-coach', writeLimiter.middleware(), async (req, res) => {
    const coachRequest = validateMathCoachRequest(req.body);
    if (!coachRequest) {
      return jsonError(res, 400, '数学陪练请求格式不正确', 'INVALID_MATH_COACH_REQUEST');
    }
    try {
      return res.json(await mathCoach.generatePlan(coachRequest, req.user));
    } catch (err) {
      return handleLearningError(res, err);
    }
  });

  return router;
}

module.exports = {
  createLearningRouter,
  localMathCoachPlan,
  validateMathCoachRequest,
};
