// Ver evidencias sin envio_id
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verificarEvidenciasSinEnvio() {
  const client = await pool.connect();
  try {
    console.log('\n=== EVIDENCIAS SIN ENVIO_ID (Trimestre 1, Area Activos Fijos) ===\n');
    
    const evidencias = await client.query(`
      SELECT 
        e.id,
        e.meta_id,
        e.usuario_id,
        u.nombre as usuario_nombre,
        pa.area_id,
        a.nombre_area,
        e.trimestre,
        e.anio,
        e.envio_id,
        pa.meta,
        e.descripcion
      FROM evidencias e
      JOIN usuarios u ON e.usuario_id = u.id
      JOIN plan_accion pa ON e.meta_id = pa.id
      JOIN areas a ON pa.area_id = a.id
      WHERE e.trimestre = 1 
        AND e.anio = 2025 
        AND e.usuario_id = 2
        AND pa.area_id = 3
      ORDER BY e.id;
    `);
    
    console.log(`Total evidencias: ${evidencias.rows.length}\n`);
    evidencias.rows.forEach(ev => {
      console.log(`ID: ${ev.id}`);
      console.log(`Meta ID: ${ev.meta_id} - ${ev.meta}`);
      console.log(`Usuario: ${ev.usuario_nombre}`);
      console.log(`Área: ${ev.nombre_area}`);
      console.log(`Envio ID: ${ev.envio_id === null ? 'NULL (NO VINCULADO)' : ev.envio_id}`);
      console.log(`Descripción: ${ev.descripcion ? ev.descripcion.substring(0, 50) + '...' : 'Sin descripción'}`);
      console.log('---');
    });
    
    // Corregir automáticamente
    if (evidencias.rows.length > 0 && evidencias.rows.some(e => e.envio_id === null)) {
      console.log('\n🔧 CORRIGIENDO: Vinculando evidencias con envio_id = 1...\n');
      
      const ids = evidencias.rows.filter(e => e.envio_id === null).map(e => e.id);
      
      const result = await client.query(`
        UPDATE evidencias 
        SET envio_id = 1 
        WHERE id = ANY($1::int[])
        RETURNING id;
      `, [ids]);
      
      console.log(`✅ ${result.rows.length} evidencias vinculadas correctamente`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verificarEvidenciasSinEnvio();
