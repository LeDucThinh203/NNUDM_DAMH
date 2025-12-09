## Hướng dẫn chạy các file SQL

### 1. Chuẩn bị
- Sao lưu dữ liệu nếu bạn đã có database `my_store` trước đó.
- Mở MySQL Workbench (hoặc client MySQL bất kỳ) và kết nối tới máy chủ.

### 2. Thứ tự thực thi khuyến nghị

#### 🌟 Cho Free Hosting (FreeSQLDatabase.com, db4free.net):
**CHỈ CẦN 1 FILE DUY NHẤT:**

1. **DBWebBanDoBongDa_FREE_HOSTING.sql** ⭐ ALL-IN-ONE  
	File tích hợp ĐẦY ĐỦ mọi thứ bạn cần:
	- ✅ 12 bảng giống 100% file gốc DBWebBanDoBongDa.sql
	- ✅ Tích hợp sẵn AI_Data_Cleanup_And_Constraints.sql
	- ✅ Tích hợp sẵn AI_Performance_Indexes.sql
	- ✅ Tích hợp sẵn UPDATE_VNPAY.sql
	- ✅ Tương thích 100% FreeSQLDatabase.com, db4free.net
	
	**Cách import:**
	- Truy cập phpMyAdmin: http://www.phpmyadmin.co
	- Chọn database có sẵn (vd: sql12811307)
	- Import → Chọn file → Go
	
	**XONG! Không cần import thêm file nào khác.**

#### 💻 Cho Local/VPS (MySQL đầy đủ quyền):
1. **DBWebBanDoBongDa.sql**  
	Tạo mới toàn bộ schema `my_store`, bảng, các ràng buộc cơ bản và dữ liệu mẫu.
2. **AI_Data_Cleanup_And_Constraints.sql**  
	Chuẩn hóa dữ liệu mẫu AI và thêm các ràng buộc mở rộng.
3. **AI_Performance_Indexes.sql**  
	Tạo các index/phần tối ưu hiệu năng cho các bảng AI.
4. **UPDATE_VNPAY.sql** *(hoặc* **UPDATE_VNPAY_SIMPLE.sql**)*  
	- `UPDATE_VNPAY.sql`: áp dụng đầy đủ cấu hình & dữ liệu mẫu cho VNPay.  
	- `UPDATE_VNPAY_SIMPLE.sql`: phiên bản rút gọn chỉ dùng cho test nhanh.  
	Lựa chọn một trong hai file tùy nhu cầu.

> ⚠️ Sau mỗi bước, nhấn `Ctrl+Shift+Enter` (MySQL Workbench) để chạy toàn bộ script. Nếu script báo lỗi do đã tồn tại dữ liệu, hãy kiểm tra lại dữ liệu hiện có hoặc xóa database trước khi chạy lại.

### 3. Kiểm tra sau khi chạy
- Dùng câu lệnh `SHOW TABLES;` để xác nhận các bảng đã được tạo.
- Kiểm tra nhanh dữ liệu sản phẩm: `SELECT * FROM product LIMIT 5;`.
- Kiểm tra accounts: `SELECT id, email, name, role FROM account;`.

### 4. Cấu hình Backend (.env)
Sau khi import thành công, cập nhật file `.env` trong Backend:
```env
DB_HOST=sql12.freesqldatabase.com
DB_USER=sql12811307
DB_PASSWORD=your-password
DB_NAME=sql12811307
DB_PORT=3306
```
⚠️ **Lưu ý:** `DB_NAME` phải trùng với database name của bạn (vd: sql12811307)

Hoàn tất! Lúc này backend có thể kết nối trực tiếp tới database `my_store` với dữ liệu cập nhật.
