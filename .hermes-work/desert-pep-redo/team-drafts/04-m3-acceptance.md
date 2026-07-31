# 04-m3-acceptance｜沙漠重做验收标准（M3 终审清单）

> 项目：/tmp/baobao-chuangguan（真实路径 /Users/yr/宝宝闯关）
> 上游：01-mimo 目录骨架、02-zai 课程推理、03-deepseek 测试契约、05-grok 产品体验
> 角色：MiniMax M3。任务：定义"彻底重做到达效果"的验收标准、reject 条件、最终审计清单。
> 事实锚点：`.hermes-work/pep-alignment/source-notes.md`、`docs/curriculum/desert-pep-classroom-transfer-review.md`、`script.js`（desertLevels 200 关）。

---

## 1. 验收立场（先讲人话）

用户要的不是"沙漠里能学到东西"，而是**孩子在 App 里先学、之后上人教版/PEP 三上/三下课堂时能产生"这个我早就学过"**。
这种"撞车感"必须高密度、可迁移、可复现，单条命中不算合格。
所以验收的第一原则是：**课堂命中密度 × 题型闭环 × 数据可信**三者缺一不可。

### 1.1 这轮重做的"达效"定义

合格 = 同时满足以下五条：

1. **骨架对齐**：沙漠 200 关 100% 由 PEP 12 单元（去掉上下册各 1 个 Revision，共 12 个 Unit）分配；旧生活短语主题不再占用沙漠主线。
2. **题型闭环**：每单元至少出现 3 类题型——预学认读、课堂问法接住（How/What/Who/When 驱动问题）、Part C 项目迁移（mind map / family tree / picture book / paper garden / colour flip book / birthday card 等微任务）。
3. **数据结构可信**：每条题带 `pepGrade` / `pepUnit` / `pepPart` / `pepFocus` / `functionTag` / `transferProbe` / `promptKind`，可被审计程序直接 grep 出。
4. **不破信任**：题干不再写"单词"；UI 不再硬编码"单词"；旧偏离题（洗漱/天气/出行/购物/运动/职业/音乐艺术/身体动作）不在沙漠主线数据里。
5. **可测试**：新增的 quiz.test.js 断言全部绿灯，运行时数据 + UI 双层校验都通过。

---

## 2. 验收硬指标（量化部分）

### 2.1 课堂命中密度（核心硬指标）

| 指标 | 达标线 | 红线（reject 触发） |
|---|---|---|
| 沙漠主线带 `pepUnit` 的关卡占比 | ≥ 99%（200 关最多允许 0–2 关是"前置/引导/结算"非单元关） | < 95% 直接 reject |
| 命中三上 6 单元 | 6 / 6 全覆盖 | 任一单元 = 0 关 → reject |
| 命中三下 6 单元 | 6 / 6 全覆盖 | 任一单元 = 0 关 → reject |
| 每单元课堂问法题（`transferProbe` 非空） | ≥ 5 关 | < 3 关 → reject |
| 每单元 Part C 项目迁移题 | ≥ 1 关 | = 0 → reject |
| 旧偏离主题残留（洗漱/天气/出行/购物/运动/职业/音乐/身体动作）| 0 关 | > 0 → reject |

### 2.2 题型分布

| 题型 | 占比建议 | 红线 |
|---|---|---|
| 预学认读（中文 → 英文表达） | 35–45% | < 25% 说明没预学；> 55% 说明只剩认读 |
| 课堂问法接住（How/What/Who 老师会问） | 30–40% | < 25% 说明不够课堂感 |
| Part C 项目迁移题 | 10–20% | < 8% 说明没项目输出 |
| 对话轮次（Let's talk 双人轮） | 10–15% | < 5% 说明没有对话迁移 |
| Revision / 阶段复习 | 占三上 U6 之后 + 三下 U6 之后各 1 段，合计 ≤ 10% | > 15% 说明挤占主线 |

### 2.3 文案红线（文案层 grep 校验）

下列字符串在 `script.js` 和所有 desert 关卡的题干/选项里必须为 0 命中：

- `单词`（中文"单词"）
- `word`（作为题目标签或题干正文）
- `Brush teeth` / `Flush toilet` / `Cut nails` / `Blow nose`
- `By bus` / `Traffic light` / `Turn left`
- `Too expensive` / `Keep change` / `Cheap price`
- `Score goal` / `Win game`
- `Play piano` / `Clap rhythm`
- `Be a scientist` / `Be a writer`
- `Sunny day` / `Hot summer` / `Snow is falling`
- `Run fast` / `Stamp feet` / `Turn around`

说明：`word` 在代码里如果只出现在 `world.id === 'desert'` / `window` / `keywords` 这种程序词里，允许；但凡作为题目标签或题干正文写给孩子的，必须 0。

---

## 3. reject 条件（这一类状况算没做完）

下面任何一条命中，**直接 reject 重做**，不接受"先这样、下一版再调"的补丁式响应：

