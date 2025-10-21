# Script de Setup Automático para Plan de Acción 2025
# Ejecutar este script en una instalación nueva

Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host "  📦 SETUP - Plan de Acción 2025" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "📋 1. Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js NO instalado" -ForegroundColor Red
    Write-Host "   📥 Descargar desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar npm
Write-Host "`n📋 2. Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm instalado: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm NO instalado" -ForegroundColor Red
    exit 1
}

# Verificar si .env.local existe
Write-Host "`n📋 3. Verificando archivo .env.local..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "   ✅ Archivo .env.local encontrado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Archivo .env.local NO encontrado" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   📝 Creando archivo .env.local de ejemplo..." -ForegroundColor Cyan
    
    $envContent = @"
# Base de Datos PostgreSQL (Neon)
DATABASE_URL=postgresql://[SOLICITAR_AL_ADMINISTRADOR]

# Secreto de Sesión
SESSION_SECRET=cambia-esto-por-un-secreto-aleatorio-seguro

# AWS S3 para Archivos
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=[SOLICITAR_AL_ADMINISTRADOR]
AWS_SECRET_ACCESS_KEY=[SOLICITAR_AL_ADMINISTRADOR]
AWS_S3_BUCKET_NAME=plan-accion-evidencias-oct2025

# Resend para Emails
RESEND_API_KEY=[SOLICITAR_AL_ADMINISTRADOR]

# URL de la Aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "   ✅ Archivo .env.local creado" -ForegroundColor Green
    Write-Host ""
    Write-Host "   ⚠️  IMPORTANTE: Edita .env.local y agrega las credenciales reales" -ForegroundColor Yellow
    Write-Host "   📝 Solicita las credenciales al administrador del proyecto" -ForegroundColor Yellow
    Write-Host ""
}

# Instalar dependencias
Write-Host "`n📋 4. Instalando dependencias..." -ForegroundColor Yellow
Write-Host "   ⏳ Esto puede tomar algunos minutos..." -ForegroundColor Cyan
Write-Host ""

try {
    npm install
    Write-Host ""
    Write-Host "   ✅ Dependencias instaladas correctamente" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}

# Verificar archivos importantes
Write-Host "`n📋 5. Verificando estructura del proyecto..." -ForegroundColor Yellow

$archivosImportantes = @(
    "package.json",
    "next.config.ts",
    "tsconfig.json",
    "src/app/page.tsx",
    "src/lib/db.ts"
)

$todosExisten = $true
foreach ($archivo in $archivosImportantes) {
    if (Test-Path $archivo) {
        Write-Host "   ✅ $archivo" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $archivo - NO ENCONTRADO" -ForegroundColor Red
        $todosExisten = $false
    }
}

# Obtener IP local
Write-Host "`n📋 6. Información de Red..." -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*" } | Select-Object -First 1).IPAddress

if ($ipAddress) {
    Write-Host "   🌐 Tu IP Local: $ipAddress" -ForegroundColor Green
    Write-Host "   📱 Acceso desde otros dispositivos: http://${ipAddress}:3000" -ForegroundColor Cyan
} else {
    Write-Host "   ⚠️  No se pudo determinar la IP local" -ForegroundColor Yellow
}

# Resumen final
Write-Host "`n=============================================" -ForegroundColor Green
if ($todosExisten) {
    Write-Host "  ✅ INSTALACIÓN COMPLETADA" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  INSTALACIÓN CON WARNINGS" -ForegroundColor Yellow
}
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 🔑 Editar .env.local con las credenciales reales" -ForegroundColor White
Write-Host "2. 🚀 Ejecutar: npm run dev" -ForegroundColor White
Write-Host "3. 🌐 Abrir: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "📚 Más información en: INSTRUCCIONES_INSTALACION.md" -ForegroundColor Cyan
Write-Host ""

# Preguntar si desea iniciar el servidor
$respuesta = Read-Host "¿Deseas iniciar el servidor ahora? (s/n)"
if ($respuesta -eq "s" -or $respuesta -eq "S") {
    Write-Host ""
    Write-Host "🚀 Iniciando servidor..." -ForegroundColor Green
    Write-Host "   Presiona Ctrl+C para detener" -ForegroundColor Yellow
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "👋 Para iniciar manualmente, ejecuta: npm run dev" -ForegroundColor Cyan
    Write-Host ""
}
