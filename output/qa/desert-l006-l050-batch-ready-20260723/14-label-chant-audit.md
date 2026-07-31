# 标签复读审计：share-with-friends 类问题

日期：2026-07-23  
问题定义：**quiz/项目标题（如 Share with friends）被当成台词反复念**，而不是教自然英语用法（如 `Here, you can have this.` / `Let's share!`）。

审计范围：
- `tools/video-prompts/desert-level-semantic-contracts-l006-l050.json`（L006–L050）
- `output/media-production/desert-level-*/prompts/*.txt`（**全部历史版本**）
- 每关 **latest**（优先 r4-batchready）再单独出结论

---

## L010 Share with friends（你点名的关）

| 版本 | Dialogue 台词 | CEFR focus | final 成片 |
|------|----------------|------------|------------|
| v1 / r2 / reqa / **r4** | `Here, you can have this.` / `Thank you!` / `Let's share!` / `That's nice of you.` / `We are good friends!` | **Here, you can have this.** | 仅 v1 有 mp4 |

**结论：当前所有 L010 prompt 版本都没有**把 `Share with friends` / `share-with-friends` **当 Dialogue 复读**。  
标题只作 quiz label；spoken 是递给东西的自然句。

若预览里仍觉得「在教 share-with-friends 这个词组」，更可能来自：
1. **关卡标题/选项文案**仍是 `Share with friends`（答题卡标签，不是口播目标）；或  
2. 看的是 **旧成片观感/误听**，但 v1 所用 prompt 已是自然句（不是 label chant）。

---

## 全量结论（标签复读）

### A. Latest 可生成关（非 DELETE）

**硬 FAIL（Dialogue/contract 把项目标签当台词反复念）：0 关**

抽查所有「项目标签型标题」关的 latest spoken（均已不是标题本身）：

| 关 | 标题（quiz） | spoken（应教的英语） | 标签复读？ |
|----|--------------|----------------------|------------|
| L010 | Share with friends | Here, you can have this. | 否 |
| L015 | help a friend | Let me help you! | 否 |
| L016 | say hello first | Hello! I'm Tom. | 否 |
| L017 | be a good friend | You are my friend. | 否 |
| L032 | draw my family | I'm drawing my family. | 否 |
| L033 | talk about family | This is my family. | 否 |
| L034 | different families | My family is big! | 否 |
| L035–038,043–046 | a pet dog / … | Look! A pet dog! 等 | 否（展示句，非标题复读） |
| L049–050 | draw a pet / wild animal | I'm drawing a cat/tiger | 否 |

### B. 历史 prompt 里仍存在的标签复读（旧文件，勿再用）

全库扫描 Dialogue 中出现「已知项目标签」或标题原词复读 ≥1：

| 文件 | 问题台词 |
|------|----------|
| `desert-level-014-kind-words-v1/...` | `kind words` ×4 |
| `desert-level-030-family-tree-v1/...` | `family tree` ×4 |
| `desert-level-031-add-a-family-photo-v1/...` | `add a family photo` ×4 |
| `desert-level-048-animal-picture-book-v1/...` | `animal picture book` ×4 |

这 4 关在合同里已是 **DELETE / skipGeneration**（L014/030/031/048）；**latest/r3/reqa 台词已改成自然句**。  
**不要**再用上述 `*-v1` prompt 去生成或当验收真源。

### C. 不算本问题的情况

- 标题本身就是自然句，且 Dialogue 里 **合理出现 1–2 次**（如 `What's your name?`、`This is my mum.`）→ 教学句，不是项目标签复读。  
- `Let's play together!` 首尾各一次 + 中间变化 → 可接受，不是傻瓜复读 title×4。

---

## 检测方法（可复跑）

对每个 prompt 的 `Dialogue:` 引号句：

1. 若标题是项目标签（非自然句 / kebab / mind map / kind words / share with friends 等），**禁止** `norm(line)==norm(title)`  
2. 禁止 Dialogue 出现 `kind words` / `friend mind map` / `family tree` / `share with friends` / `add a family photo` / `animal picture book` 等 **整句标签**  
3. CEFR focus / spokenTarget 必须是自然口语句，**不能**等于活动标签标题  

---

## 总判

| 范围 | 标签复读 |
|------|----------|
| L010 全部现存 prompt | **无**（已教分享用语） |
| L001–L050 **latest 可生成** | **无硬 FAIL** |
| 历史 v1 僵尸 prompt | **4 个 DELETE 关** 仍有，已隔离勿用 |

**没有**在「当前 r4 / 现行合同」里发现第二波 share-with-friends 式全关污染；残留只在 4 个已 DELETE 的旧 v1 文件。
