# CI / CD 说明（宝宝闯关）

前端只打本项目 `/api/*`。CI 与发布脚本**不**嵌入云厂商密钥；密钥只放本机环境或 GitHub Secrets。

## CI（GitHub Actions）

| Workflow | 文件 | 触发 | 做什么 |
|----------|------|------|--------|
| TestFlight Preflight | `.github/workflows/testflight-preflight.yml` | `push main` / PR / 手动 | 内容与壳 handoff 预检 |
| **Deploy ECS** | `.github/workflows/deploy-ecs.yml` | **tag `v*`** / 手动应急 | backend 单测 → rsync → `npm ci --omit=dev` → restart → health |

### Deploy ECS

| 项 | 值 |
|----|-----|
| 触发 | **git tag `v*`**（如 `v1.0.0`）并 push；`workflow_dispatch` 仅应急（可勾选 migrate） |
| Runner | `ubuntu-latest` |
| Node | 20 |
| 门禁 | `cd backend && npm ci && npm test`（`NODE_ENV=test`） |
| 发版 | `bash deploy/pipeline/deploy-ecs.sh` |
| 并发 | `deploy-ecs-production`，**不**取消进行中的发版 |
| Environment | `production`（可在 GitHub 加审批） |
| 业务密钥 | **无**。RDS / 短信 / InsForge 只在 ECS `/etc/baobao-backend.env` |

生产发版：`git tag vX.Y.Z && git push origin vX.Y.Z`。`push main` **不会**部署。应急：Actions → **Deploy ECS** → Run workflow。默认 `RUN_MIGRATE=0`。勾选 `run_migrate` 才会在远端跑迁移。

推这个 workflow 文件需要 PAT / Fine-grained token 带 **`workflow`** 权限。

## GitHub Secrets（名，不写值）

在仓库 **Settings → Secrets and variables → Actions** 添加：

| Secret 名 | 必填 | 用途 |
|-----------|------|------|
| `ECS_HOST` | 是 | ECS 主机名或公网 IP |
| `ECS_SSH_KEY` | 是 | 部署用 **私钥全文**（含 `-----BEGIN … KEY-----`） |
| `ECS_USER` | 否 | SSH 用户；缺省脚本默认 `baobao` |

可选 **Variables**（非 Secret）：

| Variable | 用途 | 默认 |
|----------|------|------|
| `APP_DIR` | 远端目录 | `/opt/apps/baobao/backend` |
| `REMOTE_HEALTH_URL` | 远端本机 health | 未设则读 ECS env 的 `PORT`（本机默认 3000） |
| `EXPECT_LEARNING_BACKEND` | health 断言，如 `mysql` | 不设则只检查字段存在 + `status=ok` + `nodeEnv=production` |
| `EXPECT_SMS_PROVIDER` | health 断言，如 `aliyun` | 同上 |

生产业务密钥（`MYSQL_*`、`SMS_*` 等）仍只写在 ECS 上的 `/etc/baobao-backend.env`，**不要**放进 GitHub Secrets。

CLI 示例（本机已 `gh auth`，**不要**把私钥贴进聊天）：

```bash
gh secret set ECS_HOST --body 'YOUR_ECS_HOST'
gh secret set ECS_USER --body 'baobao'
gh secret set ECS_SSH_KEY < ~/.ssh/your_deploy_ed25519
```

### ECS 侧一次条件

1. 安全组 **TCP 22** 放行 GitHub-hosted runner 出口（IP 会变；密钥登录 + 禁密码。若不能对 22 开放，改用 ECS **self-hosted runner**）。
2. `baobao` 对 `systemctl restart baobao-backend` **免密 sudo**。
3. 首装已完成：目录、`/etc/baobao-backend.env`、systemd unit、Nginx 443。见 `docs/deploy-server.md` §5。

## 手动 deploy 示例

先完成 `deploy/ecs/` 引导（用户、systemd、`/etc/baobao-backend.env`）。本机有 `rsync`、`ssh`、私钥。

```bash
# 从仓库根执行
export ECS_HOST='your-ecs.example.com'   # 占位，勿提交真实 IP
export ECS_USER='baobao'                  # 或 root
export ECS_SSH_KEY_PATH="${HOME}/.ssh/baobao_ecs_ed25519"
export APP_DIR='/opt/apps/baobao/backend'   # 可选
export REMOTE_HEALTH_URL='http://127.0.0.1:3000/api/health'  # 可选

# 同步 + npm ci --omit=dev + restart + health
bash deploy/pipeline/deploy-ecs.sh

# 需要在远端跑 MySQL migration 时（远端须已配置 MYSQL_*）
RUN_MIGRATE=1 bash deploy/pipeline/deploy-ecs.sh
```

成功末行：`PIPELINE_DEPLOY_OK`。

缺 `ECS_HOST` 或私钥（`ECS_SSH_KEY_PATH` / `ECS_SSH_KEY`）→ 打印缺省项，退出码 `2`。

## 脚本行为摘要

`deploy/pipeline/deploy-ecs.sh`：

1. 校验 `ECS_HOST`、以及 `ECS_SSH_KEY_PATH` **或** `ECS_SSH_KEY`（PEM 写入临时文件后 unset）
2. `rsync -az --delete -e ssh -i <key>` 到 `${APP_DIR}`，排除 `node_modules`、`.git`、`.github`、`android`、`ios`、`data`、`.env*`、`*.log`
3. 远端 `cd ${APP_DIR}/backend && npm ci --omit=dev`
4. `RUN_MIGRATE=1` 且存在 `scripts/mysql-apply-migration.js`、远端有 MySQL 相关变量时跑 migrate
5. `systemctl restart baobao-backend`（无 systemd 则提示）
6. 远端执行 `deploy/pipeline/verify-ecs.sh`，校验 `/api/health` 四个 backend 字段

独立验收脚本：`deploy/pipeline/verify-ecs.sh`。可用 `EXPECT_*` 锁定生产预期后端；可选用 `RUN_AUTH_LEARNING=1 AUTH_TOKEN=...` 验证已有 session 的登录和学习读取链路。
