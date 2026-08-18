# 07 · 数据模型与 LearningState

> 项目根：`/Users/yr/嗨洛塔少儿启蒙APP`  
> 品牌：嗨洛塔 / HiRota · npm name=`baby-island-quest`  
> 证据源（只读）：`migrations/*.sql`、`backend/src/insforge-learning-repository.js`、`backend/src/mysql-learning-repository.js`、`backend/src/learning.js`、`backend/src/learning-repository-factory.js`、`backend/src/db.js`、`backend/src/auth.js`、`backend/src/entitlements.js`、`backend/src/me-router.js`、`backend/src/security.js`、`backend/src/index.js`、`data/*.json`、`packages/contracts/openapi/openapi.yaml`、`packages/contracts/schemas/*`、`script.js`、`auth/apiClient.js`、`graphify-out/README.md`  
> 重写：2026-08-13（对照当前 backend 源码；纠正旧稿根路径、world 枚举、Auth 切换条件、contracts drift）  
> Graphify 2026-08-13：286 files · 3462 nodes · 5743 edges · 240 communities

---

## 0. 30 秒结论

| 点 | 事实 | 源 |
|----|------|----|
| Learning 默认 | 有 `INSFORGE_URL`+`INSFORGE_SERVICE_KEY` → InsForge；显式 `LEARNING_REPOSITORY=mysql` 才 MySQL；否则 `none` | `learning-repository-factory.js:15-28` |
| 同步 API | `GET/PUT /api/learning/state`（**无** upsert 路由名） | `learning.js:151-168` · `index.js:114-118` |
| 快照权威 | 服务端 `normalizeLearningSnapshot` 之后 | `insforge-learning-repository.js:181-196` |
| Auth 默认 | 内存 Map + `data/users.json` 等；仅 `AUTH_REPOSITORY=mysql`（且有 `MYSQL_HOST`）才 RDS | `db.js:20-36` |
| Entitlements | **独立** JSON 账本，不进 Learning 表 | `entitlements.js` · `data/entitlements.json` |
| Contracts | OpenAPI **仅** auth/health；Learning 路径/Schema **未**落盘 | `packages/contracts/openapi/openapi.yaml:1-10,16-216` |

---

## 1. 存储分域

| 域 | 默认存储 | 切换 | 代码 |
|----|----------|------|------|
| Auth（user / session / verification） | 内存 `Map` + `data/{users,sessions,verifications}.json` | `AUTH_REPOSITORY=mysql` 或 `AUTH_BACKEND=mysql\|rds`，且 `MYSQL_HOST` 存在；`NODE_ENV=test` / `AUTH_FORCE_JSON=1` 强制 json | `db.js:19-36,311-350` |
| Learning | InsForge Postgres 集合（有凭据时） | `LEARNING_REPOSITORY` / `LEARNING_BACKEND` = `mysql\|rds` → MySQL；`none\|off\|disabled` → 不挂；未设且无 InsForge 凭据 → `none` | `learning-repository-factory.js:15-81` · `index.js:32,114-118` |
| VIP / 排行 | `data/entitlements.json` · `data/ranking-scores.json`（对象 map，**非**数组） | 无 DB 切换 | `entitlements.js:9-70` |
| IP 限流 | 进程内存 `Map<ip, timestamps[]>` | **无** Redis 路径（旧稿写 Redis 不实） | `security.js:10-78` · `learning.js:12` |
| 短信事件 / 内容目录 | `data/sms-events.json` · `data/content-catalog.json` | 本地文件 | `sms-events.js` · `content-catalog.js` |

**Auth 与 Learning 解耦（重要）**：`LEARNING_REPOSITORY=mysql` / `LEARNING_BACKEND=mysql` **都不会**隐式切 Auth。`db.js:30` 注释原文：`不要因 LEARNING_BACKEND=mysql 隐式改鉴权`；`resolveAuthRepository` 只读 `AUTH_REPOSITORY` / `AUTH_BACKEND`。旧 07 稿写「任一 repository=mysql 就切 Auth」已过时。

**InsForge 凭据字段 drift（已证实）**：

