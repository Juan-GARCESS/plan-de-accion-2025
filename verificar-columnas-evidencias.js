// Verificar estructura de la tabla evidencias
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verificarTabla() {
  const client = await pool.connect();
  try {
    console.log('\n=== COLUMNAS DE LA TABLA EVIDENCIAS ===\n');
    
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'evidencias'
      ORDER BY ordinal_position;
    `);
    
    result.rows.forEach(col => {
      console.log(`${col.column_name} - ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
    console.log('\n=== PRUEBA DE QUERY ===\n');
    
    // Probar query simple
    const test = await client.query(`
      SELECT 
        e.id,
        e.meta_id,
        e.usuario_id,
        e.trimestre,
        e.envio_id,
        pa.meta
      FROM evidencias e
      JOIN plan_accion pa ON e.meta_id = pa.id
      WHERE e.trimestre = 1 AND e.anio = 2025 AND e.envio_id = 1
      LIMIT 1;
    `);
    
    console.log('Resultado:', test.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verificarTabla();
