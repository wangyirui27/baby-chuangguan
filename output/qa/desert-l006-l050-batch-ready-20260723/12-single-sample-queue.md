# 单样本队列（Phase A 后 · 不烧积分）

日期：2026-07-23  
依据：`11-hermes-final-verdict.md`（Phase A PASS / 批量仍禁）  
原则：independent QA ≠ executionApproval；**只有 yr 能批烧分**

---

## 状态总览

| 项 | 状态 |
|----|------|
| 批量 `--run-libtv` | **禁** |
| r4 checker 40 关 | 全绿 |
| DELETE | L013/014/030/031/048 skip |
| independent_prompt_qa | **L006 已写 pass**；L008/L011 报告 PASS 待落 manifest |
| executionApproval | **全部 false**（等你） |
| 推荐首烧 | **L006** |

---

## 推荐顺序（TOP3）

| 优先级 | 关 | spoken | 为何先做 | independent QA |
|--------|----|--------|----------|----------------|
| **1** | **L006** My name is... | `My name is Tom.` | 自我介绍核心句；mustNot 明确禁 Nice to meet you；画面胸口指认可 silent 验收 | **PASS**（已写入 r4 manifest） |
| 2 | L008 I'm Chen Jie | `I'm Chen Jie.` | 陈述名 vs 问名；结构干净 | 报告 PASS，manifest 未改（等 L006 闭环） |
| 3 | L011 Are you OK? | `Are you OK?` | 关心句；mustNot 禁搀扶，和 L012 help 边界清 | 报告 PASS，manifest 未改 |

完整打分见 `_single_sample_rank.json`；明细见 `12b-independent-qa-L006-L008-L011.md`。

**暂不推荐首烧**：项目题（L032/049/050）、野生动物展示题（L043–046）、L029（虽 checker 绿，情感句 silent 难验）。

---

## L006 已具备的 pre-LibTV 字段

路径：`output/media-production/desert-level-006-my-name-is-r4-batchready-20260723/approval-manifest.json`

| 字段 | 值 |
|------|-----|
| structure.pass | true |
| automated_preflight.pass | true |
| independent_prompt_qa.pass | **true** |
| independent_prompt_qa.reviewer | `hermes-parent` |
| promptSha256 | 与 r4 prompt **一致** |
| approved | **false**（仍缺） |
| dryRun | **true**（仍缺改 false） |
| executionApproval.approved | **false** |
| executionApproval.scope | null → 需 `single-sample` |
| executionApproval.approvedBy | null → 需 `yr` |

---

## 你要批单样本时（唯一合法烧分开关）

确认已读 `12b` 里 L006 六层结论后，回复一句即可，例如：

> **批准 L006 single-sample 执行，approvedBy=yr**

父级才会改（且只改 L006）：

```json
"approved": true,
"dryRun": false,
"executionApproval": {
  "approved": true,
  "scope": "single-sample",
  "approvedBy": "yr",
  "approvedAt": "<ISO时间>",
  "note": "user explicit single-sample for L006 only"
}
```

然后**仅**跑：

```bash
# 工作区确认 r4 目录为该关 outDir 后：
node tools/video-prompts/generate-desert-video-batch.js --start 6 --end 6 --run-libtv
```

（具体 CLI 以仓库当前 generate 入口为准；父级执行前会再跑 `approvalManifestStatus` 探针，失败则不烧。）

---

## 明确不会做的事

1. 不伪造 yr 批额  
2. 不改 multi-libtv 限制  
3. 不把 L008–L050 批量标 approved  
4. 不把 independent QA 当成 release / Phase B unlock  
5. DELETE 五关不进队列  

---

## 队列外 37 关

r4 checker 绿 ≠ 已 independent QA。  
L006 成片 + silent-viewer 验收通过后，再按同一模板逐关推进；**禁止**因 L006 过就解锁 bulk。
