'use strict';

const DEFAULT_VIRTUAL_CODE = '1234';

function isVirtualLoginEnabled() {
  if (process.env.NODE_ENV === 'production') {
    return process.env.ALLOW_VIRTUAL_LOGIN === '1';
  }
  return process.env.VIRTUAL_LOGIN !== '0';
}

function getVirtualLoginCode() {
  return process.env.VIRTUAL_LOGIN_CODE || DEFAULT_VIRTUAL_CODE;
}

function isVirtualLoginCode(code) {
  if (!isVirtualLoginEnabled()) return false;
  return String(code) === getVirtualLoginCode();
}

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
