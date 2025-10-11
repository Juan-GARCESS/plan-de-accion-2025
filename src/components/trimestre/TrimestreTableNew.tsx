'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface MetaEvidencia {
  id: number;
  meta: string | null;
  indicador: string | null;
  accion: string | null;
  presupuesto: string | null;
  eje_nombre: string;
  sub_eje_nombre: string;
  evidencia_id: number | null;
  evidencia_texto: string | null;
  evidencia_url: string | null;
  estado: string | null;
  observaciones: string | null;
  calificacion: number | null;
  fecha_envio: string | null;
}

interface TrimestreTableProps {
  trimestreId: number;
  areaId: number;
}

export default function TrimestreTable({ trimestreId, areaId }: TrimestreTableProps) {
  const router = useRouter();
  const [metas, setMetas] = useState<MetaEvidencia[]>([]);
  const [valores, setValores] = useState<Record<number, { evidencia_texto: string; evidencia_url: string }>>({});
  const [enviando, setEnviando] = useState<number | null>(null);

  useEffect(() => {
    cargarMetas();
  }, [trimestreId, areaId]);

  const cargarMetas = async () => {
    try {
      const res = await fetch(`/api/usuario/trimestre-metas?trimestre=${trimestreId}&area_id=${areaId}`);
      const data = await res.json();
      
      if (res.ok) {
        setMetas(data.metas || []);
        
        // Pre-cargar valores existentes
        const valoresIniciales: Record<number, { evidencia_texto: string; evidencia_url: string }> = {};
        data.metas?.forEach((meta: MetaEvidencia) => {
          valoresIniciales[meta.id] = {
            evidencia_texto: meta.evidencia_texto || '',
            evidencia_url: meta.evidencia_url || ''
          };
        });
        setValores(valoresIniciales);
      } else {
        toast.error(data.error || 'Error al cargar metas');
      }
    } catch (error) {
      toast.error('Error al cargar metas');
    }
  };

  const handleEnviarEvidencia = async (metaId: number) => {
    const evidencia_texto = valores[metaId]?.evidencia_texto?.trim();
    
    if (!evidencia_texto) {
      toast.error('La descripción de la evidencia es obligatoria');
      return;
    }

    setEnviando(metaId);
    
    try {
      const res = await fetch('/api/usuario/trimestre-metas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_accion_id: metaId,
          trimestre: trimestreId,
          evidencia_texto,
          evidencia_url: valores[metaId]?.evidencia_url || null
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Evidencia enviada correctamente');
        await cargarMetas(); // Recargar para actualizar estado
      } else {
        toast.error(data.error || 'Error al enviar evidencia');
      }
    } catch (error) {
      toast.error('Error al enviar evidencia');
    } finally {
      setEnviando(null);
    }
  };

  if (metas.length === 0) {
    return (
      <div style={{
        background: '#fef3c7',
        border: '1px solid #fbbf24',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#92400e', fontSize: '0.875rem' }}>
          ⚠️ No hay metas asignadas para este trimestre
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Principal */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: 0
        }}>
          📋 Metas y Evidencias - Trimestre {trimestreId}
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
          Envía tus evidencias para cada meta. El administrador las revisará y calificará.
        </p>
      </div>
      
      {metas.map((meta) => (
        <div key={meta.id} style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {/* Header de la meta */}
          <div style={{
            background: 'linear-gradient(to right, #eff6ff, #e0e7ff)',
            padding: '16px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px', margin: 0 }}>Eje</p>
                <p style={{ fontWeight: '600', color: '#1f2937', margin: 0 }}>{meta.eje_nombre}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px', margin: 0 }}>Sub-Eje</p>
                <p style={{ fontWeight: '600', color: '#1f2937', margin: 0 }}>{meta.sub_eje_nombre}</p>
              </div>
            </div>
          </div>

          {/* Contenido de la meta */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Meta e Indicador */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px', margin: 0 }}>Meta</p>
                <p style={{ fontSize: '0.875rem', color: '#1f2937', margin: 0 }}>{meta.meta || 'Sin meta definida'}</p>
              </div>
              {meta.indicador && (
                <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px', margin: 0 }}>Indicador</p>
                  <p style={{ fontSize: '0.875rem', color: '#1f2937', margin: 0 }}>{meta.indicador}</p>
                </div>
              )}
              <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px', margin: 0 }}>Acción a Realizar</p>
                <p style={{ fontSize: '0.875rem', color: '#1f2937', margin: 0 }}>{meta.accion || 'Sin acción definida'}</p>
              </div>
            </div>

            {/* Estado y Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Estado:</span>
              <span style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: meta.estado === 'aprobado' ? '#dcfce7' : meta.estado === 'rechazado' ? '#fee2e2' : '#fef3c7',
                color: meta.estado === 'aprobado' ? '#166534' : meta.estado === 'rechazado' ? '#991b1b' : '#92400e'
              }}>
                {meta.estado === 'aprobado' ? '✅ Aprobado' : meta.estado === 'rechazado' ? '❌ Rechazado' : '⏳ Pendiente'}
              </span>
            </div>

            {/* Observaciones si fue rechazado */}
            {meta.estado === 'rechazado' && meta.observaciones && (
              <div style={{
                background: '#fffbeb',
                borderLeft: '4px solid #f59e0b',
                padding: '12px',
                borderRadius: '6px'
              }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#92400e', marginBottom: '4px', margin: 0 }}>⚠️ Observaciones del Administrador:</p>
                <p style={{ fontSize: '0.875rem', color: '#78350f', margin: 0 }}>{meta.observaciones}</p>
              </div>
            )}

            {/* Formulario de evidencia (solo si no está aprobado) */}
            {meta.estado !== 'aprobado' && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    📝 Evidencia (Descripción) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <textarea
                    value={valores[meta.id]?.evidencia_texto || ''}
                    onChange={(e) => setValores(prev => ({
                      ...prev,
                      [meta.id]: { ...prev[meta.id], evidencia_texto: e.target.value }
                    }))}
                    placeholder="Describe detalladamente lo que hiciste para cumplir esta meta..."
                    style={{
                      width: '100%',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '12px',
                      minHeight: '100px',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    🔗 URL de Evidencia (opcional)
                  </label>
                  <input
                    type="text"
                    value={valores[meta.id]?.evidencia_url || ''}
                    onChange={(e) => setValores(prev => ({
                      ...prev,
                      [meta.id]: { ...prev[meta.id], evidencia_url: e.target.value }
                    }))}
                    placeholder="https://drive.google.com/"
                    style={{
                      width: '100%',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px', margin: '4px 0 0 0' }}>
                    💡 Puedes compartir enlaces de Google Drive, Dropbox, etc.
                  </p>
                </div>

                <button
                  onClick={() => handleEnviarEvidencia(meta.id)}
                  disabled={enviando === meta.id}
                  style={{
                    width: '100%',
                    background: enviando === meta.id ? '#9ca3af' : '#2563eb',
                    color: '#fff',
                    fontWeight: '600',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: enviando === meta.id ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (enviando !== meta.id) e.currentTarget.style.background = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    if (enviando !== meta.id) e.currentTarget.style.background = '#2563eb';
                  }}
                >
                  {enviando === meta.id ? (
                    <>⏳ <span>Enviando...</span></>
                  ) : (
                    <>📤 <span>Enviar Evidencia</span></>
                  )}
                </button>
              </div>
            )}

            {/* Si ya fue aprobado, mostrar evidencia en modo lectura */}
            {meta.estado === 'aprobado' && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#166534', marginBottom: '8px', margin: 0 }}>
                  ✅ Evidencia Aprobada
                </p>
                <div style={{ marginBottom: '8px' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', marginBottom: '4px', margin: 0 }}>Descripción:</p>
                  <p style={{ fontSize: '0.875rem', color: '#1f2937', margin: 0 }}>{meta.evidencia_texto}</p>
                </div>
                {meta.evidencia_url && (
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', marginBottom: '4px', margin: 0 }}>URL:</p>
                    <a 
                      href={meta.evidencia_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.875rem', color: '#2563eb', textDecoration: 'underline' }}
                    >
                      {meta.evidencia_url}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
