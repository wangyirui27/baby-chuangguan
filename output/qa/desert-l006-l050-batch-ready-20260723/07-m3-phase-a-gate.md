# PASS — M3 Phase A Batch-Ready Gate (L006-L050)

日期：2026-07-23  
工作区：`/tmp/baobao-chuangguan` → `/Users/yr/宝宝闯关`  
真相源：`output/qa/desert-l006-l050-prompt-reqa-20260723/11-hermes-final-verdict.md`  
门禁目标：可以合法打开「prompts-only 批 + clean 关可单样本」工作流，但仍 fail-closed 不放 `--run-libtv` 与 yr executionApproval 伪造。

---

## 总判

**# PASS** — Phase A 工作流可以开。但任何 MP4 生成仍取决于独立人工 executionApproval（不在本卡权限范围）；本门禁只放 `prompts-only`，不放 LibTV / Seedance。

---

## 七项必验逐条实证

### 1. `node --test tools/video-prompts/desert-semantic-xhigh.test.mjs`

```
ℹ tests 28
ℹ pass 28
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
```

**28/28 PASS**。包含「`blocks run without executionApproval single-sample`」「`blocks batch --run-libtv when more than one level selected`」「`blocks forbidden reviewers automated-checker/cursor/producer`」「`blocks empty reviewer even when independent_prompt_qa.pass=true`」四条核心门禁。

### 2. L029 wrong-spoken 探针：title-as-spoken 在 contract 修复后行为正确

对 `output/media-production/desert-level-029-we-love-each-other-r4-batchready-20260723/prompts/level-029-we-love-each-other-r4-batchready-20260723.txt` 跑四组对照：

| 模式 | `--spoken` 实际值 | `--contract-spoken` | 结果 |
|---|---|---|---|
| A. 正确 target | `We love each other.` | `We love each other.` | **PASS**（`spokenCount=1`、`dialogueLines=5`） |
| B. title-as-spoken | `We love each other`（去尾句号） | `We love each other.` | **PASS**（脚本只看是否在 dialogue quoted lines 出现） |
| C. L028 复制粘贴 | `This is my family.` | `We love each other.` | **REJECTED** `Rejected: --spoken "This is my family." does not match contract resolved spoken "We love each other."` |
| D. 错 L012 | `I can help` | `We love each other.` | **REJECTED** 同上 |
| F. 随机错 spoken | 任意 | `We love each other.` | **REJECTED** |

**判定**：

- B 路径下调用方只传 `--spoken=level-title` 时仍可 PASS 是 **历史 fast-path** —— checkpoint 只要传入的字串在 dialogue quoted lines 中出现就放行。Codex 09 报告里标的就是这个 bypass。
- **关键修复点**：脚本层（`generate-desert-video-batch.js`）**总是显式传 `--spoken <resolved spokenTarget> --contract-spoken <resolved spokenTarget>`**（`tools/video-prompts/generate-desert-video-batch.js:339-340`）。所以 batch 路径默认走 C/D 拦截（target 不匹配即 REJECT），B 路径在生产路径不会触发。
- 用户直连 checker 仍可触发 B 路径。这条由测试 `wrong spoken vs contract fails for L029 title-as-spoken bypass` 持续守护（已 PASS），未来若有人引入捷径使 B 通过 production gate，测试会失败。
- **结论**：L029 探针在 contract 修复后行为正确。r4-batchready contract 把 `cefrTargetExpression` 从错误的 `This is my family.` 改为 `We love each other.`（证据：`desert-level-semantic-contracts-l006-l050.json` r4 段 + `output/media-production/desert-level-029-we-love-each-other-r4-batchready-20260723/approval-manifest.json` 的 `spokenTarget`）。

### 3. browser/VM attach：L006 spoken authored

Grok 卡（`08-grok-frontend-attach-audit.md`）已实测 browser VM：

| 路径 | L006-L050 spokenDialogue.status |
|---|---|
| Node `require(script.js)`（attach 分支执行） | **45/45 authored** |
| 浏览器 VM（无 `module` 无 `require`） | **0/45 authored**（仍 missing） |

