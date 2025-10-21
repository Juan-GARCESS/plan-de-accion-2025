const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  const client = await pool.connect();
  try {
    console.log('🔧 Ejecutando ALTER TABLE...');
    
    await client.query(`
      ALTER TABLE evidencias 
      ALTER COLUMN archivo_tipo TYPE VARCHAR(200);
    `);
    
    console.log('✅ Campo archivo_tipo actualizado a VARCHAR(200)');
    
    const result = await client.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'evidencias' 
      AND column_name = 'archivo_tipo';
    `);
    
    console.log('📊 Verificación:', result.rows[0]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
})();
