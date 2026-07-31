# Cursor Review — Desert PEP R3（代码/前端审查）

席位：Cursor Auto（只审不改）  
审查时刻：2026-07-22  
Codex 信号：`.hermes-work/desert-pep-redo/codex-done.flag`（`parent-froze-after-codex-report`）  
事实锚点：`.hermes-work/pep-alignment/source-notes.md`；`docs/curriculum/desert-pep-classroom-transfer-review.md`；磁盘 `script.js` / `quiz.test.js` / `index.html` / `sw.js`  
红线遵守：未读/写 `.env`；未改 `script.js` / `quiz.test.js` / `index.html` / `sw.js` / `docs/curriculum/*.md`。

## 总判

**PASS**

五条分配审查项全部通过。运行时题库已从旧 20 生活短语主题切到 PEP 三上/三下 12 单元 × 200 关；答题页题干不再硬编码「单词」；`index.html` / `sw.js` / SW register 版本串一致；关键回归测试 5/5 绿。

---

## 1. desertLevels：PEP 12 单元 / 200 关 / metadata 全量

**PASS**

| 检查 | 结果 | 证据 |
|---|---|---|
| 长度 | `desertLevels.length === 200` | `script.js:567`；运行时核验 |
| ID | 唯一，首尾 `[1, 200]` | 运行时核验 |
| 单元数 | **12**，与 `source-notes.md` 三上 U1–U6 + 三下 U1–U6 对齐 | `script.js:45–342` |
| topic ≡ pepUnit | 一致 | 运行时核验 |
| 旧生活主题 | 无（`日常问候` 等 0 命中） | 运行时核验 |
| 旧偏离标题 | `Flush toilet` 等 0 命中 | 运行时核验 |

**12 单元清单（磁盘实值）：**

1. 三上 U1 Making friends（17）— `script.js:46–70`
2. 三上 U2 Different families（17）— `script.js:71–95`
3. 三上 U3 Amazing animals（17）— `script.js:96–`
4. 三上 U4 Plants around us（17）
5. 三上 U5 The colourful world（17）
6. 三上 U6 Useful numbers（17）
7. 三下 U1 Meeting new people（17）
8. 三下 U2 Expressing yourself（17）
9. 三下 U3 Learning better（16）
10. 三下 U4 Healthy food（16）
11. 三下 U5 Old toys（16）
12. 三下 U6 Numbers in life（16）— `script.js:318–341`；数组闭合 `script.js:342`

分布：`8×17 + 4×16 = 200`。OK。

**Metadata 全量（200/200 非空 string）：**

- 工厂：`makePepExpressionUnit` `script.js:27–43` 写入 `pepGrade` / `pepUnit` / `pepPart` / `pepFocus` / `functionTag` / `transferProbe` / `questionType` / `promptKind:'expression'`
- `buildLevelsFromUnits` 对象 entry 展开：`script.js:526–558`（`...metadata` 透传）
- 样本 L1：`pepGrade=3A`，`pepUnit=三上 U1 Making friends`，`pepPart=A`，`promptKind=expression`，`questionType=recognition`

**题型覆盖：**

| 类型 | 全局数 | 单单元 |
|---|---:|---|
| recognition | 60 | 每单元均有 |
| situation | 44 | 每单元均有 |
| dialogue | 43 | 每单元均有 |
| project | 53 | 每单元均有（≥3 种/单元，实为 4 种全覆盖） |

与 `source-notes.md` 目录锚点一致；三下多数单元无 Part C Project 目录项，但题库仍用 `project` 题型做迁移练习——产品可接受，官方 PDF 精修前属目录级对齐。

---

## 2. renderDetail 是否仍硬编码「单词」

**PASS**

| 检查 | 结果 | 行号 |
|---|---|---|
| `renderDetail` 用 helper | `questionSpoken = questionPromptText(level)`；`questionHtml = questionPromptHtml(level)` | `script.js:3713–3715` |
| 屏幕题干 | `${questionHtml}` | `script.js:3755` |
| 听题 aria | `questionSpoken` | `script.js:3760` |
| `renderDetail` 体内「单词」/「视频里学到的单词」 | **无** | `script.js:3706+` 源码扫描 |
| `level.question` 是否进 UI | **否**（`renderDetail` 不读 `level.question`） | 源码扫描 |
| 沙漠题干文案 | `课堂情境…哪一句英语表达是「…」？` | `script.js:1370–1373` |
| 海岛题干保留「单词」 | 仅非 `expression` 分支 | `script.js:1375` |

`questionPromptHtml` `script.js:1378–1383` 与 `questionPromptText` 同源，朗读/屏幕不叉。

