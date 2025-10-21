# 🚀 Guía Completa: Configuración de AWS S3 para Evidencias

## 📋 Tabla de Contenidos
1. [Crear Cuenta AWS](#1-crear-cuenta-aws)
2. [Crear Bucket S3](#2-crear-bucket-s3)
3. [Configurar Permisos IAM](#3-configurar-permisos-iam)
4. [Obtener Credenciales](#4-obtener-credenciales)
5. [Configurar en Visual Studio Code](#5-configurar-en-visual-studio-code)
6. [Probar la Conexión](#6-probar-la-conexión)

---

## 1. Crear Cuenta AWS

### Paso 1.1: Registro
1. Ve a: **https://aws.amazon.com/free/**
2. Clic en **"Crear una cuenta de AWS"**
3. Completa el formulario:
   - Email
   - Nombre de la cuenta AWS
   - Contraseña
4. **Verificación**: AWS enviará un código a tu email
5. **Información de contacto**: Llena tus datos personales
6. **Información de pago**: 
   - Necesitas una tarjeta de crédito (no se cobrará si usas el nivel gratuito)
   - AWS cobrará $1 USD como verificación (se reembolsa automáticamente)
7. **Verificación telefónica**: Recibirás un código vía SMS
8. **Seleccionar plan**: Elige **"Plan de soporte básico (gratuito)"**

### ✅ Nivel Gratuito AWS (12 meses)
- **5 GB** de almacenamiento S3
- **20,000** solicitudes GET
- **2,000** solicitudes PUT
- **100 GB** de transferencia de datos saliente

---

## 2. Crear Bucket S3

### Paso 2.1: Acceder a S3
1. Inicia sesión en: **https://console.aws.amazon.com**
2. En la barra de búsqueda superior, escribe: **"S3"**
3. Clic en **"S3"** (Simple Storage Service)

### Paso 2.2: Crear Bucket
1. Clic en **"Crear bucket"** (botón naranja)
2. **Configuración del bucket**:
   
   **Nombre del bucket**: `plan-accion-evidencias-oct2025`
   - Debe ser único globalmente
   - Solo minúsculas, números y guiones
   - Sin espacios ni caracteres especiales
   
   **Región de AWS**: `US East (N. Virginia) us-east-1`
   - Recomendada por ser la más cercana y económica
   
   **Propietario del objeto**: Deja por defecto
   
   **Configuración de bloqueo de acceso público**:
   - ✅ **Desmarcar**: "Bloquear todo el acceso público"
   - ⚠️ Aparecerá una advertencia: marca el checkbox de confirmación
   - *Esto es necesario para que los usuarios puedan ver sus evidencias*
   
   **Control de versiones**: Deshabilitado (por ahora)
   
   **Etiquetas** (opcional): Puedes agregar
   - Clave: `Proyecto`
   - Valor: `PlanDeAccion2025`
   
   **Cifrado**: Deja el cifrado predeterminado (SSE-S3)

3. Clic en **"Crear bucket"** (botón naranja al final)

### Paso 2.3: Configurar CORS (Importante)
1. Entra al bucket recién creado
2. Ve a la pestaña **"Permisos"**
3. Scroll hasta **"Configuración de CORS"**
4. Clic en **"Editar"**
5. Pega esta configuración:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "http://192.168.1.48:3000",
            "https://tu-dominio-produccion.com"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

6. Clic en **"Guardar cambios"**

---

## 3. Configurar Permisos IAM

### Paso 3.1: Crear Usuario IAM
1. En la consola de AWS, busca: **"IAM"**
2. En el menú izquierdo, clic en **"Usuarios"**
3. Clic en **"Crear usuario"**
4. **Nombre de usuario**: `plan-accion-s3-user`
5. **Tipo de acceso**: Marca **"Clave de acceso: acceso programático"**
6. Clic en **"Siguiente: Permisos"**

### Paso 3.2: Asignar Permisos
1. Selecciona: **"Asociar políticas existentes de forma directa"**
2. En el buscador, escribe: **"S3"**
3. Marca estas políticas:
   - ✅ **AmazonS3FullAccess** (para desarrollo)
   - O crea una política personalizada (más seguro):

**Política Personalizada S3** (solo para tu bucket):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::plan-accion-evidencias-oct2025",
                "arn:aws:s3:::plan-accion-evidencias-oct2025/*"
            ]
        }
    ]
}
```

4. Clic en **"Siguiente: Etiquetas"** (opcional, puedes saltarlo)
5. Clic en **"Siguiente: Revisar"**
6. Clic en **"Crear usuario"**

### ⚠️ IMPORTANTE: Guardar Credenciales
Después de crear el usuario, verás:
- **ID de clave de acceso**: `AKIAIOSFODNN7EXAMPLE`
- **Clave de acceso secreta**: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

**⚠️ GUARDA ESTAS CREDENCIALES AHORA** 
- Solo se muestran una vez
- Si las pierdes, deberás crear nuevas credenciales

---

## 4. Obtener Credenciales

Ya tienes todo lo necesario:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET_NAME=plan-accion-evidencias-oct2025
```

---

## 5. Configurar en Visual Studio Code

### Paso 5.1: Actualizar .env.local
1. Abre tu proyecto en VS Code
2. Abre el archivo: `.env.local`
3. Reemplaza los valores:

```bash
# Base de datos (ya configurada)
DATABASE_URL=postgresql://...

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=TU_ACCESS_KEY_ID_REAL
AWS_SECRET_ACCESS_KEY=TU_SECRET_ACCESS_KEY_REAL
AWS_S3_BUCKET_NAME=plan-accion-evidencias-oct2025
```

### Paso 5.2: Reiniciar el Servidor
En la terminal de VS Code:
```powershell
# Detener servidor (Ctrl+C)
npm run dev
```

---

## 6. Probar la Conexión

### Prueba Manual
1. Navega a: **http://localhost:3000/dashboard/trimestre/1**
2. Sube un archivo de evidencia
3. Verifica en AWS S3 Console que el archivo se subió

### Verificar en AWS Console
1. Ve a: **https://s3.console.aws.amazon.com/s3/buckets/**
2. Clic en tu bucket: `plan-accion-evidencias-oct2025`
3. Deberías ver la carpeta: `evidencias/`
4. Navega y verifica tus archivos

---

## 🔒 Seguridad

### Mejores Prácticas:
1. ✅ Nunca subas `.env.local` a GitHub
2. ✅ Usa políticas IAM específicas (no `FullAccess`)
3. ✅ Habilita versionado en S3 (opcional)
4. ✅ Configura reglas de ciclo de vida para archivos antiguos
5. ✅ Activa el logging de acceso al bucket

### .gitignore
Asegúrate de que `.env.local` esté en `.gitignore`:
```
.env.local
.env.production.local
```

---

## 💰 Monitoreo de Costos

### Ver uso de S3:
1. Ve a: **AWS Billing Dashboard**
2. Ruta: https://console.aws.amazon.com/billing/
3. Sección: **"Uso del nivel gratuito"**

### Alertas de Facturación:
1. Configura una alerta cuando superes $1 USD:
   - Ve a: **CloudWatch → Alarmas**
   - Crea alarma de facturación

---

## 🛠️ Solución de Problemas

### Error: "Access Denied"
- Verifica las credenciales en `.env.local`
- Verifica los permisos IAM del usuario
- Verifica la configuración CORS del bucket

### Error: "Bucket not found"
- Verifica el nombre del bucket en `.env.local`
- Verifica que el bucket existe en la región correcta

### Archivos no se ven
- Verifica que quitaste el bloqueo de acceso público
- Verifica la política del bucket

---

## 📚 Recursos Adicionales

- **Documentación AWS S3**: https://docs.aws.amazon.com/s3/
- **SDK JavaScript v3**: https://docs.aws.amazon.com/sdk-for-javascript/v3/
- **Pricing S3**: https://aws.amazon.com/s3/pricing/
- **Nivel Gratuito**: https://aws.amazon.com/free/

---

## ✅ Checklist Final

- [ ] Cuenta AWS creada
- [ ] Bucket S3 creado con el nombre correcto
- [ ] CORS configurado
- [ ] Usuario IAM creado
- [ ] Permisos S3 asignados
- [ ] Credenciales guardadas de forma segura
- [ ] `.env.local` actualizado con credenciales reales
- [ ] Servidor reiniciado
- [ ] Prueba de subida exitosa

---

**🎉 ¡Listo! Tu sistema está conectado a AWS S3**

Ahora los usuarios podrán subir archivos (PDF, Word, Excel) como evidencias y estos se almacenarán de forma segura en la nube de AWS.
