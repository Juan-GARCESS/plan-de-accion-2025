# Configuración Simple - Sin Office 365

Si el departamento de TI no puede configurar Office 365 inmediatamente, puedes deshabilitar temporalmente esta funcionalidad.

## Opción A: Ocultar los botones de Office 365

Edita estos archivos y comenta el código del botón:

### 1. Login (src/app/page.tsx)

Busca la sección del botón Office 365 (línea ~508) y coméntala:

```typescript
{/* Temporalmente deshabilitado - Esperando configuración de TI
<div style={{ marginBottom: '20px' }}>
  <div style={{ ... }}>
    ...
  </div>
  
  <button onClick={handleOffice365Login} ...>
    ...
  </button>
</div>
*/}
```

### 2. Registro (src/app/register/page.tsx)

Similar, comenta la sección del botón Office 365 (línea ~140).

## Opción B: Mostrar mensaje informativo

Reemplaza el botón por un mensaje:

```typescript
<div style={{
  padding: '12px 16px',
  background: 'rgba(59, 130, 246, 0.1)',
  border: '1px solid rgba(59, 130, 246, 0.3)',
  borderRadius: '12px',
  marginBottom: '20px',
  textAlign: 'center'
}}>
  <p style={{ 
    margin: 0, 
    fontSize: '13px', 
    color: '#1e40af',
    lineHeight: '1.5'
  }}>
    💡 <strong>Próximamente:</strong> Podrás iniciar sesión con tu cuenta institucional de Office 365
  </p>
</div>
```

## Opción C: Sistema completamente funcional sin Office 365

Tu aplicación YA funciona perfectamente sin Office 365. Los usuarios pueden:

✅ Registrarse con email y contraseña  
✅ Iniciar sesión normalmente  
✅ Solicitar recuperación de contraseña  
✅ Usar todas las funcionalidades del sistema  

**Office 365 es solo una opción adicional de login**, no es obligatoria.

## ¿Cuándo activar Office 365?

Cuando TI te proporcione:
1. `NEXT_PUBLIC_MICROSOFT_CLIENT_ID`
2. `MICROSOFT_CLIENT_SECRET`
3. `MICROSOFT_TENANT_ID` (opcional)

Simplemente agrégalos a `.env.local` y descomenta los botones. ¡Listo!
