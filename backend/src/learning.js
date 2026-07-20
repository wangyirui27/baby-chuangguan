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

function handleLearningError(res, err) {
  if (err && err.code === 'INSFORGE_NOT_CONFIGURED') {
    return jsonError(res, 503, '学习数据服务尚未配置', 'LEARNING_BACKEND_NOT_CONFIGURED');
  }
  console.error('[LEARNING] request failed:', err && err.code ? err.code : err);
  return jsonError(res, 500, '学习数据同步失败', 'LEARNING_SYNC_FAILED');
}

function createLearningRouter(options = {}) {
  const repository = options.repository || createInsForgeLearningRepository();
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

  return router;
}

module.exports = { createLearningRouter };
