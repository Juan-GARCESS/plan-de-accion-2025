// src/components/admin/GestionAllSections.tsx
'use client';

import React from 'react';
import { PendingUsersCard } from '@/components/admin/PendingUsersCard';
import { UsersSectionImproved } from '@/components/admin/UsersSectionImproved';
import { AreasManagementSectionImproved } from '@/components/admin/AreasManagementSectionImproved';
import { EjesManagementSectionImproved } from '@/components/admin/EjesManagementSectionImproved';
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
  // area actions
  onCreateArea: (data: { nombre: string; descripcion: string }) => Promise<void>;
  onEditArea: (areaId: number, data: { nombre: string; descripcion: string; activa?: boolean }) => Promise<void>;
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
  onCreateArea,
  onEditArea,
  onDeleteArea
}) => {
  return (
    <div>
      {/* Tarjeta destacada de usuarios pendientes */}
      <PendingUsersCard
        usuarios={usuarios}
        areas={areas}
        onApprove={onApprove}
        onReject={onReject}
      />

      <UsersSectionImproved
        usuarios={usuarios}
        areas={areas}
        onApprove={onApprove}
        onReject={onReject}
        onEdit={onEdit}
        onDelete={onDelete}
        onGeneratePassword={onGeneratePassword}
      />

      <hr style={{ border: 'none', height: '1px', backgroundColor: '#e5e7eb', margin: '3rem 0' }} />

      <AreasManagementSectionImproved
        areas={areas}
        onCreate={onCreateArea}
        onEdit={onEditArea}
        onDelete={onDeleteArea}
      />

      <hr style={{ border: 'none', height: '1px', backgroundColor: '#e5e7eb', margin: '3rem 0' }} />

      <EjesManagementSectionImproved />
    </div>
  );
};
