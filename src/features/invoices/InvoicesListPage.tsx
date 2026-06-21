import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, TablePagination, type Column } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { useTable } from '@/hooks/useTable';
import { useToast } from '@/hooks/useToast';
import { mockInvoices } from '@/mock';
import { formatCurrency, formatDate } from '@/lib/format';
import { FileText, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Invoice } from '@/types';

const statusColors: Record<string, 'default' | 'info' | 'success' | 'error' | 'warning'> = { draft: 'default', sent: 'info', paid: 'success', overdue: 'error', cancelled: 'warning' };

export function InvoicesListPage() {
  const { addToast } = useToast();

  const totalOutstanding = mockInvoices.filter((i) => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.total, 0);
  const totalPaid = mockInvoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const overdueCount = mockInvoices.filter((i) => i.status === 'overdue').length;

  const table = useTable<Invoice & Record<string, unknown>>({
    data: mockInvoices as (Invoice & Record<string, unknown>)[],
    searchKeys: ['invoiceNumber', 'customerName'],
  });

  const columns: Column<Invoice & Record<string, unknown>>[] = [
    { key: 'invoiceNumber', header: 'Invoice #', sortable: true, render: (i) => <span className="font-mono text-primary">{(i as unknown as Invoice).invoiceNumber}</span> },
    { key: 'customerName', header: 'Customer', sortable: true },
    { key: 'status', header: 'Status', render: (i) => { const inv = i as unknown as Invoice; return <Badge variant={statusColors[inv.status]}>{inv.status}</Badge>; } },
    { key: 'issueDate', header: 'Issue Date', sortable: true, render: (i) => formatDate((i as unknown as Invoice).issueDate) },
    { key: 'dueDate', header: 'Due Date', sortable: true, render: (i) => { const inv = i as unknown as Invoice; const isOverdue = inv.status === 'overdue'; return <span className={isOverdue ? 'text-red-400 font-medium' : ''}>{formatDate(inv.dueDate)}</span>; } },
    { key: 'subtotal', header: 'Subtotal', sortable: true, render: (i) => formatCurrency((i as unknown as Invoice).subtotal) },
    { key: 'taxTotal', header: 'Tax', render: (i) => formatCurrency((i as unknown as Invoice).taxTotal) },
    { key: 'total', header: 'Total', sortable: true, render: (i) => <span className="font-medium">{formatCurrency((i as unknown as Invoice).total)}</span> },
    { key: 'quickbooksSynced', header: 'QB Sync', render: (i) => (i as unknown as Invoice).quickbooksSynced ? <Badge variant="success">Synced</Badge> : <Badge variant="default">Pending</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Invoicing & Finance" description="Generate invoices, track payments, and sync with QuickBooks" actions={
        <Button onClick={() => addToast({ type: 'info', title: 'Generate invoice from completed jobs' })}>Generate Invoice</Button>
      } />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatsCard title="Total Invoices" value={mockInvoices.length} icon={FileText} />
        <StatsCard title="Outstanding" value={formatCurrency(totalOutstanding)} icon={DollarSign} iconColor="text-amber-400 bg-amber-500/15" />
        <StatsCard title="Collected" value={formatCurrency(totalPaid)} icon={CheckCircle} iconColor="text-emerald-400 bg-emerald-500/10" />
        <StatsCard title="Overdue" value={overdueCount} icon={AlertTriangle} iconColor="text-red-400 bg-red-100" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <SearchInput value={table.searchTerm} onChange={table.setSearchTerm} placeholder="Search by invoice # or customer..." className="w-80" />
        <Select options={[{ label: 'Draft', value: 'draft' }, { label: 'Sent', value: 'sent' }, { label: 'Paid', value: 'paid' }, { label: 'Overdue', value: 'overdue' }, { label: 'Cancelled', value: 'cancelled' }]} placeholder="All Statuses" value={table.filters['status'] ?? ''} onChange={(e) => table.setFilter('status', e.target.value)} />
      </div>

      <DataTable columns={columns} data={table.filteredData} onSort={table.handleSort} sortConfig={table.sortConfig} keyExtractor={(i) => (i as unknown as Invoice).id} />
      <TablePagination page={table.page} totalPages={table.totalPages} totalItems={table.totalItems} pageSize={table.pageSize} onPageChange={table.setPage} />
    </div>
  );
}
