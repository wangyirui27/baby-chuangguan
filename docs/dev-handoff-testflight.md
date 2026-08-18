# 开发人员交接：嗨洛塔 TestFlight 打包

更新：2026-08-08
仓库：`https://github.com/wangyirui27/baby-chuangguan` · 分支 `main`
产品名：**嗨洛塔** · Bundle ID：`com.modelisms.kids` · 版本 **1.0.1 (6)**

---

## 你要交付什么

| 交付 | 说明 |
|------|------|
| TestFlight 构建 | Archive → App Store Connect → 内测组可装 |
| 内容验收 | 海岛/沙漠 **前 10 关** + 数学 story **31 条视频与 31 条主题音**离线可玩；购买/VIP/内测授权后 **L11+** 联网可播 OSS 课视频 |
| （可选）登录联调 | 内容内测走显式 local mock 登录；生产登录仅当产品给了生产 `apiBase` |

---

## 5 分钟上手

```bash
git clone https://github.com/wangyirui27/baby-chuangguan.git
cd baby-chuangguan
git fetch --all --tags
git checkout <verified_commit>   # 与 handoff issue / TESTFLIGHT_HANDOFF_CARD 同 SHA，禁止盲 pull 最新 main
npm ci
npm ci --prefix backend
npm ci --prefix apps/backend
npm ci --prefix apps/frontend
# 本机完整 Xcode（非仅 CLT）
xcode-select -p   # 应含 Xcode.app
npm test          # 应 383 pass
node tools/audit-readiness.mjs   # testflightContentReady: true；contentTestflightGaps: []
bash tools/ship-testflight.sh --static-check   # 无 Xcode 静态检查：Bundle/版本/ExportOptions/签名模板
bash tools/pack-app-www.sh /tmp/hirota-www-check
npm run testflight:preflight
npm run testflight:verify-handoff   # 可选：从已提交 HEAD 干净克隆后重跑完整预检

# 一键（推荐）
# 会先自动跑 npm run testflight:preflight，再 Archive/Upload
DEVELOPMENT_TEAM=你的TeamID ALLOW_PROVISIONING_UPDATES=1 bash tools/ship-testflight.sh --upload
# 若 ASC 已有同版本 build，把 <next-build> 设为高于 ASC 已有构建号的正整数：
# DEVELOPMENT_TEAM=你的TeamID ALLOW_PROVISIONING_UPDATES=1 BUILD_NUMBER=<next-build> bash tools/ship-testflight.sh --upload

# 或 GUI
open ios/BabyEnglishIsland.xcodeproj
# Signing & Capabilities → Team
# Product → Archive → Distribute App → App Store Connect → Upload
```

`.github/workflows/testflight-preflight.yml` 已启用无凭据门禁，在 `main` / PR 上跑同一套预检。它不做 Archive / Upload，也不需要 Apple 密钥。
`docs/testflight-github-actions-template.yml` 保留为源模板；需要重建时运行 `bash tools/enable-testflight-workflow.sh`。提交 workflow 文件仍需要 GitHub 凭据带 `workflow` scope。
GitHub 新建 Issue 时可选择 `TestFlight upload handoff` 模板，把 commit、Actions 绿勾、上传结果和真机冒烟逐项勾掉；不要把 Apple 凭据、Team ID、证书或 `.p8` 内容写进 Issue。

