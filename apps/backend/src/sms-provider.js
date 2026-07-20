'use strict';

/**
 * apps/backend SMS provider factory.
 * Reuses the shared implementation under backend/src (integration stack).
 * Aliyun credentials come from env — never hardcode secrets.
 */

const path = require('node:path');

// From apps/backend/src → ../../../backend/src/sms-provider.js
const shared = require(path.resolve(__dirname, '../../../backend/src/sms-provider.js'));

module.exports = {
  SmsProvider: shared.SmsProvider,
  DevelopmentSmsProvider: shared.DevelopmentSmsProvider,
  AliyunSmsProvider: shared.AliyunSmsProvider,
  createSmsProvider: shared.createSmsProvider,
  maskPhone: shared.maskPhone,
  getAliyunConfigStatus: shared.getAliyunConfigStatus,
};
