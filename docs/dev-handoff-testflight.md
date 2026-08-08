# 开发人员交接：嗨洛塔 TestFlight 打包

更新：2026-08-08
仓库：`https://github.com/wangyirui27/baby-chuangguan` · 分支 `main`
产品名：**嗨洛塔** · Bundle ID：`com.baobaoenglish.island` · 版本 **1.0.1 (3)**

---

## 你要交付什么

| 交付 | 说明 |
|------|------|
| TestFlight 构建 | Archive → App Store Connect → 内测组可装 |
| 内容验收 | 海岛/沙漠 **前 10 关** + 数学 story **31 条**离线可玩；**L11+** 联网可播 OSS 课视频 |
| （可选）登录联调 | 仅当产品给了生产 `apiBase` |

---

## 5 分钟上手

```bash
git clone https://github.com/wangyirui27/baby-chuangguan.git
cd baby-chuangguan && git pull
# 本机完整 Xcode（非仅 CLT）
xcode-select -p   # 应含 Xcode.app
npm test          # 应 379 pass
node tools/audit-readiness.mjs   # testflightContentReady: true

# 一键（推荐）
DEVELOPMENT_TEAM=你的TeamID bash tools/ship-testflight.sh --upload

# 或 GUI
open ios/BabyEnglishIsland.xcodeproj
# Signing & Capabilities → Team
# Product → Archive → Distribute App → App Store Connect → Upload
```

Build Phase 已调用 `tools/pack-app-www.sh`，Archive 时自动打 `www/`（含海岛+沙漠前 10 关 mp4、数学 story 31 条 mp4 + `asset-packs.json`）。

---

## 关键文件

| 路径 | 作用 |
|------|------|
| `ios/BabyEnglishIsland.xcodeproj` | Xcode 工程 |
| `ios/Config/Team.xcconfig` | `DEVELOPMENT_TEAM=`（本地填，勿泄密） |
| `ios/Config/Shared.xcconfig` | 版本 1.0.1 / build 3 / Bundle ID |
| `ios/BabyEnglishIsland/shell-config.json` | `apiBase`（内容内测可空） |
| `ios/ExportOptions-TestFlight.plist` | TF 导出（teamID 由 ship 脚本写入） |
| `tools/ship-testflight.sh` | check / archive / upload / open |
| `tools/pack-app-www.sh` | 打运行时 www |
| `asset-packs.json` | L11–200 OSS URL |
| `docs/testflight-checklist.md` | A/B/C/D 门禁 |

---

## 签名与 ASC

1. Xcode → Settings → Accounts 登录付费 Apple Developer
2. Team ID → `DEVELOPMENT_TEAM` 或 Signing 面板
3. ASC 若无 App：新建 iOS，Bundle `com.baobaoenglish.island`，名 **嗨洛塔**
4. 上传后处理 5–30 分钟 → 加内测组 / 外测合规

---

## 内容与网络

- **包内**：海岛 `assets/video/free-levels/level-01…10` + 沙漠 `assets/video/desert-levels/level-001…010` + 数学 `assets/video/math-story/*.mp4`（31 条）
- **OSS**（需网络）：`https://baobao-chuangguan.oss-cn-shanghai.aliyuncs.com/assets/video/{desert|ocean}/…`
- **apiBase 空**：不阻塞内容内测；登录/云存进度不可用
- **禁止**把影关 `api.modelisms.com` 填进嗨洛塔 `apiBase`

---

## 本机环境说明（给协作）

交付机可能只有 Command Line Tools → **无法 Archive**。请用装了完整 Xcode 的 Mac 按上文发船。
内容门禁与 OSS 清单已在 `main` 推送完成。

---

## 验收口令

- 启动显示 **嗨洛塔**，不是英语岛
- 海岛 L1–10、沙漠 L1–10 无网可进课视频
- 数学地图 story 短片无网可播，不出现空播/fallback
- 开任意 L11+ 且有网：课视频从 OSS 加载可播
- 设置/关于：版本 **1.0.1 (3)**（以实际上传 build 为准）
