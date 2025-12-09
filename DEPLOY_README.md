# 🚀 Deploy Node.js + Docker Lên Render.com - MIỄN PHÍ

## 📚 Tài Liệu

Dự án này hỗ trợ deploy lên Render.com hoàn toàn miễn phí với Docker.

### 📖 Hướng Dẫn Chi Tiết

1. **[QUICK_START_RENDER.md](./QUICK_START_RENDER.md)** ⚡
   - Hướng dẫn nhanh 5 phút
   - Các bước cơ bản để deploy
   - Checklist và troubleshooting

2. **[DEPLOY_RENDER_DOCKER.md](./DEPLOY_RENDER_DOCKER.md)** 📘
   - Hướng dẫn chi tiết đầy đủ
   - Giải thích từng bước
   - Tips & best practices
   - Security checklist

3. **[DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md)** 🐳
   - Deploy local bằng Docker
   - Docker Compose setup
   - Quản lý containers

---

## ⚡ Quick Start (5 Phút)

### 1. Chuẩn Bị Database MySQL Free
Đăng ký tại: https://www.freesqldatabase.com/

### 2. Cấu Hình Environment Variables
```powershell
# Backend
cd Backend/my_store_backend
Copy-Item .env.example .env
notepad .env  # Điền thông tin database
```

### 3. Test Connection
```powershell
# Test database connection
node scripts/test_db_connection.js
```

### 4. Push Lên GitHub
```powershell
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 5. Deploy Trên Render
- Truy cập: https://dashboard.render.com
- New → Blueprint
- Connect repo `Do_An_Chuyen_Nganh`
- Nhập Environment Variables
- Click **Apply**

---

## 📦 Cấu Trúc Project

```
Do_An_Chuyen_Nganh/
├── Backend/my_store_backend/
│   ├── Dockerfile              # Docker config cho backend
│   ├── .dockerignore           # Exclude files
│   ├── .env.example            # Template environment vars
│   └── scripts/
│       └── test_db_connection.js  # Test DB script
├── frontend/
│   ├── Dockerfile              # Multi-stage build React
│   ├── .dockerignore           # Exclude files  
│   └── nginx.conf              # Nginx config
├── render.yaml                 # Render Blueprint (auto deploy)
├── docker-compose.yml          # Local Docker setup
├── QUICK_START_RENDER.md       # Quick start guide
├── DEPLOY_RENDER_DOCKER.md     # Full deployment guide
└── DOCKER_DEPLOYMENT_GUIDE.md  # Local Docker guide
```

---

## 🎯 Services

### Backend API
- **Technology:** Node.js + Express + AI (Gemini)
- **Port:** 3006 (local) / 10000 (Render)
- **Health Check:** `/health`
- **Swagger:** `/swagger`

### Frontend
- **Technology:** React + Bootstrap
- **Server:** Nginx
- **Port:** 80 (local) / 443 (Render with HTTPS)

### Database
- **Type:** MySQL 8.0
- **Options:** 
  - FreeSQLDatabase.com (Free, 5MB)
  - db4free.net (Free, 200MB)
  - Aiven MySQL (Free $300 credit)

---

## 🌐 URLs Sau Khi Deploy

- **Frontend:** `https://my-store-frontend.onrender.com`
- **Backend:** `https://my-store-backend.onrender.com`
- **API Docs:** `https://my-store-backend.onrender.com/swagger`
- **Health:** `https://my-store-backend.onrender.com/health`

---

## 🔑 Environment Variables Cần Thiết

### Backend (.env)
```env
# Database
DB_HOST=sql12.freesqldatabase.com
DB_USER=sql12xxxxx
DB_PASSWORD=your-password
DB_NAME=sql12xxxxx
DB_PORT=3306

# Security
JWT_SECRET=random-32-characters-minimum

# AI
GEMINI_API_KEY=your-gemini-api-key

# Server
NODE_ENV=production
PORT=10000
```

### Frontend
```env
REACT_APP_API_URL=https://my-store-backend.onrender.com
```

---

## 🛠️ Commands Hữu Ích

### Test Database
```powershell
cd Backend/my_store_backend
node scripts/test_db_connection.js
```

### Run Local với Docker
```powershell
# Start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all
docker-compose down
```

### Deploy Manual
```powershell
# Push to GitHub (trigger auto-deploy)
git add .
git commit -m "Update"
git push origin main
```

---

## 💰 Chi Phí

### ✅ HOÀN TOÀN MIỄN PHÍ
- Backend Web Service (Free tier)
- Frontend Static Site (Free tier)
- MySQL Database (FreeSQLDatabase.com)
- HTTPS Certificate (Render tự động)
- Custom Domain (Optional, FREE)

### 📊 Limitations Free Tier
- Services sleep sau 15 phút inactive
- Wake up: ~30-50 giây
- 750 giờ/tháng (đủ cho 1 service 24/7)
- Băng thông: 100GB/tháng
- Build: 500 phút/tháng

---

## 🔒 Security Best Practices

✅ **Đã Implement:**
- Environment variables cho secrets
- HTTPS auto (Render)
- CORS configured
- JWT authentication
- Input validation
- SQL injection prevention (mysql2)

⚠️ **Cần Làm:**
- Đổi tất cả default passwords
- Generate strong JWT_SECRET (32+ chars)
- Không commit `.env` vào Git
- Enable rate limiting (optional)
- Regular backup database

---

## 📊 Monitoring

### Health Check
```bash
curl https://my-store-backend.onrender.com/health
```

### Logs
- Render Dashboard → Service → Logs
- Real-time streaming
- Download logs available

### Uptime Monitoring (FREE)
- UptimeRobot: https://uptimerobot.com
- Ping `/health` mỗi 5 phút
- Email alerts khi down

---

## 🐛 Troubleshooting

### Backend không start?
1. Check logs trên Render Dashboard
2. Verify environment variables
3. Test database connection
4. Check Dockerfile syntax

### Frontend không load backend?
1. Verify `REACT_APP_API_URL` đúng
2. Check CORS config trên backend
3. Test backend health endpoint
4. Check browser console (F12)

### Database connection error?
1. Run `test_db_connection.js` local
2. Verify credentials
3. Check firewall/IP whitelist
4. Test connection từ Render logs

### Service sleep?
- Free tier normal behavior
- First request mất 30-50s wake up
- Dùng UptimeRobot để keep alive

---

## 📞 Support

### Tài Liệu
- [Render Docs](https://render.com/docs)
- [Docker Docs](https://docs.docker.com)
- [React Docs](https://react.dev)

### Issues
Nếu gặp lỗi, kiểm tra:
1. ✅ `.env` đã config đúng
2. ✅ Database đã import schema
3. ✅ Code đã push lên GitHub
4. ✅ Environment variables trên Render
5. ✅ Logs trên Render Dashboard

---

## 🎉 Deploy Thành Công!

Sau khi deploy xong bạn có:
- ✅ Website chạy 24/7
- ✅ HTTPS miễn phí
- ✅ Auto deploy khi push Git
- ✅ AI chatbot integrated
- ✅ Swagger API documentation
- ✅ Professional URLs
- ✅ Hoàn toàn MIỄN PHÍ

**Happy Coding! 🚀**

---

## 📝 License

MIT License - Free to use for personal and commercial projects.
