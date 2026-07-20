# apps/backend

Contract-backed Express API for 宝宝闯关. Implements the five frozen routes in `packages/contracts/openapi/openapi.yaml` with an in-memory repository.

## Local development

```bash
npm ci
npm run check
npm test
npm run test:contract
npm start
```

Default: `http://localhost:3000`. Copy `.env.example` → `.env`.

## SMS

| `SMS_PROVIDER` | 行为 |
|----------------|------|
| `development`（默认） | 终端打印验证码；`debugCode` 仅在 `NODE_ENV=development` 返回 |
| `aliyun` | 调用阿里云 SendSms（实现复用 `backend/src/sms-provider.js`） |

阿里云必填：`SMS_ALIYUN_ACCESS_KEY_ID` / `SECRET` / `SIGN_NAME` / `TEMPLATE_CODE`。

生产环境禁止 `SMS_PROVIDER=development`。

PostgreSQL / `DATABASE_URL` 仅为未来边界，当前未连接。
