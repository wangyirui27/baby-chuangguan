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
  { topic: '日常问候', words: [['Good morning', '早上好'], ['How are you', '你好吗'], ['See you later', '待会儿见'], ['Good night', '晚安'], ['Have fun', '玩得开心'], ['Goodbye', '再见'], ['Thank you', '谢谢你'], ["You're welcome", '不用谢'], ['Excuse me', '打扰一下'], ["I'm sorry", '对不起']] },
  { topic: '课堂规则', words: [['Listen up', '注意听'], ['Hands up', '举手'], ['Line up', '排队'], ['Sit down', '坐下'], ['Stand up', '站起来'], ['Look here', '看这里'], ['Quiet please', '请安静'], ['Raise your hand', '请举手'], ['Answer me', '回答我'], ['Work in pairs', '两人合作']] },
  { topic: '一日三餐', words: [['Have breakfast', '吃早餐'], ['Have lunch', '吃午餐'], ['Have dinner', '吃晚餐'], ['Drink milk', '喝牛奶'], ['Wash hands', '洗手'], ['Wipe mouth', '擦嘴'], ['Use chopsticks', '用筷子'], ['Taste it', '尝一尝'], ['Full up', '吃饱了'], ['More rice', '再来点饭']] },
  { topic: '零食水果', words: [['Cut apple', '切苹果'], ['Peel banana', '剥香蕉'], ['Open snack', '打开零食'], ['Share cookie', '分享饼干'], ['Sweet candy', '甜甜的糖果'], ['Sour lemon', '酸酸的柠檬'], ['Eat slowly', '慢慢吃'], ['No sugar', '不要糖'], ['Yummy taste', '好吃的味道'], ['Bite it', '咬一口']] },
  { topic: '洗漱卫生', words: [['Brush teeth', '刷牙'], ['Wash face', '洗脸'], ['Comb hair', '梳头发'], ['Take a bath', '洗澡'], ['Flush toilet', '冲马桶'], ['Use soap', '用肥皂'], ['Dry hands', '擦干手'], ['Change clothes', '换衣服'], ['Cut nails', '剪指甲'], ['Blow nose', '擤鼻子']] },
  { topic: '身体动作', words: [['Run fast', '跑得快'], ['Jump high', '跳得高'], ['Clap hands', '拍手'], ['Stamp feet', '跺脚'], ['Touch nose', '摸鼻子'], ['Close eyes', '闭眼睛'], ['Open mouth', '张开嘴'], ['Shake head', '摇头'], ['Turn around', '转一圈'], ['Sit still', '坐好不动']] },
  { topic: '情绪表达', words: [["I'm happy", '我很开心'], ["I'm sad", '我很难过'], ["I'm angry", '我生气了'], ["I'm scared", '我害怕了'], ['Be brave', '勇敢一点'], ['Calm down', '冷静下来'], ["Don't cry", '不要哭'], ['Cheer up', '打起精神'], ['Smile big', '大大地笑'], ['Laugh loud', '大声笑']] },
  { topic: '家庭互动', words: [['Help mom', '帮妈妈'], ['Hug dad', '抱抱爸爸'], ['Kiss baby', '亲亲宝宝'], ['Play with me', '和我玩'], ['Read to me', '读给我听'], ['Tell a story', '讲故事'], ['Go to bed', '上床睡觉'], ['Wake up', '醒一醒'], ['Get dressed', '穿好衣服'], ['Come here', '过来这里']] },
  { topic: '玩具游戏', words: [['Play ball', '玩球'], ['Ride bike', '骑自行车'], ['Fly kite', '放风筝'], ['Build blocks', '搭积木'], ['Hide and seek', '捉迷藏'], ["Tag you're it", '抓到你了'], ['My turn', '轮到我'], ['Your turn', '轮到你'], ['I win', '我赢了'], ['You lose', '你输了']] },
  { topic: '颜色形状', words: [['Red and blue', '红色和蓝色'], ['Yellow sun', '黄色的太阳'], ['Green grass', '绿色的草地'], ['Black night', '黑色的夜晚'], ['White snow', '白色的雪'], ['Round circle', '圆形'], ['Square box', '方盒子'], ['Triangle roof', '三角形屋顶'], ['Star shape', '星星形状'], ['Mix colors', '混合颜色']] },
  { topic: '数字时间', words: [['One to ten', '一到十'], ['Count to twenty', '数到二十'], ['Plus one', '加一'], ['Minus one', '减一'], ['What time', '几点了'], ['Morning time', '早晨时间'], ['Night time', '夜晚时间'], ['One hour', '一小时'], ['Today is', '今天是'], ['Tomorrow is', '明天是']] },
  { topic: '天气季节', words: [['Sunny day', '晴天'], ['Rainy day', '雨天'], ['Windy day', '刮风天'], ['Cloudy day', '多云天'], ['Hot summer', '炎热的夏天'], ['Cold winter', '寒冷的冬天'], ['Warm spring', '温暖的春天'], ['Cool autumn', '凉爽的秋天'], ["It's raining", '下雨了'], ['Snow is falling', '下雪了']] },
  { topic: '动物宠物', words: [['Feed dog', '喂狗'], ['Walk dog', '遛狗'], ['Pet cat', '摸摸猫'], ['Watch fish', '看鱼'], ['Chase bird', '追小鸟'], ['Catch butterfly', '捉蝴蝶'], ['Ride horse', '骑马'], ['Milk cow', '挤牛奶'], ['Shear sheep', '给羊剪毛'], ['Collect eggs', '收鸡蛋']] },
  { topic: '动物园', words: [['See panda', '看熊猫'], ['Watch monkey', '看猴子'], ['Feed giraffe', '喂长颈鹿'], ['Touch turtle', '摸乌龟'], ['Hear lion', '听狮子叫'], ['See tiger', '看老虎'], ['Big elephant', '大象'], ['Small mouse', '小老鼠'], ['Long snake', '长蛇'], ['Tall camel', '高高的骆驼']] },
  { topic: '出行交通', words: [['By bus', '坐公交车'], ['By car', '坐小汽车'], ['By bike', '骑自行车'], ['By train', '坐火车'], ['Get on', '上车'], ['Get off', '下车'], ['Fasten seatbelt', '系安全带'], ['Traffic light', '红绿灯'], ['Go straight', '直走'], ['Turn left', '向左转']] },
  { topic: '购物消费', words: [['How much', '多少钱'], ['Too expensive', '太贵了'], ['Can I pay', '我可以付款吗'], ['Buy this', '买这个'], ['Sell that', '卖那个'], ['Keep change', '不用找零'], ['Save money', '存钱'], ['Count money', '数钱'], ['Cheap price', '便宜价格'], ['High price', '高价格']] },
  { topic: '学校学习', words: [['Read book', '读书'], ['Write word', '写单词'], ['Draw picture', '画画'], ['Do homework', '做作业'], ['Ask question', '问问题'], ['Answer question', '回答问题'], ['Learn English', '学英语'], ['Speak English', '说英语'], ['Study hard', '努力学习'], ['Try again', '再试一次']] },
  { topic: '音乐艺术', words: [['Sing song', '唱歌'], ['Play piano', '弹钢琴'], ['Play drum', '打鼓'], ['Dance well', '跳得好'], ['Draw line', '画线'], ['Paint red', '涂成红色'], ['Make music', '做音乐'], ['Clap rhythm', '拍节奏'], ['Loud sound', '大声'], ['Soft sound', '轻轻的声音']] },
  { topic: '运动比赛', words: [['Kick ball', '踢球'], ['Throw ball', '扔球'], ['Catch ball', '接球'], ['Bounce ball', '拍球'], ['Run race', '赛跑'], ['Swim fast', '游得快'], ['Jump rope', '跳绳'], ['Play soccer', '踢足球'], ['Score goal', '进球'], ['Win game', '赢得比赛']] },
  { topic: '职业梦想', words: [['I want to be', '我想成为'], ['Be a doctor', '当医生'], ['Be a teacher', '当老师'], ['Be a cook', '当厨师'], ['Be a driver', '当司机'], ['Be a singer', '当歌手'], ['Be a player', '当运动员'], ['Be a scientist', '当科学家'], ['Be an artist', '当艺术家'], ['Be a writer', '当作家']] },
];

