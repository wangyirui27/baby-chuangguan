const curriculumUnits = [
  { topic: 'Free Starter · 免费体验', words: [['mom', '妈妈'], ['dad', '爸爸'], ['grandma', '奶奶'], ['grandpa', '爷爷'], ['hand', '手'], ['rice', '饭'], ['water', '水'], ['car', '车'], ['dog', '狗'], ['book', '书']] },
  { topic: '水果先遣队', words: [['banana', '香蕉'], ['papaya', '木瓜'], ['mango', '芒果'], ['lemon', '柠檬'], ['kiwi', '猕猴桃'], ['apple', '苹果'], ['peach', '桃子'], ['pear', '梨'], ['grape', '葡萄'], ['coconut', '椰子']] },
  { topic: '零食甜点', words: [['lollipop', '棒棒糖'], ['jelly', '果冻'], ['candy', '糖果'], ['cookie', '饼干'], ['chocolate', '巧克力'], ['ice cream', '冰激凌'], ['cake', '蛋糕'], ['donut', '甜甜圈'], ['popcorn', '爆米花'], ['honey', '蜂蜜']] },
  { topic: '吃饭喝喝', words: [['egg', '鸡蛋'], ['bun', '包子'], ['bread', '面包'], ['milk', '牛奶'], ['juice', '果汁'], ['yogurt', '酸奶'], ['cheese', '奶酪'], ['soup', '汤'], ['noodle', '面条'], ['dumpling', '饺子']] },
  { topic: '蔬菜大餐', words: [['tomato', '西红柿'], ['potato', '土豆'], ['pizza', '披萨'], ['burger', '汉堡'], ['salad', '沙拉'], ['carrot', '胡萝卜'], ['corn', '玉米'], ['pumpkin', '南瓜'], ['mushroom', '蘑菇'], ['sandwich', '三明治']] },
  { topic: '萌宠动物', words: [['puppy', '小狗'], ['kitty', '小猫'], ['bunny', '小兔'], ['duck', '鸭子'], ['chick', '小鸡'], ['pig', '猪'], ['cow', '奶牛'], ['cat', '猫'], ['sheep', '绵羊'], ['horse', '马']] },
  { topic: '大动物', words: [['panda', '熊猫'], ['koala', '考拉'], ['hippo', '河马'], ['monkey', '猴子'], ['tiger', '老虎'], ['lion', '狮子'], ['zebra', '斑马'], ['giraffe', '长颈鹿'], ['elephant', '大象'], ['kangaroo', '袋鼠']] },
  { topic: '小小动物', words: [['butterfly', '蝴蝶'], ['fish', '鱼'], ['frog', '青蛙'], ['bee', '蜜蜂'], ['bird', '小鸟'], ['turtle', '乌龟'], ['crab', '螃蟹'], ['ant', '蚂蚁'], ['snail', '蜗牛'], ['ladybug', '瓢虫']] },
  { topic: '我的身体', words: [['tummy', '小肚子'], ['eye', '眼睛'], ['ear', '耳朵'], ['nose', '鼻子'], ['mouth', '嘴巴'], ['head', '头'], ['hair', '头发'], ['foot', '脚'], ['leg', '腿'], ['arm', '手臂']] },
  { topic: '穿衣出门', words: [['pajamas', '睡衣'], ['shoes', '鞋子'], ['socks', '袜子'], ['hat', '帽子'], ['dress', '裙子'], ['jacket', '夹克'], ['shirt', '上衣'], ['pants', '裤子'], ['coat', '外套'], ['boots', '靴子']] },
];

const additionalLevelUnits = [
  { topic: '玩具游戏', words: [['teddy bear', '泰迪熊'], ['bubble', '泡泡'], ['balloon', '气球'], ['ball', '球'], ['robot', '机器人'], ['doll', '娃娃'], ['kite', '风筝'], ['block', '积木'], ['puzzle', '拼图'], ['slide', '滑梯']] },
  { topic: '身边的人', words: [['baby', '宝宝'], ['boy', '男孩'], ['girl', '女孩'], ['sister', '姐妹'], ['brother', '兄弟'], ['aunt', '阿姨'], ['uncle', '叔叔'], ['friend', '朋友'], ['teacher', '老师'], ['family', '家人']] },
  { topic: '客厅卧室', words: [['sofa', '沙发'], ['bed', '床'], ['pillow', '枕头'], ['blanket', '被子'], ['lamp', '台灯'], ['clock', '时钟'], ['mirror', '镜子'], ['door', '门'], ['window', '窗户'], ['chair', '椅子']] },
  { topic: '厨房餐桌', words: [['cup', '杯子'], ['bowl', '碗'], ['spoon', '勺子'], ['plate', '盘子'], ['bottle', '瓶子'], ['box', '盒子'], ['bag', '包'], ['table', '桌子'], ['fork', '叉子'], ['chopsticks', '筷子']] },
  { topic: '洗漱浴室', words: [['potty', '小马桶'], ['shampoo', '洗发水'], ['soap', '肥皂'], ['towel', '毛巾'], ['tissue', '纸巾'], ['brush', '刷子'], ['comb', '梳子'], ['bathtub', '浴缸'], ['toilet', '马桶'], ['toothbrush', '牙刷']] },
  { topic: '天气天空', words: [['moon', '月亮'], ['sun', '太阳'], ['star', '星星'], ['rainbow', '彩虹'], ['sky', '天空'], ['cloud', '云'], ['rain', '雨'], ['snow', '雪'], ['wind', '风'], ['umbrella', '雨伞']] },
  { topic: '大自然', words: [['flower', '花'], ['tree', '树'], ['grass', '草地'], ['leaf', '树叶'], ['sea', '大海'], ['beach', '海滩'], ['shell', '贝壳'], ['sand', '沙子'], ['river', '河'], ['mountain', '山']] },
  { topic: '交通工具', words: [['taxi', '出租车'], ['bus', '公交车'], ['bike', '自行车'], ['train', '火车'], ['plane', '飞机'], ['boat', '小船'], ['ship', '大船'], ['subway', '地铁'], ['scooter', '滑板车'], ['ambulance', '救护车']] },
  { topic: '常去的场所', words: [['zoo', '动物园'], ['park', '公园'], ['home', '家'], ['farm', '农场'], ['school', '学校'], ['store', '商店'], ['playground', '游乐场'], ['supermarket', '超市'], ['hospital', '医院'], ['library', '图书馆']] },
  { topic: '动作游戏', words: [['jump', '跳'], ['run', '跑'], ['swim', '游泳'], ['dance', '跳舞'], ['sing', '唱歌'], ['play', '玩'], ['eat', '吃'], ['drink', '喝'], ['walk', '走'], ['sleep', '睡觉']] },
];

const desertPhraseUnits = [
  { topic: '日常问候', words: [['Good morning!', '早上好'], ['How are you?', '你好吗'], ['See you later!', '待会儿见'], ['Good night!', '晚安'], ['Have fun!', '玩得开心'], ['Goodbye!', '再见'], ['Thank you!', '谢谢你'], ["You're welcome!", '不用谢'], ['Excuse me.', '打扰一下'], ["I'm sorry.", '对不起']] },
  { topic: '课堂规则', words: [['Listen, please.', '请注意听'], ['Raise your hand.', '请举手'], ["Let's line up.", '我们排队吧'], ['Sit down, please.', '请坐下'], ['Stand up, please.', '请站起来'], ['Look over here.', '看这边'], ['Quiet, please.', '请安静'], ['Can you answer?', '你能回答吗'], ["Let's work together.", '我们一起合作吧'], ['Try it with me.', '和我一起试试']] },
  { topic: '一日三餐', words: [["Let's have breakfast.", '我们吃早餐吧'], ["Let's have lunch.", '我们吃午餐吧'], ["Let's have dinner.", '我们吃晚餐吧'], ['Drink some milk.', '喝点牛奶'], ['Wash your hands.', '洗洗手'], ['Wipe your mouth.', '擦擦嘴'], ['Use your chopsticks.', '用你的筷子'], ['Taste it.', '尝一尝'], ["I'm full.", '我吃饱了'], ['More rice, please.', '请再来点饭']] },
  { topic: '零食水果', words: [['Cut the apple.', '切这个苹果'], ['Peel the banana.', '剥这个香蕉'], ['Open the snack bag.', '打开零食袋'], ["Let's share this cookie.", '我们分享这块饼干吧'], ['The candy is sweet.', '糖果是甜的'], ['The lemon is sour.', '柠檬是酸的'], ['Eat slowly.', '慢慢吃'], ['No sugar, please.', '请不要糖'], ['It tastes yummy.', '它尝起来很好吃'], ['Take a bite.', '咬一口']] },
  { topic: '洗漱卫生', words: [['Brush your teeth.', '刷刷牙'], ['Wash your face.', '洗洗脸'], ['Comb your hair.', '梳梳头发'], ['Take a bath.', '洗个澡'], ['Flush the toilet.', '冲马桶'], ['Use soap.', '用肥皂'], ['Dry your hands.', '擦干手'], ['Change your clothes.', '换衣服'], ['Cut your nails.', '剪指甲'], ['Blow your nose.', '擤鼻子']] },
  { topic: '身体动作', words: [['Run fast!', '跑快点'], ['Jump high!', '跳高点'], ['Clap your hands.', '拍拍手'], ['Stamp your feet.', '跺跺脚'], ['Touch your nose.', '摸摸鼻子'], ['Close your eyes.', '闭上眼睛'], ['Open your mouth.', '张开嘴巴'], ['Shake your head.', '摇摇头'], ['Turn around.', '转一圈'], ['Sit still, please.', '请坐好不动']] },
  { topic: '情绪表达', words: [["I'm happy.", '我很开心'], ["I'm sad.", '我很难过'], ["I'm angry.", '我生气了'], ["I'm scared.", '我害怕了'], ['Be brave.', '勇敢一点'], ['Calm down.', '冷静下来'], ["Don't cry.", '别哭'], ['Cheer up!', '打起精神'], ['Give me a big smile.', '给我一个大大的笑容'], ["Let's laugh together.", '我们一起笑吧']] },
  { topic: '家庭互动', words: [['I can help Mom.', '我可以帮妈妈'], ['Give Dad a hug.', '给爸爸一个拥抱'], ['Give the baby a kiss.', '亲亲宝宝'], ['Play with me.', '和我一起玩'], ['Can you read to me?', '你能读给我听吗'], ['Can you tell me a story?', '你能给我讲个故事吗'], ["Let's go to bed.", '我们上床睡觉吧'], ['Wake up, please.', '请醒一醒'], ['Get dressed, please.', '请穿好衣服'], ['Come here, please.', '请过来']] },
  { topic: '玩具游戏', words: [["Let's play ball.", '我们玩球吧'], ['Ride your bike.', '骑你的自行车'], ['Fly the kite.', '放风筝'], ['Build the blocks.', '搭积木'], ["Let's play hide-and-seek.", '我们玩捉迷藏吧'], ["Tag, you're it!", '抓到你了，轮到你'], ["It's my turn.", '轮到我了'], ["It's your turn.", '轮到你了'], ['I won!', '我赢了'], ['Good game!', '玩得真好']] },
  { topic: '颜色形状', words: [['I see red and blue.', '我看见红色和蓝色'], ['The sun is yellow.', '太阳是黄色的'], ['The grass is green.', '草地是绿色的'], ['The night is dark.', '夜晚是黑的'], ['The snow is white.', '雪是白色的'], ['It is a circle.', '它是圆形'], ['It is a square.', '它是正方形'], ['It is a triangle.', '它是三角形'], ['It is a star.', '它是星星形状'], ["Let's mix the colors.", '我们混合颜色吧']] },
  { topic: '数字时间', words: [['Count from one to ten.', '从一数到十'], ['Count to twenty.', '数到二十'], ['Add one more.', '再加一个'], ['Take one away.', '拿走一个'], ['What time is it?', '现在几点了'], ["It's morning time.", '现在是早晨时间'], ["It's night time.", '现在是夜晚时间'], ['It takes one hour.', '这需要一小时'], ['Today is Monday.', '今天是星期一'], ['Tomorrow is Tuesday.', '明天是星期二']] },
  { topic: '天气季节', words: [["It's sunny today.", '今天是晴天'], ["It's rainy today.", '今天是雨天'], ["It's windy today.", '今天刮风'], ["It's cloudy today.", '今天多云'], ['Summer is hot.', '夏天很热'], ['Winter is cold.', '冬天很冷'], ['Spring is warm.', '春天很暖和'], ['Autumn is cool.', '秋天很凉爽'], ["It's raining.", '下雨了'], ['Snow is falling.', '下雪了']] },
  { topic: '动物宠物', words: [['Feed the dog.', '喂小狗'], ['Walk the dog.', '遛小狗'], ['Pet the cat.', '摸摸小猫'], ['Watch the fish.', '看小鱼'], ["Don't chase the bird.", '不要追小鸟'], ['Let the butterfly fly.', '让蝴蝶飞走'], ['Ride the horse.', '骑马'], ['Milk the cow.', '挤牛奶'], ['Brush the sheep.', '给绵羊刷毛'], ['Collect the eggs.', '收鸡蛋']] },
  { topic: '动物园', words: [['I see a panda.', '我看见一只熊猫'], ['Watch the monkey.', '看这只猴子'], ['The giraffe eats leaves.', '长颈鹿吃树叶'], ['Look at the turtle.', '看这只乌龟'], ['Hear the lion roar.', '听狮子吼叫'], ['I see a tiger.', '我看见一只老虎'], ['The elephant is big.', '大象很大'], ['The mouse is small.', '小老鼠很小'], ['The snake is long.', '蛇很长'], ['The camel is tall.', '骆驼很高']] },
  { topic: '出行交通', words: [["Let's take the bus.", '我们坐公交车吧'], ["Let's go by car.", '我们坐小汽车去吧'], ["Let's go by bike.", '我们骑自行车去吧'], ["Let's take the train.", '我们坐火车吧'], ['Get on the bus.', '上公交车'], ['Get off the bus.', '下公交车'], ['Fasten your seatbelt.', '系好安全带'], ['Stop at the light.', '在灯前停下'], ['Go straight.', '直走'], ['Turn left.', '向左转']] },
  { topic: '购物消费', words: [['How much is it?', '它多少钱'], ["That's too expensive.", '那太贵了'], ['Can I pay now?', '我现在可以付款吗'], ["I'll buy this.", '我要买这个'], ['I want this, please.', '请给我这个'], ['Here is your change.', '这是找你的零钱'], ['Save your money.', '把钱存起来'], ['Count the money.', '数一数钱'], ['This is cheap.', '这个便宜'], ['This one is expensive.', '这个很贵']] },
  { topic: '学校学习', words: [['Read the book.', '读这本书'], ['Write the word.', '写这个单词'], ['Draw a picture.', '画一幅画'], ['Do your homework.', '做你的作业'], ['Ask a question.', '问一个问题'], ['Answer the question.', '回答这个问题'], ["Let's learn English.", '我们学英语吧'], ['Speak English, please.', '请说英语'], ['Try your best.', '尽力试试'], ['Try again.', '再试一次']] },
  { topic: '音乐艺术', words: [['Sing a song.', '唱一首歌'], ['Play the piano.', '弹钢琴'], ['Play the drum.', '打鼓'], ['You dance well.', '你跳得很好'], ['Draw a line.', '画一条线'], ['Paint it red.', '把它涂成红色'], ["Let's make music.", '我们做音乐吧'], ['Clap the rhythm.', '拍节奏'], ['The sound is loud.', '声音很大'], ['The sound is soft.', '声音很轻']] },
  { topic: '运动比赛', words: [['Kick the ball.', '踢这个球'], ['Throw the ball.', '扔这个球'], ['Catch the ball.', '接住这个球'], ['Bounce the ball.', '拍这个球'], ["Let's run a race.", '我们赛跑吧'], ['Swim fast!', '游快点'], ['Jump rope.', '跳绳'], ['Play soccer.', '踢足球'], ['You scored a goal!', '你进球了'], ['We won the game!', '我们赢了比赛']] },
  { topic: '职业梦想', words: [['I want to be a doctor.', '我想当医生'], ['I want to be a teacher.', '我想当老师'], ['I want to be a cook.', '我想当厨师'], ['I want to be a driver.', '我想当司机'], ['I want to be a singer.', '我想当歌手'], ['I want to be a player.', '我想当运动员'], ['I want to be a scientist.', '我想当科学家'], ['I want to be an artist.', '我想当艺术家'], ['I want to be a writer.', '我想当作家'], ['What do you want to be?', '你想当什么']] },
];

const CURRICULUM_STANDARD_6_8 = '义务教育英语课程标准2022 预备级-一级';
const CURRICULUM_CLAIM = '参考人教PEP主题，做6-8岁场景化先修与拓展';

function curriculum(theme, pepUnits, alignment = 'core') {
  return {
    standard: CURRICULUM_STANDARD_6_8,
    claim: CURRICULUM_CLAIM,
    theme,
    pepUnits,
    alignment,
  };
}

const CURRICULUM_ALIGNMENT_BY_TOPIC = {
  'Free Starter · 免费体验': curriculum('家庭、身体、日常物品与动物启蒙', ['PEP三上 U2 Different families', 'PEP三上 U1 Making friends']),
  '水果先遣队': curriculum('饮食与水果', ['PEP生活饮食主题拓展'], 'bridge'),
  '零食甜点': curriculum('饮食与喜好表达', ['PEP生活饮食主题拓展'], 'bridge'),
  '吃饭喝喝': curriculum('一日饮食与生活自理', ['PEP生活饮食主题拓展'], 'core'),
  '蔬菜大餐': curriculum('食物分类与健康饮食', ['PEP生活饮食主题拓展'], 'bridge'),
  '萌宠动物': curriculum('身边动物', ['PEP三上 U3 Amazing animals']),
  '大动物': curriculum('动物园与动物特征', ['PEP三上 U3 Amazing animals']),
  '小小动物': curriculum('自然观察与动物', ['PEP三上 U3 Amazing animals', 'PEP三上 U4 Plants around us']),
  '我的身体': curriculum('身体部位与自我认知', ['PEP自我认知主题拓展']),
  '穿衣出门': curriculum('衣物与日常生活', ['PEP日常生活主题拓展'], 'bridge'),
  '玩具游戏': curriculum('玩具、游戏与同伴互动', ['PEP三上 U1 Making friends'], 'bridge'),
  '身边的人': curriculum('家庭、朋友与老师', ['PEP三上 U2 Different families', 'PEP三上 U1 Making friends']),
  '客厅卧室': curriculum('家庭空间与物品', ['PEP三上 U2 Different families'], 'bridge'),
  '厨房餐桌': curriculum('餐桌物品与生活自理', ['PEP生活饮食主题拓展'], 'bridge'),
  '洗漱浴室': curriculum('卫生习惯与生活自理', ['PEP日常生活主题拓展'], 'bridge'),
  '天气天空': curriculum('天气与自然', ['PEP三上 U4 Plants around us'], 'bridge'),
  '大自然': curriculum('植物、自然与地点', ['PEP三上 U4 Plants around us']),
  '交通工具': curriculum('出行方式与社区生活', ['PEP社区生活主题拓展'], 'extension'),
  '常去的场所': curriculum('家庭、学校与社区地点', ['PEP三上 U1 Making friends', 'PEP社区生活主题拓展'], 'bridge'),
  '动作游戏': curriculum('动作指令与活动表达', ['PEP三上 U1 Making friends'], 'core'),
  '日常问候': curriculum('问候、告别与礼貌表达', ['PEP三上 U1 Making friends']),
  '课堂规则': curriculum('课堂指令与学习习惯', ['PEP三上 U1 Making friends']),
  '一日三餐': curriculum('饮食与生活自理短语', ['PEP生活饮食主题拓展'], 'core'),
  '零食水果': curriculum('食物处理与分享', ['PEP生活饮食主题拓展'], 'bridge'),
  '洗漱卫生': curriculum('卫生习惯与生活自理短语', ['PEP日常生活主题拓展'], 'bridge'),
  '身体动作': curriculum('身体部位与动作指令', ['PEP自我认知主题拓展']),
  '情绪表达': curriculum('情绪、鼓励与同伴沟通', ['PEP三上 U1 Making friends'], 'bridge'),
  '家庭互动': curriculum('家庭互动与日常请求', ['PEP三上 U2 Different families']),
  '颜色形状': curriculum('颜色、形状与描述', ['PEP三上 U5 The colourful world']),
  '数字时间': curriculum('数字、时间与顺序', ['PEP三上 U6 Useful numbers']),
  '天气季节': curriculum('天气、季节与自然现象', ['PEP三上 U4 Plants around us'], 'bridge'),
  '动物宠物': curriculum('动物照料与农场动物', ['PEP三上 U3 Amazing animals']),
  '动物园': curriculum('动物园动物与特征描述', ['PEP三上 U3 Amazing animals']),
  '出行交通': curriculum('出行指令与交通安全', ['PEP社区生活主题拓展'], 'extension'),
  '购物消费': curriculum('购物问价与数字应用', ['PEP三上 U6 Useful numbers'], 'extension'),
  '学校学习': curriculum('学校活动与学习行为', ['PEP三上 U1 Making friends'], 'bridge'),
  '音乐艺术': curriculum('艺术活动与感官表达', ['PEP跨学科活动主题拓展'], 'extension'),
  '运动比赛': curriculum('运动活动与规则表达', ['PEP同伴活动主题拓展'], 'extension'),
  '职业梦想': curriculum('职业认知与理想表达', ['PEP社会角色主题拓展'], 'extension'),
};

function curriculumAlignmentForTopic(topic) {
  const alignment = CURRICULUM_ALIGNMENT_BY_TOPIC[topic] || curriculum('日常英语场景', ['PEP主题拓展'], 'extension');
  return { ...alignment, pepUnits: alignment.pepUnits.slice() };
}

const FREE_LEVEL_COUNT = 10;
const DISPLAY_LEVEL_COUNT = 200;
const APP_RELEASE_VERSION = '1.0.0';
const APP_RELEASE_UPDATE_URL = 'app-release.json';
const ASSET_PACK_MANIFEST_URL = 'asset-packs.json';
const ASSET_PACK_STORAGE_KEY = 'baby-island-asset-packs-v1';
const LEVEL_VIDEO_STORAGE_KEY = 'baby-island-level-videos-v1';
const LEVEL_VIDEO_LOADING_LOTTIE_URL = 'assets/lottie/level-video-loading.json';

// ===== 启动页控制 (Animal-Island #7DC395 + home_bg + logo + 5秒 + 奶油3D跳过) =====
(function initAppSplash() {
  // Node 测试 require(script.js) 时无 DOM
  if (typeof document === 'undefined') return;
  try { document.body.classList.add('splash-lock'); } catch (_) {}
  const splash = document.getElementById('app-splash');
  const voice = document.getElementById('splash-voice'); // Peiqi 佩奇声优 VO

  // 清理历史版本残留：落在 splash 外的跳过按钮
  document.querySelectorAll('.splash-skip, #splash-skip-btn').forEach((el) => {
    if (!splash || !splash.contains(el)) el.remove();
  });

  if (!splash) {
    try { document.body.classList.remove('splash-lock'); } catch (_) {}
    try {
      window.dispatchEvent(new CustomEvent('app-splash-finished', { detail: { source: 'no-splash' } }));
    } catch (_) {}
    return;
  }

  const skipBtn = splash.querySelector('#splash-skip-btn, .splash-skip');
  let dismissed = false;

  function playVoice() {
    if (!voice) return;
    try {
      voice.currentTime = 0;
      const p = voice.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // 浏览器自动播放限制时静默；用户点跳过或5s后进入
        });
      }
    } catch (e) {}
  }

  function stopVoice() {
    if (!voice) return;
    try {
      voice.pause();
      voice.currentTime = 0;
    } catch (e) {}
  }

  function removeSplashNodes() {
    // 整块启动层 + 任何漏网跳过按钮一并摘掉
    document.querySelectorAll('#app-splash, .splash-skip, #splash-skip-btn').forEach((el) => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function hideSplash() {
    if (dismissed) return;
    dismissed = true;
    stopVoice();

    splash.classList.add('is-leaving');
    // 动画结束后彻底移除；超时兜底防止残留
    window.setTimeout(() => {
      splash.classList.add('is-gone');
      removeSplashNodes();
      try { document.body.classList.remove('splash-lock'); } catch (_) {}
      try {
        window.dispatchEvent(new CustomEvent('app-splash-finished', { detail: { source: 'splash' } }));
      } catch (_) {}
    }, 280);
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', hideSplash, { once: true });
  }

  // 强制停留 5 秒（仍可随时点跳过）
  window.setTimeout(hideSplash, 5000);
  playVoice();
})();

const FREE_LEVEL_VIDEO_VERSION = '20260720-map-switch-cards-v13';
const WORD_AUDIO_MANIFEST_VERSION = '20260801-desert-natural-dialogue-v1';
const VIP_PRODUCT_ID = 'baby_island_map_vip_001';
const paidAccessMessage = `第 ${FREE_LEVEL_COUNT + 1} 关起是会员关卡，后续课程内容会随更新开放。`;

const lessonOverrides = {
  1: {
    title: 'Mom',
    zhTitle: '妈妈',
    topic: 'Free Starter · 免费体验',
    guidance: '看一看画面，听清并跟读 mom。',
    question: 'Which word means 妈妈?',
    options: ['mom', 'dad', 'grandma', 'book'],
    correct: 0,
    videoSrc: `assets/video/free-levels/level-01-mom.mp4?v=${FREE_LEVEL_VIDEO_VERSION}`,
  },
  2: {
    title: 'Dad',
    zhTitle: '爸爸',
    topic: 'Free Starter · 免费体验',
    guidance: '看一看画面，听清并跟读 dad。',
    question: 'Which word means 爸爸?',
    options: ['dad', 'mom', 'grandpa', 'car'],
    correct: 0,
    videoSrc: `assets/video/free-levels/level-02-dad.mp4?v=${FREE_LEVEL_VIDEO_VERSION}`,
  },
  3: {
    title: 'Grandma',
    zhTitle: '奶奶',
    topic: 'Free Starter · 免费体验',
    guidance: '看一看画面，听清并跟读 grandma。',
    question: 'Which word means 奶奶?',
    options: ['grandma', 'mom', 'grandpa', 'dad'],
    correct: 0,
    videoSrc: `assets/video/free-levels/level-03-grandma.mp4?v=${FREE_LEVEL_VIDEO_VERSION}`,
    videoMeta: {
      source: 'libtv',
      taskId: '20260718163203980876515',
      qa: 'no-lip-sync-book-narration',
      audio: 'native-libtv',
    },
  },
  4: {
    title: 'Grandpa',
    zhTitle: '爷爷',
    topic: 'Free Starter · 免费体验',
    guidance: '看一看画面，听清并跟读 grandpa。',
    question: 'Which word means 爷爷?',
    options: ['grandpa', 'dad', 'grandma', 'mom'],
    correct: 0,
    videoSrc: `assets/video/free-levels/level-04-grandpa.mp4?v=${FREE_LEVEL_VIDEO_VERSION}`,
  },
  5: {
    title: 'Hand',
    zhTitle: '手',
    topic: 'Free Starter · 免费体验',
    guidance: '看一看画面，听清并跟读 hand。',
    question: 'Which word means 手?',
    options: ['hand', 'book', 'water', 'dog'],
    correct: 0,
    videoSrc: `assets/video/free-levels/level-05-hand.mp4?v=${FREE_LEVEL_VIDEO_VERSION}`,
  },
  6: {
    title: 'Rice',
    zhTitle: '饭',
    topic: 'Free Starter · 免费体验',
    guidance: '看一看画面，听清并跟读 rice。',
    question: 'Which word means 饭?',
    options: ['rice', 'water', 'book', 'dog'],
    correct: 0,
    videoSrc: `assets/video/free-levels/level-06-rice.mp4?v=${FREE_LEVEL_VIDEO_VERSION}`,
  },
  7: {
    title: 'Water',
    zhTitle: '水',
    topic: 'Free Starter · 免费体验',
    guidance: '看一看画面，听清并跟读 water。',
    question: 'Which word means 水?',
    options: ['water', 'rice', 'car', 'book'],
    correct: 0,
    videoSrc: `assets/video/free-levels/level-07-water.mp4?v=${FREE_LEVEL_VIDEO_VERSION}`,
  },
  8: {
    title: 'Car',
    zhTitle: '车',
    topic: 'Free Starter · 免费体验',
    guidance: '看一看画面，听清并跟读 car。',
    question: 'Which word means 车?',
    options: ['car', 'dog', 'book', 'water'],
    correct: 0,
    videoSrc: `assets/video/free-levels/level-08-car.mp4?v=${FREE_LEVEL_VIDEO_VERSION}`,
  },
  9: {
    title: 'Dog',
    zhTitle: '狗',
    topic: 'Free Starter · 免费体验',
    guidance: '看一看画面，听清并跟读 dog。',
    question: 'Which word means 狗?',
    options: ['dog', 'car', 'book', 'hand'],
    correct: 0,
    videoSrc: `assets/video/free-levels/level-09-dog.mp4?v=${FREE_LEVEL_VIDEO_VERSION}`,
  },
  10: {
    title: 'Book',
    zhTitle: '书',
    topic: 'Free Starter · 免费体验',
    guidance: '看一看画面，听清并跟读 book。',
    question: 'Which word means 书?',
    options: ['book', 'hand', 'car', 'water'],
    correct: 0,
    videoSrc: `assets/video/free-levels/level-10-book.mp4?v=${FREE_LEVEL_VIDEO_VERSION}`,
  },
};

const courseUnits = curriculumUnits.concat(additionalLevelUnits);

function buildLevelsFromUnits(units, overrides = {}, titleFor = (word) => word.replace(/\b\w/g, (letter) => letter.toUpperCase())) {
  return units.flatMap((unit, unitIndex) => unit.words.map(([word, zhTitle], wordIndex) => {
    const id = unitIndex * 10 + wordIndex + 1;
    const correct = (id - 1) % 4;
    const options = [1, 2, 3].map((offset) => unit.words[(wordIndex + offset) % unit.words.length][0]);
    options.splice(correct, 0, word);

    const level = {
      id,
      title: titleFor(word),
      zhTitle,
      topic: unit.topic,
      curriculum: curriculumAlignmentForTopic(unit.topic),
      duration: id % 10 === 0 ? '4 分钟' : '3 分钟',
      guidance: `看一看画面，听清并跟读 ${word}。`,
      question: `Which word means ${zhTitle}?`,
      options,
      correct,
    };

    return { ...level, ...(overrides[id] || {}) };
  }));
}

const levels = buildLevelsFromUnits(courseUnits, lessonOverrides)
  .map((level) => ({ ...level, worldId: 'ocean', itemType: 'word' }));
const desertLevels = buildLevelsFromUnits(desertPhraseUnits, {}, (phrase) => phrase)
  .map((level) => ({
    ...level,
    worldId: 'desert',
    itemType: 'expression',
    question: `Which English line means ${level.zhTitle}?`,
  }));

const MATH_COUNT_WORDS = ['0 个', '1 个', '2 个', '3 个', '4 个', '5 个'];

function mathCountLabel(count) {
  return `${MATH_COUNT_WORDS[count] || `${count} 个`}苹果`;
}

function mathChoiceCountsForLevel(levelId) {
  const targetCount = ((levelId - 1) % 5) + 1;
  const candidates = [
    targetCount,
    targetCount === 1 ? 0 : targetCount - 1,
    targetCount === 5 ? 3 : targetCount + 1,
    targetCount <= 3 ? targetCount + 2 : targetCount - 2,
  ].filter((count) => count >= 0 && count <= 5);
  const counts = [...new Set(candidates)].slice(0, 3);
  const shift = (levelId - 1) % counts.length;
  return counts.slice(shift).concat(counts.slice(0, shift));
}

function buildMathLevels(totalLevels = DISPLAY_LEVEL_COUNT) {
  return Array.from({ length: totalLevels }, (_, index) => {
    const id = index + 1;
    const targetCount = ((id - 1) % 5) + 1;
    const choiceCounts = mathChoiceCountsForLevel(id);
    const correct = choiceCounts.indexOf(targetCount);
    return {
      id,
      title: id === 1 ? '只有一个' : `数到 ${targetCount}`,
      zhTitle: '数量感知',
      topic: id <= FREE_LEVEL_COUNT ? '数学启蒙 · 免费体验' : '数学启蒙 · 会员练习',
      curriculum: {
        standard: '3-5岁数学启蒙',
        claim: '为人教版一年级数学“数一数”和10以内数认知打基础',
        alignment: 'core',
        theme: '数量感知',
        pepUnits: ['人教版一年级上册 准备课 数一数'],
      },
      duration: '2 分钟',
      guidance: `看清桌面，找出${mathCountLabel(targetCount)}的一组。`,
      question: `哪一组是${mathCountLabel(targetCount)}？`,
      options: choiceCounts.map(mathCountLabel),
      correct,
      worldId: 'math',
      itemType: 'count',
      targetCount,
      math: {
        objectName: '苹果',
        groups: choiceCounts.map((count, optionIndex) => ({
          id: `math-${id}-${optionIndex}`,
          count,
          label: mathCountLabel(count),
        })),
      },
    };
  });
}

const mathLevels = buildMathLevels();

const MATH_ATTEMPT_KEY = 'baby-island-math-attempts-v1';
const MATH_ATTEMPT_LIMIT = 80;
const MATH_ATTEMPT_SCHEMA_VERSION = 1;

function normalizeMathAttempts(value, limit = MATH_ATTEMPT_LIMIT) {
  const entries = Array.isArray(value) ? value : [];
  const safeLimit = Math.max(1, Number(limit) || MATH_ATTEMPT_LIMIT);
  return entries.map((entry) => {
    const levelId = Number(entry?.levelId);
    if (!Number.isInteger(levelId) || levelId < 1 || levelId > DISPLAY_LEVEL_COUNT) return null;
    const targetCount = Math.max(0, Math.min(10, Number(entry?.targetCount) || 0));
    const selectedCount = Number.isFinite(Number(entry?.selectedCount))
      ? Math.max(0, Math.min(10, Number(entry.selectedCount)))
      : null;
    const ts = Number.isFinite(Number(entry?.ts)) ? Number(entry.ts) : Date.now();
    const mode = ['easier', 'same', 'harder'].includes(entry?.mode) ? entry.mode : 'same';
    const responseMs = Number.isFinite(Number(entry?.responseMs))
      ? Math.max(0, Math.min(600000, Math.round(Number(entry.responseMs))))
      : null;
    return {
      attemptId: String(entry?.attemptId || `local-${ts}-${levelId}-${selectedCount ?? 'x'}-${mode}`).slice(0, 80),
      schemaVersion: MATH_ATTEMPT_SCHEMA_VERSION,
      ts,
      worldId: 'math',
      levelId,
      skill: String(entry?.skill || 'count'),
      targetCount,
      selected: String(entry?.selected || ''),
      selectedCount,
      correct: String(entry?.correct || mathCountLabel(targetCount)),
      isCorrect: entry?.isCorrect === true,
      mode,
      responseMs,
    };
  }).filter(Boolean).slice(-safeLimit);
}

function appendMathAttempt(log, attempt, limit = MATH_ATTEMPT_LIMIT) {
  return normalizeMathAttempts([...normalizeMathAttempts(log, limit), attempt], limit);
}

function mergeMathAttempts(localLog, remoteLog, limit = MATH_ATTEMPT_LIMIT) {
  const byId = new Map();
  [...normalizeMathAttempts(remoteLog, limit), ...normalizeMathAttempts(localLog, limit)].forEach((entry) => {
    byId.set(entry.attemptId, entry);
  });
  return [...byId.values()].sort((a, b) => a.ts - b.ts).slice(-limit);
}

function summarizeMathSkill(log, options = {}) {
  const skill = String(options.skill || 'count');
  const windowSize = Math.max(1, Number(options.window) || 6);
  const entries = normalizeMathAttempts(log, 500)
    .filter((entry) => entry.skill === skill)
    .filter((entry) => !Number.isInteger(options.levelId) || entry.levelId === options.levelId)
    .slice(-windowSize);
  let correctStreak = 0;
  let wrongStreak = 0;
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    if (entries[index].isCorrect) {
      if (wrongStreak) break;
      correctStreak += 1;
    } else {
      if (correctStreak) break;
      wrongStreak += 1;
    }
  }
  const correct = entries.filter((entry) => entry.isCorrect).length;
  return {
    skill,
    total: entries.length,
    correct,
    wrong: entries.length - correct,
    accuracy: entries.length ? correct / entries.length : null,
    correctStreak,
    wrongStreak,
  };
}

function buildMathVariant(level, mode = 'same') {
  const safeMode = ['easier', 'same', 'harder'].includes(mode) ? mode : 'same';
  const levelId = Number(level?.id) || 1;
  const targetCount = Math.max(0, Math.min(5, Number(level?.targetCount) || 1));
  const fullPool = [0, 1, 2, 3, 4, 5];
  let counts;
  if (safeMode === 'easier') {
    // 固定 3 选 1：降难度只拉开干扰距离，不减选项数
    const far = fullPool
      .filter((count) => count !== targetCount)
      .sort((a, b) => Math.abs(b - targetCount) - Math.abs(a - targetCount) || a - b);
    counts = [targetCount, far[0], far[1]];
  } else if (safeMode === 'harder') {
    // 固定 3 选 1：升难度用更近的干扰项
    const near = fullPool
      .filter((count) => count !== targetCount)
      .sort((a, b) => Math.abs(a - targetCount) - Math.abs(b - targetCount) || a - b);
    counts = [targetCount, near[0], near[1]];
  } else {
    counts = Array.isArray(level?.math?.groups) && level.math.groups.length
      ? level.math.groups.map((group) => Number(group.count))
      : mathChoiceCountsForLevel(levelId);
  }
  counts = [...new Set(counts.filter((count) => Number.isInteger(count) && count >= 0 && count <= 5))];
  if (!counts.includes(targetCount)) counts.unshift(targetCount);
  fullPool.forEach((count) => {
    if (counts.length >= 3) return;
    if (!counts.includes(count)) counts.push(count);
  });
  counts = counts.slice(0, 3);
  if (safeMode !== 'same') {
    const shiftSeed = safeMode === 'easier' ? 2 : 1;
    const shift = (levelId - 1 + shiftSeed) % counts.length;
    counts = counts.slice(shift).concat(counts.slice(0, shift));
  }
  const correct = counts.indexOf(targetCount);
  return {
    ...level,
    options: counts.map(mathCountLabel),
    correct,
    math: {
      ...(level?.math || {}),
      adaptiveMode: safeMode,
      groups: counts.map((count, optionIndex) => ({
        id: `math-${levelId}-${safeMode}-${optionIndex}`,
        count,
        label: mathCountLabel(count),
      })),
    },
  };
}

function adaptMathLevel(level, log = []) {
  const sameLevel = summarizeMathSkill(log, { levelId: Number(level?.id), window: 4 });
  if (sameLevel.wrongStreak >= 2) return buildMathVariant(level, 'easier');
  const skill = summarizeMathSkill(log, { window: 6 });
  return buildMathVariant(level, skill.correctStreak >= 3 ? 'harder' : 'same');
}

function generateMathVariant(level, context = {}) {
  return buildMathVariant(level, context.mode || adaptMathLevel(level, context.attempts || []).math.adaptiveMode);
}

function mathVoiceFeedback(kind, context = {}) {
  const mode = String(kind || '');
  const count = Number(context.targetCount) || 1;
  const text = mode === 'correct'
    ? '答对啦！'
    : mode === 'wrong-easier'
      ? `选项拉开了，再找${mathCountLabel(count)}。`
      : '再数一数，从左往右数。';
  return { provider: 'local-template', kind: mode || 'wrong', text };
}

