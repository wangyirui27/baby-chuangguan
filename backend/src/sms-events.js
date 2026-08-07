// 短信发送事件环（运维台用）。不存验证码明文。
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let DATA_DIR = path.resolve(__dirname, '..', '..', 'data');
const FILE = () => path.join(DATA_DIR, 'sms-events.json');
const MAX = 500;

/** @type {object[]} */
let events = [];
let _saveTimer = null;

function setDataDir(dir) {
  DATA_DIR = path.resolve(dir);
}

function load() {
  events = [];
  try {
    if (!fs.existsSync(FILE())) return;
    const raw = JSON.parse(fs.readFileSync(FILE(), 'utf8'));
    if (Array.isArray(raw)) {
      events = raw.filter((e) => e && typeof e === 'object').slice(-MAX);
    }
  } catch (err) {
    console.error('[SMS-EVENTS] load failed', err && err.message);
  }
}

function scheduleSave() {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    _saveTimer = null;
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const tmp = `${FILE()}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(events, null, 2));
      fs.renameSync(tmp, FILE());
    } catch (err) {
      console.error('[SMS-EVENTS] save failed', err && err.message);
    }
  }, 300);
}

function maskPhoneLocal(phone) {
  const s = String(phone || '');
  const digits = s.replace(/\D/g, '');
  if (digits.length < 7) return s || '—';
  const national = digits.startsWith('86') && digits.length > 11 ? digits.slice(2) : digits;
  if (national.length === 11) {
    return `+86${national.slice(0, 3)}****${national.slice(7)}`;
  }
  return `${s.slice(0, 4)}****${s.slice(-2)}`;
}

/**
 * @param {{ phone?: string, phoneMasked?: string, phoneHash?: string, ok: boolean, errorCode?: string|null, provider?: string, errorMessage?: string }} entry
 */
function record(entry) {
  let phoneMasked = String(entry.phoneMasked || '').slice(0, 32);
  if (!phoneMasked && entry.phone) {
    phoneMasked = maskPhoneLocal(entry.phone).slice(0, 32);
  }
  let phoneHash = entry.phoneHash ? String(entry.phoneHash).slice(0, 64) : null;
  if (!phoneHash && entry.phone) {
    phoneHash = crypto.createHash('sha256').update(String(entry.phone)).digest('hex');
  }
  const row = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    phoneMasked: phoneMasked || '—',
    phoneHash,
    ok: entry.ok === true,
    errorCode: entry.errorCode ? String(entry.errorCode).slice(0, 64) : null,
    provider: String(entry.provider || process.env.SMS_PROVIDER || 'development').slice(0, 32),
  };
  events.push(row);
  if (events.length > MAX) events = events.slice(-MAX);
  scheduleSave();
  return row;
}

function list(options = {}) {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(options.limit) || 50));
  const onlyFail = options.onlyFail === true || options.onlyFail === '1';
  let rows = events.slice().reverse();
  if (onlyFail) rows = rows.filter((e) => !e.ok);
  const total = rows.length;
  const start = (page - 1) * limit;
  const items = rows.slice(start, start + limit);
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit) || 1),
    items,
  };
}

function stats(windowMs = 24 * 60 * 60 * 1000) {
  const since = Date.now() - windowMs;
  let sent = 0;
  let failed = 0;
  for (const e of events) {
    const t = new Date(e.at).getTime();
    if (Number.isNaN(t) || t < since) continue;
    if (e.ok) sent += 1;
    else failed += 1;
  }
  return { windowMs, sent, failed, total: sent + failed };
}

function clearAll() {
  events = [];
  scheduleSave();
}

load();

module.exports = {
  setDataDir,
  load,
  record,
  list,
  stats,
  clearAll,
};