| 位置 | 读的 env / option |
|------|-------------------|
| factory 默认判定 + 构造参数 | `INSFORGE_SERVICE_KEY` → 传 `serviceKey` | `learning-repository-factory.js:27,70-72` |
| repository 实际用 | `options.apiKey` \|\| `INSFORGE_API_KEY` | `insforge-learning-repository.js:246-255` |
| `.env.example` | `INSFORGE_API_KEY` | `.env.example:54-55` |

→ factory 传入的 `serviceKey` **不会**被 repository 构造函数读取；未设 `INSFORGE_API_KEY` 时 client 会 `INSFORGE_NOT_CONFIGURED`。属实现缺口，本文只记录不改代码。

---

## 2. Learning 表 / 集合对照（InsForge = Postgres · MySQL 同名）

两边 repository 读写同一套逻辑表名；InsForge 用 `@insforge/sdk` admin client；MySQL 用 `mysql2` + 事务。数组类字段：Postgres=`INTEGER[]` / `JSONB`；MySQL 侧 progress `completed_levels`、`math_attempts` 以 **JSON 文本** 存（`mysql-learning-repository.js:59-68,246-251,239-240`）。

### 2.1 迁移序

| # | 文件 | 作用 |
|---|------|------|
| 1 | `migrations/20260720141941_create-learning-backend.sql` | 建 6 表 + RLS + `baby_profile_owned` |
| 2 | `migrations/20260720142634_harden-learning-backend.sql` | `completed_levels` 合法性；收回 support feedback UPDATE |
| 3 | `migrations/20260720223312_add-learning-report-metrics.sql` | 扩展 birth_date / level_stars / duration 等 |
| 4 | `migrations/20260720224601_rollback-learning-report-metrics.sql` | **回滚 3**（当前生产语义以回滚后为准） |
| 5 | `migrations/20260804142000_add-math-worlds-to-learning-backend.sql` | world 枚举加入 `math` / `math58` / `math912` |
| 6 | `migrations/20260804150000_add-math-attempts-to-learning-profile.sql` | `baby_profiles.math_attempts` JSONB ≤80 |

MySQL 运行时：`ensureSchema` 若缺 `math_attempts` 列会 `ALTER TABLE ... ADD COLUMN math_attempts JSON NULL`（`mysql-learning-repository.js:122-148`）。

### 2.2 `WORLD_IDS`（代码权威）

```text
ocean | desert | math | math58 | math912 | castle
```

源：`insforge-learning-repository.js:3`。  
DDL 初版仅 `ocean|desert|castle`；迁移 5 与代码对齐。非法 world → 归一为 `ocean`（`normalizeWorldId` L53-55）。

### 2.3 `baby_profiles`

| DB 列 | 约束（迁移/代码） | API / 快照字段 | 源 |
|-------|-------------------|----------------|----|
| `id` | UUID PK | 内部 profile id | create SQL L16-17 |
| `local_user_id` | UUID UNIQUE NOT NULL | = Express `user.id` | L18 · ensureProfile |
| `auth_user_id` | 可选 FK `auth.users` | 现多空；RLS 用 | L19 |
| `child_name` | 1..10，默认 `小禾` | `profile.childName` | L20 · toProfilePatch L64-65 |
| `child_age` | 3..6，默认 4 | `profile.childAge`（**出库变 string**） | L21 · stateFromRows L215 |
| `map_music` | bool 默认 true | `preferences.mapMusic` | L22 |
| `auto_pronunciation` | bool 默认 true | `preferences.autoPronunciation` | L23 |
| `show_chinese_hints` | bool 默认 true | `preferences.showChineseHints` | L24 |
| `map_world` | 见 WORLD_IDS，默认 ocean | `preferences.mapWorld` | 迁移 5 · L25 初版 |
| `math_attempts` | JSON 数组 ≤80 | `mathAttempts[]` | 迁移 6 · normalizeMathAttempts |
| `created_at` / `updated_at` | timestamptz + touch trigger | — | L26-32 |

