# Script để chạy 2 ngrok tunnels cho Frontend và Backend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KHỞI ĐỘNG NGROK CHO FRONTEND + BACKEND" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Kiểm tra Backend đang chạy
Write-Host "`n[1/4] Kiểm tra Backend..." -ForegroundColor Green
$backendRunning = Get-NetTCPConnection -LocalPort 3006 -State Listen -ErrorAction SilentlyContinue
if (-not $backendRunning) {
    Write-Host "❌ Backend chưa chạy! Hãy chạy Backend trước (port 3006)" -ForegroundColor Red
    Write-Host "   cd Backend\my_store_backend" -ForegroundColor Yellow
    Write-Host "   npm start" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Backend đang chạy trên port 3006" -ForegroundColor Green

# Kiểm tra Frontend đang chạy
Write-Host "`n[2/4] Kiểm tra Frontend..." -ForegroundColor Green
$frontendRunning = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (-not $frontendRunning) {
    Write-Host "⚠️  Frontend chưa chạy (port 3000)" -ForegroundColor Yellow
    Write-Host "   Bạn có thể chạy Frontend sau khi có Backend URL" -ForegroundColor Yellow
}
else {
    Write-Host "✅ Frontend đang chạy trên port 3000" -ForegroundColor Green
}

# Khởi động ngrok cho Backend
Write-Host "`n[3/4] Khởi động ngrok cho Backend (port 3006)..." -ForegroundColor Green
Start-Process -FilePath "ngrok" -ArgumentList "http", "3006", "--log=stdout" -WindowStyle Normal
Start-Sleep -Seconds 3

# Lấy URL ngrok của Backend từ API
Write-Host "`n[4/4] Lấy URL ngrok..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get
    $backendUrl = $response.tunnels[0].public_url
    
    if ($backendUrl) {
        Write-Host "`n✅ NGROK BACKEND URL: $backendUrl" -ForegroundColor Green
        Write-Host "`n📝 CẬP NHẬT FILE .env CỦA BACKEND:" -ForegroundColor Cyan
        Write-Host "   USE_NGROK=true" -ForegroundColor Yellow
        Write-Host "   NGROK_URL=$backendUrl" -ForegroundColor Yellow
        
        Write-Host "`n🔄 SAU KHI CẬP NHẬT:" -ForegroundColor Cyan
        Write-Host "   1. Restart Backend (Ctrl+C rồi npm start)" -ForegroundColor White
        Write-Host "   2. Restart Frontend (Ctrl+C rồi npm start)" -ForegroundColor White
        Write-Host "   3. Frontend sẽ tự động dùng URL ngrok" -ForegroundColor White
        
        Write-Host "`n🌍 CHIA SẺ VỚI MÁY KHÁC:" -ForegroundColor Cyan
        Write-Host "   - Nếu cần Frontend qua ngrok: chạy 'ngrok http 3000' ở terminal khác" -ForegroundColor White
        Write-Host "   - Nếu Frontend đã deploy: máy khác truy cập Frontend URL trực tiếp" -ForegroundColor White
    }
}
catch {
    Write-Host "❌ Không thể lấy URL ngrok. Kiểm tra ngrok đã cài đặt chưa?" -ForegroundColor Red
    Write-Host "   Tải tại: https://ngrok.com/download" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Ngrok đang chạy... Nhấn Ctrl+C để dừng" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Giữ script chạy
Wait-Process -Id (Get-Process ngrok).Id
