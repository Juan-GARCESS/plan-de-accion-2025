# Script de migración automática de MySQL a PostgreSQL
Write-Host "🚀 Iniciando migración automática de rutas API..." -ForegroundColor Cyan

# Encontrar todos los archivos TypeScript en API
$apiFiles = Get-ChildItem -Path "src/app/api" -Filter "*.ts" -Recurse

$migratedCount = 0
$errorCount = 0

foreach ($file in $apiFiles) {
    $filePath = $file.FullName
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    
    # 1. Reemplazar destructuración de arrays (const [var] = await db.query)
    $content = $content -replace '(const \[)(\w+)(\] = await db\.)(query|execute)(<.*?>)?\(', 'const $2Result = await db.query('
    
    # 2. Reemplazar accesos a datos destructurados
    $content = $content -creplace '(\w+) as \{ .*? \}\[\]', '$1Result.rows'
    $content = $content -creplace '(\w+) as .*?\[\]', '$1Result.rows'
    
    # 3. Cambiar verificaciones de longitud
    $content = $content -replace '(\w+)\.length === 0', '$1Result.rows.length === 0'
    $content = $content -replace '(\w+)\.length > 0', '$1Result.rows.length > 0'
    $content = $content -replace '(\w+)\[0\]\.', '$1Result.rows[0].'
    
    # 4. Reemplazar NOW() por CURRENT_TIMESTAMP
    $content = $content -replace 'NOW\(\)', 'CURRENT_TIMESTAMP'
    
    # 5. Reemplazar placeholders ? por $1, $2, etc (esto es complejo, solo para queries simples)
    # Por ahora lo dejamos para manual
    
    # 6. db.execute -> db.query
    $content = $content -replace 'db\.execute\(', 'db.query('
    
    # 7. Reemplazar result.insertId y result.affectedRows
    $content = $content -replace 'result\.insertId', 'result.rows[0].id'
    $content = $content -replace 'result\.affectedRows', 'result.rowCount'
    
    # 8. Reemplazar booleanos de MySQL (0, 1) por true/false
    $content = $content -replace 'activo = 1', 'activo = true'
    $content = $content -replace 'activo = 0', 'activo = false'
    $content = $content -replace 'abierto = 1', 'abierto = true'
    $content = $content -replace 'abierto = 0', 'abierto = false'
    
    # Si hubo cambios
    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -NoNewline
        Write-Host "✅ Migrado: $($file.Name)" -ForegroundColor Green
        $migratedCount++
    }
}

Write-Host "`n✨ Migración completada:" -ForegroundColor Cyan
Write-Host "   - Archivos migrados: $migratedCount" -ForegroundColor Green
Write-Host "   - Archivos con errores: $errorCount" -ForegroundColor Yellow
Write-Host "`n⚠️  IMPORTANTE: Verifica placeholders (? -> `$1, `$2) manualmente" -ForegroundColor Yellow
