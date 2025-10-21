// src/lib/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configurar cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'plan-accion-evidencias';

/**
 * Subir un archivo a S3
 * @param file - Archivo a subir (Buffer o ReadableStream)
 * @param key - Ruta del archivo en S3 (ej: "evidencias/2025/trimestre-1/archivo.pdf")
 * @param contentType - Tipo MIME del archivo
 * @returns URL del archivo subido
 */
export async function uploadFileToS3(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Retornar la URL del archivo
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

/**
 * Obtener URL temporal (firmada) para descargar un archivo
 * @param key - Ruta del archivo en S3
 * @param expiresIn - Tiempo de expiración en segundos (default: 1 hora)
 * @returns URL temporal firmada
 */
export async function getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Eliminar un archivo de S3
 * @param key - Ruta del archivo en S3
 */
export async function deleteFileFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Generar un nombre de archivo único
 * @param originalName - Nombre original del archivo
 * @param userId - ID del usuario
 * @param trimestre - Número de trimestre
 * @returns Nombre único del archivo
 */
export function generateUniqueFileName(
  originalName: string,
  userId: number,
  trimestre: number
): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return `evidencias/${userId}/trimestre-${trimestre}/${timestamp}_${randomString}_${sanitizedName}`;
}

/**
 * Validar tipo de archivo
 * @param contentType - Tipo MIME del archivo
 * @returns true si el archivo es válido
 */
export function isValidFileType(contentType: string): boolean {
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

  return validTypes.includes(contentType);
}

/**
 * Validar tamaño de archivo
 * @param size - Tamaño del archivo en bytes
 * @param maxSizeMB - Tamaño máximo en MB (default: 10MB)
 * @returns true si el tamaño es válido
 */
export function isValidFileSize(size: number, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
}
