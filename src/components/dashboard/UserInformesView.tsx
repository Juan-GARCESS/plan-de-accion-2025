// src/components/dashboard/UserInformesView.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface Informe {
  id: number;
  trimestre: number;
  año: number;
  meta_trimestral: string;
  archivo: string | null;
  estado: string;
  comentario_admin: string | null;
  calificacion: number | null;
  fecha_meta_creada: string | null;
  fecha_archivo_subido: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  abierto: boolean;
}

interface UserInformesViewProps {
  userId: number;
}

export const UserInformesView: React.FC<UserInformesViewProps> = ({ userId }) => {
  const [informes, setInformes] = useState<Informe[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingTrimestre, setUploadingTrimestre] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInformes();
  }, [userId]);

  const fetchInformes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/usuario/informes');
      if (response.ok) {
        const data = await response.json();
        setInformes(data.informes || []);
      } else {
        throw new Error('Error al cargar informes');
      }
    } catch (error) {
      console.error('Error fetching informes:', error);
      setError('Error al cargar informes');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (trimestre: number, file: File) => {
    try {
      setUploadingTrimestre(trimestre);
      setError(null);

      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('trimestre', trimestre.toString());
      formData.append('año', new Date().getFullYear().toString());

      const response = await fetch('/api/usuario/informes', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchInformes(); // Recargar datos
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir archivo');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'Error al subir archivo');
    } finally {
      setUploadingTrimestre(null);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'esperando_meta': return '#ffc107';
      case 'meta_asignada': return '#17a2b8';
      case 'pendiente': return '#fd7e14';
      case 'aceptado': return '#28a745';
      case 'rechazado': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'esperando_meta': return 'Esperando meta';
      case 'meta_asignada': return 'Meta asignada';
      case 'pendiente': return 'Informe pendiente';
      case 'aceptado': return 'Aprobado';
      case 'rechazado': return 'Rechazado';
      default: return estado;
    }
  };

  const isUploadDisabled = (informe: Informe) => {
    const now = new Date();
    const fechaFin = new Date(informe.fecha_fin);
    return !informe.meta_trimestral || informe.estado === 'aceptado' || now > fechaFin;
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        Cargando informes...
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>📊 Mis Informes Trimestrales</h2>
        <p style={subtitleStyle}>
          Metas asignadas y estado de informes
        </p>
      </div>

      {error && (
        <div style={errorStyle}>
          ❌ {error}
        </div>
      )}

      {informes.length === 0 ? (
        <div style={emptyStateStyle}>
          <p>No hay informes asignados aún.</p>
          <p>Marca tu participación en trimestres para que el administrador pueda asignarte metas.</p>
        </div>
      ) : (
        <div style={informesContainerStyle}>
          {informes.map(informe => (
            <div key={informe.id} style={informeCardStyle}>
              <div style={cardHeaderStyle}>
                <h3 style={trimestreStyle}>
                  🗓️ Trimestre {informe.trimestre} - {informe.año}
                </h3>
                <div 
                  style={{ 
                    ...estadoBadgeStyle, 
                    backgroundColor: getEstadoColor(informe.estado) 
                  }}
                >
                  {getEstadoTexto(informe.estado)}
                </div>
              </div>

              <div style={cardContentStyle}>
                {/* Meta */}
                <div style={sectionStyle}>
                  <h4 style={sectionTitleStyle}>🎯 Meta Asignada:</h4>
                  {informe.meta_trimestral ? (
                    <p style={metaTextStyle}>{informe.meta_trimestral}</p>
                  ) : (
                    <p style={noMetaStyle}>No hay meta asignada aún</p>
                  )}
                  {informe.fecha_meta_creada && (
                    <p style={dateStyle}>
                      📅 Asignada: {new Date(informe.fecha_meta_creada).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Subida de archivo */}
                {informe.meta_trimestral && (
                  <div style={sectionStyle}>
                    <h4 style={sectionTitleStyle}>📎 Informe:</h4>
                    {informe.archivo ? (
                      <div style={fileInfoStyle}>
                        <p style={fileNameStyle}>
                          ✅ Archivo subido: {informe.archivo}
                        </p>
                        {informe.fecha_archivo_subido && (
                          <p style={dateStyle}>
                            📅 Subido: {new Date(informe.fecha_archivo_subido).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div style={uploadSectionStyle}>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(informe.trimestre, file);
                            }
                          }}
                          disabled={isUploadDisabled(informe) || uploadingTrimestre === informe.trimestre}
                          style={fileInputStyle}
                        />
                        {uploadingTrimestre === informe.trimestre && (
                          <p style={uploadingStyle}>📤 Subiendo archivo...</p>
                        )}
                        {isUploadDisabled(informe) && (
                          <p style={disabledStyle}>
                            {!informe.meta_trimestral ? 'Esperando meta' : 
                             informe.estado === 'aceptado' ? 'Informe ya aprobado' : 
                             'Periodo cerrado'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Calificación y comentarios */}
                {(informe.calificacion || informe.comentario_admin) && (
                  <div style={sectionStyle}>
                    <h4 style={sectionTitleStyle}>📝 Evaluación:</h4>
                    {informe.calificacion && (
                      <p style={calificacionStyle}>
                        ⭐ Calificación: {informe.calificacion}/100
                      </p>
                    )}
                    {informe.comentario_admin && (
                      <div style={comentarioStyle}>
                        <strong>Comentarios del administrador:</strong>
                        <p>{informe.comentario_admin}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Fechas del trimestre */}
                <div style={periodInfoStyle}>
                  <small style={periodTextStyle}>
                    📅 Periodo: {new Date(informe.fecha_inicio).toLocaleDateString()} - {new Date(informe.fecha_fin).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Estilos
const containerStyle: React.CSSProperties = {
  padding: '24px',
  maxWidth: '1200px',
  margin: '0 auto'
};

const headerStyle: React.CSSProperties = {
  marginBottom: '32px',
  borderBottom: '2px solid #e9ecef',
  paddingBottom: '16px'
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 8px 0',
  fontSize: '28px',
  fontWeight: '600',
  color: '#343a40'
};

const subtitleStyle: React.CSSProperties = {
  margin: '0',
  fontSize: '16px',
  color: '#6c757d'
};

const loadingStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '48px',
  fontSize: '18px',
  color: '#6c757d'
};

const errorStyle: React.CSSProperties = {
  backgroundColor: '#f8d7da',
  color: '#721c24',
  padding: '12px 16px',
  borderRadius: '6px',
  marginBottom: '24px',
  border: '1px solid #f5c6cb'
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '48px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #e9ecef',
  color: '#6c757d'
};

const informesContainerStyle: React.CSSProperties = {
  display: 'grid',
  gap: '24px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))'
};

const informeCardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e9ecef',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const cardHeaderStyle: React.CSSProperties = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderBottom: '1px solid #e9ecef',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const trimestreStyle: React.CSSProperties = {
  margin: '0',
  fontSize: '20px',
  fontWeight: '600',
  color: '#343a40'
};

const estadoBadgeStyle: React.CSSProperties = {
  color: 'white',
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase'
};

const cardContentStyle: React.CSSProperties = {
  padding: '24px'
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '24px'
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 12px 0',
  fontSize: '16px',
  fontWeight: '600',
  color: '#495057'
};

const metaTextStyle: React.CSSProperties = {
  margin: '0 0 8px 0',
  padding: '12px',
  backgroundColor: '#e3f2fd',
  borderRadius: '6px',
  border: '1px solid #bbdefb',
  lineHeight: '1.5'
};

const noMetaStyle: React.CSSProperties = {
  margin: '0',
  fontStyle: 'italic',
  color: '#6c757d'
};

const dateStyle: React.CSSProperties = {
  margin: '0',
  fontSize: '12px',
  color: '#6c757d'
};

const uploadSectionStyle: React.CSSProperties = {
  marginTop: '12px'
};

const fileInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  border: '2px dashed #007bff',
  borderRadius: '6px',
  backgroundColor: '#f8f9fa'
};

const uploadingStyle: React.CSSProperties = {
  margin: '8px 0 0 0',
  color: '#007bff',
  fontSize: '14px'
};

const disabledStyle: React.CSSProperties = {
  margin: '8px 0 0 0',
  color: '#6c757d',
  fontSize: '12px',
  fontStyle: 'italic'
};

const fileInfoStyle: React.CSSProperties = {
  backgroundColor: '#d4edda',
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid #c3e6cb'
};

const fileNameStyle: React.CSSProperties = {
  margin: '0 0 8px 0',
  fontWeight: '500',
  color: '#155724'
};

const calificacionStyle: React.CSSProperties = {
  margin: '0 0 12px 0',
  fontSize: '16px',
  fontWeight: '600',
  color: '#007bff'
};

const comentarioStyle: React.CSSProperties = {
  backgroundColor: '#fff3cd',
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid #ffeaa7'
};

const periodInfoStyle: React.CSSProperties = {
  borderTop: '1px solid #e9ecef',
  paddingTop: '16px',
  marginTop: '24px'
};

const periodTextStyle: React.CSSProperties = {
  color: '#6c757d'
};