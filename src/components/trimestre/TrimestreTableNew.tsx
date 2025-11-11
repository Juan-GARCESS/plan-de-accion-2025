// NUEVO SISTEMA: UN SOLO ENVÍO POR TRIMESTRE CON TODAS LAS METAS
'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { FileUpload } from '@/components/ui/FileUpload';
import { CheckCircle2, XCircle, Clock, AlertCircle, Send, Loader2, FileText, Package } from 'lucide-react';

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
  envio_id: number | null;
}

interface TrimestreTableProps {
  trimestreId: number;
  areaId: number;
}

export default function TrimestreTable({ trimestreId, areaId }: TrimestreTableProps) {
  const [metas, setMetas] = useState<MetaEvidencia[]>([]);
  const [valores, setValores] = useState<Record<number, { evidencia_texto: string; evidencia_url: string }>>({});
  const [archivos, setArchivos] = useState<Record<number, File | null>>({});
  const [enviando, setEnviando] = useState(false);
  const [yaEnviado, setYaEnviado] = useState(false);
  const [reenviando, setReenviando] = useState<number | null>(null);

  const cargarMetas = useCallback(async () => {
    try {
      const res = await fetch(`/api/usuario/trimestre-metas?trimestre=${trimestreId}&area_id=${areaId}`);
      const data = await res.json();
      
      if (res.ok) {
        setMetas(data.metas || []);
        
        // Verificar si ya hay un envío
        const tieneEnvio = data.metas?.some((meta: MetaEvidencia) => meta.envio_id !== null);
        setYaEnviado(tieneEnvio);
        
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
    } catch {
      toast.error('Error al cargar metas');
    }
  }, [trimestreId, areaId]);

  useEffect(() => {
    cargarMetas();
  }, [cargarMetas]);

  const handleReenviarMeta = async (metaId: number) => {
    const meta = metas.find(m => m.id === metaId);
    if (!meta) return;

    const evidencia_texto = valores[metaId]?.evidencia_texto?.trim();
    const archivo = archivos[metaId];

    if (!evidencia_texto || !archivo) {
      toast.error('Debes completar la descripcion y subir un archivo');
      return;
    }

    setReenviando(metaId);

    try {
      // Subir archivo
      const formData = new FormData();
      formData.append('file', archivo);
      formData.append('meta_id', metaId.toString());
      formData.append('trimestre', trimestreId.toString());
      formData.append('descripcion', evidencia_texto);

      const uploadRes = await fetch('/api/usuario/upload-evidencia', {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        toast.error(uploadData.message || 'Error al subir archivo');
        setReenviando(null);
        return;
      }

      toast.success('Meta reenviada correctamente');
      
      // Limpiar y recargar
      setArchivos(prev => ({ ...prev, [metaId]: null }));
      await cargarMetas();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al reenviar meta');
    } finally {
      setReenviando(null);
    }
  };

  const handleEnviarTodasLasMetas = async () => {
    // Validar que TODAS las metas tengan descripción y archivo
    const metasIncompletas = metas.filter(meta => {
      const texto = valores[meta.id]?.evidencia_texto?.trim();
      const tieneArchivo = valores[meta.id]?.evidencia_url || archivos[meta.id];
      return !texto || !tieneArchivo;
    });

    if (metasIncompletas.length > 0) {
      toast.error(`Debes completar TODAS las metas (${metasIncompletas.length} pendiente(s))`);
      return;
    }

    setEnviando(true);
    
    try {
      // Las evidencias ya fueron creadas/actualizadas al subir archivos
      // Solo enviamos los meta_ids para vincularlas con el envío
      const metasParaEnviar = metas.map(meta => ({
        meta_id: meta.id,
        descripcion: valores[meta.id]?.evidencia_texto?.trim() || '',
        archivo_url: valores[meta.id]?.evidencia_url || 'pendiente'
      }));

      // Enviar todas las metas
      const envioRes = await fetch('/api/usuario/enviar-trimestre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trimestre: trimestreId,
          area_id: areaId,
          metas: metasParaEnviar
        })
      });

      const envioData = await envioRes.json();

      if (!envioRes.ok) {
        toast.error(envioData.error || 'Error al enviar evidencias');
        setEnviando(false);
        return;
      }

      toast.success(envioData.mensaje || 'Envio completado exitosamente');
      
      // Limpiar archivos y recargar
      setArchivos({});
      await cargarMetas();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al enviar evidencias');
    } finally {
      setEnviando(false);
    }
  };

  if (metas.length === 0) {
    return (
      <div style={{ background: '#FEF3C7', border: '1px solid #FBBF24', borderRadius: '8px', padding: '16px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <AlertCircle style={{ width: '18px', height: '18px', color: '#92400E' }} />
        <p style={{ color: '#92400E', fontSize: '14px', margin: 0 }}>No hay metas asignadas para este trimestre</p>
      </div>
    );
  }

  // Estadísticas
  const metasCompletas = metas.filter(m => {
    if (yaEnviado) return true; // Si ya se envió, contar todo
    const texto = valores[m.id]?.evidencia_texto?.trim();
    const tieneArchivo = valores[m.id]?.evidencia_url || archivos[m.id];
    return texto && tieneArchivo;
  }).length;

  const todasCompletadas = metasCompletas === metas.length;

  return (
    <div>
      {/* Banner de estado del envío */}
      {!yaEnviado && (
        <div style={{ 
          background: '#fff', 
          border: '1px solid #E5E7EB', 
          borderRadius: '8px', 
          padding: '16px', 
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Package style={{ width: '20px', height: '20px', color: '#6B7280', flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: 0, color: '#111827', fontSize: '15px', fontWeight: '600' }}>
                Trabajando en el Trimestre {trimestreId}
              </h4>
              <p style={{ margin: 0, marginTop: '4px', color: '#6B7280', fontSize: '13px' }}>
                Completa todas las metas (descripción + archivo), luego haz click en &quot;Enviar&quot;. Solo puedes enviar una vez.
              </p>
            </div>
          </div>
          
          {/* Barra de Progreso */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>
                Progreso de completado
              </span>
              <span style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>
                {metasCompletas} / {metas.length}
              </span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '6px', 
              background: '#F3F4F6', 
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${(metasCompletas / metas.length) * 100}%`, 
                height: '100%', 
                background: todasCompletadas ? '#10B981' : '#3B82F6',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Botón de Envío */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleEnviarTodasLasMetas}
              disabled={!todasCompletadas || enviando}
              style={{
                background: !todasCompletadas || enviando ? '#D1D5DB' : '#3B82F6',
                color: !todasCompletadas || enviando ? '#9CA3AF' : '#fff',
                fontWeight: '600',
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                cursor: !todasCompletadas || enviando ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                if (todasCompletadas && !enviando) {
                  e.currentTarget.style.background = '#2563EB';
                }
              }}
              onMouseOut={(e) => {
                if (todasCompletadas && !enviando) {
                  e.currentTarget.style.background = '#3B82F6';
                }
              }}
            >
              {enviando ? (
                <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Enviando...</>
              ) : (
                <><Send style={{ width: '16px', height: '16px' }} /> Enviar Trimestre {trimestreId}</>
              )}
            </button>
          </div>
        </div>
      )}
      
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#6B7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Eje / Sub-Eje</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#6B7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '150px' }}>Meta</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#6B7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '120px' }}>Acción</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#6B7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Estado</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#6B7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '200px' }}>Descripción</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#6B7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '180px' }}>Archivo</th>
              </tr>
            </thead>
            <tbody>
              {metas.map((meta, index) => {
                const bgColor = meta.estado === 'aprobado' ? '#F0FDF4' : meta.estado === 'rechazado' ? '#FEF2F2' : '#fff';
                const textoCompleto = valores[meta.id]?.evidencia_texto?.trim();
                const archivoSeleccionado = archivos[meta.id];
                const estaCompleta = (yaEnviado || (textoCompleto && archivoSeleccionado));
                
                return (
                  <tr key={meta.id} style={{ borderBottom: index < metas.length - 1 ? '1px solid #F3F4F6' : 'none', background: bgColor }}>
                    <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: '600', color: '#111827', fontSize: '12px', marginBottom: '2px' }}>{meta.eje_nombre}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{meta.sub_eje_nombre}</div>
                    </td>
                    <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                      <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.4' }}>{meta.meta || '-'}</div>
                      {meta.indicador && <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', fontStyle: 'italic' }}>Indicador: {meta.indicador}</div>}
                    </td>
                    <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                      <div style={{ fontSize: '12px', color: '#374151' }}>{meta.accion || '-'}</div>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', verticalAlign: 'top' }}>
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '11px', 
                        fontWeight: '600', 
                        background: yaEnviado ? (meta.estado === 'aprobado' ? '#DCFCE7' : meta.estado === 'rechazado' ? '#FEE2E2' : '#FEF3C7') : (estaCompleta ? '#DCFCE7' : '#FEE2E2'),
                        color: yaEnviado ? (meta.estado === 'aprobado' ? '#166534' : meta.estado === 'rechazado' ? '#991B1B' : '#92400E') : (estaCompleta ? '#166534' : '#991B1B'),
                        whiteSpace: 'nowrap'
                      }}>
                        {yaEnviado ? (
                          <>
                            {meta.estado === 'aprobado' && <><CheckCircle2 style={{ width: '12px', height: '12px' }} /> Aprobado</>}
                            {meta.estado === 'rechazado' && <><XCircle style={{ width: '12px', height: '12px' }} /> Rechazado</>}
                            {(!meta.estado || meta.estado === 'pendiente') && <><Clock style={{ width: '12px', height: '12px' }} /> En revisión</>}
                          </>
                        ) : (
                          <>
                            {estaCompleta ? (
                              <><CheckCircle2 style={{ width: '12px', height: '12px' }} /> Completa</>
                            ) : (
                              <><AlertCircle style={{ width: '12px', height: '12px' }} /> Pendiente</>
                            )}
                          </>
                        )}
                      </div>
                      {meta.estado === 'rechazado' && meta.observaciones && (
                        <div style={{ marginTop: '6px', padding: '6px', background: '#FFFBEB', borderRadius: '4px', fontSize: '10px', color: '#92400E', textAlign: 'left', border: '1px solid #FEF3C7' }}>
                          <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                            Observaciones:
                          </div>
                          {meta.observaciones}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                      {yaEnviado && meta.estado !== 'rechazado' ? (
                        <div style={{ fontSize: '12px', color: meta.estado === 'aprobado' ? '#166534' : '#6B7280' }}>
                          {meta.evidencia_texto}
                        </div>
                      ) : (
                        <textarea
                          value={valores[meta.id]?.evidencia_texto || ''}
                          onChange={(e) => setValores(prev => ({ ...prev, [meta.id]: { ...prev[meta.id], evidencia_texto: e.target.value } }))}
                          placeholder={meta.estado === 'rechazado' ? "Corrige la descripcion..." : "Describe la evidencia..."}
                          disabled={enviando}
                          style={{ 
                            width: '100%', 
                            border: meta.estado === 'rechazado' ? '2px solid #FCA5A5' : '1px solid #D1D5DB', 
                            borderRadius: '4px', 
                            padding: '6px 8px', 
                            fontSize: '11px', 
                            fontFamily: 'inherit', 
                            resize: 'vertical', 
                            minHeight: '50px', 
                            outline: 'none', 
                            boxSizing: 'border-box',
                            background: meta.estado === 'rechazado' ? '#FEF2F2' : '#fff'
                          }}
                        />
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                      {yaEnviado && meta.estado !== 'rechazado' ? (
                        meta.evidencia_url ? (
                          <a 
                            href={meta.evidencia_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px', 
                              fontSize: '11px', 
                              color: meta.estado === 'aprobado' ? '#166534' : '#6B7280', 
                              textDecoration: 'underline', 
                              fontWeight: '500' 
                            }}
                          >
                            <FileText style={{ width: '12px', height: '12px' }} /> Ver archivo
                          </a>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#6B7280' }}>-</span>
                        )
                      ) : (
                        <div style={{ minWidth: '160px' }}>
                          <FileUpload
                            currentFile={archivos[meta.id] || null}
                            onFileSelect={(file) => setArchivos(prev => ({ ...prev, [meta.id]: file }))}
                            onFileRemove={() => setArchivos(prev => ({ ...prev, [meta.id]: null }))}
                            acceptedTypes=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                            maxSizeMB={10}
                            disabled={enviando || reenviando === meta.id}
                          />
                          {meta.estado === 'rechazado' && (
                            <button
                              onClick={() => handleReenviarMeta(meta.id)}
                              disabled={reenviando === meta.id}
                              style={{
                                marginTop: '8px',
                                width: '100%',
                                background: reenviando === meta.id ? '#9CA3AF' : '#DC2626',
                                color: '#fff',
                                fontWeight: '600',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: reenviando === meta.id ? 'not-allowed' : 'pointer',
                                fontSize: '11px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                              }}
                            >
                              {reenviando === meta.id ? (
                                <><Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} /> Reenviando...</>
                              ) : (
                                <><Send style={{ width: '12px', height: '12px' }} /> Reenviar Meta</>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ 
          padding: '10px 12px', 
          borderTop: '1px solid #E5E7EB', 
          background: '#F9FAFB', 
          fontSize: '11px', 
          color: '#6B7280', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <span>Total de metas: {metas.length}</span>
          {!yaEnviado && (
            <span>Completas: {metasCompletas}/{metas.length}</span>
          )}
        </div>
      </div>
    </div>
  );
}
