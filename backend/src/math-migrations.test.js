'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../../migrations');

describe('math learning migrations', () => {
  it('allows math worlds on shared learning tables', () => {
    const worlds = fs.readFileSync(
      path.join(root, '20260804142000_add-math-worlds-to-learning-backend.sql'),
      'utf8',
    );
    assert.match(worlds, /baby_profiles_map_world_check/);
    assert.match(worlds, /'math'/);
    assert.match(worlds, /'math58'/);
    assert.match(worlds, /'math912'/);
    assert.match(worlds, /baby_world_progress_world_id_check/);
    assert.match(worlds, /baby_mistakes_world_id_check/);
    assert.match(worlds, /baby_quiz_attempts_world_id_check/);
  });

  it('adds bounded math_attempts JSONB on baby_profiles', () => {
    const attempts = fs.readFileSync(
      path.join(root, '20260804150000_add-math-attempts-to-learning-profile.sql'),
      'utf8',
    );
    assert.match(attempts, /ALTER TABLE public\.baby_profiles/);
    assert.match(attempts, /ADD COLUMN IF NOT EXISTS math_attempts JSONB/i);
    assert.match(attempts, /DEFAULT '\[\]'::jsonb/);
    assert.match(attempts, /baby_profiles_math_attempts_array/);
    assert.match(attempts, /jsonb_array_length\(math_attempts\) <= 80/);
  });
});
