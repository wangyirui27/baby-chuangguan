// 宝宝闯关 · 豆包语音合成模型 2.0 美式英语声线试听库生成脚本
// 使用方式：cd backend && npm run generate-voice-samples-v2
// 幂等：已存在且有效的 MP3 跳过；失败支持断点续跑
// 安全：所有凭据仅从 .env 读取，绝不输出、写入 manifest 或回显
//
// API: V3 HTTP Chunked 单向流 (POST /api/v3/tts/unidirectional)
// 鉴权: X-Api-App-Id + X-Api-Access-Key + X-Api-Resource-Id: seed-tts-2.0
// 注意: 仅支持豆包语音合成模型 2.0 音色 (en_*_uranus_bigtts)

const dotenv = require('dotenv');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const https = require('node:https');

dotenv.config();

// ═══════════════════════════════════════════════════════════
//  68 个官方美式英语音色（豆包语音合成模型 2.0）
//  来源: https://www.volcengine.com/docs/6561/1257544
//  筛选条件: _uranus_bigtts, 非 ICL_, 美式英语
//  27 女声 + 41 男声
// ═══════════════════════════════════════════════════════════

const SAMPLE_TEXT =
  'Hello friends! Welcome to our English class. Look at the red apple and the blue sky. Can you count with me? One, two, three! What\'s your favorite animal?';

/**
 * @typedef {Object} VoiceInfo
 * @property {string} name - Display name
 * @property {string} speaker - voice_type / speaker ID
 * @property {string} gender - 女声 / 男声
 * @property {string} scene - Use scene description
 * @property {string} inferenceMode - Recommended inference mode
 * @property {boolean} unidirectionalOnly - Only supports unidirectional
 */