Build Phase 已调用 `tools/pack-app-www.sh`，Archive 时自动打 `www/`（干净克隆预检约 364M / 361.1MiB；脏工作区带未跟踪 QA 资源时可能更大；含海岛+沙漠前 10 关 mp4、数学 story 31 条 mp4 + 31 条主题音 + `asset-packs.json`）。数学 story 是包内离线资源，不走 `asset-packs.json` / OSS；OSS 只覆盖海岛/沙漠 L11–200。`npm run testflight:preflight` 也会检查这些种子资源已被 Git 跟踪，并通过 `tools/assert-testflight-bundle-media.mjs` 拦截 LFS pointer、错误 mp4/mp3 magic 和异常 `www` 体积，避免“本机有、clone 后没有”或坏媒体进 IPA。
预检成功会打印 `TESTFLIGHT_HANDOFF_CARD`；GitHub Actions Summary 会列出 commit、run、版本、Bundle ID，并上传 `testflight-readiness-<sha>` JSON artifact。artifact 内的 `handoffCard` 可直接复制到 handoff issue，`handoffIssue` 可直接拿来填标题、模板、run、artifact、命令、门禁清单和密钥边界。提取路径：Actions 绿 run → Artifacts → 下载 `testflight-readiness-<sha>`；或 `gh run download <run_id> -n testflight-readiness-<sha>` 后执行 `node -e "const r=require('./testflight-readiness.json'); console.log(r.handoffCard); console.log(JSON.stringify(r.handoffIssue,null,2))"`。
如果要验证远端仓库固定提交，运行：`HANDOFF_CLONE_SOURCE=https://github.com/wangyirui27/baby-chuangguan.git HANDOFF_EXPECTED_SHA=<verified_commit> npm run testflight:verify-handoff`。

---

## 关键文件

| 路径 | 作用 |
|------|------|
| `ios/BabyEnglishIsland.xcodeproj` | Xcode 工程 |
| `ios/BabyEnglishIsland.xcodeproj/xcshareddata/xcschemes/BabyEnglishIsland.xcscheme` | 共享 scheme，CLI / CI 可识别 |
| `ios/Config/Team.xcconfig.example` | 本地复制为 ignored 的 `Team.xcconfig` 后填 Team ID |
| `ios/Config/Shared.xcconfig` | 版本 1.0.1 / build 3 / Bundle ID |
| `ios/BabyEnglishIsland/shell-config.json` | `apiBase`（内容内测可空）+ `allowLocalMockLogin`（内容内测显式 mock 登录） |
| `ios/ExportOptions-TestFlight.plist` | TF 导出模板（ship 脚本生成临时带 teamID 的副本） |
| `tools/ship-testflight.sh` | check / archive / upload / open |
| `tools/assert-ios-archive-contract.mjs` | 无 Xcode 静态校验 Bundle、版本、scheme、ExportOptions、Build Phase |
| `tools/testflight-preflight.sh` | 无 Xcode 内容/壳门禁一键预检；含关键视频/主题音 Git 跟踪计数 |
| `tools/assert-testflight-bundle-media.mjs` | pack 后 `www/` 媒体完整性门禁：LFS pointer、mp4/mp3 magic、体积区间 |
| `tools/verify-testflight-handoff.sh` | 从已提交 HEAD 干净克隆、重装依赖并跑完整 TF 预检 |
| `tools/scan-no-apple-secrets.sh` | 防止误提交 Team ID、`.p8`、证书、provisioning profile、IPA |
| `tools/enable-testflight-workflow.sh` | 从模板重建 `.github/workflows/testflight-preflight.yml`；提交需 workflow scope |
| `tools/pack-app-www.sh` | 打运行时 www |
| `tools/audit-readiness.mjs` | TF 内容门禁：付费墙开关、版本、OSS 占位 URL、资源计数 |
| `tools/probe-asset-pack-urls.mjs` | 可选 OSS URL 抽检；默认 dry-run，不进默认预检 |
| `.github/workflows/testflight-preflight.yml` | 已启用的 GitHub 无凭据预检；push / PR 触发 |
| `.github/ISSUE_TEMPLATE/testflight-handoff.yml` | 技术同事接手 Archive / Upload / TestFlight 冒烟的 issue 表单 |
| `docs/testflight-github-actions-template.yml` | GitHub 无凭据预检源模板 |
| `asset-packs.json` | L11–200 OSS URL |
| `docs/testflight-checklist.md` | A/B/C/D 门禁 |
| `docs/testflight-secrets.md` | Team ID / ASC API Key 环境变量契约 |
| `docs/testflight-asc-form.md` | ASC 新建 App / TestFlight 表单草稿 |

