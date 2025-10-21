# Configuración de Office 365 Login (Azure AD)

## 🎯 Objetivo
Permitir que los usuarios inicien sesión automáticamente con sus correos institucionales @campusucc.edu.co usando Microsoft Office 365.

## 📋 Prerrequisitos
- Cuenta de Microsoft 365/Azure AD con permisos de administrador
- Acceso al portal de Azure (https://portal.azure.com)

## 🔧 Pasos de Configuración

### 1. Registrar la Aplicación en Azure AD

1. **Ir al Portal de Azure**
   - Ve a https://portal.azure.com
   - Inicia sesión con tu cuenta de administrador

2. **Crear App Registration**
   - En el menú lateral, selecciona "Azure Active Directory"
   - Selecciona "App registrations" (Registros de aplicaciones)
   - Haz clic en "New registration" (Nuevo registro)

3. **Configurar el Registro**
   - **Nombre**: `Sistema Plan de Acción UCC`
   - **Supported account types**: 
     - Selecciona "Accounts in this organizational directory only" si solo quieres usuarios de tu organización
     - O "Accounts in any organizational directory" si quieres permitir cualquier Office 365
   - **Redirect URI**: 
     - Tipo: `Web`
     - URL de desarrollo: `http://localhost:3000/api/auth/microsoft/callback`
     - URL de producción: `https://tudominio.com/api/auth/microsoft/callback`
   - Haz clic en "Register"

### 2. Obtener las Credenciales

1. **Application (client) ID**
   - En la página de Overview de tu app, copia el "Application (client) ID"
   - Este es tu `NEXT_PUBLIC_MICROSOFT_CLIENT_ID`

2. **Directory (tenant) ID** (Opcional)
   - También en Overview, copia el "Directory (tenant) ID"
   - Este es tu `MICROSOFT_TENANT_ID`
   - Si dejas `common`, funcionará para cualquier cuenta Microsoft

3. **Client Secret**
   - Ve a "Certificates & secrets" en el menú lateral
   - Haz clic en "New client secret"
   - Descripción: `Sistema Plan de Acción Secret`
   - Expira: `24 months` (recomendado)
   - Haz clic en "Add"
   - **⚠️ IMPORTANTE**: Copia el **Value** inmediatamente (solo se muestra una vez)
   - Este es tu `MICROSOFT_CLIENT_SECRET`

### 3. Configurar Permisos de API

1. **API Permissions**
   - Ve a "API permissions" en el menú lateral
   - Los permisos por defecto deberían ser suficientes:
     - `User.Read` (delegated)
     - `email`
     - `openid`
     - `profile`
   
2. **Grant Admin Consent** (Opcional pero recomendado)
   - Haz clic en "Grant admin consent for [tu organización]"
   - Esto evita que cada usuario tenga que aceptar permisos

### 4. Configurar Variables de Entorno

Crea o edita el archivo `.env.local` en la raíz del proyecto:

```bash
# Microsoft Azure AD OAuth Configuration
NEXT_PUBLIC_MICROSOFT_CLIENT_ID="tu_application_client_id_aqui"
MICROSOFT_CLIENT_SECRET="tu_client_secret_aqui"
MICROSOFT_TENANT_ID="common"
```

**Notas:**
- `NEXT_PUBLIC_MICROSOFT_CLIENT_ID`: Se usa en el frontend (visible)
- `MICROSOFT_CLIENT_SECRET`: Se usa solo en el backend (seguro)
- `MICROSOFT_TENANT_ID`: 
  - Usa `common` para cualquier cuenta Microsoft/Office 365
  - O usa tu Tenant ID específico para restringir solo a tu organización

### 5. Agregar URL de Producción

Cuando despliegues a producción:

1. Ve a "Authentication" en tu App Registration
2. Agrega una nueva Redirect URI:
   - `https://tudominio.com/api/auth/microsoft/callback`
3. Guarda los cambios

## 🔐 Flujo de Autenticación

1. Usuario hace clic en "Iniciar con Office 365"
2. Se redirige a Microsoft para autenticarse
3. Usuario inicia sesión con @campusucc.edu.co
4. Microsoft redirige de vuelta con un código
5. El backend intercambia el código por un token de acceso
6. Se obtiene la información del usuario (email, nombre)
7. Se valida que el email sea @campusucc.edu.co
8. Se busca o crea el usuario en la base de datos
9. Se crea la sesión y redirige al dashboard

## ✅ Validaciones Implementadas

- ✅ Solo correos @campusucc.edu.co pueden iniciar sesión
- ✅ Usuarios nuevos se crean con estado "pendiente"
- ✅ Admin debe aprobar usuarios antes de que accedan
- ✅ Se valida que usuarios tengan área asignada (excepto admin)
- ✅ Manejo de errores completo con mensajes amigables

## 🧪 Probar la Configuración

1. **Desarrollo Local:**
   ```bash
   npm run dev
   ```
   - Ve a http://localhost:3000
   - Haz clic en "Iniciar con Office 365"
   - Inicia sesión con tu correo @campusucc.edu.co

2. **Verificar en Logs:**
   - Revisa la consola del navegador
   - Revisa los logs del servidor
   - Confirma que el flujo OAuth complete exitosamente

## 🔍 Solución de Problemas

### Error: "AADSTS50011: The redirect URI specified does not match"
**Solución:** Verifica que la Redirect URI en Azure coincida exactamente con la configurada en tu app.

### Error: "invalid_domain"
**Solución:** El usuario intentó iniciar sesión con un correo que no es @campusucc.edu.co

### Error: "pending"
**Solución:** El usuario fue creado pero está pendiente de aprobación por el administrador.

### Error: "Configuration not found"
**Solución:** Verifica que las variables de entorno estén correctamente configuradas en `.env.local`

## 📚 Referencias

- [Microsoft Identity Platform Docs](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Azure AD App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [OAuth 2.0 Authorization Code Flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)

## 🎉 ¡Listo!

Una vez configurado, los usuarios podrán iniciar sesión directamente con sus credenciales institucionales de Office 365 sin necesidad de crear una contraseña separada.
