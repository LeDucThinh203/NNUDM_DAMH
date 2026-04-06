-- Migration: thêm bảng chat_messages để lưu tin nhắn real-time

CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `message` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `recall_expires_at` datetime NOT NULL,
  `sender_hidden_at` datetime DEFAULT NULL,
  `recalled_for_all_at` datetime DEFAULT NULL,
  `reactions` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_chat_sender_created` (`sender_id`,`created_at`),
  KEY `idx_chat_receiver_created` (`receiver_id`,`created_at`),
  KEY `idx_chat_pair_created` (`sender_id`,`receiver_id`,`created_at`),
  CONSTRAINT `chat_messages_receiver_fk` FOREIGN KEY (`receiver_id`) REFERENCES `account` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_messages_sender_fk` FOREIGN KEY (`sender_id`) REFERENCES `account` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET @has_recall_expires_at := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'chat_messages'
    AND COLUMN_NAME = 'recall_expires_at'
);

SET @sql := IF(
  @has_recall_expires_at = 0,
  'ALTER TABLE `chat_messages` ADD COLUMN `recall_expires_at` datetime NULL AFTER `created_at`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_sender_hidden_at := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'chat_messages'
    AND COLUMN_NAME = 'sender_hidden_at'
);

SET @sql := IF(
  @has_sender_hidden_at = 0,
  'ALTER TABLE `chat_messages` ADD COLUMN `sender_hidden_at` datetime NULL AFTER `recall_expires_at`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_recalled_for_all_at := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'chat_messages'
    AND COLUMN_NAME = 'recalled_for_all_at'
);

SET @sql := IF(
  @has_recalled_for_all_at = 0,
  'ALTER TABLE `chat_messages` ADD COLUMN `recalled_for_all_at` datetime NULL AFTER `sender_hidden_at`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_reactions := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'chat_messages'
    AND COLUMN_NAME = 'reactions'
);

SET @sql := IF(
  @has_reactions = 0,
  'ALTER TABLE `chat_messages` ADD COLUMN `reactions` JSON NULL AFTER `recalled_for_all_at`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `chat_messages`
SET `recall_expires_at` = DATE_ADD(`created_at`, INTERVAL 1 DAY)
WHERE `id` > 0
  AND `recall_expires_at` IS NULL;

ALTER TABLE `chat_messages`
  MODIFY COLUMN `recall_expires_at` datetime NOT NULL;
