// src/hooks/useAdminDashboard.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Area, TrimestreEstadistica } from '@/types';

export const useAdminDashboard = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [estadisticas, setEstadisticas] = useState<TrimestreEstadistica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAreas = async () => {
    try {
      const res = await fetch('/api/admin/areas');
      if (res.ok) {
        const data = await res.json();
        setAreas(data.areas || []);
      } else {
        throw new Error('Error al cargar áreas');
      }
    } catch (error) {
      console.error('Error al cargar áreas:', error);
      setError('Error al cargar áreas');
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const res = await fetch('/api/admin/estadisticas-trimestres');
      if (res.ok) {
        const data = await res.json();
        setEstadisticas(data.estadisticas || []);
      } else {
        throw new Error('Error al cargar estadísticas');
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setError('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchAreas(), fetchEstadisticas()]);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    areas,
    estadisticas,
    loading,
    error,
    refetch: loadData,
  };
};