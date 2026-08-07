# TestFlight 工程清单（助手已落地 vs 你侧）

更新：2026-08-07（正式 TF 准备启动复验）  
工程：嗨洛塔 / Bundle `com.baobaoenglish.island` / 版本 **1.0.1 (2)**

## 一句话

**内容包 + 原生壳骨架已齐**（`testflightContentReady=true`，`hardFailures=[]`）。  
第一次内测还差你侧：**完整 Xcode、Apple 登录拉证书、Team ID、Archive 上传**。  
生产 `apiBase` HTTPS **强烈建议**（真登录/同步）；仅测壳+前 10 关本地内容时可暂空。  
ICP/全量 200 关视频/语音 **不挡** 第一次 TF。

### 一键脚本（装好 Xcode 后）

```bash
cd /tmp/baobao-chuangguan   # 或 嗨洛塔少儿启蒙APP
DEVELOPMENT_TEAM=你的TeamID bash tools/ship-testflight.sh --upload
# 或只打开工程手动 Archive：
bash tools/ship-testflight.sh --open
```

## 今日复验（本机）

| 检查 | 结果 |
|---|---|
| `node tools/audit-readiness.mjs` | `testflightContentReady=true` · `nativeShellReady=true` · `hardFailures=[]` |
| `npm test` | **374/374 全绿**（缓存戳对齐 `20260807-math-take-pool-no-blob-v1`） |
| `bash tools/pack-app-www.sh /tmp/hirota-www-check` | OK · **182M** · runtime asset gate OK |
| `xcode-select -p` | 仅 CommandLineTools → **不能 Archive** |
| `shell-config.json` `apiBase` | **空** |
| `Team.xcconfig` `DEVELOPMENT_TEAM` | **空** |
| 显示名 | `嗨洛塔` |
| 版本 | Marketing `1.0.1` / build `2` ≡ `app-release.json` |
| 后端本机 SMS | `SMS_PROVIDER=aliyun` 密钥已填（本机开发）；**生产域名仍未定** |

### audit gaps（不挡缩小 TF，但要心里有数）

1. 未装完整 Xcode / 未 `xcode-select` 到 Xcode.app  
2. `apiBase` 空  
3. Team ID 空  
4. 全量题语音仍缺 187（前 10 已齐）  
5. 190 关还没有课程视频（前 10 已齐）

---

## 已完成（工程 · 勿重复从零做）

| 项 | 路径 / 说明 |
|---|---|
| App Icon 1024 | `ios/BabyEnglishIsland/Assets.xcassets/AppIcon.appiconset/` |
| Launch 色 + Logo | `LaunchBackground` + `LaunchLogo`；`Info.plist` → `UILaunchScreen` |
| 显示名 | `CFBundleDisplayName` = **嗨洛塔** |
| 版本对齐 | Xcode `1.0.1` / build `2` ↔ `app-release.json` `1.0.1` |
| Privacy Manifest | `ios/BabyEnglishIsland/PrivacyInfo.xcprivacy` |
| API 注入骨架 | `shell-config.json` → 原生 `BABY_ISLAND_API_BASE` → `babyIslandApi.setApiBase` |
| H5 侧 | `auth/apiClient.js` 启动时读 `window.BABY_ISLAND_API_BASE` |
| Team 配置位 | `ios/Config/Team.xcconfig`（空）+ `.example` |
| Shared xcconfig | `ios/Config/Shared.xcconfig`（版本/Bundle） |
| ExportOptions | `ios/ExportOptions-TestFlight.plist`（上传前改 teamID） |
| 商店搜词 | `app-release.json` → 搜「嗨洛塔」 |
| IAP 对照表 | `docs/iap-product-ids.md` · 商品 `baby_island_map_vip_001` |
| 冒烟用例 | `docs/testflight-smoke.md` |
| 包体边界 | 非视频 runtime + L01–10 进包；drafts/raw 不进 |

---

## 你侧最短路径（TF 内测）

按顺序做，做完一项勾一项：

1. **装完整 Xcode**（App Store），然后：  
   `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`  
   `xcodebuild -version` 应打出版本号
2. **Apple Developer Program** + App Store Connect 建 App  
   - Bundle ID 确认：`com.baobaoenglish.island`  
   - 显示名：嗨洛塔
3. **Team ID** 写入：  
   - `ios/Config/Team.xcconfig` → `DEVELOPMENT_TEAM = XXXXXXXXXX`  
   - `ios/ExportOptions-TestFlight.plist` → `teamID`
4. **生产 API** 上 HTTPS 后写入：  
   - `ios/BabyEnglishIsland/shell-config.json` → `"apiBase": "https://你的域名"`（**无尾斜杠**）  
   - 线上 SMS：`SMS_PROVIDER=aliyun` + 影关同款 Dysms 签名/模板（本机 `.env` 已有密钥，生产机需同样配置）
5. （建议）隐私页挂公网 HTTPS：`/Users/yr/APP上架准备/hosted-legal-pages/`（品牌已嗨洛塔）
6. Xcode：打开 `ios/BabyEnglishIsland.xcodeproj` → Signing 自动 → **Product → Archive → Distribute → App Store Connect / TestFlight**
7. 内测组装机，按 `docs/testflight-smoke.md` 点：登录 → 英语前 10 → 数学小桌

> 把 **Team ID** 和 **apiBase 域名** 发给我，我可以代写进配置文件；Archive 仍须你本机有 Xcode。

---

## Archive 命令参考（有 Xcode + Team 后）

```bash
cd "/Users/yr/嗨洛塔少儿启蒙APP"
bash tools/pack-app-www.sh
cd ios
xcodebuild -project BabyEnglishIsland.xcodeproj \
  -scheme BabyEnglishIsland \
  -configuration Release \
  -archivePath build/BabyEnglishIsland.xcarchive \
  archive
xcodebuild -exportArchive \
  -archivePath build/BabyEnglishIsland.xcarchive \
  -exportPath build/export \
  -exportOptionsPlist ExportOptions-TestFlight.plist
```

上传可用 Transporter / Xcode Organizer / `xcrun altool`（需 ASC API Key）。

---

## 内测范围建议

- 登录 + **英语前 10 关** + **数学小桌**
- 不测全量 200 关视频/语音、不挡第一次 TF
- IAP：ASC 未建商品时可只测免费段

---

## 验收命令

```bash
npm test
node tools/audit-readiness.mjs
# 期望 hardFailures=[]；testflightContentReady=true
# gaps 可仍含 Xcode/Team/apiBase/全量素材
bash tools/pack-app-www.sh /tmp/hirota-www-check
```
