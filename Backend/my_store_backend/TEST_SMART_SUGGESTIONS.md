# Test Gợi Ý Sản Phẩm - CHỈ KHI KHÔNG TÌM THẤY

## Mục đích
Đảm bảo AI chỉ gợi ý sản phẩm thay thế khi **KHÔNG tìm thấy** sản phẩm khách yêu cầu, không phải lúc nào cũng gợi ý.

---

## ✅ TEST CASE 1: TÌM THẤY SẢN PHẨM → KHÔNG GỢI Ý

### Input:
```
Khách: "shop có áo MU không?"
```

### Expected Behavior:
```
AI: [GỌI search_products("áo MU")]
AI: [NHẬN kết quả: 5 sản phẩm áo MU]
AI: [✅ TÌM THẤY → KHÔNG gợi ý sản phẩm khác]

Response:
"Shop có Áo MU đỏ sân nhà 24/25.
Giá: 139.000đ, giảm 25% → 104.250đ
Size còn: S, M, L, XL, XXL

Bạn có muốn đặt sản phẩm này không ạ?"
```

### ❌ WRONG:
```
"Shop có Áo MU... 
Ngoài ra shop còn có:
- Áo Arsenal
- Áo Chelsea
..."
```
→ KHÔNG nên gợi ý thêm khi đã tìm thấy!

---

## ✅ TEST CASE 2: KHÔNG TÌM THẤY + CÓ GỢI Ý

### Input:
```
Khách: "tìm áo Juventus"
```

### Expected Behavior:
```
AI: [GỌI search_products("áo Juventus")]
AI: [NHẬN {found: false, hasSuggestions: true, suggestions: [áo MU, áo Arsenal, áo Chelsea]}]

Response:
"Xin lỗi, shop không có sản phẩm 'áo Juventus' bạn tìm.

Một số sản phẩm ở shop, bạn có thể tham khảo ạ:

**Áo MU đỏ sân nhà 24/25**
Giá: 139.000đ, giảm 25% → 104.250đ
Size: S, M, L, XL

**Áo Arsenal 2022**
Giá: 120.000đ, giảm 35% → 78.000đ
Size: M, L, XL

Bạn có thích sản phẩm nào không ạ?"
```

---

## ✅ TEST CASE 3: KHÔNG TÌM THẤY + KHÔNG CÓ GỢI Ý

### Input:
```
Khách: "áo đội tuyển Thái Lan"
```

### Expected Behavior:
```
AI: [GỌI search_products("áo đội tuyển Thái Lan")]
AI: [NHẬN {found: false, hasSuggestions: false}]

Response:
"Xin lỗi, shop không có sản phẩm 'áo đội tuyển Thái Lan'.
Bạn muốn xem áo đội tuyển nào khác hoặc áo CLB không ạ?"
```

→ CHỈ thông báo không có, KHÔNG gợi ý ngẫu nhiên!

---

## ✅ TEST CASE 4: TÌM THEO GIÁ - KHÔNG TÌM THẤY

### Input:
```
Khách: "tìm áo dưới 50k"
```

### Expected Behavior:
```
AI: [GỌI search_products("áo", max_price=50000)]
AI: [NHẬN {found: false, message: "...không có trong khoảng giá...", hasSuggestions: true}]

Response:
"Xin lỗi, shop không có sản phẩm 'áo' trong khoảng giá dưới 50.000đ.

Shop có một số sản phẩm tương tự bạn có thể xem qua:

**Áo Arsenal 2022**
Giá: 120.000đ, giảm 35% → 78.000đ
Size: M, L, XL

Bạn có muốn xem thêm không ạ?"
```

---

## ✅ TEST CASE 5: TÌM THEO GIÁ - TÌM THẤY → KHÔNG GỢI Ý

### Input:
```
Khách: "tìm áo 150-200k"
```

