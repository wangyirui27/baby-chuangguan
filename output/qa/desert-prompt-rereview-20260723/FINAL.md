# 6-50 关文生视频提示词复质检 — 总结论

时间：2026-07-23
范围：沙漠 L006-L050，canonical r2 prompts only

## 结论

**FAIL：不要把 `independent_prompt_qa.pass` 改成 true，不要批准 LibTV / Seedance。**

原因不是文件缺失，也不是格式 checker 失败；这些全绿。真实阻塞在 **提示词语义唯一性 / 干扰项串味 / provider 正向提示与负向禁令冲突**。

## 已审项目

| 项 | 结果 |
|---|---:|
| r2 prompt 文件 | 45/45 存在 |
| `prompt-check.json` | 45/45 `ok=true` |
| prompt sha256 ↔ `approval-manifest.json.promptSha256` | 45/45 一致 |
| `approval-manifest` 安全门禁 | 45/45 正确保持 blocked：`approved=false`、`dryRun=true`、`creditsBurned=false`、`independent_prompt_qa.pass=false` |
| 旧 v1 与 r2 隔离 | 45/45 隔离；v1 只作失败证据 |
| raw/final/contact-sheets | 45/45 空；未生成视频，未烧积分 |
| 结构 checker | 45/45 PASS，仅证明格式与基础片段齐全 |
| 独立 prompt 内容 QA | FAIL，见下表 |

## 未审项目

没有真实 MP4，所以以下全部 **未审**：真实画面、contact sheet、原生音轨、ASR、口型、音量、silent forced-choice、distractor entailment。当前只审 prompt 文本与门禁文件。

## 七席执行情况

配额快照：snapshot age 170.7s。Grok 1% 被硬排除。

| 席位 | 剩余 | 动作 | 产物 |
|---|---:|---|---|
| MiniMax/M3 | 90% | L006-L020 prompt QA | `01-m3-l006-l020.md` |
| ZAI/GLM | 75% | L021-L035 prompt QA | `02-zai-l021-l035.md` |
| DeepSeek | 68% | L036-L050 prompt QA | `03-deepseek-l036-l050.md` |
| Mimo | 60% | 45 关 manifest / canonical / hash 审计 | `04-mimo-manifest-canonical-audit.md` |
| Codex gpt-5.5 xhigh | 68% | 自动语义扫描 | `05-codex-automated-semantic-scan.md/json/js` |
| Cursor Auto | 41% | 跨全量 human-semantic QA | `06-cursor-cross-review.md` |
| Grok | 1% | 硬停派 | 无 |

Kanban board：`desert-prompt-rereview-20260723`

## 必须返修 / 复验的 P0 关卡

| 关 | 问题 | 证据 |
|---:|---|---|
| L006 | 正确项 `My name is...`，但结尾直接说了干扰项 `Nice to meet you!` | Cursor F1 |
| L008 | 第一拍把正确项和干扰项放同一句：`I'm Chen Jie. What's your name?` | Cursor F2 |
| L011 | `Are you OK?` 场景里出现 `Let me help you.`，串到干扰项 `I can help` | Cursor F3 |
| L014 | `kind words` 仍用 mind map 视觉，静音会选 `friend mind map`；且 card/icon 与 no-card 约束冲突 | Cursor F4 |
| L017 | `be a good friend` montage 包含 `打招呼`，串到 `say hello first` | Cursor F11 |
| L022 | 正确项是问题 `Who lives with you?`，对白又说出近似干扰项 `I live with my mum and dad.` | Cursor F5 |
| L025 | 正确项是陈述 `I live with my parents`，第一拍先说干扰项 `Who lives with you?` | Cursor F5 / ZAI risk |
| L031 | `add a family photo` 发生在 existing family tree 上，静音会选 `family tree` | Cursor F6 |
| L033 | `talk about family` 拿着 family tree 介绍，项目道具串味 | Cursor F7 |
| L039 | 正向 prompt 写 `Child A（教师角色）`，但负向 prompt 禁 `teacher/classroom` | Cursor F8 / Codex |
| L042 | 只写“指着一个动物问”，没有 pet vs wild 对照；静音不能推出分类问题 | Cursor F9 / DeepSeek low risk |
| L049 | `draw a pet` 放在 picture-book pet page，结尾说 `our book has a cat page`，串到 `animal picture book` | Cursor F10 |
| L034 | `different families` 只有 1 个具体视觉锚点，其余为嘴脸/无字样板；家庭对比语义偏薄 | Codex |
| L046 | `Ooh ooh aah aah!` 是非英语动物声，和 no gibberish / natural English hard gate 冲突 | Codex |
| L047 | 正向 prompt 同样有 `教师角色` 风险，且 wild animals 问答需 peer Q&A 而非 teacher framing | Codex / Cursor risk |

**最小返修集：15 关。** 如果只按 Cursor fail-closed，是 12 关；加上 Codex 自动硬闸，变成 15 关。按用户的质量标准，取并集，不取宽松口径。

## P1 风险，不阻断但修 P0 时建议一起改

- L015 / L017：末拍像 slogan（`Friends help!` / `Friends share.`），不像 6 岁自然对话。
- L018：mum 外貌锚点弱，不如 dad/grandma 明确，后续 silent forced-choice 可能混。
- L023：`How many people?` 略 clinical。
- L025：`siblings` 对 6 岁孩子过正式。
- L028 / L029：family present / love each other 易靠拥抱串味，视频阶段要强制区分“介绍家庭”与“表达相爱”。
- L040：对白里出现 `I like cats.`，视频生成时必须保持 dog 主导，否则串到 cat/pet 相关项。
- L048 / L050：project/craft 类锚点需要避免和 L049/L047 互串。

## 关键判断

1. **Mimo 证明文件层安全；不是内容过关。**
2. **结构 checker 45/45 PASS 只能证明格式，不证明学习语义。**
3. **M3/ZAI/DeepSeek 对本关卡段较宽松；Cursor 和 Codex 抓到的干扰项串味成立。按 fail-closed，批次失败。**
4. **没有视频证据，所以不能说视频能过；当前只能说 prompt 文本未过独立语义门。**

## 后续动作建议

1. 先重写 P0 15 关 prompt/contract：禁止正确项 prompt 内说出干扰项；项目 sequel 不能复用上一关核心道具；teacher cue 全删；classification 必须有两类可视对照。
2. 重写后重新跑：checker + sha/manifest + Cursor/Codex/M3 独立语义 QA。
3. 全部 PASS 后，只批准 1 条样片，不批量烧 45 条。
