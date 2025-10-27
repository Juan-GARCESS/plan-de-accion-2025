# Configuración de Office 365 / Microsoft Azure AD

## 📋 Pasos para configurar el inicio de sesión con Office 365

### 1. Acceder al Portal de Azure

1. Ve a [https://portal.azure.com](https://portal.azure.com)
2. Inicia sesión con tu cuenta de administrador de la Universidad Cooperativa de Colombia (@campusucc.edu.co)

### 2. Registrar una nueva aplicación

1. En el menú lateral, busca **Azure Active Directory** (o **Microsoft Entra ID**)
2. Haz clic en **App registrations** (Registros de aplicaciones)
3. Haz clic en **+ New registration** (+ Nuevo registro)

### 3. Configurar la aplicación

**Nombre de la aplicación:**
```
Plan de Acción UCC
```

**Supported account types (Tipos de cuenta compatibles):**
- Selecciona: **Accounts in this organizational directory only (Universidad Cooperativa de Colombia only - Single tenant)**
  - Esto asegura que solo usuarios con correos @campusucc.edu.co puedan iniciar sesión

**Redirect URI (URI de redireccionamiento):**
- Tipo: **Web**
- URI para desarrollo: `http://localhost:3000/api/auth/microsoft/callback`
- URI para producción: `https://tu-dominio.com/api/auth/microsoft/callback`

Haz clic en **Register** (Registrar)

### 4. Copiar el Application (client) ID

1. Una vez creada la aplicación, verás la página de **Overview** (Información general)
2. Copia el **Application (client) ID** (es un GUID como: 12345678-1234-1234-1234-123456789abc)
3. Pégalo en tu archivo `.env.local`:

```bash
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=TU_CLIENT_ID_AQUI
```

### 5. Crear un Client Secret

1. En el menú lateral de tu aplicación, ve a **Certificates & secrets** (Certificados y secretos)
2. Haz clic en **+ New client secret** (+ Nuevo secreto de cliente)
3. Descripción: `Plan de Acción Secret`
4. Expira: Selecciona **24 months** (24 meses) o la duración que prefieras
5. Haz clic en **Add** (Agregar)
6. **IMPORTANTE:** Copia el **Value** (Valor) inmediatamente (solo se muestra una vez)
7. Pégalo en tu archivo `.env.local`:

```bash
MICROSOFT_CLIENT_SECRET=TU_CLIENT_SECRET_AQUI
```

### 6. Configurar permisos de API

1. En el menú lateral, ve a **API permissions** (Permisos de API)
2. Haz clic en **+ Add a permission** (+ Agregar un permiso)
3. Selecciona **Microsoft Graph**
4. Selecciona **Delegated permissions** (Permisos delegados)
5. Busca y selecciona los siguientes permisos:
   - ✅ `openid` - Sign users in
   - ✅ `profile` - View users' basic profile
   - ✅ `email` - View users' email address
   - ✅ `User.Read` - Sign in and read user profile

6. Haz clic en **Add permissions** (Agregar permisos)
7. Haz clic en **✓ Grant admin consent for Universidad Cooperativa de Colombia** (Conceder consentimiento de administrador)
8. Confirma haciendo clic en **Yes** (Sí)

### 7. Configurar el Tenant ID (Opcional pero recomendado)

1. Vuelve a la página de **Overview**
2. Copia el **Directory (tenant) ID**
3. Pégalo en tu archivo `.env.local`:

```bash
MICROSOFT_TENANT_ID=TU_TENANT_ID_AQUI
```

Si no configuras un tenant específico, usa `common` para permitir cuentas de cualquier organización.

### 8. Archivo .env.local completo

Tu archivo `.env.local` debe verse así:

```bash
# Microsoft OAuth Configuration
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=12345678-1234-1234-1234-123456789abc
MICROSOFT_CLIENT_SECRET=tu_secreto_aqui_valor_largo
MICROSOFT_TENANT_ID=tu_tenant_id_o_common
```

### 9. Reiniciar el servidor de desarrollo

```bash
# Detén el servidor (Ctrl+C)
# Inicia de nuevo
npm run dev
```

## 🔒 Seguridad

### Restricción por dominio de correo

El sistema está configurado para aceptar SOLO correos que terminan en `@campusucc.edu.co`.

Si un usuario intenta iniciar sesión con otro dominio, verá el error:
```
Debes usar un correo institucional @campusucc.edu.co para iniciar sesión con Office 365.
```

Esto está configurado en: `src/app/api/auth/microsoft/callback/route.ts`

### Estados de usuario después del registro con Office 365

1. **Primera vez:** El usuario se crea con estado `pendiente` y debe esperar aprobación del administrador
2. **Usuario existente - activo:** Inicia sesión normalmente
3. **Usuario existente - pendiente:** Ve mensaje de que su cuenta está pendiente de aprobación
4. **Usuario existente - inactivo:** Ve mensaje de que su cuenta ha sido desactivada

## 🧪 Probar el flujo completo

### En desarrollo (localhost)

1. Ve a `http://localhost:3000`
2. Haz clic en **Iniciar con Office 365** (en Login) o **Registrarse con Office 365** (en Registro)
3. Serás redirigido a login.microsoftonline.com
4. Inicia sesión con tu cuenta @campusucc.edu.co
5. Acepta los permisos si es la primera vez
6. Serás redirigido de vuelta a la aplicación

### Flujo esperado:

**Usuario nuevo:**
```
Office 365 → Callback → Crear usuario (estado: pendiente) → Redirigir a login con mensaje
```

**Usuario existente y aprobado:**
```
Office 365 → Callback → Verificar estado → Crear sesión → Dashboard
```

## 🚀 Producción

### Agregar URI de producción

1. Ve al Azure Portal → Tu aplicación → **Authentication** (Autenticación)
2. En **Platform configurations** → **Web** → **Redirect URIs**
3. Haz clic en **+ Add URI**
4. Agrega: `https://tu-dominio.com/api/auth/microsoft/callback`
5. Haz clic en **Save** (Guardar)

### Actualizar .env en producción

Asegúrate de configurar las mismas variables de entorno en tu servidor de producción (Vercel, Netlify, etc.):

```bash
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_TENANT_ID=...
```

## ❗ Solución de problemas

### Error: "Application with identifier 'YOUR_CLIENT_ID' was not found"

- Verifica que copiaste correctamente el `NEXT_PUBLIC_MICROSOFT_CLIENT_ID`
- Asegúrate de que la aplicación esté creada en Azure AD

### Error: "AADSTS50011: The redirect URI specified in the request does not match"

- Verifica que el Redirect URI en Azure AD coincida exactamente con: `http://localhost:3000/api/auth/microsoft/callback`
- No debe tener slash al final
- Debe incluir el esquema completo (http:// o https://)

### Error: "AADSTS65001: The user or administrator has not consented"

- Ve a Azure AD → Tu aplicación → API permissions
- Haz clic en "Grant admin consent"

### Los usuarios no pueden iniciar sesión

1. Verifica que el correo termine en @campusucc.edu.co
2. Verifica que el usuario tenga estado `activo` en la base de datos
3. Si es usuario nuevo, debe ser aprobado por el administrador primero

## 📚 Referencias

- [Microsoft identity platform documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/)
- [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/overview)
- [OAuth 2.0 authorization code flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)

---

## ✅ Checklist de configuración

- [ ] Aplicación creada en Azure AD
- [ ] Application (client) ID copiado a .env.local
- [ ] Client Secret creado y copiado a .env.local
- [ ] Redirect URI configurado correctamente
- [ ] Permisos de API agregados (openid, profile, email, User.Read)
- [ ] Consentimiento de administrador otorgado
- [ ] Servidor reiniciado después de cambios en .env.local
- [ ] Probado el flujo de login con Office 365
- [ ] Probado el flujo de registro con Office 365
- [ ] Verificado que solo acepta correos @campusucc.edu.co

¡Listo! 🎉
