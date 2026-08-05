'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  createMathCoachProvider,
  extractJsonObject,
  normalizePlan,
  readConfig,
} = require('./math-coach-ai');
const { localMathCoachPlan, validateMathCoachRequest } = require('./learning');

const baseRequest = validateMathCoachRequest({
  levelId: 4,
  targetCount: 4,
  selectedCount: 3,
  isCorrect: false,
  attempts: [
    { levelId: 4, targetCount: 4, selectedCount: 3, isCorrect: false },
    { levelId: 4, targetCount: 4, selectedCount: 5, isCorrect: false },
  ],
});

describe('math-coach-ai provider', () => {
  it('readConfig stays disabled without API key', () => {
    const config = readConfig({});
    assert.equal(config.enabled, false);
    assert.equal(config.hasApiKey, undefined);
    assert.equal(config.model, 'gpt-4o-mini');
  });

  it('readConfig stays disabled when key exists but MATH_COACH_AI_ENABLED is not on', () => {
    const byKeyOnly = readConfig({ OPENAI_API_KEY: 'sk-test', MATH_COACH_AI_API_KEY: 'sk-test' });
    assert.equal(byKeyOnly.enabled, false);

    const enabledOff = readConfig({
      MATH_COACH_AI_API_KEY: 'sk-test',
      MATH_COACH_AI_ENABLED: '0',
    });
    assert.equal(enabledOff.enabled, false);

    const enabledOn = readConfig({
      MATH_COACH_AI_API_KEY: 'sk-test',
      MATH_COACH_AI_ENABLED: '1',
    });
    assert.equal(enabledOn.enabled, true);
  });

  it('extractJsonObject accepts fenced model output', () => {
    const parsed = extractJsonObject('```json\n{"variantMode":"easier","feedbackText":"再数一次"}\n```');
    assert.equal(parsed.variantMode, 'easier');
  });

  it('normalizePlan clamps fields and rejects empty feedback', () => {
    const plan = normalizePlan(
      {
        variantMode: 'harder',
        feedbackText: '太棒了！继续冲',
        recommendation: { levelId: 999, reason: 'next-level' },
      },
      baseRequest,
      'unit',
    );
    assert.equal(plan.provider, 'unit');
    assert.equal(plan.variantMode, 'harder');
    assert.equal(plan.recommendation.levelId, 200);
    assert.throws(
      () => normalizePlan({ variantMode: 'same', feedbackText: '   ' }, baseRequest, 'unit'),
      /EMPTY_FEEDBACK/,
    );
  });

  it('falls back to local template when AI is disabled', async () => {
    const coach = createMathCoachProvider({
      fallback: localMathCoachPlan,
      env: {},
    });
    const plan = await coach.generatePlan(baseRequest, { id: 'u1' });
    assert.equal(plan.provider, 'local-template');
    assert.equal(plan.variantMode, 'easier');
    assert.equal(plan.recommendation.reason, 'repeat-current');
    assert.equal(plan.fallbackFrom, 'openai-compatible');
  });

  it('uses model JSON when fetch succeeds', async () => {
    const coach = createMathCoachProvider({
      fallback: localMathCoachPlan,
      env: {
        MATH_COACH_AI_API_KEY: 'test-key',
        MATH_COACH_AI_ENABLED: '1',
        MATH_COACH_AI_BASE_URL: 'https://example.test/v1',
        MATH_COACH_AI_MODEL: 'demo-model',
      },
      fetchImpl: async (url, init) => {
        assert.match(url, /example\.test\/v1\/chat\/completions$/);
        assert.equal(init.headers.authorization, 'Bearer test-key');
        const body = JSON.parse(init.body);
        assert.equal(body.model, 'demo-model');
        return {
          ok: true,
          async json() {
            return {
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      provider: 'ignored',
                      variantMode: 'same',
                      feedbackText: '慢慢数，找对的。',
                      recommendation: { levelId: 5, reason: 'next-level' },
                    }),
                  },
                },
              ],
            };
          },
        };
      },
    });
    const plan = await coach.generatePlan(baseRequest, { id: 'u1' });
    assert.deepEqual(plan, {
      provider: 'openai-compatible',
      variantMode: 'same',
      feedbackText: '慢慢数，找对的。',
      recommendation: { levelId: 5, reason: 'next-level' },
    });
  });

  it('falls back when model HTTP fails', async () => {
    const coach = createMathCoachProvider({
      fallback: localMathCoachPlan,
      env: { MATH_COACH_AI_API_KEY: 'test-key', MATH_COACH_AI_ENABLED: '1' },
      fetchImpl: async () => ({ ok: false, status: 503, async json() { return {}; } }),
    });
    const plan = await coach.generatePlan(baseRequest, { id: 'u1' });
    assert.equal(plan.provider, 'local-template');
    assert.equal(plan.fallbackFrom, 'openai-compatible');
    assert.equal(plan.variantMode, 'easier');
  });
});
