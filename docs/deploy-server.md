# 嗨洛塔 · 服务端部署文档

> 更新：2026-08-18  
> 适用：把生产 Express（H5 + `/api/*`）部署到公网，供 iOS / Android 壳与 H5 调用  
> 细表与证据：[`graphify-team/04-deploy-ops.md`](./graphify-team/04-deploy-ops.md)  
> 架构原则：[`backend-architecture.md`](./backend-architecture.md)  
> **禁止**把密钥、`.p8`、短信 AK、InsForge key、`MYSQL_PASSWORD` 写入本文或 commit

---

## 0. 一句话

| 点 | 事实 |
|----|------|
| 生产进程 | 根目录 `npm start` ≡ `node backend/src/index.js` |
| 同端口 | 静态站点（仓库根）+ `/api/*`，默认 `PORT=3000` |
| 前端契约 | 只打自家 `/api/*`，禁止前端直连 InsForge / RDS / OSS / 短信 |
| **本机开发连哪库** | **阿里云 RDS MySQL**（不是本机 mysqld）。见 `backend/.env`：`AUTH_REPOSITORY=mysql` + `LEARNING_REPOSITORY=mysql` + `MYSQL_HOST=rm-….rds.aliyuncs.com` |
| 配置文件落点 | 本机：`backend/.env`（gitignore）；ECS：`/etc/baobao-backend.env`（rsync **不覆盖**） |
| 现成发船脚本 | `deploy/pipeline/deploy-ecs.sh` + `deploy/ecs/baobao-backend.service` |
| 非生产 | `apps/backend`、`apps/frontend` **不要**当商店后端 |

---

## 1. 本机 vs 生产：谁读哪份配置、连哪库

| 场景 | 进程在哪 | 读哪个配置 | 数据库（当前团队惯例） |
|------|----------|------------|------------------------|
| 本机 `npm start` | 笔记本 | `backend/.env`（优先；见 `index.js` dotenv 顺序） | **RDS**（`MYSQL_HOST` 为 `*.mysql.rds.aliyuncs.com`） |
| ECS 生产 | `/opt/baobao-chuangguan` | **`/etc/baobao-backend.env`**（systemd `EnvironmentFile`） | 应与本机同一 RDS **或** 单独生产库（见下） |
| `npm test` | 本机 | `NODE_ENV=test` → Auth **强制 json** | 不依赖 RDS；Learning 单测自带 mock/隔离 |

**核对本机实际目标（不打印密码）：**

```bash
cd backend
grep -E '^(AUTH_|LEARNING_|MYSQL_HOST|MYSQL_DATABASE|MYSQL_PORT|MYSQL_USER)=' .env
# 期望看到：AUTH_REPOSITORY=mysql、LEARNING_REPOSITORY=mysql、
# MYSQL_HOST=rm-….mysql.rds.aliyuncs.com、MYSQL_DATABASE=baobao_chuangguan
```

`MYSQL_HOST` 含 `rds.aliyuncs.com` → 连云端 RDS。  
若改成 `127.0.0.1` / `localhost` → 才是本机 MySQL（须本机已建库且账号齐全）。

### 1.1 风险（本机直连 RDS）

- 本机开发写的用户/进度进**真实云库**；误删、脏数据、并发测会影响他人。
- RDS 白名单须放行本机出口 IP；换网络可能连不上。
- `SMS_PROVIDER=aliyun` 时本机也会发**真短信**（计费）；本地联调短信请用 `SMS_PROVIDER=development`。
- **不要**把 `backend/.env` 同步进 git；ECS 用独立 `/etc/baobao-backend.env`，值可同源但文件分离。

### 1.2 若要改成「本机只连本机库」

在 `backend/.env`（或临时 export）中改为：

```bash
AUTH_REPOSITORY=mysql
LEARNING_REPOSITORY=mysql
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=...
MYSQL_PASSWORD=...
MYSQL_DATABASE=baobao_chuangguan
```

