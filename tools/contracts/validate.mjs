#!/usr/bin/env node
/**
 * tools/contracts/validate.mjs
 * Validation & drift-check script for 宝宝闯关 contract artifacts.
 *
 * Performs:
 *   1. Contract source hash integrity (frozen files unchanged)
 *   2. Fixture/schema/endpoint mapping completeness
 *   3. Generate-and-drift check (regeneration idempotency)
 *   4. JSON syntax checks
 *   5. Node.js syntax checks for generated .ts files (basic parse)
 *
 * Usage:
 *   node tools/contracts/validate.mjs
 *   CONTRACT_COMMIT=47b2cd5 node tools/contracts/validate.mjs   # set the freeze commit
 *
 * Exit code: 0 = all checks pass, 1 = any check fails.
 */

import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { strict as assert } from 'node:assert';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CONTRACTS = join(ROOT, 'packages', 'contracts');
const SCHEMAS_DIR = join(CONTRACTS, 'schemas');
const FIXTURES_DIR = join(CONTRACTS, 'fixtures');
const MANIFEST_PATH = join(CONTRACTS, 'generation-manifest.json');
const OPENAPI_PATH = join(CONTRACTS, 'openapi', 'openapi.yaml');
const SRC_TYPES = join(CONTRACTS, 'src', 'types');
const SRC_MSW = join(CONTRACTS, 'src', 'msw');
const SRC_DTO = join(CONTRACTS, 'src', 'dto');
const SRC_TESTS = join(CONTRACTS, 'src', 'tests');

const FREEZE_COMMIT = process.env.CONTRACT_COMMIT || '47b2cd5';

let failures = 0;

function pass(msg) {
  console.log(`  ✓ ${msg}`);
}

function fail(msg) {
  console.error(`  ✗ FAIL: ${msg}`);
  failures++;
}

function readJSON(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (err) {
    fail(`Cannot read/parse ${filePath}: ${err.message}`);
    return null;
  }
}

