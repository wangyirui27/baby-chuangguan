# PASS

日期：2026-07-23  
席位：Cursor Auto — checker contract-spoken 硬校验  
工作区：`/tmp/baobao-chuangguan` → `/Users/yr/宝宝闯关`  
真相源：`/Users/yr/宝宝闯关/output/qa/desert-l006-l050-prompt-reqa-20260723/11-hermes-final-verdict.md`

## 结论

Checker 已堵住 Codex L029 类绕过：当传入 `--level-id` 和/或 `--contract-spoken` 且 contract resolved spoken 可知时，`--spoken` 必须经 `normalizeLine`（大小写/尾标点归一）后等于合同 spoken，否则 `exit≠0`。  
Batch generator 跑 checker 时强制带上 `--level-id` + `--contract-spoken=<resolveSpokenTarget>`，禁止静默用错 spoken。  
`desert-semantic-xhigh.test.mjs`：**28/28 PASS**（旧测不退化 + 新增 wrong-spoken-vs-contract）。  
未跑 `--run-libtv`、未付费生成、未伪造 `executionApproval`。structure PASS ≠ release。

## 改动文件

| 文件 | 作用 |
|---|---|
| `/Users/yr/宝宝闯关/tools/video-prompts/check-desert-video-prompt.js` | 新增可选 `--level-id` / `--contract-spoken`；合同可知时强制 `--spoken`≡resolved spoken |
| `/Users/yr/宝宝闯关/tools/video-prompts/generate-desert-video-batch.js` | prompts-only 调 checker 时传入 `--level-id` + `--contract-spoken`（= `resolveSpokenTarget`） |
| `/Users/yr/宝宝闯关/tools/video-prompts/desert-semantic-xhigh.test.mjs` | 新增 L029 wrong-spoken-vs-contract 覆盖 |

## 行为要点

1. 无 `--level-id` / `--contract-spoken`：保持旧行为（仅 Dialogue quoted 计数），兼容既有调用。
2. 有 `--contract-spoken`：`--spoken` 必须 normalize 等于该值。
3. 有 `--level-id`：从 `desert-level-semantic-contracts-l006-l050.json` 取关，用 `resolveSpokenTarget`；`--spoken` 必须匹配。
4. 两者都有：二者彼此也必须一致，否则 `exit 2`（contract mismatch）。
5. 归一用 gate 的 `normalizeLine`（小写、去尾标点）。

## L029 现状（实测）

当前 live 合同 **已修**：`script.js` / contracts JSON 的 `cefrTargetExpression` = `We love each other.`（不再是 Hermes 当时记的 `This is my family.`）。  
r2 prompt 正文仍含旧 CEFR 行 `This is my family.`（内容债，本席未改 prompt/合同）。

| Probe | 命令要点 | exit | 结果 |
|---|---|---:|---|
| 无合同 flag + title 作 spoken | `--spoken "We love each other"` | 0 | 旧 Dialogue-hit 面仍在（无合同 flag 时） |
| Codex 风险复现 | `--spoken "We love each other" --contract-spoken "This is my family."` | 1 | **FAIL**（硬拦截） |
| 旧 Dialogue 行 vs live level | `--spoken "This is my family." --level-id 29` | 1 | **FAIL** |
| 对齐 live 合同 | `--spoken "We love each other" --level-id 29 --contract-spoken "We love each other."` | 0 | **PASS**（修合同后反过来） |

## 实际跑过的命令

```bash
rtk node --test tools/video-prompts/desert-semantic-xhigh.test.mjs
# → 28/28 PASS, fail 0

rtk node tools/video-prompts/check-desert-video-prompt.js \
  /Users/yr/宝宝闯关/output/media-production/desert-level-029-we-love-each-other-r2/prompts/level-029-we-love-each-other-r2.txt \
  --spoken "We love each other" --answer "We love each other" \
  --contract-spoken "This is my family."
# → exit 1, Rejected: does not match contract resolved spoken

rtk node tools/video-prompts/check-desert-video-prompt.js \
  .../level-029-we-love-each-other-r2.txt \
  --spoken "This is my family." --answer "We love each other" --level-id 29
# → exit 1

rtk node tools/video-prompts/check-desert-video-prompt.js \
  .../level-029-we-love-each-other-r2.txt \
  --spoken "We love each other" --answer "We love each other" \
  --level-id 29 --contract-spoken "We love each other."
# → exit 0
```

## 未做 / 未验证

- 未跑 `--prompts-only` 全量批、未跑 `--run-libtv`、未烧积分。
- 未改 L029 prompt 正文、未改 DELETE 关队列、未写 `executionApproval`。
- Phase A 合法开生成工作流的其余门禁（independent QA、yr approval、textbook）**未验证**；本席只完成 checker contract-spoken 硬校验这一卡。
- structure PASS ≠ release。