或完全躲开 MySQL：

```bash
AUTH_FORCE_JSON=1
LEARNING_REPOSITORY=none
# 或 LEARNING_REPOSITORY=insforge + INSFORGE_*
```

---

## 2. 选哪种部署画像

**与当前本机 `.env` 对齐时：用画像 B（Auth + Learning 都进 RDS）。**  
画像 A（JSON auth + InsForge learning）仍可用，适合「先上架、后迁库」；但会与现开发环境双轨，运维要心里有数。

### 画像 B · RDS（**当前本机已采用；生产推荐对齐**）

| 层 | 选择 | 关键 env |
|----|------|----------|
| 进程 | 单台 ECS + systemd | `NODE_ENV=production` `PORT=3000` |
| Auth | RDS MySQL | `AUTH_REPOSITORY=mysql` + **完整** `MYSQL_*`（§4.2） |
| Learning | RDS MySQL | `LEARNING_REPOSITORY=mysql`（与本机一致） |
| MySQL 连接 | 一律 env，无代码默认 host/user/db | `MYSQL_HOST`…`MYSQL_DATABASE` |
| 短信 | 阿里云 Dysms | `SMS_PROVIDER=aliyun` + `SMS_ALIYUN_*` |
| 限流 | 进程内内存 Map | **无 Redis**；多实例不共享计数 |
| 课视频 L11+ | OSS 公网直链 | 客户端直下；不经 Express 代理 |

> `MYSQL_*` 缺任一项时：Auth 不会静默连 `127.0.0.1/root/baby_island`；`AUTH_REPOSITORY=mysql` 会回落 json；Learning mysql 构造失败并记 reason。

### 画像 A · JSON auth + InsForge learning（可选最小轨）

| 层 | 选择 | 关键 env |
|----|------|----------|
| Auth | JSON `data/*.json` | `AUTH_REPOSITORY=json`；**单机单进程** |
| Learning | InsForge | `LEARNING_REPOSITORY=insforge` + `INSFORGE_URL` + `INSFORGE_API_KEY` |
| 短信 / 管理后台 / OSS 课视频 | 同画像 B | 见 §4 |

Schema / Learning 表变更：先写 `migrations/` 草稿，**用户确认后再对生产库执行**。见 `04-deploy-ops.md` §8。

---

## 3. 架构（请求怎么走）

```text
本机 npm start                    ECS 生产
  │ backend/.env                    │ /etc/baobao-backend.env
  ▼                                 ▼
Express (backend/src/index.js)  ←── 同构代码
  ├─ /api/auth/*     → AUTH_REPOSITORY=mysql → RDS MySQL
  ├─ /api/learning/* → LEARNING_REPOSITORY=mysql → 同一 RDS（库 baobao_chuangguan）
  ├─ /api/me/*       → entitlements
  └─ express.static  → 仓库根 H5
         │
         └─ 课视频 L11+：客户端 → OSS 公网 URL（不经 Express）

iOS / Android / 浏览器
  └─ apiBase = https://生产域名  →  打到 ECS，再由 ECS 连 RDS
```

本机浏览器打开 `http://localhost:3000` 时：API 在本机进程，**库仍在 RDS**（由本机 `.env` 决定）。

InsForge 项目名（仓内约定）：**baobao-chuangguan**（画像 A 才用）。URL/key 只放服务器 env。

---

## 4. 环境变量清单（只写键名）

| 环境 | 文件 | 备注 |
|------|------|------|
| 本机开发 | `backend/.env` | gitignore；当前指向 RDS |
| ECS 生产 | `/etc/baobao-backend.env` | systemd 加载；**rsync 不传、不覆盖** |
| 模板 | `backend/.env.example`、根 `.env.example` | 只含键名与注释 |

本机 dotenv 顺序（`backend/src/index.js`）：`backend/.env` → 仓库根 `.env` → 可选 `backend/.env.mysql.local`（override）。

