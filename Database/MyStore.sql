-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: my_store
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '16ea95b4-b02f-11f0-bb02-201e88f29288:1-2082';

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES (37,'user@gmail.com','hiepUser','$2y$10$c0o7hyazY0CPSNDmV6hKTO1Xn9sQH37zjvdnHoPBuE2oFcfnmnChu','user','2025-05-09 15:48:32','2025-11-14 04:09:14',NULL,NULL),(39,'hiep542004s@gmail.com','hiep','$2y$10$4QJDo5XYYCXFQVJNB16JLeGX/Q4N6chN3RhVyCBCX4QabRi4xSuzC','user','2025-05-12 11:53:19','2025-05-23 11:41:10',NULL,NULL),(41,'admin@gmail.com','admin','$2y$10$y2TWpCrT9XImGxKUTSdHIO/vcugZ/La.kw8sEPvdEgzZDnourtO3W','admin','2025-05-23 12:47:29','2025-05-23 12:47:47',NULL,NULL),(42,'user@user.com','user','$2b$10$4wD7.gGtatFiztGauuC6yu5RyHsLehBF4DaFP77ljuLihq/eQHOsm','user','2025-11-13 17:40:57','2025-11-13 17:40:57',NULL,NULL),(43,'admin@admin.com','admin','$2b$10$QZBG9odfjCmeuFR/24Qc7.NHN0jsmK3k0sh9mkwzhDd8SjvnmQ3J6','admin','2025-11-13 18:57:25','2025-11-13 19:07:48',NULL,NULL),(44,'user1@user.com','User1','$2b$10$C6.RBoW5tiCeDA2O9tWc..7OIeFI0Bb6zf.f4Oy0w5A.G/rbPaGV6','user','2025-12-23 04:28:30','2025-12-23 04:28:30',NULL,NULL),(45,'hoanghuunam@gmail.com','Nam','$2b$10$d602rDTJN8IHrPA9UMMlgOa4Xyrapw1MfX1SiESVlGF9ho7clWIi6','user','2026-03-26 17:00:03','2026-03-26 17:00:03',NULL,NULL),(46,'leducthinh203@gmail.com','leducthinh','$2b$10$No9aCuIJJoUaEWgXn1ZVXODQYeLxu/XRLrLJzT2f8EmrjtnaDK2nK','user','2026-03-26 17:15:41','2026-03-26 17:30:45','d2626492528d19b0e434653325572087d0104a6dbebbb321d4903991eeecfe8a','2026-03-27 00:40:45');
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `address` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `provinceName` varchar(255) NOT NULL,
  `districtName` varchar(255) NOT NULL,
  `wardName` varchar(255) NOT NULL,
  `address_detail` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `address_account_fk` (`account_id`),
  CONSTRAINT `address_account_fk` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `address`
--

