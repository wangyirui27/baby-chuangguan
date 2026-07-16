'use strict';

/**
 * Contract error types — thrown by AuthService, caught and
 * converted to HTTP responses by the transport router.
 * All error codes must match schemas/error.json enum.
 */
class ContractError extends Error {
  /** @param {number} status @param {string} code @param {string} message */
  constructor(status, code, message) {
    super(message);
    this.name = 'ContractError';
    this.status = status;
    this.code = code;
  }
}

const PHONE_REQUIRED = (msg) => new ContractError(400, 'PHONE_REQUIRED', msg);
const INVALID_PHONE = (msg) => new ContractError(400, 'INVALID_PHONE', msg);
const PARAMS_REQUIRED = (msg) => new ContractError(400, 'PARAMS_REQUIRED', msg);
const VERIFICATION_EXPIRED = (msg) => new ContractError(400, 'VERIFICATION_EXPIRED', msg);
const INVALID_CODE = (msg) => new ContractError(400, 'INVALID_CODE', msg);
const ATTEMPTS_EXCEEDED = (msg) => new ContractError(400, 'ATTEMPTS_EXCEEDED', msg);
const COOLDOWN = (msg) => new ContractError(429, 'COOLDOWN', msg);
const RATE_LIMITED = (msg) => new ContractError(429, 'RATE_LIMITED', msg);
const IP_RATE_LIMITED = (msg) => new ContractError(429, 'IP_RATE_LIMITED', msg);
const SMS_UNAVAILABLE = (msg) => new ContractError(503, 'SMS_UNAVAILABLE', msg);
const SEND_FAILED = (msg) => new ContractError(500, 'SEND_FAILED', msg);
const VERIFY_FAILED = (msg) => new ContractError(500, 'VERIFY_FAILED', msg);
const UNAUTHORIZED = (msg) => new ContractError(401, 'UNAUTHORIZED', msg);
const SESSION_REVOKED = (msg) => new ContractError(401, 'SESSION_REVOKED', msg);
const SESSION_EXPIRED = (msg) => new ContractError(401, 'SESSION_EXPIRED', msg);
const USER_NOT_FOUND = (msg) => new ContractError(401, 'USER_NOT_FOUND', msg);

module.exports = {
  ContractError,
  PHONE_REQUIRED,
  INVALID_PHONE,
  PARAMS_REQUIRED,
  VERIFICATION_EXPIRED,
  INVALID_CODE,
  ATTEMPTS_EXCEEDED,
  COOLDOWN,
  RATE_LIMITED,
  IP_RATE_LIMITED,
  SMS_UNAVAILABLE,
  SEND_FAILED,
  VERIFY_FAILED,
  UNAUTHORIZED,
  SESSION_REVOKED,
  SESSION_EXPIRED,
  USER_NOT_FOUND,
};
