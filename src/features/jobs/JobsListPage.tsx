import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { DataTable, TablePagination, type Column } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Select } from '@/components/ui/Select';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useTable } from '@/hooks/useTable';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { mockJobs } from '@/mock';
import { FUEL_TYPES, JOB_STATUSES } from '@/lib/constants';
import { formatGallons, formatDate } from '@/lib/format';
import { Plus } from 'lucide-react';
import type { Job, JobStatus } from '@/types';

export function JobsListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const modal = useModal();
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [jobs] = useState(mockJobs);
  const [siteFilter, setSiteFilter] = useState(() => searchParams.get('siteId') ?? '');
  const [customerFilterFromUrl] = useState(() => searchParams.get('customerId') ?? '');
  const [driverFilterFromUrl] = useState(() => searchParams.get('driverId') ?? '');

  const filteredByStatus = useMemo(() => {
    if (activeStatus === 'all') return jobs;
    return jobs.filter((j) => j.status === activeStatus);
  }, [jobs, activeStatus]);

  const customerOptions = useMemo(() => {
    const seen = new Map<string, string>();
    jobs.forEach((j) => seen.set(j.customerId, j.customerName));
    return Array.from(seen, ([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [jobs]);

  const siteOptions = useMemo(() => {
    const seen = new Map<string, string>();
    jobs.forEach((j) => seen.set(j.siteId, j.siteName));
    return Array.from(seen, ([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [jobs]);

  const driverOptions = useMemo(() => {
    const seen = new Map<string, string>();
    jobs.forEach((j) => {
      if (j.driverId && j.driverName) {
        seen.set(j.driverId, j.driverName);
      }
    });
    const assigned = Array.from(seen, ([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
    const hasUnassigned = jobs.some((j) => !j.driverId);
    return hasUnassigned
      ? [{ label: 'Unassigned', value: 'null' }, ...assigned]
      : assigned;
  }, [jobs]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: jobs.length };
    jobs.forEach((j) => { counts[j.status] = (counts[j.status] ?? 0) + 1; });
    return counts;
  }, [jobs]);

  const statusTabs = [
    { key: 'all', label: 'All', count: statusCounts['all'] },
    ...JOB_STATUSES.map((s) => ({ key: s.value, label: s.label, count: statusCounts[s.value] ?? 0 })),
  ];

  const table = useTable<Job & Record<string, unknown>>({
    data: filteredByStatus as (Job & Record<string, unknown>)[],
    searchKeys: ['jobNumber', 'customerName', 'siteName'],
  });

  useEffect(() => {
    if (customerFilterFromUrl) {
      table.setFilter('customerId', customerFilterFromUrl);
    }
    if (siteFilter) {
      table.setFilter('siteId', siteFilter);
    }
    if (driverFilterFromUrl) {
      table.setFilter('driverId', driverFilterFromUrl);
    }
    // Apply URL filters once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: Column<Job & Record<string, unknown>>[] = [
    { key: 'jobNumber', header: 'Job #', sortable: true, width: '140px', render: (j) => <span className="font-mono text-primary">{(j as unknown as Job).jobNumber}</span> },
    { key: 'priority', header: 'Priority', render: (j) => <StatusBadge status={(j as unknown as Job).priority} type="priority" /> },
    { key: 'customerName', header: 'Customer', sortable: true },
    { key: 'siteName', header: 'Site' },
    { key: 'driverName', header: 'Driver', render: (j) => (j as unknown as Job).driverName ?? <span className="text-muted-foreground/60">Unassigned</span> },
    { key: 'fuelType', header: 'Fuel', render: (j) => { const ft = (j as unknown as Job).fuelType; return ft === 'gasoline_regular' ? 'Gas (Reg)' : ft === 'gasoline_premium' ? 'Gas (Prem)' : ft.charAt(0).toUpperCase() + ft.slice(1); } },
    { key: 'requestedGallons', header: 'Gallons', sortable: true, render: (j) => formatGallons((j as unknown as Job).requestedGallons) },
    { key: 'scheduledDate', header: 'Scheduled', sortable: true, render: (j) => formatDate((j as unknown as Job).scheduledDate) },
    { key: 'status', header: 'Status', render: (j) => <StatusBadge status={(j as unknown as Job).status} type="job" /> },
  ];

  return (
    <div>
      <PageHeader
        title="Jobs & Dispatch"
        description="Manage fuel delivery jobs and dispatch assignments"
        actions={
          <Button onClick={() => modal.open()}>
            <Plus className="h-4 w-4" /> Create Job
          </Button>
        }
      />

      <div className="mb-4">
        <Tabs tabs={statusTabs} activeTab={activeStatus} onChange={(key) => { setActiveStatus(key as JobStatus | 'all'); }} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <SearchInput value={table.searchTerm} onChange={table.setSearchTerm} placeholder="Search by job # or customer..." className="w-80" />
        <SearchableSelect
          options={customerOptions}
          placeholder="All Customers"
          value={table.filters['customerId'] ?? ''}
          onChange={(val) => table.setFilter('customerId', val)}
          className="w-52"
          searchPlaceholder="Search customers..."
        />
        <SearchableSelect
          options={siteOptions}
          placeholder="All Sites"
          value={table.filters['siteId'] ?? ''}
          onChange={(val) => {
            setSiteFilter(val);
            table.setFilter('siteId', val);
          }}
          className="w-52"
          searchPlaceholder="Search sites..."
        />
        <SearchableSelect
          options={driverOptions}
          placeholder="All Drivers"
          value={table.filters['driverId'] ?? ''}
          onChange={(val) => table.setFilter('driverId', val)}
          className="w-52"
          searchPlaceholder="Search drivers..."
        />
        <SearchableSelect
          options={FUEL_TYPES}
          placeholder="All Fuel Types"
          value={table.filters['fuelType'] ?? ''}
          onChange={(val) => table.setFilter('fuelType', val)}
          className="w-52"
          searchPlaceholder="Search fuel types..."
        />
        {(Object.keys(table.filters).length > 0 || table.searchTerm) && (
          <Button variant="ghost" onClick={() => { table.clearFilters(); setSiteFilter(''); }}>Clear</Button>
        )}
      </div>

      <DataTable columns={columns} data={table.filteredData} onSort={table.handleSort} sortConfig={table.sortConfig} onRowClick={(j) => navigate(`/jobs/${(j as unknown as Job).id}`)} keyExtractor={(j) => (j as unknown as Job).id} />
      <TablePagination page={table.page} totalPages={table.totalPages} totalItems={table.totalItems} pageSize={table.pageSize} onPageChange={table.setPage} />

      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Create Job" size="lg" footer={
        <>
          <Button variant="outline" onClick={modal.close}>Cancel</Button>
          <Button onClick={() => { addToast({ type: 'success', title: 'Job created successfully' }); modal.close(); }}>Create Job</Button>
        </>
      }>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Customer" options={mockJobs.filter((j, i, arr) => arr.findIndex((x) => x.customerId === j.customerId) === i).map((j) => ({ label: j.customerName, value: j.customerId }))} placeholder="Select customer" />
          <Select label="Fuel Type" options={FUEL_TYPES} placeholder="Select fuel type" />
          <Input label="Requested Gallons" type="number" placeholder="500" />
          <Select label="Priority" options={[{ label: 'Low', value: 'low' }, { label: 'Normal', value: 'normal' }, { label: 'High', value: 'high' }, { label: 'Urgent', value: 'urgent' }]} placeholder="Select priority" />
          <Input label="Scheduled Date" type="date" />
          <Select label="Time Window" options={[{ label: '04:00 - 08:00', value: '04:00 - 08:00' }, { label: '06:00 - 10:00', value: '06:00 - 10:00' }, { label: '08:00 - 12:00', value: '08:00 - 12:00' }, { label: '12:00 - 16:00', value: '12:00 - 16:00' }]} placeholder="Select window" />
          <Textarea label="Notes" placeholder="Additional instructions..." className="sm:col-span-2" />
        </div>
      </Modal>
    </div>
  );
}
