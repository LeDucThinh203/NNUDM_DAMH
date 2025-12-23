# Script khởi động 1 ngrok tunnel cho Frontend (có proxy tới Backend)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NGROK CHỈ CHO FRONTEND (Có Backend Proxy)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Kiểm tra Backend đang chạy
Write-Host "`n[1/3] Kiểm tra Backend (localhost:3006)..." -ForegroundColor Green
$backendRunning = Get-NetTCPConnection -LocalPort 3006 -State Listen -ErrorAction SilentlyContinue
if (-not $backendRunning) {
    Write-Host "❌ Backend chưa chạy!" -ForegroundColor Red
    Write-Host "`n📝 Hãy chạy Backend trước:" -ForegroundColor Yellow
    Write-Host "   cd Backend\my_store_backend" -ForegroundColor White
    Write-Host "   npm start" -ForegroundColor White
    exit 1
}
Write-Host "✅ Backend đang chạy" -ForegroundColor Green

# Kiểm tra Frontend đang chạy
Write-Host "`n[2/3] Kiểm tra Frontend (localhost:3000)..." -ForegroundColor Green
$frontendRunning = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (-not $frontendRunning) {
    Write-Host "❌ Frontend chưa chạy!" -ForegroundColor Red
    Write-Host "`n📝 Hãy chạy Frontend trước:" -ForegroundColor Yellow
    Write-Host "   cd frontend" -ForegroundColor White
    Write-Host "   npm start" -ForegroundColor White
    exit 1
}
Write-Host "✅ Frontend đang chạy" -ForegroundColor Green

# Khởi động ngrok cho Frontend
Write-Host "`n[3/3] Khởi động ngrok cho Frontend (port 3000)..." -ForegroundColor Green
Start-Process -FilePath "ngrok" -ArgumentList "http", "3000" -WindowStyle Normal
Start-Sleep -Seconds 3

# Lấy URL ngrok
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get
    $frontendUrl = $response.tunnels[0].public_url
    
    if ($frontendUrl) {
        Write-Host "`n========================================" -ForegroundColor Cyan
        Write-Host "  ✅ THÀNH CÔNG!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        
        Write-Host "`n🌍 URL CHIA SẺ:" -ForegroundColor Yellow
        Write-Host "   $frontendUrl" -ForegroundColor Green
        
        Write-Host "`n📱 MÁY KHÁC TRUY CẬP:" -ForegroundColor Cyan
        Write-Host "   - Mở trình duyệt: $frontendUrl" -ForegroundColor White
        Write-Host "   - Frontend sẽ tự động gọi Backend qua proxy" -ForegroundColor White
        Write-Host "   - Backend chạy localhost:3006 (không cần ngrok riêng)" -ForegroundColor White
        
        Write-Host "`n💡 CÁCH HOẠT ĐỘNG:" -ForegroundColor Cyan
        Write-Host "   Browser → Ngrok Frontend → Proxy → Backend localhost:3006" -ForegroundColor White
        
        Write-Host "`n⚠️  LƯU Ý:" -ForegroundColor Yellow
        Write-Host "   - KHÔNG tắt Backend (localhost:3006)" -ForegroundColor White
        Write-Host "   - KHÔNG tắt Frontend (localhost:3000)" -ForegroundColor White
        Write-Host "   - Giữ terminal này mở (ngrok đang chạy)" -ForegroundColor White
        
        Write-Host "`n========================================" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "❌ Không thể lấy URL ngrok" -ForegroundColor Red
    Write-Host "   Kiểm tra ngrok đã cài đặt: https://ngrok.com/download" -ForegroundColor Yellow
    exit 1
}

Write-Host "  Nhấn Ctrl+C để dừng ngrok" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Giữ script chạy
Wait-Process -Id (Get-Process ngrok).Id
