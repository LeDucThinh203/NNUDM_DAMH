# 📋 System Prompt Structure - Role-Task-Output Define

## 📌 Tổng quan

System prompts đã được tái cấu trúc theo framework **Role - Task - Output Define** để:
- ✅ Rõ ràng hơn về vai trò của AI
- ✅ Chi tiết hóa từng nhiệm vụ cụ thể
- ✅ Định nghĩa chuẩn đầu ra (format, tone, style)
- ✅ Dễ maintain và scale

## 🎯 Cấu trúc mới

### 1. ROLE - Vai trò của AI

**Định nghĩa:**
- AI Sales Assistant của my_store
- Tính cách: Thân thiện, nhiệt tình, chuyên nghiệp
- Năng lực: Tìm kiếm sản phẩm, xử lý đơn hàng, tư vấn
- Giới hạn: Không tự ý thay đổi giá, không hiển thị thông tin kỹ thuật

**Tại sao quan trọng?**
→ Giúp AI hiểu rõ "mình là ai" và "làm gì trong phạm vi nào"

### 2. TASK - Nhiệm vụ cụ thể

Chia nhỏ quy trình đặt hàng thành **4 bước rõ ràng**, mỗi bước có:
- INPUT: Dữ liệu đầu vào từ khách
- TASK: Các công việc cụ thể cần làm
- OUTPUT: Kết quả trả về

#### BƯỚC 1: TÌM SẢN PHẨM

**Nhiệm vụ con:**
1. Phân tích yêu cầu (1 SP hay nhiều SP, có khoảng giá không)
2. **Trích xuất khoảng giá** (mới thêm):
   - Pattern 1: Khoảng giá (min + max): "150-200k" → min=150000, max=200000
   - Pattern 2: Giá tối đa: "dưới 200k" → max=200000
   - Pattern 3: Giá tối thiểu: "trên 500k" → min=500000
3. Gọi tool search_products (tách riêng nếu nhiều SP)
4. Xử lý kết quả và lưu PRODUCT_ID

**Ví dụ:**
```
Khách: "shop có áo 150-200k ko"
→ AI parse: min_price=150000, max_price=200000
→ AI call: search_products("áo", min_price=150000, max_price=200000)
```

#### BƯỚC 2: HỎI SIZE

**Nhiệm vụ:**
- Nhận diện 3 patterns:
  - Pattern 1: Size đơn ("M")
  - Pattern 2: Nhiều size + số lượng ("M 2 cái, L 1 cái") → SKIP bước 3
  - Pattern 3: Nhiều SP, mỗi SP 1 size

#### BƯỚC 3: HỎI SỐ LƯỢNG

**Nhiệm vụ:**
- Trích xuất số lượng
- Gọi get_user_addresses (nếu chưa có)

#### BƯỚC 4: TẠO ĐƠN

**Nhiệm vụ:**
- Thu thập đủ thông tin từ memory
- Gọi create_order ngay sau khi khách chọn địa chỉ

### 3. OUTPUT DEFINE - Chuẩn đầu ra

**Định dạng văn bản:**
- Ngôn ngữ: Tiếng Việt tự nhiên
- Tone: Lịch sự, nhiệt tình
- Độ dài: 2-4 câu

**Hiển thị giá:**
```
Giá: 139.000đ, giảm 25% ▸ 104.250đ
```

**Hiển thị size:**
```
Size còn hàng: S, M, L, XL
```
(CHỈ hiển thị size có stock > 0)

**Tracking message (nội bộ):**
```
📦 Đang xử lý đơn: product_id=64, product_name=...
```
→ Chỉ để AI đọc, KHÔNG hiển thị cho khách

**Cấm tuyệt đối:**
- ❌ Hiển thị: product_id, user_id, system messages
- ❌ Hỏi lại: Thông tin đã có trong context
- ❌ Tự ý: Thay đổi giá, hứa hẹn không có trong DB

## 🔧 Thay đổi quan trọng

### ✨ Mới: Hỗ trợ khoảng giá

**Tools cập nhật:**
- `tools.js`: Thêm tham số `min_price` vào tool `search_products`
- Logic filter: Hỗ trợ cả min_price và max_price

**Prompt cập nhật:**
- Thêm hướng dẫn chi tiết về cách trích xuất khoảng giá
- Phân biệt 3 patterns giá: khoảng giá, giá tối đa, giá tối thiểu

**Ví dụ:**
```
Khách: "áo 150-200k"
→ Trước: AI chỉ dùng max_price=200000 → Lỗi: tìm cả áo 100k
→ Sau: AI dùng min_price=150000, max_price=200000 → Đúng: chỉ tìm áo 150-200k
```

## 📊 Lợi ích

### 1. Dễ đọc hơn
- Cấu trúc rõ ràng theo Role → Task → Output
- Mỗi phần có mục đích riêng biệt

### 2. Dễ maintain
- Muốn sửa cách hiển thị → Sửa phần OUTPUT DEFINE
- Muốn thêm bước → Thêm vào phần TASK
- Muốn thay đổi tính cách AI → Sửa phần ROLE

### 3. Dễ scale
- Thêm tính năng mới: Thêm vào TASK tương ứng
- Thêm rule mới: Thêm vào OUTPUT DEFINE

### 4. Hiệu quả hơn
- AI hiểu rõ vai trò → Trả lời đúng phạm vi
- AI biết rõ task → Ít bị bỏ sót bước
- AI có chuẩn output → Đồng nhất chất lượng

## 🎯 Checklist khi sửa prompt

- [ ] Sửa ROLE → Thay đổi vai trò/năng lực AI
- [ ] Sửa TASK → Thêm/bớt bước, thay đổi logic
- [ ] Sửa OUTPUT → Thay đổi format hiển thị
- [ ] Test với các case: 1 SP, nhiều SP, khoảng giá, nhiều size
- [ ] Kiểm tra syntax: `node -c services/ai/prompts.js`

## 📝 Best Practices

1. **Mỗi TASK phải có INPUT và OUTPUT rõ ràng**
2. **Ví dụ cụ thể > Mô tả chung chung**
3. **Dùng emoji và format để dễ đọc**
4. **Đặt cảnh báo ⚠️ cho phần quan trọng**
5. **Có section OPTIMIZATION RULES cho performance**

## 🔗 File liên quan

- `prompts.js` - System prompt chính
- `tools.js` - Tool declarations và implementations
- `schema.js` - Response schema
- `gemini.js` - AI service integration
