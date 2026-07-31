#!/usr/bin/env node
'use strict';

/**
 * Gold-bar preflight against L006–L008 quality bar.
 * Exit 0 = pass; exit 1 = fail. Prints JSON summary.
 *
 * Usage:
 *   node tools/video-prompts/check-desert-gold-bar.js --level 9
 *   node tools/video-prompts/check-desert-gold-bar.js --start 6 --end 20
 *   node tools/video-prompts/check-desert-gold-bar.js --prompt path/to.txt --spoken "..." --answer "..."
 */

const fs = require('node:fs');
const path = require('node:path');
const {
  dialogueLinesOf,
  evaluateDialogueCraft,
  evaluateNaturalDialogue,
  normalizeLine,
  resolveSpokenTarget,
} = require('./lib/desert-semantic-gate.js');

const ROOT = path.resolve(__dirname, '..', '..');
const CONTRACTS = path.join(__dirname, 'desert-level-semantic-contracts-l006-l050.json');

function argValue(name, fallback = null) {
  const argv = process.argv.slice(2);
  const hit = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return fallback;
  if (hit.includes('=')) return hit.split('=').slice(1).join('=');
  const i = argv.indexOf(hit);
  return argv[i + 1] ?? fallback;
}

function loadContracts() {
  return JSON.parse(fs.readFileSync(CONTRACTS, 'utf8')).levels;
}

function latestPromptPath(levelId) {
  const prod = path.join(ROOT, 'output', 'media-production');
  const pad = String(levelId).padStart(3, '0');
  const dirs = fs.readdirSync(prod).filter((d) => d.startsWith(`desert-level-${pad}-`));
  let best = null;
  let bestScore = -1;
  for (const d of dirs) {
    const promptDir = path.join(prod, d, 'prompts');
    if (!fs.existsSync(promptDir)) continue;
    for (const f of fs.readdirSync(promptDir).filter((x) => x.endsWith('.txt'))) {
      const full = path.join(promptDir, f);
      let score = fs.statSync(full).mtimeMs;
      if (full.includes('r4-batchready')) score += 1e15;
      if (score > bestScore) {
        bestScore = score;
        best = full;
      }
    }
  }
  return best;
}

function extractDialogueQuotes(text) {
  const m = text.match(/Dialogue:\s*([\s\S]*?)(?:\nAction & Performance:|\nCamera:|\nAudio:)/i);
  const block = m ? m[1] : '';
  return [...block.matchAll(/"([^"\n]{1,160})"/g)].map((x) => x[1]);
}

