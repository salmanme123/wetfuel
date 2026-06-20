import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, TablePagination, type Column } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { useTable } from '@/hooks/useTable';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { mockDrivers } from '@/mock';
import { formatGallons, formatDate } from '@/lib/format';
import { Plus, Clock, Truck, Shield } from 'lucide-react';
import { useState } from 'react';
import type { Driver } from '@/types';

const shiftColors: Record<string, 'success' | 'default' | 'warning'> = { clocked_in: 'success', clocked_out: 'default', on_break: 'warning' };
const shiftLabels: Record<string, string> = { clocked_in: 'Clocked In', clocked_out: 'Clocked Out', on_break: 'On Break' };
const statusColors: Record<string, 'success' | 'default' | 'warning'> = { active: 'success', inactive: 'default', on_leave: 'warning' };

export function DriversListPage() {
  const { addToast } = useToast();
  const modal = useModal<Driver>();
  const [selected, setSelected] = useState<Driver | null>(null);

  const table = useTable<Driver & Record<string, unknown>>({
    data: mockDrivers as (Driver & Record<string, unknown>)[],
    searchKeys: ['firstName', 'lastName', 'email'],
  });

  const columns: Column<Driver & Record<string, unknown>>[] = [
    { key: 'name', header: 'Driver', render: (d) => { const dr = d as unknown as Driver; return (
      <div className="flex items-center gap-3">
        <Avatar firstName={dr.firstName} lastName={dr.lastName} size="sm" />
        <div><p className="font-medium text-gray-900">{dr.firstName} {dr.lastName}</p><p className="text-xs text-gray-500">{dr.organizationName}</p></div>
      </div>); } },
    { key: 'shiftStatus', header: 'Shift', render: (d) => { const dr = d as unknown as Driver; return <Badge variant={shiftColors[dr.shiftStatus]}>{shiftLabels[dr.shiftStatus]}</Badge>; } },
    { key: 'status', header: 'Status', render: (d) => <Badge variant={statusColors[(d as unknown as Driver).status]}>{(d as unknown as Driver).status}</Badge> },
    { key: 'license', header: 'License', render: (d) => { const dr = d as unknown as Driver; return <span className="text-sm">{dr.license.type} — {dr.license.state}</span>; } },
    { key: 'assignedVehicleName', header: 'Vehicle', render: (d) => (d as unknown as Driver).assignedVehicleName ?? <span className="text-gray-400">None</span> },
    { key: 'totalDeliveries', header: 'Deliveries', sortable: true },
    { key: 'totalGallonsDelivered', header: 'Gallons', sortable: true, render: (d) => formatGallons((d as unknown as Driver).totalGallonsDelivered) },
    { key: 'complianceScore', header: 'Compliance', sortable: true, render: (d) => { const score = (d as unknown as Driver).complianceScore; return <span className={score >= 90 ? 'text-green-600 font-medium' : score >= 80 ? 'text-yellow-600 font-medium' : 'text-red-600 font-medium'}>{score}%</span>; } },
  ];

  return (
    <div>
      <PageHeader title="Driver Management" description="Manage drivers, licenses, certifications, and shifts" actions={
        <Button onClick={() => modal.open()}><Plus className="h-4 w-4" /> Add Driver</Button>
      } />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <SearchInput value={table.searchTerm} onChange={table.setSearchTerm} placeholder="Search drivers..." className="w-80" />
        <Select options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }, { label: 'On Leave', value: 'on_leave' }]} placeholder="All Statuses" value={table.filters['status'] ?? ''} onChange={(e) => table.setFilter('status', e.target.value)} />
        <Select options={[{ label: 'Clocked In', value: 'clocked_in' }, { label: 'Clocked Out', value: 'clocked_out' }, { label: 'On Break', value: 'on_break' }]} placeholder="All Shifts" value={table.filters['shiftStatus'] ?? ''} onChange={(e) => table.setFilter('shiftStatus', e.target.value)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DataTable columns={columns} data={table.filteredData} onSort={table.handleSort} sortConfig={table.sortConfig} onRowClick={(d) => setSelected(d as unknown as Driver)} keyExtractor={(d) => (d as unknown as Driver).id} />
          <TablePagination page={table.page} totalPages={table.totalPages} totalItems={table.totalItems} pageSize={table.pageSize} onPageChange={table.setPage} />
        </div>

        <div>
          {selected ? (
            <Card>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar firstName={selected.firstName} lastName={selected.lastName} size="lg" />
                  <div>
                    <h3 className="text-lg font-semibold">{selected.firstName} {selected.lastName}</h3>
                    <p className="text-sm text-gray-500">{selected.email}</p>
                    <Badge variant={statusColors[selected.status]} className="mt-1">{selected.status}</Badge>
                  </div>
                </div>
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-gray-400" /><span>Hours this week: <strong>{selected.hoursThisWeek}h</strong></span></div>
                  <div className="flex items-center gap-2 text-sm"><Truck className="h-4 w-4 text-gray-400" /><span>Vehicle: <strong>{selected.assignedVehicleName ?? 'None'}</strong></span></div>
                  <div className="flex items-center gap-2 text-sm"><Shield className="h-4 w-4 text-gray-400" /><span>Compliance: <strong>{selected.complianceScore}%</strong></span></div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">License</h4>
                  <p className="text-sm">{selected.license.type} — {selected.license.number}</p>
                  <p className="text-xs text-gray-500">Expires: {formatDate(selected.license.expiryDate)}</p>
                </div>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Certifications ({selected.certifications.length})</h4>
                  {selected.certifications.map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-1">
                      <span className="text-sm">{c.name}</span>
                      <Badge variant={c.status === 'valid' ? 'success' : c.status === 'expiring_soon' ? 'warning' : 'error'}>{c.status.replace('_', ' ')}</Badge>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400">Hired: {formatDate(selected.hireDate)}</p>
              </div>
            </Card>
          ) : (
            <Card><div className="py-8 text-center text-sm text-gray-500">Select a driver to view details</div></Card>
          )}
        </div>
      </div>

      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Add Driver" size="lg" footer={
        <><Button variant="outline" onClick={modal.close}>Cancel</Button><Button onClick={() => { addToast({ type: 'success', title: 'Driver added' }); modal.close(); }}>Add Driver</Button></>
      }>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First Name" placeholder="Dave" />
          <Input label="Last Name" placeholder="Henderson" />
          <Input label="Email" type="email" placeholder="dave@wetfuel.com" />
          <Input label="Phone" placeholder="(555) 000-0000" />
          <Select label="License Type" options={[{ label: 'CDL-A', value: 'CDL-A' }, { label: 'CDL-B', value: 'CDL-B' }, { label: 'CDL-C', value: 'CDL-C' }, { label: 'Standard', value: 'standard' }]} placeholder="Select license" />
          <Input label="License Number" placeholder="TX-CDL-00000" />
          <Input label="License Expiry" type="date" />
          <Input label="Hire Date" type="date" />
        </div>
      </Modal>
    </div>
  );
}
