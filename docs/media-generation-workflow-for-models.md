# 宝宝英语岛媒体生成说明

给另一个大模型看的执行说明。不要改业务逻辑，先按这里的媒体边界走。

## 总原则

- UI 独立音频用火山引擎豆包 TTS 生成。
- 课程关卡视频用 LibTV 文生视频生成，视频里的英文台词必须写在 LibTV prompt 里，让画面、口型、声音一次生成。
- 不要用火山给课程视频后期配音，否则口型和语音容易对不上。
- 不要用图生视频生成课程关卡，除非明确要求；默认文生视频更省积分。
- 每条课程视频必须是 15 秒、16:9、横屏、无字幕、无可读文字、无课堂感。

## 火山引擎音频

### 1. 单词发音 MP3

用途：

- 闯关页单词发音按钮。
- 答题选项里的单词播放。

输出：

- `assets/audio/words/*.mp3`
- `assets/audio/words/word-audio-manifest.json`
- `assets/audio/words/word-audio-manifest.js`

生成脚本：

```bash
cd /Users/yr/宝宝闯关
node backend/src/generate-word-audio-v2.js
```

火山参数：

- API: `POST https://openspeech.bytedance.com/api/v3/tts/unidirectional`
- Resource ID: `seed-tts-2.0`
- Speaker: `en_female_natasha_uranus_bigtts`
- Format: `mp3`
- Sample rate: `24000`
- Speech rate: `0`
- Loudness rate: `0`
- 凭据从 `backend/.env` 读取：
  - `DOUBAO_APP_ID`
  - `DOUBAO_TOKEN`

脚本行为：

- 从 `script.js` 的 200 关课程表读取单词。
- 按英文单词去重，例如重复词只生成一次 MP3，但 manifest 保留 `level_ids`。
- 已有有效 MP3 会跳过。
- 写 JSON manifest 和 JS manifest，前端靠 manifest 判断发音按钮是否可用。
- 如果遇到 `45000010` / `45000011` 这类全局鉴权错误，停止批量生成，先检查 App ID、Access Key、`seed-tts-2.0` 授权是否匹配。

### 2. 题目朗读 MP3

用途：

- 答题页题干朗读，例如：`小朋友，视频里学到的单词，哪一个是香蕉的意思？`

输出：

- `assets/audio/questions-holly/level-XX-slug.mp3`
- `assets/audio/questions-holly/question-audio-manifest.json`

生成脚本：

```bash
cd /Users/yr/宝宝闯关
npm run generate:question-audio
```

火山参数：

- API: 同上，`/api/v3/tts/unidirectional`
- Resource ID: `seed-tts-2.0`
- Speaker: `zh_female_peiqi_uranus_bigtts`
- Format: `mp3`
- Sample rate: `24000`

脚本行为：

- 从 `script.js` 读取 `levels` 和 `questionPromptText(level)`。
- 文件名格式：`level-${两位关卡号}-${英文slug}.mp3`。
- 已存在有效文件则跳过。

### 3. 试听音色样本

用途：

- 只用于选声音，不是正式课程资源。

脚本：

```bash
cd /Users/yr/宝宝闯关
node backend/src/generate-voice-samples-v2.js
```

输出：

- `assets/audio/voice-samples-v2/*.mp3`
- `assets/audio/voice-samples-v2/voice-samples-manifest.json`
- 本地试听页：`voice-samples-v2.html`

### 4. 不要批量覆盖的音频

这些不是当前“200 关音频批量生成”的目标：

- `assets/audio/map-bgm.mp3`
- `assets/audio/desert-map-bgm.mp3`
- `assets/audio/boat/rowing-paddle.mp3`
- `assets/audio/feedback-holly/correct.mp3`
- `assets/audio/feedback-holly/wrong.mp3`
- `assets/brand/audio/*.mp3`

除非单独要求，否则不要重做这些固定资产。

## LibTV 课程视频

### 1. Prompt 来源

必须先读：

```bash
cd /Users/yr/宝宝闯关
sed -n '1,120p' tools/video-prompts/_prompt-style-guide.md
sed -n '1,120p' tools/video-prompts/level-01-mom.txt
```

已有 prompt 放在：

- `tools/video-prompts/level-XX-word.txt`

