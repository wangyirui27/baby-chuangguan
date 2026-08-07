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

内容包门禁与打包步骤见：

- **开发人员交接（打包用）** → [`docs/dev-handoff-testflight.md`](docs/dev-handoff-testflight.md)
- 工程清单 → [`docs/testflight-checklist.md`](docs/testflight-checklist.md)
- 内测冒烟 → [`docs/testflight-smoke.md`](docs/testflight-smoke.md)

```bash
bash tools/pack-app-www.sh
open ios/BabyEnglishIsland.xcodeproj
# 或装好 Xcode + Team 后：
# DEVELOPMENT_TEAM=你的ID bash tools/ship-testflight.sh --upload
```

`ios/Config/Team.xcconfig` 填 `DEVELOPMENT_TEAM`；生产 API 写入 `ios/BabyEnglishIsland/shell-config.json` 的 `apiBase`（HTTPS，无尾 `/`）。

## 后端

见 `backend/README.md`。密钥只用 `backend/.env`（参考 `.env.example`），**不要提交 `.env`**。

## 仓库约定

- 不提交：`.env`、本地 `data/*.json`、截图、AI 中间态（`_gen` / `_dreamina-raw`）、付费课全量 mp4
- 进 TF 包：runtime + 英语 L01–10 + 数学运行时资源（见 `tools/pack-app-www.sh`）
