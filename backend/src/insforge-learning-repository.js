'use strict';

const WORLD_IDS = ['ocean', 'desert', 'math', 'math58', 'math912', 'castle'];
const MAX_LEVEL = 200;
const DEFAULT_WORLD_ID = 'ocean';
const MATH_ATTEMPT_LIMIT = 80;
const MATH_ATTEMPT_SCHEMA_VERSION = 1;

let _sdkPromise = null;

async function loadSdk() {
  if (!_sdkPromise) {
    _sdkPromise = import('@insforge/sdk');
  }
  return _sdkPromise;
}

function requireConfig(value, name) {
  if (!value) {
    const err = new Error(`${name} is not configured`);
    err.code = 'INSFORGE_NOT_CONFIGURED';
    throw err;
  }
  return value;
}

function requireNoError(result, action) {
  if (result && result.error) {
    const err = new Error(`${action} failed`);
    err.code = 'INSFORGE_REQUEST_FAILED';
    err.cause = result.error;
    throw err;
  }
  return result ? result.data : null;
}

function defaultProgress() {
  return { completed: [], unlockedThrough: 1 };
}

function clampInteger(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isInteger(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function boundedInteger(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) return fallback;
  return number;
}

function normalizeWorldId(value) {
  return WORLD_IDS.includes(value) ? value : DEFAULT_WORLD_ID;
}

function compactText(value, maxLength) {
  return Array.from(String(value || '').trim()).slice(0, maxLength).join('');
}

function toProfilePatch(input) {
  const value = input && typeof input === 'object' ? input : {};
  const patch = {};
  const childName = compactText(value.child_name ?? value.childName, 10);
  if (childName) patch.child_name = childName;

  const childAge = boundedInteger(value.child_age ?? value.childAge, 3, 6, null);
  if (childAge !== null) patch.child_age = childAge;

  [
    ['map_music', 'mapMusic'],
    ['auto_pronunciation', 'autoPronunciation'],
    ['show_chinese_hints', 'showChineseHints'],
  ].forEach(([snakeKey, camelKey]) => {
    const flag = value[snakeKey] ?? value[camelKey];
    if (typeof flag === 'boolean') patch[snakeKey] = flag;
  });

  const mapWorld = value.map_world ?? value.mapWorld;
  if (WORLD_IDS.includes(mapWorld)) patch.map_world = mapWorld;
  return patch;
}

function normalizeProgress(value) {
  const completed = Array.isArray(value?.completed)
    ? [...new Set(value.completed
      .map((levelId) => Number(levelId))
      .filter((levelId) => Number.isInteger(levelId) && levelId >= 1 && levelId <= MAX_LEVEL))]
      .sort((a, b) => a - b)
    : [];
  const maxCompleted = completed.length ? completed[completed.length - 1] : 0;
  const unlockedThrough = clampInteger(value?.unlockedThrough, 1, MAX_LEVEL, 1);
  return {
    completed,
    unlockedThrough: Math.min(MAX_LEVEL, Math.max(unlockedThrough, maxCompleted < MAX_LEVEL ? maxCompleted + 1 : MAX_LEVEL)),
  };
}

function normalizeProgressByWorld(value) {
  return WORLD_IDS.reduce((acc, worldId) => {
    acc[worldId] = normalizeProgress(value?.[worldId]);
    return acc;
  }, {});
}

function normalizeLearningActivity(value) {
  const dates = Array.isArray(value?.dates) ? value.dates : [];
  return {
    dates: [...new Set(dates
      .map((date) => String(date || '').trim())
      .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)))]
      .sort(),
  };
}

function normalizeMistakeItems(value, activeWorldId) {
  const items = Array.isArray(value?.items) ? value.items : [];
  const byKey = new Map();
  items.forEach((item) => {
    const levelId = boundedInteger(item?.levelId, 1, MAX_LEVEL, null);
    if (levelId === null) return;
    const worldId = normalizeWorldId(item?.worldId || activeWorldId);
    byKey.set(`${worldId}:${levelId}`, {
      worldId,
      levelId,
      word: compactText(item?.word, 40),
      zhTitle: compactText(item?.zhTitle, 40),
      selected: compactText(item?.selected, 40),
      correct: compactText(item?.correct, 40),
      count: clampInteger(item?.count, 1, 99, 1),
      updatedAt: String(item?.updatedAt || ''),
    });
  });
  return [...byKey.values()]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 50);
}

