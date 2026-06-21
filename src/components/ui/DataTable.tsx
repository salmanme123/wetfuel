import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { SortConfig } from '@/types';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onSort?: (key: string) => void;
  sortConfig?: SortConfig | null;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  keyExtractor: (item: T) => string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onSort,
  sortConfig,
  onRowClick,
  emptyMessage = 'No data found',
  isLoading = false,
  keyExtractor,
}: DataTableProps<T>) {
  const renderSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-primary" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                  col.sortable && 'cursor-pointer select-none hover:text-foreground',
                )}
                style={col.width ? { width: col.width } : undefined}
                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && renderSortIcon(col.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-accent/50',
                )}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
                    {col.render ? col.render(item) : String(item[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

interface TablePaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({ page, totalPages, totalItems, pageSize, onPageChange }: TablePaginationProps) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Showing {start} to {end} of {totalItems} results
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (page <= 3) {
            pageNum = i + 1;
          } else if (page >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = page - 2 + i;
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium',
                pageNum === page
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent',
              )}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
