# Solicitud para el Departamento de TI - Universidad Cooperativa de Colombia

## Asunto: Solicitud de configuración de Azure AD para aplicación "Plan de Acción"

Estimado equipo de TI,

Solicito amablemente su apoyo para configurar el inicio de sesión con Office 365 en la aplicación web "Plan de Acción" del departamento.

---

## 📋 Información de la solicitud

**Solicitante:** [Tu nombre]  
**Departamento:** [Tu departamento]  
**Fecha:** 26 de octubre de 2025  
**Aplicación:** Sistema de Gestión de Plan de Acción  
**Objetivo:** Permitir que los usuarios inicien sesión con sus cuentas institucionales @campusucc.edu.co

---

## 🔧 Configuración requerida en Azure Active Directory

### 1. Crear App Registration

Por favor crear una nueva aplicación en Azure AD con la siguiente configuración:

**Nombre de la aplicación:**
```
Plan de Acción UCC
```

**Supported account types:**
```
Accounts in this organizational directory only (Universidad Cooperativa de Colombia only - Single tenant)
```

**Redirect URIs:**
- **Desarrollo:** `http://localhost:3000/api/auth/microsoft/callback`
- **Producción:** `https://[dominio-produccion]/api/auth/microsoft/callback`

### 2. Permisos de API requeridos

**Microsoft Graph - Delegated permissions:**
- ✅ openid
- ✅ profile  
- ✅ email
- ✅ User.Read

**Nota:** Estos permisos solo permiten leer la información básica del perfil del usuario (nombre, email). No acceden a correos, archivos ni otros datos sensibles.

### 3. Client Secret

Por favor generar un Client Secret con las siguientes características:
- **Descripción:** Plan de Acción Secret
- **Expiración:** 24 meses (o según política de la institución)

### 4. Grant Admin Consent

Por favor otorgar el consentimiento de administrador para los permisos solicitados.

---

## 📧 Información que necesito recibir

Una vez configurada la aplicación, por favor proporcionarme la siguiente información:

1. **Application (client) ID** (GUID)
2. **Client Secret Value** (cadena de texto larga)
3. **Directory (tenant) ID** (GUID) - opcional

**Nota:** Esta información será almacenada de forma segura en variables de entorno del servidor y NUNCA se expondrá en el código cliente.

---

## 🔒 Seguridad y privacidad

### Restricciones implementadas:

1. **Solo correos institucionales:** La aplicación SOLO acepta usuarios con correos @campusucc.edu.co
2. **Aprobación de administrador:** Los usuarios nuevos quedan en estado "pendiente" hasta que un administrador los apruebe
3. **No almacena contraseñas de Office 365:** El sistema usa OAuth 2.0, nunca maneja las contraseñas de Microsoft
4. **Permisos mínimos:** Solo lectura de perfil básico (nombre y email)

### Código de validación de dominio:

```typescript
// Fragmento del código que valida el dominio
if (!email.endsWith('@campusucc.edu.co')) {
  return NextResponse.redirect(
    new URL('/?error=invalid_domain', request.url)
  );
}
```

---

## 📊 Flujo de autenticación

```
1. Usuario hace clic en "Iniciar con Office 365"
2. Es redirigido a login.microsoftonline.com
3. Inicia sesión con sus credenciales de Office 365
4. Microsoft valida las credenciales
5. Microsoft redirige de vuelta a nuestra aplicación con un código
6. Nuestra aplicación intercambia el código por información del usuario
7. Se crea/actualiza el usuario en nuestra base de datos
8. Usuario accede al sistema
```

---

## 🎯 Beneficios para los usuarios

- ✅ No necesitan recordar otra contraseña
- ✅ Inicio de sesión rápido y seguro
- ✅ Sincronización automática de nombre y email institucional
- ✅ Mayor adopción del sistema
- ✅ Cumple con políticas de seguridad institucionales

---

## 📞 Contacto

Si tienen alguna pregunta o necesitan información adicional, estoy disponible:

- **Email:** [tu-email@campusucc.edu.co]
- **Teléfono:** [tu-teléfono]
- **Oficina:** [tu-oficina]

---

## ✅ Checklist para TI

- [ ] App Registration creada en Azure AD
- [ ] Nombre: "Plan de Acción UCC"
- [ ] Tipo: Single tenant (solo UCC)
- [ ] Redirect URIs configurados
- [ ] Permisos de API agregados (openid, profile, email, User.Read)
- [ ] Admin consent otorgado
- [ ] Client Secret generado
- [ ] Application (client) ID compartido con el solicitante
- [ ] Client Secret compartido de forma segura
- [ ] Documentación de la configuración archivada

---

## 📚 Recursos técnicos (para referencia de TI)

- [Microsoft identity platform documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/)
- [Register an application with Microsoft identity platform](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [OAuth 2.0 authorization code flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)

---

Agradezco de antemano su colaboración y quedo atento a cualquier consulta.

**Atentamente,**

[Tu nombre]  
[Tu cargo]  
[Tu departamento]
