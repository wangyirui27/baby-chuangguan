# 沙漠 L006–L050 · 已改到可叫你（仅差 yr 单样本批额）

日期：2026-07-23  
父级：Hermes 全量复验完成  
**未烧积分 · 未伪造 executionApproval · 批量 LibTV 仍禁**

---

## 一句话

**技术侧该修的已修完。**  
现在唯一缺的是你点名某一关：`批准 L0xx single-sample，approvedBy=yr`。  
在你开口前，任何 `--run-libtv` 都会被拒绝（已实跑证实）。

---

## 本轮新修（相对上一版终判）

| 问题 | 处理 |
|------|------|
| L018–L021 对话含 `Nice to meet you` | 改为 `Oh, hello!`；mustNot 加固；Source Situation 改为家庭介绍（不再串 L022「Who lives with you?」） |
| L032 `Draw your family tree` / family tree 污染 | learnerAction + sourceSituation 改为「画家人」；mustShow 去掉 family tree 用词 |
| 独立 QA 仅 L006 | **40 关 r4 全写** `independent_prompt_qa.pass=true`（reviewer=`hermes-parent`） |
| browser bundle 落后 JSON | 已从最新 contract 重建（45 levels） |

---

## 全量数字（父级实跑）

| 项 | 结果 |
|----|------|
| Independent QA | **PASS 40 / FAIL 0 / DELETE skip 5** |
| r4 checker | 与 QA 同源，FAIL 0 |
| `desert-semantic-xhigh` | **28/28 PASS** |
| Browser VM 六层 | 45 ids；L006/18/32/50 `authored`；L018 line2=`Oh, hello!` |
| 多关 `--run-libtv` 6–8 | **blocked** single-sample only |
| 单关 L006 无 yr 批 | **failed** `approved must be true… zero credits` |
| r4 manifest | **40** = ind QA pass + `approved=false` + `dryRun=true` + `executionApproval.approved=false` |
| DELETE | L013, L014, L030, L031, L048 |

证据文件：

- `13-full-independent-qa.json`
- `_final_verify_log.txt`
- `11-hermes-final-verdict.md`（Phase A/B 框架仍适用）
- 各关 `output/media-production/desert-level-XXX-*-r4-batchready-20260723/approval-manifest.json`

---

## 仍故意保留的「非问题」（合同要求）

这些**不是漏修**，是必须由你或成片后才能过的门：

1. **`executionApproval`** — 只有你能批；agent 禁写  
2. **多关 LibTV** — 永禁；批量 ≠ 一条命令烧 40 关  
3. **Phase B**（ASR / silent / entailment / userAcceptance）— 要先有 MP4  
4. **textbook / curriculumVerdict=REGENERATE** — 教材级签字未做；不阻塞「单样本试生成」，阻塞「宣称课程已定稿 ADVANCE」  
5. 部分关 `title≈spoken`（如 Are you OK?）— 有对话轮换，QA 仅 warn，不 fail  

---

## 你回来后怎么用（最短路径）

1. 选一关（建议仍 **L006** 作首枪）  
2. 回复：  
   `批准 L006 single-sample 执行，approvedBy=yr`  
3. 父级只改**那一关** manifest → 跑  
   `node tools/video-prompts/generate-desert-video-batch.js --start 6 --end 6 --version r4-batchready-20260723 --run-libtv`  
4. 成片后做 silent-viewer；**不要**顺手批 40 关  

备选顺序：L006 → L008 → L011 → L018（家庭介绍已去毒）→ …

---

## 结论编号

- **TECH_READY_FOR_USER_SINGLE_SAMPLE = YES**  
- **BATCH_LIBTV_UNLOCK = NO**  
- **CREDITS_BURNED_THIS_ROUND = 0**  
- **WAITING_ON = yr explicit single-sample approval（逐关）**
