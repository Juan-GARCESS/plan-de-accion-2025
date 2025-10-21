# 🎯 GUÍA RÁPIDA: Crear Bucket Nuevo en VS Code

## ✨ Método Visual (AWS Toolkit en VS Code) - 2 MINUTOS

### Paso 1: Abrir AWS Explorer
1. **Haz clic en el ícono de AWS** en la barra lateral izquierda
   - Es un logo naranja/blanco de AWS
   - O presiona: `Ctrl + Shift + P` → escribe "AWS: Focus on Explorer"

### Paso 2: Crear el Bucket
1. En el panel AWS Explorer, busca la sección **"S3"**
2. Haz clic en el **ícono "+"** junto a S3 (o clic derecho → "Create Bucket")
3. Se abrirá un cuadro en la parte superior
4. Ingresa: `plan-accion-evidencias-oct2025`
5. Presiona **Enter**
6. Selecciona región: **us-east-1**
7. Presiona **Enter**

**¡Listo!** El bucket se creará automáticamente.

---

## 🔧 Paso 3: Configurar Permisos (IMPORTANTE)

### Opción A: Desde VS Code
1. En AWS Explorer → S3
2. Busca tu bucket: `plan-accion-evidencias-oct2025`
3. **Clic derecho** → "Open in AWS Console"
4. Se abrirá en tu navegador

### Opción B: Directamente en AWS Console
1. Ve a: https://s3.console.aws.amazon.com/s3/buckets/plan-accion-evidencias-oct2025
2. Inicia sesión si es necesario

---

## 🔓 Paso 4: Desactivar Bloqueo Público

1. En la página del bucket, ve a la pestaña **"Permissions"**
2. Busca **"Block public access (bucket settings)"**
3. Haz clic en **"Edit"**
4. **DESACTIVA** (quita el check de): "Block all public access"
5. **Marca la casilla** de confirmación (entiendo los riesgos)
6. Clic en **"Save changes"**
7. Escribe `confirm` cuando te lo pida
8. Clic en **"Confirm"**

---

## 📋 Paso 5: Agregar Bucket Policy

1. En la pestaña **"Permissions"**, scroll hasta **"Bucket policy"**
2. Haz clic en **"Edit"**
3. **COPIA Y PEGA** este JSON completo:

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

4. Haz clic en **"Save changes"**

---

## 🌐 Paso 6: Configurar CORS

1. En la pestaña **"Permissions"**, scroll hasta **"Cross-origin resource sharing (CORS)"**
2. Haz clic en **"Edit"**
3. **COPIA Y PEGA** este JSON completo:

```json
[
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
```

4. Haz clic en **"Save changes"**

---

## ✅ Verificación Final

### En VS Code:
1. Ve al AWS Explorer
2. Expande **S3**
3. Deberías ver: `plan-accion-evidencias-oct2025` ✅

### En AWS Console:
1. Ve a: https://s3.console.aws.amazon.com/s3/buckets/
2. Busca tu bucket en la lista
3. Debe mostrar:
   - ✅ Public access: "Objects can be public"
   - ✅ Versioning: Disabled (correcto)
   - ✅ Region: us-east-1

---

## 🚀 Siguiente: Obtener Credenciales

### Si aún no tienes Access Keys:

1. Ve a: https://console.aws.amazon.com/iam/
2. Haz clic en tu nombre (arriba derecha) → **"Security credentials"**
3. Scroll hasta **"Access keys"**
4. Haz clic en **"Create access key"**
5. Selecciona: **"Other"**
6. Haz clic en **"Next"**
7. (Opcional) Agrega una descripción: "VS Code Plan de Acción"
8. Haz clic en **"Create access key"**
9. **⚠️ IMPORTANTE**: Copia AHORA:
   - **Access key ID**: algo como `AKIAIOSFODNN7EXAMPLE`
   - **Secret access key**: algo como `wJalrXUtnFEMI/K7MDENG/...`
   
   **NO PODRÁS VER LA SECRET KEY DESPUÉS!**

10. Haz clic en **"Done"**

---

## 📝 Actualizar .env.local

Abre tu archivo `.env.local` y actualiza:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=TU_ACCESS_KEY_ID_REAL_AQUI
AWS_SECRET_ACCESS_KEY=TU_SECRET_KEY_REAL_AQUI
AWS_S3_BUCKET_NAME=plan-accion-evidencias-oct2025
```

**Reemplaza** `TU_ACCESS_KEY_ID_REAL_AQUI` y `TU_SECRET_KEY_REAL_AQUI` con tus valores reales.

---

## 🎉 ¡Ya Está!

### Checklist Final:
- ✅ Bucket creado: `plan-accion-evidencias-oct2025`
- ✅ Acceso público configurado
- ✅ Bucket Policy aplicada
- ✅ CORS configurado
- ✅ Credenciales obtenidas
- ⏳ .env.local actualizado (hazlo ahora)
- ⏳ SQL ejecutado en Neon
- ⏳ Servidor reiniciado

### Próximos pasos:
1. Actualiza `.env.local` con tus credenciales
2. Ejecuta el SQL: `database/EJECUTAR_EN_NEON_ARCHIVOS.sql` en Neon
3. Reinicia: `npm run dev`
4. Prueba subiendo un archivo en: http://localhost:3000/dashboard/trimestre/1

---

## 💡 Tip

Si ves tu bucket en el AWS Explorer de VS Code, puedes:
- **Clic derecho** → "Upload files" para probar manualmente
- **Clic derecho** → "Download" para descargar archivos
- **Clic derecho** → "Delete" para eliminar (¡cuidado!)

---

## 🐛 ¿Problemas?

### "Access Denied" al subir archivo
→ Verifica que desactivaste "Block public access"

### "CORS Error"
→ Verifica que agregaste la configuración CORS con tu localhost

### "Invalid Access Key"
→ Verifica que copiaste correctamente las credenciales en .env.local
→ Reinicia el servidor después de actualizar .env.local

---

¿Necesitas ayuda? ¡Avísame! 🚀
