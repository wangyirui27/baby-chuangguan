-- Auth tables for mysql auth backend
-- Mirrors db.js fields exactly. No business fields beyond auth data.
-- Charset: utf8mb4
-- Enable by setting LEARNING_REPOSITORY=mysql or AUTH_REPOSITORY=mysql

CREATE TABLE IF NOT EXISTS baby_auth_users (
  id CHAR(36) NOT NULL COMMENT 'crypto.randomUUID()',
  normalized_phone VARCHAR(32) NOT NULL COMMENT 'e.g. +861****8000',
  created_at VARCHAR(32) NOT NULL COMMENT 'ISO 8601',
  last_login_at VARCHAR(32) NOT NULL COMMENT 'ISO 8601',
  PRIMARY KEY (id),
  UNIQUE KEY uk_auth_users_phone (normalized_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS baby_auth_sessions (
  token_hash CHAR(64) NOT NULL COMMENT 'SHA-256 of raw token',
  user_id CHAR(36) NOT NULL COMMENT 'references baby_auth_users.id',
  created_at VARCHAR(32) NOT NULL COMMENT 'ISO 8601',
  expires_at VARCHAR(32) NOT NULL COMMENT 'ISO 8601 (30 days)',
  revoked TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (token_hash),
  KEY idx_auth_sessions_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS baby_auth_verifications (
  id VARCHAR(128) NOT NULL COMMENT 'phoneHash:codeHash composite key',
  phone_hash CHAR(64) NOT NULL COMMENT 'SHA-256 of normalized phone',
  code_hash CHAR(64) NOT NULL COMMENT 'SHA-256 of the 6-digit code',
  expires_at VARCHAR(32) NOT NULL COMMENT 'ISO 8601 (5 min)',
  attempts INT NOT NULL DEFAULT 0,
  used TINYINT(1) NOT NULL DEFAULT 0,
  created_at VARCHAR(32) NOT NULL COMMENT 'ISO 8601',
  PRIMARY KEY (id),
  KEY idx_auth_verifications_phone (phone_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