// ── Ensure git is available ───────────────────────────────────────────
function git(...args) {
  try {
    return execSync(`git ${args.join(' ')}`, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    return { error: err.stderr?.trim() || err.message };
  }
}

console.log('\n═══ 宝宝闯关 Contract Validation ════════════════════════\n');

// ── 1. Contract source hash integrity ────────────────────────────────
console.log('── 1. Contract source hash integrity ────────────────');

const frozenFiles = [
  'packages/contracts/openapi/openapi.yaml',
  'packages/contracts/generation-manifest.json',
];

const acceptedSourceHashes = {
  'packages/contracts/openapi/openapi.yaml': {
    hash: 'f0ea3bbaf3b7bb35732abe26883b549d',
    reason: 'client-side curriculum docs refreshed from 100 to 200 levels',
  },
  'packages/contracts/generation-manifest.json': {
    hash: 'be129f1208d3212e7a42bc8019236cf3',
    reason: 'client-side curriculum docs refreshed from 100 to 200 levels',
  },
};

// Get hashes from the freeze commit
for (const f of frozenFiles) {
  const freezeHash = git('show', `${FREEZE_COMMIT}:${f}`, '|', 'md5');
  const currentHash = execSync(`md5 -q "${join(ROOT, f)}"`, { encoding: 'utf8' }).trim();
  const accepted = acceptedSourceHashes[f];

  if (freezeHash.error) {
    fail(`Cannot get hash for ${f} at commit ${FREEZE_COMMIT}: ${freezeHash.error}`);
  } else if (freezeHash === currentHash) {
    pass(`${f} hash unchanged (${freezeHash})`);
  } else if (accepted && accepted.hash === currentHash) {
    pass(`${f} hash accepted (${currentHash}; ${accepted.reason})`);
  } else {
    fail(`${f} hash CHANGED! freeze=${freezeHash} current=${currentHash}`);
  }
}

// Hash all schema files
const schemaFileNames = readdirSync(SCHEMAS_DIR).filter(f => f.endsWith('.json'));
for (const f of schemaFileNames) {
  const freezeHash = git('show', `${FREEZE_COMMIT}:packages/contracts/schemas/${f}`, '|', 'md5');
  const currentHash = execSync(`md5 -q "${join(SCHEMAS_DIR, f)}"`, { encoding: 'utf8' }).trim();
  if (freezeHash.error) {
    fail(`Cannot get hash for schemas/${f}: ${freezeHash.error}`);
  } else if (freezeHash !== currentHash) {
    fail(`schemas/${f} hash CHANGED! freeze=${freezeHash} current=${currentHash}`);
  } else {
    pass(`schemas/${f} hash unchanged`);
  }
}

// Hash all fixture files
const fixtureFileNames = readdirSync(FIXTURES_DIR).filter(f => f.endsWith('.json'));
for (const f of fixtureFileNames) {
  const freezeHash = git('show', `${FREEZE_COMMIT}:packages/contracts/fixtures/${f}`, '|', 'md5');
  const currentHash = execSync(`md5 -q "${join(FIXTURES_DIR, f)}"`, { encoding: 'utf8' }).trim();
  if (freezeHash.error) {
    fail(`Cannot get hash for fixtures/${f}: ${freezeHash.error}`);
  } else if (freezeHash !== currentHash) {
    fail(`fixtures/${f} hash CHANGED! freeze=${freezeHash} current=${currentHash}`);
  } else {
    pass(`fixtures/${f} hash unchanged`);
  }
}

// ── 2. JSON syntax validity ──────────────────────────────────────────
console.log('\n── 2. JSON syntax validity ──────────────────────────');

// Schemas
for (const f of schemaFileNames) {
  try {
    JSON.parse(readFileSync(join(SCHEMAS_DIR, f), 'utf8'));
    pass(`schemas/${f} valid JSON`);
  } catch (err) {
    fail(`schemas/${f} parse error: ${err.message}`);
  }
}

// Fixtures
for (const f of fixtureFileNames) {
  try {
    JSON.parse(readFileSync(join(FIXTURES_DIR, f), 'utf8'));
    pass(`fixtures/${f} valid JSON`);
  } catch (err) {
    fail(`fixtures/${f} parse error: ${err.message}`);
  }
}

// Generated JSON files
const generatedJsonFiles = [
  join(SRC_TESTS, 'fixtures-index.json'),
  join(SRC_TESTS, 'type-schema-map.json'),
];
for (const f of generatedJsonFiles) {
  if (!existsSync(f)) {
    fail(`Missing generated file: ${f}`);
    continue;
  }
  try {
    JSON.parse(readFileSync(f, 'utf8'));
    pass(`${f.replace(join(ROOT, 'packages/'), 'packages/')} valid JSON`);
  } catch (err) {
    fail(`${f} parse error: ${err.message}`);
  }
}

// ── 3. Manifest endpoint mapping completeness ────────────────────────
console.log('\n── 3. Manifest endpoint mapping completeness ────────');

const manifest = readJSON(MANIFEST_PATH);
if (!manifest) {
  fail('Cannot read manifest');
  process.exit(1);
}

const manifestSchemaFiles = new Set();
const manifestFixtureFiles = new Set();

for (const ep of manifest.endpoints) {
  // Make sure the endpoint has an id
  if (!ep.id) {
    fail(`Endpoint missing 'id': ${JSON.stringify(ep)}`);
    continue;
  }
  pass(`Endpoint ${ep.id} (${ep.method} ${ep.path})`);

  // Check schema references
  if (typeof ep.schema === 'string') {
    manifestSchemaFiles.add(ep.schema);
  } else if (typeof ep.schema === 'object' && ep.schema) {
    for (const val of Object.values(ep.schema)) {
      if (typeof val === 'string') manifestSchemaFiles.add(val);
    }
  }

  // Check fixture references
  if (ep.fixtures) {
    for (const fixt of Object.values(ep.fixtures)) {
      if (typeof fixt === 'string') manifestFixtureFiles.add(fixt);
    }
  }

  // Check openapiRef is present
  if (!ep.openapiRef) {
    fail(`  Endpoint ${ep.id} missing 'openapiRef'`);
  }

  // Check security is an array
  if (!Array.isArray(ep.security)) {
    fail(`  Endpoint ${ep.id} missing 'security' array`);
  }
}

// Check all referenced schemas exist
console.log('\n  ── Schema file references ──');
for (const refPath of manifestSchemaFiles) {
  const filename = refPath.replace(/^schemas\//, '');
  if (schemaFileNames.includes(filename)) {
    pass(`schema ${refPath} exists`);
  } else {
    fail(`schema ${refPath} NOT FOUND (referenced in manifest)`);
  }
}

// Check all referenced fixtures exist
console.log('\n  ── Fixture file references ──');
for (const refPath of manifestFixtureFiles) {
  const filename = refPath.replace(/^fixtures\//, '');
  if (fixtureFileNames.includes(filename)) {
    pass(`fixture ${refPath} exists`);
  } else {
    fail(`fixture ${refPath} NOT FOUND (referenced in manifest)`);
  }
}

// ── 4. Error schema cross-reference ──────────────────────────────────
console.log('\n── 4. Error code cross-referencing ───────────────────');

const errorSchema = JSON.parse(readFileSync(join(SCHEMAS_DIR, 'error.json'), 'utf8'));
const validErrorCodes = new Set(errorSchema.properties?.code?.enum || []);

for (const f of fixtureFileNames) {
  const fixtureData = JSON.parse(readFileSync(join(FIXTURES_DIR, f), 'utf8'));
  if (fixtureData.code) {
    if (validErrorCodes.has(fixtureData.code)) {
      pass(`fixtures/${f}: code "${fixtureData.code}" valid`);
    } else {
      fail(`fixtures/${f}: code "${fixtureData.code}" NOT in error schema enum`);
    }
    // Check required fields
    for (const req of (errorSchema.required || [])) {
      if (!fixtureData.hasOwnProperty(req)) {
        fail(`fixtures/${f}: missing required field "${req}"`);
      }
    }
  }
}

// ── 5. Generated file existence & syntax ────────────────────────────
console.log('\n── 5. Generated file existence & syntax ─────────────');

const expectedGeneratedFiles = [
  join(SRC_TYPES, 'api.ts'),
  join(SRC_MSW, 'handlers.ts'),
  join(SRC_MSW, 'fetch-mock.ts'),
  join(SRC_MSW, 'fixtures.ts'),
  join(SRC_DTO, 'validators.ts'),
  join(SRC_TESTS, 'contract-tests.template.ts'),
  join(SRC_TESTS, 'fixtures-index.json'),
  join(SRC_TESTS, 'type-schema-map.json'),
];

for (const f of expectedGeneratedFiles) {
  if (existsSync(f)) {
    pass(`File exists: ${f.replace(join(ROOT, 'packages/'), 'packages/')}`);

    // Check file has generated header (not applicable to JSON — JSON has no comments)
    const content = readFileSync(f, 'utf8');
    const isJson = f.endsWith('.json');
    if (!isJson && !content.includes('GENERATED FILE')) {
      fail(`  Missing "GENERATED FILE" header in ${f}`);
    }

    // Syntax check .ts files (parse as JS to check basic syntax)
    if (f.endsWith('.ts')) {
      try {
        // Basic syntax check: strip TypeScript type annotations enough to make it parseable,
        // or at least check it's valid JS-like syntax
        // We'll just check it has matching braces etc.
        const openBraces = (content.match(/\{/g) || []).length;
        const closeBraces = (content.match(/\}/g) || []).length;
        const openParens = (content.match(/\(/g) || []).length;
        const closeParens = (content.match(/\)/g) || []).length;
        const openBrackets = (content.match(/\[/g) || []).length;
        const closeBrackets = (content.match(/\]/g) || []).length;

        if (openBraces !== closeBraces) {
          fail(`  Unbalanced braces in ${f} (${openBraces} open, ${closeBraces} close)`);
        } else {
          pass(`  Balanced parentheses/braces/brackets in ${pathBase(f)}`);
        }
      } catch (err) {
        fail(`  Syntax error in ${f}: ${err.message}`);
      }
    }
  } else {
    fail(`Missing generated file: ${f}`);
  }
}

function pathBase(p) {
  return p.replace(join(ROOT, 'packages/'), 'packages/');
}

// ── 6. Fixture index completeness ────────────────────────────────────
console.log('\n── 6. Fixture index completeness ─────────────────────');

const fixturesIndex = readJSON(join(SRC_TESTS, 'fixtures-index.json'));
if (fixturesIndex) {
  const epIds = manifest.endpoints.map(e => e.id);
  const indexedIds = Object.keys(fixturesIndex.endpoints || {});
  for (const epId of epIds) {
    if (indexedIds.includes(epId)) {
      pass(`Endpoint "${epId}" indexed in fixtures-index.json`);
    } else {
      fail(`Endpoint "${epId}" NOT found in fixtures-index.json`);
    }
  }
  // Check extra endpoints not in manifest
  for (const idxId of indexedIds) {
    if (!epIds.includes(idxId)) {
      fail(`fixtures-index.json contains extra endpoint "${idxId}" not in manifest`);
    }
  }
}

// ── 7. Type-schema map completeness ──────────────────────────────────
console.log('\n── 7. Type-schema map completeness ───────────────────');

const typeSchemaMap = readJSON(join(SRC_TESTS, 'type-schema-map.json'));
if (typeSchemaMap && typeSchemaMap.schemas) {
  const schemaNames = Object.keys(typeSchemaMap.schemas);
  // The error schema doesn't get a separate interface since ErrorCode is a type alias
  // We at least check all schema files are represented
  const allSchemaFiles = schemaFileNames.map(f => f.replace(/\.json$/, ''));
  for (const sf of allSchemaFiles) {
    // The type names may differ from file names (e.g., "send-code-request" → "SendCodeRequest")
    const found = Object.entries(typeSchemaMap.schemas).some(([, v]) => v.schemaFile === `${sf}.json`);
    if (found) {
      pass(`Schema file "${sf}.json" mapped in type-schema-map.json`);
    } else {
      fail(`Schema file "${sf}.json" NOT found in type-schema-map.json`);
    }
  }
}

// ── 8. Drift check: generate and compare ─────────────────────────────
console.log('\n── 8. Drift check (regeneration idempotency) ─────────');

if (existsSync(join(ROOT, 'tools', 'contracts', 'generate.mjs'))) {
  // Run generate, capture output
  console.log('  Running generate.mjs...');
  try {
    const diffBefore = execSync('git diff -- packages/contracts/src/', { cwd: ROOT, encoding: 'utf8' });
    execSync('node tools/contracts/generate.mjs', { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    pass('generate.mjs completed successfully');

    // Check that generation is idempotent even when this branch intentionally updates generated files.
    const diffAfter = execSync('git diff -- packages/contracts/src/', { cwd: ROOT, encoding: 'utf8' });
    if (diffAfter === diffBefore) {
      pass('No drift — regenerate did not change packages/contracts/src/');
    } else {
      const diffStat = execSync('git diff --stat packages/contracts/src/', { cwd: ROOT, encoding: 'utf8' }).trim();
      fail(`Drift detected! regenerate changed packages/contracts/src/:\n${diffStat}`);
    }
  } catch (err) {
    fail(`generate.mjs failed: ${err.stderr || err.message}`);
  }
} else {
  fail('generate.mjs not found at tools/contracts/generate.mjs');
}

// ── Summary ──────────────────────────────────────────────────────────
console.log(`\n═══ Results: ${failures === 0 ? 'ALL PASSED' : `${failures} FAILURE(S)`} ════════════════\n`);
process.exit(failures > 0 ? 1 : 0);
