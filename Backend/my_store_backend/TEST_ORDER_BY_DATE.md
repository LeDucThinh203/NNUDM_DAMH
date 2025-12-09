# Test Tìm Đơn Hàng Theo Ngày

## Tính năng mới: `get_orders_by_date`

### 1. Mô tả
Tool mới cho phép AI tìm đơn hàng theo ngày với khả năng:
- ✅ Tính toán ngày tương đối (hôm qua, hôm kia, ngày kia...)
- ✅ Tìm theo khoảng thời gian (từ ngày X đến ngày Y)
- ✅ Lọc theo trạng thái đơn hàng (pending, confirmed, shipping, delivered, cancelled)
- ✅ Hiển thị tóm tắt sản phẩm trong đơn

### 2. Cách AI tính toán ngày

**Ngày hiện tại: 4/12/2025**

| Khách nói           | AI tính days_ago | Ngày tìm kiếm |
|---------------------|------------------|---------------|
| "đơn hôm nay"       | 0                | 4/12/2025     |
| "đơn hôm qua"       | 1                | 3/12/2025     |
| "đơn hôm kia"       | 2                | 2/12/2025     |
| "đơn ngày kia"      | 2                | 2/12/2025     |
| "đơn 3 ngày trước"  | 3                | 1/12/2025     |
| "đơn tuần trước"    | 7                | 27/11/2025    |

### 3. Cách sử dụng

#### Case 1: Tìm đơn hôm qua
```
Khách: "đơn hàng hôm qua đâu?"
AI: [GỌI get_orders_by_date({ user_id: 44, days_ago: 1 })]
```

#### Case 2: Tìm đơn hôm kia
```
Khách: "đơn hôm kia giao chưa?"
AI: [GỌI get_orders_by_date({ user_id: 44, days_ago: 2 })]
```

#### Case 3: Tìm đơn ngày kia (giống hôm kia)
```
Khách: "xem đơn ngày kia"
AI: [GỌI get_orders_by_date({ user_id: 44, days_ago: 2 })]
```

#### Case 4: Tìm theo khoảng ngày
```
Khách: "đơn từ 1/12 đến 3/12"
AI: [GỌI get_orders_by_date({ 
  user_id: 44, 
  from_date: "2025-12-01", 
  to_date: "2025-12-03" 
})]
```

#### Case 5: Tìm theo trạng thái
```
Khách: "đơn hôm qua đã giao chưa?"
AI: [GỌI get_orders_by_date({ 
  user_id: 44, 
  days_ago: 1,
  status: "delivered"
})]
```

### 4. Kết quả trả về

**Nếu tìm thấy:**
```json
{
  "found": true,
  "orders": [
    {
      "id": 138,
      "account_id": 44,
      "name": "hiệp",
      "phone": "0977850642",
      "address": "124/22 xóm chiếu, Phường 14, Quận 4, TP.HCM",
      "total_amount": 78000,
      "status": "pending",
      "payment_method": "cod",
      "created_at": "2025-12-03T10:30:00.000Z",
      "item_count": 1,
      "items_summary": "Áo Arsenal (XL) x1"
    }
  ],
  "count": 1
}
```

**Nếu không tìm thấy:**
```json
{
  "found": false,
  "message": "Không tìm thấy đơn hàng hôm qua"
}
```

### 5. Test Cases

#### Test 1: Đơn hàng hôm qua
```
Input: "đơn hàng hôm qua được giao chưa?"
Expected: AI gọi get_orders_by_date với days_ago=1
```

#### Test 2: Đơn hàng hôm kia
```
Input: "đơn hôm kia đâu?"
Expected: AI gọi get_orders_by_date với days_ago=2
```

#### Test 3: Đơn hàng ngày kia
```
Input: "đơn ngày kia giao chưa?"
Expected: AI gọi get_orders_by_date với days_ago=2 (giống hôm kia)
```

#### Test 4: Nhiều ngày trước
```
Input: "xem đơn 5 ngày trước"
Expected: AI gọi get_orders_by_date với days_ago=5
```

### 6. Trạng thái đơn hàng

- `pending` - Chờ xác nhận
- `confirmed` - Đã xác nhận  
- `shipping` - Đang giao hàng
- `delivered` - Đã giao hàng
- `cancelled` - Đã hủy

### 7. Cách restart server

```powershell
# Terminal 1: Backend
cd D:\DACN\Do_An_Chuyen_Nganh\Backend\my_store_backend
npm start
```

### 8. Kiểm tra logs

Sau khi khách hỏi "đơn hôm qua đâu?", bạn sẽ thấy:

```
[Tool get_orders_by_date] user_id=44, days_ago=1, from_date=null, to_date=null, status=null
[Tool get_orders_by_date] Filtering by 1 days ago: 2025-12-03T00:00:00.000Z to 2025-12-03T23:59:59.999Z
[Tool get_orders_by_date] Found 2 orders
```

### 9. Lưu ý quan trọng

⚠️ **AI phải tự tính days_ago dựa trên ngày hiện tại (4/12/2025)**
- "hôm qua" → days_ago = 1 (tìm đơn ngày 3/12)
- "hôm kia" = "ngày kia" → days_ago = 2 (tìm đơn ngày 2/12)
- Không cần khách nói ngày chính xác, AI tự tính toán

⚠️ **Định dạng ngày khi dùng from_date/to_date**
- Phải dùng format: YYYY-MM-DD
- VD: "2025-12-03", không phải "3/12/2025"

⚠️ **Tool tự động tìm cả ngày**
- from_date: 00:00:00 → 23:59:59
- Không cần lo về giờ phút giây
