'use client';

import { useEffect, useState } from 'react';
import { Toaster as Sonner } from 'sonner';
import { useTheme } from '@/context/ThemeContext';

export function Toaster() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Sonner
      theme={theme}
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg',
          title: 'text-slate-900 dark:text-slate-100 font-semibold',
          description: 'text-slate-600 dark:text-slate-400',
          actionButton: 'bg-primary-500 text-white',
          cancelButton: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100',
          closeButton: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
          success: 'border-green-500 dark:border-green-600',
          error: 'border-red-500 dark:border-red-600',
          warning: 'border-yellow-500 dark:border-yellow-600',
          info: 'border-blue-500 dark:border-blue-600',
        },
      }}
      richColors
      expand
      duration={3500}
    />
  );
}