LOCK TABLES `address` WRITE;
/*!40000 ALTER TABLE `address` DISABLE KEYS */;
INSERT INTO `address` VALUES (9,39,'hiep','0977850642','Thành phố Hồ Chí Minh','Thành phố Thủ Đức','Phường Linh Trung','96 Lê Văn Chí'),(10,42,'Lê Đức Thịnh','0383190880','Tỉnh Phú Thọ','Huyện Thanh Thuỷ','Xã Đồng Trung','Đạ teh, lâm đồng');
/*!40000 ALTER TABLE `address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `idx_category_name` (`name`(50))
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (11,'Bộ đồ','áo + quần'),(12,'Áo',NULL),(13,'Quần',NULL),(14,'Giày',NULL),(15,'Phụ kiện',NULL);
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `message` text NOT NULL,
  `file_path` text DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_details`
--

DROP TABLE IF EXISTS `order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_sizes_id` int DEFAULT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `order_details_ibfk_3` (`product_sizes_id`),
  KEY `idx_od_order` (`order_id`),
  KEY `idx_od_ps` (`product_sizes_id`),
  CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `order_details_ibfk_3` FOREIGN KEY (`product_sizes_id`) REFERENCES `product_sizes` (`id`),
  CONSTRAINT `chk_od_price` CHECK ((`price` >= 0)),
  CONSTRAINT `chk_od_qty` CHECK ((`quantity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=191 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_details`
--

LOCK TABLES `order_details` WRITE;
/*!40000 ALTER TABLE `order_details` DISABLE KEYS */;
INSERT INTO `order_details` VALUES (151,101,70,1,159000.00),(152,102,69,1,159000.00),(153,103,78,1,120000.00),(154,103,107,1,890000.00),(157,105,67,2,159000.00),(158,106,66,5,159000.00),(160,108,67,2,159000.00),(161,109,66,2,135150.00),(162,110,83,2,135200.00),(166,114,83,3,135200.00),(167,115,80,1,135200.00),(171,119,77,1,78000.00),(172,120,83,1,135200.00),(173,121,83,1,135200.00),(174,122,81,1,135200.00),(176,124,84,2,135200.00),(177,125,84,1,135200.00),(189,134,77,1,78000.00),(190,134,84,1,135200.00);
/*!40000 ALTER TABLE `order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `status` enum('pending','confirmed','shipping','delivered','cancelled','received') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `account_id` int DEFAULT NULL,
  `total_amount` decimal(20,2) DEFAULT '0.00',
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'cod',
  `is_paid` tinyint(1) NOT NULL DEFAULT '0',
  `payment_info` text COMMENT 'Thông tin giao dịch thanh toán (JSON format)',
  PRIMARY KEY (`id`),
  KEY `orders_account_fk` (`account_id`),
  KEY `idx_orders_account_created` (`account_id`,`created_at`),
  KEY `idx_orders_account` (`account_id`,`id` DESC),
  KEY `idx_orders_status` (`status`),
  KEY `idx_payment_method` (`payment_method`),
  KEY `idx_is_paid` (`is_paid`),
  CONSTRAINT `orders_account_fk` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_payment_method` CHECK ((`payment_method` in (_utf8mb4'cod',_utf8mb4'bank',_utf8mb4'vnpay')))
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (101,'hiep','0977850642','Thành phố Hồ Chí Minh -- Quận 7 -- Phường Phú Mỹ -- yytydyf','pending','2025-05-20 01:31:31',NULL,159000.00,'cod',0,NULL),(102,'hiep','0977850642','Thành phố Hồ Chí Minh -- Huyện Hóc Môn -- Xã Xuân Thới Thượng -- tổ 1 thôn tân bình','pending','2025-05-20 01:40:33',NULL,159000.00,'cod',0,NULL),(103,'hiep','0977850642','Thành phố Hồ Chí Minh -- Thành phố Thủ Đức -- Phường Linh Trung -- 96 Lê Văn Chí','received','2025-05-23 11:53:04',39,1010000.00,'cod',0,NULL),(104,'hiep','0977850642','123 abc','pending','2025-11-13 18:40:01',42,2505000.00,'cod',0,NULL),(105,'hiep','0977850642','123 abc','pending','2025-11-13 18:44:17',42,318000.00,'cod',0,NULL),(106,'hiep','0977850642','124/22 xóm chiếu','pending','2025-11-13 18:47:51',42,795000.00,'cod',0,NULL),(107,'hiep','0977850642','123 abc','pending','2025-11-13 18:49:54',42,318000.00,'cod',0,NULL),(108,'hiep','0977850642','123 hàng mã','pending','2025-11-13 18:51:04',42,318000.00,'cod',0,NULL),(109,'hiep','0977850642','123 abc','received','2025-11-13 20:42:09',42,270300.00,'cod',1,NULL),(110,'Lê Đức Thịnh','0383190880','Đạ teh, lâm đồng','received','2025-11-14 02:36:48',42,270400.00,'cod',1,NULL),(114,'Lê Đức Thịnh','0383190880','Đạ teh, lâm đồng','received','2025-11-14 02:49:49',42,405600.00,'cod',1,NULL),(115,'Lê Đức Thịnh','0383190880','Đạ teh, lâm đồng','pending','2025-11-14 03:39:36',42,135200.00,'vnpay',0,NULL),(119,'Lê Đức Thịnh','0383190880','Đạ teh, lâm đồng','pending','2025-11-14 03:52:09',42,78000.00,'vnpay',0,NULL),(120,'Lê Đức Thịnh','0383190880','Đạ teh, lâm đồng','pending','2025-11-14 03:52:53',42,135200.00,'vnpay',0,NULL),(121,'Lê Đức Thịnh','0383190880','Đạ teh, lâm đồng','pending','2025-11-14 03:57:49',42,135200.00,'vnpay',0,NULL),(122,'Lê Đức Thịnh','0383190880','Đạ teh, lâm đồng','pending','2025-11-14 04:01:50',42,135200.00,'vnpay',0,NULL),(124,'Lê Đức Thịnh','0383190880','Đạ teh, lâm đồng','received','2025-11-14 04:05:59',42,270400.00,'vnpay',0,NULL),(125,'Lê Đức Thịnh','0383190880','Đạ teh, lâm đồng','pending','2025-11-14 04:07:13',42,135200.00,'cod',0,NULL),(134,'Lê Đức Thịnh','0383190880','Đạ teh, lâm đồng','pending','2025-11-14 04:55:16',42,213200.00,'vnpay',0,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `discount_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `idx_product_name` (`name`),
  KEY `idx_product_price` (`price`),
  KEY `idx_product_category` (`category_id`),
  KEY `idx_product_category_price` (`category_id`,`price`),
  FULLTEXT KEY `ft_product_name_desc` (`name`,`description`),
  CONSTRAINT `product_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`),
  CONSTRAINT `product_discount_chk` CHECK (((`discount_percent` >= 0.00) and (`discount_percent` <= 100.00)))
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (60,'Mẫu áo bóng đá Câu lạc bộ Atlético Nacional sân nhà 2023 màu xanh lá V3499','Nhà sản xuất:\r\n– Đặt gia công theo tiêu chuẩn áo đấu CLB Atlético Nacional, lấy cảm hứng từ mẫu chính hãng mùa giải 2023.\r\n– Xuất xứ: Việt Nam.\r\n\r\nChất liệu:\r\n– Vải thun lạnh cao cấp (polyester co giãn 4 chiều)\r\n– Mềm mại, thấm hút mồ hôi tốt, không nhăn, thoáng mát – thích hợp chơi thể thao hoặc mặc thường ngày.\r\n\r\nMàu sắc:\r\n– Xanh lá cây chủ đạo kết hợp với các chi tiết trắng – theo tông màu sân nhà truyền thống của Atlético Nacional mùa giải 2023.\r\n\r\n',159000.00,20.00,'/images/ao.jpg',12),(62,'Áo Bóng Đá CLB Arsenal 2022 Màu Hồng Đẹp Mê','Bùng Nổ Cá Tính Với Áo Bóng Đá CLB Arsenal 2022 Màu Hồng – Độc Lạ\r\nSở hữu ngay mẫu áo bóng đá Arsenal 2022 phiên bản màu hồng cực hot – lựa chọn lý tưởng cho các đội nữ hoặc những team muốn tạo dấu ấn riêng trên sân cỏ.\r\n\r\nTông màu hồng rực rỡ, kết hợp họa tiết đen đầy cá tính, tạo nên phong cách nổi bật, không \"đụng hàng\".\r\n\r\nThiết kế cổ tim trẻ trung, khỏe khoắn, logo thêu nổi bật cùng các chi tiết in sắc nét, chỉn chu đến từng đường kim mũi chỉ.\r\n\r\nChất liệu thun mịn cao cấp – thấm hút mồ hôi nhanh, thoáng mát, co giãn tốt, mang lại sự thoải mái tối đa khi vận động.',120000.00,35.00,'/images/bo-ao-da-banh-clb-arsenal-2022-mau-hong-cuc-dep.jpg',11),(63,'Đồ Đá Banh CLB Miami Màu Hồng 2023','Áo thể thao màu hồng thiết kế 2023 là một tác phẩm tinh tế kết hợp giữa phong cách đương đại và sự tôn vinh truyền thống của đội bóng. Được sáng tạo bởi các nhà thiết kế tài năng, mỗi chi tiết được chăm chút tỉ mỉ, tạo nên một bộ trang phục không chỉ thể hiện niềm tự hào của đội bóng mà còn mang đến sự tự tin cho người mặc.\r\nGiới thiệu đồ Quần Áo Thể Thao Clb Miami Hồng Thiết Kế Mới Nhất 2023 \r\nĐồ đá banh áo CLB Arsenal 2023 sân khách là sản phẩm tiếp theo mà Mata Sport muốn giới thiệu đến những người đam mê thời trang thể thao. Mẫu thiết kế này có gì thú vị? Chúng ta sẽ cùng khám phá ngay dưới đây nhé!\r\nMàu hồng là màu đặc trưng của mẫu áo đấu clb Miami với họa tiết vô cùng độc lạ và khác biệt. Sự kết hợp hài hòa giữa tông màu trắng đen và hồng sẽ tạo được sự khác biệt của mẫu áo. \r\nBa đường sọc trên vai kéo dài màu đen. Kết hợp với chi tiết cổ áo tròn và đường bo ống tay áo đơn giản đồng màu áo chủ đạo. Tạo sự cân đối cho chiếc áo và mang đến sự khỏe khoắn mạnh mẽ cho người mặc. \r\nSự nổi bật trong chi tiết logo thương hiệu Mata Sport, nhà tài trợ (nếu có) cùng bộ font số chữ bằng màu đen đã khiến cho chiếc áo trở lên thu hút hơn. \r\nQuần short đen viền trắng là sự kết hợp hoàn hảo cho đồ áo đấu Miami màu hồng thiết kế mới nhất của Mata Sport.\r\nForm dáng hiện đại trẻ trung năng động. Sự tỉ mỉ trong từng đường kim mũi chỉ và các chi tiết in sắc nét. Chất lượng được chú trọng hàng đầu trong sản phẩm. \r\nĐược may bằng chất liệu thể thao cao cấp, thoáng mát, co giãn, thấm hút mồ hôi tốt. Bạn sẽ thật thoải mái và tự tin khi hoạt động cùng niềm đam mê sân cỏ. ',169000.00,20.00,'/images/Miami-2.jpg',11),(64,'Áo bóng đá MU đỏ sân nhà 24/25','Chi tiết áo MU đỏ mùa giải 24/25\r\n\r\nChất liệu: 100% Polyester – Thun lạnh co giản và thấm hút / Thoát mồ hôi tốt\r\nKiểu dáng: Regular Form – Form suông  châu Á\r\nSize: S – M – L – XL – 2XL\r\nLogo thêu chỉ chắc chắn, các hoạ tiết in chuyển sắc nét.\r\nÁo bóng đá MU sân nhà mùa giải 24/25 hàng Việt Nam\r\nCác sản phẩm trang phục áo đá banh câu lạc bộ được bán nhiều trên thị trường, từ nhiều xưởng uy tín tại Việt Nam. Sporter tin tưởng và chọn giúp bạn những sản phẩm với chất lượng tốt nhất và giống với áo đấu nhất. Các mẫu áo hàng Việt Nam sẽ không có logo của các nhà sản xuất thể thao ở ngực phải (Vì lý do bản quyền hình ảnh).\r\n\r\nƯu điểm:\r\n\r\nThiết kế Regular Form, form suông mặc thoải mái và phù hợp nhiều vóc dáng. Form size Châu á.\r\nGiá thành rẻ hơn hàng Thái Lan, tiết kiệm chi phí.\r\nĐộ bền tương xứng với giá tiền, có thể sử dụng lên đến 2 năm.\r\nCác logo được thêu vào, tránh được trường hợp bong tróc.\r\nChất liệu thun lạnh co giản 2 chiều, nhưng đã được cải thiện tốt hơn theo thời gian.\r\n\r\nNhược điểm\r\n\r\nSẽ không có độ chính xác 99% như các mẫu hàng Thái Lan hay chính hãng.\r\nChất liệu thun lạnh sẽ không có sự thoát mồ hôi tốt như hàng Thái Lan hay áo không logo.',139000.00,25.00,'/images/Vn-mu-do-2024-1.jpg',11),(65,'Áo Bóng Đá Câu Lạc Bộ Real Madrid Đen Rồng Viền Tím 2024-2025','Áo Bóng Đá Câu Lạc Bộ Real Madrid Đen Rồng Viền Tím 2024-2025\r\n\r\nÁo bóng đá Câu lạc bộ Real Madrid Đen Rồng Viền Tím phiên bản mùa giải 2024-2025 là sản phẩm mới nhất của Câu lạc bộ Real Madrid 2024-2025  dành cho người hâm mộ đội bóng Hoàng gia Tây Ban Nha. Chiếc áo bóng đá được thiết kế với tông màu Đen Rồng Viền Tím tinh tế không chỉ mang đến sự sang trọng mà còn thể hiện tinh thần chiến đấu mạnh mẽ của đội bóng.\r\n\r\n1. THÔNG TIN SẢN PHẨM\r\n\r\n- Chất liệu: nhẹ, thoáng khí, hút ẩm tốt\r\n\r\n+ Hàng Thun Lạnh\r\n\r\n+ Hàng Thun Co Giãn\r\n\r\n+ Hàng Mè Caro\r\n\r\n- Công nghệ: Thấm hút mồ hôi nhanh chóng\r\n\r\n- Thiết kế: Tông màu Đen Rồng Viền Tím chủ đạo mang lại vẻ ngoài hiện đại và mạnh mẽ',120000.00,30.00,'/images/z6034406454892_5775fd5a2502c82d34296edf570a5033_11zon_6767_HasThumb_Thumb.jpg',11),(66,'Áo đội tuyển Tây Ban Nha năm 2016 - 2018','Bộ trang phục này là mẫu áo sân nhà (home kit) của đội tuyển Tây Ban Nha, được thiết kế với tông màu đỏ sẫm đặc trưng của quốc gia này. Áo có cổ tròn và viền tay áo màu vàng, tạo điểm nhấn hài hòa với tổng thể. Ba sọc kẻ đặc trưng của Adidas, màu vàng, chạy dọc hai bên vai áo. Logo của nhà tài trợ Adidas được đặt ở ngực phải, còn logo của Liên đoàn bóng đá Hoàng gia Tây Ban Nha (RFEF) với huy hiệu vương miện được đặt ở ngực trái, thể hiện niềm tự hào dân tộc.\r\n\r\nPhía trước áo, số \"10\" lớn màu vàng được in nổi bật, tượng trưng cho vị trí của một cầu thủ quan trọng, thường là tiền vệ tấn công hoặc đội trưởng. Phía sau áo, cũng là số \"10\" lớn màu vàng, nhưng kèm theo dòng chữ \"TÊN RIÊNG\" ở phía trên, cho thấy đây là một mẫu áo có thể cá nhân hóa tên của người mặc.\r\n\r\nQuần đùi cũng có màu đỏ sẫm tương tự, với các chi tiết màu vàng ở viền túi và hai bên hông. Số \"10\" cũng được in trên ống quần, đồng bộ với áo. Tất trắng cao cổ hoàn thiện bộ trang phục, mang lại vẻ ngoài chuyên nghiệp và năng động. Tổng thể bộ trang phục toát lên sự mạnh mẽ, truyền thống và tinh thần chiến đấu của đội tuyển Tây Ban Nha.\r\n\r\nChất liệu: Thường thì áo bóng đá của các đội tuyển quốc gia được sản xuất bởi Adidas sẽ sử dụng các công nghệ vải tiên tiến để tối ưu hiệu suất cho cầu thủ. Các chất liệu phổ biến bao gồm:\r\n\r\n· 100% Polyester tái chế: Adidas thường sử dụng chất liệu này để giảm thiểu tác động đến môi trường.\r\n\r\n· Công nghệ AEROREADY hoặc Climacool/Climalite (tùy thuộc vào năm sản xuất): Đây là các công nghệ độc quyền của Adidas giúp thấm hút mồ hôi hiệu quả, giữ cho người mặc luôn khô ráo và thoáng mát, ngay cả khi vận động cường độ cao. Vải thường có kết cấu nhẹ, thoáng khí và có khả năng co giãn tốt để tạo sự thoải mái tối đa cho người mặc.\r\n\r\nNhìn chung, đây là một bộ trang phục chất lượng cao, được thiết kế để mang lại cả tính thẩm mỹ và hiệu suất cho cầu thủ cũng như người hâm mộ.',175000.00,0.00,'/images/doi_tuyen_Tay_Ban_Nha_nam_2016-2018.jpg',11),(67,'Găng Tay Thủ Môn Reusch Attrakt Fusion Carbon® 3D 5570998 7784','Evolution Negative Cut (ESS™): Kiểu cắt ôm sát ngón tay, kết hợp giữa thiết kế Negative Cut và Roll Finger, mang lại cảm giác bóng tốt hơn và diện tích tiếp xúc lớn hơn.\r\nPunch Zone: Lớp cao su được làm bằng Carbon® 3D được thêm trên mu bàn tay, hỗ trợ khi đấm bóng và bảo vệ tay khỏi chấn thương khi tiếp xúc với bóng.Chất liệu lòng bàn tay: Reusch Grip Fusion – loại latex cao cấp của Đức, kết hợp giữa độ bám dính mạnh mẽ và khả năng chống mài mòn, phù hợp với mọi điều kiện sân bãi và thời tiết\r\n',2990000.00,0.00,'/images/gang-tay-reusch-attrakt-fusion-carbon-3d-5570998-7784.png',15),(68,'Găng tay thủ môn GOLDEN STAR - Màu vàng','Thông số chi tiết:\r\n\r\nMút CONTACT PRO - Cao su Đức  : Lòng bàn tay Dày 4mm với độ ma sát tối đa và khả năng kiểm soát không giới hạn. \r\nBack Hand - LATEX GERMAN làm bằng chất liệu vải co giãn cao cấp, giúp cho đôi tay được thoải mái, linh hoạt mỗi khi sử dụng. Ngoài ra còn giúp đôi găng thoáng mát hơn, thoát mồ hôi tốt hơn khi sử dụng\r\nCông nghệ thoát khí ngón tay latex\r\nDòng găng HYBIRD ROLL : ôm chặt lòng bàn tay.\r\nSponge Lining : Mút xốp lót trong chống trơn, tạo cảm giác êm và bắt bóng tốt hơn.\r\nHand Strap - Dây Đeo Cổ Tay : Hỗ trợ giữ chắc găng và cổ tay.\r\nWrist - Spandex cổ tay co giãn tốt, ôm sát với cổ tay người sử dụng, tạo cảm giác chắc chắn.',890000.00,0.00,'/images/pvn3915-17-gang-tay-golden-star-nguyen-manh-do.jpg',15),(69,'Găng tay thủ môn Wika 01 màu xanh lá','Găng tay thủ môn Wika 01 là sản phẩm nằm trong phân khúc găng tay thủ môn giá rẻ được Wika Sports tung ra thị trường. Với giá thành và chất lượng tương xứng, đây sẽ là mẫu găng tay có độ phủ sóng lớn dành cho những thủ môn không chuyên trên sân bóng phủi.\r\n\r\n\r\nGăng tay thủ môn Wika 01 được làm từ lớp Foam xốp dẻo, dày 3mm tạo lực ma sát để bóng dính tốt không bị trượt, đồng thời bảo vệ da tay của thủ môn khỏi rách, trầy. Mặt trong phủ lớp vải thấm mồ hôi cho tay luôn khô ráo, thoải mái.\r\n\r\nGăng tay thủ môn Wika 01 sử dụng mặt cắt Flat Palm, có lưới thoáng khí giữa các ngón tay cho cảm giác thoải mái hơn khi thi đấu trong thời tiết nóng. Bên cạnh đó, kiểu ngón tay Flat Palm cũng giúp thủ môn bắt dính tốt hơn do đôi găng có nhiều tiết diện tiếp xúc bóng. Đây cũng là kiểu găng tay thủ môn cho người mới chơi luyện được form tay tốt hơn so với các kiểu ngón khác.\r\n\r\n\r\nGăng tay thủ môn Wika 01 là găng tay thủ môn có khung xương giúp thủ môn không bị trật khớp hoặc gãy ngón tay trước những cú sút mạnh của cầu thủ đội bạn, điều này thích hợp cho những người mới chơi, có lực bắt bóng còn hạn chế. Tuy nhiên, khung xương này hoàn toàn có thể tháo rời một cách linh hoạt, đáp ứng nhu cầu khi thủ môn có kinh nghiệm hơn.\r\n\r\nPhần mu bàn tay làm bằng da tổng hợp có độ bền cao, thiết kế đơn giản. Đai quấn một vòng, kết hợp vải mesh và thiết kế thun co giãn, dễ dàng đeo và tháo linh hoạt, điều chỉnh kích cỡ theo mong muốn.\r\n\r\nGăng tay thủ môn Wika 01 cũng ra mắt thêm găng tay thủ môn trẻ em size 6,7 với 3 màu sắc chủ đạo: Xanh lá – Cam – Xanh dương. Đây vẫn được coi là sản phẩm thích hợp sở hữu nhiều ưu điểm trong tầm giá dưới 300k.',199000.00,0.00,'/images/gang-tay-thu-mon-wika-xanh-chuoi-1_optimized-768x768.jpg',15),(70,'Găng tay thủ môn Kaiwin GUNNER - Màu xanh da','Găng Tay Thủ Môn Kaiwin GUNNER – Màu Xanh Da | Thiết Kế Đỉnh Cao – Bắt Dính Chuẩn – Bảo Vệ Tối Ưu\r\n\r\nKhẳng định phong độ nơi khung gỗ với mẫu Kaiwin GUNNER – dòng găng tay thủ môn cao cấp mang đến sự kết hợp hoàn hảo giữa thiết kế ấn tượng và hiệu năng vượt trội. Phiên bản màu xanh da độc đáo không chỉ giúp bạn nổi bật trên sân mà còn thể hiện cá tính mạnh mẽ, chuyên nghiệp.\r\n\r\n- Đặc điểm nổi bật:\r\nMặt găng sử dụng latex cao cấp nhập khẩu, độ bám vượt trội giúp bạn bắt dính bóng chắc chắn trong cả điều kiện khô ráo lẫn ẩm ướt. Đây là loại chất liệu được nhiều thủ môn chuyên nghiệp tin dùng.\r\n\r\nLòng bàn tay cắt dạng Flat Cut truyền thống, tạo cảm giác bóng chân thật, giúp kiểm soát bóng tốt hơn, đặc biệt trong các tình huống đổ người hoặc cản phá cú sút mạnh.\r\n\r\nMu bàn tay được gia cố đệm EVA chắc chắn, hỗ trợ bảo vệ tay tối đa khi đấm bóng hoặc va chạm với cầu thủ đối phương.\r\n\r\nCổ tay co giãn kèm băng quấn Velcro chắc chắn, giúp cố định găng tay tốt hơn, ôm sát cổ tay và hạn chế chấn thương trong thi đấu.\r\n\r\nĐường chỉ may tỉ mỉ, thiết kế vừa vặn, phù hợp với nhiều cỡ tay, đảm bảo sự linh hoạt khi vận động.\r\n\r\n- Ứng dụng:\r\nPhù hợp cho cả sân cỏ tự nhiên lẫn sân cỏ nhân tạo, từ luyện tập đến thi đấu chuyên nghiệp.',425000.00,0.00,'/images/Gang_tay_thu_mon_Kaiwin_GUNNER-Mau_xanh_da.jpg',15),(71,'Găng tay thủ môn Wika Sketon màu đỏ','Găng tay thủ môn Wika Sketon không chỉ giúp bảo vệ tay, nó còn giúp hiệu suất bắt bóng của cầu thủ tăng cao hơn:\r\n\r\n– Găng tay được phối khá bắt mắt: Đỏ – Xanh – Cam\r\n\r\n– Size: 8-9-10\r\n\r\n– Lớp Foarm xốp dẻo, dày 3mm đàn hồi, chống nước.\r\n\r\n– Mặt trong phủ lớp vải thấm mồ hôi cho tay luôn khô ráo\r\n\r\n– Mặt cắt Flat Palm, lưới thoáng khí, ngón tay rộng rãi, thoải mái, phù hợp với thủ thành có lối chơi kiểm soát bóng\r\n\r\n– Ngón tay có thiết kế vải thoáng khí giúp tay không bị bí, bị đổ mồ hôi, nóng\r\n\r\n– Xương găng cố định\r\n\r\n– Mu bàn tay làm bằng da tổng hợp, độ bền cao, các đường sọc nổi đệm mút hỗ trợ đấm bóng chính xác và an toàn\r\n\r\n– Đai quấn một vòng, kết hợp vải mesh và thiết kế thun co giãn, dễ dàng mang tháo và linh hoạt điều chỉnh kích cỡ theo yêu cầu',239000.00,20.00,'/images/gang-tay-thu-mon-wika-sketo-do-2-600x600.jpg',15),(72,'Găng Adidas Predator GL Pro Soccer Goalie Goalkeeper Gloves HH8745 Choosing Size New','Vải: 91% polyester, 8% elastane, 1% nylon (thân), 100% cao su (bên ngoài lòng bàn tay). Lòng bàn tay: mủ cao su URG 2.0. Thiết kế không quai dài giúp vừa vặn và chắc chắn với cẳng tay và không cần dây đeo cổ tay.\r\nQuả bóng dừng lại cùng bạn và đôi găng tay thủ môn adidas Predator GL Pro của bạn, nhờ lòng bàn tay URG 2.0 có độ bám tốt, vùng uốn cong theo giải phẫu và mu bàn tay được dệt kim mang lại cảm giác thoải mái, vừa vặn và linh hoạt.\r\n\r\nLớp bọt lòng bàn tay URG (Unrivaled Grip) 2.0 tăng độ bám, hấp thụ sốc và độ bền\r\nThiết kế không dây đeo mở rộng giúp vừa vặn và chắc chắn với cẳng tay và không cần dùng dây đeo cổ tay\r\nMặt sau đan để vừa vặn và thoải mái\r\nCác vùng uốn cong giải phẫu được định vị chiến lược trên các ngón tay và lòng bàn tay theo các chuyển động tự nhiên của bàn tay\r\nPredator Demonskin có các chi tiết nổi trên các đốt ngón tay để tạo kết cấu và độ bám\r\nLòng bàn tay: Cao su URG 2.0\r\nChất liệu vải: 91% polyester, 8% elastane, 1% nylon (thân), 100% cao su (bên ngoài lòng bàn tay)\r\nChăm sóc: Giặt tay, KHÔNG sấy khô',4199000.00,0.00,'/images/Gloves_Adidas_Predator_GL_Pro_Soccer_Goalie.jpg',15),(73,'Quả Bóng Quality Pro UHV 2.07','Đặc điểm Quả Bóng Quality Pro UHV 2.07\r\nSize bóng: Bóng số 5\r\nChất liệu da: PU cao cấp + chống thấm\r\nTrọng lượng: 420 – 440g\r\nChu vi bóng: 685– 695mm\r\nĐộ tròn:',1699000.00,0.00,'/images/qua-bong-da-tieu-chuan-fifa-uhv-2-07.jpg',15),(74,'Quả bóng đá FIFA QUALITY PRO UHV 2.07 số 5','Quả Bóng Đá Số 5 UHV 2.07 – FIFA QUALITY PRO | Đẳng Cấp Thi Đấu – Chuẩn Quốc Tế\r\n\r\nSẵn sàng cho những trận cầu đỉnh cao với quả bóng đá UHV 2.07 số 5 – đạt chứng nhận FIFA QUALITY PRO, tiêu chuẩn cao nhất dành cho bóng thi đấu chuyên nghiệp quốc tế. Thiết kế tối ưu cho tốc độ, độ nảy và sự ổn định trên mọi mặt sân.\r\n\r\n- Ưu điểm nổi bật:\r\nChứng nhận FIFA QUALITY PRO – đảm bảo chất lượng vượt trội về độ chính xác, khả năng bay, độ nảy và độ thấm nước. Đây là loại bóng đạt chuẩn sử dụng trong các giải đấu chuyên nghiệp cấp quốc gia và quốc tế.\r\n\r\nKết cấu 32 miếng ghép truyền thống, được khâu tay tỉ mỉ, giúp bóng có độ tròn đều, bay ổn định và kiểm soát tốt hơn khi thi đấu.\r\n\r\nLớp vỏ ngoài làm từ PU cao cấp – chống mài mòn, mềm mại nhưng vẫn đủ độ cứng cho những cú sút uy lực và chính xác.\r\n\r\nRuột bóng cao su butyl chất lượng cao, giữ hơi lâu, hạn chế xì van và đảm bảo độ nảy tiêu chuẩn trong suốt quá trình sử dụng.\r\n\r\nThiết kế hiện đại, màu sắc nổi bật, dễ nhận diện trên sân trong cả điều kiện ánh sáng mạnh hoặc thiếu sáng.\r\n\r\n-Thông số kỹ thuật:\r\nKích thước: Số 5 – chuẩn thi đấu cho người lớn và giải chuyên nghiệp\r\n\r\nTrọng lượng tiêu chuẩn: Theo quy định của FIFA (410g – 450g)\r\n\r\nMặt sân sử dụng: Phù hợp cả sân cỏ tự nhiên lẫn sân nhân tạo',1780000.00,0.00,'/images/pvn406-qua-bong-da-uhv2-05-size4-1671527611.jpg',15),(75,'Quả bóng đá adidas Vòng Loại UCL League 24/25 Unisex - JH1296','Quả bóng đá tập luyện với họa tiết graphic lấy cảm hứng từ trái bóng thi đấu chính thức của UCL.\r\nMang sắc xanh lá của những mái vòm đồng nhuốm màu thời gian và phông nền đẹp như những tấm bưu thiếp Munich, quả bóng đá adidas League này mượn cảm hứng thiết kế từ trái bóng thi đấu chính thức của UCL. Với kết cấu không đường may cho lối chơi ổn định, vỏ bóng bằng TPU có các chi tiết tinh xảo hình thành phố và logo giải đấu. Hãy sử dụng trái bóng đạt chứng nhận FIFA Quality này khi tập luyện và thi đấu.\r\n\r\nĐẶC ĐIỂM NỔI BẬT\r\n\r\n100% TPU (tái chế)\r\nKết cấu TSBE không đường may\r\nRuột bóng bằng cao su butyl\r\nChứng nhận FIFA Quality\r\nIn logo UEFA Champions League\r\nCần bơm hơi\r\nMàu sản phẩm: White / Shadow Green / Solar Slime\r\nMã sản phẩm: JH1296\r\nTHÔNG TIN THƯƠNG HIỆU adidas\r\n\r\nNgày nay adidas không chỉ là nhãn hiệu thể thao chuyên nghiệp mà còn là một sản phẩm thời trang. adidas đã phân chia các dòng sản phẩm của mình thành 3 phân nhóm:\r\n\r\nThành tích thể thao: tập trung vào tính năng của sản phẩm đáp ứng cho các VĐV chuyên nghiệp\r\nDi sản thể thao: những sản phẩm truyền thống đã mang lại danh tiếng\r\nThời trang thể thao: tập trung vào những khách hàng trẻ thích những sản phẩm trang phục thể thao hợp thời trang và sang trọng.\r\nCó thể nói adidas thành công nhờ:\r\n\r\nLuôn luôn sáng tạo nhằm vào sự nâng cao thành tích cho các VĐV chuyên nghiệp.\r\nLuôn trung thành với KH mục tiêu là các VĐV chuyên nghiệp.\r\nLuôn giữ gìn lịch sử đẹp đẽ và phát triển nó thành 1 phong cách thời trang.\r\nLuôn kiên định với Dassler ngày nào: \"phong độ\" cho dù có lúc sóng gió nhưng họ không bao giờ bắt sản phẩm mình phải trả giá.\r\nNhững ngôi sao thể hiện đúng phong cách mà adidas truyền đạt.',950000.00,0.00,'/images/bongvongloaiuclleague2425trang-07162380-2f9c-4eac-b65b-dc2cee1fa877.jpg',15),(76,'Quả bóng đá cờ đỏ sao vàng','Thông tin quả bóng đá cờ đỏ sao vàng\r\nThương hiệu: Động Lực\r\nXuất xứ: Sản xuất tại Việt Nam.\r\n Size số 3 có D = 18cm ; Trọng lượng = 340g  phù hợp độ tuổi < 8 tuổi ==> Giá bán: 120.000đ\r\nSize số 4 có D = 19.5 cm ; Trọng lượng = 368g  phù hợp độ tuổi < 9-11 tuổi ==> Giá bán: 140.000 đ\r\nSize số  5 có D = 21.5 cm ; Trọng lượng = 450g  phù hợp độ tuổi > 12 tuổi ==> Giá bán: 160.000đ\r\n Da bóng làm từ chất liệu PVC có độ bền và độ đàn hồi cao.\r\n Bề mặt ngoài có khả năng chống xước và chống nước tốt\r\nBóng có cấu tạo nhiều lớp bên trong được bổ sung lớp vải đệm giúp bóng êm hơn và giữ form tốt\r\nRuột bóng làm từ cao su đặc biệt, giữ hơi tốt. Bóng có độ bay và độ nảy ổn định\r\nBóng phù hợp đá trên sân cỏ nhân tạo, sân cỏ tự nhiên và sân đất\r\nBóng thi đấu được trong mọi điều kiện thời tiết\r\nLưu ý:\r\nHạn chế đá trên sân bê tông, nơi có vật sắc nhọn khiến bóng dễ bị mòn và trầy xước\r\nĐể bóng ở nơi khô ráo, tránh ánh sáng trực tiếp và nhiệt độ caoChất liệu: làm từ da PU nhập khẩu từ Nhật, rất êm tay khi đánh. Với các miếng da vàng và xanh, dán bề mặt ngoài bởi lớp keo tiêu chuẩn, bền chắc chắn.',160000.00,25.00,'/images/qua-bong-da-co-do-sao-vang.jpg',15),(77,'Đội tuyển Argentina (Argentina) - trang phục sân nhà (home kit) 2022-2024','Bộ trang phục này là mẫu áo sân nhà (home kit) của đội tuyển Argentina, nổi bật với các sọc dọc màu xanh da trời nhạt và trắng xen kẽ, một thiết kế truyền thống và mang tính biểu tượng của đội bóng xứ Tango. Áo có cổ tròn và viền tay áo màu đen. Số áo thường được in ở ngực và sau lưng.\r\nLogo của nhà tài trợ (thường là Adidas) được đặt ở ngực phải, trong khi logo của Hiệp hội Bóng đá Argentina (AFA) với hai ngôi sao (tượng trưng cho hai chức vô địch World Cup) được đặt ở ngực trái.\r\nQuần đùi có màu đen, với các chi tiết màu trắng và xanh da trời nhạt. Tất trắng hoặc đen hoàn thiện bộ trang phục, mang lại vẻ ngoài chuyên nghiệp và đầy khí chất cho đội tuyển Argentina.\r\nChất liệu:\r\nÁo bóng đá của các đội tuyển quốc gia thường được sản xuất bởi Adidas và sử dụng các công nghệ vải tiên tiến để tối ưu hiệu suất cho cầu thủ. Các chất liệu phổ biến bao gồm:\r\n•	100% Polyester tái chế: Adidas thường sử dụng chất liệu này để giảm thiểu tác động đến môi trường.\r\n•	Công nghệ AEROREADY: Đây là công nghệ độc quyền của Adidas giúp thấm hút mồ hôi hiệu quả, giữ cho người mặc luôn khô ráo và thoáng mát, ngay cả khi vận động cường độ cao. Vải thường có kết cấu nhẹ, thoáng khí và có khả năng co giãn tốt để tạo sự thoải mái tối đa cho người mặc.\r\n',120000.00,0.00,'/images/Doi_tuyen_Argentina2022-2024.jpg',11),(78,'Quả Bóng Đá AKpro AF2000 Số 5','Quả Bóng Đá AKpro AF2000 số 5 được làm từ chất liệu TPU bằng công nghệ Khâu máy có độ nảy ổn định, bóng êm, hướng bay chuẩn, khả năng chống thấm nước tương đối tốt, ít bị mài mòn. Bóng có cấu tạo nhiều lớp nên không bị biến dạng qua quá trình sử dụng và có độ bền cao. Phần ruột bóng Butyl được làm từ chất liệu bền, cho khả năng giữ hơi cực tốt.\r\nSản phẩm có thiết kế đẹp mắt, màu sắc Trắng – Đen – Đỏ truyền thống cùng với đường may sắc nét, tỉ mỉ. Bóng tròn đều, họa tiết khỏe khoắn đem lại cho người sử dụng cảm giác hứng thú mỗi khi tập luyện, thi đấu. Bóng sử dụng cho tập luyện và thi đấu phong trào hiệu quả.\r\n',1200000.00,0.00,'/images/qua-bong-da-akpro-af2000-5.jpg',15);
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_sizes`
--

DROP TABLE IF EXISTS `product_sizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_sizes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `size_id` int NOT NULL,
  `stock` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_size` (`product_id`,`size_id`),
  KEY `product_id` (`product_id`),
  KEY `size_id` (`size_id`),
  KEY `idx_ps_product` (`product_id`),
  KEY `idx_ps_size` (`size_id`),
  CONSTRAINT `product_sizes_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_sizes_ibfk_2` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_sizes_stock_chk` CHECK ((`stock` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=136 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_sizes`
--

LOCK TABLES `product_sizes` WRITE;
/*!40000 ALTER TABLE `product_sizes` DISABLE KEYS */;
INSERT INTO `product_sizes` VALUES (66,60,14,10),(67,60,15,20),(68,60,16,10),(69,60,17,23),(70,60,18,7),(75,62,15,12),(76,62,16,34),(77,62,17,7),(78,62,18,15),(79,63,14,36),(80,63,15,77),(81,63,16,30),(82,63,17,12),(83,63,18,14),(84,63,19,5),(85,64,14,36),(86,64,15,43),(87,64,16,24),(88,64,17,15),(89,64,18,9),(90,65,14,17),(91,65,15,24),(92,65,16,25),(93,65,17,66),(94,65,18,76),(95,66,14,28),(96,66,15,29),(97,66,16,36),(98,66,17,56),(99,66,18,57),(100,67,29,58),(101,67,30,59),(102,67,31,45),(103,67,32,46),(104,67,33,47),(105,68,29,48),(106,68,30,49),(107,68,31,50),(108,69,29,51),(109,69,30,55),(110,69,31,43),(111,70,27,47),(112,70,28,46),(113,70,29,28),(114,70,30,38),(115,70,31,39),(116,71,27,40),(117,71,28,54),(118,71,29,52),(119,71,30,42),(120,71,31,44),(121,72,29,18),(122,72,30,19),(123,72,31,20),(124,72,32,21),(125,73,34,22),(126,74,34,23),(127,75,34,24),(128,76,34,24),(129,77,14,25),(130,77,15,25),(131,77,16,26),(132,77,17,27),(133,77,18,28),(134,78,34,29);
/*!40000 ALTER TABLE `product_sizes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rating`
--

DROP TABLE IF EXISTS `rating`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rating` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rating_value` tinyint NOT NULL,
  `comment` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `order_detail_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rating_order_detail` (`order_detail_id`),
  KEY `rating_order_detail_fk` (`order_detail_id`),
  CONSTRAINT `rating_order_detail_fk` FOREIGN KEY (`order_detail_id`) REFERENCES `order_details` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rating_chk_1` CHECK (((`rating_value` >= 1) and (`rating_value` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rating`
--

LOCK TABLES `rating` WRITE;
/*!40000 ALTER TABLE `rating` DISABLE KEYS */;
INSERT INTO `rating` VALUES (27,5,'tốt','2025-05-23 19:49:29',153);
/*!40000 ALTER TABLE `rating` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sizes`
--

DROP TABLE IF EXISTS `sizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sizes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `size` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sizes_size` (`size`),
  KEY `idx_sizes_size` (`size`(10))
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sizes`
--

LOCK TABLES `sizes` WRITE;
/*!40000 ALTER TABLE `sizes` DISABLE KEYS */;
INSERT INTO `sizes` VALUES (31,'10'),(32,'11'),(33,'12'),(20,'39'),(21,'40'),(22,'41'),(23,'42'),(24,'43'),(25,'44'),(26,'45'),(34,'5'),(27,'6'),(28,'7'),(29,'8'),(30,'9'),(16,'L'),(15,'M'),(14,'S'),(17,'XL'),(18,'XXL'),(19,'XXXL');
/*!40000 ALTER TABLE `sizes` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-06 21:28:04
