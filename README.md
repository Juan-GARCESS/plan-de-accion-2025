# 📊 Sistema de Gestión de Informes Trimestrales

Sistema completo de gestión de informes trimestrales desarrollado con Next.js 15.5.4, TypeScript y MySQL.

## 🚀 Características

### 👨‍💼 Panel de Administrador
- **Dashboard Principal**: Visualización de todas las áreas de trabajo
- **Gestión de Usuarios**: CRUD completo con aprobación de solicitudes
- **Gestión de Áreas**: Creación y administración de áreas de trabajo
- **Revisión de Informes**: Visualización de informes por área y trimestre
- **Estadísticas**: Métricas generales del sistema

### 👤 Panel de Usuario
- **Dashboard de Trimestres**: Visualización de trimestres disponibles
- **Planificación**: Creación de metas trimestrales
- **Carga de Informes**: Upload de archivos con validación
- **Seguimiento**: Estados de informes (planificando → pendiente → aceptado/rechazado)

## 🛠️ Tecnologías

- **Frontend**: Next.js 15.5.4 + React 19.1.0 + TypeScript
- **Backend**: API Routes de Next.js
- **Base de Datos**: MySQL
- **Autenticación**: Sistema híbrido cookies + JWT
- **Estilos**: Responsive design con hooks personalizados
- **Seguridad**: bcrypt, validaciones de roles

## ⚡ Instalación y Uso

1. **Clonar e instalar**
   ```bash
   git clone https://github.com/Juan-GARCESS/Plan.git
   cd Plan
   npm install
   ```

2. **Configurar variables de entorno** (crear `.env.local`)
   ```env
   DATABASE_URL="mysql://usuario:password@localhost:3306/db_name"
   JWT_SECRET="tu_jwt_secret_muy_seguro"
   ```

3. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
