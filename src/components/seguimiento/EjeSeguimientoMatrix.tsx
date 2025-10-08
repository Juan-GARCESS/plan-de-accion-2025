"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { colors, spacing, createCardStyle } from '@/lib/styleUtils';

interface RowItem {
  eje_id: number;
  eje_nombre: string;
  trimestres: { [k: number]: boolean };
}

interface Props {
  areaId: number;
  editable?: boolean;
}

export const EjeSeguimientoMatrix: React.FC<Props> = ({ areaId, editable = false }) => {
  const [rows, setRows] = useState<RowItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/areas/${areaId}/seguimiento-ejes`);
      if (res.ok) {
        const json = await res.json();
        setRows(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [areaId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggle = async (ejeId: number, trimestre: number, value: boolean) => {
    if (!editable) return;
    const prev = rows;
    setRows(r => r.map(row => row.eje_id === ejeId ? { ...row, trimestres: { ...row.trimestres, [trimestre]: value } } : row));
    try {
      const res = await fetch('/api/usuario/seguimiento-ejes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eje_id: ejeId, trimestre, seleccionado: value })
      });
      if (!res.ok) throw new Error('save failed');
    } catch {
      // rollback
      setRows(prev);
    }
  };

  const th = {
    background: colors.gray[50],
    color: colors.gray[700],
    padding: '12px 8px',
    textAlign: 'center' as const,
    fontWeight: 700,
    borderBottom: `2px solid ${colors.gray[200]}`,
    borderRight: `1px solid ${colors.gray[300]}`,
  };
  const td = { padding: '10px 8px', borderRight: `1px solid ${colors.gray[300]}`, borderBottom: `1px solid ${colors.gray[300]}`, textAlign: 'center' as const };

  if (loading) {
    return (
      <div style={createCardStyle('padded')}>
        <p style={{ textAlign: 'center', color: colors.gray[500] }}>Cargando seguimiento…</p>
      </div>
    );
  }

  // Si el área no tiene ejes asignados aún, no mostrar nada
  if (!rows || rows.length === 0) {
    return null;
  }

  return (
    <div style={{ ...createCardStyle('base'), marginTop: spacing.lg }}>
      <div style={{ padding: spacing.lg, borderBottom: `1px solid ${colors.gray[300]}` }}>
        <h3 style={{ margin: 0, color: colors.gray[800] }}>Ejecución efectiva</h3>
        <p style={{ margin: '6px 0 0 0', color: colors.gray[600], fontSize: 14 }}>Seleccione los trimestres en los que se hará seguimiento a su área</p>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...th, width: '40%' }}>Eje</th>
              <th style={{ ...th, width: '15%' }}>Programación 1er Trimestre</th>
              <th style={{ ...th, width: '15%' }}>Programación 2do Trimestre</th>
              <th style={{ ...th, width: '15%' }}>Programación 3er Trimestre</th>
              <th style={{ ...th, width: '15%' }}>Programación 4to Trimestre</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.eje_id}>
                <td style={{ ...td, textAlign: 'left' as const, fontWeight: 600 }}>{row.eje_nombre}</td>
                {[1,2,3,4].map((t) => (
                  <td key={t} style={td}>
                    <input
                      type="checkbox"
                      checked={!!row.trimestres[t]}
                      disabled={!editable}
                      onChange={(e) => toggle(row.eje_id, t, e.target.checked)}
                      style={{ width: 18, height: 18, cursor: editable ? 'pointer' : 'default' }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
