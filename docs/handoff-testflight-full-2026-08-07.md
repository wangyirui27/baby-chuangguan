# 嗨洛塔 · TestFlight 全量交接（给接手 AI / 开发）

**生成：** 2026-08-07（本机实测）
**仓库：** https://github.com/wangyirui27/baby-chuangguan
**本地路径：** `/Users/yr/嗨洛塔少儿启蒙APP`
**分支：** `main`（2026-08-08 已继续更新；以 `git pull` 后 `git log -1 --oneline` 为准）
**产品：** 嗨洛塔（HIROTA）少儿启蒙 · Bundle `com.baobaoenglish.island` · **1.0.1 (3)**
**形态：** iOS WKWebView 壳 + 根目录 H5（`index.html` / `script.js` / `style.css`）+ 可选 Node 后端

> **读本文即可接手。** 旧分拆文档仍有效，冲突时以 **本文件 + 本机再跑门禁** 为准。
> 分层铁律：**A 内容 / B 壳工程 / C 苹果账号 / D 后台** 禁止混谈「全绿」。

## 0.1 团队与证据边界

- **Hermes/Grok：** 提供本总交接与产品/文档侧整理；不等同于已 Archive 或已上传 TestFlight。
- **Codex：** 负责本机集成验收、口径修正、门禁复跑；不替代有 Xcode/Apple Team 的发船机。
- **外部团队复核（2026-08-08，只读）：** Cursor / MiniMax / Mimo / DeepSeek / WorkBuddy / Grok 复核后，确认内容门禁结论成立；有效问题已落地为付费墙开关关闭、共享 xcscheme、版本口径和 OSS 占位 URL 清零。
- **未完成：** 没有任何 agent 已完成 App Store Connect 创建、Archive、Upload 或真机 TestFlight 安装证明。

---

## 0. 一句话现状

| 层 | 状态 | 说明 |
|----|------|------|
| **A 内容包** | ✅ 已绿并推仓 | `npm test` 379 pass；`testflightContentReady=true`；`hardFailures=[]`；pack 含海岛+沙漠各前 10 + 数学 story 31 条；`asset-packs.json` 无假 CDN/local URL |
| **B iOS 壳骨架** | ✅ 仓内齐 | 图标/启动/Privacy/pack Build Phase/共享 xcscheme/ship 脚本齐；**本机无 Xcode.app → 不能 Archive** |
| **C 苹果** | ⬜ 用户/有 Xcode 的 Mac | Team ID、ASC App、Archive Upload、TF 组 |
| **D 后台** | ⬜ 可选 | 内容内测 **apiBase 可空**；要登录/云进度再填生产 HTTPS |

**距离「内测员能从 TestFlight 装上玩内容」还差：有完整 Xcode 的 Mac + Apple Team + Archive 上传。**
**不差：** 前 10 关视频进包、数学 story 31 条进包、L11–200 OSS 清单、H5 测试、壳工程文件。

**不要声称：** 已 Archive / 已上 TF / 已全功能登录联调（本机无证据）。

---

## 1. 本机刚刚复测（接手后请再跑一遍）

```bash
cd /Users/yr/嗨洛塔少儿启蒙APP   # 或 clone 后的 baby-chuangguan
git pull origin main
npm test
# 预期：tests 379 · pass 379 · fail 0

node tools/audit-readiness.mjs
# 关键字段（2026-08-08 实测）：
#   testflightContentReady: true
#   nativeShellReady: true
#   hardFailures: []
#   releaseReady: false          # 正常，勿挡 TF
#   nativeBuildToolReady: false  # 无完整 Xcode
#   shellApiBaseConfigured: false
#   teamIdConfigured: false
#   missingQuestionAudio: 187    # 全量题语音缺口，不挡缩小范围 TF
#   missingQuestionAudioFirstTen: 0
#   missingFirstTenVideos: 0
#   desertSeedMissing: 0
#   mathStoryVideos: expected 31, listed 31, missing 0, localBytes 99877902
#   assetPackPlaceholders: count 0
#   tempLocalFullAccess: false
#   scriptReleaseVersion: "1.0.1"
#   remoteCourseVideos ocean/desert: listed 190, missingRemote11to200 0, realOssUrls 190

bash tools/pack-app-www.sh /tmp/hirota-www-check
# 预期：runtime asset gate OK；约 382MB；含
#   assets/video/free-levels/level-01…10
#   assets/video/desert-levels/level-001…010
#   assets/video/math-story/*.mp4 31 条（约 95MB）
```