当前已接入的正式视频放在：

- `assets/video/free-levels/level-XX-slug.mp4`

生产过程目录示例：

- `output/media-production/levels-021-030-snack-v1/raw/`
- `output/media-production/levels-021-030-snack-v1/normalized/`
- `output/media-production/levels-021-030-snack-v1/final/`
- `output/media-production/levels-021-030-snack-v1/contact-sheets/`

### 2. Prompt 必须包含的内容

每个视频 prompt 至少明确：

- `Duration: 15 seconds`
- `Format: 16:9 horizontal`
- 手绘水彩 / gouache storybook 风格，匹配当前 Magic English Voyage 海岛画风。
- 一个明确目标词，目标物必须是唯一清晰前景语义目标。
- Pre-A1 / very young A1 英文短句，每句 1-5 个词。
- Dialogue 里写死谁说什么，不要只写“repeat the word”。
- Audio 段写清：自然英文亲子对话，音量要适合英语教学，不能 whisper、mumble、gibberish、non-English。
- Negative prompt 写清：no subtitles, no captions, no readable text, no classroom, no flashcards, no narrator-heavy lesson, no robotic TTS。

沙漠地图正式视频必须先过本地质量闸：

```bash
node tools/video-prompts/check-desert-video-prompt.js tools/video-prompts/desert-level-003-good-morning.txt "Good morning"
```

质量契约见：`tools/video-prompts/desert-video-prompt-quality-contract.md`。检查器只能保证结构和底线；最终仍必须下载真实 MP4、看 contact sheet、验音量、再接入测试。

关键边界：

- 视频里的英语台词由 LibTV 生成，不走火山后期配音。
- 台词必须在 prompt 里直接写，例如：

```text
Character A: "Look."
Character B: "A banana."
Character A: "Banana?"
Character B: "Yes, banana."
Character A: "Banana!"
```

### 3. LibTV CLI 基本流程

项目已经有本地画布绑定：

```bash
cd /Users/yr/宝宝闯关
cat .libtv/project.json
```

当前画布 UUID：

```text
74825c9dc7b945678f0157b07bdbe5b0
```

如果未登录：

```bash
libtv login web
```

使用当前画布：

```bash
libtv project use 74825c9dc7b945678f0157b07bdbe5b0
```

生成前先查模型名和 schema，不要猜字段：

```bash
libtv model search Seedance -t video
libtv model "Seedance 2.0 Mini" | jq '.schema'
```

本批 21-30 实际用过：

- `Seedance 2.0 Mini`
- 早期 21-23 用过 `Seedance 2.0 Fast VIP`

后续默认先用 `Seedance 2.0 Mini`。如果卡住或质量明显不行，再简化 prompt 重试，或按要求换模型。

### 4. 创建并运行视频节点

`libtv node ... --run` 会阻塞到生成结束，不要再自己写轮询。

示例：

```bash
cd /Users/yr/宝宝闯关

TAG=20260723-levels-031-040-v1
OUT=output/media-production/levels-031-040-v1
mkdir -p "$OUT/raw" "$OUT/final" "$OUT/normalized" "$OUT/contact-sheets" "$OUT/node-json"

PROMPT="$(cat tools/video-prompts/level-31-egg.txt)"

libtv node --x 720 --y 260 create "Island L031 Egg $TAG" -t video \
  -s "model=Seedance 2.0 Mini" \
  -s modeType=text2video \
  -s ratio=16:9 \
  --prompt "$PROMPT" \
  --run > "$OUT/node-json/level-031-egg.json"
```

注意：

- 具体时长字段以 `libtv model "Seedance 2.0 Mini"` 输出 schema 为准；如果 schema 需要 `duration` / `durationSeconds` / 其它字段，再按 schema 加 `-s key=value`。
- 节点名必须带关卡号和词，便于回查。
- 如果节点卡住，不要直接说完成；重建一个 V2/V3 节点，记录在 `nodes.tsv`。

### 5. 下载、归一化、验收

从 LibTV 生成结果 JSON 或 `libtv node "节点名"` 查询结果里找到最终视频 URL，下载到 `raw/`：

```bash
curl -L "$VIDEO_URL" -o "$OUT/raw/level-031-egg.mp4"
```

音量归一化到教学可听范围：

