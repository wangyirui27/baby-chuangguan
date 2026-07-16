/**
 * 极速单声线测试 — Hayley only
 * 1次API调用，0重试，不泄露凭据
 */
const dotenv = require('dotenv');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const https = require('node:https');

dotenv.config();

const APP_ID = process.env.DOUBAO_APP_ID;
const ACCESS_KEY = process.env.DOUBAO_TOKEN;

const API_URL = 'https://openspeech.bytedance.com/api/v3/tts/unidirectional';
const RESOURCE_ID = 'seed-tts-2.0';
const REQUEST_TIMEOUT_MS = 30000;

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'assets', 'audio', 'voice-samples-v2');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'voice-samples-manifest.json');

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

/** MP3 有效判定：允许 ID3v2 头 (0x49 0x44 0x33) 或直接 MPEG 同步字 (0xFFE0) */
function mp3HeaderValid(buf) {
  if (buf.length < 4) return false;
  // ID3v2 header: 'ID3' + version + flags (10 byte header)
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
    // ID3v2 tag present — check MPEG sync word after tag
    // ID3v2 header is 10 bytes: 'ID3' (3) + version (2) + flags (1) + size (4, syncsafe)
    // Simplification: just look for 0xFFE0 somewhere in first 1000 bytes
    for (let i = 0; i < Math.min(buf.length - 1, 1000); i++) {
      if (buf[i] === 0xFF && (buf[i + 1] & 0xE0) === 0xE0) return true;
    }
    return false;
  }
  // Direct MPEG sync word
  return buf[0] === 0xFF && (buf[1] & 0xE0) === 0xE0;
}

class JsonStreamParser {
  constructor() {
    this.buffer = '';
    this.depth = 0;
    this.inString = false;
    this.escaped = false;
    this.objects = [];
    this.error = null;
    this.objectStart = undefined;
  }

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
        if (this.escaped) { this.escaped = false; }
        else if (ch === '\\') { this.escaped = true; }
        else if (ch === '"') { this.inString = false; }
      } else {
        if (ch === '"') { this.inString = true; this.escaped = false; }
        else if (ch === '{') { if (this.depth === 0) this.objectStart = i - 1; this.depth++; }
        else if (ch === '}') {
          this.depth--;
          if (this.depth === 0 && this.objectStart !== undefined) {
            const jsonStr = this.buffer.slice(this.objectStart, i);
            try { this.objects.push(JSON.parse(jsonStr)); } catch (e) {
              this.error = 'JSON parse error: ' + e.message;
              this.objects = [];
              return [];
            }
            this.objectStart = undefined;
          }
        }
      }
    }
    if (this.objectStart !== undefined) {
      this.buffer = this.buffer.slice(this.objectStart);
      this.depth = 0; this.inString = false; this.escaped = false;
    } else {
      this.buffer = '';
    }
    const result = this.objects;
    this.objects = []; this.objectStart = undefined;
    return result;
  }
}

function sanitize(msg) {
  if (!msg) return null;
  return msg.replace(/[0-9]{8,}/g, '***');
}

