// src/components/ui/SearchInput.tsx
'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  disabled = false
}) => {
  return (
    <div style={{
      position: 'relative',
      width: '100%'
    }}>
      {/* Icono de búsqueda */}
      <div style={{
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#9ca3af',
        pointerEvents: 'none'
      }}>
        <Search size={18} />
      </div>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '10px 40px 10px 40px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '0.875rem',
          backgroundColor: disabled ? '#f9fafb' : '#ffffff',
          color: '#374151',
          outline: 'none',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#111827';
          e.target.style.boxShadow = '0 0 0 3px rgba(17, 24, 39, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e5e7eb';
          e.target.style.boxShadow = 'none';
        }}
      />

      {/* Botón limpiar */}
      {value && !disabled && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Limpiar búsqueda"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
