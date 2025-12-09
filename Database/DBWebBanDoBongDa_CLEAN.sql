-- =====================================================
-- Database: my_store (Clean Version for Free Hosting)
-- Compatible with: FreeSQLDatabase.com, db4free.net
-- =====================================================

-- Create and use database
CREATE DATABASE IF NOT EXISTS `my_store` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `my_store`;

-- =====================================================
-- Table: account
-- =====================================================
DROP TABLE IF EXISTS `account`;
CREATE TABLE `account` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `account` VALUES 
(37,'user@gmail.com','hiepUser','$2y$10$c0o7hyazY0CPSNDmV6hKTO1Xn9sQH37zjvdnHoPBuE2oFcfnmnChu','user','2025-05-09 15:48:32','2025-11-14 04:09:14',NULL,NULL),
(39,'hiep542004s@gmail.com','hiep','$2y$10$4QJDo5XYYCXFQVJNB16JLeGX/Q4N6chN3RhVyCBCX4QabRi4xSuzC','user','2025-05-12 11:53:19','2025-05-23 11:41:10',NULL,NULL),
(41,'admin@gmail.com','admin','$2y$10$y2TWpCrT9XImGxKUTSdHIO/vcugZ/La.kw8sEPvdEgzZDnourtO3W','admin','2025-05-23 12:47:29','2025-05-23 12:47:47',NULL,NULL),
(42,'user@user.com','user','$2b$10$4wD7.gGtatFiztGauuC6yu5RyHsLehBF4DaFP77ljuLihq/eQHOsm','user','2025-11-13 17:40:57','2025-11-13 17:40:57',NULL,NULL),
(43,'admin@admin.com','admin','$2b$10$QZBG9odfjCmeuFR/24Qc7.NHN0jsmK3k0sh9mkwzhDd8SjvnmQ3J6','admin','2025-11-13 18:57:25','2025-11-13 19:07:48',NULL,NULL);

-- =====================================================
-- Table: address
-- =====================================================
DROP TABLE IF EXISTS `address`;
CREATE TABLE `address` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `city` varchar(100) NOT NULL,
  `district` varchar(100) NOT NULL,
  `ward` varchar(100) NOT NULL,
  `street` varchar(255) NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `address_account_fk` (`account_id`),
  CONSTRAINT `address_account_fk` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `address` VALUES 
(9,39,'hiep','0977850642','Thành phố Hồ Chí Minh','Thành phố Thủ Đức','Phường Linh Trung','96 Lê Văn Chí',1),
(10,42,'Lê Đức Thịnh','0383190880','Tỉnh Phú Thọ','Huyện Thanh Thuỷ','Xã Đồng Trung','Đạ teh, lâm đồng',1);

-- =====================================================
-- Table: category
-- =====================================================
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `category` VALUES 
(1,'Áo Đấu','Áo đấu các câu lạc bộ và đội tuyển','category_ao.jpg','2025-01-01 00:00:00'),
(2,'Quần Đấu','Quần đấu bóng đá','category_quan.jpg','2025-01-01 00:00:00'),
(3,'Giày','Giày đá bóng chuyên nghiệp','category_giay.jpg','2025-01-01 00:00:00'),
(4,'Phụ Kiện','Tất, băng đội trưởng, bảo hộ','category_phukien.jpg','2025-01-01 00:00:00');

-- =====================================================
-- Table: brand
-- =====================================================
DROP TABLE IF EXISTS `brand`;
CREATE TABLE `brand` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `country` varchar(100) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `brand` VALUES 
(1,'Manchester United','England','mu_logo.png'),
(2,'Real Madrid','Spain','real_logo.png'),
(3,'Barcelona','Spain','barca_logo.png'),
(4,'PSG','France','psg_logo.png'),
(5,'Inter Miami','USA','miami_logo.png'),
(6,'Atletico Nacional','Colombia','nacional_logo.png');

-- =====================================================
-- Table: size
-- =====================================================
DROP TABLE IF EXISTS `size`;
CREATE TABLE `size` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(10) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `size` VALUES 
(1,'S','Small'),
(2,'M','Medium'),
(3,'L','Large'),
(4,'XL','Extra Large'),
(5,'XXL','Double Extra Large'),
(6,'XXXL','Triple Extra Large');

