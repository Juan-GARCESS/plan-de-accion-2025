'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { Area } from '@/types';

interface AdminSidebarProps {
  areas: Area[];
  onAreaSelect?: (areaId: number) => void;
  selectedAreaId?: number | null;
  onDashboardSelect?: () => void;
  userName?: string;
  onGestionSelect?: () => void;
  isGestionSelected?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  areas,
  onAreaSelect,
  selectedAreaId,
  onDashboardSelect,
  userName,
  onGestionSelect,
  isGestionSelected
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  const safeAreas = Array.isArray(areas) ? areas : [];
  const filteredAreas = safeAreas.filter(area => 
    area && area.nombre_area && 
    area.nombre_area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 lg:static shadow-lg">
      {/* Header */}
      <div className="h-16 flex items-center justify-center border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <button
          onClick={onDashboardSelect}
          className="w-full h-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Ir al inicio"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Panel de Administración
          </h2>
        </button>
      </div>

      {/* User Info */}
      {userName && (
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Bienvenido,</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{userName}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4" style={{ height: 'calc(100vh - 16rem)' }}>
        {/* Inicio Button */}
        <button
          onClick={onDashboardSelect}
          className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all ${
            !isGestionSelected && selectedAreaId === null
              ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-sm font-medium">Inicio</span>
        </button>

        {/* Gestión Button */}
        <button
          onClick={onGestionSelect}
          className={`w-full flex items-center gap-3 px-4 py-3 mb-4 rounded-lg transition-all ${
            isGestionSelected
              ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium">Gestión</span>
        </button>

        {/* ÁREAS Section */}
        <div className="mb-4">
          <h3 className="px-2 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            ÁREAS
          </h3>
          
          {/* Search Box */}
          <div className="relative mb-3">
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          {/* Areas List */}
          <div className="space-y-1">
            {filteredAreas.map((area) => (
              <button
                key={area.id}
                onClick={() => onAreaSelect?.(area.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left ${
                  selectedAreaId === area.id
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-sm truncate">{area.nombre_area}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <ThemeToggle />
        </div>
        <button
          onClick={() => router.push('/api/logout')}
          className="w-full px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};
