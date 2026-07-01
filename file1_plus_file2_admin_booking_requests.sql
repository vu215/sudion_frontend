-- Gộp file 1 + file 2
-- Chạy trong database: photography_booking
-- Lưu ý: bảng `users` phải tồn tại trước khi chạy vì `ai_moderation` có FOREIGN KEY tới `users`.`id`.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- Additional admin tables for AI moderation and settings
-- Execute this SQL to add missing tables

-- AI Moderation table
CREATE TABLE IF NOT EXISTS `ai_moderation` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT DEFAULT NULL,
  `content_type` ENUM('text', 'image', 'review', 'message', 'profile') NOT NULL DEFAULT 'text',
  `content_id` VARCHAR(100) NULL,
  `content_text` TEXT NULL,
  `detected_issues` JSON NULL,
  `confidence_score` DECIMAL(5,4) DEFAULT 0.0000,
  `decision` ENUM('approved', 'flagged', 'rejected', 'review') NOT NULL DEFAULT 'review',
  `severity` ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'low',
  `reviewed_by` INT NULL,
  `review_note` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_content_type` (`content_type`),
  KEY `idx_decision` (`decision`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_ai_moderation_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ai_moderation_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI moderation records for content filtering';

-- System Settings table
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT NULL,
  `value_type` ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string',
  `category` VARCHAR(50) NOT NULL DEFAULT 'general',
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_setting_key` (`setting_key`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='System configuration settings';

-- Insert default settings
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `value_type`, `category`, `description`) VALUES
('site_name', 'Sudion Photography', 'string', 'general', 'Website name'),
('maintenance_mode', 'false', 'boolean', 'general', 'Enable/disable maintenance mode'),
('payment_gateway', 'vnpay', 'string', 'payment', 'Default payment gateway'),
('commission_rate', '0.15', 'number', 'payment', 'Platform commission rate (15%)'),
('deposit_rate', '0.5', 'number', 'payment', 'Required deposit rate (50%)'),
('booking_cancellation_hours', '24', 'number', 'booking', 'Hours before shoot to allow cancellation'),
('booking_auto_confirm', 'false', 'boolean', 'booking', 'Auto-confirm bookings'),
('email_notifications', 'true', 'boolean', 'notification', 'Enable email notifications'),
('sms_notifications', 'false', 'boolean', 'notification', 'Enable SMS notifications'),
('ai_moderation_enabled', 'true', 'boolean', 'moderation', 'Enable AI content moderation'),
('ai_confidence_threshold', '0.7', 'number', 'moderation', 'Confidence threshold for auto-flagging (0.7 = 70%)')
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- Hai index dưới đây là index phụ. Tạo bằng thủ tục an toàn để chạy lại không bị Duplicate key name.

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ai_moderation'
    AND INDEX_NAME = 'idx_ai_moderation_decision_created'
);

SET @sql := IF(
  @idx_exists = 0,
  'CREATE INDEX idx_ai_moderation_decision_created ON ai_moderation(decision, created_at DESC)',
  'SELECT "idx_ai_moderation_decision_created already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'system_settings'
    AND INDEX_NAME = 'idx_settings_category_key'
);

