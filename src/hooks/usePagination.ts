// src/hooks/usePagination.ts
import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  pageSize?: number;
}

export function usePagination<T>({ data, pageSize = 10 }: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular total de páginas
  const totalPages = Math.ceil(data.length / pageSize);

  // Obtener datos de la página actual
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  // Cambiar de página
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Resetear a la primera página (útil cuando cambian filtros)
  const resetPage = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    resetPage,
    totalItems: data.length,
    pageSize
  };
}
