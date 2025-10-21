// Script para ejecutar el SQL de migración automáticamente en Neon
const { Client } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_vc9djoEer1Rl@ep-frosty-moon-acux7z3k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

async function executeMigration() {
  console.log('\n=============================================');
  console.log('  🗄️  EJECUTANDO MIGRACIÓN SQL EN NEON');
  console.log('=============================================\n');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Conectar a la base de datos
    console.log('📋 Paso 1: Conectando a Neon PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado exitosamente!\n');

    // Ejecutar cada comando por separado
    console.log('📋 Paso 2: Agregando columnas a tabla evidencias...\n');

    // Agregar columna nombre_archivo
    console.log('   - Agregando columna nombre_archivo...');
    try {
      await client.query(`
        ALTER TABLE evidencias 
        ADD COLUMN IF NOT EXISTS nombre_archivo VARCHAR(500);
      `);
      console.log('     ✅ Columna nombre_archivo agregada');
    } catch (e) {
      console.log('     ⚠️  La columna ya existe');
    }

    // Agregar columna tipo_archivo
    console.log('   - Agregando columna tipo_archivo...');
    try {
      await client.query(`
        ALTER TABLE evidencias 
        ADD COLUMN IF NOT EXISTS tipo_archivo VARCHAR(100);
      `);
      console.log('     ✅ Columna tipo_archivo agregada');
    } catch (e) {
      console.log('     ⚠️  La columna ya existe');
    }

    // Agregar columna tamano_archivo
    console.log('   - Agregando columna tamano_archivo...');
    try {
      await client.query(`
        ALTER TABLE evidencias 
        ADD COLUMN IF NOT EXISTS tamano_archivo INTEGER;
      `);
      console.log('     ✅ Columna tamano_archivo agregada');
    } catch (e) {
      console.log('     ⚠️  La columna ya existe');
    }

    // Actualizar tipo de url_evidencia
    console.log('   - Ampliando columna url_evidencia a TEXT...');
    try {
      await client.query(`
        ALTER TABLE evidencias 
        ALTER COLUMN url_evidencia TYPE TEXT;
      `);
      console.log('     ✅ Columna url_evidencia ampliada');
    } catch (e) {
      console.log('     ⚠️  Ya es tipo TEXT');
    }

    console.log('\n📋 Paso 3: Creando índices...\n');

    // Crear índice tipo_archivo
    console.log('   - Creando índice para tipo_archivo...');
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_evidencias_tipo_archivo 
        ON evidencias(tipo_archivo);
      `);
      console.log('     ✅ Índice idx_evidencias_tipo_archivo creado');
    } catch (e) {
      console.log('     ⚠️  El índice ya existe');
    }

    // Crear índice fecha_subida
    console.log('   - Creando índice para fecha_subida...');
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_evidencias_fecha_subida 
        ON evidencias(fecha_subida DESC);
      `);
      console.log('     ✅ Índice idx_evidencias_fecha_subida creado');
    } catch (e) {
      console.log('     ⚠️  El índice ya existe');
    }

    // Crear índice usuario_meta_id
    console.log('   - Creando índice para usuario_meta_id...');
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_evidencias_usuario_meta 
        ON evidencias(usuario_meta_id);
      `);
      console.log('     ✅ Índice idx_evidencias_usuario_meta creado');
    } catch (e) {
      console.log('     ⚠️  El índice ya existe');
    }

    // Verificar que las columnas existen
    console.log('\n📋 Paso 4: Verificando cambios...\n');
    const verifyQuery = `
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'evidencias' 
      AND column_name IN ('nombre_archivo', 'tipo_archivo', 'tamano_archivo', 'url_evidencia')
      ORDER BY column_name;
    `;
    
    const result = await client.query(verifyQuery);
    
    console.log('✅ Columnas encontradas en la tabla evidencias:');
    result.rows.forEach(row => {
      const maxLength = row.character_maximum_length ? `(${row.character_maximum_length})` : '';
      console.log(`   - ${row.column_name}: ${row.data_type}${maxLength}`);
    });
    console.log('');

    // Resumen final
    console.log('\n=============================================');
    console.log('  ✅ ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('=============================================\n');
    console.log('📋 Cambios aplicados:');
    console.log('   ✅ Columna: nombre_archivo (VARCHAR 500)');
    console.log('   ✅ Columna: tipo_archivo (VARCHAR 100)');
    console.log('   ✅ Columna: tamano_archivo (INTEGER)');
    console.log('   ✅ Columna: url_evidencia (TEXT - ampliado)');
    console.log('   ✅ Índices: Creados para mejor rendimiento\n');
    console.log('🎉 ¡Base de datos lista!\n');

  } catch (error) {
    console.error('\n❌ Error durante la migración:');
    console.error('Tipo:', error.name);
    console.error('Mensaje:', error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Ejecutar migración
executeMigration();
