# R2 · 题库源数据盘点与结构核验

> Mimo 产出 · 2026-07-23
> 可追溯源: script.js (require export) + e2e-auth-flow.mjs (断言)

---

## 1. 数据量

| 地图 | export 名 | 数组长度 | 来源常量 | 备注 |
|------|-----------|---------|----------|------|
| 海岛 | `levels` | **200** | `courseUnits` = `curriculumUnits`(10 unit) + `additionalLevelUnits`(10 unit) | `DISPLAY_LEVEL_COUNT = 200` |
| 沙漠 | `desertLevels` | **200** | `desertPhraseUnits`(20 unit) | 同上 |

✅ **ocean = 200, desert = 200**

---

## 2. Level 字段口径

每个 level 对象由 `buildLevelsFromUnits()` 生成，字段如下:

| 字段 | 类型 | 含义 | 示例 |
|------|------|------|------|
| `id` | number | 关卡序号 (1-based, 地图内独立编号) | 1, 11, 100 |
| `title` | string | 英文标题 (单词/短语) | "Banana" / "Good morning" |
| `zhTitle` | string | 中文释义 | "香蕉" / "早上好" |
| `topic` | string | 所属主题 (unit.topic) | "水果先遣队" / "日常问候" |
| `duration` | string | 预估时长 | "3 分钟" (每 unit 第10关为 "4 分钟") |
| `guidance` | string | 视频引导语 | "看一看画面，听清并跟读 banana。" |
| `question` | string | 题面模板 | "Which word means 香蕉?" |
| `options` | string[] | **4 个选项** (含正确答案) | ["papaya","mango","banana","lemon"] |
| `correct` | number | 正确答案在 options 中的 index (0-3) | 2 |
| `videoFile` | string? | 视频文件名 (仅前 10 关 + 11-30 关手动注入) | "level-11-banana.mp4" |
| `videoSrc` | string? | 视频完整 URL (含版本号) | "assets/video/free-levels/level-11-banana.mp4?v=..." |
| `videoMeta` | object? | 视频元信息 (仅部分关卡) | `{source:'libtv', qa:'reviewed-fruit-batch'}` |

**沙漠地图额外特点**: desertLevels 的 title = 原始短语 (不做 title case)，如 "Good morning"。无 videoFile/videoSrc/videoMeta。

---

## 3. buildLevelsFromUnits 生成逻辑

源码: `script.js:232-252`

```
function buildLevelsFromUnits(units, overrides, titleFor) {
  return units.flatMap((unit, unitIndex) =>
    unit.words.map(([word, zhTitle], wordIndex) => {
      const id = unitIndex * 10 + wordIndex + 1;
      const correct = (id - 1) % 4;           // ① 正确答案位置轮转 0,1,2,3
      const options = [1,2,3].map(offset =>     // ② 取同 unit 内偏移 1/2/3 的单词做干扰
        unit.words[(wordIndex + offset) % unit.words.length][0]
      );
      options.splice(correct, 0, word);         // ③ 把正确答案插入对应位置
      // ... 生成 level 对象 ...
      return { ...level, ...(overrides[id] || {}) };
    })
  );
}
```

**关键机制**:

1. **correct 位置**: `(id - 1) % 4`，即 id%4 依次为 1→0, 2→1, 3→2, 4→3, 5→0 循环
2. **干扰项来源**: 同一 unit (主题) 内的相邻单词，偏移 1/2/3 位，取 word[0] (英文)
3. **干扰项全是同主题词**: 不会出现跨主题干扰
4. **options 始终 4 项**: 数组长度永远是 4
5. **lessonOverrides (前 10 关)**: 手动覆盖了 options 和 correct，干扰项选自同 unit 但不遵循轮转规则

**correct 分布验证**:

| 地图 | correct=0 | correct=1 | correct=2 | correct=3 |
|------|-----------|-----------|-----------|-----------|
| 海岛 | 57 | 47 | 48 | 48 |
| 沙漠 | 50 | 50 | 50 | 50 |

沙漠完美均匀 (20 关 × 10 词 = 200，每关 correct=(id-1)%4 天然均匀)。海岛因前 10 关 override 手动设为 0，导致 correct=0 多 10 个。

---

## 4. UI 如何变成 2 选项

**数据层**: `buildLevelsFromUnits` 生成 4 选项 (options[4] + correct)
**UI 层**: 正式答题页只取 **2 个选项**:
- 正确答案: `level.options[level.correct]`
- 干扰项: `level.options` 中第一个非正确答案的项 (即 index 最小的 ≠ correct 的那项)

**验证来源**: `e2e-auth-flow.mjs:663-664`
```
assert.equal(optionWords.length, 2, `level ${level.id} should show two options`);
assert.equal(new Set(optionWords).size, 2, `level ${level.id} options must be unique`);
```

**实际效果示例** (level 11, banana):
- 4选项: `["papaya", "mango", "banana", "lemon"]`, correct=2
- UI 展示: `["papaya", "banana"]` (papaya 是 options[0]，第一个非 correct 的项)

⚠️ **注意**: UI 取的是 options 数组中 index 最小的非 correct 项，不是随机干扰。这意味着干扰项的选取是确定性的，且总是同主题的"第一个相邻词"。

---

## 5. questionPromptText

```js
function questionPromptText(level) {
  return `小朋友，视频里学到的单词，哪一个是${level.zhTitle}的意思？`;
}
```

这是实际展示给用户的题面文字，与 `level.question` (英文模板 "Which word means X?") 不同。UI 用的是 `questionPromptText`。

---

## 6. 主题分布

### 海岛 20 主题 (每主题 10 关 = 200 关)

