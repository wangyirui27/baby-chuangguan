# TestFlight 签名 / 上传环境变量

不要把真实值写进 Git。技术同事在本机 shell、CI Secrets 或本地 ignored `ios/Config/Team.xcconfig` 里配置。

## 必需

| 名称 | 用途 |
|------|------|
| `DEVELOPMENT_TEAM` | Apple Developer Team ID，传给 `xcodebuild archive` |

## App Store Connect API Key（无人值守上传推荐）

`tools/ship-testflight.sh --upload` 支持以下两组命名，二选一即可：

| 短名 | GitHub Secrets 友好名 | 用途 |
|------|----------------------|------|
| `ASC_KEY_ID` | `APP_STORE_CONNECT_API_KEY_ID` | ASC API Key ID |
| `ASC_ISSUER_ID` | `APP_STORE_CONNECT_ISSUER_ID` | ASC Issuer ID |
| `ASC_KEY_PATH` | `APP_STORE_CONNECT_API_KEY_PATH` | 本机 `.p8` 文件路径 |
| `ASC_KEY_P8_BASE64` | `APP_STORE_CONNECT_API_KEY_P8_BASE64` | `.p8` 内容 base64，脚本会写临时文件 |

```bash
DEVELOPMENT_TEAM=XXXXXXXXXX \
ASC_KEY_ID=XXXXXXXXXX \
ASC_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
ASC_KEY_PATH=/tmp/AuthKey_XXXXXXXXXX.p8 \
bash tools/ship-testflight.sh --upload
```

若只走有 Xcode 登录态的人工发船机，可不配 ASC API Key。

## 可选

| 名称 | 用途 |
|------|------|
| `ALLOW_PROVISIONING_UPDATES=1` | 强制允许 `xcodebuild` 通过 Apple 服务自动管理签名；未配 ASC API Key 但需要自动拉 profile 时用 |
| `ALLOW_PROVISIONING_UPDATES=0` | 强制关闭自动管理签名；ASC API Key 齐全时脚本默认允许，如需关闭才设为 `0` |
| `BUILD_NUMBER=4` | 重复上传同版本时临时覆盖 `CURRENT_PROJECT_VERSION`，避免 build 号撞车 |
| `ARCHIVE_PATH` | 自定义 `.xcarchive` 输出路径 |
| `EXPORT_DIR` | 自定义导出目录 |
| `EXPORT_OPTS_WORK` | 自定义临时 ExportOptions 路径 |
