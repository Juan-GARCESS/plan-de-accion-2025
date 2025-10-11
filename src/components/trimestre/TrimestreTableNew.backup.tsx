'use client';
// FORZAR RECOMPILACIÓN COMPLETA - DISEÑO MEJORADO APLICADO
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
  estado: 'pendiente' | 'aprobado' | 'rechazado' | null;
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
  const [loading, setLoading] = useState(true);
  const [trimestreHabilitado, setTrimestreHabilitado] = useState(false);
  const [valores, setValores] = useState<{ [key: number]: { texto: string; url: string } }>({});
  
  // Versión actualizada con diseño mejorado v2.0

  // Verificar si el trimestre está habilitado
  useEffect(() => {
    const verificarTrimestre = async () => {
      try {
        const response = await fetch(`/api/admin/areas/${areaId}/plan-accion`);
        const data = await response.json();
        
        const trimestreKey = `t${trimestreId}` as 't1' | 't2' | 't3' | 't4';
        
        const algunoMarcado = data.data?.some((row: { id: number; t1?: boolean; t2?: boolean; t3?: boolean; t4?: boolean }) => {
          return row[trimestreKey] === true;
        });
        
        setTrimestreHabilitado(algunoMarcado || false);
      } catch (error) {
        console.error('Error al verificar trimestre:', error);
        setTrimestreHabilitado(false);
      }
    };

    verificarTrimestre();
  }, [areaId, trimestreId]);

  // Cargar metas cuando el trimestre esté habilitado
  useEffect(() => {
    if (!trimestreHabilitado) {
      setLoading(false);
      return;
    }

    const cargarMetas = async () => {
      try {
        console.log('🔍 Cargando metas para:', { trimestreId, areaId });
        const response = await fetch(
          `/api/usuario/trimestre-metas?trimestre=${trimestreId}&area_id=${areaId}`
        );
        const data = await response.json();
        
        console.log('📦 Respuesta del servidor:', { 
          ok: response.ok, 
          status: response.status,
          data 
        });
        
        if (response.ok) {
          console.log('✅ Metas recibidas:', data.metas?.length || 0);
          setMetas(data.metas || []);
          
          // Inicializar valores de edición
          const valoresIniciales: { [key: number]: { texto: string; url: string } } = {};
          data.metas?.forEach((meta: MetaEvidencia) => {
            valoresIniciales[meta.id] = {
              texto: meta.evidencia_texto || '',
              url: meta.evidencia_url || ''
            };
          });
          setValores(valoresIniciales);
        } else {
          console.error('❌ Error al cargar metas:', data);
        }
      } catch (error) {
        console.error('❌ Error en fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarMetas();
  }, [trimestreHabilitado, trimestreId, areaId]);

  const handleEnviarEvidencia = async (metaId: number) => {
    try {
      const response = await fetch('/api/usuario/trimestre-metas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planAccionId: metaId,
          trimestre: trimestreId,
          evidenciaTexto: valores[metaId]?.texto || '',
          evidenciaUrl: valores[metaId]?.url || ''
        })
      });

      if (response.ok) {
        toast.success('✅ Evidencia enviada correctamente', { closeButton: true });
        
        // Recargar metas
        const recargar = await fetch(
          `/api/usuario/trimestre-metas?trimestre=${trimestreId}&area_id=${areaId}`
        );
        const data = await recargar.json();
        setMetas(data.metas || []);
      } else {
        toast.error('Error al enviar evidencia', { closeButton: true });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar evidencia', { closeButton: true });
    }
  };

  const getEstadoBadge = (estado: string | null) => {
    if (!estado || estado === 'pendiente') {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm">⏳ Pendiente</span>;
    }
    if (estado === 'aprobado') {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">✅ Aprobado</span>;
    }
    return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-sm">❌ Rechazado</span>;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Cargando metas...</p>
      </div>
    );
  }

  if (!trimestreHabilitado) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold mb-2">Trimestre no habilitado</h3>
        <p className="text-gray-600 mb-6">
          Debes marcar el checkbox T{trimestreId} en tu Plan de Acción para habilitar este trimestre.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Ir a Plan de Acción
        </button>
      </div>
    );
  }

  if (metas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold mb-2">Sin metas asignadas</h3>
        <p className="text-gray-600">
          Completa tu Plan de Acción para poder enviar evidencias.
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
          gap: '8px'
        }}>
          📋 Metas y Evidencias - Trimestre {trimestreId}
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Envía tus evidencias para cada meta. El administrador las revisará y calificará.
        </p>
      </div>
      
      {metas.map((meta) => (
        <div key={meta.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          {/* Header de la meta */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Eje</p>
                <p className="font-semibold text-gray-800">{meta.eje_nombre}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Sub-Eje</p>
                <p className="font-semibold text-gray-800">{meta.sub_eje_nombre}</p>
              </div>
            </div>
          </div>

          {/* Contenido de la meta */}
          <div className="p-4 space-y-4">
            {/* Meta e Indicador */}
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Meta</p>
                <p className="text-sm text-gray-800">{meta.meta || 'Sin meta definida'}</p>
              </div>
              {meta.indicador && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Indicador</p>
                  <p className="text-sm text-gray-800">{meta.indicador}</p>
                </div>
              )}
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <p className="text-xs font-medium text-blue-700 uppercase mb-1">Acción a Realizar</p>
                <p className="text-sm font-medium text-blue-900">{meta.accion || 'Sin acción definida'}</p>
              </div>
            </div>

            {/* Estado y Calificación */}
            <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Estado</p>
                {getEstadoBadge(meta.estado)}
              </div>
              {meta.calificacion !== null && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Calificación</p>
                  <p className="font-bold text-2xl text-blue-600">{meta.calificacion}</p>
                </div>
              )}
            </div>

            {/* Observaciones del admin */}
            {meta.observaciones && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 text-lg">💬</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-800 mb-1">Observaciones del evaluador:</p>
                    <p className="text-sm text-yellow-900">{meta.observaciones}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Formulario de evidencia */}
            <div className="space-y-3 pt-3 border-t border-gray-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📝 Evidencia (Descripción) *
                </label>
                <textarea
                  value={valores[meta.id]?.texto || ''}
                  onChange={(e) => setValores({
                    ...valores,
                    [meta.id]: { ...valores[meta.id], texto: e.target.value }
                  })}
                  className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Describe detalladamente lo que hiciste para cumplir esta meta..."
                  disabled={meta.estado === 'aprobado'}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔗 URL de Evidencia (opcional)
                </label>
                <input
                  type="url"
                  value={valores[meta.id]?.url || ''}
                  onChange={(e) => setValores({
                    ...valores,
                    [meta.id]: { ...valores[meta.id], url: e.target.value }
                  })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="https://drive.google.com/..."
                  disabled={meta.estado === 'aprobado'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Puedes compartir enlaces de Google Drive, Dropbox, etc.
                </p>
              </div>

              {meta.estado !== 'aprobado' && (
                <button
                  onClick={() => handleEnviarEvidencia(meta.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  {meta.evidencia_id ? (
                    <>
                      🔄 <span>Actualizar Evidencia</span>
                    </>
                  ) : (
                    <>
                      📤 <span>Enviar Evidencia</span>
                    </>
                  )}
                </button>
              )}

              {meta.fecha_envio && (
                <p className="text-xs text-gray-500 text-center">
                  ⏰ Última actualización: {new Date(meta.fecha_envio).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
