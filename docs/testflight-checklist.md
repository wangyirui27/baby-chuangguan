# TestFlight 工程清单（助手已落地 vs 你侧）

更新：2026-08-07（iPad TF 最后准备 · OSS 课视频 + 沙漠种子进包）  
工程：嗨洛塔 / Bundle `com.baobaoenglish.island` / 版本 **1.0.1 (3)**

## 一句话

**A 内容包 + B 原生壳骨架已齐**（`testflightContentReady=true`，`hardFailures=[]`）。  
第一次内测还差你侧：**完整 Xcode、Apple 登录拉证书、Team ID、Archive 上传**。  
生产 `apiBase` HTTPS **强烈建议**（真登录/同步）；仅测壳+前 10 关本地内容时可暂空。  
ICP **不挡** 第一次 TF。

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
| `npm test` | **379/379 全绿** |
| `bash tools/pack-app-www.sh /tmp/hirota-www-check` | OK · ocean L01–10 + **desert L001–010** 进包 · runtime gate OK |
| OSS 课视频 L11–200 | desert **200** + ocean **200** 公网可 HEAD；`asset-packs.json` 真实 URL |
| `xcode-select -p` | 仅 CommandLineTools → **不能 Archive** |
| `shell-config.json` `apiBase` | **空** |
| `Team.xcconfig` `DEVELOPMENT_TEAM` | **空** |
| 显示名 | `嗨洛塔` |
| 版本 | Marketing `1.0.1` / build `3` ≡ `app-release.json` |

### audit gaps（不挡缩小 TF）

1. 未装完整 Xcode / 未 `xcode-select` 到 Xcode.app  
2. `apiBase` 空  
3. Team ID 空  
4. 全量题语音仍缺 187（前 10 已齐）  
5. ~~190 关无课视频~~ → **已改为 OSS 清单覆盖**（L11–200 走下载）

---

## 已完成（工程 · 勿重复从零做）

| 项 | 路径 / 说明 |
|---|---|
| App Icon 1024 | `ios/BabyEnglishIsland/Assets.xcassets/AppIcon.appiconset/` |
| Launch 色 + Logo | `LaunchBackground` + `LaunchLogo`；`Info.plist` → `UILaunchScreen` |
| 显示名 | `CFBundleDisplayName` = **嗨洛塔** |
| 版本对齐 | Xcode `1.0.1` / build `3` ↔ `app-release.json` `1.0.1` |
| Privacy Manifest | `ios/BabyEnglishIsland/PrivacyInfo.xcprivacy` |
| API 注入骨架 | `shell-config.json` → 原生 `BABY_ISLAND_API_BASE` → `babyIslandApi.setApiBase` |
| H5 侧 | `auth/apiClient.js` 启动时读 `window.BABY_ISLAND_API_BASE` |
| Team 配置位 | `ios/Config/Team.xcconfig`（空）+ `.example` |
| Shared xcconfig | `ios/Config/Shared.xcconfig`（版本/Bundle） |
| ExportOptions | `ios/ExportOptions-TestFlight.plist`（上传前改 teamID） |
| 商店搜词 | `app-release.json` → 搜「嗨洛塔」 |
| IAP 对照表 | `docs/iap-product-ids.md` · 商品 `baby_island_map_vip_001` |
| 冒烟用例 | `docs/testflight-smoke.md` |
| 包体边界 | 非视频 runtime + **海岛 L01–10 + 沙漠 L001–010** 进包；L11+ OSS |
| OSS 课视频 | `backend/scripts/upload_course_videos_to_oss.py`；基址见 `asset-packs.json` |
| 开发交接 | `docs/dev-handoff-testflight.md` |

---

## 你侧最短路径（TF 内测）

1. **装完整 Xcode**（App Store），然后：  
   `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`  
   `xcodebuild -version` 应打出版本号
2. **Apple Developer Program** + App Store Connect 建 App  
   - Bundle ID：`com.baobaoenglish.island`  
   - 显示名：嗨洛塔
3. **Team ID** 写入：  
   - `ios/Config/Team.xcconfig` → `DEVELOPMENT_TEAM = XXXXXXXXXX`  
   - `ios/ExportOptions-TestFlight.plist` → `teamID`  
   - 或：`DEVELOPMENT_TEAM=XXX bash tools/ship-testflight.sh --upload`
4. **生产 API** 上 HTTPS 后写入：  
   - `ios/BabyEnglishIsland/shell-config.json` → `"apiBase": "https://你的域名"`（**无尾斜杠**）  
5. （建议）隐私页挂公网 HTTPS：`docs/hosted-legal-pages/`
6. Archive → App Store Connect → 内测组  
7. 冒烟：`docs/testflight-smoke.md`（登录可选 · 英语前 10 · 沙漠前 10 · 数学小桌）

> 把 **Team ID** 和 **apiBase 域名** 发给我，我可以代写进配置文件；Archive 仍须本机有 Xcode。

---

## 分层真相（禁混谈）

| 层 | 状态 |
|----|------|
| **A 内容包** | 绿 · 种子双地图 + OSS 清单 |
| **B iOS 壳工程** | 骨架绿 · **本机无完整 Xcode → 不能 Archive** |
| **C 苹果/材料** | 你侧 ASC / Team / 隐私公网 |
| **D 后台真数据** | **未绿** · `apiBase` 空 · 生产机未部署嗨洛塔 API |

---

## 验收命令

```bash
ln -sfn "$HOME/嗨洛塔少儿启蒙APP" /tmp/baobao-chuangguan
cd /tmp/baobao-chuangguan
npm test
node tools/audit-readiness.mjs
bash tools/pack-app-www.sh /tmp/hirota-www-check
# 期望：hardFailures=[] · testflightContentReady=true
# pack 含 free-levels×10 + desert-levels×10；asset-packs 无 example CDN
```
