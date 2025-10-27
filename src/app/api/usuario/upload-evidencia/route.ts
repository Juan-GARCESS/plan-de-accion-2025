// src/app/api/usuario/upload-evidencia/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { uploadFileToS3, generateUniqueFileName, isValidFileType, isValidFileSize } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener datos del FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metaId = formData.get('meta_id') as string;
    const trimestre = formData.get('trimestre') as string;
    const descripcion = formData.get('descripcion') as string;

    console.log('📤 Subiendo archivo:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      metaId,
      trimestre,
      userId
    });

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    if (!isValidFileType(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Tipo de archivo no permitido. Solo PDF, Word, Excel e imágenes.' },
        { status: 400 }
      );
    }

    // Validar tamaño (10MB máximo)
    if (!isValidFileSize(file.size, 10)) {
      return NextResponse.json(
        { success: false, message: 'El archivo es demasiado grande. Máximo 10MB.' },
        { status: 400 }
      );
    }

    // Convertir archivo a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generar nombre único
    const fileName = generateUniqueFileName(file.name, parseInt(userId), parseInt(trimestre));

    // Subir a S3
    const fileUrl = await uploadFileToS3(buffer, fileName, file.type);
    
    console.log('✅ Archivo subido a S3:', fileUrl);

    // Guardar metadata en la base de datos
    const client = await db.connect();
    try {
      // Obtener el año actual
      const anioActual = new Date().getFullYear();
      
      // Verificar si ya existe una evidencia para esta meta (caso de reenvío)
      const checkQuery = `
        SELECT id, estado 
        FROM evidencias 
        WHERE meta_id = $1 AND usuario_id = $2 AND trimestre = $3 AND anio = $4
      `;
      const checkResult = await client.query(checkQuery, [metaId, userId, trimestre, anioActual]);
      
      let result;
      
      if (checkResult.rows.length > 0) {
        // Ya existe - actualizar (caso de reenvío de evidencia rechazada)
        const evidenciaId = checkResult.rows[0].id;
        console.log('🔄 Actualizando evidencia existente:', evidenciaId);
        
        const updateQuery = `
          UPDATE evidencias 
          SET 
            archivo_url = $1,
            archivo_nombre = $2,
            archivo_tipo = $3,
            archivo_tamano = $4,
            descripcion = $5,
            estado = 'pendiente',
            fecha_envio = NOW(),
            fecha_revision = NULL,
            calificacion = NULL,
            comentario_admin = NULL
          WHERE id = $6
          RETURNING id, archivo_url as url, archivo_nombre as fileName
        `;
        
        result = await client.query(updateQuery, [
          fileUrl,
          file.name,
          file.type,
          file.size,
          descripcion || '',
          evidenciaId
        ]);
      } else {
        // No existe - crear nueva
        console.log('➕ Creando nueva evidencia');
        
        const insertQuery = `
          INSERT INTO evidencias (
            meta_id,
            usuario_id,
            trimestre,
            anio,
            archivo_url,
            archivo_nombre,
            archivo_tipo,
            archivo_tamano,
            descripcion,
            estado,
            fecha_envio
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pendiente', NOW())
          RETURNING id, archivo_url as url, archivo_nombre as fileName
        `;

        result = await client.query(insertQuery, [
          metaId,
          userId,
          trimestre,
          anioActual,
          fileUrl,
          file.name,
          file.type,
          file.size,
          descripcion || ''
        ]);
      }

      console.log('✅ Evidencia guardada en BD:', result.rows[0]);

      return NextResponse.json({
        success: true,
        message: checkResult.rows.length > 0 ? 'Evidencia reenviada exitosamente' : 'Archivo subido exitosamente',
        data: {
          id: result.rows[0].id,
          url: result.rows[0].url,
          fileName: result.rows[0].filename
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error al subir archivo:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al subir el archivo',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Configuración para Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};
