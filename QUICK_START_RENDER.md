# 🚀 QUICK START - Deploy Lên Render.com FREE

## ⚡ Các Bước Nhanh (5 phút)

### 1️⃣ Chuẩn Bị Database MySQL Free

Chọn 1 trong các options sau (MIỄN PHÍ):

**Option A: FreeSQLDatabase.com** ⭐ Khuyến nghị
```
1. Truy cập: https://www.freesqldatabase.com/
2. Sign up & Create Database
3. Nhận thông tin:
   - Host: sql12.freesqldatabase.com
   - Database: sql12xxxxx
   - Username: sql12xxxxx  
   - Password: xxxxxxxxx
   - Port: 3306
```

**Option B: db4free.net**
```
1. Truy cập: https://www.db4free.net
2. Sign up & Create Database  
3. Max 200MB (đủ cho testing)
```

**Option C: Aiven MySQL**
```
1. Truy cập: https://aiven.io
2. Sign up → Nhận $300 credit
3. Create MySQL service
```

### 2️⃣ Import Database Schema

**Dùng MySQL Workbench hoặc phpMyAdmin:**
```sql
-- Import file: Database/DBWebBanDoBongDa.sql
-- vào database vừa tạo
```

**Hoặc dùng command line:**
```powershell
mysql -h sql12.freesqldatabase.com -u sql12xxxxx -p sql12xxxxx < Database/DBWebBanDoBongDa.sql
```

### 3️⃣ Push Code Lên GitHub

```powershell
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 4️⃣ Deploy trên Render

#### A. Tạo Backend Service

1. Truy cập: https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect GitHub → Chọn repo `Do_An_Chuyen_Nganh`
4. Configure:
   ```
   Name: my-store-backend
   Region: Singapore
   Branch: main
   Root Directory: Backend/my_store_backend
   Environment: Docker
   Dockerfile Path: ./Backend/my_store_backend/Dockerfile
   ```

5. **Environment Variables** (Click "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=sql12.freesqldatabase.com
   DB_USER=sql12xxxxx
   DB_PASSWORD=your-password
   DB_NAME=sql12xxxxx
   DB_PORT=3306
   JWT_SECRET=change-this-to-random-string-32-characters-min
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

6. Click **Create Web Service**
7. Đợi deploy (3-5 phút)
8. Copy URL: `https://my-store-backend.onrender.com`

#### B. Tạo Frontend Site

1. Click **New +** → **Static Site**
2. Connect GitHub → Chọn repo `Do_An_Chuyen_Nganh`
3. Configure:
   ```
   Name: my-store-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: build
   ```

4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://my-store-backend.onrender.com
   ```
   ⚠️ **Thay URL bằng URL backend thực tế của bạn!**

5. Click **Create Static Site**
6. Đợi deploy (2-3 phút)
7. Copy URL: `https://my-store-frontend.onrender.com`

### 5️⃣ Test Website

1. Mở `https://my-store-frontend.onrender.com`
2. Test đăng ký/đăng nhập
3. Test tính năng AI chat
4. Kiểm tra API: `https://my-store-backend.onrender.com/health`

---

## 🎯 Deploy Bằng Blueprint (Tự Động)

File `render.yaml` đã có sẵn ở root project!

### Cách dùng:

1. Dashboard → **New +** → **Blueprint**
2. Connect Repository → `Do_An_Chuyen_Nganh`
3. Render tự động đọc file `render.yaml`
4. Nhập các Environment Variables:
   ```
   DB_HOST: sql12.freesqldatabase.com
   DB_USER: sql12xxxxx
   DB_PASSWORD: xxxxxx
   DB_NAME: sql12xxxxx
   GEMINI_API_KEY: your-key
   ```
5. Click **Apply**
6. Đợi cả 2 services deploy xong!

---

## 📋 Checklist

- ✅ Database MySQL đã tạo và import schema
- ✅ Code đã push lên GitHub
- ✅ Backend service deployed
- ✅ Frontend site deployed  
- ✅ Environment variables đã set đúng
- ✅ CORS đã cấu hình
- ✅ Test website hoạt động

---

## 🐛 Troubleshooting Nhanh

### Backend không start?
```
→ Check logs: Dashboard → my-store-backend → Logs
→ Verify Environment Variables
→ Test DB connection: /health endpoint
```

### Frontend không load?
```
→ Check REACT_APP_API_URL đã đúng chưa
→ Xem Console trong Browser (F12)
→ Test backend health: https://your-backend.onrender.com/health
```

### CORS Error?
```
→ Backend đã config cors: origin: '*'
→ Redeploy backend nếu vừa sửa
```

### Service Sleep?
```
→ Free tier sleep sau 15 phút
→ Lần đầu truy cập mất 30-50s wake up
→ Dùng UptimeRobot.com (free) để keep alive
```

---

## 💡 Tips

1. **Free tier limitations:**
   - Services sleep sau 15 phút inactive
   - Wake up mất ~30-50 giây
   - 750 giờ/tháng (đủ cho 1 service chạy 24/7)

2. **Keep services alive:**
   - Dùng https://uptimerobot.com (free)
   - Ping health endpoint mỗi 5 phút

3. **Custom domain:**
   - Render hỗ trợ custom domain FREE
   - Settings → Custom Domain → Add domain

4. **Auto deploy:**
   - Mỗi khi push GitHub, Render tự động rebuild
   - Settings → Deploy Hooks để config

---

## 🎉 Done!

Website của bạn đã LIVE với:
- ✅ Backend Node.js + AI
- ✅ Frontend React
- ✅ Database MySQL
- ✅ HTTPS miễn phí
- ✅ Auto deploy from Git
- ✅ Hoàn toàn MIỄN PHÍ

**URLs:**
- Frontend: `https://my-store-frontend.onrender.com`
- Backend: `https://my-store-backend.onrender.com`
- Swagger: `https://my-store-backend.onrender.com/swagger`

---

📖 **Chi tiết đầy đủ:** Xem file `DEPLOY_RENDER_DOCKER.md`
