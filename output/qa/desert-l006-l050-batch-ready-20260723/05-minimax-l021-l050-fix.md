# MiniMax L021-L050 修复与全量复核

- 任务：`t_03bf0700`
- 工作区：`/tmp/baobao-chuangguan`
- 输出：`/Users/yr/宝宝闯关/output/qa/desert-l006-l050-batch-ready-20260723/05-minimax-l021-l050-fix.md`
- provider video：0；LibTV/Seedance：未调用；未伪造 `executionApproval`。

## 结论

L021/L023/L024/L026/L027/L028/L032/L040/L041 已升级为 r3 视觉锚点：每关至少 4 个英文、目标特异的静音可识别锚点，并排除家庭角色/动物物种混淆。L022/L025/L033/L034/L039/L042/L046/L047/L049 交叉复核后保持 ADVANCE。L030/L031/L048 继续 DELETE，prompts-only 运行中被 `curriculumVerdict=DELETE` 跳过。

另修复两项根因：L029 的 `cefrTargetExpression` 从错误的 `This is my family.` 改为 `We love each other.`；L050 改为独立纸张/沙画板，与 L049 的 standalone 约束一致，移除图画书页依赖。

## 实际执行

```bash
cd /tmp/baobao-chuangguan
node tools/video-prompts/generate-desert-video-batch.js --start=21 --end=50 --version=r3 --prompts-only
node tools/video-prompts/generate-desert-video-batch.js --start=50 --end=50 --version=r3 --prompts-only
node tools/video-prompts/check-desert-video-prompt.js output/media-production/desert-level-050-draw-a-wild-animal-r3/prompts/level-050-draw-a-wild-animal-r3.txt --spoken "Now I'm drawing a tiger!" --answer "draw a wild animal"
```

实际结果：第一次命令 `completed=30, failed=0`；L030/L031/L048 为 skipped。第二次 `completed=1, failed=0`。独立 checker 返回 `ok: true`、`dialogueLines: 5`、`spokenCount: 1`。prompts-only manifest 明确 `approved: false`、`creditsBurned: false`。

## 45 关更新后简表

