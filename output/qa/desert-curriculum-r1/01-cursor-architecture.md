---

## 9. 证据索引

| 证据 | 路径 / 位置 |
|---|---|
| 课程行 schema | `script.js:27-41`, `script.js:45-69`（含 L001–L017 rows） |
| level 构建 / options=title | `script.js:563-600` |
| distractor 按 title | `script.js:525-544` |
| desertLevels 导出 | `script.js:610` |
| 题干用 zhTitle | `script.js:1485-1489` |
| 视频 batch 读 desertLevels | `tools/video-prompts/generate-desert-video-batch.js:5,337` |
| Dialogue=title | 同文件 `dialogueFor` L158-176；`promptFor` L179-217 |
| anchors/scene 用 title 正则 | 同文件 L49-156 |
| checker 绑 title | `tools/video-prompts/check-desert-video-prompt.js`；调用 L265 |
| 质量合同 target∈Dialogue | `tools/video-prompts/desert-video-prompt-quality-contract.md` |
| quiz 锁 options===title | `quiz.test.js:1006-1087`, `1115-1136` |
| L013 错误台词落盘 | `output/media-production/desert-level-013-friend-mind-map-v1/prompts/level-013-friend-mind-map-v1.txt` L32-37 |
| L010 错误台词落盘 | `.../desert-level-010-share-with-friends-v1/prompts/...` L32-37 |
| L006 省略号台词落盘 | `.../desert-level-006-my-name-is-v1/prompts/...` L32-37 |

---

**OUTPUT:** `/Users/yr/宝宝闯关/output/qa/desert-curriculum-r1/01-cursor-architecture.md`  
**关卡证据计数（正文显式点名 ID，去重）：** L001 L002 L003 L004 L005 L006 L007 L008 L009 L010 L011 L012 L013 L014 L015 L016 L017 L018 L019 L020 L021 L030 L031 L032 L033 L034 L035 L036 L037 L038 L043 L044 L045 L046 L048 L049 L050 L051 L052 L053 L054 L065 L066 L067 L068 L069 L070 L071 L072 L073 L082 L083 L084 L099 L100 L132 L150 L165 L166 L167 L175 L184 L185 L187 L194 L199 → **66**  
另：§4.2 启发式全集 **59** 个 unfit-spoken ID 列表已给出。
`)