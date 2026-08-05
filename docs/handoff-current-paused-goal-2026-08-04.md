# 当前暂停目标交接文档

更新时间：2026-08-04

## 给接手模型的第一句话

当前线程没有登记中的 Codex goal 对象；本交接按 `/Users/yr/嗨洛塔少儿启蒙APP` 当前脏工作区、最近项目记忆、测试和本地浏览器冒烟结果整理。

暂停目标可以概括为：在现有根目录 H5 App 上继续做“数学地图/数学 AI 陪练 + 资源包下载/TestFlight 准备”的一批未提交改动。数学本地可玩骨架已经有了，发布级收口还没完成。

## 当前代码快照

- 分支：`main`
- 最近已推提交：`1727b0d feat: refresh desert curriculum and app polish`
- 当前工作区：未提交，改动很大
- 已修改文件：22 个，约 `6677` 行新增、`493` 行删除
- 主要修改面：
  - 根 H5：`index.html`、`script.js`、`style.css`、`sw.js`
  - 学习同步：`auth/apiClient.js`、`backend/src/learning.js`、两个 repository 和测试
  - iOS 壳：`ios/BabyEnglishIsland/AppDelegate.swift`、`ios/BabyEnglishIsland/ViewController.swift`
  - 打包/审计：`tools/pack-app-www.sh`、`tools/audit-readiness.mjs`
  - 新资源：`asset-packs.json`、`__level_loading_preview.html`、`assets/math-map/`、数学 BGM/SFX、loading Lottie 等

不要让接手模型先重构。第一步只做保护现场、跑测试、按切片收口。

## 想做什么

1. 数学地图进入现有 map 体系，不单开新页面。
2. 3-5 岁数学数感题可以在当前地图页内切换、答题、记录尝试。
3. 根据答题记录做本地自适应：连错降难度，连对升难度。
4. 加一个可替换的 math coach 接口，当前先用本地模板，后续再接真实 AI provider。
5. 学习记录支持跨设备同步，新增 `mathAttempts`。
6. 课程资源不要一次全塞包里，先做资源包/单关视频下载状态 UI 和 iOS bridge。
7. TestFlight 前能证明：本地首屏不白屏、前 10 关内置资源可用、后续资源下载路径明确、iOS 壳能编译并跑通下载。

## 已经做了什么

### 数学地图和本地玩法

- `script.js` 里新增 `buildMathLevels()`，生成 200 个数学关卡。
- 新增 `math`、`math58`、`math912` 等数学世界入口，其中后两者仍是后续占位。
- 数学题当前是苹果计数类：`mathChoiceCountsForLevel()`、`mathCountLabel()`、`buildMathVariant()`。
- 地图视觉改为数学桌面/学习材料风格，新增 `assets/math-map/props`、`covers`、`quiz` 下的手绘素材。
- UI 有数学关卡滚轮、当前页内答题面板、苹果落下动画和落盘音效。
- Playwright 冒烟加载 `http://127.0.0.1:4174/#map` 成功，无 console error/pageerror；证据图在 `screenshots/handoff-map-20260804.png`。

### 数学 AI/自适应

- 新增 `MATH_ATTEMPT_KEY`、`normalizeMathAttempts()`、`appendMathAttempt()`、`mergeMathAttempts()`。
- 新增 `adaptMathLevel()`、`generateMathVariant()`、`nextMathPathRecommendation()`、`buildMathParentReport()`。
- 前端会记录数学答题 attempt，并把 `mathAttempts` 放进学习导出/同步 payload。
- `auth/apiClient.js` 新增 mock `generateMathCoachPlan()`。
- `backend/src/learning.js` 新增 `POST /api/learning/math-coach`，默认 `localMathCoachPlan()`，可注入真实 provider。
- 现在还不是真 AI，只是 `local-template` 规则。

### 后端和数据

- InsForge/MySQL repository 都增加了 `math_attempts` 读写路径。
- 新增迁移草稿：
  - `migrations/20260804142000_add-math-worlds-to-learning-backend.sql`
  - `migrations/20260804150000_add-math-attempts-to-learning-profile.sql`
- 迁移作用：
  - world id 允许 `math`、`math58`、`math912`
  - `baby_profiles` 增加 `math_attempts JSONB`，限制最多 80 条
- 还没有证据证明迁移已经应用到线上/本地真实库。

### 资源包和加载 UI

