// Script para probar conexión a PostgreSQL (Neon)
// Ejecutar con: node test-connection.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_vc9djoEer1Rl@ep-frosty-moon-acux7z3k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testConnection() {
  try {
    console.log('🔄 Probando conexión a Neon PostgreSQL...\n');
    
    // Test 1: Conexión básica
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a PostgreSQL\n');
    
    // Test 2: Versión de PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('📊 Versión de PostgreSQL:');
    console.log(versionResult.rows[0].version);
    console.log('');
    
    // Test 3: Listar tablas existentes
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('✅ Tablas encontradas en la base de datos:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No se encontraron tablas. Ejecuta el script schema-postgres.sql en Neon.');
    }
    console.log('');
    
    // Test 4: Verificar usuario admin (si la tabla existe)
    if (tablesResult.rows.some(r => r.table_name === 'usuarios')) {
      const adminResult = await client.query(
        "SELECT id, nombre, email, rol FROM usuarios WHERE email = $1",
        ['admin@sistema.com']
      );
      
      if (adminResult.rows.length > 0) {
        console.log('✅ Usuario administrador encontrado:');
        console.log(`   ID: ${adminResult.rows[0].id}`);
        console.log(`   Nombre: ${adminResult.rows[0].nombre}`);
        console.log(`   Email: ${adminResult.rows[0].email}`);
        console.log(`   Rol: ${adminResult.rows[0].rol}`);
      } else {
        console.log('⚠️  Usuario admin no encontrado. Ejecuta los INSERT del schema.');
      }
    }
    
    client.release();
    console.log('\n✅ Todas las pruebas completadas exitosamente!');
    console.log('🎉 Tu aplicación está lista para usar PostgreSQL en Neon\n');
    
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error.message);
    console.error('\nVerifica que:');
    console.error('1. La cadena de conexión en .env.local sea correcta');
    console.error('2. Tengas acceso a internet');
    console.error('3. El proyecto en Neon esté activo\n');
  } finally {
    await pool.end();
  }
}

testConnection();
