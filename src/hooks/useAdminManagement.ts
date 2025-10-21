// src/hooks/useAdminManagement.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Usuario, Area } from '@/types';

export const useAdminManagement = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuarios
  const fetchUsuarios = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/usuarios', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      setUsuarios(data || []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar usuarios');
    }
  }, []);

  // Cargar áreas
  const fetchAreas = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/areas', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      setAreas(data || []); // Cambiado para usar el array directamente
    } catch (err) {
      console.error('Error al cargar áreas:', err);
      setError('Error al cargar áreas');
    }
  }, []);

  // Cargar todos los datos
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchUsuarios(), fetchAreas()]);
    } finally {
      setLoading(false);
    }
  }, [fetchUsuarios, fetchAreas]);

  // Aprobar usuario
  const approveUser = async (userId: number, areaId: number) => {
    const res = await fetch('/api/admin/usuarios/aprobar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, area_id: areaId })
    });

    if (!res.ok) {
      throw new Error('Error al aprobar usuario');
    }

    await fetchUsuarios();
  };

  // Rechazar usuario
  const rejectUser = async (userId: number) => {
    const res = await fetch('/api/admin/usuarios/rechazar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });

    if (!res.ok) {
      throw new Error('Error al rechazar usuario');
    }

    await fetchUsuarios();
  };

  // Eliminar usuario
  const deleteUser = async (userId: number) => {
    const res = await fetch('/api/admin/usuarios/eliminar', {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ user_id: userId }),
      cache: 'no-store'
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(errorData.error || 'Error al eliminar usuario');
    }

    // Forzar recarga completa de usuarios
    await fetchUsuarios();
  };

  // Editar usuario
  const editUser = async (userId: number, userData: { nombre: string; email: string; password?: string; area_id?: number }) => {
    const res = await fetch('/api/admin/usuarios/editar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, ...userData })
    });

    if (!res.ok) {
      throw new Error('Error al editar usuario');
    }

    await fetchUsuarios();
  };

  // Generar nueva contraseña
  const generatePassword = async (userId: number): Promise<string> => {
    const res = await fetch('/api/admin/usuarios/generar-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });

    if (!res.ok) {
      throw new Error('Error al generar contraseña');
    }

    const data = await res.json();
    await fetchUsuarios();
    return data.password;
  };

  // Crear área
  const createArea = async (data: { nombre: string; descripcion: string }) => {
    const res = await fetch('/api/admin/areas/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_area: data.nombre,
        descripcion: data.descripcion
      })
    });

    if (!res.ok) {
      throw new Error('Error al crear área');
    }

    await fetchAreas();
  };

  // Editar área
  const editArea = async (areaId: number, data: { nombre: string; descripcion: string }) => {
    const res = await fetch(`/api/admin/areas/${areaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre_area: data.nombre,
        descripcion: data.descripcion
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al editar área');
    }

    await fetchAreas();
  };

  // Eliminar área
  const deleteArea = async (areaId: number) => {
    try {
      const res = await fetch('/api/admin/areas/eliminar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area_id: areaId })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar área');
      }

      await fetchAreas();
    } catch (err) {
      console.error('Error al eliminar área:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar área');
    }
  };

  // Cambiar estado del área
  const toggleAreaStatus = async (areaId: number, activa: boolean) => {
    const res = await fetch(`/api/admin/areas/${areaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activa })
    });

    if (!res.ok) {
      throw new Error('Error al cambiar estado del área');
    }

    await fetchAreas();
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    usuarios,
    areas,
    loading,
    error,
    refetch: loadData,
    // Funciones de usuarios
    approveUser,
    rejectUser,
    deleteUser,
    editUser,
    generatePassword,
    // Funciones de áreas
    createArea,
    editArea,
    deleteArea,
    toggleAreaStatus,
  };
};