# 🚀 Instalación en Otro Computador

## 📋 Prerrequisitos

Asegúrate de tener instalado:
- **Node.js** v18 o superior (https://nodejs.org/)
- **Git** (https://git-scm.com/)
- Acceso a la base de datos **Neon PostgreSQL**

## 🔧 Pasos de Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Juan-GARCESS/plan-de-accion-2025.git
cd plan-de-accion-2025
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```bash
# Configuración de la base de datos PostgreSQL (Neon)
# IMPORTANTE: Copia esto de tu .env.local actual
DATABASE_URL="tu_url_de_neon_postgresql_aqui"

# Microsoft Azure AD OAuth Configuration (OPCIONAL - para Office365 login)
# Si no vas a usar Office365 login, puedes dejar estos valores vacíos
NEXT_PUBLIC_MICROSOFT_CLIENT_ID="your_client_id_here"
MICROSOFT_CLIENT_SECRET="your_client_secret_here"
MICROSOFT_TENANT_ID="common"

# Secreto para JWT (genera uno único y seguro)
JWT_SECRET="tu_jwt_secret_muy_seguro_de_al_menos_32_caracteres"

# Configuración de Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="otro_secret_para_nextauth"
```

### 4. Verificar la Base de Datos

La base de datos ya debe tener:
- ✅ Todas las tablas creadas
- ✅ Usuario admin creado
- ✅ 30 áreas institucionales cargadas
- ✅ Ejes y sub-ejes configurados

Si necesitas recrear algo, los scripts SQL están en la carpeta `database/`.

### 5. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El proyecto estará disponible en:
- **Local:** http://localhost:3000
- **Red:** http://[tu-ip]:3000

### 6. Iniciar Sesión

**Usuario Admin por defecto:**
- Email: `admin@sistema.com`
- Contraseña: `admin123`

⚠️ **IMPORTANTE:** Cambia la contraseña del admin después de iniciar sesión.

---

## 📁 Estructura del Proyecto

```
login-app/
├── src/
│   ├── app/              # Páginas y rutas de Next.js
│   ├── components/       # Componentes React reutilizables
│   ├── hooks/           # Custom React Hooks
│   ├── lib/             # Utilidades (db, styles)
│   ├── styles/          # Estilos globales
│   └── types/           # TypeScript types
├── database/            # Scripts SQL
├── public/              # Archivos estáticos
├── .env.local          # Variables de entorno (NO INCLUIDO EN GIT)
└── package.json        # Dependencias del proyecto
```

---

## 🔐 Office 365 Login (Opcional)

Si quieres habilitar el inicio de sesión con Office 365:

1. Lee el archivo **`OFFICE365_LOGIN_SETUP.md`**
2. Sigue los pasos para configurar Azure AD
3. Agrega las credenciales a `.env.local`

---

## 🗄️ Información de Base de Datos

### Conectar a Neon (si necesitas acceso directo)

```bash
psql "postgresql://usuario:password@ep-xxx-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require"
```

### Tablas Principales

- **usuarios** - Gestión de usuarios del sistema
- **areas** - 30 áreas institucionales
- **ejes** - Ejes estratégicos
- **sub_ejes** - Sub-ejes de cada eje
- **trimestres** - Periodos trimestrales
- **evidencias** - Evidencias subidas por usuarios
- **plan_accion** - Plan de acción por área y trimestre

---

## 🚨 Solución de Problemas

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 is already in use"
El servidor automáticamente usará el puerto 3001 o puedes especificar uno:
```bash
PORT=3002 npm run dev
```

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` en `.env.local` sea correcto
- Asegúrate de tener conexión a internet (Neon es cloud)
- Verifica que la IP esté permitida en Neon

### Error: "Session expired"
- Borra las cookies del navegador
- Reinicia el servidor
- Vuelve a iniciar sesión

---

## 📦 Dependencias Principales

- **Next.js 15.5.4** - Framework React
- **React 19.0.0** - Biblioteca UI
- **TypeScript** - Tipado estático
- **PostgreSQL (pg)** - Cliente de base de datos
- **Sonner** - Sistema de notificaciones toast
- **date-fns** - Manejo de fechas

---

## 🎯 Características Implementadas

✅ Sistema de autenticación con sesiones  
✅ Roles: Admin y Usuario  
✅ Dashboard administrativo completo  
✅ Gestión de usuarios, áreas, ejes y sub-ejes  
✅ Sistema de evidencias con archivos  
✅ Plan de acción trimestral  
✅ Sistema de notificaciones elegante (toast)  
✅ Diseño responsive (móvil y desktop)  
✅ Login con Office 365 (requiere configuración Azure)  
✅ Validación de dominio institucional (@campusucc.edu.co)  

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del servidor en la terminal
2. Revisa la consola del navegador (F12)
3. Verifica que `.env.local` tenga todos los valores correctos
4. Asegúrate de tener Node.js v18 o superior

---

## 🎉 ¡Listo!

Una vez completados estos pasos, el sistema estará funcionando completamente en el nuevo computador.
