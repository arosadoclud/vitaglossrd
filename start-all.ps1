# ═══════════════════════════════════════════════════════
#  VitaGloss RD — Script de arranque completo
#  Ejecutar desde la raíz del proyecto:
#  .\start-all.ps1
# ═══════════════════════════════════════════════════════

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         VitaGloss RD — Sistema completo              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot

# 1. Backend API
Write-Host "▶ Iniciando Backend API (puerto 4000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# 2. Frontend
Write-Host "▶ Iniciando Frontend (puerto 5174)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# 3. WhatsApp Service
Write-Host "▶ Iniciando Servicio WhatsApp (puerto 3001)..." -ForegroundColor Yellow
Write-Host "  → Luego abre http://localhost:3001/qr?key=vitagloss_wa_2026 para escanear el QR" -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\whatsapp-service'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# 4. n8n
Write-Host "▶ Iniciando n8n (puerto 5678)..." -ForegroundColor Magenta
Write-Host "  → Abre http://localhost:5678 para importar el workflow" -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "n8n start" -WindowStyle Normal

Write-Host ""
Write-Host "══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Servicios arrancando en ventanas separadas:" -ForegroundColor White
Write-Host "  🔷 Backend API    →  http://localhost:4000" -ForegroundColor Cyan
Write-Host "  🔷 Frontend       →  http://localhost:5174" -ForegroundColor Cyan
Write-Host "  📱 WhatsApp QR    →  http://localhost:3001/qr?key=vitagloss_wa_2026" -ForegroundColor Green
Write-Host "  🔧 n8n Workflows  →  http://localhost:5678" -ForegroundColor Magenta
Write-Host "══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "  1. Escanea el QR de WhatsApp" -ForegroundColor White
Write-Host "  2. En n8n: New Workflow → Import → n8n-workflow/vitagloss-ventas.json" -ForegroundColor White
Write-Host "  3. En n8n: Settings → Variables → agrega WA_SECRET, VENDOR_PHONE, API_URL, ADMIN_TOKEN" -ForegroundColor White
Write-Host "  4. Activa el workflow en n8n" -ForegroundColor White
Write-Host ""