**本机环境（写文档时）：**

- `xcode-select -p` → `/Library/Developer/CommandLineTools`（**仅 CLT**）
- `/Applications/Xcode.app` → **不存在**
- 因此：**不能**本地验证 `xcodebuild archive`

---

## 2. 距离 TestFlight 还差什么（只列未完成）

### 2.1 必须（内容内测 TF 最短路径）

1. **完整 Xcode**（非 CLT）的 Mac；`xcode-select -s /Applications/Xcode.app/Contents/Developer`
2. **Apple Developer** 付费账号；拿到 **Team ID**
3. 写入其一即可：
   - 本地 ignored `ios/Config/Team.xcconfig`：`DEVELOPMENT_TEAM=XXXXXXXXXX`
   - 或 Xcode → Signing & Capabilities 选 Team
   - 或：`DEVELOPMENT_TEAM=XXX bash tools/ship-testflight.sh --upload`（脚本会生成临时 ExportOptions 写 teamID，不污染 Git）
4. **App Store Connect** 若无 App：新建 iOS，Bundle **完全一致** `com.baobaoenglish.island`，显示名 **嗨洛塔**
5. **Archive → Upload**：
   ```bash
   git pull
   DEVELOPMENT_TEAM=你的TeamID bash tools/ship-testflight.sh --upload
   # 或 GUI：open ios/BabyEnglishIsland.xcodeproj → Product → Archive → Distribute → ASC
   ```
6. ASC 处理 5–30 分钟 → **加 Internal 测试组** → 设备安装
7. 真机按 `docs/testflight-smoke.md` 冒烟（见 §6；构建号以实际上传为准，当前工程是 **1.0.1 (3)**）

### 2.2 可选（不挡「先玩内容」）

| 项 | 现状 | 何时要 |
|----|------|--------|
| `shell-config.json` → `apiBase` | `""` | 要短信登录 / 云进度 / 必登门 |
| 生产后端 HTTPS + 阿里云短信 | 代码有，部署/密钥用户侧 | 全功能 TF |
| ASC IAP `baby_island_map_vip_001` | 未建则只测免费前 10 | 测付费墙 |
| 隐私政策 **公网 HTTPS URL** | 仓内草稿 `docs/hosted-legal-pages/` | 外测/上架问卷；**内测可后补** |
| 全量 187 题语音 | gap，不挡 TF | 完整英语答题听感 |
| `releaseReady` | false | **商店正式版**，勿与 TF 混谈 |
| 城堡地图 castle | coming-soon | 非 TF 范围 |

### 2.3 明确禁止

- 把影关 `api.modelisms.com` 填进嗨洛塔 `apiBase`
- 用「本地 audit 绿」宣称「已上 TestFlight」
- 等 `releaseReady:true` 才允许第一次 TF
- 把 RDS/MySQL 里课视频 BLOB 当播放源（播放 = OSS / 包内；BLOB 仅备份）

---

## 3. 已就绪清单（仓内，勿再从头做）

### 3.1 A · 内容与门禁

| 项 | 路径 / 证据 |
|----|-------------|
| 海岛 L1–10 包内 mp4 | `assets/video/free-levels/level-01-mom.mp4` … `level-10-book.mp4`（workbench 定稿，2026-08-07 换小体积成片） |
| 沙漠 L1–10 包内 mp4 | `assets/video/desert-levels/level-001-good-morning.mp4` … `level-010-i-m-sorry.mp4` |
| 数学 story 31 条包内 mp4 | `assets/video/math-story/level-001-roll-call.mp4` … `level-031-num-ten.mp4`；manifest `present=31` |
| L11–200 OSS | `asset-packs.json`：`https://baobao-chuangguan.oss-cn-shanghai.aliyuncs.com/assets/video/{ocean\|desert}/…`，无 `cdn.example` 占位 |
| 付费墙 QA 开关 | `script.js`：`TEMP_LOCAL_FULL_ACCESS=false`；TestFlight file:// / capacitor 壳不自动解锁 11 关以后 |
| 目录/对账 | `data/content-catalog.json`（400 levels）、`data/workbench-level-video-map.json` |
| pack 脚本 | `tools/pack-app-www.sh`：非视频运行时 + shell loop + 双图前 10 + 数学 story 31；L11+ 不进包 |
| 审计 | `tools/audit-readiness.mjs`：双图种子 + 数学 story + OSS 真链 + 付费墙开关 + 版本 + 占位 URL + TF content 字段 |
| 一键预检 | `npm run testflight:preflight`：无 Xcode 跑测试、readiness、pack、plist/scheme 语法 |
| 测试 | `npm test` → 379 |
| 品牌文案 | 用户可见「嗨洛塔」；禁「英语岛 / 开通 VIP」口径（按地图收费） |