1. **骨架没换**：沙漠仍按 20 个生活短语主题组织（问候/情绪/颜色/数字/动物/食物/家庭/学校/玩具/洗漱/天气/出行/购物/音乐/运动/职业 等）。
2. **单元命中空洞**：三上 U4 Plants around us 或三下 U3 Learning better 任意一个为 0 关。
3. **题型停在认读**：所有题仍是 zh→en 二选一，没有 How/What/Who/When 老师问法接住题、没有 Part C 项目迁移题。
4. **数据字段缺失**：题对象不含 `pepGrade / pepUnit / pepPart / pepFocus / functionTag / transferProbe / promptKind` 任意一项，无法被审计程序 grep。
5. **题干文案破信任**：题干/选项里仍出现"单词"或 `word` 作为题目称呼，或旧偏离主题（洗漱/天气/出行/购物/运动/职业/音乐/身体动作）任意一条仍在沙漠主线。
6. **测试未跑通**：03-deepseek 的测试契约未实现，或实现后未通过，或只跑测试不跑构建。
7. **只动一半**：旧沙漠数据没删除只是被覆盖；旧生活短语主题还存在于 `desertPhraseUnits` 或其它地方、未来可能回流。
8. **没有转移审计**：没有把"旧 20 主题 → PEP 单元"映射表落到 docs/curriculum/desert-pep-mapping.md，下游无法复审。
9. **Revision 处理逃避**：把上下册 Revision 直接删掉不处理、不并入任一单元，导致大纲不闭环。
10. **没有产物自检**：writer（Codex/Cursor）跑完没跑 grep 自检就直接报完成。
11. **结构与文案互相打架**：metadata 标的是 `pepUnit: "Plants around us"`，但 `transferProbe` 写的是问候问法——文案与标签不对应，等于数据污染。
12. **audit 数字与代码不一致**：任何一份产出文档里说"200 关、12 单元、平均每单元 16.6 关"和实际 `script.js` grep 出来的数字对不上。
13. **没拆清楚 Review vs Revision**：把 Revision 单元做成与 Unit1–6 并列的第 13 单元，而不是阶段复习段；或者把 Revision 段塞进了不该塞的题型。
14. **app 内仍残留旧称呼**：`renderDetail` / `questionPromptText` / 关卡标题 / 家长可见文案 任何一处还硬编码"单词"。
15. **没给家长信任感可见物**：家长面板/地图头/单元 chip 至少有一处明确写出"人教版 / PEP 三上/三下"或单元名缩写，否则孩子无法产生"我刚学过"的可被验证关联。

---

## 4. 最终审计检查项（提交前必跑）

按下面 15 项顺序执行，任何一项不通过 → 不算完成，回到对应席位重做。

### 4.1 骨架审计（grep + 计数）

- [ ] A1. `script.js` 中 `desertLevels` 实际关数 = 200。
- [ ] A2. 所有 200 关的 `pepGrade` ∈ {`3A`, `3B`}，无空、无非法。
- [ ] A3. 三上 U1–U6 + 三下 U1–U6 共 12 单元，全部出现在 200 关里。
- [ ] A4. 每个单元关数 ≥ 12 且 ≤ 25（避免某单元爆量或缺席）。
- [ ] A5. 旧 20 个生活短语主题词（洗漱/天气/出行/购物/运动/职业/音乐/身体动作 8 类）作为 `pepUnit` 值出现次数 = 0。
- [ ] A6. 三上 Revision（"Being a good guest"）与三下 Revision（"Going to a school fair"）作为阶段复习段各出现至少 1 关、不作为独立第 13/14 单元。

### 4.2 题型闭环审计

- [ ] B1. `transferProbe` 非空的关数 ≥ 120（占 200 关的 60%）。
- [ ] B2. 每单元 Part C 项目迁移题 ≥ 1 关，12 单元全覆盖。
- [ ] B3. 对话轮次题（双人 let's talk）合计 ≥ 20 关。
- [ ] B4. 阶段复习题（三上 Revision + 三下 Revision）合计 ≥ 6 关。
- [ ] B5. 中文 → 英文二选一题占比 ≤ 55%（避免又退化成翻译题）。

### 4.3 文案红线审计（grep 全代码 + 数据）

- [ ] C1. `script.js` 沙漠路径中无"单词"字面量；UI 文案中"单词"出现次数 = 0。
- [ ] C2. 题干/选项中 `promptKind` 全部为 `expression` 或同类，禁止 `word`。
- [ ] C3. 旧偏离短语（Brush teeth / Sunny day / By bus / Too expensive / Score goal / Play piano / Be a scientist / Run fast 等等）作为题干值出现次数 = 0。
- [ ] C4. `renderDetail` 不硬编码"单词"作为题目分类标签。

### 4.4 测试与构建

- [ ] D1. `quiz.test.js` 中新增 PEP 12 单元断言全部绿灯。
- [ ] D2. 新增 `desertLevels.length === 200` 断言绿灯。
- [ ] D3. 新增"无旧偏离主题"断言（grep 模式匹配 8 类生活短语）绿灯。
- [ ] D4. 新增 `transferProbe` 非空关数 ≥ 120 断言绿灯。
- [ ] D5. `npm run build` 或项目等价构建命令通过。

