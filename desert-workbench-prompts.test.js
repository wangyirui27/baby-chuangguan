const assert = require('node:assert/strict');
const test = require('node:test');

const { desertLevels } = require('./script.js');
const { DESERT_SCENE_PLAN_ROWS } = require('./tools/video-prompts/desert-scene-plans-20260801.cjs');
const { promptForLevel, scenePlanForLevel } = require('./tools/video-prompts/write-desert-workbench-prompts.cjs');

test('desert workbench prompts have one semantic scene plan per level', () => {
  const planIds = new Set(DESERT_SCENE_PLAN_ROWS.map((row) => row[0]));
  assert.equal(DESERT_SCENE_PLAN_ROWS.length, 200);
  assert.equal(planIds.size, 200);
  assert.deepEqual(desertLevels.filter((level) => !planIds.has(level.id)).map((level) => level.id), []);
});

test('see you later prompt visibly separates the children', () => {
  const level = desertLevels.find((item) => item.title === 'See you later!');
  const prompt = promptForLevel(level);
  assert.match(prompt, /walking away|distance between them slowly grows|meet again later/i);
  assert.doesNotMatch(prompt, /the children meet, part, thank, apologize/i);
});

test('desert workbench prompts use authored dialogue instead of generic speakers', () => {
  for (const level of desertLevels) {
    const plan = scenePlanForLevel(level);
    const prompt = promptForLevel(level);
    assert.ok(plan.dialogue.some((line) => line.includes(`"${level.title}"`)), `missing target dialogue for L${level.id}`);
    assert.doesNotMatch(prompt, /Child A:|Child B:/);
  }
});
