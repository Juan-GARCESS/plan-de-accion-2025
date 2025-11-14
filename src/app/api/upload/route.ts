// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIO UPLOAD ===');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    console.log('File:', file ? file.name : 'No file');
    console.log('Type:', type);

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('Buffer size:', buffer.length);

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileName = `${type}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    console.log('fileName:', fileName);

    // Verificar credenciales de AWS
    if (!process.env.AWS_S3_BUCKET_NAME || !process.env.AWS_ACCESS_KEY_ID) {
      console.error('Faltan credenciales de AWS');
      return NextResponse.json(
        { error: 'Configuración de S3 incompleta' },
        { status: 500 }
      );
    }

    // Subir a S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    console.log('Enviando a S3...');
    await s3Client.send(command);
    console.log('Archivo subido a S3 exitosamente');

    // Construir URL pública
    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
    console.log('URL generada:', fileUrl);

    return NextResponse.json({
      url: fileUrl,
      message: 'Archivo subido exitosamente',
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al subir el archivo' },
      { status: 500 }
    );
  }
}
