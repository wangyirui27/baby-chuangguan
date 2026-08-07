-- 课程/数学故事成品视频落库（二进制 + 元数据）
-- 说明：播放侧生产仍应优先 OSS/CDN；本表用于云端备份与后台拉取。
-- 字符集与现库一致 utf8mb4

CREATE TABLE IF NOT EXISTS baby_content_videos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  rel_path VARCHAR(512) NOT NULL COMMENT '仓库相对路径，如 assets/video/free-levels/level-01-mom.mp4',
  category VARCHAR(64) NOT NULL DEFAULT 'other' COMMENT 'free-levels | paid-levels | math-story | other',
  title VARCHAR(255) NOT NULL DEFAULT '',
  mime_type VARCHAR(64) NOT NULL DEFAULT 'video/mp4',
  byte_size BIGINT UNSIGNED NOT NULL DEFAULT 0,
  sha256 CHAR(64) NOT NULL DEFAULT '',
  content LONGBLOB NOT NULL,
  source_host VARCHAR(128) NOT NULL DEFAULT '' COMMENT '上传来源主机名，便于溯源',
  notes VARCHAR(512) NOT NULL DEFAULT '',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_baby_content_videos_rel_path (rel_path),
  KEY idx_baby_content_videos_category (category),
  KEY idx_baby_content_videos_sha256 (sha256)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