function checkOne({ levelId, contract, promptPath, promptText, spoken, answer }) {
  const errors = [];
  const warnings = [];
  const lines = contract
    ? dialogueLinesOf(contract.spokenDialogue)
    : extractDialogueQuotes(promptText || '');
  const spokenTarget = spoken
    || (contract ? resolveSpokenTarget({
      ...contract,
      spokenDialogue: { ...(contract.spokenDialogue || {}), status: 'authored' },
    }) : null)
    || lines[0];
  const answerLabel = answer || contract?.answerOption?.correct || contract?.title || '';

  if (!lines || lines.length < 5) errors.push('need 5 dialogue lines');

  const craft = evaluateDialogueCraft({
    title: answerLabel,
    spokenDialogue: {
      status: 'authored',
      lines,
      requiredLines: lines,
      cefrTargetExpression: spokenTarget,
      targetExpression: spokenTarget,
    },
  });
  if (!craft.ok) errors.push(craft.reason);

  const natural = evaluateNaturalDialogue({
    title: answerLabel,
    spokenDialogue: { requiredLines: lines, allowObjectLabelDialogue: false },
  });
  if (!natural.ok) errors.push(natural.reason);

  // Target teachability
  if (spokenTarget) {
    const sn = normalizeLine(spokenTarget);
    const hits = lines.filter((l) => normalizeLine(l) === sn || normalizeLine(l).includes(sn) || sn.includes(normalizeLine(l))).length;
    if (hits < 1) errors.push(`spoken target not evidenced in dialogue: ${spokenTarget}`);
    if (String(spokenTarget).trim().endsWith('?') && hits >= 2) {
      errors.push(`question target repeated ${hits}x: ${spokenTarget}`);
    }
  }

  // Label must not equal spoken when title is project-ish
  const title = contract?.title || answerLabel;
  if (title && spokenTarget && normalizeLine(title) === normalizeLine(spokenTarget)) {
    const looksLabel = !/[?]/.test(title) && !/^(i |i'm |my |this is |what |who |are you |look|let's |here)/i.test(title)
      && title.split(/\s+/).length <= 4;
    if (looksLabel) warnings.push('title equals spoken — confirm title is a natural sentence, not a project label');
  }

  // Visual richness from contract
  const vs = contract?.visualSemantics || {};
  const mustShow = vs.mustShow || [];
  if (contract && mustShow.length < 4) errors.push(`mustShow needs ≥4 concrete beats, got ${mustShow.length}`);
  if (contract && !(vs.mustNotShow || []).length) warnings.push('mustNotShow empty — add anti-confusion bans');

  // Prompt body checks when available
  const text = promptText || (promptPath && fs.existsSync(promptPath) ? fs.readFileSync(promptPath, 'utf8') : '');
  if (text) {
    for (const sec of [
      'Visual semantic anchors:',
      'Silent-viewer test:',
      'Unknown-language test:',
      'Zero-beginner clarity rule:',
      'Negative Prompt:',
    ]) {
      if (!text.includes(sec)) errors.push(`prompt missing section ${sec}`);
    }
    if (!/front-three-quarter|three-quarter|front-facing/i.test(text)) {
      errors.push('prompt must require front/three-quarter speaking faces');
    }
    if (!/back-facing speaking/i.test(text)) errors.push('negative must ban back-facing speaking');
    // Environment richness (desert gold bar)
    const envHits = [
      /oasis|sand|cream|mint|clay|paper grain|watercolor|gouache/i,
    ].filter((re) => re.test(text)).length;
    if (envHits < 1) warnings.push('prompt weak on desert storybook environment palette');
    // Quiz label not chant note
    if (/quiz answer label/i.test(text) && !/not a required chant|not forced into mouth/i.test(text)) {
      warnings.push('spell out that quiz label is not a required chant');
    }
    // Anti-confusion for name lessons
    if (levelId >= 6 && levelId <= 8) {
      if (!/handshake|nice to meet/i.test(text)) {
        warnings.push('name lessons should ban handshake / nice-to-meet confusion');
      }
    }
  } else if (contract) {
    warnings.push('no prompt file found — contract-only check');
  }

  // Learning objective present
  const lo = contract?.learningObjective?.text || '';
  if (contract && lo.trim().length < 12) errors.push('learningObjective too thin');

  return {
    levelId: levelId || null,
    title: title || null,
    spokenTarget: spokenTarget || null,
    promptPath: promptPath ? path.relative(ROOT, promptPath) : null,
    ok: errors.length === 0,
    errors,
    warnings,
    lines,
  };
}

function main() {
  const start = Number(argValue('start', argValue('level', '')));
  const end = Number(argValue('end', argValue('level', '')));
  const promptOnly = argValue('prompt');
  const results = [];

  if (promptOnly) {
    results.push(checkOne({
      promptPath: path.resolve(promptOnly),
      promptText: fs.readFileSync(path.resolve(promptOnly), 'utf8'),
      spoken: argValue('spoken'),
      answer: argValue('answer'),
    }));
  } else {
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      console.error('Usage: --level N  OR  --start A --end B  OR  --prompt file --spoken ... --answer ...');
      process.exit(2);
    }
    const levels = loadContracts();
    for (let id = start; id <= end; id += 1) {
      const contract = levels[String(id)];
      if (!contract) {
        results.push({ levelId: id, ok: false, errors: ['no contract'], warnings: [] });
        continue;
      }
      if (contract.skipGeneration || contract.curriculumVerdict === 'DELETE') {
        results.push({
          levelId: id,
          title: contract.title,
          ok: true,
          skipped: true,
          errors: [],
          warnings: ['DELETE/skipGeneration'],
        });
        continue;
      }
      const promptPath = latestPromptPath(id);
      results.push(checkOne({
        levelId: id,
        contract: {
          ...contract,
          id,
          spokenDialogue: { ...(contract.spokenDialogue || {}), status: 'authored' },
          visualSemantics: { ...(contract.visualSemantics || {}), status: 'authored' },
        },
        promptPath,
        spoken: resolveSpokenTarget({
          ...contract,
          spokenDialogue: { ...(contract.spokenDialogue || {}), status: 'authored' },
        }),
        answer: contract.answerOption?.correct || contract.title,
      }));
    }
  }

  const failed = results.filter((r) => !r.ok && !r.skipped);
  const out = {
    goldBar: 'L006-L008',
    checked: results.length,
    passed: results.filter((r) => r.ok).length,
    failed: failed.length,
    results,
  };
  console.log(JSON.stringify(out, null, 2));
  process.exit(failed.length ? 1 : 0);
}

main();
