import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, TablePagination, type Column } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { useTable } from '@/hooks/useTable';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { mockDrivers } from '@/mock';
import { formatGallons } from '@/lib/format';
import { Plus, Eye } from 'lucide-react';
import type { Driver } from '@/types';

const shiftColors: Record<string, 'success' | 'default' | 'warning'> = {
  clocked_in: 'success',
  clocked_out: 'default',
  on_break: 'warning',
};
const shiftLabels: Record<string, string> = {
  clocked_in: 'Clocked In',
  clocked_out: 'Clocked Out',
  on_break: 'On Break',
};
const statusColors: Record<string, 'success' | 'default' | 'warning'> = {
  active: 'success',
  inactive: 'default',
  on_leave: 'warning',
};

export function DriversListPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const modal = useModal<Driver>();

  const table = useTable<Driver & Record<string, unknown>>({
    data: mockDrivers as (Driver & Record<string, unknown>)[],
    searchKeys: ['firstName', 'lastName', 'email'],
  });

  const openDriverDetail = (driver: Driver) => {
    navigate(`/drivers/${driver.id}`, { state: { driver } });
  };

  const columns: Column<Driver & Record<string, unknown>>[] = [
    {
      key: 'name',
      header: 'Driver',
      render: (d) => {
        const dr = d as unknown as Driver;
        return (
          <div className="flex items-center gap-3">
            <Avatar firstName={dr.firstName} lastName={dr.lastName} size="sm" />
            <div>
              <p className="font-medium text-gray-900">{dr.firstName} {dr.lastName}</p>
              <p className="text-xs text-gray-500">{dr.organizationName}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'shiftStatus',
      header: 'Shift',
      render: (d) => {
        const dr = d as unknown as Driver;
        return <Badge variant={shiftColors[dr.shiftStatus]}>{shiftLabels[dr.shiftStatus]}</Badge>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => (
        <Badge variant={statusColors[(d as unknown as Driver).status]}>
          {(d as unknown as Driver).status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'license',
      header: 'License',
      render: (d) => {
        const dr = d as unknown as Driver;
        return <span className="text-sm">{dr.license.type} — {dr.license.state}</span>;
      },
    },
    {
      key: 'assignedVehicleName',
      header: 'Vehicle',
      render: (d) => (d as unknown as Driver).assignedVehicleName ?? <span className="text-gray-400">None</span>,
    },
    { key: 'totalDeliveries', header: 'Deliveries', sortable: true },
    {
      key: 'totalGallonsDelivered',
      header: 'Gallons',
      sortable: true,
      render: (d) => formatGallons((d as unknown as Driver).totalGallonsDelivered),
    },
    {
      key: 'complianceScore',
      header: 'Compliance',
      sortable: true,
      render: (d) => {
        const score = (d as unknown as Driver).complianceScore;
        return (
          <span
            className={
              score >= 90
                ? 'font-medium text-green-600'
                : score >= 80
                  ? 'font-medium text-yellow-600'
                  : 'font-medium text-red-600'
            }
          >
            {score}%
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '80px',
      render: (d) => {
        const dr = d as unknown as Driver;
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openDriverDetail(dr);
            }}
            className="cursor-pointer rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Driver Management"
        description="Manage drivers, licenses, certifications, and shifts"
        actions={
          <Button onClick={() => modal.open()}><Plus className="h-4 w-4" /> Add Driver</Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <SearchInput
          value={table.searchTerm}
          onChange={table.setSearchTerm}
          placeholder="Search drivers..."
          className="w-80"
        />
        <Select
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'On Leave', value: 'on_leave' },
          ]}
          placeholder="All Statuses"
          value={table.filters['status'] ?? ''}
          onChange={(e) => table.setFilter('status', e.target.value)}
        />
        <Select
          options={[
            { label: 'Clocked In', value: 'clocked_in' },
            { label: 'Clocked Out', value: 'clocked_out' },
            { label: 'On Break', value: 'on_break' },
          ]}
          placeholder="All Shifts"
          value={table.filters['shiftStatus'] ?? ''}
          onChange={(e) => table.setFilter('shiftStatus', e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={table.filteredData}
        onSort={table.handleSort}
        sortConfig={table.sortConfig}
        onRowClick={(d) => openDriverDetail(d as unknown as Driver)}
        keyExtractor={(d) => (d as unknown as Driver).id}
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
        title="Add Driver"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={modal.close}>Cancel</Button>
            <Button onClick={() => { addToast({ type: 'success', title: 'Driver added' }); modal.close(); }}>
              Add Driver
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First Name" placeholder="Dave" />
          <Input label="Last Name" placeholder="Henderson" />
          <Input label="Email" type="email" placeholder="dave@wetfuel.com" />
          <Input label="Phone" placeholder="(555) 000-0000" />
          <Select
            label="License Type"
            options={[
              { label: 'CDL-A', value: 'CDL-A' },
              { label: 'CDL-B', value: 'CDL-B' },
              { label: 'CDL-C', value: 'CDL-C' },
              { label: 'Standard', value: 'standard' },
            ]}
            placeholder="Select license"
          />
          <Input label="License Number" placeholder="TX-CDL-00000" />
          <Input label="License Expiry" type="date" />
          <Input label="Hire Date" type="date" />
        </div>
      </Modal>
    </div>
  );
}
