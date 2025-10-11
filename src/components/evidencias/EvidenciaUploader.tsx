// src/components/evidencias/EvidenciaUploader.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { colors, spacing } from '@/lib/styleUtils';

interface EvidenciaUploaderProps {
  metaId: number;
  onUploadSuccess: (url: string) => void;
  existingUrl?: string | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const EvidenciaUploader: React.FC<EvidenciaUploaderProps> = ({
  metaId,
  onUploadSuccess,
  existingUrl
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Cargar evidencia existente si hay URL
  useEffect(() => {
    if (existingUrl) {
      setPreviewUrl(existingUrl);
    } else {
      // Verificar si existe evidencia para esta meta
      const checkExisting = async () => {
        try {
          const res = await fetch(`/api/usuario/evidencias?meta_id=${metaId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.existe && data.evidencia) {
              setPreviewUrl(`evidencia_${data.evidencia.id}`);
            }
          }
        } catch (error) {
          console.error('Error checking existing evidencia:', error);
        }
      };
      checkExisting();
    }
  }, [existingUrl, metaId]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Archivo muy grande', {
        description: 'El archivo no debe superar 5MB. Considera usar una imagen comprimida.'
      });
      return;
    }

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no permitido', {
        description: 'Solo se permiten imágenes (JPG, PNG, GIF) y archivos PDF.'
      });
      return;
    }

    setUploading(true);

    try {
      // Convertir a Base64
      const base64 = await convertToBase64(file);

      // Enviar al servidor
      const res = await fetch('/api/usuario/evidencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meta_id: metaId,
          archivo: base64,
          nombre_archivo: file.name,
          tipo_archivo: file.type,
          tamano: file.size
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al subir evidencia');
      }

      const data = await res.json();
      
      setPreviewUrl(data.url);
      onUploadSuccess(data.url);

      toast.success('¡Evidencia subida! ✓', {
        description: 'Tu evidencia ha sido guardada correctamente.',
        duration: 4000
      });
    } catch (error) {
      toast.error('Error al subir evidencia', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleView = () => {
    if (previewUrl) {
      // Si es una imagen, mostrar en modal. Si es PDF, abrir en nueva pestaña
      if (previewUrl.startsWith('data:image')) {
        window.open(previewUrl, '_blank');
      } else {
        window.open(previewUrl, '_blank');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
      {previewUrl ? (
        <div style={{ display: 'flex', gap: spacing.xs }}>
          <button
            onClick={handleView}
            style={{
              padding: '6px 12px',
              backgroundColor: colors.success,
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            ✓ Ver evidencia
          </button>
          
          <label style={{ cursor: 'pointer' }}>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <span style={{
              padding: '6px 12px',
              backgroundColor: colors.gray[600],
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.75rem',
              fontWeight: '600',
              display: 'inline-block'
            }}>
              {uploading ? '⏳ Subiendo...' : '🔄 Cambiar'}
            </span>
          </label>
        </div>
      ) : (
        <label style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          <span style={{
            padding: '6px 12px',
            backgroundColor: uploading ? colors.gray[400] : colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'inline-block',
            opacity: uploading ? 0.6 : 1
          }}>
            {uploading ? '⏳ Subiendo...' : '📎 Subir evidencia'}
          </span>
        </label>
      )}

      <div style={{
        fontSize: '0.65rem',
        color: colors.gray[500]
      }}>
        Máx. 5MB • JPG, PNG, PDF
      </div>
    </div>
  );
};
