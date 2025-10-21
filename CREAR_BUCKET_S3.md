# 🪣 Crear Nuevo Bucket S3 para Plan de Acción

## 📝 Información del Bucket
- **Nombre**: `plan-accion-evidencias-oct2025`
- **Región**: `us-east-1` (Norte de Virginia)
- **Propósito**: Almacenar archivos de evidencias del sistema de Plan de Acción

---

## 🎯 Método 1: Usando AWS Toolkit en VS Code (RECOMENDADO)

### Paso 1: Abrir AWS Explorer
1. En VS Code, haz clic en el ícono de **AWS** en la barra lateral izquierda (logo de AWS)
2. Si no lo ves, presiona `Ctrl+Shift+P` y busca "AWS: Focus on Explorer View"

### Paso 2: Crear el Bucket
1. En el panel de AWS, expande la sección **S3**
2. Haz clic derecho en **S3** y selecciona **"Create Bucket"**
3. Ingresa el nombre: `plan-accion-evidencias-oct2025`
4. Selecciona región: **us-east-1**
5. Haz clic en **Create**

### Paso 3: Configurar Permisos (IMPORTANTE)
1. En el AWS Explorer, expande **S3**
2. Busca tu bucket `plan-accion-evidencias-oct2025`
3. Haz clic derecho → **"Open in AWS Console"**
4. En la consola web, ve a la pestaña **"Permissions"**
5. Desactiva "Block all public access" (necesario para URLs públicas)
6. Confirma el cambio

### Paso 4: Agregar CORS Policy
1. En la pestaña **"Permissions"** del bucket
2. Scroll hasta **"Cross-origin resource sharing (CORS)"**
3. Haz clic en **Edit**
4. Pega esta configuración:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": [
            "http://localhost:3000",
            "http://192.168.1.48:3000",
            "https://tu-dominio.com"
        ],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]
```

5. Haz clic en **Save changes**

### Paso 5: Agregar Bucket Policy (Acceso Público de Lectura)
1. En la pestaña **"Permissions"**
2. Scroll hasta **"Bucket policy"**
3. Haz clic en **Edit**
4. Pega esta política:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::plan-accion-evidencias-oct2025/*"
        }
    ]
}
```

5. Haz clic en **Save changes**

---

## 🎯 Método 2: Usando AWS Console (Alternativo)

1. Ve a https://s3.console.aws.amazon.com/s3/buckets
2. Haz clic en **"Create bucket"**
3. Configuración:
   - **Bucket name**: `plan-accion-evidencias-oct2025`
   - **AWS Region**: `us-east-1`
   - **Block Public Access**: DESACTIVAR "Block all public access"
   - Marca la casilla de confirmación
4. Haz clic en **"Create bucket"**
5. Sigue los pasos 3, 4 y 5 del Método 1 para CORS y Bucket Policy

---

## 🔑 Obtener Credenciales AWS

### Opción A: Desde AWS Toolkit en VS Code
1. En el AWS Explorer, haz clic en el ícono de perfil (arriba)
2. Deberías ver tu cuenta conectada
3. Las credenciales ya están configuradas en tu máquina

### Opción B: Crear Access Keys en AWS Console
1. Ve a https://console.aws.amazon.com/iam/
2. Haz clic en tu nombre de usuario (arriba derecha) → **Security credentials**
3. Scroll hasta **"Access keys"**
4. Haz clic en **"Create access key"**
5. Selecciona **"Other"** como caso de uso
6. Haz clic en **"Create access key"**
7. **IMPORTANTE**: Guarda el **Access Key ID** y **Secret Access Key**
8. Actualiza tu `.env.local`:

```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

---

## ✅ Verificar Bucket Creado

### En VS Code:
1. Abre el AWS Explorer
2. Expande **S3**
3. Deberías ver `plan-accion-evidencias-oct2025` en la lista

### Estructura que se creará automáticamente:
```
plan-accion-evidencias-oct2025/
└── evidencias/
    └── {usuario_id}/
        └── trimestre-{1-4}/
            ├── 1729512345_abc123_documento.pdf
            ├── 1729512456_def456_reporte.xlsx
            └── 1729512567_ghi789_evidencia.docx
```

---

## 🚀 Próximos Pasos

Después de crear el bucket:

1. ✅ **Bucket creado**: `plan-accion-evidencias-oct2025`
2. ⏳ **Actualizar .env.local** con tus credenciales reales
3. ⏳ **Ejecutar SQL** en Neon: `database/EJECUTAR_EN_NEON_ARCHIVOS.sql`
4. ⏳ **Reiniciar servidor**: `npm run dev`
5. ⏳ **Probar subida** en http://localhost:3000/dashboard/trimestre/1

---

## 🐛 Troubleshooting

### Error: "Access Denied"
- ✅ Verifica que desactivaste "Block all public access"
- ✅ Verifica que agregaste la Bucket Policy

### Error: "CORS"
- ✅ Verifica que agregaste la configuración CORS
- ✅ Verifica que tu URL está en AllowedOrigins

### Error: "Credentials not found"
- ✅ Verifica que agregaste las credenciales en `.env.local`
- ✅ Reinicia el servidor después de actualizar `.env.local`

---

## 📞 Necesitas Ayuda?

Si tienes problemas, avísame y te ayudo paso a paso! 🚀