/** @type {VoiceInfo[]} */
const VOICES = [
  // ── 女声 (27) ──────────────────────────────────────────
  { name: 'Allison',    speaker: 'en_female_allison_uranus_bigtts',                  gender: '女声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Charlotte',  speaker: 'en_female_authoritative-british_uranus_bigtts',    gender: '女声', scene: '教学场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Margaret',   speaker: 'en_female_authoritative-informative_uranus_bigtts',gender: '女声', scene: '有声阅读', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Zoe',        speaker: 'en_female_brittney_pimintel_uranus_bigtts',        gender: '女声', scene: '有声阅读', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Brittney',   speaker: 'en_female_brittney_uranus_bigtts',                 gender: '女声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Dacey',      speaker: 'en_female_dacey_uranus_bigtts',                    gender: '女声', scene: '多语种', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Holly',      speaker: 'en_female_female_tutor_ms-jenny_uranus_bigtts',    gender: '女声', scene: '教学场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Hayley',     speaker: 'en_female_hayley_uranus_bigtts',                   gender: '女声', scene: '教学场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Jane',       speaker: 'en_female_jane_uranus_bigtts',                     gender: '女声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Jenny',      speaker: 'en_female_jenny_uranus_bigtts',                    gender: '女声', scene: '客服场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Joanne',     speaker: 'en_female_joanne_uranus_bigtts',                   gender: '女声', scene: '有声阅读', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Lynn',       speaker: 'en_female_lana_del_rey_kelley_d_p1_uranus_bigtts', gender: '女声', scene: '角色扮演', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Ivy',        speaker: 'en_female_lana_del_rey_parky_s_p1_uranus_bigtts',  gender: '女声', scene: '客服场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Mel',        speaker: 'en_female_mel_uranus_bigtts',                      gender: '女声', scene: '教学场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Sunny',      speaker: 'en_female_myra_cmb_uranus_bigtts',                 gender: '女声', scene: '教学场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Myra',       speaker: 'en_female_myra_uranus_bigtts',                     gender: '女声', scene: '教学场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Blair',      speaker: 'en_female_nadia_uranus_bigtts',                    gender: '女声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Natasha',    speaker: 'en_female_natasha_uranus_bigtts',                  gender: '女声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Elaine',     speaker: 'en_female_pleasant-female_uranus_bigtts',          gender: '女声', scene: '有声阅读', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Rachel',     speaker: 'en_female_rachel_p1_uranus_bigtts',                gender: '女声', scene: '趣味口音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Scarlet',    speaker: 'en_female_scarlet_p1_uranus_bigtts',               gender: '女声', scene: '客服场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Sharron',    speaker: 'en_female_sharron_uranus_bigtts',                  gender: '女声', scene: '趣味口音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Skye',       speaker: 'en_female_skye_uranus_bigtts',                     gender: '女声', scene: '通用场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Stokie',     speaker: 'en_female_stokie_uranus_bigtts',                   gender: '女声', scene: '多语种', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Megan',      speaker: 'en_female_wenrouzhishijieshuonv_uranus_bigtts',    gender: '女声', scene: '客服场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Kayla',      speaker: 'en_female_xinwenjieshuonv_uranus_bigtts',          gender: '女声', scene: '角色扮演', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Zendaya',    speaker: 'en_female_zendaya_p1_uranus_bigtts',               gender: '女声', scene: '教学场景', inferenceMode: '', unidirectionalOnly: false },

  // ── 男声 (41) ──────────────────────────────────────────
  { name: 'Rowan',      speaker: 'en_male_adam-imitation_uranus_bigtts',             gender: '男声', scene: '有声阅读', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Alberto',    speaker: 'en_male_alberto_uranus_bigtts',                    gender: '男声', scene: '教学场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Alex',       speaker: 'en_male_alex_uranus_bigtts',                       gender: '男声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Jones',      speaker: 'en_male_bill-jones_uranus_bigtts',                 gender: '男声', scene: '趣味口音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Bill',       speaker: 'en_male_bill_jones_corey_uranus_bigtts',           gender: '男声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Brad Pitt',  speaker: 'en_male_brad_pitt_p1_uranus_bigtts',               gender: '男声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Adrian',     speaker: 'en_male_bruce_uranus_bigtts',                      gender: '男声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Leo',        speaker: 'en_male_chandler_p1_uranus_bigtts',                gender: '男声', scene: '趣味口音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Bob',        speaker: 'en_male_cowboy-bob_uranus_bigtts',                 gender: '男声', scene: '教学场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'John',       speaker: 'en_male_cowboy_john_b_uranus_bigtts',              gender: '男声', scene: '角色扮演', inferenceMode: '', unidirectionalOnly: false },
  { name: 'David',      speaker: 'en_male_david_uranus_bigtts',                      gender: '男声', scene: '有声阅读', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Orion',      speaker: 'en_male_deep-voice_uranus_bigtts',                 gender: '男声', scene: '角色扮演', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Julian',     speaker: 'en_male_diyuwenrounan_uranus_bigtts',              gender: '男声', scene: '有声阅读', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Harrison',   speaker: 'en_male_evil-guy-oxley_uranus_bigtts',             gender: '男声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Jasper',     speaker: 'en_male_excited-male-voice_uranus_bigtts',         gender: '男声', scene: '趣味口音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Alfred',     speaker: 'en_male_father-christmas_uranus_bigtts',           gender: '男声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Felix',      speaker: 'en_male_fernando-martinez_uranus_bigtts',          gender: '男声', scene: '教学场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Godfather',  speaker: 'en_male_godfather_uranus_bigtts',                  gender: '男声', scene: '角色扮演', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Gollum',     speaker: 'en_male_gollum_uranus_bigtts',                     gender: '男声', scene: '角色扮演', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Beau',       speaker: 'en_male_hades_uranus_bigtts',                      gender: '男声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Jamie',      speaker: 'en_male_jamie_uranus_bigtts',                      gender: '男声', scene: '教学场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Blaze',      speaker: 'en_male_jidongchuanjiaoshi_uranus_bigtts',         gender: '男声', scene: '角色扮演', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Jimmy',      speaker: 'en_male_jimmy_uranus_bigtts',                      gender: '男声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Joker',      speaker: 'en_male_joker_uranus_bigtts',                      gender: '男声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Josiah',     speaker: 'en_male_josh_coery_uranus_bigtts',                 gender: '男声', scene: '教学场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Josh',       speaker: 'en_male_josh_uranus_bigtts',                       gender: '男声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Kevin',      speaker: 'en_male_kevin_uranus_bigtts',                      gender: '男声', scene: '教学场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Knightley',  speaker: 'en_male_knightley_uranus_bigtts',                  gender: '男声', scene: '有声阅读', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Marcus',     speaker: 'en_male_marcus_uranus_bigtts',                     gender: '男声', scene: '有声阅读', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Chip',       speaker: 'en_male_michael-mouse_uranus_bigtts',              gender: '男声', scene: '角色扮演', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Michael K.', speaker: 'en_male_michael_kevin_uranus_bigtts',              gender: '男声', scene: '教学场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Hank',       speaker: 'en_male_michael_uranus_bigtts',                    gender: '男声', scene: '教学场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Rory',       speaker: 'en_male_motivational-coach_uranus_bigtts',         gender: '男声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Ronald',     speaker: 'en_male_ronald_uranus_bigtts',                     gender: '男声', scene: '有声阅读', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Russell',    speaker: 'en_male_russell_uranus_bigtts',                    gender: '男声', scene: '教学场景', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Simba',      speaker: 'en_male_simba_p1_uranus_bigtts',                   gender: '男声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Tim',        speaker: 'en_male_tim_uranus_bigtts',                        gender: '男声', scene: '多语种', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Tom',        speaker: 'en_male_tom_hiddleston_p1_uranus_bigtts',          gender: '男声', scene: '有声阅读', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Clark',      speaker: 'en_male_valentino_corey_uranus_bigtts',            gender: '男声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Valentino',  speaker: 'en_male_valentino_uranus_bigtts',                  gender: '男声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
  { name: 'Dylan',      speaker: 'en_male_yangguangjieshuonan_uranus_bigtts',        gender: '男声', scene: '视频配音', inferenceMode: '', unidirectionalOnly: false },
];

// ═══════════════════════════════════════════════════════════
//  配置常量
// ═══════════════════════════════════════════════════════════

const APP_ID = process.env.DOUBAO_APP_ID;
const ACCESS_KEY = process.env.DOUBAO_TOKEN;

const API_URL = 'https://openspeech.bytedance.com/api/v3/tts/unidirectional';
const RESOURCE_ID = 'seed-tts-2.0';
const MAX_RETRIES = 5;
const RETRY_DELAYS_MS = [2000, 4000, 8000, 16000, 32000];
const REQUEST_TIMEOUT_MS = 120000;

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'assets', 'audio', 'voice-samples-v2');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'voice-samples-manifest.json');

