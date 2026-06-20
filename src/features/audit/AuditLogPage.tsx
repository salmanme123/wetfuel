import { PageHeader } from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { DataTable, TablePagination, type Column } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { useTable } from '@/hooks/useTable';
import { mockAuditLog } from '@/mock';
import { formatDateTime } from '@/lib/format';
import type { AuditLogEntry } from '@/types';

const actionColors: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  create: 'success', update: 'info', delete: 'error', login: 'default', logout: 'default',
  assign: 'info', status_change: 'warning', sync: 'success', suspend: 'error', reactivate: 'success',
};

const entityOptions = [
  { label: 'Tenant', value: 'tenant' }, { label: 'Organization', value: 'organization' },
  { label: 'User', value: 'user' }, { label: 'Driver', value: 'driver' },
  { label: 'Customer', value: 'customer' }, { label: 'Job', value: 'job' },
  { label: 'Vehicle', value: 'vehicle' }, { label: 'Equipment', value: 'equipment' },
  { label: 'Invoice', value: 'invoice' }, { label: 'Pricing Rule', value: 'pricing_rule' },
  { label: 'Fuel Transfer', value: 'fuel_transfer' },
];

const actionOptions = [
  { label: 'Create', value: 'create' }, { label: 'Update', value: 'update' },
  { label: 'Delete', value: 'delete' }, { label: 'Assign', value: 'assign' },
  { label: 'Status Change', value: 'status_change' }, { label: 'Sync', value: 'sync' },
  { label: 'Login', value: 'login' }, { label: 'Suspend', value: 'suspend' },
];

export function AuditLogPage() {
  const table = useTable<AuditLogEntry & Record<string, unknown>>({
    data: mockAuditLog as (AuditLogEntry & Record<string, unknown>)[],
    searchKeys: ['userName', 'entityName', 'description'],
    defaultPageSize: 15,
  });

  const columns: Column<AuditLogEntry & Record<string, unknown>>[] = [
    { key: 'timestamp', header: 'Time', sortable: true, width: '170px', render: (e) => <span className="text-xs text-gray-500">{formatDateTime((e as unknown as AuditLogEntry).timestamp)}</span> },
    { key: 'userName', header: 'User', sortable: true, render: (e) => { const entry = e as unknown as AuditLogEntry; return (<div><p className="text-sm font-medium">{entry.userName}</p><p className="text-xs text-gray-400">{entry.userRole}</p></div>); } },
    { key: 'action', header: 'Action', render: (e) => { const entry = e as unknown as AuditLogEntry; return <Badge variant={actionColors[entry.action]}>{entry.action.replace('_', ' ')}</Badge>; } },
    { key: 'entity', header: 'Entity', render: (e) => { const entry = e as unknown as AuditLogEntry; return <Badge variant="default">{entry.entity.replace('_', ' ')}</Badge>; } },
    { key: 'entityName', header: 'Record', render: (e) => <span className="font-medium text-gray-900">{(e as unknown as AuditLogEntry).entityName}</span> },
    { key: 'description', header: 'Description', render: (e) => <span className="text-sm text-gray-600">{(e as unknown as AuditLogEntry).description}</span> },
    { key: 'changes', header: 'Changes', width: '180px', render: (e) => { const entry = e as unknown as AuditLogEntry; if (!entry.changes) return <span className="text-gray-400">—</span>; return (<div className="space-y-1">{entry.changes.map((c, i) => (<div key={i} className="text-xs"><span className="text-gray-500">{c.field}:</span> <span className="text-red-500 line-through">{c.oldValue || '(empty)'}</span> → <span className="text-green-600">{c.newValue}</span></div>))}</div>); } },
  ];

  return (
    <div>
      <PageHeader title="Audit Log" description="Complete record of who changed what, when, and on which record" />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <SearchInput value={table.searchTerm} onChange={table.setSearchTerm} placeholder="Search by user, record, or description..." className="w-96" />
        <Select options={actionOptions} placeholder="All Actions" value={table.filters['action'] ?? ''} onChange={(e) => table.setFilter('action', e.target.value)} />
        <Select options={entityOptions} placeholder="All Entities" value={table.filters['entity'] ?? ''} onChange={(e) => table.setFilter('entity', e.target.value)} />
        {Object.keys(table.filters).length > 0 && <button onClick={table.clearFilters} className="text-sm text-brand-600 hover:underline">Clear</button>}
      </div>

      <DataTable columns={columns} data={table.filteredData} onSort={table.handleSort} sortConfig={table.sortConfig} keyExtractor={(e) => (e as unknown as AuditLogEntry).id} />
      <TablePagination page={table.page} totalPages={table.totalPages} totalItems={table.totalItems} pageSize={table.pageSize} onPageChange={table.setPage} />
    </div>
  );
}
