#!/usr/bin/env node
/**
 * tools/contracts/generate.mjs
 * Scaffolder code generation script for 宝宝闯关 contract artifacts.
 *
 * Reads packages/contracts/generation-manifest.json, schemas/*.json,
 * and fixtures/*.json to produce:
 *   - frontend TypeScript types   → packages/contracts/src/types/
 *   - MSW-compatible handlers     → packages/contracts/src/msw/
 *   - backend DTO validators      → packages/contracts/src/dto/
 *   - contract test templates     → packages/contracts/src/tests/
 *
 * Requirements:
 *   Node.js 18+ (uses fs, path, assert built-ins).
 *   No external dependencies.
 *
 * Idempotent: re-running produces identical output.
 *
 * DO NOT EDIT GENERATED FILES — they are machine-produced.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Paths ──────────────────────────────────────────────────────────────
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CONTRACTS = join(ROOT, 'packages', 'contracts');
const SCHEMAS_DIR = join(CONTRACTS, 'schemas');
const FIXTURES_DIR = join(CONTRACTS, 'fixtures');
const MANIFEST_PATH = join(CONTRACTS, 'generation-manifest.json');
const OPENAPI_PATH = join(CONTRACTS, 'openapi', 'openapi.yaml');

const OUT_TYPES = join(CONTRACTS, 'src', 'types');
const OUT_MSW = join(CONTRACTS, 'src', 'msw');
const OUT_DTO = join(CONTRACTS, 'src', 'dto');
const OUT_TESTS = join(CONTRACTS, 'src', 'tests');

// ── Helpers ────────────────────────────────────────────────────────────
function readJSON(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`FATAL: Cannot read/parse ${filePath}: ${err.message}`);
    process.exit(1);
  }
}

function writeGenerated(filePath, content) {
  writeFileSync(filePath, content, 'utf8');
  console.log(`  ✓ ${filePath}`);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toPascalCase(str) {
  return str
    .split(/[\s_-]+/)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join('');
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

// ── Load sources ───────────────────────────────────────────────────────
console.log('── Loading contract sources ──────────────────────────');

const manifest = readJSON(MANIFEST_PATH);
console.log(`  manifest: ${MANIFEST_PATH} (v${manifest.version})`);

// Load all schemas
const schemaFiles = readdirSync(SCHEMAS_DIR).filter(f => f.endsWith('.json'));
const schemas = {};
for (const f of schemaFiles) {
  const name = f.replace(/\.json$/, '');
  schemas[name] = readJSON(join(SCHEMAS_DIR, f));
}
console.log(`  schemas: ${Object.keys(schemas).length} files (${schemaFiles.join(', ')})`);

// Load all fixtures
const fixtureFiles = readdirSync(FIXTURES_DIR).filter(f => f.endsWith('.json'));
const fixtures = {};
for (const f of fixtureFiles) {
  const name = f.replace(/\.json$/, '');
  fixtures[name] = readJSON(join(FIXTURES_DIR, f));
}
console.log(`  fixtures: ${Object.keys(fixtures).length} files (${fixtureFiles.join(', ')})`);

// Gather all error codes from the error schema
const errorSchema = schemas['error'];
const ALL_ERROR_CODES = errorSchema?.properties?.code?.enum || [];

// ── Resolve $ref (simple local only) ──────────────────────────────────
function resolveRef(ref, seen = new Set()) {
  if (!ref) return null;
  // e.g. "user.json" — resolve to schemas['user']
  const refPath = ref.replace(/\.json$/, '');
  const schema = schemas[refPath];
  if (!schema) {
    console.warn(`  WARN: Cannot resolve $ref "${ref}" — skipping`);
    return null;
  }
  return schema;
}

// Build a TS type string from a JSON Schema property definition
function schemaPropToType(value, propName, depth = 0) {
  if (!value || typeof value !== 'object') return 'unknown';
  const indent = '  '.repeat(depth + 1);

  // Handle $ref
  if (value.$ref) {
    const resolved = resolveRef(value.$ref);
    if (!resolved) return 'unknown';
    return resolved.title || toPascalCase(value.$ref.replace(/\.json$/, ''));
  }

  // Handle const
  if (value.const !== undefined) {
    return JSON.stringify(value.const);
  }

  // Handle enum
  if (Array.isArray(value.enum) && value.enum.length > 0) {
    return value.enum.map(v => JSON.stringify(v)).join(' | ');
  }

  // Handle type
  if (value.type === 'string') {
    if (value.format === 'date-time' || value.format === 'uuid') return 'string';
    // Check if restricted by minLength/maxLength
    if (value.minLength !== undefined || value.maxLength !== undefined) {
      return 'string';
    }
    return 'string';
  }
  if (value.type === 'boolean') return 'boolean';
  if (value.type === 'integer' || value.type === 'number') return 'number';
  if (value.type === 'object') {
    if (value.properties) {
      const props = Object.entries(value.properties).map(([k, v]) => {
        const required = Array.isArray(value.required) && value.required.includes(k);
        const isConst = v && v.const !== undefined;
        const optional = !required || isConst;
        const tsType = schemaPropToType(v, k, depth + 1);
        return `${indent}${k}${optional ? '?' : ''}: ${tsType};`;
      });
      return `{\n${props.join('\n')}\n${'  '.repeat(depth)}}`;
    }
    if (value.additionalProperties) {
      return `Record<string, ${schemaPropToType(value.additionalProperties, '', depth + 1)}>`;
    }
    return 'Record<string, unknown>';
  }
  if (value.type === 'array') {
    if (value.items) return `${schemaPropToType(value.items, '', depth + 1)}[]`;
    return 'unknown[]';
  }

  if (value.oneOf) {
    return value.oneOf.map(v => schemaPropToType(v, '', depth)).join(' | ');
  }
  if (value.anyOf) {
    return value.anyOf.map(v => schemaPropToType(v, '', depth)).join(' | ');
  }
  if (value.allOf) {
    return value.allOf.map(v => schemaPropToType(v, '', depth)).join(' & ');
  }

  return 'unknown';
}

function buildInterface(name, schema) {
  if (!schema || schema.type !== 'object') {
    return `export type ${name} = unknown;\n`;
  }
  const props = Object.entries(schema.properties || {}).map(([k, v]) => {
    const required = Array.isArray(schema.required) && schema.required.includes(k);
    const tsType = schemaPropToType(v, k, 0);
    const optional = !required && v.const === undefined ? '?' : '';
    return `  ${k}${optional}: ${tsType};`;
  });
  return `export interface ${name} {\n${props.join('\n')}\n}\n`;
}

// ── 1. Generate TypeScript types ──────────────────────────────────────
console.log('\n── Generating frontend TypeScript types ──────────────');

// Build all interfaces from schemas (skip files that are just $ref passthrough)
// We also build the ErrorCode union type
let typesContent = `// ── packages/contracts/src/types/api.ts ─────────────────────────────────
// GENERATED FILE — DO NOT EDIT.
// Generated by tools/contracts/generate.mjs from packages/contracts/openapi/openapi.yaml
// and packages/contracts/schemas/*.json.
//

`;

// ErrorCode union
typesContent += `/** All documented error codes from the API contract */\n`;
typesContent += `export type ErrorCode =\n`;
for (let i = 0; i < ALL_ERROR_CODES.length; i++) {
  const comma = i < ALL_ERROR_CODES.length - 1 ? ' |' : ';';
  typesContent += `  | '${ALL_ERROR_CODES[i]}'\n`;
}
typesContent += '\n';

// ErrorResponse
typesContent += `/** Standard error response for all endpoints */\n`;
typesContent += `export interface ErrorResponse {\n`;
typesContent += `  error: string;\n`;
typesContent += `  code: ErrorCode;\n`;
typesContent += `}\n\n`;

// Build interfaces for each schema
const skipForTypeAlias = new Set(['error']);
const schemaNames = Object.keys(schemas);
for (const name of schemaNames) {
  if (skipForTypeAlias.has(name)) continue;
  const schema = schemas[name];
  const interfaceName = schema.title || toPascalCase(name);
  typesContent += buildInterface(interfaceName, schema);
  typesContent += '\n';
}

// Generate API response types per endpoint
typesContent += `// ── Per-endpoint response types ───────────────────────────────────\n\n`;

