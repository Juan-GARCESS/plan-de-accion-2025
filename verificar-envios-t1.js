// Verificar envíos en la base de datos
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verificarEnvios() {
  const client = await pool.connect();
  try {
    console.log('\n=== VERIFICANDO ENVÍOS DEL TRIMESTRE 1 ===\n');
    
    // Ver todos los envíos del trimestre 1
    const envios = await client.query(`
      SELECT 
        et.id,
        et.usuario_id,
        u.nombre as usuario_nombre,
        et.area_id,
        a.nombre_area,
        et.trimestre,
        et.anio,
        et.estado,
        et.fecha_envio,
        COUNT(e.id) as num_evidencias
      FROM envios_trimestre et
      JOIN usuarios u ON et.usuario_id = u.id
      JOIN areas a ON et.area_id = a.id
      LEFT JOIN evidencias e ON e.envio_id = et.id
      WHERE et.trimestre = 1 AND et.anio = 2025
      GROUP BY et.id, et.usuario_id, u.nombre, et.area_id, a.nombre_area, et.trimestre, et.anio, et.estado, et.fecha_envio
      ORDER BY et.fecha_envio DESC;
    `);
    
    console.log(`Envíos encontrados: ${envios.rows.length}\n`);
    envios.rows.forEach(envio => {
      console.log(`ID: ${envio.id}`);
      console.log(`Usuario: ${envio.usuario_nombre} (ID: ${envio.usuario_id})`);
      console.log(`Área: ${envio.nombre_area} (ID: ${envio.area_id})`);
      console.log(`Estado: ${envio.estado}`);
      console.log(`Fecha: ${envio.fecha_envio}`);
      console.log(`Evidencias: ${envio.num_evidencias}`);
      console.log('---');
    });
    
    // Ver evidencias con envio_id
    console.log('\n=== EVIDENCIAS CON ENVIO_ID (Trimestre 1) ===\n');
    const evidencias = await client.query(`
      SELECT 
        e.id,
        e.meta_id,
        e.usuario_id,
        u.nombre as usuario_nombre,
        pa.area_id,
        a.nombre_area,
        e.trimestre,
        e.envio_id,
        pa.meta,
        e.estado,
        e.calificacion
      FROM evidencias e
      JOIN usuarios u ON e.usuario_id = u.id
      JOIN plan_accion pa ON e.meta_id = pa.id
      JOIN areas a ON pa.area_id = a.id
      WHERE e.trimestre = 1 AND e.anio = 2025 AND e.envio_id IS NOT NULL
      ORDER BY e.id DESC;
    `);
    
    console.log(`Evidencias encontradas: ${evidencias.rows.length}\n`);
    evidencias.rows.forEach(ev => {
      console.log(`ID: ${ev.id}`);
      console.log(`Meta: ${ev.meta}`);
      console.log(`Usuario: ${ev.usuario_nombre}`);
      console.log(`Área: ${ev.nombre_area} (ID: ${ev.area_id})`);
      console.log(`Envio ID: ${ev.envio_id}`);
      console.log(`Estado: ${ev.estado}`);
      console.log(`Calificación: ${ev.calificacion}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verificarEnvios();
