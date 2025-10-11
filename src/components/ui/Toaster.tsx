'use client';

import { useEffect, useState } from 'react';
import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Sonner
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'bg-white border-slate-200 shadow-lg',
          title: 'text-slate-900 font-semibold',
          description: 'text-slate-600',
          actionButton: 'bg-primary-500 text-white',
          cancelButton: 'bg-slate-200 text-slate-900',
          closeButton: 'bg-white border-slate-200',
          success: 'border-green-500',
          error: 'border-red-500',
          warning: 'border-yellow-500',
          info: 'border-blue-500',
        },
      }}
      richColors
      expand
      duration={3500}
    />
  );
}

