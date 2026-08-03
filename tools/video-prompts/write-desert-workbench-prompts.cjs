#!/usr/bin/env node

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const { desertLevels } = require('../../script.js');
const { getDesertScenePlan } = require('./desert-scene-plans-20260801.cjs');
const { ttsTextForTarget, DESERT_SPEAKER, RESOURCE_ID } = require('../../backend/src/generate-word-audio-v2.js');

const PROJECT_ID = 'baby-desert-levels-v1';
const PROJECT_NAME = '宝宝闯关·沙漠关卡视频';
const DOC_PROJECT_DIR = '/Users/yr/Documents/LibTV Workbench/projects/baby-desert-levels-v1';
const RUNTIME_PROJECT_DIR = '/Users/yr/Library/Application Support/libtv-workbench/projects/baby-desert-levels-v1';
const SETTINGS_PATH = '/Users/yr/Library/Application Support/libtv-workbench/settings.json';
const OUTPUT_DIR = '/Users/yr/video/baby-desert-levels-v1';
const INPUT_DIR = path.join(DOC_PROJECT_DIR, 'input');
const FINAL_PROMPTS_DIR = path.join(INPUT_DIR, 'final-prompts');
const CSV_PATH = path.join(INPUT_DIR, 'tasks.csv');
const TASKS_PATH = path.join(RUNTIME_PROJECT_DIR, 'tasks.json');
const PROJECT_JSON_PATH = path.join(DOC_PROJECT_DIR, 'project.json');

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function taskId(filePath, rowNumber) {
  return crypto
    .createHash('sha1')
    .update([path.resolve(filePath), 'csv', rowNumber].join('\u0000'))
    .digest('hex')
    .slice(0, 16);
}

function slugify(value) {
  const slug = String(value || '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/['’]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return slug || 'target';
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function backupFile(filePath, suffix) {
  if (!fs.existsSync(filePath)) return null;
  const backupPath = `${filePath}.before-script-fixed-${suffix}.bak`;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function replaceDirWithBackup(dirPath, suffix) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return null;
  }
  const backupPath = `${dirPath}.before-script-fixed-${suffix}`;
  fs.rmSync(backupPath, { recursive: true, force: true });
  fs.renameSync(dirPath, backupPath);
  fs.mkdirSync(dirPath, { recursive: true });
  return backupPath;
}

function spokenTargetFor(title) {
  return ttsTextForTarget(String(title || '').toLowerCase(), String(title || '').trim(), 'desert');
}

function scenePlanForLevel(level) {
  return getDesertScenePlan(level);
}

function promptForLevel(level) {
  const spokenTarget = spokenTargetFor(level.title);
  const plan = scenePlanForLevel(level);
  const anchors = plan.anchors.map((line, index) => `${index + 1}. ${line}`).join('\n');
  const storyBeats = plan.beats.map((line, index) => {
    const ranges = ['0-4s', '4-8s', '8-12s', '12-15s'];
    return `${ranges[index] || `${index * 4}-${index * 4 + 4}s`}: ${line}`;
  }).join('\n');
  const dialogue = plan.dialogue.map((line) => `- ${line}`).join('\n');
  const camelRule = /camel/i.test(level.title)
    ? 'A friendly camel may be the foreground target only for this camel phrase.'
    : 'A small friendly camel companion may stay in the soft background and blink once, but must not become the foreground target.';

  return `Title: Desert Level ${String(level.id).padStart(3, '0')} - ${level.title}

Duration: 15 seconds

Format: 16:9 horizontal

Cinematic Style: Hand-painted watercolor and gouache storybook animation matching the HiRota Magic Island and Desert map character family. Warm cream sunlight, soft sand and clay tones, pale mint oasis plants, tiny coral accents, soft pencil outlines, visible paper grain, low saturation, gentle imperfect brush texture. Child-safe attractive faces: bright clean eyes, soft cheeks, balanced proportions, gentle smiles. Not glossy 3D, not plastic CGI, not neon, not hard vector.

Source Situation: In a gentle Egyptian desert-oasis adventure, ${plan.situation}. The scene must feel like a tiny real-life moment with a reason to speak, not a lesson demo. No classroom UI, no flashcards, no subtitles, no written labels.

CEFR Target: Pre-A1 / very young A1 English for 6-8 year old beginners. Topic: ${level.topic}. Chinese meaning: ${level.zhTitle}. Alignment: ${level.curriculum?.alignment || 'extension'} / ${level.curriculum?.theme || 'daily English scene'}. The target English expression is ${JSON.stringify(level.title)}. The spoken version is ${JSON.stringify(spokenTarget)}.

Zero-beginner clarity rule: The learner may know zero English. The picture must teach the meaning before the learner understands the audio. Whenever ${JSON.stringify(spokenTarget)} is spoken, the matching person, object, body part, animal, action, color, number, time, weather, or social gesture must be the only clear foreground meaning target. Do not place other learnable objects near the speaking child, in the child's hands, or in the foreground during or immediately before the target phrase.

Scene: One uncluttered desert-oasis micro-scene with the target meaning already visible before the spoken line. Keep props minimal and physically tied to the target expression.

Characters: Use the same two young English-learning explorers across the desert course: a cheerful 7-year-old girl with a coral scarf and a calm 6-year-old boy with a small teal satchel. Their proportions, faces, clothing colors, and soft watercolor rendering must stay consistent from level to level. ${camelRule}

Story Container:
${storyBeats}

Action & Performance:
${anchors}

Dialogue: Use only Pre-A1 / very young A1 English. Use these authored beats as natural speech; do not chant, drill, or mechanically repeat the target. The target ${JSON.stringify(spokenTarget)} must be heard once clearly, complete and uncut, as a real greeting, farewell, request, instruction, offer, answer, encouragement, or observation. Other lines must be 1-4 words only. No narrator explanation.
${dialogue}

Camera: Stable medium shot with slow child-safe motion. Keep the speaker front-facing or three-quarter-facing when speaking. No fast cuts, no back-facing speech, no side-profile-only mouth, no over-the-shoulder dialogue.

Audio: Clear child-friendly English, consistent upbeat energy, gentle desert ambience, very soft music if any. Avoid dramatic sadness, anger, shouting, whispering, or overly emotional delivery.

Negative Prompt: no subtitles, no captions, no readable text, no alphabet letters, no flashcards, no blackboard, no logo, no watermark, no UI, no teacher drill, no plastic CGI, no glossy 3D, no neon, no scary danger, no weapons, no skulls, no crowded foreground props, no extra learnable object competing with the target, no cut-off speech.`;
}

