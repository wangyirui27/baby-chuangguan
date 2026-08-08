# TestFlight 工程清单（助手已落地 vs 你侧）

更新：2026-08-08（iPad TF 最后准备 · OSS 课视频 + 沙漠种子 + 数学 story 进包）
工程：嗨洛塔 / Bundle `com.baobaoenglish.island` / 版本 **1.0.1 (3)**
仓库：`https://github.com/wangyirui27/baby-chuangguan` · 分支 `main`

## 一句话

**A 内容包 + B 原生壳骨架已齐**（`testflightContentReady=true`，`hardFailures=[]`，`npm test` 383 全绿，`pack-app-www` 含海岛+沙漠各前 10 关 + 数学 story 31 条；共享 xcscheme 已补）。
**本机无完整 Xcode → 不能本地 Archive**。
**C 苹果账号 / D 后台公网**仍是外部步骤。

---

## A 内容（本仓已绿）

| 检查 | 状态 |
|------|------|
| 200 关 + 前 10 关设定 | ✅ |
| 海岛 L1–10 包内视频 | ✅ workbench 定稿 |
| 沙漠 L1–10 包内视频 | ✅ 已进 `pack-app-www` + 仓 |
| 数学 story 31 条短片 | ✅ 已进 `pack-app-www` + 仓 |
| L11–200 课视频 | ✅ OSS 公网直链（`asset-packs.json`，非假 CDN） |
| 付费墙本地开关 | ✅ `TEMP_LOCAL_FULL_ACCESS=false`；TF file:// 壳不自动解锁 |
| RDS 474 BLOB 备份 | ✅ 仅备份，播放走 OSS |
| 品牌 嗨洛塔 / 禁英语岛开通VIP | ✅ |
| `npm test` | ✅ 383 pass |
| `node tools/audit-readiness.mjs` | ✅ `testflightContentReady=true` 且 `contentTestflightGaps=[]`；`uploadBlockers` 是 Xcode/Team |
| `npm run testflight:preflight` | ✅ 断言 Git 跟踪种子资源：海岛 10、沙漠 10、数学视频 31、数学主题音 31 |
| `npm run probe:asset-packs -- --dry-run` | ✅ 可选 OSS URL 抽检入口；默认不联网 |
| Build | **1.0.1 (3)** |

OSS 基址：`https://baobao-chuangguan.oss-cn-shanghai.aliyuncs.com`
前缀：`assets/video/desert|ocean/*`（匿名 GET 已通）

---

## B iOS 壳（本仓已齐 · Archive 需 Mac+Xcode）

| 项 | 状态 |
|----|------|
| 工程 `ios/BabyEnglishIsland.xcodeproj` | ✅ |
| AppIcon 1024 | ✅ |
| Launch（Info.plist `UILaunchScreen`） | ✅ |
| PrivacyInfo / 加密声明 | ✅ |
| 品牌显示名 嗨洛塔 | ✅ |
| Build Phase 调 `pack-app-www.sh` → bundle `www/` | ✅ |
| Shared scheme `BabyEnglishIsland.xcscheme` | ✅ |
| `ExportOptions-TestFlight.plist` | ✅（teamID 占位；ship 使用临时副本写入） |
| `tools/ship-testflight.sh` | ✅ check / archive / upload / open |
| `tools/testflight-preflight.sh` | ✅ 无 Xcode 内容/壳门禁一键预检 |
| GitHub Actions 预检 | ✅ `.github/workflows/testflight-preflight.yml` 已启用；只跑无凭据内容/壳门禁，不代表已 Archive/Upload |
| `docs/testflight-secrets.md` | ✅ Team ID / ASC API Key 环境变量契约 |
| AppIcon alpha | ✅ `AppIcon-1024.png` 已去 alpha；预检会拦截 alpha |
| `Team.xcconfig` DEVELOPMENT_TEAM | ⬜ 本地 ignored 文件或环境变量，需填 |
| 本机 Xcode.app | ⬜ 仅 Command Line Tools |

---

## C 苹果（你/开发者）

GitHub 接手验收口令：fresh clone 后先跑 `npm ci && npm ci --prefix backend && npm ci --prefix apps/backend && npm ci --prefix apps/frontend`，再跑 `npm run testflight:preflight`；随后用有 Xcode 的 Mac 执行 `DEVELOPMENT_TEAM=... bash tools/ship-testflight.sh --upload`。内容内测不要求 `apiBase`。

1. Apple Developer 登录 + Team ID
2. ASC 建 App：`com.baobaoenglish.island`，名 **嗨洛塔**
   - 表单草稿见 `docs/testflight-asc-form.md`
3. 有完整 Xcode 的 Mac：
   ```bash
   git pull
   DEVELOPMENT_TEAM=你的TeamID bash tools/ship-testflight.sh --upload
   # 若同版本 build 已上传过：
   DEVELOPMENT_TEAM=你的TeamID BUILD_NUMBER=4 bash tools/ship-testflight.sh --upload
   # 或 GUI：
   open ios/BabyEnglishIsland.xcodeproj
   # Signing 勾 Team → Product → Archive → App Store Connect Upload
   ```
4. TF 内测组 + 合规问卷 + 测试设备

---

## D 后台（可选分层）

| 模式 | apiBase | 能力 |
|------|---------|------|
| **内容内测（推荐先发）** | 空 | 显式 local mock 登录进入内容；离线海岛/沙漠前 10 + 数学 story 31 条；未授权 L11+ 留在付费墙；无云进度 |
| 全功能 TF | 生产 HTTPS 根（无尾斜杠） | 登录/学习进度；短信·IAP 另配 |

L11–200 的 OSS URL 已在清单中；真机要播放这些课视频，需要购买/恢复购买/VIP/内测授权后再测。

`ios/BabyEnglishIsland/shell-config.json` 当前 `apiBase=""` 且 `allowLocalMockLogin=true`，仅用于内容内测通过强制登录门，不授予 VIP。
**不要**把 `api.modelisms.com` 当嗨洛塔后端（那是影关）。

---

## 你只需拍板/动手

1. **现在就 Archive？** → 找有 Xcode 的人 pull `main` 后跑 `ship-testflight.sh --upload` 或 GUI Archive。
2. **要登录云进度？** → 给生产 `apiBase`（或确认暂空做内容内测）。
3. **Team ID** → 有了发我，或技术在本机用环境变量/ignored `ios/Config/Team.xcconfig`。

助手这边 **A 已推仓，B 骨架齐，不能代登苹果/代 Archive。**