- 新增 `asset-packs.json`，结构已经有 ocean/desert/castle，但 ocean/desert 的 `downloadUrl`、`levelVideoUrlTemplate`、`levels`、`sha256` 仍为空。
- H5 增加资源包状态 HUD、资源包弹窗、下载/暂停/恢复状态。
- 新增单关视频等待/下载 loading 视觉：`__level_loading_preview.html`、`assets/lottie/level-video-loading.json`。
- `sw.js` 加入数学素材、数学音频、loading Lottie、asset-packs manifest。

### iOS 原生壳

- `ViewController.swift` 新增 `AssetPackDownloadManager`，支持：
  - `URLSessionConfiguration.background`
  - 下载、暂停、恢复、取消
  - resume data
  - 单关队列
  - record 持久化
  - WebKit bridge 回传状态
- `AppDelegate.swift` 加了 background URLSession completion handler。
- `tools/pack-app-www.sh` 和 `native-shell.test.js` 已开始覆盖资源包 manifest/下载桥。
- 还没有当前机器上的 Xcode 编译通过证据，也没有真机/TestFlight 通过证据。

### 音频和素材

- 新增数学 BGM：`assets/audio/math-map-bgm.mp3`
- 新增数学苹果落下 SFX：`assets/audio/sfx/math-apple-drop-blop-soft-01.mp3`
- 新增全局按钮点击音：`assets/audio/sfx/ui-button-click.mp3`
- 替换了 `assets/audio/feedback-holly/correct.mp3`、`wrong.mp3`
- 反馈音频现在是固定 correct/wrong MP3，不会朗读动态 coach 文案。

## 当前验证结果

已通过：

```bash
git diff --check
npm run validate:contracts
```

本地浏览器冒烟：

```text
http://127.0.0.1:4174/#map
title: 嗨洛塔少儿启蒙APP
console/pageerror: none
screenshot: screenshots/handoff-map-20260804.png
```

未通过：

```bash
npm test
```

结果：`333 pass / 337 tests, 4 fail`

失败项：

1. `ambient-sfx.test.js:9` - `map randomly plays both ambient sounds over the original BGM`
   - 断言还要求 `tone(220, 0, 0.22, 'triangle', 0.07)`，但实现里 correct/wrong tone 已被废弃，改走 MP3/空函数。
2. `quiz.test.js:1179` - `math AI runtime is current-page local logic with no frontend AI secret`
   - 测试要求 `MATH_COACH_FEEDBACK_AUDIO_SRC[isCorrect ? 'correct' : 'wrong']`，实现已改成先 normalize kind 再索引。
3. `quiz.test.js:1493` - `tablet CSS contracts cover landscape, portrait, safe areas, and touch sizes`
   - 具体失败在 `quiz.test.js:1704`，测试还要求 `scrollerRect.height * 0.34`，实现已改成 `scrollerRect.height * 0.52`。
4. `quiz.test.js:2436` - `quiz and math AI feedback use local MP3 instead of Chinese system TTS`
   - 测试要求反馈音频 URL 是字面量字符串；实现改成 `FEEDBACK_AUDIO_VERSION` 模板字符串。

发布审计未通过：

```bash
npm run audit:readiness
```

输出要点：

- `missingQuestionAudio: 187`
- `missingFirstTenVideos: 0`
- `missingWordAudio: 0`
- `levelCount: 200`
- `nativeShellReady: false`
- `nativeBuildToolReady: false`
- `releaseReady: false`
- hard failure：缺少 187 个题目语音
- gaps：190 关没有课程视频；iOS 原生壳/内购/发版更新无法验证；当前 xcode-select 不能编译验证原生包

## 还剩什么没做

### P0 - 先恢复绿色基线

1. 决定测试契约是跟随新实现，还是恢复旧实现：
   - 如果正确方向是 MP3 反馈，就更新旧 `tone(220...)` 和字面量 URL 断言。
   - 如果需要动态 coach 文案朗读，就不要只放 correct/wrong 两个固定 MP3，需要另开 TTS/manifest 方案。
2. 修掉 4 个失败测试，让 `npm test` 变绿。
3. 把当前大脏工作区拆成可审的提交切片，至少分开：
   - 数学地图/数学 AI
   - 资源包下载 UI
   - iOS 下载桥
   - 音频/素材
   - 后端 migration

### P0 - 资源发布缺口

1. 生成或补齐 187 个题目语音，或调整发布审计口径。
2. 190 个非内置课程视频仍缺发布/下载源。
3. 给 `asset-packs.json` 填真实 CDN 信息：
   - `downloadUrl` 或 `levelVideoUrlTemplate`
   - `levels`
   - `totalBytes`
   - `sha256`
