// Script para insertar todas las áreas en la base de datos
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const areas = [
  { nombre: 'Activos Fijos', descripcion: 'Gestión y control de activos fijos de la institución' },
  { nombre: 'Autoevaluación', descripcion: 'Procesos de autoevaluación y mejora continua' },
  { nombre: 'Bienestar', descripcion: 'Bienestar universitario y servicios estudiantiles' },
  { nombre: 'CAD', descripcion: 'Centro de Apoyo y Desarrollo' },
  { nombre: 'Centro de conciliación y consultorio jurídico', descripcion: 'Servicios jurídicos y de conciliación' },
  { nombre: 'Compras', descripcion: 'Gestión de compras y adquisiciones' },
  { nombre: 'Comunicaciones', descripcion: 'Comunicación institucional y relaciones públicas' },
  { nombre: 'Contabilidad', descripcion: 'Gestión contable y financiera' },
  { nombre: 'DARC', descripcion: 'Departamento de Admisiones, Registro y Control' },
  { nombre: 'E-learning APA', descripcion: 'Plataforma de aprendizaje en línea APA' },
  { nombre: 'ETDH / Centro de Idiomas', descripcion: 'Enseñanza de idiomas y desarrollo humano' },
  { nombre: 'Extensión y Proyección Social', descripcion: 'Programas de extensión y proyección a la comunidad' },
  { nombre: 'Administración de Empresas', descripcion: 'Programa académico de Administración de Empresas' },
  { nombre: 'Especialización Gestión del Talento Humano', descripcion: 'Programa de especialización en Talento Humano' },
  { nombre: 'Contaduría', descripcion: 'Programa académico de Contaduría Pública' },
  { nombre: 'Especialización Gerencia de Impuestos', descripcion: 'Programa de especialización en Gerencia de Impuestos' },
  { nombre: 'Derecho', descripcion: 'Programa académico de Derecho' },
  { nombre: 'Especialización Contratación Estatal', descripcion: 'Programa de especialización en Contratación Estatal' },
  { nombre: 'Especialización Derecho Laboral', descripcion: 'Programa de especialización en Derecho Laboral' },
  { nombre: 'Gestión Humana', descripcion: 'Gestión del talento humano institucional' },
  { nombre: 'Infraestructura Física', descripcion: 'Mantenimiento y desarrollo de infraestructura' },
  { nombre: 'Infraestructura Tecnológica', descripcion: 'Gestión de infraestructura y servicios tecnológicos' },
  { nombre: 'Mercadeo', descripcion: 'Marketing y comunicación comercial' },
  { nombre: 'Planeación y Efectividad', descripcion: 'Planeación estratégica y medición de efectividad' },
  { nombre: 'Ingeniería de Sistemas', descripcion: 'Programa académico de Ingeniería de Sistemas' },
  { nombre: 'Especialización Seguridad de la información', descripcion: 'Programa de especialización en Seguridad de la Información' },
  { nombre: 'Psicología', descripcion: 'Programa académico de Psicología' },
  { nombre: 'Especialización Promoción Psicosocial', descripcion: 'Programa de especialización en Promoción Psicosocial' },
  { nombre: 'SIB', descripcion: 'Sistema Integrado de Bibliotecas' },
  { nombre: 'Tesorería', descripcion: 'Gestión de tesorería y pagos' }
];

async function insertAreas() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando inserción de áreas...\n');
    
    let insertadas = 0;
    let existentes = 0;
    
    for (const area of areas) {
      try {
        // Verificar si ya existe
        const check = await client.query(
          'SELECT id FROM areas WHERE nombre_area = $1',
          [area.nombre]
        );
        
        if (check.rows.length > 0) {
          console.log(`⏭️  Ya existe: ${area.nombre}`);
          existentes++;
        } else {
          await client.query(
            'INSERT INTO areas (nombre_area, descripcion, activo, fecha_creacion) VALUES ($1, $2, true, NOW())',
            [area.nombre, area.descripcion]
          );
          console.log(`✅ Insertada: ${area.nombre}`);
          insertadas++;
        }
      } catch (error) {
        console.error(`❌ Error con ${area.nombre}:`, error.message);
      }
    }
    
    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Áreas nuevas insertadas: ${insertadas}`);
    console.log(`   ⏭️  Áreas que ya existían: ${existentes}`);
    console.log(`   📋 Total procesadas: ${areas.length}`);
    
    // Mostrar todas las áreas actuales
    const result = await client.query(
      'SELECT id, nombre_area FROM areas WHERE activo = true ORDER BY nombre_area'
    );
    
    console.log(`\n📚 Total de áreas activas en la base de datos: ${result.rows.length}\n`);
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

insertAreas();
