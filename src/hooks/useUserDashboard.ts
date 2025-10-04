import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface UserStats {
  metasCompletadas: number;
  metasTotales: number;
  porcentajeCompletado: number;
}

export const useUserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchUserStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/usuario/metas');
        
        if (!response.ok) {
          throw new Error('Error al cargar las estadísticas');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  return { stats, loading, error };
};
