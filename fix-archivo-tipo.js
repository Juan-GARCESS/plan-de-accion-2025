// fix-archivo-tipo.js - Arreglar tamaño del campo archivo_tipo
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function fixArchivoTipo() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔧 Conectando a la base de datos...');
    const client = await pool.connect();

    console.log('📝 Aumentando tamaño del campo archivo_tipo a 200 caracteres...');
    
    await client.query(`
      ALTER TABLE evidencias 
      ALTER COLUMN archivo_tipo TYPE VARCHAR(200);
    `);

    console.log('✅ Campo archivo_tipo actualizado correctamente');

    // Verificar el cambio
    const result = await client.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'evidencias' AND column_name = 'archivo_tipo';
    `);

    console.log('\n📊 Verificación:');
    console.log(result.rows[0]);
    console.log(`\n✅ Nuevo tamaño máximo: ${result.rows[0].character_maximum_length} caracteres`);
    console.log('\n🎉 ¡Arreglo completado! Ahora puedes subir archivos Word, Excel y PDF sin problemas.');

    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixArchivoTipo();
