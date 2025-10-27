'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { FileUpload } from '@/components/ui/FileUpload';
import { CheckCircle2, XCircle, Clock, AlertCircle, Send, Loader2, Filter, FileText } from 'lucide-react';

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

type FiltroEstado = 'asignados' | 'pendiente' | 'rechazado' | 'aprobado';

export default function TrimestreTable({ trimestreId, areaId }: TrimestreTableProps) {
  const [metas, setMetas] = useState<MetaEvidencia[]>([]);
  const [valores, setValores] = useState<Record<number, { evidencia_texto: string; evidencia_url: string }>>({});
  const [archivos, setArchivos] = useState<Record<number, File | null>>({});
  const [enviando, setEnviando] = useState<number | null>(null);
  const [filtro, setFiltro] = useState<FiltroEstado>('asignados');

  const cargarMetas = useCallback(async () => {
    try {
      const res = await fetch(`/api/usuario/trimestre-metas?trimestre=${trimestreId}&area_id=${areaId}`);
      const data = await res.json();
      
      if (res.ok) {
        setMetas(data.metas || []);
        
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

  const handleEnviarEvidencia = async (metaId: number) => {
    const evidencia_texto = valores[metaId]?.evidencia_texto?.trim();
    const archivo = archivos[metaId];
    
    if (!evidencia_texto) {
      toast.error('La descripción de la evidencia es obligatoria');
      return;
    }

    if (!archivo) {
      toast.error('Debes seleccionar un archivo');
      return;
    }

    setEnviando(metaId);
    
    try {
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
        setEnviando(null);
        return;
      }

      toast.success('Evidencia enviada correctamente');
      
      setArchivos(prev => ({ ...prev, [metaId]: null }));
      setValores(prev => ({ ...prev, [metaId]: { evidencia_texto: '', evidencia_url: '' } }));
      
      await cargarMetas();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al enviar evidencia');
    } finally {
      setEnviando(null);
    }
  };

  const metasFiltradas = metas.filter(meta => {
    if (filtro === 'asignados') {
      // Mostrar solo las que NO tienen evidencia_id (nunca se ha enviado)
      return !meta.evidencia_id;
    }
    if (filtro === 'pendiente') return meta.evidencia_id && meta.estado === 'pendiente';
    if (filtro === 'rechazado') return meta.estado === 'rechazado';
    if (filtro === 'aprobado') return meta.estado === 'aprobado';
    return true;
  });

  const contadores = {
    asignados: metas.filter(m => !m.evidencia_id).length,
    pendiente: metas.filter(m => m.evidencia_id && m.estado === 'pendiente').length,
    rechazado: metas.filter(m => m.estado === 'rechazado').length,
    aprobado: metas.filter(m => m.estado === 'aprobado').length,
  };

  if (metas.length === 0) {
    return (
      <div style={{ background: '#FEF3C7', border: '1px solid #FBBF24', borderRadius: '8px', padding: '16px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <AlertCircle style={{ width: '18px', height: '18px', color: '#92400E' }} />
        <p style={{ color: '#92400E', fontSize: '14px', margin: 0 }}>No hay metas asignadas para este trimestre</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '12px' }}>
          <Filter style={{ width: '16px', height: '16px', color: '#6B7280' }} />
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280' }}>Filtrar:</span>
        </div>
        
        <button onClick={() => setFiltro('asignados')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', background: filtro === 'asignados' ? '#111827' : '#fff', color: filtro === 'asignados' ? '#fff' : '#6B7280', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FileText style={{ width: '12px', height: '12px' }} /> Asignados ({contadores.asignados})
        </button>

        <button onClick={() => setFiltro('pendiente')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', background: filtro === 'pendiente' ? '#FEF3C7' : '#fff', color: filtro === 'pendiente' ? '#92400E' : '#6B7280', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock style={{ width: '12px', height: '12px' }} /> Pendientes ({contadores.pendiente})
        </button>

        <button onClick={() => setFiltro('rechazado')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', background: filtro === 'rechazado' ? '#FEE2E2' : '#fff', color: filtro === 'rechazado' ? '#991B1B' : '#6B7280', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <XCircle style={{ width: '12px', height: '12px' }} /> Rechazados ({contadores.rechazado})
        </button>

        <button onClick={() => setFiltro('aprobado')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', background: filtro === 'aprobado' ? '#DCFCE7' : '#fff', color: filtro === 'aprobado' ? '#166534' : '#6B7280', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 style={{ width: '12px', height: '12px' }} /> Aprobados ({contadores.aprobado})
        </button>
      </div>
      
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
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#6B7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {metasFiltradas.map((meta, index) => {
                const bgColor = meta.estado === 'aprobado' ? '#F0FDF4' : meta.estado === 'rechazado' ? '#FEF2F2' : '#fff';
                return (
                  <tr key={meta.id} style={{ borderBottom: index < metasFiltradas.length - 1 ? '1px solid #F3F4F6' : 'none', background: bgColor }}>
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
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: meta.estado === 'aprobado' ? '#DCFCE7' : meta.estado === 'rechazado' ? '#FEE2E2' : '#FEF3C7', color: meta.estado === 'aprobado' ? '#166534' : meta.estado === 'rechazado' ? '#991B1B' : '#92400E', whiteSpace: 'nowrap' }}>
                        {meta.estado === 'aprobado' && <><CheckCircle2 style={{ width: '12px', height: '12px' }} /> Aprobado</>}
                        {meta.estado === 'rechazado' && <><XCircle style={{ width: '12px', height: '12px' }} /> Rechazado</>}
                        {(!meta.estado || meta.estado === 'pendiente') && <><Clock style={{ width: '12px', height: '12px' }} /> Pendiente</>}
                      </div>
                      {meta.estado === 'rechazado' && meta.observaciones && (
                        <div style={{ marginTop: '6px', padding: '6px', background: '#FFFBEB', borderRadius: '4px', fontSize: '10px', color: '#92400E', textAlign: 'left', border: '1px solid #FEF3C7' }}>
                          <div style={{ fontWeight: '600', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle style={{ width: '10px', height: '10px' }} /> Obs:
                          </div>
                          {meta.observaciones}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                      {meta.estado === 'aprobado' ? (
                        <div style={{ fontSize: '12px', color: '#166534' }}>{meta.evidencia_texto}</div>
                      ) : meta.estado === 'pendiente' ? (
                        <div style={{ fontSize: '12px', color: '#92400E', padding: '6px', background: '#FEF3C7', borderRadius: '4px' }}>
                          {meta.evidencia_texto}
                        </div>
                      ) : (
                        <>
                          {meta.estado === 'rechazado' && meta.evidencia_texto && (
                            <div style={{ marginBottom: '8px', padding: '6px', background: '#FEF2F2', borderRadius: '4px', border: '1px solid #FEE2E2' }}>
                              <div style={{ fontSize: '10px', fontWeight: '600', color: '#991B1B', marginBottom: '4px' }}>Descripción rechazada:</div>
                              <div style={{ fontSize: '11px', color: '#6B7280', fontStyle: 'italic' }}>{meta.evidencia_texto}</div>
                            </div>
                          )}
                          <textarea
                            value={valores[meta.id]?.evidencia_texto || ''}
                            onChange={(e) => setValores(prev => ({ ...prev, [meta.id]: { ...prev[meta.id], evidencia_texto: e.target.value } }))}
                            placeholder={meta.estado === 'rechazado' ? 'Nueva descripción de la evidencia...' : 'Describe la evidencia...'}
                            disabled={enviando === meta.id}
                            style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: '4px', padding: '6px 8px', fontSize: '11px', fontFamily: 'inherit', resize: 'vertical', minHeight: '50px', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                      {meta.estado === 'aprobado' ? (
                        meta.evidencia_url ? (
                          <a href={meta.evidencia_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#166534', textDecoration: 'underline', fontWeight: '500' }}>
                            <FileText style={{ width: '12px', height: '12px' }} /> Ver archivo
                          </a>
                        ) : <span style={{ fontSize: '11px', color: '#6B7280' }}>-</span>
                      ) : meta.estado === 'pendiente' ? (
                        meta.evidencia_url ? (
                          <a href={meta.evidencia_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#92400E', textDecoration: 'underline', fontWeight: '500' }}>
                            <FileText style={{ width: '12px', height: '12px' }} /> Ver archivo
                          </a>
                        ) : <span style={{ fontSize: '11px', color: '#6B7280' }}>-</span>
                      ) : (
                        <div style={{ minWidth: '160px' }}>
                          {meta.estado === 'rechazado' && meta.evidencia_url && (
                            <div style={{ marginBottom: '8px', padding: '6px', background: '#FEF2F2', borderRadius: '4px', border: '1px solid #FEE2E2' }}>
                              <div style={{ fontSize: '10px', fontWeight: '600', color: '#991B1B', marginBottom: '4px' }}>Archivo rechazado:</div>
                              <a href={meta.evidencia_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#991B1B', textDecoration: 'underline' }}>
                                <FileText style={{ width: '12px', height: '12px' }} /> Ver archivo anterior
                              </a>
                            </div>
                          )}
                          <FileUpload
                            currentFile={archivos[meta.id] || null}
                            onFileSelect={(file) => setArchivos(prev => ({ ...prev, [meta.id]: file }))}
                            onFileRemove={() => setArchivos(prev => ({ ...prev, [meta.id]: null }))}
                            acceptedTypes=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                            maxSizeMB={10}
                            disabled={enviando === meta.id}
                          />
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', verticalAlign: 'top' }}>
                      {meta.estado === 'pendiente' ? (
                        <div style={{ fontSize: '11px', color: '#92400E', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock style={{ width: '12px', height: '12px' }} /> En revisión
                        </div>
                      ) : meta.estado !== 'aprobado' && (
                        <button onClick={() => handleEnviarEvidencia(meta.id)} disabled={enviando === meta.id} style={{ background: enviando === meta.id ? '#9CA3AF' : meta.estado === 'rechazado' ? '#DC2626' : '#111827', color: '#fff', fontWeight: '600', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: enviando === meta.id ? 'not-allowed' : 'pointer', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'background-color 0.2s', whiteSpace: 'nowrap' }}>
                          {enviando === meta.id ? <><Loader2 style={{ width: '12px', height: '12px' }} /> Enviando...</> : meta.estado === 'rechazado' ? <><Send style={{ width: '12px', height: '12px' }} /> Reenviar</> : <><Send style={{ width: '12px', height: '12px' }} /> Enviar</>}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 12px', borderTop: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: '11px', color: '#6B7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Mostrando {metasFiltradas.length} de {metas.length} evidencias</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>Asignadas: {contadores.asignados}</span>
            <span>Pendientes: {contadores.pendiente}</span>
            <span>Rechazadas: {contadores.rechazado}</span>
            <span>Aprobadas: {contadores.aprobado}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