MySQL `PROFILE_COLUMNS`：`mysql-learning-repository.js:12-22`（含 `math_attempts`，无 `auth_user_id` 读写）。

### 2.4 `baby_world_progress`

| 列 | 约束 | 快照 |
|----|------|------|
| `profile_id` + `world_id` | PK | `progressByWorld[worldId]` |
| `world_id` | WORLD_IDS | 键名 |
| `completed_levels` | int[] 去重、1..200、长度≤200 | `completed: number[]` |
| `unlocked_through` | 1..200 | `unlockedThrough` |
| timestamps | touch trigger | — |

normalize：`completed` 过滤非法 level；`unlockedThrough` clamp 1..200，且不低于 `max(completed)+1`（顶到 200）（`normalizeProgress` L84-97）。

### 2.5 `baby_learning_activity`

| 列 | 说明 |
|----|------|
| `profile_id` + `activity_day` | PK；`activity_day` = `YYYY-MM-DD` |
| 快照 | `learningActivity.dates: string[]` 去重排序 |

源：create SQL L51-56 · `normalizeLearningActivity` L106-114。

### 2.6 `baby_mistakes`

| 列 | 约束 | 快照 item |
|----|------|-----------|
| unique `(profile_id, world_id, level_id)` | 每关一条活跃语义 | key = `worldId:levelId` |
| `word` / `zh_title` / `selected` / `correct` | ≤40 字符 | camelCase 同名 |
| `mistake_count` | **1..99**（DDL CHECK + normalize clamp + MySQL 写路径再 clamp） | `count` |
| `resolved_at` | null=活跃；同步时不在 snapshot 的 key 会被 resolve | 出库只拉 `resolved_at IS NULL`，limit 50 |
| `updated_at` | | `updatedAt` |

源：create SQL L58-76 · `normalizeMistakeItems` L116-137 · MySQL clamp L313-314 · load limit L296-302 / L203-207。

**活跃条数上限**：normalize 后按 `updatedAt` 降序 **slice(0, 50)**。

### 2.7 `baby_quiz_attempts`（追加流水，不进 LearningState 快照）

| 列 | 校验入口 |
|----|----------|
| `world_id`, `level_id` 1..200 | `learning.js:validateQuizAttempt` L22-34 |
| `selected` / `correct` | trim + `slice(0,40)` |
| `is_correct` | `body.isCorrect === true` |
| `attempted_at` | DB default now |

API：`POST /api/learning/quiz-attempts` → 201 `{ id }`。

### 2.8 `baby_support_feedback`

| 列 | 约束 |
|----|------|
| `message` | 4..300（`validateFeedback` L36-44） |
| `context` | object → JSON/JSONB |
| `status` | open / reviewed / closed（默认 open；客户端创建不设） |

API：`POST /api/learning/support-feedback`。

### 2.9 已回滚、禁止再当正式字段

迁移 3 曾加、迁移 4 已删（**不得**再当 API/入库正式字段，除非新产品确认 + 新迁移）：

- `baby_profiles.birth_date`
- `baby_world_progress.level_stars`
- `baby_quiz_attempts.duration_ms` / `attempt_count` / `hint_used`
- `baby_mistakes.error_type`

---

## 3. LearningState 逻辑快照（API 契约）

### 3.1 路由

| 方法 | 路径 | 中间件 | 行为 | 源 |
|------|------|--------|------|----|
| GET | `/api/learning/state` | `requireAuth` | `repository.loadState` | `learning.js:151-157` |
| PUT | `/api/learning/state` | `requireAuth` + writeLimiter 180/15min | `normalizeLearningSnapshot` → `saveState` → 再 `loadState` 返回 | L159-168 |
| PATCH | `/api/learning/preferences` | 同上 | `toProfilePatch` → `savePreferences` | L170-179 |
| POST | `/api/learning/quiz-attempts` | 同上 | 追加 attempt | L181-191 |
| POST | `/api/learning/support-feedback` | 同上 | 追加 feedback | L193-203 |
| POST | `/api/learning/math-coach` | 同上 | **不落 Learning 表**；本地规则或可选 LLM | L205-215 |

