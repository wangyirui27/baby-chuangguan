'use strict';

const crypto = require('node:crypto');
const { hashValue, normalizePhone, isValidPhone } = require('../utils');
const {
  ContractError,
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
  SESSION_REVOKED,
  SESSION_EXPIRED,
  USER_NOT_FOUND,
} = require('../errors');

// ─── Rate-limit constants (match frozen contract) ───────────────
const PHONE_COOLDOWN_MS = 60_000;   // 60 s — cooldown fixture: 42s wait after 18s elapsed
const PHONE_MAX_SENDS = 5;          // 5 per 15-min window
const PHONE_WINDOW_MS = 15 * 60_000;
const CODE_EXPIRY_MS = 5 * 60_000;  // 5 min
const MAX_ATTEMPTS = 3;
const SESSION_DAYS = 30;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;
const IP_RATE_LIMIT_MAX = 20;        // 20 per 15-min window
const IP_RATE_LIMIT_WINDOW_MS = 15 * 60_000;

/**
 * In-memory IP rate limiter for AuthService.sendCode().
 * The transport layer also enforces this for HTTP requests via middleware,
 * but service-level enforcement is needed so direct sendCode() calls
 * (used in API tests) throw instead of returning HTTP responses.
 */
class IpRateLimiter {
  constructor() {
    this._store = new Map();
  }

  consume(ip) {
    const now = Date.now();
    const recent = (this._store.get(ip) || [])
      .filter((timestamp) => now - timestamp < IP_RATE_LIMIT_WINDOW_MS);

    if (recent.length >= IP_RATE_LIMIT_MAX) {
      this._store.set(ip, recent);
      return false;
    }

    recent.push(now);
    this._store.set(ip, recent);
    return true;
  }

  clear() {
    this._store.clear();
  }
}

class AuthService {
  /**
   * @param {{ repository: object, smsProvider: object, environment: string,
   *           now?: () => number, generateCode?: () => string,
   *           generateToken?: () => string, generateId?: () => string }} options
   */
  constructor({
    repository,
    smsProvider,
    environment = 'production',
    now = () => Date.now(),
    generateCode = () => String(Math.floor(100000 + Math.random() * 900000)),
    generateToken = () => crypto.randomBytes(32).toString('hex'),
    generateId = () => crypto.randomUUID(),
  }) {
    this.repository = repository;
    this.smsProvider = smsProvider;
    this.environment = environment;
    this._now = now;
    this._generateCode = generateCode;
    this._generateToken = generateToken;
    this._generateId = generateId;
    this._ipLimiter = new IpRateLimiter();
  }

  // ─── Public API ───────────────────────────────────────────────

  /**
   * Send a verification code to a phone number.
   * Throws ContractError on validation failure or rate limit.
   * @param {string} phone — normalized phone string
   * @param {string} [ip] — for IP rate limiting
   * @returns {{ success: true, debugCode?: string }}
   */
  async sendCode(phone, ip = '127.0.0.1') {
    if (!this._ipLimiter.consume(ip)) {
      throw IP_RATE_LIMITED('发送太频繁，请稍后再试');
    }

    const normalized = normalizePhone(phone);
    if (!isValidPhone(normalized)) {
      throw INVALID_PHONE('手机号格式不正确');
    }

    const phoneHash = hashValue(normalized);

    // ── 5. Phone cooldown (60 s) ────────────────────────────────
    const latest = this.repository.findLatestVerification(phoneHash);
    if (latest) {
      const elapsed = this._now() - new Date(latest.createdAt).getTime();
      if (elapsed < PHONE_COOLDOWN_MS) {
        const waitSeconds = Math.ceil((PHONE_COOLDOWN_MS - elapsed) / 1000);
        throw COOLDOWN(`发送太频繁，请 ${waitSeconds} 秒后再试`);
      }
    }

    // ── 6. Phone rate limit (5 per 15 min) ─────────────────────
    const windowStart = new Date(this._now() - PHONE_WINDOW_MS).toISOString();
    const recentCount = this.repository.countVerificationsSince(phoneHash, windowStart);
    if (recentCount >= PHONE_MAX_SENDS) {
      throw RATE_LIMITED('发送太频繁，请稍后再试');
    }

    // ── 7. Generate and persist code ───────────────────────────
    const code = this._generateCode();
    const codeHash = hashValue(code);
    const verification = {
      id: `${phoneHash}:${codeHash}:${this._now()}`,
      phoneHash,
      codeHash,
      createdAt: new Date(this._now()).toISOString(),
      expiresAt: new Date(this._now() + CODE_EXPIRY_MS).toISOString(),
      attempts: 0,
    };
    this.repository.saveVerification(verification);

    // ── 8. Send via SMS provider ─────────────────────────────────
    try {
      await this.smsProvider.send(normalized, code);
    } catch (err) {
      // SMS provider unavailable → 503
      if (err.code === 'SMS_UNAVAILABLE') {
        throw SMS_UNAVAILABLE('短信服务暂不可用，请稍后再试');
      }
      // Strip provider error details before surfacing
      throw SEND_FAILED('发送验证码失败');
    }

    const response = { success: true };
    // debugCode only in development + development provider
    if (
      this.environment === 'development' &&
      this.smsProvider.kind === 'development'
    ) {
      response.debugCode = code;
    }
    return response;
  }

