# Script para agregar campo foto_url a usuarios
# Ejecutar desde la raíz del proyecto

Write-Host "Agregando campo foto_url a la tabla usuarios..." -ForegroundColor Yellow

# Cargar variables de entorno
if (Test-Path .env.local) {
    Get-Content .env.local | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

$dbUrl = $env:DATABASE_URL

if (-not $dbUrl) {
    Write-Host "ERROR: DATABASE_URL no esta configurada en .env.local" -ForegroundColor Red
    exit 1
}

# Extraer información de conexión
if ($dbUrl -match 'postgres://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
    $user = $matches[1]
    $password = $matches[2]
    $host = $matches[3]
    $port = $matches[4]
    $database = $matches[5]
    
    Write-Host "Conectando a: $host" -ForegroundColor Cyan
    
    # Ejecutar migración
    $env:PGPASSWORD = $password
    $sql = Get-Content "database\add_foto_url.sql" -Raw
    
    $sql | psql -h $host -p $port -U $user -d $database
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Campo foto_url agregado exitosamente" -ForegroundColor Green
    } else {
        Write-Host "Error al ejecutar la migracion" -ForegroundColor Red
    }
} else {
    Write-Host "ERROR: No se pudo parsear DATABASE_URL" -ForegroundColor Red
    exit 1
}
