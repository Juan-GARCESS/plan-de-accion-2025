const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableCell, TableRow, WidthType, BorderStyle } = require('docx');

async function generarDocumentacion() {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Título principal
        new Paragraph({
          text: "Sistema de Gestión de Plan de Acción 2025",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        // Descripción
        new Paragraph({
          text: "Descripción",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          text: "Plataforma que permite a diferentes áreas de una institución gestionar sus metas anuales divididas en trimestres, cargar evidencias de cumplimiento, y recibir calificaciones del equipo administrativo. El sistema implementa un flujo completo de envío, revisión, aprobación/rechazo y reenvío de evidencias.",
          spacing: { after: 200 }
        }),

        // Tecnologías
        new Paragraph({
          text: "Tecnologías Utilizadas",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }),

        // TypeScript
        new Paragraph({
          text: "Lenguajes de Programación",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 }
        }),
        new Paragraph({
          text: "TypeScript 5.x",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Qué es: ", bold: true }),
            new TextRun("Superset de JavaScript que añade tipado estático")
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Cómo lo usamos:", bold: true })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: "• Todo el código del proyecto está escrito en TypeScript",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Definición de tipos e interfaces en /src/types/",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Tipado de componentes React, props y estados",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Tipado de respuestas de API y queries a base de datos",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Autocompletado y detección de errores en tiempo de desarrollo",
          bullet: { level: 0 },
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Por qué: ", bold: true }),
            new TextRun("Mayor seguridad de tipos, mejor experiencia de desarrollo, menos bugs en producción")
          ],
          spacing: { after: 200 }
        }),

        // JavaScript
        new Paragraph({
          text: "JavaScript (ES6+)",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Qué es: ", bold: true }),
            new TextRun("Lenguaje base de TypeScript, se ejecuta en el navegador y Node.js")
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Cómo lo usamos:", bold: true })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: "• TypeScript se compila a JavaScript para ejecución",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Archivos de configuración (next.config.ts, tailwind.config.js)",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Funciones asíncronas (async/await) para peticiones HTTP",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Manipulación del DOM en componentes React",
          bullet: { level: 0 },
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Por qué: ", bold: true }),
            new TextRun("Estándar de la web, compatible con todos los navegadores")
          ],
          spacing: { after: 200 }
        }),

        // SQL
        new Paragraph({
          text: "SQL (PostgreSQL)",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Qué es: ", bold: true }),
            new TextRun("Lenguaje de consultas estructuradas para bases de datos relacionales")
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Cómo lo usamos:", bold: true })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: "• Queries parametrizadas con pg (PostgreSQL client)",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Scripts de migración en /database/",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Consultas SELECT con JOINs complejos (usuarios, áreas, evidencias)",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• INSERT/UPDATE/DELETE para operaciones CRUD",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Transacciones para operaciones críticas",
          bullet: { level: 0 },
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Por qué: ", bold: true }),
            new TextRun("Base de datos relacional robusta, escalable y con integridad referencial")
          ],
          spacing: { after: 200 }
        }),

        // CSS
        new Paragraph({
          text: "CSS",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Qué es: ", bold: true }),
            new TextRun("Lenguaje de estilos en cascada")
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Cómo lo usamos:", bold: true })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: "• Estilos inline en componentes React (style prop)",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Archivo global globals.css para estilos base",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Variables CSS para temas (modo claro/oscuro)",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Flexbox y Grid para layouts responsivos",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Media queries para diseño adaptativo",
          bullet: { level: 0 },
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Por qué: ", bold: true }),
            new TextRun("Flexibilidad total en el diseño, sin dependencia de frameworks CSS pesados")
          ],
          spacing: { after: 300 }
        }),

        // Frameworks
        new Paragraph({
          text: "Frameworks y Librerías",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 150 }
        }),

        // Next.js
        new Paragraph({
          text: "Next.js 15.5.4",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Qué es: ", bold: true }),
            new TextRun("Framework de React para aplicaciones web full-stack")
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Cómo lo usamos:", bold: true })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: "• App Router: Sistema de rutas basado en carpetas (/app/)",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Server Components: Componentes que se renderizan en el servidor",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• API Routes: Endpoints REST en /app/api/",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• File-based Routing: /admin/dashboard = app/admin/dashboard/page.tsx",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Server Actions: Acciones del servidor para formularios",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Turbopack: Compilador ultra rápido para desarrollo",
          bullet: { level: 0 },
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Por qué: ", bold: true }),
            new TextRun("SSR (Server-Side Rendering), SEO mejorado, rendimiento óptimo")
          ],
          spacing: { after: 200 }
        }),

        // React
        new Paragraph({
          text: "React 19.1.0",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Qué es: ", bold: true }),
            new TextRun("Librería de JavaScript para interfaces de usuario")
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Cómo lo usamos:", bold: true })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: "• Componentes funcionales con hooks",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• useState para estado local (formularios, modales)",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• useEffect para efectos secundarios (fetch de datos)",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• useContext para estado global (tema, autenticación)",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Custom hooks en /src/hooks/ (useAuth, useAdminDashboard)",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Composición de componentes (reutilización)",
          bullet: { level: 0 },
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Por qué: ", bold: true }),
            new TextRun("Declarativo, componible, ecosistema maduro")
          ],
          spacing: { after: 200 }
        }),

        // Node.js
        new Paragraph({
          text: "Node.js",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Qué es: ", bold: true }),
            new TextRun("Runtime de JavaScript en el servidor")
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Cómo lo usamos:", bold: true })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: "• Ejecuta el servidor de Next.js",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Procesa las API Routes",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Maneja conexiones a PostgreSQL",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Integración con AWS SDK para S3",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Procesamiento de archivos (FormData, uploads)",
          bullet: { level: 0 },
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Por qué: ", bold: true }),
            new TextRun("Permite JavaScript en backend, mismo lenguaje frontend/backend")
          ],
          spacing: { after: 300 }
        }),

        // Requisitos previos
        new Paragraph({
          text: "Requisitos Previos",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
          pageBreakBefore: true
        }),
        new Paragraph({
          text: "• Node.js 18.x o superior",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• npm o yarn",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Cuenta en Neon (PostgreSQL)",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Cuenta en AWS S3",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Cuenta en Resend (opcional, para emails)",
          bullet: { level: 0 },
          spacing: { after: 300 }
        }),

        // Instalación
        new Paragraph({
          text: "Instalación",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          text: "1. Clonar el repositorio",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          text: "git clone https://github.com/Juan-GARCESS/plan-de-accion-2025.git",
          style: "Code"
        }),
        new Paragraph({
          text: "cd plan-de-accion-2025/login-app",
          style: "Code",
          spacing: { after: 200 }
        }),

        new Paragraph({
          text: "2. Instalar dependencias",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          text: "npm install",
          style: "Code",
          spacing: { after: 200 }
        }),

        new Paragraph({
          text: "3. Configurar variables de entorno",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          text: "Crear archivo .env.local en la raíz del proyecto con las siguientes variables:",
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: "DATABASE_URL=postgresql://usuario:password@host/database?sslmode=require",
          style: "Code"
        }),
        new Paragraph({
          text: "AWS_REGION=us-east-1",
          style: "Code"
        }),
        new Paragraph({
          text: "AWS_ACCESS_KEY_ID=tu_access_key",
          style: "Code"
        }),
        new Paragraph({
          text: "AWS_SECRET_ACCESS_KEY=tu_secret_key",
          style: "Code"
        }),
        new Paragraph({
          text: "AWS_S3_BUCKET_NAME=nombre-bucket",
          style: "Code"
        }),
        new Paragraph({
          text: "RESEND_API_KEY=re_xxxxxxxxxx",
          style: "Code",
          spacing: { after: 200 }
        }),

        new Paragraph({
          text: "4. Configurar base de datos",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          text: "Ejecutar los scripts SQL en orden:",
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: "• schema-postgres.sql - Estructura de tablas",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• insert_areas.sql - Áreas iniciales",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• nuevas_tablas_ejes.sql - Ejes y sub-ejes",
          bullet: { level: 0 },
          spacing: { after: 200 }
        }),

        new Paragraph({
          text: "5. Ejecutar el proyecto",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          text: "# Desarrollo",
          style: "Code"
        }),
        new Paragraph({
          text: "npm run dev",
          style: "Code",
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: "# Producción",
          style: "Code"
        }),
        new Paragraph({
          text: "npm run build",
          style: "Code"
        }),
        new Paragraph({
          text: "npm start",
          style: "Code",
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: "El sistema estará disponible en http://localhost:3000",
          spacing: { after: 300 }
        }),

        // Arquitectura
        new Paragraph({
          text: "Arquitectura del Sistema",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
          pageBreakBefore: true
        }),

        new Paragraph({
          text: "Flujo de Autenticación",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          text: "1. Usuario ingresa credenciales en /",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "2. Sistema valida contra tabla usuarios",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "3. Se crea cookie de sesión con userId",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "4. Redirección según rol:",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "admin → /admin/dashboard",
          bullet: { level: 1 }
        }),
        new Paragraph({
          text: "usuario → /dashboard",
          bullet: { level: 1 },
          spacing: { after: 200 }
        }),

        new Paragraph({
          text: "Flujo de Gestión de Evidencias - Usuario Normal",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 }
        }),
        new Paragraph({
          text: "1. Accede a /dashboard/plan-accion",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "2. Marca checkboxes de trimestres (T1, T2, T3, T4)",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "3. Accede a /dashboard/trimestre/[1-4]",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "4. Visualiza metas asignadas según checkboxes",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "5. Carga descripción y archivo de evidencia",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "6. Envío crea registro en tabla evidencias",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "7. Estado inicial: pendiente",
          bullet: { level: 0 },
          spacing: { after: 200 }
        }),

        new Paragraph({
          text: "Flujo de Gestión de Evidencias - Administrador",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 }
        }),
        new Paragraph({
          text: "1. Accede a /admin/dashboard",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "2. Selecciona área y trimestre a calificar",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "3. Visualiza evidencias pendientes en formato de tarjetas",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "4. Acciones disponibles:",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "Ver archivo adjunto",
          bullet: { level: 1 }
        }),
        new Paragraph({
          text: "Asignar calificación (0-100)",
          bullet: { level: 1 }
        }),
        new Paragraph({
          text: "Agregar comentario",
          bullet: { level: 1 }
        }),
        new Paragraph({
          text: "Aprobar o Rechazar",
          bullet: { level: 1 }
        }),
        new Paragraph({
          text: "Editar calificación existente",
          bullet: { level: 1 }
        }),
        new Paragraph({
          text: "Eliminar evidencia",
          bullet: { level: 1 },
          spacing: { after: 300 }
        }),

        // Estados de evidencias
        new Paragraph({
          text: "Estados de Evidencias",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
          pageBreakBefore: true
        }),
        new Paragraph({
          text: "No enviada: Meta sin evidencia. Usuario puede crear y enviar.",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "Pendiente: Enviada, esperando revisión. Usuario solo visualiza. Admin puede calificar.",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "Aprobada: Calificada positivamente. Usuario solo visualiza. Admin puede editar o eliminar.",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "Rechazada: Calificada negativamente. Usuario puede reenviar con correcciones. Admin puede editar o eliminar.",
          bullet: { level: 0 },
          spacing: { after: 300 }
        }),

        // Seguridad
        new Paragraph({
          text: "Seguridad",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          text: "• Contraseñas hasheadas con bcrypt",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Validación de roles en cada endpoint API",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Cookies HTTP-only para sesiones",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Validación de tipos de archivo en upload",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Límite de tamaño de archivo (10MB)",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• SQL preparado (prevención de SQL injection)",
          bullet: { level: 0 }
        }),
        new Paragraph({
          text: "• Validación de pertenencia a área en queries",
          bullet: { level: 0 },
          spacing: { after: 300 }
        }),

        // Contacto
        new Paragraph({
          text: "Contacto",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          text: "Para soporte o consultas, contactar al equipo de desarrollo.",
          spacing: { after: 200 }
        }),

        new Paragraph({
          text: "Licencia",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          text: "Proyecto propietario - Todos los derechos reservados",
          spacing: { after: 200 }
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('DOCUMENTACION_SISTEMA_PLAN_ACCION_2025.docx', buffer);
  console.log('✓ Documento Word generado: DOCUMENTACION_SISTEMA_PLAN_ACCION_2025.docx');
}

generarDocumentacion().catch(console.error);
