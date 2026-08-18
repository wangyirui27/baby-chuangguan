# 嗨洛塔 · 初次部署包（ECS）

> 2026-08-18  
> 目标目录：**`/opt/apps/baobao/backend`**（整仓根：H5 + 嵌套 `backend/`，不是只拷 `backend/` 这一层）  
> 密钥只写服务器 `/etc/baobao-backend.env`，**不要**写进本包或 git  
> 完整 SOP：[`deploy-server.md`](./deploy-server.md)

---

## 0. 这台机最终长什么样

```text
/opt/apps/baobao/backend/          ← APP_DIR / systemd WorkingDirectory
  backend/src/index.js             ← ExecStart: /usr/bin/node backend/src/index.js
  index.html  assets/  admin/      ← Express 静态站
  data/                            ← rsync 不覆盖（JSON 回落用）
/etc/baobao-backend.env            ← 生产密钥（chmod 640，root:baobao）
/etc/systemd/system/baobao-backend.service
```

进程：`baobao` 用户，`PORT=3000`。对外只开 **443**（Nginx 反代），22 仅密钥登录。

---

## 1. 把包拷上服务器

本机（包在仓库 `deploy/dist/baobao-first-install.tar.gz`，或桌面副本）：

```bash
scp baobao-first-install.tar.gz USER@ECS:/tmp/
ssh USER@ECS
sudo tar -xzf /tmp/baobao-first-install.tar.gz -C /tmp
cd /tmp/baobao-first-install
sudo bash install.sh
```

`install.sh` 会：建用户 `baobao`（若无）、建目录、安装 systemd + sudoers、写入 **空的** env 模板（已存在则不覆盖）。

---

## 2. 填生产 env（必做，脚本不会填密码）

```bash
sudo visudo -c -f /etc/sudoers.d/baobao-backend   # 应 ok
sudo ${EDITOR:-nano} /etc/baobao-backend.env
sudo chmod 640 /etc/baobao-backend.env
sudo chown root:baobao /etc/baobao-backend.env
```

最小画像 B（RDS，与当前开发惯例对齐）：

```bash
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://你的域名
SMS_PROVIDER=aliyun
SMS_ALIYUN_ACCESS_KEY_ID=
SMS_ALIYUN_ACCESS_KEY_SECRET=
SMS_ALIYUN_SIGN_NAME=
SMS_ALIYUN_TEMPLATE_CODE=
SMS_ALIYUN_TEMPLATE_PARAM_KEY=code
AUTH_REPOSITORY=mysql
LEARNING_REPOSITORY=mysql
MYSQL_HOST=rm-xxxxxxxx.mysql.rds.aliyuncs.com
MYSQL_PORT=3306
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=baobao_chuangguan
MYSQL_CONNECTION_LIMIT=5
ADMIN_TOKEN=
```

RDS 安全组放行 **这台 ECS 出网**。

---

## 3. 第一次把代码放进去

任选一条：

**A. 本机已有 SSH 密钥（推荐之后走 GitHub Actions）**

```bash
ECS_HOST=你的公网IP或域名 \
ECS_USER=baobao \
ECS_SSH_KEY_PATH=~/.ssh/你的私钥 \
APP_DIR=/opt/apps/baobao/backend \
bash deploy/pipeline/deploy-ecs.sh
```

**B. 第一次用 Actions：打 tag**

`install.sh` 之后目录可以是空的，**先不要** `systemctl start`（直到代码进去）。配好 GitHub Secrets 后：

```bash
git tag v1.0.0
git push origin v1.0.0
```

`push main` **不会**部署。应急才用 Actions → Deploy ECS → Run workflow。

GitHub Secrets：`ECS_HOST`、`ECS_SSH_KEY`（私钥全文），可选 `ECS_USER=baobao`。  
Actions 默认 `APP_DIR=/opt/apps/baobao/backend`。若仓库 Variables 里写过旧路径，改掉或删掉。

`baobao` 的 `~/.ssh/authorized_keys` 必须有对应公钥。安全组 TCP 22 放行部署来源。

---

## 4. HTTPS 反代

把包里 `nginx-baobao.conf.example` 拷到 `/etc/nginx/sites-available/`，改 `server_name` 和证书路径，`nginx -t && systemctl reload nginx`。

健康检查：

```bash
curl -sS http://127.0.0.1:3000/api/health
# 期望：status=ok，nodeEnv=production，learningBackend=mysql（画像 B）
sudo systemctl status baobao-backend --no-pager
```

---

## 5. 一次条件清单

| 项 | 标准 |
|----|------|
| Node | 20 LTS，`/usr/bin/node` |
| 用户 | `baobao`，能 SSH 密钥登录 |
| sudo | 免密 `systemctl restart baobao-backend`（包内 sudoers） |
| 目录 | `/opt/apps/baobao/backend` 属主 `baobao:baobao` |
| env | `/etc/baobao-backend.env` 640，**rsync 永不覆盖** |
| 代码 | 仓根在 APP_DIR 下，存在 `backend/src/index.js` |
| 发版后 | `PIPELINE_DEPLOY_OK` + `HEALTH_OK` |

日常发版：`git tag vX.Y.Z && git push origin vX.Y.Z` → `.github/workflows/deploy-ecs.yml`。明细：`deploy/pipeline/ci-cd.md`。