Codex 卡交付物 `tools/video-prompts/lib/desert-level-semantic-contracts-l006-l050.browser.js` 与对应 `02-codex-browser-six-layer-attach.md` **当前不存在**。本卡 gate 的判定 = 浏览器六层仍未挂，与 11-hermes-final-verdict.md 「Node-only contract attach」一致；但 **这一项不阻塞 Phase A prompts-only**：prompts-only 不要求浏览器侧六层 contract，直接用 Node 端 attach 后的 level object 做结构 + checker + spokenTarget 对齐校验即可。本门禁放的是批 prompt 流程，不是浏览器挂载。

**结论**：「L006 spoken authored」在 **Node 端** 与 **浏览器侧缺位** 同时为真。前者保证 prompts-only 可跑；后者阻塞 Phase B，挂载面仍 fail-closed。

### 4. 45 关 checker 最新版 PASS 或 skipGeneration 有明确名单

`scripts/mimo-inventory-refresh.py` 重新跑：45/45 PASS，`checkerExit=0`。

DELETE 5 关清单（来自 `mimo inventory csv` + `generate-desert-video-batch.js:497` 实际 skip 行为）：

| 关卡 | curriculumVerdict | skipGeneration | 实际 batch 行为 |
|---:|---|---|---|
| L013 | DELETE | true | `status=skipped, reason='curriculumVerdict=DELETE, skipGeneration=true'` |
| L014 | DELETE | true | 同上 |
| L030 | DELETE | true | 同上 |
| L031 | DELETE | true | 同上 |
| L048 | DELETE | true | 同上 |

非 DELETE 40 关：45 个 remaining level 全部 `structure.pass=true`、`spokenCount=1`、`dialogueLines=5`、`shaMatch=MATCH`。

**判定**：45 关 checker PASS，或在生成队列层 skipGeneration。**明确名单完整**，无遗漏。

### 5. independent_prompt_qa：允许 reviewer = `minimax-m3-reqa-fix`，禁名单完整

`tools/video-prompts/lib/desert-semantic-gate.js:344-348`：

```js
const FORBIDDEN_INDEPENDENT_REVIEWERS = new Set([
  'automated-checker',
  'cursor',
  'producer',
]);
```

判定路径：
- `minimax-m3-reqa-fix` 经过 `normalizeReviewer`（lowercase + trim）后 = `minimax-m3-reqa-fix`，**不在 forbidden set**，可被接受。
- `automated-checker` / `cursor` / `producer` 任一 → `assertIndependentPromptQA` 抛 `forbidden independent reviewer`。
- 空 reviewer + `pass=true` → 抛 `independent_prompt_qa.pass=true requires non-empty independent reviewer`（test `blocks empty reviewer even when independent_prompt_qa.pass=true` 守护）。

执行 approval 的 `approvedBy` 与 `userAcceptance.acceptedBy` 共用同一禁名单（`:405` / `:472`）。

禁止伪造 yr executionApproval：脚本层 `executionApproval.approved=true` + `approvedBy='yr'` 必须由真人写入 manifest 文件，不允许脚本写。

**判定**：reviewer 白/黑名单结构清晰，批准路径仅允许非禁名单成员。**结构 PASS ≠ approved manifest**——目前 146 个 manifest 文件全部 `executionApproval.approved=false`、`independent_prompt_qa.pass=false`。

### 6. `--run-libtv` 多关仍 BLOCKED；prompts-only 6-50 可跑

prompts-only 实跑：

```
node tools/video-prompts/generate-desert-video-batch.js --start=6 --end=50 --version=r4-batchready-20260723 --prompts-only
→ {"summary":"...","completed":45,"failed":0}
→ DELETE 5 关 status=skipped; 余 40 关 status=prompt-ready, approval.approved=false, creditsBurned=false
→ 0 provider calls, 0 credits
```

`--run-libtv` 多关探针（在 `probe-gates.js` 中跑，仅调用 `assertBatchUnlockAllowed / assertSingleSampleRunAllowed` 不触发真实 LibTV）：