---

## 3. index / sw 版本同步

**PASS**

| 位置 | 值 | 行号 |
|---|---|---|
| `index.html` script | `script.js?v=20260722-desert-pep-r3` | `index.html:31` |
| `sw.js` CACHE_NAME | `baby-island-shell-20260722-v233-desert-pep-r3` | `sw.js:1` |
| `sw.js` APP_SHELL | `./script.js?v=20260722-desert-pep-r3` | `sw.js:8` |
| `script.js` register | `./sw.js?v=20260722-desert-pep-r3` | `script.js:2174` |
| 测试断言 | 同串 | `quiz.test.js:357`、`366`、`1722`、`2747` |

`style.css?v=20260722-splash-v24` 在 html/sw 两侧仍对齐（`index.html:22` / `sw.js:7`），与本轮 script bump 不冲突。

---

## 4. quiz.test.js 关键回归覆盖

**PASS**（本轮范围）

已落地测试：

1. `desert map uses 200 PEP classroom-transfer expression levels` — `quiz.test.js:927–975`  
   - 200 / 唯一 ID / 12 `expectedPepUnits` / topic≡pepUnit  
   - 每关 metadata + `promptKind==='expression'` + 四题型集合  
   - 每单元 ≥3 题型 + 全局有 `project`  
   - 旧标题剔除；海洋前 10 关标题不变（防串改）
2. `desert question prompt uses classroom expression wording from one helper` — `quiz.test.js:977–986`  
   - 沙漠题干不含「单词」、匹配「英语表达|课堂情境」  
   - 海洋仍「视频里学到的单词」  
   - `renderDetail` 源码禁硬编码、强制 `questionPromptHtml(level)`
3. `H5 app shell registers a minimal offline cache` — `quiz.test.js:347–366` 版本串
4. splash / Holly 相关断言仍绿（旁证壳层未砸）

**实测：**

```text
node --test --test-name-pattern "PEP classroom-transfer|classroom expression|H5 app shell registers|quiz feedback uses Holly|app splash uses" quiz.test.js
→ 5 pass / 0 fail
```

整仓 `quiz.test.js` 仍有无关脏树失败（decor 密度、缺 asset、`style.css` 契约等）——Codex 报告已列；**不构成本轮 FAIL**。

---

## 5. PASS/FAIL 汇总（含行号）

| # | 项 | 判定 | 关键行号 |
|---|---|---|---|
| 1 | PEP 12 / 200 / metadata 全量 | **PASS** | `script.js:27–43`、`45–342`、`526–558`、`567` |
| 2 | `renderDetail` 无硬编码「单词」 | **PASS** | `script.js:1370–1383`、`3706`、`3713–3715`、`3755`、`3760` |
| 3 | index/sw 版本同步 | **PASS** | `index.html:31`；`sw.js:1,8`；`script.js:2174`；`quiz.test.js:357,366,2747` |
| 4 | 关键回归测试覆盖 | **PASS** | `quiz.test.js:927–986`（+ 壳层 347–366） |
| 5 | 总判 | **PASS** | — |

---

## WARN（不改总判，下游应知）

1. **死字段仍单词腔**：`buildLevelsFromUnits` 仍写 `question: Which word means ${zhTitle}?` 与 `guidance: …跟读 ${title}`（`script.js:548–549`）。UI 不用，但导出/文档/调试会误导。建议后续按 `promptKind` 分支。
2. **变量名残留**：`desertPhraseUnits`（`script.js:45`）名还写 Phrase；内容已是 PEP expression。
3. **题干音频**：`sw.js:3` 仍挂 `question-audio-manifest.json?v=20260719-question-200-nouns-v2`；manifest 仍是海岛「单词」句。沙漠 `expression` 题干 TTS/MP3 可能缺或回落失败——独立资产任务。
4. **`apps/frontend/dist/script.js` 仍旧生活短语**（grep 见 `日常问候` 等）。若发布吃 dist，需另跑 copy/build；根目录 H5 源已 R3。
5. **官方 PDF 边界**：对齐仍是目录级（`source-notes.md`）；非逐页教材原句。`docs/curriculum/desert-pep-classroom-transfer-review.md` 已声明。

---

## 审查方法（可复现）

```bash
# 结构核验
node -e "const m=require('./script.js'); /* length/units/meta/prompt */"

# 关键绿测
node --test --test-name-pattern \
  'PEP classroom-transfer|classroom expression|H5 app shell registers|quiz feedback uses Holly|app splash uses' \
  quiz.test.js
```

未修改任何 DO NOT MODIFY 文件。本文件为唯一写入输出。
