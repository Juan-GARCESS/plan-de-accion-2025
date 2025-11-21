// src/hooks/useSearch.ts
import { useState, useMemo } from 'react';

interface UseSearchProps<T> {
  data: T[];
  searchKeys: (keyof T)[];
}

export function useSearch<T>({ data, searchKeys }: UseSearchProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar datos basándose en el término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return data;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();

    return data.filter(item => {
      return searchKeys.some(key => {
        const value = item[key];
        if (value === null || value === undefined) return false;
        
        return String(value)
          .toLowerCase()
          .includes(lowerSearchTerm);
      });
    });
  }, [data, searchTerm, searchKeys]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData
  };
}