客户端：`auth/apiClient.js` `loadLearningState` / `saveLearningState` → GET/PUT（L411-416）。

### 3.2 PUT 请求体 → normalize 输出形状

`normalizeSnapshot`（export 名 `normalizeLearningSnapshot`）L181-196：

```text
{
  profile: {                // DB snake 补丁子集
    child_name?, child_age?, map_music?, auto_pronunciation?,
    show_chinese_hints?, map_world?
  },
  progressByWorld: {
    ocean|desert|math|math58|math912|castle: {
      completed: number[],   // 1..200 去重升序
      unlockedThrough: number // 1..200，且 ≥ max(completed)+1
    }
  },
  learningActivity: { dates: ['YYYY-MM-DD', ...] },
  mistakeBook: {
    items: [{
      worldId, levelId, word, zhTitle, selected, correct,
      count,      // 1..99
      updatedAt   // 字符串，可空
    }]            // ≤50，按 updatedAt 降序
  },
  mathAttempts: [{            // ≤80，截尾
    attemptId,                // ≤80
    schemaVersion: 1,
    ts, worldId: 'math', levelId,
    skill,                    // ≤24，默认 count
    targetCount,              // 0..10
    selected, selectedCount,  // selected≤40; selectedCount 0..10 或 null
    correct,                  // ≤40
    isCorrect,                // 严格 === true
    mode: 'easier'|'same'|'harder',
    responseMs                // 0..600000 或 null
  }]
}
```

### 3.3 GET / save 后返回形状（`stateFromRows` L198-241）

与 PUT normalize **不完全同构**（出库拆 profile/preferences，childAge 为 string）：

```text
{
  profile: { childName, childAge /* string */ },
  preferences: { mapMusic, autoPronunciation, showChineseHints, mapWorld },
  progressByWorld: { ... 六世界，缺行则 {completed:[], unlockedThrough:1} },
  learningActivity: { dates },
  mistakeBook: { items: [{ levelId, worldId, word, zhTitle, selected, correct, count, updatedAt }] },
  mathAttempts: [...],
  syncedAt: ISO-8601
}
```

### 3.4 写入路径（两后端）

| 步骤 | InsForge | MySQL |
|------|----------|-------|
| normalize | 共用 `normalizeSnapshot` | 同 |
| profile | upsert `local_user_id` | INSERT … ON DUPLICATE KEY |
| math_attempts | `update` profile 列 | `UPDATE ... SET math_attempts=?` JSON 字符串 |
| progress | upsert 六行 `profile_id,world_id` | 六次 INSERT ON DUP |
| activity | upsert 日期行 | INSERT ON DUP |
| mistakes | 缺 key → `resolved_at=now`；其余 upsert count 等 | 同语义 + 写时 `clampInteger(count,1,99,1)` |
| 返回 | `loadState` | `loadState` |

InsForge：`saveState` L307-340 · `syncMistakes` L347-382。  
MySQL：`saveState` L234-268 · `syncMistakes` L275-318。

---

## 4. normalize / clamp 规则总表

实现核心：`insforge-learning-repository.js`；learning 路由对 quiz/feedback/math-coach 另有入口校验。

