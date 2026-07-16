# packages/contracts

**Single source of truth** for the API contract between frontend and backend.

## Structure

```
packages/contracts/
├── OWNERSHIP.md          ← Boundary rules & ownership roles
├── openapi/              ← openapi.yaml (Contract Owner only)
├── schemas/              ← JSON Schema per endpoint
├── fixtures/             ← MSW mock fixtures
└── src/
    ├── types/            ← Generated TypeScript interfaces
    ├── msw/              ← Generated MSW handlers
    ├── dto/              ← Generated backend validation schemas
    └── tests/            ← Contract test templates
```

## Workflow

1. Contract Owner authors `openapi.yaml`
2. Scaffolder generates types / msw / dto (Sprint 3)
3. Backend and Frontend agents consume generated artifacts
4. No side-channel agreements — contract is the law

See `OWNERSHIP.md` for boundary rules.
