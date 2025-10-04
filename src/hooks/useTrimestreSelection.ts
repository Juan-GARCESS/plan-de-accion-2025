// src/hooks/useTrimestreSelection.ts

import { useState, useEffect } from 'react';
import { TrimestreDisponible } from '@/types';

interface UseTrimestreSelectionReturn {
  trimestres: TrimestreDisponible[];
  loading: boolean;
  error: string | null;
  seleccionarTrimestre: (trimestre: number, año: number) => Promise<boolean>;
  recargarTrimestres: () => Promise<void>;
}

export const useTrimestreSelection = (): UseTrimestreSelectionReturn => {
  const [trimestres, setTrimestres] = useState<TrimestreDisponible[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarTrimestres = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/usuario/trimestres-disponibles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar trimestres');
      }

      const data = await response.json();
      setTrimestres(data.trimestres || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarTrimestre = async (trimestre: number, año: number): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch('/api/usuario/seleccionar-trimestre', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trimestre, año }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al seleccionar trimestre');
      }

      // 🔄 Recargar la lista después de seleccionar
      await cargarTrimestres();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    }
  };

  const recargarTrimestres = async () => {
    await cargarTrimestres();
  };

  useEffect(() => {
    cargarTrimestres();
  }, []);

  return {
    trimestres,
    loading,
    error,
    seleccionarTrimestre,
    recargarTrimestres,
  };
};

// 🎨 Funciones de utilidad para el componente
export const getEstadoLabel = (estado: string): string => {
  const estados = {
    'pendiente_meta': 'Esperando asignación de meta',
    'meta_asignada': 'Meta asignada - Puede subir informe',
    'upload_habilitado': 'Subida habilitada',
    'informe_subido': 'Informe enviado - En revisión',
    'completado': 'Completado y calificado'
  };
  return estados[estado as keyof typeof estados] || estado;
};

export const getEstadoColor = (estado: string): string => {
  const colores = {
    'pendiente_meta': '#f59e0b', // amber
    'meta_asignada': '#3b82f6', // blue
    'upload_habilitado': '#10b981', // green
    'informe_subido': '#8b5cf6', // purple
    'completado': '#059669' // emerald
  };
  return colores[estado as keyof typeof colores] || '#6b7280';
};