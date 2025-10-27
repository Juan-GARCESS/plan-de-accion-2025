// src/components/shared/PlanAccionModernTable.tsx
'use client';

import React, { useState } from 'react';
import { CheckSquare, Square, Search } from 'lucide-react';

interface PlanAccionRow {
  id: number;
  eje_nombre: string;
  sub_eje_nombre: string;
  meta: string | null;
  indicador: string | null;
  accion: string | null;
  presupuesto: string | null;
  t1?: boolean | null;
  t2?: boolean | null;
  t3?: boolean | null;
  t4?: boolean | null;
}

interface PlanAccionModernTableProps {
  data: PlanAccionRow[];
  onEdit?: (id: number, field: 'accion' | 'presupuesto' | 'meta' | 'indicador', value: string) => void;
  onCheckboxChange?: (id: number, trimestre: 't1' | 't2' | 't3' | 't4', currentValue: boolean) => void;
  editable?: boolean;
  adminMode?: boolean;
}

export const PlanAccionModernTable: React.FC<PlanAccionModernTableProps> = ({
  data,
  onEdit,
  onCheckboxChange,
  editable = false,
  adminMode = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (value: string | null) => {
    if (!value) return '-';
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Filtrar datos
  const filteredData = data.filter(row => {
    const searchLower = searchTerm.toLowerCase();
    return (
      row.eje_nombre.toLowerCase().includes(searchLower) ||
      row.sub_eje_nombre.toLowerCase().includes(searchLower) ||
      (row.meta && row.meta.toLowerCase().includes(searchLower)) ||
      (row.accion && row.accion.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div>
      {/* Barra de búsqueda */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search 
          style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            color: '#9CA3AF'
          }} 
        />
        <input
          type="text"
          placeholder="Buscar en el plan de acción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: '40px',
            paddingRight: '16px',
            paddingTop: '10px',
            paddingBottom: '10px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#111827';
            e.target.style.boxShadow = '0 0 0 3px rgba(17, 24, 39, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#E5E7EB';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Tabla */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F3F4F6', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: '150px',
                }}>
                  Eje
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: '200px',
                }}>
                  Meta
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: '150px',
                }}>
                  Indicador
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: '200px',
                }}>
                  Acción
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'right',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: '150px',
                }}>
                  Presupuesto
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: '60px',
                }}>
                  T1
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: '60px',
                }}>
                  T2
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: '60px',
                }}>
                  T3
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  width: '60px',
                }}>
                  T4
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={9}
                    style={{
                      padding: '48px 24px',
                      textAlign: 'center',
                      color: '#9CA3AF',
                      fontSize: '14px',
                    }}
                  >
                    No se encontraron resultados
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr
                    key={row.id}
                    style={{ borderBottom: '1px solid #F3F4F6' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    {/* Columna Eje */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: '500', color: '#111827', fontSize: '14px' }}>
                        {row.eje_nombre}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                        {row.sub_eje_nombre}
                      </div>
                    </td>

                    {/* Columna Meta */}
                    <td style={{ padding: '16px 24px' }}>
                      {adminMode && onEdit ? (
                        <input
                          type="text"
                          defaultValue={row.meta || ''}
                          placeholder="Ingrese la meta"
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            fontSize: '13px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px',
                            outline: 'none',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#F59E0B';
                            e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                          }}
                          onBlur={(e) => {
                            if (onEdit) onEdit(row.id, 'meta', e.target.value);
                            e.target.style.borderColor = '#E5E7EB';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      ) : (
                        <div style={{
                          fontSize: '13px',
                          color: '#374151',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: '2',
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {row.meta || '-'}
                        </div>
                      )}
                    </td>

                    {/* Columna Indicador */}
                    <td style={{ padding: '16px 24px' }}>
                      {adminMode && onEdit ? (
                        <input
                          type="text"
                          defaultValue={row.indicador || ''}
                          placeholder="Ingrese el indicador"
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            fontSize: '13px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px',
                            outline: 'none',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#F59E0B';
                            e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                          }}
                          onBlur={(e) => {
                            if (onEdit) onEdit(row.id, 'indicador', e.target.value);
                            e.target.style.borderColor = '#E5E7EB';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      ) : (
                        <div style={{ fontSize: '13px', color: '#374151' }}>
                          {row.indicador || '-'}
                        </div>
                      )}
                    </td>

                    {/* Columna Acción */}
                    <td style={{ padding: '16px 24px' }}>
                      {editable && onEdit ? (
                        <input
                          type="text"
                          defaultValue={row.accion || ''}
                          placeholder="Doble click para editar"
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            fontSize: '13px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px',
                            outline: 'none',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#111827';
                            e.target.style.boxShadow = '0 0 0 3px rgba(17, 24, 39, 0.1)';
                          }}
                          onBlur={(e) => {
                            if (onEdit) onEdit(row.id, 'accion', e.target.value);
                            e.target.style.borderColor = '#E5E7EB';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      ) : (
                        <div style={{ fontSize: '13px', color: '#374151' }}>
                          {row.accion || '-'}
                        </div>
                      )}
                    </td>

                    {/* Columna Presupuesto */}
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      {editable && onEdit ? (
                        <input
                          type="text"
                          defaultValue={row.presupuesto || ''}
                          placeholder="0"
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            fontSize: '13px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px',
                            outline: 'none',
                            textAlign: 'right',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#111827';
                            e.target.style.boxShadow = '0 0 0 3px rgba(17, 24, 39, 0.1)';
                          }}
                          onBlur={(e) => {
                            if (onEdit) onEdit(row.id, 'presupuesto', e.target.value);
                            e.target.style.borderColor = '#E5E7EB';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      ) : (
                        <div style={{ fontWeight: '500', color: '#111827', fontSize: '13px' }}>
                          {formatCurrency(row.presupuesto)}
                        </div>
                      )}
                    </td>

                    {/* Columna T1 */}
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {editable && onCheckboxChange ? (
                          <button
                            onClick={() => onCheckboxChange(row.id, 't1', row.t1 || false)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                          >
                            {row.t1 ? (
                              <CheckSquare style={{ width: '20px', height: '20px', color: '#2563EB' }} />
                            ) : (
                              <Square style={{ width: '20px', height: '20px', color: '#9CA3AF' }} />
                            )}
                          </button>
                        ) : row.t1 ? (
                          <CheckSquare style={{ width: '20px', height: '20px', color: '#2563EB' }} />
                        ) : (
                          <Square style={{ width: '20px', height: '20px', color: '#D1D5DB' }} />
                        )}
                      </div>
                    </td>

                    {/* Columna T2 */}
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {editable && onCheckboxChange ? (
                          <button
                            onClick={() => onCheckboxChange(row.id, 't2', row.t2 || false)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                          >
                            {row.t2 ? (
                              <CheckSquare style={{ width: '20px', height: '20px', color: '#2563EB' }} />
                            ) : (
                              <Square style={{ width: '20px', height: '20px', color: '#9CA3AF' }} />
                            )}
                          </button>
                        ) : row.t2 ? (
                          <CheckSquare style={{ width: '20px', height: '20px', color: '#2563EB' }} />
                        ) : (
                          <Square style={{ width: '20px', height: '20px', color: '#D1D5DB' }} />
                        )}
                      </div>
                    </td>

                    {/* Columna T3 */}
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {editable && onCheckboxChange ? (
                          <button
                            onClick={() => onCheckboxChange(row.id, 't3', row.t3 || false)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                          >
                            {row.t3 ? (
                              <CheckSquare style={{ width: '20px', height: '20px', color: '#2563EB' }} />
                            ) : (
                              <Square style={{ width: '20px', height: '20px', color: '#9CA3AF' }} />
                            )}
                          </button>
                        ) : row.t3 ? (
                          <CheckSquare style={{ width: '20px', height: '20px', color: '#2563EB' }} />
                        ) : (
                          <Square style={{ width: '20px', height: '20px', color: '#D1D5DB' }} />
                        )}
                      </div>
                    </td>

                    {/* Columna T4 */}
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {editable && onCheckboxChange ? (
                          <button
                            onClick={() => onCheckboxChange(row.id, 't4', row.t4 || false)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                          >
                            {row.t4 ? (
                              <CheckSquare style={{ width: '20px', height: '20px', color: '#2563EB' }} />
                            ) : (
                              <Square style={{ width: '20px', height: '20px', color: '#9CA3AF' }} />
                            )}
                          </button>
                        ) : row.t4 ? (
                          <CheckSquare style={{ width: '20px', height: '20px', color: '#2563EB' }} />
                        ) : (
                          <Square style={{ width: '20px', height: '20px', color: '#D1D5DB' }} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB',
          fontSize: '14px',
          color: '#6B7280',
        }}>
          Mostrando {filteredData.length} de {data.length} registros
        </div>
      </div>
    </div>
  );
};
