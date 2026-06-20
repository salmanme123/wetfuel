import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { DataTable, TablePagination, type Column } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTable } from '@/hooks/useTable';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { mockTenants } from '@/mock';
import { formatDate } from '@/lib/format';
import { TENANT_STATUSES } from '@/lib/constants';
import { Plus } from 'lucide-react';
import type { Tenant } from '@/types';
import { useState } from 'react';

export function TenantsListPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const modal = useModal<Tenant>();
  const [tenants] = useState(mockTenants);

  const table = useTable<Tenant & Record<string, unknown>>({
    data: tenants as (Tenant & Record<string, unknown>)[],
    searchKeys: ['companyName', 'tenantCode'],
  });

  const columns: Column<Tenant & Record<string, unknown>>[] = [
    { key: 'tenantCode', header: 'Code', sortable: true, width: '120px', render: (t) => <span className="font-mono text-brand-600">{(t as unknown as Tenant).tenantCode}</span> },
    { key: 'companyName', header: 'Company Name', sortable: true },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={(t as unknown as Tenant).status} type="tenant" /> },
    { key: 'franchiseCount', header: 'Franchises', sortable: true },
    { key: 'userCount', header: 'Users', sortable: true },
    { key: 'contactEmail', header: 'Contact' },
    { key: 'createdAt', header: 'Created', sortable: true, render: (t) => formatDate((t as unknown as Tenant).createdAt) },
  ];

  return (
    <div>
      <PageHeader
        title="Tenant Management"
        description="Manage all companies using the WetFuel platform"
        actions={
          <Button onClick={() => modal.open()}>
            <Plus className="h-4 w-4" /> Add Tenant
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-4">
        <SearchInput
          value={table.searchTerm}
          onChange={table.setSearchTerm}
          placeholder="Search by name or code..."
          className="w-80"
        />
        <Select
          options={TENANT_STATUSES.map((s) => ({ label: s.label, value: s.value }))}
          placeholder="All Statuses"
          value={table.filters['status'] ?? ''}
          onChange={(e) => table.setFilter('status', e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={table.filteredData}
        onSort={table.handleSort}
        sortConfig={table.sortConfig}
        onRowClick={(t) => navigate(`/tenants/${(t as unknown as Tenant).id}`)}
        keyExtractor={(t) => (t as unknown as Tenant).id}
      />
      <TablePagination
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.totalItems}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
      />

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={modal.data ? 'Edit Tenant' : 'Add New Tenant'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={modal.close}>Cancel</Button>
            <Button onClick={() => { addToast({ type: 'success', title: modal.data ? 'Tenant updated' : 'Tenant created successfully' }); modal.close(); }}>
              {modal.data ? 'Save Changes' : 'Create Tenant'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Company Name" placeholder="e.g. AcmeFuel" defaultValue={modal.data?.companyName} />
          <Input label="Tenant Code" placeholder="e.g. ACME-014" defaultValue={modal.data?.tenantCode} />
          <Input label="Contact Email" type="email" placeholder="admin@company.com" defaultValue={modal.data?.contactEmail} />
          <Input label="Contact Phone" placeholder="(555) 000-0000" defaultValue={modal.data?.contactPhone} />
          <Input label="Address" placeholder="Full address" className="sm:col-span-2" defaultValue={modal.data?.address} />
          <Input label="Primary Color" type="color" defaultValue={modal.data?.branding.primaryColor ?? '#2563eb'} />
          <Input label="Secondary Color" type="color" defaultValue={modal.data?.branding.secondaryColor ?? '#1e40af'} />
        </div>
      </Modal>
    </div>
  );
}
