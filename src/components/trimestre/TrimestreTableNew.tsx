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
        const response = await fetch(
          `/api/usuario/trimestre-metas?trimestre=${trimestreId}&area_id=${areaId}`
        );
        const data = await response.json();
        
        if (response.ok) {
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
          // Solo mostrar error si no es por tabla inexistente
          console.error('Error al cargar metas:', data);
        }
      } catch (error) {
        console.error('Error:', error);
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
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">📋 Metas y Evidencias - Trimestre {trimestreId}</h2>
      
      {metas.map((meta) => (
        <div key={meta.id} className="border rounded-lg p-4 bg-white shadow-sm">
          {/* Información de la meta */}
          <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
            <div>
              <p className="text-sm text-gray-500">Eje</p>
              <p className="font-medium">{meta.eje_nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sub-Eje</p>
              <p className="font-medium">{meta.sub_eje_nombre}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Meta</p>
              <p className="font-medium">{meta.meta || 'Sin meta'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Acción</p>
              <p className="font-medium">{meta.accion || 'Sin acción definida'}</p>
            </div>
          </div>

          {/* Estado y calificación */}
          <div className="flex items-center gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Estado</p>
              {getEstadoBadge(meta.estado)}
            </div>
            {meta.calificacion !== null && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Calificación</p>
                <p className="font-bold text-lg text-blue-600">{meta.calificacion}</p>
              </div>
            )}
          </div>

          {/* Observaciones del admin */}
          {meta.observaciones && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm font-medium text-yellow-800 mb-1">💬 Observaciones del evaluador:</p>
              <p className="text-sm text-yellow-900">{meta.observaciones}</p>
            </div>
          )}

          {/* Formulario de evidencia */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Evidencia (Descripción)</label>
              <textarea
                value={valores[meta.id]?.texto || ''}
                onChange={(e) => setValores({
                  ...valores,
                  [meta.id]: { ...valores[meta.id], texto: e.target.value }
                })}
                className="w-full border rounded-md p-2 min-h-[80px]"
                placeholder="Describe lo que hiciste para cumplir esta meta..."
                disabled={meta.estado === 'aprobado'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL de Evidencia (opcional)</label>
              <input
                type="url"
                value={valores[meta.id]?.url || ''}
                onChange={(e) => setValores({
                  ...valores,
                  [meta.id]: { ...valores[meta.id], url: e.target.value }
                })}
                className="w-full border rounded-md p-2"
                placeholder="https://..."
                disabled={meta.estado === 'aprobado'}
              />
            </div>

            {meta.estado !== 'aprobado' && (
              <button
                onClick={() => handleEnviarEvidencia(meta.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {meta.evidencia_id ? '🔄 Actualizar Evidencia' : '📤 Enviar Evidencia'}
              </button>
            )}

            {meta.fecha_envio && (
              <p className="text-xs text-gray-500">
                Última actualización: {new Date(meta.fecha_envio).toLocaleDateString('es-ES', {
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
      ))}
    </div>
  );
}
