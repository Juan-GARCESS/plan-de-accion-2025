// src/components/admin/GestionAllSections.tsx
'use client';

import React from 'react';
import { UsersSectionImproved } from '@/components/admin/UsersSectionImproved';
import type { Area, Usuario } from '@/types';

interface GestionAllSectionsProps {
  usuarios: Usuario[];
  areas: Area[];
  // user actions
  onApprove: (userId: number, areaId: number) => Promise<void>;
  onReject: (userId: number) => Promise<void>;
  onEdit: (userId: number, data: { nombre: string; email: string; password?: string; area_id?: number }) => Promise<void>;
  onDelete: (userId: number) => Promise<void>;
  onGeneratePassword: (userId: number) => Promise<string>;
  // area actions (kept for backward compatibility, not used in this component)
  onCreateArea: (data: { nombre: string; descripcion: string }) => Promise<void>;
  onEditArea: (areaId: number, data: { nombre: string; descripcion: string }) => Promise<void>;
  onDeleteArea: (areaId: number) => Promise<void>;
}

export const GestionAllSections: React.FC<GestionAllSectionsProps> = ({
  usuarios,
  areas,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  onGeneratePassword,
}) => {
  return (
    <div>
      <UsersSectionImproved
        usuarios={usuarios}
        areas={areas}
        onApprove={onApprove}
        onReject={onReject}
        onEdit={onEdit}
        onDelete={onDelete}
        onGeneratePassword={onGeneratePassword}
      />
    </div>
  );
};