### Expected Behavior:
```
AI: [GỌI search_products("áo", min_price=150000, max_price=200000)]
AI: [NHẬN kết quả: 3 sản phẩm]
AI: [✅ TÌM THẤY → KHÔNG gợi ý]

Response:
"Shop có 3 sản phẩm trong khoảng giá 150-200k:

**Áo MU đỏ**
Giá: 139.000đ, giảm 25% → 104.250đ

**Áo Arsenal hồng**
Giá: 120.000đ, giảm 35% → 78.000đ

**Áo Chelsea xanh**
Giá: 240.000đ, giảm 35% → 156.000đ

Bạn thích sản phẩm nào ạ?"
```

---

## ✅ TEST CASE 6: SIZE HẾT HÀNG

### Input:
```
Khách: "áo MU size XXL"
```

### Expected Behavior:
```
AI: [GỌI search_products("áo MU", size="XXL")]
AI: [NHẬN {found: false, message: "...không có size XXL hoặc hết hàng"}]

Response:
"Xin lỗi, sản phẩm 'áo MU' không có size XXL hoặc đã hết hàng.

Áo MU còn các size: S, M, L, XL

Bạn muốn chọn size khác không ạ?"
```

---

## Logic Mới trong search_products

### Khi nào gợi ý sản phẩm?

```javascript
if (results.length === 0) {
  // Chỉ gợi ý nếu:
  // 1. Query có ý nghĩa (length > 2)
  // 2. Không phải từ khóa chung chung ("xem", "tìm", "có")
  
  if (shouldSuggest) {
    // Tìm sản phẩm tương tự
    alternatives = await semanticSearchProducts(query, 5);
    
    if (alternatives.length === 0) {
      // Thử tìm theo category rộng hơn (áo, quần, giày...)
      alternatives = await semanticSearchProducts(categoryKeyword, 5);
    }
    
    return {
      found: false,
      hasSuggestions: true,
      suggestions: alternatives
    };
  }
  
  // Không gợi ý
  return {
    found: false,
    hasSuggestions: false
  };
}

// Tìm thấy → return products (KHÔNG gợi ý thêm)
return results;
```

---

## Cách test

### 1. Restart backend:
```powershell
cd D:\DACN\Do_An_Chuyen_Nganh\Backend\my_store_backend
npm start
```

### 2. Test từng case:

**Test tìm thấy (KHÔNG gợi ý):**
- "shop có áo MU không?"
- "tìm áo 100-150k"
- Kỳ vọng: Chỉ hiển thị sản phẩm tìm được, KHÔNG gợi ý thêm

**Test không tìm thấy (CÓ gợi ý):**
- "tìm áo Juventus"
- "áo Barcelona 100k"
- Kỳ vọng: Thông báo không tìm thấy + gợi ý sản phẩm tương tự

**Test không tìm thấy (KHÔNG gợi ý):**
- "áo đội tuyển Thái Lan"
- "áo NBA"
- Kỳ vọng: Chỉ thông báo không có, hỏi xem sản phẩm khác

### 3. Kiểm tra logs:

```
[Tool search_products] Returning 5 products after filtering
→ ✅ Tìm thấy, không gợi ý

[Tool search_products] No products found for query "áo Juventus"
[Tool search_products] Searching for similar alternatives...
[Tool search_products] Found 3 alternative suggestions
→ ✅ Không tìm thấy, có gợi ý

[Tool search_products] No products found for query "áo NBA"
[Tool search_products] No alternatives found
→ ✅ Không tìm thấy, không gợi ý
```

---

## Lợi ích

✅ **Trải nghiệm tốt hơn:** Khách không bị spam gợi ý khi đã tìm thấy sản phẩm  
✅ **Tập trung:** AI chỉ gợi ý khi thực sự cần thiết  
✅ **Thông minh:** Phân biệt được khi nào nên gợi ý, khi nào không  
✅ **Hiệu quả:** Giảm thông tin dư thừa trong chat