// ═══════════════════════════════════════════════════════════
//  增量 JSON 流式解析器
// ═══════════════════════════════════════════════════════════

/**
 * Incremental JSON streaming parser for V3 chunked responses.
 * Handles: objects split across chunks, multiple objects in one chunk,
 * escaped braces within strings, etc.
 * Uses a state-machine approach with brace-counting.
 */
class JsonStreamParser {
  constructor() {
    this.buffer = '';
    this.depth = 0;
    this.inString = false;
    this.escaped = false;
    this.objects = [];
    this.error = null;
  }

  /**
   * Feed a chunk of data to the parser.
   * @param {string} chunk
   * @returns {Array<object>} completed JSON objects
   */
  feed(chunk) {
    this.buffer += chunk;
    return this._parse();
  }

  _parse() {
    let i = 0;
    while (i < this.buffer.length) {
      const ch = this.buffer[i];
      i++;

      if (this.inString) {
        if (this.escaped) {
          this.escaped = false;
        } else if (ch === '\\') {
          this.escaped = true;
        } else if (ch === '"') {
          this.inString = false;
        }
      } else {
        if (ch === '"') {
          this.inString = true;
          this.escaped = false;
        } else if (ch === '{') {
          if (this.depth === 0) {
            this.objectStart = i - 1; // position of '{'
          }
          this.depth++;
        } else if (ch === '}') {
          this.depth--;
          if (this.depth === 0 && this.objectStart !== undefined) {
            const jsonStr = this.buffer.slice(this.objectStart, i);
            try {
              this.objects.push(JSON.parse(jsonStr));
            } catch (e) {
              this.error = `JSON parse error at offset ${i}: ${e.message}`;
              this.objects = [];
              return [];
            }
            this.objectStart = undefined;
          }
        }
      }
    }

    // Keep incomplete content in buffer and reset state for next parse
    if (this.objectStart !== undefined) {
      this.buffer = this.buffer.slice(this.objectStart);
      // Reset state — next _parse() will re-encounter '{' at position 0 with depth=0
      this.depth = 0;
      this.inString = false;
      this.escaped = false;
    } else {
      this.buffer = '';
    }

    const result = this.objects;
    this.objects = [];
    this.objectStart = undefined;
    return result;
  }
}

