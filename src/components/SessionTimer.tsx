// src/components/SessionTimer.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';

interface SessionTimerProps {
  isAuthenticated: boolean;
  onTimeout: () => void;
  timeoutMinutes?: number;
}

export function SessionTimer({ 
  isAuthenticated, 
  onTimeout, 
  timeoutMinutes = 5 
}: SessionTimerProps) {
  const [timeLeft, setTimeLeft] = useState(timeoutMinutes * 60); // en segundos
  const [showWarning, setShowWarning] = useState(false);

  // Convertir a minutos y segundos para mostrar
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Resetear timer en actividad del usuario
  const resetTimer = useCallback(() => {
    setTimeLeft(timeoutMinutes * 60);
    setShowWarning(false);
  }, [timeoutMinutes]);

  // Detectar actividad del usuario
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [isAuthenticated, resetTimer]);

  // Countdown timer
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onTimeout();
          return 0;
        }
        
        // Mostrar advertencia en los últimos 60 segundos
        if (prev <= 60 && !showWarning) {
          setShowWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, onTimeout, showWarning]);

  // No mostrar nada si no está autenticado
  if (!isAuthenticated || timeLeft <= 0) return null;

  // Solo mostrar durante los últimos 60 segundos
  if (!showWarning) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: timeLeft <= 30 ? '#dc2626' : '#f59e0b',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 9999,
      fontSize: '14px',
      fontWeight: '500',
      animation: timeLeft <= 10 ? 'pulse 1s infinite' : 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>⚠️</span>
        <span>
          Sesión expira en: {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
      {timeLeft <= 30 && (
        <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>
          Mueve el mouse para extender la sesión
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}