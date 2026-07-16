# Ownership & Boundary Rules — 宝宝闯关 Monorepo

## Single Source of Truth

`packages/contracts/` is the **only source of truth** for the API contract between
frontend and backend. All API shapes, DTO schemas, and MSW fixtures live here.
No party may bypass this layer with side-channel agreements.

---

## Directory Layout

```
packages/contracts/
├── openapi/              # openapi.yaml — authored by Contract Owner
├── schemas/              # JSON Schema per endpoint — authored by Contract Owner
├── fixtures/             # MSW mock fixtures — authored by Contract Owner
└── src/
    ├── types/            # Generated TypeScript interfaces
    ├── msw/              # Generated MSW handlers
    ├── dto/              # Generated backend validation schemas
    └── tests/            # Contract test templates
```

---

## Ownership Roles

| Role | Owner | Responsible For |
|------|-------|-----------------|
| **Contract Owner** | `@contract-owner` | `openapi.yaml`, schemas, fixtures, generated types |
| **Backend Agent** | `@backend-dev` | `apps/backend/`, `backend/` root, backend-only packages |
| **Frontend Agent** | `@frontend-dev` | `apps/frontend/`, frontend-only packages |
| **Evaluator** | `@evaluator` | Verification, integration, rollback proofs |

---

## Hard Boundaries

### B1 — Backend must NOT edit frontend code
- `apps/frontend/` and its subtree are **read-only** for backend agents.
- Backend agents may NOT create, modify, or delete files under `apps/frontend/`.
- Exception: CI linting that only reads files.

### B2 — Frontend must NOT edit backend or migration code
- `apps/backend/`, `backend/` (root), `packages/contracts/src/dto/`, and
  `packages/contracts/src/tests/` are **read-only** for frontend agents.
- Frontend agents may NOT create, modify, or delete files under these paths.
- Exception: CI linting that only reads files.

### B3 — Single Contract Owner
- Only the **Contract Owner** may modify files under `packages/contracts/openapi/`
  and `packages/contracts/schemas/`.
- Backend and frontend agents may **read** these files but may NOT edit them.
- Suggested workflow: Contract Owner proposes a schema change → both teams review
  → merged by Contract Owner → both teams pull updated types.

### B4 — No Concurrent Lockfile Edits
- `package-lock.json`, `backend/package-lock.json`, and any workspace lockfiles
  must never be edited concurrently by two agents.
- Mutex strategy: agents use a distributed lock (file-based `.lockfile-lock`)
  or serialize via the CI pipeline. The first agent to start work acquires the lock,
  the second waits or retries.
- If two agents conflict, the one with the **older git branch base** yields.

---

## Relaxation Protocol

These boundaries may be relaxed only when:
1. A PR is opened with explicit agreement from both affected owners.
2. The change is reviewed and approved by the Contract Owner.
3. The `OWNERSHIP.md` is updated in the same PR to reflect the relaxation.

No verbal or chat-level agreements constitute a valid relaxation.

---

## Enforcement

| Check | Tool | Fail behaviour |
|-------|------|---------------|
| B1 / B2 | Git hook (`pre-commit`) — owner-attribute diff check | Commit rejected |
| B3 | CI — `packages/contracts/openapi/` diff owner check | PR blocked |
| B4 | CI — lockfile concurrency check via flock | CI run fails |

---

*Last updated: Sprint 1 (initial scaffold)*
