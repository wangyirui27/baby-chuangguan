# 宝宝闯关后端架构

## 当前原则

前端只调用项目自己的 `/api/*`。云厂商、BaaS、数据库和对象存储都只能藏在后端实现层，不能直接进入 `index.html`、`script.js` 或前端构建环境。

## 目标部署

| 能力 | 阿里云资源 | 职责 |
| --- | --- | --- |
| 应用服务 | ECS | 运行 Node/Express 后端，提供静态 H5 与 `/api/*` |
| 关系数据 | RDS MySQL | 用户、session、验证码哈希、学习进度、错题、答题记录、反馈 |
| 文件资源 | OSS | 视频、音频、图片、地图素材、导出文件 |
| 缓存/限流 | Redis | 短信限流、session 缓存、热点学习状态缓存、短期锁 |

## 保持不变的接口

- `POST /api/auth/send-code`
- `POST /api/auth/verify-code`
- `GET /api/auth/session`
- `POST /api/auth/logout`
- `GET /api/learning/state`
- `PUT /api/learning/state`
- `PATCH /api/learning/preferences`
- `POST /api/learning/quiz-attempts`
- `POST /api/learning/support-feedback`

这些接口是前端契约。迁移 InsForge、Supabase 或阿里云自建后端时，不改前端调用路径。

## 后端分层

```text
index.html / script.js
        |
        v
auth/apiClient.js -> /api/*
        |
        v
backend/src/*.js Express routes
        |
        v
repository / adapter
        |
        +-- RDS MySQL
        +-- Redis
        +-- OSS
```

## 迁移顺序

1. 保留现有 `/api/*` 和测试。
2. 已新增 MySQL learning repository，不改前端和登录，默认仍为 InsForge。
3. 在 RDS 表结构和数据校验完成后，通过 `LEARNING_REPOSITORY=mysql` 显式切到 MySQL。
4. 学习数据稳定后，再把 `backend/src/db.js` 的 JSON 认证数据迁到 RDS MySQL/Redis。
5. Redis 只接管短期状态：验证码冷却、IP 限流、session 快取。数据库仍是最终事实来源。
6. OSS 只接管大文件资源；数据库只存 `url`、`key`、版本号和用途。
7. InsForge adapter 保留到数据校验完成后再移除。

## MySQL 迁移注意

- 用 `baby_profiles.local_user_id` 继续锚定当前手机号登录用户。
- Postgres 的 `INTEGER[]` 在 MySQL 中改为 JSON 或子表。
- Postgres 的 `JSONB` 在 MySQL 中改为 JSON。
- RLS/Auth UID 不搬到 MySQL；权限继续由 Express session 和 repository 层控制。
- 当前 MySQL learning repository 只使用现有字段，不新增生日、星级、耗时、尝试次数、提示使用、错音分类等业务字段。

## 各资源代码就绪状态

| 资源 | 代码就绪 | 启用变量 | 说明 |
|------|---------|---------|------|
| RDS MySQL | ✅ | `LEARNING_REPOSITORY=mysql` + `MYSQL_*` | learning 6 表 + auth 3 表已实现，factory 模式切换 |
| Redis | ✅（IP 限流） | `REDIS_URL` | `security.js` 内 ioredis INCR+PEXPIRE，未设置/连接失败回退内存；验证码冷却、session 缓存仍走数据库 |
| OSS | ✅（静态 302） | `OSS_PUBLIC_BASE_URL` | `oss.js` 中 `/assets/*` 302 到 OSS/CDN 公网前缀，不持有 AK；上传/管理 API 待业务触发后再加 |
| ECS | ✅（部署脚本） | 无 | `deploy/ecs/` 含 systemd 单元 + bootstrap.sh + env 占位，未真实上线 |

后续若加 Redis Session/验证码冷却、OSS 上传 API，按现有 factory 模式新增适配层文件即可，不预设变量名。

## 不要做

- 不要让前端直接连 RDS、Redis、OSS、InsForge 或 Supabase。
- 不要把阿里云 AccessKey 放进前端、日志、commit message。
- 不要让 RDS、Redis、OSS 直接暴露公网；公网入口只留 ECS/SLB/API。
- 不要把本地调试的 `CORS=*`、`null origin` 放进生产配置。
- 不要在未确认前新增宝宝生日、星级、耗时、错音分类等字段。
- 不要让 Redis 成为唯一数据源。
- 不要把 OSS 当数据库用。
