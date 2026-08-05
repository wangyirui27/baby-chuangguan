# 数学 3-5 岁 AI 学习能力交接文档

更新时间：2026-08-04（续作收口）

## 一句话目标

在嗨洛塔少儿启蒙 APP 的数学 3-5 岁地图里，分阶段做 AI 数学学习能力：

1. 短期：本地答题日志 + 自适应规则。
2. 中期：AI 题目变体 + 语音反馈接口。
3. 后期：家长报告、语音答题、个性化学习路径。
4. 最后：有可运行验证，不能只停在源码看起来完成。

## 当前进度判断（2026-08-04 收口）

| 阶段 | 当前状态 | 完成度 |
|---|---|---:|
| 短期：本地答题日志 | 本地 `mathAttempts`、80 条上限、localStorage、云端 merge、MySQL/InsForge 读写 | 100% |
| 短期：自适应规则 | 连错降级、连对升难度、继续路径推荐 | 100% |
| 中期：AI 题目变体 | `math-coach-ai.js` OpenAI-compatible 可选 provider；失败回退 `localMathCoachPlan` | 100% |
| 中期：语音反馈接口 | **故意 MVP**：本地 correct/wrong MP3；`feedbackText` 只上横幅，不用系统中文 TTS | 100% |
| 后期：家长报告 | Mine 页数学简报：题数/正确率/建议；E2E 已截到 | 100% |
| 后期：语音答题 | Web Speech 已接；无 API 时隐藏按钮 + `data-voice-available` | 95% |
| 后期：个性化路径 | 短窗 6 / 长窗 20 正确率 + `reasonText` 进家长报告 | 90% |
| 可运行验证 | `npm test` 全绿；`npm run e2e:math` Playwright 闭环通过 | 95% |

粗略估算：handoff 原定 MVP + 中期 AI 壳 + 可运行验证 ≈ **95%–100%**。

诚实缺口（不挡 MVP 验收）：

1. **活库 migration 未在本机真实 MySQL/InsForge 上执行**（本机无 `MYSQL_*` / InsForge 凭据）。SQL 文件 + repository 单测 + migration 结构测试已齐。
2. **真实 AI key 未现场打枪**（未配 `MATH_COACH_AI_API_KEY` / `OPENAI_API_KEY` 时走 local；单测覆盖 mock 成功与失败回退）。
3. **语音答题 iOS WKWebView 真机**未在本轮验（桌面 Chrome E2E 可见说答案按钮）。

## 本轮已完成

### P0

1. 修过期断言：`ambient-sfx` / `quiz`（feedback MP3、滚轮 0.52、弧系数、`speakMathVoiceFeedback` 签名）。
2. `npm test` 全绿（含 `math-coach-ai`、`math-migrations`、加强后的 MySQL mathAttempts load/save）。
3. Playwright 数学闭环：`tools/e2e-math-ai-smoke.mjs`
   - 登录 → 关更新弹窗 → 世界选择器切数学岛 → 地图内联 `.math-choice` 答错/答对 → coach/continue → Mine 数学简报
   - 截图：`screenshots/math-ai-smoke/`
4. MySQL repository：load 解析 `math_attempts`；save 事务内 `UPDATE ... math_attempts`；payload 断言 attemptId/levelId/isCorrect。
5. Migration 结构测试：math 世界 check + `math_attempts JSONB` + 数组长度 ≤80。

### P1

1. `backend/src/math-coach-ai.js`：OpenAI-compatible Chat Completions；同 plan shape；失败/未配置回退 local。
2. `backend/src/index.js` 挂载 provider + 启动日志 AI on/off。
3. `.env.example`：`MATH_COACH_AI_*` / `OPENAI_API_KEY`。
4. 语音反馈明确 Intentional MVP：本地 MP3 only。

### P2

1. 无 Web Speech 时隐藏语音按钮并写 `data-voice-available`。
2. `nextMathPathRecommendation` 短/长窗 + `reasonText`。

## 怎么跑

```bash
# 操作入口（中文路径经软链）
ln -sfn "/Users/yr/嗨洛塔少儿启蒙APP" /tmp/hirota-math-app
cd /tmp/hirota-math-app

npm test
npm run e2e:math

# 可选：开真实 AI（服务端）
# MATH_COACH_AI_API_KEY=... MATH_COACH_AI_BASE_URL=... MATH_COACH_AI_MODEL=...

# 可选：对活库执行 migration（InsForge/Postgres 风格 SQL）
# migrations/20260804142000_add-math-worlds-to-learning-backend.sql
# migrations/20260804150000_add-math-attempts-to-learning-profile.sql
```

## 已完成的具体内容（保留）

### 数学关卡和题型

- `script.js`：`buildMathLevels()` 200 关；3-5 岁数感/苹果计数。
- `math58` / `math912` 仅入口占位，不在本目标。

### 本地答题日志

- key：`baby-island-math-attempts-v1`，schema `1`，上限 80
- `normalizeMathAttempts` / `appendMathAttempt` / `mergeMathAttempts` / `recordLocalMathAttempt`

### 自适应规则

- `adaptMathLevel`：连错 2 → easier；连对 3 → harder
- `buildMathVariant` / `nextMathPathRecommendation`（含 reasonText）

### Math coach

- 前端：`requestMathCoachPlan` + local fallback
- 后端：`POST /api/learning/math-coach` + `createMathCoachProvider`（可选真 AI）
- **AI key 仅服务端**

### 语音反馈

- `speakMathVoiceFeedback` + `playMathCoachFeedbackTone` → 本地 correct/wrong MP3
- 文案只横幅展示

### 语音答题

- `parseMathVoiceTranscript` / `matchMathVoiceChoice`
- 无 SpeechRecognition 时隐藏按钮

### 家长报告

- `buildMathParentReport` + Mine「Mathcoach 数学陪练简报」

## 诚实剩余（非本 MVP 阻塞）

| 项 | 说明 |
|---|---|
| 活库 apply migration | 需运维/本机有 DB 凭据时执行两份 SQL |
| 真 AI 现场调用 | 配 key 后打一枪 `/api/learning/math-coach`，确认 provider≠local-template 且失败可回退 |
| 语音答题 iPad/WKWebView | 真机可用性；桌面已有 fallback 逻辑 |
| math58/math912 内容 | 另开 epic |

## 相关文件

- 主逻辑：`script.js`
- Client：`auth/apiClient.js`
- 后端：`backend/src/learning.js`、`backend/src/math-coach-ai.js`、`backend/src/index.js`
- 同步：`backend/src/insforge-learning-repository.js`、`backend/src/mysql-learning-repository.js`
- 测试：`quiz.test.js`、`backend/src/*.test.js`、`tools/e2e-math-ai-smoke.mjs`
- Migration：`migrations/20260804142000_*.sql`、`migrations/20260804150000_*.sql`
- 截图：`screenshots/math-ai-smoke/`

## 边界

- 不把资源包下载、iOS TestFlight、沙漠视频算进本目标。
- `math58` / `math912` 不开发。
- 前端不直连 AI、不放密钥。
- 不新增未确认的学习画像字段。
