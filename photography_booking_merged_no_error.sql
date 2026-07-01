-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost:3306
-- Thời gian đã tạo: Th7 01, 2026 lúc 06:58 AM
-- Phiên bản máy phục vụ: 8.4.3
-- Phiên bản PHP: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ============================================================
-- MERGED SAFE IMPORT
-- File này ghép photography_booking + booking_requests mới nhất.
-- Có DROP TABLE IF EXISTS để import lại không bị lỗi trùng bảng.
-- ============================================================

CREATE DATABASE IF NOT EXISTS `photography_booking`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `photography_booking`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `system_logs`;
DROP TABLE IF EXISTS `service_package_options`;
DROP TABLE IF EXISTS `service_packages`;
DROP TABLE IF EXISTS `service_options`;
DROP TABLE IF EXISTS `service_categories`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `reports`;
DROP TABLE IF EXISTS `refund_requests`;
DROP TABLE IF EXISTS `photographer_profiles`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `password_reset_tokens`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `favorite_photographers`;
DROP TABLE IF EXISTS `booking_reviews`;
DROP TABLE IF EXISTS `booking_requests`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `ai_recommendations`;



--
-- Cơ sở dữ liệu: `photography_booking`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ai_recommendations`
--

CREATE TABLE `ai_recommendations` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `target_type` enum('photographer','package','category') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_id` int NOT NULL,
  `score` decimal(5,4) DEFAULT '0.0000',
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `model_version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bookings`
--