SET @sql := IF(
  @idx_exists = 0,
  'CREATE INDEX idx_settings_category_key ON system_settings(category, setting_key)',
  'SELECT "idx_settings_category_key already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =========================
-- File 2: booking_requests
-- =========================

-- Xóa bảng booking_requests cũ để import lại từ file 2, tránh lỗi table already exists
DROP TABLE IF EXISTS `booking_requests`;

CREATE TABLE `booking_requests` (
  `id` bigint(20) NOT NULL,
  `booking_code` varchar(50) NOT NULL,
  `photographer_id` varchar(100) NOT NULL,
  `photographer_name` varchar(255) NOT NULL,
  `service_id` varchar(100) NOT NULL,
  `service_name` varchar(255) NOT NULL,
  `base_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `availability_slot_id` varchar(100) DEFAULT NULL,
  `availability_slot_label` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `shoot_date` date DEFAULT NULL,
  `shoot_time` time DEFAULT NULL,
  `shoot_end_time` time DEFAULT NULL,
  `people_scale` varchar(100) DEFAULT NULL,
  `people_extra` decimal(12,2) NOT NULL DEFAULT 0.00,
  `scene` varchar(255) DEFAULT NULL,
  `concept` text DEFAULT NULL,
  `budget` varchar(100) DEFAULT NULL,
  `add_on_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `estimated_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `deposit_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `remaining_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `add_ons` longtext DEFAULT NULL,
  `reference_file_name` varchar(255) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT 'momo',
  `status` varchar(50) NOT NULL DEFAULT 'awaiting_payment',
  `customer_full_name` varchar(255) NOT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `contact_channel` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `booking_requests`
--

INSERT INTO `booking_requests` (`id`, `booking_code`, `photographer_id`, `photographer_name`, `service_id`, `service_name`, `base_price`, `availability_slot_id`, `availability_slot_label`, `location`, `shoot_date`, `shoot_time`, `shoot_end_time`, `people_scale`, `people_extra`, `scene`, `concept`, `budget`, `add_on_total`, `estimated_total`, `deposit_amount`, `remaining_amount`, `add_ons`, `reference_file_name`, `payment_method`, `status`, `customer_full_name`, `customer_phone`, `customer_email`, `contact_channel`, `created_at`, `updated_at`) VALUES
(1, 'BK17811902759856320', '2', 'STUDION Match', 'couple', 'Chụp ảnh đôi', 1500000.00, 'match-0615-am', '15/06 · 08:30', 'Hồ Chí Minh', '2026-06-15', '08:30:00', NULL, '2 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 1500000.00, 750000.00, 750000.00, '[]', NULL, 'vnpay', 'confirmed', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-11 15:04:35', '2026-06-11 15:10:57'),
(2, 'BK17811907029642206', '2', 'STUDION Match', 'event', 'Chụp sự kiện', 1000000.00, 'match-0610-am', '10/06 · 09:00', 'Hồ Chí Minh', '2026-06-10', '09:00:00', NULL, 'Dưới 30 khách', 0.00, 'Studio', NULL, '5.000.000', 0.00, 1000000.00, 500000.00, 500000.00, '[]', NULL, 'bank', 'confirmed', 'ffzffzfs', '090393933', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-11 15:11:42', '2026-06-11 15:15:56'),
(3, 'BK17812447937792189', '4', 'Minh Anh', '215', 'Gói food/product', 1200000.00, 'slot-1', '12/06 · 09:00', 'Ho Chi Minh City, VN', '2026-06-12', '09:00:00', NULL, '1-5 sản phẩm', 0.00, 'Studio', '\n\n[Đã hủy bởi customer]', '5.000.000', 1200000.00, 2400000.00, 1200000.00, 1200000.00, '[{\"id\":\"retouch\",\"name\":\"Retouch nâng cao\",\"price\":1200000}]', NULL, 'vnpay', 'cancelled', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-12 06:13:13', '2026-06-12 06:39:54'),
(7, 'BK17812506749458465', '86', 'Photo Travel 09', '311', 'Gói cưới ngoại cảnh', 5200000.00, 'slot-1', '12/06 · 09:00', 'Đà Nẵng, VN', '2026-06-12', '09:00:00', NULL, '2-10 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 5200000.00, 2600000.00, 2600000.00, '[]', NULL, 'momo', 'rejected', 'lê mạnh cường ', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-12 07:51:14', '2026-06-12 08:01:11'),
(8, 'BK17812507781261176', '86', 'Photo Travel 09', '311', 'Gói cưới ngoại cảnh', 5200000.00, 'slot-2', '14/06 · 14:30', 'Đà Nẵng, VN', '2026-06-14', '14:30:00', NULL, '2-10 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 5200000.00, 2600000.00, 2600000.00, '[]', NULL, 'momo', 'rejected', 'ludtuttud', '87857587676', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-12 07:52:58', '2026-06-12 08:01:14'),
(9, 'BK17812512398256235', '86', 'Photo Travel 09', '73', 'Gói Chụp travel 09', 2200000.00, 'slot-3', '18/06 · 08:30', 'Đà Nẵng, VN', '2026-06-18', '08:30:00', NULL, '1 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2200000.00, 1100000.00, 1100000.00, '[]', NULL, 'momo', 'completed', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-12 08:00:39', '2026-06-12 08:04:25'),
(10, 'BK17812516346188378', '86', 'Photo Travel 09', '73', 'Gói Chụp travel 09', 2200000.00, 'slot-1', '12/06 · 09:00', 'Đà Nẵng, VN', '2026-06-12', '09:00:00', NULL, '1 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2200000.00, 1100000.00, 1100000.00, '[]', NULL, 'momo', 'awaiting_payment', 'vũ kiên hôn', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-12 08:07:14', '2026-06-12 08:07:14'),
(11, 'BK17812518105327268', '84', 'Photo Kỉ Yếu 09', '212', 'Gói thương mại doanh nghiệp', 2200000.00, 'slot-1', '12/06 · 09:00', 'Đà Nẵng, VN', '2026-06-12', '09:00:00', NULL, '1 concept', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2200000.00, 1100000.00, 1100000.00, '[]', NULL, 'momo', 'completed', 'vũ kiên hôn', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-12 08:10:10', '2026-06-12 08:11:52'),
(12, 'BK17812528274736075', '84', 'Photo Kỉ Yếu 09', '93', 'Gói Chụp kỉ yếu 09', 2900000.00, 'slot-1', '12/06 · 09:00', 'Đà Nẵng, VN', '2026-06-12', '09:00:00', NULL, '10-20 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2900000.00, 1450000.00, 1450000.00, '[]', NULL, 'momo', 'completed', 'gesgsgs', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-12 08:27:07', '2026-06-12 08:30:56'),
(13, 'BK17815401909602794', '79', 'Photo Gia Đình 09', '43', 'Gói Chụp ảnh gia đình 09', 2700000.00, 'slot-1', '12/06 · 09:00', 'Đà Nẵng, VN', '2026-06-12', '09:00:00', NULL, '2-5 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2700000.00, 1350000.00, 1350000.00, '[]', NULL, 'momo', 'completed', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 16:16:30', '2026-06-15 16:17:32'),
(14, 'BK17815403399337730', '79', 'Photo Gia Đình 09', '211', 'Gói thương mại doanh nghiệp', 2200000.00, 'slot-1', '12/06 · 09:00', 'Đà Nẵng, VN', '2026-06-12', '09:00:00', NULL, '1 concept', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2200000.00, 1100000.00, 1100000.00, '[]', NULL, 'momo', 'rejected', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 16:18:59', '2026-06-15 16:44:36'),
(15, 'BK17815416993447384', '79', 'Photo Gia Đình 09', '43', 'Gói Chụp ảnh gia đình 09', 2700000.00, 'slot-2', '14/06 · 14:30', 'Đà Nẵng, VN', '2026-06-14', '14:30:00', NULL, '2-5 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2700000.00, 1350000.00, 1350000.00, '[]', NULL, 'momo', 'rejected', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 16:41:39', '2026-06-15 16:41:54'),
(16, 'BK17815419348752955', '79', 'Photo Gia Đình 09', '43', 'Gói Chụp ảnh gia đình 09', 2700000.00, 'slot-1', '12/06 · 09:00', 'Đà Nẵng, VN', '2026-06-12', '09:00:00', NULL, '2-5 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2700000.00, 1350000.00, 1350000.00, '[]', NULL, 'momo', 'rejected', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 16:45:34', '2026-06-15 16:45:59'),
(17, 'BK17815421358888453', '79', 'Photo Gia Đình 09', '43', 'Gói Chụp ảnh gia đình 09', 2700000.00, 'slot-1', '12/06 · 09:00', 'Đà Nẵng, VN', '2026-06-12', '09:00:00', NULL, '2-5 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2700000.00, 1350000.00, 1350000.00, '[]', NULL, 'momo', 'rejected', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 16:48:55', '2026-06-15 16:50:27'),
(18, 'BK17815424165108535', '79', 'Photo Gia Đình 09', '229', 'Gói food/product', 1200000.00, 'slot-1', '12/06 · 09:00', 'Đà Nẵng, VN', '2026-06-12', '09:00:00', NULL, '1-5 sản phẩm', 0.00, 'Studio', '\n\n[Lý do hủy bởi customer]: Khách hủy lịch', '5.000.000', 1200000.00, 2400000.00, 1200000.00, 1200000.00, '[{\"id\":\"retouch\",\"name\":\"Retouch nâng cao\",\"price\":1200000}]', NULL, 'momo', 'cancelled', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 16:53:36', '2026-06-15 16:54:03'),
(19, 'BK17815448413912619', '79', 'Photo Gia Đình 09', '43', 'Gói Chụp ảnh gia đình 09', 2700000.00, 'slot-1', '12/06 · 09:00', 'Đà Nẵng, VN', '2026-06-12', '09:00:00', NULL, '2-5 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2700000.00, 1350000.00, 1350000.00, '[]', NULL, 'momo', 'fully_paid', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 17:34:01', '2026-06-15 17:35:37'),
(20, 'BK17815467961312092', '79', 'Photo Gia Đình 09', '43', 'Gói Chụp ảnh gia đình 09', 2700000.00, 'slot-1', '12/06 · 09:00', 'Đà Nẵng, VN', '2026-06-12', '09:00:00', NULL, '2-5 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2700000.00, 1350000.00, 1350000.00, '[]', NULL, 'momo', 'rejected', 'lê mạnh cường', '056578', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 18:06:36', '2026-06-15 18:20:43'),
(21, 'BK17815472942796479', '79', 'Photo Gia Đình 09', '43', 'Gói Chụp ảnh gia đình 09', 2700000.00, 'slot-2', '14/06 · 14:30', 'Đà Nẵng, VN', '2026-06-14', '14:30:00', NULL, '2-5 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2700000.00, 1350000.00, 1350000.00, '[]', NULL, 'momo', 'rejected', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 18:14:54', '2026-06-15 18:20:40'),
(22, 'BK17815476071843044', '79', 'Photo Gia Đình 09', '43', 'Gói Chụp ảnh gia đình 09', 2700000.00, 'slot-3', '18/06 · 08:30', 'Đà Nẵng, VN', '2026-06-18', '08:30:00', NULL, '2-5 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2700000.00, 1350000.00, 1350000.00, '[]', NULL, 'momo', 'rejected', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 18:20:07', '2026-06-15 18:20:39'),
(23, 'BK17815476609575074', '79', 'Photo Gia Đình 09', '43', 'Gói Chụp ảnh gia đình 09', 2700000.00, 'slot-1', '12/06 · 09:00', 'Đà Nẵng, VN', '2026-06-12', '09:00:00', NULL, '2-5 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2700000.00, 1350000.00, 1350000.00, '[]', NULL, 'momo', 'rejected', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 18:21:00', '2026-06-15 18:26:05'),
(24, 'BK17815479226522174', '79', 'Photo Gia Đình 09', '43', 'Gói Chụp ảnh gia đình 09', 2700000.00, 'slot-2', '14/06 · 14:30', 'Đà Nẵng, VN', '2026-06-14', '14:30:00', NULL, '2-5 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2700000.00, 1350000.00, 1350000.00, '[]', NULL, 'momo', 'rejected', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 18:25:22', '2026-06-15 18:26:10'),
(25, 'BK17815479378823067', '79', 'Photo Gia Đình 09', '43', 'Gói Chụp ảnh gia đình 09', 2700000.00, 'slot-3', '18/06 · 08:30', 'Đà Nẵng, VN', '2026-06-18', '08:30:00', NULL, '2-5 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2700000.00, 1350000.00, 1350000.00, '[]', NULL, 'momo', 'rejected', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 18:25:37', '2026-06-15 18:26:14'),
(26, 'BK17815492814376055', '79', 'Photo Gia Đình 09', '43', 'Gói Chụp ảnh gia đình 09', 2700000.00, 'slot-1', '12/06 · 09:00', 'Đà Nẵng, VN', '2026-06-12', '09:00:00', NULL, '2-5 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2700000.00, 1350000.00, 1350000.00, '[]', NULL, 'momo', 'fully_paid', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 18:48:01', '2026-06-15 18:49:33'),
(27, 'BK17815498899996718', '79', 'Photo Gia Đình 09', '211', 'Gói thương mại doanh nghiệp', 2200000.00, 'slot-1', '12/06 · 09:00', 'Đà Nẵng, VN', '2026-06-12', '09:00:00', NULL, '1 concept', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2200000.00, 1100000.00, 1100000.00, '[]', NULL, 'momo', 'fully_paid', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 18:58:10', '2026-06-15 18:59:39'),
(28, 'BK17815501218966209', '79', 'Photo Gia Đình 09', '194', 'Gói sự kiện theo giờ', 1000000.00, 'slot-1', '12/06 · 09:00', 'Đà Nẵng, VN', '2026-06-12', '09:00:00', NULL, 'Dưới 30 khách', 0.00, 'Studio', NULL, '5.000.000', 0.00, 1000000.00, 500000.00, 500000.00, '[]', NULL, 'momo', 'rejected', 'hong cóng hôn', '0383938173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 19:02:01', '2026-06-15 19:02:18'),
(29, 'BK17815502283979288', '79', 'Photo Gia Đình 09', '211', 'Gói thương mại doanh nghiệp', 2200000.00, 'slot-1', '12/06 · 09:00', 'Đà Nẵng, VN', '2026-06-12', '09:00:00', NULL, '1 concept', 0.00, 'Studio', '\n\n[Lý do hủy - customer]: méo chụp nữa', '5.000.000', 0.00, 2200000.00, 1100000.00, 1100000.00, '[]', NULL, 'momo', 'cancelled', 'vũ ', '8339393838', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 19:03:48', '2026-06-15 19:05:10'),
(30, 'BK17815504193985120', '79', 'Photo Gia Đình 09', '43', 'Gói Chụp ảnh gia đình 09', 2700000.00, 'slot-1', '12/06 · 09:00', 'Đà Nẵng, VN', '2026-06-12', '09:00:00', NULL, '2-5 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2700000.00, 1350000.00, 1350000.00, '[]', NULL, 'momo', 'rejected', 'kiên', '03944848484', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 19:06:59', '2026-06-15 19:08:16'),
(31, 'BK17815504627897917', '79', 'Photo Gia Đình 09', '43', 'Gói Chụp ảnh gia đình 09', 2700000.00, 'slot-2', '14/06 · 14:30', 'Đà Nẵng, VN', '2026-06-14', '14:30:00', NULL, '2-5 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 2700000.00, 1350000.00, 1350000.00, '[]', NULL, 'momo', 'rejected', 'kiên 2', '0339383838', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-15 19:07:42', '2026-06-15 19:08:14'),
(32, 'BK17816218165653677', '38', 'Photo Couple 04', '151', 'Gói cưới pre-wedding', 5000000.00, 'slot-1', '12/06 · 09:00', 'Cần Thơ, Việt Nam', '2026-06-12', '09:00:00', NULL, '2-10 người', 0.00, 'Studio', NULL, '5.000.000', 0.00, 5000000.00, 2500000.00, 2500000.00, '[]', NULL, 'momo', 'fully_paid', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-16 14:56:56', '2026-06-16 14:57:38'),
(33, 'BK17816252371425489', '86', 'Photo Travel 09', '311', 'Gói cưới ngoại cảnh', 5200000.00, 'slot-2', '14/06 · 14:30', 'Đà Nẵng, VN', '2026-06-14', '14:30:00', NULL, '2-10 người', 0.00, 'Studio', '\n\n[Lý do hủy - customer]: deo muốn sài nữa', '5.000.000', 0.00, 5200000.00, 2600000.00, 2600000.00, '[]', NULL, 'momo', 'cancelled', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-16 15:53:57', '2026-06-16 15:57:11'),
(34, 'BK17816271825301268', '3', 'Bình Nguyễn', '2', 'Gói chụp ảnh cưới cơ bản', 5000000.00, 'slot-1', '12/06 · 09:00', 'Quận 3, TP.HCM', '2026-06-12', '09:00:00', NULL, '2-10 người', 0.00, 'Studio', NULL, '5.000.000', 17200000.00, 22200000.00, 11100000.00, 11100000.00, '[{\"id\":\"makeup\",\"name\":\"Makeup\",\"price\":1500000},{\"id\":\"video\",\"name\":\"Video highlight\",\"price\":2500000},{\"id\":\"flycam\",\"name\":\"Flycam\",\"price\":5000000},{\"id\":\"album\",\"name\":\"Album in ấn\",\"price\":3000000},{\"id\":\"retouch\",\"name\":\"Retouch nâng cao\",\"price\":1200000},{\"id\":\"stylist\",\"name\":\"Stylist\",\"price\":4000000}]', NULL, 'momo', 'awaiting_payment', 'lê mạnh cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-16 16:26:22', '2026-06-16 16:26:22'),
(35, 'BK17820840801958467', '86', 'Photo Travel 09', '311', 'Gói cưới ngoại cảnh', 5200000.00, NULL, '14:00 - 18:00', 'Hồ Chí Minh', '2026-06-21', '14:00:00', '18:00:00', NULL, 0.00, 'Ngoại cảnh', 'Concept cưới ngoại cảnh', '12000000', 500000.00, 5700000.00, 2850000.00, 2850000.00, '[{\"id\":\"wedding_gate_photo\",\"name\":\"Ảnh cổng cưới\",\"price\":500000}]', NULL, 'momo', 'fully_paid', 'Khách test', '0909000000', 'test@sudion.vn', 'Zalo', '2026-06-21 23:21:20', '2026-06-21 23:29:17'),
(36, 'BK17822306746757384', '84', 'Photo Kỉ Yếu 09', '212', 'Gói thương mại doanh nghiệp', 2200000.00, NULL, '09:00 - 13:00', 'Hồ Chí Minh', '2026-06-23', '09:00:00', '13:00:00', NULL, 0.00, NULL, NULL, '2200000', 0.00, 2200000.00, 1100000.00, 1100000.00, '[]', NULL, 'momo', 'awaiting_payment', 'cường', '0393839173', 'vycuonghuhu22@gmail.com', 'Zalo', '2026-06-23 16:04:34', '2026-06-23 16:04:34'),
(37, 'BK17822887732953397', '38', 'Photo Couple 04', '151', 'Gói cưới pre-wedding', 5000000.00, NULL, '09:00 - 13:00', 'Hồ Chí Minh', '2026-06-27', '09:00:00', '13:00:00', NULL, 0.00, NULL, NULL, '18000000', 0.00, 5000000.00, 2500000.00, 2500000.00, '[]', NULL, 'momo', 'completed', 'Lê Mạnh Cường', '0u8980', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-24 08:12:53', '2026-07-01 05:18:24'),
(38, 'BK17822889895553010', '86', 'Photo Travel 09', '311', 'Gói cưới ngoại cảnh', 5200000.00, NULL, '09:00 - 13:00', 'Hồ Chí Minh', '2026-06-24', '09:00:00', '13:00:00', NULL, 0.00, NULL, '\n\n[Lý do hủy - customer]: Khách bận đột xuất', '12000000', 0.00, 5200000.00, 2600000.00, 2600000.00, '[]', NULL, 'momo', 'completed', 'Lê Mạnh Cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-24 08:16:29', '2026-07-01 05:18:24'),
(39, 'BK17822913959608841', '86', 'Photo Travel 09', '311', 'Gói cưới ngoại cảnh', 5200000.00, NULL, '13:00 - 17:00', 'Hồ Chí Minh', '2026-06-24', '13:00:00', '17:00:00', NULL, 0.00, NULL, NULL, '12000000', 0.00, 5200000.00, 2600000.00, 2600000.00, '[]', NULL, 'bank', 'fully_paid', 'Lê Mạnh Cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-06-24 08:56:35', '2026-07-01 05:38:17'),
(40, 'BK17828846957377652', '86', 'Photo Travel 09', '295', 'Gói product basic', 1200000.00, NULL, '09:00 - 13:00', 'Hồ Chí Minh', '2026-07-01', '09:00:00', '13:00:00', NULL, 0.00, NULL, NULL, '1200000', 0.00, 1200000.00, 600000.00, 600000.00, '[]', NULL, 'momo', 'awaiting_payment', 'Lê Mạnh Cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-07-01 05:44:55', '2026-07-01 05:44:55'),
(41, 'BK17828853213781850', '79', 'Photo Gia Đình 09', '43', 'Gói Chụp ảnh gia đình 09', 2700000.00, NULL, '09:00 - 13:00', 'Hồ Chí Minh [Photos: https://drive.google.com/drive/folders/1PnA0LIYfZDMH6No7VDUog3oExarnCFrC]', '2026-07-01', '09:00:00', '13:00:00', 'Mặc định (1 người / sản phẩm)', 0.00, NULL, NULL, '2700000', 0.00, 2700000.00, 1350000.00, 1350000.00, '[]', NULL, 'momo', 'fully_paid', 'Lê Mạnh Cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-07-01 05:55:21', '2026-07-01 05:58:16'),
(42, 'BK17828876045938655', '79', 'Photo Gia Đình 09', '43', 'Gói Chụp ảnh gia đình 09', 2700000.00, NULL, '09:00 - 13:00', 'Hồ Chí Minh [Photos: https://drive.google.com/drive/folders/1PnA0LIYfZDMH6No7VDUog3oExarnCFrChttps://drive.google.com/drive/folders/1PnA0LIYfZDMH6No7VDUog3oExarnCFrC]', '2026-07-01', '09:00:00', '13:00:00', 'Mặc định (1 người / sản phẩm)', 0.00, NULL, NULL, '2700000', 0.00, 2700000.00, 1350000.00, 1350000.00, '[]', NULL, 'momo', 'completed', 'Lê Mạnh Cường', '0393839173', 'vycuonghuhu@gmail.com', 'Zalo', '2026-07-01 06:33:24', '2026-07-01 06:42:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `booking_requests`
--
ALTER TABLE `booking_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_code` (`booking_code`),
  ADD KEY `idx_booking_requests_photographer_date_time` (`photographer_id`,`shoot_date`,`shoot_time`,`shoot_end_time`),
  ADD KEY `idx_booking_requests_customer_email` (`customer_email`),
  ADD KEY `idx_booking_requests_booking_code` (`booking_code`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `booking_requests`
--
ALTER TABLE `booking_requests`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