### 3.2 B · iOS 壳

| 项 | 路径 |
|----|------|
| Xcode 工程 | `ios/BabyEnglishIsland.xcodeproj` |
| 共享 scheme | `ios/BabyEnglishIsland.xcodeproj/xcshareddata/xcschemes/BabyEnglishIsland.xcscheme` |
| 壳代码 | `ios/BabyEnglishIsland/ViewController.swift`（WKWebView、`BABY_ISLAND_API_BASE` 注入、asset pack / IAP bridge） |
| AppDelegate | `ios/BabyEnglishIsland/AppDelegate.swift`（含 background URLSession 钩子） |
| 配置 | `ios/BabyEnglishIsland/shell-config.json`（apiBase 空、displayName 嗨洛塔、IAP id） |
| 版本 | `ios/Config/Shared.xcconfig` + pbx：`MARKETING_VERSION=1.0.1`，`CURRENT_PROJECT_VERSION=3` |
| Team 位 | `ios/Config/Team.xcconfig.example`；真实 `Team.xcconfig` 为本地 ignored 文件；Shared `#include? "Team.xcconfig"` |
| 图标 | `Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png` |
| 启动 | Info.plist `UILaunchScreen` + `LaunchLogo` / `LaunchBackground` |
| Privacy | `PrivacyInfo.xcprivacy`；Info `ITSAppUsesNonExemptEncryption` |
| Export | `ios/ExportOptions-TestFlight.plist`（teamID 占位模板；ship 生成临时副本） |
| 发船 | `tools/ship-testflight.sh`：check / archive / upload / open；可选 ASC API Key 无人值守上传；`BUILD_NUMBER=4` 可临时递增 build |
| 预检 | `tools/testflight-preflight.sh` |
| 签名变量 | `docs/testflight-secrets.md` |
| H5 API | `auth/apiClient.js` 读 `window.BABY_ISLAND_API_BASE`，strip 尾 `/`；有 apiBase 时不走 local mock |
| 版本提示 | `app-release.json` latestVersion `1.0.1`，商店搜词嗨洛塔 |

### 3.3 文档（已有，可交叉读）

| 文档 | 用途 |
|------|------|
| **本文** `docs/handoff-testflight-full-2026-08-07.md` | 总交接（优先） |
| `docs/dev-handoff-testflight.md` | 给打包同事的 5 分钟上手 |
| `docs/testflight-checklist.md` | A/B/C/D 勾选 |
| `docs/testflight-smoke.md` | 真机冒烟（当前工程与模板均按 **1.0.1 (3)** 记录） |
| `docs/testflight-secrets.md` | Team ID / ASC API Key 环境变量契约 |
| `docs/iap-product-ids.md` | IAP 商品 ID |
| `docs/hosted-legal-pages/*` | 隐私/条款 **草稿 HTML**（需自行挂到公网 HTTPS） |
| `README.md` | 仓库入口指向上述 TF 文档 |
| Skill（助手侧） | `ios-webview-testflight-ship` + `references/tf-final-prep-rules.md` |

### 3.4 法律页

- 仓内：`docs/hosted-legal-pages/{privacy,terms,children-privacy,index}.html`
- 另有副本：`/Users/yr/APP上架准备/hosted-legal-pages/`（若存在）
- **未**自动部署到公网；ASC 填 URL 前需用户托管

---

## 4. 最近已完成工作汇总（git / 工程）

