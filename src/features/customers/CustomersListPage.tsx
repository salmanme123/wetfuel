import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, TablePagination, type Column } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useTable } from '@/hooks/useTable';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { mockCustomers } from '@/mock';
import { CUSTOMER_CATEGORIES, BILLING_TERMS, PRICING_MODELS } from '@/lib/constants';
import { formatGallons, formatCurrency } from '@/lib/format';
import { Plus } from 'lucide-react';
import type { Customer } from '@/types';

const categoryVariants: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
  commercial: 'info',
  residential: 'success',
  government: 'warning',
  industrial: 'default',
};

export function CustomersListPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const modal = useModal<Customer>();
  const [customers] = useState(mockCustomers);

  const table = useTable<Customer & Record<string, unknown>>({
    data: customers as (Customer & Record<string, unknown>)[],
    searchKeys: ['companyName', 'contactName'],
  });

  const columns: Column<Customer & Record<string, unknown>>[] = [
    { key: 'companyName', header: 'Company', sortable: true, render: (c) => <span className="font-medium text-gray-900">{(c as unknown as Customer).companyName}</span> },
    { key: 'category', header: 'Category', render: (c) => { const cat = (c as unknown as Customer).category; return <Badge variant={categoryVariants[cat]}>{cat}</Badge>; } },
    { key: 'contactName', header: 'Contact', sortable: true },
    { key: 'billingTerm', header: 'Billing' },
    { key: 'pricingModel', header: 'Pricing', render: (c) => { const pm = (c as unknown as Customer).pricingModel; return pm === 'opis' ? 'OPIS' : pm === 'tank_cost' ? 'Tank Cost' : 'Hybrid'; } },
    { key: 'sites', header: 'Sites', render: (c) => (c as unknown as Customer).sites.length },
    { key: 'totalDeliveries', header: 'Deliveries', sortable: true },
    { key: 'totalGallonsDelivered', header: 'Total Gallons', sortable: true, render: (c) => formatGallons((c as unknown as Customer).totalGallonsDelivered) },
    { key: 'outstandingBalance', header: 'Balance', sortable: true, render: (c) => formatCurrency((c as unknown as Customer).outstandingBalance) },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={(c as unknown as Customer).status} type="user" /> },
  ];

  return (
    <div>
      <PageHeader
        title="Customer Management"
        description="Manage customers and their delivery locations"
        actions={
          <Button onClick={() => modal.open()}>
            <Plus className="h-4 w-4" /> Add Customer
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <SearchInput value={table.searchTerm} onChange={table.setSearchTerm} placeholder="Search by company or contact..." className="w-80" />
        <Select options={CUSTOMER_CATEGORIES} placeholder="All Categories" value={table.filters['category'] ?? ''} onChange={(e) => table.setFilter('category', e.target.value)} />
        <Select options={BILLING_TERMS} placeholder="All Billing" value={table.filters['billingTerm'] ?? ''} onChange={(e) => table.setFilter('billingTerm', e.target.value)} />
        <Select options={PRICING_MODELS} placeholder="All Pricing" value={table.filters['pricingModel'] ?? ''} onChange={(e) => table.setFilter('pricingModel', e.target.value)} />
        {Object.keys(table.filters).length > 0 && <Button variant="ghost" onClick={table.clearFilters}>Clear</Button>}
      </div>

      <DataTable columns={columns} data={table.filteredData} onSort={table.handleSort} sortConfig={table.sortConfig} onRowClick={(c) => navigate(`/customers/${(c as unknown as Customer).id}`)} keyExtractor={(c) => (c as unknown as Customer).id} />
      <TablePagination page={table.page} totalPages={table.totalPages} totalItems={table.totalItems} pageSize={table.pageSize} onPageChange={table.setPage} />

      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Add Customer" size="lg" footer={
        <>
          <Button variant="outline" onClick={modal.close}>Cancel</Button>
          <Button onClick={() => { addToast({ type: 'success', title: 'Customer created' }); modal.close(); }}>Create Customer</Button>
        </>
      }>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Company Name" placeholder="e.g. Lone Star Construction" />
          <Select label="Category" options={CUSTOMER_CATEGORIES} placeholder="Select category" />
          <Input label="Contact Name" placeholder="John Doe" />
          <Input label="Contact Email" type="email" placeholder="john@company.com" />
          <Input label="Contact Phone" placeholder="(555) 000-0000" />
          <Select label="Billing Term" options={BILLING_TERMS} placeholder="Select term" />
          <Select label="Pricing Model" options={PRICING_MODELS} placeholder="Select model" />
        </div>
      </Modal>
    </div>
  );
}
