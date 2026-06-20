import { useState, useMemo } from 'react';
import type { SortConfig } from '@/types';
import { useDebounce } from './useDebounce';

interface UseTableOptions<T> {
  data: T[];
  searchKeys?: (keyof T)[];
  defaultPageSize?: number;
}

export function useTable<T extends Record<string, unknown>>({
  data,
  searchKeys = [],
  defaultPageSize = 10,
}: UseTableOptions<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const debouncedSearch = useDebounce(searchTerm);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => {
      if (!value) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setPage(1);
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    if (debouncedSearch && searchKeys.length > 0) {
      const lowerSearch = debouncedSearch.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const val = item[key];
          return typeof val === 'string' && val.toLowerCase().includes(lowerSearch);
        }),
      );
    }

    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        result = result.filter((item) => String(item[key]) === value);
      }
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, debouncedSearch, searchKeys, filters, sortConfig]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safetyPage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safetyPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, safetyPage, pageSize]);

  return {
    searchTerm,
    setSearchTerm: (val: string) => { setSearchTerm(val); setPage(1); },
    sortConfig,
    handleSort,
    filters,
    setFilter,
    clearFilters,
    page: safetyPage,
    setPage,
    pageSize,
    setPageSize: (size: number) => { setPageSize(size); setPage(1); },
    filteredData: paginatedData,
    totalItems,
    totalPages,
  };
}
