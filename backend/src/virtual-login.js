// 开发/测试虚拟登录 — 本地任意合法手机号 + 任意验证码即可登录
// 生产/预发默认关闭；切勿在生产开启。

'use strict';

const DEFAULT_VIRTUAL_CODE = '1234';

/**
 * @returns {boolean}
 */
function isVirtualLoginEnabled() {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production' || env === 'staging') {
    return process.env.ALLOW_VIRTUAL_LOGIN === '1';
  }
  // development / test：默认开，VIRTUAL_LOGIN=0 可关
  return process.env.VIRTUAL_LOGIN !== '0';
}

/**
 * 是否只认固定虚拟码（默认否：本地任意 4–6 位即可）
 * VIRTUAL_LOGIN_STRICT=1 时仅接受 VIRTUAL_LOGIN_CODE（默认 1234）
 * @returns {boolean}
 */
function isVirtualLoginStrict() {
  return process.env.VIRTUAL_LOGIN_STRICT === '1';
}

/**
 * @returns {string}
 */
function getVirtualLoginCode() {
  return process.env.VIRTUAL_LOGIN_CODE || DEFAULT_VIRTUAL_CODE;
}

/**
 * @param {string|number} code
 * @returns {boolean}
 */
function isVirtualLoginCode(code) {
  if (!isVirtualLoginEnabled()) return false;
  const s = String(code == null ? '' : code).replace(/\D/g, '');
  if (!s) return false;
  if (isVirtualLoginStrict()) {
    return s === String(getVirtualLoginCode());
  }
  // 本地默认：任意 4–6 位数字验证码
  return /^\d{4,6}$/.test(s);
}

/**
 * 校验码格式：正式 6 位；虚拟登录开启时额外允许 4–6 位（本地任意码）
 * @param {string} code
 * @returns {boolean}
 */
function isAcceptableLoginCodeFormat(code) {
  if (typeof code !== 'string' && typeof code !== 'number') return false;
  const s = String(code).replace(/\D/g, '');
  if (/^\d{6}$/.test(s)) return true;
  return isVirtualLoginCode(s);
}

module.exports = {
  DEFAULT_VIRTUAL_CODE,
  isVirtualLoginEnabled,
  isVirtualLoginStrict,
  getVirtualLoginCode,
  isVirtualLoginCode,
  isAcceptableLoginCodeFormat,
};
