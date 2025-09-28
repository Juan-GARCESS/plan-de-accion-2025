import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/me', {
        credentials: 'include',
        cache: 'no-store'
      });
      
      if (res.ok) {
        const data = await res.json();
        const userData = data.usuario;
        setUser(userData);
        return userData;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      // Limpiar todo el historial y ir al login
      window.history.replaceState(null, '', '/');
      router.replace('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const preventBackNavigation = () => {
    // Agregar una entrada al historial que redirija a la página actual
    window.history.pushState(null, '', window.location.href);
    
    // Escuchar eventos de navegación hacia atrás
    const handlePopState = () => {
      // Prevenir navegación hacia atrás manteniendo la página actual
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  };

  const redirectBasedOnRole = (userData: User) => {
    if (userData.rol === 'admin') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/dashboard');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Escuchar cambios en la visibilidad de la página para revalidar sesión
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        checkAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  return {
    user,
    loading,
    checkAuth,
    logout,
    redirectBasedOnRole,
    preventBackNavigation
  };
}