| 关卡 | 版本/处置 | 结果 | prompt 路径 |
|---|---|---|---|
| L006-L020 | unchanged | unchanged；不在本卡写入 | `output/media-production/desert-level-006..020-*/prompts/*` |
| L021 | r3 | ADVANCE；grandpa 灰发/胡须/年龄特征、指认关系 | `output/media-production/desert-level-021-this-is-my-grandpa-r3/prompts/level-021-this-is-my-grandpa-r3.txt` |
| L022 | r3 | ADVANCE；clean 交叉复核 | `output/media-production/desert-level-022-who-lives-with-you-r3/prompts/level-022-who-lives-with-you-r3.txt` |
| L023 | r3 | ADVANCE；六人大家庭、数人数 | `output/media-production/desert-level-023-my-family-is-big-r3/prompts/level-023-my-family-is-big-r3.txt` |
| L024 | r3 | ADVANCE；三人小家庭、紧凑构图 | `output/media-production/desert-level-024-my-family-is-small-r3/prompts/level-024-my-family-is-small-r3.txt` |
| L025 | r3 | ADVANCE；clean 交叉复核 | `output/media-production/desert-level-025-i-live-with-my-parents-r3/prompts/level-025-i-live-with-my-parents-r3.txt` |
| L026 | r3 | ADVANCE；姐妹双辫/发带/玩偶 | `output/media-production/desert-level-026-i-have-a-sister-r3/prompts/level-026-i-have-a-sister-r3.txt` |
| L027 | r3 | ADVANCE；兄弟短发/蓝背心/球 | `output/media-production/desert-level-027-i-have-a-brother-r3/prompts/level-027-i-have-a-brother-r3.txt` |
| L028 | r3 | ADVANCE；独立家庭照片、无树状道具 | `output/media-production/desert-level-028-this-is-my-family-r3/prompts/level-028-this-is-my-family-r3.txt` |
| L029 | r3 | ADVANCE；target 修为 We love each other | `output/media-production/desert-level-029-we-love-each-other-r3/prompts/level-029-we-love-each-other-r3.txt` |
| L030 | DELETE | SKIP；未进入生成队列 | 无新 prompt（旧路径保留） |
| L031 | DELETE | SKIP；未进入生成队列 | 无新 prompt（旧路径保留） |
| L032 | r3 | ADVANCE；独立纸张/沙画板画家庭 | `output/media-production/desert-level-032-draw-my-family-r3/prompts/level-032-draw-my-family-r3.txt` |
| L033 | r3 | ADVANCE；真实家庭成员、无家庭树 | `output/media-production/desert-level-033-talk-about-family-r3/prompts/level-033-talk-about-family-r3.txt` |
| L034 | r3 | ADVANCE；大小两组真实家庭对比 | `output/media-production/desert-level-034-different-families-r3/prompts/level-034-different-families-r3.txt` |
| L035-L038 | r3 | HOLD；动物锚点已重写但仍需单样本视觉验证 | `output/media-production/desert-level-035..038-*/prompts/*` |
| L039 | r3 | ADVANCE；peer-to-peer 多宠物提问 | `output/media-production/desert-level-039-what-pets-do-you-know-r3/prompts/level-039-what-pets-do-you-know-r3.txt` |
| L040 | r3 | ADVANCE；狗、食盆、垫子、摇尾巴 | `output/media-production/desert-level-040-i-like-dogs-r3/prompts/level-040-i-like-dogs-r3.txt` |
| L041 | r3 | ADVANCE；猫、项圈、猫窝/食盆、依偎 | `output/media-production/desert-level-041-i-have-a-cat-r3/prompts/level-041-i-have-a-cat-r3.txt` |
| L042 | r3 | ADVANCE；pet/wild 两区分类 | `output/media-production/desert-level-042-is-it-a-pet-r3/prompts/level-042-is-it-a-pet-r3.txt` |
| L043-L045 | r3 | HOLD；动物锚点已重写但仍需单样本视觉验证 | `output/media-production/desert-level-043..045-*/prompts/*` |
| L046 | r3 | ADVANCE；英文观察句，无动物拟声 | `output/media-production/desert-level-046-a-monkey-r3/prompts/level-046-a-monkey-r3.txt` |
| L047 | r3 | ADVANCE；wild-only habitat、同伴提问 | `output/media-production/desert-level-047-what-wild-animals-do-you-know-r3/prompts/level-047-what-wild-animals-do-you-know-r3.txt` |
| L048 | DELETE | SKIP；未进入生成队列 | 无新 prompt（旧路径保留） |
| L049 | r3 | ADVANCE；standalone drawing、无 book | `output/media-production/desert-level-049-draw-a-pet-r3/prompts/level-049-draw-a-pet-r3.txt` |
| L050 | r3 | ADVANCE；standalone wild-animal drawing，修复 L049 冲突 | `output/media-production/desert-level-050-draw-a-wild-animal-r3/prompts/level-050-draw-a-wild-animal-r3.txt` |

## 交叉验收与边界

- C 组逐项对照 DeepSeek repair spec：L031 保持 DELETE；L033 使用 live family members；L034 使用 big/small 两组真实家庭对比；L039 为 peer-to-peer 多宠物提问；L042 同时展示 pet/wild 两区；L046 保持英文观察句；L047 保持 wild-only habitat；L049 保持 standalone drawing、无 book。
- 本卡只完成 Phase A prompt/contract 层。`structure PASS ≠ release`；所有新 manifests 仍是 dry-run，未签 independent QA 或 execution approval。
- 未执行 `--run-libtv`，未生成 MP4，未产生 ASR/silent/entailment/userAcceptance 证据，因此不能宣称 release。
