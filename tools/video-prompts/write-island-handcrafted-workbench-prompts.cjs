#!/usr/bin/env node

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ID = 'baby-island-levels-v1';
const PROJECT_NAME = '宝宝闯关·海岛关卡视频';
const ROOT_DIR = '/Users/yr/嗨洛塔少儿启蒙APP';
const HANDCRAFTED_MD = path.join(ROOT_DIR, 'docs/curriculum/toddler-noun-handcrafted-prompts-20260801.md');
const DOC_PROJECT_DIR = '/Users/yr/Documents/LibTV Workbench/projects/baby-island-levels-v1';
const RUNTIME_PROJECT_DIR = '/Users/yr/Library/Application Support/libtv-workbench/projects/baby-island-levels-v1';
const SETTINGS_PATH = '/Users/yr/Library/Application Support/libtv-workbench/settings.json';
const OUTPUT_DIR = '/Users/yr/video/baby-island-levels-v1';
const INPUT_DIR = path.join(DOC_PROJECT_DIR, 'input');
const FINAL_PROMPTS_DIR = path.join(INPUT_DIR, 'final-prompts');
const CSV_PATH = path.join(INPUT_DIR, 'tasks.csv');
const TASKS_PATH = path.join(RUNTIME_PROJECT_DIR, 'tasks.json');
const PROJECT_JSON_PATH = path.join(DOC_PROJECT_DIR, 'project.json');
const SOURCE_PROMPTS_PATH = path.join(INPUT_DIR, 'source-prompts.json');

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function backupFile(filePath, suffix) {
  if (!fs.existsSync(filePath)) return null;
  const backupPath = `${filePath}.before-handcrafted-${suffix}.bak`;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function replaceDirWithBackup(dirPath, suffix) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return null;
  }
  const backupPath = `${dirPath}.before-handcrafted-${suffix}`;
  fs.rmSync(backupPath, { recursive: true, force: true });
  fs.renameSync(dirPath, backupPath);
  fs.mkdirSync(dirPath, { recursive: true });
  return backupPath;
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function parseHandcraftedRows() {
  const text = fs.readFileSync(HANDCRAFTED_MD, 'utf8');
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\|\s*(\d{3})\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/);
    if (!match) continue;
    rows.push({
      level: Number(match[1]),
      title: match[2].trim(),
      zhTitle: match[3].trim(),
      recallCue: match[4].trim(),
      handcraftedScene: match[5].trim(),
    });
  }
  return rows;
}

function isBoyGirlLevel(row) {
  return row.title === 'Boy' || row.title === 'Girl';
}

function speakerGuardForRow(row) {
  if (!isBoyGirlLevel(row)) return '';
  const noun = row.title;
  const lower = noun.toLowerCase();
  const group = noun === 'Boy' ? "boys' side" : "girls' side";
  return `Speaker Guard: The ${lower} group is the visual target only. The target children must not speak, repeat, or self-label with "${noun}". Only the teacher says "${noun}" twice while pointing first to the ${group} and then to the clearest front ${lower}. The target children respond silently with a natural smile, wave, or small nod.`;
}

function shotBeatsForRow(row) {
  if (isBoyGirlLevel(row)) {
    return `Shot Beats:
0-4s: Show two small separated groups of children first, with the target side already easier to see than the contrast side.
4-8s: The teacher kneels between the groups, turns an open palm toward the target side, and says the target noun once.
8-12s: The teacher gently points toward the clearest front target child and says the same target noun again; the target children stay silent and respond naturally.
12-15s: End on the target side smiling or waving softly while the contrast side remains secondary.`;
  }
  return `Shot Beats:
0-4s: Show the target noun silently first, large and unmistakable, before any speech.
4-8s: Let the child notice, reach for, hold, handle, or safely use the target in the exact real-life situation described above.
8-12s: Add one tiny natural motion or reaction that makes this specific noun memorable, not a generic lesson demo.
12-15s: End on a warm close-up where the target noun is still clearly visible and the child looks ready to say the word again.`;
}

function dialogueLogicForRow(row) {
  if (isBoyGirlLevel(row)) {
    return `Dialogue Logic: The target noun "${row.title}" must be spoken exactly two times by the teacher, complete and uncut, with warm neutral energy. The foreground ${row.title.toLowerCase()} or target group must never say "${row.title}" and must never label themselves. No other spoken English is needed. Do not add a narrator, chant, classroom drill, or repeated self-labeling.`;
  }
  return `Dialogue Logic: The target noun "${row.title}" must be heard clearly two times, complete and uncut, with warm neutral energy. The spoken target word must match "${row.title}" exactly, with clear final consonants; do not invent or mispronounce it. Any extra English must be rare, very short, and logically caused by the visible action. Greetings are allowed only when someone visibly arrives or makes eye contact to greet. Farewells are allowed only when someone visibly leaves. Speaker identity must stay correct: family-role words may be used only by the child when addressing that family member, not by the adult to label themselves or by the wrong person toward the wrong addressee. Prefer nonverbal adult responses such as a smile, nod, hug, wave, or gentle help. Do not add a narrator or a classroom drill.`;
}

