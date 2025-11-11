// src/app/admin/plan-accion-general/page.tsx
'use client';

import React from 'react';
import PlanAccionGeneralExportable from '@/components/admin/PlanAccionGeneralExportable';

export default function PlanAccionGeneralPage() {
  return (
    <div style={{ padding: '24px' }}>
      <PlanAccionGeneralExportable isAdmin={true} />
    </div>
  );
}
