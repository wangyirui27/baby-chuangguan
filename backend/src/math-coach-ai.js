'use strict';

/**
 * Optional real AI math-coach provider (OpenAI-compatible Chat Completions).
 *
 * Product policy (3–5 counting MVP):
 * - Default path is ALWAYS local rules (localMathCoachPlan): streak → easier/harder,
 *   option spacing, short fixed Chinese feedback. That is the learning lever kids feel.
 * - Remote LLM is OFF by default. Enable only with explicit MATH_COACH_AI_ENABLED=1
 *   plus a key — never auto-on just because OPENAI_API_KEY exists for other features.
 * - Use LLM only for high-value, non-hot-path jobs later (e.g. parent weekly summary).
 *   Do not put LLM on every quiz submit when rules already cover difficulty.
 *
 * Runtime:
 * - Never runs in the browser; API keys stay server-side.
 * - Always returns the same plan shape as localMathCoachPlan.
 * - Any failure / missing / disabled config falls back to the injected local template.
 */

const ALLOWED_MODES = new Set(['easier', 'same', 'harder']);
const ALLOWED_REASONS = new Set(['repeat-current', 'next-level']);

function readConfig(env = process.env) {
  const apiKey = String(env.MATH_COACH_AI_API_KEY || env.OPENAI_API_KEY || '').trim();
  const baseUrl = String(
    env.MATH_COACH_AI_BASE_URL || env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  )
    .trim()
    .replace(/\/+$/, '');
  const model = String(env.MATH_COACH_AI_MODEL || env.OPENAI_MODEL || 'gpt-4o-mini').trim();
  const timeoutMs = Math.max(
    1000,
    Math.min(20000, Number(env.MATH_COACH_AI_TIMEOUT_MS) || 6000),
  );
  // Explicit opt-in only. Having a key is not enough — avoids hijacking shared OPENAI_API_KEY.
  const enabledFlag = String(env.MATH_COACH_AI_ENABLED || '').trim().toLowerCase();
  const explicitlyEnabled = ['1', 'true', 'yes', 'on'].includes(enabledFlag);
  return {
    enabled: explicitlyEnabled && Boolean(apiKey),
    apiKey,
    baseUrl,
    model,
    timeoutMs,
  };
}

function buildPrompt(request) {
  const attempts = Array.isArray(request.attempts) ? request.attempts.slice(-8) : [];
  return [
    'You are a gentle math coach for children aged 3-5 practicing apple counting.',
    'Return ONLY compact JSON with keys:',
    'provider (string), variantMode (easier|same|harder), feedbackText (short Chinese, <=24 chars),',
    'recommendation: { levelId (int 1-200), reason (repeat-current|next-level) }.',
    'Rules:',
    '- If the child missed the same level twice in a row, prefer easier + repeat-current.',
    '- If the child got three correct in a row, prefer harder + next-level.',
    '- feedbackText must be encouraging Chinese for kids, no English, no markdown.',
    '- Do not invent HTML or code. Keep levelId within 1-200.',
    '',
    `Current request JSON: ${JSON.stringify({
      levelId: request.levelId,
      skill: request.skill,
      targetCount: request.targetCount,
      selectedCount: request.selectedCount,
      isCorrect: request.isCorrect,
      responseMs: request.responseMs,
      attempts,
    })}`,
  ].join('\n');
}

function normalizePlan(raw, request, providerName) {
  const fallbackLevel = Math.min(200, Math.max(1, Number(request.levelId) || 1));
  const variantMode = ALLOWED_MODES.has(raw?.variantMode) ? raw.variantMode : 'same';
  const reason = ALLOWED_REASONS.has(raw?.recommendation?.reason)
    ? raw.recommendation.reason
    : variantMode === 'easier'
      ? 'repeat-current'
      : 'next-level';
  const recommendedLevel = Number(raw?.recommendation?.levelId);
  const levelId = Number.isInteger(recommendedLevel)
    ? Math.min(200, Math.max(1, recommendedLevel))
    : reason === 'repeat-current'
      ? fallbackLevel
      : Math.min(200, fallbackLevel + 1);
  const feedbackText = String(raw?.feedbackText || '')
    .replace(/[\r\n`*#_<>]/g, ' ')
    .trim()
    .slice(0, 40);
  if (!feedbackText) {
    throw new Error('MATH_COACH_AI_EMPTY_FEEDBACK');
  }
  return {
    provider: providerName,
    variantMode,
    feedbackText,
    recommendation: { levelId, reason },
  };
}

function extractJsonObject(text) {
  const source = String(text || '').trim();
  if (!source) throw new Error('MATH_COACH_AI_EMPTY_RESPONSE');
  try {
    return JSON.parse(source);
  } catch (_) {
    const start = source.indexOf('{');
    const end = source.lastIndexOf('}');
    if (start < 0 || end <= start) throw new Error('MATH_COACH_AI_INVALID_JSON');
    return JSON.parse(source.slice(start, end + 1));
  }
}

async function defaultFetch(url, init) {
  if (typeof fetch !== 'function') {
    throw new Error('MATH_COACH_AI_FETCH_UNAVAILABLE');
  }
  return fetch(url, init);
}

function createMathCoachProvider(options = {}) {
  const fallback =
    typeof options.fallback === 'function'
      ? options.fallback
      : () => {
          throw new Error('MATH_COACH_FALLBACK_MISSING');
        };
  const config = { ...readConfig(options.env || process.env), ...(options.config || {}) };
  const fetchImpl = options.fetchImpl || defaultFetch;
  const providerName = String(options.providerName || 'openai-compatible').slice(0, 40);

  async function callModel(request) {
    if (!config.enabled || !config.apiKey) {
      throw new Error('MATH_COACH_AI_DISABLED');
    }
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller
      ? setTimeout(() => controller.abort(), config.timeoutMs)
      : null;
    try {
      const response = await fetchImpl(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You generate adaptive math coach plans for a kids counting app. Reply with JSON only.',
            },
            { role: 'user', content: buildPrompt(request) },
          ],
        }),
        signal: controller ? controller.signal : undefined,
      });
      if (!response.ok) {
        throw new Error(`MATH_COACH_AI_HTTP_${response.status}`);
      }
      const payload = await response.json();
      const content = payload?.choices?.[0]?.message?.content;
      return normalizePlan(extractJsonObject(content), request, providerName);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function generatePlan(request, _user) {
    try {
      return await callModel(request);
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn(
          '[MATH_COACH_AI] fallback to local template:',
          err && err.message ? err.message : err,
        );
      }
      const plan = await fallback(request, _user);
      return {
        ...plan,
        provider: plan?.provider || 'local-template',
        fallbackFrom: providerName,
      };
    }
  }

  return {
    generatePlan,
    config: {
      enabled: config.enabled,
      baseUrl: config.baseUrl,
      model: config.model,
      timeoutMs: config.timeoutMs,
      hasApiKey: Boolean(config.apiKey),
    },
    // test helpers
    _normalizePlan: normalizePlan,
    _extractJsonObject: extractJsonObject,
    _buildPrompt: buildPrompt,
    _callModel: callModel,
  };
}

module.exports = {
  createMathCoachProvider,
  readConfig,
  normalizePlan,
  extractJsonObject,
  buildPrompt,
};
