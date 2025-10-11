// src/components/ui/SearchableSelect.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  createInputStyle,
  colors, 
  spacing,
  borderRadius,
  shadows
} from '@/lib/styleUtils';

interface Option {
  value: number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Seleccionar área",
  style
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrar opciones basado en el término de búsqueda
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Actualizar el valor mostrado cuando cambia el value prop
  useEffect(() => {
    const selectedOption = options.find(opt => opt.value === value);
    setDisplayValue(selectedOption ? selectedOption.label : '');
    setSearchTerm('');
  }, [value, options]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Verificar si el click es en el input o en el dropdown
      if (containerRef.current && !containerRef.current.contains(target)) {
        // Si es un portal dropdown, verificar si el click es dentro del dropdown
        const dropdownElements = document.querySelectorAll('[data-searchable-dropdown]');
        let isClickInDropdown = false;
        
        dropdownElements.forEach(dropdown => {
          if (dropdown.contains(target)) {
            isClickInDropdown = true;
          }
        });
        
        if (!isClickInDropdown) {
          setIsOpen(false);
          setSearchTerm('');
          // Restaurar el display value si no se seleccionó nada
          const selectedOption = options.find(opt => opt.value === value);
          setDisplayValue(selectedOption ? selectedOption.label : '');
        }
      }
    };

    const handleResize = () => {
      // Ya no necesitamos recalcular posición
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [value, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setDisplayValue(newValue);
    setIsOpen(true);
  };

  const handleOptionClick = (option: Option) => {
    onChange(option.value);
    setDisplayValue(option.label);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleArrowClick = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
      const selectedOption = options.find(opt => opt.value === value);
      setDisplayValue(selectedOption ? selectedOption.label : '');
    }
  };

  // Estilos
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    ...style
  };

  const inputStyle = {
    ...createInputStyle(false, isOpen),
    cursor: 'text',
    paddingRight: '2rem'
  };

  const arrowStyle: React.CSSProperties = {
    position: 'absolute',
    right: spacing.sm,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'auto',
    cursor: 'pointer',
    color: colors.gray[400],
    fontSize: '0.8rem',
    transition: 'transform 0.2s ease',
    ...(isOpen && { transform: 'translateY(-50%) rotate(180deg)' })
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    boxShadow: shadows.lg,
    zIndex: 10000,
    maxHeight: '200px',
    overflowY: 'auto',
    marginTop: '2px'
  };

  const optionStyle: React.CSSProperties = {
    padding: `${spacing.sm} ${spacing.md}`,
    cursor: 'pointer',
    fontSize: '0.875rem',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.gray[100],
    transition: 'background-color 0.15s ease'
  };

  const optionHoverStyle: React.CSSProperties = {
    backgroundColor: colors.gray[50]
  };

  const selectedOptionStyle: React.CSSProperties = {
    backgroundColor: colors.gray[100],
    fontWeight: '500'
  };

  const noOptionsStyle: React.CSSProperties = {
    padding: `${spacing.md}`,
    textAlign: 'center',
    color: '#111827',
    fontSize: '0.875rem',
    fontStyle: 'italic'
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={inputStyle}
        autoComplete="off"
      />
      
      {/* Flecha indicadora */}
      <span style={arrowStyle} onClick={handleArrowClick}>▼</span>

      {/* Dropdown con opciones */}
      {isOpen && (
        <div style={dropdownStyle} data-searchable-dropdown="true">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                style={{
                  ...optionStyle,
                  color: '#111827',
                  ...(option.value === value ? selectedOptionStyle : {})
                }}
                onMouseEnter={(e) => {
                  if (option.value !== value) {
                    Object.assign(e.currentTarget.style, optionHoverStyle);
                  }
                }}
                onMouseLeave={(e) => {
                  if (option.value !== value) {
                    Object.assign(e.currentTarget.style, optionStyle);
                  }
                }}
                onClick={() => handleOptionClick(option)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div style={noOptionsStyle}>
              No se encontraron áreas
            </div>
          )}
        </div>
      )}
    </div>
  );
};