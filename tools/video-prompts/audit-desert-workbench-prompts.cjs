#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const { desertLevels } = require('../../script.js');
const {
  buildRows,
  promptForLevel,
  readExistingTasks,
  scenePlanForLevel,
  spokenTargetFor,
} = require('./write-desert-workbench-prompts.cjs');

const DOC_ROOT = '/Users/yr/嗨洛塔少儿启蒙APP/docs/curriculum';
const FINAL_PROMPTS_DIR = '/Users/yr/Documents/LibTV Workbench/projects/baby-desert-levels-v1/input/final-prompts';
const REPORT_BASE = path.join(DOC_ROOT, 'desert-video-semantic-qc-20260801');

const REQUIRED_LABELS = [
  'Title:',
  'Duration: 15 seconds',
  'Format: 16:9 horizontal',
  'Cinematic Style:',
  'Source Situation:',
  'CEFR Target:',
  'Zero-beginner clarity rule:',
  'Scene:',
  'Characters:',
  'Story Container:',
  'Dialogue:',
  'Action & Performance:',
  'Camera:',
  'Audio:',
  'Negative Prompt:',
];

const BANNED_GENERIC = [
  'the children meet, part, thank, apologize, or check on each other',
  'Establish the need or action silently with one clear foreground target',
  'Child A:',
  'Child B:',
];

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/['’]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-') || 'target';
}

function countLiteral(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function promptPathFor(level) {
  const id = String(level.id).padStart(3, '0');
  return path.join(FINAL_PROMPTS_DIR, `level-${id}-${slugify(level.title)}.txt`);
}

function auditLevel(level, row) {
  const plan = scenePlanForLevel(level);
  const expectedPrompt = promptForLevel(level);
  const promptPath = promptPathFor(level);
  const actualPrompt = fs.existsSync(promptPath) ? fs.readFileSync(promptPath, 'utf8').trimEnd() : '';
  const checks = [];

  for (const label of REQUIRED_LABELS) {
    if (!expectedPrompt.includes(label)) checks.push(`missing_label:${label}`);
  }
  for (const banned of BANNED_GENERIC) {
    if (expectedPrompt.includes(banned)) checks.push(`generic_template_leak:${banned}`);
  }
  for (const beat of plan.beats) {
    if (!expectedPrompt.includes(beat)) checks.push(`missing_beat:${beat.slice(0, 50)}`);
  }
  for (const line of plan.dialogue) {
    if (!expectedPrompt.includes(line)) checks.push(`missing_dialogue:${line}`);
  }
  const spoken = spokenTargetFor(level.title);
  const spokenCount = countLiteral(expectedPrompt, spoken);
  if (spokenCount < 2) checks.push(`target_not_present_enough:${spoken}`);
  if (!actualPrompt) checks.push('final_prompt_file_missing');
  if (actualPrompt && actualPrompt !== expectedPrompt) checks.push('final_prompt_file_not_synced');
  if (level.id === 3 && !/walk(?:s|ing)? away|distance|separate|turns? (?:his|her)? ?body toward the path|meet again later/i.test(expectedPrompt)) {
    checks.push('see_you_later_missing_separation_cue');
  }

  return {
    level: level.id,
    topic: level.topic,
    english: level.title,
    chinese: level.zhTitle,
    spoken,
    plannedStatus: row.status,
    redrawMarked: row.redrawMarked === true,
    hasVideoPath: Boolean(row.videoPath),
    promptPath,
    visualProof: plan.beats[1],
    listenerProof: plan.beats[2],
    dialogue: plan.dialogue.join(' | '),
    verdict: checks.length ? 'FAIL' : 'PASS',
    checks,
  };
}

function writeReports(rows, summary) {
  fs.mkdirSync(DOC_ROOT, { recursive: true });
  fs.writeFileSync(`${REPORT_BASE}.json`, `${JSON.stringify({ summary, rows }, null, 2)}\n`);

  const csv = [
    ['level', 'topic', 'english', 'chinese', 'verdict', 'plannedStatus', 'redrawMarked', 'hasVideoPath', 'visualProof', 'listenerProof', 'checks', 'promptPath'].map(csvCell).join(','),
    ...rows.map((row) => [
      row.level,
      row.topic,
      row.english,
      row.chinese,
      row.verdict,
      row.plannedStatus,
      row.redrawMarked ? 'yes' : 'no',
      row.hasVideoPath ? 'yes' : 'no',
      row.visualProof,
      row.listenerProof,
      row.checks.join('; '),
      row.promptPath,
    ].map(csvCell).join(',')),
  ].join('\n') + '\n';
  fs.writeFileSync(`${REPORT_BASE}.csv`, csv);

  const md = [
    '# Desert Video Semantic QC 2026-08-01',
    '',
    `- total: ${summary.total}`,
    `- pass: ${summary.pass}`,
    `- fail: ${summary.fail}`,
    `- generated videos now marked for redraw after prompt change: ${summary.needsRedrawWithVideo}`,
    '',
    '| Level | Topic | English | Chinese | Verdict | Planned status | Visual proof | Checks |',
    '| ---: | --- | --- | --- | --- | --- | --- | --- |',
    ...rows.map((row) => [
      row.level,
      row.topic,
      row.english,
      row.chinese,
      row.verdict,
      row.plannedStatus,
      row.visualProof,
      row.checks.join('; ') || 'ok',
    ].map((cell) => String(cell).replace(/\|/g, '\\|')).join(' | ')).map((line) => `| ${line} |`),
    '',
  ].join('\n');
  fs.writeFileSync(`${REPORT_BASE}.md`, md);
}

function main() {
  const existingTasks = readExistingTasks();
  const rows = buildRows(new Date().toISOString(), existingTasks);
  const rowsByLevel = new Map(rows.map((row) => [Number(row.metadata.level), row]));
  const auditRows = desertLevels.map((level) => auditLevel(level, rowsByLevel.get(level.id)));
  const summary = {
    generatedAt: new Date().toISOString(),
    total: auditRows.length,
    pass: auditRows.filter((row) => row.verdict === 'PASS').length,
    fail: auditRows.filter((row) => row.verdict !== 'PASS').length,
    needsRedrawWithVideo: auditRows.filter((row) => row.plannedStatus === 'needs-redraw' && row.hasVideoPath).length,
  };
  writeReports(auditRows, summary);
  console.log(JSON.stringify(summary, null, 2));
  if (summary.fail) process.exitCode = 1;
}

if (require.main === module) {
  main();
}
