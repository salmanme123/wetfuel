export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  key: string;
  value: string | string[];
}

export interface SelectOption {
  label: string;
  value: string;
  badge?: string;
}

export type Status = 'active' | 'inactive' | 'suspended';