| 字段 | 规则 | 函数 / 行 |
|------|------|-----------|
| 整数 clamp | 非整数 → fallback；否则 `[min,max]` | `clampInteger` L41-45 |
| 整数 bounded | 非整数或不在区间 → null/丢弃 | `boundedInteger` L47-51 |
| 文本 | trim + 按 **码点** `Array.from` slice | `compactText` L57-59 |
| childName | ≤10；空则不进 patch | `toProfilePatch` L64-65 |
| childAge | 仅 3..6 整数才写入 | L67-68 |
| bool prefs | 仅 `typeof === 'boolean'` 才写 | L70-77 |
| mapWorld | 必须 ∈ WORLD_IDS | L79-80 |
| levelId | 1..200 | mistakes / math / quiz |
| unlockedThrough | clamp 1..200，再 max 到 progress 语义 | `normalizeProgress` L92-95 |
| activity date | 正则 `^\d{4}-\d{2}-\d{2}$` | L106-113 |
| mistake count | **clamp 1..99**，fallback 1 | L130；MySQL L314 |
| mistake 文本四字段 | ≤40 | L126-129 |
| mistake 条数 | dedupe by world:level 后 ≤50 | L134-136 |
| mathAttempts 条数 | 保留末尾 ≤80 | L139-178 · `MATH_ATTEMPT_LIMIT=80` |
| math target/selectedCount | 0..10 | L154-157 |
| math responseMs | round 后 0..600000 | L160-162 |
| math mode | 仅 easier/same/harder，否则 same | L159 |
| math worldId | 强制 `'math'` | L167 |
| quiz selected/correct | `String.trim().slice(0,40)`（路由层，非 compactText） | `learning.js:30-31` |
| feedback message | 4..300 | `learning.js:38-39` |
| write IP 限流 | 180 次 / 15 分钟 | `learning.js:12` |
| auth IP 限流 | 20 次 / 15 分钟 | `security.js:15,78` |

**clamp vs bounded**：mistake `count` 用 clamp（越界收束）；`levelId` 用 bounded（越界丢弃整条）。

---

## 5. Auth：`users.json` / sessions / verifications

### 5.1 默认 JSON 形态

路径：`/Users/yr/嗨洛塔少儿启蒙APP/data/`（`db.js` `DATA_DIR` = repo `data/`）。

**序列化**：`Map` → **JSON 数组**，元素须含 `id` 才能 load 回 Map（`loadMap` L272-288 · `saveMap` L296-305）。

#### `data/users.json`（样例结构与现网一致）

| 字段 | 类型 | 说明 | 源 |
|------|------|------|----|
| `id` | UUID | `crypto.randomUUID()` | `auth.js:430` · `db.js:165-170` |
| `normalizedPhone` | string | `+86` + 11 位；持久化可能已脱敏展示形态 | `normalizePhone` L232-240 · 样例 `data/users.json` |
| `status` | string | 创建 `'active'`；`'banned'` → 403 `USER_BANNED` | `auth.js:422-432` |
| `createdAt` | ISO 8601 | | |
| `lastLoginAt` | ISO 8601 | 每次登录更新 | |

JSDoc `UserRecord`（`db.js:165-170`）未列 `status`，但 **运行时写入并检查** `status`——以 `auth.js` 为准。

#### `data/sessions.json`

| 字段 | 说明 |
|------|------|
| `id` | = `tokenHash`（Map key） |
| `tokenHash` | raw token 的 SHA-256 hex |
| `userId` | → users.id |
| `createdAt` / `expiresAt` | 默认 **30 天**（`auth.js:88,442`） |
| `revoked` | bool；登出为 true |

#### `data/verifications.json`

| 字段 | 说明 |
|------|------|
| `id` | 常为 `phoneHash:codeHash` 组合键 |
| `phoneHash` | SHA-256(normalized phone) |
| `codeHash` | SHA-256(6 位码)；**不存明文** |
| `expiresAt` | **5 分钟**（`CODE_EXPIRY_MS`） |
| `attempts` | 失败次数，上限 **3** |
| `used` | 成功后消费 |
| `createdAt` | |

限流常量：`auth.js:82-89`（同号 60s 冷却；15 分钟最多 5 次发送）。

### 5.2 Auth MySQL 表（代码引用；**仓库内无 DDL 迁移文件**）

| 表 | 列（SELECT/INSERT） | 源 |
|----|---------------------|----|
| `baby_auth_users` | id, normalized_phone, created_at, last_login_at | `db.js:60,112-114` |
| `baby_auth_sessions` | token_hash, user_id, created_at, expires_at, revoked | L63,119-121 |
| `baby_auth_verifications` | id, phone_hash, code_hash, expires_at, attempts, used, created_at | L66,126-128 |

刷盘策略：内存为源；mysql 模式 `saveAllToMysql` **整表 DELETE 再 INSERT**（L102-137）——非逐行 upsert。本地 JSON 仍镜像一份（L326-331）。