-- =====================================================
-- Table: product
-- =====================================================
DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `brand_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `discount_percent` int DEFAULT '0',
  `material` varchar(100) DEFAULT NULL,
  `origin` varchar(100) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_category_fk` (`category_id`),
  KEY `product_brand_fk` (`brand_id`),
  CONSTRAINT `product_category_fk` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`),
  CONSTRAINT `product_brand_fk` FOREIGN KEY (`brand_id`) REFERENCES `brand` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `product` VALUES 
(1,1,1,'Áo bóng đá MU đỏ sân nhà 24/25','Áo MU đỏ mùa giải 24/25',139000.00,25,'100% Polyester','Vietnam','ao_mu_do.jpg','2025-01-01 00:00:00','2025-01-01 00:00:00'),
(2,1,2,'Áo Bóng Đá Câu Lạc Bộ Real Madrid Đen Rồng Viền Tím 2024-2025','Áo Real Madrid phiên bản rồng đen',120000.00,30,'100% Polyester','Vietnam','ao_real_den_rong.jpg','2025-01-01 00:00:00','2025-01-01 00:00:00'),
(3,1,6,'Mẫu áo bóng đá Câu lạc bộ Atlético Nacional sân nhà 2023 màu xanh lá V3499','Áo Atlético Nacional xanh lá',159000.00,15,'100% Polyester','Vietnam','ao_nacional_xanh.jpg','2025-01-01 00:00:00','2025-01-01 00:00:00'),
(4,1,5,'Đồ Đá Banh CLB Miami Màu Hồng 2023','Áo Miami màu hồng Messi',169000.00,20,'100% Polyester','Vietnam','ao_miami_hong.jpg','2025-01-01 00:00:00','2025-01-01 00:00:00');

-- =====================================================
-- Table: product_sizes
-- =====================================================
DROP TABLE IF EXISTS `product_sizes`;
CREATE TABLE `product_sizes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `size_id` int NOT NULL,
  `stock_quantity` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_size_unique` (`product_id`,`size_id`),
  KEY `product_sizes_size_fk` (`size_id`),
  CONSTRAINT `product_sizes_product_fk` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_sizes_size_fk` FOREIGN KEY (`size_id`) REFERENCES `size` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `product_sizes` VALUES 
(1,1,1,36),(2,1,2,44),(3,1,3,24),(4,1,4,15),(5,1,5,9),
(6,2,1,20),(7,2,2,30),(8,2,3,25),(9,2,4,18),(10,2,5,12),
(11,3,1,10),(12,3,2,20),(13,3,3,11),(14,3,4,23),(15,3,5,6),
(16,4,1,15),(17,4,2,25),(18,4,3,20),(19,4,4,10),(20,4,5,8),(21,4,6,5);

-- =====================================================
-- Table: orders
-- =====================================================
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `address_id` int DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','shipping','delivered','cancelled') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT 'COD',
  `payment_status` enum('unpaid','paid','refunded') DEFAULT 'unpaid',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `orders_account_fk` (`account_id`),
  KEY `orders_address_fk` (`address_id`),
  CONSTRAINT `orders_account_fk` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_address_fk` FOREIGN KEY (`address_id`) REFERENCES `address` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: order_details
-- =====================================================
DROP TABLE IF EXISTS `order_details`;
CREATE TABLE `order_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `size_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount_percent` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `order_details_order_fk` (`order_id`),
  KEY `order_details_product_fk` (`product_id`),
  KEY `order_details_size_fk` (`size_id`),
  CONSTRAINT `order_details_order_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_details_product_fk` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `order_details_size_fk` FOREIGN KEY (`size_id`) REFERENCES `size` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: rating
-- =====================================================
DROP TABLE IF EXISTS `rating`;
CREATE TABLE `rating` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `account_id` int NOT NULL,
  `rating` int NOT NULL CHECK ((`rating` >= 1) AND (`rating` <= 5)),
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `rating_product_fk` (`product_id`),
  KEY `rating_account_fk` (`account_id`),
  CONSTRAINT `rating_account_fk` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rating_product_fk` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- AI Tables
-- =====================================================

DROP TABLE IF EXISTS `ai_conversations`;
CREATE TABLE `ai_conversations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `conversation_id` varchar(255) NOT NULL,
  `user_id` int DEFAULT NULL,
  `role` enum('user','assistant','system','function') NOT NULL,
  `message` text NOT NULL,
  `function_name` varchar(100) DEFAULT NULL,
  `function_args` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ai_conv_id` (`conversation_id`),
  KEY `idx_ai_conv_user` (`user_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `ai_memory`;
CREATE TABLE `ai_memory` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `key_name` varchar(100) NOT NULL,
  `value` text NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_key_unique` (`user_id`,`key_name`),
  KEY `idx_ai_mem_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `embeddings`;
CREATE TABLE `embeddings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `embedding_text` text NOT NULL,
  `embedding_vector` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_id` (`product_id`),
  KEY `idx_embeddings_product` (`product_id`),
  CONSTRAINT `embeddings_product_fk` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Done! Database ready to use
-- =====================================================