function negativePromptForRow(row) {
  if (isBoyGirlLevel(row)) {
    return `Negative Prompt: no subtitles, no captions, no readable text, no alphabet letters, no numbers, no flashcards, no blackboard, no logo, no watermark, no UI, no target-child self-labeling, no children chanting the target word, no narrator, no role-confused dialogue, no extra dialogue that competes with the target noun, no mispronounced target word, no plastic CGI, no glossy 3D, no neon, no scary danger, no weapons, no medical injury, no body shame, no crowded foreground props, no cut-off speech.`;
  }
  return `Negative Prompt: no subtitles, no captions, no readable text, no alphabet letters, no numbers, no flashcards, no blackboard, no logo, no watermark, no UI, no teacher drill, no role-confused dialogue, no caregiver self-labeling with the target family word, no farewell without a visible departure, no greeting without a visible greeting moment, no extra dialogue that competes with the target noun, no mispronounced target word, no plastic CGI, no glossy 3D, no neon, no scary danger, no weapons, no medical injury, no body shame, no crowded foreground props, no extra learnable object competing with the target, no cut-off speech.`;
}

function promptForRow(row) {
  const levelId = String(row.level).padStart(3, '0');
  const speakerGuard = speakerGuardForRow(row);
  return `Title: Toddler Life Noun Level ${levelId} - ${row.title}

Duration: 15 seconds

Format: 16:9 horizontal

Cinematic Style: Hand-painted watercolor and gouache storybook animation matching the HiRota child-learning character family. Warm cream daylight, soft home and preschool colors, gentle outdoor greens only when the real-life scene needs them, tiny coral accents, soft pencil outlines, visible paper grain, low saturation, gentle imperfect brush texture. Child-safe faces with bright clean eyes, soft cheeks, balanced proportions, and gentle smiles. Not glossy 3D, not plastic CGI, not neon, not hard vector.

Learning Audience: 3-5 year old zero-beginner English learners in non-native countries. This level teaches one practical English noun only. The video itself must feel like a real home, preschool, street, park, or family-life memory.

Target Noun: "${row.title}".
Chinese Meaning: ${row.zhTitle}.
Real-Life Recall Cue: ${row.recallCue}.

Handcrafted Scene: ${row.handcraftedScene}${speakerGuard ? `\n\n${speakerGuard}` : ''}

Memory Design: The object, person, animal, body part, shape, food, or daily item named "${row.title}" must be the only clear learning target. The scene should help a child later see the same thing in real life and say "${row.title}" aloud without needing translation. Supporting hands, furniture, plates, windows, or caregivers may appear only when they make the real-life memory clearer; they must not become competing vocabulary targets.

${shotBeatsForRow(row)}

${dialogueLogicForRow(row)}

Camera: Stable medium-close or close shot with slow child-safe movement. Keep the speaking child's face and mouth visible when speaking. No fast cuts, no back-facing speech, no side-profile-only mouth, no over-the-shoulder dialogue.

Audio: Clear child-friendly English, consistent gentle energy, soft real-life ambience, very light music if any. Avoid dramatic sadness, anger, shouting, whispering, or overly emotional delivery.

${negativePromptForRow(row)}`;
}