### 4.5 数据可信与可追溯

- [ ] E1. `docs/curriculum/desert-pep-mapping.md` 存在，含"旧 20 主题 → PEP 单元"映射表与每个旧主题的处置（保留重构 / 后移到支线 / 删除）。
- [ ] E2. `docs/curriculum/desert-pep-redo-changelog.md` 存在，列出本次重做的关数、字段、模型版本、Codex/Cursor 写手 ID。
- [ ] E3. writer 跑完产出后必须 grep 自检（4.3 全项）并把结果贴回 changelog。

### 4.6 家长与儿童 UX（05-grok 必检）

- [ ] F1. 沙漠地图头或单元 chip 至少一处明确显示"人教版 / PEP"或单元英文名（如 `Making friends`）。
- [ ] F2. 单元 chip 顺序 = 三上 U1→U6 + 三下 U1→U6 + 两个 Revision 段，不打乱顺序。
- [ ] F3. 关卡题干里出现 `How ...?` / `What ...?` / `Who ...?` 句式的关数 ≥ 60，让家长一眼看出是课堂问法。

### 4.7 审计边界声明

- [ ] G1. 终稿里写清已审范围：200 关 + PEP 目录级 + 测试断言 + 文案 grep。
- [ ] G2. 写清未审范围：人教版教材正文逐页词句、官方 PDF 逐页核验、视频内容句式、真机孩子课堂迁移数据。
- [ ] G3. 凡是数据驱动结论，都附 grep 命中数；不写"大约""基本"等模糊词。

---

## 5. 给写手（Codex / Cursor）的硬约束

1. **不要读 .env / 不要碰凭证**：所有写动作只在 script.js / quiz.test.js / docs/curriculum/ 内（红线已写）。
2. **一次写完，不留补丁**：03-deepseek 的测试契约 + 04-m3 的 reject 条件要一次满足；中途发现单元不均衡要整体回写，不要小补丁堆叠。
3. **每个单元写完先 grep 自检**：4.3 文案红线四项 + 4.2 题型闭环三项，跑完贴回 changelog 再往下写。
4. **字段不要省略**：`pepGrade / pepUnit / pepPart / pepFocus / functionTag / transferProbe / promptKind` 七项缺一不可，不接受"基本够用"的裁剪。
5. **Revision 段处理**：三上 Revision 紧跟 U6 之后，三下 Revision 紧跟 U6 之后，每段 3–5 关，做阶段复习题型（混单元回顾），不单独列单元号。
6. **后移旧主题**：洗漱/天气/出行/购物/运动/职业/音乐/身体动作 8 类不进沙漠主线；如要保留，留到 castle / ocean 支线或后续"高年级"地图里。
7. **不要重复造题**：每关题干/选项文本必须唯一；Codex 自检要去重。
8. **数据驱动结论写 grep 数**：所有"全部覆盖""无残留"都要带 grep 命中数，不要写"基本""约"。

---

## 6. 给审计者（下一轮 M3 / 用户）的最终交付

下面 6 个文件就是这次重做的全部交付物；缺一不算完成：

1. `/tmp/baobao-chuangguan/script.js` — desert 200 关已按 PEP 12 单元 + 2 段 Revision 重排。
2. `/tmp/baobao-chuangguan/quiz.test.js` — 03-deepseek 契约 + 本验收的 4.4 测试项全部绿灯。
3. `/tmp/baobao-chuangguan/docs/curriculum/desert-pep-mapping.md` — 旧 20 主题 → PEP 单元映射表。
4. `/tmp/baobao-chuangguan/docs/curriculum/desert-pep-redo-changelog.md` — 改动摘要 + grep 自检结果。
5. `/tmp/baobao-chuangguan/.hermes-work/desert-pep-redo/team-drafts/06-codex-writer.md` — 写手执行报告（含 grep 自检截图/数字）。
6. `/tmp/baobao-chuangguan/.hermes-work/desert-pep-redo/team-drafts/07-cursor-review.md` — 代码审稿报告（每项 reject 条件过一遍并打勾）。

---

## 7. 已审 / 未审（透明声明）

**已审**：本验收标准的硬指标、reject 条件、最终审计检查项均与 `desert-pep-classroom-transfer-review.md` 七席结论、`source-notes.md` PEP 12 单元目录、script.js desertLevels 200 关三处事实对齐。

**未审**：
- 人教版教材正文逐页词句与 App 题干字面是否一字不差。
- 官方 PDF / 实体教材目录与电子课本网目录的差异。
- 视频内容（如果未来加视频表达）是否真的覆盖 `transferProbe`。
- 6–8 岁真实课堂迁移效果（需要真机 + 用户配合）。

**下一步若要做到教材一字对齐**：必须用用户指定的人教版教材 PDF / 实体书为唯一真相源，重做"PEP 单元 → App 关卡"映射表；当前验收允许用电子课本网目录级对齐作为基线。