### 4.1 进程与短信（生产 ECS 必填）

| 变量 | 说明 |
|------|------|
| `NODE_ENV` | 必须 `production`（禁虚拟登录、禁 SMS 开发回落） |
| `PORT` | 建议 `3000`；前面用 Nginx/Caddy 反代 443 |
| `CORS_ORIGINS` | 逗号分隔；含官网域名 |
| `SMS_PROVIDER` | 生产 `aliyun`；本机联调可用 `development` |
| `SMS_ALIYUN_ACCESS_KEY_ID` / `_SECRET` / `_SIGN_NAME` / `_TEMPLATE_CODE` | 阿里云短信（`aliyun` 时） |

### 4.2 数据库（Auth / Learning）——配置文件里写全

**不要**写进代码。本机写 `backend/.env`；ECS 写 `/etc/baobao-backend.env`。

#### 仓库选择

| 变量 | 取值 | 作用 |
|------|------|------|
| `AUTH_REPOSITORY` | `json`（代码默认）/ `mysql` | 登录用户、session、验证码哈希 |
| `AUTH_BACKEND` | 同上 | 别名 |
| `AUTH_FORCE_JSON` | `1` | 强制 json（单测/排障） |
| `LEARNING_REPOSITORY` | `insforge` / `mysql` / `none` | 学习进度全量 |
| `LEARNING_BACKEND` | 同上 | 别名 |

#### MySQL / RDS（本机现状与画像 B）

| 变量 | 必填 | 说明 |
|------|------|------|
| `MYSQL_HOST` | ✅ | RDS：`rm-….mysql.rds.aliyuncs.com`；本机库：`127.0.0.1` |
| `MYSQL_PORT` | 建议写 | 未设时协议默认 `3306` |
| `MYSQL_USER` | ✅ | 数据库用户 |
| `MYSQL_PASSWORD` | ✅ | 数据库密码 |
| `MYSQL_DATABASE` | ✅ | 库名，当前惯例 `baobao_chuangguan` |
| `MYSQL_CONNECTION_LIMIT` | 可选 | 未设时 `5` |

代码入口：`backend/src/mysql-config.js`（auth 池与 learning mysql 共用）。  
**已移除**硬编码：`127.0.0.1` / `root` / `baby_island`。

**本机 / ECS 对齐片段（画像 B，值自填）：**

```bash
AUTH_REPOSITORY=mysql
LEARNING_REPOSITORY=mysql
# 亦接受 LEARNING_BACKEND=mysql
MYSQL_HOST=rm-xxxxxxxx.mysql.rds.aliyuncs.com
MYSQL_PORT=3306
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=baobao_chuangguan
MYSQL_CONNECTION_LIMIT=5
```

如何判断连的是 RDS 还是本机：看 `MYSQL_HOST` 是否含 `rds.aliyuncs.com`（或是否为 `127.0.0.1`）。

#### InsForge（仅画像 A：`LEARNING_REPOSITORY=insforge`）

| 变量 | 必填 | 说明 |
|------|------|------|
| `INSFORGE_URL` | ✅ | 项目 API base |
| `INSFORGE_API_KEY` | ✅ | 服务端 key（兼容旧名 `INSFORGE_SERVICE_KEY`） |

画像 A 片段：

```bash
AUTH_REPOSITORY=json
LEARNING_REPOSITORY=insforge
INSFORGE_URL=
INSFORGE_API_KEY=
# 不必配 MYSQL_*
```

### 4.3 强烈建议

| 变量 | 说明 |
|------|------|
| `ADMIN_TOKEN` | 运维后台；随机长串 |
| `CORS_ALLOW_NULL_ORIGIN` | file:// / 部分 WebView 需要时设 `true` |
| `OSS_PUBLIC_BASE_URL` | admin 关卡目录 / readiness；课视频靠 `asset-packs.json` |

### 4.4 生产严禁