function normalizeMathAttempts(value, limit = MATH_ATTEMPT_LIMIT) {
  let entries = Array.isArray(value) ? value : [];
  if (!entries.length && typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      entries = Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      entries = [];
    }
  }
  const safeLimit = Math.max(1, Number(limit) || MATH_ATTEMPT_LIMIT);
  return entries.map((entry) => {
    if (!entry || typeof entry !== 'object') return null;
    const levelId = boundedInteger(entry.levelId, 1, MAX_LEVEL, null);
    if (levelId === null) return null;
    const targetCount = clampInteger(entry.targetCount, 0, 10, 0);
    const selectedCount = Number.isInteger(Number(entry.selectedCount))
      ? clampInteger(entry.selectedCount, 0, 10, 0)
      : null;
    const ts = Number.isFinite(Number(entry.ts)) ? Number(entry.ts) : Date.now();
    const mode = ['easier', 'same', 'harder'].includes(entry.mode) ? entry.mode : 'same';
    const responseMs = Number.isFinite(Number(entry.responseMs))
      ? clampInteger(Math.round(Number(entry.responseMs)), 0, 600000, 0)
      : null;
    return {
      attemptId: compactText(entry.attemptId || `local-${ts}-${levelId}-${selectedCount ?? 'x'}-${mode}`, 80),
      schemaVersion: MATH_ATTEMPT_SCHEMA_VERSION,
      ts,
      worldId: 'math',
      levelId,
      skill: compactText(entry.skill || 'count', 24) || 'count',
      targetCount,
      selected: compactText(entry.selected, 40),
      selectedCount,
      correct: compactText(entry.correct, 40),
      isCorrect: entry.isCorrect === true,
      mode,
      responseMs,
    };
  }).filter(Boolean).slice(-safeLimit);
}

function normalizeSnapshot(snapshot) {
  const profilePatch = toProfilePatch({
    ...(snapshot?.preferences || {}),
    ...(snapshot?.profile || {}),
  });
  const activeWorldId = normalizeWorldId(profilePatch.map_world || snapshot?.preferences?.mapWorld);
  return {
    profile: profilePatch,
    progressByWorld: normalizeProgressByWorld(snapshot?.progressByWorld),
    learningActivity: normalizeLearningActivity(snapshot?.learningActivity),
    mistakeBook: {
      items: normalizeMistakeItems(snapshot?.mistakeBook, activeWorldId),
    },
    mathAttempts: normalizeMathAttempts(snapshot?.mathAttempts),
  };
}

function stateFromRows(profile, progressRows, activityRows, mistakeRows) {
  const progressByWorld = WORLD_IDS.reduce((acc, worldId) => {
    acc[worldId] = defaultProgress();
    return acc;
  }, {});

  (progressRows || []).forEach((row) => {
    if (!WORLD_IDS.includes(row.world_id)) return;
    progressByWorld[row.world_id] = {
      completed: Array.isArray(row.completed_levels) ? row.completed_levels : [],
      unlockedThrough: row.unlocked_through || 1,
    };
  });

  return {
    profile: {
      childName: profile.child_name,
      childAge: String(profile.child_age),
    },
    preferences: {
      mapMusic: profile.map_music,
      autoPronunciation: profile.auto_pronunciation,
      showChineseHints: profile.show_chinese_hints,
      mapWorld: profile.map_world,
    },
    progressByWorld,
    learningActivity: {
      dates: (activityRows || []).map((row) => String(row.activity_day)).sort(),
    },
    mistakeBook: {
      items: (mistakeRows || []).map((row) => ({
        levelId: row.level_id,
        worldId: row.world_id,
        word: row.word,
        zhTitle: row.zh_title,
        selected: row.selected,
        correct: row.correct,
        count: row.mistake_count,
        updatedAt: row.updated_at,
      })),
    },
    mathAttempts: normalizeMathAttempts(profile.math_attempts || profile.mathAttempts),
    syncedAt: new Date().toISOString(),
  };
}