> 「最近」= 约 2026-07-31～2026-08-07 推上 `main` 的 TF 相关与产品收口。
> **本 Hermes 会话（写本文当下）**：只做了多语言难度口头评估 + 本交接文档；**未**再改发船代码。
> **2026-08-08 Codex 后续**：已将数学 story 31 条 mp4 纳入 GitHub、`pack-app-www` 和 readiness 门禁；见 `8e755be`。随后补齐共享 xcscheme、付费墙默认关闭、H5 版本 1.0.1 和 `asset-packs.json` 真 OSS URL。
> 工作区另有 **untracked** 数学 QA/切图脚本（见 §8），与 TF 门禁无关，勿误提交除非用户要求。

### 4.1 提交时间线（新 → 旧）

| Commit | 日期 | 摘要 |
|--------|------|------|
| `latest` | 2026-08-08 | fix：TF 预检门禁收紧，关闭本地壳付费绕过，共享 scheme，清理 `asset-packs.json` 假 URL |
| `d916a4e` | 2026-08-08 | docs：记录数学 story 31 条进包与 pack 体积 |
| `8e755be` | 2026-08-08 | fix：数学 story 31 条 mp4 进仓并打入 iOS `www` 包 |
| `85a136d` | 2026-08-08 | docs：更新 TestFlight handoff 与内容/全功能内测口径 |
| `c0381fe` | 2026-08-07 | docs(tf)：对齐 `ship-testflight` 路径与 **1.0.1 (3)** 交接清单 |
| `5c9069c` | 2026-08-07 | **feat(tf)**：OSS 课视频清单 + 沙漠 L1–10 进包；海岛前 10 换 workbench 成片；catalog/video-map；pack/audit 增强；auth/apiClient 与壳注入；build **3** |
| `7348b25` | 2026-08-07 | docs：hosted legal pages（隐私/条款/儿童隐私） |
| `2b497e2` | 2026-08-07 | **feat**：TF handoff 全家桶——iOS shell kit、pack gates、admin、数学题音频大批进仓、dev 文档 |
| `3352ee6` | 2026-08-05 | fix：我的→数学沉浸壳；家长总览按地图收费 |
| `14b815d` | 2026-08-05 | feat：数学地图桌面 UI、本地 adaptive coach、打磨 |
| `1727b0d` | 2026-08-03 | feat：沙漠课纲刷新与 app polish |
| `8891bfd` / `d656d1d` | 2026-07-31 | 品牌改名嗨洛塔、清旧标题 |
| `2a471b1` | 2026-07-31 | HIROTA wordmark 进启动品牌 |

### 4.2 `5c9069c` 关键落地（TF 内容分水岭）

- 沙漠种子 10 支 mp4 进 git + pack
- 海岛 free-levels 10 支替换为 workbench 定稿（体积下降）
- `asset-packs.json` 扩成双图 L11–200 真 OSS URL
- `data/content-catalog.json`、`data/workbench-level-video-map.json`
- `tools/pack-app-www.sh` 双图种子门禁
- `tools/audit-readiness.mjs`：沙漠种子 + remote OSS 计数、`testflightContentReady`
- `backend/scripts/upload_course_videos_to_oss.py`、`scripts/sync-workbench-level-videos.py`
- 版本升 **1.0.1 (3)**（Shared + pbx）
- 学习/me 路由、math attempts migration 等后端增量（全功能 TF 用，内容内测不依赖）

### 4.3 `2b497e2` 关键落地（壳与工具链）

- 完整 `ios/` WKWebView 工程骨架
- AppIcon / Launch / PrivacyInfo / ExportOptions / Team xcconfig
- `tools/ship-testflight.sh`、`pack-app-www.sh` 初版门禁
- `docs/dev-handoff-testflight.md`、checklist、smoke、iap 文档
- 大量 `assets/audio/questions-holly/math-*.mp3`
- admin 控制台静态页
- `native-shell.test.js` 等

### 4.4 产品侧（非纯 TF，但进包体验）

- 数学地图 / 内联题 / 本地 coach（非远程真 AI 默认关）
- 我的页品牌与「按地图收费」paywall 文案
- 沙漠课视频语义与 workbench 定稿流程

---

## 5. 发船操作手册（接手 AI 指导人类或本机有 Xcode 时执行）

### 5.1 内容内测（推荐先发）

1. `git pull` + §1 三门禁全绿
2. **保持** `apiBase=""`（或产品明确要求再填）
3. Team ID → xcconfig 或环境变量
4. `DEVELOPMENT_TEAM=… bash tools/ship-testflight.sh --upload`
5. ASC → TF 组 → 安装
6. 无网测：海岛 1–10、沙漠 1–10 视频
7. 未购买/未授权：L11+ 不被本地壳直接放行；购买/恢复/VIP/内测授权后，有网测任意 L11+ OSS 可播

