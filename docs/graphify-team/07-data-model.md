# 07 · 数据模型与 LearningState

> 项目根：`/Users/yr/宝宝闯关`  
> 证据：`migrations/*.sql`、`backend/src/insforge-learning-repository.js`、`backend/src/mysql-learning-repository.js`、`backend/src/learning.js`、`backend/src/db.js`、`backend/src/security.js`、`backend/src/oss.js`、`packages/contracts/openapi/openapi.yaml`  
> 生成：2026-07-21  
> 二刷：2026-07-21 — 对照 backend/src 补充 auth MySQL 表、Redis/OSS 配置、env vs 硬编码标注

---

## 1. 存储分域

| 域 | 存储 | 代码 | 切换方式 |
|----|------|------|---------|
| Auth（user/session/verification） | JSON 文件 + Map（默认）或 MySQL（opt-in） | `backend/src/db.js` | `AUTH_REPOSITORY=mysql` 或 `LEARNING_REPOSITORY=mysql` |
| Learning | InsForge（默认）或 MySQL | `*learning-repository.js` | `LEARNING_REPOSITORY=mysql` |
| IP 限流 | 进程内存（默认）或 Redis | `security.js`（`IpRateLimiter`） | `REDIS_URL` |
| OSS 静态 | 本地文件（默认）或签名/公网 OSS | `oss.js` | `OSS_ASSETS_MODE=redirect` |

---

## 2. 表（Learning，6 张）

与 InsForge Postgres 迁移一致；MySQL 适配器按同名字段读写（数组类字段 MySQL 侧为 JSON 文本）。

### 2.1 `baby_profiles`

| 字段 | 约束（迁移） | 前端/API 语义 |
|------|--------------|---------------|
| id | UUID PK | 服务端 profile id |
| local_user_id | UUID UNIQUE NOT NULL | 对应 Express 登录用户 |
| auth_user_id | 可选，未来直连 InsForge auth | 现多空 |
| child_name | 1..10，默认 小禾 | preferences |
| child_age | 3..6，默认 4 | preferences |
| map_music | bool | preferences |
| auto_pronunciation | bool | preferences |
| show_chinese_hints | bool | preferences |
| map_world | ocean/desert/castle | 当前地图 |
| created_at / updated_at | timestamptz | |

### 2.2 `baby_world_progress`

| 字段 | 约束 |
|------|------|
| profile_id + world_id | PK |
| world_id | ocean/desert/castle |
| completed_levels | int[]（≤200） |
| unlocked_through | 1..200 |

### 2.3 `baby_learning_activity`

| 字段 | 说明 |
|------|------|
| profile_id + activity_day | PK，学习打卡日 |

### 2.4 `baby_mistakes`

| 字段 | 约束 |
|------|------|
| unique (profile_id, world_id, level_id) | 每关一条活跃错题语义 |
| word/zh_title/selected/correct | ≤40 字符（learning.js slice 截断；硬编码） |
| mistake_count | **1..99**（InsForge normalize + MySQL write 均 clamp） |
| resolved_at | null=未解决 |

### 2.5 `baby_quiz_attempts`

追加型答题流水：world_id, level_id, selected, correct(≤40), is_correct, attempted_at。

### 2.6 `baby_support_feedback`

message 4..300；context JSONB；status open/reviewed/closed。

### 2.7 迁移文件序

1. `20260720141941_create-learning-backend.sql` — 建表 + RLS  
2. `20260720142634_harden-learning-backend.sql` — 硬化  
3. `20260720223312_add-learning-report-metrics.sql` — **已回滚的扩展**  
4. `20260720224601_rollback-learning-report-metrics.sql` — 回滚范例  

---

## 3. 表（Auth，3 张，MySQL 模式）

`db.js` 的 MySQL 持久化路径引用以下三张表。**DDL 尚未编写**（代码引用但无迁移文件）。

### 3.1 `baby_auth_users`

| 字段 | 来源 | 说明 |
|------|------|------|
| id | UUID PK | `crypto.randomUUID()` |
| normalized_phone | NOT NULL | `+861****8000` 格式 |
| created_at | ISO 8601 | |
| last_login_at | ISO 8601 | 每次登录更新 |

> db.js:232-243 — `INSERT ... ON DUPLICATE KEY UPDATE`

### 3.2 `baby_auth_sessions`

| 字段 | 来源 | 说明 |
|------|------|------|
| token_hash | PK | SHA-256 of raw token (64 hex chars) |
| user_id | FK → baby_auth_users.id | |
| created_at | ISO 8601 | |
| expires_at | ISO 8601 | 30 天有效期（硬编码于 auth.js:25） |
| revoked | 0/1 | 登出设 1 |

> db.js:245-258 — `INSERT ... ON DUPLICATE KEY UPDATE`

### 3.3 `baby_auth_verifications`

