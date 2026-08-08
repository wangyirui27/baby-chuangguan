# 开发人员交接：嗨洛塔 TestFlight 打包

更新：2026-08-08
仓库：`https://github.com/wangyirui27/baby-chuangguan` · 分支 `main`
产品名：**嗨洛塔** · Bundle ID：`com.baobaoenglish.island` · 版本 **1.0.1 (3)**

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
cd baby-chuangguan && git pull
# 本机完整 Xcode（非仅 CLT）
xcode-select -p   # 应含 Xcode.app
npm test          # 应 383 pass
node tools/audit-readiness.mjs   # testflightContentReady: true
bash tools/pack-app-www.sh /tmp/hirota-www-check
npm run testflight:preflight

# 一键（推荐）
# 会先自动跑 npm run testflight:preflight，再 Archive/Upload
DEVELOPMENT_TEAM=你的TeamID bash tools/ship-testflight.sh --upload
# 若 ASC 已有同版本 build，再临时递增：
# DEVELOPMENT_TEAM=你的TeamID BUILD_NUMBER=4 bash tools/ship-testflight.sh --upload

# 或 GUI
open ios/BabyEnglishIsland.xcodeproj
# Signing & Capabilities → Team
# Product → Archive → Distribute App → App Store Connect → Upload
```

`docs/testflight-github-actions-template.yml` 可由有 GitHub `workflow` 权限的同事复制到 `.github/workflows/testflight-preflight.yml`，在 `main` / PR 上跑同一套无凭据门禁。它不做 Archive / Upload，也不需要 Apple 密钥。

Build Phase 已调用 `tools/pack-app-www.sh`，Archive 时自动打 `www/`（约 382MB；含海岛+沙漠前 10 关 mp4、数学 story 31 条 mp4 + 31 条主题音 + `asset-packs.json`）。

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
| `tools/testflight-preflight.sh` | 无 Xcode 内容/壳门禁一键预检 |
| `tools/pack-app-www.sh` | 打运行时 www |
| `tools/audit-readiness.mjs` | TF 内容门禁：付费墙开关、版本、OSS 占位 URL、资源计数 |
| `tools/probe-asset-pack-urls.mjs` | 可选 OSS URL 抽检；默认 dry-run，不进默认预检 |
| `docs/testflight-github-actions-template.yml` | GitHub 无凭据预检模板；需有 `workflow` 权限的同事复制启用 |
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
| Build Phase 自动打约 382MB `www/` | `DEVELOPMENT_TEAM` 或本地 Signing 面板 |
| `asset-packs.json` OSS 真链 + 包内种子 | 可选 ASC API Key（只放本机/Secrets） |

1. Xcode → Settings → Accounts 登录付费 Apple Developer
2. Team ID → `DEVELOPMENT_TEAM` 环境变量、本地 ignored `Team.xcconfig`，或 Signing 面板
3. 无人值守上传：按 `docs/testflight-secrets.md` 配 ASC API Key；ASC Key 齐全时脚本默认允许自动管理签名，可用 `ALLOW_PROVISIONING_UPDATES=0` 关闭
4. ASC 若无 App：新建 iOS，Bundle `com.baobaoenglish.island`，名 **嗨洛塔**
5. 表单值按 `docs/testflight-asc-form.md`，不确定项留给产品/同事确认
6. 上传后处理 5–30 分钟 → 加内测组 / 外测合规

---

## 内容与网络

- **包内**：海岛 `assets/video/free-levels/level-01…10` + 沙漠 `assets/video/desert-levels/level-001…010` + 数学 `assets/video/math-story/*.mp4`（31 条）+ `assets/audio/math-story-theme/*.mp3`（31 条）
- **OSS**（需网络）：`https://baobao-chuangguan.oss-cn-shanghai.aliyuncs.com/assets/video/{desert|ocean}/…`；`asset-packs.json` 不应再出现 `cdn.example` / localhost 占位
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
- 设置/关于：版本 **1.0.1 (3)**（以实际上传 build 为准）