**注意**：MySQL 路径 **未**持久化 `users.status` 列（表列清单无 status）。若生产依赖 ban，需另补 DDL/映射（当前缺口）。

### 5.3 对外 User DTO（session / verify-code）

`publicUser`（`auth.js:28-37`）：

| 字段 | 来源 |
|------|------|
| id, normalizedPhone, createdAt, lastLoginAt | user 行 |
| isLoggedIn | 恒 `true` |
| hasFullAccess | `entitlements.getVipEntitlement(id).vipActive === true` |

与 `packages/contracts/schemas/user.json` required 字段对齐；但 schema 描述仍写 hasFullAccess「Always false / Payment not yet implemented」——**与现网 VIP 账本不符**（drift，见 §8）。

---

## 6. Entitlements / 排行（非 Learning 域）

### 6.1 文件形态

`data/entitlements.json`：**对象**，key = `userId`（不是数组）。

| 字段 | 约束 | 源 |
|------|------|----|
| `vipActive` | bool | `activateVip` L85-102 |
| `source` | ≤40，默认 `iap` | |
| `productId` | ≤80，默认 `vip_map_unlock` | |
| `receiptHash` | 收据 SHA-256 或 null（不落明文长收据） | L93-95 |
| `platform` | ≤20 | |
| `createdAt` / `updatedAt` | ISO | |
| `revokedAt` | 仅 deactivate 时 | L112-127 |

API：

| 方法 | 路径 | 响应要点 | 源 |
|------|------|----------|----|
| GET | `/api/me/entitlements` | `{ hasFullAccess, vip }` | `me-router.js:19-25` |
| POST | `/api/me/entitlements/vip` | 激活并返回同上 | L31-49 |
| POST | `/api/me/ranking` | upsert 分数 | L52-59 |
| GET | `/api/rankings` | 公开榜，无手机号 | L68-75 |

### 6.2 `data/ranking-scores.json`

key = userId；字段：`userId, childName(≤10), displayName(脱敏), starsAll, stars7d, updatedAt`。  
分数 clamp 0..999999（`entitlements.js:173-174`）。

---

## 7. 前端本地镜像（script.js）

生产入口：`index.html` + `script.js` + `style.css`。

| localStorage key | 内容 | 是否进 PUT /state |
|------------------|------|-------------------|
| `baby-island-preview-progress-v1` | progressByWorld | 是 |
| `baby-island-learning-activity-v1` | dates | 是 |
| `baby-island-app-preferences-v1` | prefs + child 档案字段 | 是（profile/preferences） |
| `baby-island-mistake-book-v1` | mistakeBook | 是 |
| `baby-island-math-attempts-v1` | mathAttempts | 是 |
| `baby-island-english-attempts-v1` | englishAttempts | **否**（仅本地；snapshot 带但服务端 normalize 丢弃） |
| `baby-island-math-story-cleared-v1` | mathStoryCleared | **否**（同上） |
| `baby-island-asset-packs-v1` 等 | 资源缓存 | 否 |

源：`script.js` keys ~L116-139, 3078-3082；`learningSnapshot` L3198-3213；`persistLearningStateLocal` L3216-3223；云合并 `mergeLearningStateFromCloud` / `hydrateLearningStateFromBackend` ~L3447+。

**权威**：登录后服务端 normalize 回写；冲突策略见 06 前端文档（本地并集 completed 等，以 script 实现为准）。

---

## 8. 与 contracts 的关系与 drift

| 项 | contracts | 实现 | 结论 |
|----|-----------|------|------|
| OpenAPI paths | 仅 `/api/health` + `/api/auth/*` | 另有 `/api/learning/*`、`/api/me/*`、`/api/rankings`、`/api/admin` | **OpenAPI 滞后**；`openapi.yaml:5-10` 仍写 progress「NOT backend endpoints」 |
| `x-clientData.progress` | 称无后端 | 已有 GET/PUT state | 文档谎言，以 backend 为准 |
| JSON Schema 目录 | 10 个 auth/health 相关 | **无** Learning* schema 文件 | Learning 以 repository normalize + 本文件字段表为准 |
| `user.hasFullAccess` 描述 | schema/OpenAPI 写 always false | entitlements VIP 驱动 | 描述过时 |
| mistake count 1..99 | 无 OpenAPI Learning 组件可对 | DDL + normalize + MySQL 写路径一致 | 实现内对齐 |
| selected/correct max 40 | 无 Learning contract | learning.js slice / compactText | 实现硬编码 |
| Auth MySQL DDL | 无 | db.js 读写三表 | **缺迁移文件**，不能假装已有 |

