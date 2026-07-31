# 蠢台词清剿 + 防再发

日期：2026-07-23

## 用户要求
1. **避免再发生**（系统门禁，不是靠记性）  
2. **现在 50 关提示词**里同类愚蠢设定清掉  

## 防再发（已落地）

| 层 | 改动 |
|----|------|
| `evaluateDialogueCraft` | 新门禁：空口号结尾 / 人名齐喊 / Yes I'm 循环 / 问句目标说两遍 / 同句≥3 / 标签当台词 / My name is+I'm 同名混用 / 多样性≤2 |
| `assertGenerationAllowed` | 生成前必过 craft |
| `check-desert-video-prompt.js` | prompt 结构检查也跑 craft |
| `desert-semantic-xhigh.test.mjs` | 新增 craft 用例 |
| `desert-video-prompt-quality-contract.md` | 明文 hard fail 规则 |
| `tools/video-prompts/audit-stupid-dialogue.py` | 可复跑全量审计 |

复跑：

```bash
python3 tools/video-prompts/audit-stupid-dialogue.py
node --test tools/video-prompts/desert-semantic-xhigh.test.mjs
```

## 全量清剿结果

审计：`15-stupid-dialogue-audit.json`

| 状态 | 数 |
|------|-----|
| 清剿前 FAIL | **28** |
| 清剿后 FAIL | **0** |
| SKIP (DELETE) | 5 |
| OK | 45（含 L001–L005 prompt 修补） |

### 典型旧蠢 → 新写法

| 类型 | 旧 | 新原则 |
|------|----|--------|
| 空口号收束 | We are friends! / We are happy! / Cats are cute! | 收在动作/对象/再见招呼 |
| 人名齐喊 | Tom and Lily! | Hello, Tom! + Let's play! |
| 问句复读 | What's your name? ×2 | 只问一次，再答/自报 |
| 确认废话 | Yes, I'm Chen Jie. | 删掉 |
| 同句刷屏 | Hello.×3+ | 每拍有推进 |

L006–L008 已按 A/B 身份一致重写（见前轮）。  
L001–L005 最新 prompt 台词已去机械刷屏。  
L006–L050 **r4-batchready** 已按新 contract 全量 `--prompts-only` 重生（DELETE 仍 skip）。

## 仍须知道

- **旧 final MP4 不会自动变**；要新台词成片需单关重跑 LibTV（仍要 yr 批额）。  
- DELETE 五关旧 v1 标签复读文件仍在磁盘，但 **skipGeneration**，生成器不碰。  
- 预览页看 v1 成片仍是旧对白——以 **r4 prompt / contract lines** 为准。