### 5.2 全功能 TF（第二枪）

1. 部署后端 HTTPS（勿尾 `/`）
2. `SMS_PROVIDER=aliyun` + 密钥/签名/模板（见 `backend/.env.example`）
3. `ios/BabyEnglishIsland/shell-config.json`：
   ```json
   {
     "apiBase": "https://你的域名",
     "displayName": "嗨洛塔",
     "iapProductIds": { "mapVip": "baby_island_map_vip_001" }
   }
   ```
4. **递增 build**（推荐发船时临时 `BUILD_NUMBER=4`；要固化再同步 Shared + pbx `CURRENT_PROJECT_VERSION`）后重新 Archive
5. 真机：短信登录、杀进程 session、进度同步
6. IAP 仅当 ASC 已建同名商品

### 5.3 API 注入要点（file:// 壳）

1. `apiBase` 必须在 **App bundle** 的 `shell-config.json`，不是只改 H5
2. 原生 `WKUserScript` **atDocumentStart** 写 `window.BABY_ISLAND_API_BASE`
3. H5 `auth/apiClient.js` 启动时 `setApiBase`；有 base 时 **禁止** local mock 假登录成功
4. 空 apiBase：本地/内容内测可用；登录门不要当生产验收

### 5.4 pack 铁律（改资源必知）

- **进包：** 非视频运行时资源、壳 loop、海岛 L01–10、沙漠 L001–010、数学 story 31 条、`asset-packs.json`
- **不进包：** L11+ 全量 mp4、drafts、`_gen`、raw Dreamina、付费课全量
- 漏沙漠种子 = 沙漠前 10 离线不可播
- 漏数学 story = 数学地图 31 处短片空播/fallback
- 改 pack 后：`bash tools/pack-app-www.sh /tmp/x` 应显示 `math-story x31 in`，且 `find /tmp/x/assets/video/math-story -name '*.mp4' | wc -l` 应为 31

---

## 6. 真机冒烟（缩写；全文见 `docs/testflight-smoke.md`）

构建号记录用：**嗨洛塔 1.0.1 (3)**（或实际上传号）

- [ ] 冷启动非长时间白屏；桌面名「嗨洛塔」
- [ ]（仅全功能）短信登录 + 重进保持 session
- [ ] 海岛 + 沙漠 **1–10**：视频、题、词音
- [ ]（有网）L11+ OSS 课视频
- [ ] 数学 story 短片：至少测第一个 story 有画面、有声音、可继续
- [ ] 数学一关：无 `+/=/?` 硬符号；拖拽可完成；语音与题面一致
- [ ] FAB 静音；返回不崩
- [ ]（可选）IAP 拉起/取消不崩

---

## 7. 关键路径速查

```
仓库根/
  index.html, script.js, style.css, sw.js    # H5 主应用
  asset-packs.json                           # L11+ OSS，禁止假 CDN/local URL
  app-release.json                           # 强更文案/版本
  auth/apiClient.js                          # API + 壳 base
  data/content-catalog.json
  data/workbench-level-video-map.json
  assets/video/free-levels/                  # 海岛前 10
  assets/video/desert-levels/                # 沙漠前 10
  tools/pack-app-www.sh
  tools/ship-testflight.sh
  tools/testflight-preflight.sh
  tools/audit-readiness.mjs
  ios/BabyEnglishIsland.xcodeproj
  ios/BabyEnglishIsland.xcodeproj/xcshareddata/xcschemes/BabyEnglishIsland.xcscheme
  ios/Config/Shared.xcconfig
  ios/Config/Team.xcconfig.example
  ios/ExportOptions-TestFlight.plist
  docs/testflight-secrets.md
  ios/BabyEnglishIsland/{ViewController.swift,shell-config.json,PrivacyInfo.xcprivacy,Assets.xcassets}
  docs/handoff-testflight-full-2026-08-07.md  # 本文
  docs/dev-handoff-testflight.md
  docs/testflight-checklist.md
  docs/testflight-smoke.md
  docs/iap-product-ids.md
  docs/hosted-legal-pages/
  backend/                                   # 可选生产 API
```

