// 阿里云 SMS Provider 单测 — 不访问真实网络，fetch 注入 mock

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  AliyunSmsProvider,
  createSmsProvider,
  DevelopmentSmsProvider,
  percentEncode,
  getAliyunConfigStatus,
  maskPhone,
} = require('./sms-provider');

const VALID_ALIYUN = {
  accessKeyId: 'TEST_AK_ID',
  accessKeySecret: 'TEST_AK_SECRET',
  signName: '宝宝闯关',
  templateCode: 'SMS_123456789',
};

describe('percentEncode', () => {
  it('encodes reserved characters the Aliyun way', () => {
    assert.equal(percentEncode('a b'), 'a%20b');
    assert.equal(percentEncode('*'), '%2A');
    assert.equal(percentEncode('~'), '~');
  });
});

describe('AliyunSmsProvider.toAliyunPhone', () => {
  it('strips +86 and non-digits', () => {
    assert.equal(AliyunSmsProvider.toAliyunPhone('+8613800138000'), '13800138000');
    assert.equal(AliyunSmsProvider.toAliyunPhone('13800138000'), '13800138000');
    assert.equal(AliyunSmsProvider.toAliyunPhone('86-138-0013-8000'), '13800138000');
  });
});

describe('AliyunSmsProvider construction', () => {
  it('throws SMS_UNAVAILABLE when credentials incomplete', () => {
    assert.throws(
      () => new AliyunSmsProvider({ accessKeyId: 'only-id' }),
      (err) => err.code === 'SMS_UNAVAILABLE'
    );
  });

  it('accepts full credentials', () => {
    const p = new AliyunSmsProvider(VALID_ALIYUN);
    assert.equal(p.kind, 'aliyun');
  });
});

describe('AliyunSmsProvider.send', () => {
  it('POSTs signed form body and succeeds on Code=OK', async () => {
    /** @type {string|null} */
    let capturedBody = null;
    /** @type {string|null} */
    let capturedUrl = null;

    const fetchImpl = async (url, options) => {
      capturedUrl = url;
      capturedBody = options.body;
      assert.equal(options.method, 'POST');
      assert.equal(options.headers['Content-Type'], 'application/x-www-form-urlencoded');
      return {
        ok: true,
        status: 200,
        json: async () => ({ Code: 'OK', BizId: 'biz-1', Message: 'OK', RequestId: 'req-1' }),
      };
    };

    const fixedNow = () => new Date('2026-07-16T12:00:00.000Z');
    const provider = new AliyunSmsProvider({
      ...VALID_ALIYUN,
      fetchImpl,
      now: fixedNow,
    });

    await provider.send('+8613800138000', '654321');

    assert.ok(capturedUrl.includes('dysmsapi.aliyuncs.com'));
    assert.ok(capturedBody.includes('Action=SendSms'));
    assert.ok(capturedBody.includes('PhoneNumbers=13800138000'));
    assert.ok(capturedBody.includes('SignName='));
    assert.ok(capturedBody.includes('TemplateCode=SMS_123456789'));
    assert.ok(capturedBody.includes('TemplateParam='));
    // 模板参数里有验证码，但不应以明文日志方式断言泄漏路径以外
    assert.ok(decodeURIComponent(capturedBody).includes('"code":"654321"'));
    assert.ok(capturedBody.includes('Signature='));
    // 密钥不得出现在请求体
    assert.ok(!capturedBody.includes('TEST_AK_SECRET'));
  });

  it('maps configuration API errors to SMS_UNAVAILABLE', async () => {
    const provider = new AliyunSmsProvider({
      ...VALID_ALIYUN,
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ Code: 'isv.SMS_TEMPLATE_ILLEGAL', Message: 'template bad' }),
      }),
    });

    await assert.rejects(
      () => provider.send('13900139000', '111111'),
      (err) => err.code === 'SMS_UNAVAILABLE' && err.aliyunCode === 'isv.SMS_TEMPLATE_ILLEGAL'
    );
  });

  it('maps generic API errors to SEND_FAILED', async () => {
    const provider = new AliyunSmsProvider({
      ...VALID_ALIYUN,
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ Code: 'isv.BUSINESS_LIMIT_CONTROL', Message: 'limit' }),
      }),
    });

    await assert.rejects(
      () => provider.send('13900139000', '111111'),
      (err) => err.code === 'SEND_FAILED'
    );
  });

  it('maps network failure to SEND_FAILED', async () => {
    const provider = new AliyunSmsProvider({
      ...VALID_ALIYUN,
      fetchImpl: async () => {
        throw new Error('ECONNRESET');
      },
    });

    await assert.rejects(
      () => provider.send('13900139000', '111111'),
      (err) => err.code === 'SEND_FAILED'
    );
  });
});