| 字段 | 来源 | 说明 |
|------|------|------|
| id | PK | phoneHash:codeHash 组合 |
| phone_hash | NOT NULL | SHA-256 of normalized phone |
| code_hash | NOT NULL | SHA-256 of 6-digit code |
| expires_at | ISO 8601 | 5 分钟有效期（硬编码于 auth.js:23） |
| attempts | INT | 失败尝试次数，上限 3（硬编码） |
| used | 0/1 | 成功校验后消费 |
| created_at | ISO 8601 | |

> db.js:260-274 — `INSERT ... ON DUPLICATE KEY UPDATE`

### 3.4 触发条件

Auth MySQL 模式启用条件（`db.js:17-23`）：

```javascript
MYSQL_ENABLED = (
  (LEARNING_REPOSITORY === 'mysql' || AUTH_REPOSITORY === 'mysql') &&
  MYSQL_HOST && MYSQL_USER && MYSQL_PASSWORD && MYSQL_DATABASE
)
```

即：两个 repository 任一设为 `mysql` **且** MYSQL_* 四项完整，auth 就会走 MySQL。

---

## 4. 限流配置（ipLimiter / writeLimiter）

| 限流器 | 窗口 | 上限 | 代码位置 | 可配？ |
|--------|------|------|---------|--------|
| auth send-code IP 限流 | 15 分钟 | 20 次 | `security.js:200` | ❌ 硬编码 |
| learning 写操作 IP 限流 | 15 分钟 | 180 次 | `learning.js:13` | ❌ 硬编码 |
| 同手机号冷却 | 60 秒 | — | `auth.js:22` | ❌ 硬编码 |
| 同手机号窗口频率 | 15 分钟 | 5 次 | `auth.js:20-21` | ❌ 硬编码 |

**后端选择**：内存（默认，`Map<string, number[]>` 滑动窗口）或 Redis（`REDIS_URL` + INCR/PEXPIRE）。Redis 不可用时自动回退内存。

---

## 5. OSS 静态资源表（逻辑模型）

`oss.js` 不维护数据库表，仅通过 env 控制行为。

| 配置键 | 必填 | 说明 |
|--------|------|------|
| `OSS_ASSETS_MODE` | 否 | `local`（默认）或 `redirect` |
| `OSS_ACCESS_KEY_ID` | 签名 OSS 时 | |
| `OSS_ACCESS_KEY_SECRET` | 签名 OSS 时 | |
| `OSS_ENDPOINT` | 签名 OSS 时 | 如 `oss-cn-hangzhou.aliyuncs.com` |
| `OSS_BUCKET` | 签名 OSS 时 | |
| `OSS_PUBLIC_BASE_URL` | 公网 OSS 时 | 如 `https://cdn.example.com` |
| `STATIC_ROOT` | 否 | 自定义静态根，默认 monorepo 根（硬编码于 oss.js:108） |

---

## 6. API LearningState 快照（逻辑模型）

`PUT/GET /api/learning/state` 使用 normalize 后的快照（非原始 DB 行）。

典型结构（逻辑字段名，以 repository `stateFromRows` / openapi 为准）：

```text
{
  profile: { childName, childAge, mapMusic, autoPronunciation, showChineseHints, mapWorld, ... },
  progressByWorld: {
    ocean:  { completed: number[], unlockedThrough: number },
    desert: { ... },
    castle: { ... }
  },
  learningActivity: { dates: ['YYYY-MM-DD', ...] },
  mistakeBook: {
    items: [{ worldId, levelId, word, zhTitle, selected, correct, count }, ...]
  }
}
```

写入路径：

1. `learning.js` 校验 / 截断（如 selected/correct slice 0..40，**硬编码**）  
2. `normalizeLearningSnapshot` 统一边界  
3. InsForge upsert 多表 **或** MySQL 事务写 6 表相关行  

preferences 单独：`PATCH /api/learning/preferences` → profile 补丁。

---

## 7. 与 OpenAPI / JSON Schema 的 drift

| 项 | OpenAPI | 实现 | 文档决策 |
|----|---------|------|----------|
| mistake count 1..99 | ✓ | InsForge clamp；MySQL **已补** clampInteger 写路径 | 已对齐代码 |
| selected/correct maxLength 40 | openapi 可能缺 maxLength | learning.js slice(0,40)（硬编码） | **建议** contract 补 maxLength:40（未改 yaml，待确认） |
| Learning* JSON Schema 文件 | openapi 有 component | `packages/contracts/schemas/` 仍以 auth 为主 | **建议** 后续 generate 落盘，非本轮强改生成器 |
| auth MySQL 表 | ❌ 无 DDL | db.js 已有完整读写 | **必须**写 DDL 后才能上生产 |

---

## 8. 前端本地镜像

`script.js` localStorage keys（产品文档 02/06）：progress / preferences / activity / mistakes 等；登录后 `hydrateLearningStateFromBackend` + 异步 `saveLearningState`。  
**权威在服务端 normalize 之后**；冲突策略以当前 hydrate 实现为准（见 06）。

---

## 9. 禁止扩展字段（再强调）

未产品确认不得入库/进 API：生日、星级、耗时、尝试次数、提示使用、错音分类、VIP/SKUs 等。  
变更走 `04-deploy-ops.md` §5 SOP。
