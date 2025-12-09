-- =====================================================
-- SQL Script: Cập nhật database hỗ trợ VNPay (Phiên bản đơn giản)
-- (FREE HOSTING COMPATIBLE)
-- =====================================================
-- Chạy từng câu lệnh, bỏ qua lỗi nếu đã tồn tại
--
-- ⚠️ Import vào database có sẵn (vd: sql12811307)
-- ⚠️ KHÔNG dùng lệnh USE (free hosting không cho phép)
--
-- Compatible with: FreeSQLDatabase.com, db4free.net

-- Bước 1: Thêm cột payment_info
-- (Nếu báo lỗi "Duplicate column name" thì bỏ qua, có nghĩa là đã có cột này)
ALTER TABLE `orders` 
ADD COLUMN `payment_info` TEXT NULL COMMENT 'Thông tin giao dịch thanh toán (JSON format)' AFTER `is_paid`;

-- Bước 2-3: Cập nhật constraint payment_method
-- ⚠️ Free hosting KHÔNG hỗ trợ DROP CHECK, bỏ qua các lệnh này
-- Constraint đã được định nghĩa trong DBWebBanDoBongDa_FREE_HOSTING.sql

-- DROP và tạo lại constraint (KHÔNG chạy trên free hosting)
-- ALTER TABLE `orders` DROP CHECK `chk_payment_method`;
-- ALTER TABLE `orders` ADD CONSTRAINT `chk_payment_method` CHECK (`payment_method` IN ('cod', 'bank', 'vnpay'));

-- Bước 4: Thêm index
-- (Nếu báo lỗi "Duplicate key name" thì bỏ qua)
CREATE INDEX `idx_payment_method` ON `orders` (`payment_method`);
CREATE INDEX `idx_is_paid` ON `orders` (`is_paid`);

-- Xem kết quả
SELECT 'VNPay database update completed!' AS Status;