CREATE TABLE `bookings` (
  `id` int NOT NULL,
  `customer_id` int NOT NULL,
  `package_id` int NOT NULL,
  `booking_date` date NOT NULL,
  `event_location` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `customer_count` int DEFAULT '1',
  `shoot_start_time` time DEFAULT NULL,
  `setup_end_time` time DEFAULT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `deposit_amount` decimal(12,2) DEFAULT '0.00',
  `remaining_amount` decimal(12,2) DEFAULT '0.00',
  `payment_status` enum('unpaid','deposit_paid','fully_paid','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'unpaid',
  `delivery_status` enum('pending','in_progress','delivered') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `preview_drive_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `final_drive_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','confirmed','in_progress','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_requests`
--

CREATE TABLE `booking_requests` (
  `id` bigint NOT NULL,
  `booking_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `photographer_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `photographer_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `availability_slot_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `availability_slot_label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shoot_date` date DEFAULT NULL,
  `shoot_time` time DEFAULT NULL,
  `shoot_end_time` time DEFAULT NULL,
  `people_scale` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `people_extra` decimal(12,2) NOT NULL DEFAULT '0.00',
  `scene` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `concept` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `budget` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `add_on_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `estimated_total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `deposit_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `remaining_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `add_ons` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `reference_file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'momo',
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'awaiting_payment',
  `customer_full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_channel` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `booking_requests`
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

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_reviews`
--

CREATE TABLE `booking_reviews` (
  `id` int NOT NULL,
  `booking_id` int NOT NULL,
  `rating` tinyint NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_hidden` tinyint(1) DEFAULT '0',
  `reported_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `favorite_photographers`
--

CREATE TABLE `favorite_photographers` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `photographer_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `messages`
--

CREATE TABLE `messages` (
  `id` int NOT NULL,
  `booking_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sender_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sender_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `sender_role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `receiver_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `messages`
--

INSERT INTO `messages` (`id`, `booking_code`, `sender_id`, `sender_name`, `sender_role`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES
(1, 'BK17815448413912619', 'vycuonghuhu@gmail.com', 'lê mạnh cường', 'customer', '79', 'helo', 0, '2026-06-15 17:49:18'),
(2, 'BK17815448413912619', '79', 'nguyễn thiện vũ', 'photographer', 'vycuonghuhu@gmail.com', 'lô', 0, '2026-06-15 17:49:58'),
(3, 'BK17815448413912619', 'vycuonghuhu@gmail.com', 'lê mạnh cường', 'customer', '79', 'lô', 0, '2026-06-15 17:50:08'),
(4, 'BK17815448413912619', '79', 'nguyễn thiện vũ', 'photographer', 'vycuonghuhu@gmail.com', 'lô', 0, '2026-06-15 17:50:18'),
(5, 'BK17815492814376055', 'vycuonghuhu@gmail.com', 'lê mạnh cường', 'customer', '79', 'lô cu', 0, '2026-06-15 18:55:00'),
(6, 'BK17815492814376055', '79', 'nguyễn thiện vũ', 'photographer', 'vycuonghuhu@gmail.com', 'oke', 0, '2026-06-15 18:55:19'),
(7, 'BK17815498899996718', '79', 'nguyễn thiện vũ', 'photographer', 'vycuonghuhu@gmail.com', 'lô', 0, '2026-06-15 19:00:02'),
(8, 'BK17815498899996718', 'vycuonghuhu@gmail.com', 'lê mạnh cường', 'customer', '79', 'lô', 0, '2026-06-15 19:00:26'),
(9, 'BK17816218165653677', 'vycuonghuhu@gmail.com', 'lê mạnh cường', 'customer', '38', 'con c', 0, '2026-06-16 14:57:56'),
(10, 'BK17820840801958467', 'test@sudion.vn', 'Khách test', 'customer', '86', 'Hello photographer', 0, '2026-06-21 23:38:37');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`id`, `email`, `token`, `expires_at`, `used_at`, `created_at`) VALUES
(1, 'tuankiet@test.com', 'b4781f31b6930243d4fbaa9ef73f2ec7e341c794043ffc0cab62060b2b4a8f72', '2026-06-22 07:12:26', '2026-06-22 06:49:04', '2026-06-21 23:42:26');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

CREATE TABLE `payments` (
  `id` int NOT NULL,
  `transaction_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `platform_fee` decimal(12,2) DEFAULT '0.00',
  `net_amount` decimal(12,2) DEFAULT NULL,
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `gateway_response` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `payments`
--

INSERT INTO `payments` (`id`, `transaction_id`, `booking_code`, `amount`, `platform_fee`, `net_amount`, `payment_method`, `payment_type`, `status`, `gateway_response`, `created_at`, `updated_at`) VALUES
(1, 'TXN_001', 'BK17811902759856320', 3750000.00, 75000.00, 3675000.00, 'MoMo', 'deposit', 'completed', NULL, '2026-06-24 07:29:52', '2026-06-24 07:29:52'),
(2, 'TXN_002', 'BK17811907029642206', 3200000.00, 64000.00, 3136000.00, 'VNPAY', 'full_payment', 'completed', NULL, '2026-06-24 07:29:52', '2026-06-24 07:29:52'),
(3, 'TXN_003', 'BK17812447937792189', 1440000.00, 28800.00, 1411200.00, 'ZaloPay', 'deposit', 'completed', NULL, '2026-06-24 07:29:52', '2026-06-24 07:29:52'),
(4, 'TXN_20260624_001', 'BK20260624', 1000000.00, 20000.00, 980000.00, 'MoMo', 'deposit', 'completed', NULL, '2026-06-24 11:24:13', '2026-06-24 11:24:13');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `photographer_profiles`
--

CREATE TABLE `photographer_profiles` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `started_year` year DEFAULT NULL,
  `active_area` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_history` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `photographer_type` enum('freelance','studio','agency') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'freelance',
  `max_booking_per_day` int DEFAULT '1',
  `avg_rating` decimal(3,2) DEFAULT '0.00',
  `verification_status` enum('pending','verified','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `photographer_profiles`
--

INSERT INTO `photographer_profiles` (`id`, `user_id`, `bio`, `started_year`, `active_area`, `work_history`, `photographer_type`, `max_booking_per_day`, `avg_rating`, `verification_status`, `created_at`) VALUES
(1, 2, 'Chuyên chụp ảnh cưới, couple, ngoại cảnh. Phong cách tự nhiên, cảm xúc và chỉn chu.', '2020', 'Đà Lạt, Lâm Đồng', NULL, 'freelance', 2, 4.90, 'verified', '2026-06-10 16:05:38'),
(2, 3, 'Photographer chuyên portrait, sự kiện và editorial cá nhân.', '2019', 'Quận 3, TP.HCM', NULL, 'studio', 1, 4.90, 'verified', '2026-06-10 16:05:38'),
(3, 4, 'Chuyên chụp ảnh cưới biển, outdoor và concept nhẹ nhàng.', '2021', 'Mỹ Khê, Đà Nẵng', NULL, 'freelance', 2, 4.70, 'verified', '2026-06-10 16:05:38'),
(4, 5, 'Chuyên chụp kỉ yếu học sinh, sinh viên.', '2022', 'Cần Thơ, Việt Nam', NULL, 'freelance', 3, 4.70, 'verified', '2026-06-10 16:05:38'),
(5, 9, 'Chuyên chụp ảnh thương mại. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2017', 'Hà Nội, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh thương mại, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 2, 4.60, 'verified', '2026-06-10 17:02:01'),
(6, 18, 'Chuyên chụp ảnh thương mại. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2018', 'Đà Nẵng, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh thương mại, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 3, 4.70, 'verified', '2026-06-10 17:02:01'),
(7, 27, 'Chuyên chụp ảnh thương mại. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2019', 'Đà Lạt, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh thương mại, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 4, 4.80, 'verified', '2026-06-10 17:02:01'),
(8, 36, 'Chuyên chụp ảnh thương mại. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2020', 'Cần Thơ, Việt Nam', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh thương mại, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 1, 4.90, 'verified', '2026-06-10 17:02:01'),
(9, 45, 'Chuyên chụp ảnh thương mại. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2021', 'Vĩnh Long, Việt Nam', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh thương mại, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 2, 4.50, 'verified', '2026-06-10 17:02:01'),
(10, 54, 'Chuyên chụp ảnh thương mại. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2022', 'Huế, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh thương mại, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 3, 4.60, 'verified', '2026-06-10 17:02:01'),
(11, 63, 'Chuyên chụp ảnh thương mại. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2023', 'Ho Chi Minh City, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh thương mại, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 4, 4.70, 'verified', '2026-06-10 17:02:01'),
(12, 72, 'Chuyên chụp ảnh thương mại. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2016', 'Hà Nội, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh thương mại, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 1, 4.80, 'verified', '2026-06-10 17:02:01'),
(13, 81, 'Chuyên chụp ảnh thương mại. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2017', 'Đà Nẵng, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh thương mại, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 2, 4.90, 'verified', '2026-06-10 17:02:01'),
(14, 90, 'Chuyên chụp ảnh thương mại. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2018', 'Đà Lạt, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh thương mại, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 3, 4.50, 'verified', '2026-06-10 17:02:01'),
(15, 11, 'Chuyên chụp couple, street portrait và lifestyle trong phố.', '2017', 'TP.HCM', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh đôi, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 2, 4.80, 'verified', '2026-06-10 17:02:01'),
(16, 20, 'Studio chuyên ảnh couple tối giản, ảnh profile và concept studio.', '2018', 'Cầu Giấy, Hà Nội', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh đôi, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 3, 4.70, 'verified', '2026-06-10 17:02:01'),
(17, 29, 'Chuyên chụp ảnh đôi. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2019', 'Đà Lạt, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh đôi, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 4, 4.80, 'verified', '2026-06-10 17:02:01'),
(18, 38, 'Chuyên chụp ảnh đôi. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2020', 'Cần Thơ, Việt Nam', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh đôi, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 1, 4.90, 'verified', '2026-06-10 17:02:01'),
(19, 47, 'Chuyên chụp ảnh đôi. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2021', 'Vĩnh Long, Việt Nam', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh đôi, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 2, 4.50, 'verified', '2026-06-10 17:02:01'),
(20, 56, 'Chuyên chụp ảnh đôi. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2022', 'Huế, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh đôi, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 3, 4.60, 'verified', '2026-06-10 17:02:01'),
(21, 65, 'Chuyên chụp ảnh đôi. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2023', 'Ho Chi Minh City, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh đôi, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 4, 4.70, 'verified', '2026-06-10 17:02:01'),
(22, 74, 'Chuyên chụp ảnh đôi. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2016', 'Hà Nội, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh đôi, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 1, 4.80, 'verified', '2026-06-10 17:02:01'),
(23, 83, 'Chuyên chụp ảnh đôi. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2017', 'Đà Nẵng, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh đôi, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 2, 4.90, 'verified', '2026-06-10 17:02:01'),
(24, 92, 'Chuyên chụp ảnh đôi. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2018', 'Đà Lạt, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh đôi, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 3, 4.50, 'verified', '2026-06-10 17:02:01'),
(25, 8, 'Chuyên chụp ảnh sự kiện. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2017', 'Hà Nội, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh sự kiện, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 2, 4.60, 'verified', '2026-06-10 17:02:01'),
(26, 17, 'Chuyên chụp ảnh sự kiện. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2018', 'Đà Nẵng, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh sự kiện, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 3, 4.70, 'verified', '2026-06-10 17:02:01'),
(27, 26, 'Chuyên chụp ảnh sự kiện. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2019', 'Đà Lạt, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh sự kiện, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 4, 4.80, 'verified', '2026-06-10 17:02:01'),
(28, 35, 'Chuyên chụp ảnh sự kiện. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2020', 'Cần Thơ, Việt Nam', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh sự kiện, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 1, 4.90, 'verified', '2026-06-10 17:02:01'),
(29, 44, 'Chuyên chụp ảnh sự kiện. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2021', 'Vĩnh Long, Việt Nam', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh sự kiện, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 2, 4.50, 'verified', '2026-06-10 17:02:01'),
(30, 53, 'Chuyên chụp ảnh sự kiện. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2022', 'Huế, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh sự kiện, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 3, 4.60, 'verified', '2026-06-10 17:02:01'),
(31, 62, 'Chuyên chụp ảnh sự kiện. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2023', 'Ho Chi Minh City, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh sự kiện, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 4, 4.70, 'verified', '2026-06-10 17:02:01'),
(32, 71, 'Chuyên chụp ảnh sự kiện. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2016', 'Hà Nội, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh sự kiện, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 1, 4.80, 'verified', '2026-06-10 17:02:01'),
(33, 80, 'Chuyên chụp ảnh sự kiện. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2017', 'Đà Nẵng, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh sự kiện, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 2, 4.90, 'verified', '2026-06-10 17:02:01'),
(34, 89, 'Chuyên chụp ảnh sự kiện. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2018', 'Đà Lạt, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh sự kiện, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 3, 4.50, 'verified', '2026-06-10 17:02:01'),
(35, 7, 'Chuyên chụp ảnh gia đình. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2017', 'Hà Nội, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh gia đình, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 2, 4.60, 'verified', '2026-06-10 17:02:01'),
(36, 16, 'Chuyên chụp ảnh gia đình. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2018', 'Đà Nẵng, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh gia đình, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 3, 4.70, 'verified', '2026-06-10 17:02:01'),
(37, 25, 'Chuyên chụp ảnh gia đình. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2019', 'Đà Lạt, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh gia đình, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 4, 4.80, 'verified', '2026-06-10 17:02:01'),
(38, 34, 'Chuyên chụp ảnh gia đình. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2020', 'Cần Thơ, Việt Nam', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh gia đình, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 1, 4.90, 'verified', '2026-06-10 17:02:01'),
(39, 43, 'Chuyên chụp ảnh gia đình. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2021', 'Vĩnh Long, Việt Nam', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh gia đình, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 2, 4.50, 'verified', '2026-06-10 17:02:01'),
(40, 52, 'Chuyên chụp ảnh gia đình. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2022', 'Huế, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh gia đình, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 3, 4.60, 'verified', '2026-06-10 17:02:01'),
(41, 61, 'Chuyên chụp ảnh gia đình. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2023', 'Ho Chi Minh City, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh gia đình, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 4, 4.70, 'verified', '2026-06-10 17:02:01'),
(42, 70, 'Chuyên chụp ảnh gia đình. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2016', 'Hà Nội, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh gia đình, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 1, 4.80, 'verified', '2026-06-10 17:02:01'),
(43, 79, 'Chuyên chụp ảnh gia đình. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2017', 'Đà Nẵng, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh gia đình, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 2, 4.90, 'verified', '2026-06-10 17:02:01'),
(44, 88, 'Chuyên chụp ảnh gia đình. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2018', 'Đà Lạt, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh gia đình, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 3, 4.50, 'verified', '2026-06-10 17:02:01'),
(45, 13, 'Chuyên chụp food & product. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2017', 'Hà Nội, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp food & product, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 2, 4.60, 'verified', '2026-06-10 17:02:01'),
(46, 22, 'Chuyên chụp food & product. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2018', 'Đà Nẵng, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp food & product, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 3, 4.70, 'verified', '2026-06-10 17:02:01'),
(47, 31, 'Chuyên chụp food & product. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2019', 'Đà Lạt, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp food & product, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 4, 4.80, 'verified', '2026-06-10 17:02:01'),
(48, 40, 'Chuyên chụp food & product. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2020', 'Cần Thơ, Việt Nam', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp food & product, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 1, 4.90, 'verified', '2026-06-10 17:02:01'),
(49, 49, 'Chuyên chụp food & product. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2021', 'Vĩnh Long, Việt Nam', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp food & product, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 2, 4.50, 'verified', '2026-06-10 17:02:01'),
(50, 58, 'Chuyên chụp food & product. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2022', 'Huế, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp food & product, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 3, 4.60, 'verified', '2026-06-10 17:02:01'),
(51, 67, 'Chuyên chụp food & product. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2023', 'Ho Chi Minh City, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp food & product, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 4, 4.70, 'verified', '2026-06-10 17:02:01'),
(52, 76, 'Chuyên chụp food & product. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2016', 'Hà Nội, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp food & product, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 1, 4.80, 'verified', '2026-06-10 17:02:01'),
(53, 85, 'Chuyên chụp food & product. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2017', 'Đà Nẵng, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp food & product, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 2, 4.90, 'verified', '2026-06-10 17:02:01'),
(54, 94, 'Chuyên chụp food & product. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2018', 'Đà Lạt, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp food & product, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 3, 4.50, 'verified', '2026-06-10 17:02:01'),
(55, 10, 'Chuyên chụp ảnh cá nhân. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2017', 'Hà Nội, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cá nhân, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 2, 4.60, 'verified', '2026-06-10 17:02:01'),
(56, 19, 'Chuyên chụp ảnh cá nhân. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2018', 'Đà Nẵng, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cá nhân, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 3, 4.70, 'verified', '2026-06-10 17:02:01'),
(57, 28, 'Studio chuyên vintage film portrait và ảnh cá nhân phong cách hoài cổ.', '2019', 'Đà Nẵng', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cá nhân, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 4, 4.90, 'verified', '2026-06-10 17:02:01'),
(58, 37, 'Chuyên chụp ảnh cá nhân. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2020', 'Cần Thơ, Việt Nam', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cá nhân, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 1, 4.90, 'verified', '2026-06-10 17:02:01'),
(59, 46, 'Chuyên chụp ảnh cá nhân. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2021', 'Vĩnh Long, Việt Nam', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cá nhân, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 2, 4.50, 'verified', '2026-06-10 17:02:01'),
(60, 55, 'Chuyên chụp ảnh cá nhân. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2022', 'Huế, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cá nhân, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 3, 4.60, 'verified', '2026-06-10 17:02:01'),
(61, 64, 'Chuyên chụp ảnh cá nhân. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2023', 'Ho Chi Minh City, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cá nhân, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 4, 4.70, 'verified', '2026-06-10 17:02:01'),
(62, 73, 'Chuyên chụp ảnh cá nhân. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2016', 'Hà Nội, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cá nhân, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 1, 4.80, 'verified', '2026-06-10 17:02:01'),
(63, 82, 'Chuyên chụp ảnh cá nhân. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2017', 'Đà Nẵng, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cá nhân, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 2, 4.90, 'verified', '2026-06-10 17:02:01'),
(64, 91, 'Chuyên chụp ảnh cá nhân. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2018', 'Đà Lạt, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cá nhân, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 3, 4.50, 'verified', '2026-06-10 17:02:01'),
(65, 14, 'Chuyên chụp travel. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2017', 'Hà Nội, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp travel, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 2, 4.60, 'verified', '2026-06-10 17:02:01'),
(66, 23, 'Chuyên chụp travel. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2018', 'Đà Nẵng, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp travel, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 3, 4.70, 'verified', '2026-06-10 17:02:01'),
(67, 32, 'Chuyên chụp travel. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2019', 'Đà Lạt, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp travel, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 4, 4.80, 'verified', '2026-06-10 17:02:01'),
(68, 41, 'Chuyên chụp travel. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2020', 'Cần Thơ, Việt Nam', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp travel, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 1, 4.90, 'verified', '2026-06-10 17:02:01'),
(69, 50, 'Chuyên chụp travel. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2021', 'Vĩnh Long, Việt Nam', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp travel, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 2, 4.50, 'verified', '2026-06-10 17:02:01'),
(70, 59, 'Chuyên chụp travel. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2022', 'Huế, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp travel, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 3, 4.60, 'verified', '2026-06-10 17:02:01'),
(71, 68, 'Chuyên chụp travel. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2023', 'Ho Chi Minh City, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp travel, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 4, 4.70, 'verified', '2026-06-10 17:02:01'),
(72, 77, 'Chuyên chụp travel. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2016', 'Hà Nội, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp travel, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 1, 4.80, 'verified', '2026-06-10 17:02:01'),
(73, 86, 'Chuyên chụp travel. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2017', 'Đà Nẵng, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp travel, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 2, 5.00, 'verified', '2026-06-10 17:02:01'),
(74, 95, 'Chuyên chụp travel. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2018', 'Đà Lạt, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp travel, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 3, 4.50, 'verified', '2026-06-10 17:02:01'),
(75, 6, 'Chuyên chụp ảnh cưới. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2017', 'Hà Nội, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cưới, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 2, 4.60, 'verified', '2026-06-10 17:02:01'),
(76, 15, 'Chuyên chụp ảnh cưới. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2018', 'Đà Nẵng, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cưới, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 3, 4.70, 'verified', '2026-06-10 17:02:01'),
(77, 24, 'Chuyên chụp ảnh cưới. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2019', 'Đà Lạt, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cưới, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 4, 4.80, 'verified', '2026-06-10 17:02:01'),
(78, 33, 'Chuyên chụp ảnh cưới. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2020', 'Cần Thơ, Việt Nam', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cưới, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 1, 4.90, 'verified', '2026-06-10 17:02:01'),
(79, 42, 'Chuyên chụp ảnh cưới. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2021', 'Vĩnh Long, Việt Nam', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cưới, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 2, 4.50, 'verified', '2026-06-10 17:02:01'),
(80, 51, 'Chuyên chụp ảnh cưới. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2022', 'Huế, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cưới, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 3, 4.60, 'verified', '2026-06-10 17:02:01'),
(81, 60, 'Chuyên chụp ảnh cưới. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2023', 'Ho Chi Minh City, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cưới, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 4, 4.70, 'verified', '2026-06-10 17:02:01'),
(82, 69, 'Chuyên chụp ảnh cưới. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2016', 'Hà Nội, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cưới, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 1, 4.80, 'verified', '2026-06-10 17:02:01'),
(83, 78, 'Chuyên chụp ảnh cưới. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2017', 'Đà Nẵng, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cưới, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 2, 4.90, 'verified', '2026-06-10 17:02:01'),
(84, 87, 'Chuyên chụp ảnh cưới. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2018', 'Đà Lạt, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp ảnh cưới, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 3, 4.50, 'verified', '2026-06-10 17:02:01'),
(85, 12, 'Chuyên chụp kỉ yếu. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2017', 'Hà Nội, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp kỉ yếu, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 2, 4.60, 'verified', '2026-06-10 17:02:01'),
(86, 21, 'Chuyên chụp kỉ yếu. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2018', 'Đà Nẵng, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp kỉ yếu, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 3, 4.70, 'verified', '2026-06-10 17:02:01'),
(87, 30, 'Chuyên chụp kỉ yếu. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2019', 'Đà Lạt, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp kỉ yếu, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 4, 4.80, 'verified', '2026-06-10 17:02:01'),
(88, 39, 'Chuyên chụp kỉ yếu. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2020', 'Cần Thơ, Việt Nam', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp kỉ yếu, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 1, 4.90, 'verified', '2026-06-10 17:02:01'),
(89, 48, 'Chuyên chụp kỉ yếu. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2021', 'Vĩnh Long, Việt Nam', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp kỉ yếu, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 2, 4.50, 'verified', '2026-06-10 17:02:01'),
(90, 57, 'Chuyên chụp kỉ yếu. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2022', 'Huế, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp kỉ yếu, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 3, 4.60, 'verified', '2026-06-10 17:02:01'),
(91, 66, 'Chuyên chụp kỉ yếu. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2023', 'Ho Chi Minh City, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp kỉ yếu, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 4, 4.70, 'verified', '2026-06-10 17:02:01'),
(92, 75, 'Chuyên chụp kỉ yếu. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2016', 'Hà Nội, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp kỉ yếu, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'agency', 1, 4.80, 'verified', '2026-06-10 17:02:01'),
(93, 84, 'Chuyên chụp kỉ yếu. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2017', 'Đà Nẵng, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp kỉ yếu, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'freelance', 2, 5.00, 'verified', '2026-06-10 17:02:01'),
(94, 93, 'Chuyên chụp kỉ yếu. Có kinh nghiệm xử lý concept, ánh sáng, bố cục và chỉnh sửa ảnh theo yêu cầu khách hàng.', '2018', 'Đà Lạt, VN', 'Đã thực hiện nhiều dự án thuộc nhóm Chụp kỉ yếu, bao gồm chụp ngoại cảnh, studio, chỉnh sửa ảnh và bàn giao album.', 'studio', 3, 4.50, 'verified', '2026-06-10 17:02:01'),
(95, 134, '', NULL, 'zz', NULL, 'freelance', 1, 0.00, 'verified', '2026-06-24 08:03:14');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `refund_requests`
--

CREATE TABLE `refund_requests` (
  `id` int NOT NULL,
  `transaction_id` int NOT NULL,
  `refund_amount` decimal(12,2) NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','approved','rejected','processed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `refund_transaction_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `admin_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reports`
--

CREATE TABLE `reports` (
  `id` int NOT NULL,
  `report_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reporter_user_id` int DEFAULT NULL,
  `target_type` enum('Photographer','Booking','User','Content') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `evidence` json DEFAULT NULL,
  `priority` enum('low','medium','high') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `status` enum('pending','reviewing','resolved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `admin_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `resolution` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `reports`
--

INSERT INTO `reports` (`id`, `report_id`, `reporter_user_id`, `target_type`, `target_id`, `target_name`, `category`, `description`, `evidence`, `priority`, `status`, `admin_note`, `resolution`, `created_at`, `updated_at`) VALUES
(1, 'RPT_001', 1, 'Photographer', '1023', 'Minh Tuấn Studio', 'Chất lượng dịch vụ', 'Photographer giao ảnh trễ hơn 2 tuần', NULL, 'high', 'pending', 'ZZazzzz', NULL, '2026-06-24 07:29:59', '2026-06-28 14:10:43'),
(2, 'RPT_002', 2, 'Photographer', '1122', 'Khang Pham', 'Gian lận', 'Yêu cầu thanh toán ngoài nền tảng', NULL, 'high', 'reviewing', NULL, NULL, '2026-06-24 07:29:59', '2026-06-24 07:29:59'),
(3, 'RPT_003', 3, 'Booking', 'BK20241124', 'Booking #BK20241124', 'Hành vi không phù hợp', 'Hành vi thiếu chuyên nghiệp', NULL, 'medium', 'resolved', NULL, NULL, '2026-06-24 07:29:59', '2026-06-24 07:29:59');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint NOT NULL,
  `booking_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `photographer_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` int NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `reviews`
--

INSERT INTO `reviews` (`id`, `booking_code`, `photographer_id`, `customer_email`, `customer_name`, `rating`, `comment`, `created_at`) VALUES
(1, 'BK17812512398256235', '86', 'vycuonghuhu@gmail.com', 'lê mạnh cường', 5, 'dvdsgsdg', '2026-06-12 08:05:00'),
(2, 'BK17812518105327268', '84', 'vycuonghuhu@gmail.com', 'vũ kiên hôn', 5, 'như qq', '2026-06-12 08:13:05');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `service_categories`
--

CREATE TABLE `service_categories` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `service_categories`
--

INSERT INTO `service_categories` (`id`, `name`, `slug`, `description`, `created_at`) VALUES
(1, 'Chụp ảnh cưới', 'wedding', 'Dịch vụ chụp ảnh cưới trọn gói', '2026-05-28 03:22:08'),
(2, 'Chụp ảnh gia đình', 'family', 'Chụp ảnh gia đình, kỷ niệm', '2026-05-28 03:22:08'),
(3, 'Chụp ảnh sự kiện', 'event', 'Hội nghị, sinh nhật, lễ tốt nghiệp', '2026-05-28 03:22:08'),
(4, 'Chụp ảnh thương mại', 'chup-ảnh-thuơng-mại', 'Sản phẩm, doanh nghiệp, quảng cáo', '2026-05-28 03:22:08'),
(5, 'Chụp ảnh cá nhân', 'chup-ảnh-cá-nhân', 'Portrait, lookbook, profile', '2026-05-28 03:22:08'),
(6, 'Chụp ảnh đôi', 'couple', 'Dịch vụ chụp ảnh đôi, couple, kỷ niệm tình yêu', '2026-06-10 16:04:45'),
(7, 'Chụp kỉ yếu', 'chup-kỉ-yếu', 'Dịch vụ chụp ảnh kỉ yếu học sinh, sinh viên', '2026-06-10 16:04:45'),
(8, 'Chụp food & product', 'chup-food-&-product', 'Dịch vụ chụp món ăn, sản phẩm, thương mại', '2026-06-10 16:04:45'),
(9, 'Chụp travel', 'travel', 'Dịch vụ chụp ảnh du lịch, ngoại cảnh', '2026-06-10 16:04:45'),
(10, 'Chụp sự kiện', 'event', 'Dịch vụ chụp sự kiện, hội nghị, sinh nhật, tiệc cá nhân.', '2026-06-12 05:57:48');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `service_options`
--

CREATE TABLE `service_options` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `service_options`
--

INSERT INTO `service_options` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Chỉnh sửa màu sắc nâng cao', 'Color grading chuyên nghiệp', '2026-05-28 03:22:08'),
(2, 'Album in ấn', 'Album ảnh in cao cấp', '2026-05-28 03:22:08'),
(3, 'Video highlight', 'Video tóm tắt sự kiện', '2026-05-28 03:22:08'),
(4, 'Drone quay flycam', 'Quay từ trên cao bằng drone', '2026-05-28 03:22:08'),
(5, 'Trang điểm & tạo kiểu', 'Dịch vụ makeup đi kèm', '2026-05-28 03:22:08'),
(6, 'Thuê trang phục', 'Cho thuê trang phục chụp ảnh', '2026-05-28 03:22:08');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `service_packages`
--

CREATE TABLE `service_packages` (
  `id` int NOT NULL,
  `photographer_id` int NOT NULL,
  `category_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `portfolio_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `add_ons` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `distance_km` decimal(5,2) DEFAULT '0.00',
  `review_count` int DEFAULT '0',
  `verified` tinyint(1) DEFAULT '0',
  `next_slot` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int DEFAULT NULL COMMENT 'Duration in minutes',
  `worker_count` int DEFAULT '1',
  `max_customer_count` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `service_packages`
--

INSERT INTO `service_packages` (`id`, `photographer_id`, `category_id`, `name`, `price`, `description`, `image_url`, `portfolio_images`, `add_ons`, `distance_km`, `review_count`, `verified`, `next_slot`, `duration`, `worker_count`, `max_customer_count`, `created_at`) VALUES
(1, 2, 3, 'Gói chụp sự kiện cơ bản', 1000000.00, 'Chụp sự kiện 2 giờ, bàn giao ảnh đã chỉnh màu.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 50, '2026-06-10 16:05:49'),
(2, 3, 1, 'Gói chụp ảnh cưới cơ bản', 5000000.00, 'Chụp ảnh cưới ngoại cảnh, chỉnh sửa ảnh, hỗ trợ album.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 2, '2026-06-10 16:05:49'),
(3, 4, 6, 'Gói chụp ảnh đôi', 1500000.00, 'Chụp couple ngoại cảnh, chỉnh màu ảnh.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 2, '2026-06-10 16:05:49'),
(4, 5, 7, 'Gói chụp kỉ yếu nhóm', 2000000.00, 'Chụp kỉ yếu lớp hoặc nhóm bạn.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 2, 40, '2026-06-10 16:05:49'),
(5, 9, 4, 'Gói Chụp ảnh thương mại 01', 2300000.00, 'Gói dịch vụ Chụp ảnh thương mại dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 20, '2026-06-10 17:02:01'),
(6, 18, 4, 'Gói Chụp ảnh thương mại 02', 2400000.00, 'Gói dịch vụ Chụp ảnh thương mại dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 210, 1, 20, '2026-06-10 17:02:01'),
(7, 27, 4, 'Gói Chụp ảnh thương mại 03', 2500000.00, 'Gói dịch vụ Chụp ảnh thương mại dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-10 17:02:01'),
(8, 36, 4, 'Gói Chụp ảnh thương mại 04', 2600000.00, 'Gói dịch vụ Chụp ảnh thương mại dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 20, '2026-06-10 17:02:01'),
(9, 45, 4, 'Gói Chụp ảnh thương mại 05', 2700000.00, 'Gói dịch vụ Chụp ảnh thương mại dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 210, 1, 20, '2026-06-10 17:02:01'),
(10, 54, 4, 'Gói Chụp ảnh thương mại 06', 2800000.00, 'Gói dịch vụ Chụp ảnh thương mại dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-10 17:02:01'),
(11, 63, 4, 'Gói Chụp ảnh thương mại 07', 2900000.00, 'Gói dịch vụ Chụp ảnh thương mại dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 20, '2026-06-10 17:02:01'),
(12, 72, 4, 'Gói Chụp ảnh thương mại 08', 3000000.00, 'Gói dịch vụ Chụp ảnh thương mại dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 210, 1, 20, '2026-06-10 17:02:01'),
(13, 81, 4, 'Gói Chụp ảnh thương mại 09', 3100000.00, 'Gói dịch vụ Chụp ảnh thương mại dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-10 17:02:01'),
(14, 90, 4, 'Gói Chụp ảnh thương mại 10', 3200000.00, 'Gói dịch vụ Chụp ảnh thương mại dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 20, '2026-06-10 17:02:01'),
(15, 11, 6, 'Gói Chụp ảnh đôi 01', 1600000.00, 'Gói dịch vụ Chụp ảnh đôi dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 2, '2026-06-10 17:02:01'),
(16, 20, 6, 'Gói Chụp ảnh đôi 02', 1700000.00, 'Gói dịch vụ Chụp ảnh đôi dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 2, '2026-06-10 17:02:01'),
(17, 29, 6, 'Gói Chụp ảnh đôi 03', 1800000.00, 'Gói dịch vụ Chụp ảnh đôi dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 2, '2026-06-10 17:02:01'),
(18, 38, 6, 'Gói Chụp ảnh đôi 04', 1900000.00, 'Gói dịch vụ Chụp ảnh đôi dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 2, '2026-06-10 17:02:01'),
(19, 47, 6, 'Gói Chụp ảnh đôi 05', 2000000.00, 'Gói dịch vụ Chụp ảnh đôi dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 2, '2026-06-10 17:02:01'),
(20, 56, 6, 'Gói Chụp ảnh đôi 06', 2100000.00, 'Gói dịch vụ Chụp ảnh đôi dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 2, '2026-06-10 17:02:01'),
(21, 65, 6, 'Gói Chụp ảnh đôi 07', 2200000.00, 'Gói dịch vụ Chụp ảnh đôi dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 2, '2026-06-10 17:02:01'),
(22, 74, 6, 'Gói Chụp ảnh đôi 08', 2300000.00, 'Gói dịch vụ Chụp ảnh đôi dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 2, '2026-06-10 17:02:01'),
(23, 83, 6, 'Gói Chụp ảnh đôi 09', 2400000.00, 'Gói dịch vụ Chụp ảnh đôi dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 2, '2026-06-10 17:02:01'),
(24, 92, 6, 'Gói Chụp ảnh đôi 10', 2500000.00, 'Gói dịch vụ Chụp ảnh đôi dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 2, '2026-06-10 17:02:01'),
(25, 8, 3, 'Gói Chụp ảnh sự kiện 01', 1100000.00, 'Gói dịch vụ Chụp ảnh sự kiện dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 2, 80, '2026-06-10 17:02:01'),
(26, 17, 3, 'Gói Chụp ảnh sự kiện 02', 1200000.00, 'Gói dịch vụ Chụp ảnh sự kiện dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 2, 80, '2026-06-10 17:02:01'),
(27, 26, 3, 'Gói Chụp ảnh sự kiện 03', 1300000.00, 'Gói dịch vụ Chụp ảnh sự kiện dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 2, 80, '2026-06-10 17:02:01'),
(28, 35, 3, 'Gói Chụp ảnh sự kiện 04', 1400000.00, 'Gói dịch vụ Chụp ảnh sự kiện dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 2, 80, '2026-06-10 17:02:01'),
(29, 44, 3, 'Gói Chụp ảnh sự kiện 05', 1500000.00, 'Gói dịch vụ Chụp ảnh sự kiện dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 2, 80, '2026-06-10 17:02:01'),
(30, 53, 3, 'Gói Chụp ảnh sự kiện 06', 1600000.00, 'Gói dịch vụ Chụp ảnh sự kiện dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 2, 80, '2026-06-10 17:02:01'),
(31, 62, 3, 'Gói Chụp ảnh sự kiện 07', 1700000.00, 'Gói dịch vụ Chụp ảnh sự kiện dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 2, 80, '2026-06-10 17:02:01'),
(32, 71, 3, 'Gói Chụp ảnh sự kiện 08', 1800000.00, 'Gói dịch vụ Chụp ảnh sự kiện dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 2, 80, '2026-06-10 17:02:01'),
(33, 80, 3, 'Gói Chụp ảnh sự kiện 09', 1900000.00, 'Gói dịch vụ Chụp ảnh sự kiện dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 2, 80, '2026-06-10 17:02:01'),
(34, 89, 3, 'Gói Chụp ảnh sự kiện 10', 2000000.00, 'Gói dịch vụ Chụp ảnh sự kiện dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 2, 80, '2026-06-10 17:02:01'),
(35, 7, 2, 'Gói Chụp ảnh gia đình 01', 1900000.00, 'Gói dịch vụ Chụp ảnh gia đình dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 8, '2026-06-10 17:02:01'),
(36, 16, 2, 'Gói Chụp ảnh gia đình 02', 2000000.00, 'Gói dịch vụ Chụp ảnh gia đình dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 8, '2026-06-10 17:02:01'),
(37, 25, 2, 'Gói Chụp ảnh gia đình 03', 2100000.00, 'Gói dịch vụ Chụp ảnh gia đình dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-10 17:02:01'),
(38, 34, 2, 'Gói Chụp ảnh gia đình 04', 2200000.00, 'Gói dịch vụ Chụp ảnh gia đình dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 8, '2026-06-10 17:02:01'),
(39, 43, 2, 'Gói Chụp ảnh gia đình 05', 2300000.00, 'Gói dịch vụ Chụp ảnh gia đình dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 8, '2026-06-10 17:02:01'),
(40, 52, 2, 'Gói Chụp ảnh gia đình 06', 2400000.00, 'Gói dịch vụ Chụp ảnh gia đình dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-10 17:02:01'),
(41, 61, 2, 'Gói Chụp ảnh gia đình 07', 2500000.00, 'Gói dịch vụ Chụp ảnh gia đình dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 8, '2026-06-10 17:02:01'),
(42, 70, 2, 'Gói Chụp ảnh gia đình 08', 2600000.00, 'Gói dịch vụ Chụp ảnh gia đình dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 8, '2026-06-10 17:02:01'),
(43, 79, 2, 'Gói Chụp ảnh gia đình 09', 2700000.00, 'Gói dịch vụ Chụp ảnh gia đình dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-10 17:02:01'),
(44, 88, 2, 'Gói Chụp ảnh gia đình 10', 2800000.00, 'Gói dịch vụ Chụp ảnh gia đình dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 8, '2026-06-10 17:02:01'),
(45, 13, 8, 'Gói Chụp food & product 01', 1300000.00, 'Gói dịch vụ Chụp food & product dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-10 17:02:01'),
(46, 22, 8, 'Gói Chụp food & product 02', 1400000.00, 'Gói dịch vụ Chụp food & product dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 20, '2026-06-10 17:02:01'),
(47, 31, 8, 'Gói Chụp food & product 03', 1500000.00, 'Gói dịch vụ Chụp food & product dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 20, '2026-06-10 17:02:01'),
(48, 40, 8, 'Gói Chụp food & product 04', 1600000.00, 'Gói dịch vụ Chụp food & product dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-10 17:02:01'),
(49, 49, 8, 'Gói Chụp food & product 05', 1700000.00, 'Gói dịch vụ Chụp food & product dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 20, '2026-06-10 17:02:01'),
(50, 58, 8, 'Gói Chụp food & product 06', 1800000.00, 'Gói dịch vụ Chụp food & product dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 20, '2026-06-10 17:02:01'),
(51, 67, 8, 'Gói Chụp food & product 07', 1900000.00, 'Gói dịch vụ Chụp food & product dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-10 17:02:01'),
(52, 76, 8, 'Gói Chụp food & product 08', 2000000.00, 'Gói dịch vụ Chụp food & product dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 20, '2026-06-10 17:02:01'),
(53, 85, 8, 'Gói Chụp food & product 09', 2100000.00, 'Gói dịch vụ Chụp food & product dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 20, '2026-06-10 17:02:01'),
(54, 94, 8, 'Gói Chụp food & product 10', 2200000.00, 'Gói dịch vụ Chụp food & product dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-10 17:02:01'),
(55, 10, 5, 'Gói Chụp ảnh cá nhân 01', 1300000.00, 'Gói dịch vụ Chụp ảnh cá nhân dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-10 17:02:01'),
(56, 19, 5, 'Gói Chụp ảnh cá nhân 02', 1400000.00, 'Gói dịch vụ Chụp ảnh cá nhân dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-10 17:02:01'),
(57, 28, 5, 'Gói Chụp ảnh cá nhân 03', 1500000.00, 'Gói dịch vụ Chụp ảnh cá nhân dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 5, '2026-06-10 17:02:01'),
(58, 37, 5, 'Gói Chụp ảnh cá nhân 04', 1600000.00, 'Gói dịch vụ Chụp ảnh cá nhân dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-10 17:02:01'),
(59, 46, 5, 'Gói Chụp ảnh cá nhân 05', 1700000.00, 'Gói dịch vụ Chụp ảnh cá nhân dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-10 17:02:01'),
(60, 55, 5, 'Gói Chụp ảnh cá nhân 06', 1800000.00, 'Gói dịch vụ Chụp ảnh cá nhân dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 5, '2026-06-10 17:02:01'),
(61, 64, 5, 'Gói Chụp ảnh cá nhân 07', 1900000.00, 'Gói dịch vụ Chụp ảnh cá nhân dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-10 17:02:01'),
(62, 73, 5, 'Gói Chụp ảnh cá nhân 08', 2000000.00, 'Gói dịch vụ Chụp ảnh cá nhân dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-10 17:02:01'),
(63, 82, 5, 'Gói Chụp ảnh cá nhân 09', 2100000.00, 'Gói dịch vụ Chụp ảnh cá nhân dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 5, '2026-06-10 17:02:01'),
(64, 91, 5, 'Gói Chụp ảnh cá nhân 10', 2200000.00, 'Gói dịch vụ Chụp ảnh cá nhân dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-10 17:02:01'),
(65, 14, 9, 'Gói Chụp travel 01', 1400000.00, 'Gói dịch vụ Chụp travel dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-10 17:02:01'),
(66, 23, 9, 'Gói Chụp travel 02', 1500000.00, 'Gói dịch vụ Chụp travel dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 5, '2026-06-10 17:02:01'),
(67, 32, 9, 'Gói Chụp travel 03', 1600000.00, 'Gói dịch vụ Chụp travel dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-10 17:02:01'),
(68, 41, 9, 'Gói Chụp travel 04', 1700000.00, 'Gói dịch vụ Chụp travel dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-10 17:02:01'),
(69, 50, 9, 'Gói Chụp travel 05', 1800000.00, 'Gói dịch vụ Chụp travel dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 5, '2026-06-10 17:02:01'),
(70, 59, 9, 'Gói Chụp travel 06', 1900000.00, 'Gói dịch vụ Chụp travel dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-10 17:02:01'),
(71, 68, 9, 'Gói Chụp travel 07', 2000000.00, 'Gói dịch vụ Chụp travel dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-10 17:02:01'),
(72, 77, 9, 'Gói Chụp travel 08', 2100000.00, 'Gói dịch vụ Chụp travel dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 5, '2026-06-10 17:02:01'),
(73, 86, 9, 'Gói Chụp travel 09', 2200000.00, 'Gói dịch vụ Chụp travel dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-10 17:02:01'),
(74, 95, 9, 'Gói Chụp travel 10', 2300000.00, 'Gói dịch vụ Chụp travel dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-10 17:02:01'),
(75, 6, 1, 'Gói Chụp ảnh cưới 01', 5100000.00, 'Gói dịch vụ Chụp ảnh cưới dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 270, 2, 2, '2026-06-10 17:02:01'),
(76, 15, 1, 'Gói Chụp ảnh cưới 02', 5200000.00, 'Gói dịch vụ Chụp ảnh cưới dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 300, 2, 2, '2026-06-10 17:02:01'),
(77, 24, 1, 'Gói Chụp ảnh cưới 03', 5300000.00, 'Gói dịch vụ Chụp ảnh cưới dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 2, '2026-06-10 17:02:01'),
(78, 33, 1, 'Gói Chụp ảnh cưới 04', 5400000.00, 'Gói dịch vụ Chụp ảnh cưới dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 270, 2, 2, '2026-06-10 17:02:01'),
(79, 42, 1, 'Gói Chụp ảnh cưới 05', 5500000.00, 'Gói dịch vụ Chụp ảnh cưới dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 300, 2, 2, '2026-06-10 17:02:01'),
(80, 51, 1, 'Gói Chụp ảnh cưới 06', 5600000.00, 'Gói dịch vụ Chụp ảnh cưới dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 2, '2026-06-10 17:02:01'),
(81, 60, 1, 'Gói Chụp ảnh cưới 07', 5700000.00, 'Gói dịch vụ Chụp ảnh cưới dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 270, 2, 2, '2026-06-10 17:02:01'),
(82, 69, 1, 'Gói Chụp ảnh cưới 08', 5800000.00, 'Gói dịch vụ Chụp ảnh cưới dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 300, 2, 2, '2026-06-10 17:02:01'),
(83, 78, 1, 'Gói Chụp ảnh cưới 09', 5900000.00, 'Gói dịch vụ Chụp ảnh cưới dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 2, '2026-06-10 17:02:01'),
(84, 87, 1, 'Gói Chụp ảnh cưới 10', 6000000.00, 'Gói dịch vụ Chụp ảnh cưới dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 270, 2, 2, '2026-06-10 17:02:01'),
(85, 12, 7, 'Gói Chụp kỉ yếu 01', 2100000.00, 'Gói dịch vụ Chụp kỉ yếu dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 210, 2, 45, '2026-06-10 17:02:01'),
(86, 21, 7, 'Gói Chụp kỉ yếu 02', 2200000.00, 'Gói dịch vụ Chụp kỉ yếu dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 45, '2026-06-10 17:02:01'),
(87, 30, 7, 'Gói Chụp kỉ yếu 03', 2300000.00, 'Gói dịch vụ Chụp kỉ yếu dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 2, 45, '2026-06-10 17:02:01'),
(88, 39, 7, 'Gói Chụp kỉ yếu 04', 2400000.00, 'Gói dịch vụ Chụp kỉ yếu dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 210, 2, 45, '2026-06-10 17:02:01'),
(89, 48, 7, 'Gói Chụp kỉ yếu 05', 2500000.00, 'Gói dịch vụ Chụp kỉ yếu dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 45, '2026-06-10 17:02:01'),
(90, 57, 7, 'Gói Chụp kỉ yếu 06', 2600000.00, 'Gói dịch vụ Chụp kỉ yếu dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 2, 45, '2026-06-10 17:02:01'),
(91, 66, 7, 'Gói Chụp kỉ yếu 07', 2700000.00, 'Gói dịch vụ Chụp kỉ yếu dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 210, 2, 45, '2026-06-10 17:02:01'),
(92, 75, 7, 'Gói Chụp kỉ yếu 08', 2800000.00, 'Gói dịch vụ Chụp kỉ yếu dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 45, '2026-06-10 17:02:01'),
(93, 84, 7, 'Gói Chụp kỉ yếu 09', 2900000.00, 'Gói dịch vụ Chụp kỉ yếu dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 2, 45, '2026-06-10 17:02:01'),
(94, 93, 7, 'Gói Chụp kỉ yếu 10', 3000000.00, 'Gói dịch vụ Chụp kỉ yếu dành cho khách hàng cần photographer chuyên nghiệp. Bao gồm tư vấn concept, chụp ảnh, chọn ảnh và chỉnh sửa cơ bản.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 210, 2, 45, '2026-06-10 17:02:01'),
(95, 2, 7, 'Gói kỉ yếu tiêu chuẩn', 2000000.00, 'Chụp kỉ yếu theo lớp/nhóm, phù hợp học sinh sinh viên.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 60, '2026-06-12 06:00:13'),
(96, 7, 7, 'Gói kỉ yếu tiêu chuẩn', 2000000.00, 'Chụp kỉ yếu theo lớp/nhóm, phù hợp học sinh sinh viên.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 60, '2026-06-12 06:00:13'),
(97, 17, 7, 'Gói kỉ yếu tiêu chuẩn', 2000000.00, 'Chụp kỉ yếu theo lớp/nhóm, phù hợp học sinh sinh viên.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 60, '2026-06-12 06:00:13'),
(98, 22, 7, 'Gói kỉ yếu tiêu chuẩn', 2000000.00, 'Chụp kỉ yếu theo lớp/nhóm, phù hợp học sinh sinh viên.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 60, '2026-06-12 06:00:13'),
(99, 27, 7, 'Gói kỉ yếu tiêu chuẩn', 2000000.00, 'Chụp kỉ yếu theo lớp/nhóm, phù hợp học sinh sinh viên.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 60, '2026-06-12 06:00:13'),
(100, 32, 7, 'Gói kỉ yếu tiêu chuẩn', 2000000.00, 'Chụp kỉ yếu theo lớp/nhóm, phù hợp học sinh sinh viên.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 60, '2026-06-12 06:00:13'),
(101, 37, 7, 'Gói kỉ yếu tiêu chuẩn', 2000000.00, 'Chụp kỉ yếu theo lớp/nhóm, phù hợp học sinh sinh viên.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 60, '2026-06-12 06:00:13'),
(102, 42, 7, 'Gói kỉ yếu tiêu chuẩn', 2000000.00, 'Chụp kỉ yếu theo lớp/nhóm, phù hợp học sinh sinh viên.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 60, '2026-06-12 06:00:13'),
(103, 47, 7, 'Gói kỉ yếu tiêu chuẩn', 2000000.00, 'Chụp kỉ yếu theo lớp/nhóm, phù hợp học sinh sinh viên.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 60, '2026-06-12 06:00:13'),
(104, 52, 7, 'Gói kỉ yếu tiêu chuẩn', 2000000.00, 'Chụp kỉ yếu theo lớp/nhóm, phù hợp học sinh sinh viên.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 60, '2026-06-12 06:00:13'),
(105, 62, 7, 'Gói kỉ yếu tiêu chuẩn', 2000000.00, 'Chụp kỉ yếu theo lớp/nhóm, phù hợp học sinh sinh viên.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 60, '2026-06-12 06:00:13'),
(106, 67, 7, 'Gói kỉ yếu tiêu chuẩn', 2000000.00, 'Chụp kỉ yếu theo lớp/nhóm, phù hợp học sinh sinh viên.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 60, '2026-06-12 06:00:13'),
(107, 72, 7, 'Gói kỉ yếu tiêu chuẩn', 2000000.00, 'Chụp kỉ yếu theo lớp/nhóm, phù hợp học sinh sinh viên.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 60, '2026-06-12 06:00:13'),
(108, 77, 7, 'Gói kỉ yếu tiêu chuẩn', 2000000.00, 'Chụp kỉ yếu theo lớp/nhóm, phù hợp học sinh sinh viên.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 60, '2026-06-12 06:00:13'),
(109, 82, 7, 'Gói kỉ yếu tiêu chuẩn', 2000000.00, 'Chụp kỉ yếu theo lớp/nhóm, phù hợp học sinh sinh viên.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 60, '2026-06-12 06:00:13'),
(110, 87, 7, 'Gói kỉ yếu tiêu chuẩn', 2000000.00, 'Chụp kỉ yếu theo lớp/nhóm, phù hợp học sinh sinh viên.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 60, '2026-06-12 06:00:13'),
(111, 92, 7, 'Gói kỉ yếu tiêu chuẩn', 2000000.00, 'Chụp kỉ yếu theo lớp/nhóm, phù hợp học sinh sinh viên.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 180, 1, 60, '2026-06-12 06:00:13'),
(112, 2, 9, 'Gói travel ngoại cảnh', 1300000.00, 'Chụp du lịch, lifestyle, ngoại cảnh.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 6, '2026-06-12 06:00:13'),
(113, 7, 9, 'Gói travel ngoại cảnh', 1300000.00, 'Chụp du lịch, lifestyle, ngoại cảnh.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 6, '2026-06-12 06:00:13'),
(114, 12, 9, 'Gói travel ngoại cảnh', 1300000.00, 'Chụp du lịch, lifestyle, ngoại cảnh.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 6, '2026-06-12 06:00:13'),
(115, 17, 9, 'Gói travel ngoại cảnh', 1300000.00, 'Chụp du lịch, lifestyle, ngoại cảnh.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 6, '2026-06-12 06:00:13'),
(116, 22, 9, 'Gói travel ngoại cảnh', 1300000.00, 'Chụp du lịch, lifestyle, ngoại cảnh.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 6, '2026-06-12 06:00:13'),
(117, 27, 9, 'Gói travel ngoại cảnh', 1300000.00, 'Chụp du lịch, lifestyle, ngoại cảnh.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 6, '2026-06-12 06:00:13'),
(118, 37, 9, 'Gói travel ngoại cảnh', 1300000.00, 'Chụp du lịch, lifestyle, ngoại cảnh.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 6, '2026-06-12 06:00:13'),
(119, 42, 9, 'Gói travel ngoại cảnh', 1300000.00, 'Chụp du lịch, lifestyle, ngoại cảnh.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 6, '2026-06-12 06:00:13'),
(120, 47, 9, 'Gói travel ngoại cảnh', 1300000.00, 'Chụp du lịch, lifestyle, ngoại cảnh.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 6, '2026-06-12 06:00:13'),
(121, 52, 9, 'Gói travel ngoại cảnh', 1300000.00, 'Chụp du lịch, lifestyle, ngoại cảnh.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 6, '2026-06-12 06:00:13'),
(122, 57, 9, 'Gói travel ngoại cảnh', 1300000.00, 'Chụp du lịch, lifestyle, ngoại cảnh.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 6, '2026-06-12 06:00:13'),
(123, 62, 9, 'Gói travel ngoại cảnh', 1300000.00, 'Chụp du lịch, lifestyle, ngoại cảnh.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 6, '2026-06-12 06:00:13'),
(124, 67, 9, 'Gói travel ngoại cảnh', 1300000.00, 'Chụp du lịch, lifestyle, ngoại cảnh.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 6, '2026-06-12 06:00:13'),
(125, 72, 9, 'Gói travel ngoại cảnh', 1300000.00, 'Chụp du lịch, lifestyle, ngoại cảnh.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 6, '2026-06-12 06:00:13'),
(126, 82, 9, 'Gói travel ngoại cảnh', 1300000.00, 'Chụp du lịch, lifestyle, ngoại cảnh.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 6, '2026-06-12 06:00:13'),
(127, 87, 9, 'Gói travel ngoại cảnh', 1300000.00, 'Chụp du lịch, lifestyle, ngoại cảnh.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 6, '2026-06-12 06:00:13'),
(128, 92, 9, 'Gói travel ngoại cảnh', 1300000.00, 'Chụp du lịch, lifestyle, ngoại cảnh.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 6, '2026-06-12 06:00:13'),
(129, 2, 6, 'Gói couple basic', 1500000.00, 'Chụp ảnh đôi, kỷ niệm tình yêu.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-12 06:00:13'),
(130, 7, 6, 'Gói couple basic', 1500000.00, 'Chụp ảnh đôi, kỷ niệm tình yêu.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-12 06:00:13'),
(131, 12, 6, 'Gói couple basic', 1500000.00, 'Chụp ảnh đôi, kỷ niệm tình yêu.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-12 06:00:13'),
(132, 17, 6, 'Gói couple basic', 1500000.00, 'Chụp ảnh đôi, kỷ niệm tình yêu.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-12 06:00:13'),
(133, 22, 6, 'Gói couple basic', 1500000.00, 'Chụp ảnh đôi, kỷ niệm tình yêu.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-12 06:00:13'),
(134, 27, 6, 'Gói couple basic', 1500000.00, 'Chụp ảnh đôi, kỷ niệm tình yêu.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-12 06:00:13'),
(135, 32, 6, 'Gói couple basic', 1500000.00, 'Chụp ảnh đôi, kỷ niệm tình yêu.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-12 06:00:13'),
(136, 37, 6, 'Gói couple basic', 1500000.00, 'Chụp ảnh đôi, kỷ niệm tình yêu.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-12 06:00:13'),
(137, 42, 6, 'Gói couple basic', 1500000.00, 'Chụp ảnh đôi, kỷ niệm tình yêu.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-12 06:00:13'),
(138, 52, 6, 'Gói couple basic', 1500000.00, 'Chụp ảnh đôi, kỷ niệm tình yêu.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-12 06:00:13'),
(139, 57, 6, 'Gói couple basic', 1500000.00, 'Chụp ảnh đôi, kỷ niệm tình yêu.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-12 06:00:13'),
(140, 62, 6, 'Gói couple basic', 1500000.00, 'Chụp ảnh đôi, kỷ niệm tình yêu.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-12 06:00:13'),
(141, 67, 6, 'Gói couple basic', 1500000.00, 'Chụp ảnh đôi, kỷ niệm tình yêu.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-12 06:00:13'),
(142, 72, 6, 'Gói couple basic', 1500000.00, 'Chụp ảnh đôi, kỷ niệm tình yêu.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-12 06:00:13'),
(143, 77, 6, 'Gói couple basic', 1500000.00, 'Chụp ảnh đôi, kỷ niệm tình yêu.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-12 06:00:13'),
(144, 82, 6, 'Gói couple basic', 1500000.00, 'Chụp ảnh đôi, kỷ niệm tình yêu.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-12 06:00:13'),
(145, 87, 6, 'Gói couple basic', 1500000.00, 'Chụp ảnh đôi, kỷ niệm tình yêu.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 5, '2026-06-12 06:00:13'),
(146, 8, 1, 'Gói cưới pre-wedding', 5000000.00, 'Chụp ảnh cưới/pre-wedding, tư vấn concept.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(147, 13, 1, 'Gói cưới pre-wedding', 5000000.00, 'Chụp ảnh cưới/pre-wedding, tư vấn concept.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(148, 18, 1, 'Gói cưới pre-wedding', 5000000.00, 'Chụp ảnh cưới/pre-wedding, tư vấn concept.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(149, 23, 1, 'Gói cưới pre-wedding', 5000000.00, 'Chụp ảnh cưới/pre-wedding, tư vấn concept.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(150, 28, 1, 'Gói cưới pre-wedding', 5000000.00, 'Chụp ảnh cưới/pre-wedding, tư vấn concept.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(151, 38, 1, 'Gói cưới pre-wedding', 5000000.00, 'Chụp ảnh cưới/pre-wedding, tư vấn concept.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(152, 43, 1, 'Gói cưới pre-wedding', 5000000.00, 'Chụp ảnh cưới/pre-wedding, tư vấn concept.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(153, 48, 1, 'Gói cưới pre-wedding', 5000000.00, 'Chụp ảnh cưới/pre-wedding, tư vấn concept.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(154, 53, 1, 'Gói cưới pre-wedding', 5000000.00, 'Chụp ảnh cưới/pre-wedding, tư vấn concept.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(155, 58, 1, 'Gói cưới pre-wedding', 5000000.00, 'Chụp ảnh cưới/pre-wedding, tư vấn concept.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(156, 63, 1, 'Gói cưới pre-wedding', 5000000.00, 'Chụp ảnh cưới/pre-wedding, tư vấn concept.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(157, 68, 1, 'Gói cưới pre-wedding', 5000000.00, 'Chụp ảnh cưới/pre-wedding, tư vấn concept.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(158, 73, 1, 'Gói cưới pre-wedding', 5000000.00, 'Chụp ảnh cưới/pre-wedding, tư vấn concept.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(159, 83, 1, 'Gói cưới pre-wedding', 5000000.00, 'Chụp ảnh cưới/pre-wedding, tư vấn concept.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(160, 88, 1, 'Gói cưới pre-wedding', 5000000.00, 'Chụp ảnh cưới/pre-wedding, tư vấn concept.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(161, 93, 1, 'Gói cưới pre-wedding', 5000000.00, 'Chụp ảnh cưới/pre-wedding, tư vấn concept.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(162, 3, 6, 'Gói couple premium', 1800000.00, 'Chụp ảnh đôi ngoại cảnh hoặc studio.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-12 06:00:13'),
(163, 8, 6, 'Gói couple premium', 1800000.00, 'Chụp ảnh đôi ngoại cảnh hoặc studio.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-12 06:00:13'),
(164, 13, 6, 'Gói couple premium', 1800000.00, 'Chụp ảnh đôi ngoại cảnh hoặc studio.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-12 06:00:13'),
(165, 18, 6, 'Gói couple premium', 1800000.00, 'Chụp ảnh đôi ngoại cảnh hoặc studio.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-12 06:00:13'),
(166, 23, 6, 'Gói couple premium', 1800000.00, 'Chụp ảnh đôi ngoại cảnh hoặc studio.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-12 06:00:13'),
(167, 28, 6, 'Gói couple premium', 1800000.00, 'Chụp ảnh đôi ngoại cảnh hoặc studio.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-12 06:00:13'),
(168, 33, 6, 'Gói couple premium', 1800000.00, 'Chụp ảnh đôi ngoại cảnh hoặc studio.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-12 06:00:13'),
(169, 43, 6, 'Gói couple premium', 1800000.00, 'Chụp ảnh đôi ngoại cảnh hoặc studio.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-12 06:00:13'),
(170, 48, 6, 'Gói couple premium', 1800000.00, 'Chụp ảnh đôi ngoại cảnh hoặc studio.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-12 06:00:13'),
(171, 53, 6, 'Gói couple premium', 1800000.00, 'Chụp ảnh đôi ngoại cảnh hoặc studio.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-12 06:00:13'),
(172, 58, 6, 'Gói couple premium', 1800000.00, 'Chụp ảnh đôi ngoại cảnh hoặc studio.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-12 06:00:13'),
(173, 63, 6, 'Gói couple premium', 1800000.00, 'Chụp ảnh đôi ngoại cảnh hoặc studio.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-12 06:00:13'),
(174, 68, 6, 'Gói couple premium', 1800000.00, 'Chụp ảnh đôi ngoại cảnh hoặc studio.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-12 06:00:13'),
(175, 73, 6, 'Gói couple premium', 1800000.00, 'Chụp ảnh đôi ngoại cảnh hoặc studio.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-12 06:00:13'),
(176, 78, 6, 'Gói couple premium', 1800000.00, 'Chụp ảnh đôi ngoại cảnh hoặc studio.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-12 06:00:13'),
(177, 88, 6, 'Gói couple premium', 1800000.00, 'Chụp ảnh đôi ngoại cảnh hoặc studio.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-12 06:00:13'),
(178, 93, 6, 'Gói couple premium', 1800000.00, 'Chụp ảnh đôi ngoại cảnh hoặc studio.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 5, '2026-06-12 06:00:13'),
(179, 4, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(180, 9, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(181, 14, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(182, 19, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(183, 24, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(184, 29, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(185, 34, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(186, 39, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(187, 44, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(188, 49, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(189, 54, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(190, 59, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(191, 64, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(192, 69, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(193, 74, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(194, 79, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(195, 84, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(196, 89, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(197, 94, 10, 'Gói sự kiện theo giờ', 1000000.00, 'Chụp hội nghị, sinh nhật, khai trương, tiệc cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 150, '2026-06-12 06:00:13'),
(198, 4, 4, 'Gói thương mại doanh nghiệp', 2200000.00, 'Chụp hình thương hiệu, chiến dịch, quảng cáo.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-12 06:00:13'),
(199, 14, 4, 'Gói thương mại doanh nghiệp', 2200000.00, 'Chụp hình thương hiệu, chiến dịch, quảng cáo.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-12 06:00:13'),
(200, 19, 4, 'Gói thương mại doanh nghiệp', 2200000.00, 'Chụp hình thương hiệu, chiến dịch, quảng cáo.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-12 06:00:13'),
(201, 24, 4, 'Gói thương mại doanh nghiệp', 2200000.00, 'Chụp hình thương hiệu, chiến dịch, quảng cáo.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-12 06:00:13'),
(202, 29, 4, 'Gói thương mại doanh nghiệp', 2200000.00, 'Chụp hình thương hiệu, chiến dịch, quảng cáo.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-12 06:00:13'),
(203, 34, 4, 'Gói thương mại doanh nghiệp', 2200000.00, 'Chụp hình thương hiệu, chiến dịch, quảng cáo.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-12 06:00:13'),
(204, 39, 4, 'Gói thương mại doanh nghiệp', 2200000.00, 'Chụp hình thương hiệu, chiến dịch, quảng cáo.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-12 06:00:13'),
(205, 44, 4, 'Gói thương mại doanh nghiệp', 2200000.00, 'Chụp hình thương hiệu, chiến dịch, quảng cáo.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-12 06:00:13'),
(206, 49, 4, 'Gói thương mại doanh nghiệp', 2200000.00, 'Chụp hình thương hiệu, chiến dịch, quảng cáo.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-12 06:00:13'),
(207, 59, 4, 'Gói thương mại doanh nghiệp', 2200000.00, 'Chụp hình thương hiệu, chiến dịch, quảng cáo.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-12 06:00:13'),
(208, 64, 4, 'Gói thương mại doanh nghiệp', 2200000.00, 'Chụp hình thương hiệu, chiến dịch, quảng cáo.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-12 06:00:13'),
(209, 69, 4, 'Gói thương mại doanh nghiệp', 2200000.00, 'Chụp hình thương hiệu, chiến dịch, quảng cáo.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-12 06:00:13'),
(210, 74, 4, 'Gói thương mại doanh nghiệp', 2200000.00, 'Chụp hình thương hiệu, chiến dịch, quảng cáo.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-12 06:00:13'),
(211, 79, 4, 'Gói thương mại doanh nghiệp', 2200000.00, 'Chụp hình thương hiệu, chiến dịch, quảng cáo.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-12 06:00:13'),
(212, 84, 4, 'Gói thương mại doanh nghiệp', 2200000.00, 'Chụp hình thương hiệu, chiến dịch, quảng cáo.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-12 06:00:13'),
(213, 89, 4, 'Gói thương mại doanh nghiệp', 2200000.00, 'Chụp hình thương hiệu, chiến dịch, quảng cáo.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-12 06:00:13'),
(214, 94, 4, 'Gói thương mại doanh nghiệp', 2200000.00, 'Chụp hình thương hiệu, chiến dịch, quảng cáo.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 20, '2026-06-12 06:00:13'),
(215, 4, 8, 'Gói food/product', 1200000.00, 'Chụp món ăn, sản phẩm, menu, catalog.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(216, 9, 8, 'Gói food/product', 1200000.00, 'Chụp món ăn, sản phẩm, menu, catalog.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(217, 14, 8, 'Gói food/product', 1200000.00, 'Chụp món ăn, sản phẩm, menu, catalog.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(218, 19, 8, 'Gói food/product', 1200000.00, 'Chụp món ăn, sản phẩm, menu, catalog.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(219, 24, 8, 'Gói food/product', 1200000.00, 'Chụp món ăn, sản phẩm, menu, catalog.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(220, 29, 8, 'Gói food/product', 1200000.00, 'Chụp món ăn, sản phẩm, menu, catalog.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(221, 34, 8, 'Gói food/product', 1200000.00, 'Chụp món ăn, sản phẩm, menu, catalog.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(222, 39, 8, 'Gói food/product', 1200000.00, 'Chụp món ăn, sản phẩm, menu, catalog.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(223, 44, 8, 'Gói food/product', 1200000.00, 'Chụp món ăn, sản phẩm, menu, catalog.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(224, 54, 8, 'Gói food/product', 1200000.00, 'Chụp món ăn, sản phẩm, menu, catalog.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(225, 59, 8, 'Gói food/product', 1200000.00, 'Chụp món ăn, sản phẩm, menu, catalog.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(226, 64, 8, 'Gói food/product', 1200000.00, 'Chụp món ăn, sản phẩm, menu, catalog.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(227, 69, 8, 'Gói food/product', 1200000.00, 'Chụp món ăn, sản phẩm, menu, catalog.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(228, 74, 8, 'Gói food/product', 1200000.00, 'Chụp món ăn, sản phẩm, menu, catalog.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(229, 79, 8, 'Gói food/product', 1200000.00, 'Chụp món ăn, sản phẩm, menu, catalog.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(230, 84, 8, 'Gói food/product', 1200000.00, 'Chụp món ăn, sản phẩm, menu, catalog.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(231, 89, 8, 'Gói food/product', 1200000.00, 'Chụp món ăn, sản phẩm, menu, catalog.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(232, 10, 7, 'Gói kỉ yếu nhóm nhỏ', 1800000.00, 'Chụp kỉ yếu theo nhóm, concept trẻ trung.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 50, '2026-06-12 06:00:13'),
(233, 15, 7, 'Gói kỉ yếu nhóm nhỏ', 1800000.00, 'Chụp kỉ yếu theo nhóm, concept trẻ trung.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 50, '2026-06-12 06:00:13'),
(234, 20, 7, 'Gói kỉ yếu nhóm nhỏ', 1800000.00, 'Chụp kỉ yếu theo nhóm, concept trẻ trung.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 50, '2026-06-12 06:00:13'),
(235, 25, 7, 'Gói kỉ yếu nhóm nhỏ', 1800000.00, 'Chụp kỉ yếu theo nhóm, concept trẻ trung.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 50, '2026-06-12 06:00:13'),
(236, 35, 7, 'Gói kỉ yếu nhóm nhỏ', 1800000.00, 'Chụp kỉ yếu theo nhóm, concept trẻ trung.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 50, '2026-06-12 06:00:13'),
(237, 40, 7, 'Gói kỉ yếu nhóm nhỏ', 1800000.00, 'Chụp kỉ yếu theo nhóm, concept trẻ trung.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 50, '2026-06-12 06:00:13'),
(238, 45, 7, 'Gói kỉ yếu nhóm nhỏ', 1800000.00, 'Chụp kỉ yếu theo nhóm, concept trẻ trung.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 50, '2026-06-12 06:00:13'),
(239, 50, 7, 'Gói kỉ yếu nhóm nhỏ', 1800000.00, 'Chụp kỉ yếu theo nhóm, concept trẻ trung.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 50, '2026-06-12 06:00:13'),
(240, 55, 7, 'Gói kỉ yếu nhóm nhỏ', 1800000.00, 'Chụp kỉ yếu theo nhóm, concept trẻ trung.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 50, '2026-06-12 06:00:13'),
(241, 60, 7, 'Gói kỉ yếu nhóm nhỏ', 1800000.00, 'Chụp kỉ yếu theo nhóm, concept trẻ trung.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 50, '2026-06-12 06:00:13'),
(242, 65, 7, 'Gói kỉ yếu nhóm nhỏ', 1800000.00, 'Chụp kỉ yếu theo nhóm, concept trẻ trung.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 50, '2026-06-12 06:00:13'),
(243, 70, 7, 'Gói kỉ yếu nhóm nhỏ', 1800000.00, 'Chụp kỉ yếu theo nhóm, concept trẻ trung.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 50, '2026-06-12 06:00:13'),
(244, 80, 7, 'Gói kỉ yếu nhóm nhỏ', 1800000.00, 'Chụp kỉ yếu theo nhóm, concept trẻ trung.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 50, '2026-06-12 06:00:13'),
(245, 85, 7, 'Gói kỉ yếu nhóm nhỏ', 1800000.00, 'Chụp kỉ yếu theo nhóm, concept trẻ trung.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 50, '2026-06-12 06:00:13'),
(246, 90, 7, 'Gói kỉ yếu nhóm nhỏ', 1800000.00, 'Chụp kỉ yếu theo nhóm, concept trẻ trung.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 50, '2026-06-12 06:00:13');
INSERT INTO `service_packages` (`id`, `photographer_id`, `category_id`, `name`, `price`, `description`, `image_url`, `portfolio_images`, `add_ons`, `distance_km`, `review_count`, `verified`, `next_slot`, `duration`, `worker_count`, `max_customer_count`, `created_at`) VALUES
(247, 95, 7, 'Gói kỉ yếu nhóm nhỏ', 1800000.00, 'Chụp kỉ yếu theo nhóm, concept trẻ trung.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 150, 1, 50, '2026-06-12 06:00:13'),
(248, 5, 5, 'Gói chân dung cá nhân', 1200000.00, 'Chụp chân dung, profile, lookbook cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 3, '2026-06-12 06:00:13'),
(249, 15, 5, 'Gói chân dung cá nhân', 1200000.00, 'Chụp chân dung, profile, lookbook cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 3, '2026-06-12 06:00:13'),
(250, 20, 5, 'Gói chân dung cá nhân', 1200000.00, 'Chụp chân dung, profile, lookbook cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 3, '2026-06-12 06:00:13'),
(251, 25, 5, 'Gói chân dung cá nhân', 1200000.00, 'Chụp chân dung, profile, lookbook cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 3, '2026-06-12 06:00:13'),
(252, 30, 5, 'Gói chân dung cá nhân', 1200000.00, 'Chụp chân dung, profile, lookbook cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 3, '2026-06-12 06:00:13'),
(253, 35, 5, 'Gói chân dung cá nhân', 1200000.00, 'Chụp chân dung, profile, lookbook cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 3, '2026-06-12 06:00:13'),
(254, 40, 5, 'Gói chân dung cá nhân', 1200000.00, 'Chụp chân dung, profile, lookbook cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 3, '2026-06-12 06:00:13'),
(255, 45, 5, 'Gói chân dung cá nhân', 1200000.00, 'Chụp chân dung, profile, lookbook cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 3, '2026-06-12 06:00:13'),
(256, 50, 5, 'Gói chân dung cá nhân', 1200000.00, 'Chụp chân dung, profile, lookbook cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 3, '2026-06-12 06:00:13'),
(257, 60, 5, 'Gói chân dung cá nhân', 1200000.00, 'Chụp chân dung, profile, lookbook cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 3, '2026-06-12 06:00:13'),
(258, 65, 5, 'Gói chân dung cá nhân', 1200000.00, 'Chụp chân dung, profile, lookbook cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 3, '2026-06-12 06:00:13'),
(259, 70, 5, 'Gói chân dung cá nhân', 1200000.00, 'Chụp chân dung, profile, lookbook cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 3, '2026-06-12 06:00:13'),
(260, 75, 5, 'Gói chân dung cá nhân', 1200000.00, 'Chụp chân dung, profile, lookbook cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 3, '2026-06-12 06:00:13'),
(261, 80, 5, 'Gói chân dung cá nhân', 1200000.00, 'Chụp chân dung, profile, lookbook cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 3, '2026-06-12 06:00:13'),
(262, 85, 5, 'Gói chân dung cá nhân', 1200000.00, 'Chụp chân dung, profile, lookbook cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 3, '2026-06-12 06:00:13'),
(263, 90, 5, 'Gói chân dung cá nhân', 1200000.00, 'Chụp chân dung, profile, lookbook cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 3, '2026-06-12 06:00:13'),
(264, 95, 5, 'Gói chân dung cá nhân', 1200000.00, 'Chụp chân dung, profile, lookbook cá nhân.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 90, 1, 3, '2026-06-12 06:00:13'),
(265, 6, 9, 'Gói travel lifestyle', 1300000.00, 'Chụp du lịch, ngoại cảnh, lifestyle.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-12 06:00:13'),
(266, 11, 9, 'Gói travel lifestyle', 1300000.00, 'Chụp du lịch, ngoại cảnh, lifestyle.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-12 06:00:13'),
(267, 16, 9, 'Gói travel lifestyle', 1300000.00, 'Chụp du lịch, ngoại cảnh, lifestyle.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-12 06:00:13'),
(268, 21, 9, 'Gói travel lifestyle', 1300000.00, 'Chụp du lịch, ngoại cảnh, lifestyle.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-12 06:00:13'),
(269, 26, 9, 'Gói travel lifestyle', 1300000.00, 'Chụp du lịch, ngoại cảnh, lifestyle.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-12 06:00:13'),
(270, 31, 9, 'Gói travel lifestyle', 1300000.00, 'Chụp du lịch, ngoại cảnh, lifestyle.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-12 06:00:13'),
(271, 36, 9, 'Gói travel lifestyle', 1300000.00, 'Chụp du lịch, ngoại cảnh, lifestyle.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-12 06:00:13'),
(272, 46, 9, 'Gói travel lifestyle', 1300000.00, 'Chụp du lịch, ngoại cảnh, lifestyle.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-12 06:00:13'),
(273, 51, 9, 'Gói travel lifestyle', 1300000.00, 'Chụp du lịch, ngoại cảnh, lifestyle.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-12 06:00:13'),
(274, 56, 9, 'Gói travel lifestyle', 1300000.00, 'Chụp du lịch, ngoại cảnh, lifestyle.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-12 06:00:13'),
(275, 61, 9, 'Gói travel lifestyle', 1300000.00, 'Chụp du lịch, ngoại cảnh, lifestyle.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-12 06:00:13'),
(276, 66, 9, 'Gói travel lifestyle', 1300000.00, 'Chụp du lịch, ngoại cảnh, lifestyle.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-12 06:00:13'),
(277, 71, 9, 'Gói travel lifestyle', 1300000.00, 'Chụp du lịch, ngoại cảnh, lifestyle.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-12 06:00:13'),
(278, 76, 9, 'Gói travel lifestyle', 1300000.00, 'Chụp du lịch, ngoại cảnh, lifestyle.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-12 06:00:13'),
(279, 81, 9, 'Gói travel lifestyle', 1300000.00, 'Chụp du lịch, ngoại cảnh, lifestyle.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-12 06:00:13'),
(280, 91, 9, 'Gói travel lifestyle', 1300000.00, 'Chụp du lịch, ngoại cảnh, lifestyle.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 8, '2026-06-12 06:00:13'),
(281, 6, 8, 'Gói product basic', 1200000.00, 'Chụp sản phẩm, món ăn, thương mại.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(282, 11, 8, 'Gói product basic', 1200000.00, 'Chụp sản phẩm, món ăn, thương mại.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(283, 16, 8, 'Gói product basic', 1200000.00, 'Chụp sản phẩm, món ăn, thương mại.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(284, 21, 8, 'Gói product basic', 1200000.00, 'Chụp sản phẩm, món ăn, thương mại.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(285, 26, 8, 'Gói product basic', 1200000.00, 'Chụp sản phẩm, món ăn, thương mại.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(286, 36, 8, 'Gói product basic', 1200000.00, 'Chụp sản phẩm, món ăn, thương mại.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(287, 41, 8, 'Gói product basic', 1200000.00, 'Chụp sản phẩm, món ăn, thương mại.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(288, 46, 8, 'Gói product basic', 1200000.00, 'Chụp sản phẩm, món ăn, thương mại.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(289, 51, 8, 'Gói product basic', 1200000.00, 'Chụp sản phẩm, món ăn, thương mại.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(290, 56, 8, 'Gói product basic', 1200000.00, 'Chụp sản phẩm, món ăn, thương mại.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(291, 61, 8, 'Gói product basic', 1200000.00, 'Chụp sản phẩm, món ăn, thương mại.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(292, 66, 8, 'Gói product basic', 1200000.00, 'Chụp sản phẩm, món ăn, thương mại.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(293, 71, 8, 'Gói product basic', 1200000.00, 'Chụp sản phẩm, món ăn, thương mại.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(294, 81, 8, 'Gói product basic', 1200000.00, 'Chụp sản phẩm, món ăn, thương mại.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(295, 86, 8, 'Gói product basic', 1200000.00, 'Chụp sản phẩm, món ăn, thương mại.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(296, 91, 8, 'Gói product basic', 1200000.00, 'Chụp sản phẩm, món ăn, thương mại.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 30, '2026-06-12 06:00:13'),
(297, 11, 1, 'Gói cưới ngoại cảnh', 5200000.00, 'Chụp ảnh cưới ngoại cảnh, album couple.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(298, 16, 1, 'Gói cưới ngoại cảnh', 5200000.00, 'Chụp ảnh cưới ngoại cảnh, album couple.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(299, 21, 1, 'Gói cưới ngoại cảnh', 5200000.00, 'Chụp ảnh cưới ngoại cảnh, album couple.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(300, 26, 1, 'Gói cưới ngoại cảnh', 5200000.00, 'Chụp ảnh cưới ngoại cảnh, album couple.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(301, 31, 1, 'Gói cưới ngoại cảnh', 5200000.00, 'Chụp ảnh cưới ngoại cảnh, album couple.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(302, 36, 1, 'Gói cưới ngoại cảnh', 5200000.00, 'Chụp ảnh cưới ngoại cảnh, album couple.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(303, 41, 1, 'Gói cưới ngoại cảnh', 5200000.00, 'Chụp ảnh cưới ngoại cảnh, album couple.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(304, 46, 1, 'Gói cưới ngoại cảnh', 5200000.00, 'Chụp ảnh cưới ngoại cảnh, album couple.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(305, 56, 1, 'Gói cưới ngoại cảnh', 5200000.00, 'Chụp ảnh cưới ngoại cảnh, album couple.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(306, 61, 1, 'Gói cưới ngoại cảnh', 5200000.00, 'Chụp ảnh cưới ngoại cảnh, album couple.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(307, 66, 1, 'Gói cưới ngoại cảnh', 5200000.00, 'Chụp ảnh cưới ngoại cảnh, album couple.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(308, 71, 1, 'Gói cưới ngoại cảnh', 5200000.00, 'Chụp ảnh cưới ngoại cảnh, album couple.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(309, 76, 1, 'Gói cưới ngoại cảnh', 5200000.00, 'Chụp ảnh cưới ngoại cảnh, album couple.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(310, 81, 1, 'Gói cưới ngoại cảnh', 5200000.00, 'Chụp ảnh cưới ngoại cảnh, album couple.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(311, 86, 1, 'Gói cưới ngoại cảnh', 5200000.00, 'Chụp ảnh cưới ngoại cảnh, album couple.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(312, 91, 1, 'Gói cưới ngoại cảnh', 5200000.00, 'Chụp ảnh cưới ngoại cảnh, album couple.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 240, 2, 20, '2026-06-12 06:00:13'),
(313, 6, 10, 'Gói sự kiện basic', 1000000.00, 'Chụp sự kiện, tiệc, sinh nhật, khai trương.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 120, '2026-06-12 06:00:13'),
(314, 11, 10, 'Gói sự kiện basic', 1000000.00, 'Chụp sự kiện, tiệc, sinh nhật, khai trương.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 120, '2026-06-12 06:00:13'),
(315, 16, 10, 'Gói sự kiện basic', 1000000.00, 'Chụp sự kiện, tiệc, sinh nhật, khai trương.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 120, '2026-06-12 06:00:13'),
(316, 21, 10, 'Gói sự kiện basic', 1000000.00, 'Chụp sự kiện, tiệc, sinh nhật, khai trương.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 120, '2026-06-12 06:00:13'),
(317, 26, 10, 'Gói sự kiện basic', 1000000.00, 'Chụp sự kiện, tiệc, sinh nhật, khai trương.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 120, '2026-06-12 06:00:13'),
(318, 31, 10, 'Gói sự kiện basic', 1000000.00, 'Chụp sự kiện, tiệc, sinh nhật, khai trương.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 120, '2026-06-12 06:00:13'),
(319, 36, 10, 'Gói sự kiện basic', 1000000.00, 'Chụp sự kiện, tiệc, sinh nhật, khai trương.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 120, '2026-06-12 06:00:13'),
(320, 41, 10, 'Gói sự kiện basic', 1000000.00, 'Chụp sự kiện, tiệc, sinh nhật, khai trương.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 120, '2026-06-12 06:00:13'),
(321, 46, 10, 'Gói sự kiện basic', 1000000.00, 'Chụp sự kiện, tiệc, sinh nhật, khai trương.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 120, '2026-06-12 06:00:13'),
(322, 51, 10, 'Gói sự kiện basic', 1000000.00, 'Chụp sự kiện, tiệc, sinh nhật, khai trương.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 120, '2026-06-12 06:00:13'),
(323, 56, 10, 'Gói sự kiện basic', 1000000.00, 'Chụp sự kiện, tiệc, sinh nhật, khai trương.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 120, '2026-06-12 06:00:13'),
(324, 61, 10, 'Gói sự kiện basic', 1000000.00, 'Chụp sự kiện, tiệc, sinh nhật, khai trương.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 120, '2026-06-12 06:00:13'),
(325, 66, 10, 'Gói sự kiện basic', 1000000.00, 'Chụp sự kiện, tiệc, sinh nhật, khai trương.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 120, '2026-06-12 06:00:13'),
(326, 71, 10, 'Gói sự kiện basic', 1000000.00, 'Chụp sự kiện, tiệc, sinh nhật, khai trương.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 120, '2026-06-12 06:00:13'),
(327, 76, 10, 'Gói sự kiện basic', 1000000.00, 'Chụp sự kiện, tiệc, sinh nhật, khai trương.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 120, '2026-06-12 06:00:13'),
(328, 81, 10, 'Gói sự kiện basic', 1000000.00, 'Chụp sự kiện, tiệc, sinh nhật, khai trương.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 120, '2026-06-12 06:00:13'),
(329, 86, 10, 'Gói sự kiện basic', 1000000.00, 'Chụp sự kiện, tiệc, sinh nhật, khai trương.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 120, '2026-06-12 06:00:13'),
(330, 91, 10, 'Gói sự kiện basic', 1000000.00, 'Chụp sự kiện, tiệc, sinh nhật, khai trương.', NULL, NULL, NULL, 0.00, 0, 0, NULL, 120, 1, 120, '2026-06-12 06:00:13'),
(331, 2, 1, 'Pre-wedding Đà Lạt', 5000000.00, 'Chụp ảnh cưới ngoại cảnh Đà Lạt, chỉnh màu và hỗ trợ album.', 'https://i.pinimg.com/736x/d5/39/3f/d5393f1c798379d5dfdf1b85563074dc.jpg', '[\"https://i.pinimg.com/1200x/cf/97/1b/cf971b66ae3f2c9a892bf0c5b32cfde5.jpg\",\"https://i.pinimg.com/736x/9d/0d/00/9d0d00329a385eaf93551acdcf1aad88.jpg\"]', '[\"Makeup\",\"Album\",\"Retouch\"]', 2.40, 128, 1, '15/06 - 08:00', 480, 2, 20, '2026-06-16 16:23:14'),
(332, 3, 1, 'Phóng sự cưới trọn ngày', 12000000.00, 'Chụp lễ cưới từ sáng đến tối, bắt trọn khoảnh khắc tự nhiên.', 'https://i.pinimg.com/736x/6d/c5/19/6dc519d3bd5450d7e06a71e0e5a2a845.jpg', '[\"https://i.pinimg.com/736x/88/f0/a4/88f0a43b271ad694a8e10c7eeaf76ea4.jpg\",\"https://i.pinimg.com/1200x/18/33/4d/18334d20531bae69b882960af71a6113.jpg\"]', '[\"Video\",\"Flycam\",\"Album\"]', 5.70, 96, 1, '16/06 - 14:00', 720, 2, 300, '2026-06-16 16:23:14'),
(333, 4, 1, 'Ảnh cưới biển Đà Nẵng', 7800000.00, 'Chụp ảnh cưới biển, concept nhẹ nhàng, chỉnh sửa ảnh cao cấp.', 'https://i.pinimg.com/736x/c9/12/65/c912651870f4269a0ef8d7833c8dc519.jpg', '[\"https://i.pinimg.com/736x/98/fd/14/98fd14f0e0dbdc50d0aa5a7550ca66fc.jpg\",\"https://i.pinimg.com/1200x/ac/88/59/ac88598c891cad0cbe1920807b14187e.jpg\"]', '[\"Makeup\",\"Flycam\",\"Retouch\"]', 8.60, 74, 0, '18/06 - 07:00', 360, 2, 50, '2026-06-16 16:23:14'),
(334, 2, 6, 'Couple lifestyle Đà Lạt', 1800000.00, 'Chụp ảnh đôi ngoại cảnh, tự nhiên và giàu cảm xúc.', 'https://i.pinimg.com/736x/bf/5e/49/bf5e49e7062fc00feb1a461198aa98f6.jpg', '[\"https://i.pinimg.com/736x/64/c2/9d/64c29d36aa963ae723727c560001f206.jpg\",\"https://i.pinimg.com/1200x/21/1d/dd/211ddd9c37e190038cb3b575c777daad.jpg\"]', '[\"Concept\",\"Retouch\",\"Album mini\"]', 1.90, 142, 1, '12/06 - 15:00', 180, 1, 5, '2026-06-16 16:23:14'),
(335, 11, 6, 'Love story trong phố', 2200000.00, 'Chụp couple trong phố, cafe, street style.', 'https://i.pinimg.com/1200x/8b/00/a4/8b00a4d00fd643af0017e6be5a397309.jpg', '[\"https://i.pinimg.com/1200x/9d/e3/da/9de3da652483ed03158d917e1dd0672f.jpg\",\"https://i.pinimg.com/1200x/a3/e3/dc/a3e3dc01b70ca75e9f3592a8e9822fa6.jpg\"]', '[\"Makeup\",\"Retouch\"]', 4.20, 89, 0, '14/06 - 16:00', 150, 1, 5, '2026-06-16 16:23:14'),
(336, 20, 6, 'Couple studio tối giản', 1500000.00, 'Chụp couple trong studio với phong cách tối giản.', 'https://i.pinimg.com/1200x/80/ba/6d/80ba6d75407a7bcaf0b843654efb5124.jpg', '[\"https://i.pinimg.com/736x/a4/ba/dd/a4baddad6811e1ad64fc1c51063e577b.jpg\",\"https://i.pinimg.com/736x/7a/ce/c1/7acec1272414faa5de3ea436b15be8b6.jpg\"]', '[\"Studio\",\"Retouch\"]', 9.10, 63, 0, '17/06 - 10:00', 120, 1, 5, '2026-06-16 16:23:14'),
(337, 3, 5, 'Portrait editorial cá nhân', 2500000.00, 'Chụp ảnh cá nhân phong cách editorial, có hướng dẫn tạo dáng.', 'https://i.pinimg.com/736x/66/53/e9/6653e98495ff276ffd2f071d208b9f79.jpg', '[\"https://i.pinimg.com/736x/49/99/fb/4999fb2b2439e2eab91b90796f661fb5.jpg\",\"https://i.pinimg.com/736x/ca/cd/22/cacd22c47c995c775fd9d703d8dfcde3.jpg\"]', '[\"Stylist\",\"Retouch\",\"Tạo dáng\"]', 2.10, 116, 1, '11/06 - 09:00', 180, 1, 1, '2026-06-16 16:23:14'),
(338, 11, 5, 'Street portrait', 1600000.00, 'Chụp portrait đường phố, lifestyle và chỉnh màu.', 'https://i.pinimg.com/736x/7f/6d/ea/7f6dea8c0c4a009fd748093eab6e28a6.jpg', '[\"https://i.pinimg.com/736x/39/93/83/39938326bb88ddebf1fd47a0dc9bf185.jpg\",\"https://i.pinimg.com/736x/9b/06/f8/9b06f86077a74faf635aa66962e09e64.jpg\"]', '[\"Lifestyle\",\"Retouch\"]', 3.80, 77, 0, '13/06 - 16:00', 120, 1, 1, '2026-06-16 16:23:14'),
(339, 28, 5, 'Vintage film portrait', 1500000.00, 'Chụp ảnh cá nhân phong cách vintage film.', 'https://i.pinimg.com/1200x/58/5a/ea/585aea037b8a1d5f364358167d899f29.jpg', '[\"https://i.pinimg.com/1200x/95/f9/a7/95f9a72dd8ca32b42bd62677fc09cfaf.jpg\",\"https://i.pinimg.com/1200x/d3/0b/bd/d30bbdd512f5de127a22c051ff2f6042.jpg\"]', '[\"Vintage\",\"Film\",\"Retouch\"]', 6.40, 63, 0, '12/06 - 09:30', 90, 1, 1, '2026-06-16 16:23:14'),
(340, 8, 10, 'Event reportage Hà Nội', 2200000.00, 'Chụp sự kiện, hội nghị, khai trương theo phong cách reportage.', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80&fit=crop', '[\"https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&q=80&fit=crop\",\"https://images.unsplash.com/photo-1531058020387-3be344556be6?w=400&q=80&fit=crop\"]', '[\"Video\",\"Retouch\",\"Flycam\"]', 3.20, 54, 0, '20/06 - 10:00', 240, 1, 120, '2026-06-16 16:23:14'),
(341, 14, 9, 'Travel story Mũi Né', 1850000.00, 'Chụp travel story ngoại cảnh, phù hợp du lịch và lifestyle.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop', '[\"https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80&fit=crop\",\"https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80&fit=crop\"]', '[\"Concept\",\"Retouch\",\"Flycam\"]', 7.90, 38, 0, '18/06 - 08:30', 300, 1, 6, '2026-06-16 16:23:14'),
(342, 13, 8, 'Ảnh ẩm thực Sài Gòn', 1550000.00, 'Chụp món ăn, menu, nhà hàng và food styling.', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80&fit=crop', '[\"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80&fit=crop\",\"https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&q=80&fit=crop\"]', '[\"Studio\",\"Retouch\",\"Concept\"]', 4.50, 29, 0, '19/06 - 11:00', 150, 1, 30, '2026-06-16 16:23:14');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `service_package_options`
--

CREATE TABLE `service_package_options` (
  `id` int NOT NULL,
  `package_id` int NOT NULL,
  `option_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `system_logs`
--

CREATE TABLE `system_logs` (
  `id` bigint NOT NULL,
  `log_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `log_level` enum('INFO','WARNING','ERROR','DEBUG') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `log_message` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `log_detail` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `user_id` int DEFAULT NULL,
  `user_identifier` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_code` int DEFAULT NULL,
  `duration_ms` int DEFAULT NULL,
  `stack_trace` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `system_logs`
--

INSERT INTO `system_logs` (`id`, `log_id`, `log_level`, `category`, `log_message`, `log_detail`, `user_id`, `user_identifier`, `ip_address`, `status_code`, `duration_ms`, `stack_trace`, `created_at`) VALUES
(1, 'LOG_001', 'ERROR', 'Payment', 'Payment gateway timeout - MoMo', 'Giao dịch #TXN_20241130_001 bị timeout sau 30s', NULL, 'Nguyễn Thị Mai', '103.1.148.22', 504, 30412, NULL, '2026-06-24 03:32:15'),
(2, 'LOG_002', 'WARNING', 'Auth', 'Multiple failed login attempts', 'IP đã thử đăng nhập thất bại 5 lần', NULL, 'Unknown', '203.113.132.44', 401, 120, NULL, '2026-06-24 02:15:02'),
(3, 'LOG_003', 'INFO', 'Booking', 'Booking created successfully', 'Booking mới được tạo', NULL, 'Khách test', '27.72.105.88', 201, 342, NULL, '2026-06-21 16:21:20'),
(4, 'LOG_004', 'ERROR', 'API', 'Database connection pool exhausted', 'Số lượng kết nối DB đạt giới hạn', NULL, 'SYSTEM', '10.0.0.1', 500, 0, NULL, '2026-06-24 01:30:00'),
(5, 'LOG_005', 'INFO', 'AI', 'AI moderation scan completed', 'Quét tự động hoàn tất: 48 nội dung', NULL, 'AI_BOT', '10.0.0.2', 200, 8420, NULL, '2026-06-23 16:00:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `transactions`
--

CREATE TABLE `transactions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `type` enum('payment','deposit','refund') COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method` enum('cash','bank_transfer','momo','vnpay','zalopay') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `booking_id`, `amount`, `type`, `payment_method`, `transaction_code`, `status`, `paid_at`, `created_at`) VALUES
(3, 12, 45, 1500000.00, 'payment', 'vnpay', 'TXN20260624X', 'completed', '2026-06-24 14:26:00', '2026-06-24 14:20:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('customer','photographer','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'customer',
  `status` enum('active','inactive','banned') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `phone`, `email`, `password_hash`, `full_name`, `avatar_url`, `role`, `status`, `created_at`) VALUES
(1, '0900000000', 'admin@photobooking.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Super Admin', NULL, 'admin', 'active', '2026-05-28 03:22:07'),
(2, '0911111111', 'binhnguyen@test.com', '$2y$10$test', 'Hào Lê', 'https://i.pinimg.com/736x/d5/39/3f/d5393f1c798379d5dfdf1b85563074dc.jpg', 'photographer', 'active', '2026-06-10 16:05:12'),
(3, '0922222222', 'hungtrinh@test.com', '$2y$10$test', 'Bình Nguyễn', 'https://i.pinimg.com/736x/66/53/e9/6653e98495ff276ffd2f071d208b9f79.jpg', 'photographer', 'active', '2026-06-10 16:05:12'),
(4, '0933333333', 'minhanh@test.com', '$2y$10$test', 'Hoàng Anh', 'https://i.pinimg.com/736x/c9/12/65/c912651870f4269a0ef8d7833c8dc519.jpg', 'photographer', 'active', '2026-06-10 16:05:12'),
(5, '0944444444', 'tuankiet@test.com', '$2b$10$3IseDdaK4TpHXsyTDatgpetiRffO3.8wXhT7okb7KF9uKH.R4Esom', 'Tuấn Kiệt', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', 'photographer', 'active', '2026-06-10 16:05:12'),
(6, '0900000101', 'seed_wedding_01@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cưới 01', 'https://picsum.photos/seed/wedding-1/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(7, '0900000201', 'seed_family_01@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Gia Đình 01', 'https://picsum.photos/seed/family-1/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(8, '0900000301', 'seed_event_01@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Minh Anh', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80&fit=crop', 'photographer', 'active', '2026-06-10 17:02:01'),
(9, '0900000401', 'seed_commercial_01@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Thương Mại 01', 'https://picsum.photos/seed/commercial-1/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(10, '0900000501', 'seed_portrait_01@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cá Nhân 01', 'https://picsum.photos/seed/portrait-1/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(11, '0900000601', 'seed_couple_01@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Hưng Trịnh', 'https://i.pinimg.com/736x/7f/6d/ea/7f6dea8c0c4a009fd748093eab6e28a6.jpg', 'photographer', 'active', '2026-06-10 17:02:01'),
(12, '0900000701', 'seed_yearbook_01@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Kỉ Yếu 01', 'https://picsum.photos/seed/yearbook-1/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(13, '0900000801', 'seed_food_01@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Nhà Bếp Studio', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80&fit=crop', 'photographer', 'active', '2026-06-10 17:02:01'),
(14, '0900000901', 'seed_travel_01@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Anh Travel', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop', 'photographer', 'active', '2026-06-10 17:02:01'),
(15, '0900000102', 'seed_wedding_02@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cưới 02', 'https://picsum.photos/seed/wedding-2/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(16, '0900000202', 'seed_family_02@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Gia Đình 02', 'https://picsum.photos/seed/family-2/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(17, '0900000302', 'seed_event_02@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Linh Hoa', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80&fit=crop', 'photographer', 'active', '2026-06-10 17:02:01'),
(18, '0900000402', 'seed_commercial_02@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Thương Mại 02', 'https://picsum.photos/seed/commercial-2/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(19, '0900000502', 'seed_portrait_02@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cá Nhân 02', 'https://picsum.photos/seed/portrait-2/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(20, '0900000602', 'seed_couple_02@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Studio K', 'https://i.pinimg.com/1200x/80/ba/6d/80ba6d75407a7bcaf0b843654efb5124.jpg', 'photographer', 'active', '2026-06-10 17:02:01'),
(21, '0900000702', 'seed_yearbook_02@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Kỉ Yếu 02', 'https://picsum.photos/seed/yearbook-2/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(22, '0900000802', 'seed_food_02@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Food Product 02', 'https://picsum.photos/seed/food-2/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(23, '0900000902', 'seed_travel_02@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Travel 02', 'https://picsum.photos/seed/travel-2/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(24, '0900000103', 'seed_wedding_03@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cưới 03', 'https://picsum.photos/seed/wedding-3/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(25, '0900000203', 'seed_family_03@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Gia Đình 03', 'https://picsum.photos/seed/family-3/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(26, '0900000303', 'seed_event_03@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Sự Kiện 03', 'https://picsum.photos/seed/event-3/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(27, '0900000403', 'seed_commercial_03@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Thương Mại 03', 'https://picsum.photos/seed/commercial-3/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(28, '0900000503', 'seed_portrait_03@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'May Studio', 'https://i.pinimg.com/1200x/58/5a/ea/585aea037b8a1d5f364358167d899f29.jpg', 'photographer', 'active', '2026-06-10 17:02:01'),
(29, '0900000603', 'seed_couple_03@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Couple 03', 'https://picsum.photos/seed/couple-3/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(30, '0900000703', 'seed_yearbook_03@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Kỉ Yếu 03', 'https://picsum.photos/seed/yearbook-3/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(31, '0900000803', 'seed_food_03@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Food Product 03', 'https://picsum.photos/seed/food-3/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(32, '0900000903', 'seed_travel_03@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Travel 03', 'https://picsum.photos/seed/travel-3/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(33, '0900000104', 'seed_wedding_04@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cưới 04', 'https://picsum.photos/seed/wedding-4/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(34, '0900000204', 'seed_family_04@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Gia Đình 04', 'https://picsum.photos/seed/family-4/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(35, '0900000304', 'seed_event_04@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Sự Kiện 04', 'https://picsum.photos/seed/event-4/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(36, '0900000404', 'seed_commercial_04@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Thương Mại 04', 'https://picsum.photos/seed/commercial-4/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(37, '0900000504', 'seed_portrait_04@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cá Nhân 04', 'https://picsum.photos/seed/portrait-4/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(38, '0900000604', 'seed_couple_04@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Couple 04', 'https://picsum.photos/seed/couple-4/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(39, '0900000704', 'seed_yearbook_04@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Kỉ Yếu 04', 'https://picsum.photos/seed/yearbook-4/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(40, '0900000804', 'seed_food_04@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Food Product 04', 'https://picsum.photos/seed/food-4/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(41, '0900000904', 'seed_travel_04@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Travel 04', 'https://picsum.photos/seed/travel-4/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(42, '0900000105', 'seed_wedding_05@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cưới 05', 'https://picsum.photos/seed/wedding-5/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(43, '0900000205', 'seed_family_05@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Gia Đình 05', 'https://picsum.photos/seed/family-5/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(44, '0900000305', 'seed_event_05@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Sự Kiện 05', 'https://picsum.photos/seed/event-5/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(45, '0900000405', 'seed_commercial_05@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Thương Mại 05', 'https://picsum.photos/seed/commercial-5/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(46, '0900000505', 'seed_portrait_05@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cá Nhân 05', 'https://picsum.photos/seed/portrait-5/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(47, '0900000605', 'seed_couple_05@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Couple 05', 'https://picsum.photos/seed/couple-5/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(48, '0900000705', 'seed_yearbook_05@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Kỉ Yếu 05', 'https://picsum.photos/seed/yearbook-5/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(49, '0900000805', 'seed_food_05@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Food Product 05', 'https://picsum.photos/seed/food-5/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(50, '0900000905', 'seed_travel_05@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Travel 05', 'https://picsum.photos/seed/travel-5/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(51, '0900000106', 'seed_wedding_06@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cưới 06', 'https://picsum.photos/seed/wedding-6/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(52, '0900000206', 'seed_family_06@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Gia Đình 06', 'https://picsum.photos/seed/family-6/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(53, '0900000306', 'seed_event_06@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Sự Kiện 06', 'https://picsum.photos/seed/event-6/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(54, '0900000406', 'seed_commercial_06@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Thương Mại 06', 'https://picsum.photos/seed/commercial-6/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(55, '0900000506', 'seed_portrait_06@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cá Nhân 06', 'https://picsum.photos/seed/portrait-6/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(56, '0900000606', 'seed_couple_06@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Couple 06', 'https://picsum.photos/seed/couple-6/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(57, '0900000706', 'seed_yearbook_06@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Kỉ Yếu 06', 'https://picsum.photos/seed/yearbook-6/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(58, '0900000806', 'seed_food_06@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Food Product 06', 'https://picsum.photos/seed/food-6/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(59, '0900000906', 'seed_travel_06@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Travel 06', 'https://picsum.photos/seed/travel-6/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(60, '0900000107', 'seed_wedding_07@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cưới 07', 'https://picsum.photos/seed/wedding-7/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(61, '0900000207', 'seed_family_07@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Gia Đình 07', 'https://picsum.photos/seed/family-7/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(62, '0900000307', 'seed_event_07@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Sự Kiện 07', 'https://picsum.photos/seed/event-7/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(63, '0900000407', 'seed_commercial_07@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Thương Mại 07', 'https://picsum.photos/seed/commercial-7/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(64, '0900000507', 'seed_portrait_07@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cá Nhân 07', 'https://picsum.photos/seed/portrait-7/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(65, '0900000607', 'seed_couple_07@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Couple 07', 'https://picsum.photos/seed/couple-7/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(66, '0900000707', 'seed_yearbook_07@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Kỉ Yếu 07', 'https://picsum.photos/seed/yearbook-7/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(67, '0900000807', 'seed_food_07@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Food Product 07', 'https://picsum.photos/seed/food-7/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(68, '0900000907', 'seed_travel_07@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Travel 07', 'https://picsum.photos/seed/travel-7/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(69, '0900000108', 'seed_wedding_08@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cưới 08', 'https://picsum.photos/seed/wedding-8/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(70, '0900000208', 'seed_family_08@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Gia Đình 08', 'https://picsum.photos/seed/family-8/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(71, '0900000308', 'seed_event_08@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Sự Kiện 08', 'https://picsum.photos/seed/event-8/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(72, '0900000408', 'seed_commercial_08@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Thương Mại 08', 'https://picsum.photos/seed/commercial-8/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(73, '0900000508', 'seed_portrait_08@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cá Nhân 08', 'https://picsum.photos/seed/portrait-8/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(74, '0900000608', 'seed_couple_08@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Couple 08', 'https://picsum.photos/seed/couple-8/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(75, '0900000708', 'seed_yearbook_08@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Kỉ Yếu 08', 'https://picsum.photos/seed/yearbook-8/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(76, '0900000808', 'seed_food_08@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Food Product 08', 'https://picsum.photos/seed/food-8/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(77, '0900000908', 'seed_travel_08@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Travel 08', 'https://picsum.photos/seed/travel-8/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(78, '0900000109', 'seed_wedding_09@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cưới 09', 'https://picsum.photos/seed/wedding-9/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(79, '0900000209', 'seed_family_09@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Gia Đình 09', 'https://picsum.photos/seed/family-9/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(80, '0900000309', 'seed_event_09@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Sự Kiện 09', 'https://picsum.photos/seed/event-9/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(81, '0900000409', 'seed_commercial_09@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Thương Mại 09', 'https://picsum.photos/seed/commercial-9/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(82, '0900000509', 'seed_portrait_09@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cá Nhân 09', 'https://picsum.photos/seed/portrait-9/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(83, '0900000609', 'seed_couple_09@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Couple 09', 'https://picsum.photos/seed/couple-9/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(84, '0900000709', 'seed_yearbook_09@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Kỉ Yếu 09', 'https://picsum.photos/seed/yearbook-9/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(85, '0900000809', 'seed_food_09@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Food Product 09', 'https://picsum.photos/seed/food-9/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(86, '0900000909', 'seed_travel_09@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Travel 09', 'https://picsum.photos/seed/travel-9/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(87, '0900000110', 'seed_wedding_10@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cưới 10', 'https://picsum.photos/seed/wedding-10/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(88, '0900000210', 'seed_family_10@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Gia Đình 10', 'https://picsum.photos/seed/family-10/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(89, '0900000310', 'seed_event_10@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Sự Kiện 10', 'https://picsum.photos/seed/event-10/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(90, '0900000410', 'seed_commercial_10@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Thương Mại 10', 'https://picsum.photos/seed/commercial-10/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(91, '0900000510', 'seed_portrait_10@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Cá Nhân 10', 'https://picsum.photos/seed/portrait-10/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(92, '0900000610', 'seed_couple_10@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Couple 10', 'https://picsum.photos/seed/couple-10/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(93, '0900000710', 'seed_yearbook_10@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Kỉ Yếu 10', 'https://picsum.photos/seed/yearbook-10/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(94, '0900000810', 'seed_food_10@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Food Product 10', 'https://picsum.photos/seed/food-10/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(95, '0900000910', 'seed_travel_10@sudion.test', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHG', 'Photo Travel 10', 'https://picsum.photos/seed/travel-10/900/700', 'photographer', 'active', '2026-06-10 17:02:01'),
(134, 'zz123123', 'zz', '$2b$10$wiSnRFawM/f3H3eFpv70g.FT4eTAbbonG1m5Du5p/S4QATi/eiuCC', 'zz', NULL, 'photographer', 'active', '2026-06-24 08:03:14'),
(135, 'AUTO1782720071260828', 'datlich1@gmail.com', '$2b$10$kG80eTKNkxN7TbBX01ShGepsuesWHh1jyX4h1Xvcan/CrUbriyW9.', 'Hong Cóng Hôn', NULL, 'photographer', 'active', '2026-06-29 08:01:11');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `ai_recommendations`
--
ALTER TABLE `ai_recommendations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_target_type` (`target_type`),
  ADD KEY `idx_score` (`score`);

--
-- Chỉ mục cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer` (`customer_id`),
  ADD KEY `idx_package` (`package_id`),
  ADD KEY `idx_booking_date` (`booking_date`),
  ADD KEY `idx_status` (`status`);

--
-- Chỉ mục cho bảng `booking_requests`
--
ALTER TABLE `booking_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_code` (`booking_code`),
  ADD KEY `idx_booking_requests_photographer_date_time` (`photographer_id`,`shoot_date`,`shoot_time`,`shoot_end_time`),
  ADD KEY `idx_booking_requests_customer_email` (`customer_email`),
  ADD KEY `idx_booking_requests_booking_code` (`booking_code`);

--
-- Chỉ mục cho bảng `booking_reviews`
--
ALTER TABLE `booking_reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_id` (`booking_id`),
  ADD KEY `idx_rating` (`rating`);

--
-- Chỉ mục cho bảng `favorite_photographers`
--
ALTER TABLE `favorite_photographers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_fav` (`user_id`,`photographer_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_photographer` (`photographer_id`);

--
-- Chỉ mục cho bảng `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_messages_booking_code` (`booking_code`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_is_read` (`is_read`);

--
-- Chỉ mục cho bảng `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_password_reset_email` (`email`),
  ADD KEY `idx_password_reset_token` (`token`);

--
-- Chỉ mục cho bảng `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_id` (`transaction_id`),
  ADD KEY `idx_booking` (`booking_code`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created` (`created_at`);

--
-- Chỉ mục cho bảng `photographer_profiles`
--
ALTER TABLE `photographer_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_verification` (`verification_status`),
  ADD KEY `idx_rating` (`avg_rating`);

--
-- Chỉ mục cho bảng `refund_requests`
--
ALTER TABLE `refund_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_transaction` (`transaction_id`),
  ADD KEY `idx_status` (`status`);

--
-- Chỉ mục cho bảng `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `report_id` (`report_id`),
  ADD KEY `idx_reporter` (`reporter_user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_priority` (`priority`),
  ADD KEY `idx_target` (`target_type`,`target_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Chỉ mục cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_booking_review` (`booking_code`);

--
-- Chỉ mục cho bảng `service_categories`
--
ALTER TABLE `service_categories`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `service_options`
--
ALTER TABLE `service_options`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `service_packages`
--
ALTER TABLE `service_packages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_photographer` (`photographer_id`),
  ADD KEY `idx_category` (`category_id`);

--
-- Chỉ mục cho bảng `service_package_options`
--
ALTER TABLE `service_package_options`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_pkg_opt` (`package_id`,`option_id`),
  ADD KEY `option_id` (`option_id`);

--
-- Chỉ mục cho bảng `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `log_id` (`log_id`),
  ADD KEY `idx_level` (`log_level`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_level_created` (`log_level`,`created_at`);

--
-- Chỉ mục cho bảng `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_code` (`transaction_code`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_booking` (`booking_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_tx_code` (`transaction_code`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_status` (`status`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `ai_recommendations`
--
ALTER TABLE `ai_recommendations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `booking_requests`
--
ALTER TABLE `booking_requests`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT cho bảng `booking_reviews`
--
ALTER TABLE `booking_reviews`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `favorite_photographers`
--
ALTER TABLE `favorite_photographers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `photographer_profiles`
--
ALTER TABLE `photographer_profiles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT cho bảng `refund_requests`
--
ALTER TABLE `refund_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `service_categories`
--
ALTER TABLE `service_categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `service_options`
--
ALTER TABLE `service_options`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `service_packages`
--
ALTER TABLE `service_packages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=343;

--
-- AUTO_INCREMENT cho bảng `service_package_options`
--
ALTER TABLE `service_package_options`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=136;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `ai_recommendations`
--
ALTER TABLE `ai_recommendations`
  ADD CONSTRAINT `ai_recommendations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `service_packages` (`id`);

--
-- Các ràng buộc cho bảng `booking_reviews`
--
ALTER TABLE `booking_reviews`
  ADD CONSTRAINT `booking_reviews_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `favorite_photographers`
--
ALTER TABLE `favorite_photographers`
  ADD CONSTRAINT `favorite_photographers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorite_photographers_ibfk_2` FOREIGN KEY (`photographer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `photographer_profiles`
--
ALTER TABLE `photographer_profiles`
  ADD CONSTRAINT `photographer_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `refund_requests`
--
ALTER TABLE `refund_requests`
  ADD CONSTRAINT `refund_requests_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `service_packages`
--
ALTER TABLE `service_packages`
  ADD CONSTRAINT `service_packages_ibfk_1` FOREIGN KEY (`photographer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `service_packages_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`);

--
-- Các ràng buộc cho bảng `service_package_options`
--
ALTER TABLE `service_package_options`
  ADD CONSTRAINT `service_package_options_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `service_packages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `service_package_options_ibfk_2` FOREIGN KEY (`option_id`) REFERENCES `service_options` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;
SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
