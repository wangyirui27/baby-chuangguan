# 海岛 1-200 文生视频提示词质检与沙漠预备词调整

日期：2026-08-02
对象：`baby-island-levels-v1`，3-5 岁非母语零基础儿童。

## 本轮结论

- 已按用户要求替换 091：`Pajamas` -> `Clothes`。
- 追加修正 096：`Lemon` -> `Scarf`；原因是 Lemon 混入 091-100 衣物穿戴段，破坏上下关连续性。
- 追加修正 101：`Teddy Bear` 首次 LibTV CLI 生成到 `progress=100%` 后返回 `status=2` 且无本地 mp4；已将场景从睡眠/床边/贴脸方向改为玩具角收拾后的毛绒熊互动，并重置为 `ready` 重新生成。
- 已复查 094-200，并把 23 个低复用/偏难/敏感/重复词替换为沙漠地图后续会遇到的更基础词。
- 092 `Shoes`、093 `Socks` 的关卡词与手写场景未改；1-90 的关卡词与手写场景未改，已成片状态保留。
- 按追加要求，未成片范围只让 MiniMax 一个 agent 质检：091、094-200，分为 091-130、131-165、166-200 三段。
- MiniMax 二审结论：三段均无 P0/P1；其中 131-165 的推理里点名 136 `Box`、138 `Table`、140 `Chopsticks` 偏弱，已按打回处理并复审通过。
- 本地机械扫描额外打回并重写 `One...`、`The child...`、`points...`、`looks at...`、`touches the...` 等模板化句式残留，最终未成片场景模板信号为 0。
- 公共 Shot Beats 已去掉 `point to`，避免继续暗示“指一下就念词”的生成模式。
- 未塞入 `Scientist`、`Monday`、`Tuesday`、`Hour`、`Doctor/Teacher` 等对 3-5 岁更抽象或职业化的词。
- 颜色词 `Red/Blue/Yellow/Green/White` 这轮暂未加入；原因是海岛当前规则仍以名词为主，颜色可单独开“颜色预备层”。

## 替换清单

| Level | Old | New | 理由 |
|---:|---|---|---|
| 091 | Pajamas | Clothes | 用户指出 Pajamas 太难；Clothes 对应沙漠 Change your clothes。 |
| 096 | Jacket | Scarf | 去掉 Jacket/Coat 近义负担，同时保持 091-100 的衣物穿戴连续性。 |
| 105 | Robot | Camel | 去掉 Robot；Camel 是沙漠强相关且可视化动物。 |
| 109 | Puzzle | Mouse | 去掉 Puzzle；Mouse 对应沙漠 The mouse is small。 |
| 119 | Elbow | Snake | 去掉细身体部位 Elbow；Snake 对应沙漠 The snake is long。 |
| 120 | Shoulder | Piano | 去掉细身体部位 Shoulder；Piano 对应沙漠 Play the piano。 |
| 141 | Potty | Drum | Potty 与 Toilet 重复且场景敏感；Drum 对应沙漠 Play the drum。 |
| 142 | Shampoo | Rope | 去掉 Shampoo；Rope 对应沙漠 Jump rope。 |
| 146 | Brush | Money | 去掉 Brush/Comb 相近负担；Money 对应沙漠 Save/Count money。 |
| 167 | Bridge | Traffic Light | Bridge 让位给更高频交通名词；Traffic Light 对应沙漠 Stop at the light。 |
| 168 | Gate | Snack | Gate 让位给沙漠 Open the snack bag 的核心词。 |
| 169 | Garden | Sugar | Garden 让位给沙漠 No sugar 的核心词。 |
| 170 | Hill | Nails | Hill 让位给沙漠 Cut your nails 的核心词。 |
| 177 | Ship | Night | Ship/Boat 重复；Night 对应 Good night / night time / black night。 |
| 179 | Scooter | Morning | Scooter 低复用；Morning 对应 Good morning / morning time。 |
| 180 | Van | Breakfast | Van 低复用；Breakfast 对应 Let’s have breakfast。 |
| 182 | Lunchbox | Lunch | Lunchbox 让位给沙漠 Let’s have lunch。 |
| 185 | Eraser | Dinner | Eraser 低复用；Dinner 对应 Let’s have dinner。 |
| 186 | Ruler | Goal | Ruler 低复用；Goal 对应 Score goal。 |
| 188 | Scissors | Bath | Scissors 有安全风险；Bath 对应 Take a bath。 |
| 189 | Glue | Song | Glue 低复用；Song 对应 Sing a song。 |
| 190 | Desk | Soccer | Desk 低复用；Soccer 对应 Play soccer。 |
| 195 | Rectangle | Picture | Rectangle 不在沙漠主线；Picture 对应 Draw a picture。 |

