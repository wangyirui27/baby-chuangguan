// 开发/测试虚拟登录 — 任意合法手机号 + 固定验证码即可登录
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
  return String(code) === getVirtualLoginCode();
}

/**
 * 校验码格式：正式 6 位；虚拟登录开启时额外允许虚拟码（默认 1234）
 * @param {string} code
 * @returns {boolean}
 */
function isAcceptableLoginCodeFormat(code) {
  if (typeof code !== 'string') return false;
  if (/^\d{6}$/.test(code)) return true;
  return isVirtualLoginCode(code);
}

module.exports = {
  DEFAULT_VIRTUAL_CODE,
  isVirtualLoginEnabled,
  getVirtualLoginCode,
  isVirtualLoginCode,
  isAcceptableLoginCodeFormat,
};
