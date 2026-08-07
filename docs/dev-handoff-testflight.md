# 开发人员交接：嗨洛塔 TestFlight 打包

更新：2026-08-07  
仓库：`https://github.com/wangyirui27/baby-chuangguan`  
产品名：**嗨洛塔** · Bundle ID：`com.baobaoenglish.island` · 版本 **1.0.1 (2)**

---

## 你要交付什么

| 交付 | 说明 |
|------|------|
| TestFlight 构建 | Archive → App Store Connect 上传 |
| 内测组可装 | ASC 处理完构建后加入测试员 |
| （可选）填 apiBase | 若甲方已给生产 HTTPS API，写入 `shell-config.json` 再 Archive |

**不要求**你做：全量 200 关视频补齐、RDS 当 CDN、Android、上架商店审核文案（除非另约）。

---

## 本机前置

1. macOS + **完整 Xcode**（不是仅 Command Line Tools）
2. Apple Developer Program 账号，Xcode → Settings → Accounts 登录
3. 自动签名可用（钥匙串有 Apple Development/Distribution 证书）
4. Node.js 18+（跑测试与 pack）

```bash
git clone https://github.com/wangyirui27/baby-chuangguan.git
cd baby-chuangguan
npm ci   # 或 npm install
npm test
bash tools/pack-app-www.sh
# 期望：tests 全绿；pack 约 180MB+；runtime asset gate OK
node tools/audit-readiness.mjs
# 期望：testflightContentReady=true，hardFailures=[]
```

---

## 签名与 Team（必做）

1. 复制并填写 Team：

```bash
cp ios/Config/Team.xcconfig.example ios/Config/Team.xcconfig
# 编辑：DEVELOPMENT_TEAM = 你的10位TeamID
```

2. 同步 `ios/ExportOptions-TestFlight.plist` 里的 `teamID`（勿留 `YOUR_TEAM_ID`）。

3. 打开工程：

```bash
open ios/BabyEnglishIsland.xcodeproj
# 或
bash tools/ship-testflight.sh --open
```

Signing & Capabilities：Team 选对、勾选 Automatically manage signing。

---

## apiBase（看甲方要求）

文件：`ios/BabyEnglishIsland/shell-config.json`

| 场景 | 填法 |
|------|------|
| 只测壳 + 前 10 关本地内容 | 可保持 `""` |
| 真登录 / 短信 / 云同步 | `"apiBase": "https://api.example.com"` **无尾斜杠** |

原生会注入 `window.BABY_ISLAND_API_BASE`；H5 `auth/apiClient.js` 读取。

---

## 一键 Archive + 导出上传包

```bash
# 已装 Xcode 且填好 Team 后：
DEVELOPMENT_TEAM=XXXXXXXXXX bash tools/ship-testflight.sh --upload
```

或手动：

```bash
bash tools/pack-app-www.sh   # 把 www 打进 ios/BabyEnglishIsland/www
cd ios
xcodebuild -project BabyEnglishIsland.xcodeproj \
  -scheme BabyEnglishIsland \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath build/BabyEnglishIsland.xcarchive \
  archive
# 先把 ExportOptions-TestFlight.plist 的 teamID 换成真 Team
xcodebuild -exportArchive \
  -archivePath build/BabyEnglishIsland.xcarchive \
  -exportPath build/export \
  -exportOptionsPlist ExportOptions-TestFlight.plist
```

上传：Xcode Organizer / Transporter / `xcrun altool`（ASC API Key）。

---

## App Store Connect 检查表

- [ ] App 记录存在，Bundle `com.baobaoenglish.island`
- [ ] 显示名：嗨洛塔
- [ ] 构建处理完成（Processing → Ready to Test）
- [ ] 内测组 + 测试员邮箱
- [ ] （可选）IAP 商品 `baby_island_map_vip_001` — 见 `docs/iap-product-ids.md`；未建商品时只测免费段
- [ ] （建议）隐私政策 / 用户协议公网 HTTPS

---

## 包内内容边界（已知设计）

- **进包**：非视频 runtime 资源 + 英语 **L01–L10** 课程 mp4 + 数学桌面运行时（含 wood-digit **v7**）
- **不进包**：付费关视频库、LibTV 中间态、`_gen` / `_dreamina-raw`、营销 xhs 模板
- 全量课视频已另存 RDS `baby_content_videos` 作备份；**播放仍靠包内/未来 OSS**，不要把 MySQL BLOB 当 CDN

验收冒烟：`docs/testflight-smoke.md`  
工程对照：`docs/testflight-checklist.md`

---

## 密钥与配置（勿提交）

| 文件 | 说明 |
|------|------|
| `backend/.env` | **本地/生产密钥**，已 gitignore |
| `backend/.env.example` | 变量清单模板 |
| `ios/Config/Team.xcconfig` | 可本地填 Team；不要把别人的 Team 误提交进公共 fork |
| `data/*.json` | 本地用户/会话，gitignore |

生产后端部署、阿里云短信、MySQL 学习库 **不在本次 TF 打包必做范围**；有域名后再填 apiBase 重打一版即可。

---

## 出问题先跑

```bash
npm test
bash tools/pack-app-www.sh /tmp/hirota-www-check
node tools/audit-readiness.mjs
security find-identity -v -p codesigning   # 应有 Apple Distribution
xcodebuild -version
```

联系甲方时请附：失败日志末尾 50 行 + `audit-readiness` JSON + Bundle/版本号。