| 变量 / 行为 | 原因 |
|-------------|------|
| `SMS_PROVIDER=development` | 验证码打日志，不能当真短信 |
| `VIRTUAL_LOGIN=1` / `ALLOW_VIRTUAL_LOGIN` | `NODE_ENV=production` 下应关闭 |
| `TEMP_LOCAL_FULL_ACCESS` | 商店包必须 `false`（客户端） |
| 密钥进 `shell-config.json` / H5 / commit | 泄漏 |
| 依赖代码默认 `127.0.0.1`/`root` | **已删除**；必须配 `MYSQL_*` |
| 本机 `SMS_PROVIDER=aliyun` 无意识狂测 | 真短信计费 + 污染线上用户 |

---

## 5. 服务器首装（一次性）

假设：Ubuntu、用户 `baobao`、目录 `/opt/baobao-chuangguan`（与现有 unit 一致）。

### 5.1 系统依赖

```bash
# Node 20 LTS（与 CI 对齐）
node -v   # 期望 v20.x
npm -v
```

### 5.2 目录与权限

```bash
sudo mkdir -p /opt/baobao-chuangguan
sudo chown baobao:baobao /opt/baobao-chuangguan
sudo mkdir -p /opt/baobao-chuangguan/data
sudo chown baobao:baobao /opt/baobao-chuangguan/data
```

### 5.3 环境文件（生产画像 B，与本机 RDS 对齐）

```bash
sudo install -m 600 /dev/null /etc/baobao-backend.env
sudo chown root:baobao /etc/baobao-backend.env
sudo chmod 640 /etc/baobao-backend.env
# 用编辑器写入；可从本机 backend/.env 抄键名，勿用 scp 把含密钥文件提交进仓
```

**推荐（与当前本机一致）：**

