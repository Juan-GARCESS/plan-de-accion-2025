// src/app/admin/plan-accion-general/page.tsx
'use client';

import React from 'react';
import PlanAccionGeneralTable from '@/components/admin/PlanAccionGeneralTable';

export default function PlanAccionGeneralPage() {
  return (
    <div style={{ padding: '24px' }}>
      <PlanAccionGeneralTable isAdmin={true} />
    </div>
  );
}
