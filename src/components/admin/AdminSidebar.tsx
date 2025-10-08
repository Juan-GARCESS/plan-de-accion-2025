'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function AdminSidebar() {
  const pathname = usePathname();

  const sections: NavSection[] = [
    {
      title: 'Gestión de Usuarios',
      items: [
        { label: 'Todos los Usuarios', href: '/admin/dashboard', icon: '' },
      ]
    },
    {
      title: 'Gestión de Áreas',
      items: [
        { label: 'Áreas', href: '/admin/areas', icon: '' },
      ]
    },
    {
      title: 'Gestión de Ejes',
      items: [
        { label: 'Ejes y Sub-Ejes', href: '/admin/ejes', icon: '' },
      ]
    }
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className="fixed top-0 left-0 z-50 h-screen w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 lg:static">
      <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Admin Panel</h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 h-[calc(100vh-8rem)]">
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx}>
              <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={isActive(item.href) ? 'flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary-500 text-white' : 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}
                  >
                    <span>{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/api/logout" className="flex-1 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-center">
            Cerrar Sesión
          </Link>
        </div>
      </div>
    </aside>
  );
}
