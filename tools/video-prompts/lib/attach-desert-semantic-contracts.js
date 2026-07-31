'use strict';

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_CONTRACTS_PATH = path.join(__dirname, '..', 'desert-level-semantic-contracts-l006-l050.json');

function applyDesertSemanticDefaults(levels) {
  for (const level of levels) {
    if (!level.spokenDialogue) {
      level.spokenDialogue = { status: 'missing', lines: [] };
    } else if (!level.spokenDialogue.status) {
      level.spokenDialogue.status = Array.isArray(level.spokenDialogue.lines) && level.spokenDialogue.lines.length
        ? 'authored'
        : 'missing';
    }
    if (!level.visualSemantics) {
      level.visualSemantics = { status: 'missing', mustShow: [], mustNotShow: [] };
    } else if (!level.visualSemantics.status) {
      level.visualSemantics.status = Array.isArray(level.visualSemantics.mustShow) && level.visualSemantics.mustShow.length
        ? 'authored'
        : 'missing';
    }
    if (!level.learningObjective) {
      level.learningObjective = {
        transferProbe: level.transferProbe,
        pepUnit: level.pepUnit,
        pepFocus: level.pepFocus,
        functionTag: level.functionTag,
        status: 'proposed',
      };
    }
    if (!level.questionTask) {
      level.questionTask = {
        questionType: level.questionType,
      };
    }
    if (!level.answerOption) {
      level.answerOption = {
        correct: level.title,
        options: level.options,
      };
    }
    if (!level.videoPromptInput) {
      level.videoPromptInput = {
        source: 'spokenDialogue+visualSemantics',
        forbidTitleFallback: true,
      };
    }
  }
  return levels;
}

function ensureProjectVisualFloor(level) {
  const visual = level.visualSemantics || { status: 'authored', mustShow: [], mustNotShow: [] };
  const mustShow = [...(visual.mustShow || [])];
  // L013/L014 are DELETE+skipGeneration — no hardcoded visual overrides.
  // Project levels need >=2 concrete visual facts for fail-closed template checks.
  if (level.questionType === 'project' && mustShow.length < 2) {
    const base = mustShow[0] || `visible project action for ${level.title}`;
    mustShow.push(base, `state change is visible for ${level.title}; no readable text`);
  }
  visual.mustShow = [...new Set(mustShow.filter(Boolean))];
  visual.status = 'authored';
  if (!visual.templateId) {
    visual.templateId = `visual.l${String(level.id).padStart(3, '0')}.v1`;
  }
  level.visualSemantics = visual;
}

function attachDesertSemanticContracts(levels, contractsPath = DEFAULT_CONTRACTS_PATH) {
  applyDesertSemanticDefaults(levels);
  if (!fs.existsSync(contractsPath)) return { attached: 0, path: contractsPath };
  const payload = JSON.parse(fs.readFileSync(contractsPath, 'utf8'));
  const map = payload.levels || payload;
  let attached = 0;
  for (const level of levels) {
    const contract = map[String(level.id)] || map[level.id];
    if (!contract) continue;
    level.learningObjective = {
      ...(level.learningObjective || {}),
      text: contract.learningObjective?.text || level.learningObjective?.text,
      status: contract.learningObjective?.status || 'proposed',
      needsTextbookCheck: contract.learningObjective?.needsTextbookCheck === true,
      transferProbe: level.transferProbe,
      pepUnit: level.pepUnit,
      pepFocus: level.pepFocus,
      functionTag: level.functionTag,
    };
    level.questionTask = {
      ...(level.questionTask || {}),
      ...contract.questionTask,
      questionType: level.questionType,
    };
    level.spokenDialogue = {
      ...contract.spokenDialogue,
      status: 'authored',
    };
    level.visualSemantics = {
      ...contract.visualSemantics,
      status: 'authored',
    };
    level.answerOption = {
      correct: contract.answerOption?.correct || level.title,
      distractors: contract.answerOption?.distractors || [],
      options: level.options,
    };
    level.videoPromptInput = {
      ...(contract.videoPromptInput || {}),
      source: 'spokenDialogue+visualSemantics',
      forbidTitleFallback: true,
    };
    level.curriculumVerdict = contract.curriculumVerdict || level.curriculumVerdict;
    level.titleCategory = contract.titleCategory || level.titleCategory;
    if (contract.skipGeneration !== undefined) {
      level.skipGeneration = contract.skipGeneration;
    }
    ensureProjectVisualFloor(level);
    attached += 1;
  }
  return { attached, path: contractsPath, levelCount: payload.levelCount };
}

module.exports = {
  applyDesertSemanticDefaults,
  attachDesertSemanticContracts,
  DEFAULT_CONTRACTS_PATH,
};
