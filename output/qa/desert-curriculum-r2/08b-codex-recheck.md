# Codex 08b 二次复审：R2 绕过与 45 条全验

| 项 | 值 |
|---|---|
| Task | `t_a0c937cd` |
| Reviewer | Codex xhigh 二次复审 |
| Date | 2026-07-23 |
| Workspace | `/Users/yr/宝宝闯关` |
| Boundary | 只读复验；未改代码、prompt、manifest；未调用 LibTV/Seedance/provider；仅新增本报告 |

## 0. Verdict

**PASS**

45 条 canonical `*-r2` prompt/manifest 全 PASS；08 的全部绕过均已复现为阻断；主动加测的新绕过入口也未通过。任一失败总 FAIL，本轮无失败。

## 1. 真实工作树/代码证据

`git status --short -- tools/video-prompts output/media-production output/qa/desert-curriculum-r2 script.js package.json quiz.test.js` 显示本轮相关 07b/QA 产物主要处于未跟踪状态，`script.js`/`package.json`/`quiz.test.js` 为既有修改；本轮未 reset、未格式化、未改 prompt/manifest。

代码实读：

- `tools/video-prompts/check-desert-video-prompt.js:53-76`：`--legacy-title-target`、positional target、未知 flag、缺 `--spoken`/`--answer` 均 exit 2。
- `tools/video-prompts/check-desert-video-prompt.js:120-128`：spoken 命中只统计 `Dialogue:` 内 quoted lines。
- `tools/video-prompts/check-desert-video-prompt.js:147-152`：answer/title label 与 spoken 不同时，机械重复 answer label 会失败。
- `tools/video-prompts/lib/desert-semantic-gate.js:360-424`：LibTV 前置门禁要求 automated preflight、独立 QA、`approved=true`、`dryRun=false`、`executionApproval`、prompt hash 匹配。
- `tools/video-prompts/lib/desert-semantic-gate.js:388-408`：空/伪 `executionApproval`、batch scope、`cursor/producer/automated-checker` 批准人均阻断。
- `tools/video-prompts/lib/desert-semantic-gate.js:448-485`：ASR/silent/entailment + userAcceptance 是 post-generation release gate，不是生成前 gate。
- `tools/video-prompts/generate-desert-video-batch.js:290-299`：`--run-libtv` 硬限单关。
- `tools/video-prompts/generate-desert-video-batch.js:359-410`：run mode 先读现有 prompt/approval manifest 并通过 `assertLibtvAllowed`，真实 provider path 在门禁之后。
- `tools/video-prompts/generate-desert-video-batch.js:302-310`：override mount / batch unlock 均走 release gate。
- `script.js:611-667`：`desertLevelVideoOverrides` 仅 L001-L005，无 L006-L050 r2 挂载。

## 2. 命令测试

| Command | Result |
|---|---|
| `rtk proxy node --test tools/video-prompts/desert-semantic-xhigh.test.mjs` | PASS, tests 26, pass 26, fail 0 |
| `rtk proxy node --test --test-force-exit quiz.test.js` | PASS, tests 95, pass 95, fail 0 |
| `rtk proxy npm test` | PASS, tests 326, suites 12, pass 326, fail 0 |

## 3. 绕过复验矩阵

| Probe | Result | Evidence |
|---|---|---|
| positional target `friend mind map` | PASS | checker exit 2, `Rejected: positional target removed` |
| `--legacy-title-target friend mind map` | PASS | checker exit 2, `Rejected: --legacy-title-target removed` |
| wrong spoken L013 r2 | PASS | checker exit 1, Dialogue quoted count 0 |
| wrong spoken L013 v1 | PASS | checker exit 1, Dialogue quoted count 0 |
| correct L013 spoken | PASS | checker exit 0, `spokenCount=1`, `spokenCountSource=dialogue-quoted-lines` |
| Dialogue 外计数 | PASS | `friend mind map` whole prompt count 3, Dialogue quoted count 0, checker fails |
| missing `--answer` | PASS | checker exit 2 |
| missing `--spoken` | PASS | checker exit 2 |
| unknown `--force` | PASS | checker exit 2 |
| batch `--run-libtv --start 13 --end 14` | PASS | exit 1, `single-sample only`, selectedCount 2 |
| missing/empty `executionApproval` | PASS | `approvalManifestStatus.ok=false` |
| `executionApproval.approved=false` | PASS | blocked before runner |
| `executionApproval.scope=batch` | PASS | blocked, scope must be `single-sample` |
| missing `executionApproval.approvedBy` | PASS | blocked, explicit human principal required |
| `executionApproval.approvedBy=cursor` | PASS | blocked as forbidden approver |
| `independent_prompt_qa.reviewer=cursor` | PASS | blocked as forbidden reviewer |
| promptSha256 drift | PASS | `processLevel` throws before fake runner, `runnerCalls=0` |
| post-generation evidence missing still release | PASS | release/override/batch unlock all blocked |
| evidence true but missing userAcceptance | PASS | release/override/batch unlock all blocked |
| evidence true but `userAcceptance.acceptedBy=cursor` | PASS | release/override/batch unlock all blocked |
| approved single-sample with fake runner and evidence false | PASS | reaches fake runner only; confirms evidence is not a pre-generation gate and no real provider path ran |

## 4. Inventory / Hash / Provider

