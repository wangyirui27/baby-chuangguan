# 航线进度（journey-compact）历史 redesign 草案

> 当前程序已采用 `j-badge` + `j-pearls` + `j-next` 的珍珠航线结构；本文件保留为历史方案记录，不作为现行实现定稿。

## 问题

当前 `.journey-compact` 在 topbar 中间列的信息层级混乱：
- 微缩 SVG 帆船 + 宝箱在 ~220px 宽度下辨识度极低
- 文案 `已完成 0/200 · 第1关 | 下一站1` 信息糊成一团
- `下一站1` 在第1关时与"第1关"语义矛盾
- 密集圆点里程碑在缩小后不可读

## 新结构（强制）

```
.journey-compact
  .j-head          ← 一行：左 大数字完成度，右 当前关 pill
  .j-track         ← 粗进度条 + 5 个阶段刻度 40/80/120/160/200
  .j-foot          ← 一行次要文案：下一阶段 · 第N关  或 群岛通关
```

### 信息层级

| 层级 | 内容 | 样式 |
|------|------|------|
| 主 | `completed` 大号 tabular-nums + `/200` | 1.4rem, font-weight: 900, color: var(--mint-active) |
| 次 | 当前关 `第 N 关`（pill） | 0.7rem, pill 背景 #ece8dc, color: var(--earth) |
| 辅 | 进度条 fill% = completed/200 | 8px 圆角条, bg #ece8dc, fill 渐变 mint→mint-active |
| 辅 | j-foot: 下一阶段文案 | 下一阶段 M（M=下一个未达里程碑 40/80/120/160/200）|
| 辅 | j-foot（通关态）| `群岛通关` + 线性 SVG 星 ≥16px |

## 色板

全部沿用产品色，无新增：
- cream `#f8f8f0` — 进度条轨道底色 / j-track 背景
- mint `#19c8b9` — 进度条已填充 / 已达里程碑
- earth `#794f27` — 当前关 pill 文字
- gold focus `#ffcc00` — 通关态星
- muted `#9f927d` — j-foot 文案
- 轨道底色 `#ece8dc` — 进度条空段 / 未达里程碑

## 删除的 class

| 旧 class | 说明 |
|----------|------|
| `.j-svg` | 整个 SVG 路线图容器 |
| `.j-rail-bg` | SVG 路线底色线 |
| `.j-rail-done` | SVG 路线已完成线 |
| `.j-start-dot` | SVG 起点 |
| `.j-milestone` | SVG 里程碑圆 |
| `.j-milestone-done` | 已达里程碑 |
| `.j-milestone-pending` | 未达里程碑 |
| `.j-boat` / `.j-boat-body` / `.j-boat-mast` / `.j-boat-sail` | 帆船全部 |
| `.j-treasure` / `.j-treasure-body` / `.j-treasure-lid` / `.j-treasure-key` | 宝箱全部 |
| `.j-treasure-done .j-treasure-key` | 宝箱完成态 |
| `.j-info` | 文案行（替换为 .j-head + .j-foot） |
| `.j-info-main` | 主文案 span |
| `.j-info-main strong` | 数字强调 |
| `.j-info-next` | 下一站文案 |
| `.j-info-next strong` | 下一站数字 |
| `.j-info-complete` | 通关文案 |

## 新增 class

| 新 class | 说明 |
|----------|------|
| `.j-head` | 顶行：左大数字 + 右当前关 pill |
| `.j-head-num` | 大完成度数字 (如 `0<span class="j-head-slash">/200</span>`) |
| `.j-head-slash` | `/200` 部分，较小字 |
| `.j-level-pill` | 当前关 pill 标签 |
| `.j-track` | 进度条容器 |
| `.j-track-bar` | 进度条底层轨道 |
| `.j-track-fill` | 进度条填充层 |
| `.j-track-marks` | 5 个阶段刻度容器 |
| `.j-track-mark` | 单个刻度（40/80/120/160/200），绝对定位 |
| `.j-track-mark--done` | 已达刻度 |
| `.j-track-mark--active` | 当前最近未达刻度 |
| `.j-foot` | 底行次要文案 |
| `.j-foot-next` | 下一阶段文案 |
| `.j-foot-complete` | 通关文案 + SVG 星 |

## style.css 改动范围

