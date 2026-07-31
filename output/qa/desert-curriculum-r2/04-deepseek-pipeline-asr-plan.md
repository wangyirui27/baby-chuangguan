# DeepSeek 流水线修复规格：Dry-Run、审批、ASR、节点复用

> 状态：**规格（plan）** — 本文件是修复设计方案，不是执行记录。
> 约束：零视频调用、零 LibTV/Seedance 调用、零生产代码修改。
> 日期：2026-07-23
> 上游参考：r1/07-deepseek-pipeline-safety.md、r1/11-m3-final-verdict.md

---

## 1. 总览

当前 `generate-desert-video-batch.js` 存在五个可修复问题、一个硬件依赖缺失（ASR）和一个孤立失败节点（L021）。本规格给出每个问题的修复方案、审批结构、ASR 工具选型及验证命令。

| # | 问题 | 严重级 | 修复类型 |
|---|------|--------|---------|
| P1 | 无生成前语义审批闸门 | 致命 | 新增 semantic-dry-run checker |
| P2 | 无 approval manifest schema | 高 | 新增审批清单 JSON schema |
| P3 | 无断点恢复（batch break 后丢失进度）| 高 | 状态机 + resume-from |
| P4 | 无失败节点复用（L021 repeat 会双倍扣费）| 高 | nodeKey 检查 + --reuse-nodes |
| P5 | L021 孤立 nodeKey 待恢复 | 阻塞 | 手动恢复路径（不改代码） |
| P6 | 无音轨 ASR 验证 | 阻塞 | whisper-cpp 本地方案 |

---

## 2. 生成前审批清单（Pre-Generation Approval Checklist）

### 2.1 审批触发点

在 `processLevel()` 的 `promptFor()` 之后、`libtv node create` 之前，插入审批闸门。现有流程：

```
promptFor() → check-desert-video-prompt.js（仅结构）→ libtv node create --run
```

修复后流程：

```
promptFor() → check-desert-video-prompt.js（结构）→ semantic-dry-run（语义）→ approval manifest → 人工/自动 approve → libtv node create --run
```

### 2.2 Semantic Dry-Run 检查项（10 项）

每项 fail → 整体 FAIL，不创建 LibTV 节点，不扣费。

| # | 检查项 | 检测方法 | 失败条件 |
|---|--------|---------|---------|
| S1 | **Dialogue 去重** | 提取所有 `"…"` 内 quoted lines，去重 | 不同短语 < 3 个 |
| S2 | **角色区分** | Child A 和 Child B 台词是否相同 | 相同 → FAIL（family 型除外但需区分 introducing vs responding） |
| S3 | **questionType 匹配** | 检查 dialogue 结构是否匹配题型 | recognition 型无 question-answer → OK；dialogue 型无问答结构 → FAIL；project 型 dialogue 含 project label 而非过程口语 → FAIL |
| S4 | **语义合理性** | 关键词模式匹配 | "What's your name?" 的 dialogue 不含名字 → FAIL；"This is my X" 不区分介绍者/被介绍者 → FAIL |
| S5 | **台词 ≠ title 复读** | 提取 title 在 dialogue 中作为独立行出现次数 | ≥3 次且无其它不同内容 → FAIL |
| S6 | **spokenDialogue 字段存在性** | 检查 level 对象是否含 `spokenDialogue.lines[]` | 缺失且 dialogue 来自 `dialogueFor()` fallback → FAIL（标记需人工撰写） |
| S7 | **visualSemantics 字段存在性** | 检查 level 对象是否含 `visualSemantics.mustShow[]` | 缺失 → WARN（不阻塞，但 manifest 中标注） |
| S8 | **anchor-objective 绑定** | 检查 concreteAnchors 是否匹配 learningObjective | 无关键词匹配且无自定义锚点 → FAIL |
| S9 | **prompt 膨胀审计** | 检查 `targetRepeat` 是否 ≥4 次 title 重复 | 是 → WARN（建议减至 2 次） |
| S10 | **静音零英测试（模拟）** | 检查 dialogue 是否可仅通过 visualSemantics 理解 | 缺失 visualSemantics 且 dialogue 抽象 → FAIL |

### 2.3 Dry-Run 实现位置

新增独立文件 `tools/video-prompts/semantic-check-desert-video-prompt.js`。

```js
// 伪代码结构
function semanticCheck(promptPath, level) {
  const prompt = fs.readFileSync(promptPath, 'utf8');
  const checks = { S1: checkDedup(prompt), S2: checkRoleDiff(prompt), /* ... */ };
  const failed = Object.entries(checks).filter(([, r]) => !r.pass);
  const overall = failed.length === 0 ? 'PASS' : 'FAIL';
  return { overall, checks, failed: failed.map(([k,v]) => ({ id: k, reason: v.reason })) };
}
```

