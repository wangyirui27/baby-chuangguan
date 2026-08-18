# 嗨洛塔 App Store 截图卖点 · 技术真实性审计报告

审计人：deepseek（只读审计，未改任何项目文件）
审计时间：2026-08-11
审计范围：index.html / script.js（9941 行）/ style.css / sw.js / ios 壳 / asset-packs.json / docs
验证方式：代码追踪入口→状态→数据源，npm test 383/383 通过

---

## 一、可安全宣传的卖点与证据路径

| # | 卖点 | 证据路径（代码行） | 宣传措辞建议 |
|---|------|-------------------|-------------|
| 1 | 双英语地图闯关：魔法海岛 200 关 + 沙漠奇境 200 关 | script.js:1714 MAP_WORLDS；script.js:6111 renderMap；沙漠 20 主题 × 10 句 script.js:27 | 「海岛/沙漠 400 个沉浸式英语关卡」 |
| 2 | 看视频→答一题 的闯关闭环（视频教学 + 跟读 + 2 选 1 大按钮） | script.js:8514 renderDetail；video→quiz 两段式 | 「每关一支动画短片 + 一题巩固」 |
| 3 | 数学小桌：200 关、7 种题型螺旋（点数/感数/认数字/比多少/取物/分合/数序） | script.js:581 mathCurriculumSpec 8 段螺旋；MATH_FORMATS script.js:404 | 「数学小桌 200 关 · 7 种动手题型」 |
| 4 | 拖拽式数学互动（无 +/= 硬符号，幼儿可独立完成） | script.js:7764/7948/8159 pointer drag + setPointerCapture | 「拖一拖、数一数，手把手数感启蒙」 |
| 5 | 数学故事短片 31 部（桌子小把戏 + 数字 0-10 拟人） | script.js:1009 MATH_STORY_WAYPOINTS；包内 31 条 mp4 约 95MB | 「31 部数学小动画」 |
| 6 | 数学阶段复习：186-200 关总复习（轮转已学 7 技能） | script.js:761 总复习分支；zhTitle '阶段复习' script.js:774+ | 「阶段复习关」仅限数学侧 |
| 7 | 家长总览：学习天数/分钟/关卡/已学单词/正确率/技能分解/推荐关卡 | script.js:9283 renderMine；buildMathParentReport script.js:1322 | 「家长总览：进度、正确率、下一步建议」 |
| 8 | 正确率分析页（近 14 天趋势 + 分科） | script.js:9552 renderAccuracy；ACCURACY_SERIES_DAYS=14 | 「近 14 天答题正确率趋势」 |
| 9 | 错题本：答错自动记录、答对自动移除、我的页显示待复习数 | script.js:8972 recordMistake/resolveMistake；normalizeMistakeBook | 「错题自动进复习本」 |
| 10 | 离线可用：前 10 关视频包内 + 数学 story 31 条包内 + 地图/词音/题音 SW 缓存 | tools/pack-app-www.sh；sw.js APP_SHELL；docs/handoff §2.2 | 「无网也能玩前 10 关 + 数学动画」 |
| 11 | L11+ 关卡视频后台离线下载（iOS background URLSession） | ios/ViewController.swift:17 AssetPackDownloadManager | 「课程视频可下载后离线看」 |
| 12 | 进度本地即时保存 + 后端可同步（600ms 防抖） | script.js:3486 flushLearningSync；localStorage 双写 | 「进度自动保存」 |

证据复核状态：以上 12 项均已从代码追踪到入口（路由/按钮）→ 状态（localStorage/state）→ 数据源（关卡定义/attempts 记录），非文案推断。

---

## 二、仅有壳 / 假数据 / 未接通 / 不稳定的能力（禁止宣传）