function nextMathPathRecommendation(log, currentLevelId = 1) {
  const summary = summarizeMathSkill(log, { window: 6 });
  const recent = summarizeMathSkill(log, { window: 20 });
  const current = Math.min(DISPLAY_LEVEL_COUNT, Math.max(1, Number(currentLevelId) || 1));
  if (summary.wrongStreak >= 2) {
    return {
      levelId: current,
      reason: 'repeat-current',
      reasonText: `最近连续错了 ${summary.wrongStreak} 次，先巩固第 ${current} 关`,
    };
  }
  if (summary.total >= 4 && summary.accuracy < 0.5) {
    return {
      levelId: current,
      reason: 'repeat-current',
      reasonText: `近 ${summary.total} 题正确率偏低，建议继续练第 ${current} 关`,
    };
  }
  if (recent.total >= 8 && recent.accuracy >= 0.85 && summary.correctStreak >= 2) {
    const next = Math.min(DISPLAY_LEVEL_COUNT, current + 1);
    return {
      levelId: next,
      reason: 'next-level',
      reasonText: `近 20 题表现稳定，可以挑战第 ${next} 关`,
    };
  }
  const next = Math.min(DISPLAY_LEVEL_COUNT, current + 1);
  return {
    levelId: next,
    reason: 'next-level',
    reasonText: `可以继续第 ${next} 关`,
  };
}

function resolveMathContinueLevel(log, currentLevelId = 1, totalLevels = DISPLAY_LEVEL_COUNT) {
  const current = Math.min(totalLevels, Math.max(1, Number(currentLevelId) || 1));
  const recommendation = nextMathPathRecommendation(log, current);
  const recommended = Math.min(totalLevels, Math.max(1, Number(recommendation.levelId) || current));
  return {
    levelId: recommendation.reason === 'repeat-current' ? current : recommended,
    reason: recommendation.reason,
    reasonText: recommendation.reasonText || '',
  };
}

function buildMathParentReport(log = []) {
  const attempts = normalizeMathAttempts(log, 500);
  const summary = summarizeMathSkill(attempts, { window: Math.min(20, Math.max(1, attempts.length || 1)) });
  const accuracy = summary.accuracy === null ? null : Math.round(summary.accuracy * 100);
  const recommendation = nextMathPathRecommendation(attempts, attempts.at(-1)?.levelId || 1);
  return {
    totalAttempts: attempts.length,
    correct: attempts.filter((entry) => entry.isCorrect).length,
    accuracy,
    mastery: accuracy === null ? '暂无数据' : accuracy >= 80 ? '稳定' : accuracy >= 55 ? '需要巩固' : '建议陪练',
    recommendation,
    reasonText: recommendation.reasonText || '',
    skill: summary.skill,
    window: summary.total,
  };
}

const DESERT_LANDMARK_IMAGES = [
  '01-great-pyramid-complex.webp',
  '02-large-sphinx-monument.webp',
  '03-pharaoh-palace-facade.webp',
  '04-grand-egyptian-temple.webp',
  '05-abu-simbel-rock-temple.webp',
  '06-step-pyramid-monument.webp',
  '07-obelisk-plaza.webp',
  '08-desert-royal-palace.webp',
  '09-valley-kings-tomb-facade.webp',
  '10-monumental-city-gate.webp',
];
// 只上线 contact-sand 无白描边/无奶油浮岛的道具；其余 raw 保留备 regen
// v9：8 种可辨识仙人掌风格池（植株槽稳定伪随机替换）
const DESERT_DECOR_CACTUS_STYLES = [
  '25-cactus-saguaro-y.webp',      // 经典双臂 Y
  '26-cactus-single-arm.webp',     // 单臂
  '27-cactus-candelabra.webp',     // 多臂烛台
  '28-cactus-short-plump.webp',    // 矮胖双臂
  '29-cactus-tall-thin.webp',      // 细高小臂
  '30-cactus-prickly-pear.webp',   // 仙人掌掌片
  '31-cactus-curved-arm.webp',     // 风弯臂
  '32-cactus-seedling.webp',       // 幼苗单柱
];
// v13 地面足迹：小小脚印行走链（一左一右、前后交替）
const DESERT_DECOR_FOOTPRINTS = [
  '43-foot-trail-lr.webp',
  '43b-foot-trail-lr.webp',
];
// v10 埃及沙漠微物（儿童向、低密度）
const DESERT_DECOR_MICRO = [
  '36-pottery-sherd.webp',   // 陶片
  '37-linen-scrap.webp',     // 亚麻布条+绳结
  '38-tumbleweed.webp',      // 干草/荆棘球
  '39-scarab-stone.webp',    // 圣甲虫石饰
];
const DESERT_DECOR_ASSETS = [
  // legacy aliases (01=经典Y / 18=单臂) kept for SW + tests
  '01-cactus-cluster.webp',
  '03-sandstone-rocks.webp',
  '05-date-palm-sapling.webp',
  '06-dry-scrub-bush.webp',
  '08-boulder-slab.webp',
  '09-reed-clump.webp',
  '12-column-stub.webp',
  '13-acacia-sapling.webp',
  '15-dune-thistle.webp',
  '17-broken-clay-pot.webp',
  '18-barrel-cactus.webp',
  '19-pebble-cluster.webp',
  '20-small-stone-block.webp',
  '21-cracked-amphora-shard.webp',
  '22-tiny-gravel-scatter.webp',
  '23-small-stone-cairn.webp',
  '24-gravel-dust-foot.webp',
  ...DESERT_DECOR_CACTUS_STYLES,
  ...DESERT_DECOR_FOOTPRINTS,
  ...DESERT_DECOR_MICRO,
];
// 种类池：构图模板按需取用，禁止每关强制齐套四类
const DESERT_DECOR_BY_KIND = {
  // 植株主池 = 8 风格仙人掌；灌木/蓟仅 scrub 角偶发
  plant: [...DESERT_DECOR_CACTUS_STYLES],
  scrub: [
    '15-dune-thistle.webp',
    '06-dry-scrub-bush.webp',
    '09-reed-clump.webp',
  ],
  pot: [
    '17-broken-clay-pot.webp',
    '21-cracked-amphora-shard.webp',
  ],
  pebble: [
    '19-pebble-cluster.webp',
    '22-tiny-gravel-scatter.webp',
    '24-gravel-dust-foot.webp',
    '03-sandstone-rocks.webp',
  ],
  stone: [
    '20-small-stone-block.webp',
    '23-small-stone-cairn.webp',
    '08-boulder-slab.webp',
    '12-column-stub.webp',
    '03-sandstone-rocks.webp',
  ],
  footprint: [...DESERT_DECOR_FOOTPRINTS],
  micro: [...DESERT_DECOR_MICRO],
};
// 真实体量：碎石粉尘 << 小石堆 << 半埋罐/桶仙人掌 << 仙人掌簇/棕榈/巨石
const DESERT_DECOR_NATURAL_SIZE = {
  '01-cactus-cluster.webp': 1.22,
  '03-sandstone-rocks.webp': 0.92,
  '05-date-palm-sapling.webp': 1.38,
  '06-dry-scrub-bush.webp': 0.68,
  '08-boulder-slab.webp': 1.18,
  '09-reed-clump.webp': 0.98,
  '12-column-stub.webp': 1.05,
  '13-acacia-sapling.webp': 1.16,
  '15-dune-thistle.webp': 0.48,
  '17-broken-clay-pot.webp': 0.86,
  '18-barrel-cactus.webp': 0.98,
  '19-pebble-cluster.webp': 0.48,
  '20-small-stone-block.webp': 0.52,
  '21-cracked-amphora-shard.webp': 0.62,
  '22-tiny-gravel-scatter.webp': 0.40,
  '23-small-stone-cairn.webp': 0.64,
  '24-gravel-dust-foot.webp': 0.36,
  '25-cactus-saguaro-y.webp': 1.22,
  '26-cactus-single-arm.webp': 0.98,
  '27-cactus-candelabra.webp': 1.26,
  '28-cactus-short-plump.webp': 0.74,
  '29-cactus-tall-thin.webp': 1.16,
  '30-cactus-prickly-pear.webp': 0.80,
  '31-cactus-curved-arm.webp': 1.06,
  '32-cactus-seedling.webp': 0.54,
  '43-foot-trail-lr.webp': 4.4,
  '43b-foot-trail-lr.webp': 4.1,
  '36-pottery-sherd.webp': 0.62,
  '37-linen-scrap.webp': 0.66,
  '38-tumbleweed.webp': 0.72,
  '39-scarab-stone.webp': 0.52,
};
const DESERT_DECOR_VERSION = '20260801-desert-decor-v13c';
const MAP_VEHICLES = {
  ocean: {
    idle: 'assets/ocean/rowing-kids-boat-idle.webp?v=20260720-libtv-original-v3',
    sailing: 'assets/ocean/rowing-kids-boat-sailing.webp?v=20260720-libtv-original-rowing-v3',
  },
  desert: {
    idle: 'assets/egypt-map/cutouts/characters/runtime/camel-walk-frame96-idle-v6.png?v=20260720-camel-idle-walkmatch-v6',
    sailing: 'assets/egypt-map/cutouts/characters/runtime/camel-walk-frame96-idle-v6.png?v=20260720-camel-idle-walkmatch-v6',
    idleVideo: {
      hevc: 'assets/egypt-map/cutouts/characters/libtv/camel-idle-expressive-v6.mov?v=20260801-camel-idle-expressive-v6',
      webm: 'assets/egypt-map/cutouts/characters/libtv/camel-idle-expressive-v6.webm?v=20260801-camel-idle-expressive-v6',
    },
    sailingVideo: {
      hevc: 'assets/egypt-map/cutouts/characters/libtv/camel-walk-alpha-v2.mov?v=20260720-libtv-camel-v2',
      webm: 'assets/egypt-map/cutouts/characters/libtv/camel-walk-alpha-v2.webm?v=20260720-libtv-camel-v2',
    },
    playbackRate: 1.8,
  },
};
const MAP_WORLDS = {
  ocean: {
    id: 'ocean',
    theme: 'ocean',
    zone: 'english',
    startLevel: 1,
    endLevel: DISPLAY_LEVEL_COUNT,
    kicker: `${DISPLAY_LEVEL_COUNT} MAGIC ISLANDS`,
    title: '魔法海岛',
    chipPrefix: '海岛地图',
    routeLabel: `海岛地图，共 ${DISPLAY_LEVEL_COUNT} 关`,
    hint: `← 左右滑动探索 ${DISPLAY_LEVEL_COUNT} 关海岛 →`,
  },
  desert: {
    id: 'desert',
    theme: 'desert',
    zone: 'english',
    startLevel: 1,
    endLevel: DISPLAY_LEVEL_COUNT,
    kicker: `${DISPLAY_LEVEL_COUNT} DESERT STOPS`,
    title: '沙漠奇境',
    chipPrefix: '沙漠地图',
    routeLabel: `沙漠地图，共 ${DISPLAY_LEVEL_COUNT} 关`,
    hint: `← 左右滑动探索 ${DISPLAY_LEVEL_COUNT} 关沙漠地标 →`,
  },
  math: {
    id: 'math',
    theme: 'math',
    zone: 'math',
    usesVideoAssets: false,
    startLevel: 1,
    endLevel: DISPLAY_LEVEL_COUNT,
    kicker: `${DISPLAY_LEVEL_COUNT} MATH STOPS`,
    title: '数学小桌',
    chipPrefix: '数学地图',
    routeLabel: `数学地图，共 ${DISPLAY_LEVEL_COUNT} 关`,
    hint: `← 左右滑动探索 ${DISPLAY_LEVEL_COUNT} 关数学任务 →`,
  },
  math58: {
    id: 'math58',
    theme: 'math',
    zone: 'math',
    comingSoon: true,
    kicker: 'MATH GARDEN',
    title: '数学花园',
    chipPrefix: '数学地图',
  },
  math912: {
    id: 'math912',
    theme: 'math',
    zone: 'math',
    comingSoon: true,
    kicker: 'MATH STAR TOWER',
    title: '数学星塔',
    chipPrefix: '数学地图',
  },
  castle: {
    id: 'castle',
    theme: 'castle',
    zone: 'english',
    comingSoon: true,
    kicker: 'MAGIC CASTLE',
    title: '魔法城堡',
    chipPrefix: '城堡地图',
  },
};

const rankings = [
  { name: '林小满', score: 284 },
  { name: '周予安', score: 267 },
  { name: '陈乐知', score: 249 },
  { name: '夏可可', score: 233 },
  { name: '唐星野', score: 218 },
  { name: '苏一禾', score: 197 },
  { name: '顾晚晴', score: 181 },
  { name: '程果', score: 166 },
];

function isCorrectAnswer(selectedAnswer, correctAnswer) {
  return selectedAnswer === correctAnswer;
}

function normalizeProgress(value, totalLevels = DISPLAY_LEVEL_COUNT) {
  const submitted = new Set(Array.isArray(value?.completed) ? value.completed : []);
  const completed = [];
  for (let levelId = 1; levelId <= totalLevels && submitted.has(levelId); levelId += 1) {
    completed.push(levelId);
  }
  return {
    completed,
    unlockedThrough: Math.min(totalLevels, completed.length + 1),
  };
}

function completeLevel(progress, levelId, totalLevels) {
  const safeProgress = normalizeProgress(progress, totalLevels);
  if (levelId > safeProgress.unlockedThrough) return safeProgress;
  return {
    completed: [...new Set([...safeProgress.completed, levelId])].sort((a, b) => a - b),
    unlockedThrough: Math.min(totalLevels, Math.max(safeProgress.unlockedThrough, levelId + 1)),
  };
}

function applyQuizAnswer(progress, levelId, selectedAnswer, correctAnswer, totalLevels) {
  const correct = isCorrectAnswer(selectedAnswer, correctAnswer);
  return { correct, progress: correct ? completeLevel(progress, levelId, totalLevels) : progress };
}

function levelMinutes(level) {
  const match = String(level?.duration || '').match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function completedLearningMinutes(completedIds, allLevels = levels) {
  const completed = new Set(Array.isArray(completedIds) ? completedIds : []);
  return allLevels.reduce((sum, level) => sum + (completed.has(level.id) ? levelMinutes(level) : 0), 0);
}

function rankingScore(progress, totalLevels = DISPLAY_LEVEL_COUNT) {
  return normalizeProgress(progress, totalLevels).completed.length * 12;
}

function buildLocalRankings(progress, preferences = {}, baseRankings = rankings, totalLevels = DISPLAY_LEVEL_COUNT) {
  const profile = normalizeChildProfile(preferences);
  const currentName = `${profile.childName}同学`;
  const rows = (Array.isArray(baseRankings) ? baseRankings : []).map((person) => ({
    name: String(person?.name || '小伙伴'),
    score: Math.max(0, Number(person?.score) || 0),
    isCurrent: false,
  }));

  rows.push({
    name: currentName,
    score: rankingScore(progress, totalLevels),
    isCurrent: true,
  });

  return rows
    .sort((a, b) => b.score - a.score || (b.isCurrent ? 1 : 0) - (a.isCurrent ? 1 : 0))
    .map((person, index) => ({ ...person, rank: index + 1 }));
}

function formatActivityDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function normalizeLearningActivity(value) {
  const dates = Array.isArray(value?.dates) ? value.dates : [];
  return { dates: [...new Set(dates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)))].sort() };
}

function normalizeChildProfile(value) {
  const name = Array.from(String(value?.childName || '').trim()).slice(0, 10).join('') || '小禾';
  const age = ['3', '4', '5', '6'].includes(String(value?.childAge)) ? String(value.childAge) : '4';
  return { childName: name, childAge: age };
}

function profileAvatarText(name) {
  return Array.from(String(name || '').trim()).slice(0, 2).join('') || '宝';
}

function membershipSummary(preferences = {}) {
  const isVip = preferences?.vipActive === true;
  return isVip ? {
    isVip,
    status: 'vip',
    badge: '本地图',
    title: '本地图已开通',
    note: `本地图会员权益已生效；第 ${FREE_LEVEL_COUNT + 1}-${DISPLAY_LEVEL_COUNT} 关会随课程内容更新开放。新地图需单独购买。`,
    count: String(DISPLAY_LEVEL_COUNT),
    countLabel: '规划关卡',
    action: '',
  } : {
    isVip,
    status: 'free',
    badge: '体验版',
    title: '免费体验中',
    note: `前 ${FREE_LEVEL_COUNT} 关免费体验。后续关卡在地图内按本地图购买，不在「我的」统一开通。`,
    count: String(FREE_LEVEL_COUNT),
    countLabel: '免费关卡',
    action: '',
  };
}

function addLearningActivityDay(activity, date = new Date()) {
  const day = formatActivityDate(date);
  const current = normalizeLearningActivity(activity);
  return day ? normalizeLearningActivity({ dates: [...current.dates, day] }) : current;
}

function learningDays(activity, progress) {
  const days = normalizeLearningActivity(activity).dates.length;
  if (days) return days;
  return normalizeProgress(progress, levels.length).completed.length ? 1 : 0;
}

function calendarDays(activity, today = new Date(), windowDays = 14) {
  const activeDates = new Set(normalizeLearningActivity(activity).dates);
  const base = today instanceof Date ? new Date(today) : new Date(today);
  if (Number.isNaN(base.getTime())) return [];
  base.setHours(0, 0, 0, 0);
  const total = Math.min(31, Math.max(1, Number(windowDays) || 14));

  return Array.from({ length: total }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() - (total - index - 1));
    const value = formatActivityDate(date);
    return {
      date: value,
      day: String(date.getDate()),
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      active: activeDates.has(value),
      today: index === total - 1,
    };
  });
}