function callV3Tts() {
  const text = "Hello! Welcome to English class. Let's learn the word flower.";
  const speaker = 'en_female_hayley_uranus_bigtts';
  const reqid = crypto.randomUUID();

  const body = JSON.stringify({
    user: { uid: 'voice_samples_v2_test' },
    req_params: {
      text,
      speaker,
      audio_params: { format: 'mp3', sample_rate: 24000, speech_rate: 0, loudness_rate: 0 },
    },
  });

  return new Promise((resolve, reject) => {
    const url = new URL(API_URL);
    const options = {
      hostname: url.hostname, port: 443, path: url.pathname,
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
      let parseError = null;

      res.on('data', (chunk) => {
        const objs = parser.feed(chunk.toString('utf8'));
        if (parser.error) { parseError = parser.error; return; }
        for (const obj of objs) {
          // V3 chunked format: {"header":{"code":0},"payload":{"data":"base64..."}}
          const h = obj.header || obj;
          const code = h.code;
          const message = h.message || '';
          const payload = obj.payload;

          if (code === 0 && payload && payload.data) {
            audioChunks.push(payload.data);
          } else if (code === 0 && payload && payload.data !== undefined) {
            // skip empty data frame
          } else if (code === 20000000) {
            finalCode = 20000000;
            finalMessage = message || 'Normal end';
          } else if (code !== 0 && code !== undefined && code !== 20000000) {
            finalCode = code;
            finalMessage = message || 'Unknown error';
          } else if (obj.code === 0 && obj.data) {
            // Fallback flat format
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
        if (parseError) { reject(new Error(parseError)); return; }
        resolve({
          code: finalCode,
          message: finalMessage,
          audioBase64: audioChunks.join(''),
          hasAudio: audioChunks.length > 0,
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('=== 极速单声线测试: Hayley ===');

  // Check creds
  if (!APP_ID || !ACCESS_KEY || APP_ID === 'your_app_id_here') {
    console.error('CREDS_MISSING');
    process.exit(1);
  }

  const outputPath = path.join(OUTPUT_DIR, 'en_female_hayley_uranus_bigtts.mp3');
  console.log('REQ:1 speaker=en_female_hayley_uranus_bigtts');
  console.log('TEXT: Hello! Welcome to English class. Let\'s learn the word flower.');

  // 1 call, no retry
  let result;
  try {
    result = await callV3Tts();
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('401') || msg.includes('403') || msg.includes('authenticate') || msg.includes('grant')) {
      console.log('RESULT:FAIL auth_network_err code=-1 msg=' + sanitize(msg));
      console.log('DIAG:网络层鉴权失败 — 可能是 ID-Key mismatch');
    } else if (msg.includes('timeout')) {
      console.log('RESULT:FAIL timeout msg=' + sanitize(msg));
    } else {
      console.log('RESULT:FAIL network_err code=-1 msg=' + sanitize(msg));
    }
    process.exit(1);
  }

  if (!result) {
    console.log('RESULT:FAIL no_response');
    process.exit(1);
  }

  if (result.code === 20000000 && result.hasAudio) {
    const audioBuf = Buffer.from(result.audioBase64, 'base64');
    if (!mp3HeaderValid(audioBuf)) {
      console.log('RESULT:FAIL invalid_mp3 size=' + audioBuf.length + ' hex4=' + audioBuf.slice(0, 4).toString('hex'));
      // Try saving anyway for inspection
      fs.writeFileSync(outputPath.replace('.mp3', '.raw'), audioBuf);
      process.exit(1);
    }
    fs.writeFileSync(outputPath, audioBuf);
    const hash = sha256(audioBuf);
    const stat = fs.statSync(outputPath);

    console.log('RESULT:SUCCESS');
    console.log('SIZE:' + stat.size);
    console.log('SHA256:' + hash);
    console.log('MP3_VALID:true');

    // Update manifest for Hayley only
    const manifestRaw = fs.readFileSync(MANIFEST_PATH, 'utf8');
    const manifest = JSON.parse(manifestRaw);

    let found = false;
    for (let i = 0; i < manifest.entries.length; i++) {
      if (manifest.entries[i].name === 'Hayley') {
        manifest.entries[i].status = 'generated';
        manifest.entries[i].size_bytes = stat.size;
        manifest.entries[i].sha256 = hash;
        manifest.entries[i].error = null;
        manifest.entries[i].api_code = 0;
        found = true;
        break;
      }
    }

    if (!found) {
      console.log('MANIFEST:Hayley_not_found');
      process.exit(1);
    }

    manifest.generated_at = new Date().toISOString();
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
    console.log('MANIFEST:updated');

    // Final smoke check
    const relativeUrl = 'assets/audio/voice-samples-v2/en_female_hayley_uranus_bigtts.mp3';
    const absPath = path.resolve(PROJECT_ROOT, relativeUrl);
    const actual = path.resolve(outputPath);
    console.log('SMOKE:exists=' + (fs.existsSync(outputPath) ? '1' : '0'));
    console.log('SMOKE:size_gt0=' + (stat.size > 0 ? '1' : '0'));
    console.log('SMOKE:mp3_header=' + (mp3HeaderValid(fs.readFileSync(outputPath)) ? '1' : '0'));
    console.log('SMOKE:relative_path_match=' + (absPath === actual ? '1' : '0'));
    console.log('SMOKE:preview_path=' + relativeUrl);
    console.log('');
    console.log('=== 完成 ===');
    process.exit(0);
  } else {
    // Error — sanitize and distinguish
    const code = result.code;
    const msg = sanitize(result.message || '(no message)');
    console.log('RESULT:FAIL code=' + code + ' msg=' + msg);

    if (code === 45000010 || code === 45000011) {
      console.log('DIAG:ID-Key mismatch — App ID 与 Access Key 不属于同一应用');
      console.log('    或 seed-tts-2.0 资源未对该 App ID 授权');
    } else if (code === 2000) {
      console.log('DIAG:Speaker 参数错误或该音色无权限');
    } else {
      console.log('DIAG:API error code=' + code);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.log('RESULT:FAIL fatal=' + sanitize(err.message));
  process.exit(1);
});