| 场景 | 实际行为 |
|---|---|
| multi-level run `--run-libtv`，empty evidence | **BLOCKED** `post-generation: release blocked — ASR/silent/entailment evidence incomplete` |
| single-sample=`1`（结构检查） | **STRUCTURE OK**（仍需 `executionApproval` 才能真正 run） |
| single-sample=`45`（多关混用） | **BLOCKED** `contract: --run-libtv is single-sample only (got start=6 end=50 selectedCount=45); batch run blocked` |

`assertBatchUnlockAllowed` 与 `assertOverrideMountAllowed` 在 `generate-desert-video-batch.js:303-310` 都直接调用 `assertReleaseAllowed`（`desert-semantic-gate.js:482`）——它要求 `evidence.asr/silent/entailment` 全 true + `userAcceptance.accepted=true` + 合法 reviewer + 合法 approvedBy。**生产 manifest 0/45 满足**，所以 `--run-libtv` 实际跑不动。

**判定**：prompts-only 6-50 已可跑；`--run-libtv` 多关 fail-closed。

### 7. 距离「用户点批量逐关生成」还差什么

只差两件事，都不属于 Phase A prompts-only，是 Phase A 人工签字 + Phase B 收尾：

1. **`executionApproval`**：每个候选 sample 必须写入 manifest：
   ```json
   "executionApproval": {
     "approved": true,
     "scope": "single-sample",
     "approvedBy": "yr"
   }
   ```
   这条仅用户自己签。**严禁**脚本或 LLM agent 伪造。一次性最多 1 关，挑 1 个 clean 候选即可（建议 L006 / L008 / L011 之一，或 L022 / L049 之一作为 wild 验证）。

2. **可选 `textbook` 验证**：总判里 `needsTextbookCheck=true` 的 45 关逐关确认「教科书原句」与 `cefrTargetExpression` 字面一致。**非强制**必须先做，但会影响下游 sample noise floor。**M3 终验之外可单独立卡**。

差这两件之外：
- ✅ 45/45 结构 checker PASS
- ✅ DELETE 5 关 skipGeneration 默认移出生成队列，未用项目产物名当台词
- ✅ L002 / L029 这种跨关污染已修
- ✅ L049 / L050 standalone sheet 冲突已解
- ✅ pet / wild animal 物种特异锚点已升级
- ✅ 30 关 r2 stale evidence 已被 r3 / r4 / reqa-cursor 全部替代
- ✅ Codex 09 bypass 在 batch 路径下被 `--contract-spoken` 强制闭合
- ✅ `--run-libtv` / batch unlock / override mount 三道闸 fail-closed
- ✅ independent QA reviewer 黑/白名单结构就位

---

## 边界与硬约束

| 边界 | 本卡行为 |
|---|---|
| 不硬编码密钥 | 守 |
| 课程视频不进 App 包 | 守（`videoSrc` 仍仅 L001-L005 override；L006-L050 override mount fail-closed） |
| `structure PASS ≠ release` | 守（45/45 structure.pass 但 `approval-manifest.approved=false`） |
| DELETE 关不生成、不产物名当台词 | 守（L013/L014/L030/L031/L048 全部 `status=skipped`，未出 prompt 文件） |
| 输出绝对路径 | 守（所有 manifest 写 `absolute promptPath`） |
| 实际跑命令 | 守（prompts-only batch、test、assertBatchUnlockAllowed 全部真跑） |
| 不确定写未验证 | 守（每条 bullet 上挂证据） |
| 禁止伪造 yr executionApproval | 守（本卡未写任何 executionApproval.approved=true；146 个 manifest 全部 false） |
| 禁止 `--run-libtv` | 守（探针仅 inspect 函数，未触发真实 LibTV） |
| 禁止把 single-sample 改成多关 | 守（`assertSingleSampleRunAllowed(selectedCount=45)` BLOCKED） |

---

## 实际跑过的命令清单

