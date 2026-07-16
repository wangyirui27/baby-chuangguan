const curriculumUnits = [
  { topic: 'First Words · 初见英语', words: [['hello', '你好'], ['red', '红色'], ['flower', '花朵'], ['bye', '再见'], ['yes', '是的'], ['no', '不是'], ['please', '请'], ['thanks', '谢谢'], ['friend', '朋友'], ['happy', '开心']] },
  { topic: 'Colors · 颜色', words: [['blue', '蓝色'], ['yellow', '黄色'], ['green', '绿色'], ['orange', '橙色'], ['purple', '紫色'], ['pink', '粉色'], ['black', '黑色'], ['white', '白色'], ['brown', '棕色'], ['rainbow', '彩虹']] },
  { topic: 'Animals · 动物', words: [['cat', '小猫'], ['dog', '小狗'], ['bird', '小鸟'], ['fish', '小鱼'], ['duck', '鸭子'], ['rabbit', '兔子'], ['panda', '熊猫'], ['tiger', '老虎'], ['lion', '狮子'], ['monkey', '猴子']] },
  { topic: 'Numbers · 数字', words: [['one', '一'], ['two', '二'], ['three', '三'], ['four', '四'], ['five', '五'], ['six', '六'], ['seven', '七'], ['eight', '八'], ['nine', '九'], ['ten', '十']] },
  { topic: 'Family · 家人', words: [['mom', '妈妈'], ['dad', '爸爸'], ['baby', '宝宝'], ['sister', '姐姐'], ['brother', '哥哥'], ['grandma', '奶奶'], ['grandpa', '爷爷'], ['family', '家人'], ['home', '家'], ['love', '爱']] },
  { topic: 'Food · 食物', words: [['apple', '苹果'], ['banana', '香蕉'], ['milk', '牛奶'], ['bread', '面包'], ['egg', '鸡蛋'], ['rice', '米饭'], ['cake', '蛋糕'], ['water', '水'], ['juice', '果汁'], ['cookie', '饼干']] },
  { topic: 'Body · 身体', words: [['head', '头'], ['eye', '眼睛'], ['ear', '耳朵'], ['nose', '鼻子'], ['mouth', '嘴巴'], ['hand', '手'], ['arm', '手臂'], ['leg', '腿'], ['foot', '脚'], ['body', '身体']] },
  { topic: 'Nature · 自然天气', words: [['sun', '太阳'], ['moon', '月亮'], ['star', '星星'], ['cloud', '云'], ['rain', '雨'], ['wind', '风'], ['snow', '雪'], ['tree', '树'], ['grass', '草地'], ['sky', '天空']] },
  { topic: 'Actions · 动作', words: [['run', '跑'], ['jump', '跳'], ['walk', '走'], ['sit', '坐下'], ['stand', '站立'], ['clap', '拍手'], ['smile', '微笑'], ['sing', '唱歌'], ['dance', '跳舞'], ['sleep', '睡觉']] },
  { topic: 'Daily Life · 日常生活', words: [['book', '书'], ['ball', '球'], ['car', '汽车'], ['bed', '床'], ['chair', '椅子'], ['table', '桌子'], ['shirt', '上衣'], ['shoes', '鞋子'], ['bath', '洗澡'], ['good night', '晚安']] },
];

const levels = curriculumUnits.flatMap((unit, unitIndex) => unit.words.map(([word, zhTitle], wordIndex) => {
  const id = unitIndex * 10 + wordIndex + 1;
  const correct = (id - 1) % 4;
  const options = [1, 2, 3].map((offset) => unit.words[(wordIndex + offset) % unit.words.length][0]);
  options.splice(correct, 0, word);

  return {
    id,
    title: word.replace(/\b\w/g, (letter) => letter.toUpperCase()),
    zhTitle,
    topic: unit.topic,
    duration: id % 10 === 0 ? '4 分钟' : '3 分钟',
    guidance: `看一看画面，听清并跟读 ${word}。`,
    question: `Which word means ${zhTitle}?`,
    options,
    correct,
  };
}));

const flowerVideoUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

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