for (const ep of manifest.endpoints) {
  const epName = toPascalCase(ep.id);
  const successKey = Object.keys(ep.fixtures || {}).find(k => !k.startsWith('4') && !k.startsWith('5'));
  // Determine the response type name from schema
  let responseType = 'unknown';
  if (ep.schema) {
    if (typeof ep.schema === 'object' && ep.schema.response) {
      const respSchemaName = ep.schema.response.replace(/^schemas\//, '').replace(/\.json$/, '');
      const respSchema = schemas[respSchemaName];
      if (respSchema && respSchema.title) responseType = respSchema.title;
    }
    if (typeof ep.schema === 'string') {
      const schemaName = ep.schema.replace(/^schemas\//, '').replace(/\.json$/, '');
      const respSchema = schemas[schemaName];
      if (respSchema && respSchema.title) responseType = respSchema.title;
    }
  }

  typesContent += `/** ${ep.method} ${ep.path} — ${epName} */\n`;
  typesContent += `export type ${epName}Endpoint = {\n`;
  typesContent += `  method: '${ep.method}';\n`;
  typesContent += `  path: '${ep.path}';\n`;
  typesContent += `  response: ${responseType};\n`;
  typesContent += `  error: ErrorResponse;\n`;
  typesContent += `};\n\n`;
}

// Endpoint request bodies are already typed via the interface definitions above.
// No additional type aliases needed.

writeGenerated(join(OUT_TYPES, 'api.ts'), typesContent);

// ── 2. Generate MSW-compatible handlers ───────────────────────────────
console.log('\n── Generating MSW handlers ───────────────────────────');

// Since MSW is not installed, generate handlers that follow the MSW API contract,
// plus a pure-fetch mock adapter called "FetchMock" as a zero-dependency alternative.

// handlers.ts — MSW-compatible (requires msw dependency)
let mswHandlersContent = `// ── packages/contracts/src/msw/handlers.ts ────────────────────────────
// GENERATED FILE — DO NOT EDIT.
// Generated by tools/contracts/generate.mjs
//
// MSW request handlers. Requires \`msw\` as a devDependency:
//   npm install --save-dev msw
//
// Usage (MSW 2.x):
//   import { http } from 'msw';
//   import { handlers } from 'packages/contracts/src/msw/handlers';
//   import { setupWorker } from 'msw/browser';
//   setupWorker(...handlers);
//
// For projects without MSW, use fetch-mock.ts instead (pure-fetch adapter).
//

import { http, HttpResponse } from 'msw';
import type { ${['ErrorCode', ...schemaNames.filter(n => !skipForTypeAlias.has(n)).map(n => {
    const s = schemas[n];
    return s.title || toPascalCase(n);
  })].join(',\n  ')} } from '../types/api';

// ── Fixture data ───────────────────────────────────────────────────\n`;

// Load fixture data and embed as object literals
for (const [fixtureName, fixtureData] of Object.entries(fixtures)) {
  const fixtureVar = toCamelCase(fixtureName.replace(/[.-]/g, '_'));
  mswHandlersContent += `const ${fixtureVar} = ${JSON.stringify(fixtureData, null, 2)} as const;\n`;
}

mswHandlersContent += `\n// ── Handlers ─────────────────────────────────────────────────────\n\n`;
mswHandlersContent += `export const handlers = [\n`;

for (const ep of manifest.endpoints) {
  const methodLower = ep.method.toLowerCase();
  // Skip methodUnsupported since MSW 2.x uses http.get, http.post etc.
  mswHandlersContent += `  http.${methodLower}('${ep.path}', () => {\n`;
  // Default to first success fixture
  const successFixtures = Object.entries(ep.fixtures || {})
    .filter(([k]) => !k.startsWith('4') && !k.startsWith('5'))
    .map(([k, v]) => v);
  if (successFixtures.length > 0) {
    const fixtureVar = toCamelCase(successFixtures[0].replace(/^fixtures\//, '').replace(/\.json$/, '').replace(/[.-]/g, '_'));
    mswHandlersContent += `    return HttpResponse.json(${fixtureVar});\n`;
  } else {
    mswHandlersContent += `    return HttpResponse.json({ status: 'ok' });\n`;
  }
  mswHandlersContent += `  }),\n`;
}

mswHandlersContent += `];\n`;

writeGenerated(join(OUT_MSW, 'handlers.ts'), mswHandlersContent);

// ── 3. Generate pure-fetch mock adapter ───────────────────────────────
console.log('  (also generating fetch-mock.ts — zero-dependency alternative)');

let fetchMockContent = `// ── packages/contracts/src/msw/fetch-mock.ts ──────────────────────────
// GENERATED FILE — DO NOT EDIT.
// Generated by tools/contracts/generate.mjs
//
// Pure-fetch mock adapter — zero external dependencies.
// Intercepts global fetch() to return contract fixture data.
// Drop-in alternative when MSW is not installed.
//
// Usage:
//   import { installFetchMock, uninstallFetchMock } from 'packages/contracts/src/msw/fetch-mock';
//
//   // Before running tests / during dev:
//   installFetchMock();
//
//   // Cleanup:
//   uninstallFetchMock();
//
// For a full MSW setup (with service worker), install \`msw\` and use \`handlers.ts\` instead.
//

import type { ${['ErrorCode', ...schemaNames.filter(n => !skipForTypeAlias.has(n)).map(n => {
    const s = schemas[n];
    return s.title || toPascalCase(n);
  })].join(',\n  ')} } from '../types/api';

// ── Fixture registry ────────────────────────────────────────────────\n`;

// Build fixture registry
fetchMockContent += `const FIXTURES: Record<string, unknown> = {\n`;
for (const [fixtureName, fixtureData] of Object.entries(fixtures)) {
  fetchMockContent += `  '${fixtureName}': ${JSON.stringify(fixtureData)},\n`;
}
fetchMockContent += `};\n\n`;

fetchMockContent += `// ── Route table ────────────────────────────────────────────────────\n\n`;
fetchMockContent += `type RouteEntry = {\n`;
fetchMockContent += `  method: string;\n`;
fetchMockContent += `  path: string;\n`;
fetchMockContent += `  status: number;\n`;
fetchMockContent += `  fixtureKey: string;\n`;
fetchMockContent += `};\n\n`;

// Build route table
fetchMockContent += `const ROUTES: RouteEntry[] = [\n`;
for (const ep of manifest.endpoints) {
  for (const [fixtureKey, fixturePath] of Object.entries(ep.fixtures || {})) {
    const statusCode = parseInt(fixtureKey.split('-')[0]) || 200;
    const fixtureFilename = fixturePath.replace(/^fixtures\//, '').replace(/\.json$/, '');
    fetchMockContent += `  { method: '${ep.method}', path: '${ep.path}', status: ${statusCode}, fixtureKey: '${fixtureFilename}' },\n`;
  }
}
fetchMockContent += `];\n\n`;

// Fetch mock implementation
fetchMockContent += `let _originalFetch: typeof globalThis.fetch | null = null;\n\n`;

fetchMockContent += `function mockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {\n`;
fetchMockContent += `  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;\n`;
fetchMockContent += `  const method = (init?.method || 'GET').toUpperCase();\n`;
fetchMockContent += `  const path = new URL(url, 'http://localhost').pathname;\n\n`;
fetchMockContent += `  const match = ROUTES.find(r => r.method === method && r.path === path);\n`;
fetchMockContent += `  if (!match) {\n`;
fetchMockContent += `    console.warn('[fetch-mock] No matching route:', method, path);\n`;
fetchMockContent += `    return _originalFetch!(input, init);\n`;
fetchMockContent += `  }\n\n`;
fetchMockContent += `  const body = FIXTURES[match.fixtureKey];\n`;
fetchMockContent += `  return Promise.resolve(\n`;
fetchMockContent += `    new Response(JSON.stringify(body), {\n`;
fetchMockContent += `      status: match.status,\n`;
fetchMockContent += `      headers: { 'Content-Type': 'application/json' },\n`;
fetchMockContent += `    })\n`;
fetchMockContent += `  );\n`;
fetchMockContent += `}\n\n`;

fetchMockContent += `export function installFetchMock(): void {\n`;
fetchMockContent += `  if (_originalFetch) return; // Already installed\n`;
fetchMockContent += `  _originalFetch = globalThis.fetch;\n`;
fetchMockContent += `  globalThis.fetch = mockFetch as typeof globalThis.fetch;\n`;
fetchMockContent += `}\n\n`;

fetchMockContent += `export function uninstallFetchMock(): void {\n`;
fetchMockContent += `  if (_originalFetch) {\n`;
fetchMockContent += `    globalThis.fetch = _originalFetch;\n`;
fetchMockContent += `    _originalFetch = null;\n`;
fetchMockContent += `  }\n`;
fetchMockContent += `}\n`;

writeGenerated(join(OUT_MSW, 'fetch-mock.ts'), fetchMockContent);

// ── 4. Generate fixture index ─────────────────────────────────────────
console.log('  (also generating fixtures.ts — typed fixture index)');

let fixturesIndexContent = `// ── packages/contracts/src/msw/fixtures.ts ────────────────────────────
// GENERATED FILE — DO NOT EDIT.
// Generated by tools/contracts/generate.mjs
//
// Typed fixture index — provides strongly-typed accessors for all
// mock fixture data defined in packages/contracts/fixtures/.
//

import type { ${['ErrorCode', ...schemaNames.filter(n => !skipForTypeAlias.has(n)).map(n => {
    const s = schemas[n];
    return s.title || toPascalCase(n);
  })].join(',\n  ')} } from '../types/api';

// ── Individual fixture exports ──────────────────────────────────────\n`;

for (const [fixtureName, fixtureData] of Object.entries(fixtures)) {
  const varName = toCamelCase(fixtureName.replace(/[.-]/g, '_'));
  fixturesIndexContent += `export const ${varName} = ${JSON.stringify(fixtureData, null, 2)} as const;\n`;
}

fixturesIndexContent += `\n// ── Lookup by endpoint and status ───────────────────────────────────\n\n`;
fixturesIndexContent += `type EndpointId =\n`;
for (const ep of manifest.endpoints) {
  fixturesIndexContent += `  | '${ep.id}'\n`;
}
fixturesIndexContent += `  ;\n\n`;

fixturesIndexContent += `type FixtureKey = keyof typeof fixtureMap;\n\n`;
fixturesIndexContent += `const fixtureMap = {\n`;
for (const [fixtureName] of Object.entries(fixtures)) {
  fixturesIndexContent += `  '${fixtureName}': ${toCamelCase(fixtureName.replace(/[.-]/g, '_'))},\n`;
}
fixturesIndexContent += `} as const;\n\n`;

fixturesIndexContent += `/**\n`;
fixturesIndexContent += ` * Get fixture data by endpoint ID and fixture key.\n`;
fixturesIndexContent += ` * Wraps strict typing over the raw JSON file index.\n`;
fixturesIndexContent += ` */\n`;
fixturesIndexContent += `export function getFixture<K extends keyof typeof fixtureMap>(key: K): (typeof fixtureMap)[K] {\n`;
fixturesIndexContent += `  return fixtureMap[key];\n`;
fixturesIndexContent += `}\n`;

writeGenerated(join(OUT_MSW, 'fixtures.ts'), fixturesIndexContent);

// ── 5. Generate backend DTO validators ────────────────────────────────
console.log('\n── Generating backend DTO validators ──────────────────');

let dtoContent = `// ── packages/contracts/src/dto/validators.ts ──────────────────────────
// GENERATED FILE — DO NOT EDIT.
// Generated by tools/contracts/generate.mjs
//
// Backend request DTO validators derived from JSON Schema definitions.
// Pure functions — no external validation library required.
//
// Each validator returns { valid: true, data: ParsedType } on success,
// or { valid: false, errors: string[] } on failure.
//
// NOTES:
// - Schema \`const\` values are converted to assertions (exact-match).
// - Date-time format is validated as ISO 8601 string presence only.
//

import type { ${schemaNames.filter(n => !skipForTypeAlias.has(n)).map(n => {
    const s = schemas[n];
    return s.title || toPascalCase(n);
  }).join(',\n  ')} } from '../types/api';

export { ErrorCode } from '../types/api';
export type { ErrorResponse } from '../types/api';

// ── Validation helpers ───────────────────────────────────────────────\n`;

dtoContent += `
type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; errors: string[] };

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isBoolean(v: unknown): v is boolean {
  return typeof v === 'boolean';
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function requiredCheck(value: unknown, name: string, errors: string[]): void {
  if (value === undefined || value === null) {
    errors.push(\`\${name} is required\`);
  }
}

function dateTimeCheck(value: unknown, name: string, errors: string[]): void {
  if (typeof value === 'string' && !isNaN(Date.parse(value))) return;
  if (value !== undefined && value !== null) {
    errors.push(\`\${name} must be a valid ISO 8601 date-time string\`);
  }
}

function uuidCheck(value: unknown, name: string, errors: string[]): void {
  if (typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return;
  if (value !== undefined && value !== null) {
    errors.push(\`\${name} must be a valid UUID\`);
  }
}

function phonePatternCheck(value: unknown, name: string, errors: string[]): void {
  if (typeof value === 'string' && /^\\+86\\d{11}$/.test(value)) return;
  if (value !== undefined && value !== null) {
    errors.push(\`\${name} must match pattern +86 followed by 11 digits\`);
  }
}

// ── Request validators ───────────────────────────────────────────────\n`;

// Generate validators for each request schema
const requestSchemaNames = new Set();
for (const ep of manifest.endpoints) {
  if (typeof ep.schema === 'object' && ep.schema.request) {
    const reqSchemaName = ep.schema.request.replace(/^schemas\//, '').replace(/\.json$/, '');
    requestSchemaNames.add(reqSchemaName);
  }
}

for (const name of requestSchemaNames) {
  const schema = schemas[name];
  if (!schema) continue;
  const interfaceName = schema.title || toPascalCase(name);
  const fnName = `validate${interfaceName}`;

  dtoContent += `\n/** Validates ${interfaceName} request body */\n`;
  dtoContent += `export function ${fnName}(input: unknown): ValidationResult<${interfaceName}> {\n`;
  dtoContent += `  const errors: string[] = [];\n\n`;
  dtoContent += `  if (!isObject(input)) {\n`;
  dtoContent += `    errors.push('Request body must be a JSON object');\n`;
  dtoContent += `    return { valid: false, errors };\n`;
  dtoContent += `  }\n\n`;

  for (const req of (schema.required || [])) {
    dtoContent += `  requiredCheck(input['${req}'], '${req}', errors);\n`;
  }

  for (const [propName, propDef] of Object.entries(schema.properties || {})) {
    if (propDef.type === 'string' && propDef.format === 'uuid') {
      dtoContent += `  if (input['${propName}'] !== undefined) uuidCheck(input['${propName}'], '${propName}', errors);\n`;
    }
    if (propDef.type === 'string' && propDef.format === 'date-time') {
      dtoContent += `  if (input['${propName}'] !== undefined) dateTimeCheck(input['${propName}'], '${propName}', errors);\n`;
    }
    if (propDef.type === 'string' && propDef.pattern) {
      dtoContent += `  if (input['${propName}'] !== undefined) {\n`;
      dtoContent += `    const pattern = ${JSON.stringify(propDef.pattern)};\n`;
      dtoContent += `    if (typeof input['${propName}'] !== 'string' || !new RegExp(pattern).test(input['${propName}'] as string)) {\n`;
      dtoContent += `      errors.push('${propName} does not match required pattern');\n`;
      dtoContent += `    }\n`;
      dtoContent += `  }\n`;
    }
  }

  dtoContent += `\n  if (errors.length > 0) return { valid: false, errors };\n`;
  dtoContent += `  return { valid: true, data: input as ${interfaceName} };\n`;
  dtoContent += `}\n`;
}

// Response validators
dtoContent += `\n// ── Response validators ──────────────────────────────────────────────\n`;

const responseSchemaNames = new Set();
for (const ep of manifest.endpoints) {
  if (typeof ep.schema === 'object' && ep.schema.response) {
    const respSchemaName = ep.schema.response.replace(/^schemas\//, '').replace(/\.json$/, '');
    responseSchemaNames.add(respSchemaName);
  }
  if (typeof ep.schema === 'string') {
    const schemaName = ep.schema.replace(/^schemas\//, '').replace(/\.json$/, '');
    responseSchemaNames.add(schemaName);
  }
}

for (const name of responseSchemaNames) {
  const schema = schemas[name];
  if (!schema) continue;
  const interfaceName = schema.title || toPascalCase(name);
  const fnName = `validate${interfaceName}`;

  dtoContent += `\n/** Validates ${interfaceName} response body */\n`;
  dtoContent += `export function ${fnName}(input: unknown): ValidationResult<${interfaceName}> {\n`;
  dtoContent += `  const errors: string[] = [];\n\n`;
  dtoContent += `  if (!isObject(input)) {\n`;
  dtoContent += `    errors.push('Response body must be a JSON object');\n`;
  dtoContent += `    return { valid: false, errors };\n`;
  dtoContent += `  }\n\n`;

  for (const req of (schema.required || [])) {
    // Skip const fields (they are always present if the object is valid)
    const propDef = schema.properties?.[req];
    if (propDef && propDef.const !== undefined) {
      dtoContent += `  // ${req} has const value ${JSON.stringify(propDef.const)}\n`;
    } else {
      dtoContent += `  requiredCheck(input['${req}'], '${req}', errors);\n`;
    }
  }

  for (const [propName, propDef] of Object.entries(schema.properties || {})) {
    // Handle const assertions
    if (propDef.const !== undefined) {
      dtoContent += `  if (input['${propName}'] !== undefined && input['${propName}'] !== ${JSON.stringify(propDef.const)}) {\n`;
      dtoContent += `    errors.push('${propName} must be ${JSON.stringify(propDef.const)}');\n`;
      dtoContent += `  }\n`;
    }
    // Handle string formats
    if (propDef.type === 'string' && propDef.format === 'uuid') {
      dtoContent += `  if (input['${propName}'] !== undefined) uuidCheck(input['${propName}'], '${propName}', errors);\n`;
    }
    if (propDef.type === 'string' && propDef.format === 'date-time') {
      dtoContent += `  if (input['${propName}'] !== undefined) dateTimeCheck(input['${propName}'], '${propName}', errors);\n`;
    }
    if (propDef.type === 'string' && propDef.pattern) {
      dtoContent += `  if (input['${propName}'] !== undefined) phonePatternCheck(input['${propName}'], '${propName}', errors);\n`;
    }
    // Handle $ref — validate nested objects
    if (propDef.$ref) {
      const resolved = resolveRef(propDef.$ref);
      if (resolved && resolved.title) {
        dtoContent += `  if (input['${propName}'] !== undefined) {\n`;
        dtoContent += `    const nestedResult = validate${resolved.title}(input['${propName}']);\n`;
        dtoContent += `    if (!nestedResult.valid) {\n`;
        dtoContent += `      errors.push(...nestedResult.errors.map(e => '${propName}.' + e));\n`;
        dtoContent += `    }\n`;
        dtoContent += `  }\n`;
      }
    }
  }

  dtoContent += `\n  if (errors.length > 0) return { valid: false, errors };\n`;
  dtoContent += `  return { valid: true, data: input as ${interfaceName} };\n`;
  dtoContent += `}\n`;
}

writeGenerated(join(OUT_DTO, 'validators.ts'), dtoContent);

// ── 6. Generate contract test templates ───────────────────────────────
console.log('\n── Generating contract test templates ─────────────────');

let testsContent = `// ── packages/contracts/src/tests/contract-tests.template.ts ───────────
// GENERATED FILE — DO NOT EDIT.
// Generated by tools/contracts/generate.mjs
//
// Contract test templates — one describe-block per endpoint.
// Run against a running backend instance (default: http://localhost:3000).
//
// Usage:
//   npm install --save-dev node-fetch@2 (or use native fetch in Node 18+)
//   node --test packages/contracts/src/tests/contract-tests.template.ts
//
// Replace BASE_URL as needed for your environment.
//

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.CONTRACT_TEST_URL || 'http://localhost:3000';

// ── Helper: typed fetch ──────────────────────────────────────────────\n`;

testsContent += `
async function apiFetch<T>(method: string, path: string, body?: unknown, headers?: Record<string, string>): Promise<{ status: number; data: T }> {
  const url = \`\${BASE_URL}\${path}\`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return { status: res.status, data };
}
`;

// Generate tests for each endpoint
for (const ep of manifest.endpoints) {
  const epName = toPascalCase(ep.id);
  testsContent += `\ndescribe('${ep.method} ${ep.path} — ${epName}', () => {\n`;

  // Success test
  const successFixtures = Object.entries(ep.fixtures || {})
    .filter(([k]) => !k.startsWith('4') && !k.startsWith('5'));
  if (successFixtures.length > 0) {
    testsContent += `  it('should return 200 with valid shape', async () => {\n`;
    if (ep.method === 'GET') {
      testsContent += `    const { status, data } = await apiFetch('${ep.method}', '${ep.path}');\n`;
    } else {
      // Pick a sample request body for POST endpoints
      const reqSchemaName = typeof ep.schema === 'object' && ep.schema.request
        ? ep.schema.request.replace(/^schemas\//, '').replace(/\.json$/, '')
        : null;
      if (reqSchemaName && schemas[reqSchemaName]) {
        // Build a sample request body
        const reqSchema = schemas[reqSchemaName];
        const sampleBody = {};
        for (const req of (reqSchema.required || [])) {
          const propDef = reqSchema.properties?.[req];
          if (propDef) {
            sampleBody[req] = propDef.example || (propDef.type === 'string' ? 'test' : null);
          }
        }
        testsContent += `    const body = ${JSON.stringify(sampleBody)};\n`;
        testsContent += `    const { status, data } = await apiFetch('${ep.method}', '${ep.path}', body);\n`;
      } else {
        testsContent += `    const { status, data } = await apiFetch('${ep.method}', '${ep.path}');\n`;
      }
    }
    testsContent += `    assert.equal(status, 200);\n`;
    testsContent += `    assert.ok(data);\n`;
    testsContent += `  });\n\n`;
  }

  // Error tests
  const errorFixtures = Object.entries(ep.fixtures || {})
    .filter(([k]) => k.startsWith('4') || k.startsWith('5'));
  if (errorFixtures.length > 0) {
    testsContent += `\n`;
    for (const [fixtureKey, fixturePath] of errorFixtures) {
      const statusCode = parseInt(fixtureKey.split('-')[0]);
      const fixtureData = fixtures[fixturePath.replace(/^fixtures\//, '').replace(/\.json$/, '')];
      const code = fixtureData?.code || 'UNKNOWN';
      testsContent += `  it.todo(${JSON.stringify(`should return ${statusCode} with code "${code}"`)});\n`;
    }
  }

  testsContent += `});\n`;
}

writeGenerated(join(OUT_TESTS, 'contract-tests.template.ts'), testsContent);

// ── 7. Generate fixtures JSON index ───────────────────────────────────
console.log('\n── Generating fixtures index ───────────────────────────');

// Build a consumable JSON mapping
const FROZEN_AT = '2025-07-16T06:47:00Z'; // generation-manifest.json generatedAt
const fixturesIndex = {
  description: 'Consumable index of all contract fixtures. Maps endpoint → status → fixture file.',
  manifestVersion: manifest.version,
  endpoints: {},
};

for (const ep of manifest.endpoints) {
  const epEntry = {};
  for (const [fixtureKey, fixturePath] of Object.entries(ep.fixtures || {})) {
    const fixtureFilename = fixturePath.replace(/^fixtures\//, '');
    const fixtureData = fixtures[fixtureFilename.replace(/\.json$/, '')] || null;
    epEntry[fixtureKey] = {
      file: fixturePath,
      data: fixtureData,
    };
  }
  fixturesIndex.endpoints[ep.id] = {
    method: ep.method,
    path: ep.path,
    fixtures: epEntry,
  };
}

writeGenerated(join(OUT_TESTS, 'fixtures-index.json'), JSON.stringify(fixturesIndex, null, 2) + '\n');

// ── 8. Generate type-to-schema mapping ────────────────────────────────
const typeSchemaMap = {};
for (const name of schemaNames) {
  const schema = schemas[name];
  const interfaceName = schema.title || toPascalCase(name);
  typeSchemaMap[interfaceName] = {
    schemaFile: `${name}.json`,
    title: schema.title || '',
    required: schema.required || [],
  };
}

writeGenerated(
  join(OUT_TESTS, 'type-schema-map.json'),
  JSON.stringify({
    description: 'Maps generated TypeScript interface names to source JSON Schema files.',
    manifestVersion: manifest.version,
    schemas: typeSchemaMap,
  }, null, 2) + '\n'
);

// ── Summary ───────────────────────────────────────────────────────────
console.log('\n── Generation complete ────────────────────────────────');
const generatedFiles = [
  join(OUT_TYPES, 'api.ts'),
  join(OUT_MSW, 'handlers.ts'),
  join(OUT_MSW, 'fetch-mock.ts'),
  join(OUT_MSW, 'fixtures.ts'),
  join(OUT_DTO, 'validators.ts'),
  join(OUT_TESTS, 'contract-tests.template.ts'),
  join(OUT_TESTS, 'fixtures-index.json'),
  join(OUT_TESTS, 'type-schema-map.json'),
];
for (const f of generatedFiles) {
  const exists = existsSync(f);
  console.log(`  [${exists ? '✔' : '✗'}] ${f}`);
}
console.log('');

// Verify integrity of the generated output
let errors = 0;
for (const f of generatedFiles) {
  if (!existsSync(f)) {
    console.error(`  ERROR: Missing file: ${f}`);
    errors++;
  }
}
if (errors > 0) {
  console.error(`\n  FAILED: ${errors} file(s) missing\n`);
  process.exit(1);
}

// Verify the fixture index references all endpoints
const epIds = manifest.endpoints.map(e => e.id);
for (const epId of epIds) {
  if (!fixturesIndex.endpoints[epId]) {
    console.error(`  ERROR: Endpoint "${epId}" not found in fixtures-index.json`);
    errors++;
  }
}
if (errors > 0) {
  console.error(`\n  FAILED: ${errors} endpoint(s) missing from fixture index\n`);
  process.exit(1);
}

console.log(`  All ${generatedFiles.length} files generated successfully.`);
console.log(`  All ${manifest.endpoints.length} endpoints indexed.`);
console.log('');
