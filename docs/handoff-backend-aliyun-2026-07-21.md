# 宝宝闯关后端阿里云架构交接

更新时间：2026-07-21

## 给接手模型的第一句话

这个项目正在把宝宝闯关的后端能力从“InsForge 为主”调整为“自有阿里云后端能力”：ECS 跑 Node/Express，RDS MySQL 存长期结构化数据，Redis 只做短期状态和缓存，OSS 只放大文件资源。

当前只完成了第一阶段：学习数据增加了 MySQL repository 适配层。默认后端仍是 InsForge，生产还没有切到 MySQL。

## 当前仓库状态

- 工作目录：`/Users/yr/宝宝闯关`
- 当前分支：`main`
- 远端：`https://github.com/wangyirui27/baby-chuangguan.git`
- 当前改动还没有提交 git。
- 工作区是脏的，除了这次后端架构改造，还有较多地图、前端、资源、OpenAPI 相关未提交改动。不要回滚不属于你任务的文件。

本项目当前真正运行的前端仍是根目录 H5：

- `index.html`
- `script.js`
- `style.css`
- `sw.js`
- `auth/apiClient.js`

不要误以为 `apps/frontend` 已经是独立前端主入口。这个仓库目前是目录上有前后端痕迹，但开发模式还没有彻底前后端分离。

## 用户目标

用户手上已有这些阿里云资源：

- ECS 服务器
- RDS MySQL
- OSS
- Redis

目标是让宝宝闯关后端按这些能力调整：

- ECS：运行 Node/Express 后端，提供静态 H5 和 `/api/*`
- RDS MySQL：作为长期事实源，存用户、session、验证码哈希、学习进度、错题、答题记录、反馈
- Redis：只做验证码冷却、IP 限流、session cache、短锁、热点状态缓存
- OSS：只放音频、视频、图片、地图素材、导出文件等大资源

关键原则：前端永远只调用项目自己的 `/api/*`，不能直连 RDS、Redis、OSS、InsForge、Supabase 或任何 BaaS SDK。

## 用户明确禁止

用户已经明确反感和禁止擅自加字段。不要新增这些字段或同类字段：

- 宝宝生日
- 每关星级
- 答题耗时
- 尝试次数
- 是否使用提示
- 错音分类
- 任何未确认的学习画像、统计、商业化、VIP、卡片销售字段

数据库字段或 schema 变更必须先列出：字段名、用途、为什么必须存、迁移方案、回滚方案，然后等用户确认。

## 已完成的后端改造

新增文件：

- `backend/src/mysql-learning-repository.js`
- `backend/src/mysql-learning-repository.test.js`
- `docs/backend-architecture.md`
- 本交接文档：`docs/handoff-backend-aliyun-2026-07-21.md`

修改文件：

- `AGENTS.md`
- `backend/.env.example`
- `backend/README.md`
- `backend/package.json`
- `backend/package-lock.json`
- `backend/src/insforge-learning-repository.js`
- `backend/src/learning.js`
- `backend/src/learning.test.js`

安装依赖：

- `mysql2`

## 当前代码行为

`backend/src/learning.js` 现在有默认 repository 工厂：

- 不设置 `LEARNING_REPOSITORY`：仍走 `InsForgeLearningRepository`
- 设置 `LEARNING_REPOSITORY=mysql`：走 `MysqlLearningRepository`

这意味着现在已经可以准备连接 RDS MySQL，但默认生产行为没有改变。

**外网 RDS 已连通**：主机名、凭证见 `.env.mysql.local`。库 `baobao_chuangguan`，6 张学习表已建好。

学习接口仍保持不变：

- `GET /api/learning/state`
- `PUT /api/learning/state`
- `PATCH /api/learning/preferences`
- `POST /api/learning/quiz-attempts`
- `POST /api/learning/support-feedback`

认证接口也保持不变：

- `POST /api/auth/send-code`
- `POST /api/auth/verify-code`
- `GET /api/auth/session`
- `POST /api/auth/logout`

## MySQL repository 当前假设的表

当前 MySQL repository 按现有 InsForge 学习表镜像实现，没有新增业务字段。

它会访问这些表：

- `baby_profiles`
- `baby_world_progress`
- `baby_learning_activity`
- `baby_mistakes`
- `baby_quiz_attempts`
- `baby_support_feedback`

当前代码期待的关键字段如下。

`baby_profiles`：

- `id`
- `local_user_id`
- `child_name`
- `child_age`
- `map_music`
- `auto_pronunciation`
- `show_chinese_hints`
- `map_world`

`baby_world_progress`：

- `profile_id`
- `world_id`
- `completed_levels`
- `unlocked_through`

`baby_learning_activity`：

- `profile_id`
- `activity_day`

`baby_mistakes`：

- `profile_id`
- `world_id`
- `level_id`
- `word`
- `zh_title`
- `selected`
- `correct`
- `mistake_count`
- `resolved_at`
- `updated_at`

`baby_quiz_attempts`：

- `profile_id`
- `world_id`
- `level_id`
- `selected`
- `correct`
- `is_correct`

`baby_support_feedback`：

- `profile_id`
- `message`
- `context`

还没有写正式 DDL/migration。正式执行前必须让用户确认。

## 环境变量

