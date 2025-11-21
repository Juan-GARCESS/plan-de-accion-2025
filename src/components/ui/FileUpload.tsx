// src/components/ui/FileUpload.tsx
'use client';

import React, { useState, useRef } from 'react';
import { colors, spacing, borderRadius } from '@/lib/styleUtils';
import { FileText, Sheet, ImageIcon, Paperclip, Upload, X, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
  currentFile?: File | null;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  acceptedTypes = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png',
  maxSizeMB = 10,
  currentFile = null,
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): string | null => {
    // Validar tamaño
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `El archivo es demasiado grande. Máximo ${maxSizeMB}MB.`;
    }

    // Validar tipo
    const allowedTypes = acceptedTypes.split(',').map(t => t.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return 'Tipo de archivo no permitido.';
    }

    return null;
  };

  const handleFile = (file: File) => {
    setError('');
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <FileText size={20} />;
      case 'doc':
      case 'docx': return <FileText size={20} />;
      case 'xls':
      case 'xlsx': return <Sheet size={20} />;
      case 'jpg':
      case 'jpeg':
      case 'png': return <ImageIcon size={20} />;
      default: return <Paperclip size={20} />;
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />

      {!currentFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
          style={{
            border: `2px dashed ${dragActive ? colors.primary : colors.gray[300]}`,
            borderRadius: borderRadius.lg,
            padding: spacing.xl,
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundColor: dragActive ? colors.gray[50] : 'white',
            transition: 'all 0.3s ease',
            opacity: disabled ? 0.6 : 1
          }}
        >
          <div style={{
            marginBottom: spacing.md,
            color: colors.gray[400]
          }}>
            <Upload size={48} />
          </div>
          <p style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: colors.gray[700],
            marginBottom: spacing.xs
          }}>
            {dragActive ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic para seleccionar'}
          </p>
          <p style={{
            fontSize: '0.875rem',
            color: colors.gray[500],
            margin: 0
          }}>
            PDF, Word, Excel o Imágenes (Máx. {maxSizeMB}MB)
          </p>
        </div>
      ) : (
        <div style={{
          border: `1px solid ${colors.gray[300]}`,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          backgroundColor: colors.gray[50]
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.md
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.md,
              flex: 1,
              minWidth: 0
            }}>
              <span style={{ fontSize: '2rem' }}>
                {getFileIcon(currentFile.name)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: colors.gray[700],
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {currentFile.name}
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  color: colors.gray[500],
                  margin: 0
                }}>
                  {formatFileSize(currentFile.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileRemove();
                setError('');
              }}
              disabled={disabled}
              style={{
                padding: `${spacing.xs} ${spacing.sm}`,
                backgroundColor: colors.gray[200],
                border: 'none',
                borderRadius: borderRadius.md,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: colors.gray[700],
                transition: 'background-color 0.2s ease',
                opacity: disabled ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.backgroundColor = colors.gray[300];
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.backgroundColor = colors.gray[200];
                }
              }}
            >
              <X size={16} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
              Quitar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: spacing.sm,
          padding: spacing.sm,
          backgroundColor: '#fef2f2',
          borderRadius: borderRadius.md,
          border: '1px solid #fecaca',
          color: '#dc2626',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};
