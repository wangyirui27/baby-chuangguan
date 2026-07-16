// 宝宝闯关 · SMS Provider 接口
// 依赖反转：生产模式需配置真实供应商，development 模式只打印到终端

'use strict';

const crypto = require('crypto');

/**
 * @abstract
 * 所有 SMS provider 的基类。生产缺配置时显式抛错。
 */
class SmsProvider {
  /**
   * 发送验证码
   * @param {string} phone - 规范化手机号（e.g. +8613800138000）
   * @param {string} code - 6 位数字验证码
   * @returns {Promise<void>}
   */
  async send(phone, code) {
    throw new Error(
      `SmsProvider not configured. ` +
      `Set SMS_PROVIDER env variable (e.g. "development", "aliyun", "tencent") ` +
      `and required credentials. ` +
      `SMS delivery failed for ${maskPhone(phone)}`
    );
  }
}

/**
 * 开发模式 Provider
 * 不真实发送，验证码打印到终端。终端输出带 [DEV SMS] 标记。
 */
class DevelopmentSmsProvider extends SmsProvider {
  async send(phone, code) {
    const banner = `\n` +
      `╔═════════════════════════════════════════════╗\n` +
      `║           [DEV SMS] 验证码                   ║\n` +
      `║  手机号: ${maskPhone(phone).padEnd(26)}║\n` +
      `║  验证码: ${String(code).padEnd(26)}║\n` +
      `║  有效期: 5 分钟                               ║\n` +
      `╚═════════════════════════════════════════════╝\n`;
    console.log(banner);
  }
}

/**
 * 脱敏手机号 — 只显示后 4 位
 * @param {string} phone
 * @returns {string}
 */
function maskPhone(phone) {
  if (!phone) return '(unknown)';
  // 保留国际前缀，隐藏中间
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return `****${digits.slice(-4)}`;
  return `${digits.slice(0, 2)}****${digits.slice(-4)}`;
}

/**
 * 创建 SmsProvider 实例
 * @returns {SmsProvider}
 */
function createSmsProvider() {
  const provider = (process.env.SMS_PROVIDER || 'development').toLowerCase();

  switch (provider) {
    case 'development':
      // 安全守卫：development provider 只允许 NODE_ENV=development 或 test
      // production/staging 误配 development provider 必须启动时明确抛错，不静默发送
      const devNodeEnv = process.env.NODE_ENV || 'development';
      if (devNodeEnv === 'production' || devNodeEnv === 'staging') {
        throw new Error('SMS service is not properly configured for this environment.');
      }
      return new DevelopmentSmsProvider();

    // 真实供应商接入骨架 — 未实现
    case 'aliyun':
    case 'tencent':
      const providerLabel = provider === 'aliyun' ? '阿里云' : '腾讯云';
      const errMsg = `${providerLabel}短信服务尚未接入。` +
        `生产环境 SMS_PROVIDER 应为 "aliyun" 或 "tencent" 并配置对应凭据，` +
        `但当前未实现真实短信发送。请在 .env 中设置 SMS_PROVIDER=development 进行开发测试。`;
      // 生产/预发布环境直接抛错阻止启动
      const nodeEnv = process.env.NODE_ENV || 'development';
      if (nodeEnv === 'production' || nodeEnv === 'staging' || nodeEnv === 'test') {
        throw new Error(errMsg + ' 生产环境不得使用未接入的短信供应商。');
      }
      throw new Error(errMsg);

    default:
      // 用户配置了不存在的 provider
      throw new Error(
        `Unknown SMS_PROVIDER "${provider}". ` +
        `Supported: development, aliyun, tencent.`
      );
  }
}

module.exports = {
  SmsProvider,
  DevelopmentSmsProvider,
  createSmsProvider,
  maskPhone,
};