| # | 主题 | unit 来源 | 关卡范围 |
|---|------|-----------|----------|
| 1 | Free Starter · 免费体验 | curriculumUnits[0] | 1-10 |
| 2 | 水果先遣队 | curriculumUnits[1] | 11-20 |
| 3 | 零食甜点 | curriculumUnits[2] | 21-30 |
| 4 | 吃饭喝喝 | curriculumUnits[3] | 31-40 |
| 5 | 蔬菜大餐 | curriculumUnits[4] | 41-50 |
| 6 | 萌宠动物 | curriculumUnits[5] | 51-60 |
| 7 | 大动物 | curriculumUnits[6] | 61-70 |
| 8 | 小小动物 | curriculumUnits[7] | 71-80 |
| 9 | 我的身体 | curriculumUnits[8] | 81-90 |
| 10 | 穿衣出门 | curriculumUnits[9] | 91-100 |
| 11 | 玩具游戏 | additionalLevelUnits[0] | 101-110 |
| 12 | 身边的人 | additionalLevelUnits[1] | 111-120 |
| 13 | 客厅卧室 | additionalLevelUnits[2] | 121-130 |
| 14 | 厨房餐桌 | additionalLevelUnits[3] | 131-140 |
| 15 | 洗漱浴室 | additionalLevelUnits[4] | 141-150 |
| 16 | 天气天空 | additionalLevelUnits[5] | 151-160 |
| 17 | 大自然 | additionalLevelUnits[6] | 161-170 |
| 18 | 交通工具 | additionalLevelUnits[7] | 171-180 |
| 19 | 常去的场所 | additionalLevelUnits[8] | 181-190 |
| 20 | 动作游戏 | additionalLevelUnits[9] | 191-200 |

### 沙漠 20 主题 (每主题 10 关 = 200 关)

| # | 主题 | 关卡范围 |
|---|------|----------|
| 1 | 日常问候 | 1-10 |
| 2 | 课堂规则 | 11-20 |
| 3 | 一日三餐 | 21-30 |
| 4 | 零食水果 | 31-40 |
| 5 | 洗漱卫生 | 41-50 |
| 6 | 身体动作 | 51-60 |
| 7 | 情绪表达 | 61-70 |
| 8 | 家庭互动 | 71-80 |
| 9 | 玩具游戏 | 81-90 |
| 10 | 颜色形状 | 91-100 |
| 11 | 数字时间 | 101-110 |
| 12 | 天气季节 | 111-120 |
| 13 | 动物宠物 | 121-130 |
| 14 | 动物园 | 131-140 |
| 15 | 出行交通 | 141-150 |
| 16 | 购物消费 | 151-160 |
| 17 | 学校学习 | 161-170 |
| 18 | 音乐艺术 | 171-180 |
| 19 | 运动比赛 | 181-190 |
| 20 | 职业梦想 | 191-200 |

---

## 7. 建议抽查的 20 关

### 海岛 10 关

| 关卡 | 主题 | 抽查理由 |
|------|------|----------|
| 1 | Free Starter | 首关, override 手写, 免费体验入口 |
| 5 | Free Starter | override 中间位, 验证手写选项一致性 |
| 10 | Free Starter | 末关, duration="4 分钟" (整10关特殊) |
| 11 | 水果先遣队 | 首个 buildLevelsFromUnits 自动生成关, 有 videoMeta |
| 20 | 水果先遣队 | unit 末关, 验证 wordIndex 循环边界 |
| 51 | 萌宠动物 | 中段起始, 无 videoFile/videoSrc |
| 100 | 穿衣出门 | 前10 unit 末关, id=100 整数关 |
| 101 | 玩具游戏 | additionalLevelUnits 首关, 验证 unitIndex 连续 |
| 150 | 洗漱浴室 | additional 中段末关 |
| 200 | 动作游戏 | 最后一关, id=200 边界 |

### 沙漠 10 关

| 关卡 | 主题 | 抽查理由 |
|------|------|----------|
| 1 | 日常问候 | 首关, correct=0 |
| 10 | 日常问候 | unit 末关, correct=3 (id=10, (10-1)%4=1, 不对——id=10 → (10-1)%4=1) |
| 11 | 课堂规则 | 第二 unit 首关, correct 恢复 |
| 30 | 一日三餐 | 第三 unit 末关 |
| 50 | 洗漱卫生 | 第五 unit 末关 |
| 81 | 玩具游戏 | 中段, 验证短语 options 独特性 |
| 100 | 颜色形状 | 整百关 |
| 131 | 动物园 | 后段起始 |
| 166 | 购物消费 | "How much" 类短语, 验证 title 不做 titleCase |
| 200 | 职业梦想 | 最后一关 |

---

## 8. 字段口径速查 (给最终整合者)

```
level.id         → 关卡序号 (1-based, 地图内独立)
level.title      → 英文 (海岛 titleCase, 沙漠原短语)
level.zhTitle    → 中文
level.topic      → 主题名 (unit.topic 原样)
level.options    → string[4] (数据层 4 选项, UI 只用前 2)
level.correct    → 0-3 (正确答案在 options 中的 index)
level.question   → "Which word means {zhTitle}?" (英文模板)
questionPromptText(level) → "小朋友，视频里学到的单词，哪一个是{zhTitle}的意思？" (实际 UI 题面)
level.guidance   → "看一看画面，听清并跟读 {word}。"
level.duration   → "3 分钟" 或 "4 分钟"
level.videoFile  → 仅前 30 关有值
level.videoSrc   → 仅前 30 关有值
level.videoMeta  → 仅部分关卡有值
```
