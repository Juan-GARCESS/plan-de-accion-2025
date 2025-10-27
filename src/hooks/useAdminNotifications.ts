import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface Notification {
  id: number;
  type: string;
  message: string;
  created_at: string;
  read: boolean;
}

export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevNotificationsRef = useRef<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/notificaciones');
      
      if (!response.ok) {
        throw new Error('Error al cargar las notificaciones');
      }

      const data = await response.json();

      // Mostrar toasts para nuevas notificaciones (solo después de la carga inicial)
      try {
        const prev = prevNotificationsRef.current || [];
        if (prev.length > 0) {
          const prevIds = new Set(prev.map((p: Notification) => p.id));
          const newOnes = data.filter((n: Notification) => !prevIds.has(n.id));
          newOnes.forEach((n: Notification) => {
            // Mapear tipos a toasts (puedes ajustar los mensajes/estilos aquí)
            if (n.type === 'informe_subido') {
              toast.success(n.message, { description: n.type });
            } else if (n.type === 'error' || n.type === 'alert') {
              toast.error(n.message, { description: n.type });
            } else {
              toast(n.message);
            }
          });
        }
      } catch (err) {
        // No bloquear la carga por errores en la notificación
        console.error('Error mostrando toasts de notificaciones:', err);
      }

      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.read).length);
      prevNotificationsRef.current = data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 20000); // poll cada 20s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/admin/notificaciones/${id}/read`, {
        method: 'PATCH'
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    refetch: fetchNotifications
  };
};
