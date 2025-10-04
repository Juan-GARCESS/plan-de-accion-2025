import { useState, useEffect, useRef, useCallback } from 'react';

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  area_id: number | null;
  estado: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Configuración del timeout (5 minutos = 300000 ms)
  const SESSION_TIMEOUT = 5 * 60 * 1000;

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

  // Función para hacer logout automático por timeout
  const logoutDueToTimeout = useCallback(async () => {
    try {
      await fetch('/api/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      sessionStorage.removeItem('isAuthenticated');
      
      // Mostrar mensaje de timeout y redirigir
      alert('Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.');
      window.location.replace('/?timeout=true');
    } catch (error) {
      console.error('Error during timeout logout:', error);
      setUser(null);
      sessionStorage.removeItem('isAuthenticated');
      window.location.replace('/?timeout=true');
    }
  }, []);

  // Función para reiniciar el timer de timeout
  const resetTimeout = useCallback(() => {
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Actualizar última actividad
    lastActivityRef.current = Date.now();
    
    // Solo iniciar timeout si el usuario está autenticado
    if (user) {
      timeoutRef.current = setTimeout(() => {
        logoutDueToTimeout();
      }, SESSION_TIMEOUT);
    }
  }, [user, logoutDueToTimeout, SESSION_TIMEOUT]);

  // Función para detectar actividad del usuario
  const handleUserActivity = useCallback(() => {
    if (user) {
      resetTimeout();
    }
  }, [user, resetTimeout]);

  // Configurar listeners de actividad del usuario
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Agregar listeners
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Iniciar el timer
    resetTimeout();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, handleUserActivity, resetTimeout]);

  const logout = async () => {
    try {
      // Limpiar timeout antes del logout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      await fetch('/api/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      
      // Limpiar marcador de autenticación
      sessionStorage.removeItem('isAuthenticated');
      
      // Redirigir al login
      window.location.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Limpiar marcador incluso si hay error
      sessionStorage.removeItem('isAuthenticated');
      
      window.location.replace('/');
    }
  };

  const preventBackNavigation = () => {
    // Sistema simple: solo bloquear navegación hacia login/register después de autenticarse
    const currentPath = window.location.pathname;
    const isProtectedRoute = currentPath.startsWith('/dashboard') || currentPath.startsWith('/admin');
    
    if (!isProtectedRoute) {
      return () => {}; // No hacer nada si no está en rutas protegidas
    }
    
    // Marcar que el usuario está en una sesión autenticada
    sessionStorage.setItem('isAuthenticated', 'true');
    
    const handlePopState = (event: PopStateEvent) => {
      const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
      
      if (!isAuthenticated) {
        return; // No interferir si no está autenticado
      }
      
      const targetPath = window.location.pathname;
      
      // Solo bloquear navegación hacia páginas de autenticación específicas
      if (targetPath === '/' || targetPath === '/register') {
        // Prevenir la navegación hacia atrás a estas páginas
        event.preventDefault();
        window.history.forward();
        return;
      }
      
      // Permitir toda otra navegación normalmente
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  };

  const redirectBasedOnRole = (userData: User) => {
    // Marcar autenticación
    sessionStorage.setItem('isAuthenticated', 'true');
    
    if (userData.rol === 'admin') {
      window.location.replace('/admin/dashboard');
    } else {
      window.location.replace('/dashboard');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

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
    preventBackNavigation,
    redirectBasedOnRole
  };
}
