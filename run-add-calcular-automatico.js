// Script para agregar columna calcular_automatico
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addCalificacionAutomatica() {
  const client = await pool.connect();
  try {
    console.log('Conectando a Neon...');
    
    // Agregar columna si no existe
    await client.query(`
      ALTER TABLE calificaciones_trimestre 
      ADD COLUMN IF NOT EXISTS calcular_automatico BOOLEAN DEFAULT TRUE;
    `);
    
    console.log('✅ Columna calcular_automatico agregada correctamente');
    
    // Verificar que se agregó
    const result = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'calificaciones_trimestre'
        AND column_name = 'calcular_automatico';
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verificación exitosa:', result.rows[0]);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

addCalificacionAutomatica();