命令行用法：

```bash
node tools/video-prompts/semantic-check-desert-video-prompt.js \
  "output/media-production/desert-level-021-this-is-my-grandpa-v1/prompts/level-021-this-is-my-grandpa-v1.txt" \
  "This is my grandpa"
```

---

## 3. Approval Manifest Schema

### 3.1 Schema（JSON）

每关一个 `approval-manifest.json`，位于关卡目录根。结构如下：

```jsonc
{
  "$schema": "desert-video-approval/v1",
  "level": {
    "id": 21,
    "title": "This is my grandpa",
    "zhTitle": "这是我的爷爷",
    "questionType": "recognition",
    "transferProbe": "Who lives with you?"
  },
  "checks": {
    "structure": { "pass": true, "checker": "check-desert-video-prompt.js", "details": "17/17 tags present" },
    "semantic": {
      "overall": "PASS",
      "S1_dedup": { "pass": true, "value": "4 unique phrases" },
      "S2_role_diff": { "pass": true, "value": "A introduces, B responds" },
      "S3_qtype_match": { "pass": true, "value": "recognition: short presentation OK" },
      "S4_semantic": { "pass": true, "value": "intro + response differentiated" },
      "S5_not_title_echo": { "pass": true, "value": "title used 2x, 3 other lines differ" },
      "S6_spokenDialogue_exists": { "pass": true, "value": "authored" },
      "S7_visualSemantics_exists": { "pass": true, "value": "defined" },
      "S8_anchor_objective": { "pass": true, "value": "family anchor → family recognition" },
      "S9_prompt_bloat": { "pass": true, "value": "targetRepeat=2x" },
      "S10_mute_zero_en": { "pass": true, "value": "visual: grandpa intro + family grouping" }
    }
  },
  "spokeDialogue": {
    "status": "authored",
    "lines": [
      { "t": "0-3s", "speaker": "A", "text": "This is my grandpa." },
      { "t": "3-6s", "speaker": "B", "text": "He looks kind." },
      { "t": "6-9s", "speaker": "A", "text": "He likes to tell stories." },
      { "t": "9-12s", "speaker": "B", "text": "That's nice." },
      { "t": "12-15s", "speaker": "both", "text": "This is my grandpa." }
    ]
  },
  "visualSemantics": {
    "mustShow": ["grandparent figure visible", "child points to grandparent", "warm family grouping"],
    "mustNotShow": ["written labels", "classroom", "two children pointing at same person"]
  },
  "approvals": {
    "dry_run_semantic": { "status": "approved", "by": "human|automated", "at": "ISO8601" },
    "single_sample": { "status": "pending", "note": "待本关视频生成后 ASR + contact sheet 双证据验证" },
    "batch_qa": { "status": "pending", "note": "待本批 5 关全部完成" }
  },
  "libtv": {
    "nodeKey": null,
    "mode": "create-new",
    "reuseNodeKey": null
  }
}
```

### 3.2 审批流转规则

```
dry_run_semantic.status:
  "approved"  → 允许进入 libtv node create
  "rejected"  → 禁止创建节点；需修复后重新 dry-run
  "pending"   → 等待人工审批（默认状态）

single_sample.status:
  "approved"  → 本关样本验证通过（ASR + contact sheet）
  "rejected"  → 本关需重新生成
  "pending"   → 未生成或待验证

batch_qa.status:
  "approved"  → 本批 5 关全部通过，可继续下一批
  "rejected"  → 本批至少一关需修复
  "pending"   → 等待本批全部生成完毕
```

### 3.3 实现位置

`processLevel()` 中新增 `approvalPath = path.join(outDir, 'approval-manifest.json')`，在 semantic check 通过后写入初始版（`dry_run_semantic.status = "approved"`）。后续 ASR 和 contact sheet 验证更新 `single_sample` 字段。

批处理脚本（或 orchestration 层）负责检查 `batch_qa` 状态。batch_size=5，每批完成后暂停，等待 QA 审批所有 5 关的 manifest 后继续。

---

## 4. 单样本流程（Per-Level Single Sample Pipeline）

### 4.1 单关完整流水线