const FREE_LEVEL_COUNT = 10;
const DISPLAY_LEVEL_COUNT = 200;
const APP_RELEASE_VERSION = '1.0.0';
const APP_RELEASE_UPDATE_URL = 'app-release.json';
const FREE_LEVEL_VIDEO_VERSION = '20260720-map-switch-cards-v13';
const WORD_AUDIO_MANIFEST_VERSION = '20260720-word-manifest-200-v1';
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
      duration: id % 10 === 0 ? '4 分钟' : '3 分钟',
      guidance: `看一看画面，听清并跟读 ${word}。`,
      question: `Which word means ${zhTitle}?`,
      options,
      correct,
    };

    return { ...level, ...(overrides[id] || {}) };
  }));
}

const levels = buildLevelsFromUnits(courseUnits, lessonOverrides);
const desertLevels = buildLevelsFromUnits(desertPhraseUnits, {}, (phrase) => phrase);

const lessonUnavailableMessage = '这关视频还在准备中，请先复习前 10 关。';
const DESERT_LANDMARK_IMAGES = [
  '01-great-pyramid-complex.png',
  '02-large-sphinx-monument.png',
  '03-pharaoh-palace-facade.png',
  '04-grand-egyptian-temple.png',
  '05-abu-simbel-rock-temple.png',
  '06-step-pyramid-monument.png',
  '07-obelisk-plaza.png',
  '08-desert-royal-palace.png',
  '09-valley-kings-tomb-facade.png',
  '10-monumental-city-gate.png',
];
const DESERT_DECOR_ASSETS = [
  '01-cactus-cluster.webp',
  '02-dry-grass-clump.webp',
  '03-rock-pile.webp',
  '04-terracotta-jar.webp',
  '05-column-fragment.webp',
  '06-obelisk-fragment.webp',
  '07-ruined-wall.webp',
  '08-sandstone-archway.webp',
  '09-dry-bush.webp',
  '10-reed-grass.webp',
  '11-stone-tablet.webp',
  '12-wooden-crate.webp',
];
const MAP_VEHICLES = {
  ocean: {
    idle: 'assets/ocean/rowing-kids-boat-idle.webp?v=20260720-libtv-original-v3',
    sailing: 'assets/ocean/rowing-kids-boat-sailing.webp?v=20260720-libtv-original-rowing-v3',
  },
  desert: {
    idle: 'assets/egypt-map/cutouts/characters/runtime/camel-walk-frame96-idle-v6.png?v=20260720-camel-idle-walkmatch-v6',
    sailing: 'assets/egypt-map/cutouts/characters/runtime/camel-walk-frame96-idle-v6.png?v=20260720-camel-idle-walkmatch-v6',
    idleVideo: {
      hevc: 'assets/egypt-map/cutouts/characters/libtv/camel-idle-alpha-v6.mov?v=20260720-camel-idle-walkmatch-v6',
      webm: 'assets/egypt-map/cutouts/characters/libtv/camel-idle-alpha-v6.webm?v=20260720-camel-idle-walkmatch-v6',
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
    startLevel: 1,
    endLevel: DISPLAY_LEVEL_COUNT,
    kicker: `${DISPLAY_LEVEL_COUNT} DESERT STOPS`,
    title: '沙漠奇境',
    chipPrefix: '沙漠地图',
    routeLabel: `沙漠地图，共 ${DISPLAY_LEVEL_COUNT} 关`,
    hint: `← 左右滑动探索 ${DISPLAY_LEVEL_COUNT} 关沙漠地标 →`,
  },
  castle: {
    id: 'castle',
    theme: 'castle',
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
    badge: 'VIP',
    title: 'VIP 已开通',
    note: `VIP 权益已生效；第 ${FREE_LEVEL_COUNT + 1}-${DISPLAY_LEVEL_COUNT} 关会随课程内容更新开放。`,
    count: String(DISPLAY_LEVEL_COUNT),
    countLabel: '规划关卡',
    action: 'VIP 权益已生效',
  } : {
    isVip,
    status: 'free',
    badge: '体验版',
    title: '非 VIP 体验中',
    note: `前 ${FREE_LEVEL_COUNT} 关免费体验，第 ${FREE_LEVEL_COUNT + 1} 关起需要开通 VIP。`,
    count: String(FREE_LEVEL_COUNT),
    countLabel: '免费关卡',
    action: '开通 VIP',
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
  if (!nextLevel.videoSrc) return lessonUnavailableMessage;
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
  const hasWorldProgress = value && typeof value === 'object' && ('ocean' in value || 'desert' in value || 'castle' in value);
  return {
    ocean: normalizeProgress(hasWorldProgress ? value.ocean : value, totalLevels),
    desert: normalizeProgress(hasWorldProgress ? value.desert : null, totalLevels),
    castle: normalizeProgress(hasWorldProgress ? value.castle : null, totalLevels),
  };
}

function levelsForMapWorld(worldId, allLevels = levels) {
  const world = MAP_WORLDS[normalizeMapWorldId(worldId)];
  if (world.id === 'desert') return desertLevels;
  if (world.comingSoon) return [];
  return allLevels.filter((level) => level.id >= world.startLevel && level.id <= world.endLevel);
}

function desertLandmarkImage(levelId) {
  if (!Number.isInteger(levelId) || levelId < 1 || levelId > DISPLAY_LEVEL_COUNT) return '';
  const index = (levelId - 1) % DESERT_LANDMARK_IMAGES.length;
  return `assets/egypt-map/cutouts/buildings/v6-sand-blend/${DESERT_LANDMARK_IMAGES[index]}?v=20260720-desert-landmarks-v6`;
}

function desertDecorMarkup(levelId, theme) {
  if (theme !== 'desert' || levelId >= DISPLAY_LEVEL_COUNT) return '';
  const asset = DESERT_DECOR_ASSETS[(levelId - 1) % DESERT_DECOR_ASSETS.length];
  const x = 70 + ((levelId * 17) % 24);
  const y = 72 + ((levelId * 5) % 8);
  const scale = (0.86 + ((levelId % 4) * 0.08)).toFixed(2);
  const image = `assets/egypt-map/cutouts/decor/runtime-v1/${asset}?v=20260720-desert-decor-v1`;
  return `<span class="desert-decor" data-desert-decor aria-hidden="true" style="--decor-x:${x}%;--decor-y:${y}%;--decor-scale:${scale};--decor-image:url('${image}')"></span>`;
}

/** 判断单词发音按钮是否应禁用（纯函数，供测试使用） */
function wordButtonDisabled(word, pronunciationAvailable, localAudioUrls) {
  if (!word || typeof word !== 'string') return true;
  return !localAudioUrls[word.toLowerCase()];
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
    '宝宝英语岛反馈',
    `问题：${value}`,
    `当前关卡：第 ${context.currentLevel || 1} 关`,
    `完成关卡：${context.completed || 0}/${DISPLAY_LEVEL_COUNT}`,
    context.userAgent ? `设备信息：${context.userAgent}` : '',
  ].filter(Boolean).join('\n');
}

function buildLearningDataExport(progress, activity, preferences, mistakeBook, _account, allLevels = levels, exportedAt = new Date().toISOString()) {
  const safeProgress = normalizeProgress(progress, allLevels.length);
  const safeActivity = normalizeLearningActivity(activity);
  const safeMistakes = normalizeMistakeBook(mistakeBook, allLevels);
  return {
    app: '宝宝英语岛',
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
    message: String(config?.message || '请前往 App Store 更新宝宝英语岛。'),
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
  if (iosHandler && typeof iosHandler.postMessage === 'function') {
    iosHandler.postMessage(payload);
    return true;
  }
  const androidBridge = runtime?.BabyIslandAppUpdate;
  if (androidBridge && typeof androidBridge.openStore === 'function') {
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
  return Boolean(
    runtime?.webkit?.messageHandlers?.babyIslandAppUpdate?.postMessage ||
    runtime?.BabyIslandAppUpdate?.openStore
  );
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

if (typeof module !== 'undefined') {
  module.exports = { MAP_WORLDS, activateVipPreferences, addLearningActivityDay, applyQuizAnswer, buildLearningDataExport, buildLocalRankings, calendarDays, canForceReleaseUpdate, canRegisterServiceWorker, compareAppVersions, completedLearningMinutes, completionUnlockText, desertLandmarkImage, desertLevels, formatActivityDate, getLevelAccess, islandStyleId, learningDays, learningReport, learningStreak, levels, levelsForMapWorld, membershipSummary, networkStatusText, normalizeMapWorldId, normalizeWorldProgress, notificationStatusText, normalizeChildProfile, normalizeLearningActivity, normalizeMistakeBook, normalizeProgress, parseRouteHash, profileAvatarText, questionPromptText, rankingScore, recordMistake, releaseUpdateInfo, requestReleaseUpdate, requestVipPurchase, requestVipRestore, resolveMistake, routePoint, supportFeedbackText, validateSupportMessage, wordButtonDisabled };
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
  };
  const MAP_MUSIC_VOLUME = 0.16;
  const DESERT_MAP_MUSIC_VOLUME = 0.2;
  const MAP_MUSIC_DUCK_VOLUME = 0.05;
  const MAP_AMBIENT_VOLUME = 0.28;
  const MAP_AMBIENT_SRC = 'assets/audio/sfx/random-ambient.mp3?v=20260718-surround-ambient-v1';
  const MAP_AMBIENT_MIN_DELAY_MS = 4000;
  const MAP_AMBIENT_MAX_DELAY_MS = 12000;
  const MAP_RARE_AMBIENT_SRC = 'assets/audio/sfx/random-ambient-rare.mp3?v=20260718-rare-ambient-v1';
  const MAP_RARE_AMBIENT_VOLUME = 0.16;
  const MAP_RARE_AMBIENT_MIN_DELAY_MS = 25000;
  const MAP_RARE_AMBIENT_MAX_DELAY_MS = 55000;
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
    autoPronunciation: '自动读单词',
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
      intro: '宝宝英语岛是面向家庭的英语启蒙闯关产品，家长负责陪同使用和安排学习时间。',
      sections: [
        ['学习内容', '课程用于英语启蒙，不替代学校教学或专业评估。'],
        ['使用方式', '按关卡顺序完成学习，已解锁内容可以反复复习。'],
        ['使用边界', '请勿复制、售卖或批量抓取课程、图片、音频等内容。'],
      ],
    },
    about: {
      eyebrow: 'ABOUT',
      title: '关于应用',
      intro: '宝宝英语岛把英文单词、视频理解和海岛闯关组合成适合 iPad 横屏的学习体验。',
      sections: [
        ['当前版本', `v${APP_RELEASE_VERSION}，适配 iPad 横屏与移动浏览器。`],
        ['适合人群', '主要面向 3-5 岁宝宝，由家长陪同使用体验更好。'],
        ['核心功能', '海岛地图、视频答题、单词发音、学习统计和排行榜。'],
      ],
    },
  };
  let previewProgressByWorld = normalizeWorldProgress(null, levels.length);
  let learningActivity = normalizeLearningActivity(null);
  let mistakeBook = normalizeMistakeBook(null);
  try { previewProgressByWorld = normalizeWorldProgress(JSON.parse(localStorage.getItem(PREVIEW_PROGRESS_KEY)), levels.length); } catch {}
  try { learningActivity = normalizeLearningActivity(JSON.parse(localStorage.getItem(LEARNING_ACTIVITY_KEY))); } catch {}
  try { mistakeBook = normalizeMistakeBook(JSON.parse(localStorage.getItem(MISTAKE_BOOK_KEY)), levels); } catch {}
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
    };
  }

  function persistLearningStateLocal() {
    try { localStorage.setItem(PREVIEW_PROGRESS_KEY, JSON.stringify(state.progressByWorld)); } catch {}
    try { localStorage.setItem(LEARNING_ACTIVITY_KEY, JSON.stringify(state.learningActivity)); } catch {}
    try { localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(state.preferences)); } catch {}
    try { localStorage.setItem(MISTAKE_BOOK_KEY, JSON.stringify(state.mistakeBook)); } catch {}
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
  let serviceWorkerRegistration = null;
  let mapSwitchDialog = null;
  let releaseUpdateDialog = null;
  let promptedReleaseVersion = '';
  const pronunciationAvailable = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const QUESTION_AUDIO_VERSION = '20260719-question-200-nouns-v2';
  const FEEDBACK_AUDIO_SRC = {
    correct: 'assets/audio/feedback-holly/correct.mp3?v=20260718-holly-feedback-v1',
    wrong: 'assets/audio/feedback-holly/wrong.mp3?v=20260718-holly-feedback-v1',
  };

  // ─── 本地 MP3（豆包 TTS 预录） ──────────────────────
  const EXTRA_WORD_AUDIO = {
    'ice cream': 'assets/audio/words/ice_cream.mp3?v=20260718-ice-cream-word-v1',
  };
  let wordAudioMap = {};
  let wordAudioManifestLoaded = false;
  let localAudioEl = null;

  function wordAudioSrcFor(word) {
    const key = String(word || '').toLowerCase();
    return wordAudioMap[key] || EXTRA_WORD_AUDIO[key] || '';
  }

  function wordHasLocalAudio(word) {
    return !!wordAudioSrcFor(word);
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
      button.disabled = !wordHasLocalAudio(w);
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
    if (pronunciationAvailable) speechSynthesis.cancel();
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
      if (pronunciationAvailable) speechSynthesis.cancel();
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
    return state.preferences.mapWorld === 'desert' ? DESERT_MAP_MUSIC_VOLUME : MAP_MUSIC_VOLUME;
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

  function setPreference(key, value) {
    if (!(key in defaultPreferences)) return;
    state.preferences[key] = value;
    try { localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(state.preferences)); } catch {}
    applyPreferences();
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

  function showToast(message) {
    if (!appToast || !message) return;
    clearTimeout(toastTimer);
    appToast.textContent = message;
    appToast.hidden = false;
    toastTimer = setTimeout(() => { appToast.hidden = true; }, 1800);
  }

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
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js?v=46').then((registration) => {
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

  // 我的页"检查内容更新"：手动触发一次 H5 资源检查，状态直接写回行内小字
  function checkAppUpdate() {
    const note = document.querySelector('[data-check-update-note]');
    if (!('serviceWorker' in navigator) || !canRegisterServiceWorker(location.protocol)) {
      if (note) note.textContent = '当前环境不支持自动更新';
      return;
    }
    if (!serviceWorkerRegistration) {
      if (note) note.textContent = '更新服务尚未就绪，请稍后重试';
      return;
    }
    if (appUpdateReady) {
      showAppUpdateReady();
      if (note) note.textContent = '内容更新已准备好，点顶部「立即更新」生效';
      return;
    }
    if (note) note.textContent = '正在检查更新…';
    serviceWorkerRegistration.update().then(() => {
      // updatefound → installed 是异步的，留一个短窗口再下结论
      setTimeout(() => {
        if (!note) return;
        note.textContent = appUpdateReady
          ? '发现内容更新，点顶部「立即更新」生效'
          : '当前已是最新版本';
      }, 900);
    }).catch((err) => {
      // InvalidStateError = SW 还没激活完（多为首次打开），不是网络问题，文案要区分
      if (note) {
        note.textContent = err && err.name === 'InvalidStateError'
          ? '更新服务尚未就绪，请稍后重试'
          : '网络不可用，请稍后重试';
      }
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
      ocean: 'assets/islands-v1/runtime/island-001.webp',
      desert: `assets/egypt-map/cutouts/buildings/v6-sand-blend/${DESERT_LANDMARK_IMAGES[0]}`,
    };
    // 每个世界的适龄段与一句话卖点：帮家长 1 秒判断该选哪张图
    const worldMeta = {
      ocean: { ageRange: '3-5', tagline: '启蒙磨耳朵 · 字母单词起步' },
      desert: { ageRange: '6-8', tagline: '进阶挑战 · 句型对话冲刺' },
      castle: { ageRange: '9-12', tagline: '章节冒险 · 读写表达飞跃' },
    };
    // 按家长设置的宝宝年龄给出推荐世界（设置项目前覆盖 3-6 岁，6 岁进沙漠段；9+ 岁等城堡开放）
    const childAge = Number(normalizeChildProfile(state.preferences).childAge) || 4;
    const recommendedWorldId = childAge >= 6 ? 'desert' : 'ocean';

    const worldOptions = Object.values(MAP_WORLDS).map((world) => {
      const isComingSoon = world.comingSoon === true;
      const isActive = !isComingSoon && world.id === activeWorldId;
      const isRecommended = !isComingSoon && world.id === recommendedWorldId;
      // state.progressByWorld 存的已是 { ocean, desert } 形状，直接取对应世界；
      // 旧数据可能是单世界扁平 progress，normalizeProgress 会兜底。
      const worldProgress = normalizeProgress(state.progressByWorld?.[world.id], DISPLAY_LEVEL_COUNT);
      const currentLevel = Math.min(Math.max(worldProgress.unlockedThrough, 1), DISPLAY_LEVEL_COUNT);
      const meta = worldMeta[world.id];
      const art = worldArt[world.id];
      const ariaLabel = isComingSoon
        ? `${world.title}，适合 ${meta.ageRange} 岁，${meta.tagline}，敬请期待`
        : `${world.title}，适合 ${meta.ageRange} 岁，${meta.tagline}，共 ${DISPLAY_LEVEL_COUNT} 关，已闯到第 ${currentLevel} 关${isActive ? '，正在游玩' : ''}${isRecommended ? '，按宝宝年龄推荐' : ''}`;
      return `
      <button class="map-world-option map-world-option--${world.id}${isActive ? ' is-active' : ''}${isComingSoon ? ' is-coming-soon' : ''}" type="button" ${isComingSoon ? 'disabled' : `data-map-world="${world.id}" aria-pressed="${isActive ? 'true' : 'false'}"`} aria-label="${ariaLabel}">
        <span class="map-world-art" aria-hidden="true">
          ${art ? `<img src="${assetHref(art)}" alt="" loading="lazy">` : '<span class="map-world-art-placeholder"><svg viewBox="0 0 24 24"><path d="M12 2 4 6v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V6l-8-4Z"/><path d="M12 8v4"/><path d="m12 16 .01 0"/></svg></span>'}
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
          ${isComingSoon ? '<small class="map-world-soon-note">新地图制作中，上线后第一时间通知你</small>' : `<span class="map-world-progress" aria-hidden="true"><span style="width:${Math.max(2, Math.round((currentLevel / DISPLAY_LEVEL_COUNT) * 100))}%"></span></span>
          <small class="map-world-subinfo">第 ${currentLevel}/${DISPLAY_LEVEL_COUNT} 关</small>`}
        </span>
        <span class="map-world-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7"/></svg></span>
      </button>`;
    }).join('');

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
      '<p>按宝宝年龄挑一张地图，从最适合的世界开始冒险吧！</p>',
      `<div class="map-world-options" role="list">${worldOptions}</div>`,
      '</div>',
    ].join('');

    const dialog = mapSwitchDialog;
    document.body.appendChild(dialog);
    dialog.querySelectorAll('[data-map-switch-close]').forEach((button) => {
      button.addEventListener('click', closeMapSwitchDialog);
    });
    dialog.querySelectorAll('[data-map-world]').forEach((button) => {
      button.addEventListener('click', () => {
        const nextWorldId = normalizeMapWorldId(button.dataset.mapWorld);
        state.preferences.mapWorld = nextWorldId;
        state.progress = state.progressByWorld[nextWorldId];
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
      if (!requestReleaseUpdate(updateInfo, window)) showToast(`请打开 ${updateInfo.storeName} 搜索宝宝英语岛更新`);
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

  /** 航程胶囊 HUD：关卡徽章 + 珍珠航线 + 航程数字（与 resource-chip 同族） */
  function renderCompactJourney(completedCount, unlockedThrough, totalLevels) {
    var currentLevel = Math.min(Math.max(unlockedThrough, 1), totalLevels);
    var allCompleted = completedCount >= totalLevels;
    var pct = Math.min(completedCount / totalLevels, 1);
    var pctPct = Math.round(pct * 100);

    var nextMilestone = 0;
    var msCheck = [1, 2, 3, 4, 5].map(function (step) {
      return Math.round((totalLevels / 5) * step);
    });
    for (var mi = 0; mi < msCheck.length; mi++) {
      if (completedCount < msCheck[mi]) { nextMilestone = msCheck[mi]; break; }
    }

    var badgeLabel = allCompleted ? '✓' : String(currentLevel);
    var badgeClass = allCompleted ? 'j-badge j-badge--done' : 'j-badge';

    var pearlsHtml = '';
    for (var mj = 0; mj < msCheck.length; mj++) {
      var mVal = msCheck[mj];
      var state = 'pending';
      if (allCompleted || completedCount >= mVal) state = 'done';
      else if (nextMilestone === mVal) state = 'active';
      pearlsHtml += '<span class="j-pearl j-pearl--' + state + ' j-pearl--' + mVal + '" style="left:' + ((mVal / totalLevels) * 100) + '%" data-stage="' + mVal + '">'
        + '<span class="j-pearl-dot" aria-hidden="true"></span>'
        + '<span class="j-pearl-label">' + mVal + '</span>'
        + '</span>';
    }

    var nextHtml;
    if (allCompleted) {
      nextHtml = '<span class="j-next j-next--done">'
        + '<svg class="j-next-star" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.4 6.6 19.3l1-6.1L3.2 8.9l6.1-.9L12 2.5z"/></svg>'
        + '群岛通关</span>';
    } else {
      nextHtml = '<span class="j-next">下一阶段 · 第' + nextMilestone + '关</span>';
    }

    var ariaLabel = allCompleted
      ? '已完成' + totalLevels + '/' + totalLevels + '，群岛通关'
      : '已完成' + completedCount + '/' + totalLevels + '，当前第' + currentLevel + '关，下一阶段第' + nextMilestone + '关';

    return '<div class="journey-compact" role="group" aria-label="' + ariaLabel + '">'
      + '<div class="j-capsule">'
      +   '<div class="' + badgeClass + '" style="--j-pct:' + pctPct + '" aria-hidden="true">'
      +     '<span class="j-badge-ring"></span>'
      +     '<span class="j-badge-core"><span class="j-badge-num">' + badgeLabel + '</span></span>'
      +   '</div>'
      +   '<div class="j-main">'
      +     '<div class="j-top">'
      +       '<span class="j-label">航程</span>'
      +       '<span class="j-count"><strong>' + completedCount + '</strong><span class="j-slash">/' + totalLevels + '</span></span>'
      +       '<span class="j-dot-sep" aria-hidden="true"></span>'
      +       nextHtml
      +     '</div>'
      +     '<div class="j-pearls" role="progressbar" aria-valuenow="' + completedCount + '" aria-valuemin="0" aria-valuemax="' + totalLevels + '">'
      +       '<span class="j-pearls-rail" aria-hidden="true"></span>'
      +       '<span class="j-pearls-fill" style="width:' + pctPct + '%" aria-hidden="true"></span>'
      +       pearlsHtml
      +     '</div>'
      +   '</div>'
      + '</div>'
      + '</div>';
  }

  function activeWorldLevels() {
    return levelsForMapWorld(state.preferences.mapWorld);
  }

  function activeLevelById(levelId) {
    return activeWorldLevels().find((item) => item.id === levelId);
  }

  function requestLevelAccess(levelId, trigger = null) {
    const access = getLevelAccess(levelId, state.progress, state.preferences.vipActive === true);
    if (access === 'allowed') {
      const level = activeLevelById(levelId);
      if (!level?.videoSrc) {
        showMapMessage(lessonUnavailableMessage);
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
      ? '通过 App Store 安全支付 · 完成后会员权益立即生效'
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
      '<p class="paywall-eyebrow">VIP 学习卡</p>',
      `<h2 id="paywall-title">开通 VIP，获得会员关卡权益</h2>`,
      `<p>前 ${FREE_LEVEL_COUNT} 关已免费体验，开通后获得本地图会员关卡权益；后续课程内容更新后自动开放。</p>`,
      '</div>',
      '<section class="vip-plan" aria-label="VIP 套餐">',
      `<div><strong>${DISPLAY_LEVEL_COUNT} 座魔法岛 · 会员权益</strong><small>第 ${FREE_LEVEL_COUNT + 1}-${DISPLAY_LEVEL_COUNT} 关为会员关卡 · 后续新地图独立发售</small></div>`,
      '<span class="vip-price">¥99<small>买断本地图</small></span>',
      '</section>',
      '<div class="vip-benefits" aria-label="VIP 权益">',
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

  function renderMap(initialMessage = '') {
    const completed = state.progress.completed.length;
    const activeWorldId = normalizeMapWorldId(state.preferences.mapWorld);
    const activeWorld = MAP_WORLDS[activeWorldId];
    const worldLevels = levelsForMapWorld(activeWorldId);
    const focusedLevelId = Math.min(
      activeWorld.endLevel,
      Math.max(activeWorld.startLevel, state.progress.unlockedThrough),
    );
    const currentLevel = worldLevels.find((level) => level.id === focusedLevelId) || worldLevels[0] || levels[0];
    const currentMapTheme = activeWorld.theme;
    const currentVehicle = MAP_VEHICLES[currentMapTheme] || MAP_VEHICLES.ocean;
    const stars = completed * 3;
    const shells = 120 + completed * 25;
    const levelNodes = worldLevels.map((level) => {
      const status = levelStatus(level.id);
      const label = `第 ${level.id} 关，${level.title}，${statusText(status)}`;
      const islandId = String(islandStyleId(level.id)).padStart(3, '0');
      const islandImage = assetHref(`assets/islands-v1/runtime/island-${islandId}.webp?v=20260720-underwater-fade-v3`);
      const mapImage = currentMapTheme === 'desert' ? assetHref(desertLandmarkImage(level.id)) : islandImage;
      const stopClass = currentMapTheme === 'desert' ? 'desert-landmark' : 'ocean-island';

      return `
        <div class="level-stop square-island ${stopClass}" data-stop="${level.id}" data-word="${level.title}" data-status="${status}" data-map-theme="${currentMapTheme}" style="--island-image:url('${mapImage}')">
          <span class="island-art" aria-hidden="true"></span>
          ${desertDecorMarkup(level.id, currentMapTheme)}
          ${status === 'locked' || status === 'premium' ? icons.islandLock : ''}
          <button class="level-node ${status}" type="button" data-level="${level.id}" aria-label="${label}" ${status === 'locked' ? 'aria-disabled="true"' : ''}>
            <span class="level-number">${level.id}</span>
            ${status === 'premium' ? icons.locked : icons[status]}
          </button>
          <span class="level-name">
            <span class="level-name-copy"><strong>${level.title}</strong><small>${level.zhTitle}</small></span>
            <button class="word-audio-button" type="button" data-speak-word="${level.title}" aria-label="播放 ${level.title} 发音"${wordHasLocalAudio(level.title) ? '' : ' disabled'}>${icons.wordAudio}</button>
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
                <span>${activeWorld.chipPrefix} · 第 ${currentLevel.id} 关 · ${currentLevel.title} ${currentLevel.zhTitle}</span>
              </span>
            </div>
          </div>

          ${renderCompactJourney(completed, state.progress.unlockedThrough, DISPLAY_LEVEL_COUNT)}

          <div class="resource-strip" aria-label="冒险资源">
            <div class="resource-chip">
              <span class="resource-icon star" aria-hidden="true"><img class="resource-glyph" src="assets/icons/resource-star.webp?v=20260714-v1" alt="" draggable="false"></span>
              <span><small>星星</small><strong>${stars}</strong></span>
            </div>
            <div class="resource-chip">
              <span class="resource-icon gem" aria-hidden="true"><svg class="resource-glyph resource-glyph--gem" viewBox="0 0 48 48" role="img" aria-label="宝石"><path d="M12 6h24l8 12-20 24L4 18l8-12Z" fill="#a5f3fc" stroke="#0e7490" stroke-width="2.4" stroke-linejoin="round"/><path d="M4 18h40M12 6l12 12 12-12M24 42V18" fill="none" stroke="#0e7490" stroke-width="2" stroke-linejoin="round"/><path d="M12 6h24" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/></svg></span>
              <span><small>宝石</small><strong>${shells}</strong></span>
            </div>
          </div>
        </header>

        <p class="map-message" role="status" ${initialMessage ? '' : 'hidden'}>${initialMessage}</p>
        <section class="route-card surface" aria-label="${activeWorld.routeLabel}" data-map-world="${activeWorld.id}" data-map-theme="${currentMapTheme}">
          <div class="route-ocean" data-map-theme="${currentMapTheme}">
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
            <button class="map-locate-btn" type="button" data-locate-progress data-current-level="${currentLevel.id}" aria-label="定位到第 ${currentLevel.id} 关" title="定位到当前关卡">
              ${icons.locate}
            </button>
            <div class="route-scroll" data-route-scroll tabindex="0" aria-label="${activeWorld.routeLabel}，左右滑动浏览">
              <div class="route-canvas">
                <div class="boat-dock" aria-hidden="true">
                  <div class="toy-steamboat ${currentMapTheme === 'desert' ? 'is-desert-rider' : ''}" data-current-boat>
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
          </div>
          <p class="swipe-hint" aria-hidden="true">${activeWorld.hint}</p>
        </section>
      </section>`;

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
    const BOAT_HOLD_MS = 300;
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
    const locateProgress = (behavior = 'smooth') => {
      const left = Math.max(0, currentStop.offsetLeft - (routeScroll.clientWidth - currentStop.offsetWidth) / 2);
      const previousScrollBehavior = routeScroll.style.scrollBehavior;
      if (behavior === 'auto') routeScroll.style.scrollBehavior = 'auto';
      routeScroll.scrollTo({ left, behavior });
      if (behavior === 'auto') routeScroll.style.scrollBehavior = previousScrollBehavior;
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

    const getBoatDepartureStop = (targetStop, direction) => {
      const targetIndex = stops.indexOf(targetStop);
      const departIndex = targetIndex - (direction < 0 ? -1 : 1);
      return stops[departIndex] || boatHomeStop;
    };

    const freezeBoatHomeAtCurrentX = () => {
      const homeWidth = lastFeedbackStop?.offsetWidth || centeredStop?.offsetWidth || 1;
      boatHomeStop = {
        offsetLeft: routeScroll.scrollLeft + routeScroll.clientWidth / 2 + boatX - homeWidth / 2,
        offsetWidth: homeWidth,
      };
      boatHomeFrozen = true;
    };

    const interruptBoatSail = () => {
      if (boatPhase === 'idle') return;
      freezeBoatHomeAtCurrentX();
      cancelBoatSail();
    };

    const finishBoatAtCenter = () => {
      boatPhase = 'idle';
      boatHomeFrozen = false;
      boatHomeStop = lastFeedbackStop;
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
      const tick = (now) => {
        const t = Math.min(1, (now - startedAt) / BOAT_SAIL_MS);
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

    // Island switches first; after skipped stops, the boat only rows the
    // adjacent segment into the new center.
    const scheduleBoatCrossing = (direction) => {
      cancelBoatSail();
      boatPhase = 'holding';
      setBoatSailing(false);
      snapBoatToHome();
      boatHomeFrozen = false;
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
      if (boatPhase !== 'sailing') {
        boatHomeStop = getBoatDepartureStop(centeredStop, travelDirection);
        boatHomeFrozen = false;
      }
    };

    const confirmIslandSwitch = () => {
      if (!feedbackArmed) return;
      feedbackArmed = false;
      if (centeredStop === lastFeedbackStop) {
        if (boatPhase === 'idle' && boatHomeStop === lastFeedbackStop) snapBoatToHome();
        return;
      }

      // Stay at previous island (or freeze mid-crossing position) until the fixed hold ends.
      if (boatPhase === 'sailing' || boatPhase === 'holding') {
        freezeBoatHomeAtCurrentX();
      } else if (!boatHomeFrozen) {
        boatHomeStop = lastFeedbackStop;
      }

      const travelDirection = centeredStop.offsetLeft < lastFeedbackStop.offsetLeft ? -1 : 1;
      boatHomeStop = getBoatDepartureStop(centeredStop, travelDirection);
      boatHomeFrozen = false;
      lastFeedbackStop = centeredStop;
      navigator.vibrate?.(30);
      playIslandSound();
      scheduleBoatCrossing(travelDirection);

      if (!state.preferences.autoPronunciation) return;
      if (!wordHasLocalAudio(centeredStop.dataset.word)) return;
      pronunciationTimer = setTimeout(() => {
        playWordPronunciation(
          centeredStop.dataset.word,
          centeredStop.querySelector('[data-speak-word]'),
        );
      }, 140);
    };

    const handleRouteIntent = () => {
      armIslandFeedback();
      interruptBoatSail();
    };
    routeScroll.addEventListener('pointerdown', handleRouteIntent, { passive: true });
    routeScroll.addEventListener('touchstart', handleRouteIntent, { passive: true });
    routeScroll.addEventListener('wheel', handleRouteIntent, { passive: true });
    routeScroll.addEventListener('keydown', handleRouteIntent);
    routeScroll.addEventListener('scroll', () => {
      if (!scrollFrame) {
        scrollFrame = requestAnimationFrame(() => {
          scrollFrame = 0;
          updateCenteredStop();
          // Stick to previous island while scrolling / holding; sail uses its own rAF.
          if (boatPhase !== 'sailing') snapBoatToHome();
        });
      }
      clearTimeout(feedbackTimer);
      feedbackTimer = setTimeout(confirmIslandSwitch, 120);
    }, { passive: true });

    main.querySelector('[data-locate-progress]').addEventListener('click', () => {
      handleRouteIntent();
      locateProgress();
    });
    requestAnimationFrame(() => {
      locateProgress('auto');
      centeredStop.classList.add('is-centered');
      boatHomeStop = currentStop;
      setBoatX(0);
      setBoatSailing(false);
    });
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

  function renderDetail(level) {
    removeGlobalHintHand();
    const alreadyCompleted = state.progress.completed.includes(level.id);
    const correctWord = level.options[level.correct];
    // 题型一：2 选项（正确 + 1 干扰项），适配幼儿大触控区
    const distractors = level.options.filter((_, i) => i !== level.correct);
    const lessonOptions = [correctWord, distractors[0] || correctWord];
    const questionSpoken = questionPromptText(level);
    const questionAudioSrc = questionAudioSrcFor(level);
    const questionHtml = `小朋友，视频里学到的单词，<br>哪一个是 <strong>「${level.zhTitle}」</strong> 的意思？`;
    const topicShort = String(level.topic || '').split('·')[0].trim();

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
        </nav>

        <section class="stage" data-stage-video aria-label="课程视频">
          <div class="stage-video-inner">
            <div class="video-card">
              <div class="video-frame">
                <video data-video playsinline preload="metadata" src="${level.videoSrc}" data-video-source="${level.videoMeta?.source || 'local'}" data-video-task-id="${level.videoMeta?.taskId || ''}" data-video-qa="${level.videoMeta?.qa || ''}" data-video-audio="${level.videoMeta?.audio || ''}"></video>
                <button class="play-overlay" type="button" data-play-overlay aria-label="播放视频">
                  <span class="play-circle" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </span>
                </button>
              </div>
              <p class="video-hint">认真看完，问题马上出现</p>
              <div class="video-progress" aria-hidden="true"><i data-video-progress></i></div>
            </div>
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

    main.querySelector('[data-back-map]').addEventListener('click', goBackMap);

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
    const soundCorrect = () => { tone(523.25, 0, 0.18); tone(659.25, 0.14, 0.18); tone(783.99, 0.28, 0.3); };
    const soundWrong = () => { tone(220, 0, 0.22, 'triangle', 0.07); tone(174.61, 0.18, 0.3, 'triangle', 0.07); };
    const soundSelect = () => { tone(440, 0, 0.09, 'sine', 0.05); };

    function stopSpeaking() {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
      }
      cancelWordPronunciation();
      try { window.speechSynthesis?.cancel(); } catch (_) {}
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
      startRound();
      stageQuiz.hidden = true;
      stageVideo.hidden = false;
      stageVideo.classList.remove('lq-leaving');
      video.currentTime = 0;
      videoProgress.style.width = '0%';
      playOverlay.hidden = true;
      video.play().catch(() => { playOverlay.hidden = false; });
    }

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

    main.querySelector('[data-rewatch]').addEventListener('click', rewatchVideo);
    listenQuestionBtn.addEventListener('click', speakQuestion);
    submitBtn.addEventListener('click', submitAnswer);
    continueBtn.addEventListener('click', goBackMap);

    startRound();
    // 立刻出现引导手（指向播放按钮）
    requestAnimationFrame(() => {
      if (isCurrentQuizView() && !playOverlay.hidden) showHintAt(playOverlay);
    });
    setTimeout(() => {
      if (isCurrentQuizView() && !playOverlay.hidden) showHintAt(playOverlay);
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
    const report = learningReport(state.progress, state.learningActivity, levels);
    const completed = report.completed;
    const activeDays = report.activeDays;
    const learningMinutes = report.learningMinutes;
    const learnedWords = report.learnedWords;
    // 词库卡片默认只露出最近 WORD_CHIP_PREVIEW 个（新→旧），其余收进 +N 展开按钮。
    // 一关一词，本地图学完即 200 个词牌；后续新地图上线词量还会翻倍，无界渲染会顶穿页面
    const WORD_CHIP_PREVIEW = 12;
    const hiddenWordCount = Math.max(0, learnedWords.length - WORD_CHIP_PREVIEW);
    const mistakeCount = state.mistakeBook.items.length;
    const childProfile = normalizeChildProfile(state.preferences);
    const membership = membershipSummary(state.preferences);
    const membershipAction = membership.isVip
      ? '<span class="membership-active-note">VIP 权益已生效</span>'
      : '<button class="membership-upgrade-button" type="button" data-open-vip-paywall>开通 VIP</button>';
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
            <p class="eyebrow">MY ENGLISH JOURNEY</p>
            <h1 id="mine-title">我的英语岛</h1>
            <div class="profile-card">
              <div class="avatar" aria-hidden="true">${escapeHtml(profileAvatarText(childProfile.childName))}</div>
              <div class="profile-copy"><h2>${escapeHtml(childProfile.childName)}同学</h2><p>Little explorer · ${childProfile.childAge} 岁英语小小探索家</p></div>
            </div>

            <section class="surface membership-card is-${membership.status}" data-membership-status="${membership.status}" aria-label="会员状态">
              <div class="membership-copy">
                <span class="membership-badge">${membership.badge}</span>
                <h2>${membership.title}</h2>
                <p>${membership.note}</p>
              </div>
              <div class="membership-count" aria-label="${membership.countLabel} ${membership.count}">
                <strong>${membership.count}</strong>
                <span>${membership.countLabel}</span>
              </div>
              ${membershipAction}
            </section>

            <div class="stats-grid" aria-label="英语学习统计">
              <div class="stat-card"><span class="stat-value">${learnedWords.length}</span><span class="stat-label">已学单词</span></div>
              <div class="stat-card"><span class="stat-value">${completed}</span><span class="stat-label">完成关卡</span></div>
              <div class="stat-card"><span class="stat-value">${mistakeCount}</span><span class="stat-label">待复习</span></div>
              <div class="stat-card"><span class="stat-value">${activeDays}</span><span class="stat-label">学习天数</span></div>
              <div class="stat-card"><span class="stat-value">${learningMinutes}</span><span class="stat-label">学习分钟</span></div>
            </div>

            <section class="surface mine-progress" aria-labelledby="mine-progress-title">
              <h2 id="mine-progress-title">Island progress <span>岛屿进度</span></h2>
              <p>已经完成 ${completed} 个英语学习站点</p>
              <div class="progress-row">
                <div class="progress-track"><div class="progress-fill" style="width: ${progressPercent()}%"></div></div>
                <span class="progress-number">${progressPercent()}%</span>
              </div>
            </section>
          </section>

          <aside class="mine-side">
            <section class="surface word-bank" aria-labelledby="word-bank-title">
              <p class="eyebrow">WORD BANK</p>
              <h2 id="word-bank-title">学会的单词</h2>
              <div class="word-bank-words" data-word-chips>
                <div class="word-chips">${learnedWords.slice().reverse().map((word) => `<span>${word}</span>`).join('')}</div>
                ${hiddenWordCount > 0 ? `<button class="word-chips-more" type="button" data-words-expand data-hidden-count="${hiddenWordCount}" aria-expanded="false">+${hiddenWordCount} 词</button>` : ''}
              </div>
              <p>继续闯关，把更多英文单词带回小岛。</p>
            </section>

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
              ${preferenceSwitch('mapMusic', '背景音乐', '小岛地图播放音乐', '已关闭地图音乐')}
              ${preferenceSwitch('autoPronunciation', '自动读单词', '切换小岛时自动播放', '只在点击喇叭时播放')}
              ${preferenceSwitch('showChineseHints', '中文辅助', '显示中文提示', '隐藏小岛中文提示')}
            </ul>

            <h2 class="section-title">App info <span>应用信息</span></h2>
            <ul class="settings-list app-info-list" aria-label="应用信息">
              <li class="setting-row setting-row-control">
                <button class="setting-button setting-link-button" type="button" data-check-update>
                  <span class="setting-copy"><span class="setting-title">检查内容更新</span><span class="setting-note" data-check-update-note>检查课程资源和页面内容更新</span></span>
                  <span class="setting-arrow" aria-hidden="true">›</span>
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
              <p>先完成当前关卡，下一座小岛会自动解锁。</p>
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
          <p class="eyebrow">LOST ISLAND</p>
          <h1 id="not-found-title">页面走丢了</h1>
          <p>这个小岛入口不存在。回到闯关地图，继续当前学习进度。</p>
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
        document.title = '宝宝英语岛';
        syncMapMusic();
        return;
      }
      if (!level.videoSrc) {
        history.replaceState(null, '', '#map');
        bottomTabs.hidden = false;
        appShell.classList.remove('detail-shell');
        document.body.classList.remove('level-quiz-active');
        document.body.classList.add('map-game-active');
        setActiveTab('map');
        renderMap(lessonUnavailableMessage);
        document.title = '宝宝英语岛';
        syncMapMusic();
        return;
      }
      bottomTabs.hidden = true;
      appShell.classList.add('detail-shell');
      document.body.classList.add('level-quiz-active');
      renderDetail(level);
      document.title = `${level.title} · 宝宝英语岛`;
    } else {
      bottomTabs.hidden = false;
      appShell.classList.remove('detail-shell');
      document.body.classList.remove('level-quiz-active');
      if (route.type === 'ranking') {
        renderRanking();
        document.title = '英语星排行榜 · 宝宝英语岛';
      } else if (route.type === 'mine') {
        renderMine();
        document.title = '我的 · 宝宝英语岛';
      } else if (route.type === 'support') {
        renderSupport();
        document.title = '帮助与反馈 · 宝宝英语岛';
      } else if (route.type === 'info') {
        renderInfoPage(route.page);
        document.title = `${appInfoPages[route.page].title} · 宝宝英语岛`;
      } else if (route.type === 'not-found') {
        renderNotFound();
        document.title = '页面走丢了 · 宝宝英语岛';
      } else {
        renderMap();
        document.title = '宝宝英语岛';
      }
    }

    setActiveTab(route.type);
    syncMapMusic(route);
  }

  window.addEventListener('pointerdown', () => {
    syncMapMusic();
  }, { passive: true });
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => navigate(button.dataset.tab));
  });
  window.addEventListener('offline', () => updateNetworkStatus(false));
  window.addEventListener('online', () => {
    updateNetworkStatus(true);
    checkReleaseUpdate();
    hydrateLearningStateFromBackend();
  });
  window.addEventListener('baby-island-auth-change', (event) => {
    if (event.detail?.isLoggedIn) hydrateLearningStateFromBackend();
    else learningSyncReady = false;
  });
  window.addEventListener('popstate', render);
  networkStatus?.addEventListener('click', (event) => {
    if (event.target.closest('[data-app-refresh]')) location.reload();
  });
  registerServiceWorker();

  if (!location.hash) history.replaceState(null, '', '#map');
  updateNetworkStatus(false);
  render();
  checkReleaseUpdate();
  hydrateLearningStateFromBackend();

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
    var vipButton = ev.target.closest('[data-open-vip-paywall]');
    if (vipButton) {
      ev.preventDefault();
      openPaywallDialog(FREE_LEVEL_COUNT + 1, vipButton);
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
    var routeBtn = ev.target.closest('[data-nav-route]');
    if (routeBtn) {
      ev.preventDefault();
      navigate(routeBtn.dataset.navRoute);
      return;
    }
    var signOutBtn = ev.target.closest('[data-sign-out]');
    if (signOutBtn) {
      ev.preventDefault();
      showToast('退出登录功能即将上线');
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
