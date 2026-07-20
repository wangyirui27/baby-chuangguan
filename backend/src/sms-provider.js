// 宝宝闯关 · SMS Provider
// development: 终端打印验证码
// aliyun: 阿里云短信 SendSms（纯 HTTPS + RPC 签名，无 SDK 依赖）

'use strict';

const crypto = require('crypto');
const { URLSearchParams } = require('url');

/**
 * @abstract
 */
class SmsProvider {
  /**
   * @param {string} phone - 规范化手机号（e.g. +8613800138000）
   * @param {string} code - 6 位数字验证码
   * @returns {Promise<void>}
   */
  async send(phone, code) {
    const err = new Error(
      `SmsProvider not configured. SMS delivery failed for ${maskPhone(phone)}`
    );
    err.code = 'SMS_UNAVAILABLE';
    throw err;
  }
}

/**
 * 开发模式 — 不真实发送，验证码打印到终端。
 */
class DevelopmentSmsProvider extends SmsProvider {
  constructor() {
    super();
    this.kind = 'development';
  }

  async send(phone, code) {
    const banner =
      `\n` +
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
 * 阿里云短信 SendSms（RPC 风格签名）。
 * 凭据仅来自环境变量 / 构造参数，绝不写死。
 *
 * 必需配置：
 *   SMS_ALIYUN_ACCESS_KEY_ID
 *   SMS_ALIYUN_ACCESS_KEY_SECRET
 *   SMS_ALIYUN_SIGN_NAME
 *   SMS_ALIYUN_TEMPLATE_CODE
 *
 * 可选：
 *   SMS_ALIYUN_REGION_ID          默认 cn-hangzhou
 *   SMS_ALIYUN_ENDPOINT           默认 https://dysmsapi.aliyuncs.com/
 *   SMS_ALIYUN_TEMPLATE_PARAM_KEY 模板变量名，默认 code → {"code":"123456"}
 */
class AliyunSmsProvider extends SmsProvider {
  /**
   * @param {object} [options]
   * @param {string} [options.accessKeyId]
   * @param {string} [options.accessKeySecret]
   * @param {string} [options.signName]
   * @param {string} [options.templateCode]
   * @param {string} [options.regionId]
   * @param {string} [options.endpoint]
   * @param {string} [options.templateParamKey]
   * @param {typeof fetch} [options.fetchImpl] - 可注入，便于测试
   * @param {() => Date} [options.now] - 可注入时钟，便于签名单测
   */
  constructor(options = {}) {
    super();
    this.kind = 'aliyun';
    this.accessKeyId = options.accessKeyId || process.env.SMS_ALIYUN_ACCESS_KEY_ID || '';
    this.accessKeySecret = options.accessKeySecret || process.env.SMS_ALIYUN_ACCESS_KEY_SECRET || '';
    this.signName = options.signName || process.env.SMS_ALIYUN_SIGN_NAME || '';
    this.templateCode = options.templateCode || process.env.SMS_ALIYUN_TEMPLATE_CODE || '';
    this.regionId = options.regionId || process.env.SMS_ALIYUN_REGION_ID || 'cn-hangzhou';
    this.endpoint = (options.endpoint || process.env.SMS_ALIYUN_ENDPOINT || 'https://dysmsapi.aliyuncs.com/').replace(/\/?$/, '/');
    this.templateParamKey = options.templateParamKey || process.env.SMS_ALIYUN_TEMPLATE_PARAM_KEY || 'code';
    this._fetch = options.fetchImpl || globalThis.fetch.bind(globalThis);
    this._now = options.now || (() => new Date());

    if (!this.accessKeyId || !this.accessKeySecret || !this.signName || !this.templateCode) {
      const err = new Error('Aliyun SMS credentials incomplete');
      err.code = 'SMS_UNAVAILABLE';
      throw err;
    }
  }

  /**
   * 阿里云国内短信手机号：11 位国内号（去掉 +86）。
   * @param {string} phone
   * @returns {string}
   */
  static toAliyunPhone(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.startsWith('86') && digits.length === 13) {
      return digits.slice(2);
    }
    if (digits.length === 11) return digits;
    return digits;
  }

  /**
   * 构建 RPC 公共参数 + 业务参数并签名。
   * @param {Record<string, string>} businessParams
   * @returns {URLSearchParams}
   */
  buildSignedParams(businessParams) {
    const timestamp = this._now().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const nonce = crypto.randomBytes(16).toString('hex');

    /** @type {Record<string, string>} */
    const params = {
      AccessKeyId: this.accessKeyId,
      Action: 'SendSms',
      Format: 'JSON',
      RegionId: this.regionId,
      SignatureMethod: 'HMAC-SHA1',
      SignatureNonce: nonce,
      SignatureVersion: '1.0',
      Timestamp: timestamp,
      Version: '2017-05-25',
      ...businessParams,
    };

    const sortedKeys = Object.keys(params).sort();
    const canonicalized = sortedKeys
      .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
      .join('&');

    const stringToSign = `POST&${percentEncode('/')}&${percentEncode(canonicalized)}`;
    const signature = crypto
      .createHmac('sha1', `${this.accessKeySecret}&`)
      .update(stringToSign)
      .digest('base64');

    const body = new URLSearchParams();
    for (const key of sortedKeys) {
      body.append(key, params[key]);
    }
    body.append('Signature', signature);
    return body;
  }

  async send(phone, code) {
    const phoneNumber = AliyunSmsProvider.toAliyunPhone(phone);
    if (!/^1\d{10}$/.test(phoneNumber)) {
      const err = new Error(`Invalid phone for Aliyun SMS: ${maskPhone(phone)}`);
      err.code = 'SEND_FAILED';
      throw err;
    }

    const templateParam = JSON.stringify({ [this.templateParamKey]: String(code) });
    const body = this.buildSignedParams({
      PhoneNumbers: phoneNumber,
      SignName: this.signName,
      TemplateCode: this.templateCode,
      TemplateParam: templateParam,
    });

    let response;
    try {
      response = await this._fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
    } catch (networkErr) {
      console.error(`[SMS:aliyun] network error for ${maskPhone(phone)}`);
      const err = new Error('Aliyun SMS network error');
      err.code = 'SEND_FAILED';
      err.cause = networkErr;
      throw err;
    }

    let payload;
    try {
      payload = await response.json();
    } catch {
      console.error(`[SMS:aliyun] non-JSON response status=${response.status} for ${maskPhone(phone)}`);
      const err = new Error('Aliyun SMS invalid response');
      err.code = 'SEND_FAILED';
      throw err;
    }

    // 成功：Code === "OK"
    if (response.ok && payload && payload.Code === 'OK') {
      console.log(`[SMS:aliyun] sent to ${maskPhone(phone)} bizId=${payload.BizId || '-'}`);
      return;
    }

    const apiCode = payload && payload.Code ? String(payload.Code) : `HTTP_${response.status}`;
    // 不把 Message / RequestId 以外的敏感内容打进面向用户的错误
    console.error(`[SMS:aliyun] send failed phone=${maskPhone(phone)} code=${apiCode}`);

    // 配置/权限类问题 → 服务不可用；业务限流等 → 发送失败
    const unavailableCodes = new Set([
      'InvalidAccessKeyId.NotFound',
      'InvalidAccessKeyId.Inactive',
      'SignatureDoesNotMatch',
      'Forbidden.RAM',
      'Forbidden',
      'isv.SMS_SIGNATURE_ILLEGAL',
      'isv.SMS_TEMPLATE_ILLEGAL',
      'isv.SMS_SIGNATURE_SCENE_ILLEGAL',
      'isv.AMOUNT_NOT_ENOUGH',
      'isv.OUT_OF_SERVICE',
      'isp.RAM_PERMISSION_DENY',
    ]);

    const err = new Error(`Aliyun SMS failed: ${apiCode}`);
    err.code = unavailableCodes.has(apiCode) ? 'SMS_UNAVAILABLE' : 'SEND_FAILED';
    err.aliyunCode = apiCode;
    throw err;
  }
}

/**
 * 阿里云 RPC 百分号编码（RFC 3986，空格为 %20）。
 * @param {string} value
 * @returns {string}
 */
function percentEncode(value) {
  return encodeURIComponent(String(value))
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

/**
 * 脱敏手机号 — 日志专用，只保留前后几位。
 * @param {string} phone
 * @returns {string}
 */
function maskPhone(phone) {
  if (!phone) return '(unknown)';
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return `****${digits.slice(-4)}`;
  return `${digits.slice(0, 2)}****${digits.slice(-4)}`;
}

/**
 * 读取并校验阿里云 env（不创建实例时也可用于启动检查）。
 * @returns {{ ok: boolean, missing: string[] }}
 */
function getAliyunConfigStatus() {
  const required = [
    'SMS_ALIYUN_ACCESS_KEY_ID',
    'SMS_ALIYUN_ACCESS_KEY_SECRET',
    'SMS_ALIYUN_SIGN_NAME',
    'SMS_ALIYUN_TEMPLATE_CODE',
  ];
  const missing = required.filter((key) => !process.env[key] || !String(process.env[key]).trim());
  return { ok: missing.length === 0, missing };
}

/**
 * 创建 SmsProvider 实例。
 * @param {object} [overrides] - 测试可注入 env 覆盖
 * @returns {SmsProvider}
 */
function createSmsProvider(overrides = {}) {
  const provider = String(
    overrides.provider || process.env.SMS_PROVIDER || 'development'
  ).toLowerCase();
  const nodeEnv = overrides.nodeEnv || process.env.NODE_ENV || 'development';

  switch (provider) {
    case 'development': {
      // production/staging 禁止 development，防止误发/误上线
      if (nodeEnv === 'production' || nodeEnv === 'staging') {
        const err = new Error('SMS service is not properly configured for this environment.');
        err.code = 'SMS_UNAVAILABLE';
        throw err;
      }
      return new DevelopmentSmsProvider();
    }

    case 'aliyun': {
      const status = getAliyunConfigStatus();
      // 允许构造参数覆盖（测试）
      const hasInline =
        overrides.accessKeyId &&
        overrides.accessKeySecret &&
        overrides.signName &&
        overrides.templateCode;

      if (!status.ok && !hasInline) {
        const err = new Error(
          `Aliyun SMS not configured. Missing: ${status.missing.join(', ')}`
        );
        err.code = 'SMS_UNAVAILABLE';
        throw err;
      }

      return new AliyunSmsProvider({
        accessKeyId: overrides.accessKeyId,
        accessKeySecret: overrides.accessKeySecret,
        signName: overrides.signName,
        templateCode: overrides.templateCode,
        regionId: overrides.regionId,
        endpoint: overrides.endpoint,
        templateParamKey: overrides.templateParamKey,
        fetchImpl: overrides.fetchImpl,
        now: overrides.now,
      });
    }

    default: {
      const err = new Error(
        `Unknown SMS_PROVIDER "${provider}". Supported: development, aliyun.`
      );
      err.code = 'SMS_UNAVAILABLE';
      throw err;
    }
  }
}

module.exports = {
  SmsProvider,
  DevelopmentSmsProvider,
  AliyunSmsProvider,
  createSmsProvider,
  maskPhone,
  percentEncode,
  getAliyunConfigStatus,
};