const RETRYABLE_CODES = [3003, 3005, 3030, 3031, 3032, 3040, 55000000];
// Global auth/resource errors that block all attempts
const GLOBAL_BLOCKER_CODES = [45000010, 45000011];

// ═══════════════════════════════════════════════════════════
//  工具函数
// ═══════════════════════════════════════════════════════════

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function mp3HeaderValid(buf) {
  if (buf.length < 4) return false;
  // Skip ID3v2 header (starts with "ID3" at offset 0)
  // ID3v2 tag header is 10 bytes; the size is a 4-byte synchsafe integer at offset 6
  let offset = 0;
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
    if (buf.length < 10) return false;
    const id3Size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) |
                    ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
    offset = 10 + id3Size;
    // Sanity: if the computed offset is huge or past buffer, fall back to brute-force scan
    if (offset >= buf.length || offset > 1024 * 1024) {
      offset = 0; // fall back to scan below
    }
  }
  // MP3 sync word: 0xFFE0 mask at current offset
  if (offset + 4 <= buf.length) {
    if (buf[offset] === 0xFF && (buf[offset + 1] & 0xE0) === 0xE0) return true;
  }
  // Brute-force scan: some files have other leading metadata (e.g. LAME tags, multiple ID3 frames)
  // Scan first 8 KB for any MPEG sync word
  const scanLimit = Math.min(buf.length, 8192);
  for (let i = 0; i < scanLimit - 1; i++) {
    if (buf[i] === 0xFF && (buf[i + 1] & 0xE0) === 0xE0) return true;
  }
  return false;
}

function fileValid(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.isFile() && stat.size > 0 && mp3HeaderValid(fs.readFileSync(filePath));
  } catch { return false; }
}