```
1. promptFor() → 生成 prompt.txt
2. check-desert-video-prompt.js → 结构检查 → 写入 prompt-check.json
3. semantic-check-desert-video-prompt.js → 语义 dry-run → 写入 approval-manifest.json
4. [GATE] dry_run_semantic ≠ "approved" → 中止本关（不扣费）
5. libtv node create --run → 生成视频 → 写入 node-json/*.jsonl
6. curl download → raw/
7. ffmpeg normalize → normalized/ → final/
8. ffmpeg contact-sheet → contact-sheets/
9. ffprobe + volume check → manifest.json
10. ASR extract + transcribe → audio-check/*.txt
11. [GATE] ASR 转写与 spokenDialogue 对齐检查 → 更新 approval-manifest.single_sample
12. [GATE] 人工 contact sheet QA → 更新 approval-manifest.single_sample
```

### 4.2 批处理模式

- 每 5 关一批（`--batch-size=5`）
- 每批完成后自动暂停，等待所有关的 `batch_qa.status = "approved"`
- 命令行参数新增：`--batch-size=N`、`--qa-gate`
- `--prompts-only` 模式只执行步骤 1-3（dry-run），不调用 LibTV

---

## 5. L021 失败节点恢复

### 5.1 当前状态

| 字段 | 值 |
|------|-----|
| 关卡 | L021 "This is my grandpa" |
| nodeKey | `9ad2053d-5835-4647-bb09-5cc76d7d8575` |
| node 状态 | 已创建（jsonl 第 1 行确认）、扣费已完成 |
| run 状态 | 失败 — LibTV 服务端未找到该节点 |
| 根因 | LibTV 异步竞态：`--run` 阶段 node 尚未在服务端索引中就绪 |

### 5.2 手动恢复路径（不改代码）

由于约束「不得改生产代码」，L021 通过手动 CLI 恢复：

```bash
# 步骤 1: 确认 node 存在
"/Users/yr/.libtv/libtv" node list | grep "9ad2053d"

# 步骤 2: 若 node 已可查询，直接用已有 nodeKey 重试 run
"/Users/yr/.libtv/libtv" node run "9ad2053d-5835-4647-bb09-5cc76d7d8575"

# 步骤 3: 轮询结果
"/Users/yr/.libtv/libtv" node status "9ad2053d-5835-4647-bb09-5cc76d7d8575"

# 步骤 4: 获取 video URL 后手动下载到原目录
# 从 libtv 输出提取 URL，然后：
curl -L --fail --retry 3 "<URL>" \
  -o "output/media-production/desert-level-021-this-is-my-grandpa-v1/raw/level-021-this-is-my-grandpa-v1.mp4"

# 步骤 5: 重新 normalize + contact sheet
ffmpeg -y -i "output/media-production/desert-level-021-this-is-my-grandpa-v1/raw/level-021-this-is-my-grandpa-v1.mp4" \
  -af loudnorm=I=-16:TP=-1.5:LRA=11 -c:v copy -c:a aac \
  "output/media-production/desert-level-021-this-is-my-grandpa-v1/normalized/level-021-this-is-my-grandpa-v1.mp4"

cp "output/media-production/desert-level-021-this-is-my-grandpa-v1/normalized/level-021-this-is-my-grandpa-v1.mp4" \
   "output/media-production/desert-level-021-this-is-my-grandpa-v1/final/level-021-this-is-my-grandpa-v1.mp4"

ffmpeg -y -i "output/media-production/desert-level-021-this-is-my-grandpa-v1/final/level-021-this-is-my-grandpa-v1.mp4" \
  -vf "fps=1/3,scale=320:-1,tile=5x1" \
  "output/media-production/desert-level-021-this-is-my-grandpa-v1/contact-sheets/level-021-this-is-my-grandpa-v1.jpg"
```

### 5.3 nodeKey 复用策略（供后续代码实现时参考）

在 `processLevel()` 中，**创建 LibTV 节点前**检查：

```js
// 伪代码 — 不写入生产代码（本任务约束）
const jsonlPath = path.join(outDir, 'node-json', `${baseName}-${version}.jsonl`);
if (fs.existsSync(jsonlPath)) {
  const existingKey = extractNodeKey(jsonlPath);
  if (existingKey && !hasVideoUrl(jsonlPath)) {
    // 复用已有节点，不创建新节点
    // 使用 libtv node run <existingKey> 而非 libtv node create
    return resumeNode(existingKey, outDir);
  }
}
```

`summary.json` 每条 record 新增字段：

```json
{
  "level": 21,
  "status": "node-created",
  "nodeKey": "9ad2053d-5835-4647-bb09-5cc76d7d8575",
  "retryCount": 0,
  "lastError": "LibTV async race: node not found during --run"
}
```

脚本启动时读取 summary：
- `status: "node-created"` + `retryCount < 3` → 自动重试 run（不创建新节点）
- `status: "node-created"` + `retryCount ≥ 3` → 跳过并标记 `human_intervention_required`
- `status: "generated"` → 跳过

---

## 6. 实际音轨 ASR 本地工具方案

