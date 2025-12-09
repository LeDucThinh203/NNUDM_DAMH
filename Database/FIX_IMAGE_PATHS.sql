-- ================================================
-- SQL Script: Sửa đường dẫn ảnh sản phẩm
-- Đổi từ tên file có ký tự đặc biệt sang tên file đơn giản hơn
-- ================================================

USE `my_store`;

-- Sửa đường dẫn ảnh cho các sản phẩm bị lỗi hiển thị

-- Product 67: Găng Tay Reusch (ký tự ®)
UPDATE `product` 
SET `image` = '/images/gang-tay-reusch-attrakt-fusion-carbon-3d-5570998-7784.png'
WHERE `id` = 67;

-- Product 70: Găng tay Kaiwin GUNNER
UPDATE `product` 
SET `image` = '/images/gang-tay-kaiwin-gunner-xanh-da.jpg'
WHERE `id` = 70;

-- Product 78: Quả Bóng AKpro
UPDATE `product` 
SET `image` = '/images/qua-bong-da-akpro-af2000-5.jpg'
WHERE `id` = 78;

-- Kiểm tra kết quả
SELECT id, name, image 
FROM `product` 
WHERE id IN (67, 70, 78);

-- Hoàn thành!
SELECT 'Image paths fixed successfully!' AS Status;