| Check | Result |
|---|---|
| canonical r2 dirs | 45 |
| canonical r2 prompt txt | 45 |
| approval manifests | 45 |
| r2 `*.mp4` / `run-command.sh` / production `manifest.json` | 0 |
| `07b-prompt-sha256-before.txt` vs `07b-prompt-sha256-after.txt` | diff exit 0, empty |
| current on-disk prompt SHA vs 07b before | 45/45 match |
| manifest `promptSha256` vs current prompt | 45/45 match |
| `approved=false` | 45/45 |
| `dryRun=true` | 45/45 |
| `independent_prompt_qa.pass=false` | 45/45 |
| `executionApproval.approved=false` | 45/45 |
| `userAcceptance.accepted=false` | 45/45 |
| ASR/silent/entailment evidence false | 45/45 |

## 5. L006-L050 Prompt Table

| Level | Title | Type | Result | Notes |
|---|---|---|---|---|
| L006 | My name is... | situation | PASS | spokenCount=1; sha/stub fail-closed |
| L007 | What's your name? | dialogue | PASS | spokenCount=1; sha/stub fail-closed |
| L008 | I'm Chen Jie | dialogue | PASS | spokenCount=1; sha/stub fail-closed |
| L009 | Let's play together | situation | PASS | spokenCount=2; sha/stub fail-closed |
| L010 | Share with friends | situation | PASS | spokenCount=1; sha/stub fail-closed |
| L011 | Are you OK? | dialogue | PASS | spokenCount=1; sha/stub fail-closed |
| L012 | I can help | dialogue | PASS | spokenCount=1; sha/stub fail-closed |
| L013 | friend mind map | project | PASS | spokenCount=1; sha/stub fail-closed |
| L014 | kind words | project | PASS | spokenCount=1; sha/stub fail-closed |
| L015 | help a friend | project | PASS | spokenCount=1; sha/stub fail-closed |
| L016 | say hello first | project | PASS | spokenCount=1; sha/stub fail-closed |
| L017 | be a good friend | project | PASS | spokenCount=1; sha/stub fail-closed |
| L018 | This is my mum | recognition | PASS | spokenCount=1; sha/stub fail-closed |
| L019 | This is my dad | recognition | PASS | spokenCount=1; sha/stub fail-closed |
| L020 | This is my grandma | recognition | PASS | spokenCount=1; sha/stub fail-closed |
| L021 | This is my grandpa | recognition | PASS | spokenCount=1; sha/stub fail-closed |
| L022 | Who lives with you? | dialogue | PASS | spokenCount=2; sha/stub fail-closed |
| L023 | My family is big | situation | PASS | spokenCount=1; sha/stub fail-closed |
| L024 | My family is small | situation | PASS | spokenCount=1; sha/stub fail-closed |
| L025 | I live with my parents | dialogue | PASS | spokenCount=1; sha/stub fail-closed |
| L026 | I have a sister | recognition | PASS | spokenCount=1; sha/stub fail-closed |
| L027 | I have a brother | recognition | PASS | spokenCount=1; sha/stub fail-closed |
| L028 | This is my family | situation | PASS | spokenCount=1; sha/stub fail-closed |
| L029 | We love each other | situation | PASS | spokenCount=1; sha/stub fail-closed |
| L030 | family tree | project | PASS | spokenCount=1; sha/stub fail-closed |
| L031 | add a family photo | project | PASS | spokenCount=1; sha/stub fail-closed |
| L032 | draw my family | project | PASS | spokenCount=1; sha/stub fail-closed |
| L033 | talk about family | dialogue | PASS | spokenCount=1; sha/stub fail-closed |
| L034 | different families | project | PASS | spokenCount=1; sha/stub fail-closed |
| L035 | a pet dog | recognition | PASS | spokenCount=1; sha/stub fail-closed |
| L036 | a little cat | recognition | PASS | spokenCount=1; sha/stub fail-closed |
| L037 | a fish | recognition | PASS | spokenCount=1; sha/stub fail-closed |
| L038 | a bird | recognition | PASS | spokenCount=1; sha/stub fail-closed |
| L039 | What pets do you know? | dialogue | PASS | spokenCount=1; sha/stub fail-closed |
| L040 | I like dogs | situation | PASS | spokenCount=1; sha/stub fail-closed |
| L041 | I have a cat | dialogue | PASS | spokenCount=1; sha/stub fail-closed |
| L042 | Is it a pet? | dialogue | PASS | spokenCount=1; sha/stub fail-closed |
| L043 | a wild panda | recognition | PASS | spokenCount=1; sha/stub fail-closed |
| L044 | a big tiger | recognition | PASS | spokenCount=1; sha/stub fail-closed |
| L045 | an elephant | recognition | PASS | spokenCount=1; sha/stub fail-closed |
| L046 | a monkey | recognition | PASS | spokenCount=1; sha/stub fail-closed |
| L047 | What wild animals do you know? | dialogue | PASS | spokenCount=1; sha/stub fail-closed |
| L048 | animal picture book | project | PASS | spokenCount=1; sha/stub fail-closed |
| L049 | draw a pet | project | PASS | spokenCount=1; sha/stub fail-closed |
| L050 | draw a wild animal | project | PASS | spokenCount=1; sha/stub fail-closed |

## 6. Conclusion

07b 当前状态通过二次独立复验。08 的两处 FAIL 已闭合：checker 不再接受 title/legacy 兼容入口；ASR/silent/entailment 已明确为 post-generation release evidence，缺失时不能 release、不能挂 override、不能解锁 batch。未发现新增绕过。
