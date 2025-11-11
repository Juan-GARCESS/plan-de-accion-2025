# ✅ Checklist Pre-Despliegue a Vercel

## 📋 Información que Necesitas Tener Lista

### 🗄️ Base de Datos Neon PostgreSQL
- [ ] URL de conexión completa
  ```
  Ejemplo: postgresql://user:pass@ep-xyz.region.aws.neon.tech/dbname?sslmode=require
  ```
- [ ] Base de datos con todas las tablas creadas
- [ ] Usuario admin creado en la base de datos

### 🔐 Seguridad
- [ ] JWT_SECRET (mínimo 32 caracteres aleatorios)
  ```bash
  # Puedes generar uno con:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### 📁 AWS S3
- [ ] Región: `us-east-1` (o tu región preferida)
- [ ] Access Key ID
- [ ] Secret Access Key
- [ ] Nombre del bucket
- [ ] Bucket configurado con permisos públicos de lectura

### 🌐 Vercel
- [ ] Cuenta de Vercel creada (con GitHub)
- [ ] Repositorio `plan-de-accion-2025` visible en GitHub

---

## 🚀 Proceso Simplificado de Despliegue

### Paso 1: Ir a Vercel
👉 https://vercel.com/new

### Paso 2: Importar desde GitHub
1. Busca: **plan-de-accion-2025**
2. Clic en **Import**

### Paso 3: Agregar Variables de Entorno
Copia y pega esto, reemplazando con tus valores:

```bash
# Base de Datos
DATABASE_URL=postgresql://tu_usuario:tu_password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Seguridad
JWT_SECRET=tu_jwt_secret_de_32_caracteres_minimo

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_S3_BUCKET_NAME=nombre-bucket

# URLs (dejar en blanco por ahora, las actualizarás después)
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_URL=
```

### Paso 4: Deploy
Clic en **Deploy** y espera 2-3 minutos

### Paso 5: Actualizar URLs
Después del primer deploy:
1. Copia la URL que te da Vercel: `https://plan-de-accion-2025-xxx.vercel.app`
2. Ve a **Settings** → **Environment Variables**
3. Actualiza:
   ```bash
   NEXT_PUBLIC_API_URL=https://tu-url.vercel.app/api
   NEXT_PUBLIC_APP_URL=https://tu-url.vercel.app
   ```
4. Redeploy: **Deployments** → **...** → **Redeploy**

---

## 🎯 Pruebas Post-Despliegue

Una vez desplegado, verifica:

1. ✅ La página principal carga
2. ✅ Puedes iniciar sesión como admin
3. ✅ Las imágenes de perfil se suben correctamente (S3)
4. ✅ Los datos se guardan en la base de datos
5. ✅ Las rutas del dashboard funcionan

---

## 🆘 ¿Tienes Problemas?

### No tengo Base de Datos Neon
1. Ve a: https://neon.tech
2. Crea cuenta gratuita
3. Crea un proyecto
4. Copia la connection string

### No tengo AWS S3 configurado
**Opción A (Recomendada)**: Usar Vercel Blob Storage
- Es gratis para comenzar
- Más simple que S3

**Opción B**: Configurar S3
1. Ve a AWS Console
2. Crea bucket S3
3. Configura políticas públicas
4. Crea usuario IAM con permisos

### No sé mi JWT_SECRET
Genera uno nuevo:
```bash
# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📞 Siguiente Paso

Una vez desplegado en Vercel, configuraremos Microsoft OAuth con la URL de producción.

¿Estás listo para empezar? 🚀
