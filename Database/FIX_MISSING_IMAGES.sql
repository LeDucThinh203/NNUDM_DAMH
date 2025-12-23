-- ================================================
-- SQL Script: Fix tất cả sản phẩm không có ảnh
-- Set placeholder image cho các sản phẩm missing image
-- ================================================

USE `my_store`;

-- Kiểm tra các sản phẩm không có ảnh
SELECT id, name, image 
FROM `product` 
WHERE image IS NULL OR TRIM(image) = '' OR image = '';

-- Update placeholder cho các sản phẩm không có ảnh
UPDATE `product` 
SET `image` = '/images/placeholder.png'
WHERE image IS NULL OR TRIM(image) = '' OR image = '';

-- Kiểm tra các sản phẩm có ảnh nhưng file không tồn tại (optional - cần check manually)
SELECT id, name, image 
FROM `product` 
WHERE image IS NOT NULL 
  AND TRIM(image) != ''
  AND image NOT LIKE 'http%'
ORDER BY id;

-- Kết quả
SELECT 'Image fix completed!' AS Status,
       COUNT(*) AS total_products,
       SUM(CASE WHEN image = '/images/placeholder.png' THEN 1 ELSE 0 END) AS products_with_placeholder
FROM `product`;
