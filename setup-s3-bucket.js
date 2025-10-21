// Script para crear y configurar el bucket S3 automáticamente
const { S3Client, CreateBucketCommand, PutBucketCorsCommand, PutPublicAccessBlockCommand, PutBucketPolicyCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');

const BUCKET_NAME = 'plan-accion-evidencias-oct2025';
const REGION = 'us-east-1';

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

async function setupS3Bucket() {
  console.log('\n=============================================');
  console.log('  🪣 CONFIGURANDO BUCKET S3 AUTOMÁTICAMENTE');
  console.log('=============================================\n');

  try {
    // 1. Verificar si el bucket ya existe
    console.log('📋 Paso 1: Verificando si el bucket existe...');
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
      console.log('✅ El bucket ya existe!\n');
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        console.log('📦 El bucket no existe, creándolo...');
        
        // 2. Crear el bucket
        try {
          await s3Client.send(new CreateBucketCommand({
            Bucket: BUCKET_NAME,
          }));
          console.log('✅ Bucket creado exitosamente!\n');
        } catch (createError) {
          if (createError.name === 'BucketAlreadyOwnedByYou') {
            console.log('✅ El bucket ya existe y es tuyo!\n');
          } else {
            throw createError;
          }
        }
      } else {
        throw error;
      }
    }

    // 3. Configurar acceso público
    console.log('📋 Paso 2: Configurando acceso público...');
    await s3Client.send(new PutPublicAccessBlockCommand({
      Bucket: BUCKET_NAME,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false,
      },
    }));
    console.log('✅ Acceso público configurado!\n');

    // Esperar un poco para que AWS procese el cambio
    console.log('⏳ Esperando 3 segundos para que AWS procese...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. Agregar política de bucket
    console.log('📋 Paso 3: Aplicando política de bucket...');
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${BUCKET_NAME}/*`,
        },
      ],
    };

    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy),
    }));
    console.log('✅ Política de bucket aplicada!\n');

    // 5. Configurar CORS
    console.log('📋 Paso 4: Configurando CORS...');
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: [
            'http://localhost:3000',
            'http://192.168.1.48:3000',
            'https://*.vercel.app',
          ],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3000,
        },
      ],
    };

    await s3Client.send(new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsConfiguration,
    }));
    console.log('✅ CORS configurado!\n');

    // Resumen final
    console.log('\n=============================================');
    console.log('  ✅ ¡BUCKET CONFIGURADO EXITOSAMENTE!');
    console.log('=============================================\n');
    console.log(`📦 Bucket: ${BUCKET_NAME}`);
    console.log(`🌎 Región: ${REGION}`);
    console.log(`🔗 URL: https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/\n`);
    console.log('✅ Acceso público: ACTIVADO');
    console.log('✅ Política de bucket: APLICADA');
    console.log('✅ CORS: CONFIGURADO\n');
    console.log('🎉 ¡Todo listo! Ahora puedes:');
    console.log('   1. Ejecutar el SQL en Neon: database/EJECUTAR_EN_NEON_ARCHIVOS.sql');
    console.log('   2. Reiniciar el servidor: npm run dev');
    console.log('   3. Probar subiendo un archivo en /dashboard/trimestre/1\n');

  } catch (error) {
    console.error('\n❌ Error durante la configuración:');
    console.error('Tipo:', error.name);
    console.error('Mensaje:', error.message);
    
    if (error.$metadata) {
      console.error('HTTP Status:', error.$metadata.httpStatusCode);
    }
    
    console.error('\nDetalles completos:', error);
    process.exit(1);
  }
}

// Ejecutar el script
setupS3Bucket();
