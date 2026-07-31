# CI / CD 说明（宝宝闯关）

前端只打本项目 `/api/*`。CI 与发布脚本**不**嵌入云厂商密钥；密钥只放本机环境或 GitHub Secrets。

## CI（GitHub Actions）

工作流：`.github/workflows/backend-ci.yml`

| 项 | 值 |
|----|-----|
| 触发 | `push` / `pull_request` |
| paths | `backend/**`、`deploy/**`、工作流自身 |
| Runner | `ubuntu-latest` |
| Node | 20 |
| 步骤 | 在 `backend/`：`npm ci` → `npm test` |
| 云密钥 | **无**（不读 RDS / Redis / OSS / InsForge） |

改 `backend/` 或 `deploy/` 后推分支或开 PR，Actions 里看 Backend CI 是否绿。

## GitHub Secrets（名，不写值）

当前 Backend CI **不需要** secrets。若以后把「手动/自动 ECS 发布」接到 Actions，建议只加：

| Secret 名 | 用途 |
|-----------|------|
| `ECS_HOST` | ECS 主机名或 IP（仓库外配置） |
| `ECS_USER` | SSH 用户（常见 `baobao` 或 `root`） |
| `ECS_SSH_KEY` | 部署用私钥全文（对应本机 `ECS_SSH_KEY_PATH`） |
| `APP_DIR` | 可选；远端应用目录，默认 `/opt/baobao-chuangguan` |

生产业务密钥（`MYSQL_*`、`REDIS_*`、`SMS_*` 等）仍只写在 ECS 上的 `/etc/baobao-backend.env`，**不要**放进 GitHub Secrets 除非有明确远程 migrate 需求。

## 手动 deploy 示例

先完成 `deploy/ecs/` 引导（用户、systemd、`/etc/baobao-backend.env`）。本机有 `rsync`、`ssh`、私钥。

```bash
# 从仓库根执行
export ECS_HOST='your-ecs.example.com'   # 占位，勿提交真实 IP
export ECS_USER='baobao'                  # 或 root
export ECS_SSH_KEY_PATH="${HOME}/.ssh/baobao_ecs_ed25519"
export APP_DIR='/opt/baobao-chuangguan'   # 可选
export REMOTE_HEALTH_URL='http://127.0.0.1:3000/api/health'  # 可选

# 同步 + npm ci --omit=dev + restart + health
bash deploy/pipeline/deploy-ecs.sh

# 需要在远端跑 MySQL migration 时（远端须已配置 MYSQL_*）
RUN_MIGRATE=1 bash deploy/pipeline/deploy-ecs.sh
```

成功末行：`PIPELINE_DEPLOY_OK`。

缺 `ECS_HOST` 或 `ECS_SSH_KEY_PATH` → 打印缺省项，退出码 `2`。

## 脚本行为摘要

`deploy/pipeline/deploy-ecs.sh`：

1. 校验 `ECS_HOST`、`ECS_SSH_KEY_PATH`
2. `rsync -az --delete` 到 `${APP_DIR}`，排除 `node_modules`、`.git`、`data`、`.env`、`.env.*`、`*.log`
3. 远端 `cd ${APP_DIR}/backend && npm ci --omit=dev`
4. `RUN_MIGRATE=1` 且存在 `scripts/mysql-apply-migration.js`、远端有 MySQL 相关变量时跑 migrate
5. `systemctl restart baobao-backend`（无 systemd 则提示）
6. 远端执行 `deploy/pipeline/verify-ecs.sh`，校验 `/api/health` 四个 backend 字段

独立验收脚本：`deploy/pipeline/verify-ecs.sh`。可用 `EXPECT_*` 锁定生产预期后端；可选用 `RUN_AUTH_LEARNING=1 AUTH_TOKEN=...` 验证已有 session 的登录和学习读取链路。