OSS 公网基址：`https://baobao-chuangguan.oss-cn-shanghai.aliyuncs.com`
Key 前缀：`assets/video/desert|ocean/…`

IAP Product ID：`baby_island_map_vip_001`（Swift 常量与 shell-config 文档对照；改 ID 需双改）

---

## 8. 工作区脏文件（接手勿踩雷）

`git status` 在写本文时：`main` 与 `origin/main` 一致；存在 **untracked**（多与数学 QA/木数字切图有关），例如：

- `__level_loading_preview.html`、`__math_seq_qa.html`、`__mine_parent_overview_qa.html`
- `tools/qa-math-*.mjs`、`tools/e2e-math-story-waypoints.mjs`
- `tools/gen-wood-digits*.py`、`tools/cut-wood-digits*.py`
- `tools/math-level-audit-report.json`、`scripts/check-number-video-prompts.js`
- `test.txt`

**这些不是 TF 阻塞项。** 除非用户要求，不要塞进 TF 提交；发船只依赖已 push 的 `main`。

---

## 9. 已知 gaps / 技术债（诚实列表）

| Gap | 挡内容 TF？ | 说明 |
|-----|-------------|------|
| 无完整 Xcode | **挡 Archive** | 换机器或装 Xcode |
| Team / apiBase 空 | Team 挡签名；apiBase **不挡**内容内测 | |
| 全量题语音缺 187 | 否 | 前 10 题语音齐 |
| `releaseReady=false` | 否 | 商店级另论 |
| 登录仅 +86 短信 | 仅全功能 | 内容内测可不登 |
| IAP 未在 ASC 建品 | 否 | 只测免费 |
| 隐私 URL 未上公网 | 内测通常不挡 | 外测/上架要 |
| 工程目录名 BabyEnglishIsland | 否 | 用户可见名已是嗨洛塔 |
| 单体 `script.js` 无 i18n | 否 | 与 TF 无关；多语言另项 |
| pack ~382MB | 否 | 大于旧文档写的 ~180MB，以实测为准 |
| smoke 构建号 | 否 | 已对齐工程 **1.0.1 (3)**；上传后以 ASC 实际构建为准 |

---

## 10. 接手 AI 行动协议

1. **先** `git pull` + 跑 §1 三门禁，用输出更新「现状」，禁止只抄本文旧数字。
2. 用户问「还差什么」→ **只答未绿的 C/D/本机 Xcode**，勿复读已绿 A。
3. 用户说「能做的先做」→ 查 A/B 是否仍在仓；已齐则列用户侧，**禁止**从零重做图标/Privacy。
4. 无 Xcode → 可改文档/修 H5/修 pack/audit；**禁止**谎称已 Archive。
5. 改版本必须 **Shared.xcconfig 与 pbx `CURRENT_PROJECT_VERSION` 同号**。
6. 双图种子与 OSS 真链回归：`pack-app-www` + `audit-readiness`。
7. 密钥只进 `backend/.env` / 用户本机 xcconfig，**禁止** commit。
8. 相关 skill：`ios-webview-testflight-ship`、`baby-chuangguan-app-assets`、`hirota-course-video-catalog`、`hirota-release-reality-gates`。

### 10.1 用户侧一次性决策（问用户，勿猜）

1. 先发 **内容内测**（apiBase 空）还是等 **全功能**（生产 API+短信）？
2. Team ID / 哪台 Mac 有 Xcode？
3. ASC 是否已有 `com.baobaoenglish.island`？
4. 本次 TF 是否要测 IAP / 数学？

---

## 11. 验收口令（上传成功后）

- 桌面与启动：**嗨洛塔**，不是英语岛
- 无网：海岛 L1–10、沙漠 L1–10 课视频可播
- 有网：L11+ 从 OSS 可播
- 设置/关于：版本 **1.0.1 (N)** 与 ASC 构建一致
- （全功能）登录发短信成功，进度可恢复

---

## 12. 本会话额外上下文（非 TF 阻塞）

用户曾问「多国语言版难度」：结论是 **家长 UI 多语言 + 仍教英语 = 中等**；换目标语种/真多国登录支付 = 高～极高。
**与当前 TestFlight 发船无依赖**；不要把 i18n 塞进 TF 最短路径。

---

**文档结束。** 下一步默认：有 Xcode 的人按 §5.1 上传；内容 AI 只在门禁回归或用户指定修 bug 时改仓。