### 6.1 环境状态

| 组件 | 状态 |
|------|------|
| ffmpeg 8.1.2 | ✅ 可用（`/opt/homebrew/bin/ffmpeg`） |
| Python 3.9.6（系统） | ✅ 可用 |
| faster-whisper（hermes venv） | ❌ 已安装但 ABI 不兼容（`av/_core.abi3.so` vs Python 3.11） |
| openai-whisper | ❌ 未安装 |

### 6.2 推荐方案：whisper-cpp（CoreML）

whisper-cpp 是 C++ 实现的 Whisper，原生支持 macOS CoreML 加速，不依赖 Python 环境。这是 macOS 上最稳定、最快速的本地 ASR 方案。

**安装**：

```bash
brew install whisper-cpp
```

自动下载 ggml 模型（推荐 `ggml-small.en.bin` 用于儿童英语，181MB）：

```bash
# brew 安装后模型在 /opt/homebrew/opt/whisper-cpp/models/
# 如需手动下载：
curl -L "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.en.bin" \
  -o "$HOME/.whisper-models/ggml-small.en.bin"
```

**备选方案**：若 brew 不可用，用 pip 在 Python 3.9 环境安装 openai-whisper：

```bash
# 方案 B — 安装到系统 Python 3.9
pip3 install openai-whisper
```

### 6.3 ASR 工作流

```
final.mp4 → ffmpeg 提取 aac → wav (16kHz mono) → whisper-cpp → text 转写
```

### 6.4 验证命令

#### Step 1: 提取音轨

```bash
# 针对单关（以 L021 为例）
LEVEL="021"
BASE="level-${LEVEL}-this-is-my-grandpa-v1"
INDIR="output/media-production/desert-level-${LEVEL}-this-is-my-grandpa-v1"

ffmpeg -y -i "${INDIR}/final/${BASE}.mp4" \
  -vn -acodec pcm_s16le -ar 16000 -ac 1 \
  "${INDIR}/audio-check/${BASE}-16k.wav"
```

#### Step 2: 转写

**方案 A — whisper-cpp（首选）**：

```bash
# 英文专用模型 small.en（181MB，速度快）
whisper-cpp \
  -m "$HOME/.whisper-models/ggml-small.en.bin" \
  -f "${INDIR}/audio-check/${BASE}-16k.wav" \
  -l en \
  --output-txt \
  --output-file "${INDIR}/audio-check/${BASE}-asr"
# 输出: audio-check/level-021-this-is-my-grandpa-v1-asr.txt
```

**方案 B — openai-whisper（备选）**：

```bash
python3 -c "
import whisper
model = whisper.load_model('small.en')
result = model.transcribe('${INDIR}/audio-check/${BASE}-16k.wav', language='en')
with open('${INDIR}/audio-check/${BASE}-asr.txt', 'w') as f:
    f.write(result['text'])
print(result['text'])
"
```

#### Step 3: 对齐检查

对比 ASR 输出与 `spokenDialogue.lines[].text`：

```bash
# 提取 prompt 中指定的台词
grep -oP '(?<=says: "|responds: "|repeats: "|response: "|: ")[^"]+' \
  "${INDIR}/prompts/${BASE}.txt" > "${INDIR}/audio-check/${BASE}-expected.txt"

# 人工比对
echo "=== EXPECTED ===" && cat "${INDIR}/audio-check/${BASE}-expected.txt"
echo "=== ASR ===" && cat "${INDIR}/audio-check/${BASE}-asr.txt"
```

#### Step 4: 自动化对齐脚本

```bash
#!/usr/bin/env bash
# tools/video-prompts/asr-check-desert-video.sh
set -euo pipefail

FINAL_MP4="$1"          # 如 output/.../final/level-021-this-is-my-grandpa-v1.mp4
PROMPT_FILE="$2"        # 如 output/.../prompts/level-021-this-is-my-grandpa-v1.txt
OUT_DIR="$(dirname "$(dirname "$FINAL_MP4")")/audio-check"
mkdir -p "$OUT_DIR"

BASE="$(basename "$FINAL_MP4" .mp4)"
WAV="${OUT_DIR}/${BASE}-16k.wav"
ASR_TXT="${OUT_DIR}/${BASE}-asr.txt"

# 1. 提取音轨
ffmpeg -y -i "$FINAL_MP4" -vn -acodec pcm_s16le -ar 16000 -ac 1 "$WAV"

# 2. ASR
whisper-cpp -m "$HOME/.whisper-models/ggml-small.en.bin" \
  -f "$WAV" -l en --output-txt --output-file "${OUT_DIR}/${BASE}-asr"

# 3. 输出结果供人工/脚本比对
