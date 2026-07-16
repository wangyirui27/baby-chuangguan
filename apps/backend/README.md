# apps/backend

Contract-backed Express API for 宝宝闯关. The service implements the five frozen routes in `packages/contracts/openapi/openapi.yaml` and keeps all state in the in-memory repository.

## Local development

```bash
npm ci
npm run check
npm test
npm run test:contract
npm start
```

The API listens on `http://localhost:3000` by default. Copy `.env.example` to `.env` to override local settings. Only `AUTH_REPOSITORY=memory` and the deterministic local `SMS_PROVIDER=development` are supported; PostgreSQL on port `5432` is a documented future boundary and is not connected.

The development SMS provider performs no external request and returns `debugCode` only when `NODE_ENV=development`.
