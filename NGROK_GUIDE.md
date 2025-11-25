# 🚀 Hướng dẫn chạy web với Ngrok

## ⚠️ Vấn đề đã phát hiện và giải quyết:

### 1. Port 3000 bị Docker chiếm
- **Process**: Docker Backend (PID 17716) và WSL Relay (PID 19104)
- **Giải pháp**: Đã dừng Docker để giải phóng port ✅

### 2. Ngrok URL đã offline
- URL cũ `https://profusive-saundra-eudaemonistically.ngrok-free.dev` không còn hoạt động
- **Giải pháp**: Chuyển về dùng localhost cho development ✅

---

## 🔧 Cách chạy web (3 Options)

### Option 1: Chạy LOCAL (Recommended cho Development)

**Backend:**
```powershell
cd "e:\NamHoc_2023-2024\Do_An_Chuyen_Nganh\Code_DACN\Do_An_Chuyen_Nganh\Backend\my_store_backend"
node server.js
```

**Frontend:** (Terminal mới)
```powershell
cd "e:\NamHoc_2023-2024\Do_An_Chuyen_Nganh\Code_DACN\Do_An_Chuyen_Nganh\frontend"
npm start
```

**Truy cập:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3006
- Swagger: http://localhost:3006/swagger

---

### Option 2: Chạy với NGROK (Share với máy khác)

#### Bước 1: Cài đặt Ngrok
```powershell
# Download từ https://ngrok.com/download
# Hoặc dùng chocolatey:
choco install ngrok
```

#### Bước 2: Lấy Authtoken từ Ngrok
1. Đăng ký tại: https://dashboard.ngrok.com/signup
2. Lấy authtoken: https://dashboard.ngrok.com/get-started/your-authtoken
3. Cấu hình:
```powershell
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

#### Bước 3: Start Backend
```powershell
cd "e:\NamHoc_2023-2024\Do_An_Chuyen_Nganh\Code_DACN\Do_An_Chuyen_Nganh\Backend\my_store_backend"
node server.js
```

#### Bước 4: Start Ngrok tunnel (Terminal mới)
```powershell
ngrok http 3006
```

Ngrok sẽ hiển thị URL như:
```
Forwarding    https://abc-123-xyz.ngrok-free.app -> http://localhost:3006
```

#### Bước 5: Cập nhật Frontend .env
```env
# Uncomment và thay YOUR_NGROK_URL
REACT_APP_API_URL=https://abc-123-xyz.ngrok-free.app
```

#### Bước 6: Start Frontend
```powershell
cd "e:\NamHoc_2023-2024\Do_An_Chuyen_Nganh\Code_DACN\Do_An_Chuyen_Nganh\frontend"
npm start
```

**Share với máy khác:**
- Backend API: `https://abc-123-xyz.ngrok-free.app`
- Frontend: Cần deploy hoặc share qua mạng LAN

---

### Option 3: Share Frontend qua LAN (Không cần Ngrok)

#### Bước 1: Lấy IP của máy bạn
```powershell
ipconfig
# Tìm IPv4 Address (VD: 192.168.1.100)
```

#### Bước 2: Start Backend
```powershell
cd "e:\NamHoc_2023-2024\Do_An_Chuyen_Nganh\Code_DACN\Do_An_Chuyen_Nganh\Backend\my_store_backend"
node server.js
```

#### Bước 3: Cập nhật Frontend .env
```env
# Thay YOUR_IP bằng IP thực của máy bạn
REACT_APP_API_URL=http://YOUR_IP:3006
```

#### Bước 4: Update package.json (thêm host)
```json
"scripts": {
  "start": "HOST=0.0.0.0 react-scripts start",
}
```

**Hoặc dùng biến môi trường:**
```powershell
$env:HOST='0.0.0.0'; npm start
```

#### Bước 5: Người khác truy cập
- Frontend: `http://YOUR_IP:3000`
- Backend: `http://YOUR_IP:3006`

---

## 🐛 Xử lý sự cố

### Lỗi: Port 3000 bị chiếm
```powershell
# Xem process nào đang dùng port 3000
netstat -ano | findstr :3000

# Kill process (thay PID)
taskkill /PID <PID> /F

# Hoặc dừng tất cả Node processes
taskkill /F /IM node.exe
```

### Lỗi: Port 3006 bị chiếm
```powershell
netstat -ano | findstr :3006
taskkill /PID <PID> /F
```

### Lỗi: Cannot connect to backend
1. Kiểm tra backend đang chạy: `curl http://localhost:3006/product`
2. Kiểm tra CORS settings trong backend
3. Kiểm tra file `.env` của frontend có đúng URL

### Lỗi: CORS blocked
Backend đã cấu hình CORS với `origin: '*'` - không cần fix gì thêm

### Lỗi: Ngrok tunnel offline
- Ngrok free tier tunnel chỉ tồn tại 2 giờ
- Phải restart ngrok để lấy URL mới
- Cập nhật lại frontend `.env` với URL mới

---

## ✅ Checklist trước khi chạy

- [ ] MySQL đang chạy
- [ ] Database `my_store` đã được tạo
- [ ] File `.env` backend có thông tin database đúng
- [ ] Dependencies đã cài đặt (`npm install`)
- [ ] Port 3000 và 3006 không bị chiếm
- [ ] Frontend `.env` có đúng backend URL

---

## 📝 File .env mẫu

### Backend `.env`
```env
PORT=3006
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=my_store
DB_PORT=3306

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_key
```

### Frontend `.env`

**Cho Local:**
```env
REACT_APP_API_URL=http://localhost:3006
REACT_APP_ENV=development
PORT=3000
```

**Cho Ngrok:**
```env
REACT_APP_API_URL=https://your-ngrok-url.ngrok-free.app
REACT_APP_ENV=production
PORT=3000
```

---

## 🎯 Status hiện tại

✅ Backend đang chạy tại: `http://localhost:3006`
✅ Frontend đã cấu hình để kết nối với localhost
✅ Port 3000 đã được giải phóng
✅ Tất cả API endpoints đã dùng biến môi trường

**Bạn có thể chạy frontend ngay bây giờ với:**
```powershell
cd "e:\NamHoc_2023-2024\Do_An_Chuyen_Nganh\Code_DACN\Do_An_Chuyen_Nganh\frontend"
npm start
```

Chúc bạn thành công! 🚀