describe('createSmsProvider aliyun', () => {
  const envKeys = [
    'SMS_PROVIDER',
    'SMS_ALIYUN_ACCESS_KEY_ID',
    'SMS_ALIYUN_ACCESS_KEY_SECRET',
    'SMS_ALIYUN_SIGN_NAME',
    'SMS_ALIYUN_TEMPLATE_CODE',
    'NODE_ENV',
  ];
  /** @type {Record<string, string|undefined>} */
  let saved = {};

  beforeEach(() => {
    saved = {};
    for (const key of envKeys) {
      saved[key] = process.env[key];
    }
  });

  afterEach(() => {
    for (const key of envKeys) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  it('returns DevelopmentSmsProvider by default', () => {
    process.env.SMS_PROVIDER = 'development';
    process.env.NODE_ENV = 'test';
    const p = createSmsProvider();
    assert.ok(p instanceof DevelopmentSmsProvider);
    assert.equal(p.kind, 'development');
  });

  it('returns AliyunSmsProvider when env complete', () => {
    process.env.SMS_PROVIDER = 'aliyun';
    process.env.SMS_ALIYUN_ACCESS_KEY_ID = 'ak';
    process.env.SMS_ALIYUN_ACCESS_KEY_SECRET = 'sk';
    process.env.SMS_ALIYUN_SIGN_NAME = 'sign';
    process.env.SMS_ALIYUN_TEMPLATE_CODE = 'SMS_1';
    process.env.NODE_ENV = 'production';

    const p = createSmsProvider();
    assert.ok(p instanceof AliyunSmsProvider);
    assert.equal(p.kind, 'aliyun');
  });

  it('throws when aliyun selected but credentials missing', () => {
    process.env.SMS_PROVIDER = 'aliyun';
    delete process.env.SMS_ALIYUN_ACCESS_KEY_ID;
    delete process.env.SMS_ALIYUN_ACCESS_KEY_SECRET;
    delete process.env.SMS_ALIYUN_SIGN_NAME;
    delete process.env.SMS_ALIYUN_TEMPLATE_CODE;

    assert.throws(
      () => createSmsProvider(),
      (err) => err.code === 'SMS_UNAVAILABLE'
    );
  });

  it('rejects unsupported providers', () => {
    process.env.SMS_PROVIDER = 'unsupported';
    assert.throws(
      () => createSmsProvider(),
      (err) => err.code === 'SMS_UNAVAILABLE' && /Supported: development, aliyun/.test(err.message)
    );
  });

  it('documents only implemented providers in root env example', () => {
    const envExample = fs.readFileSync(path.resolve(__dirname, '../../.env.example'), 'utf8');
    assert.match(envExample, /development/);
    assert.match(envExample, /aliyun/);
    assert.doesNotMatch(envExample, /tencent|腾讯云|尚未实现|尚未接入/);
  });
});

describe('getAliyunConfigStatus', () => {
  it('reports missing keys', () => {
    const keys = [
      'SMS_ALIYUN_ACCESS_KEY_ID',
      'SMS_ALIYUN_ACCESS_KEY_SECRET',
      'SMS_ALIYUN_SIGN_NAME',
      'SMS_ALIYUN_TEMPLATE_CODE',
    ];
    const saved = {};
    for (const key of keys) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
    try {
      const status = getAliyunConfigStatus();
      assert.equal(status.ok, false);
      assert.ok(status.missing.includes('SMS_ALIYUN_ACCESS_KEY_ID'));
    } finally {
      for (const key of keys) {
        if (saved[key] === undefined) delete process.env[key];
        else process.env[key] = saved[key];
      }
    }
  });
});

describe('maskPhone', () => {
  it('never returns full middle digits', () => {
    const masked = maskPhone('+8613800138000');
    assert.ok(!masked.includes('13800138000'));
    assert.ok(masked.includes('****'));
  });
});
