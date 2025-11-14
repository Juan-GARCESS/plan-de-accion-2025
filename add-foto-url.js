// Script para agregar campo foto_url a usuarios
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addFotoUrlColumn() {
  try {
    console.log('Agregando campo foto_url a la tabla usuarios...');
    
    await pool.query(`
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_url TEXT NULL;
    `);
    
    console.log('✓ Campo foto_url agregado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error al ejecutar la migración:', error.message);
    process.exit(1);
  }
}

addFotoUrlColumn();