---

## 签名与 ASC

### 仓内已有 / 同事自带

| 仓内已有 | 同事自带 |
|----------|----------|
| `npm run testflight:preflight` 内容/壳预检 | 完整 Xcode（非 Command Line Tools） |
| 共享 scheme、ExportOptions 模板、Archive 脚本 | 付费 Apple Developer Team |
| Build Phase 自动打约 364M / 361.1MiB `www`（干净克隆） | `DEVELOPMENT_TEAM` 或本地 Signing 面板 |
| `asset-packs.json` OSS 真链 + 包内种子 | 可选 ASC API Key（只放本机/Secrets） |

1. Xcode → Settings → Accounts 登录付费 Apple Developer
2. Team ID → `DEVELOPMENT_TEAM` 环境变量、本地 ignored `Team.xcconfig`，或 Signing 面板
3. 无人值守上传：按 `docs/testflight-secrets.md` 配 ASC API Key；ASC Key 齐全时脚本默认允许自动管理签名，可用 `ALLOW_PROVISIONING_UPDATES=0` 关闭。若不配 ASC Key、只靠 Xcode 登录态自动拉证书/profile，上传命令显式加 `ALLOW_PROVISIONING_UPDATES=1`
   - 本仓 Actions 不做 Upload，不需要配置 Apple / ASC / Team Secrets；这些值只放同事本机或其自有私密 CI。
4. ASC 若无 App：新建 iOS，Bundle `com.modelisms.kids`，名 **嗨洛塔**
5. 表单值按 `docs/testflight-asc-form.md`，不确定项留给产品/同事确认
6. 上传后处理 5–30 分钟 → 加内测组 / 外测合规

---

## 内容与网络

- **包内**：海岛 `assets/video/free-levels/level-01…10` + 沙漠 `assets/video/desert-levels/level-001…010` + 数学 `assets/video/math-story/*.mp4`（31 条）+ `assets/audio/math-story-theme/*.mp3`（31 条）；数学 story 不需要上传 OSS
- **OSS**（需网络）：`https://baobao-chuangguan.oss-cn-shanghai.aliyuncs.com/assets/video/{desert|ocean}/…`；仅覆盖海岛/沙漠 L11–200，`asset-packs.json` 不应再出现 `cdn.example` / localhost 占位
- 可选抽检：`npm run probe:asset-packs -- --dry-run` 只列出样本；`npm run probe:asset-packs -- --live` 才发起 HEAD / Range 请求
- **付费墙**：`TEMP_LOCAL_FULL_ACCESS=false`；TestFlight file:// / capacitor 壳不应自动解锁 11 关以后
- **apiBase 空**：不阻塞内容内测；`allowLocalMockLogin=true` 时可填任意 11 位手机号 + 4–6 位验证码进入内容，但不授予 VIP、不代表生产短信登录
- **禁止**把影关 `api.modelisms.com` 填进嗨洛塔 `apiBase`
- **禁止提交**真实 `ios/Config/Team.xcconfig`、`.p8`、`.env`，也不要把真 Team ID 写进 `ExportOptions-TestFlight.plist` 模板

---

## 本机环境说明（给协作）

交付机可能只有 Command Line Tools → **无法 Archive**。请用装了完整 Xcode 的 Mac 按上文发船。
内容门禁与 OSS 清单已在 `main` 推送完成。

---

## 验收口令

- 启动显示 **嗨洛塔**，不是英语岛
- 海岛 L1–10、沙漠 L1–10 无网可进课视频
- 数学地图 story 短片与主题音无网可播，不出现空播/fallback
- 未购买/未授权时 L11+ 不被本地壳放行；购买/VIP/内测授权后 L11+ 有网从 OSS 加载可播
- 设置/关于：版本 **1.0.1 (6)**（以实际上传 build 为准）
