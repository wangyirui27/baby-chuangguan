#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  evaluateNaturalDialogue,
  normalizeLine,
  resolveSpokenTarget,
  titleAutofillLineCount,
} = require('./lib/desert-semantic-gate.js');

const CONTRACTS_PATH = path.join(__dirname, 'desert-level-semantic-contracts-l006-l050.json');

function parseArgs(argv) {
  const args = {
    promptPath: null,
    spoken: null,
    answer: null,
    levelId: null,
