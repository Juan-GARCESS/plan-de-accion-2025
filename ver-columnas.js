// Script simple para ver las columnas de evidencias
const { Client } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_vc9djoEer1Rl@ep-frosty-moon-acux7z3k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

async function verColumnas() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'evidencias'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Columnas en tabla evidencias:\n');
    result.rows.forEach((row, i) => {
      const maxLength = row.character_maximum_length ? `(${row.character_maximum_length})` : '';
      console.log(`${i + 1}. ${row.column_name}: ${row.data_type}${maxLength}`);
    });
    console.log('');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

verColumnas();
