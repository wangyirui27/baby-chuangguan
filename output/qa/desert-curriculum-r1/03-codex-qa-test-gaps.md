# Codex QA测试审计 R2：语义错为何全绿

## 范围

本轮只审当前仓库证据，不继续 LibTV，不改生产文件。已审对象：

- `tools/video-prompts/check-desert-video-prompt.js`
- `tools/video-prompts/generate-desert-video-batch.js`
- `script.js`
- `quiz.test.js`
- L013 `friend mind map`、L014 `kind words` 的课程行、prompt、prompt-check、manifest

用户纠正点是对的：`learningObjective`、`questionTask`、`spokenDialogue`、`visualSemantics`、`answerOption`、`videoPrompt` 必须分离。当前实现把这些语义压进 `title`、`zhTitle`、`transferProbe`、`questionType` 和 prompt 字符串，导致形式检查全绿，但语义错误不会被挡住。

## 结论

旧 checker 和 tests 全绿，不代表 L013/L014 语义合格。它们只证明：

1. prompt 有固定章节、目标词出现次数够、对话行数够、长度在范围内。
2. 课程表有 200 关、字段存在、题干不露内部 transferProbe、干扰项来自同单元同类型。
3. 前 5 关视频元信息存在。

它们没有证明：

1. `friend mind map` 和 `kind words` 的静音画面可以唯一地区分。
2. 项目任务 `Make a mind map` / `Add kind words to the mind map` 被视频动作表达。
3. 目标句在儿童对话里自然可说。
4. 实际音轨真的说了预期英文。
5. 选项中只有正确项被视频和音轨同时支持。

## L013/L014 证据

### 课程数据

| Level | title | zhTitle | questionType | questionTask / transferProbe | options | correct |
|---|---|---|---|---|---|---|
| L013 | `friend mind map` | `朋友思维导图` | `project` | `Make a mind map of making friends.` | `friend mind map`, `kind words`, `help a friend`, `say hello first` | index 0 |
| L014 | `kind words` | `友好的话` | `project` | `Add kind words to the mind map.` | `friend mind map`, `kind words`, `help a friend`, `say hello first` | index 1 |

关键风险：两关 options 完全同集且互为可见干扰项。只要视频画面没有把 `mind map` 和 `kind words` 分开，孩子看完就会在两个选项之间猜。

### Prompt 证据

L013 prompt：

- Source Situation 是 `Make a mind map of making friends.`
- Visual semantic anchors 却是通用友谊动作：`friendship action`、`greeting first/helping/including another child`、`warm eye contact and small smiles`
- Scene 是 `craft mat` 和 `picture-only drawings`
- Dialogue 是重复 `friend mind map`，再加一句 `Good.`

L014 prompt：

- Source Situation 是 `Add kind words to the mind map.`
- Visual semantic anchors 仍是同一套通用友谊动作：`friendship action`、`greeting first/helping/including another child`、`warm eye contact and small smiles`
- Scene 变成默认 `desert-oasis path`，没有 mind map 任务场景
- Dialogue 是重复 `kind words`，再加一句 `Yes.`

核心错因：`generate-desert-video-batch.js` 的 anchor 分支先匹配 `/friend|kind words|hello first/`，所以 L013 和 L014 都走同一套友谊动作语义；`project action` 分支没有为这两关提供任务动作。`sceneFor` 又只看 `level.title`，L014 的 `transferProbe` 里有 `Add ... to the mind map`，但标题 `kind words` 不触发 craft/mind-map 场景。

### Checker 全绿证据

L013 checker：

- `ok: true`
- `targetExpression: friend mind map`
- `targetCount: 24`
- `dialogueLines: 5`
- `chars: 6885`

L014 checker：

- `ok: true`
- `targetExpression: kind words`
- `targetCount: 25`
- `dialogueLines: 5`
- `chars: 6774`

这说明旧 checker 的绿色只来自结构合规，不来自语义合格。

### Manifest / 音轨证据

L013 manifest：

- final MP4: `output/media-production/desert-level-013-friend-mind-map-v1/final/level-013-friend-mind-map-v1.mp4`
- duration: `15.200000`
- video: `h264 1280x720`
- audio: `aac 96000Hz 2ch`
- volume: mean `-23.0 dB`, max `-3.4 dB`
- `qaRequired`: `silent-viewer`, `unknown-language`, `face-mouth-visible`, `no-text-cards-logo`, `target-semantic-clear`

