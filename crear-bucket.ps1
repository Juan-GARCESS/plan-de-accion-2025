# 🪣 Script PowerShell para crear Bucket S3
# Ejecutar este script SOLO si tienes AWS CLI instalado
# De lo contrario, usa AWS Toolkit en VS Code o AWS Console

$bucketName = "plan-accion-evidencias-oct2025"
$region = "us-east-1"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Creando Bucket S3 para Plan de Acción" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Bucket: $bucketName" -ForegroundColor Yellow
Write-Host "🌎 Region: $region" -ForegroundColor Yellow
Write-Host ""

# Verificar si AWS CLI está instalado
try {
    $awsVersion = aws --version 2>&1
    Write-Host "✅ AWS CLI detectado: $awsVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ AWS CLI no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "📌 Opciones alternativas:" -ForegroundColor Yellow
    Write-Host "   1. Usar AWS Toolkit en VS Code (RECOMENDADO)" -ForegroundColor White
    Write-Host "   2. Usar AWS Console: https://console.aws.amazon.com/s3" -ForegroundColor White
    Write-Host "   3. Instalar AWS CLI: https://aws.amazon.com/cli/" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Ver instrucciones completas en: CREAR_BUCKET_S3.md" -ForegroundColor Cyan
    exit 1
}

# Crear bucket
Write-Host "🔨 Creando bucket..." -ForegroundColor Cyan
try {
    aws s3api create-bucket --bucket $bucketName --region $region --create-bucket-configuration LocationConstraint=$region 2>&1 | Out-Null
    Write-Host "✅ Bucket creado exitosamente!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  El bucket ya existe o hubo un error" -ForegroundColor Yellow
    Write-Host "   Continuando con configuración..." -ForegroundColor White
}

Write-Host ""
Write-Host "🔓 Configurando acceso público..." -ForegroundColor Cyan
aws s3api put-public-access-block `
    --bucket $bucketName `
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

Write-Host ""
Write-Host "📋 Aplicando Bucket Policy..." -ForegroundColor Cyan
$bucketPolicy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$bucketName/*"
        }
    ]
}
"@

$bucketPolicy | Out-File -FilePath "temp-bucket-policy.json" -Encoding utf8
aws s3api put-bucket-policy --bucket $bucketName --policy file://temp-bucket-policy.json
Remove-Item "temp-bucket-policy.json"

Write-Host ""
Write-Host "🌐 Configurando CORS..." -ForegroundColor Cyan
$corsConfig = @"
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedOrigins": [
                "http://localhost:3000",
                "http://192.168.1.48:3000"
            ],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
"@

$corsConfig | Out-File -FilePath "temp-cors-config.json" -Encoding utf8
aws s3api put-bucket-cors --bucket $bucketName --cors-configuration file://temp-cors-config.json
Remove-Item "temp-cors-config.json"

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  ✅ BUCKET CONFIGURADO EXITOSAMENTE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. ✅ Bucket creado: $bucketName" -ForegroundColor White
Write-Host "2. ⏳ Actualiza .env.local con tus credenciales AWS" -ForegroundColor White
Write-Host "3. ⏳ Ejecuta SQL en Neon: database/EJECUTAR_EN_NEON_ARCHIVOS.sql" -ForegroundColor White
Write-Host "4. ⏳ Reinicia servidor: npm run dev" -ForegroundColor White
Write-Host "5. ⏳ Prueba subiendo un archivo en /dashboard/trimestre/1" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Verificar bucket en:" -ForegroundColor Cyan
Write-Host "   https://s3.console.aws.amazon.com/s3/buckets/$bucketName" -ForegroundColor White
Write-Host ""
