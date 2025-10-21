# 🚀 Instrucciones de Instalación - Plan de Acción 2025

## ✅ Requisitos Previos

Debes tener instalado:

1. **Node.js** (v18 o superior)
   - Descargar: https://nodejs.org/
   - Verificar: `node --version`

2. **Git** (opcional, solo si clonas desde GitHub)
   - Descargar: https://git-scm.com/downloads

---

## 📥 Método 1: Clonar desde GitHub (Recomendado)

### Paso 1: Clonar el Repositorio
```powershell
# Ir a la carpeta donde quieras el proyecto
cd C:\Users\TuUsuario\Desktop

# Clonar
git clone https://github.com/Juan-GARCESS/plan-de-accion-2025.git

# Entrar a la carpeta
cd plan-de-accion-2025
```

### Paso 2: Instalar Dependencias
```powershell
npm install
```

### Paso 3: Configurar Variables de Entorno

**Crear archivo `.env.local`** en la raíz del proyecto con este contenido:

```env
# ⚠️ SOLICITA ESTOS VALORES AL ADMINISTRADOR DEL PROYECTO

DATABASE_URL=postgresql://[SOLICITAR]
SESSION_SECRET=tu-secreto-super-seguro
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=[SOLICITAR]
AWS_SECRET_ACCESS_KEY=[SOLICITAR]
AWS_S3_BUCKET_NAME=plan-accion-evidencias-oct2025
RESEND_API_KEY=[SOLICITAR]
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ IMPORTANTE**: Nunca compartas estas credenciales públicamente.

### Paso 4: Ejecutar la Aplicación
```powershell
npm run dev
```

Abrir navegador en: **http://localhost:3000**

---

## 📦 Método 2: Instalar desde Archivo ZIP

### Paso 1: Descomprimir
Descomprime el archivo `plan-de-accion-2025.zip` en tu computador.

### Paso 2: Abrir Terminal en la Carpeta
```powershell
cd C:\ruta\a\plan-de-accion-2025
```

### Paso 3: Instalar Dependencias
```powershell
npm install
```

### Paso 4: Configurar `.env.local`
Sigue las instrucciones del **Paso 3** del Método 1.

### Paso 5: Ejecutar
```powershell
npm run dev
```

---

## 🌐 Acceso desde Otros Dispositivos

### En la Misma Red WiFi:

1. **Ver tu IP**:
```powershell
ipconfig
# Buscar "Dirección IPv4": Ejemplo 192.168.1.48
```

2. **Desde otro dispositivo**, abrir:
```
http://TU_IP:3000
```

Ejemplo: `http://192.168.1.48:3000`

---

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```powershell
# Reinstalar dependencias
rm -r node_modules
npm install
```

### Error: "Port 3000 already in use"
```powershell
# Cambiar puerto
$env:PORT=3001; npm run dev
```

### Error: "DATABASE_URL not found"
- Verifica que el archivo `.env.local` existe
- Verifica que tiene todas las variables
- Reinicia el servidor después de modificar `.env.local`

---

## 👥 Usuarios de Prueba

### Admin:
- **Email**: admin@correo.com
- **Contraseña**: [SOLICITAR]

### Usuario Normal:
- **Email**: prueba@correo.com
- **Contraseña**: [SOLICITAR]

---

## 📞 Soporte

Si tienes problemas, contacta al administrador del proyecto.

---

## 🔒 Seguridad

- **NO** compartas el archivo `.env.local`
- **NO** subas `.env.local` a repositorios públicos
- Usa credenciales diferentes para producción

---

**Versión**: 1.0  
**Última Actualización**: 21 de octubre, 2025
