# IAP 商品 ID（ASC 对照）

工程内购桥与壳写死的产品 ID：

| 用途 | Product ID | 类型建议 | 备注 |
|---|---|---|---|
| 本地图 VIP / 地图解锁 | `baby_island_map_vip_001` | Auto-Renewable 或 Non-Consumable（与产品定价策略一致） | `ViewController.swift` `vipProductId`；H5 paywall 同 ID |

## ASC 操作（你侧）

1. App Store Connect → 你的 App → 功能 → App 内购买项目  
2. 新建商品，**Product ID 必须完全一致** `baby_island_map_vip_001`  
3. 填本地化显示名（中文：嗨洛塔 · 本地图）与价格  
4. 提交审核前商品需 Ready to Submit；**缩小范围 TF 可先不测购买**，只测免费前 10 + 数学  

## 壳侧

- 购买：`window.webkit.messageHandlers.babyIslandIAP.postMessage({ productId, action })`  
- 恢复：`action: "restore"`  
- 完成回调：`window.BabyIslandIAPComplete` / `window.babyIslandIAPComplete`  

## 配置入口

`ios/BabyEnglishIsland/shell-config.json` → `iapProductIds.mapVip`（文档对照；原生当前仍以 Swift 常量为准，改 ID 需双改）。