packages 边界：`packages/contracts` 服务 **auth 冻结契约**；Learning 真源 = `backend/src/*learning*` + `migrations/`。变更 Learning 字段须同步：迁移 → normalize →（可选）补 OpenAPI/Schema → 本 07 文档。

---

## 9. 禁止扩展字段（再强调）

未产品确认 **不得** 入库 / 进 LearningState API：

- 生日、星级地图、单题耗时、提示使用、错音分类（迁移 3 已回滚先例）
- VIP/SKU 细节进 Learning 表（VIP 只走 entitlements）
- englishAttempts / mathStoryCleared 服务端化（现仅 localStorage）

变更流程：产品确认 → 迁移 → normalize/clamp → API → 文档（见 `04-deploy-ops.md` 运维约定）。

---

## 10. 证据索引（绝对路径）

| 主题 | 路径 |
|------|------|
| Learning normalize / InsForge IO | `/Users/yr/嗨洛塔少儿启蒙APP/backend/src/insforge-learning-repository.js` |
| MySQL IO + mistake clamp | `/Users/yr/嗨洛塔少儿启蒙APP/backend/src/mysql-learning-repository.js` |
| HTTP 路由 / 限流 | `/Users/yr/嗨洛塔少儿启蒙APP/backend/src/learning.js` |
| 仓库选择 | `/Users/yr/嗨洛塔少儿启蒙APP/backend/src/learning-repository-factory.js` |
| 挂载 | `/Users/yr/嗨洛塔少儿启蒙APP/backend/src/index.js` |
| Auth Map + JSON/MySQL | `/Users/yr/嗨洛塔少儿启蒙APP/backend/src/db.js` |
| 登录 / publicUser / RATE_LIMIT | `/Users/yr/嗨洛塔少儿启蒙APP/backend/src/auth.js` |
| VIP 账本 | `/Users/yr/嗨洛塔少儿启蒙APP/backend/src/entitlements.js` |
| me API | `/Users/yr/嗨洛塔少儿启蒙APP/backend/src/me-router.js` |
| IP 限流 | `/Users/yr/嗨洛塔少儿启蒙APP/backend/src/security.js` |
| 迁移 | `/Users/yr/嗨洛塔少儿启蒙APP/migrations/` |
| 样例数据 | `/Users/yr/嗨洛塔少儿启蒙APP/data/users.json` 等 |
| OpenAPI | `/Users/yr/嗨洛塔少儿启蒙APP/packages/contracts/openapi/openapi.yaml` |
| 前端 snapshot | `/Users/yr/嗨洛塔少儿启蒙APP/script.js`（learningSnapshot 段） |
| 客户端 API | `/Users/yr/嗨洛塔少儿启蒙APP/auth/apiClient.js` |
| Graphify | `/Users/yr/嗨洛塔少儿启蒙APP/graphify-out/README.md` |

---

## 11. 本轮相对旧 07 的纠偏清单

| 旧稿 | 现网 |
|------|------|
| 根路径写成旧目录名（宝宝闯关 绝对路径） | 现根：`/Users/yr/嗨洛塔少儿启蒙APP` |
| world 仅 ocean/desert/castle | + math/math58/math912；`math_attempts` 列 |
| Auth 随 LEARNING=mysql 切换 | **否**；仅 `AUTH_REPOSITORY` |
| security.js Redis | **无**；纯内存 |
| OpenAPI 已有 Learning components | **无**；仅 auth/health + 过时 x-clientData |
| LearningState 无 mathAttempts | 有，≤80 |
| users 无 status | 运行时有 status；MySQL 列未映射 |