1. **删除** `style.css:451–580` 整块 `.journey-compact` 下的旧 SVG + info 样式
2. **新增** 新 `.journey-compact` 样式（约 80 行），包含 `.j-head`, `.j-track`, `.j-foot` 及其子元素
3. **修改** 响应式断点 `style.css:4640–4644` 中的 `.map-topbar .journey-compact` 宽度调整（保留即可）
4. **修改** 响应式 `.j-info` 字号 `style.css:4691–4693`（删除旧 `.j-info`，换为 `.j-foot` 规则）

## script.js 改动范围

`renderCompactJourney()` 函数（`script.js:736–813`）整体重写：

1. **删除** SVG 生成逻辑（帆船、宝箱、路径线、里程碑圆）
2. **新增** 3 行 HTML 结构：`.j-head` / `.j-track` / `.j-foot`
3. **保留** 函数签名不变：`renderCompactJourney(completedCount, unlockedThrough, totalLevels)`
4. **保留** 下一里程碑计算逻辑（`msCheck` 数组）
5. **修改** 文案逻辑：
   - j-head: `completedCount/200` + pill `第 N 关`
   - j-track: CSS width 百分比进度条 + 5 刻度
   - j-foot: `下一阶段 M` 或 `群岛通关` + 星 SVG
6. **修改** aria-label 为完整朗读文案：`已完成了X/200，当前第N关，下一阶段M`

通关态 j-foot 星 SVG（线性 ≥16px）：
```svg
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
</svg>
```

## quiz.test.js 断言改动

测试文件需跟随修改的断言点：

1. **`test('renderCompactJourney builds 5 compact milestones...')`**（约 1408 行）
   - 断言 HTML 结构包含 `.j-head`, `.j-track`, `.j-foot`（替代 `.j-svg` / `.j-info`）
   - 断言 msLabels 为 `[40, 80, 120, 160, 200]`
   - 断言不存在 `.j-boat`, `.j-treasure`, `.j-info` 等旧 class

2. **新增断言**：
   - `.j-track-fill` style width 为 `completedCount%`
   - `.j-level-pill` 包含 `第 N 关`
   - `.j-foot-next` 包含 `下一阶段` + 下一个未达里程碑数
   - 通关态 `.j-foot-complete` 包含 `群岛通关`

## 响应式

- `≤480px`：`.j-foot` `display:none`，保留 `.j-head` + `.j-track` + 当前关 pill
- `prefers-reduced-motion: reduce`：`.j-track-fill` 无 transition 动画

## 无障碍

容器 `aria-label="已完成了X/200，当前第N关，下一阶段M"`（通关态 "已完成了200/200，群岛通关"）。
进度条使用 `role="progressbar"` + `aria-valuenow` + `aria-valuemin="0"` + `aria-valuemax="200"`。

## 沉浸 topbar（横屏海洋模式）

`style.css` `@media (min-width: 700px) and (orientation: landscape)` 内的 `.map-game-active` 规则：

### 改动（`style.css:4454–4505`）

| 选择器 | 旧值 | 新值 |
|--------|------|------|
| `.map-topbar.surface` | `background: rgba(248,248,240,0.88)` | `background: transparent` |
| | `border: 1px solid rgba(255,255,255,0.72)` | `border: 0` |
| | `border-radius: 1.45rem` | `border-radius: 0` |
| | `box-shadow: 0 0.45rem 1.35rem rgba(...)` | `box-shadow: none` |
| | `backdrop-filter: blur(0.75rem)` | `backdrop-filter: none` |
| `.j-track` | `background: #ece8dc` | `background: rgba(248,248,240,0.55)` |
| `.j-level-pill` | `background: #ece8dc` (无 border) | `background: rgba(248,248,240,0.65)` + `border: 1px solid rgba(255,255,255,0.5)` |

### 视觉目标
- topbar 无奶油色边框/实色底/大阴影/大圆角卡片感
- 海洋视频从顶部透出，UI 像浮在海上
- 标题/子标题/进度数字用白半透明 text-shadow 保证可读
- 可选极弱顶部线性渐变压对比度（`.map-view::before`, `height: 4rem`）
- 左侧标题、中间进度、右侧星星/贝壳仍旧可读
- 竖屏/非 map-game-active 走 `.surface` 默认 cream 卡，不变