  /**
   * Verify a code and create or update a session.
   * Throws ContractError on failure.
   * @param {string} phone
   * @param {string} code
   * @returns {{ token: string, user: object }}
   */
  async verifyCode(phone, code) {
    // ── 1. Validate required params — type checks first ──────────────
    if (typeof phone !== 'string') {
      throw PARAMS_REQUIRED('手机号和验证码不能为空');
    }
    if (typeof code !== 'string') {
      throw PARAMS_REQUIRED('手机号和验证码不能为空');
    }
    if (!phone || !code) {
      throw PARAMS_REQUIRED('手机号和验证码不能为空');
    }

    const normalized = normalizePhone(phone);
    const phoneHash = hashValue(normalized);

    try {
      // ── 2. Find the latest unexpired verification ───────────────
      const latest = this.repository.findLatestVerification(phoneHash);
      if (!latest) {
        throw VERIFICATION_EXPIRED('验证码错误或已过期');
      }

      const expiresAt = new Date(latest.expiresAt).getTime();
      if (this._now() > expiresAt) {
        this.repository.deleteVerification(latest.id);
        throw VERIFICATION_EXPIRED('验证码错误或已过期');
      }

      // ── 3. Check attempts limit ────────────────────────────────
      if (latest.attempts >= MAX_ATTEMPTS) {
        this.repository.deleteVerification(latest.id);
        throw ATTEMPTS_EXCEEDED('验证码错误或已过期');
      }

      // ── 4. Verify code ─────────────────────────────────────────
      const inputHash = hashValue(String(code));
      if (inputHash !== latest.codeHash) {
        latest.attempts += 1;
        if (latest.attempts >= MAX_ATTEMPTS) {
          this.repository.deleteVerification(latest.id);
          throw ATTEMPTS_EXCEEDED('验证码错误或已过期');
        }
        throw INVALID_CODE('验证码错误或已过期');
      }

      // ── 5. Consume verification ────────────────────────────────
      this.repository.deleteVerification(latest.id);

      // ── 6. Find or create user ─────────────────────────────────
      let user = this.repository.findUserByPhoneHash(phoneHash);
      if (user) {
        user.lastLoginAt = new Date(this._now()).toISOString();
      } else {
        user = {
          id: this._generateId(),
          phoneHash,
          normalizedPhone: normalized,
          createdAt: new Date(this._now()).toISOString(),
          lastLoginAt: new Date(this._now()).toISOString(),
        };
        this.repository.saveUser(user);
      }

      // ── 7. Create session ───────────────────────────────────────
      const rawToken = this._generateToken();
      const tokenHash = hashValue(rawToken);
      const session = {
        tokenHash,
        userId: user.id,
        createdAt: new Date(this._now()).toISOString(),
        expiresAt: new Date(this._now() + SESSION_MS).toISOString(),
        revoked: false,
      };
      this.repository.saveSession(session);

      return {
        token: rawToken,
        user: {
          id: user.id,
          normalizedPhone: user.normalizedPhone,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          isLoggedIn: true,
          hasFullAccess: false,
        },
      };
    } catch (err) {
      if (err instanceof ContractError) throw err;
      throw VERIFY_FAILED('验证失败');
    }
  }

  /**
   * Look up the user for an active session token.
   * Throws ContractError if session is invalid.
   * @param {string} token — raw (unhashed) session token
   * @returns {{ user: object, session: object, tokenHash: string }}
   */
  getSession(token) {
    const tokenHash = hashValue(token);
    const session = this.repository.findSessionByTokenHash(tokenHash);

    if (!session) {
      throw UNAUTHORIZED('未登录');
    }
    if (session.revoked) {
      throw SESSION_REVOKED('会话已失效');
    }
    if (this._now() > new Date(session.expiresAt).getTime()) {
      this.repository.deleteSession(tokenHash);
      throw SESSION_EXPIRED('会话已过期');
    }

    const user = this.repository.findUserById(session.userId);
    if (!user) {
      this.repository.deleteSession(tokenHash);
      throw USER_NOT_FOUND('用户不存在');
    }

    return {
      user: {
        id: user.id,
        normalizedPhone: user.normalizedPhone,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        isLoggedIn: true,
        hasFullAccess: false,
      },
      session,
      tokenHash,
    };
  }

  /**
   * Revoke a session (idempotent — no error if session doesn't exist).
   * @param {string} [token] — raw session token
   * @returns {{ success: true }}
   */
  logout(token) {
    if (token) {
      const tokenHash = hashValue(token);
      const session = this.repository.findSessionByTokenHash(tokenHash);
      if (session) {
        session.revoked = true;
      }
    }
    return { success: true };
  }
}

// ─── Module-level exports ─────────────────────────────────────────
module.exports = { AuthService, IpRateLimiter };
// Also expose utils for test-server.js helpers
module.exports.hashValue = hashValue;
module.exports.normalizePhone = normalizePhone;