## 保留逻辑

- 保留最简单生活核：`Hat / Shirt / Pants / Ball / Baby / Face / Tooth / Bed / Door / Window / Cup / Bowl / Spoon / Plate / Bottle / Bag / Table / Soap / Towel / Tissue / Toilet / Toothbrush / Sun / Star / Rain / Tree / Grass / Leaf / Bus / Bike / Train / Boat / Truck / Crayon / Pencil / Paper / Circle / Square / Triangle`。
- 保留部分虽非沙漠核心但 3-5 岁容易在生活中指认的词：`Dress / Coat / Boots / Teddy Bear / Bubble / Balloon / Doll / Blocks / Sofa / Pillow / Blanket / Lamp / Clock / Mirror / Chair / Box / Fork / Chopsticks / Flower / Cloud / Snow / Umbrella / Key / Button / Bucket / Toothpaste / Sponge`。

## 成片重点观察

| Level | Noun | 观察点 |
|---:|---|---|
| 095 | Dress | Dress 保留为最简单衣物词之一；成片需避免时装展示。 |
| 099 | Coat | Coat 保留但需与 Shirt/Pants 区分，厚外套视觉要清楚。 |
| 100 | Boots | Boots 保留为可见衣物；成片需鞋靴清楚，不和 Shoes 混。 |
| 118 | Knee | Knee 保留为相对可指身体词；成片必须明确膝盖。 |
| 189 | Song | Song 是听觉名词，成片必须用听歌情境而不是抽象符号。 |
| 190 | Soccer | Soccer 是运动名词，成片要让 soccer ball/小球门辅助但不抢词。 |
| 191 | Circle | Circle 保留以呼应沙漠形状句；不能变课堂卡片。 |
| 192 | Square | Square 保留以呼应沙漠形状句；不能变课堂卡片。 |
| 193 | Triangle | Triangle 保留以呼应沙漠形状句；不能变课堂卡片。 |
| 194 | Heart | Heart 保留为生活心形；不要变身体心脏或胸口动作。 |

## 写入与验证

- Source: `docs/curriculum/toddler-noun-handcrafted-prompts-20260801.md`
- Workbench runtime: `/Users/yr/Library/Application Support/libtv-workbench/projects/baby-island-levels-v1/tasks.json`
- Final prompts: `/Users/yr/Documents/LibTV Workbench/projects/baby-island-levels-v1/input/final-prompts`
- CSV: `docs/curriculum/island-200-prompt-qc-20260802.csv`
- 最终验证：sourceRows=200，tasks=200，sourcePromptLevels=200，finalPromptFiles=200，mismatches=[]。
- Workbench 状态：`video-ready=93`，`ready=107`；091 已生成 `level-091-clothes.mp4`，未成片范围为 094-200，90 关以前没有未成片项。
- 2026-08-02 20:33 更新：094-100 已成片，101 已从 failed 重置为 ready；Workbench 状态为 `video-ready=100`，`ready=100`。
- 清理验证：`Pajamas=false`，`level-091-pajamas=false`，公共 `point to=false`，`hi mom=false`，`bye mom=false`。
