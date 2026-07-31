    const parsed = JSON.parse(good.stdout);
    assert.ok(parsed.spokenCount >= 1);
    assert.equal(parsed.spokenCountSource, 'dialogue-quoted-lines');
  }
});

test('requires both --spoken and --answer flags', () => {
  const prompt = 'output/media-production/desert-level-013-friend-mind-map-r2/prompts/level-013-friend-mind-map-r2.txt';
  const missingAnswer = runChecker([prompt, '--spoken', 'Look! She is my friend.']);
  assert.notEqual(missingAnswer.status, 0);
  assert.match(`${missingAnswer.stderr}\n${missingAnswer.stdout}`, /--answer/i);

  const missingSpoken = runChecker([prompt, '--answer', 'friend mind map']);
  assert.notEqual(missingSpoken.status, 0);
  assert.match(`${missingSpoken.stderr}\n${missingSpoken.stdout}`, /--spoken/i);
});

test('wrong spoken vs contract fails for L029 title-as-spoken bypass', () => {
  const prompt = 'output/media-production/desert-level-029-we-love-each-other-r2/prompts/level-029-we-love-each-other-r2.txt';
  const level = desertLevels.find((item) => item.id === 29);
  assert.ok(level, 'L029 must exist');
  const liveContractSpoken = resolveSpokenTarget(level);
  assert.ok(liveContractSpoken);
  assert.equal(level.title, 'We love each other');
  // Codex risk surface: title appears in Dialogue, so structure can PASS without contract flags.
  const staleWrongCefr = 'This is my family.';
  assert.notEqual(normalizeLine(level.title), normalizeLine(staleWrongCefr));

  const titleOnly = runChecker([
    prompt,
    '--spoken', level.title,
    '--answer', level.title,
  ]);
  assert.equal(
    titleOnly.status,
    0,
    `precondition: title-as-spoken still Dialogue-hit PASS without contract: ${titleOnly.stderr}`,
  );

  // Hard gate: caller passes title while contract cefr is still the stale L028 line.
  const badStaleContract = runChecker([
    prompt,
    '--spoken', level.title,
    '--answer', level.title,
    '--contract-spoken', staleWrongCefr,
  ]);
  assert.notEqual(badStaleContract.status, 0, 'title-as-spoken must FAIL vs stale contract cefr This is my family.');
  assert.match(
    `${badStaleContract.stderr}\n${badStaleContract.stdout}`,
    /does not match contract resolved spoken|contract resolved spoken|This is my family/i,
  );

  // Live level-id: spoken must equal resolveSpokenTarget(level), not an old Dialogue line.
  const badStaleSpokenWithLevel = runChecker([
    prompt,
    '--spoken', staleWrongCefr,
    '--answer', level.title,
    '--level-id', '29',
  ]);
  assert.notEqual(
