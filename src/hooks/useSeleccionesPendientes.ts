import { useState, useEffect } from 'react';

interface SeleccionPendiente {
  id: number;
  usuario_id: number;
  area_id: number;
  nombre_usuario: string;
  nombre_area: string;
  fecha_solicitud: string;
}

export const useSeleccionesPendientes = () => {
  const [selecciones, setSelecciones] = useState<SeleccionPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSelecciones = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/selecciones-pendientes');
      
      if (!response.ok) {
        throw new Error('Error al cargar las selecciones pendientes');
      }

      const data = await response.json();
      setSelecciones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSelecciones();
  }, []);

  const aprobarSeleccion = async (id: number) => {
    try {
      const response = await fetch('/api/admin/selecciones-pendientes/aprobar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        throw new Error('Error al aprobar la selección');
      }

      await fetchSelecciones(); // Recargar la lista
    } catch (err) {
      throw err;
    }
  };

  const rechazarSeleccion = async (id: number) => {
    try {
      const response = await fetch('/api/admin/selecciones-pendientes/rechazar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        throw new Error('Error al rechazar la selección');
      }

      await fetchSelecciones(); // Recargar la lista
    } catch (err) {
      throw err;
    }
  };

  return {
    selecciones,
    loading,
    error,
    aprobarSeleccion,
    rechazarSeleccion,
    refetch: fetchSelecciones
  };
};