| # | 能力 | 真实状态 | 风险 |
|---|------|---------|------|
| A | 英语星排行榜 | **假数据**。buildLocalRankings script.js:1836 将 7 个硬编码假人（林小满/周予安/陈乐知/夏可可/唐星野/苏一禾/顾晚晴，script.js:1781）+ 当前用户拼成榜单，无任何真实他人数据 | P0 |
| B | 英语「正式题型」多样性 | 英语只有一种题型：2 选 1 单选（script.js:8527 注释「题型一：2 选项」）。宣传英语多题型会被真实体验打脸 | P0 |
| C | 英语「阶段复习」 | **不存在**。docs/graphify-team/02-product-loop.md:78 明确「当前没有独立的阶段复习关」；英语复习仅 = 错题本 + 重做已完成关。阶段复习仅数学 186-200 有 | P0 |
| D | 短信登录 / 云进度同步 | 生产后端未部署（apiBase 空）。当前仅有 local mock 登录（任意 11 位手机号+验证码可进，不授 VIP）；真短信/云同步依赖用户侧部署 backend + 阿里云短信 | P0 |
| E | VIP 内购 | IAP 桥代码真实（SKProductsRequest/SKPaymentQueue），但 ASC 商品 `baby_island_map_vip_001` 未创建（docs/testflight-asc-form.md 确认），真机购买链路从未验证 | P0 |
| F | 数学花园 / 数学星塔 / 魔法城堡 | comingSoon 纯占位（script.js:1752/1761/1770） | P1 |
| G | 语文学习区 | 家长页占位卡片「即将开放的语文」（script.js:9436） | P1 |
| H | 全量题语音 | 缺 187 个（tools/audit-readiness.mjs missingQuestionAudio: 187）；仅前 10 关题音齐 | P1 |
| I | 排行榜空状态文案「完成闯关即可上榜」 | 即使完成闯关，榜上也只有假人 + 自己，无真实社区 | P1 |
| J | OSS 资产完整性 | asset-packs.json 190 条真 URL 但 sha256 全空（字节数有值），无法校验下载完整性 | P2 |

---

## 三、最适合做截图的实际页面（按推荐优先级）

| 优先级 | 页面 | 进入方式（真实路径） | 卖点对应 |
|-------|------|--------------------|---------|
| 1 | 魔法海岛地图 | 冷启动 → mock 登录 → #map（默认） | 沉浸地图、200 岛、船只动画、BGM |
| 2 | 英语关卡答题态 | 地图点当前关 → 看完视频 → 答题（2 选 1 大按钮 + 发音按钮） | 视频教学闭环、幼儿大触控 |
| 3 | 沙漠奇境地图 | 地图页左下切换地图 → 沙漠 | 第二地图差异化 |
| 4 | 数学小桌地图 | 地图切换 → 数学地图（木数字桌面） | 数学特色 |
| 5 | 数学拖拽答题（取物/分合） | 数学地图点关 → 拖苹果进篮子 | 动手操作差异化 |
| 6 | 数学故事短片 | 数学地图必经路点自动播放 | 内容厚度 |
| 7 | 家长总览 | 底部「我的」tab | 家长侧价值 |
| 8 | 正确率分析 | 我的 → 正确率分析 | 数据沉淀 |
| 9 | 课程视频下载态 | 地图关卡视频区下载按钮 + 进度 | 离线卖点 |

**不建议截图**：排行榜（假数据）、登录页（mock 登录）、支付弹窗（商品未建）、语文卡、数学花园等 comingSoon 占位、含「第 11 关起会员」的 paywall 弹窗（除非卖 VIP）。

截图操作注意：冷启动有强制登录门（runAuthBootGate script.js:4720，apiBase 空时 mock 可进）。截图前先完成一次 mock 登录，否则会截到登录弹窗。

---

## 四、iPhone 与 iPad 是否真有不同展示价值

**有，且差异明确，值得各截一组。**

- 工程级支持：TARGETED_DEVICE_FAMILY = "1,2"（project.pbxproj:243）；Info.plist 有独立的 UISupportedInterfaceOrientations~ipad（四方向全开，iPhone 无倒竖屏）
- CSS 专门为 iPad 横屏做了整套适配：
  - 7–9 英寸平板横屏/分屏：HUD 排两行、地图控件让位（style.css:7801 专门 media query）
  - landscape：答题页双列（视频 + 题面同屏）、家长页 sticky 双栏（style.css:7649）
  - portrait：岛屿放大到 92% 屏宽（style.css:7670）
  - 88 处 cqw/dvh/svh 容器单位，明显为 iPad 分屏/不同尺寸优化