function learningStreak(activity, today = new Date()) {
  const activeDates = new Set(normalizeLearningActivity(activity).dates);
  const date = today instanceof Date ? new Date(today) : new Date(today);
  if (Number.isNaN(date.getTime())) return 0;
  date.setHours(0, 0, 0, 0);
  let streak = 0;
  while (activeDates.has(formatActivityDate(date)) && streak < 366) {
    streak += 1;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

function learningReport(progress, activity, allLevels = levels) {
  const safeProgress = normalizeProgress(progress, allLevels.length);
  const completedSet = new Set(safeProgress.completed);
  const learnedWords = allLevels
    .filter((level) => completedSet.has(level.id))
    .map((level) => level.options[level.correct]);
  const nextLevel = allLevels.find((level) => level.id === safeProgress.unlockedThrough);
  return {
    completed: safeProgress.completed.length,
    activeDays: learningDays(activity, safeProgress),
    learningMinutes: completedLearningMinutes(safeProgress.completed, allLevels),
    progressPercent: Math.round((safeProgress.completed.length / allLevels.length) * 100),
    learnedWords,
    recentWords: learnedWords.slice(-8).reverse(),
    nextLevelText: safeProgress.completed.length >= allLevels.length
      ? '全部关卡已完成'
      : `第 ${safeProgress.unlockedThrough} 关 · ${nextLevel?.title || '继续学习'}`,
  };
}

/** 英语区（海岛+沙漠）家长总览：进度合计、词库并集、继续哪张图 */
function englishZoneProgress(progressByWorld = {}, activity = null, allLevels = levels) {
  const worldIds = ['ocean', 'desert'];
  const maps = worldIds.map((worldId) => {
    const worldLevels = levelsForMapWorld(worldId, allLevels);
    const total = worldLevels.length || DISPLAY_LEVEL_COUNT;
    const progress = normalizeProgress(progressByWorld?.[worldId], total);
    const report = learningReport(progress, { dates: [] }, worldLevels);
    const world = MAP_WORLDS[worldId];
    return {
      worldId,
      title: world?.title || worldId,
      completed: report.completed,
      total,
      unlockedThrough: progress.unlockedThrough,
      learningMinutes: report.learningMinutes,
      nextLevelText: report.nextLevelText,
      learnedWords: report.learnedWords,
    };
  });
  const completed = maps.reduce((sum, row) => sum + row.completed, 0);
  const total = maps.reduce((sum, row) => sum + row.total, 0);
  const learningMinutes = maps.reduce((sum, row) => sum + row.learningMinutes, 0);
  const learnedWords = [...new Set(maps.flatMap((row) => row.learnedWords))];
  const continueMap = maps.find((row) => row.completed > 0 && row.completed < row.total)
    || maps.find((row) => row.completed < row.total)
    || maps[0];
  const fallbackProgress = normalizeProgress(progressByWorld?.[continueMap?.worldId || 'ocean'], continueMap?.total || DISPLAY_LEVEL_COUNT);
  const activeDays = learningDays(activity, fallbackProgress);
  let suggestion = '从魔法海岛第 1 关开始英语启蒙';
  if (completed >= total && total > 0) {
    suggestion = '英语地图已全部完成，可复习词库';
  } else if (completed > 0 && continueMap) {
    suggestion = `建议继续${continueMap.title} · ${continueMap.nextLevelText}`;
  }
  return {
    completed,
    total,
    progressPercent: total ? Math.round((completed / total) * 100) : 0,
    learningMinutes,
    activeDays,
    learnedWords,
    maps,
    continueWorldId: continueMap?.worldId || 'ocean',
    continueLevelId: continueMap?.unlockedThrough || 1,
    suggestion,
  };
}

function normalizeMistakeBook(value, allLevels = levels) {
  const levelById = new Map(allLevels.map((level) => [level.id, level]));
  const items = Array.isArray(value?.items) ? value.items : [];
  const byLevel = new Map();

  items.forEach((item) => {
    const levelId = Number(item?.levelId);
    const level = levelById.get(levelId);
    if (!level) return;
    const updatedAt = /^\d{4}-\d{2}-\d{2}T/.test(String(item?.updatedAt || '')) ? item.updatedAt : '';
    byLevel.set(levelId, {
      levelId,
      word: level.title,
      zhTitle: level.zhTitle,
      selected: String(item?.selected || '').trim().slice(0, 40),
      correct: String(item?.correct || level.options[level.correct]).trim().slice(0, 40),
      count: Math.min(99, Math.max(1, Number(item?.count) || 1)),
      updatedAt,
    });
  });

  return { items: [...byLevel.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 50) };
}

function recordMistake(book, level, selectedOption, date = new Date()) {
  if (!level) return normalizeMistakeBook(book);
  const current = normalizeMistakeBook(book);
  const existing = current.items.find((item) => item.levelId === level.id);
  const timestamp = date instanceof Date && !Number.isNaN(date.getTime()) ? date.toISOString() : new Date().toISOString();
  return normalizeMistakeBook({
    items: [
      {
        levelId: level.id,
        selected: selectedOption,
        correct: level.options[level.correct],
        count: (existing?.count || 0) + 1,
        updatedAt: timestamp,
      },
      ...current.items.filter((item) => item.levelId !== level.id),
    ],
  });
}

function resolveMistake(book, levelId) {
  return { items: normalizeMistakeBook(book).items.filter((item) => item.levelId !== Number(levelId)) };
}

function getLevelAccess(levelId, progress, isVip = false) {
  if (!Number.isInteger(levelId) || levelId < 1 || levelId > DISPLAY_LEVEL_COUNT) return 'missing';
  if (levelId > FREE_LEVEL_COUNT && !isVip) return 'paid';
  if (levelId > progress.unlockedThrough) return 'locked';
  return 'allowed';
}

function completionUnlockText(level, progress, isVip = false, allLevels = levels) {
  if (level.id >= allLevels.length) return '全部关卡已完成！';
  const nextLevel = allLevels.find((item) => item.id === level.id + 1);
  if (!nextLevel) return '全部关卡已完成！';
  const access = getLevelAccess(nextLevel.id, progress, isVip);
  if (access === 'paid') return paidAccessMessage;
  if (access === 'locked') return `先完成第 ${progress.unlockedThrough} 关，再继续冒险。`;
  if (access === 'missing') return '没有找到下一关。';
  return `第 ${nextLevel.id} 关已解锁。`;
}

function routePoint(levelId) {
  return { x: (levelId - 1) * 384, y: 0 };
}

function islandStyleId(levelId) {
  return ((levelId - 1) % 5) + 1;
}

function normalizeMapWorldId(value) {
  return MAP_WORLDS[value] ? value : 'ocean';
}

function normalizeWorldProgress(value, totalLevels = DISPLAY_LEVEL_COUNT) {
  const hasWorldProgress = value && typeof value === 'object' && Object.keys(MAP_WORLDS).some((worldId) => worldId in value);
  return Object.values(MAP_WORLDS).reduce((progress, world) => {
    const worldLevels = world.comingSoon ? [] : levelsForMapWorld(world.id);
    const worldTotal = worldLevels.length || totalLevels;
    return {
      ...progress,
      [world.id]: normalizeProgress(hasWorldProgress ? value[world.id] : world.id === 'ocean' ? value : null, worldTotal),
    };
  }, {});
}

function clampAssetPackProgress(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

function normalizeAssetPackState(value = {}) {
  const validStatuses = ['not-installed', 'queued', 'downloading', 'paused', 'ready', 'stale', 'failed'];
  const rawStatus = typeof value.status === 'string' ? value.status : 'not-installed';
  const bytesDone = Math.max(0, Number(value.bytesDone) || 0);
  const bytesTotal = Math.max(0, Number(value.bytesTotal) || 0);
  const derivedProgress = bytesTotal > 0 ? (bytesDone / bytesTotal) * 100 : undefined;
  const status = validStatuses.includes(rawStatus) ? rawStatus : 'not-installed';
  return {
    status,
    progress: status === 'ready' ? 100 : clampAssetPackProgress(value.progress ?? derivedProgress, status === 'ready' ? 100 : 0),
    bytesDone,
    bytesTotal,
    localVersion: typeof value.localVersion === 'string' ? value.localVersion : '',
    remoteVersion: typeof value.remoteVersion === 'string' ? value.remoteVersion : '',
    errorCode: typeof value.errorCode === 'string' ? value.errorCode : '',
    downloadUrl: typeof value.downloadUrl === 'string' ? value.downloadUrl : '',
    levelVideoUrlTemplate: typeof value.levelVideoUrlTemplate === 'string' ? value.levelVideoUrlTemplate : '',
    levels: Array.isArray(value.levels) ? value.levels.map((item) => ({
      levelId: Number(item?.levelId) || 0,
      downloadUrl: typeof item?.downloadUrl === 'string' ? item.downloadUrl : '',
      bytesTotal: Number(item?.bytesTotal) || 0,
      sha256: typeof item?.sha256 === 'string' ? item.sha256 : '',
    })).filter((item) => item.levelId > 0 && item.downloadUrl) : [],
    updatedAt: Number(value.updatedAt) || 0,
  };
}

function normalizeAssetPackStates(value = {}) {
  return Object.values(MAP_WORLDS).reduce((states, world) => ({
    ...states,
    [world.id]: normalizeAssetPackState(value?.[world.id]),
  }), {});
}

function levelVideoStateKey(worldId, levelId) {
  return `${normalizeMapWorldId(worldId)}:${Number(levelId) || 0}`;
}

function normalizeLevelVideoState(value = {}) {
  const validStatuses = ['not-installed', 'queued', 'downloading', 'ready', 'failed'];
  const rawStatus = typeof value.status === 'string' ? value.status : 'not-installed';
  const bytesDone = Math.max(0, Number(value.bytesDone) || 0);
  const bytesTotal = Math.max(0, Number(value.bytesTotal) || 0);
  const derivedProgress = bytesTotal > 0 ? (bytesDone / bytesTotal) * 100 : undefined;
  const status = validStatuses.includes(rawStatus) ? rawStatus : 'not-installed';
  return {
    mapId: normalizeMapWorldId(value.mapId || value.worldId),
    levelId: Number(value.levelId) || 0,
    status,
    progress: status === 'ready' ? 100 : clampAssetPackProgress(value.progress ?? derivedProgress, 0),
    bytesDone,
    bytesTotal,
    localUrl: typeof value.localUrl === 'string' ? value.localUrl : '',
    downloadUrl: typeof value.downloadUrl === 'string' ? value.downloadUrl : '',
    errorCode: typeof value.errorCode === 'string' ? value.errorCode : '',
    updatedAt: Number(value.updatedAt) || 0,
  };
}

function normalizeLevelVideoStates(value = {}) {
  if (!value || typeof value !== 'object') return {};
  return Object.entries(value).reduce((states, [key, item]) => {
    const fallbackLevelId = Number(String(key).split(':').pop()) || 0;
    const normalized = normalizeLevelVideoState({ levelId: fallbackLevelId, ...item });
    if (!normalized.levelId) return states;
    return {
      ...states,
      [levelVideoStateKey(normalized.mapId, normalized.levelId)]: normalized,
    };
  }, {});
}

function levelVideoDownloadLabel(status, progress = 0) {
  if (status === 'ready') return '已下载';
  if (status === 'downloading') return `下载中 ${clampAssetPackProgress(progress)}%`;
  if (status === 'queued') return '准备下载';
  if (status === 'failed') return '下载失败';
  return '未下载';
}

function assetPackLevelVideoUrl(mapId, levelId, packState = {}) {
  const pack = normalizeAssetPackState(packState);
  const id = Number(levelId) || 0;
  const listed = pack.levels.find((item) => item.levelId === id);
  if (listed?.downloadUrl) return listed.downloadUrl;
  if (!pack.levelVideoUrlTemplate) return '';
  const safeMapId = normalizeMapWorldId(mapId);
  const padded2 = String(id).padStart(2, '0');
  const padded3 = String(id).padStart(3, '0');
  return pack.levelVideoUrlTemplate
    .replaceAll('{mapId}', encodeURIComponent(safeMapId))
    .replaceAll('{levelId}', String(id))
    .replaceAll('{levelId2}', padded2)
    .replaceAll('{levelId3}', padded3);
}

function assetPackHasLevelVideoSource(mapId, packState = {}) {
  const pack = normalizeAssetPackState(packState);
  if (pack.levels.length > 0) return true;
  return Boolean(pack.levelVideoUrlTemplate && assetPackLevelVideoUrl(mapId, FREE_LEVEL_COUNT + 1, pack));
}

function assetPackHasDownloadSource(mapId, packState = {}) {
  const pack = normalizeAssetPackState(packState);
  return Boolean(pack.downloadUrl || assetPackHasLevelVideoSource(mapId, pack));
}

function assetPackLevelDownloadQueue(worldId, packState = {}, levelVideoStates = {}, options = {}) {
  const mapId = normalizeMapWorldId(worldId);
  const pack = normalizeAssetPackState(packState);
  const states = normalizeLevelVideoStates(levelVideoStates);
  const throughLevel = Math.min(
    DISPLAY_LEVEL_COUNT,
    Math.max(FREE_LEVEL_COUNT + 1, Number(options.throughLevel) || DISPLAY_LEVEL_COUNT),
  );
  return levelsForMapWorld(mapId)
    .filter((level) => level.id > FREE_LEVEL_COUNT && level.id <= throughLevel)
    .filter((level) => normalizeLevelVideoState(states[levelVideoStateKey(mapId, level.id)]).status !== 'ready')
    .map((level) => {
      const listed = pack.levels.find((item) => item.levelId === level.id);
      return {
        levelId: level.id,
        downloadUrl: assetPackLevelVideoUrl(mapId, level.id, pack),
        bytesTotal: listed?.bytesTotal || 0,
        sha256: listed?.sha256 || '',
      };
    })
    .filter((item) => item.downloadUrl)
    .sort((a, b) => a.levelId - b.levelId);
}

function assetPackPlayableSummary(worldId, states = {}, options = {}) {
  const world = MAP_WORLDS[normalizeMapWorldId(worldId)];
  if (world.comingSoon) return { playable: 0, total: 0, progress: 0, text: '已可玩 0/0 关' };
  const totalLevels = levelsForMapWorld(world.id).length || Math.max(0, (world.endLevel || 0) - (world.startLevel || 1) + 1);
  const bundledThroughLevel = Math.min(totalLevels, Math.max(0, Number(options.bundledThroughLevel) || FREE_LEVEL_COUNT));
  const pack = normalizeAssetPackState(states?.[world.id]);
  const levelVideoStates = normalizeLevelVideoStates(options.levelVideoStates);
  const readyLevelIds = new Set(Object.values(levelVideoStates)
    .filter((item) => item.status === 'ready')
    .filter((item) => normalizeMapWorldId(item.mapId) === world.id)
    .map((item) => Number(item.levelId))
    .filter((levelId) => levelId > bundledThroughLevel && levelId <= totalLevels));
  let playable = bundledThroughLevel;

  if (['ready', 'stale'].includes(pack.status)) {
    playable = totalLevels;
  } else {
    for (let levelId = bundledThroughLevel + 1; levelId <= totalLevels; levelId += 1) {
      if (!readyLevelIds.has(levelId)) break;
      playable = levelId;
    }
  }

  return {
    playable,
    total: totalLevels,
    progress: totalLevels > 0 ? clampAssetPackProgress((playable / totalLevels) * 100) : 0,
    text: `已可玩 ${playable}/${totalLevels} 关`,
  };
}

function assetPackSummary(worldId, states = {}, options = {}) {
  const world = MAP_WORLDS[normalizeMapWorldId(worldId)];
  if (world.comingSoon) {
    return {
      status: 'coming-soon',
      label: '敬请期待',
      stateLabel: '敬请期待',
      note: '新地图上线后会有新的关卡视频',
      playableCount: 0,
      totalLevels: 0,
      playableText: '已可玩 0/0 关',
      progress: 0,
      action: '',
      actionLabel: '',
      disabled: true,
    };
  }
  const bridgeAvailable = options.bridgeAvailable === true;
  const pack = normalizeAssetPackState(states?.[world.id]);
  const playable = assetPackPlayableSummary(world.id, states, options);
  const effectiveStatus = playable.total > 0 && playable.playable >= playable.total ? 'ready' : pack.status;
  const summaries = {
    'not-installed': {
      label: '未下载',
      note: bridgeAvailable ? '后面的关卡视频可以在后台下载' : '打开 iPad 版后会在后台下载后面的关卡视频',
      action: 'start',
      actionLabel: '下载',
    },
    queued: { label: '下载中', note: 'iPad 正在按关卡顺序准备视频', action: 'pause', actionLabel: '暂停' },
    downloading: { label: `下载中 ${pack.progress}%`, note: '按关卡顺序下载，可以暂停', action: 'pause', actionLabel: '暂停' },
    paused: { label: `已暂停 ${pack.progress}%`, note: '继续后会接着下载', action: 'resume', actionLabel: '继续' },
    ready: { label: '已完成', note: '这一张地图的关卡视频都可以玩了', action: '', actionLabel: '' },
    stale: { label: '有新视频', note: '现在的关卡还能玩，点一下就能拿到最新内容', action: 'start', actionLabel: '更新' },
    failed: { label: '下载失败', note: '请稍后重试', action: 'start', actionLabel: '重试' },
  };
  const summary = summaries[effectiveStatus] || summaries['not-installed'];
  return {
    ...summary,
    stateLabel: summary.label,
    status: effectiveStatus,
    playableCount: playable.playable,
    totalLevels: playable.total,
    playableText: playable.text,
    downloadProgress: pack.progress,
    progress: playable.progress,
    actionLabel: summary.actionLabel,
    disabled: !summary.action,
  };
}

function levelsForMapWorld(worldId, allLevels = levels) {
  const world = MAP_WORLDS[normalizeMapWorldId(worldId)];
  if (world.id === 'desert') return desertLevels;
  if (world.id === 'math') return mathLevels;
  if (world.comingSoon) return [];
  return allLevels.filter((level) => level.id >= world.startLevel && level.id <= world.endLevel);
}

function desertLandmarkImage(levelId) {
  if (!Number.isInteger(levelId) || levelId < 1 || levelId > DISPLAY_LEVEL_COUNT) return '';
  const index = (levelId - 1) % DESERT_LANDMARK_IMAGES.length;
  return `assets/egypt-map/cutouts/buildings/v6-sand-blend/${DESERT_LANDMARK_IMAGES[index]}?v=20260731-desert-landmarks-v30`;
}

function desertDecorRng(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function desertDecorPick(pool, rnd, salt = 0) {
  if (!pool.length) return DESERT_DECOR_ASSETS[0];
  const idx = Math.floor((rnd() * 0.999 + salt * 0.17) * pool.length) % pool.length;
  return pool[(idx + pool.length) % pool.length];
}

// 每关构图模板：侧重点不同；道具只贴建筑侧翼/脚，禁止正前空地堆货
const DESERT_DECOR_TEMPLATES = [
  'lone_flank',     // 单侧一株叉形仙人掌贴墙
  'pot_foot',       // 建筑脚一角半埋罐 + 一粒砾
  'side_rocks',     // 一侧石/砾贴脚
  'left_hug',       // 全贴左翼
  'right_hug',      // 全贴右翼
  'cactus_pair',    // 左右各一株贴侧，中空
  'one_grit',       // 极简：脚边一缕 grit
  'scrub_corner',   // 墙角 scrub + 小砾
  'boulder_side',   // 一侧贴巨石
  'almost_clean',   // 几乎空
  'pot_and_fork',   // 一侧叉仙人掌 + 对侧脚罐
  'column_corner',  // 一角柱墩/陶片
];

function desertDecorMarkup(levelId, theme) {
  if (theme !== 'desert' || levelId >= DISPLAY_LEVEL_COUNT) return '';
  // v10：贴侧/脚 + 8 风格仙人掌 + 低密度脚印 + 埃及微物
  const rnd = desertDecorRng(levelId * 9973 + 419);
  const scrubPool = DESERT_DECOR_BY_KIND.scrub || [];
  const potPool = DESERT_DECOR_BY_KIND.pot;
  const pebblePool = DESERT_DECOR_BY_KIND.pebble;
  const stonePool = DESERT_DECOR_BY_KIND.stone;
  const gritPool = ['22-tiny-gravel-scatter.webp', '24-gravel-dust-foot.webp'];
  const natural = (asset) => DESERT_DECOR_NATURAL_SIZE[asset] || 0.8;
  const jitter = (span) => (rnd() - 0.5) * span;
  const template = DESERT_DECOR_TEMPLATES[(levelId - 1) % DESERT_DECOR_TEMPLATES.length];
  const slots = [];

  /*
   * 建筑 silhouette（island-art）：中心约 50%，宽约 48% → 左缘~26% 右缘~74%
   * 底脚 y ≈ 70–76%。正前空地（x 38–62, y 82–92）禁止堆道具。
   * 合法锚区：左翼 / 右翼 / 左脚 / 右脚 / 后侧。
   */
  const ZONE = {
    left_flank:  { x0: 16, x1: 28, y0: 64, y1: 74 },
    right_flank: { x0: 72, x1: 86, y0: 64, y1: 74 },
    left_foot:   { x0: 26, x1: 40, y0: 72, y1: 78 },
    right_foot:  { x0: 60, x1: 74, y0: 72, y1: 78 },
    left_back:   { x0: 20, x1: 34, y0: 58, y1: 66 },
    right_back:  { x0: 66, x1: 80, y0: 58, y1: 66 },
  };
  const inZone = (z) => ({
    x: z.x0 + rnd() * (z.x1 - z.x0),
    y: z.y0 + rnd() * (z.y1 - z.y0),
  });

  const push = (kind, asset, x, y, sizeMul, layer = 'front', flipChance = 0.45) => {
    if (!asset) return;
    const tall = /palm|acacia|reed|boulder|column|cactus|saguaro|prickly/.test(asset);
    // 硬夹：不允许漂到正前空地远处
    const cx = Math.max(12, Math.min(88, x));
    const cy = Math.max(56, Math.min(79, y));
    slots.push({
      asset,
      kind,
      x: cx,
      y: cy,
      size: natural(asset) * sizeMul,
      scale: 0.9 + jitter(0.12),
      layer: tall && layer === 'back' ? 'front' : layer,
      flip: rnd() < flipChance,
    });
  };

  // 8 风格仙人掌：同关稳定；槽位步进，避免同关双株撞脸
  let cactusSlot = 0;
  const pickCactus = () => {
    const styles = DESERT_DECOR_CACTUS_STYLES;
    if (!styles.length) return '25-cactus-saguaro-y.webp';
    const start = Math.floor(rnd() * styles.length);
    const asset = styles[(start + cactusSlot) % styles.length];
    cactusSlot += 1 + Math.floor(rnd() * 2);
    return asset;
  };
  const pickPlant = () => pickCactus();
  const pickScrub = () => desertDecorPick(scrubPool.length ? scrubPool : ['06-dry-scrub-bush.webp'], rnd, levelId + 11);
  const pickStone = (exclude = []) => {
    const pool = stonePool.filter((a) => !exclude.includes(a));
    return desertDecorPick(pool.length ? pool : stonePool, rnd, levelId + 3);
  };
  const pickPebble = () => desertDecorPick(pebblePool, rnd, levelId + 7);
  const pickGrit = () => gritPool[(levelId + Math.floor(rnd() * 3)) % gritPool.length];
  const pickPot = () => potPool[levelId % potPool.length];

  if (template === 'lone_flank') {
    const left = levelId % 2 === 0;
    const z = left ? ZONE.left_flank : ZONE.right_flank;
    const p = inZone(z);
    push('plant', pickCactus(), p.x, p.y - 2, 1.05 + rnd() * 0.3, 'front', left ? 0.2 : 0.55);
    const f = inZone(left ? ZONE.left_foot : ZONE.right_foot);
    push('pebble', pickGrit(), f.x, f.y, 0.85 + rnd() * 0.25, 'front', 0);
  } else if (template === 'pot_foot') {
    const left = levelId % 3 !== 0;
    const f = inZone(left ? ZONE.left_foot : ZONE.right_foot);
    push('pot', pickPot(), f.x, f.y, 0.95 + rnd() * 0.2, 'front', 0.5);
    push('pebble', pickGrit(), f.x + (left ? 6 : -6), f.y + 1, 0.8 + rnd() * 0.2, 'front', 0);
  } else if (template === 'side_rocks') {
    const left = levelId % 2 === 0;
    const flank = inZone(left ? ZONE.left_flank : ZONE.right_flank);
    const foot = inZone(left ? ZONE.left_foot : ZONE.right_foot);
    push('stone', pickStone(), flank.x, flank.y + 4, 0.75 + rnd() * 0.3, 'front', 0.4);
    push('pebble', '19-pebble-cluster.webp', foot.x, foot.y, 0.9 + rnd() * 0.25, 'front', 0);
    if (rnd() > 0.45) {
      push('pebble', pickGrit(), foot.x + (left ? 5 : -5), foot.y, 0.75 + rnd() * 0.2, 'front', 0);
    }
  } else if (template === 'left_hug') {
    const a = inZone(ZONE.left_flank);
    const b = inZone(ZONE.left_foot);
    push('plant', pickCactus(), a.x, a.y - 1, 0.95 + rnd() * 0.25, 'front', 0.2);
    push('stone', '23-small-stone-cairn.webp', b.x, b.y, 0.6 + rnd() * 0.2, 'front', 0.3);
    push('pebble', pickGrit(), b.x + 5, b.y + 1, 0.8 + rnd() * 0.2, 'front', 0);
  } else if (template === 'right_hug') {
    const a = inZone(ZONE.right_flank);
    const b = inZone(ZONE.right_foot);
    push('plant', pickCactus(), a.x, a.y - 1, 0.95 + rnd() * 0.25, 'front', 0.55);
    push('stone', pickStone(), b.x, b.y - 1, 0.6 + rnd() * 0.25, 'front', 0.4);
    push('pebble', pickGrit(), b.x - 5, b.y + 1, 0.8 + rnd() * 0.2, 'front', 0);
  } else if (template === 'cactus_pair') {
    const L = inZone(ZONE.left_flank);
    const R = inZone(ZONE.right_flank);
    push('plant', pickCactus(), L.x, L.y - 2, 1.05 + rnd() * 0.25, 'front', 0.2);
    push('plant', pickCactus(), R.x, R.y, 0.75 + rnd() * 0.2, 'front', 0.55);
  } else if (template === 'one_grit') {
    const left = levelId % 2 === 0;
    const f = inZone(left ? ZONE.left_foot : ZONE.right_foot);
    push('pebble', pickGrit(), f.x, f.y, 0.75 + rnd() * 0.25, 'front', 0);
  } else if (template === 'scrub_corner') {
    const left = levelId % 2 === 0;
    const flank = inZone(left ? ZONE.left_flank : ZONE.right_flank);
    const foot = inZone(left ? ZONE.left_foot : ZONE.right_foot);
    push('plant', pickScrub(), flank.x, flank.y + 3, 0.55 + rnd() * 0.2, 'front', 0.4);
    push('pebble', pickPebble(), foot.x, foot.y, 0.85 + rnd() * 0.25, 'front', 0);
  } else if (template === 'boulder_side') {
    const left = levelId % 2 === 0;
    const flank = inZone(left ? ZONE.left_flank : ZONE.right_flank);
    const foot = inZone(left ? ZONE.left_foot : ZONE.right_foot);
    push('stone', '08-boulder-slab.webp', flank.x, flank.y, 1.0 + rnd() * 0.25, 'front', 0.35);
    push('pebble', pickGrit(), foot.x, foot.y, 0.8 + rnd() * 0.2, 'front', 0);
  } else if (template === 'almost_clean') {
    // intentionally empty — desert landmarks aren't always cluttered
  } else if (template === 'pot_and_fork') {
    const plantLeft = levelId % 2 === 0;
    const pZ = inZone(plantLeft ? ZONE.left_flank : ZONE.right_flank);
    const fZ = inZone(plantLeft ? ZONE.right_foot : ZONE.left_foot);
    push('plant', pickCactus(), pZ.x, pZ.y - 2, 1.05 + rnd() * 0.25, 'front', plantLeft ? 0.2 : 0.55);
    push('pot', pickPot(), fZ.x, fZ.y, 0.9 + rnd() * 0.2, 'front', 0.5);
  } else {
    // column_corner
    const left = levelId % 2 === 0;
    const flank = inZone(left ? ZONE.left_flank : ZONE.right_flank);
    const foot = inZone(left ? ZONE.left_foot : ZONE.right_foot);
    push('stone', '12-column-stub.webp', flank.x, flank.y + 2, 0.75 + rnd() * 0.25, 'front', 0.35);
    push('pot', '21-cracked-amphora-shard.webp', foot.x, foot.y, 0.8 + rnd() * 0.2, 'front', 0.5);
    if (rnd() > 0.5) {
      push('pebble', pickGrit(), foot.x + (left ? 5 : -5), foot.y, 0.75 + rnd() * 0.2, 'front', 0);
    }
  }

  // ── v13c 足迹（L-R 小脚印链，变淡）+ 埃及微物（疏）───────────────
  // 硬约束：每关/每时光最多 1 串脚印（绝不双串）；门脸正中永不放
  // 微物：~8–38% 按密度 1 件（陶片/亚麻/干草球/圣甲虫）
  const footprintPool = DESERT_DECOR_BY_KIND.footprint || [];
  const microPool = DESERT_DECOR_BY_KIND.micro || [];
  // 单印槽：偏左/偏右前沙坡
  const PATH_ZONES = [
    { x0: 22, x1: 34, y0: 78, y1: 85 },
    { x0: 66, x1: 78, y0: 78, y1: 85 },
    { x0: 18, x1: 30, y0: 74, y1: 82 },
    { x0: 70, x1: 82, y0: 74, y1: 82 },
  ];
  const MICRO_ZONES = [
    ZONE.left_foot,
    ZONE.right_foot,
    ZONE.left_flank,
    ZONE.right_flank,
    { x0: 18, x1: 32, y0: 78, y1: 84 },
    { x0: 68, x1: 82, y0: 78, y1: 84 },
  ];
  const densityTag = template === 'almost_clean' || template === 'one_grit'
    ? 'almost_clean'
    : (template === 'cactus_pair' || template === 'pot_and_fork' || template === 'column_corner')
      ? 'busy'
      : (template === 'lone_flank' || template === 'scrub_corner')
        ? 'sparse'
        : 'normal';

  const pushGround = (kind, asset, x, y, sizeMul = 1, flipChance = 0.5, rotDeg = 0) => {
    let cx = Math.max(11, Math.min(89, x));
    let cy = Math.max(70, Math.min(86, y));
    // 门脸正中禁区 → 偏侧
    if (cy >= 78 && cx > 38 && cx < 62) {
      cx = cx < 50 ? Math.max(12, cx - 14) : Math.min(88, cx + 14);
    }
    if (slots.some((s) => Math.hypot(s.x - cx, s.y - cy) < 7.5)) return false;
    slots.push({
      asset,
      kind,
      x: cx,
      y: cy,
      size: natural(asset) * sizeMul,
      scale: 0.92 + jitter(0.08),
      layer: 'front',
      flip: rnd() < flipChance,
      rot: rotDeg || 0,
    });
    return true;
  };

  // 每时光/关最多 1 串：只 push 一次；用 levelId 稀疏取样，避免全图脚印刷屏
  // almost_clean 更稀；其它关约每 7 关 1 串
  const alreadyHasFp = slots.some((s) => s.kind === 'footprint');
  const wantFp = !alreadyHasFp && footprintPool.length > 0 && (
    densityTag === 'almost_clean'
      ? (levelId % 13 === 5)
      : (levelId % 7 === 3)
  );
  if (wantFp) {
    const path = PATH_ZONES[Math.floor(rnd() * PATH_ZONES.length)];
    const baseX = path.x0 + rnd() * (path.x1 - path.x0);
    const baseY = path.y0 + rnd() * (path.y1 - path.y0);
    const asset = footprintPool[Math.floor(rnd() * footprintPool.length)];
    // v13c 行走链：倾斜 + 单次放置
    const rot = -34 + rnd() * 16; // ≈ -34° ~ -18°
    pushGround('footprint', asset, baseX, baseY, 0.88 + rnd() * 0.16, 0, rot);
  }

  const microChance = densityTag === 'almost_clean' ? 0.08
    : densityTag === 'sparse' ? 0.22
      : densityTag === 'busy' ? 0.38
        : 0.3;
  if (rnd() < microChance && microPool.length) {
    const z = MICRO_ZONES[Math.floor(rnd() * MICRO_ZONES.length)];
    const asset = microPool[Math.floor(rnd() * microPool.length)];
    const mx = z.x0 + rnd() * (z.x1 - z.x0);
    const my = z.y0 + rnd() * (z.y1 - z.y0);
    pushGround('micro', asset, mx, my, 0.9 + rnd() * 0.22, 0.55, (rnd() - 0.5) * 24);
  }

  // 全量输出模板结果（1–3 件贴侧/贴脚 + 可选脚印/微物；almost_clean 可为 0）
  return slots.map((slot) => {
    const image = `assets/egypt-map/cutouts/decor/runtime-v2/${slot.asset}?v=${DESERT_DECOR_VERSION}`;
    const flipClass = slot.flip ? ' is-flip' : '';
    const size = Math.max(0.2, Math.min(1.75, slot.size));
    const scale = Math.max(0.7, Math.min(1.2, slot.scale));
    const rot = Number(slot.rot) || 0;
    const rotStyle = rot ? `--decor-rot:${rot.toFixed(1)}deg;` : '';
    return `<span class="desert-decor is-${slot.layer}${flipClass}" data-desert-decor data-decor-kind="${slot.kind}" data-decor-asset="${slot.asset.replace(/\.webp$/, '')}" data-decor-template="${template}" aria-hidden="true" style="--decor-x:${slot.x.toFixed(1)}%;--decor-y:${slot.y.toFixed(1)}%;--decor-size:${size.toFixed(2)};--decor-scale:${scale.toFixed(2)};--decor-image:url('${image}');${rotStyle}"></span>`;
  }).join('');
}

/** 判断单词发音按钮是否应禁用（纯函数，供测试使用） */
function wordButtonDisabled(word, pronunciationAvailable, localAudioUrls) {
  if (!word || typeof word !== 'string') return true;
  return !(localAudioUrls || {})[word.toLowerCase()];
}

function validateSupportMessage(message) {
  const value = String(message || '').trim();
  if (!value) return '请先写下要反馈的问题。';
  if (value.length < 4) return '请至少写 4 个字，方便家长回看。';
  if (value.length > 300) return '反馈内容最多 300 个字。';
  return '';
}

function supportFeedbackText(message, context = {}) {
  const value = String(message || '').trim();
  return [
    '嗨洛塔少儿启蒙APP反馈',
    `问题：${value}`,
    `当前关卡：第 ${context.currentLevel || 1} 关`,
    `完成关卡：${context.completed || 0}/${DISPLAY_LEVEL_COUNT}`,
    context.userAgent ? `设备信息：${context.userAgent}` : '',
  ].filter(Boolean).join('\n');
}

function buildLearningDataExport(progress, activity, preferences, mistakeBook, _account, allLevels = levels, exportedAt = new Date().toISOString(), mathAttempts = []) {
  const safeProgress = normalizeProgress(progress, allLevels.length);
  const safeActivity = normalizeLearningActivity(activity);
  const safeMistakes = normalizeMistakeBook(mistakeBook, allLevels);
  return {
    app: '嗨洛塔少儿启蒙APP',
    version: 1,
    exportedAt,
    childProfile: normalizeChildProfile(preferences),
    progress: safeProgress,
    learningActivity: safeActivity,
    preferences: {
      mapMusic: preferences?.mapMusic !== false,
      autoPronunciation: preferences?.autoPronunciation !== false,
      showChineseHints: preferences?.showChineseHints !== false,
    },
    mistakeBook: safeMistakes,
    report: learningReport(safeProgress, safeActivity, allLevels),
    mathAiReport: buildMathParentReport(mathAttempts),
  };
}

function networkStatusText(isOnline, restored = false) {
  if (!isOnline) return '当前离线：进度会先保存在本机';
  return restored ? '已重新连接' : '';
}

function notificationStatusText(permission, supported = true) {
  if (!supported) return '当前浏览器不支持系统提醒';
  if (permission === 'granted') return '已允许系统提醒';
  if (permission === 'denied') return '系统提醒已关闭';
  return '需要家长允许通知';
}

function canRegisterServiceWorker(protocol) {
  return protocol === 'http:' || protocol === 'https:';
}

function compareAppVersions(left, right) {
  const leftParts = String(left || '0').split('.').map((part) => Number.parseInt(part, 10) || 0);
  const rightParts = String(right || '0').split('.').map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < length; index += 1) {
    const diff = (leftParts[index] || 0) - (rightParts[index] || 0);
    if (diff) return diff > 0 ? 1 : -1;
  }
  return 0;
}

function releaseUpdateInfo(config, currentVersion = APP_RELEASE_VERSION) {
  const latestVersion = String(config?.latestVersion || config?.minSupportedVersion || '').trim();
  if (!latestVersion) return null;
  const minSupportedVersion = String(config?.minSupportedVersion || '').trim();
  const updateUrl = String(config?.updateUrl || '');
  const hasNewVersion = compareAppVersions(latestVersion, currentVersion) > 0;
  const force = Boolean(minSupportedVersion && compareAppVersions(minSupportedVersion, currentVersion) > 0);
  if (!hasNewVersion && !force) return null;
  return {
    currentVersion,
    latestVersion,
    force,
    title: String(config?.title || '发现新版本'),
    message: String(config?.message || '请前往 App Store 更新嗨洛塔少儿启蒙APP。'),
    releaseNotes: Array.isArray(config?.releaseNotes) ? config.releaseNotes.slice(0, 4).map(String) : [],
    storeName: String(config?.storeName || 'App Store'),
    updateUrl,
  };
}

function requestReleaseUpdate(updateInfo, runtime = globalThis) {
  const payload = {
    latestVersion: updateInfo?.latestVersion || '',
    updateUrl: updateInfo?.updateUrl || '',
    storeName: updateInfo?.storeName || 'App Store',
  };
  const iosHandler = runtime?.webkit?.messageHandlers?.babyIslandAppUpdate;
  if (payload.updateUrl && iosHandler && typeof iosHandler.postMessage === 'function') {
    iosHandler.postMessage(payload);
    return true;
  }
  const androidBridge = runtime?.BabyIslandAppUpdate;
  if (payload.updateUrl && androidBridge && typeof androidBridge.openStore === 'function') {
    androidBridge.openStore(payload.updateUrl);
    return true;
  }
  if (payload.updateUrl && typeof runtime?.open === 'function') {
    runtime.open(payload.updateUrl, '_blank', 'noopener');
    return true;
  }
  return false;
}

function canForceReleaseUpdate(updateInfo, runtime = globalThis) {
  if (!updateInfo?.force) return false;
  if (updateInfo.updateUrl) return true;
  return false;
}

function parseRouteHash(hashValue) {
  const hash = String(hashValue || '').replace(/^#/, '');
  if (!hash || hash === 'map') return { type: 'map' };

  const levelMatch = hash.match(/^level-(\d+)$/);
  if (levelMatch) return { type: 'level', id: Number(levelMatch[1]) };

  if (hash === 'ranking' || hash === 'mine' || hash === 'support') return { type: hash };
  if (['privacy', 'terms', 'about'].includes(hash)) return { type: 'info', page: hash };
  return { type: 'not-found', hash };
}

function questionPromptText(level) {
  if (level?.worldId === 'math' || level?.itemType === 'count') {
    return `小朋友，哪一组是${mathCountLabel(Number(level?.targetCount) || 1)}？`;
  }
  if (level?.worldId === 'desert' || level?.itemType === 'expression') {
    return `小朋友，视频里的英语，哪一句是在说「${level.zhTitle}」？`;
  }
  return `小朋友，视频里学到的单词，哪一个是${level.zhTitle}的意思？`;
}

function requestVipPurchase(levelId, runtime = globalThis) {
  const payload = { productId: VIP_PRODUCT_ID, levelId };
  const iosHandler = runtime?.webkit?.messageHandlers?.babyIslandIAP;
  if (iosHandler && typeof iosHandler.postMessage === 'function') {
    iosHandler.postMessage(payload);
    return true;
  }
  const androidBridge = runtime?.BabyIslandIAP;
  if (androidBridge && typeof androidBridge.purchase === 'function') {
    androidBridge.purchase(VIP_PRODUCT_ID);
    return true;
  }
  return false;
}

function requestVipRestore(runtime = globalThis) {
  const payload = { productId: VIP_PRODUCT_ID, action: 'restore' };
  const iosHandler = runtime?.webkit?.messageHandlers?.babyIslandIAP;
  if (iosHandler && typeof iosHandler.postMessage === 'function') {
    iosHandler.postMessage(payload);
    return true;
  }
  const androidBridge = runtime?.BabyIslandIAP;
  if (androidBridge && typeof androidBridge.restore === 'function') {
    androidBridge.restore(VIP_PRODUCT_ID);
    return true;
  }
  return false;
}

function activateVipPreferences(preferences = {}) {
  return { ...preferences, vipActive: true };
}


const MAP_JUMP_SEGMENT_SIZE = 20;
const MAP_JUMP_COPY = {
  title: '要去哪里',
  eyebrow: '路线导航',
  segmentsLabel: '路线段',
  levelsHint: '共 200 关 · 左边选段，右边点关，再出发',
  depart: '出发前往',
  arrived: '已到达',
  back: '返回路线段',
  current: '当前',
  totalLevels: DISPLAY_LEVEL_COUNT,
};

/** 每 20 关一段：[{ start, end, label, id }] */
function buildMapJumpSegments(totalLevels = DISPLAY_LEVEL_COUNT, segmentSize = MAP_JUMP_SEGMENT_SIZE) {
  const size = Math.max(1, Number(segmentSize) || 20);
  const total = Math.max(1, Number(totalLevels) || 1);
  const segs = [];
  for (let start = 1; start <= total; start += size) {
    const end = Math.min(total, start + size - 1);
    segs.push({
      id: `seg-${start}-${end}`,
      start,
      end,
      label: `${start}–${end} 关`,
      count: end - start + 1,
    });
  }
  return segs;
}

function segmentContainingLevel(levelId, segments) {
  const id = Number(levelId);
  if (!Array.isArray(segments) || !segments.length) return null;
  return segments.find((seg) => id >= seg.start && id <= seg.end) || segments[0];
}

function levelsInJumpSegment(levelsList, segment) {
  if (!segment || !Array.isArray(levelsList)) return [];
  return levelsList.filter((lv) => lv.id >= segment.start && lv.id <= segment.end);
}

if (typeof module !== 'undefined') {
  module.exports = { MAP_WORLDS, MAP_JUMP_COPY, MAP_JUMP_SEGMENT_SIZE, MATH_ATTEMPT_KEY, MATH_ATTEMPT_SCHEMA_VERSION, CURRICULUM_ALIGNMENT_BY_TOPIC, adaptMathLevel, appendMathAttempt, assetPackHasDownloadSource, assetPackLevelDownloadQueue, assetPackLevelVideoUrl, assetPackPlayableSummary, assetPackSummary, buildMapJumpSegments, buildMathParentReport, buildMathVariant, curriculumAlignmentForTopic, segmentContainingLevel, levelsInJumpSegment, activateVipPreferences, addLearningActivityDay, applyQuizAnswer, buildLearningDataExport, buildLocalRankings, calendarDays, canForceReleaseUpdate, canRegisterServiceWorker, compareAppVersions, completedLearningMinutes, completionUnlockText, desertLandmarkImage, desertLevels, englishZoneProgress, formatActivityDate, generateMathVariant, getLevelAccess, islandStyleId, learningDays, learningReport, learningStreak, levelVideoDownloadLabel, levelVideoStateKey, levels, levelsForMapWorld, mathLevels, mathVoiceFeedback, membershipSummary, mergeMathAttempts, networkStatusText, nextMathPathRecommendation, normalizeAssetPackStates, normalizeLevelVideoStates, normalizeMapWorldId, normalizeMathAttempts, normalizeWorldProgress, notificationStatusText, normalizeChildProfile, normalizeLearningActivity, normalizeMistakeBook, normalizeProgress, parseRouteHash, profileAvatarText, questionPromptText, rankingScore, recordMistake, releaseUpdateInfo, requestReleaseUpdate, requestVipPurchase, requestVipRestore, resolveMathContinueLevel, resolveMistake, routePoint, summarizeMathSkill, supportFeedbackText, validateSupportMessage, wordButtonDisabled };
}

if (typeof document !== 'undefined') {
  const main = document.querySelector('#main-content');
  const appShell = document.querySelector('.app-shell');
  const bottomTabs = document.querySelector('.bottom-tabs');
  const networkStatus = document.querySelector('[data-network-status]');
  const appToast = document.querySelector('[data-app-toast]');
  const mapMusic = document.querySelector('#map-music');
  const MAP_MUSIC_BY_WORLD = {
    ocean: 'assets/audio/map-bgm.mp3',
    desert: 'assets/audio/desert-map-bgm.mp3?v=20260720-desert-bgm-v2',
    math: 'assets/audio/math-map-bgm.mp3?v=20260804-math-bgm-v2',
  };
  const MAP_MUSIC_VOLUME = 0.16;
  const DESERT_MAP_MUSIC_VOLUME = 0.2;
  const MATH_MAP_MUSIC_VOLUME = 0.3;
  const MAP_MUSIC_DUCK_VOLUME = 0.05;
  const MAP_AMBIENT_VOLUME = 0.28;
  const MAP_AMBIENT_SRC = 'assets/audio/sfx/random-ambient.mp3?v=20260718-surround-ambient-v1';
  const MAP_AMBIENT_MIN_DELAY_MS = 4000;
  const MAP_AMBIENT_MAX_DELAY_MS = 12000;
  const MAP_RARE_AMBIENT_SRC = 'assets/audio/sfx/random-ambient-rare.mp3?v=20260718-rare-ambient-v1';
  const MAP_RARE_AMBIENT_VOLUME = 0.16;
  const MAP_RARE_AMBIENT_MIN_DELAY_MS = 25000;
  const MAP_RARE_AMBIENT_MAX_DELAY_MS = 55000;
  const UI_BUTTON_CLICK_SFX_SRC = 'assets/audio/sfx/ui-button-click.mp3?v=20260804-ui-click-v2';
  const UI_BUTTON_CLICK_SFX_VOLUME = 0.45;
  const MATH_APPLE_DROP_SFX_SRC = 'assets/audio/sfx/math-apple-drop-blop-soft-01.mp3?v=20260804-math-sfx-v1';
  const MATH_APPLE_DROP_SFX_VOLUME = 0.62;
  const MATH_APPLE_DROP_IMPACT_OFFSET_MS = 620;
  const BOAT_PADDLE_VOLUME = 0.48;
  const WORD_AUDIO_VOLUME = 1;
  const QUESTION_AUDIO_VOLUME = 1;
  const FEEDBACK_AUDIO_VOLUME = 0.72;
  mapMusic.volume = MAP_MUSIC_VOLUME;
  const mapAmbientAudio = new Audio(MAP_AMBIENT_SRC);
  mapAmbientAudio.preload = 'auto';
  mapAmbientAudio.loop = false;
  mapAmbientAudio.volume = MAP_AMBIENT_VOLUME;
  const mapRareAmbientAudio = new Audio(MAP_RARE_AMBIENT_SRC);
  mapRareAmbientAudio.preload = 'auto';
  mapRareAmbientAudio.loop = false;
  mapRareAmbientAudio.volume = MAP_RARE_AMBIENT_VOLUME;
  const uiButtonClickAudio = new Audio(UI_BUTTON_CLICK_SFX_SRC);
  uiButtonClickAudio.preload = 'auto';
  uiButtonClickAudio.volume = UI_BUTTON_CLICK_SFX_VOLUME;
  let mathAppleDropSoundTimers = [];
  const tabButtons = [...document.querySelectorAll('[data-tab]')];
  const PREVIEW_PROGRESS_KEY = 'baby-island-preview-progress-v1';
  const LEARNING_ACTIVITY_KEY = 'baby-island-learning-activity-v1';
  const APP_PREFERENCES_KEY = 'baby-island-app-preferences-v1';
  const SUPPORT_DRAFT_KEY = 'baby-island-support-draft-v1';
  const MISTAKE_BOOK_KEY = 'baby-island-mistake-book-v1';
  const defaultPreferences = {
    mapMusic: true,
    autoPronunciation: true,
    showChineseHints: true,
    mapWorld: 'ocean',
    childName: '小禾',
    childAge: '4',
  };
  const preferenceLabels = {
    mapMusic: '背景音乐',
    autoPronunciation: '自动读英文',
    showChineseHints: '中文辅助',
  };
  const appInfoPages = {
    privacy: {
      eyebrow: 'PRIVACY',
      title: '隐私政策',
      intro: '我们只收集运行学习闯关所必需的信息，默认优先保存在本机。',
      sections: [
        ['收集哪些信息', '学习进度、已学单词、错题记录和家长设置，用来恢复孩子的闯关记录。'],
        ['孩子体验', '宝宝端不展示广告，不做公开社交资料，学习数据默认保存在本机。'],
        ['家长控制', '家长可以在系统设置或浏览器中清除本机数据；当前不收集账号信息。'],
      ],
    },
    terms: {
      eyebrow: 'TERMS',
      title: '使用条款',
      intro: '嗨洛塔少儿启蒙APP是面向家庭的少儿启蒙产品，家长负责陪同使用和安排学习时间。',
      sections: [
        ['学习内容', '课程用于少儿启蒙，不替代学校教学或专业评估。'],
        ['使用方式', '按关卡顺序完成学习，已解锁内容可以反复复习。'],
        ['使用边界', '请勿复制、售卖或批量抓取课程、图片、音频等内容。'],
      ],
    },
    about: {
      eyebrow: 'ABOUT',
      title: '关于应用',
      intro: '嗨洛塔少儿启蒙APP把英语地图、数学启蒙和视频闯关组合成适合 iPad 横屏的学习体验。',
      sections: [
        ['当前版本', `v${APP_RELEASE_VERSION}，适配 iPad 横屏与移动浏览器。`],
        ['适合人群', '主要面向 3-5 岁宝宝，由家长陪同使用体验更好。'],
        ['核心功能', '多地图闯关、英语视频答题、数学启蒙、单词发音、学习统计和排行榜。'],
      ],
    },
  };
  let previewProgressByWorld = normalizeWorldProgress(null, levels.length);
  let learningActivity = normalizeLearningActivity(null);
  let mistakeBook = normalizeMistakeBook(null);
  let assetPackStates = normalizeAssetPackStates(null);
  let levelVideoStates = normalizeLevelVideoStates(null);
  let mathAttempts = normalizeMathAttempts(null);
  try { previewProgressByWorld = normalizeWorldProgress(JSON.parse(localStorage.getItem(PREVIEW_PROGRESS_KEY)), levels.length); } catch {}
  try { learningActivity = normalizeLearningActivity(JSON.parse(localStorage.getItem(LEARNING_ACTIVITY_KEY))); } catch {}
  try { mistakeBook = normalizeMistakeBook(JSON.parse(localStorage.getItem(MISTAKE_BOOK_KEY)), levels); } catch {}
  try { assetPackStates = normalizeAssetPackStates(JSON.parse(localStorage.getItem(ASSET_PACK_STORAGE_KEY))); } catch {}
  try { levelVideoStates = normalizeLevelVideoStates(JSON.parse(localStorage.getItem(LEVEL_VIDEO_STORAGE_KEY))); } catch {}
  try { mathAttempts = normalizeMathAttempts(JSON.parse(localStorage.getItem(MATH_ATTEMPT_KEY))); } catch {}
  function loadAppPreferences() {
    try {
      const saved = JSON.parse(localStorage.getItem(APP_PREFERENCES_KEY));
      const profile = normalizeChildProfile(saved);
      return {
        ...defaultPreferences,
        mapMusic: typeof saved?.mapMusic === 'boolean' ? saved.mapMusic : defaultPreferences.mapMusic,
        autoPronunciation: typeof saved?.autoPronunciation === 'boolean' ? saved.autoPronunciation : defaultPreferences.autoPronunciation,
        showChineseHints: typeof saved?.showChineseHints === 'boolean' ? saved.showChineseHints : defaultPreferences.showChineseHints,
        mapWorld: normalizeMapWorldId(saved?.mapWorld),
        childName: profile.childName,
        childAge: profile.childAge,
        vipActive: saved?.vipActive === true,
      };
    } catch {
      return { ...defaultPreferences };
    }
  }
  const preferences = loadAppPreferences();
  const state = {
    progressByWorld: previewProgressByWorld,
    progress: previewProgressByWorld[preferences.mapWorld],
    preferences,
    learningActivity,
    mistakeBook,
    assetPacks: assetPackStates,
    levelVideos: levelVideoStates,
    mathAttempts,
    mathCoachPlans: {},
    mathMapLevelId: null,
    mathMapTransition: '',
    messageTimer: null,
  };
  let learningSyncTimer = 0;
  let learningSyncInFlight = false;
  let learningSyncPending = false;
  let learningSyncReady = false;

  function learningApi() {
    return window.babyIslandApi || null;
  }

  function learningSnapshot() {
    return {
      profile: normalizeChildProfile(state.preferences),
      preferences: {
        mapMusic: state.preferences.mapMusic !== false,
        autoPronunciation: state.preferences.autoPronunciation !== false,
        showChineseHints: state.preferences.showChineseHints !== false,
        mapWorld: normalizeMapWorldId(state.preferences.mapWorld),
      },
      progressByWorld: normalizeWorldProgress(state.progressByWorld, DISPLAY_LEVEL_COUNT),
      learningActivity: normalizeLearningActivity(state.learningActivity),
      mistakeBook: normalizeMistakeBook(state.mistakeBook, activeWorldLevels()),
      mathAttempts: normalizeMathAttempts(state.mathAttempts),
    };
  }

  function persistLearningStateLocal() {
    try { localStorage.setItem(PREVIEW_PROGRESS_KEY, JSON.stringify(state.progressByWorld)); } catch {}
    try { localStorage.setItem(LEARNING_ACTIVITY_KEY, JSON.stringify(state.learningActivity)); } catch {}
    try { localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(state.preferences)); } catch {}
    try { localStorage.setItem(MISTAKE_BOOK_KEY, JSON.stringify(state.mistakeBook)); } catch {}
    try { localStorage.setItem(MATH_ATTEMPT_KEY, JSON.stringify(state.mathAttempts)); } catch {}
  }

  function recordLocalMathAttempt(level, selectedIndex, isCorrect, responseMs = null) {
    const now = Date.now();
    const selectedGroup = level?.math?.groups?.[selectedIndex] || {};
    const attempt = {
      attemptId: `math-${level.id}-${now}-${Math.random().toString(36).slice(2, 8)}`,
      ts: now,
      worldId: 'math',
      levelId: level.id,
      skill: level.itemType || 'count',
      targetCount: level.targetCount,
      selected: level.options[selectedIndex],
      selectedCount: selectedGroup.count,
      correct: level.options[level.correct],
      isCorrect,
      mode: level.math?.adaptiveMode || 'same',
      responseMs,
    };
    state.mathAttempts = appendMathAttempt(state.mathAttempts, attempt);
    delete state.mathCoachPlans[level.id];
    try { localStorage.setItem(MATH_ATTEMPT_KEY, JSON.stringify(state.mathAttempts)); } catch {}
    return attempt;
  }

  function mathCoachPayload(level, attempt) {
    return {
      levelId: level.id,
      skill: level.itemType || 'count',
      targetCount: level.targetCount,
      selectedCount: attempt?.selectedCount ?? null,
      isCorrect: attempt?.isCorrect === true,
      responseMs: attempt?.responseMs ?? null,
      attempts: normalizeMathAttempts(state.mathAttempts).slice(-20),
    };
  }

  function fallbackMathCoachPlan(level, attempt) {
    const nextVariant = adaptMathLevel(level, state.mathAttempts);
    const variantMode = nextVariant.math?.adaptiveMode || 'same';
    return {
      provider: 'local-template',
      variantMode,
      feedbackText: mathVoiceFeedback(
        attempt?.isCorrect ? 'correct' : variantMode === 'easier' ? 'wrong-easier' : 'wrong',
        { targetCount: level.targetCount },
      ).text,
      recommendation: nextMathPathRecommendation(state.mathAttempts, level.id),
    };
  }

  function requestMathCoachPlan(level, attempt) {
    const fallback = fallbackMathCoachPlan(level, attempt);
    const api = learningApi();
    if (!api?.generateMathCoachPlan) return Promise.resolve(fallback);
    return api.generateMathCoachPlan(mathCoachPayload(level, attempt))
      .then((plan) => ({
        provider: String(plan?.provider || fallback.provider).slice(0, 40),
        variantMode: ['easier', 'same', 'harder'].includes(plan?.variantMode) ? plan.variantMode : fallback.variantMode,
        feedbackText: String(plan?.feedbackText || fallback.feedbackText).slice(0, 80),
        recommendation: {
          levelId: Math.max(1, Math.min(DISPLAY_LEVEL_COUNT, Number(plan?.recommendation?.levelId) || fallback.recommendation.levelId)),
          reason: plan?.recommendation?.reason === 'repeat-current' ? 'repeat-current' : 'next-level',
        },
      }))
      .catch(() => fallback);
  }

  function speakMathVoiceFeedback(feedbackText, forceCorrect) {
    // Intentional MVP: audio is correct/wrong local MP3 only.
    // Dynamic feedbackText is shown in the banner; do not restore system Chinese TTS.
    const message = String(feedbackText || '').trim().slice(0, 80);
    if (!message || state.preferences.autoPronunciation === false) return false;
    const isCorrect = typeof forceCorrect === 'boolean'
      ? forceCorrect
      : /答对|太好了|对了|棒棒/.test(message);
    return playMathCoachFeedbackTone(isCorrect ? 'correct' : 'wrong');
  }

  function playMathCoachFeedbackTone(kind) {
    // MATH_VOICE_FEEDBACK_MODE = 'correct-wrong-mp3'
    if (state.preferences.autoPronunciation === false) return false;
    try {
      mathFeedbackSpeechToken += 1;
      const token = mathFeedbackSpeechToken;
      const normalized = kind === 'correct' ? 'correct' : 'wrong';
      const src = MATH_COACH_FEEDBACK_AUDIO_SRC[normalized];
      const mathCoachAudio = new Audio(src);
      const restoreMusic = () => {
        if (token === mathFeedbackSpeechToken) mapMusic.volume = currentMapMusicVolume();
      };
      const clearCoachAudio = () => {
        if (mathCoachAudioEl === mathCoachAudio) mathCoachAudioEl = null;
        restoreMusic();
      };
      mathCoachAudio.onended = clearCoachAudio;
      mathCoachAudio.onerror = clearCoachAudio;
      if (mathCoachAudioEl) {
        mathCoachAudioEl.pause();
        mathCoachAudioEl.currentTime = 0;
      }
      mathCoachAudio.volume = FEEDBACK_AUDIO_VOLUME;
      mathCoachAudioEl = mathCoachAudio;
      mapMusic.volume = MAP_MUSIC_DUCK_VOLUME;
      mathCoachAudio.play().catch(restoreMusic);
      return true;
    } catch (_) {
      return false;
    }
  }

  function rememberMathCoachPlan(level, plan) {
    const variantMode = ['easier', 'same', 'harder'].includes(plan?.variantMode) ? plan.variantMode : null;
    if (!variantMode) return null;
    const recommendation = {
      levelId: Math.max(1, Math.min(DISPLAY_LEVEL_COUNT, Number(plan?.recommendation?.levelId) || level.id)),
      reason: plan?.recommendation?.reason === 'repeat-current' ? 'repeat-current' : 'next-level',
    };
    const targetLevelId = recommendation.reason === 'repeat-current' ? level.id : recommendation.levelId;
    const safePlan = {
      provider: String(plan?.provider || 'local-template').slice(0, 40),
      variantMode,
      feedbackText: String(plan?.feedbackText || '').slice(0, 80),
      recommendation,
    };
    state.mathCoachPlans[targetLevelId] = safePlan;
    return safePlan;
  }

  function mathLevelForCoachPlan(level) {
    const plan = state.mathCoachPlans[level.id];
    return plan?.variantMode ? generateMathVariant(level, { mode: plan.variantMode }) : adaptMathLevel(level, state.mathAttempts);
  }

  function resolveMathCoachContinueTarget(plan, levelId) {
    if (!plan?.recommendation) return null;
    return {
      levelId: Math.max(1, Math.min(DISPLAY_LEVEL_COUNT, Number(plan.recommendation.levelId) || levelId)),
      reason: plan.recommendation.reason === 'repeat-current' ? 'repeat-current' : 'next-level',
    };
  }

  function openMathRecommendedLevel(levelId) {
    state.preferences.mapWorld = 'math';
    state.progress = state.progressByWorld.math;
    try { localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(state.preferences)); } catch {}
    persistLearningStateLocal();
    applyPreferences();
    // 数学图真源 = 当前关卡胶囊 + 内联小桌；禁常驻 toast 顶掉胶囊（看起来像旧壳）
    showInlineMathLevel(levelId);
    setActiveTab('map');
    window.scrollTo(0, 0);
  }

  function openEnglishMap(worldId) {
    const nextWorldId = worldId === 'desert' ? 'desert' : 'ocean';
    const world = MAP_WORLDS[nextWorldId];
    state.preferences.mapWorld = nextWorldId;
    state.progress = state.progressByWorld[nextWorldId];
    try { localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(state.preferences)); } catch {}
    persistLearningStateLocal();
    applyPreferences();
    if (location.hash !== '#map') history.pushState(null, '', '#map');
    renderMap(`已打开${world?.title || '英语地图'}`);
    setActiveTab('map');
    window.scrollTo(0, 0);
  }

  function mergeProgress(localProgress, remoteProgress) {
    const local = normalizeProgress(localProgress, DISPLAY_LEVEL_COUNT);
    const remote = normalizeProgress(remoteProgress, DISPLAY_LEVEL_COUNT);
    const completed = [...new Set([...local.completed, ...remote.completed])].sort((a, b) => a - b);
    return normalizeProgress({
      completed,
      unlockedThrough: Math.max(local.unlockedThrough, remote.unlockedThrough),
    }, DISPLAY_LEVEL_COUNT);
  }

  function remoteStateHasLearning(remote) {
    const progress = normalizeWorldProgress(remote?.progressByWorld, DISPLAY_LEVEL_COUNT);
    const hasProgress = Object.keys(MAP_WORLDS).some((worldId) => progress[worldId]?.completed?.length);
    const activity = normalizeLearningActivity(remote?.learningActivity);
    const mistakes = normalizeMistakeBook(remote?.mistakeBook, activeWorldLevels());
    const profile = normalizeChildProfile(remote?.profile);
    const prefs = remote?.preferences || {};
    return hasProgress
      || activity.dates.length > 0
      || mistakes.items.length > 0
      || profile.childName !== defaultPreferences.childName
      || profile.childAge !== defaultPreferences.childAge
      || prefs.mapWorld !== undefined;
  }

  function mergeLearningStateFromCloud(remote) {
    if (!remote || typeof remote !== 'object') return false;
    const remoteProgress = normalizeWorldProgress(remote.progressByWorld, DISPLAY_LEVEL_COUNT);
    Object.keys(MAP_WORLDS).forEach((worldId) => {
      state.progressByWorld[worldId] = mergeProgress(state.progressByWorld[worldId], remoteProgress[worldId]);
    });
    if (remoteStateHasLearning(remote)) {
      const profile = normalizeChildProfile(remote.profile);
      const prefs = remote.preferences || {};
      state.preferences.childName = profile.childName;
      state.preferences.childAge = profile.childAge;
      if (typeof prefs.mapMusic === 'boolean') state.preferences.mapMusic = prefs.mapMusic;
      if (typeof prefs.autoPronunciation === 'boolean') state.preferences.autoPronunciation = prefs.autoPronunciation;
      if (typeof prefs.showChineseHints === 'boolean') state.preferences.showChineseHints = prefs.showChineseHints;
      state.preferences.mapWorld = normalizeMapWorldId(prefs.mapWorld);
    }
    state.progress = state.progressByWorld[normalizeMapWorldId(state.preferences.mapWorld)];
    state.learningActivity = normalizeLearningActivity({
      dates: [...state.learningActivity.dates, ...normalizeLearningActivity(remote.learningActivity).dates],
    });
    state.mistakeBook = normalizeMistakeBook({
      items: [...normalizeMistakeBook(remote.mistakeBook, activeWorldLevels()).items, ...state.mistakeBook.items],
    }, activeWorldLevels());
    state.mathAttempts = mergeMathAttempts(state.mathAttempts, remote.mathAttempts);
    persistLearningStateLocal();
    applyPreferences();
    return true;
  }

  function flushLearningSync() {
    const api = learningApi();
    if (!learningSyncReady || !api?.saveLearningState) return;
    if (learningSyncInFlight) {
      learningSyncPending = true;
      return;
    }
    learningSyncInFlight = true;
    learningSyncPending = false;
    api.saveLearningState(learningSnapshot()).catch(() => {}).finally(() => {
      learningSyncInFlight = false;
      if (learningSyncPending) flushLearningSync();
    });
  }

  function scheduleLearningSync() {
    if (!learningSyncReady) return;
    clearTimeout(learningSyncTimer);
    learningSyncTimer = setTimeout(flushLearningSync, 600);
  }

  function hydrateLearningStateFromBackend() {
    const api = learningApi();
    if (!api?.checkSession || !api?.loadLearningState) return Promise.resolve(false);
    return api.checkSession().then((session) => {
      if (!session?.isLoggedIn) return false;
      return api.loadLearningState().then((remote) => {
        learningSyncReady = true;
        return remote;
      });
    }).then((remote) => {
      if (!remote) return false;
      const changed = mergeLearningStateFromCloud(remote);
      scheduleLearningSync();
      if (changed) render();
      return true;
    }).catch(() => {
      learningSyncReady = false;
      return false;
    });
  }

  function recordQuizAttemptSync(payload) {
    const api = learningApi();
    if (!learningSyncReady || !api?.recordQuizAttempt) return;
    api.recordQuizAttempt(payload).catch(() => {});
  }

  function submitSupportFeedbackSync(message) {
    const api = learningApi();
    if (!learningSyncReady || !api?.sendSupportFeedback) return;
    api.sendSupportFeedback({
      message,
      context: {
        currentLevel: state.progress.unlockedThrough,
        completed: state.progress.completed.length,
        mapWorld: state.preferences.mapWorld,
        userAgent: navigator.userAgent,
      },
    }).catch(() => {});
  }

  const icons = {
    completed: '<svg class="node-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m6 12 4 4 8-9"/></svg>',
    current: '<svg class="node-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m9 7 8 5-8 5z"/></svg>',
    locked: '<svg class="node-icon" aria-hidden="true" viewBox="0 0 24 24"><rect x="6" y="10" width="12" height="9" rx="2"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/></svg>',
    islandLock: '<span class="island-lock" aria-hidden="true"><svg viewBox="0 0 64 72"><path class="island-lock-shackle" d="M18 30v-8C18 12 24 7 32 7s14 5 14 15v8"/><rect class="island-lock-body" x="7" y="27" width="50" height="37" rx="12"/><path class="island-lock-highlight" d="M17 36h20"/><circle class="island-lock-keyhole" cx="32" cy="46" r="5"/><path class="island-lock-keyhole-stem" d="M32 50v7"/></svg></span>',
    locate: '<svg class="locate-progress-icon" aria-hidden="true" viewBox="0 0 48 48"><path d="M18 7h-5a6 6 0 0 0-6 6v5M30 7h5a6 6 0 0 1 6 6v5M18 41h-5a6 6 0 0 1-6-6v-5M30 41h5a6 6 0 0 0 6-6v-5"/><circle cx="24" cy="24" r="11"/></svg>',
    jump: '<svg class="map-jump-icon" aria-hidden="true" viewBox="0 0 48 48"><path d="M14 13m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0"/><path d="M18 13h8c5.5 0 9 3.2 9 7.5S31.5 28 26 28h-6c-4.4 0-7 2.6-7 6s2.6 6 7 6h14"/><path d="m31 34 6 6-6 6"/></svg>',
    mapMusicOn: '<svg class="map-music-icon" aria-hidden="true" viewBox="0 0 48 48"><path d="M10 19h7l9-7v24l-9-7h-7z"/><path d="M32 18c3.2 2.8 3.2 9.2 0 12"/><path d="M37 13c6.2 5.4 6.2 16.6 0 22"/></svg>',
    mapMusicOff: '<svg class="map-music-icon" aria-hidden="true" viewBox="0 0 48 48"><path d="M10 19h7l9-7v24l-9-7h-7z"/><path d="M33 18 42 30"/><path d="M42 18 33 30"/></svg>',
    assetPack: '<svg class="asset-pack-icon" aria-hidden="true" viewBox="0 0 48 48"><path d="M24 7 8 14l16 7 16-7z"/><path d="M8 24l16 7 16-7"/><path d="M8 34l16 7 16-7"/></svg>',
    download: '<svg class="asset-pack-icon" aria-hidden="true" viewBox="0 0 48 48"><g class="map-pack-download-arrow"><path d="M24 8v22"/><path d="m15 21 9 9 9-9"/></g><path class="map-pack-download-tray" d="M12 39h24"/></svg>',
    mapSwitch: '<svg class="map-switch-icon" aria-hidden="true" viewBox="0 0 1024 1024"><path d="M883.875 684.806c41.592-90.131 47.607-188.11 23.715-277.077-27.468-102.682-95.063-194.238-193.08-249.865l43.48-93.961-247.21 64.819 110.564 230.424 45.491-98.308c66.606 40.672 112.204 104.396 131.498 176.146 17.257 64.639 13.024 134.926-17.145 200.514-38.445 83.352-110.309 140.105-192.603 162.245a296.78 296.78 0 0 1-36.221 7.297l51.033 105.49c4.853-1.129 9.665-2.263 14.447-3.572 113.302-30.203 213.143-109.249 266.031-224.152z m-524.696 82.476c-67.595-40.598-113.886-104.87-133.367-177.273-17.252-64.64-12.985-134.967 17.145-200.48 38.447-83.386 110.31-140.141 192.605-162.28 13.646-3.651 27.541-6.275 41.587-7.957l-50.886-106.037c-6.676 1.426-13.353 2.956-19.957 4.744-113.266 30.272-213.141 109.317-266.07 224.221-41.511 90.097-47.533 188.11-23.639 277.038l0.073 0.293c27.686 103.375 96.083 195.406 195.196 250.886l-41.111 89.661 246.955-65.694-111.329-230.022-47.202 102.9z m0 0"/></svg>',
    wordAudio: '<svg class="word-audio-icon" aria-hidden="true" viewBox="0 0 48 48"><path d="M9 19h8l10-8v26l-10-8H9z"/><path d="M33 18c3 3 3 9 0 12M38 13c7 6 7 16 0 22"/></svg>',
    stateCompleted: '<svg class="level-state-icon state-completed" aria-hidden="true" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20"/><path d="m15 24 6 6 13-14"/></svg>',
    stateCurrent: '<svg class="level-state-icon state-current" aria-hidden="true" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20"/><path d="m20 15 14 9-14 9z"/></svg>',
    stateLocked: '<svg class="level-state-icon state-locked" aria-hidden="true" viewBox="0 0 48 48"><rect x="12" y="21" width="24" height="19" rx="7"/><path d="M17 21v-5a7 7 0 0 1 14 0v5"/></svg>',
    premiumHero: '<svg class="access-hero-svg" aria-hidden="true" viewBox="0 0 72 72" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 52 10 24l14 11 12-17 12 17 14-11-4 28z"/><path d="M16 60h40"/></svg>',
  };
  let islandAudioContext;
  let pronunciationTimer;
  let pronunciationToken = 0;
  let networkStatusTimer;
  let toastTimer;
  let appUpdateReady = false;
  let appUpdateApplying = false;
  let serviceWorkerRegistration = null;
  let mapSwitchDialog = null;
  let assetPackDialog = null;
  let releaseUpdateDialog = null;
  let levelVideoLoadingDataPromise = null;
  let promptedReleaseVersion = '';
  const QUESTION_AUDIO_VERSION = '20260719-question-200-nouns-v2';
  const FEEDBACK_AUDIO_VERSION = '20260804-peiqi-feedback-v3';
  const FEEDBACK_AUDIO_SRC = {
    correct: `assets/audio/feedback-holly/correct.mp3?v=${FEEDBACK_AUDIO_VERSION}`,
    wrong: `assets/audio/feedback-holly/wrong.mp3?v=${FEEDBACK_AUDIO_VERSION}`,
  };
  const MATH_COACH_FEEDBACK_AUDIO_SRC = {
    correct: FEEDBACK_AUDIO_SRC.correct,
    wrong: FEEDBACK_AUDIO_SRC.wrong,
  };

  // ─── 本地 MP3（豆包 TTS 预录） ──────────────────────
  const EXTRA_WORD_AUDIO = {
    'ice cream': 'assets/audio/words/ice_cream.mp3?v=20260718-ice-cream-word-v1',
  };
  let wordAudioMap = {};
  let wordAudioManifestLoaded = false;
  let localAudioEl = null;
  let mathFeedbackSpeechToken = 0;
  let mathCoachAudioEl = null;

  function wordAudioSrcFor(word) {
    const key = String(word || '').toLowerCase();
    const bareKey = key.replace(/[.!?]+$/g, '');
    return wordAudioMap[key] || wordAudioMap[bareKey] || EXTRA_WORD_AUDIO[key] || EXTRA_WORD_AUDIO[bareKey] || '';
  }

  function wordHasLocalAudio(word) {
    return !!wordAudioSrcFor(word);
  }

  function wordCanPronounce(word) {
    return !!String(word || '').trim() && wordHasLocalAudio(word);
  }

  function questionAudioSrcFor(level) {
    const slug = level.title.toLowerCase().replace(/\s+/g, '-');
    return `assets/audio/questions-holly/level-${String(level.id).padStart(2, '0')}-${slug}.mp3?v=${QUESTION_AUDIO_VERSION}`;
  }

  function loadWordAudioManifest() {
    // 优先从全局 JS manifest 读取（file:// 协议下 fetch 被浏览器阻断）
    if (window.WORD_AUDIO_MANIFEST && Array.isArray(window.WORD_AUDIO_MANIFEST.entries) && window.WORD_AUDIO_MANIFEST.entries.length > 0) {
      wordAudioMap = {};
      window.WORD_AUDIO_MANIFEST.entries.forEach((entry) => {
        if (entry.status === 'generated' && entry.word) {
          wordAudioMap[entry.word.toLowerCase()] = entry.url;
        }
      });
      wordAudioManifestLoaded = true;
      updateWordAudioButtons();
      return;
    }

    // HTTP 环境：fetch JSON 允许刷新
    fetch(`assets/audio/words/word-audio-manifest.json?v=${WORD_AUDIO_MANIFEST_VERSION}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((manifest) => {
        if (!manifest || !Array.isArray(manifest.entries)) return;
        wordAudioMap = {};
        manifest.entries.forEach((entry) => {
          if (entry.status === 'generated' && entry.word) {
            wordAudioMap[entry.word.toLowerCase()] = entry.url;
          }
        });
        wordAudioManifestLoaded = true;
        updateWordAudioButtons();
      })
      .catch(() => {
        // fetch 失败不清空已有映射 — file:// 场景由上方 JS manifest 注入
      });
  }

  /** 修正所有发音按钮的 disabled 状态 */
  function updateWordAudioButtons() {
    document.querySelectorAll('[data-speak-word]').forEach((button) => {
      const w = button.dataset.speakWord;
      button.disabled = !wordCanPronounce(w);
    });
  }

  loadWordAudioManifest();

  function pulseWordAudioButton(button) {
    if (!button) return;
    button.classList.remove('is-speaking');
    void button.offsetWidth;
    button.classList.add('is-speaking');
    button.addEventListener('animationend', () => button.classList.remove('is-speaking'), { once: true });
  }

  function cancelWordPronunciation() {
    clearTimeout(pronunciationTimer);
    pronunciationToken += 1;
    if (localAudioEl) {
      localAudioEl.pause();
      localAudioEl.currentTime = 0;
    }
    mapMusic.volume = currentMapMusicVolume();
  }

  function playWordPronunciation(word, button) {
    pulseWordAudioButton(button);
    if (!word) return false;

    clearTimeout(pronunciationTimer);
    const token = ++pronunciationToken;

    // 优先本地 MP3（豆包 TTS 预录，BGM 压低/恢复 + 取消机制）
    const localUrl = wordAudioSrcFor(word);
    if (localUrl) {
      if (!localAudioEl) {
        localAudioEl = new Audio();
        localAudioEl.preload = 'auto';
      }
      localAudioEl.pause();
      localAudioEl.currentTime = 0;
      localAudioEl.src = localUrl;
      localAudioEl.volume = WORD_AUDIO_VOLUME;
      mapMusic.volume = MAP_MUSIC_DUCK_VOLUME;
      const restoreMusic = () => {
        if (token === pronunciationToken) mapMusic.volume = currentMapMusicVolume();
      };
      localAudioEl.onended = restoreMusic;
      localAudioEl.onerror = restoreMusic;
      localAudioEl.play().catch(restoreMusic);
      return true;
    }

    return false;
  }

  function routeFromHash() {
    return parseRouteHash(location.hash);
  }

  function shouldPlayMapAudio(route = routeFromHash()) {
    return route.type === 'map' && state.preferences.mapMusic;
  }

  function mapMusicSrcForWorld(worldId) {
    return assetHref(MAP_MUSIC_BY_WORLD[normalizeMapWorldId(worldId)]);
  }

  function currentMapMusicVolume() {
    if (state.preferences.mapWorld === 'desert') return DESERT_MAP_MUSIC_VOLUME;
    if (state.preferences.mapWorld === 'math') return MATH_MAP_MUSIC_VOLUME;
    return MAP_MUSIC_VOLUME;
  }

  let mapAmbientTimer = 0;
  let mapRareAmbientTimer = 0;

  function randomMapAmbientDelay() {
    return MAP_AMBIENT_MIN_DELAY_MS + Math.random() * (MAP_AMBIENT_MAX_DELAY_MS - MAP_AMBIENT_MIN_DELAY_MS);
  }

  function randomMapRareAmbientDelay() {
    return MAP_RARE_AMBIENT_MIN_DELAY_MS + Math.random() * (MAP_RARE_AMBIENT_MAX_DELAY_MS - MAP_RARE_AMBIENT_MIN_DELAY_MS);
  }

  function scheduleMapAmbient(route = routeFromHash()) {
    if (state.preferences.mapWorld !== 'ocean' || !shouldPlayMapAudio(route) || mapAmbientTimer || !mapAmbientAudio.paused) return;
    mapAmbientTimer = setTimeout(playMapAmbient, randomMapAmbientDelay());
  }

  function scheduleMapRareAmbient(route = routeFromHash()) {
    if (state.preferences.mapWorld !== 'ocean' || !shouldPlayMapAudio(route) || mapRareAmbientTimer || !mapRareAmbientAudio.paused) return;
    mapRareAmbientTimer = setTimeout(playMapRareAmbient, randomMapRareAmbientDelay());
  }

  function stopMapAmbient() {
    clearTimeout(mapAmbientTimer);
    mapAmbientTimer = 0;
    mapAmbientAudio.pause();
    mapAmbientAudio.currentTime = 0;
  }

  function stopMapRareAmbient() {
    clearTimeout(mapRareAmbientTimer);
    mapRareAmbientTimer = 0;
    mapRareAmbientAudio.pause();
    mapRareAmbientAudio.currentTime = 0;
  }

  function playMapAmbient() {
    mapAmbientTimer = 0;
    if (state.preferences.mapWorld !== 'ocean' || !shouldPlayMapAudio()) return;
    mapAmbientAudio.currentTime = 0;
    mapAmbientAudio.play().catch(() => scheduleMapAmbient());
  }

  function playMapRareAmbient() {
    mapRareAmbientTimer = 0;
    if (state.preferences.mapWorld !== 'ocean' || !shouldPlayMapAudio()) return;
    mapRareAmbientAudio.currentTime = 0;
    mapRareAmbientAudio.volume = MAP_RARE_AMBIENT_VOLUME;
    mapRareAmbientAudio.play().catch(() => scheduleMapRareAmbient());
  }

  mapAmbientAudio.addEventListener('ended', () => scheduleMapAmbient());
  mapAmbientAudio.addEventListener('error', () => scheduleMapAmbient());
  mapRareAmbientAudio.addEventListener('ended', () => scheduleMapRareAmbient());
  mapRareAmbientAudio.addEventListener('error', () => scheduleMapRareAmbient());

  function navigate(route, historyState = null) {
    if (location.hash === `#${route}`) return;
    history.pushState(historyState, '', `#${route}`);
    render();
    window.scrollTo(0, 0);
    rememberLastStay();
  }

  function syncMapMusic(route = routeFromHash()) {
    const nextMusicSrc = mapMusicSrcForWorld(state.preferences.mapWorld);
    if (mapMusic.src !== nextMusicSrc) {
      mapMusic.pause();
      mapMusic.currentTime = 0;
      mapMusic.src = nextMusicSrc;
      mapMusic.load();
      stopMapAmbient();
      stopMapRareAmbient();
    }
    mapMusic.volume = currentMapMusicVolume();
    if (shouldPlayMapAudio(route)) {
      const playPromise = mapMusic.play();
      const scheduleMapSounds = () => {
        if (state.preferences.mapWorld === 'ocean') {
          scheduleMapAmbient(route);
          scheduleMapRareAmbient(route);
        }
      };
      if (playPromise?.then) playPromise.then(scheduleMapSounds).catch(() => {});
      else scheduleMapSounds();
    } else {
      mapMusic.pause();
      mapMusic.currentTime = 0;
      stopMapAmbient();
      stopMapRareAmbient();
    }
  }

  function applyPreferences() {
    document.body.classList.toggle('pref-hide-chinese-hints', !state.preferences.showChineseHints);
    syncMapMusic();
  }

  function paintMapMusicToggle(button = main.querySelector('[data-map-music-toggle]')) {
    if (!button) return;
    const on = state.preferences.mapMusic !== false;
    button.classList.toggle('is-muted', !on);
    button.setAttribute('aria-pressed', on ? 'true' : 'false');
    button.setAttribute('aria-label', on ? '关闭背景音' : '打开背景音');
    button.title = on ? '关闭背景音' : '打开背景音';
    button.innerHTML = on ? icons.mapMusicOn : icons.mapMusicOff;
  }

  function setPreference(key, value) {
    if (!(key in defaultPreferences)) return;
    state.preferences[key] = value;
    try { localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(state.preferences)); } catch {}
    applyPreferences();
    if (key === 'mapMusic') paintMapMusicToggle();
    scheduleLearningSync();
    showToast(`${preferenceLabels[key]}已${value ? '开启' : '关闭'}`);
    if (routeFromHash().type === 'mine') renderMine();
  }

  function setChildProfile(field, value) {
    if (!['childName', 'childAge'].includes(field)) return;
    const profile = normalizeChildProfile({ ...state.preferences, [field]: value });
    state.preferences.childName = profile.childName;
    state.preferences.childAge = profile.childAge;
    try { localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(state.preferences)); } catch {}
    scheduleLearningSync();
    showToast(field === 'childName' ? '宝宝昵称已保存' : `宝宝年龄已设为 ${profile.childAge} 岁`);
    if (routeFromHash().type === 'mine') renderMine();
  }

  function recordLearningActivity(date = new Date()) {
    state.learningActivity = addLearningActivityDay(state.learningActivity, date);
    try { localStorage.setItem(LEARNING_ACTIVITY_KEY, JSON.stringify(state.learningActivity)); } catch {}
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));
  }

  function loadSupportDraft() {
    try { return localStorage.getItem(SUPPORT_DRAFT_KEY) || ''; } catch { return ''; }
  }

  function saveSupportDraft(message) {
    try { localStorage.setItem(SUPPORT_DRAFT_KEY, message); } catch {}
  }

  function resolveToastHostDialog(preferred) {
    if (preferred && preferred.tagName === 'DIALOG' && preferred.open) return preferred;
    // 强制登录优先（常与版本更新 dialog 并存，挂错层会看不见）
    return document.querySelector('dialog.login-dialog[open]')
      || document.querySelector('dialog[open]:last-of-type')
      || document.querySelector('dialog[open]');
  }

  function showToast(message, preferredHost) {
    if (!message) return;
    clearTimeout(toastTimer);

    // modal dialog 在 top layer，body 上的 toast 会被挡住；有打开的 dialog 时把提示挂进 dialog
    const openDialog = resolveToastHostDialog(preferredHost);
    let toastEl = appToast;
    if (openDialog) {
      let dialogToast = openDialog.querySelector('[data-dialog-toast]');
      if (!dialogToast) {
        dialogToast = document.createElement('div');
        dialogToast.className = 'app-toast app-toast-in-dialog';
        dialogToast.setAttribute('data-dialog-toast', '1');
        dialogToast.setAttribute('role', 'status');
        dialogToast.setAttribute('aria-live', 'polite');
        openDialog.appendChild(dialogToast);
      }
      toastEl = dialogToast;
      if (appToast) appToast.hidden = true;
    }
    if (!toastEl) return;

    toastEl.textContent = message;
    toastEl.hidden = false;
    // 重触发动画
    try {
      toastEl.classList.remove('is-pop');
      // force reflow
      void toastEl.offsetWidth;
      toastEl.classList.add('is-pop');
    } catch (_) {}
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
      try { toastEl.classList.remove('is-pop'); } catch (_) {}
    }, 2200);
  }

  function canUseAssetPackBridge() {
    return !!window.webkit?.messageHandlers?.babyIslandAssetPack?.postMessage;
  }

  function persistAssetPackStates() {
    try { localStorage.setItem(ASSET_PACK_STORAGE_KEY, JSON.stringify(state.assetPacks)); } catch {}
  }

  function persistLevelVideoStates() {
    try { localStorage.setItem(LEVEL_VIDEO_STORAGE_KEY, JSON.stringify(state.levelVideos)); } catch {}
  }

  function loadLevelVideoLoadingData() {
    if (window.__LEVEL_VIDEO_LOADING_LOTTIE_DATA) return Promise.resolve(window.__LEVEL_VIDEO_LOADING_LOTTIE_DATA);
    if (!levelVideoLoadingDataPromise) {
      levelVideoLoadingDataPromise = fetch(`${LEVEL_VIDEO_LOADING_LOTTIE_URL}?v=20260803-rocking-horse-v1`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) window.__LEVEL_VIDEO_LOADING_LOTTIE_DATA = data;
          return data;
        })
        .catch(() => null);
    }
    return levelVideoLoadingDataPromise;
  }

  function mountLevelVideoLoadingLottie(root = document) {
    const lottieApi = window.lottie || window.bodymovin;
    if (!lottieApi) return;
    root.querySelectorAll('[data-level-video-loading-lottie]:not([data-lottie-mounted])').forEach((host) => {
      host.dataset.lottieMounted = '1';
      loadLevelVideoLoadingData().then((data) => {
        if (!data || !host.isConnected) return;
        host.innerHTML = '';
        lottieApi.loadAnimation({
          container: host,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: JSON.parse(JSON.stringify(data)),
        });
      });
    });
  }

  function hydrateAssetPackManifest() {
    fetch(`${ASSET_PACK_MANIFEST_URL}?v=${APP_RELEASE_VERSION}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((manifest) => {
        if (!manifest || !Array.isArray(manifest.maps)) return;
        const nextStates = { ...state.assetPacks };
        manifest.maps.forEach((pack) => {
          const mapId = normalizeMapWorldId(pack.mapId);
          if (MAP_WORLDS[mapId]?.comingSoon) return;
          const current = normalizeAssetPackState(nextStates[mapId]);
          const remoteVersion = typeof pack.packVersion === 'string' ? pack.packVersion : current.remoteVersion;
          const status = current.localVersion && remoteVersion && current.localVersion !== remoteVersion && current.status === 'ready'
            ? 'stale'
            : current.status;
          nextStates[mapId] = {
            ...current,
            status,
            remoteVersion,
            downloadUrl: typeof pack.downloadUrl === 'string' ? pack.downloadUrl : current.downloadUrl,
            levelVideoUrlTemplate: typeof pack.levelVideoUrlTemplate === 'string' ? pack.levelVideoUrlTemplate : current.levelVideoUrlTemplate,
            levels: Array.isArray(pack.levels) ? pack.levels : current.levels,
            bytesTotal: Number(pack.totalBytes) || current.bytesTotal,
          };
        });
        state.assetPacks = normalizeAssetPackStates(nextStates);
        persistAssetPackStates();
        if (routeFromHash().type === 'mine') renderMine();
        refreshAssetPackDialog();
        refreshAssetPackEntrances();
        const route = routeFromHash();
        if (route.type === 'level') {
          const level = activeLevelById(route.id);
          if (level && !levelVideoSourceFor(level)) {
            ensureLevelVideoDownload(level);
            refreshLevelVideoDownloadPanel(level);
          }
        }
      })
      .catch(() => {});
  }

  function postAssetPackMessage(action, worldId) {
    const handler = window.webkit?.messageHandlers?.babyIslandAssetPack;
    if (!handler?.postMessage) return false;
    const mapId = normalizeMapWorldId(worldId);
    const pack = state.assetPacks?.[mapId] || {};
    const levelQueue = assetPackLevelDownloadQueue(mapId, pack, state.levelVideos);
    handler.postMessage({
      action,
      mapId,
      manifestUrl: ASSET_PACK_MANIFEST_URL,
      bundledThroughLevel: FREE_LEVEL_COUNT,
      downloadUrl: pack.downloadUrl || '',
      downloadMode: pack.downloadUrl ? 'pack' : 'level',
      downloadOrder: 'level-ascending',
      levelQueue,
      remoteVersion: pack.remoteVersion || '',
    });
    return true;
  }

  function levelVideoKeyFor(level) {
    return levelVideoStateKey(level?.worldId || state.preferences.mapWorld, level?.id);
  }

  function levelVideoStateFor(level) {
    if (!level) return normalizeLevelVideoState();
    if (level.videoSrc) {
      return normalizeLevelVideoState({
        mapId: level.worldId || state.preferences.mapWorld,
        levelId: level.id,
        status: 'ready',
        progress: 100,
        localUrl: level.videoSrc,
      });
    }
    return normalizeLevelVideoState({
      mapId: level.worldId || state.preferences.mapWorld,
      levelId: level.id,
      ...state.levelVideos[levelVideoKeyFor(level)],
    });
  }

  function levelVideoDownloadUrl(level) {
    if (!level || level.videoSrc) return '';
    const mapId = normalizeMapWorldId(level.worldId || state.preferences.mapWorld);
    const pack = normalizeAssetPackState(state.assetPacks?.[mapId]);
    return assetPackLevelVideoUrl(mapId, level.id, pack);
  }

  function levelVideoSourceFor(level) {
    const videoState = levelVideoStateFor(level);
    return level?.videoSrc || (videoState.status === 'ready' ? videoState.localUrl : '');
  }

  function setLevelVideoState(level, patch) {
    if (!level) return;
    const key = levelVideoKeyFor(level);
    state.levelVideos = normalizeLevelVideoStates({
      ...state.levelVideos,
      [key]: {
        ...state.levelVideos[key],
        mapId: level.worldId || state.preferences.mapWorld,
        levelId: level.id,
        ...patch,
        updatedAt: Date.now(),
      },
    });
    persistLevelVideoStates();
  }

  function postLevelVideoMessage(action, level, downloadUrl = levelVideoDownloadUrl(level)) {
    const handler = window.webkit?.messageHandlers?.babyIslandAssetPack;
    if (!handler?.postMessage || !level) return false;
    const mapId = normalizeMapWorldId(level.worldId || state.preferences.mapWorld);
    const pack = state.assetPacks?.[mapId] || {};
    const levelQueue = assetPackLevelDownloadQueue(mapId, pack, state.levelVideos, { throughLevel: level.id });
    const nextQueued = levelQueue[0] || null;
    handler.postMessage({
      action,
      mapId,
      levelId: nextQueued?.levelId || level.id,
      targetLevelId: level.id,
      manifestUrl: ASSET_PACK_MANIFEST_URL,
      bundledThroughLevel: FREE_LEVEL_COUNT,
      downloadUrl: nextQueued?.downloadUrl || downloadUrl,
      downloadMode: 'level',
      downloadOrder: 'level-ascending',
      levelQueue,
      remoteVersion: pack.remoteVersion || '',
    });
    return true;
  }

  function ensureLevelVideoDownload(level) {
    if (!level || level.videoSrc) return;
    const current = levelVideoStateFor(level);
    if (['queued', 'downloading', 'ready'].includes(current.status)) return;
    const downloadUrl = levelVideoDownloadUrl(level);
    const queued = postLevelVideoMessage('startLevelVideo', level, downloadUrl);
    if (queued) {
      const mapId = normalizeMapWorldId(level.worldId || state.preferences.mapWorld);
      const pack = normalizeAssetPackState(state.assetPacks?.[mapId]);
      if (!['ready', 'downloading', 'queued'].includes(pack.status)) {
        state.assetPacks = normalizeAssetPackStates({
          ...state.assetPacks,
          [mapId]: { ...pack, status: 'queued', updatedAt: Date.now() },
        });
        persistAssetPackStates();
        refreshAssetPackDialog();
        refreshAssetPackEntrances();
      }
    }
    setLevelVideoState(level, {
      status: queued ? 'queued' : 'not-installed',
      progress: 0,
      downloadUrl,
      errorCode: downloadUrl || queued ? '' : 'missing_url',
    });
  }

  function levelVideoDownloadMarkup(level) {
    const videoState = levelVideoStateFor(level);
    const label = levelVideoDownloadLabel(videoState.status, videoState.progress);
    return `
      <div class="level-video-download-panel is-${videoState.status}" data-level-video-download-panel role="status" aria-live="polite" aria-label="${escapeHtml(label)}">
        <div class="level-video-loading-lottie" data-level-video-loading-lottie aria-hidden="true"></div>
        <div class="level-video-loading-dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>`;
  }

  function refreshLevelVideoDownloadPanel(level) {
    const host = main.querySelector('[data-level-video-download-panel]');
    if (!host || !level) return;
    host.outerHTML = levelVideoDownloadMarkup(level);
    mountLevelVideoLoadingLottie(main);
  }

  function assetPackRowsMarkup() {
    const bridgeAvailable = canUseAssetPackBridge();
    return Object.values(MAP_WORLDS)
      .filter((world) => world.comingSoon !== true && world.usesVideoAssets !== false)
      .map((world) => {
        const pack = assetPackSummary(world.id, state.assetPacks, { bridgeAvailable, levelVideoStates: state.levelVideos });
        return `
          <li class="asset-pack-row is-${pack.status}">
            <div class="asset-pack-copy">
              <strong>${escapeHtml(world.title)}</strong>
              <span>${escapeHtml(pack.playableText)}</span>
              <small>${escapeHtml(pack.stateLabel)}</small>
            </div>
            <div class="asset-pack-meter" aria-hidden="true"><span style="width:${Math.max(2, pack.progress)}%"></span></div>
            <button class="asset-pack-action" type="button" data-asset-pack-action="${pack.action}" data-asset-pack-world="${world.id}"${pack.disabled ? ' disabled' : ''}>${escapeHtml(pack.actionLabel || '已完成')}</button>
          </li>`;
      })
      .join('');
  }

  function assetPackOverview() {
    const packs = Object.values(MAP_WORLDS)
      .filter((world) => world.comingSoon !== true && world.usesVideoAssets !== false)
      .map((world) => {
        const pack = normalizeAssetPackState(state.assetPacks?.[world.id]);
        const sourceAvailable = assetPackHasDownloadSource(world.id, pack);
        const summary = assetPackSummary(world.id, state.assetPacks, { sourceAvailable, bridgeAvailable: canUseAssetPackBridge(), levelVideoStates: state.levelVideos });
        return { world, pack, sourceAvailable, summary };
      });
    const byStatus = (status) => packs.filter((item) => item.pack.status === status);
    const averageProgress = (items) => {
      if (!items.length) return 0;
      const total = items.reduce((sum, item) => sum + item.pack.progress, 0);
      return clampAssetPackProgress(total / items.length);
    };
    const total = Math.max(1, packs.length);
    const totalPlayable = packs.reduce((sum, item) => sum + item.summary.playableCount, 0);
    const totalLevels = packs.reduce((sum, item) => sum + item.summary.totalLevels, 0);
    const currentMapId = normalizeMapWorldId(state.preferences?.mapWorld);
    const currentPack = packs.find((item) => item.world.id === currentMapId) || packs[0];
    const playableText = currentPack?.summary.playableText || `已可玩 ${totalPlayable}/${totalLevels} 关`;
    const ready = byStatus('ready');
    const downloading = byStatus('downloading');
    const queued = byStatus('queued');
    const paused = byStatus('paused');
    const failed = byStatus('failed');
    const stale = byStatus('stale');
    const blocked = packs.filter((item) => !item.sourceAvailable && item.pack.status !== 'ready');
    const pending = packs.filter((item) => !['ready', 'downloading', 'queued', 'paused', 'failed', 'stale'].includes(item.pack.status));
    const firstName = (items) => items.length === 1 ? items[0].world.title : `${items.length} 张地图`;
    const needsAttention = Boolean(failed.length || stale.length || blocked.length || pending.length || paused.length);

    if (downloading.length) {
      const progress = averageProgress(downloading);
      return { status: 'downloading', progress, playableText, label: `下载中 ${progress}%`, detail: firstName(downloading), live: true, attention: needsAttention };
    }
    if (queued.length) {
      const progress = averageProgress(queued);
      return { status: 'queued', progress, playableText, label: progress ? `下载中 ${progress}%` : '下载中', detail: firstName(queued), live: true, attention: needsAttention };
    }
    if (paused.length) {
      const progress = averageProgress(paused);
      return { status: 'paused', progress, playableText, label: `已暂停 ${progress}%`, detail: firstName(paused), live: false, attention: true };
    }
    if (failed.length) {
      return { status: 'failed', progress: averageProgress(failed), playableText, label: '下载失败', detail: `${failed.length} 张地图可重试`, live: false, attention: true };
    }
    if (stale.length) {
      return { status: 'stale', progress: averageProgress(stale), playableText, label: '有新视频', detail: firstName(stale), live: false, attention: true };
    }
    if (blocked.length) {
      return { status: 'not-installed', progress: 0, playableText, label: '未下载', detail: '点开下载', live: false, attention: true };
    }
    if (pending.length) {
      return { status: 'not-installed', progress: 0, playableText, label: '未下载', detail: firstName(pending), live: false, attention: true };
    }
    return { status: 'ready', progress: 100, playableText, label: '已完成', detail: `${packs.length} 张地图`, live: false, attention: false };
  }

  function assetPackStatusButtonMarkup(summary = assetPackOverview()) {
    const liveClass = summary.live ? ' is-live' : '';
    const attentionClass = summary.attention ? ' has-attention' : '';
    const attentionDot = summary.attention ? '<span class="map-pack-attention-dot" aria-hidden="true"></span>' : '';
    const playableText = escapeHtml(summary.playableText);
    const stateText = escapeHtml(`${summary.label}${summary.detail ? ` · ${summary.detail}` : ''}`);
    return `
      <button class="map-pack-btn is-${summary.status}${liveClass}${attentionClass}" type="button" data-asset-pack-panel aria-label="关卡视频，${playableText}，${stateText}" title="查看关卡视频" style="--pack-progress:${summary.progress}%">
        ${attentionDot}
        <span class="map-pack-progress-ring" aria-hidden="true"><span class="map-pack-progress-core">${icons.download}</span></span>
        <span class="map-pack-status-copy"><strong>${playableText}</strong><small>${stateText}</small></span>
      </button>`;
  }

  function globalUpdateButtonMarkup(context = 'map') {
    const contextClass = context === 'level' ? ' global-update-btn--level' : '';
    return `
      <button class="map-pack-btn global-update-btn${contextClass}" type="button" data-check-update data-global-update data-check-update-status="idle" aria-busy="false" aria-label="检查内容更新" title="检查内容更新">
        <span class="map-pack-progress-ring global-update-ring" aria-hidden="true"><span class="map-pack-progress-core">${icons.mapSwitch}</span></span>
        <span class="map-pack-status-copy global-update-copy"><strong>内容更新</strong><small data-check-update-note>检查课程资源</small></span>
        <span class="global-update-state" data-check-update-state aria-hidden="true">检查</span>
      </button>`;
  }

  function refreshAssetPackDialog() {
    const list = assetPackDialog?.querySelector('[data-asset-pack-list]');
    if (list) list.innerHTML = assetPackRowsMarkup();
  }

  function refreshAssetPackEntrances() {
    const activeWorld = MAP_WORLDS[normalizeMapWorldId(state.preferences?.mapWorld)];
    document.querySelectorAll('[data-asset-pack-status]').forEach((host) => {
      host.innerHTML = activeWorld?.usesVideoAssets === false ? '' : assetPackStatusButtonMarkup();
    });
  }

  function closeAssetPackDialog() {
    if (assetPackDialog && assetPackDialog.open) assetPackDialog.close();
  }

  function openAssetPackDialog(trigger = null) {
    if (assetPackDialog) {
      if (assetPackDialog.open) return;
      assetPackDialog.remove();
    }

    assetPackDialog = document.createElement('dialog');
    assetPackDialog.className = 'map-switch-dialog asset-pack-dialog';
    assetPackDialog.setAttribute('role', 'dialog');
    assetPackDialog.setAttribute('aria-modal', 'true');
    assetPackDialog.setAttribute('aria-labelledby', 'asset-pack-dialog-title');
    assetPackDialog.__returnFocus = trigger;
    assetPackDialog.innerHTML = [
      '<div class="map-switch-card asset-pack-dialog-card">',
      '<button class="access-dialog-close" type="button" data-asset-pack-close aria-label="关闭窗口">',
      '<svg aria-hidden="true" viewBox="0 0 32 32"><path d="m9 9 14 14M23 9 9 23"/></svg></button>',
      '<div class="map-switch-hero" aria-hidden="true">',
      icons.assetPack,
      '</div>',
      '<p class="paywall-eyebrow">关卡视频</p>',
      '<h2 id="asset-pack-dialog-title">关卡视频下载</h2>',
      `<p>每张地图前 ${FREE_LEVEL_COUNT} 关打开就能玩。后面的关卡视频会按关卡顺序在 iPad 后台下载，可以暂停，也可以继续。这里能看到每张地图的可玩进度。</p>`,
      `<ul class="asset-pack-list" data-asset-pack-list aria-label="全部地图关卡视频">${assetPackRowsMarkup()}</ul>`,
      '</div>',
    ].join('');

    const dialog = assetPackDialog;
    document.body.appendChild(dialog);
    dialog.querySelectorAll('[data-asset-pack-close]').forEach((button) => {
      button.addEventListener('click', closeAssetPackDialog);
    });
    dialog.addEventListener('click', (event) => {
      const assetPackBtn = event.target.closest('[data-asset-pack-action]');
      if (handleAssetPackActionClick(assetPackBtn, event)) return;
      if (event.target === dialog) closeAssetPackDialog();
    });
    dialog.addEventListener('close', () => {
      const returnTarget = dialog.__returnFocus;
      dialog.remove();
      assetPackDialog = null;
      if (returnTarget && returnTarget.isConnected) returnTarget.focus();
    }, { once: true });

    dialog.showModal();
    requestAnimationFrame(() => dialog.querySelector('[data-asset-pack-close]')?.focus());
  }

  function handleAssetPackAction(action, worldId, trigger = null) {
    const toastHost = trigger?.closest('dialog');
    const delivered = postAssetPackMessage(action, worldId);
    const mapId = normalizeMapWorldId(worldId);
    const current = normalizeAssetPackState(state.assetPacks?.[mapId]);
    state.assetPacks = normalizeAssetPackStates({
      ...state.assetPacks,
      [mapId]: { ...current, status: action === 'pause' ? 'paused' : 'queued', updatedAt: Date.now() },
    });
    persistAssetPackStates();
    showToast(action === 'pause' ? '已请求暂停下载' : delivered ? '已交给 iPad 后台下载' : '已加入下载队列', toastHost);
    if (routeFromHash().type === 'mine') renderMine();
    refreshAssetPackDialog();
    refreshAssetPackEntrances();
  }

  function handleAssetPackActionClick(assetPackBtn, event = null) {
    if (!assetPackBtn) return false;
    event?.preventDefault();
    if (assetPackBtn.disabled || !assetPackBtn.dataset.assetPackAction) return true;
    handleAssetPackAction(assetPackBtn.dataset.assetPackAction, assetPackBtn.dataset.assetPackWorld, assetPackBtn);
    return true;
  }

  window.babyIslandAssetPackEvent = function babyIslandAssetPackEvent(event) {
    const mapId = normalizeMapWorldId(event?.mapId || event?.worldId);
    state.assetPacks = normalizeAssetPackStates({
      ...state.assetPacks,
      [mapId]: {
        ...state.assetPacks?.[mapId],
        ...event,
        updatedAt: Date.now(),
      },
    });
    persistAssetPackStates();
    const route = routeFromHash();
    if (route.type === 'mine') renderMine();
    refreshAssetPackDialog();
    refreshAssetPackEntrances();
  };

  window.babyIslandLevelVideoEvent = function babyIslandLevelVideoEvent(event) {
    const mapId = normalizeMapWorldId(event?.mapId || event?.worldId);
    const levelId = Number(event?.levelId) || 0;
    const level = levelsForMapWorld(mapId).find((item) => item.id === levelId);
    if (!level) return;
    setLevelVideoState(level, event);
    const route = routeFromHash();
    refreshAssetPackDialog();
    refreshAssetPackEntrances();
    if (route.type === 'level' && route.id === levelId && mapId === normalizeMapWorldId(state.preferences.mapWorld)) {
      if (levelVideoStateFor(level).status === 'ready' && levelVideoSourceFor(level)) renderDetail(level);
      else refreshLevelVideoDownloadPanel(level);
    }
  };

  function nudgeMustLogin(dialog) {
    const host = dialog || loginDialogEl;
    showToast('请先登录后继续探险', host);
    const card = host && host.querySelector('.login-card');
    if (!card) return;
    card.classList.remove('is-nudge');
    try { void card.offsetWidth; } catch (_) {}
    card.classList.add('is-nudge');
    window.setTimeout(() => {
      try { card.classList.remove('is-nudge'); } catch (_) {}
    }, 520);
  }

  // ─── 强制登录门禁（登录即注册）Animal-Island-UI ─────────────────
  const LAST_STAY_KEY = 'baby-island-last-stay';
  let loginDialogEl = null;
  let loginDialogResolver = null;
  let loginCodeTimer = null;
  let loginCodeRemain = 0;
  let authBootStarted = false;
  let authGatePassed = false;

  function authApi() {
    return (typeof window !== 'undefined' && window.babyIslandApi) || null;
  }

  function rememberLastStay(route = routeFromHash()) {
    try {
      const payload = {
        hash: location.hash || '#map',
        routeType: route && route.type ? route.type : 'map',
        mapWorld: state.preferences.mapWorld,
        mathMapLevelId: state.preferences.mapWorld === 'math'
          ? normalizeMathMapLevelId(state.mathMapLevelId, state.progress.unlockedThrough)
          : null,
        unlockedThrough: state.progress.unlockedThrough,
        at: Date.now(),
      };
      localStorage.setItem(LAST_STAY_KEY, JSON.stringify(payload));
    } catch (_) { /* private mode */ }
  }

  function resumeLastStay() {
    try {
      const raw = localStorage.getItem(LAST_STAY_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return false;
      if (data.mapWorld) {
        const nextWorld = normalizeMapWorldId(data.mapWorld);
        if (nextWorld && nextWorld !== state.preferences.mapWorld) {
          state.preferences.mapWorld = nextWorld;
          try {
            localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(state.preferences));
          } catch (_) {}
        }
        if (nextWorld === 'math' && data.mathMapLevelId) {
          state.mathMapLevelId = normalizeMathMapLevelId(data.mathMapLevelId, state.progress.unlockedThrough);
        }
      }
      if (data.hash && typeof data.hash === 'string' && data.hash.startsWith('#') && data.hash !== location.hash) {
        history.replaceState(null, '', data.hash);
        render();
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  function setAuthLock(on) {
    try {
      document.body.classList.toggle('auth-lock', !!on);
      document.body.classList.toggle('auth-required', !!on);
    } catch (_) {}
  }

  function whenSplashDone() {
    return new Promise((resolve) => {
      if (typeof document === 'undefined') return resolve();
      if (!document.getElementById('app-splash')) return resolve();
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        window.removeEventListener('app-splash-finished', finish);
        resolve();
      };
      window.addEventListener('app-splash-finished', finish, { once: true });
      // 硬超时：防止 splash 卡死挡住登录
      window.setTimeout(finish, 8200);
    });
  }

  function normalizePhoneInput(value) {
    return String(value || '').replace(/\D/g, '').slice(0, 11);
  }

  function setLoginError(msg) {
    const err = loginDialogEl && loginDialogEl.querySelector('[data-login-error]');
    if (!err) return;
    if (msg) {
      err.textContent = msg;
      err.hidden = false;
    } else {
      err.textContent = '';
      err.hidden = true;
    }
  }

  function setLoginBusy(busy) {
    if (!loginDialogEl) return;
    loginDialogEl.classList.toggle('is-busy', !!busy);
    loginDialogEl.querySelectorAll('input, button').forEach((el) => {
      if (el.matches('[data-login-send-code]') && loginCodeRemain > 0) return;
      el.disabled = !!busy;
    });
  }

  function updateSendCodeButton() {
    const btn = loginDialogEl && loginDialogEl.querySelector('[data-login-send-code]');
    if (!btn) return;
    if (loginCodeRemain > 0) {
      btn.disabled = true;
      btn.textContent = `${loginCodeRemain}s 后重发`;
      btn.setAttribute('aria-disabled', 'true');
    } else {
      btn.disabled = false;
      btn.textContent = '获取验证码';
      btn.removeAttribute('aria-disabled');
    }
  }

  function startSendCodeCountdown(seconds) {
    clearInterval(loginCodeTimer);
    loginCodeRemain = seconds;
    updateSendCodeButton();
    loginCodeTimer = setInterval(() => {
      loginCodeRemain -= 1;
      if (loginCodeRemain <= 0) {
        clearInterval(loginCodeTimer);
        loginCodeTimer = null;
        loginCodeRemain = 0;
      }
      updateSendCodeButton();
    }, 1000);
  }

  function closeLoginDialog(result) {
    clearInterval(loginCodeTimer);
    loginCodeTimer = null;
    loginCodeRemain = 0;
    if (loginDialogEl) {
      try { loginDialogEl.close(); } catch (_) {}
      loginDialogEl.remove();
      loginDialogEl = null;
    }
    setAuthLock(false);
    const resolver = loginDialogResolver;
    loginDialogResolver = null;
    if (resolver) resolver(result || { ok: true });
  }

  function openLoginDialog(options = {}) {
    const required = options.required !== false; // 默认强制
    const api = authApi();

    // 已登录则直接过
    if (api?.getToken && api.getToken()) {
      return api.checkSession().then((session) => {
        if (session?.isLoggedIn) {
          authGatePassed = true;
          return { ok: true, already: true, user: session.user };
        }
        return openLoginDialogForce(required);
      }).catch(() => openLoginDialogForce(required));
    }
    return openLoginDialogForce(required);
  }

  function openLoginDialogForce(required) {
    if (loginDialogEl && loginDialogResolver) {
      return new Promise((resolve) => {
        const prev = loginDialogResolver;
        loginDialogResolver = (result) => {
          prev(result);
          resolve(result);
        };
      });
    }

    setAuthLock(true);
    // 复用已有 dialog
    document.querySelectorAll('dialog.login-dialog').forEach((el) => el.remove());

    const dialog = document.createElement('dialog');
    dialog.className = 'login-dialog' + (required ? ' is-required' : '');
    dialog.setAttribute('aria-labelledby', 'login-dialog-title');
    dialog.setAttribute('aria-modal', 'true');
    dialog.innerHTML = [
      '<div class="login-card">',
      '  <div class="login-hero" aria-hidden="true">',
      '    <svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="28" fill="rgba(25,200,185,0.18)"/><path d="M22 36c2.8 4.5 8 7 10 7s7.2-2.5 10-7" stroke="#19c8b9" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="28" r="2.6" fill="#794f27"/><circle cx="40" cy="28" r="2.6" fill="#794f27"/></svg>',
      '  </div>',
      '  <p class="login-eyebrow">嗨洛塔少儿启蒙</p>',
      '  <h2 id="login-dialog-title">登录 / 注册</h2>',
      '  <p class="login-sub">手机号验证码一键登录，新号码自动注册</p>',
      '  <form class="login-form" data-login-form novalidate>',
      '    <label class="login-field">',
      '      <span class="login-label">手机号</span>',
      '      <input class="login-input" type="tel" name="phone" inputmode="numeric" autocomplete="tel" maxlength="11" placeholder="请输入 11 位手机号" data-login-phone required />',
      '    </label>',
      '    <div class="login-code-row">',
      '      <label class="login-field login-field-code">',
      '        <span class="login-label">验证码</span>',
      '        <input class="login-input" type="text" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6 位验证码" data-login-code required />',
      '      </label>',
      '      <button class="login-send-code" type="button" data-login-send-code>获取验证码</button>',
      '    </div>',
      '    <p class="login-error" data-login-error role="alert" hidden></p>',
      '    <p class="login-hint">未注册的手机号验证后将自动注册。本地可填任意 11 位手机号 + 任意 4–6 位验证码</p>',
      '    <button class="login-submit" type="submit" data-login-submit>开始探险</button>',
      '  </form>',
      '</div>',
    ].join('');

    document.body.appendChild(dialog);
    loginDialogEl = dialog;

    const phoneInput = dialog.querySelector('[data-login-phone]');
    const codeInput = dialog.querySelector('[data-login-code]');
    const form = dialog.querySelector('[data-login-form]');
    const sendBtn = dialog.querySelector('[data-login-send-code]');

    phoneInput.addEventListener('input', () => {
      const next = normalizePhoneInput(phoneInput.value);
      if (phoneInput.value !== next) phoneInput.value = next;
      setLoginError('');
    });
    codeInput.addEventListener('input', () => {
      codeInput.value = String(codeInput.value || '').replace(/\D/g, '').slice(0, 6);
      setLoginError('');
    });

    sendBtn.addEventListener('click', async () => {
      const phone = normalizePhoneInput(phoneInput.value);
      if (!/^\d{11}$/.test(phone)) {
        setLoginError('请输入 11 位手机号');
        phoneInput.focus();
        return;
      }
      const api = authApi();
      if (!api?.sendVerificationCode) {
        setLoginError('登录服务未就绪，请刷新重试');
        return;
      }
      setLoginBusy(true);
      setLoginError('');
      try {
        const data = await api.sendVerificationCode(phone);
        startSendCodeCountdown(60);
        const devCode = api.getLastDevCode && api.getLastDevCode();
        if (devCode) {
          codeInput.value = String(devCode);
          setLoginError('');
          showToast(`开发验证码：${devCode}`);
        } else {
          showToast('验证码已发送');
        }
        codeInput.focus();
        if (data && data.debugCode && !codeInput.value) {
          codeInput.value = String(data.debugCode);
        }
      } catch (err) {
        setLoginError((err && err.message) || '验证码发送失败，请稍后重试');
      } finally {
        setLoginBusy(false);
        updateSendCodeButton();
      }
    });

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const phone = normalizePhoneInput(phoneInput.value);
      const code = String(codeInput.value || '').replace(/\D/g, '');
      if (!/^\d{11}$/.test(phone)) {
        setLoginError('请输入 11 位手机号');
        phoneInput.focus();
        return;
      }
      if (!code || code.length < 4) {
        setLoginError('请输入验证码');
        codeInput.focus();
        return;
      }
      const api = authApi();
      if (!api?.verifyCode) {
        setLoginError('登录服务未就绪，请刷新重试');
        return;
      }
      setLoginBusy(true);
      setLoginError('');
      try {
        const data = await api.verifyCode(phone, code);
        authGatePassed = true;
        showToast('登录成功');
        closeLoginDialog({ ok: true, user: data && data.user });
      } catch (err) {
        setLoginError((err && err.message) || '验证码错误或已过期，请重试');
        setLoginBusy(false);
        codeInput.focus();
      }
    });

    // 强制：拦截 Esc / 点遮罩关闭
    dialog.addEventListener('cancel', (ev) => {
      if (required) {
        ev.preventDefault();
        nudgeMustLogin(dialog);
      }
    });
    // 点登录框外（遮罩 / 空白区）：强制提示必须先登录，不关闭
    dialog.addEventListener('click', (ev) => {
      if (!required) return;
      const card = dialog.querySelector('.login-card');
      // 全屏透明 dialog：点在 card 外；或点到 dialog 本体 / 挂在 dialog 上的 toast
      const clickedOutsideCard = !card || !card.contains(ev.target);
      if (clickedOutsideCard) {
        // 点 toast 本身不重复 nudge 动画过猛，但仍刷新文案
        ev.preventDefault();
        nudgeMustLogin(dialog);
      }
    });

    try {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    } catch (_) {
      dialog.setAttribute('open', '');
    }
    window.setTimeout(() => phoneInput && phoneInput.focus(), 60);

    return new Promise((resolve) => {
      loginDialogResolver = resolve;
    });
  }

  async function runAuthBootGate() {
    if (authBootStarted) return;
    authBootStarted = true;
    try { document.body.classList.add('auth-checking'); } catch (_) {}
    await whenSplashDone();
    const api = authApi();
    if (!(api && api.getToken && api.getToken())) setAuthLock(true);
    try {
      if (api?.checkSession) {
        const session = await api.checkSession();
        if (session?.isLoggedIn) {
          authGatePassed = true;
          try { document.body.classList.remove('auth-checking'); } catch (_) {}
          setAuthLock(false);
          await hydrateLearningStateFromBackend();
          resumeLastStay();
          rememberLastStay();
          return;
        }
      }
    } catch (_) { /* fall through to login */ }

    try { document.body.classList.remove('auth-checking'); } catch (_) {}
    setAuthLock(true);
    await openLoginDialog({ required: true });
    await hydrateLearningStateFromBackend();
    resumeLastStay();
    rememberLastStay();
  }

  // 暴露给控制台/测试
  window.openLoginDialog = openLoginDialog;
  window.runAuthBootGate = runAuthBootGate;


  function updateNetworkStatus(restored = false) {
    if (!networkStatus) return;
    if (appUpdateReady) return;
    clearTimeout(networkStatusTimer);
    const text = networkStatusText(navigator.onLine, restored);
    if (!text) {
      networkStatus.hidden = true;
      return;
    }
    networkStatus.textContent = text;
    networkStatus.dataset.state = navigator.onLine ? 'online' : 'offline';
    networkStatus.hidden = false;
    if (navigator.onLine) networkStatusTimer = setTimeout(() => { networkStatus.hidden = true; }, 1800);
  }

  function showAppUpdateReady() {
    if (!networkStatus || appUpdateReady) return;
    appUpdateReady = true;
    clearTimeout(networkStatusTimer);
    networkStatus.dataset.state = 'update';
    networkStatus.innerHTML = '<span>内容更新已准备好</span><button class="network-refresh-button" type="button" data-app-refresh>立即更新</button>';
    networkStatus.hidden = false;
  }

  function applyAppUpdate() {
    if (appUpdateApplying) return;
    appUpdateApplying = true;
    const waitingWorker = serviceWorkerRegistration?.waiting;
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setTimeout(() => location.reload(), 1200);
      return;
    }
    location.reload();
  }

  function copySupportFeedback(form) {
    if (!form) return;
    const input = form.querySelector('[data-support-message]');
    const error = form.querySelector('[data-support-error]');
    const status = form.querySelector('[data-support-status]');
    const message = input.value.trim();
    const validation = validateSupportMessage(message);
    if (validation) {
      error.textContent = validation;
      error.hidden = false;
      status.hidden = true;
      input.focus();
      return;
    }
    const report = learningReport(state.progress, state.learningActivity, levels);
    const text = supportFeedbackText(message, {
      currentLevel: state.progress.unlockedThrough,
      completed: report.completed,
      userAgent: navigator.userAgent,
    });
    saveSupportDraft(message);
    if (!navigator.clipboard?.writeText || !window.isSecureContext) {
      status.textContent = '当前浏览器不能自动复制，请手动长按复制。';
      status.hidden = false;
      error.hidden = true;
      input.select();
      showToast('请手动复制反馈内容');
      return;
    }
    navigator.clipboard.writeText(text)
      .then(() => {
        error.hidden = true;
        status.textContent = '已复制反馈内容，可粘贴给客服或家长。';
        status.hidden = false;
        showToast('反馈内容已复制');
      })
      .catch(() => {
        status.textContent = '复制失败，请手动长按复制。';
        status.hidden = false;
        error.hidden = true;
      });
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator) || !canRegisterServiceWorker(location.protocol)) return;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!appUpdateApplying) return;
      location.reload();
    });
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js?v=71').then((registration) => {
        serviceWorkerRegistration = registration;
        // 每次打开应用都主动检查一次热更新（浏览器原生检查有 24h 间隔，不够用）
        registration.update().catch(() => {});
        if (registration.waiting && navigator.serviceWorker.controller) showAppUpdateReady();
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) showAppUpdateReady();
          });
        });
      }).catch(() => {});
    });
  }

  function setCheckUpdateFeedback(status, message) {
    const buttons = document.querySelectorAll('[data-check-update]');
    const labels = {
      idle: '检查',
      checking: '检查中',
      current: '最新',
      ready: '更新',
      retry: '重试',
      unsupported: '不可用',
    };
    document.querySelectorAll('[data-check-update-note]').forEach((note) => {
      note.textContent = message;
    });
    buttons.forEach((button) => {
      const state = button.querySelector('[data-check-update-state]');
      button.dataset.checkUpdateStatus = status;
      button.disabled = status === 'checking';
      button.setAttribute('aria-busy', String(status === 'checking'));
      if (state) state.textContent = labels[status] || labels.idle;
    });
  }

  // 我的页"检查内容更新"：手动触发一次 H5 资源检查，并给按钮即时状态反馈
  function checkAppUpdate() {
    const finish = (status, message, toastMessage = message) => {
      setCheckUpdateFeedback(status, message);
      showToast(toastMessage);
    };
    if (!('serviceWorker' in navigator) || !canRegisterServiceWorker(location.protocol)) {
      finish('unsupported', '当前环境不支持自动更新');
      return;
    }
    if (!serviceWorkerRegistration) {
      finish('retry', '更新服务尚未就绪，请稍后重试');
      return;
    }
    if (appUpdateReady) {
      showAppUpdateReady();
      finish('ready', '内容更新已准备好，点顶部「立即更新」生效', '内容更新已准备好');
      return;
    }
    setCheckUpdateFeedback('checking', '正在检查更新…');
    showToast('正在检查内容更新');
    serviceWorkerRegistration.update().then(() => {
      // updatefound → installed 是异步的，留一个短窗口再下结论
      setTimeout(() => {
        if (appUpdateReady) {
          finish('ready', '发现内容更新，点顶部「立即更新」生效', '发现内容更新');
          return;
        }
        finish('current', '当前已是最新版本');
      }, 900);
    }).catch((err) => {
      // InvalidStateError = SW 还没激活完（多为首次打开），不是网络问题，文案要区分
      finish('retry', err && err.name === 'InvalidStateError'
        ? '更新服务尚未就绪，请稍后重试'
        : '网络不可用，请稍后重试');
    });
  }

  function closeMapSwitchDialog() {
    if (mapSwitchDialog && mapSwitchDialog.open) mapSwitchDialog.close();
  }

  function openMapSwitchDialog(trigger = null) {
    if (mapSwitchDialog) {
      if (mapSwitchDialog.open) return;
      mapSwitchDialog.remove();
    }

    const activeWorldId = normalizeMapWorldId(state.preferences.mapWorld);
    const worldArt = {
      ocean: 'assets/ocean/covers/ocean-world-cover-v1.webp',
      // 专用 4:3 世界卡面，勿用关卡抠图顶替
      desert: 'assets/egypt-map/covers/desert-world-cover-v1.webp',
      math: 'assets/math-map/covers/math-desk-cover-v1.webp',
      math58: 'assets/math-map/covers/math-garden-cover-v1.webp',
      math912: 'assets/math-map/covers/math-star-tower-cover-v1.webp',
    };
    // 每个世界的适龄段与一句话卖点：帮家长 1 秒判断该选哪张图
    const worldMeta = {
      ocean: { ageRange: '3-5', tagline: '启蒙磨耳朵 · 字母单词起步' },
      desert: { ageRange: '6-8', tagline: '进阶挑战 · 句型对话冲刺' },
      math: { ageRange: '3-5', tagline: '数量感知 · 给一年级打基础' },
      math58: { ageRange: '5-8', tagline: '运算比较 · 低年级衔接' },
      math912: { ageRange: '9-12', tagline: '逻辑应用 · 高年级挑战' },
      castle: { ageRange: '9-12', tagline: '章节冒险 · 读写表达飞跃' },
    };
    // 按家长设置的宝宝年龄给出推荐世界（设置项目前覆盖 3-6 岁，6 岁进沙漠段；9+ 岁等城堡开放）
    const childAge = Number(normalizeChildProfile(state.preferences).childAge) || 4;
    const recommendedWorldId = childAge >= 6 ? 'desert' : 'ocean';

    const mathPlaceholder = '<span class="map-world-art-placeholder map-world-art-placeholder--math"><svg viewBox="0 0 48 48"><rect x="8" y="10" width="32" height="28" rx="6"/><path d="M16 20h16M16 28h10"/><circle cx="34" cy="30" r="5"/></svg></span>';
    const castlePlaceholder = '<span class="map-world-art-placeholder"><svg viewBox="0 0 24 24"><path d="M12 2 4 6v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V6l-8-4Z"/><path d="M12 8v4"/><path d="m12 16 .01 0"/></svg></span>';
    const worldOptionMarkup = (world) => {
      const isComingSoon = world.comingSoon === true;
      const isActive = !isComingSoon && world.id === activeWorldId;
      const isRecommended = !isComingSoon && world.id === recommendedWorldId;
      // state.progressByWorld 存的是按世界隔离的进度；旧扁平 progress 只迁移到 ocean。
      // 旧数据可能是单世界扁平 progress，normalizeProgress 会兜底。
      const totalLevels = levelsForMapWorld(world.id).length || DISPLAY_LEVEL_COUNT;
      const worldProgress = normalizeProgress(state.progressByWorld?.[world.id], totalLevels);
      const currentLevel = isComingSoon ? 0 : Math.min(Math.max(worldProgress.unlockedThrough, 1), totalLevels);
      const meta = worldMeta[world.id] || { ageRange: '3-5', tagline: '启蒙闯关' };
      const art = worldArt[world.id];
      const placeholder = world.zone === 'math' ? mathPlaceholder : castlePlaceholder;
      const ariaLabel = isComingSoon
        ? `${world.title}，适合 ${meta.ageRange} 岁，${meta.tagline}，敬请期待`
        : `${world.title}，适合 ${meta.ageRange} 岁，${meta.tagline}，共 ${totalLevels} 关，已闯到第 ${currentLevel} 关${isActive ? '，正在游玩' : ''}${isRecommended ? '，按宝宝年龄推荐' : ''}`;
      return `
      <button class="map-world-option map-world-option--${world.id}${isActive ? ' is-active' : ''}${isComingSoon ? ' is-coming-soon' : ''}" type="button" role="listitem" ${isComingSoon ? 'disabled' : `data-map-world="${world.id}" aria-pressed="${isActive ? 'true' : 'false'}"`} aria-label="${ariaLabel}">
        <span class="map-world-art" aria-hidden="true">
          ${art ? `<img src="${assetHref(art)}" alt="" loading="lazy">` : placeholder}
          ${isActive ? '<span class="map-world-playing" aria-hidden="true">玩</span>' : ''}
          ${isRecommended ? '<span class="map-world-recommend" aria-hidden="true">推荐</span>' : ''}
          ${isComingSoon ? '<span class="map-world-soon-badge" aria-hidden="true">敬请期待</span>' : ''}
        </span>
        <span class="map-world-copy">
          <strong>${world.title}</strong>
          <span class="map-world-age-block">
            <span class="map-world-age-num">${meta.ageRange}<small>岁</small></span>
            <span class="map-world-age-label">适合年龄</span>
          </span>
          <small class="map-world-tagline">${meta.tagline}</small>
          ${isComingSoon ? '<small class="map-world-soon-note">新地图制作中，上线后第一时间通知你</small>' : `<span class="map-world-progress" aria-hidden="true"><span style="width:${Math.max(2, Math.round((currentLevel / totalLevels) * 100))}%"></span></span>
          <small class="map-world-subinfo">第 ${currentLevel}/${totalLevels} 关</small>`}
        </span>
        <span class="map-world-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7"/></svg></span>
      </button>`;
    };
    const mapZones = [
      { id: 'english', title: '英语区', note: '单词、句型、听说闯关', worldIds: ['ocean', 'desert', 'castle'] },
      { id: 'math', title: '数学区', note: '数感、比较、分类闯关', worldIds: ['math', 'math58', 'math912'] },
    ];
    const activeZoneId = MAP_WORLDS[activeWorldId]?.zone === 'math' ? 'math' : 'english';
    const zoneTabs = mapZones.map((zone) => `
      <button class="map-zone-tab" id="map-zone-tab-${zone.id}" type="button" role="tab" data-map-zone-tab="${zone.id}" aria-selected="${zone.id === activeZoneId ? 'true' : 'false'}" aria-controls="map-zone-panel-${zone.id}" tabindex="${zone.id === activeZoneId ? '0' : '-1'}">
        <strong>${zone.title}</strong>
        <small>${zone.note}</small>
      </button>`).join('');
    const worldGroups = mapZones.map((group) => `
      <section class="map-world-group map-world-group--${group.id} map-zone-panel" id="map-zone-panel-${group.id}" data-map-zone-panel="${group.id}" role="tabpanel" aria-labelledby="map-zone-tab-${group.id}"${group.id === activeZoneId ? '' : ' hidden'}>
        <div class="map-world-group-heading">
          <h3 id="map-world-group-${group.id}">${group.title}</h3>
          <small>${group.note}</small>
        </div>
        <div class="map-world-options" role="list">${group.worldIds.map((worldId) => MAP_WORLDS[worldId]).filter(Boolean).map(worldOptionMarkup).join('')}</div>
      </section>`).join('');

    mapSwitchDialog = document.createElement('dialog');
    mapSwitchDialog.className = 'map-switch-dialog map-switch-picker-dialog';
    mapSwitchDialog.setAttribute('role', 'dialog');
    mapSwitchDialog.setAttribute('aria-modal', 'true');
    mapSwitchDialog.setAttribute('aria-labelledby', 'map-switch-title');
    mapSwitchDialog.__returnFocus = trigger;

    mapSwitchDialog.innerHTML = [
      '<div class="map-switch-card map-switch-picker-card">',
      '<button class="access-dialog-close" type="button" data-map-switch-close aria-label="关闭窗口">',
      '<svg aria-hidden="true" viewBox="0 0 32 32"><path d="m9 9 14 14M23 9 9 23"/></svg></button>',
      '<div class="map-switch-hero" aria-hidden="true">',
      icons.mapSwitch,
      '</div>',
      '<p class="paywall-eyebrow">切换地图</p>',
      '<h2 id="map-switch-title">选择冒险世界</h2>',
      '<p>先切学习区，再选地图。</p>',
      `<div class="map-zone-tabs" role="tablist" aria-label="学习区">${zoneTabs}</div>`,
      `<div class="map-world-groups">${worldGroups}</div>`,
      '</div>',
    ].join('');

    const dialog = mapSwitchDialog;
    document.body.appendChild(dialog);
    dialog.querySelectorAll('[data-map-switch-close]').forEach((button) => {
      button.addEventListener('click', closeMapSwitchDialog);
    });
    dialog.querySelectorAll('[data-map-zone-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        const nextZoneId = button.dataset.mapZoneTab;
        dialog.querySelectorAll('[data-map-zone-tab]').forEach((tab) => {
          const selected = tab.dataset.mapZoneTab === nextZoneId;
          tab.setAttribute('aria-selected', selected ? 'true' : 'false');
          tab.tabIndex = selected ? 0 : -1;
        });
        dialog.querySelectorAll('[data-map-zone-panel]').forEach((panel) => {
          panel.hidden = panel.dataset.mapZonePanel !== nextZoneId;
        });
      });
    });
    dialog.querySelectorAll('[data-map-world]').forEach((button) => {
      button.addEventListener('click', () => {
        const nextWorldId = normalizeMapWorldId(button.dataset.mapWorld);
        state.preferences.mapWorld = nextWorldId;
        state.progress = state.progressByWorld[nextWorldId] || normalizeProgress(null, levelsForMapWorld(nextWorldId).length || DISPLAY_LEVEL_COUNT);
        state.progressByWorld[nextWorldId] = state.progress;
        try { localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(state.preferences)); } catch {}
        scheduleLearningSync();
        closeMapSwitchDialog();
        renderMap(`${MAP_WORLDS[nextWorldId].title}已打开`);
        syncMapMusic();
      });
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeMapSwitchDialog();
    });
    dialog.addEventListener('close', () => {
      const returnTarget = dialog.__returnFocus;
      dialog.remove();
      mapSwitchDialog = null;
      if (returnTarget && returnTarget.isConnected) returnTarget.focus();
    }, { once: true });

    dialog.showModal();
    requestAnimationFrame(() => dialog.querySelector('[data-map-switch-close]')?.focus());
  }

  function openReleaseUpdateDialog(updateInfo) {
    if (!updateInfo) return;
    // 启动页未结束时绝不盖在 splash 上（含动画离场）
    if (document.getElementById('app-splash') || document.body.classList.contains('splash-lock')) {
      whenSplashDone().then(() => openReleaseUpdateDialog(updateInfo));
      return;
    }
    if (document.querySelector('dialog[open]')) {
      setTimeout(() => openReleaseUpdateDialog(updateInfo), 1200);
      return;
    }
    if (releaseUpdateDialog) {
      if (releaseUpdateDialog.open) return;
      releaseUpdateDialog.remove();
    }
    if (!updateInfo.force && promptedReleaseVersion === updateInfo.latestVersion) return;
    if (!updateInfo.force) promptedReleaseVersion = updateInfo.latestVersion;

    releaseUpdateDialog = document.createElement('dialog');
    releaseUpdateDialog.className = 'map-switch-dialog release-update-dialog';
    releaseUpdateDialog.setAttribute('role', 'dialog');
    releaseUpdateDialog.setAttribute('aria-modal', 'true');
    releaseUpdateDialog.setAttribute('aria-labelledby', 'release-update-title');

    const mustBlockForUpdate = canForceReleaseUpdate(updateInfo, window);
    const closeButton = mustBlockForUpdate ? '' : [
      '<button class="access-dialog-close" type="button" data-release-update-close aria-label="稍后再说">',
      '<svg aria-hidden="true" viewBox="0 0 32 32"><path d="m9 9 14 14M23 9 9 23"/></svg></button>',
    ].join('');
    const notes = updateInfo.releaseNotes.length
      ? `<ul class="release-update-notes">${updateInfo.releaseNotes.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul>`
      : '';

    releaseUpdateDialog.innerHTML = [
      '<div class="map-switch-card release-update-card">',
      closeButton,
      '<div class="release-update-icon" aria-hidden="true">',
      '<svg viewBox="0 0 64 64"><path d="M32 8v28"/><path d="m20 24 12 12 12-12"/><path d="M15 38v9a7 7 0 0 0 7 7h20a7 7 0 0 0 7-7v-9"/></svg>',
      '</div>',
      '<p class="paywall-eyebrow">APP 版本更新</p>',
      `<h2 id="release-update-title">${escapeHtml(updateInfo.title)}</h2>`,
      `<p>${escapeHtml(updateInfo.message)}</p>`,
      '<div class="release-version-row">',
      `<span>当前版本 ${escapeHtml(updateInfo.currentVersion)}</span>`,
      `<strong>最新版本 ${escapeHtml(updateInfo.latestVersion)}</strong>`,
      '</div>',
      notes,
      '<div class="release-update-actions">',
      mustBlockForUpdate ? '' : '<button class="access-secondary-button" type="button" data-release-update-close>稍后再说</button>',
      `<button class="access-primary-button release-update-primary" type="button" data-release-update-primary>去 ${escapeHtml(updateInfo.storeName)} 更新</button>`,
      '</div>',
      '</div>',
    ].join('');

    document.body.appendChild(releaseUpdateDialog);
    releaseUpdateDialog.querySelectorAll('[data-release-update-close]').forEach((button) => {
      button.addEventListener('click', () => releaseUpdateDialog.close());
    });
    releaseUpdateDialog.querySelector('[data-release-update-primary]')?.addEventListener('click', () => {
      if (!requestReleaseUpdate(updateInfo, window)) showToast(`请打开 ${updateInfo.storeName} 搜索嗨洛塔少儿启蒙APP更新`);
    });
    releaseUpdateDialog.addEventListener('cancel', (event) => {
      if (mustBlockForUpdate) event.preventDefault();
    });
    releaseUpdateDialog.addEventListener('click', (event) => {
      if (!mustBlockForUpdate && event.target === releaseUpdateDialog) releaseUpdateDialog.close();
    });
    releaseUpdateDialog.addEventListener('close', () => {
      releaseUpdateDialog.remove();
      releaseUpdateDialog = null;
    }, { once: true });

    releaseUpdateDialog.showModal();
    requestAnimationFrame(() => releaseUpdateDialog.querySelector('[data-release-update-primary]')?.focus());
  }

  function checkReleaseUpdate() {
    if (!navigator.onLine) return;
    const releaseUpdateUrl = String(window.BABY_ISLAND_RELEASE_UPDATE_URL || APP_RELEASE_UPDATE_URL);
    const separator = releaseUpdateUrl.includes('?') ? '&' : '?';
    fetch(`${releaseUpdateUrl}${separator}t=${Date.now()}`, { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((config) => openReleaseUpdateDialog(releaseUpdateInfo(
        config,
        window.BABY_ISLAND_APP_VERSION || APP_RELEASE_VERSION,
      )))
      .catch(() => {});
  }

  function levelStatus(id) {
    if (id > FREE_LEVEL_COUNT && state.preferences.vipActive !== true) return 'premium';
    if (state.progress.completed.includes(id)) return 'completed';
    if (id <= state.progress.unlockedThrough) return 'current';
    return 'locked';
  }

  function progressPercent() {
    return Math.round((state.progress.completed.length / levels.length) * 100);
  }

  function statusText(status) {
    return { completed: '已完成', current: '学习中', locked: '待解锁', premium: '会员' }[status];
  }

  /** 航程胶囊 HUD 已下线（产品确认顶栏不再展示） */

  function activeWorldLevels() {
    return levelsForMapWorld(state.preferences.mapWorld);
  }

  function activeLevelById(levelId) {
    return activeWorldLevels().find((item) => item.id === levelId);
  }

  function normalizeMathMapLevelId(levelId, fallback = 1) {
    const id = Number(levelId) || Number(fallback) || 1;
    return Math.min(DISPLAY_LEVEL_COUNT, Math.max(1, id));
  }

  function clearMathAppleDropSounds() {
    mathAppleDropSoundTimers.forEach((timer) => clearTimeout(timer));
    mathAppleDropSoundTimers = [];
  }

  function cssTimeToMs(value) {
    const raw = String(value || '').trim();
    const amount = Number.parseFloat(raw);
    if (!Number.isFinite(amount)) return 0;
    return Math.max(0, raw.endsWith('s') && !raw.endsWith('ms') ? amount * 1000 : amount);
  }

  function playMathAppleDropSounds(root) {
    clearMathAppleDropSounds();
    const objects = [...(root?.querySelectorAll('.math-inline-panel.is-dropping-in .math-object') || [])];
    objects.forEach((object) => {
      const delayMs = cssTimeToMs(getComputedStyle(object).getPropertyValue('--math-object-delay'));
      const play = () => {
        try {
          const audio = new Audio(MATH_APPLE_DROP_SFX_SRC);
          audio.volume = MATH_APPLE_DROP_SFX_VOLUME;
          audio.play().catch(() => {});
        } catch (_) {}
      };
      mathAppleDropSoundTimers.push(setTimeout(play, delayMs + MATH_APPLE_DROP_IMPACT_OFFSET_MS));
    });
  }

  function playUiButtonClickSfx() {
    try {
      uiButtonClickAudio.currentTime = 0;
      uiButtonClickAudio.volume = UI_BUTTON_CLICK_SFX_VOLUME;
      uiButtonClickAudio.play().catch(() => {});
    } catch (_) {}
  }

  function handleUiButtonClickSfx(event) {
    if (event.isTrusted === false || !(event.target instanceof Element)) return;
    const button = event.target.closest('button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]');
    if (!button) return;
    if (button.disabled || button.closest('[disabled], [aria-disabled="true"]')) return;
    playUiButtonClickSfx();
  }

  function showInlineMathLevel(levelId, message = '', transition = '') {
    state.mathMapLevelId = normalizeMathMapLevelId(levelId, state.progress.unlockedThrough);
    state.mathMapTransition = transition;
    if (routeFromHash().type !== 'map') {
      history.replaceState(null, '', '#map');
    }
    // 消息走 showMapMessage 自动消失；勿塞进 renderMap 常驻，否则「当前关卡」被顶没
    renderMap();
    if (message) showMapMessage(message);
    rememberLastStay({ type: 'map' });
  }

  function requestLevelAccess(levelId, trigger = null) {
    const access = getLevelAccess(levelId, state.progress, state.preferences.vipActive === true);
    if (access === 'allowed') {
      const level = activeLevelById(levelId);
      if (state.preferences.mapWorld === 'math' && (level?.worldId === 'math' || level?.itemType === 'count')) {
        const currentMathLevelId = normalizeMathMapLevelId(state.mathMapLevelId, state.progress.unlockedThrough);
        const nextMathLevelId = normalizeMathMapLevelId(levelId, state.progress.unlockedThrough);
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        showInlineMathLevel(nextMathLevelId, '', !reduceMotion && nextMathLevelId !== currentMathLevelId ? 'drop' : '');
        return;
      }
      navigate(`level-${levelId}`, { fromMap: true });
    } else if (access === 'paid') {
      showMapMessage(paidAccessMessage);
      openPaywallDialog(levelId, trigger);
    } else {
      showMapMessage(`先完成第 ${state.progress.unlockedThrough} 关，再继续冒险。`);
    }
  }

  // ─── 会员支付弹窗 ───────────────────────────────
  let paywallDialog = null;

  function openPaywallDialog(levelId, trigger = null) {
    if (paywallDialog) {
      if (paywallDialog.open) return;
      paywallDialog.remove();
      paywallDialog = null;
    }
    const canOpenNativePurchase = Boolean(
      window?.webkit?.messageHandlers?.babyIslandIAP?.postMessage ||
      window?.BabyIslandIAP?.purchase
    );
    const initialPayNote = canOpenNativePurchase
      ? '通过 App Store 安全支付 · 完成后本地图权益立即生效'
      : '正式 iPad 包会打开 App Store 支付，当前预览不会扣费';

    paywallDialog = document.createElement('dialog');
    paywallDialog.className = 'map-switch-dialog paywall-dialog';
    paywallDialog.setAttribute('role', 'dialog');
    paywallDialog.setAttribute('aria-modal', 'true');
    paywallDialog.setAttribute('aria-labelledby', 'paywall-title');
    paywallDialog.__returnFocus = trigger;

    paywallDialog.innerHTML = [
      '<div class="map-switch-card paywall-card">',
      '<button class="access-dialog-close" type="button" data-paywall-close aria-label="关闭窗口">',
      '<svg aria-hidden="true" viewBox="0 0 32 32"><path d="m9 9 14 14M23 9 9 23"/></svg></button>',
      '<div class="access-hero premium" aria-hidden="true">',
      icons.premiumHero,
      '</div>',
      '<div class="paywall-copy">',
      '<p class="paywall-eyebrow">本地图学习卡</p>',
      `<h2 id="paywall-title">购买本地图，解锁本图会员关</h2>`,
      `<p>前 ${FREE_LEVEL_COUNT} 关已免费体验，购买后获得本地图会员关卡权益；后续课程内容更新后自动开放。新地图需单独购买。</p>`,
      '</div>',
      '<section class="vip-plan" aria-label="本地图套餐">',
      `<div><strong>${DISPLAY_LEVEL_COUNT} 座魔法岛 · 本地图权益</strong><small>第 ${FREE_LEVEL_COUNT + 1}-${DISPLAY_LEVEL_COUNT} 关为会员关卡 · 后续新地图独立发售</small></div>`,
      '<span class="vip-price">¥99<small>买断本地图</small></span>',
      '</section>',
      '<div class="vip-benefits" aria-label="本地图权益">',
      `<span class="vip-benefit"><svg class="vip-benefit-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V4"/><path d="M6 5c4-2.2 8 2.2 12 0v8.5c-4 2.2-8-2.2-12 0"/></svg>第 ${FREE_LEVEL_COUNT + 1}-${DISPLAY_LEVEL_COUNT} 关</span>`,
      '<span class="vip-benefit"><svg class="vip-benefit-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="m10 8.8 4.8 3.2-4.8 3.2z"/></svg>会员关卡权益</span>',
      '<span class="vip-benefit"><svg class="vip-benefit-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h3l4.5 3.8V6.2L7 10H4z"/><path d="M15.5 9.2c1.8 1.5 1.8 4.1 0 5.6"/></svg>单词发音练习</span>',
      '<span class="vip-benefit"><svg class="vip-benefit-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="m8.4 12.3 2.4 2.4 4.8-5.2"/></svg>答题闯关记录</span>',
      '</div>',
      '<button class="access-primary-button vip-pay-button" type="button" data-vip-pay>',
      '<span>立即支付 ¥99</span></button>',
      '<button class="access-secondary-button vip-restore-button" type="button" data-vip-restore>恢复购买</button>',
      `<p class="vip-pay-note" data-vip-pay-note>${initialPayNote}</p>`,
      '</div>',
    ].join('');

    document.body.appendChild(paywallDialog);

    paywallDialog.querySelectorAll('[data-paywall-close]').forEach((button) => {
      button.addEventListener('click', closePaywallDialog);
    });
    paywallDialog.addEventListener('click', (event) => {
      if (event.target === paywallDialog) closePaywallDialog();
    });
    paywallDialog.querySelector('[data-vip-pay]').addEventListener('click', () => {
      const note = paywallDialog.querySelector('[data-vip-pay-note]');
      if (requestVipPurchase(levelId, window)) {
        note.textContent = '已打开系统支付，请按提示完成开通';
        showToast('请按系统支付提示完成开通');
        return;
      }
      note.textContent = '正式 iPad 包会打开 App Store 支付，当前预览不会扣费';
      showToast('请在正式 iPad 包内完成 App Store 支付');
    });
    paywallDialog.querySelector('[data-vip-restore]').addEventListener('click', () => {
      const note = paywallDialog.querySelector('[data-vip-pay-note]');
      if (requestVipRestore(window)) {
        note.textContent = '正在向 App Store 检查已有购买';
        showToast('正在恢复购买');
        return;
      }
      note.textContent = '正式 iPad 包内可恢复购买';
      showToast('请在正式 iPad 包内恢复购买');
    });
    paywallDialog.addEventListener('close', function () {
      const returnTarget = paywallDialog.__returnFocus;
      if (returnTarget && returnTarget.isConnected) returnTarget.focus();
    });

    paywallDialog.showModal();
    requestAnimationFrame(function () {
      const firstBtn = paywallDialog.querySelector('[data-vip-pay]') || paywallDialog.querySelector('button');
      if (firstBtn) firstBtn.focus();
    });
  }

  function closePaywallDialog() {
    if (paywallDialog && paywallDialog.open) {
      paywallDialog.close();
    }
  }

  function completeVipPurchase() {
    state.preferences = activateVipPreferences(state.preferences);
    try { localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(state.preferences)); } catch {}
    closePaywallDialog();
    showToast('VIP 已开通，会员权益已生效');
    render();
    return true;
  }

  window.BabyIslandIAPComplete = completeVipPurchase;
  window.babyIslandIAPComplete = completeVipPurchase;

  function assetHref(path) {
    return new URL(path, document.baseURI).href;
  }


  let mapJumpDialog = null;

  function closeMapJumpDialog() {
    if (mapJumpDialog && mapJumpDialog.open) {
      try { mapJumpDialog.close(); } catch (_) {}
    }
  }

  /**
     * 跳关：左右布局 — 左路线段(10段/200关) · 右关卡网格
     * 仅移动地图/定位，不写通关进度。无数字输入跳关。
     * options: { levels, currentLevelId, unlockedThrough, onDepart, trigger }
     */
    function openMapJumpDialog(options = {}) {
      const worldLevels = Array.isArray(options.levels) && options.levels.length
        ? options.levels
        : (typeof levels !== 'undefined' ? levels : []);
      // 以 DISPLAY_LEVEL_COUNT(200) 为下限：即使当前关卡数据更少，也保证 200 段可选
      const dataMax = worldLevels.length
        ? Math.max(...worldLevels.map((l) => Number(l.id) || 0))
        : 0;
      const total = Math.max(DISPLAY_LEVEL_COUNT, dataMax, 1);
      const currentLevelId = Number(options.currentLevelId) || 1;
      const unlockedThrough = Number(options.unlockedThrough) || 0;
      const onDepart = typeof options.onDepart === 'function' ? options.onDepart : null;
      const trigger = options.trigger || null;

      if (mapJumpDialog && mapJumpDialog.open) {
        mapJumpDialog.close();
      }

      const segments = buildMapJumpSegments(total, MAP_JUMP_SEGMENT_SIZE);
      let activeSegment = segmentContainingLevel(currentLevelId, segments) || segments[0];
      let selectedLevelId = currentLevelId;

      // 保证每段都能点到号：缺数据时用占位关补齐 id
      const levelsById = new Map(worldLevels.map((lv) => [Number(lv.id), lv]));
      function levelsForSegment(seg) {
        const out = [];
        for (let id = seg.start; id <= seg.end; id += 1) {
          const existing = levelsById.get(id);
          out.push(existing || { id, title: '', word: '' });
        }
        return out;
      }

      const dialog = document.createElement('dialog');
      dialog.className = 'map-switch-dialog jump-dialog';
      dialog.setAttribute('aria-labelledby', 'jump-dialog-title');
      dialog.innerHTML = `
        <form method="dialog" class="map-switch-card jump-card access-card cream-panel" data-jump-card>
          <button class="access-dialog-close" type="submit" value="cancel" aria-label="关闭" data-jump-close>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
          <header class="jump-header">
            <p class="paywall-eyebrow">${MAP_JUMP_COPY.eyebrow}</p>
            <h2 id="jump-dialog-title">${MAP_JUMP_COPY.title}</h2>
            <p class="jump-sub" data-jump-sub>共 ${total} 关 · 左边选段，右边点关，再出发</p>
            <p class="jump-current" data-jump-current></p>
          </header>

          <div class="jump-body" data-jump-body>
            <aside class="jump-rail" data-jump-rail aria-label="路线段">
              <p class="jump-section-label">${MAP_JUMP_COPY.segmentsLabel}</p>
              <div class="jump-segments" data-jump-segments role="listbox" aria-label="路线段列表"></div>
            </aside>

            <section class="jump-main" data-jump-main>
              <p class="jump-section-label" data-jump-levels-label></p>
              <div class="jump-levels" data-jump-levels role="listbox" aria-label="关卡列表"></div>
            </section>
          </div>

          <div class="jump-cta-row">
            <button type="button" class="access-primary-button jump-depart-btn" data-jump-depart disabled>
              ${MAP_JUMP_COPY.depart}
            </button>
          </div>
        </form>
      `;

      document.body.appendChild(dialog);
      mapJumpDialog = dialog;

      const segmentsEl = dialog.querySelector('[data-jump-segments]');
      const levelsEl = dialog.querySelector('[data-jump-levels]');
      const levelsLabelEl = dialog.querySelector('[data-jump-levels-label]');
      const currentEl = dialog.querySelector('[data-jump-current]');
      const departBtn = dialog.querySelector('[data-jump-depart]');
      const subEl = dialog.querySelector('[data-jump-sub]');

      function statusText(st) {
        if (st === 'completed') return '已通关';
        if (st === 'available' || st === 'current') return '可前往';
        if (st === 'premium') return '会员';
        return '待解锁';
      }

      function renderCurrentPill() {
        const lv = levelsById.get(currentLevelId);
        const title = lv && lv.title ? ` · ${lv.title}` : '';
        if (currentEl) currentEl.textContent = `当前：第 ${currentLevelId} 关${title}`;
      }

      function updateDepartCta() {
        if (!departBtn) return;
        const id = Number(selectedLevelId) || 0;
        departBtn.disabled = !id;
        if (!id) {
          departBtn.textContent = MAP_JUMP_COPY.depart;
          return;
        }
        departBtn.textContent = id === currentLevelId
          ? MAP_JUMP_COPY.arrived
          : `${MAP_JUMP_COPY.depart} ${id}`;
      }

      function renderSegments() {
        if (!segmentsEl) return;
        segmentsEl.innerHTML = segments.map((seg) => {
          const isActive = activeSegment && seg.id === activeSegment.id;
          const containsCurrent = currentLevelId >= seg.start && currentLevelId <= seg.end;
          // 右侧文案：当前进度所在段标「进度」，避免与 is-active 双高亮混淆
          const sideLabel = containsCurrent ? MAP_JUMP_COPY.current : `${seg.end - seg.start + 1} 关`;
          return `
            <button
              type="button"
              class="jump-segment-btn${isActive ? ' is-active' : ''}${containsCurrent ? ' is-current-seg' : ''}"
              data-jump-segment="${seg.id}"
              role="option"
              aria-selected="${isActive ? 'true' : 'false'}"
              aria-current="${containsCurrent ? 'true' : 'false'}"
            >
              <strong>${seg.start}–${seg.end}</strong>
              <small>${sideLabel}</small>
            </button>
          `;
        }).join('');
        const activeBtn = segmentsEl.querySelector('.jump-segment-btn.is-active');
        if (activeBtn && typeof activeBtn.scrollIntoView === 'function') {
          try { activeBtn.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); } catch (_) {}
        }
      }


      function jumpStatus(id) {
        // 跳关展示用：跟 levelStatus 一致；无则按 unlockedThrough 退化
        if (typeof levelStatus === 'function') return levelStatus(id);
        if (id === currentLevelId) return 'current';
        if (typeof FREE_LEVEL_COUNT === 'number' && id > FREE_LEVEL_COUNT) return 'premium';
        if (id <= unlockedThrough) return 'current';
        return 'locked';
      }

      function renderLevels(seg) {
        if (!levelsEl || !seg) return;
        if (levelsLabelEl) {
          levelsLabelEl.textContent = `${seg.start}–${seg.end} 关`;
        }
        const list = levelsForSegment(seg);
        levelsEl.innerHTML = list.map((lv) => {
          const st = jumpStatus(lv.id);
          const isSel = Number(selectedLevelId) === Number(lv.id);
          const isCur = Number(lv.id) === currentLevelId;
          return `
            <button
              type="button"
              class="jump-level-btn status-${st}${isSel ? ' is-selected' : ''}${isCur ? ' is-current' : ''}"
              data-jump-level="${lv.id}"
              role="option"
              aria-selected="${isSel ? 'true' : 'false'}"
            >
              <span class="jump-level-num">${lv.id}</span>
              <span class="jump-level-title">${lv.title || ''}</span>
              <span class="jump-level-meta">${isCur ? MAP_JUMP_COPY.current : statusText(st)}</span>
            </button>
          `;
        }).join('');
        const selectedBtn = levelsEl.querySelector('.jump-level-btn.is-selected');
        if (selectedBtn && typeof selectedBtn.scrollIntoView === 'function') {
          try { selectedBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (_) {}
        }
      }

      function selectLevel(id) {
        const n = Number(id);
        if (!Number.isFinite(n) || n < 1 || n > total) return false;
        selectedLevelId = n;
        const seg = segmentContainingLevel(n, segments);
        if (seg) activeSegment = seg;
        renderSegments();
        renderLevels(activeSegment);
        updateDepartCta();
        return true;
      }

      function departSelected() {
        const id = Number(selectedLevelId);
        if (!id) return;
        closeMapJumpDialog();
        if (onDepart) onDepart(id);
        else showToast(`已定位到第 ${id} 关`);
      }

      renderCurrentPill();
      selectLevel(currentLevelId);
      if (subEl) subEl.textContent = `共 ${total} 关 · 左边选段，右边点关，再出发`;

      dialog.addEventListener('click', (ev) => {
        const closeBtn = ev.target.closest('[data-jump-close]');
        if (closeBtn) {
          closeMapJumpDialog();
          return;
        }
        const segBtn = ev.target.closest('[data-jump-segment]');
        if (segBtn) {
          const seg = segments.find((item) => item.id === segBtn.dataset.jumpSegment);
          if (seg) {
            activeSegment = seg;
            // 切段时默认选中该段第一关（若当前选中已在该段则保留）
            if (selectedLevelId < seg.start || selectedLevelId > seg.end) {
              selectedLevelId = seg.start;
            }
            renderSegments();
            renderLevels(activeSegment);
            updateDepartCta();
          }
          return;
        }
        const levelBtn = ev.target.closest('[data-jump-level]');
        if (levelBtn) {
          const targetLevel = Number(levelBtn.dataset.jumpLevel);
          selectLevel(targetLevel);
          if (Number.isFinite(targetLevel) && targetLevel > FREE_LEVEL_COUNT) {
            departSelected();
          }
          return;
        }
        if (ev.target.closest('[data-jump-depart]')) {
          departSelected();
        }
      });

      dialog.addEventListener('cancel', () => {
        // 允许 Esc 关闭（跳关非强制）
      });

      dialog.addEventListener('close', () => {
        const returnTarget = dialog.__returnFocus;
        if (returnTarget && returnTarget.isConnected) {
          try { returnTarget.focus(); } catch (_) {}
        }
        if (dialog.parentNode) dialog.parentNode.removeChild(dialog);
        if (mapJumpDialog === dialog) mapJumpDialog = null;
      });

      dialog.__returnFocus = trigger && trigger.focus ? trigger : document.activeElement;
      dialog.showModal();
      requestAnimationFrame(() => {
        const focusEl = dialog.querySelector('.jump-level-btn.is-selected')
          || dialog.querySelector('.jump-segment-btn.is-active')
          || dialog.querySelector('[data-jump-depart]')
          || dialog.querySelector('[data-jump-close]');
        if (focusEl) focusEl.focus();
      });
    }


  function mathMapInlinePanelMarkup(level, transition = '') {
    const alreadyCompleted = state.progress.completed.includes(level.id);
    const topicShort = String(level.topic || '').split('·')[0].trim();
    const dropClass = transition === 'drop' ? ' is-dropping-in' : '';
    const questionLevel = mathLevelForCoachPlan(level);
    const prevId = level.id - 1;
    const nextId = level.id + 1;
    return `
            <div class="math-map-play-area" data-math-inline-question>
              <section class="math-inline-panel math-quiz${dropClass}" data-math-panel-level="${level.id}" aria-label="当前数学题">
                <button class="math-level-step math-level-step--prev" type="button" data-math-step="-1" aria-label="${prevId >= 1 ? `切到第 ${prevId} 关` : '已经是第 1 关'}" ${prevId < 1 ? 'disabled' : ''}></button>
                <header class="math-inline-header">
                  <span class="level-pill">第 ${level.id} 关</span>
                  <strong>${escapeHtml(level.title)}</strong>
                  <small>${escapeHtml(topicShort || level.zhTitle)}</small>
                  <span class="status-pill" data-detail-state>${alreadyCompleted ? '已完成' : '进行中'}</span>
                </header>
                <div class="math-layout">
                  ${mathQuestionTableMarkup(questionLevel)}
                </div>
                <button class="math-level-step math-level-step--next" type="button" data-math-step="1" aria-label="${nextId <= DISPLAY_LEVEL_COUNT ? `切到第 ${nextId} 关` : '已经是最后一关'}" ${nextId > DISPLAY_LEVEL_COUNT ? 'disabled' : ''}></button>
              </section>
            </div>`;
  }

  function renderMap(initialMessage = '') {
    // 沉浸地图壳只在 render() 里 toggle；从「我的」/showInlineMathLevel 直调 renderMap 时
    // 若不补挂 map-game-active，会落到奶油卡片壳（非图2全屏小桌）。
    document.body.classList.add('map-game-active');
    document.body.classList.remove('level-quiz-active');
    appShell.classList.remove('detail-shell');
    bottomTabs.hidden = false;
    clearMathAppleDropSounds();
    const completed = state.progress.completed.length;
    const activeWorldId = normalizeMapWorldId(state.preferences.mapWorld);
    const activeWorld = MAP_WORLDS[activeWorldId];
    const worldLevels = levelsForMapWorld(activeWorldId);
    const progressLevelId = Math.min(
      activeWorld.endLevel,
      Math.max(activeWorld.startLevel, state.progress.unlockedThrough),
    );
    const focusedLevelId = activeWorldId === 'math'
      ? normalizeMathMapLevelId(state.mathMapLevelId, progressLevelId)
      : progressLevelId;
    const currentLevel = worldLevels.find((level) => level.id === focusedLevelId) || worldLevels[0] || levels[0];
    const currentMapTheme = activeWorld.theme;
    const mathMapTransition = currentMapTheme === 'math' ? state.mathMapTransition : '';
    const currentVehicle = MAP_VEHICLES[currentMapTheme] || MAP_VEHICLES.ocean;
    const stars = completed * 3;
    const levelNodes = worldLevels.map((level) => {
      const status = levelStatus(level.id);
      const label = `第 ${level.id} 关，${level.title}，${statusText(status)}`;
      const isMathLevel = level.worldId === 'math' || level.itemType === 'count';
      const isSelectedMathLevel = currentMapTheme === 'math' && level.id === currentLevel.id;
      const islandId = String(islandStyleId(level.id)).padStart(3, '0');
      const islandImage = assetHref(`assets/islands-v1/runtime/island-${islandId}.webp?v=20260720-underwater-fade-v3`);
      const mapImage = currentMapTheme === 'desert' ? assetHref(desertLandmarkImage(level.id)) : islandImage;
      const stopClass = currentMapTheme === 'desert' ? 'desert-landmark' : currentMapTheme === 'math' ? 'math-table-stop' : 'ocean-island';
      const mathSymbol = isMathLevel ? Number(level.targetCount) || 1 : '';
      const stopStyle = currentMapTheme === 'math'
        ? `--math-card-tilt:${((level.id % 5) - 2) * 1.2}deg`
        : `--island-image:url('${mapImage}')`;
      const mathArtAttrs = isMathLevel ? ` data-math-symbol="${mathSymbol}"` : '';
      const wordAudioMarkup = isMathLevel ? '' : `<button class="word-audio-button" type="button" data-speak-word="${level.title}" aria-label="播放 ${level.title} 发音"${wordCanPronounce(level.title) ? '' : ' disabled'}>${icons.wordAudio}</button>`;

      return `
        <div class="level-stop square-island ${stopClass}${isSelectedMathLevel ? ' is-selected' : ''}" data-stop="${level.id}" data-word="${level.title}" data-status="${status}" data-map-theme="${currentMapTheme}" style="${stopStyle}">
          <span class="island-art"${mathArtAttrs} aria-hidden="true"></span>
          ${desertDecorMarkup(level.id, currentMapTheme)}
          ${status === 'locked' || status === 'premium' ? icons.islandLock : ''}
          <button class="level-node ${status}" type="button" data-level="${level.id}" aria-label="${label}" ${status === 'locked' ? 'aria-disabled="true"' : ''}>
            <span class="level-number">${level.id}</span>
            ${status === 'premium' ? icons.locked : icons[status]}
          </button>
          <span class="level-name">
            <span class="level-name-copy"><strong>${level.title}</strong><small>${level.zhTitle}</small></span>
            ${wordAudioMarkup}
          </span>
          <span class="level-state-text ${status}" aria-label="${statusText(status)}">
            ${status === 'completed' ? icons.stateCompleted : status === 'current' ? icons.stateCurrent : icons.stateLocked}
            <small>${statusText(status)}</small>
          </span>
        </div>`;
    }).join('');
    const idleVideoMarkup = currentVehicle.idleVideo ? `
      <video class="steamboat-asset steamboat-asset--idle-video" data-boat-idle-video muted loop playsinline preload="auto" aria-hidden="true">
        <source src="${currentVehicle.idleVideo.hevc}" type='video/quicktime; codecs="hvc1"'>
        <source src="${currentVehicle.idleVideo.webm}" type='video/webm; codecs="vp9"'>
      </video>` : '';
    const sailingVideoMarkup = currentVehicle.sailingVideo ? `
      <video class="steamboat-asset steamboat-asset--sailing-video" data-boat-video muted loop playsinline preload="auto" aria-hidden="true">
        <source src="${currentVehicle.sailingVideo.hevc}" type='video/quicktime; codecs="hvc1"'>
        <source src="${currentVehicle.sailingVideo.webm}" type='video/webm; codecs="vp9"'>
      </video>` : '';
    const vehicleThemeClass = currentMapTheme === 'desert' ? 'is-desert-rider' : currentMapTheme === 'math' ? 'is-math-rider' : '';
    const mathMapDecorMarkup = currentMapTheme === 'math' ? `
            <div class="math-map-decor" aria-hidden="true">
              <span class="math-map-prop math-map-prop--ruler"></span>
              <span class="math-map-prop math-map-prop--pencil"></span>
              <span class="math-map-prop math-map-prop--block math-map-prop--one"></span>
              <span class="math-map-prop math-map-prop--block math-map-prop--two"></span>
              <span class="math-map-prop math-map-prop--counter math-map-prop--counter-a"></span>
              <span class="math-map-prop math-map-prop--counter math-map-prop--counter-b"></span>
              <span class="math-map-prop math-map-prop--kid-doodle"></span>
            </div>` : '';
    const mathInlinePanelMarkup = currentMapTheme === 'math'
      ? mathMapInlinePanelMarkup(currentLevel, mathMapTransition)
      : '';
    const mathLevelIndicatorMarkup = currentMapTheme === 'math' ? `
        <div class="math-level-switch-indicator${mathMapTransition === 'drop' ? ' is-changing' : ''}" data-math-level-switch-indicator role="status" aria-live="polite" aria-label="当前第 ${currentLevel.id} 关，共 ${DISPLAY_LEVEL_COUNT} 关">
          <span class="math-level-switch-label">当前关卡</span>
          <strong><span>第 ${currentLevel.id}</span><small>/ ${DISPLAY_LEVEL_COUNT} 关</small></strong>
          <span class="math-level-switch-title">${escapeHtml(currentLevel.title)}</span>
        </div>` : '';
    const globalUpdateStatusMarkup = currentMapTheme === 'math' ? '' : `
            <div class="map-pack-status-hud" data-global-update-status>
              ${globalUpdateButtonMarkup()}
            </div>`;
    const swipeHintMarkup = currentMapTheme === 'math' ? '' : `<p class="swipe-hint" aria-hidden="true">${activeWorld.hint}</p>`;
    main.innerHTML = `
      <section class="view map-view" aria-labelledby="map-title">
        <header class="map-topbar surface">
          <div class="map-brand">
            <div class="map-brand-card">
              <button class="map-switch-btn" type="button" data-map-switch aria-label="切换地图" title="切换地图">
                ${icons.mapSwitch}
              </button>
              <div class="map-brand-lockup">
                <p class="eyebrow map-brand-kicker">${activeWorld.kicker}</p>
                <h1 id="map-title">${activeWorld.title}</h1>
              </div>
              <span class="map-brand-divider" aria-hidden="true"></span>
              <span class="map-level-chip">
                <svg class="map-level-flag" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V4"/><path d="M6 5c4-2.2 8 2.2 12 0v8.5c-4 2.2-8-2.2-12 0"/></svg>
                <span>第 ${currentLevel.id} 关 · ${currentLevel.title} ${currentLevel.zhTitle}</span>
              </span>
            </div>
            <div class="map-pack-status-hud" data-asset-pack-status>
              ${activeWorld.usesVideoAssets === false ? '' : assetPackStatusButtonMarkup()}
            </div>
            ${globalUpdateStatusMarkup}
          </div>

          <div class="resource-strip" aria-label="冒险资源">
            <div class="resource-chip">
              <span class="resource-icon star" aria-hidden="true"><img class="resource-glyph" src="assets/icons/resource-star.webp?v=20260714-v1" alt="" draggable="false"></span>
              <span><small>星星</small><strong>${stars}</strong></span>
            </div>
          </div>
        </header>

        <p class="map-message" role="status" ${initialMessage ? '' : 'hidden'}>${initialMessage}</p>
        ${mathLevelIndicatorMarkup}
        <section class="route-card surface" aria-label="${activeWorld.routeLabel}" data-map-world="${activeWorld.id}" data-map-theme="${currentMapTheme}">
          <div class="route-ocean" data-map-theme="${currentMapTheme}">
            ${mathMapDecorMarkup}
            <video class="ocean-loop ocean-loop--ocean" autoplay muted loop playsinline preload="auto" poster="assets/ocean/front-ocean-bg-v2-libtv.webp" aria-hidden="true">
              <source src="assets/ocean/front-ocean-loop-v4-libtv-seamless-clouds.mp4?v=20260719-handpainted-libtv-v1" type="video/mp4" media="(prefers-reduced-motion: no-preference)">
            </video>
            <video class="ocean-loop ocean-loop--desert" autoplay muted loop playsinline preload="auto" poster="assets/egypt-map/background/egypt-desert-infinite-clean-bg-dreamina-v2.png?v=20260720-desert-infinite-v2" aria-hidden="true">
              <source src="assets/egypt-map/background/egypt-desert-infinite-bg-libtv-v4.mp4?v=20260720-desert-bg-v4" type="video/mp4" media="(prefers-reduced-motion: no-preference)">
            </video>
            <img class="flying-seagull" data-seagull-flight src="assets/ocean/seagull-fly.webp?v=20260720-libtv-flap-v1" alt="" aria-hidden="true" draggable="false">
            <div class="flying-seagull-pair" data-seagull-flight aria-hidden="true">
              <img src="assets/ocean/seagull-fly.webp?v=20260720-libtv-flap-v1" alt="" draggable="false">
              <img src="assets/ocean/seagull-fly.webp?v=20260720-libtv-flap-v1" alt="" draggable="false">
            </div>
            <div class="map-fab-cluster" role="group" aria-label="地图工具">
              <button class="map-music-btn${state.preferences.mapMusic === false ? ' is-muted' : ''}" type="button" data-map-music-toggle role="switch" aria-pressed="${state.preferences.mapMusic !== false}" aria-label="${state.preferences.mapMusic === false ? '打开背景音' : '关闭背景音'}" title="${state.preferences.mapMusic === false ? '打开背景音' : '关闭背景音'}">
                ${state.preferences.mapMusic === false ? icons.mapMusicOff : icons.mapMusicOn}
              </button>
              <button class="map-jump-btn" type="button" data-map-jump aria-label="跳关，仅移动地图到某一关" title="跳关（仅移动地图）">
                ${icons.jump}
              </button>
              <button class="map-locate-btn" type="button" data-locate-progress data-current-level="${progressLevelId}" aria-label="回到第 ${progressLevelId} 关最新进度" title="回到当前最新进度">
                ${icons.locate}
              </button>
            </div>
            <div class="route-scroll" data-route-scroll tabindex="0" aria-label="${activeWorld.routeLabel}，左右滑动浏览">
              <div class="route-canvas">
                <div class="boat-dock" aria-hidden="true">
                  <div class="toy-steamboat ${vehicleThemeClass}" data-current-boat>
                    <span class="steamboat-body">
                      <img class="steamboat-asset steamboat-asset--idle" data-boat-asset-idle src="${currentVehicle.idle}" alt="" draggable="false" decoding="sync">
                      ${idleVideoMarkup}
                      <img class="steamboat-asset steamboat-asset--sailing" data-boat-asset-sailing src="${currentVehicle.sailing}" alt="" draggable="false" decoding="sync">
                      ${sailingVideoMarkup}
                    </span>
                  </div>
                </div>
                <div class="route-stage">${levelNodes}</div>
              </div>
            </div>
            ${mathInlinePanelMarkup}
          </div>
          ${swipeHintMarkup}
        </section>
      </section>`;
    state.mathMapTransition = '';

    main.querySelector('[data-map-switch]')?.addEventListener('click', (event) => {
      event.preventDefault();
      openMapSwitchDialog(event.currentTarget);
    });

    const randomizeSeagullFlight = (seagull) => {
      const ocean = seagull.parentElement;
      const startY = ocean.clientHeight * (0.6 + Math.random() * 0.24);
      const endY = ocean.clientHeight * (0.04 + Math.random() * 0.16);
      const flightX = -(ocean.clientWidth + seagull.offsetWidth * 3);
      const flightY = endY - startY;

      seagull.style.setProperty('--seagull-start-y', `${Math.round(startY)}px`);
      seagull.style.setProperty('--seagull-dive-x', `${Math.round(flightX * 0.52)}px`);
      seagull.style.setProperty('--seagull-dive-y', `${Math.round(flightY * 0.52)}px`);
      seagull.style.setProperty('--seagull-rise-x', `${Math.round(flightX * 0.8)}px`);
      seagull.style.setProperty('--seagull-rise-y', `${Math.round(flightY * 0.8)}px`);
      seagull.style.setProperty('--seagull-flight-x', `${Math.round(flightX)}px`);
      seagull.style.setProperty('--seagull-flight-y', `${Math.round(flightY)}px`);
    };

    main.querySelectorAll('[data-seagull-flight]').forEach((seagull) => {
      randomizeSeagullFlight(seagull);
      seagull.addEventListener('animationiteration', () => randomizeSeagullFlight(seagull));
    });

    main.querySelectorAll('[data-speak-word]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        playWordPronunciation(button.dataset.speakWord, button);
      });
    });

    main.querySelectorAll('[data-level]').forEach((button) => {
      button.addEventListener('click', () => {
        requestLevelAccess(Number(button.dataset.level), button);
      });
    });

    const inlineMathPanel = main.querySelector('[data-math-inline-question]');
    if (inlineMathPanel && currentMapTheme === 'math') {
      bindInlineMathQuestion(inlineMathPanel, mathLevelForCoachPlan(currentLevel));
      playMathAppleDropSounds(inlineMathPanel);
    }

    const routeScroll = main.querySelector('[data-route-scroll]');
    const currentBoat = main.querySelector('[data-current-boat]');
    const idleVideo = main.querySelector('[data-boat-idle-video]');
    const sailingVideo = main.querySelector('[data-boat-video]');
    const currentStop = main.querySelector(`[data-stop="${currentLevel.id}"]`) || main.querySelector('[data-stop]');
    const stops = [...main.querySelectorAll('[data-stop]')];
    let activeMapTheme = currentMapTheme;
    const boatAssetSources = [
      MAP_VEHICLES.ocean.idle,
      MAP_VEHICLES.ocean.sailing,
      MAP_VEHICLES.desert.idle,
    ];
    boatAssetSources.forEach((src) => {
      const image = new Image();
      image.src = src;
    });
    const MAP_STOP_BEFORE_VEHICLE_MS = 1000;
    const BOAT_HOLD_MS = 0;
    const BOAT_SAIL_MS = 2800;
    const reduceBoatMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Paddle SFX: original clip is ~5.6s. At 2.0x it lands at ~2.8s, matching
    // BOAT_SAIL_MS so the rowing cadence finishes together with docking.
    const BOAT_PADDLE_SRC = 'assets/audio/boat/rowing-paddle.mp3?v=20260717-paddle-v1';
    const BOAT_PADDLE_RATE = 2.0;
    const paddleAudio = new Audio(BOAT_PADDLE_SRC);
    paddleAudio.preload = 'auto';
    paddleAudio.loop = false;
    paddleAudio.volume = BOAT_PADDLE_VOLUME;

    // WebAudio path: decode the MP3 once into an AudioBuffer and replay it via
    // AudioBufferSourceNode. This avoids the per-play .play() warm-up that
    // HTMLAudioElement suffers on Safari/Chrome (~100-700ms), which is what
    // was making the paddle sound land halfway through the sail animation.
    let paddleBuffer = null;
    let paddleBufferPromise = null;
    let paddleSourceNode = null;
    let paddleGainNode = null;
    const decodePaddleBuffer = (audioCtx) => {
      if (paddleBufferPromise) return paddleBufferPromise;
      paddleBufferPromise = fetch(BOAT_PADDLE_SRC)
        .then((r) => r.arrayBuffer())
        .then((buf) => audioCtx.decodeAudioData(buf))
        .then((decoded) => { paddleBuffer = decoded; return decoded; })
        .catch(() => null);
      return paddleBufferPromise;
    };
    let centeredStop = currentStop;
    let lastFeedbackStop = currentStop;
    let boatHomeStop = currentStop;
    let feedbackArmed = false;
    let scrollFrame = 0;
    let boatX = 0;
    let boatPhase = 'idle';
    let boatHoldTimer;
    let boatSailFrame = 0;
    let boatHomeFrozen = false;
    let camelFacing = 1;
    let camelTurnTimer = 0;
    let feedbackTimer;
    const locateToStop = (stop, behavior = 'smooth') => {
      if (!stop || !routeScroll) return false;
      const left = Math.max(0, stop.offsetLeft - (routeScroll.clientWidth - stop.offsetWidth) / 2);
      const previousScrollBehavior = routeScroll.style.scrollBehavior;
      if (behavior === 'auto') routeScroll.style.scrollBehavior = 'auto';
      routeScroll.scrollTo({ left, behavior });
      if (behavior === 'auto') routeScroll.style.scrollBehavior = previousScrollBehavior;
      return true;
    };
    const locateProgress = (behavior = 'smooth') => locateToStop(currentStop, behavior);

    /** 跳关：直接吸附到目标关，不跨岛连飞（禁跨段飞） */
    const locateToLevelId = (levelId, behavior = 'auto') => {
      const stop = main.querySelector(`[data-stop="${Number(levelId)}"]`);
      if (!stop) {
        showToast(`找不到第 ${levelId} 关`);
        return false;
      }
      // 打断进行中的航行，直接落点
      if (typeof interruptBoatSail === 'function') {
        try { interruptBoatSail(); } catch (_) {}
      }
      boatHomeStop = stop;
      centeredStop = stop;
      lastFeedbackStop = stop;
      stops.forEach((node) => node.classList.toggle('is-centered', node === stop));
      locateToStop(stop, behavior);
      setBoatX(0);
      setBoatSailing(false);
      if (typeof snapBoatToHome === 'function') {
        try { snapBoatToHome(); } catch (_) {}
      }
      const word = stop.dataset.word || '';
      showMapMessage(Number(levelId) === currentLevel.id
        ? `已回到第 ${levelId} 关${word ? ' · ' + word : ''}`
        : `已到达第 ${levelId} 关${word ? ' · ' + word : ''}`);
      return true;
    };

    const armIslandFeedback = () => {
      feedbackArmed = true;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext && !islandAudioContext) islandAudioContext = new AudioContext();
      islandAudioContext?.resume().catch(() => {});
      // Prime paddle audio inside the user-gesture so iOS Safari lets it play later.
      try { paddleAudio.load(); } catch (_) {}
      // Kick off WebAudio decode early — done in idle time, paid for before
      // the user even slides. The buffer is cached and reused every crossing.
      if (islandAudioContext) decodePaddleBuffer(islandAudioContext);
    };

    const startPaddleSfx = () => {
      if (reduceBoatMotion) return;
      if (activeMapTheme === 'desert') return;
      const audioCtx = islandAudioContext;
      // AudioContext is created on first user gesture; sometimes it's still
      // suspended (autoplay policy) when startPaddleSfx runs after the gesture
      // ended. Resume on demand and proceed regardless — BufferSource will
      // queue until the context actually plays.
      if (audioCtx) {
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }
      }
      const launchFromBuffer = (buffer) => {
        if (!buffer || !audioCtx) return false;
        try {
          if (paddleSourceNode) {
            try { paddleSourceNode.stop(); } catch (_) {}
            paddleSourceNode.disconnect();
          }
          if (paddleGainNode) paddleGainNode.disconnect();
          const src = audioCtx.createBufferSource();
          src.buffer = buffer;
          src.playbackRate.value = BOAT_PADDLE_RATE;
          const gain = audioCtx.createGain();
          gain.gain.value = BOAT_PADDLE_VOLUME;
          src.connect(gain).connect(audioCtx.destination);
          src.start(0);
          paddleSourceNode = src;
          paddleGainNode = gain;
          return true;
        } catch (_) {
          return false;
        }
      };
      if (audioCtx && paddleBuffer) {
        if (launchFromBuffer(paddleBuffer)) return;
      }
      if (audioCtx) {
        decodePaddleBuffer(audioCtx).then((buf) => {
          if (boatPhase === 'sailing') launchFromBuffer(buf);
        });
      }
      // Final fallback: HTMLAudioElement. Safari sometimes resumes the context
      // too late for BufferSource to fire inside the boat's 2.8s crossing.
      try {
        paddleAudio.currentTime = 0;
        paddleAudio.playbackRate = BOAT_PADDLE_RATE;
        paddleAudio.volume = BOAT_PADDLE_VOLUME;
        paddleAudio.play().catch(() => {});
      } catch (_) {}
    };

    const stopPaddleSfx = () => {
      try {
        if (paddleSourceNode) {
          try { paddleSourceNode.stop(); } catch (_) {}
          paddleSourceNode.disconnect();
          paddleSourceNode = null;
        }
        if (paddleGainNode) {
          paddleGainNode.disconnect();
          paddleGainNode = null;
        }
        paddleAudio.pause();
        paddleAudio.currentTime = 0;
      } catch (_) {}
    };

    const playIslandSound = () => {
      if (!islandAudioContext || islandAudioContext.state !== 'running') return;
      const now = islandAudioContext.currentTime;
      const oscillator = islandAudioContext.createOscillator();
      const gain = islandAudioContext.createGain();
      oscillator.frequency.setValueAtTime(620, now);
      oscillator.frequency.exponentialRampToValueAtTime(840, now + 0.07);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
      oscillator.connect(gain).connect(islandAudioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.12);
    };

    const getStopOffsetX = (stop) => {
      const viewportCenter = routeScroll.scrollLeft + routeScroll.clientWidth / 2;
      return (stop.offsetLeft + stop.offsetWidth / 2) - viewportCenter;
    };

    const setBoatX = (x) => {
      boatX = x;
      currentBoat.style.setProperty('--boat-x', `${x}px`);
    };

    const setCamelFacing = (direction) => {
      if (activeMapTheme !== 'desert') return;
      const nextFacing = direction < 0 ? -1 : 1;
      if (nextFacing === camelFacing) return;
      camelFacing = nextFacing;
      clearTimeout(camelTurnTimer);
      if (reduceBoatMotion) {
        currentBoat.style.setProperty('--camel-facing', String(nextFacing));
        currentBoat.classList.remove('is-camel-turning');
        return;
      }
      currentBoat.classList.add('is-camel-turning');
      camelTurnTimer = setTimeout(() => {
        currentBoat.style.setProperty('--camel-facing', String(nextFacing));
        camelTurnTimer = setTimeout(() => {
          currentBoat.classList.remove('is-camel-turning');
          camelTurnTimer = 0;
        }, 80);
      }, 100);
    };

    const setBoatSailing = (isSailing) => {
      currentBoat.classList.toggle('is-sailing', isSailing);
      if (idleVideo) {
        if (isSailing || reduceBoatMotion) {
          idleVideo.pause();
          if (reduceBoatMotion) currentBoat.classList.remove('has-idle-video');
        } else {
          idleVideo.play()
            .then(() => currentBoat.classList.add('has-idle-video'))
            .catch(() => currentBoat.classList.remove('has-idle-video'));
        }
      }
      if (!sailingVideo) return;
      if (!isSailing) {
        sailingVideo.pause();
        sailingVideo.currentTime = 0;
        return;
      }

      sailingVideo.currentTime = 0;
      sailingVideo.playbackRate = currentVehicle.playbackRate || 1;
      sailingVideo.play()
        .then(() => currentBoat.classList.add('has-sailing-video'))
        .catch(() => currentBoat.classList.remove('has-sailing-video'));
    };

    const cancelBoatSail = () => {
      clearTimeout(boatHoldTimer);
      stopPaddleSfx();
      if (boatSailFrame) {
        cancelAnimationFrame(boatSailFrame);
        boatSailFrame = 0;
      }
      boatPhase = 'idle';
      setBoatSailing(false);
    };

    const snapBoatToHome = () => {
      setBoatX(getStopOffsetX(boatHomeStop));
    };

    // 禁止把船“冻”在两关中间的假 home：任何中断都只能落回真实关卡节点。
    const hardCancelBoatMotion = () => {
      clearTimeout(boatHoldTimer);
      boatHoldTimer = 0;
      stopPaddleSfx();
      if (boatSailFrame) {
        cancelAnimationFrame(boatSailFrame);
        boatSailFrame = 0;
      }
      boatPhase = 'idle';
      boatHomeFrozen = false;
      setBoatSailing(false);
    };

    // 滑屏打断时，先把船/骆驼结算到已确认的目标关，再等待新的停留确认。
    const settleBoatAtLastConfirmedStop = () => {
      if (boatPhase === 'idle') return false;
      hardCancelBoatMotion();
      boatHomeStop = lastFeedbackStop;
      boatHomeFrozen = false;
      snapBoatToHome();
      return true;
    };

    /** 跳关/定位：立刻停航，由调用方把船吸附到真实关卡，绝不半路停 */
    const interruptBoatSail = () => {
      settleBoatAtLastConfirmedStop();
    };

    const finishBoatAtCenter = () => {
      boatPhase = 'idle';
      boatHomeFrozen = false;
      // 终点硬锁：永远停在当前停留关（居中关）前面，而不是半路坐标
      boatHomeStop = centeredStop || lastFeedbackStop;
      lastFeedbackStop = boatHomeStop;
      setBoatX(0);
      // Snap to idle pose immediately; pause the sailing webp at its first
      // frame so no rowing stroke is held in place after docking.
      setBoatSailing(false);
      stopPaddleSfx();
    };

    const startBoatSailToCenter = () => {
      boatPhase = 'sailing';
      const startX = boatX;
      const endX = 0;
      if (reduceBoatMotion || Math.abs(startX) < 1) {
        finishBoatAtCenter();
        return;
      }

      setBoatSailing(true);
      startPaddleSfx();

      const startedAt = performance.now();
      const sailMs = BOAT_SAIL_MS;
      const tick = (now) => {
        const t = Math.min(1, (now - startedAt) / sailMs);
        // Keep docking and the rowing pose in sync; ease-out made the boat look
        // parked under the island while the kids kept rowing.
        const eased = t;
        setBoatX(startX + (endX - startX) * eased);
        if (t < 1) {
          boatSailFrame = requestAnimationFrame(tick);
          return;
        }
        boatSailFrame = 0;
        finishBoatAtCenter();
      };
      boatSailFrame = requestAnimationFrame(tick);
    };

    // Island switches always depart from the last confirmed stop; scrolling the
    // map must not turn the current viewport position into a fake dock.
    const scheduleBoatCrossing = (direction) => {
      clearTimeout(boatHoldTimer);
      boatHoldTimer = 0;
      stopPaddleSfx();
      if (boatSailFrame) {
        cancelAnimationFrame(boatSailFrame);
        boatSailFrame = 0;
      }
      boatPhase = 'holding';
      boatHomeFrozen = false;
      setBoatSailing(false);
      snapBoatToHome();
      setCamelFacing(direction);
      boatHoldTimer = setTimeout(startBoatSailToCenter, BOAT_HOLD_MS);
    };

    const updateCenteredStop = () => {
      const center = routeScroll.scrollLeft + routeScroll.clientWidth / 2;
      const nextStop = stops.reduce((closest, stop) => (
        Math.abs(stop.offsetLeft + stop.offsetWidth / 2 - center)
          < Math.abs(closest.offsetLeft + closest.offsetWidth / 2 - center) ? stop : closest
      ));
      if (nextStop === centeredStop) return;
      const travelDirection = nextStop.offsetLeft < centeredStop.offsetLeft ? -1 : 1;
      cancelWordPronunciation();
      centeredStop.classList.remove('is-centered');
      nextStop.classList.add('is-centered');
      centeredStop = nextStop;
      // 滑动只换目标关，不改出发关；船/骆驼仍钉在上一停靠点。
      if (boatPhase === 'idle') {
        boatHomeStop = lastFeedbackStop;
        boatHomeFrozen = false;
      }
    };

    const confirmIslandSwitch = () => {
      if (!feedbackArmed) return;
      feedbackArmed = false;
      if (centeredStop === lastFeedbackStop) {
        // 仍在原关：若误处半路，立刻回正到关前（永不卡中间）
        if (boatPhase === 'idle') {
          boatHomeStop = lastFeedbackStop;
          boatHomeFrozen = false;
          snapBoatToHome();
          if (Math.abs(boatX) > 2) setBoatX(0);
        } else if (boatPhase === 'sailing' || boatPhase === 'holding') {
          // 继续驶向当前居中关，不中断
          if (boatPhase === 'holding' && Math.abs(boatX) < 1) finishBoatAtCenter();
        }
        return;
      }

      const travelDirection = centeredStop.offsetLeft < lastFeedbackStop.offsetLeft ? -1 : 1;
      const departStop = lastFeedbackStop;
      lastFeedbackStop = centeredStop;
      boatHomeFrozen = false;
      navigator.vibrate?.(30);
      playIslandSound();

      boatHomeStop = departStop;
      scheduleBoatCrossing(travelDirection);

      if (!state.preferences.autoPronunciation) return;
      if (!wordCanPronounce(centeredStop.dataset.word)) return;
      pronunciationTimer = setTimeout(() => {
        playWordPronunciation(
          centeredStop.dataset.word,
          centeredStop.querySelector('[data-speak-word]'),
        );
      }, 140);
    };

    // 轻点：只武装反馈，不打断航行（点屏不得把船卡在两关中间）
    // 真正改终点：靠 scroll 落定后的 confirmIslandSwitch
    const handleRouteIntent = () => {
      settleBoatAtLastConfirmedStop();
      armIslandFeedback();
    };
    // 拖动阈值：≥10px 才视为“要改道”的意图（与记忆一致）；轻点完全不碰船
    const BOAT_DRAG_INTERRUPT_PX = 10;
    let routePointerStart = null;
    const onRoutePointerDown = (event) => {
      armIslandFeedback();
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      routePointerStart = {
        x: event.clientX,
        y: event.clientY,
        id: event.pointerId,
      };
    };
    const onRoutePointerMove = (event) => {
      if (!routePointerStart || event.pointerId !== routePointerStart.id) return;
      const dx = event.clientX - routePointerStart.x;
      const dy = event.clientY - routePointerStart.y;
      if (Math.hypot(dx, dy) < BOAT_DRAG_INTERRUPT_PX) return;
      // 达到拖动阈值：只武装反馈，仍不冻船；等 scroll 落定重定向
      routePointerStart = null;
      settleBoatAtLastConfirmedStop();
      armIslandFeedback();
    };
    const onRoutePointerEnd = (event) => {
      if (routePointerStart && event.pointerId === routePointerStart.id) {
        routePointerStart = null;
      }
    };
    routeScroll.addEventListener('pointerdown', onRoutePointerDown, { passive: true });
    routeScroll.addEventListener('pointermove', onRoutePointerMove, { passive: true });
    routeScroll.addEventListener('pointerup', onRoutePointerEnd, { passive: true });
    routeScroll.addEventListener('pointercancel', onRoutePointerEnd, { passive: true });
    routeScroll.addEventListener('wheel', handleRouteIntent, { passive: true });
    routeScroll.addEventListener('keydown', handleRouteIntent);
    routeScroll.addEventListener('scroll', () => {
      settleBoatAtLastConfirmedStop();
      if (!scrollFrame) {
        scrollFrame = requestAnimationFrame(() => {
          scrollFrame = 0;
          updateCenteredStop();
          // Stick to previous island while scrolling / holding; sail uses its own rAF.
          // 航行中绝不 snap 到假 home（那是卡中间的根因之一）
          if (boatPhase === 'idle') snapBoatToHome();
        });
      }
      clearTimeout(feedbackTimer);
      // 滑动中保持 armed，落定后再确认终点关
      feedbackArmed = true;
      feedbackTimer = setTimeout(confirmIslandSwitch, MAP_STOP_BEFORE_VEHICLE_MS);
    }, { passive: true });

    const locateBtn = main.querySelector('[data-locate-progress]');
    const jumpBtn = main.querySelector('[data-map-jump]');
    const musicBtn = main.querySelector('[data-map-music-toggle]');
    // 定位钮：回到「最新进度关」。数学图无可见航线，直接切题；海/沙漠仍滚地图。
    locateBtn?.addEventListener('click', () => {
      if (currentMapTheme === 'math') {
        const homeId = progressLevelId;
        if (Number(currentLevel.id) === Number(homeId)) {
          showMapMessage(`已在第 ${homeId} 关 · 最新进度`);
          const pill = main.querySelector('[data-math-level-switch-indicator]');
          if (pill) {
            pill.classList.remove('is-changing');
            // force reflow so pop animation can replay
            void pill.offsetWidth;
            pill.classList.add('is-changing');
          }
          return;
        }
        showInlineMathLevel(homeId, `已回到第 ${homeId} 关最新进度`, 'drop');
        return;
      }
      locateToLevelId(progressLevelId, 'smooth');
    });
    // 跳关钮：两级选关（每 20 关一段，覆盖 200 关）；仅移动地图/切题，不写通关进度
    jumpBtn?.addEventListener('click', () => {
      armIslandFeedback();
      openMapJumpDialog({
        levels: worldLevels,
        currentLevelId: currentLevel.id,
        unlockedThrough: state.progress.unlockedThrough,
        trigger: jumpBtn,
        onDepart: (levelId) => {
          if (currentMapTheme === 'math') {
            showInlineMathLevel(levelId, `已到达第 ${levelId} 关`, 'drop');
            return;
          }
          locateToLevelId(levelId, 'auto');
        },
      });
    });
    // 背景音开关：三张地图共用 mapMusic 偏好，关即停 BGM + 环境音
    musicBtn?.addEventListener('click', () => {
      setPreference('mapMusic', state.preferences.mapMusic === false);
    });
    paintMapMusicToggle(musicBtn);
    requestAnimationFrame(() => {
      locateProgress('auto');
      centeredStop.classList.add('is-centered');
      boatHomeStop = currentStop;
      setBoatX(0);
      setBoatSailing(false);
    });
    // initialMessage 以前是常驻；数学图会顶掉「当前关卡」。统一 2.6s 后收起。
    if (initialMessage) {
      clearTimeout(state.messageTimer);
      state.messageTimer = setTimeout(() => {
        const el = main.querySelector('.map-message');
        if (el) el.hidden = true;
      }, 2600);
    }
  }

  function showMapMessage(text) {
    const message = main.querySelector('.map-message');
    message.textContent = text;
    message.hidden = false;
    clearTimeout(state.messageTimer);
    state.messageTimer = setTimeout(() => { message.hidden = true; }, 2600);
  }

  function removeGlobalHintHand() {
    document.querySelectorAll('[data-global-hint-hand]').forEach((hand) => hand.remove());
  }

  function mathQuestionParts(level) {
    const groups = Array.isArray(level.math?.groups) && level.math.groups.length
      ? level.math.groups
      : level.options.map((label, index) => ({ id: `math-${level.id}-${index}`, count: index, label }));
    const targetLabel = level.options[level.correct] || mathCountLabel(level.targetCount || 1);
    const questionText = questionPromptText(level);
    let objectIndex = 0;
    const objectMarkup = (count) => {
      const safeCount = Math.max(0, Math.min(10, Number(count) || 0));
      if (safeCount === 0) return '';
      return Array.from(
        { length: safeCount },
        () => `<span class="math-object" style="--math-object-delay:${objectIndex++ * 190}ms" aria-hidden="true"></span>`,
      ).join('');
    };
    const choicesMarkup = groups.map((group, index) => `
      <button class="math-choice" type="button" data-math-choice="${index}" style="--math-choice-delay:${index * 56}ms" aria-label="${escapeHtml(group.label)}">
        <span class="math-plate" aria-hidden="true"><span class="math-object-set" data-count="${Math.max(0, Math.min(10, Number(group.count) || 0))}">${objectMarkup(group.count)}</span></span>
        <span class="math-choice-label">${escapeHtml(group.label)}</span>
        <span class="result-badge" aria-hidden="true"></span>
      </button>`).join('');
    return {
      choicesMarkup,
      optionCount: groups.length,
      targetLabel,
      questionMarkup: escapeHtml(questionText)
        .replace(String(level.targetCount || ''), `<strong>${level.targetCount || 1}</strong>`),
    };
  }

  function mathQuestionTableMarkup(level) {
    const parts = mathQuestionParts(level);
    return `
          <div class="math-table">
            <div class="math-question-card">
              <p class="question-text">${parts.questionMarkup}</p>
            </div>
            <div class="math-options math-options--count-${parts.optionCount}" data-math-options>${parts.choicesMarkup}</div>
          </div>
          <div class="quiz-footer">
            <button class="submit-btn" type="button" data-submit hidden aria-label="提交答案">
              <svg viewBox="0 0 24 24"><path d="M4 12.5l5.2 5.2L20 6.8"/></svg>
            </button>
            <div class="feedback-banner" data-feedback hidden role="status" aria-live="polite" tabindex="-1"></div>
            <button class="replay-btn" type="button" data-continue-map hidden aria-label="继续下一关">
              <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 2.6-6.3"/><path d="M3 4v5h5"/></svg>
            </button>
          </div>`;
  }

  function bindInlineMathQuestion(root, level) {
    const optionsBox = root.querySelector('[data-math-options]');
    const feedback = root.querySelector('[data-feedback]');
    const continueBtn = root.querySelector('[data-continue-map]');
    const submitBtn = root.querySelector('[data-submit]');
    const statePill = root.querySelector('[data-detail-state]');
    const stepButtons = root.querySelectorAll('[data-math-step]');
    if (!optionsBox || !feedback || !continueBtn || !submitBtn) return;
    const targetLabel = mathQuestionParts(level).targetLabel;
    let selectedIndex = null;
    let quizState = 'answering';
    const startedAt = typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
    let latestCoachPlan = null;

    function selectChoice(index, card) {
      if (quizState !== 'answering') return;
      selectedIndex = index;
      optionsBox.querySelectorAll('.math-choice').forEach((choice) => choice.classList.remove('is-selected'));
      card.classList.add('is-selected');
      submitBtn.hidden = false;
    }

  function transitionToInlineMathLevel(targetId, trigger) {
      const nextId = normalizeMathMapLevelId(targetId, level.id);
      if (nextId === level.id) return;
      const targetLevel = activeLevelById(nextId);
      if (!targetLevel) {
        showMapMessage('没有找到这个关卡。');
        return;
      }
      const access = getLevelAccess(nextId, state.progress, state.preferences.vipActive === true);
      if (access === 'paid') {
        showMapMessage(paidAccessMessage);
        openPaywallDialog(nextId, trigger);
        return;
      }
      if (access === 'locked') {
        showMapMessage(`先完成第 ${state.progress.unlockedThrough} 关，再继续冒险。`);
        return;
      }
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        showInlineMathLevel(nextId);
        return;
      }
      root.querySelector('.math-inline-panel')?.classList.add('is-switching-out');
      root.querySelectorAll('button:not([disabled])').forEach((button) => { button.disabled = true; });
      setTimeout(() => {
        showInlineMathLevel(nextId, '', 'drop');
      }, 190);
    }

    function continueInlineMath() {
      const next = resolveMathCoachContinueTarget(latestCoachPlan, level.id)
        || resolveMathContinueLevel(state.mathAttempts, level.id, DISPLAY_LEVEL_COUNT);
      const nextId = next.levelId;
      if (next.reason === 'repeat-current') {
        showInlineMathLevel(level.id, '再练一次', 'drop');
        return;
      }
      if (nextId > level.id) {
        transitionToInlineMathLevel(nextId, continueBtn);
        return;
      }
      renderMap('本关已完成');
    }

    function submitAnswer() {
      if (selectedIndex === null || quizState !== 'answering') return;
      quizState = 'judging';
      submitBtn.hidden = true;
      const card = optionsBox.children[selectedIndex];
      const worldLevels = activeWorldLevels();
      const result = applyQuizAnswer(state.progress, level.id, selectedIndex, level.correct, worldLevels.length);
      const endedAt = typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();
      const attempt = recordLocalMathAttempt(level, selectedIndex, result.correct, endedAt - startedAt);
      const coachPlanPromise = requestMathCoachPlan(level, attempt).then((plan) => {
        latestCoachPlan = rememberMathCoachPlan(level, plan) || plan;
        return latestCoachPlan;
      });

      if (result.correct) {
        const wasCompleted = state.progress.completed.includes(level.id);
        quizState = 'correct';
        card.classList.remove('is-selected');
        card.classList.add('is-correct');
        state.progress = result.progress;
        state.progressByWorld[state.preferences.mapWorld] = state.progress;
        recordLearningActivity();
        persistLearningStateLocal();
        recordQuizAttemptSync({
          worldId: state.preferences.mapWorld,
          levelId: level.id,
          selected: level.options[selectedIndex],
          correct: targetLabel,
          isCorrect: true,
        });
        scheduleLearningSync();
        if (statePill) statePill.textContent = '已完成';
        feedback.hidden = false;
        feedback.className = 'feedback-banner correct';
        feedback.innerHTML = `<span class="fb-mark correct-mark" aria-hidden="true"></span><span class="fb-text">答对啦！<small>${wasCompleted ? '本关已经完成。' : completionUnlockText(level, state.progress, state.preferences.vipActive === true, worldLevels)}</small></span>`;
        coachPlanPromise.then((plan) => {
          if (quizState === 'correct') speakMathVoiceFeedback(plan.feedbackText, true);
        });
        continueBtn.hidden = false;
      } else {
        const nextVariant = adaptMathLevel(level, state.mathAttempts);
        const shouldRefreshEasier = nextVariant.math?.adaptiveMode === 'easier' && level.math?.adaptiveMode !== 'easier';
        recordQuizAttemptSync({
          worldId: state.preferences.mapWorld,
          levelId: level.id,
          selected: level.options[selectedIndex],
          correct: targetLabel,
          isCorrect: false,
        });
        scheduleLearningSync();
        card.classList.remove('is-selected');
        card.classList.add('is-wrong');
        feedback.hidden = false;
        feedback.className = 'feedback-banner wrong';
        feedback.innerHTML = `<span class="fb-mark wrong-mark" aria-hidden="true"></span><span class="fb-text">再数一数。<small>${escapeHtml(mathVoiceFeedback(shouldRefreshEasier ? 'wrong-easier' : 'wrong', { targetCount: level.targetCount }).text)}</small></span>`;
        coachPlanPromise.then((plan) => {
          if (quizState !== 'judging') return;
          const detail = feedback.querySelector('.fb-text small');
          if (detail) detail.textContent = plan.feedbackText;
          speakMathVoiceFeedback(plan.feedbackText, false);
        });
        setTimeout(() => {
          coachPlanPromise.then((plan) => {
            if (quizState !== 'judging') return;
            const plannedMode = plan?.variantMode || nextVariant.math?.adaptiveMode;
            if (plannedMode === 'easier' && level.math?.adaptiveMode !== 'easier') {
              showInlineMathLevel(level.id, '', 'drop');
              return;
            }
            card.classList.remove('is-wrong');
            selectedIndex = null;
            feedback.hidden = true;
            quizState = 'answering';
          });
        }, 1800);
      }
    }

    optionsBox.querySelectorAll('[data-math-choice]').forEach((button) => {
      button.addEventListener('click', () => selectChoice(Number(button.dataset.mathChoice), button));
    });
    submitBtn.addEventListener('click', submitAnswer);
    continueBtn.addEventListener('click', continueInlineMath);
    stepButtons.forEach((button) => {
      button.addEventListener('click', () => {
        transitionToInlineMathLevel(level.id + Number(button.dataset.mathStep), button);
      });
    });
  }

  // Math never uses the old island full-page level-quiz shell (topbar + hidden bottom tabs).
  // All count/math levels stay on the map surface via showInlineMathLevel.
  function renderDetail(level) {
    if (level.worldId === 'math' || level.itemType === 'count') {
      state.preferences.mapWorld = 'math';
      state.progress = state.progressByWorld.math;
      try { localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(state.preferences)); } catch {}
      showInlineMathLevel(level.id, `已在数学地图打开第 ${level.id} 关`);
      setActiveTab('map');
      return;
    }

    removeGlobalHintHand();
    const alreadyCompleted = state.progress.completed.includes(level.id);
    const correctWord = level.options[level.correct];
    // 题型一：2 选项（正确 + 1 干扰项），适配幼儿大触控区
    const distractors = level.options.filter((_, i) => i !== level.correct);
    const lessonOptions = [correctWord, distractors[0] || correctWord];
    const questionSpoken = questionPromptText(level);
    const questionAudioSrc = questionAudioSrcFor(level);
    const questionHtml = level.worldId === 'desert' || level.itemType === 'expression'
      ? `小朋友，视频里的英语，<br>哪一句是在说 <strong>「${level.zhTitle}」</strong>？`
      : `小朋友，视频里学到的单词，<br>哪一个是 <strong>「${level.zhTitle}」</strong> 的意思？`;
    const topicShort = String(level.topic || '').split('·')[0].trim();
    let videoSource = levelVideoSourceFor(level);
    if (!videoSource) {
      ensureLevelVideoDownload(level);
      videoSource = levelVideoSourceFor(level);
    }
    const videoStageMarkup = videoSource ? `
            <div class="video-card">
              <div class="video-frame">
                <video data-video playsinline preload="metadata" src="${escapeHtml(videoSource)}" data-video-source="${escapeHtml(level.videoMeta?.source || 'local')}" data-video-task-id="${escapeHtml(level.videoMeta?.taskId || '')}" data-video-qa="${escapeHtml(level.videoMeta?.qa || '')}" data-video-audio="${escapeHtml(level.videoMeta?.audio || '')}"></video>
                <button class="play-overlay" type="button" data-play-overlay aria-label="播放视频">
                  <span class="play-circle" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </span>
                </button>
              </div>
              <p class="video-hint">认真看完，问题马上出现</p>
              <div class="video-progress" aria-hidden="true"><i data-video-progress></i></div>
            </div>` : `
            <div class="video-card video-card--download">
              <div class="video-frame video-frame--download">
                <button class="level-video-loading-close" type="button" data-back-map aria-label="返回闯关地图">
                  <svg aria-hidden="true" viewBox="0 0 32 32"><path d="m9 9 14 14M23 9 9 23"/></svg>
                </button>
                ${levelVideoDownloadMarkup(level)}
              </div>
            </div>`;

    const wordAudioSrc = (word) => {
      const local = wordAudioSrcFor(word);
      if (local) return local;
      const safe = String(word || '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      return `assets/audio/words/${safe}.mp3`;
    };

    main.innerHTML = `
      <article class="view level-quiz" data-level-quiz aria-labelledby="detail-title">
        <nav class="topbar">
          <button class="back-btn" type="button" data-back-map aria-label="返回闯关地图">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>
          </button>
          <span class="level-pill" id="detail-title">第 ${level.id} 关 · ${topicShort || level.title}</span>
          <span class="status-pill" data-detail-state>${alreadyCompleted ? '已完成' : '进行中'}</span>
          ${globalUpdateButtonMarkup('level')}
        </nav>

        <section class="stage" data-stage-video aria-label="课程视频">
          <div class="stage-video-inner">
            ${videoStageMarkup}
          </div>
        </section>

        <section class="stage" data-stage-quiz hidden aria-label="回答问题">
          <div class="quiz-layout">
            <div class="question-card">
              <p class="question-text" data-question-text>${questionHtml}</p>
              <div class="question-actions">
                <button class="icon-btn rewatch-btn" type="button" data-rewatch aria-label="再看一遍视频">
                  <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 2.6-6.3"/><path d="M3 4v5h5"/></svg>
                </button>
                <button class="icon-btn listen-question-btn" type="button" data-listen-question aria-label="听题目：${escapeHtml(questionSpoken)}"${questionAudioSrc ? '' : ' disabled'}>
                  <svg viewBox="0 0 24 24"><path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>
                </button>
              </div>
            </div>

            <div class="options" data-options></div>

            <div class="quiz-footer">
              <button class="submit-btn" type="button" data-submit hidden aria-label="提交答案">
                <svg viewBox="0 0 24 24"><path d="M4 12.5l5.2 5.2L20 6.8"/></svg>
              </button>
              <div class="feedback-banner" data-feedback hidden role="status" aria-live="polite" tabindex="-1"></div>
              <button class="replay-btn" type="button" data-continue-map hidden aria-label="返回地图继续闯关">
                <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 2.6-6.3"/><path d="M3 4v5h5"/></svg>
              </button>
            </div>
          </div>
        </section>
      </article>
      <div class="celebration" data-celebration hidden aria-hidden="true">
        <div class="celebration-lottie" data-celebration-lottie></div>
      </div>`;

    const stageVideo = main.querySelector('[data-stage-video]');
    const stageQuiz = main.querySelector('[data-stage-quiz]');
    const video = main.querySelector('[data-video]');
    const playOverlay = main.querySelector('[data-play-overlay]');
    const videoProgress = main.querySelector('[data-video-progress]');
    const optionsBox = main.querySelector('[data-options]');
    const feedback = main.querySelector('[data-feedback]');
    const continueBtn = main.querySelector('[data-continue-map]');
    const submitBtn = main.querySelector('[data-submit]');
    const listenQuestionBtn = main.querySelector('[data-listen-question]');
    const celebration = main.querySelector('[data-celebration]');
    const statePill = main.querySelector('[data-detail-state]');

    let quizState = 'answering';
    let selectedIndex = null;
    let currentAudio = null;
    let round = null;
    let audioCtx = null;
    let idleTimer = 0;
    let hintOptionTimer = 0;
    let hintOptionIndex = 0;
    let hintAnim = null;
    let celebrationAnim = null;
    let hintHand = document.querySelector('[data-global-hint-hand]');
    let hintLottieHost = null;
    const celebrationLottieHost = celebration.querySelector('[data-celebration-lottie]');

    function ensureHintHost() {
      if (!hintHand) {
        hintHand = document.createElement('div');
        hintHand.className = 'hint-hand';
        hintHand.setAttribute('data-global-hint-hand', '');
        hintHand.setAttribute('aria-hidden', 'true');
        hintHand.hidden = true;
        hintHand.innerHTML = '<div class="hint-hand-lottie" data-hint-lottie></div>';
        document.body.appendChild(hintHand);
      }
      hintLottieHost = hintHand.querySelector('[data-hint-lottie]');
      return hintHand;
    }

    function ensureHintLottie() {
      ensureHintHost();
      if (hintAnim) return hintAnim;
      const lottieApi = window.lottie || window.bodymovin;
      const data = window.__HAND_TAP_LOTTIE_DATA;
      if (!lottieApi || !hintLottieHost || !data) {
        setTimeout(() => {
          if (!hintAnim && hintHand && !hintHand.hidden) ensureHintLottie();
        }, 120);
        return null;
      }
      try {
        hintLottieHost.innerHTML = '';
        hintAnim = lottieApi.loadAnimation({
          container: hintLottieHost,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: JSON.parse(JSON.stringify(data)),
        });
        try { hintAnim.goToAndPlay(0, true); } catch (_) {
          try { hintAnim.play(); } catch (__) {}
        }
      } catch (err) {
        console.warn('[hint-hand] lottie init failed', err);
        hintAnim = null;
      }
      return hintAnim;
    }

    function destroyHintLottie() {
      stopOptionHintLoop();
      if (hintAnim) {
        try { hintAnim.destroy(); } catch (_) {}
        hintAnim = null;
      }
      if (hintHand) {
        hintHand.hidden = true;
        hintHand.classList.remove('is-visible');
      }
      if (hintLottieHost) hintLottieHost.innerHTML = '';
    }

    function ensureCelebrationLottie() {
      if (celebrationAnim) return celebrationAnim;
      const lottieApi = window.lottie || window.bodymovin;
      const data = window.__CORRECT_CELEBRATION_LOTTIE_DATA;
      if (!lottieApi || !celebrationLottieHost || !data) return null;
      celebrationLottieHost.innerHTML = '';
      celebrationAnim = lottieApi.loadAnimation({
        container: celebrationLottieHost,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        animationData: JSON.parse(JSON.stringify(data)),
      });
      return celebrationAnim;
    }

    Object.defineProperty(window, '__correctIndex', { configurable: true, get: () => (round ? round.correctIndex : -1) });
    Object.defineProperty(window, '__quizState', { configurable: true, get: () => quizState });

    function isCurrentQuizView() {
      const route = routeFromHash();
      return route.type === 'level' && route.id === level.id && stageQuiz.isConnected;
    }

    const goBackMap = () => {
      stopSpeaking();
      hideHint();
      destroyHintLottie();
      if (history.state?.fromMap) history.back();
      else {
        history.replaceState(null, '', '#map');
        render();
        window.scrollTo(0, 0);
      }
    };

    main.querySelectorAll('[data-back-map]').forEach((button) => {
      button.addEventListener('click', goBackMap);
    });

    function shuffle(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function startRound() {
      const options = shuffle(lessonOptions.map((word) => ({ word, audio: wordAudioSrc(word) })));
      round = {
        options,
        correctIndex: options.findIndex((o) => o.word === correctWord),
      };
      quizState = 'answering';
      selectedIndex = null;
      feedback.hidden = true;
      continueBtn.hidden = true;
      submitBtn.hidden = true;
      renderOptions();
    }

    function tone(freq, start, duration, type = 'sine', gain = 0.1) {
      try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const vol = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        vol.gain.setValueAtTime(0, audioCtx.currentTime + start);
        vol.gain.linearRampToValueAtTime(gain, audioCtx.currentTime + start + 0.02);
        vol.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration);
        osc.connect(vol).connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      } catch (_) {}
    }
    const soundCorrect = () => { }; // Deprecated: keep for backward compatibility; now no tone used.
    const soundWrong = () => { };
    const soundSelect = () => { tone(440, 0, 0.09, 'sine', 0.05); };

    function stopSpeaking() {
      if (mathCoachAudioEl) {
        mathCoachAudioEl.pause();
        mathCoachAudioEl.currentTime = 0;
        mathCoachAudioEl = null;
      }
      mathFeedbackSpeechToken += 1;
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    cancelWordPronunciation();
    main.querySelectorAll('.is-playing').forEach((b) => b.classList.remove('is-playing'));
  }

    function markPlaying(btn) {
      btn.classList.add('is-playing');
      return () => btn.classList.remove('is-playing');
    }

    function playFileAudio(btn, src, volume = WORD_AUDIO_VOLUME) {
      const audio = new Audio(src);
      audio.volume = volume;
      currentAudio = audio;
      const done = markPlaying(btn);
      const finish = () => { if (currentAudio === audio) currentAudio = null; done(); };
      audio.addEventListener('ended', finish);
      audio.addEventListener('error', finish);
      audio.play().catch(finish);
    }

    function speakQuestion() {
      stopSpeaking();
      const questionAudio = questionAudioSrcFor(level);
      if (questionAudio) playFileAudio(listenQuestionBtn, questionAudio, QUESTION_AUDIO_VOLUME);
    }

    function showHintAt(el) {
      if (!el || !el.isConnected || !isCurrentQuizView()) {
        hideHint();
        return;
      }
      ensureHintHost();
      ensureHintLottie();
      const r = el.getBoundingClientRect();
      // 锚在目标中心偏右下；容器自身用 translate 把指尖对准锚点
      const x = r.left + r.width * 0.62;
      const y = r.top + r.height * 0.55;
      hintHand.style.left = `${Math.round(x)}px`;
      hintHand.style.top = `${Math.round(y)}px`;
      hintHand.hidden = false;
      hintHand.classList.add('is-visible');
      if (hintAnim) {
        try { hintAnim.goToAndPlay(0, true); } catch (_) {}
      }
    }
    function hideHint() {
      stopOptionHintLoop();
      if (!hintHand) return;
      hintHand.hidden = true;
      hintHand.classList.remove('is-visible');
    }
    function stopOptionHintLoop() {
      clearInterval(hintOptionTimer);
      hintOptionTimer = 0;
    }
    function showNextOptionHint() {
      const choices = optionsBox.children;
      if (!isCurrentQuizView() || stageQuiz.hidden || quizState !== 'answering' || selectedIndex !== null || !choices.length) {
        stopOptionHintLoop();
        return;
      }
      showHintAt(choices[hintOptionIndex % choices.length]);
      hintOptionIndex += 1;
    }
    function hintToOptions() {
      stopOptionHintLoop();
      hintOptionIndex = 0;
      showNextOptionHint();
      if (optionsBox.children.length > 1) hintOptionTimer = setInterval(showNextOptionHint, 1200);
    }
    function hintToSubmit() {
      stopOptionHintLoop();
      showHintAt(submitBtn);
    }

    function armIdleInvite() {
      clearTimeout(idleTimer);
      optionsBox.classList.remove('is-idle');
      idleTimer = setTimeout(() => {
        if (isCurrentQuizView() && !stageQuiz.hidden && quizState === 'answering') optionsBox.classList.add('is-idle');
      }, 8000);
    }
    main.addEventListener('pointerdown', armIdleInvite);

    function renderOptions() {
      optionsBox.innerHTML = '';
      round.options.forEach((option, index) => {
        const wordText = String(option.word || '');
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'option-card';
        if (wordText.length > 24) card.classList.add('has-long-text');
        if (wordText.length > 80) card.classList.add('has-very-long-text');
        card.dataset.index = String(index);
        card.setAttribute('aria-label', `选项：${wordText}，点我选择`);
        card.innerHTML = `
          <span class="option-word">${escapeHtml(wordText)}</span>
          <span class="speak-btn" role="button" tabindex="0" aria-label="播放 ${escapeHtml(wordText)} 的发音">
            <svg viewBox="0 0 24 24"><path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>
          </span>
          <span class="result-badge" aria-hidden="true"></span>`;

        const speakBtn = card.querySelector('.speak-btn');
        const speakHandler = (event) => {
          event.stopPropagation();
          stopSpeaking();
          if (!playWordPronunciation(option.word, speakBtn)) {
            playFileAudio(speakBtn, option.audio);
          } else {
            markPlaying(speakBtn);
            setTimeout(() => speakBtn.classList.remove('is-playing'), 1800);
          }
        };
        speakBtn.addEventListener('click', speakHandler);
        speakBtn.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); speakHandler(event); }
        });
        card.addEventListener('click', () => selectOption(index, card));
        optionsBox.appendChild(card);
      });
    }

    function selectOption(index, card) {
      if (quizState !== 'answering') return;
      stopSpeaking();
      optionsBox.classList.remove('is-idle');

      if (selectedIndex === index) {
        selectedIndex = null;
        card.classList.remove('is-selected');
        submitBtn.hidden = true;
        hintToOptions();
        return;
      }

      selectedIndex = index;
      optionsBox.querySelectorAll('.option-card').forEach((c) => c.classList.remove('is-selected'));
      card.classList.add('is-selected');
      submitBtn.hidden = false;
      soundSelect();
      const opt = round.options[index];
      if (!playWordPronunciation(opt.word, card.querySelector('.speak-btn'))) {
        playFileAudio(card.querySelector('.speak-btn'), opt.audio);
      }
      hintToSubmit();
    }

    function submitAnswer() {
      if (selectedIndex === null || quizState !== 'answering') return;
      quizState = 'judging';
      stopSpeaking();
      submitBtn.hidden = true;
      hideHint();

      const card = optionsBox.children[selectedIndex];
      const selectedWord = round.options[selectedIndex].word;
      const selected = level.options.indexOf(selectedWord);
      const worldLevels = activeWorldLevels();
      const result = applyQuizAnswer(state.progress, level.id, selected, level.correct, worldLevels.length);

      if (result.correct) {
        quizState = 'correct';
        card.classList.remove('is-selected');
        card.classList.add('is-correct');
        card.querySelector('.result-badge').textContent = '';

        const wasCompleted = state.progress.completed.includes(level.id);
        state.progress = result.progress;
        state.progressByWorld[state.preferences.mapWorld] = state.progress;
        state.mistakeBook = resolveMistake(state.mistakeBook, level.id);
        recordLearningActivity();
        try { localStorage.setItem(PREVIEW_PROGRESS_KEY, JSON.stringify(state.progressByWorld)); } catch {}
        try { localStorage.setItem(MISTAKE_BOOK_KEY, JSON.stringify(state.mistakeBook)); } catch {}
        recordQuizAttemptSync({
          worldId: state.preferences.mapWorld,
          levelId: level.id,
          selected: selectedWord,
          correct: correctWord,
          isCorrect: true,
        });
        scheduleLearningSync();
        if (statePill) statePill.textContent = '已完成';

        const unlockText = wasCompleted
          ? '本关已经完成。'
          : completionUnlockText(level, state.progress, state.preferences.vipActive === true, worldLevels);

        feedback.hidden = false;
        feedback.className = 'feedback-banner correct';
        feedback.innerHTML = `<span class="fb-mark correct-mark" aria-hidden="true"></span><span class="fb-text">答对啦！太棒了！<small>${correctWord} 就是「${level.zhTitle}」 · ${unlockText}</small></span>`;
        soundCorrect();
        playFileAudio(feedback, FEEDBACK_AUDIO_SRC.correct, FEEDBACK_AUDIO_VOLUME);
        celebrate();
        continueBtn.hidden = false;
        setTimeout(() => {
          if (quizState === 'correct') {
            playWordPronunciation(correctWord, card.querySelector('.speak-btn'));
          }
        }, 2600);
      } else {
        state.mistakeBook = recordMistake(state.mistakeBook, level, level.options[selected]);
        try { localStorage.setItem(MISTAKE_BOOK_KEY, JSON.stringify(state.mistakeBook)); } catch {}
        recordQuizAttemptSync({
          worldId: state.preferences.mapWorld,
          levelId: level.id,
          selected: selectedWord,
          correct: correctWord,
          isCorrect: false,
        });
        scheduleLearningSync();

        card.classList.remove('is-selected');
        card.classList.add('is-wrong');
        card.querySelector('.result-badge').textContent = '';
        feedback.hidden = false;
        feedback.className = 'feedback-banner wrong';
        feedback.innerHTML = '<span class="fb-mark wrong-mark" aria-hidden="true"></span><span class="fb-text">答错啦，再试一次吧！<small>点发音键可以再听一听。</small></span>';
        soundWrong();
        playFileAudio(feedback, FEEDBACK_AUDIO_SRC.wrong, FEEDBACK_AUDIO_VOLUME);
        setTimeout(() => {
          card.classList.remove('is-wrong');
          card.querySelector('.result-badge').textContent = '';
          selectedIndex = null;
          feedback.hidden = true;
          quizState = 'answering';
          hintToOptions();
        }, 3400);
      }
    }

    function celebrate() {
      celebration.hidden = false;
      const anim = ensureCelebrationLottie();
      try { anim?.goToAndPlay(0, true); } catch (_) {}
      setTimeout(() => { celebration.hidden = true; }, 1700);
    }

    function showQuizStage() {
      if (!stageQuiz.hidden) return;
      stopSpeaking();
      stageVideo.classList.add('lq-leaving');
      setTimeout(() => {
        if (!isCurrentQuizView()) return;
        stageVideo.hidden = true;
        stageQuiz.hidden = false;
        stageQuiz.classList.add('lq-entering');
        requestAnimationFrame(() => requestAnimationFrame(() => stageQuiz.classList.remove('lq-entering')));
        speakQuestion();
        armIdleInvite();
        setTimeout(() => {
          if (isCurrentQuizView() && !stageQuiz.hidden && quizState === 'answering' && selectedIndex === null) hintToOptions();
        }, 2200);
      }, 450);
    }

    function rewatchVideo() {
      stopSpeaking();
      hideHint();
      if (!video) {
        stageQuiz.hidden = true;
        stageVideo.hidden = false;
        ensureLevelVideoDownload(level);
        refreshLevelVideoDownloadPanel(level);
        return;
      }
      startRound();
      stageQuiz.hidden = true;
      stageVideo.hidden = false;
      stageVideo.classList.remove('lq-leaving');
      video.currentTime = 0;
      videoProgress.style.width = '0%';
      playOverlay.hidden = true;
      video.play().catch(() => { playOverlay.hidden = false; });
    }

    if (video && playOverlay) {
      playOverlay.addEventListener('click', () => {
        playOverlay.hidden = true;
        hideHint();
        video.play().catch(() => { playOverlay.hidden = false; });
      });
      video.addEventListener('timeupdate', () => {
        if (video.duration) videoProgress.style.width = `${(video.currentTime / video.duration) * 100}%`;
      });
      video.addEventListener('ended', showQuizStage);
      // 视频加载失败时仍允许进入答题（不卡死）
      video.addEventListener('error', () => {
        playOverlay.hidden = true;
        showQuizStage();
      });
    } else {
      ensureLevelVideoDownload(level);
      refreshLevelVideoDownloadPanel(level);
    }

    main.querySelector('[data-rewatch]').addEventListener('click', rewatchVideo);
    listenQuestionBtn.addEventListener('click', speakQuestion);
    submitBtn.addEventListener('click', submitAnswer);
    continueBtn.addEventListener('click', goBackMap);

    startRound();
    // 立刻出现引导手（指向播放按钮）
    requestAnimationFrame(() => {
      if (playOverlay && isCurrentQuizView() && !playOverlay.hidden) showHintAt(playOverlay);
    });
    setTimeout(() => {
      if (playOverlay && isCurrentQuizView() && !playOverlay.hidden) showHintAt(playOverlay);
    }, 400);
  }

  // 排行榜名次徽章 — Animal Island 柔和圆角数字徽章（替代金属奖牌）
  function getRankBadge(rank) {
    return `<span class="rank-badge rank-${rank}" aria-label="第 ${rank} 名">${rank}</span>`;
  }

  // 获取用户头像（基于名字生成一致的 CSS 纯色几何头像，无 emoji）
  // 生成柔和的纯色背景和姓名首字
  function getAvatarInitials(name) {
    if (!name) return '?';
    const chars = name.trim().split(/\s+/);
    const initials = chars.length >= 2
      ? chars[0][0] + chars[1][0]
      : (name[0] || '?');
    const upperInitials = initials.toUpperCase();

    // 基于名字生成一致的颜色索引（使用暖色系 Pastel，全部低饱和）
    const avatarColors = [
      { bg: '#f7cd67', text: '#725d42' }, // 暖黄
      { bg: '#b8e8df', text: '#2a6b5a' }, // 淡薄荷
      { bg: '#f5c9a8', text: '#725d42' }, // 杏桃
      { bg: '#ffe8a3', text: '#794f27' }, // 黄油
      { bg: '#c8e6c9', text: '#3d5c40' }, // 淡绿
      { bg: '#ffd4b8', text: '#725d42' }, // 珊瑚淡
      { bg: '#d4e4f7', text: '#4a6080' }, // 淡蓝灰（低饱和）
      { bg: '#e8dcc8', text: '#725d42' }, // 燕麦
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash = hash & hash;
    }
    const colorIndex = Math.abs(hash) % avatarColors.length;
    const { bg, text } = avatarColors[colorIndex];

    return `<span class="avatar-initials" style="background:${bg};color:${text}">${escapeHtml(upperInitials)}</span>`;
  }

  function renderRanking() {
    const allRankings = buildLocalRankings(state.progress, state.preferences);
    const currentRanking = allRankings.find((person) => person.isCurrent);

    // 空状态处理
    if (allRankings.length === 0) {
      main.innerHTML = `
        <section class="view ranking-view" aria-labelledby="ranking-title">
          <div class="ranking-empty">
            <div class="empty-illustration">
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r="50" fill="#e6f9f6" stroke="#19c8b9" stroke-width="2"/>
                <circle cx="60" cy="55" r="22" fill="#19c8b9" opacity="0.15"/>
                <path d="M47 62 C47 52, 73 52, 73 62 L73 68 L47 68 Z" fill="#19c8b9" opacity="0.4"/>
                <path d="M60 38 L63 48 L73 48 L65 54 L68 64 L60 58 L52 64 L55 54 L47 48 L57 48 Z" fill="#19c8b9"/>
                <rect x="45" y="68" width="30" height="4" rx="2" fill="#c4b89e" opacity="0.5"/>
              </svg>
            </div>
            <h2 id="ranking-title">英语星排行榜</h2>
            <p class="empty-message">还没有排行榜数据</p>
            <p class="empty-hint">完成闯关即可上榜，快去冒险吧！</p>
          </div>
        </section>`;
      return;
    }

    const podiumOrder = [allRankings[1], allRankings[0], allRankings[2]].filter(Boolean);
    const podiumRanks = [2, 1, 3];
    const podiumClasses = ['second', 'first', 'third'];

    // 前三名领奖台渲染
    const podium = podiumOrder.map((person, index) => {
      const rank = podiumRanks[index];
      const podiumHeight = rank === 1 ? '9.5rem' : rank === 2 ? '8.4rem' : '7.7rem';
      const safeName = escapeHtml(person.name);
      return `
        <article class="podium-card ${podiumClasses[index]}${person.isCurrent ? ' current-user' : ''}" style="min-height: ${podiumHeight}" aria-label="第 ${rank} 名 ${safeName} ${person.score} 颗英语星">
          <div class="podium-avatar-wrapper">
            <div class="podium-avatar">${getAvatarInitials(person.name)}</div>
            ${getRankBadge(rank)}
          </div>
          <p class="podium-name">${safeName}</p>
          <p class="podium-score">${person.score} <span class="score-unit">英语星</span></p>
        </article>`;
    }).join('');

    // 普通列表渲染（从第4名开始）
    const remaining = allRankings.slice(3).map((person, index) => {
      const rank = person.rank || index + 4;
      const rankDisplay = rank < 10 ? `0${rank}` : rank;
      const safeName = escapeHtml(person.name);
      return `
        <li class="ranking-row${person.isCurrent ? ' current-user' : ''}" data-rank="${rank}"${person.isCurrent ? ' data-current-user="true"' : ''}>
          <span class="rank-number">${rankDisplay}</span>
          <div class="ranking-user">
            <div class="ranking-avatar">${getAvatarInitials(person.name)}</div>
            <span class="ranking-name">${safeName}</span>
          </div>
          <span class="ranking-score">${person.score} <span class="score-unit">英语星</span></span>
        </li>`;
    }).join('');

    // 少于3名时的占位
    const emptyPodiumSlots = 3 - podiumOrder.length;
    const emptyPodium = Array(emptyPodiumSlots).fill(`
      <article class="podium-card empty-slot" aria-label="暂无数据">
        <div class="podium-avatar-wrapper">
          <div class="podium-avatar empty"><span class="avatar-initials">?</span></div>
        </div>
        <p class="podium-name">虚位以待</p>
        <p class="podium-score">--</p>
      </article>`).join('');

    // 空列表提示
    const listContent = remaining || `
      <li class="ranking-empty-row">
        <div class="empty-list-illustration">
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="28" fill="#e6f9f6"/>
            <path d="M32 14 L35 24 L45 24 L37 30 L40 40 L32 34 L24 40 L27 30 L19 24 L29 24 Z" fill="#19c8b9" opacity="0.7"/>
          </svg>
          <p>榜单静待英才</p>
        </div>
      </li>`;

    main.innerHTML = `
      <section class="view ranking-view" aria-labelledby="ranking-title">
        <div class="ranking-layout">
          <section class="ranking-summary surface">
            <div class="ranking-header">
              <p class="eyebrow">Weekly English Stars</p>
              <h1 id="ranking-title">英语星排行榜</h1>
              <p class="page-intro">每完成一关、答对一道题，都能收集本周英语星。</p>
            </div>
            <div class="podium">${podium}${emptyPodium}</div>
            <div class="ranking-stats">
              <div class="stat-badge">
                <span class="stat-number">${allRankings.length}</span>
                <span class="stat-label">本周参赛者</span>
              </div>
              <div class="stat-badge">
                <span class="stat-number">${currentRanking?.rank || '--'}</span>
                <span class="stat-label">我的排名</span>
              </div>
              <div class="stat-badge">
                <span class="stat-number">${currentRanking?.score || 0}</span>
                <span class="stat-label">我的英语星</span>
              </div>
            </div>
          </section>
          <section class="ranking-board" aria-labelledby="ranking-board-title">
            <div class="section-heading">
              <div>
                <p class="eyebrow">This Week</p>
                <h2 id="ranking-board-title">本周积分</h2>
              </div>
              <span class="status-pill">每周一更新</span>
            </div>
            <ol class="ranking-list" start="${podiumOrder.length + 1}">${listContent}</ol>
          </section>
        </div>
      </section>`;
  }

  function renderMine() {
    const english = englishZoneProgress(state.progressByWorld, state.learningActivity, levels);
    const learnedWords = english.learnedWords;
    // 词库默认只露出最近 WORD_CHIP_PREVIEW 个（新→旧），其余收进 +N；全英图词量会很多，无界会顶穿页面
    const WORD_CHIP_PREVIEW = 12;
    const hiddenWordCount = Math.max(0, learnedWords.length - WORD_CHIP_PREVIEW);
    const mistakeCount = state.mistakeBook.items.length;
    const childProfile = normalizeChildProfile(state.preferences);
    const membership = membershipSummary(state.preferences);
    const mathReport = buildMathParentReport(state.mathAttempts);
    const mathRec = mathReport.recommendation;
    const mathRecLevel = mathLevels.find((level) => level.id === mathRec.levelId) || mathLevels[0];
    const mathAccuracyText = mathReport.accuracy === null ? '先玩几题' : `${mathReport.accuracy}%`;
    const mathRecText = mathReport.totalAttempts
      ? (mathRec.reasonText
        || (mathRec.reason === 'repeat-current'
          ? `建议再练第 ${mathRec.levelId} 关`
          : `建议挑战第 ${mathRec.levelId} 关`))
      : '完成 3 道数学题后生成建议';
    const mathMapProgress = normalizeProgress(state.progressByWorld.math, mathLevels.length || DISPLAY_LEVEL_COUNT);
    const mathCompleted = mathMapProgress.completed.length;
    const mathTotal = mathLevels.length || DISPLAY_LEVEL_COUNT;
    const mathPercent = mathTotal ? Math.round((mathCompleted / mathTotal) * 100) : 0;
    const englishMapLines = english.maps
      .map((row) => `<li><span>${escapeHtml(row.title)}</span><strong>${row.completed}/${row.total}</strong></li>`)
      .join('');
    const englishAction = `<button class="primary-button subject-card-cta" type="button" data-open-english-map data-world="${english.continueWorldId}">去英语地图</button>`;
    const mathAction = mathReport.totalAttempts
      ? `<button class="primary-button subject-card-cta" type="button" data-open-math-recommended data-level="${mathRec.levelId}">去数学地图</button>`
      : `<button class="primary-button subject-card-cta" type="button" data-open-math-recommended data-level="${mathRec.levelId || 1}">去数学地图</button>`;
    const ageOptions = ['3', '4', '5', '6']
      .map((age) => `<option value="${age}"${age === childProfile.childAge ? ' selected' : ''}>${age} 岁</option>`)
      .join('');
    const preferenceSwitch = (key, title, onNote, offNote) => {
      const checked = state.preferences[key];
      return `
        <li class="setting-row setting-row-control">
          <button class="setting-button" type="button" data-preference="${key}" role="switch" aria-checked="${checked}" aria-label="${title}">
            <span class="setting-copy"><span class="setting-title">${title}</span><span class="setting-note">${checked ? onNote : offNote}</span></span>
            <span class="setting-switch" aria-hidden="true"><span></span></span>
          </button>
        </li>`;
    };
    main.innerHTML = `
      <section class="view" aria-labelledby="mine-title">
        <div class="mine-layout">
          <section class="mine-overview" aria-labelledby="mine-title">
            <p class="eyebrow">MY HIROTA</p>
            <h1 id="mine-title">我的</h1>
            <p class="page-intro mine-intro">家长总览：英语、数学，以及即将开放的语文。</p>
            <div class="profile-card">
              <div class="avatar" aria-hidden="true">${escapeHtml(profileAvatarText(childProfile.childName))}</div>
              <div class="profile-copy"><h2>${escapeHtml(childProfile.childName)}同学</h2><p>${childProfile.childAge} 岁 · 嗨洛塔小小探索家</p></div>
            </div>

            <section class="surface membership-card is-${membership.status}" data-membership-status="${membership.status}" aria-label="地图权益状态">
              <div class="membership-copy">
                <span class="membership-badge">${membership.badge}</span>
                <h2>${membership.title}</h2>
                <p>${membership.note}</p>
              </div>
              <div class="membership-count" aria-label="${membership.countLabel} ${membership.count}">
                <strong>${membership.count}</strong>
                <span>${membership.countLabel}</span>
              </div>
            </section>

            <div class="stats-grid mine-week-stats" aria-label="学习总览">
              <div class="stat-card"><span class="stat-value">${english.activeDays}</span><span class="stat-label">学习天数</span></div>
              <div class="stat-card"><span class="stat-value">${english.learningMinutes}</span><span class="stat-label">英语分钟</span></div>
              <div class="stat-card"><span class="stat-value">${english.completed}</span><span class="stat-label">英语关卡</span></div>
              <div class="stat-card"><span class="stat-value">${mathReport.totalAttempts}</span><span class="stat-label">数学题数</span></div>
              <div class="stat-card"><span class="stat-value">${learnedWords.length}</span><span class="stat-label">已学单词</span></div>
              <div class="stat-card"><span class="stat-value">${mistakeCount}</span><span class="stat-label">待复习</span></div>
            </div>

            <h2 class="section-title mine-subjects-title">Learning zones <span>学科进度</span></h2>
            <div class="subject-cards" aria-label="学科进度">
              <article class="surface subject-card subject-card-english" data-subject="english" aria-labelledby="subject-english-title">
                <div class="subject-card-head">
                  <p class="eyebrow">ENGLISH</p>
                  <h3 id="subject-english-title">英语区</h3>
                </div>
                <div class="subject-card-metrics" aria-label="英语关键数据">
                  <div><span class="subject-metric-value">${english.completed}/${english.total}</span><span class="subject-metric-label">关卡</span></div>
                  <div><span class="subject-metric-value">${english.progressPercent}%</span><span class="subject-metric-label">完成</span></div>
                  <div><span class="subject-metric-value">${learnedWords.length}</span><span class="subject-metric-label">单词</span></div>
                </div>
                <div class="progress-row subject-progress-row">
                  <div class="progress-track"><div class="progress-fill" style="width: ${english.progressPercent}%"></div></div>
                  <span class="progress-number">${english.progressPercent}%</span>
                </div>
                <ul class="subject-map-list" aria-label="英语地图明细">${englishMapLines}</ul>
                <p class="subject-card-suggest">${escapeHtml(english.suggestion)}</p>
                ${englishAction}
                <section class="subject-word-bank" aria-labelledby="word-bank-title">
                  <h4 id="word-bank-title">学会的单词</h4>
                  <div class="word-bank-words" data-word-chips>
                    <div class="word-chips">${learnedWords.slice().reverse().map((word) => `<span>${escapeHtml(word)}</span>`).join('') || '<span class="word-chip-empty">还没有单词，去英语地图闯关吧</span>'}</div>
                    ${hiddenWordCount > 0 ? `<button class="word-chips-more" type="button" data-words-expand data-hidden-count="${hiddenWordCount}" aria-expanded="false">+${hiddenWordCount} 词</button>` : ''}
                  </div>
                </section>
              </article>

              <article class="surface subject-card subject-card-math" data-subject="math" data-math-ai-report aria-labelledby="subject-math-title">
                <div class="subject-card-head">
                  <p class="eyebrow">MATH</p>
                  <h3 id="subject-math-title">数学区</h3>
                </div>
                <div class="subject-card-metrics" aria-label="数学关键数据">
                  <div><span class="subject-metric-value">${mathCompleted}/${mathTotal}</span><span class="subject-metric-label">地图关</span></div>
                  <div><span class="subject-metric-value">${mathReport.totalAttempts}</span><span class="subject-metric-label">答题</span></div>
                  <div><span class="subject-metric-value">${mathAccuracyText}</span><span class="subject-metric-label">正确率</span></div>
                </div>
                <div class="progress-row subject-progress-row">
                  <div class="progress-track"><div class="progress-fill" style="width: ${mathPercent}%"></div></div>
                  <span class="progress-number">${mathPercent}%</span>
                </div>
                <p class="subject-card-mastery">掌握：${escapeHtml(mathReport.mastery)}</p>
                <p class="subject-card-suggest">${escapeHtml(mathRecText)}${mathRecLevel ? ` · ${escapeHtml(mathRecLevel.title)}` : ''}</p>
                ${mathAction}
              </article>

              <article class="surface subject-card subject-card-chinese is-coming-soon" data-subject="chinese" aria-labelledby="subject-chinese-title">
                <div class="subject-card-head">
                  <p class="eyebrow">CHINESE</p>
                  <h3 id="subject-chinese-title">语文区</h3>
                  <span class="subject-soon-badge">即将开放</span>
                </div>
                <div class="subject-card-metrics" aria-label="语文关键数据">
                  <div><span class="subject-metric-value">—</span><span class="subject-metric-label">进度</span></div>
                  <div><span class="subject-metric-value">—</span><span class="subject-metric-label">练习</span></div>
                  <div><span class="subject-metric-value">—</span><span class="subject-metric-label">复习</span></div>
                </div>
                <p class="subject-card-suggest">识字、朗读与表达会放在这里，上线后家长可在同一页查看。</p>
                <button class="secondary-button subject-card-cta" type="button" disabled aria-disabled="true">敬请期待</button>
              </article>
            </div>
          </section>

          <aside class="mine-side">
            <h2 class="section-title">Family settings <span>家长设置</span></h2>
            <ul class="settings-list" aria-label="设置预览">
              <li class="setting-row setting-row-control">
                <label class="setting-button setting-profile-row">
                  <span class="setting-copy"><span class="setting-title">宝宝昵称</span><span class="setting-note">显示在我的页头像旁</span></span>
                  <input class="setting-profile-input" type="text" value="${escapeHtml(childProfile.childName)}" maxlength="10" data-child-profile="childName" aria-label="宝宝昵称">
                </label>
              </li>
              <li class="setting-row setting-row-control">
                <label class="setting-button setting-profile-row">
                  <span class="setting-copy"><span class="setting-title">宝宝年龄</span><span class="setting-note">用于家长查看资料</span></span>
                  <select class="setting-profile-select" data-child-profile="childAge" aria-label="宝宝年龄">${ageOptions}</select>
                </label>
              </li>
              ${preferenceSwitch('mapMusic', '背景音乐', '地图播放背景音乐', '已关闭地图音乐')}
              ${preferenceSwitch('autoPronunciation', '自动读英文', '切换关卡时自动播放', '只在点击喇叭时播放')}
              ${preferenceSwitch('showChineseHints', '中文辅助', '显示中文提示', '隐藏中文提示')}
            </ul>

            <h2 class="section-title">App info <span>应用信息</span></h2>
            <ul class="settings-list app-info-list" aria-label="应用信息">
              <li class="setting-row setting-row-control">
                <button class="setting-button setting-link-button" type="button" data-check-update data-check-update-status="idle" aria-busy="false">
                  <span class="setting-copy"><span class="setting-title">检查内容更新</span><span class="setting-note" data-check-update-note>检查课程资源和页面内容更新</span></span>
                  <span class="setting-check-status" data-check-update-state aria-hidden="true">检查</span>
                </button>
              </li>
              <li class="setting-row setting-row-control">
                <button class="setting-button setting-link-button" type="button" data-nav-route="privacy">
                  <span class="setting-copy"><span class="setting-title">隐私政策</span><span class="setting-note">家长查看数据使用说明</span></span>
                  <span class="setting-arrow" aria-hidden="true">›</span>
                </button>
              </li>
              <li class="setting-row setting-row-control">
                <button class="setting-button setting-link-button" type="button" data-nav-route="terms">
                  <span class="setting-copy"><span class="setting-title">使用条款</span><span class="setting-note">关卡顺序与使用边界</span></span>
                  <span class="setting-arrow" aria-hidden="true">›</span>
                </button>
              </li>
              <li class="setting-row setting-row-control">
                <button class="setting-button setting-link-button" type="button" data-nav-route="support">
                  <span class="setting-copy"><span class="setting-title">帮助与反馈</span><span class="setting-note">声音、关卡或显示问题</span></span>
                  <span class="setting-arrow" aria-hidden="true">›</span>
                </button>
              </li>
              <li class="setting-row setting-row-control">
                <button class="setting-button setting-link-button" type="button" data-nav-route="about">
                  <span class="setting-copy"><span class="setting-title">关于应用</span><span class="setting-note">当前版本 v${APP_RELEASE_VERSION}</span></span>
                  <span class="setting-arrow" aria-hidden="true">›</span>
                </button>
              </li>
              <li class="setting-row setting-row-control setting-row-account">
                <button class="setting-button setting-link-button account-link" type="button" data-sign-out>
                  <span class="setting-copy"><span class="setting-title">退出登录</span><span class="setting-note">切换当前登录的账号</span></span>
                  <span class="setting-arrow" aria-hidden="true">›</span>
                </button>
              </li>
              <li class="setting-row setting-row-control setting-row-account">
                <button class="setting-button setting-link-button account-link account-link-danger" type="button" data-delete-account>
                  <span class="setting-copy"><span class="setting-title">注销账号</span><span class="setting-note">清空本机的全部学习记录</span></span>
                  <span class="setting-arrow" aria-hidden="true">›</span>
                </button>
              </li>
            </ul>
          </aside>
        </div>
      </section>`;
  }

  function renderSupport() {
    main.innerHTML = `
      <section class="view support-view" aria-labelledby="support-title">
        <article class="surface support-card">
          <p class="eyebrow">HELP CENTER</p>
          <h1 id="support-title">帮助与反馈</h1>
          <p class="page-intro">先把问题保存在本机，家长可以复制后发给客服或老师。</p>

          <div class="support-tips" aria-label="常见问题">
            <section class="support-tip">
              <span aria-hidden="true">🔊</span>
              <h2>听不到声音</h2>
              <p>先点一下页面或喇叭按钮，浏览器才允许播放发音和背景音。</p>
            </section>
            <section class="support-tip">
              <span aria-hidden="true">🧭</span>
              <h2>关卡顺序</h2>
              <p>先完成当前关卡，下一关会自动解锁。</p>
            </section>
            <section class="support-tip">
              <span aria-hidden="true">🌱</span>
              <h2>进度显示</h2>
              <p>学习记录优先保存在本机，清理浏览器数据会影响本地记录。</p>
            </section>
          </div>

          <form class="support-form" data-support-form novalidate>
            <label for="support-message">问题描述</label>
            <textarea id="support-message" data-support-message rows="5" maxlength="300" placeholder="例如：点第 3 关喇叭没有声音，设备是 iPad。">${escapeHtml(loadSupportDraft())}</textarea>
            <p class="support-error" data-support-error hidden></p>
            <p class="support-status" data-support-status hidden></p>
            <div class="support-actions">
              <button class="primary-button" type="submit">保存反馈</button>
              <button class="secondary-button" type="button" data-copy-support>复制给客服</button>
              <button class="secondary-button" type="button" data-nav-route="mine">返回我的</button>
            </div>
          </form>
        </article>
      </section>`;
  }

  function renderInfoPage(page) {
    const info = appInfoPages[page] || appInfoPages.about;
    main.innerHTML = `
      <section class="view info-view" aria-labelledby="info-title">
        <article class="surface info-card">
          <p class="eyebrow">${info.eyebrow}</p>
          <h1 id="info-title">${info.title}</h1>
          <p class="page-intro">${info.intro}</p>
          <div class="info-sections">
            ${info.sections.map(([title, body]) => `
              <section class="info-section">
                <h2>${title}</h2>
                <p>${body}</p>
              </section>`).join('')}
          </div>
          <button class="primary-button info-back" type="button" data-nav-route="mine">返回我的</button>
        </article>
      </section>`;
  }

  function renderNotFound() {
    main.innerHTML = `
      <section class="view not-found-view" aria-labelledby="not-found-title">
        <div class="not-found-card surface">
          <span class="not-found-icon" aria-hidden="true">
            <svg viewBox="0 0 96 96">
              <path d="M17 55c7-20 20-31 37-33 10-1 17 4 22 14 5 11 3 22-6 33-10 12-25 14-40 7-8-4-13-11-13-21z"/>
              <path d="M34 42h.01M58 42h.01"/>
              <path d="M34 61c8-6 19-6 27 0"/>
              <path d="M63 18l10-9 2 14"/>
            </svg>
          </span>
          <p class="eyebrow">PAGE NOT FOUND</p>
          <h1 id="not-found-title">页面走丢了</h1>
          <p>这个页面不存在。回到闯关地图，继续当前学习进度。</p>
          <button class="primary-button not-found-action" type="button" data-return-map>回到闯关地图</button>
        </div>
      </section>`;

    main.querySelector('[data-return-map]').addEventListener('click', () => navigate('map'));
  }

  function setActiveTab(type) {
    const active = type === 'level' ? 'map' : type === 'info' || type === 'support' ? 'mine' : type;
    tabButtons.forEach((button) => {
      const isActive = button.dataset.tab === active;
      if (isActive) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }

  function render() {
    const route = routeFromHash();
    if (route.type !== 'level') removeGlobalHintHand();
    document.body.classList.toggle('map-game-active', route.type === 'map');
    document.body.classList.toggle('pref-hide-chinese-hints', !state.preferences.showChineseHints);

    if (route.type === 'level') {
      const level = activeLevelById(route.id);
      const access = level ? getLevelAccess(route.id, state.progress, state.preferences.vipActive === true) : 'missing';
      if (state.preferences.mapWorld === 'math') {
        history.replaceState(null, '', '#map');
        bottomTabs.hidden = false;
        appShell.classList.remove('detail-shell');
        document.body.classList.remove('level-quiz-active');
        document.body.classList.add('map-game-active');
        setActiveTab('map');
        if (access === 'allowed') {
          state.mathMapLevelId = route.id;
        }
        renderMap(access === 'allowed'
          ? `已在数学地图打开第 ${route.id} 关`
          : access === 'locked'
            ? `先完成第 ${state.progress.unlockedThrough} 关，再继续冒险。`
            : access === 'paid'
              ? paidAccessMessage
              : '没有找到这个关卡。');
        if (access === 'paid') {
          requestAnimationFrame(() => openPaywallDialog(route.id));
        }
        document.title = '嗨洛塔少儿启蒙APP';
        syncMapMusic();
        return;
      }
      if (access !== 'allowed') {
        history.replaceState(null, '', '#map');
        bottomTabs.hidden = false;
        appShell.classList.remove('detail-shell');
        document.body.classList.remove('level-quiz-active');
        document.body.classList.add('map-game-active');
        setActiveTab('map');
        renderMap(access === 'locked'
          ? `先完成第 ${state.progress.unlockedThrough} 关，再继续冒险。`
          : access === 'paid'
            ? paidAccessMessage
            : access === 'missing' ? '没有找到这个关卡。' : '');
        if (access === 'paid') {
          requestAnimationFrame(() => openPaywallDialog(route.id));
        }
        document.title = '嗨洛塔少儿启蒙APP';
        syncMapMusic();
        return;
      }
      bottomTabs.hidden = true;
      appShell.classList.add('detail-shell');
      document.body.classList.add('level-quiz-active');
      renderDetail(level);
      document.title = `${level.title} · 嗨洛塔少儿启蒙APP`;
    } else {
      bottomTabs.hidden = false;
      appShell.classList.remove('detail-shell');
      document.body.classList.remove('level-quiz-active');
      if (route.type === 'ranking') {
        renderRanking();
        document.title = '排行榜 · 嗨洛塔少儿启蒙APP';
      } else if (route.type === 'mine') {
        renderMine();
        document.title = '我的 · 嗨洛塔少儿启蒙APP';
      } else if (route.type === 'support') {
        renderSupport();
        document.title = '帮助与反馈 · 嗨洛塔少儿启蒙APP';
      } else if (route.type === 'info') {
        renderInfoPage(route.page);
        document.title = `${appInfoPages[route.page].title} · 嗨洛塔少儿启蒙APP`;
      } else if (route.type === 'not-found') {
        renderNotFound();
        document.title = '页面走丢了 · 嗨洛塔少儿启蒙APP';
      } else {
        renderMap();
        document.title = '嗨洛塔少儿启蒙APP';
      }
    }

    setActiveTab(route.type);
    syncMapMusic(route);
  }

  window.addEventListener('pointerdown', () => {
    syncMapMusic();
  }, { passive: true });
  document.addEventListener('click', handleUiButtonClickSfx, true);
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => navigate(button.dataset.tab));
  });
  window.addEventListener('offline', () => updateNetworkStatus(false));
  window.addEventListener('online', () => {
    updateNetworkStatus(true);
    checkReleaseUpdate();
    if (authGatePassed) hydrateLearningStateFromBackend();
  });
  window.addEventListener('baby-island-auth-change', (event) => {
    if (event.detail?.isLoggedIn) {
      authGatePassed = true;
      hydrateLearningStateFromBackend();
    } else {
      learningSyncReady = false;
      authGatePassed = false;
    }
  });
  window.addEventListener('popstate', render);
  networkStatus?.addEventListener('click', (event) => {
    if (event.target.closest('[data-app-refresh]')) applyAppUpdate();
  });
  registerServiceWorker();
  hydrateAssetPackManifest();
  postAssetPackMessage('list', state.preferences.mapWorld);

  if (!location.hash) history.replaceState(null, '', '#map');
  updateNetworkStatus(false);
  render();
  checkReleaseUpdate();
  // 启动页结束后强制鉴权：未登录弹登录框（登录即注册）；已登录再拉云端进度
  runAuthBootGate();

  main.addEventListener('click', function (ev) {
    var prefBtn = ev.target.closest('[data-preference]');
    if (prefBtn) {
      ev.preventDefault();
      setPreference(prefBtn.dataset.preference, prefBtn.getAttribute('aria-checked') !== 'true');
      return;
    }
    var supportCopyBtn = ev.target.closest('[data-copy-support]');
    if (supportCopyBtn) {
      ev.preventDefault();
      copySupportFeedback(supportCopyBtn.closest('[data-support-form]'));
      return;
    }
    var wordsToggle = ev.target.closest('[data-words-expand]');
    if (wordsToggle) {
      ev.preventDefault();
      const chipBox = wordsToggle.closest('[data-word-chips]');
      const expanded = chipBox.classList.toggle('expanded');
      wordsToggle.setAttribute('aria-expanded', String(expanded));
      wordsToggle.textContent = expanded ? '收起' : `+${wordsToggle.dataset.hiddenCount} 词`;
      return;
    }
    var checkUpdateBtn = ev.target.closest('[data-check-update]');
    if (checkUpdateBtn) {
      ev.preventDefault();
      checkAppUpdate();
      return;
    }
    var assetPackPanelBtn = ev.target.closest('[data-asset-pack-panel]');
    if (assetPackPanelBtn) {
      ev.preventDefault();
      openAssetPackDialog(assetPackPanelBtn);
      return;
    }
    var mathRecommendedBtn = ev.target.closest('[data-open-math-recommended]');
    if (mathRecommendedBtn) {
      ev.preventDefault();
      openMathRecommendedLevel(Number(mathRecommendedBtn.dataset.level));
      return;
    }
    var englishMapBtn = ev.target.closest('[data-open-english-map]');
    if (englishMapBtn) {
      ev.preventDefault();
      openEnglishMap(englishMapBtn.dataset.world);
      return;
    }
    var assetPackBtn = ev.target.closest('[data-asset-pack-action]');
    if (handleAssetPackActionClick(assetPackBtn, ev)) return;
    var routeBtn = ev.target.closest('[data-nav-route]');
    if (routeBtn) {
      ev.preventDefault();
      navigate(routeBtn.dataset.navRoute);
      return;
    }
    var signOutBtn = ev.target.closest('[data-sign-out]');
    if (signOutBtn) {
      ev.preventDefault();
      var api = authApi();
      if (!api?.logout) {
        showToast('退出登录功能暂不可用');
        return;
      }
      api.logout().finally(function () {
        learningSyncReady = false;
        authGatePassed = false;
        showToast('已退出登录');
        openLoginDialog({ required: true }).then(function () {
          hydrateLearningStateFromBackend();
        });
      });
      return;
    }
    var deleteAccountBtn = ev.target.closest('[data-delete-account]');
    if (deleteAccountBtn) {
      ev.preventDefault();
      showToast('注销账号功能即将上线');
    }
  });

  main.addEventListener('change', function (ev) {
    var childProfileInput = ev.target.closest('[data-child-profile]');
    if (childProfileInput) setChildProfile(childProfileInput.dataset.childProfile, childProfileInput.value);
  });

  main.addEventListener('submit', function (ev) {
    var form = ev.target.closest('[data-support-form]');
    if (!form) return;
    ev.preventDefault();
    var input = form.querySelector('[data-support-message]');
    var error = form.querySelector('[data-support-error]');
    var status = form.querySelector('[data-support-status]');
    var message = input.value.trim();
    var validation = validateSupportMessage(message);
    if (validation) {
      error.textContent = validation;
      error.hidden = false;
      status.hidden = true;
      input.focus();
      return;
    }
    saveSupportDraft(message);
    submitSupportFeedbackSync(message);
    error.hidden = true;
    status.textContent = '已保存在本机，家长可以稍后继续查看。';
    status.hidden = false;
    showToast('反馈已保存在本机');
  });
}
