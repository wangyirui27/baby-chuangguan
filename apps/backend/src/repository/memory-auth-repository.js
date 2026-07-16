'use strict';

class MemoryAuthRepository {
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.verifications = new Map();
  }

  saveVerification(verification) {
    this.verifications.set(verification.id, { ...verification });
    return this.findVerificationById(verification.id);
  }

  findVerificationById(id) {
    return this.verifications.get(id) || null;
  }

  findLatestVerification(phoneHash) {
    let latest = null;
    for (const verification of this.verifications.values()) {
      if (verification.phoneHash !== phoneHash) continue;
      if (!latest || Date.parse(verification.createdAt) > Date.parse(latest.createdAt)) {
        latest = verification;
      }
    }
    return latest;
  }

  countVerificationsSince(phoneHash, since) {
    const sinceTime = Date.parse(since);
    let count = 0;
    for (const verification of this.verifications.values()) {
      if (
        verification.phoneHash === phoneHash &&
        Date.parse(verification.createdAt) >= sinceTime
      ) {
        count += 1;
      }
    }
    return count;
  }

  deleteVerification(id) {
    this.verifications.delete(id);
  }

  saveUser(user) {
    this.users.set(user.id, { ...user });
    return this.findUserById(user.id);
  }

  findUserById(id) {
    return this.users.get(id) || null;
  }

  findUserByPhoneHash(phoneHash) {
    for (const user of this.users.values()) {
      if (user.phoneHash === phoneHash) return user;
    }
    return null;
  }

  saveSession(session) {
    this.sessions.set(session.tokenHash, { ...session });
    return this.findSessionByTokenHash(session.tokenHash);
  }

  findSessionByTokenHash(tokenHash) {
    return this.sessions.get(tokenHash) || null;
  }

  deleteSession(tokenHash) {
    this.sessions.delete(tokenHash);
  }

  clear() {
    this.users.clear();
    this.sessions.clear();
    this.verifications.clear();
  }
}

module.exports = { MemoryAuthRepository };