function readJsonMaybe(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function existingTaskByLevel(tasks) {
  return new Map(tasks.map((task) => [Number(task.sourceIndex), task]));
}

function validateHandcrafted(rows) {
  if (rows.length !== 200) throw new Error(`Expected 200 handcrafted rows for 1-200, got ${rows.length}`);
  const seen = new Set();
  for (let level = 1; level <= 200; level += 1) {
    const row = rows.find((item) => item.level === level);
    if (!row) throw new Error(`Missing handcrafted level ${level}`);
    const key = row.title.toLowerCase();
    if (seen.has(key)) throw new Error(`Duplicate noun: ${row.title}`);
    seen.add(key);
  }
  const banned = new Set(['Jump', 'Run', 'Swim', 'Dance', 'Sing', 'Play', 'Eat', 'Drink', 'Walk', 'Sleep']);
  const bad = rows.filter((row) => banned.has(row.title));
  if (bad.length) throw new Error(`Action words survived: ${bad.map((row) => row.title).join(', ')}`);
}

function statusFor(existing, nextPrompt, promptChanged) {
  if (!existing) return { status: 'ready', redrawMarked: false };
  if (promptChanged && (existing.videoPath || existing.status === 'video-ready' || existing.status === 'running-libtv')) {
    return { status: 'needs-redraw', redrawMarked: true };
  }
  return { status: existing.status || 'ready', redrawMarked: existing.redrawMarked };
}

function buildRows(now, existingTasks, handcraftedRows) {
  const tasksByLevel = existingTaskByLevel(existingTasks);
  const handcraftedByLevel = new Map(handcraftedRows.map((row) => [row.level, row]));
  const rows = [];
  for (let level = 1; level <= 200; level += 1) {
    const existing = tasksByLevel.get(level);
    if (!existing) throw new Error(`Runtime task missing level ${level}`);
    const handcrafted = handcraftedByLevel.get(level);
    if (!handcrafted) throw new Error(`Handcrafted source missing level ${level}`);
    const title = handcrafted.title;
    const zhTitle = handcrafted.zhTitle;
    const topic = topicForLevel(level);
    const videoName = `level-${String(level).padStart(3, '0')}-${slugify(title)}`;
    const finalPrompt = promptForRow(handcrafted);
    const existingForTarget = existing.videoName && existing.videoName !== videoName
      ? { ...existing, videoPath: undefined, videoCandidates: [] }
      : existing;
    const promptChanged = Boolean(existing.finalPrompt) && existing.finalPrompt !== finalPrompt;
    const statusPatch = statusFor(existingForTarget, finalPrompt, promptChanged);
    rows.push({
      ...existingForTarget,
      sourceIndex: String(level),
      videoName,
      firstPrompt: videoName,
      finalPromptPath: path.join(FINAL_PROMPTS_DIR, `${videoName}.txt`),
      finalPrompt,
      status: statusPatch.status,
      redrawMarked: statusPatch.redrawMarked,
      updatedAt: now,
      metadata: {
        ...(existing.metadata || {}),
        level,
        title,
        zhTitle,
        topic,
        promptSource: 'handcrafted-life-noun-v1',
        realLifeRecallCue: handcrafted?.recallCue,
        handcraftedScene: handcrafted?.handcraftedScene,
      },
    });
  }
  return rows;
}

function topicForLevel(level) {
  if (level <= 10) return 'Free Starter · 免费体验';
  if (level <= 20) return '水果先遣队';
  if (level <= 30) return '零食甜点';
  if (level <= 40) return '吃饭喝喝';
  if (level <= 50) return '蔬菜小餐桌';
  if (level <= 60) return '萌宠动物';
  if (level <= 70) return '大动物';
  if (level <= 80) return '小小动物';
  if (level <= 90) return '我的身体';
  if (level <= 120) return '沙漠预备生活名词一';
  if (level <= 130) return '客厅卧室';
  if (level <= 140) return '厨房餐桌';
  if (level <= 150) return '洗漱与沙漠预备';
  if (level <= 160) return '天气天空';
  if (level <= 180) return '自然交通与沙漠预备';
  if (level <= 190) return '幼儿园与沙漠预备';
  if (level <= 195) return '形状与沙漠预备';
  return '生活收尾';
}

function main() {
  const now = new Date().toISOString();
  const suffix = stamp();
  const handcraftedRows = parseHandcraftedRows();
  validateHandcrafted(handcraftedRows);
  const existingTasks = readJsonMaybe(TASKS_PATH, []);
  if (!Array.isArray(existingTasks) || existingTasks.length !== 200) {
    throw new Error(`Expected 200 runtime tasks, got ${existingTasks.length}`);
  }
  const rows = buildRows(now, existingTasks, handcraftedRows);

  fs.mkdirSync(RUNTIME_PROJECT_DIR, { recursive: true });
  fs.mkdirSync(INPUT_DIR, { recursive: true });

  const backups = {
    tasksJson: backupFile(TASKS_PATH, suffix),
    tasksCsv: backupFile(CSV_PATH, suffix),
    sourcePromptsJson: backupFile(SOURCE_PROMPTS_PATH, suffix),
    projectJson: backupFile(PROJECT_JSON_PATH, suffix),
    settingsJson: backupFile(SETTINGS_PATH, suffix),
    finalPromptsDir: replaceDirWithBackup(FINAL_PROMPTS_DIR, suffix),
  };

  const csv = [
    ['表内顺序', '地图节点顺序', '行类型', 'node_id', 'parent_node_id', 'video_id', '视频内容｜场景/情景'].map(csvCell).join(','),
    ...rows.map((row) => [
      row.sourceIndex,
      row.sourceIndex,
      '海岛主关卡视频',
      `ISLAND-${String(row.sourceIndex).padStart(3, '0')}`,
      '',
      row.videoName,
      row.firstPrompt,
    ].map(csvCell).join(',')),
  ].join('\n') + '\n';
  fs.writeFileSync(CSV_PATH, csv);

  const tasks = rows.map(({ metadata, ...task }) => task);
  writeJson(TASKS_PATH, tasks);

  for (const row of rows) {
    fs.writeFileSync(path.join(FINAL_PROMPTS_DIR, `${row.videoName}.txt`), `${row.finalPrompt}\n`);
  }

  const sourcePrompts = {
    schema: 'hirota-island-handcrafted-life-noun-prompts-v1',
    projectId: PROJECT_ID,
    generatedAt: now,
    sourceSummary: {
      sourceProject: ROOT_DIR,
      handcraftedSource: HANDCRAFTED_MD,
      rewrittenLevels: '1-200',
      audience: '3-5 year old zero-beginner English learners in non-native countries',
      designGoal: 'real-life noun recall, not island-theme vocabulary',
      videoModel: 'Seedance 2.0 Fast VIP',
      durationSeconds: 15,
      format: '16:9',
      statusPolicy: 'changed prompts with existing videos are marked needs-redraw by default; verify runtime status after shared-template-only maintenance',
    },
    levels: rows.map((row) => {
      const promptPath = path.join(FINAL_PROMPTS_DIR, `${row.videoName}.txt`);
      return {
        level: Number(row.sourceIndex),
        videoName: row.videoName,
        firstPrompt: row.firstPrompt,
        finalPromptPath: promptPath,
        sha256: sha256(row.finalPrompt),
        title: row.metadata.title,
        zhTitle: row.metadata.zhTitle,
        topic: row.metadata.topic,
        promptSource: row.metadata.promptSource,
        realLifeRecallCue: row.metadata.realLifeRecallCue,
        handcraftedScene: row.metadata.handcraftedScene,
        promptChars: row.finalPrompt.length,
      };
    }),
    backups,
  };
  writeJson(SOURCE_PROMPTS_PATH, sourcePrompts);
  writeJson(path.join(INPUT_DIR, `handcrafted-life-noun-prompts-${suffix}.json`), sourcePrompts);

  const project = readJsonMaybe(PROJECT_JSON_PATH, {});
  writeJson(PROJECT_JSON_PATH, {
    ...project,
    name: PROJECT_NAME,
    projectId: PROJECT_ID,
    sourceProject: ROOT_DIR,
    sourcePromptSet: `handcrafted-life-noun-v1-${suffix}`,
    durationSeconds: 15,
    videoProvider: 'libtv-cli',
    videoModel: 'Seedance 2.0 Fast VIP',
    outputDir: OUTPUT_DIR,
    notes: [
      ...(Array.isArray(project.notes) ? project.notes : []),
      `2026-08-01: Wrote handcrafted 3-5 life-noun prompts for levels 1-200; marked changed generated rows needs-redraw.`,
    ].slice(-12),
    updatedAt: now,
  });

  const settings = readJsonMaybe(SETTINGS_PATH, null);
  if (settings) {
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
    finalPromptFiles: fs.readdirSync(FINAL_PROMPTS_DIR).filter((name) => name.endsWith('.txt')).length,
    csvRows: rows.length,
    rewrittenLevels: rows.length,
    starterRewritten: rows.slice(0, 10).every((row) => row.metadata.promptSource === 'handcrafted-life-noun-v1'),
    changedPromptRows: rows.filter((row) => {
      const existing = existingTaskByLevel(existingTasks).get(Number(row.sourceIndex));
      return existing && existing.finalPrompt !== row.finalPrompt;
    }).map((row) => Number(row.sourceIndex)),
    statusCounts: tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {}),
    samples: [1, 5, 10, 11, 39, 114, 181, 199, 200].map((level) => {
      const row = rows[level - 1];
      return {
        level,
        videoName: row.videoName,
        title: row.metadata.title,
        status: row.status,
        promptSource: row.metadata.promptSource,
      };
    }),
    backups,
  };
  writeJson(path.join(INPUT_DIR, `handcrafted-life-noun-prompts-${suffix}.verification.json`), verification);
  console.log(JSON.stringify(verification, null, 2));
}

if (require.main === module) main();