function sanitizeError(msg) {
  if (!msg) return null;
  // Never leak App ID or Access Key
  return msg
    .replace(/[0-9]{8,}/g, '***')
    .replace(/Access[-_]?Key['": ]*[A-Za-z0-9_\-]+/gi, 'Access-Key=***')
    .replace(/App[-_]?Id['": ]*\d+/gi, 'App-Id=***');
}

function redundantLogid(lines) {
  // Extract X-Tt-Logid if present in response headers (not saved to manifest)
  for (const line of lines) {
    const m = line.match(/X-Tt-Logid:\s*(\S+)/i);
    if (m) return m[1];
  }
  return null;
}

// ═══════════════════════════════════════════════════════════
//  V3 API 调用 — HTTP Chunked Unidirectional
// ═══════════════════════════════════════════════════════════

function callV3Tts(speaker, text) {
  const reqid = crypto.randomUUID();

  const body = JSON.stringify({
    user: {
      uid: 'voice_samples_v2',
    },
    req_params: {
      text,
      speaker,
      audio_params: {
        format: 'mp3',
        sample_rate: 24000,
        speech_rate: 0,
        loudness_rate: 0,
      },
    },
  });

  return new Promise((resolve, reject) => {
    const url = new URL(API_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Api-App-Id': APP_ID,
        'X-Api-Access-Key': ACCESS_KEY,
        'X-Api-Resource-Id': RESOURCE_ID,
        'X-Api-Request-Id': reqid,
      },
      timeout: REQUEST_TIMEOUT_MS,
    };

    const req = https.request(options, (res) => {
      const parser = new JsonStreamParser();
      const audioChunks = [];
      let finalCode = null;
      let finalMessage = '';
      let logid = '';
      let parseError = null;

      // Extract logid from response headers
      if (res.headers['x-tt-logid']) {
        logid = Array.isArray(res.headers['x-tt-logid'])
          ? res.headers['x-tt-logid'][0]
          : res.headers['x-tt-logid'];
      }

      res.on('data', (chunk) => {
        const jsonObjects = parser.feed(chunk.toString('utf8'));
        if (parser.error) {
          parseError = parser.error;
          return;
        }
        for (const obj of jsonObjects) {
          // V3 HTTP Chunked response wraps in "header" object
          //   {"header":{"code":0},"payload":{"data":"base64..."}}
          //   {"header":{"code":20000000,"message":"done"}}
          //   {"header":{"code":45000010,"message":"error"}}
          const h = obj.header || obj;
          const code = h.code;
          const message = h.message || '';
          const payload = obj.payload;

          if (code === 0 && payload && payload.data) {
            audioChunks.push(payload.data);
          } else if (code === 0 && payload && payload.data !== undefined) {
            // data is null/empty — skip (e.g. sentence-only frame)
          } else if (code === 20000000) {
            finalCode = 20000000;
            finalMessage = message || 'Normal end';
          } else if (code !== 0 && code !== undefined && code !== 20000000) {
            // Error frame
            finalCode = code;
            finalMessage = message || 'Unknown error';
          } else if (obj.code === 0 && obj.data) {
            // Fallback for flat format (SSE-style)
            audioChunks.push(obj.data);
          } else if (obj.code === 20000000) {
            finalCode = 20000000;
            finalMessage = obj.message || 'Normal end';
          } else if (obj.code !== undefined && obj.code !== 0 && obj.code !== 20000000) {
            finalCode = obj.code;
            finalMessage = obj.message || 'Unknown error';
          }
        }
      });

      res.on('end', () => {
        if (parseError) {
          reject(new Error(parseError));
          return;
        }
        resolve({
          code: finalCode,
          message: finalMessage,
          logid,
          audioBase64: audioChunks.join(''),
          hasAudio: audioChunks.length > 0,
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.write(body);
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════
//  合成单个音色（带重试）
// ═══════════════════════════════════════════════════════════

async function synthesizeVoice(voiceInfo, text, outputPath) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await callV3Tts(voiceInfo.speaker, text);

      if (result.code === 20000000 && result.hasAudio) {
        const audioBuf = Buffer.from(result.audioBase64, 'base64');
        fs.writeFileSync(outputPath, audioBuf);
        return {
          status: 'generated',
          size_bytes: audioBuf.length,
          sha256: sha256(audioBuf),
          error: null,
          error_sanitized: null,
          api_code: 0,
          request_logid: null, // Not saved — for debugging only
        };
      }

      // Handle specific error codes
      if (result.code !== 0 && result.code !== 20000000) {
        // 45000010/45000011 — global auth block, stop everything
        if (GLOBAL_BLOCKER_CODES.includes(result.code)) {
          return {
            status: 'not_attempted_global_blocker',
            size_bytes: 0,
            sha256: '',
            error: `Global auth error: code=${result.code} ${result.message || ''}`,
            error_sanitized: sanitizeError(`Global auth error: code=${result.code} ${result.message || ''}`),
            api_code: result.code,
            request_logid: null,
          };
        }

        // 3003 (concurrency) / 3005 (busy) / 3030,3031,3032 — retryable
        const isRetryable = RETRYABLE_CODES.includes(result.code);

        if (!isRetryable || attempt >= MAX_RETRIES) {
          const msg = `code=${result.code} message=${result.message || 'no message'}`;
          return {
            status: 'failed',
            size_bytes: 0,
            sha256: '',
            error: `API ${msg}`,
            error_sanitized: sanitizeError(`API code=${result.code} message=${result.message || ''}`),
            api_code: result.code,
            request_logid: null,
          };
        }

        console.warn(`  [RETRY ${attempt + 1}/${MAX_RETRIES}] ${result.message || `code=${result.code}`}`);
        await sleep(RETRY_DELAYS_MS[attempt] || 32000);
      }
    } catch (err) {
      if (attempt >= MAX_RETRIES) {
        const isAuth = err.message && (
          err.message.includes('401') || err.message.includes('403') ||
          err.message.includes('authenticate') || err.message.includes('grant')
        );
        const status = isAuth ? 'not_attempted_global_blocker' : 'failed';
        return {
          status,
          size_bytes: 0,
          sha256: '',
          error: `Network error: ${err.message}`,
          error_sanitized: sanitizeError(`Network error: ${err.message}`),
          api_code: -1,
          request_logid: null,
        };
      }
      console.warn(`  [RETRY ${attempt + 1}/${MAX_RETRIES}] network: ${err.message}`);
      await sleep(RETRY_DELAYS_MS[attempt] || 32000);
    }
  }

  return {
    status: 'failed', size_bytes: 0, sha256: '',
    error: 'Exhausted all retries', error_sanitized: 'Exhausted all retries',
    api_code: -1, request_logid: null,
  };
}

// ═══════════════════════════════════════════════════════════
//  主流程
// ═══════════════════════════════════════════════════════════

async function main() {
  // ── 横幅 ─────────────────────────────────────────────
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  豆包语音合成模型 2.0 · 美式英语声线试听库');
  console.log('  批量生成 (V3 HTTP Chunked Unidirectional)');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log(`  目标音色: ${VOICES.length} 个 (女声27 + 男声41)`);
  console.log(`  输出目录: ${OUTPUT_DIR}`);
  console.log('  资源 ID: seed-tts-2.0');
  console.log('');

  // ── 凭据检查 ─────────────────────────────────────────
  const hasCreds = !!(APP_ID && ACCESS_KEY &&
    APP_ID !== 'your_app_id_here' && ACCESS_KEY !== 'your_access_token_here');

  if (!hasCreds) {
    console.warn('');
    console.warn('  ⚠️  凭据未配置 — 将生成占位 manifest');
    console.warn('  配置：cd backend && cp .env.example .env 后编辑');
    console.warn('');
  }

  // ── 确保输出目录 ─────────────────────────────────────
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // 清理临时文件
  try {
    const existing = fs.readdirSync(OUTPUT_DIR);
    existing.forEach((name) => {
      if (name.startsWith('voice-samples-manifest.json.tmp.')) {
        try { fs.unlinkSync(path.join(OUTPUT_DIR, name)); } catch (_) {}
      }
    });
  } catch (_) {}

  // ── 从已有 manifest 加载幂等状态 ──────────────────────
  let existingManifest = {};
  try {
    existingManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch (_) {}

  // ── 探针策略 ─────────────────────────────────────────
  let globalBlocked = false;
  if (hasCreds) {
    // 选第一个男声（Tim）做探针，因为它是最基本的通用音色
    const probeVoice = VOICES.find(v => v.speaker === 'en_male_tim_uranus_bigtts');
    if (probeVoice) {
      console.log('  🔍 探针测试:', probeVoice.name);
      const probePath = path.join(OUTPUT_DIR, '_probe_test.mp3');
      const probeResult = await synthesizeVoice(probeVoice, SAMPLE_TEXT, probePath);

      if (probeResult.status === 'generated') {
        console.log(`  ✅ 探针成功 (${probeResult.size_bytes} bytes) — 继续批量`);
        try { fs.unlinkSync(probePath); } catch (_) {}
      } else if (probeResult.status === 'not_attempted_global_blocker') {
        console.log('  ❌ 探针失败：全局鉴权错误 — 停止批量');
        globalBlocked = true;
        try { fs.unlinkSync(probePath); } catch (_) {}
      } else if (probeResult.error && (
        probeResult.error.includes('resource_id') ||
        probeResult.error.includes('grant') ||
        (probeResult.api_code && probeResult.api_code >= 400 && probeResult.api_code < 500)
      )) {
        console.log('  ❌ 探针失败：全局权限错误 — 停止批量');
        globalBlocked = true;
      } else {
        // Speaker-specific failure — probed speaker might just not be available, continue
        console.log(`  ⚠️  探针失败 (${probeResult.error_sanitized}) — 继续批量，单 speaker 失败不影响`);
        try { fs.unlinkSync(probePath); } catch (_) {}
      }
    }
  }

  // ── 批量生成 ─────────────────────────────────────────
  const entries = [];
  const summary = {
    total: VOICES.length,
    generated: 0,
    skipped: 0,
    available: 0,
    failed: 0,
    not_attempted: 0,
    female: { total: 0, generated: 0, skipped: 0, available: 0, failed: 0, not_attempted: 0 },
    male: { total: 0, generated: 0, skipped: 0, available: 0, failed: 0, not_attempted: 0 },
  };

  for (const voice of VOICES) {
    const safeFileName = voice.speaker.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const filePath = path.join(OUTPUT_DIR, `${safeFileName}.mp3`);
    const relativeUrl = `assets/audio/voice-samples-v2/${safeFileName}.mp3`;

    const genderKey = voice.gender === '女声' ? 'female' : 'male';
    summary[genderKey].total += 1;

    const displaySpeaker = `${voice.name} (${voice.speaker})`;
    console.log(`[${voice.gender}] ${displaySpeaker}`);
    console.log(`  → ${relativeUrl}`);

    // 幂等检查
    if (fileValid(filePath)) {
      const stat = fs.statSync(filePath);
      const buf = fs.readFileSync(filePath);
      console.log(`  ✅ 已存在 (${stat.size} bytes) — 跳过`);
      entries.push(buildEntry(voice, 'generated', relativeUrl, stat.size, sha256(buf), null, null, 0, null));
      summary.skipped += 1;
      summary[genderKey].skipped += 1;
      continue;
    }

    // 全局阻断
    if (globalBlocked) {
      console.log(`  ⏸ 全局阻断 — 未尝试`);
      entries.push(buildEntry(voice, 'not_attempted_global_blocker', relativeUrl, 0, '', null, 'Global auth/resource blocked — not attempted', -1, null));
      summary.not_attempted += 1;
      summary[genderKey].not_attempted += 1;
      continue;
    }

    if (!hasCreds) {
      console.log(`  ⏸ 占位（凭据未配置）`);
      entries.push(buildEntry(voice, 'pending', relativeUrl, 0, '', null, 'Credentials not configured', null, null));
      summary.not_attempted += 1;
      summary[genderKey].not_attempted += 1;
      continue;
    }

    // 调用 API
    const result = await synthesizeVoice(voice, SAMPLE_TEXT, filePath);

    if (result.status === 'generated') {
      console.log(`  ✅ 生成成功 (${result.size_bytes} bytes)`);
      summary.generated += 1;
      summary[genderKey].generated += 1;
    } else if (result.status === 'not_attempted_global_blocker') {
      console.log(`  ⏸ 全局阻断`);
      summary.not_attempted += 1;
      summary[genderKey].not_attempted += 1;
    } else {
      console.log(`  ❌ 失败: ${result.error_sanitized}`);
      summary.failed += 1;
      summary[genderKey].failed += 1;
      try { fs.unlinkSync(filePath); } catch (_) {}
    }

    entries.push(buildEntry(voice, result.status, relativeUrl,
      result.size_bytes, result.sha256, result.api_code,
      result.error_sanitized, result.api_code, null));
  }

  summary.available = summary.generated + summary.skipped;
  summary.female.available = summary.female.generated + summary.female.skipped;
  summary.male.available = summary.male.generated + summary.male.skipped;

  // ── 写 manifest（原子写入） ────────────────────────────
  const manifest = {
    version: '2.0',
    model: '豆包语音合成模型2.0',
    resource_id: 'seed-tts-2.0',
    generated_at: new Date().toISOString(),
    sample_text: SAMPLE_TEXT,
    audio_format: 'mp3',
    sample_rate: 24000,
    entries,
    summary,
  };

  const tmpPath = MANIFEST_PATH + '.tmp.' + crypto.randomUUID();
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(manifest, null, 2) + '\n');
    fs.renameSync(tmpPath, MANIFEST_PATH);
  } catch (err) {
    try { fs.unlinkSync(tmpPath); } catch (_) {}
    throw err;
  }

  // ── 报告 ──────────────────────────────────────────────
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  生成报告');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log(`  Manifest → ${MANIFEST_PATH}`);
  console.log(`  试听页    → voice-samples-v2.html（项目根目录）`);
  console.log('');
  console.log(`  总计        ${summary.total} 个音色`);
  console.log(`  新生成      ${summary.generated}`);
  console.log(`  跳过(已存在) ${summary.skipped}`);
  console.log(`  有效        ${summary.available}`);
  console.log(`  失败        ${summary.failed}`);
  console.log(`  未尝试      ${summary.not_attempted}`);
  console.log('');
  console.log('  ── 性别明细 ──');
  console.log(`  女声 ${summary.female.total} 个 → ${summary.female.available} 有效 / ${summary.female.failed} 失败 / ${summary.female.not_attempted} 未尝试`);
  console.log(`  男声 ${summary.male.total} 个 → ${summary.male.available} 有效 / ${summary.male.failed} 失败 / ${summary.male.not_attempted} 未尝试`);

  if (!hasCreds) {
    console.log('');
    console.log('  要生成真实 MP3，请配置 backend/.env 后重试');
  }
  if (globalBlocked) {
    console.log('');
    console.log('  ⚠️  全局阻断激活 — 请检查凭据和 resource_id 授权');
  }
}

// ── 构建 manifest entry ───────────────────────────────

function buildEntry(voice, status, url, sizeBytes, sha256sum, apiCode, errorMsg, code, logid) {
  return {
    name: voice.name,
    speaker: voice.speaker,
    gender: voice.gender,
    scene: voice.scene,
    inference_mode: voice.inferenceMode || 'unidirectional',
    unidirectional_only: voice.unidirectionalOnly || false,
    status,
    url,
    size_bytes: sizeBytes,
    sha256: sha256sum,
    error: errorMsg ? sanitizeError(errorMsg) : null,
    api_code: code,
    sample_text: SAMPLE_TEXT,
  };
}

// ── 导出（用于测试） ─────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { JsonStreamParser, sanitizeError, sha256, mp3HeaderValid, fileValid, synthesizeVoice, VOICES, SAMPLE_TEXT };
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[FATAL]', err);
    process.exit(1);
  });
}