class InsForgeLearningRepository {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || process.env.INSFORGE_URL;
    // 正式键名 INSFORGE_API_KEY；兼容 options.serviceKey / INSFORGE_SERVICE_KEY
    this.apiKey = options.apiKey
      || options.serviceKey
      || process.env.INSFORGE_API_KEY
      || process.env.INSFORGE_SERVICE_KEY;
    this._clientPromise = null;
  }

  async client() {
    if (!this._clientPromise) {
      this._clientPromise = loadSdk().then(({ createAdminClient }) => createAdminClient({
        baseUrl: requireConfig(this.baseUrl, 'INSFORGE_URL'),
        apiKey: requireConfig(this.apiKey, 'INSFORGE_API_KEY'),
      }));
    }
    return this._clientPromise;
  }

  async ensureProfile(user, profilePatch = null) {
    const admin = await this.client();
    const localUserId = user.id;
    const patch = toProfilePatch(profilePatch);
    if (Object.keys(patch).length === 0) {
      const existing = requireNoError(await admin.database
        .from('baby_profiles')
        .select('*')
        .eq('local_user_id', localUserId)
        .maybeSingle(), 'load profile');
      if (existing) return existing;
    }

    return requireNoError(await admin.database
      .from('baby_profiles')
      .upsert([{ local_user_id: localUserId, ...patch }], { onConflict: 'local_user_id' })
      .select()
      .single(), 'upsert profile');
  }

  async loadState(user) {
    const admin = await this.client();
    const profile = await this.ensureProfile(user);

    const progressRows = requireNoError(await admin.database
      .from('baby_world_progress')
      .select('*')
      .eq('profile_id', profile.id), 'load progress');

    const activityRows = requireNoError(await admin.database
      .from('baby_learning_activity')
      .select('activity_day')
      .eq('profile_id', profile.id)
      .order('activity_day', { ascending: true }), 'load activity');

    const mistakeRows = requireNoError(await admin.database
      .from('baby_mistakes')
      .select('*')
      .eq('profile_id', profile.id)
      .is('resolved_at', null)
      .order('updated_at', { ascending: false })
      .limit(50), 'load mistakes');

    return stateFromRows(profile, progressRows, activityRows, mistakeRows);
  }

  async saveState(user, snapshot) {
    const safeSnapshot = normalizeSnapshot(snapshot);
    const admin = await this.client();
    const profile = await this.ensureProfile(user, safeSnapshot.profile);

    const progressRows = WORLD_IDS.map((worldId) => ({
      profile_id: profile.id,
      world_id: worldId,
      completed_levels: safeSnapshot.progressByWorld[worldId].completed,
      unlocked_through: safeSnapshot.progressByWorld[worldId].unlockedThrough,
    }));

    requireNoError(await admin.database
      .from('baby_profiles')
      .update({ math_attempts: safeSnapshot.mathAttempts })
      .eq('id', profile.id), 'save math attempts');

    requireNoError(await admin.database
      .from('baby_world_progress')
      .upsert(progressRows, { onConflict: 'profile_id,world_id' }), 'save progress');

    const activityRows = safeSnapshot.learningActivity.dates.map((day) => ({
      profile_id: profile.id,
      activity_day: day,
    }));
    if (activityRows.length) {
      requireNoError(await admin.database
        .from('baby_learning_activity')
        .upsert(activityRows, { onConflict: 'profile_id,activity_day' }), 'save activity');
    }

    await this.syncMistakes(admin, profile.id, safeSnapshot.mistakeBook.items);
    return this.loadState(user);
  }

  async savePreferences(user, profilePatch) {
    await this.ensureProfile(user, toProfilePatch(profilePatch));
    return this.loadState(user);
  }

  async syncMistakes(admin, profileId, items) {
    const current = requireNoError(await admin.database
      .from('baby_mistakes')
      .select('world_id, level_id')
      .eq('profile_id', profileId)
      .is('resolved_at', null), 'load active mistakes');

    const activeKeys = new Set(items.map((item) => `${item.worldId}:${item.levelId}`));
    for (const row of (current || []).filter((item) => !activeKeys.has(`${item.world_id}:${item.level_id}`))) {
      requireNoError(await admin.database
        .from('baby_mistakes')
        .update({ resolved_at: new Date().toISOString() })
        .eq('profile_id', profileId)
        .eq('world_id', row.world_id)
        .eq('level_id', row.level_id)
        .is('resolved_at', null), 'resolve mistake');
    }

    if (!items.length) return;

    const rows = items.map((item) => ({
      profile_id: profileId,
      world_id: item.worldId,
      level_id: item.levelId,
      word: item.word,
      zh_title: item.zhTitle,
      selected: item.selected,
      correct: item.correct,
      mistake_count: item.count,
      resolved_at: null,
    }));

    requireNoError(await admin.database
      .from('baby_mistakes')
      .upsert(rows, { onConflict: 'profile_id,world_id,level_id' }), 'save mistakes');
  }

  async recordQuizAttempt(user, attempt) {
    const admin = await this.client();
    const profile = await this.ensureProfile(user);
    const row = requireNoError(await admin.database
      .from('baby_quiz_attempts')
      .insert([{
        profile_id: profile.id,
        world_id: attempt.worldId,
        level_id: attempt.levelId,
        selected: attempt.selected,
        correct: attempt.correct,
        is_correct: attempt.isCorrect,
      }])
      .select('id')
      .single(), 'record quiz attempt');
    return { id: row.id };
  }

  async createSupportFeedback(user, feedback) {
    const admin = await this.client();
    const profile = await this.ensureProfile(user);
    const row = requireNoError(await admin.database
      .from('baby_support_feedback')
      .insert([{
        profile_id: profile.id,
        message: feedback.message,
        context: feedback.context,
      }])
      .select('id')
      .single(), 'create support feedback');
    return { id: row.id };
  }
}

module.exports = {
  InsForgeLearningRepository,
  WORLD_IDS,
  clampInteger,
  normalizeLearningSnapshot: normalizeSnapshot,
  normalizeMathAttempts,
  stateFromRows,
  toProfilePatch,
  createInsForgeLearningRepository: (options) => new InsForgeLearningRepository(options),
};
