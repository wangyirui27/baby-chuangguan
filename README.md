# 嗨洛塔（HIROTA）少儿启蒙

iOS WKWebView 壳 + H5 闯关（英语地图 / 数学小桌）。
Bundle ID：`com.baobaoenglish.island`

## 快速开始（Web）

```bash
npm install
npm test
# 静态预览：用任意静态服务器打开仓库根目录 index.html
```

## iOS / TestFlight

- **总交接（给接手 AI / 全量现状）** → [`docs/handoff-testflight-full-2026-08-07.md`](docs/handoff-testflight-full-2026-08-07.md)
- 开发人员交接（打包用） → [`docs/dev-handoff-testflight.md`](docs/dev-handoff-testflight.md)
- 签名/上传环境变量 → [`docs/testflight-secrets.md`](docs/testflight-secrets.md)
- ASC / TestFlight 表单草稿 → [`docs/testflight-asc-form.md`](docs/testflight-asc-form.md)
- 工程清单 → [`docs/testflight-checklist.md`](docs/testflight-checklist.md)
- 内测冒烟 → [`docs/testflight-smoke.md`](docs/testflight-smoke.md)

```bash
bash tools/pack-app-www.sh /tmp/hirota-www-check
npm run testflight:preflight
npm run probe:asset-packs -- --dry-run  # 可选：只列 OSS 样本 URL，不联网
open ios/BabyEnglishIsland.xcodeproj
# 或装好 Xcode + Team 后：
# DEVELOPMENT_TEAM=你的ID bash tools/ship-testflight.sh --upload
# 重复传同版本时：
# DEVELOPMENT_TEAM=你的ID BUILD_NUMBER=4 bash tools/ship-testflight.sh --upload
```

`docs/testflight-github-actions-template.yml` 是无凭据 CI 模板；有 GitHub `workflow` 权限的同事可复制到 `.github/workflows/testflight-preflight.yml` 启用绿勾。它只证明内容包、H5、壳工程交接门禁通过；Archive / Upload 仍必须由有完整 Xcode + Apple Developer Team 的技术同事执行。
启用命令：`bash tools/enable-testflight-workflow.sh`，然后由有 `workflow` scope 的凭据提交 `.github/workflows/testflight-preflight.yml`。

`DEVELOPMENT_TEAM=你的ID bash tools/ship-testflight.sh --upload`；或本地复制 `ios/Config/Team.xcconfig.example` 为 ignored 的 `ios/Config/Team.xcconfig` 后填 Team。生产 API 写入 `ios/BabyEnglishIsland/shell-config.json` 的 `apiBase`（HTTPS，无尾 `/`）。内容内测 `apiBase` 可空，`allowLocalMockLogin=true` 只用于通过强制登录门，不授予 VIP。
TestFlight 默认 `TEMP_LOCAL_FULL_ACCESS=false`，本地壳不会绕过 11 关以后的付费墙。

## 后端

见 `backend/README.md`。密钥只用 `backend/.env`（参考 `.env.example`），**不要提交 `.env`**。

## 仓库约定

- 不提交：`.env`、本地 `data/*.json`、截图、AI 中间态（`_gen` / `_dreamina-raw`）、付费课全量 mp4
- 进 TF 包：runtime + 海岛/沙漠 L01–10 + 数学 story 31 条（见 `tools/pack-app-www.sh`）