4. 证明 H5 里的 `sourceAvailable=false` 情况不会误导用户点下载。

### P0 - iOS/TestFlight 缺口

1. 把 `xcode-select` 指到完整 Xcode 后编译 iOS target。
2. 真机或模拟器验证 `babyIslandAssetPack` bridge：
   - list
   - start
   - pause
   - resume
   - cancel
   - background completion
   - 单关视频本地 URL 可被 H5 使用
3. 验证 `tools/pack-app-www.sh` 打出的 www 资源和 iOS 工程引用一致。
4. App Store Connect/TestFlight 状态需要重新查，不要按本地审计推断已经上线。

### P1 - 数学 AI 真能力

1. `localMathCoachPlan()` 只是规则模板，接手者不要宣称真 AI 已完成。
2. 真实 provider 应只在后端接入，前端继续只调 `/api/learning/math-coach`。
3. provider 失败必须回退 `localMathCoachPlan()`。
4. 需要给真实 provider 增加最小测试：输入 attempts，输出 `variantMode`、`feedbackText`、`recommendation`，不泄露密钥。

### P1 - DB/migration

1. 先确认用户是否同意新增 `math_attempts` 字段。
2. 分别验证 InsForge/Postgres 和 MySQL 的 schema：
   - world id check constraint
   - `math_attempts` 类型和 80 条上限
3. 登录后做一次真实同步：
   - 本地答题生成 attempt
   - 登录/刷新
   - 远端 state 回来后 merge 不丢
   - Mine/报告显示一致

### P1 - 视觉和产品验收

1. 数学地图只做了本地冒烟，没做 iPad 横竖屏完整视觉 QA。
2. 需要检查：
   - map world picker 是否符合儿童产品视觉
   - 数学滚轮是否好点、不会挡内容
   - 当前页内答题比例是否符合用户要求
   - loading Lottie 是否在真实弱网下载时出现
   - 音频是否会双播或抢 BGM
3. `math58`、`math912` 当前只是占位，不要并入本次收口。

## 剩余工作估算

按“让另一个模型继续开发到可提交、可验证”的标准：

| 范围 | 估算 | 说明 |
|---|---:|---|
| 最小 MVP 冻结 | 1-2 人天 | 修 4 个测试、确认数学本地可玩、写清楚不含真 AI/不含 TestFlight |
| 数学短中期收口 | 3-5 人天 | migration 验证、同步回归、反馈音频证据、math coach provider 壳 |
| TestFlight/资源包收口 | 4-8 人天 | iOS 编译真机、CDN manifest、下载桥、弱网/恢复/后台验证 |
| 完整 200 关资源可发布 | 取决于素材生产 | 当前审计显示 187 题目语音、190 视频缺口，属于内容生产主导，不是纯代码小尾巴 |

粗略判断：如果目标是“本地数学 MVP”，已经完成约 65%-75%；如果目标是“TestFlight 发布可用”，只完成约 35%-45%。

## 接手顺序

1. 先保存现场：`git status --short --branch`，不要 reset，不要批量格式化。
2. 跑：
   - `npm test`
   - `npm run audit:readiness`
   - `npm run validate:contracts`
3. 先修测试契约，让当前代码基线绿。
4. 切出数学 MVP 提交，不要把 iOS/资源包/小红书模板一起混进同一提交。
5. 确认 DB migration 是否允许执行。
6. 再做 iOS 编译和资源包真机下载验证。
7. 最后才考虑真实 AI provider 和 `math58`/`math912`。

## 关键文件索引

- 根 H5 主入口：`index.html`、`script.js`、`style.css`、`sw.js`
- 数学素材：`assets/math-map/`
- 资源包 manifest：`asset-packs.json`
- loading 预览：`__level_loading_preview.html`
- 学习 API client：`auth/apiClient.js`
- 学习后端：`backend/src/learning.js`
- InsForge repository：`backend/src/insforge-learning-repository.js`
- MySQL repository：`backend/src/mysql-learning-repository.js`
- iOS 壳：`ios/BabyEnglishIsland/ViewController.swift`
- 打包脚本：`tools/pack-app-www.sh`
- 发布审计：`tools/audit-readiness.mjs`
- 主测试：`quiz.test.js`、`ambient-sfx.test.js`、`native-shell.test.js`

## 不要做的事

- 不要把 `math58`、`math912` 当成本次必须完成。
- 不要在未确认 schema 前继续加学习画像字段。
- 不要在前端放任何 AI provider 密钥。
- 不要用源代码检查替代真机/TestFlight 证明。
- 不要回滚用户已有未提交改动。