- 产品注释确认 iPad 支付走单一 Apple IAP 按钮（style.css:2432）

**结论**：iPhone 竖屏 = 沉浸闯关主力形态；iPad 横屏 = 视频 + 题目同屏双列、家长看板更优。App Store 建议 iPhone 截图 3-4 张（地图/答题/数学/家长）+ iPad 截图 2-3 张（横屏地图/横屏答题/家长总览），展示价值不重复。

**注意**：本机无 Xcode，iPad 适配未经真机冒烟（docs/handoff-testflight-full §9 已知 gap）。截图前应在真机 iPad 上过一遍上述页面，防 CSS 适配在真实 Safari/WebKit 渲染有偏差。

---

## 五、全部风险按 P0 / P1 / P2 分级

### P0（必须先处理，否则截图宣传 = 欺骗用户 / 审核风险）
1. **排行榜假数据**：硬编码 7 假人 + 当前用户拼榜（script.js:1781/1836）。要么删除该 tab，要么接入真实服务端排行；严禁截图宣传社区排行。
2. **英语题型口径**：英语只有 2 选 1 单选。宣传文案严禁写「多题型/多种玩法」针对英语区；「7 种题型」只能绑定数学区。
3. **阶段复习口径**：英语无阶段复习关。宣传「阶段复习」必须限定数学地图；或先补英语复习关。
4. **登录/云同步口径**：生产后端未部署。严禁宣传「短信登录、多端同步」；目前用户实际体验是 mock 登录（内容内测）。上架正式版前必须部署真实后端。
5. **VIP 内购**：ASC 商品未建、购买未验证。严禁宣传「VIP/解锁全部」；正式上架前必须建商品 + 真机验证购买/恢复/退款边界。

### P1（截图前需补齐或明确规避）
6. 全量题语音缺 187 个：截图答题页时确保展示的关卡有语音（前 10 关安全）。
7. 法律页未公网托管（隐私/条款仍含【待填】）：External TestFlight / 上架前必须托管且清零占位。
8. iPad 适配未真机冒烟（无 Xcode 未 Archive）：截图前用真机 iPad 过一遍候选页面。
9. comingSoon 占位（数学花园/星塔/城堡/语文）：任何界面出现占位图时不要截图；或从状态里隐藏。
10. 离线卖点边界：无网可玩仅限「前 10 关 + 数学 story」；L11+ 需先下载或联网。宣传必须带限定词。

### P2（低风险 / 技术债，不挡截图但记录）
11. OSS sha256 全空，下载完整性无法校验。
12. 排行榜空状态文案「完成闯关即可上榜」与假数据矛盾（若保留该页）。
13. 登录门为强制（runAuthBootGate required=true），首次体验有登录墙，产品侧可评估是否放松。
14. asset-packs map 2（math）levels=0：数学 L11+ 无 OSS 视频清单，数学 200 关无视频依赖（usesVideoAssets=false），属正常设计但 audit 数字易误读。

---

## 附：审计方法声明（诚实边界）

- 已审计：入口（路由/tab/按钮）→ 状态（localStorage/state）→ 数据源（关卡定义/attempts/OSS manifest）全链路；sw.js 离线清单；iOS 壳 TARGETED_DEVICE_FAMILY/方向/IAP 桥；asset-packs.json 真 URL + 占位符计数（0）；npm test 383/383 通过。
- 未审计（无执行环境）：真机渲染效果、IAP 真实购买流程、OSS URL 逐个 HEAD 请求、iPad 真机 CSS 表现。这些需在真实设备/账号下验证，本报告不为其背书。
- 未做任何 UI 设计或前端实现改动，全程只读。
