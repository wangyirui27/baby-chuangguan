'use strict';

const crypto = require('node:crypto');

/**
 * SHA-256 hash of a string, returning lowercase hex.
 * Used for phone and token lookups — never store raw values.
 * @param {string} value
 * @returns {string}
 */
function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Normalize a phone number to E.164 format with +86 prefix.
 * Strips all non-digit characters first.
 * @param {string} phone
 * @returns {string}
 */
function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('86')) {
    return '+' + digits;
  }
  return '+86' + digits;
}

/**
 * Check if a normalized phone has the expected Chinese mobile format.
 * Must be exactly 11 digits after stripping prefix.
 * @param {string} normalized
 * @returns {boolean}
 */
function isValidPhone(normalized) {
  return /^\+86\d{11}$/.test(normalized);
}

module.exports = { hashValue, normalizePhone, isValidPhone };
