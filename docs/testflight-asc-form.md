# App Store Connect / TestFlight 表单草稿

更新：2026-08-08
用途：给有 Apple Developer 权限的技术同事创建 ASC App、上传后开 TestFlight 内测时对照。本文不代表已经创建 App 或已上传构建。

## 可直接沿用

| ASC 字段 | 建议值 | 证据/位置 |
|----------|--------|-----------|
| 平台 | iOS | `ios/BabyEnglishIsland.xcodeproj` |
| App 名称 | 嗨洛塔 | `Info.plist` `CFBundleDisplayName` |
| Bundle ID | `com.baobaoenglish.island` | `ios/Config/Shared.xcconfig` |
| Primary Language | 简体中文 | 工程 `developmentRegion = zh-Hans`，产品文案中文 |
| 分类 | 教育 | 少儿启蒙/英语/数学内容 |
| 当前构建号 | `1.0.1 (3)` | `ios/Config/Shared.xcconfig` |
| 加密出口 | 不使用非豁免加密 | `Info.plist` `ITSAppUsesNonExemptEncryption=false` |
| IAP Product ID | `baby_island_map_vip_001` | `docs/iap-product-ids.md`，缩小范围 TF 可先不测购买 |

## 需要同事/产品确认后再填

| 字段 | 当前状态 | 处理 |
|------|----------|------|
| SKU | 未定 | 填一个 ASC 内唯一、不含密钥的内部值，例如 `hirota-ios`；创建后通常不再改 |
| 隐私政策 URL | 仓内有草稿 HTML，未公网托管，仍含【待填】 | Internal TestFlight 可先留空；External TestFlight / App Review 仅在公网 HTTPS 页源码中 `【待填` 计数为 0，且产品/法务确认后再填 |
| 技术支持 URL | 未定 | 可用官网/帮助页/法律页索引的 HTTPS URL；不要填本地路径、`file://`、GitHub raw 或未替换占位的草稿页 |
| 公司/运营主体 | 草稿里仍是待填 | 先把法律页里的【待填:公司全称】替换成真实主体 |
| 联系邮箱 | 草稿为 `postmaster@modelisms.com` | 产品确认后再保留或替换 |
| 生产 `apiBase` | 当前为空 | 内容内测可空；登录/云进度内测前再填生产 HTTPS |
| 年龄分级问卷 | ASC 页面现场填写 | 按当前代码事实填写：无广告、无 UGC、无赌博、无不受限网页浏览；若后续功能变化需重答 |
| 内容版权/素材授权 | 需产品确认 | 课程视频、音频、图标、品牌素材应确认生成/授权链路；不要由技术同事猜 |
| TestFlight 测试说明 | 需按本次目的填写 | 建议复制 `docs/testflight-smoke.md` 的冒烟范围 |

## ASC URL 禁止值

不要在 ASC / External TestFlight / App Review 中填写这些值：

- `file://...`、本机绝对路径、仓内相对路径、GitHub raw URL。
- `localhost`、`127.0.0.1`、内网地址或临时预览地址。
- 任意可见文案或 HTML 源码仍包含 `【待填`、`待法务审`、`可直接用草稿` 的法律页。
- 未经产品确认的主体、电话、地址、服务器地区、跨境口径或邮箱。

粘贴隐私政策 URL 前先确认：

- 公网 HTTPS 可匿名打开，不需要登录。
- 页面源码中 `【待填` 计数为 0。
- `privacy.html`、`terms.html`、`children-privacy.html` 的主体字段一致。

## 内测说明可复制

```text
本次 TestFlight 先测内容包与 iPad 原生壳：
1. 首次启动显示“嗨洛塔”。
2. 无网可播放海岛 1-10、沙漠 1-10、数学 story 31 条短片。
3. 未购买/未授权时，11 关以后不应被本地壳直接放行。
4. 购买、恢复购买、VIP 或内测授权后，有网测试 11 关以后从 OSS 加载课视频。
5. 内容内测 apiBase 可为空；显式 local mock 登录只用于进入内容，不测试生产短信登录、云进度同步，也不授予 VIP。
```

## 创建/上传顺序

1. ASC 先建 App：平台 iOS、名称嗨洛塔、Bundle ID `com.baobaoenglish.island`、SKU 自定。
2. 有完整 Xcode 的 Mac pull `main`。
3. 跑 `npm run testflight:preflight`，确认 `seeds ocean=10 desert=10 math=31`。
4. `DEVELOPMENT_TEAM=你的TeamID bash tools/ship-testflight.sh --upload`。
5. ASC 处理完成后，按 `docs/testflight-smoke.md` 加内测组并验收。
