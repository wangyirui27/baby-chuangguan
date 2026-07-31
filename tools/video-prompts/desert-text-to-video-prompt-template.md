# 沙漠课程文生视频 Prompt 模板

适用：星愿少儿英语 / 宝宝闯关沙漠地图课程视频，LibTV / Seedance / 同类 text-to-video 模型。

核心目标：**一个视频只教一个表达**。画面必须先把意思演出来，英语只是配合，不靠字幕、卡片、黑板、标题解释。

---

## 0. 使用方法

1. 先填「输入卡片」。
2. 再复制「生产 Prompt 模板」，替换所有 `{{...}}`。
3. 保存到：
   `output/media-production/desert-level-{{LEVEL_000}}-{{slug}}-{{version}}/prompts/level-{{LEVEL_000}}-{{slug}}-{{version}}.txt`
4. 生成前跑结构 / 金标检查：
   `node tools/video-prompts/check-desert-gold-bar.js --level {{LEVEL_NUMBER}}`
5. 只要失败，先修 prompt，不烧视频额度。

---

## 1. 输入卡片

```yaml
level_number: {{6}}
level_id: {{006}}
title: {{My name is...}}
slug: {{my-name-is}}
version: {{r4-batchready-20260723}}

# 六层语义必须独立，禁止用 title 自动填 dialogue。
learning_objective: {{学会用 "My name is [name]" 自我介绍}}
question_task: {{哪一句英语表达是「My name is...」？}}
cefr_target_expression: {{My name is Tom.}}
answer_option_correct: {{My name is...}}
source_situation: {{Two children introduce themselves, greet by name, then go play.}}

# 角色身份要固定，避免 A/B 混乱。
child_a: {{Tom}}
child_b: {{Lily}}
child_a_role: {{introduces self first}}
