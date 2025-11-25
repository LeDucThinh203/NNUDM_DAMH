# 🚀 Hướng dẫn Deploy Web với Ngrok (1 Tunnel - FREE TIER)

## 📌 Cấu hình hiện tại

Do ngrok free chỉ cho phép **1 tunnel duy nhất**, chúng ta sẽ:
- ✅ **Backend**: Chạy trên `localhost:3006` (không cần ngrok)
- ✅ **Frontend**: Chạy qua ngrok tunnel (share với máy khác)
- ✅ **Proxy**: Frontend tự động forward API requests tới backend localhost

## 🔧 Cách hoạt động

```
Máy khác (Browser) 
    ↓
https://xxx.ngrok-free.app (Frontend qua Ngrok)
    ↓
localhost:3000 (React Dev Server)
    ↓ (Proxy trong package.json)
localhost:3006 (Backend API)
```

Khi người dùng truy cập ngrok URL, frontend sẽ tự động proxy các API calls tới backend localhost:3006 trên cùng máy bạn.

---

## 📝 Các bước thực hiện

### Bước 1: Đảm bảo Backend đang chạy

```powershell
# Mở terminal 1
cd "e:\NamHoc_2023-2024\Do_An_Chuyen_Nganh\Code_DACN\Do_An_Chuyen_Nganh\Backend\my_store_backend"
node server.js
```

Bạn sẽ thấy:
```
🚀 Server running at http://localhost:3006
```

### Bước 2: Khởi động Frontend

```powershell
# Mở terminal 2
cd "e:\NamHoc_2023-2024\Do_An_Chuyen_Nganh\Code_DACN\Do_An_Chuyen_Nganh\frontend"
npm start
```

Frontend sẽ chạy tại `http://localhost:3000`

### Bước 3: Khởi động Ngrok cho Frontend

```powershell
# Mở terminal 3
ngrok http 3000
```

Bạn sẽ thấy output như sau:
```
Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        Asia Pacific (ap)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc-xyz-123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### Bước 4: Share URL với máy khác

Copy URL từ dòng **Forwarding** (ví dụ: `https://abc-xyz-123.ngrok-free.app`)

Gửi URL này cho người khác để họ truy cập web của bạn!

---

## ✅ Kiểm tra hoạt động

### Trên máy bạn:
- Frontend local: http://localhost:3000 ✅
- Backend local: http://localhost:3006 ✅
- Ngrok Web Interface: http://127.0.0.1:4040 ✅

### Từ máy khác:
- Truy cập: https://your-ngrok-url.ngrok-free.app
- Tất cả API calls sẽ tự động được proxy về backend localhost:3006 trên máy bạn

---

## 🔍 Cấu hình đã thay đổi

### 1. `frontend/package.json`
```json
{
  "proxy": "http://localhost:3006"
}
```
→ Proxy tất cả API requests từ frontend sang backend

### 2. `frontend/.env`
```env
REACT_APP_API_URL=
```
→ Empty string để sử dụng relative URLs (qua proxy)

### 3. `frontend/src/api.js`
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || "";
```
→ Sử dụng empty string khi không có biến môi trường

---

## 🛠️ Xử lý sự cố

### 1. Lỗi: API calls bị CORS blocked
**Nguyên nhân**: Backend CORS config không đúng

**Giải pháp**: Đã cấu hình sẵn trong `server.js`:
```javascript
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'] }));
```

### 2. Lỗi: Không kết nối được backend
**Kiểm tra**:
```powershell
# Test backend từ local
curl http://localhost:3006/product

# Kiểm tra backend có đang chạy không
netstat -ano | findstr :3006
```

### 3. Lỗi: Ngrok tunnel offline sau 2 giờ
**Nguyên nhân**: Ngrok free tier có giới hạn thời gian

**Giải pháp**:
1. Dừng ngrok: `Ctrl+C` trong terminal ngrok
2. Chạy lại: `ngrok http 3000`
3. Copy URL mới và share lại

### 4. Lỗi: Mixed Content (HTTPS/HTTP)
**Nguyên nhân**: Đã được giải quyết bằng proxy!

Khi bạn truy cập `https://xxx.ngrok-free.app`:
- Frontend và API đều đi qua cùng 1 domain (ngrok)
- Không có vấn đề Mixed Content
- Tất cả requests đều là HTTPS từ phía người dùng

---

## 📊 So sánh giải pháp

| Giải pháp | Ngrok Tunnels | Phù hợp |
|-----------|---------------|---------|
| **Backend + Frontend qua Ngrok** | 2 tunnels | ❌ Không phù hợp (ngrok free = 1 tunnel) |
| **Frontend qua Ngrok + Proxy** | 1 tunnel | ✅ Đang sử dụng (tối ưu cho free tier) |
| **Deploy lên Cloud** | 0 tunnels | ✅ Giải pháp lâu dài (Vercel, Railway, etc.) |

---

## 💡 Tips

### 1. Giữ ngrok URL ổn định hơn
Nâng cấp lên ngrok Pro để có:
- Custom subdomain (VD: `myapp.ngrok.io`)
- Không giới hạn thời gian
- Không cần restart và đổi URL

### 2. Xem requests realtime
Mở Web Interface của ngrok:
```
http://127.0.0.1:4040
```
Ở đây bạn có thể:
- Xem tất cả HTTP requests
- Inspect request/response details
- Replay requests để debug

### 3. Tối ưu performance
- Backend và Frontend chạy cùng máy → latency thấp
- Chỉ ngrok tunnel cho frontend → ít overhead hơn
- Người dùng truy cập nhanh hơn vì ít hops

---

## 🎯 Checklist trước khi share

- [ ] Backend đang chạy tại localhost:3006
- [ ] Frontend đang chạy tại localhost:3000
- [ ] Ngrok tunnel đã khởi động cho port 3000
- [ ] Copy đúng ngrok URL (https://xxx.ngrok-free.app)
- [ ] Test truy cập từ browser khác (Incognito/Private mode)
- [ ] Kiểm tra API calls hoạt động (mở DevTools → Network tab)

---

## 🚀 Commands nhanh

```powershell
# Terminal 1 - Backend
cd Backend\my_store_backend
node server.js

# Terminal 2 - Frontend  
cd frontend
npm start

# Terminal 3 - Ngrok
ngrok http 3000
```

**Xong! Share URL ngrok là có thể truy cập từ máy khác! 🎉**

---

## 📱 Demo cho người khác

Khi người khác truy cập ngrok URL:
1. Họ sẽ thấy website của bạn
2. Tất cả tính năng hoạt động bình thường
3. API calls tự động được proxy về backend trên máy bạn
4. Database vẫn là MySQL local trên máy bạn

**Lưu ý**: Máy bạn phải bật và giữ cả Backend + Frontend đang chạy!