```bash
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://www.example.com,https://example.com
# CORS_ALLOW_NULL_ORIGIN=true
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

可选画像 A（JSON + InsForge）仅当你刻意不用 RDS：

```bash
AUTH_REPOSITORY=json
LEARNING_REPOSITORY=insforge
INSFORGE_URL=
INSFORGE_API_KEY=
# 不要同时留 AUTH_REPOSITORY=mysql 半配置
```

**RDS 安全组：** ECS 出网与本机开发出口 IP 都要在白名单内，否则本机通、ECS 不通（或相反）。

### 5.4 systemd

```bash
sudo cp /opt/baobao-chuangguan/deploy/ecs/baobao-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable baobao-backend
```

Unit 要点：`WorkingDirectory=/opt/baobao-chuangguan`，`ExecStart=/usr/bin/node backend/src/index.js`，`EnvironmentFile=-/etc/baobao-backend.env`。

### 5.5 反向代理（HTTPS）

对外只暴露 443。示例（Nginx 思路，域名自替）：

```nginx
server {
  listen 443 ssl http2;
  server_name api.example.com;   # 或与官网同域

  # ssl_certificate ...;
  # ssl_certificate_key ...;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

健康检查应对公网：`https://api.example.com/api/health`。

---

## 6. 日常发版（代码同步）

本机（有 SSH 密钥）：

```bash
cd /path/to/嗨洛塔少儿启蒙APP

ECS_HOST=你的公网IP或域名 \
ECS_USER=baobao \
ECS_SSH_KEY_PATH=~/.ssh/your_key \
APP_DIR=/opt/baobao-chuangguan \
bash deploy/pipeline/deploy-ecs.sh
```

脚本做什么：

1. `rsync --delete` 到远端（**排除** `node_modules` / `.git` / `data` / `.env*` / `*.log`）
2. 远端 `cd backend && npm ci --omit=dev`
3. 可选 `RUN_MIGRATE=1`（仅当远端已配 `MYSQL_*` 且存在迁移脚本时）
4. `systemctl restart baobao-backend`
5. 尝试跑远端 health 验收（脚本引用 `deploy/pipeline/verify-ecs.sh`；若文件缺失，用下面手动验收）

**重要：** 发版**不会**把本机 `backend/.env` 推上 ECS。RDS 账号只维护在 `/etc/baobao-backend.env`。改库连接 = 改 ECS 上那份文件再 `systemctl restart`。

**手动验收（推荐每次发版都跑）：**

```bash
ssh -i "$ECS_SSH_KEY_PATH" "$ECS_USER@$ECS_HOST" \
  'curl -sS http://127.0.0.1:3000/api/health'
```

期望 JSON（画像 B）：

- `status` 正常
- `nodeEnv` = `production`
- `smsProvider` = `aliyun`
- `learningBackend` = `mysql`
- `learningConfigured` = true

启动日志应打印 Auth repository = mysql、Learning = mysql（见 `backend/src/index.js`）。

进程侧：

```bash
sudo systemctl status baobao-backend --no-pager
sudo journalctl -u baobao-backend -n 80 --no-pager
```

---

## 7. 客户端如何接到这台服务器

### 7.1 iOS

编辑打包进 App 的：

`ios/BabyEnglishIsland/shell-config.json`

| 字段 | 内容内测 | 正式商店 |
|------|----------|----------|
| `apiBase` | `""` | `https://api.example.com`（**无尾斜杠**） |
| `allowLocalMockLogin` | `true` | **`false`** |

改完后重新 `pack-app-www` / Archive。空 `apiBase` = 无云进度、靠 mock 过登录门，**不能当正式上架体验**。

App **不直连 RDS**；只打 `apiBase` → ECS Express → RDS。

### 7.2 H5 / 同源

若用户浏览器直接打开同机静态站：相对路径 `/api/*` 即可，无需改 `apiBase`。

### 7.3 法律页

ASC 要的隐私政策 / 支持 URL 必须是**公网 HTTPS**。可同机静态托管 `docs/hosted-legal-pages/`，或单独站点。上线前源码中 `【待填` 计数必须为 0。见 `docs/testflight-asc-form.md`。

---

## 8. 功能验收清单（上架前）

在真机或 curl 对**生产域名**测：

| # | 检查 | 通过标准 |
|---|------|----------|
| 1 | `GET /api/health` | 200；`learningBackend=mysql`；`nodeEnv=production` |
| 2 | `POST /api/auth/send-code` | 真机收到短信（非终端打印） |
| 3 | `POST /api/auth/verify-code` | 返回 session；cookie / Bearer 可用 |
| 4 | `GET /api/auth/session` | 恢复登录态 |
| 5 | `PUT /api/learning/state` | 登录后写入成功；RDS 可见对应行 |
| 6 | `POST /api/auth/logout` | session 失效 |
| 7 | 未登录写 learning | 401/拒绝 |
| 8 | App 壳 | `apiBase` 指向生产；`allowLocalMockLogin=false` |
| 9 | 付费墙 | 未购仍挡英语 L11+ |
| 10 | 备份 | RDS 快照 / binlog 策略已开 |

**本机联调（仍可能写 RDS）：**

```bash
cd backend
# 确认 .env 里 MYSQL_HOST 是你想要的目标（RDS 或 127.0.0.1）
SMS_PROVIDER=development npm start   # 避免真短信
# 浏览器 http://localhost:3000
```

单测不连 RDS：`NODE_ENV=test` 强制 Auth json。

---

## 9. 数据与备份

### 画像 B（当前推荐 / 本机现状）

| 资源 | 注意 |
|------|------|
| 阿里云 RDS `baobao_chuangguan` | 本机与 ECS **可共用同一实例**；或拆「开发库 / 生产库」两套 `MYSQL_*` |
| Auth 表 | `baby_auth_users` / `baby_auth_sessions` / `baby_auth_verifications` |
| Learning 表 | `baby_profiles` 等（见 `07-data-model.md`） |
| 备份 | RDS 自动快照 + binlog；**不要**假设 `data/*.json` 还有登录真相 |

若本机与生产共用同一 RDS：把「测试手机号」当脏数据隔离；大迁移前先快照。

### 画像 A（JSON auth）

| 路径 | 注意 |
|------|------|
| ECS `data/*.json` | rsync 不传；丢盘 = 丢登录 |
| InsForge | Learning 在云；控制台备份 |

---

## 10. 运维速查

| 动作 | 命令 |
|------|------|
| 重启 | `sudo systemctl restart baobao-backend` |
| 日志 | `sudo journalctl -u baobao-backend -f` |
| 健康 | `curl -sS https://你的域名/api/health` |
| 兼容探针 | `GET /healthz` |
| 看本机连哪库 | `grep MYSQL_HOST backend/.env`（应见 `rds.aliyuncs.com` 或 `127.0.0.1`） |
| 看 ECS 连哪库 | `sudo grep MYSQL_HOST /etc/baobao-backend.env` |
| 后台 | `https://你的域名/admin/` + `Authorization: Bearer $ADMIN_TOKEN` |
| 发版 | §6 `deploy-ecs.sh` |
| 回滚代码 | 旧 commit 再跑 `deploy-ecs.sh`（`/etc/baobao-backend.env` 与 RDS 数据保留） |

---

## 11. 诚实边界（别当已上线）

| 能力 | 代码现状（2026-08） |
|------|---------------------|
| Redis 限流 | **未实现**；纯内存，重启清零 |
| Express 挂 OSS 静态 302 | **`oss.js` 未 require 进生产入口** |
| `SESSION_SECRET` 等 example 注释项 | 部分**代码不读**；以 `04-deploy-ops.md` §2.3 为准 |
| `apps/backend` | 契约壳，无完整 learning |
| 本机默认库 | **不是**本机 mysqld；是 **RDS**（以 `backend/.env` 为准） |

---

## 12. 与 App Store 发布的衔接顺序

```text
1. 确认本机 backend/.env：AUTH/LEARNING=mysql，MYSQL_HOST=RDS
2. 在 ECS 写入同结构 /etc/baobao-backend.env（RDS 白名单含 ECS）
3. 首装 systemd + HTTPS 反代
4. deploy-ecs.sh 推代码 → /api/health 显示 learningBackend=mysql
5. 真短信登录 + learning PUT/GET（数据进 RDS）
6. 改 shell-config.json：apiBase + 关 mock → Archive
7. ASC：隐私 URL / 支持 URL
8. IAP 商品与购买链路
```

内容-only TestFlight 可暂空 `apiBase`；**正式审核包不要空。**

---

## 13. 相关文件索引

| 路径 | 用途 |
|------|------|
| `backend/src/index.js` | 生产入口 + dotenv 加载顺序 |
| `backend/src/mysql-config.js` | MySQL/RDS 连接解析（无硬编码 host/user/db） |
| `backend/src/db.js` | Auth：json 或 mysql |
| `backend/src/learning-repository-factory.js` | Learning：insforge / mysql / none |
| `backend/.env` | **本机真实配置**（gitignore；当前指向 RDS） |
| `backend/.env.example` | env 模板（含 MYSQL_* / AUTH_* / LEARNING_*） |
| `/etc/baobao-backend.env` | **ECS 真实配置**（不在仓内） |
| `deploy/ecs/baobao-backend.service` | systemd unit |
| `deploy/pipeline/deploy-ecs.sh` | 一键同步重启（不覆盖远端 env） |
| `ios/BabyEnglishIsland/shell-config.json` | App `apiBase`（不直连库） |
| `docs/graphify-team/04-deploy-ops.md` | 变量/仓库切换证据表 |
| `docs/testflight-asc-form.md` | ASC URL / 法律页约束 |
| `AGENTS.md` | InsForge 项目约定 |

---

**维护约定：** 改部署路径、env 语义、或本机/生产默认库类型时，同步改本文 §0–§4 与 `04-deploy-ops.md` / `TECH.md`，避免漂移。