/**
 * 生成品牌启动页 VO（嗨洛塔少儿启蒙APP），使用火山引擎 Peiqi + SSML 控制“嗨”拖长 + 抑扬。
 *
 * cd backend && node src/generate-brand-voice-peiqi.js
 */

const dotenv = require('dotenv');
const path = require('node:path');
const fs = require('node:fs');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const { synthesizeVoice } = require('./generate-voice-samples-v2.js');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'assets', 'brand', 'audio');
const SPEAKER = 'zh_female_peiqi_uranus_bigtts';

const TARGET_TEXT = '嗨洛塔少儿启蒙APP';

const variants = [
  {
    name: 'A-slow-hi',
    desc: '只把“嗨”极慢',
    ssml: `<speak><prosody rate="x-slow">嗨</prosody>洛塔少儿启蒙APP</speak>`,
    useSsml: true,
  },
  {
    name: 'B-slow-break',
    desc: '“嗨”极慢 + 180ms 停顿',
    ssml: `<speak><prosody rate="x-slow">嗨</prosody><break time="180ms"/>洛塔少儿启蒙APP</speak>`,
    useSsml: true,
  },
  {
    name: 'C-slow-low-rise',
    desc: '“嗨”慢而稍低，后扬（模拟先抑后扬）',
    ssml: `<speak><prosody rate="x-slow" pitch="-3st">嗨</prosody><prosody rate="medium" pitch="+2st">洛塔</prosody>少儿启蒙APP</speak>`,
    useSsml: true,
  },
  {
    name: 'D-very-slow',
    desc: '更夸张拖长“嗨”',
    ssml: `<speak><prosody rate="x-slow" pitch="-1st">嗨</prosody><break time="150ms"/>洛塔少儿启蒙APP</speak>`,
    useSsml: true,
  },
  {
    name: 'E-plain-current',
    desc: '纯文本（当前默认连读效果，对照）',
    ssml: TARGET_TEXT,
    useSsml: false,
  },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('Peiqi 品牌 VO 生成（SSML 拖长“嗨”）\n');

  for (const v of variants) {
    const fileName = `hirota-qimeng-${v.name.toLowerCase()}-peiqi.mp3`;
    const outPath = path.join(OUT_DIR, fileName);

    const textToSend = v.useSsml ? v.ssml : v.ssml;
    const options = v.useSsml ? { text_type: 'ssml' } : {};

    console.log(`=== ${v.name} === ${v.desc}`);
    console.log('SSML:', v.useSsml);
    console.log('文本:', textToSend);

    const result = await synthesizeVoice(
      { speaker: SPEAKER, name: 'Holly / 佩奇猪 2.0' },
      textToSend,
      outPath,
      options
    );

    if (result.status === 'generated' && fs.existsSync(outPath)) {
      const size = fs.statSync(outPath).size;
      console.log(`✓ 生成成功 → ${fileName}  (${size} bytes)\n`);
    } else {
      console.log(`✗ 失败: ${result.error_sanitized || result.status}\n`);
    }
  }

  console.log('完成。');
  console.log('请在 assets/brand/audio/ 下听这些 hirota-qimeng-*-peiqi.mp3');
  console.log('挑一个最好的告诉我，我会把它复制为正式的 hirota-qimeng-app-peiqi.mp3 并更新引用。');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
