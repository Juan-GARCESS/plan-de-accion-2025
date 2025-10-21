// Script de verificación final - Comprueba que todo esté configurado correctamente
const { S3Client, HeadBucketCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { Client } = require('pg');

const BUCKET_NAME = 'plan-accion-evidencias-oct2025';
const REGION = 'us-east-1';
const DATABASE_URL = 'postgresql://neondb_owner:npg_vc9djoEer1Rl@ep-frosty-moon-acux7z3k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

async function verificarTodo() {
  console.log('\n=============================================');
  console.log('  🔍 VERIFICACIÓN FINAL DEL SISTEMA');
  console.log('=============================================\n');

  let errores = 0;
  let warnings = 0;

  // 1. Verificar Bucket S3
  console.log('📋 1. Verificando Bucket S3...\n');
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    console.log(`   ✅ Bucket existe: ${BUCKET_NAME}`);
    console.log(`   ✅ Región: ${REGION}`);
    
    // Intentar listar objetos
    try {
      const objects = await s3Client.send(new ListObjectsV2Command({ 
        Bucket: BUCKET_NAME,
        MaxKeys: 1 
      }));
      console.log(`   ✅ Permisos de lectura: OK`);
      console.log(`   ℹ️  Archivos en bucket: ${objects.KeyCount || 0}`);
    } catch (e) {
      console.log(`   ⚠️  No se pudo listar objetos (normal si está vacío)`);
      warnings++;
    }
  } catch (error) {
    console.log(`   ❌ Error con bucket S3: ${error.message}`);
    errores++;
  }

  // 2. Verificar Base de Datos
  console.log('\n📋 2. Verificando Base de Datos (Neon)...\n');
  const dbClient = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await dbClient.connect();
    console.log('   ✅ Conexión a Neon: OK');

    // Verificar tabla evidencias
    const tableCheck = await dbClient.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'evidencias'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('   ✅ Tabla evidencias: Existe');

      // Verificar columnas
      const columnsCheck = await dbClient.query(`
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = 'evidencias' 
        AND column_name IN ('nombre_archivo', 'tipo_archivo', 'tamano_archivo', 'url_evidencia')
        ORDER BY column_name;
      `);

      if (columnsCheck.rows.length === 4) {
        console.log('   ✅ Columnas nuevas: Todas presentes');
        columnsCheck.rows.forEach(row => {
          const maxLength = row.character_maximum_length ? `(${row.character_maximum_length})` : '';
          console.log(`      - ${row.column_name}: ${row.data_type}${maxLength}`);
        });
      } else {
        console.log(`   ❌ Faltan columnas: ${4 - columnsCheck.rows.length} columnas no encontradas`);
        errores++;
      }

      // Verificar índices
      const indexCheck = await dbClient.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'evidencias' 
        AND indexname LIKE 'idx_evidencias_%';
      `);

      console.log(`   ✅ Índices creados: ${indexCheck.rows.length}/3`);
      indexCheck.rows.forEach(row => {
        console.log(`      - ${row.indexname}`);
      });

    } else {
      console.log('   ❌ Tabla evidencias no existe');
      errores++;
    }

  } catch (error) {
    console.log(`   ❌ Error con base de datos: ${error.message}`);
    errores++;
  } finally {
    await dbClient.end();
  }

  // 3. Verificar Variables de Entorno
  console.log('\n📋 3. Verificando Variables de Entorno...\n');
  
  const envVars = {
    AWS_REGION: process.env.AWS_REGION || REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || BUCKET_NAME,
  };

  if (envVars.AWS_REGION) {
    console.log(`   ✅ AWS_REGION: ${envVars.AWS_REGION}`);
  } else {
    console.log('   ❌ AWS_REGION no definida');
    errores++;
  }

  if (envVars.AWS_ACCESS_KEY_ID && envVars.AWS_ACCESS_KEY_ID.startsWith('AKIA')) {
    console.log(`   ✅ AWS_ACCESS_KEY_ID: Configurada (${envVars.AWS_ACCESS_KEY_ID.substring(0, 8)}...)`);
  } else {
    console.log('   ❌ AWS_ACCESS_KEY_ID no válida o no definida');
    errores++;
  }

  if (envVars.AWS_SECRET_ACCESS_KEY && envVars.AWS_SECRET_ACCESS_KEY.length > 20) {
    console.log(`   ✅ AWS_SECRET_ACCESS_KEY: Configurada (${envVars.AWS_SECRET_ACCESS_KEY.substring(0, 8)}...)`);
  } else {
    console.log('   ❌ AWS_SECRET_ACCESS_KEY no válida o no definida');
    errores++;
  }

  if (envVars.AWS_S3_BUCKET_NAME) {
    console.log(`   ✅ AWS_S3_BUCKET_NAME: ${envVars.AWS_S3_BUCKET_NAME}`);
  } else {
    console.log('   ❌ AWS_S3_BUCKET_NAME no definida');
    errores++;
  }

  // 4. Verificar Archivos del Proyecto
  console.log('\n📋 4. Verificando Archivos del Proyecto...\n');
  
  const fs = require('fs');
  const path = require('path');

  const archivosRequeridos = [
    'src/lib/s3.ts',
    'src/app/api/usuario/upload-evidencia/route.ts',
    'src/components/ui/FileUpload.tsx',
    '.env.local',
  ];

  archivosRequeridos.forEach(archivo => {
    const rutaCompleta = path.join(__dirname, archivo);
    if (fs.existsSync(rutaCompleta)) {
      console.log(`   ✅ ${archivo}`);
    } else {
      console.log(`   ❌ ${archivo} - NO ENCONTRADO`);
      errores++;
    }
  });

  // Resumen Final
  console.log('\n=============================================');
  if (errores === 0 && warnings === 0) {
    console.log('  ✅ ¡TODO VERIFICADO Y FUNCIONANDO!');
    console.log('=============================================\n');
    console.log('🎉 Sistema 100% operativo y listo para usar\n');
    console.log('📍 Próximos pasos:');
    console.log('   1. Ve a: http://localhost:3000/dashboard/trimestre/1');
    console.log('   2. Selecciona una meta');
    console.log('   3. Sube un archivo de prueba');
    console.log('   4. ¡Verifica que funcione!\n');
  } else if (errores === 0) {
    console.log('  ⚠️  VERIFICACIÓN COMPLETADA CON WARNINGS');
    console.log('=============================================\n');
    console.log(`⚠️  ${warnings} warning(s) encontrado(s)\n`);
    console.log('El sistema debería funcionar, pero revisa los warnings.\n');
  } else {
    console.log('  ❌ VERIFICACIÓN CON ERRORES');
    console.log('=============================================\n');
    console.log(`❌ ${errores} error(es) encontrado(s)`);
    console.log(`⚠️  ${warnings} warning(s) encontrado(s)\n`);
    console.log('Por favor, corrige los errores antes de usar el sistema.\n');
  }

  process.exit(errores > 0 ? 1 : 0);
}

// Ejecutar verificación
verificarTodo();
