// Script para limpiar archivos de evidencias en AWS S3
// Ejecutar: node limpiar-s3.js

const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');

// Configuración de S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';
const FOLDER_PREFIX = 'evidencias/'; // Carpeta donde están las evidencias

async function limpiarS3() {
  try {
    console.log('🔍 Buscando archivos en S3...');
    console.log(`📦 Bucket: ${BUCKET_NAME}`);
    console.log(`📁 Carpeta: ${FOLDER_PREFIX}`);
    console.log('');

    // Listar todos los archivos en la carpeta
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: FOLDER_PREFIX
    });

    const listaArchivos = await s3Client.send(listCommand);

    if (!listaArchivos.Contents || listaArchivos.Contents.length === 0) {
      console.log('✅ No hay archivos para eliminar');
      return;
    }

    console.log(`📄 Encontrados ${listaArchivos.Contents.length} archivo(s)`);
    console.log('');

    // Mostrar archivos encontrados
    listaArchivos.Contents.forEach((file, index) => {
      const sizeMB = (file.Size / 1024 / 1024).toFixed(2);
      console.log(`${index + 1}. ${file.Key} (${sizeMB} MB)`);
    });

    console.log('');
    console.log('⚠️  ¿Deseas eliminar TODOS estos archivos? (Ctrl+C para cancelar)');
    console.log('   Esperando 5 segundos...');
    console.log('');

    // Esperar 5 segundos antes de eliminar
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Preparar objetos para eliminar
    const objetosAEliminar = listaArchivos.Contents.map(file => ({
      Key: file.Key
    }));

    // Eliminar en lotes de 1000 (límite de AWS)
    const BATCH_SIZE = 1000;
    let eliminados = 0;

    for (let i = 0; i < objetosAEliminar.length; i += BATCH_SIZE) {
      const batch = objetosAEliminar.slice(i, i + BATCH_SIZE);
      
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: batch,
          Quiet: false
        }
      });

      const resultado = await s3Client.send(deleteCommand);
      eliminados += resultado.Deleted?.length || 0;

      console.log(`🗑️  Eliminados ${eliminados}/${objetosAEliminar.length} archivo(s)...`);
    }

    console.log('');
    console.log('✅ Limpieza de S3 completada');
    console.log(`   Total eliminados: ${eliminados} archivo(s)`);

  } catch (error) {
    console.error('❌ Error al limpiar S3:', error.message);
    
    if (error.name === 'NoSuchBucket') {
      console.error('   El bucket no existe o el nombre es incorrecto');
    } else if (error.name === 'AccessDenied') {
      console.error('   No tienes permisos para acceder al bucket');
    } else if (error.name === 'InvalidAccessKeyId') {
      console.error('   Las credenciales de AWS son inválidas');
    }
    
    process.exit(1);
  }
}

// Verificar variables de entorno
function verificarConfig() {
  const errores = [];

  if (!process.env.AWS_ACCESS_KEY_ID) {
    errores.push('AWS_ACCESS_KEY_ID no está configurado');
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    errores.push('AWS_SECRET_ACCESS_KEY no está configurado');
  }
  if (!process.env.AWS_S3_BUCKET_NAME) {
    errores.push('AWS_S3_BUCKET_NAME no está configurado');
  }

  if (errores.length > 0) {
    console.error('❌ Faltan variables de entorno:');
    errores.forEach(err => console.error(`   - ${err}`));
    console.error('');
    console.error('Configúralas en tu archivo .env.local');
    process.exit(1);
  }

  return true;
}

// Ejecutar
console.log('');
console.log('═══════════════════════════════════════════════════');
console.log('  🧹 LIMPIEZA DE ARCHIVOS EN AWS S3');
console.log('═══════════════════════════════════════════════════');
console.log('');

verificarConfig();
limpiarS3();