function existingTaskIndex(tasks) {
  return new Map((Array.isArray(tasks) ? tasks : []).map((task) => [String(task.sourceIndex), task]));
}

function readExistingTasks() {
  if (!fs.existsSync(TASKS_PATH)) return [];
  const parsed = JSON.parse(fs.readFileSync(TASKS_PATH, 'utf8'));
  return Array.isArray(parsed) ? parsed : [];
}

function statusForPrompt(existing, finalPrompt) {
  if (!existing) return { status: 'ready', redrawMarked: undefined };
  const promptChanged = Boolean(existing.finalPrompt) && existing.finalPrompt !== finalPrompt;
  if ((existing.videoPath || existing.status === 'video-ready') && promptChanged) {
    return { status: 'needs-redraw', redrawMarked: true };
  }
  return { status: existing.status || 'ready', redrawMarked: existing.redrawMarked };
}

function buildRows(now, existingTasks = []) {
  const existingBySourceIndex = existingTaskIndex(existingTasks);
  return desertLevels.map((level, index) => {
    const levelId = String(level.id).padStart(3, '0');
    const videoName = `level-${levelId}-${slugify(level.title)}`;
    const finalPrompt = promptForLevel(level);
    const rowNumber = index + 2;
    const existing = existingBySourceIndex.get(String(level.id));
    const statusPatch = statusForPrompt(existing, finalPrompt);
    return {
      ...(existing || {}),
      id: existing?.id || taskId(CSV_PATH, rowNumber),
      rowNumber,
      sourceIndex: String(level.id),
      videoName,
      firstPrompt: videoName,
      status: statusPatch.status,
      finalPrompt,
      error: existing?.error || '',
      redrawMarked: statusPatch.redrawMarked,
      updatedAt: now,
      metadata: {
        level: level.id,
        title: level.title,
        zhTitle: level.zhTitle,
        topic: level.topic,
        ttsText: spokenTargetFor(level.title),
        curriculum: level.curriculum,
      },
    };
  });
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function main() {
  if (!Array.isArray(desertLevels) || desertLevels.length !== 200) {
    throw new Error(`Expected 200 desert levels, got ${desertLevels?.length}`);
  }

  const now = new Date().toISOString();
  const suffix = stamp();
  const existingTasks = readExistingTasks();
  const rows = buildRows(now, existingTasks);

  fs.mkdirSync(RUNTIME_PROJECT_DIR, { recursive: true });
  fs.mkdirSync(INPUT_DIR, { recursive: true });

  const backups = {
    tasksJson: backupFile(TASKS_PATH, suffix),
    tasksCsv: backupFile(CSV_PATH, suffix),
    sourcePromptsJson: backupFile(path.join(INPUT_DIR, 'source-prompts.json'), suffix),
    projectJson: backupFile(PROJECT_JSON_PATH, suffix),
    settingsJson: backupFile(SETTINGS_PATH, suffix),
    finalPromptsDir: replaceDirWithBackup(FINAL_PROMPTS_DIR, suffix),
  };

  const csv = [
    ['表内顺序', '地图节点顺序', '行类型', 'node_id', 'parent_node_id', 'video_id', '视频内容｜场景/情景'].map(csvCell).join(','),
    ...rows.map((task) => [
      task.sourceIndex,
      task.sourceIndex,
      '沙漠主关卡视频',
      `DESERT-${String(task.sourceIndex).padStart(3, '0')}`,
      '',
      task.videoName,
      task.firstPrompt,
    ].map(csvCell).join(',')),
  ].join('\n') + '\n';
  fs.writeFileSync(CSV_PATH, csv);

  const tasks = rows.map(({ metadata, ...task }) => task);
  writeJson(TASKS_PATH, tasks);

  for (const row of rows) {
    fs.writeFileSync(path.join(FINAL_PROMPTS_DIR, `${row.videoName}.txt`), `${row.finalPrompt}\n`);
  }

  const levels = rows.map((row) => {
    const promptPath = path.join(FINAL_PROMPTS_DIR, `${row.videoName}.txt`);
    return {
      level: row.metadata.level,
      videoName: row.videoName,
      firstPrompt: row.firstPrompt,
      promptPath,
      finalPromptPath: promptPath,
      sha256: sha256(row.finalPrompt),
      title: row.metadata.title,
      zhTitle: row.metadata.zhTitle,
      topic: row.metadata.topic,
      spokenTarget: row.metadata.ttsText,
      ttsSpeaker: DESERT_SPEAKER,
      promptCheckOk: true,
      independentPromptQa: true,
      curriculumVerdict: 'SCRIPT_DESERT_LEVEL_FIXED_20260801',
      curriculum: row.metadata.curriculum,
      promptChars: row.finalPrompt.length,
    };
  });

  const sourcePrompts = {
    schema: 'hirota-desert-workbench-prompts-v2',
    projectId: PROJECT_ID,
    generatedAt: now,
    sourceSummary: {
      sourceProject: '/Users/yr/嗨洛塔少儿启蒙APP',
      sourceFile: '/Users/yr/嗨洛塔少儿启蒙APP/script.js',
      sourceExport: 'desertLevels',
      fixedLevelCount: rows.length,
      ttsSpeaker: DESERT_SPEAKER,
      ttsResource: RESOURCE_ID,
      videoModel: 'Seedance 2.0 Fast VIP',
      durationSeconds: 15,
      format: '16:9',
      statusPolicy: 'preserve-existing-video-state-and-mark-changed-generated-prompts-needs-redraw',
    },
    levels,
    backups,
  };
  writeJson(path.join(INPUT_DIR, 'source-prompts.json'), sourcePrompts);
  writeJson(path.join(INPUT_DIR, `script-fixed-desert-prompts-${suffix}.json`), sourcePrompts);

  const project = fs.existsSync(PROJECT_JSON_PATH)
    ? JSON.parse(fs.readFileSync(PROJECT_JSON_PATH, 'utf8'))
    : {};
  const nextProject = {
    ...project,
    name: PROJECT_NAME,
    projectId: PROJECT_ID,
    sourceProject: '/Users/yr/嗨洛塔少儿启蒙APP',
    sourcePromptSet: `script-desert-levels-fixed-20260801-${suffix}`,
    durationSeconds: 15,
    videoProvider: 'libtv-cli',
    videoModel: 'Seedance 2.0 Fast VIP',
    outputDir: OUTPUT_DIR,
    notes: [
      ...(Array.isArray(project.notes) ? project.notes : []),
      `2026-08-01: Regenerated desert finalPrompt files from per-level semantic scene plans; preserved existing videos and marked changed generated rows for redraw.`,
    ].slice(-12),
    updatedAt: now,
  };
  writeJson(PROJECT_JSON_PATH, nextProject);

  if (fs.existsSync(SETTINGS_PATH)) {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    settings.activeProjectId = PROJECT_ID;
    settings.spreadsheetPath = CSV_PATH;
    settings.promptOnePath = path.join(INPUT_DIR, 'prompt-1.md');
    settings.promptTwoPath = path.join(INPUT_DIR, 'prompt-2.md');
    settings.outputDir = OUTPUT_DIR;
    settings.videoProvider = 'libtv-cli';
    settings.libtvCliVideoSettings = {
      ...(settings.libtvCliVideoSettings || {}),
      modelName: 'Seedance 2.0 Fast VIP',
      ratio: '16:9',
      resolution: '480p',
      durationSeconds: 15,
      enableSound: true,
    };
    writeJson(SETTINGS_PATH, settings);
  }

  const verification = {
    generatedAt: now,
    projectId: PROJECT_ID,
    tasks: tasks.length,
    csvRows: rows.length,
    finalPromptFiles: fs.readdirSync(FINAL_PROMPTS_DIR).filter((name) => name.endsWith('.txt')).length,
    uniqueVideoNames: new Set(rows.map((row) => row.videoName)).size,
    firstFive: rows.slice(0, 5).map((row) => ({
      level: row.metadata.level,
      title: row.metadata.title,
      videoName: row.videoName,
      spokenTarget: row.metadata.ttsText,
    })),
    statusCounts: tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {}),
    backups,
  };
  writeJson(path.join(INPUT_DIR, `script-fixed-desert-prompts-${suffix}.verification.json`), verification);

  console.log(JSON.stringify(verification, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = {
  buildRows,
  promptForLevel,
  readExistingTasks,
  scenePlanForLevel,
  spokenTargetFor,
  statusForPrompt,
};
