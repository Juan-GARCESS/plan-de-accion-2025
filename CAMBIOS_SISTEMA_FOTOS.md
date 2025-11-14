# Cambios en Sistema de Fotos de Perfil

## Cambios Realizados

### 1. Reemplazo de Emojis por Iconos de Lucide React

Se reemplazaron todos los emojis por iconos profesionales de Lucide React:

- ← → `<ArrowLeft>` - Botón volver
- 👤 → `<User>` - Título de perfil y rol
- 📷 → `<Camera>` - Botones de foto
- 🗑️ → `<Trash2>` - Botón quitar foto
- 💾 → `<Save>` - Botón guardar
- 🏢 → `<Building2>` - Área asignada (solo usuario)

### 2. Mejoras en el Sistema de Subida de Fotos

**Archivo: `src/app/api/upload/route.ts`**
- ✅ Agregado logging detallado del proceso de subida
- ✅ Validación de credenciales de AWS antes de intentar subir
- ✅ Mejor manejo de errores con mensajes específicos
- ✅ Verificación de que se genera correctamente la URL pública

**Archivos: `src/app/admin/perfil/page.tsx` y `src/app/dashboard/perfil/page.tsx`**
- ✅ Logging en cada paso del proceso (selección, subida, guardado)
- ✅ Validación de que se recibe URL antes de actualizar estado
- ✅ Mensaje más claro: "Foto subida correctamente. Haz clic en 'Guardar cambios' para confirmar."
- ✅ Mejor manejo de errores con mensajes específicos del servidor
- ✅ Trimming del nombre para evitar espacios innecesarios
- ✅ Envío de `null` en vez de string vacío cuando no hay foto

## Cómo Verificar que Funciona

### Paso 1: Verificar Variables de Entorno en Vercel

1. Ir a: https://vercel.com/juan-garcesss-projects/plan-de-accion-2025/settings/environment-variables
2. Verificar que existan estas variables:
   - `AWS_REGION` (ejemplo: us-east-1)
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET_NAME`

### Paso 2: Probar la Subida de Foto

1. Ir a la página de perfil (admin o usuario)
2. Hacer clic en "Subir foto" o "Cambiar foto"
3. Seleccionar una imagen (máx 5MB)
4. **IMPORTANTE**: Abrir la consola del navegador (F12 → Console)
5. Verificar los logs:
   ```
   Archivo seleccionado: nombre.jpg image/jpeg 123456
   Iniciando subida...
   Response status: 200
   Response data: {url: "https://...", message: "..."}
   URL recibida: https://...
   ```
6. Si todo está bien, ver toast verde: "Foto subida correctamente..."
7. **IMPORTANTE**: Hacer clic en "Guardar cambios"
8. Verificar logs del guardado:
   ```
   Guardando perfil...
   Nombre: ...
   Foto URL: https://...
   Save response status: 200
   ```
9. La página se recargará automáticamente después de 1 segundo

### Paso 3: Verificar que la Foto se Mantiene

1. Después del reload, la foto debe aparecer correctamente
2. Si no aparece, abrir la consola y verificar errores
3. Verificar en la base de datos que el campo `foto_url` tiene la URL correcta:
   ```sql
   SELECT id, nombre, foto_url FROM usuarios WHERE id = TU_ID;
   ```

## Problemas Comunes y Soluciones

### La foto no se sube

**Síntomas**: Error al hacer clic en "Subir foto"

**Verificar en consola**:
- Si dice "Configuración de S3 incompleta" → Faltan variables de entorno
- Si dice error de AWS → Credenciales incorrectas o bucket no existe
- Si dice "No se recibió URL" → El endpoint no retornó URL correctamente

**Solución**:
1. Verificar variables de entorno en Vercel
2. Verificar que el bucket S3 existe y tiene permisos públicos
3. Verificar que las credenciales AWS tienen permisos para PutObject

### La foto se sube pero no se guarda

**Síntomas**: Foto aparece después de subirla, pero desaparece al recargar

**Verificar en consola**:
- Al hacer clic en "Guardar cambios", debe aparecer:
  ```
  Guardando perfil...
  Foto URL: https://...
  Save response status: 200
  ```

**Solución**:
1. Si el response status no es 200, revisar el mensaje de error
2. Verificar que la columna `foto_url` existe en la tabla `usuarios`
3. Verificar que el endpoint `/api/usuario/perfil` actualiza correctamente

### La foto se guarda pero no se ve

**Síntomas**: La URL está en la base de datos pero la imagen no se muestra

**Verificar**:
1. Abrir la URL directamente en el navegador
2. Si no carga → Problema con permisos del bucket S3
3. Si carga → Problema con next.config.ts remotePatterns

**Solución**:
1. Verificar que el bucket S3 tiene política pública:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::tu-bucket/*"
       }
     ]
   }
   ```
2. Verificar `next.config.ts`:
   ```typescript
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: '*.s3.*.amazonaws.com',
       },
       {
         protocol: 'https',
         hostname: '*.amazonaws.com',
       }
     ]
   }
   ```

## Archivos Modificados

1. `src/app/admin/perfil/page.tsx`
2. `src/app/dashboard/perfil/page.tsx`
3. `src/app/api/upload/route.ts`

## Commit

```
feat: reemplazar emojis por iconos de Lucide React y mejorar sistema de fotos de perfil con logging detallado

- Reemplazar todos los emojis por iconos de Lucide React (ArrowLeft, User, Camera, Trash2, Save, Building2)
- Agregar logging detallado en proceso de subida de fotos
- Mejorar validación y manejo de errores en endpoint /api/upload
- Agregar logging en handlePhotoUpload y handleSaveProfile
- Mejorar mensajes de toast para mejor UX
- Agregar validación de URL recibida antes de actualizar estado
- Trimming de nombre y envío de null en vez de string vacío para foto_url
```

## Próximos Pasos

1. Desplegar en Vercel (automático al hacer push)
2. Verificar logs en consola del navegador al probar
3. Si hay errores, revisar logs de Vercel
4. Ajustar según sea necesario
