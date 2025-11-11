# 🚀 Guía de Despliegue en Vercel

## 📋 Prerrequisitos

- ✅ Cuenta de GitHub con el repositorio `plan-de-accion-2025`
- ✅ Base de datos PostgreSQL en Neon.tech (o similar)
- ✅ Cuenta de AWS S3 configurada para archivos
- 🔜 Cuenta de Vercel (gratuita)

## 🎯 Paso 1: Crear Cuenta en Vercel

1. Ve a: **https://vercel.com/signup**
2. Haz clic en **"Continue with GitHub"**
3. Autoriza a Vercel a acceder a tu cuenta de GitHub
4. Completa el registro

## 📦 Paso 2: Importar el Proyecto

1. En el dashboard de Vercel, haz clic en **"Add New..."** → **"Project"**
2. Busca tu repositorio: **`Juan-GARCESS/plan-de-accion-2025`**
3. Haz clic en **"Import"**

## ⚙️ Paso 3: Configurar el Proyecto

### Framework Preset
- **Framework**: Next.js (detectado automáticamente)
- **Root Directory**: `./` (raíz)
- **Build Command**: `npm run build` (por defecto)
- **Output Directory**: `.next` (por defecto)

### Variables de Entorno

Haz clic en **"Environment Variables"** y agrega las siguientes:

#### 🗄️ Base de Datos (Neon PostgreSQL)
```bash
DATABASE_URL=postgresql://usuario:password@ep-nombre.region.aws.neon.tech/nombre_db?sslmode=require
```

#### 🔐 JWT Secret
```bash
JWT_SECRET=tu_secret_key_super_segura_minimo_32_caracteres
```

#### 📁 AWS S3 Configuration
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_access_key_id
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
AWS_S3_BUCKET_NAME=nombre-de-tu-bucket
```

#### 🌐 URLs de la Aplicación
```bash
NEXT_PUBLIC_API_URL=https://tu-proyecto.vercel.app/api
NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
```

> **Nota**: Al principio no conoces la URL de Vercel. Después del primer deploy, actualiza estas variables con la URL real que te asigne Vercel.

## 🚀 Paso 4: Deploy

1. Verifica que todas las variables estén configuradas
2. Haz clic en **"Deploy"**
3. Espera 2-3 minutos mientras Vercel:
   - Clona tu repositorio
   - Instala dependencias
   - Compila el proyecto Next.js
   - Despliega en su CDN global

## ✅ Paso 5: Verificar el Despliegue

Una vez completado, verás:
- ✅ Estado: **"Ready"**
- 🌐 URL de producción: `https://tu-proyecto.vercel.app`
- 📸 Screenshot preview del sitio

### Pruebas Iniciales
1. Visita la URL de producción
2. Verifica que la página de login cargue correctamente
3. Intenta iniciar sesión con credenciales de admin
4. Verifica que las rutas funcionen

## 🔧 Paso 6: Actualizar URLs (Importante)

Ahora que conoces tu URL de Vercel:

1. Ve a **Settings** → **Environment Variables**
2. Edita las variables:
   ```bash
   NEXT_PUBLIC_API_URL=https://TU-URL-REAL.vercel.app/api
   NEXT_PUBLIC_APP_URL=https://TU-URL-REAL.vercel.app
   ```
3. Guarda los cambios
4. Ve a **Deployments** → Clic en los 3 puntos del último deploy → **"Redeploy"**

## 📱 Paso 7: Configurar Dominio Personalizado (Opcional)

Si tienes un dominio propio:

1. Ve a **Settings** → **Domains**
2. Agrega tu dominio: `tudominio.com`
3. Configura los registros DNS según las instrucciones de Vercel
4. Espera a que se verifique el dominio (5-10 minutos)
5. Vercel automáticamente provee SSL/HTTPS

## 🔄 Despliegues Automáticos

Vercel está configurado para despliegues automáticos:
- ✅ Cada `git push` a `master` → Deploy automático
- ✅ Pull requests → Preview deployments
- ✅ Rollback instantáneo si algo falla

## 🐛 Solución de Problemas

### Error: "Build Failed"
**Causa**: Error de compilación de TypeScript o problema con dependencias

**Solución**:
1. Revisa los logs del build en Vercel
2. Verifica que compile localmente: `npm run build`
3. Asegúrate que todas las dependencias estén en `package.json`

### Error: "Database Connection Failed"
**Causa**: Variable `DATABASE_URL` incorrecta o base de datos no accesible

**Solución**:
1. Verifica que `DATABASE_URL` esté correctamente configurada
2. En Neon.tech, verifica que la IP de Vercel no esté bloqueada
3. Confirma que `?sslmode=require` esté al final de la URL

### Error: "S3 Upload Failed"
**Causa**: Credenciales de AWS incorrectas o permisos insuficientes

**Solución**:
1. Verifica las credenciales AWS en Environment Variables
2. Confirma que el bucket exista y sea accesible
3. Revisa la política de permisos del bucket (debe permitir PUT objects)

### Páginas en Blanco o 404
**Causa**: Variables `NEXT_PUBLIC_*` no actualizadas con la URL correcta

**Solución**:
1. Actualiza `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_APP_URL`
2. Redeploy el proyecto

## 📊 Monitoreo

Vercel incluye:
- 📈 Analytics: Tráfico, geografía de usuarios
- 🐛 Error tracking en tiempo real
- ⚡ Performance metrics (Core Web Vitals)
- 📝 Logs de función serverless

Accede desde: **Analytics** en el menú lateral

## 💰 Límites del Plan Gratuito

- ✅ 100 GB de bandwidth/mes
- ✅ Despliegues ilimitados
- ✅ Serverless Functions (12 segundos max)
- ✅ SSL automático
- ⚠️ 1 usuario/equipo

Para proyectos más grandes, considera el plan Pro ($20/mes).

## 🎉 ¡Listo!

Tu aplicación está desplegada en: `https://tu-proyecto.vercel.app`

### Próximos Pasos:
1. ✅ Configurar Microsoft OAuth (después del despliegue inicial)
2. ✅ Agregar dominio personalizado
3. ✅ Configurar alertas de errores
4. ✅ Optimizar performance

## 📚 Recursos Útiles

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deploy](https://nextjs.org/docs/deployment)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/domains)

---

💡 **Tip Pro**: Conecta Vercel con un sistema de monitoreo como Sentry para tracking de errores avanzado.
