# Grok — 前端 script.js 六层挂载只读审计

日期：2026-07-23  
工作区：`/tmp/baobao-chuangguan` → `/Users/yr/宝宝闯关`  
真相源：`/Users/yr/宝宝闯关/output/qa/desert-l006-l050-prompt-reqa-20260723/11-hermes-final-verdict.md`  
输出：`/Users/yr/宝宝闯关/output/qa/desert-l006-l050-batch-ready-20260723/08-grok-frontend-attach-audit.md`  
范围：script.js / attach 路径 / desertLevelVideoOverrides / Phase B 门禁 / 地图关卡列表回归  
未做：付费生成、`--run-libtv`、伪造 `executionApproval`、改 single-sample 硬限制

## 总结论

| 项 | 结果 |
|---|---|
| 浏览器能否拿到 L006-L050 authored 六层 | **FAIL** — 仍 missing |
| Node/tests 能否 attach L006-L050 六层 | **PASS** — 45/45 authored |
| Codex browser attach 是否已落地 | **未落地**（无 `02-codex-browser-six-layer-attach.md`，无 browser bundle） |
| `desertLevelVideoOverrides` 是否误挂 L006-L050 | **未误挂** — 仅 L001-L005 |
| Phase B override mount / batch unlock 门禁 | **仍 fail-closed** |
| 地图/关卡列表前端回归 | **未发现** — 无需补丁 |
| 本卡是否改代码 | **否**（只读；无地图回归；browser attach 属 Codex 卡） |

**与真相源一致**：M3/总判指出的 “Node-only contract attach；浏览器 L006-L050 authored six-layer 不成立” **仍然成立**。

---

## 1. 实际跑过的命令

```bash
# 工作区确认
ls -la /tmp/baobao-chuangguan
# → symlink → /Users/yr/宝宝闯关

# contract JSON 覆盖
node -e '/* parse desert-level-semantic-contracts-l006-l050.json */'
# levelCount=45, idRange 6..50, missing=[]

# Node require(script.js) 六层状态
node -e 'const {desertLevels}=require("./script.js"); ...'
# L006-L050 spoken authored 45/45, visual authored 45/45
# video mount ids = [1,2,3,4,5] only

# 浏览器 VM（无 module/require）+ 探针捕获 desertLevels
node <<'EOF' # vm.createContext, ATTACH_BRANCH=false
# L006-L050 spoken missing 45/45, visual missing 45/45

# Phase B helpers
node -e 'require("./tools/video-prompts/generate-desert-video-batch.js") ...'
# assertOverrideMountAllowed(empty) BLOCK
# assertBatchUnlockAllowed(empty) BLOCK
# assertSingleSampleRunAllowed multi-level BLOCK
# assertSingleSampleRunAllowed single OK (structural only)

# 回归测试（本卡相关子集）
node --test tools/video-prompts/desert-semantic-xhigh.test.mjs
# 26/26 PASS

node --test --test-name-pattern="desert|map world|levelsForMapWorld|six-layer|semantic" quiz.test.js
# 7/7 PASS
```

工作目录一律：`/tmp/baobao-chuangguan`（中文路径 terminal workdir 会被拦截）。

---

## 2. attach 路径审计（源码级）

### 2.1 源码位置

`/Users/yr/宝宝闯关/script.js`

- L611-667：`desertLevelVideoOverrides` **仅 keys 1..5**
- L669-674：overrides 写入 `desertLevels[id-1]` 并 `resolveCourseVideoSrc`
- L676-706：`applyDesertSixLayerSemantics` IIFE
  - 全关默认：`spokenDialogue.status='missing'`、`visualSemantics.status='missing'`
  - 注释原文：`Browser keeps status=missing until a future bundled contract ship`
  - attach 仅在：

```js
if (typeof module !== 'undefined' && typeof require === 'function') {
  try {