function normalizeProgress(value, totalLevels = 100) {
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

function getLevelAccess(levelId, progress, account) {
  if (!account?.isLoggedIn) return 'login-required';
  if (levelId > progress.unlockedThrough) return 'locked';
  if (levelId > 5 && !account.hasFullAccess) return 'payment-required';
  return 'allowed';
}

function routePoint(levelId) {
  return { x: (levelId - 1) * 384, y: 0 };
}

function islandStyleId(levelId) {
  return ((levelId - 1) % 5) + 1;
}

/** 判断单词发音按钮是否应禁用（纯函数，供测试使用） */
function wordButtonDisabled(word, pronunciationAvailable, localAudioUrls) {
  if (!word || typeof word !== 'string') return true;
  if (pronunciationAvailable) return false;
  return !localAudioUrls[word.toLowerCase()];
}

if (typeof module !== 'undefined') {
  module.exports = { applyQuizAnswer, getLevelAccess, islandStyleId, levels, normalizeProgress, routePoint, wordButtonDisabled };
}

if (typeof document !== 'undefined') {
  const main = document.querySelector('#main-content');
  const appShell = document.querySelector('.app-shell');
  const bottomTabs = document.querySelector('.bottom-tabs');
  const mapMusic = document.querySelector('#map-music');
  const accessDialog = document.querySelector('[data-access-dialog]');
  const accessDialogContent = document.querySelector('[data-access-dialog-content]');
  mapMusic.volume = 0.3;
  const tabButtons = [...document.querySelectorAll('[data-tab]')];
  const PREVIEW_PROGRESS_KEY = 'baby-island-preview-progress-v1';
  let previewLoggedIn = false;
  let previewProgress = normalizeProgress(null, levels.length);
  // 先检查 sessionStorage 中的 token 是否存在，但真正的验证在会话恢复时进行
  var hasStoredToken = false;
  try { hasStoredToken = !!sessionStorage.getItem('baby-island-auth-token'); } catch {}
  try { previewLoggedIn = hasStoredToken; } catch {}
  try { previewProgress = normalizeProgress(JSON.parse(localStorage.getItem(PREVIEW_PROGRESS_KEY)), levels.length); } catch {}
  const state = {
    progress: previewProgress,
    account: { isLoggedIn: previewLoggedIn, hasFullAccess: false },
    pendingLevelId: null,
    pendingTrigger: null,
    messageTimer: null,
  };
  let smsCountdown = 0;
  let smsCountdownTimer = null;

  const icons = {
    completed: '<svg class="node-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m6 12 4 4 8-9"/></svg>',
    current: '<svg class="node-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m9 7 8 5-8 5z"/></svg>',
    locked: '<svg class="node-icon" aria-hidden="true" viewBox="0 0 24 24"><rect x="6" y="10" width="12" height="9" rx="2"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/></svg>',
    premium: '<svg class="node-icon" aria-hidden="true" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2"/></svg>',
    islandLock: '<span class="island-lock" aria-hidden="true"><svg viewBox="0 0 64 72"><path class="island-lock-shackle" d="M18 30v-8C18 12 24 7 32 7s14 5 14 15v8"/><rect class="island-lock-body" x="7" y="27" width="50" height="37" rx="12"/><path class="island-lock-highlight" d="M17 36h20"/><circle class="island-lock-keyhole" cx="32" cy="46" r="5"/><path class="island-lock-keyhole-stem" d="M32 50v7"/></svg></span>',
    locate: '<svg class="locate-progress-icon" aria-hidden="true" viewBox="0 0 48 48"><path d="M18 7h-5a6 6 0 0 0-6 6v5M30 7h5a6 6 0 0 1 6 6v5M18 41h-5a6 6 0 0 1-6-6v-5M30 41h5a6 6 0 0 0 6-6v-5"/><circle cx="24" cy="24" r="11"/></svg>',
    wordAudio: '<svg class="word-audio-icon" aria-hidden="true" viewBox="0 0 48 48"><path d="M9 19h8l10-8v26l-10-8H9z"/><path d="M33 18c3 3 3 9 0 12M38 13c7 6 7 16 0 22"/></svg>',
    stateCompleted: '<svg class="level-state-icon state-completed" aria-hidden="true" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20"/><path d="m15 24 6 6 13-14"/></svg>',
    stateCurrent: '<svg class="level-state-icon state-current" aria-hidden="true" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20"/><path d="m20 15 14 9-14 9z"/></svg>',
    stateLocked: '<svg class="level-state-icon state-locked" aria-hidden="true" viewBox="0 0 48 48"><rect x="12" y="21" width="24" height="19" rx="7"/><path d="M17 21v-5a7 7 0 0 1 14 0v5"/></svg>',
    accessLogin: '<svg class="access-hero-svg" aria-hidden="true" viewBox="0 0 72 72"><circle cx="28" cy="24" r="11"/><path d="M10 57c2-14 9-21 18-21s16 7 18 21"/><circle cx="52" cy="42" r="11"/><path d="m47 42 4 4 7-9"/></svg>',
    accessPremium: '<svg class="access-hero-svg" aria-hidden="true" viewBox="0 0 72 72"><path d="M21 31V20c0-10 6-16 15-16s15 6 15 16v11"/><rect x="10" y="29" width="52" height="36" rx="13"/><path d="M36 43v10"/><circle cx="36" cy="42" r="4"/></svg>',
    accessKey: '<svg aria-hidden="true" viewBox="0 0 32 32"><circle cx="11" cy="13" r="6"/><path d="m15 17 11 11M21 23l3-3M24 26l3-3"/></svg>',
    accessReplay: '<svg aria-hidden="true" viewBox="0 0 32 32"><path d="M26 11a11 11 0 1 0 1 9"/><path d="M25 4v8h-8"/></svg>',
    mapSwitch: '<svg aria-hidden="true" viewBox="0 0 1024 1024" fill="#383838"><path d="M242.42 370.04s54.6-84.16 141.01-129.32c86.4-45.15 192.86-32.15 262.67 11.64 69.82 43.78 93.31 80.73 93.31 80.73l60.15-34.21s12.44-6.16 12.44 8.21v214.83s0 19.17-14.52 12.32c-12.22-5.75-144.29-80.75-185.9-104.42-22.86-10.18-2.78-18.45-2.78-18.45l58.03-33.12s-33.1-41.41-81.55-63.33c-51.87-26.98-100.41-30.18-159.89-7.76-38.78 14.62-84.43 52.05-117.33 107.35l-65.64-44.47z m539.17 283.93s-54.61 84.16-141.01 129.31c-86.41 45.16-192.86 32.16-262.67-11.63-69.82-43.79-93.32-80.74-93.32-80.74l-60.13 34.2s-12.44 6.17-12.44-8.21V502.07s0-19.16 14.52-12.32c12.21 5.76 144.29 80.76 185.9 104.42 22.85 10.18 2.77 18.45 2.77 18.45l-58.03 33.12s33.11 41.4 81.55 63.33c51.85 26.98 100.41 30.18 159.88 7.76 38.78-14.62 84.43-52.05 117.33-107.35l65.65 44.49z m0 0"/></svg>',
    mapSwitchHero: '<svg class="access-hero-svg" aria-hidden="true" viewBox="0 0 72 72" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 44a10 10 0 0 1 10-10h20a10 10 0 0 1 10 10v5a10 10 0 0 1-10 10H26a10 10 0 0 1-10-10v-5z"/><path d="M10 26a8 8 0 0 1 8-8h36a8 8 0 0 1 8 8v3a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8v-3z"/></svg>',
  };
  let islandAudioContext;
  let pronunciationTimer;
  let pronunciationToken = 0;
  const pronunciationAvailable = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  // ─── 本地 MP3（豆包 TTS 预录） ──────────────────────
  let wordAudioMap = {};
  let wordAudioManifestLoaded = false;
  let localAudioEl = null;

  function wordHasLocalAudio(word) {
    return word && wordAudioMap[word.toLowerCase()] !== undefined;
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
    fetch('assets/audio/words/word-audio-manifest.json')
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
      button.disabled = !pronunciationAvailable && !wordHasLocalAudio(w);
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
    mapMusic.volume = 0.3;
  }

  function playWordPronunciation(word, button) {
    pulseWordAudioButton(button);
    if (!word) return false;

    clearTimeout(pronunciationTimer);
    const token = ++pronunciationToken;

    // 优先本地 MP3（豆包 TTS 预录，BGM 压低/恢复 + 取消机制）
    const localUrl = wordAudioMap[word.toLowerCase()];
    if (localUrl) {
      if (pronunciationAvailable) speechSynthesis.cancel();
      if (!localAudioEl) {
        localAudioEl = new Audio();
        localAudioEl.preload = 'auto';
      }
      localAudioEl.pause();
      localAudioEl.currentTime = 0;
      localAudioEl.src = localUrl;
      mapMusic.volume = 0.12;
      const restoreMusic = () => {
        if (token === pronunciationToken) mapMusic.volume = 0.3;
      };
      localAudioEl.onended = restoreMusic;
      localAudioEl.onerror = restoreMusic;
      localAudioEl.play().catch(restoreMusic);
      return true;
    }

    // 降级: 浏览器 speechSynthesis
    if (!pronunciationAvailable) return false;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.82;
    utterance.pitch = 1.05;
    const voice = speechSynthesis.getVoices().find((item) => /^en[-_]/i.test(item.lang));
    if (voice) utterance.voice = voice;
    const restoreMusic = () => {
      if (token === pronunciationToken) mapMusic.volume = 0.3;
    };
    utterance.onend = restoreMusic;
    utterance.onerror = restoreMusic;
    mapMusic.volume = 0.12;
    speechSynthesis.speak(utterance);
    return true;
  }

  function routeFromHash() {
    const hash = location.hash.slice(1);
    const levelMatch = hash.match(/^level-(\d+)$/);

    if (levelMatch) {
      return { type: 'level', id: Number(levelMatch[1]) };
    }

    return { type: ['ranking', 'mine'].includes(hash) ? hash : 'map' };
  }

  function navigate(route, historyState = null) {
    if (location.hash === `#${route}`) return;
    history.pushState(historyState, '', `#${route}`);
    render();
    window.scrollTo(0, 0);
  }

  function syncMapMusic(route = routeFromHash()) {
    if (route.type === 'map') mapMusic.play().catch(() => {});
    else mapMusic.pause();
  }

  function levelStatus(id) {
    if (state.progress.completed.includes(id)) return 'completed';
    if (id <= state.progress.unlockedThrough) {
      return id > 5 && !state.account.hasFullAccess ? 'premium' : 'current';
    }
    return 'locked';
  }

  function progressPercent() {
    return Math.round((state.progress.completed.length / levels.length) * 100);
  }

  function statusText(status) {
    return { completed: '已完成', current: '学习中', premium: '家长解锁', locked: '待解锁' }[status];
  }

  /** 生成紧凑岛屿路线进度（5里程碑 SVG曲线 + 浮标 + 终点宝箱） */
  function renderCompactJourney(completedCount, unlockedThrough, totalLevels) {
    var currentLevel = Math.min(Math.max(unlockedThrough, 1), totalLevels);
    var allCompleted = completedCount >= totalLevels;
    var pct = Math.min(completedCount / totalLevels, 1);

    // 计算下一里程碑
    var nextMilestone = 1;
    var msCheck = [1, 20, 40, 60, 80, 100];
    for (var mi = 0; mi < msCheck.length; mi++) {
      if (completedCount < msCheck[mi]) { nextMilestone = msCheck[mi]; break; }
    }
    if (completedCount >= 100) nextMilestone = 0;

    // SVG 常量
    var svgW = 240, svgH = 38;
    var startX = 12, endX = 225, yLine = 26;
    var msXs = [40, 76, 112, 148, 184];  // 5 个里程碑 x 坐标
    var msLabels = [20, 40, 60, 80, 100];

    // 浮标位置沿路径推进
    var boatX = startX + (endX - startX) * pct;

    // 已完成路线终点
    var completedX = startX + (endX - startX) * pct;

    // 里程碑圆点
    var circlesHtml = '';
    for (var ci = 0; ci < msXs.length; ci++) {
      var cx = msXs[ci];
      var mVal = msLabels[ci];
      var isDone = completedCount >= mVal || allCompleted;
      var cls = isDone ? 'j-milestone j-milestone-done' : 'j-milestone j-milestone-pending';
      circlesHtml += '<circle cx="' + cx + '" cy="' + yLine + '" r="7" class="' + cls + '"/>';
    }

    // 浮标（小帆船）
    var boatSvg = '';
    if (!allCompleted) {
      boatSvg = '<g class="j-boat" transform="translate(' + boatX + ', ' + yLine + ')">'
        + '<path d="M-6,4 C-4,0 4,0 6,4 L10,6 L-10,6 Z" class="j-boat-body"/>'
        + '<path d="M-2,-1 L-2,4 M2,-1 L2,4" class="j-boat-mast"/>'
        + '<path d="M-2,-1 L5,3" class="j-boat-sail"/>'
        + '</g>';
    }

    // 终点宝箱
    var treasureDone = allCompleted ? ' j-treasure-done' : '';
    var treasureSvg = '<g class="j-treasure' + treasureDone + '" transform="translate(' + endX + ', ' + yLine + ')">'
      + '<rect x="-8" y="-6" width="16" height="12" rx="2" class="j-treasure-body"/>'
      + '<path d="M-9,-6 C-6,-10 6,-10 9,-6" class="j-treasure-lid"/>'
      + '<circle cx="0" cy="0" r="1.5" class="j-treasure-key"/>'
      + '</g>';

    var svg = '<svg class="j-svg" viewBox="0 0 ' + svgW + ' ' + svgH + '" aria-hidden="true">'
      + '<line x1="' + startX + '" y1="' + yLine + '" x2="' + endX + '" y2="' + yLine + '" class="j-rail j-rail-bg"/>'
      + '<line x1="' + startX + '" y1="' + yLine + '" x2="' + completedX + '" y2="' + yLine + '" class="j-rail j-rail-done"/>'
      + '<circle cx="' + startX + '" cy="' + yLine + '" r="3.5" class="j-start-dot"/>'
      + circlesHtml
      + boatSvg
      + treasureSvg
      + '</svg>';

    // 文字信息
    var infoText = '';
    if (allCompleted) {
      infoText = '<span class="j-info-complete">群岛通关 🎉</span>';
    } else {
      infoText = '<span class="j-info-main">已完成 <strong>' + completedCount + '</strong> / 100 · 第 <strong>' + currentLevel + '</strong> 关</span>';
      if (nextMilestone > 0) {
        infoText += '<span class="j-info-next">下一站 <strong>' + nextMilestone + '</strong></span>';
      }
    }

    return '<div class="journey-compact" aria-label="岛屿航线进度">'
      + svg
      + '<div class="j-info">' + infoText + '</div>'
      + '</div>';
  }

  // ─── SMS 验证码登录表单渲染及处理 ──────────────

  function validatePhone(phone) {
    return /^\d{11}$/.test(phone);
  }

  function validateCode(code) {
    return /^\d{6}$/.test(code);
  }

  function clearSmsCountdown() {
    if (smsCountdownTimer) {
      clearInterval(smsCountdownTimer);
      smsCountdownTimer = null;
    }
    smsCountdown = 0;
  }

  function startSmsCountdown(sendButton) {
    clearSmsCountdown();
    smsCountdown = 60;
    sendButton.disabled = true;

    var updateButton = function () {
      if (smsCountdown > 0) {
        sendButton.innerHTML = '重新发送 <span class="countdown-number">(' + smsCountdown + 's)</span>';
        smsCountdown -= 1;
      } else {
        clearSmsCountdown();
        var phone = (dialogPhoneInput && dialogPhoneInput.value) || '';
        sendButton.disabled = !validatePhone(phone);
        sendButton.textContent = '发送验证码';
        // 重新验证手机号
        if (dialogPhoneInput) {
          dialogPhoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    };

    updateButton(); // 立即显示 60
    smsCountdownTimer = setInterval(updateButton, 1000);
  }

  /** 在弹窗内容渲染后绑定 SMS 表单事件 */
  var dialogPhoneInput = null;
  var dialogCodeInput = null;
  var dialogSendBtn = null;
  var dialogSubmitBtn = null;
  var dialogErrorEl = null;
  var dialogDevBadge = null;
  var dialogDevCode = null;
  var dialogPhoneGroup = null;
  var dialogCodeGroup = null;

  function bindSmsFormEvents() {
    dialogPhoneInput = accessDialogContent.querySelector('[data-sms-phone]');
    dialogCodeInput = accessDialogContent.querySelector('[data-sms-code]');
    dialogSendBtn = accessDialogContent.querySelector('[data-sms-send]');
    dialogSubmitBtn = accessDialogContent.querySelector('[data-sms-submit]');
    dialogErrorEl = accessDialogContent.querySelector('[data-sms-error]');
    dialogDevBadge = accessDialogContent.querySelector('[data-sms-dev]');
    dialogDevCode = accessDialogContent.querySelector('[data-sms-dev-code]');
    dialogPhoneGroup = accessDialogContent.querySelector('[data-phone-group]');
    dialogCodeGroup = accessDialogContent.querySelector('[data-code-group]');

    if (!dialogPhoneInput || !dialogCodeInput) return;

    // 手机号输入 → 验证 + 更新发送/提交状态
    dialogPhoneInput.addEventListener('input', function () {
      var phone = this.value;
      var valid = validatePhone(phone);
      dialogPhoneGroup.classList.toggle('has-error', phone.length > 0 && !valid);
      if (dialogSendBtn && smsCountdown <= 0) {
        dialogSendBtn.disabled = !valid;
      }
      // 提交按钮也需要手机号有效
      updateSubmitButton();
    });

    // 验证码输入 → 验证 + 更新提交状态
    dialogCodeInput.addEventListener('input', function () {
      var code = this.value;
      var valid = validateCode(code);
      dialogCodeGroup.classList.toggle('has-error', code.length > 0 && !valid);
      updateSubmitButton();
    });

    // 发送验证码
    if (dialogSendBtn) {
      dialogSendBtn.addEventListener('click', function () {
        var phone = dialogPhoneInput.value;
        if (!validatePhone(phone) || smsCountdown > 0) return;

        dialogSendBtn.disabled = true;
        dialogSendBtn.textContent = '发送中…';

        // 隐藏旧的错误
        if (dialogErrorEl) dialogErrorEl.hidden = true;

        window.babyIslandApi.sendVerificationCode(phone).then(function (result) {
          startSmsCountdown(dialogSendBtn);

          // 开发模式：在弹窗内显示验证码
          var devCode = window.babyIslandApi.getLastDevCode();
          if (devCode && dialogDevBadge && dialogDevCode) {
            dialogDevBadge.hidden = false;
            dialogDevCode.textContent = devCode;
          } else if (dialogDevBadge) {
            dialogDevBadge.hidden = true;
          }

          // 聚焦到验证码输入
          if (dialogCodeInput) dialogCodeInput.focus();
        }).catch(function (err) {
          dialogSendBtn.disabled = false;
          dialogSendBtn.textContent = '发送验证码';
          if (dialogErrorEl) {
            dialogErrorEl.textContent = err.message || '发送失败，请重试';
            dialogErrorEl.hidden = false;
          }
        });
      });
    }

    // 表单提交
    var form = accessDialogContent.querySelector('[data-sms-login-form]');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        handleSmsLogin();
      });
    }
  }

  function updateSubmitButton() {
    if (!dialogSubmitBtn || !dialogPhoneInput || !dialogCodeInput) return;
    var phoneValid = validatePhone(dialogPhoneInput.value);
    var codeValid = validateCode(dialogCodeInput.value);
    dialogSubmitBtn.disabled = !phoneValid || !codeValid;
  }

  function handleSmsLogin() {
    var phone = dialogPhoneInput.value;
    var code = dialogCodeInput.value;

    if (!validatePhone(phone) || !validateCode(code)) return;

    dialogSubmitBtn.disabled = true;
    dialogSubmitBtn.classList.add('is-loading');

    if (dialogErrorEl) dialogErrorEl.hidden = true;

    window.babyIslandApi.verifyCode(phone, code).then(function (result) {
      // 登录成功
      dialogSubmitBtn.classList.remove('is-loading');

      state.account.isLoggedIn = true;
      state.account.hasFullAccess = !!(result.user && result.user.hasFullAccess);
      try { sessionStorage.setItem('baby-island-preview-login', '1'); } catch {}

      clearSmsCountdown();

      var pendingLevelId = state.pendingLevelId;
      var pendingTrigger = state.pendingTrigger;
      state.pendingLevelId = null;
      state.pendingTrigger = null;

      accessDialog.close();

      // 恢复原操作
      if (pendingLevelId) {
        setTimeout(function () { requestLevelAccess(pendingLevelId, pendingTrigger); }, 0);
      }
    }).catch(function (err) {
      // 登录失败
      dialogSubmitBtn.classList.remove('is-loading');
      dialogSubmitBtn.disabled = false;
      if (dialogErrorEl) {
        dialogErrorEl.textContent = err.message || '验证码错误或已过期，请重试';
        dialogErrorEl.hidden = false;
      }
    });
  }

  function handleLogout() {
    // 调用后端 logout 并清理本地会话
    window.babyIslandApi.logout().then(function () {
      // 清理前端状态
      state.account.isLoggedIn = false;
      state.account.hasFullAccess = false;
      try { sessionStorage.removeItem('baby-island-preview-login'); } catch {}
      // 清理 progress — 退出后回到未登录状态
      // 不破坏 progress/localStorage 逻辑，只是重置登录态
      render();
    }).catch(function () {
      // 即使请求失败也清理本地状态
      state.account.isLoggedIn = false;
      state.account.hasFullAccess = false;
      try { sessionStorage.removeItem('baby-island-preview-login'); } catch {}
      render();
    });
  }

  function openAccessDialog(kind, levelId, trigger) {
    state.pendingLevelId = levelId;
    state.pendingTrigger = trigger || null;

    clearSmsCountdown();

    if (kind === 'login') {
      // 新 SMS 登录弹窗
      accessDialogContent.innerHTML = `
        <button class="access-dialog-close" type="button" data-access-close aria-label="关闭窗口">
          <svg aria-hidden="true" viewBox="0 0 32 32"><path d="m9 9 14 14M23 9 9 23"/></svg>
        </button>
        <div class="access-hero login" aria-hidden="true">${icons.accessLogin}</div>
        <p class="eyebrow">PARENT LOGIN</p>
        <h2 id="access-dialog-title">手机验证码登录</h2>
        <p id="access-dialog-description" class="access-dialog-description">登录后记录学习进度，前 5 关免费体验</p>
        <form class="sms-login-form" data-sms-login-form novalidate>
          <label class="sms-login-field">
            <span class="sms-login-label">手机号</span>
            <span class="sms-login-input-group" data-phone-group>
              <span class="sms-login-prefix" aria-hidden="true">🇨🇳 +86</span>
              <input class="sms-login-input" type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="11" placeholder="请输入手机号" data-sms-phone aria-label="手机号，11位数字" autocomplete="tel-national">
            </span>
          </label>
          <div class="sms-login-code-row">
            <label class="sms-login-field" style="flex:1;min-width:0;">
              <span class="sms-login-label">验证码</span>
              <span class="sms-login-input-group" data-code-group>
                <input class="sms-login-input" type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="6 位验证码" data-sms-code aria-label="验证码，6位数字" autocomplete="one-time-code">
              </span>
            </label>
            <button class="sms-send-button" type="button" data-sms-send aria-label="发送验证码" disabled>发送验证码</button>
          </div>
          <p class="sms-login-error" data-sms-error role="alert" hidden></p>
          <button class="sms-submit-button" type="submit" data-sms-submit disabled>登录</button>
          <div class="sms-login-dev-badge" data-sms-dev hidden>
            🔧 开发模式 · 验证码：<span class="sms-login-dev-code" data-sms-dev-code></span>
          </div>
          <div class="sms-login-divider">或</div>
          <button class="access-secondary-button" type="button" data-access-close style="width:100%;">暂不登录</button>
        </form>
      `;

      if (!accessDialog.open) accessDialog.showModal();

      // 绑定表单事件
      bindSmsFormEvents();

      // 焦点到手机号输入
      requestAnimationFrame(function () {
        if (dialogPhoneInput) dialogPhoneInput.focus();
        else accessDialogContent.querySelector('[data-access-close]')?.focus();
      });

    } else {
      // 付费弹窗（保持不变）
      accessDialogContent.innerHTML = `
        <button class="access-dialog-close" type="button" data-access-close aria-label="关闭窗口">
          <svg aria-hidden="true" viewBox="0 0 32 32"><path d="m9 9 14 14M23 9 9 23"/></svg>
        </button>
        <div class="access-hero premium" aria-hidden="true">${icons.accessPremium}</div>
        <p class="eyebrow">PARENT ACCESS</p>
        <h2 id="access-dialog-title">请家长来解锁</h2>
        <p id="access-dialog-description" class="access-dialog-description">前 5 关免费。第 6 关起，需要家长解锁后继续冒险。</p>
        <div class="access-benefits">
          <span>${icons.accessKey}<span><strong>第 6–100 关</strong><small>解锁后继续学习</small></span></span>
          <span>${icons.accessReplay}<span><strong>可以反复学习</strong><small>已学关卡随时复习</small></span></span>
        </div>
        <div class="access-dialog-actions">
          <button class="access-primary-button" type="button" data-access-purchase>${icons.accessKey}<span>家长解锁</span></button>
          <button class="access-secondary-button" type="button" data-access-close>先复习前 5 关</button>
        </div>
        <p class="access-dialog-notice" data-access-notice role="status" hidden></p>
      `;

      if (!accessDialog.open) accessDialog.showModal();
      requestAnimationFrame(function () {
        accessDialogContent.querySelector('[data-access-close]')?.focus();
      });
    }
  }

  function requestLevelAccess(levelId, trigger = null) {
    const access = getLevelAccess(levelId, state.progress, state.account);
    if (access === 'allowed') {
      navigate(`level-${levelId}`, { fromMap: true });
    } else if (access === 'login-required') {
      openAccessDialog('login', levelId, trigger);
    } else if (access === 'payment-required') {
      openAccessDialog('payment', levelId, trigger);
    } else {
      showMapMessage(`先完成第 ${state.progress.unlockedThrough} 关，再继续冒险。`);
    }
  }

  // ─── 地图切换弹窗 ──────────────────────────────
  let mapSwitchDialog = null;

  function openMapSwitchDialog() {
    if (mapSwitchDialog) {
      if (mapSwitchDialog.open) return; // 不重复叠层
      mapSwitchDialog.remove();
      mapSwitchDialog = null;
    }

    mapSwitchDialog = document.createElement('dialog');
    mapSwitchDialog.className = 'map-switch-dialog';
    mapSwitchDialog.setAttribute('role', 'dialog');
    mapSwitchDialog.setAttribute('aria-modal', 'true');
    mapSwitchDialog.setAttribute('aria-labelledby', 'map-switch-title');

    mapSwitchDialog.innerHTML = [
      '<div class="map-switch-card">',
      '<button class="access-dialog-close" type="button" data-map-switch-close aria-label="关闭窗口">',
      '<svg aria-hidden="true" viewBox="0 0 32 32"><path d="m9 9 14 14M23 9 9 23"/></svg></button>',
'<div class="access-hero" aria-hidden="true" style="background:#FFD447;">',
          icons.mapSwitchHero,
          '</div>',
      '<h2 id="map-switch-title">更多地图开发中</h2>',
      '<p>新的冒险地图正在准备中，敬请期待。</p>',
      '<button class="access-primary-button" type="button" data-map-switch-close>',
      '<span>知道了</span></button>',
      '</div>',
    ].join('');

    document.body.appendChild(mapSwitchDialog);

    // 关闭事件
    mapSwitchDialog.querySelectorAll('[data-map-switch-close]').forEach(function (btn) {
      btn.addEventListener('click', closeMapSwitchDialog);
    });

    // 点击遮罩关闭
    mapSwitchDialog.addEventListener('click', function (event) {
      if (event.target === mapSwitchDialog) closeMapSwitchDialog();
    });

    // Esc 关闭后焦点返回切换按钮
    mapSwitchDialog.addEventListener('close', function () {
      returnFocusToSwitchButton();
    });

    mapSwitchDialog.showModal();

    // 焦点进入弹窗
    requestAnimationFrame(function () {
      var firstBtn = mapSwitchDialog.querySelector('button');
      if (firstBtn) firstBtn.focus();
    });
  }

  function closeMapSwitchDialog() {
    if (mapSwitchDialog && mapSwitchDialog.open) {
      mapSwitchDialog.close();
    }
  }

  function returnFocusToSwitchButton() {
    var btn = document.querySelector('[data-map-switch]');
    if (btn && btn.isConnected) btn.focus();
  }

  function renderMap(initialMessage = '') {
    const completed = state.progress.completed.length;
    const currentLevel = levels[state.progress.unlockedThrough - 1];
    const stars = completed * 3;
    const shells = 120 + completed * 25;
    // 计算下一里程碑
    var nextMilestone = 1;
    const milestones = [1, 20, 40, 60, 80, 100];
    for (var mi = 0; mi < milestones.length; mi++) {
      if (completed < milestones[mi]) {
        nextMilestone = milestones[mi];
        break;
      }
    }
    if (completed >= 100) nextMilestone = 0;
    const levelNodes = levels.map((level) => {
      const status = levelStatus(level.id);
      const label = `第 ${level.id} 关，${level.title}，${statusText(status)}`;
      const islandId = String(islandStyleId(level.id)).padStart(3, '0');
      const islandImage = `assets/islands-v1/runtime/island-${islandId}.webp?v=20260716-tier-cycle-v1`;

      return `
        <div class="level-stop square-island" data-stop="${level.id}" data-word="${level.title}" data-status="${status}" style="--island-image:url('${islandImage}')">
          <span class="island-art" aria-hidden="true"></span>
          ${status === 'locked' || status === 'premium' ? icons.islandLock : ''}
          <button class="level-node ${status}" type="button" data-level="${level.id}" aria-label="${label}" ${status === 'locked' ? 'aria-disabled="true"' : ''}>
            <span class="level-number">${level.id}</span>
            ${icons[status]}
          </button>
          <span class="level-name">
            <span class="level-name-copy"><strong>${level.title}</strong><small>${level.zhTitle}</small></span>
            <button class="word-audio-button" type="button" data-speak-word="${level.title}" aria-label="播放 ${level.title} 发音"${pronunciationAvailable || wordHasLocalAudio(level.title) ? '' : ' disabled'}>${icons.wordAudio}</button>
          </span>
          <span class="level-state-text ${status}" aria-label="${statusText(status)}">
            ${status === 'completed' ? icons.stateCompleted : status === 'current' ? icons.stateCurrent : icons.stateLocked}
            <small>${statusText(status)}</small>
          </span>
        </div>`;
    }).join('');

    main.innerHTML = `
      <section class="view map-view" aria-labelledby="map-title">
        <header class="map-topbar surface">
          <div class="map-brand">
            <div>
              <p class="eyebrow">100 MAGIC ISLANDS</p>
              <h1 id="map-title">100 座魔法岛</h1>
              <p>第 ${state.progress.unlockedThrough} 关 · ${currentLevel.title} ${currentLevel.zhTitle}</p>
            </div>
            <button class="map-switch-btn" type="button" data-map-switch aria-label="切换地图" title="切换地图">
              ${icons.mapSwitch}
            </button>
          </div>

          ${renderCompactJourney(completed, state.progress.unlockedThrough, levels.length)}

          <div class="resource-strip" aria-label="冒险资源">
            <div class="resource-chip">
              <span class="resource-icon star" aria-hidden="true"><img class="resource-glyph" src="assets/icons/resource-star.webp?v=20260714-v1" alt="" draggable="false"></span>
              <span><small>星星</small><strong>${stars}</strong></span>
            </div>
            <div class="resource-chip">
              <span class="resource-icon shell" aria-hidden="true"><img class="resource-glyph" src="assets/icons/resource-shell.webp?v=20260714-v1" alt="" draggable="false"></span>
              <span><small>贝壳</small><strong>${shells}</strong></span>
            </div>
          </div>
        </header>

        <p class="map-message" role="status" ${initialMessage ? '' : 'hidden'}>${initialMessage}</p>
        <section class="route-card surface" aria-label="一百座魔法小岛">
          <div class="route-ocean">
            <video class="ocean-loop" autoplay muted loop playsinline preload="auto" poster="assets/ocean/front-ocean-bg-v2-libtv.webp" aria-hidden="true">
              <source src="assets/ocean/front-ocean-loop-v4-libtv-seamless-clouds.mp4?v=20260716-libtv-seamless-clouds" type="video/mp4" media="(prefers-reduced-motion: no-preference)">
            </video>
            <img class="flying-seagull" data-seagull-flight src="assets/ocean/seagull-fly.webp?v=20260714-topdown" alt="" aria-hidden="true" draggable="false">
            <div class="flying-seagull-pair" data-seagull-flight aria-hidden="true">
              <img src="assets/ocean/seagull-fly.webp?v=20260714-topdown" alt="" draggable="false">
              <img src="assets/ocean/seagull-fly.webp?v=20260714-topdown" alt="" draggable="false">
            </div>
            <button class="map-locate-btn" type="button" data-locate-progress data-current-level="${state.progress.unlockedThrough}" aria-label="定位到第 ${state.progress.unlockedThrough} 关" title="定位到当前关卡">
              ${icons.locate}
            </button>
            <div class="route-scroll" data-route-scroll tabindex="0" aria-label="一百座英语关卡小岛，左右滑动浏览">
              <div class="route-stage">${levelNodes}</div>
            </div>
          </div>
          <p class="swipe-hint" aria-hidden="true">← 左右滑动探索 100 座魔法岛 →</p>
        </section>
      </section>`;

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

    main.querySelector('[data-map-switch]').addEventListener('click', openMapSwitchDialog);

    const routeScroll = main.querySelector('[data-route-scroll]');
    const currentStop = main.querySelector(`[data-stop="${state.progress.unlockedThrough}"]`);
    const stops = [...main.querySelectorAll('[data-stop]')];
    let centeredStop = currentStop;
    let lastFeedbackStop = currentStop;
    let feedbackArmed = false;
    let scrollFrame = 0;
    let feedbackTimer;
    const locateProgress = (behavior = 'smooth') => routeScroll.scrollTo({
      left: Math.max(0, currentStop.offsetLeft - (routeScroll.clientWidth - currentStop.offsetWidth) / 2),
      behavior,
    });

    const armIslandFeedback = () => {
      feedbackArmed = true;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext && !islandAudioContext) islandAudioContext = new AudioContext();
      islandAudioContext?.resume().catch(() => {});
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

    const updateCenteredStop = () => {
      const center = routeScroll.scrollLeft + routeScroll.clientWidth / 2;
      const nextStop = stops.reduce((closest, stop) => (
        Math.abs(stop.offsetLeft + stop.offsetWidth / 2 - center)
          < Math.abs(closest.offsetLeft + closest.offsetWidth / 2 - center) ? stop : closest
      ));
      if (nextStop === centeredStop) return;
      cancelWordPronunciation();
      centeredStop.classList.remove('is-centered');
      nextStop.classList.add('is-centered');
      centeredStop = nextStop;
    };

    const confirmIslandSwitch = () => {
      if (!feedbackArmed || centeredStop === lastFeedbackStop) return;
      lastFeedbackStop = centeredStop;
      navigator.vibrate?.(30);
      playIslandSound();
      pronunciationTimer = setTimeout(() => {
        playWordPronunciation(
          centeredStop.dataset.word,
          centeredStop.querySelector('[data-speak-word]'),
        );
      }, 140);
    };

    routeScroll.addEventListener('pointerdown', armIslandFeedback, { passive: true });
    routeScroll.addEventListener('wheel', armIslandFeedback, { passive: true });
    routeScroll.addEventListener('keydown', armIslandFeedback);
    routeScroll.addEventListener('scroll', () => {
      if (!scrollFrame) {
        scrollFrame = requestAnimationFrame(() => {
          scrollFrame = 0;
          updateCenteredStop();
        });
      }
      clearTimeout(feedbackTimer);
      feedbackTimer = setTimeout(confirmIslandSwitch, 120);
    }, { passive: true });

    main.querySelector('[data-locate-progress]').addEventListener('click', () => {
      armIslandFeedback();
      locateProgress();
    });
    requestAnimationFrame(() => {
      locateProgress('auto');
      centeredStop.classList.add('is-centered');
    });
  }

  function showMapMessage(text) {
    const message = main.querySelector('.map-message');
    message.textContent = text;
    message.hidden = false;
    clearTimeout(state.messageTimer);
    state.messageTimer = setTimeout(() => { message.hidden = true; }, 2600);
  }

  function renderDetail(level) {
    const alreadyCompleted = state.progress.completed.includes(level.id);
    const targetWord = level.options[level.correct];
    const options = level.options.map((option, index) => `
      <label class="option">
        <input type="radio" name="answer" value="${index}">
        <span class="option-copy"><span class="option-mark">${String.fromCharCode(65 + index)}</span>${option}</span>
      </label>`).join('');

    main.innerHTML = `
      <article class="view detail-view" aria-labelledby="detail-title">
        <button class="back-button" type="button" data-back-map>
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></svg>
          返回路线
        </button>

        <header class="detail-heading">
          <div>
            <span class="level-pill">第 ${level.id} 关 · ${level.topic}</span>
            <h1 id="detail-title">${level.title} <span>${level.zhTitle}</span></h1>
            <p class="page-intro">${level.duration} · Watch, listen, and choose one.</p>
          </div>
          <span class="status-pill" data-detail-state>${alreadyCompleted ? '已完成' : '进行中'}</span>
        </header>

        <div class="detail-learning-grid">
          <section class="lesson-media-panel" aria-label="本关视频和学习提示">
            <div class="video-shell">
              <video controls playsinline preload="metadata">
                <source src="${flowerVideoUrl}" type="video/mp4">
                你的浏览器暂不支持视频播放，请直接完成右侧问题。
              </video>
              <p class="video-fallback" hidden>视频暂时无法播放，请直接完成问题。</p>
            </div>
            <div class="guidance-card subtitle-card">
              <div><p class="eyebrow">SUBTITLES · 字幕跟读</p><h2>${targetWord}</h2></div>
              <div class="subtitle-copy">
                <p class="subtitle-english">Listen and say: <strong>${targetWord}</strong>.</p>
                <p>${level.guidance}</p>
              </div>
            </div>
          </section>

          <form class="quiz-card" data-quiz>
            <p class="quiz-label">CHOOSE ONE · 选一选</p>
            <h2>What did you learn?</h2>
            <fieldset>
              <legend>${level.question}</legend>
              ${options}
            </fieldset>
            <button class="primary-button" type="submit" disabled>Check answer · 看答案</button>
            <p class="feedback" role="status" tabindex="-1" hidden></p>
          </form>
        </div>
      </article>`;

    const video = main.querySelector('video');
    const fallback = main.querySelector('.video-fallback');
    const form = main.querySelector('[data-quiz]');
    const submit = form.querySelector('[type="submit"]');
    const feedback = form.querySelector('.feedback');

    video.addEventListener('error', () => { fallback.hidden = false; });
    main.querySelector('[data-back-map]').addEventListener('click', () => {
      if (history.state?.fromMap) history.back();
      else {
        history.replaceState(null, '', '#map');
        render();
        window.scrollTo(0, 0);
      }
    });

    form.addEventListener('change', () => {
      submit.disabled = false;
      submit.textContent = 'Check answer · 看答案';
      feedback.hidden = true;
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const selected = Number(new FormData(form).get('answer'));
      const result = applyQuizAnswer(state.progress, level.id, selected, level.correct, levels.length);
      const correct = result.correct;

      feedback.hidden = false;
      feedback.className = `feedback ${correct ? 'correct' : 'wrong'}`;

      if (correct) {
        const wasCompleted = state.progress.completed.includes(level.id);
        state.progress = result.progress;
        try { localStorage.setItem(PREVIEW_PROGRESS_KEY, JSON.stringify(state.progress)); } catch {}
        feedback.textContent = level.id === levels.length
          ? 'Great! 全部关卡已完成。'
          : wasCompleted ? 'Great! 本关已经完成。' : `Great! 第 ${level.id + 1} 关已解锁。`;
        form.querySelectorAll('input').forEach((input) => { input.disabled = true; });
        submit.textContent = 'Completed · 已完成';
        submit.disabled = true;
        main.querySelector('[data-detail-state]').textContent = '已完成';
      } else {
        feedback.textContent = 'Try again. 再听一遍，然后重新选择。';
        submit.textContent = 'Try again · 再试一次';
      }

      feedback.focus();
    });
  }

  function renderRanking() {
    const podiumOrder = [rankings[1], rankings[0], rankings[2]];
    const podiumRanks = [2, 1, 3];
    const podiumClasses = ['second', 'first', 'third'];
    const podium = podiumOrder.map((person, index) => `
      <article class="podium-card ${podiumClasses[index]}" aria-label="第 ${podiumRanks[index]} 名 ${person.name} ${person.score} 颗英语星">
        <span class="rank-medal">${podiumRanks[index]}</span>
        <p class="podium-name">${person.name}</p>
        <p class="podium-score">${person.score} 英语星</p>
      </article>`).join('');
    const remaining = rankings.slice(3).map((person, index) => `
      <li class="ranking-row">
        <span class="rank-number">${index + 4}</span>
        <span class="ranking-name">${person.name}</span>
        <span class="ranking-score">${person.score} 英语星</span>
      </li>`).join('');

    main.innerHTML = `
      <section class="view" aria-labelledby="ranking-title">
        <div class="ranking-layout">
          <section class="ranking-summary surface">
            <p class="eyebrow">WEEKLY ENGLISH STARS</p>
            <h1 id="ranking-title">英语星排行榜</h1>
            <p class="page-intro">每完成一关、答对一道题，都能收集本周英语星。</p>
            <div class="podium">${podium}</div>
          </section>
          <section class="ranking-board" aria-labelledby="ranking-board-title">
            <div class="section-heading"><div><p class="eyebrow">THIS WEEK</p><h2 id="ranking-board-title">本周积分</h2></div><span class="status-pill">每周一更新</span></div>
            <ol class="ranking-list" start="4">${remaining}</ol>
          </section>
        </div>
      </section>`;
  }

  function renderMine() {
    const completed = state.progress.completed.length;
    const learnedWords = levels
      .filter((level) => state.progress.completed.includes(level.id))
      .map((level) => level.options[level.correct]);

    main.innerHTML = `
      <section class="view" aria-labelledby="mine-title">
        <div class="mine-layout">
          <section class="mine-overview" aria-labelledby="mine-title">
            <p class="eyebrow">MY ENGLISH JOURNEY</p>
            <h1 id="mine-title">我的英语岛</h1>
            <div class="profile-card">
              <div class="avatar" aria-hidden="true">小禾</div>
              <div class="profile-copy"><h2>小禾同学</h2><p>Little explorer · 英语小小探索家</p></div>
            </div>

            <div class="stats-grid" aria-label="英语学习统计">
              <div class="stat-card"><span class="stat-value">${learnedWords.length}</span><span class="stat-label">已学单词</span></div>
              <div class="stat-card"><span class="stat-value">${completed}</span><span class="stat-label">完成关卡</span></div>
              <div class="stat-card"><span class="stat-value">3</span><span class="stat-label">学习天数</span></div>
              <div class="stat-card"><span class="stat-value">18</span><span class="stat-label">学习分钟</span></div>
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
              <div class="word-chips">${learnedWords.map((word) => `<span>${word}</span>`).join('')}</div>
              <p>继续闯关，把更多英文单词带回小岛。</p>
            </section>

            <h2 class="section-title">Family settings <span>家长设置</span></h2>
            <ul class="settings-list" aria-label="设置预览">
              <li class="setting-row"><span class="setting-title">学习提醒</span><span class="setting-note">开发中</span></li>
              <li class="setting-row"><span class="setting-title">每周英语报告</span><span class="setting-note">每周生成</span></li>
              <li class="setting-row"><span class="setting-title">声音与字幕</span><span class="setting-note">跟随系统</span></li>
              <li class="setting-row setting-row-logout" data-logout-row${state.account.isLoggedIn ? '' : ' hidden'}>
                <button class="logout-button" type="button" data-logout>
                  <span class="setting-title">退出登录</span>
                  <span class="setting-note">清除登录状态</span>
                </button>
              </li>
            </ul>
          </aside>
        </div>
      </section>`;
  }

  function setActiveTab(type) {
    const active = type === 'level' ? 'map' : type;
    tabButtons.forEach((button) => {
      const isActive = button.dataset.tab === active;
      if (isActive) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }

  function render() {
    const route = routeFromHash();

    if (route.type === 'level') {
      const level = levels.find((item) => item.id === route.id);
      const access = level ? getLevelAccess(route.id, state.progress, state.account) : 'missing';
      if (access !== 'allowed') {
        history.replaceState(null, '', '#map');
        bottomTabs.hidden = false;
        appShell.classList.remove('detail-shell');
        setActiveTab('map');
        renderMap(access === 'locked'
          ? `先完成第 ${state.progress.unlockedThrough} 关，再继续冒险。`
          : access === 'missing' ? '没有找到这个关卡。' : '');
        document.title = '宝宝英语岛';
        syncMapMusic();
        if (access === 'login-required' || access === 'payment-required') {
          requestAnimationFrame(() => openAccessDialog(
            access === 'login-required' ? 'login' : 'payment',
            route.id,
            null,
          ));
        }
        return;
      }
      bottomTabs.hidden = true;
      appShell.classList.add('detail-shell');
      renderDetail(level);
      document.title = `${level.title} · 宝宝英语岛`;
    } else {
      bottomTabs.hidden = false;
      appShell.classList.remove('detail-shell');
      if (route.type === 'ranking') {
        renderRanking();
        document.title = '英语星排行榜 · 宝宝英语岛';
      } else if (route.type === 'mine') {
        renderMine();
        document.title = '我的 · 宝宝英语岛';
      } else {
        renderMap();
        document.title = '宝宝英语岛';
      }
    }

    setActiveTab(route.type);
    syncMapMusic(route);
  }

  accessDialog.addEventListener('click', function (event) {
    if (event.target === accessDialog || event.target.closest('[data-access-close]')) {
      clearSmsCountdown();
      accessDialog.close();
      return;
    }
    if (event.target.closest('[data-access-purchase]')) {
      var notice = accessDialogContent.querySelector('[data-access-notice]');
      if (notice) {
        notice.textContent = '购买功能正在接入，当前不会产生费用。';
        notice.hidden = false;
      }
    }
  });
  accessDialog.addEventListener('close', () => {
    const trigger = state.pendingTrigger;
    state.pendingLevelId = null;
    state.pendingTrigger = null;
    if (trigger?.isConnected) trigger.focus();
    else (main.querySelector(`[data-level="${state.progress.unlockedThrough}"]`) || main).focus();
  });

  main.addEventListener('pointerdown', () => syncMapMusic(), { passive: true });
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => navigate(button.dataset.tab));
  });
  window.addEventListener('popstate', render);

  if (!location.hash) history.replaceState(null, '', '#map');

  // ─── 会话恢复 ────────────────────────────────
  // 页面加载后自动从 GET /api/auth/session 恢复登录态
  // 如果后端不可达 (file:// 或后端未运行)，保留本地 token 的登录标记
  var sessionChecked = false;
  window.babyIslandApi.checkSession().then(function (session) {
    sessionChecked = true;
    if (session.isLoggedIn && session.user) {
      state.account.isLoggedIn = true;
      state.account.hasFullAccess = !!session.user.hasFullAccess;
      try { sessionStorage.setItem('baby-island-preview-login', '1'); } catch {}
    } else if (window.babyIslandApi.getToken()) {
      // 有 token 但后端说无效 → 清理
      window.babyIslandApi.clearToken();
      state.account.isLoggedIn = false;
      state.account.hasFullAccess = false;
      try { sessionStorage.removeItem('baby-island-preview-login'); } catch {}
    } else {
      // 无 token，保持未登录
      state.account.isLoggedIn = false;
      state.account.hasFullAccess = false;
      try { sessionStorage.removeItem('baby-island-preview-login'); } catch {}
    }
    state.account._sessionChecked = true;

    // 首次渲染
    render();

    // ─── 退出登录 ──────────────────────────────
    // 使用事件委托监听 main 上的 data-logout
    main.addEventListener('click', function (ev) {
      var logoutBtn = ev.target.closest('[data-logout]');
      if (!logoutBtn) return;
      ev.preventDefault();
      handleLogout();
    });

  });
}