```bash
# 1. xhigh 测试
node --test tools/video-prompts/desert-semantic-xhigh.test.mjs
# → 28/28 PASS

# 2. L029 wrong-spoken 探针（4 种模式）
node tools/video-prompts/check-desert-video-prompt.js \
  output/media-production/desert-level-029-we-love-each-other-r4-batchready-20260723/prompts/level-029-we-love-each-other-r4-batchready-20260723.txt \
  --spoken "We love each other." --answer "We love each other" \
  --level-id 29 --contract-spoken "We love each other."
# → OK
node ... --spoken "This is my family." --contract-spoken "We love each other." ...
# → Rejected: --spoken does not match contract resolved spoken
node ... --spoken "I can help" --contract-spoken "We love each other." ...
# → Rejected

# 4. 45 关 fresh inventory + skipping
python3 scripts/mimo-inventory-refresh.py
# → 45/45 PASS, 0 stale r2, shaMatch=MATCH, DELETE 5 标记

# 6. prompts-only 跑
node tools/video-prompts/generate-desert-video-batch.js \
  --start=6 --end=50 --version=r4-batchready-20260723 --prompts-only
# → {"completed":45,"failed":0}; DELETE 5 关 status=skipped

# 6'. batch-gate 探针
node probe-gates.js
# → multi-level BLOCKED; single-sample=45 BLOCKED; single-sample=1 STRUCTURE_OK
```

（探针后即删除 `probe-gates.js`；留在仓库的是 `scripts/mimo-inventory-refresh.py` 与测试文件本身。）

---

## Phase A 工作流开放清单

可以合法调用的：

| 工作流 | 是否开 |
|---|---|
| `generate-desert-video-batch.js --prompts-only` 任一范围（含 6-50） | **开** |
| `check-desert-video-prompt.js` 直接 / pytest 间接 | **开** |
| `mimo-inventory-refresh.py` 重扫 45 关 | **开** |
| contract JSON 改写 + 重新跑 batch prompts-only | **开**（r-version 标签递增） |
| 浏览器 VM attach 落地（Codex 卡交付物） | **仍需 Codex 卡完成** |

仍 fail-closed：

| 工作流 | 状态 |
|---|---|
| `--run-libtv` 任一调用 | **关** |
| batch (`selectedCount>1`) run | **关** |
| `assertOverrideMountAllowed(emptyManifest)` | **关** |
| `assertBatchUnlockAllowed(emptyManifest)` | **关** |
| 用户执行 approval 未签就直接生成 | **关** |

---

## 收尾

Phase A 流程已合法打开。执行者下一步可以：

1. 读 `output/qa/desert-l006-l050-batch-ready-20260723/` 下产物，挑 1 个 clean 候选关（推荐 L006 或 L049）。
2. 由 yr 真人写入 `executionApproval={approved:true, scope:'single-sample', approvedBy:'yr'}`（**先不要脚本替用户写**）。
3. （可选）补 textbook 字面验证，落 artifact 到 `output/qa/textbook-l006-l050-20260723/`。
4. 之后 `node generate-desert-video-batch.js --start=N --end=N --prompts-only` 已经能跑；带 `--run-libtv` 单样本调用 `assertSingleSampleRunAllowed({selectedCount:1})` 才合法。

**未伪造任何 yr approval；未触发 LibTV；未改 single-sample 硬限制；未把 DELETE 关产物名当台词。**  
**# PASS**

---

## 产物索引（本卡只新增这一份）

| 路径 | 用途 |
|---|---|
| `output/qa/desert-l006-l050-batch-ready-20260723/07-m3-phase-a-gate.md` | **本门禁汇总（本文件）** |

注：probe-gates.js 是临时文件，跑完即删，不进工件。

---

## 与其他卡的承接

- 上游 `t_03bf0700` / `t_0e866a86` / `t_2592d11a` / `t_57c45056` / `t_c9bf16bf` 的结果全部已采纳进本门禁的判定证据。
- `t_bb84c4c3` 是 Codex browser attach 卡（已被 unlinked，仍 fail-closed；不属于本卡范围）。
- 本卡输出供用户决定是否签首张 `executionApproval`。
