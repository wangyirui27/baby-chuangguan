# 沙漠地图 1-100 关 题目/答案表

> 数据源：`script.js` — `desertPhraseUnits` → `buildLevelsFromUnits()` → `desertLevels[]`
> 渲染逻辑：`renderDetail()` (script.js:3390-3399)，题型一实际展示 2 选项 = 正确答案 + 第一个干扰项
> 生成方式：Node 直接 require script.js 提取，未修改任何业务代码

## 字段说明

| 字段 | 来源 |
|------|------|
| 关卡 | `level.id` |
| 主题 | `level.topic`（来自 `desertPhraseUnits[unitIndex].topic`） |
| 英文短语 | `level.title`（`titleFor(phrase)` = phrase 本身，无 Title Case 转换） |
| 中文含义 | `level.zhTitle` |
| 题目文案（孩子看到的） | `questionPromptText(level)` 口播 + `renderDetail` 内 questionHtml 屏幕文字 |
| 正确答案 | `level.options[level.correct]` = 英文短语 |
| 2选1干扰项 | `distractors[0]`：`level.options` 中第一个非 correct 索引的选项 |
| 备注 | 审计标注 |

## 全表（1-100）

| 关卡 | 主题 | 英文短语 | 中文含义 | 题目文案（屏幕） | 正确答案 | 2选1干扰项 | 备注 |
|------|------|----------|----------|------------------|----------|-----------|------|
| 1 | 日常问候 | Good morning | 早上好 | 小朋友，视频里学到的单词，哪一个是「早上好」的意思？ | Good morning | How are you | ⚠️ 文案用「单词」但实际是短语，copy-paste 自岛屿地图 |
| 2 | 日常问候 | How are you | 你好吗 | 小朋友，视频里学到的单词，哪一个是「你好吗」的意思？ | How are you | See you later |  |
| 3 | 日常问候 | See you later | 待会儿见 | 小朋友，视频里学到的单词，哪一个是「待会儿见」的意思？ | See you later | Good night |  |
| 4 | 日常问候 | Good night | 晚安 | 小朋友，视频里学到的单词，哪一个是「晚安」的意思？ | Good night | Have fun |  |
| 5 | 日常问候 | Have fun | 玩得开心 | 小朋友，视频里学到的单词，哪一个是「玩得开心」的意思？ | Have fun | Goodbye |  |
| 6 | 日常问候 | Goodbye | 再见 | 小朋友，视频里学到的单词，哪一个是「再见」的意思？ | Goodbye | Thank you |  |
| 7 | 日常问候 | Thank you | 谢谢你 | 小朋友，视频里学到的单词，哪一个是「谢谢你」的意思？ | Thank you | You're welcome |  |
| 8 | 日常问候 | You're welcome | 不用谢 | 小朋友，视频里学到的单词，哪一个是「不用谢」的意思？ | You're welcome | Excuse me |  |
| 9 | 日常问候 | Excuse me | 打扰一下 | 小朋友，视频里学到的单词，哪一个是「打扰一下」的意思？ | Excuse me | I'm sorry |  |
| 10 | 日常问候 | I'm sorry | 对不起 | 小朋友，视频里学到的单词，哪一个是「对不起」的意思？ | I'm sorry | Good morning |  |
| 11 | 课堂规则 | Listen up | 注意听 | 小朋友，视频里学到的单词，哪一个是「注意听」的意思？ | Listen up | Hands up |  |
| 12 | 课堂规则 | Hands up | 举手 | 小朋友，视频里学到的单词，哪一个是「举手」的意思？ | Hands up | Line up |  |
| 13 | 课堂规则 | Line up | 排队 | 小朋友，视频里学到的单词，哪一个是「排队」的意思？ | Line up | Sit down |  |
| 14 | 课堂规则 | Sit down | 坐下 | 小朋友，视频里学到的单词，哪一个是「坐下」的意思？ | Sit down | Stand up |  |
| 15 | 课堂规则 | Stand up | 站起来 | 小朋友，视频里学到的单词，哪一个是「站起来」的意思？ | Stand up | Look here | ⚠️ 文案用「单词」但实际是短语，copy-paste 自岛屿地图 |
| 16 | 课堂规则 | Look here | 看这里 | 小朋友，视频里学到的单词，哪一个是「看这里」的意思？ | Look here | Quiet please |  |
| 17 | 课堂规则 | Quiet please | 请安静 | 小朋友，视频里学到的单词，哪一个是「请安静」的意思？ | Quiet please | Raise your hand |  |
| 18 | 课堂规则 | Raise your hand | 请举手 | 小朋友，视频里学到的单词，哪一个是「请举手」的意思？ | Raise your hand | Answer me |  |
| 19 | 课堂规则 | Answer me | 回答我 | 小朋友，视频里学到的单词，哪一个是「回答我」的意思？ | Answer me | Work in pairs |  |
| 20 | 课堂规则 | Work in pairs | 两人合作 | 小朋友，视频里学到的单词，哪一个是「两人合作」的意思？ | Work in pairs | Listen up |  |
| 21 | 一日三餐 | Have breakfast | 吃早餐 | 小朋友，视频里学到的单词，哪一个是「吃早餐」的意思？ | Have breakfast | Have lunch |  |
| 22 | 一日三餐 | Have lunch | 吃午餐 | 小朋友，视频里学到的单词，哪一个是「吃午餐」的意思？ | Have lunch | Have dinner |  |
| 23 | 一日三餐 | Have dinner | 吃晚餐 | 小朋友，视频里学到的单词，哪一个是「吃晚餐」的意思？ | Have dinner | Drink milk |  |
| 24 | 一日三餐 | Drink milk | 喝牛奶 | 小朋友，视频里学到的单词，哪一个是「喝牛奶」的意思？ | Drink milk | Wash hands |  |
| 25 | 一日三餐 | Wash hands | 洗手 | 小朋友，视频里学到的单词，哪一个是「洗手」的意思？ | Wash hands | Wipe mouth |  |
| 26 | 一日三餐 | Wipe mouth | 擦嘴 | 小朋友，视频里学到的单词，哪一个是「擦嘴」的意思？ | Wipe mouth | Use chopsticks |  |
| 27 | 一日三餐 | Use chopsticks | 用筷子 | 小朋友，视频里学到的单词，哪一个是「用筷子」的意思？ | Use chopsticks | Taste it |  |
| 28 | 一日三餐 | Taste it | 尝一尝 | 小朋友，视频里学到的单词，哪一个是「尝一尝」的意思？ | Taste it | Full up | ⚠️ 文案用「单词」但实际是短语，copy-paste 自岛屿地图 |
| 29 | 一日三餐 | Full up | 吃饱了 | 小朋友，视频里学到的单词，哪一个是「吃饱了」的意思？ | Full up | More rice |  |
| 30 | 一日三餐 | More rice | 再来点饭 | 小朋友，视频里学到的单词，哪一个是「再来点饭」的意思？ | More rice | Have breakfast |  |
| 31 | 零食水果 | Cut apple | 切苹果 | 小朋友，视频里学到的单词，哪一个是「切苹果」的意思？ | Cut apple | Peel banana |  |
| 32 | 零食水果 | Peel banana | 剥香蕉 | 小朋友，视频里学到的单词，哪一个是「剥香蕉」的意思？ | Peel banana | Open snack |  |
| 33 | 零食水果 | Open snack | 打开零食 | 小朋友，视频里学到的单词，哪一个是「打开零食」的意思？ | Open snack | Share cookie |  |
| 34 | 零食水果 | Share cookie | 分享饼干 | 小朋友，视频里学到的单词，哪一个是「分享饼干」的意思？ | Share cookie | Sweet candy |  |
| 35 | 零食水果 | Sweet candy | 甜甜的糖果 | 小朋友，视频里学到的单词，哪一个是「甜甜的糖果」的意思？ | Sweet candy | Sour lemon |  |
| 36 | 零食水果 | Sour lemon | 酸酸的柠檬 | 小朋友，视频里学到的单词，哪一个是「酸酸的柠檬」的意思？ | Sour lemon | Eat slowly |  |
| 37 | 零食水果 | Eat slowly | 慢慢吃 | 小朋友，视频里学到的单词，哪一个是「慢慢吃」的意思？ | Eat slowly | No sugar | ⚠️ 文案用「单词」但实际是短语，copy-paste 自岛屿地图 |
| 38 | 零食水果 | No sugar | 不要糖 | 小朋友，视频里学到的单词，哪一个是「不要糖」的意思？ | No sugar | Yummy taste |  |
| 39 | 零食水果 | Yummy taste | 好吃的味道 | 小朋友，视频里学到的单词，哪一个是「好吃的味道」的意思？ | Yummy taste | Bite it |  |
| 40 | 零食水果 | Bite it | 咬一口 | 小朋友，视频里学到的单词，哪一个是「咬一口」的意思？ | Bite it | Cut apple |  |
| 41 | 洗漱卫生 | Brush teeth | 刷牙 | 小朋友，视频里学到的单词，哪一个是「刷牙」的意思？ | Brush teeth | Wash face |  |
| 42 | 洗漱卫生 | Wash face | 洗脸 | 小朋友，视频里学到的单词，哪一个是「洗脸」的意思？ | Wash face | Comb hair |  |
| 43 | 洗漱卫生 | Comb hair | 梳头发 | 小朋友，视频里学到的单词，哪一个是「梳头发」的意思？ | Comb hair | Take a bath |  |
| 44 | 洗漱卫生 | Take a bath | 洗澡 | 小朋友，视频里学到的单词，哪一个是「洗澡」的意思？ | Take a bath | Flush toilet |  |
| 45 | 洗漱卫生 | Flush toilet | 冲马桶 | 小朋友，视频里学到的单词，哪一个是「冲马桶」的意思？ | Flush toilet | Use soap |  |
| 46 | 洗漱卫生 | Use soap | 用肥皂 | 小朋友，视频里学到的单词，哪一个是「用肥皂」的意思？ | Use soap | Dry hands |  |
| 47 | 洗漱卫生 | Dry hands | 擦干手 | 小朋友，视频里学到的单词，哪一个是「擦干手」的意思？ | Dry hands | Change clothes |  |
| 48 | 洗漱卫生 | Change clothes | 换衣服 | 小朋友，视频里学到的单词，哪一个是「换衣服」的意思？ | Change clothes | Cut nails |  |
| 49 | 洗漱卫生 | Cut nails | 剪指甲 | 小朋友，视频里学到的单词，哪一个是「剪指甲」的意思？ | Cut nails | Blow nose | ⚠️ 文案用「单词」但实际是短语，copy-paste 自岛屿地图 |
| 50 | 洗漱卫生 | Blow nose | 擤鼻子 | 小朋友，视频里学到的单词，哪一个是「擤鼻子」的意思？ | Blow nose | Brush teeth |  |
| 51 | 身体动作 | Run fast | 跑得快 | 小朋友，视频里学到的单词，哪一个是「跑得快」的意思？ | Run fast | Jump high |  |
| 52 | 身体动作 | Jump high | 跳得高 | 小朋友，视频里学到的单词，哪一个是「跳得高」的意思？ | Jump high | Clap hands |  |
| 53 | 身体动作 | Clap hands | 拍手 | 小朋友，视频里学到的单词，哪一个是「拍手」的意思？ | Clap hands | Stamp feet |  |
| 54 | 身体动作 | Stamp feet | 跺脚 | 小朋友，视频里学到的单词，哪一个是「跺脚」的意思？ | Stamp feet | Touch nose |  |
| 55 | 身体动作 | Touch nose | 摸鼻子 | 小朋友，视频里学到的单词，哪一个是「摸鼻子」的意思？ | Touch nose | Close eyes |  |
| 56 | 身体动作 | Close eyes | 闭眼睛 | 小朋友，视频里学到的单词，哪一个是「闭眼睛」的意思？ | Close eyes | Open mouth |  |
| 57 | 身体动作 | Open mouth | 张开嘴 | 小朋友，视频里学到的单词，哪一个是「张开嘴」的意思？ | Open mouth | Shake head |  |
| 58 | 身体动作 | Shake head | 摇头 | 小朋友，视频里学到的单词，哪一个是「摇头」的意思？ | Shake head | Turn around | ⚠️ 文案用「单词」但实际是短语，copy-paste 自岛屿地图 |
| 59 | 身体动作 | Turn around | 转一圈 | 小朋友，视频里学到的单词，哪一个是「转一圈」的意思？ | Turn around | Sit still |  |
| 60 | 身体动作 | Sit still | 坐好不动 | 小朋友，视频里学到的单词，哪一个是「坐好不动」的意思？ | Sit still | Run fast |  |
| 61 | 情绪表达 | I'm happy | 我很开心 | 小朋友，视频里学到的单词，哪一个是「我很开心」的意思？ | I'm happy | I'm sad |  |
| 62 | 情绪表达 | I'm sad | 我很难过 | 小朋友，视频里学到的单词，哪一个是「我很难过」的意思？ | I'm sad | I'm angry |  |
| 63 | 情绪表达 | I'm angry | 我生气了 | 小朋友，视频里学到的单词，哪一个是「我生气了」的意思？ | I'm angry | I'm scared |  |
| 64 | 情绪表达 | I'm scared | 我害怕了 | 小朋友，视频里学到的单词，哪一个是「我害怕了」的意思？ | I'm scared | Be brave |  |
| 65 | 情绪表达 | Be brave | 勇敢一点 | 小朋友，视频里学到的单词，哪一个是「勇敢一点」的意思？ | Be brave | Calm down |  |
| 66 | 情绪表达 | Calm down | 冷静下来 | 小朋友，视频里学到的单词，哪一个是「冷静下来」的意思？ | Calm down | Don't cry |  |
| 67 | 情绪表达 | Don't cry | 不要哭 | 小朋友，视频里学到的单词，哪一个是「不要哭」的意思？ | Don't cry | Cheer up |  |
| 68 | 情绪表达 | Cheer up | 打起精神 | 小朋友，视频里学到的单词，哪一个是「打起精神」的意思？ | Cheer up | Smile big |  |
| 69 | 情绪表达 | Smile big | 大大地笑 | 小朋友，视频里学到的单词，哪一个是「大大地笑」的意思？ | Smile big | Laugh loud | ⚠️ 文案用「单词」但实际是短语，copy-paste 自岛屿地图 |
| 70 | 情绪表达 | Laugh loud | 大声笑 | 小朋友，视频里学到的单词，哪一个是「大声笑」的意思？ | Laugh loud | I'm happy |  |
| 71 | 家庭互动 | Help mom | 帮妈妈 | 小朋友，视频里学到的单词，哪一个是「帮妈妈」的意思？ | Help mom | Hug dad |  |
| 72 | 家庭互动 | Hug dad | 抱抱爸爸 | 小朋友，视频里学到的单词，哪一个是「抱抱爸爸」的意思？ | Hug dad | Kiss baby |  |
| 73 | 家庭互动 | Kiss baby | 亲亲宝宝 | 小朋友，视频里学到的单词，哪一个是「亲亲宝宝」的意思？ | Kiss baby | Play with me |  |
| 74 | 家庭互动 | Play with me | 和我玩 | 小朋友，视频里学到的单词，哪一个是「和我玩」的意思？ | Play with me | Read to me |  |
| 75 | 家庭互动 | Read to me | 读给我听 | 小朋友，视频里学到的单词，哪一个是「读给我听」的意思？ | Read to me | Tell a story |  |
| 76 | 家庭互动 | Tell a story | 讲故事 | 小朋友，视频里学到的单词，哪一个是「讲故事」的意思？ | Tell a story | Go to bed |  |
| 77 | 家庭互动 | Go to bed | 上床睡觉 | 小朋友，视频里学到的单词，哪一个是「上床睡觉」的意思？ | Go to bed | Wake up |  |
| 78 | 家庭互动 | Wake up | 醒一醒 | 小朋友，视频里学到的单词，哪一个是「醒一醒」的意思？ | Wake up | Get dressed |  |
| 79 | 家庭互动 | Get dressed | 穿好衣服 | 小朋友，视频里学到的单词，哪一个是「穿好衣服」的意思？ | Get dressed | Come here | ⚠️ 文案用「单词」但实际是短语，copy-paste 自岛屿地图 |
| 80 | 家庭互动 | Come here | 过来这里 | 小朋友，视频里学到的单词，哪一个是「过来这里」的意思？ | Come here | Help mom |  |
| 81 | 玩具游戏 | Play ball | 玩球 | 小朋友，视频里学到的单词，哪一个是「玩球」的意思？ | Play ball | Ride bike |  |
| 82 | 玩具游戏 | Ride bike | 骑自行车 | 小朋友，视频里学到的单词，哪一个是「骑自行车」的意思？ | Ride bike | Fly kite |  |
| 83 | 玩具游戏 | Fly kite | 放风筝 | 小朋友，视频里学到的单词，哪一个是「放风筝」的意思？ | Fly kite | Build blocks |  |
| 84 | 玩具游戏 | Build blocks | 搭积木 | 小朋友，视频里学到的单词，哪一个是「搭积木」的意思？ | Build blocks | Hide and seek |  |
| 85 | 玩具游戏 | Hide and seek | 捉迷藏 | 小朋友，视频里学到的单词，哪一个是「捉迷藏」的意思？ | Hide and seek | Tag you're it |  |
| 86 | 玩具游戏 | Tag you're it | 抓到你了 | 小朋友，视频里学到的单词，哪一个是「抓到你了」的意思？ | Tag you're it | My turn |  |
| 87 | 玩具游戏 | My turn | 轮到我 | 小朋友，视频里学到的单词，哪一个是「轮到我」的意思？ | My turn | Your turn |  |
| 88 | 玩具游戏 | Your turn | 轮到你 | 小朋友，视频里学到的单词，哪一个是「轮到你」的意思？ | Your turn | I win |  |
| 89 | 玩具游戏 | I win | 我赢了 | 小朋友，视频里学到的单词，哪一个是「我赢了」的意思？ | I win | You lose |  |
| 90 | 玩具游戏 | You lose | 你输了 | 小朋友，视频里学到的单词，哪一个是「你输了」的意思？ | You lose | Play ball | ⚠️ 文案用「单词」但实际是短语，copy-paste 自岛屿地图 |
| 91 | 颜色形状 | Red and blue | 红色和蓝色 | 小朋友，视频里学到的单词，哪一个是「红色和蓝色」的意思？ | Red and blue | Yellow sun |  |
| 92 | 颜色形状 | Yellow sun | 黄色的太阳 | 小朋友，视频里学到的单词，哪一个是「黄色的太阳」的意思？ | Yellow sun | Green grass |  |
| 93 | 颜色形状 | Green grass | 绿色的草地 | 小朋友，视频里学到的单词，哪一个是「绿色的草地」的意思？ | Green grass | Black night |  |
| 94 | 颜色形状 | Black night | 黑色的夜晚 | 小朋友，视频里学到的单词，哪一个是「黑色的夜晚」的意思？ | Black night | White snow |  |
| 95 | 颜色形状 | White snow | 白色的雪 | 小朋友，视频里学到的单词，哪一个是「白色的雪」的意思？ | White snow | Round circle |  |
| 96 | 颜色形状 | Round circle | 圆形 | 小朋友，视频里学到的单词，哪一个是「圆形」的意思？ | Round circle | Square box |  |
| 97 | 颜色形状 | Square box | 方盒子 | 小朋友，视频里学到的单词，哪一个是「方盒子」的意思？ | Square box | Triangle roof |  |
