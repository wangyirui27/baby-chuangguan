-- 学习库：数学答题记录列（InsForge 迁移对 MySQL 的等价落地）
-- MySQL 8 不支持 ADD COLUMN IF NOT EXISTS，由仓库 ensureSchema 或手工执行：

-- ALTER TABLE baby_profiles ADD COLUMN math_attempts JSON NULL;

-- 幂等检查：
-- SELECT COLUMN_NAME FROM information_schema.COLUMNS
--  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'baby_profiles' AND COLUMN_NAME = 'math_attempts';
