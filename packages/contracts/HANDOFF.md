# Handoff Document — 宝宝闯关 Phase 0

**Contract frozen at**: generation-manifest.json version 0.1.0
**Contract source**: `packages/contracts/openapi/openapi.yaml`

---

## Architecture Summary

The app is a vanilla JS SPA (no framework) with an Express backend.
Currently only **auth routes** have real backend endpoints.
Curriculum (200 levels), progress, rankings, and profile are **client-side only**.

### Endpoints (frozen)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | none | Health check |
| POST | /api/auth/send-code | none | Send SMS code |
| POST | /api/auth/verify-code | none | Verify code + login |
| GET | /api/auth/session | bearer/cookie | Get session user |
| POST | /api/auth/logout | bearer/cookie | Revoke session |

### Client-side only (NO backend endpoint)

- **Curriculum**: `script.js` → `lessonOverrides`, `curriculumUnits`, and `additionalLevelUnits` (200 levels total; first 10 have local video assets)
- **Progress**: localStorage key `baby-island-preview-progress-v1`
- **Rankings**: `script.js` → `rankings` base rows + `buildLocalRankings()` inserts the current child from local progress; no backend leaderboard
- **Profile**: `script.js` → `renderMine()` reads local progress, learning activity, and preferences

---

## Team Boundaries

### Frontend Engineer (`@frontend-dev`)

| | Allow | Forbid |
|---|-------|--------|
| **Directories** | `index.html`, `style.css`, `script.js`, `auth/`, `assets/` | `backend/`, `packages/contracts/openapi/`, `packages/contracts/schemas/` |
| **Input** | `packages/contracts/openapi/openapi.yaml` (read-only), `packages/contracts/fixtures/*.json` (read-only) | Direct backend code changes |
| **Deliverables** | Frontend types from contract, MSW handlers (consumed from `src/types/`, `src/msw/`), UI updates | Backend route or schema changes |
| **Local test** | `node quiz.test.js`, browser manual test | Starting backend server (unless explicitly pairing) |

### Backend Developer (`@backend-dev`)

| | Allow | Forbid |
|---|-------|--------|
| **Directories** | `backend/src/`, `backend/package.json` | `index.html`, `style.css`, `script.js`, `auth/`, `packages/contracts/openapi/`, `packages/contracts/schemas/` |
| **Input** | `packages/contracts/openapi/openapi.yaml` (read-only), `packages/contracts/schemas/*.json` (read-only) | Frontend code changes |
| **Deliverables** | Backend DTOs (consumed from `src/dto/`), new routes matching contract, `backend/src/*.test.js` | Contract schema changes |
| **Local test** | `node backend/src/auth.test.js`, `node --test backend/src/*.test.js` | Frontend test execution |

### Scaffolder (`@scaffolder`)

| | Allow | Forbid |
|---|-------|--------|
| **Directories** | `packages/contracts/src/types/`, `packages/contracts/src/msw/`, `packages/contracts/src/dto/`, `packages/contracts/src/tests/` | `packages/contracts/openapi/`, `packages/contracts/schemas/`, `packages/contracts/fixtures/`, application code |
| **Input** | `packages/contracts/openapi/openapi.yaml`, `packages/contracts/generation-manifest.json` | Manual editing of generated files |
| **Deliverables** | Generated types, MSW handlers, DTO schemas, contract test templates | Any non-generated file |
| **Local test** | Schema/fixture validation, generation idempotency | Application test execution |

### Integration / Evaluator (`@evaluator`)

| | Allow | Forbid |
|---|-------|--------|
| **Directories** | Read-only access to entire repo | Any writes except `packages/contracts/src/tests/` (test results) |
| **Input** | Full repo, frozen contract, generation manifest | — |
| **Deliverables** | Test results, integration reports, rollback proofs | Contract changes, code changes |

---

## Merge Order

1. **Contract Owner** (this phase) — frozen contract commit
2. **Scaffolder** — generate types/MSW/DTO/tests from contract
3. **Backend Developer** — new routes, DTOs, tests (branch: `feat/separation-backend`)
4. **Frontend Engineer** — types integration, MSW setup, UI changes (branch: `feat/separation-frontend`)
5. **Evaluator** — integration tests on `feat/separation-integration`

---

## Contract Change Protocol

Only the **Contract Owner** may modify:
- `packages/contracts/openapi/openapi.yaml`
- `packages/contracts/schemas/*.json`
- `packages/contracts/fixtures/*.json`
- `packages/contracts/generation-manifest.json`

Changes require:
1. Both Backend and Frontend leads review the PR
2. Scaffolder regenerates all downstream artifacts
3. All three feature branches rebase onto the new contract

---

## Validation Scripts

Run without installing new dependencies:

```bash
# Validate YAML is parseable and has correct top-level keys
node -e "
  const fs = require('fs');
  const yaml = fs.readFileSync('packages/contracts/openapi/openapi.yaml', 'utf8');
  if (!yaml.includes('openapi: 3.1.0')) process.exit(1);
  if (!yaml.includes('paths:')) process.exit(1);
  if (!yaml.includes('components:')) process.exit(1);
  console.log('YAML structure OK');
"

# Validate all JSON fixtures parse correctly
node -e "
  const fs = require('fs');
  const path = require('path');
  const dir = 'packages/contracts/fixtures';
  let ok = 0, fail = 0;
  for (const f of fs.readdirSync(dir)) {
    try { JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); ok++; }
    catch (e) { console.error('FAIL:', f, e.message); fail++; }
  }
  console.log(ok + ' fixtures OK, ' + fail + ' failed');
"

# Validate all JSON schemas parse correctly
node -e "
  const fs = require('fs');
  const path = require('path');
  const dir = 'packages/contracts/schemas';
  let ok = 0, fail = 0;
  for (const f of fs.readdirSync(dir)) {
    try { JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); ok++; }
    catch (e) { console.error('FAIL:', f, e.message); fail++; }
  }
  console.log(ok + ' schemas OK, ' + fail + ' failed');
"

# Cross-check: fixtures must match schema required fields
node -e "
  const fs = require('fs');
  const schemas = {
    'error.json': fs.readdirSync('packages/contracts/fixtures').filter(f => f.includes('error'))
  };
  const errorSchema = JSON.parse(fs.readFileSync('packages/contracts/schemas/error.json', 'utf8'));
  for (const f of schemas['error.json']) {
    const fixture = JSON.parse(fs.readFileSync('packages/contracts/fixtures/' + f, 'utf8'));
    for (const req of errorSchema.required) {
      if (!fixture.hasOwnProperty(req)) console.error('MISSING ' + req + ' in ' + f);
    }
    if (errorSchema.properties.code.enum && !errorSchema.properties.code.enum.includes(fixture.code))
      console.error('UNKNOWN code ' + fixture.code + ' in ' + f);
  }
  console.log('Error fixture cross-check done');
"
```

**Scope**: The above checks cover YAML parseability, JSON validity, and error code cross-referencing. Full `$ref` resolution and OpenAPI 3.1 semantic validation would require `ajv` or `@apidevtools/swagger-parser` which are NOT installed and NOT to be installed per requirements.
