import { PageHeader } from '@/components/shared/PageHeader';
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
import { mockEquipment } from '@/mock';
import { formatGallons, formatDate } from '@/lib/format';
import { FUEL_TYPES } from '@/lib/constants';
import { Plus, QrCode } from 'lucide-react';
import type { Equipment } from '@/types';

const typeLabels: Record<string, string> = { tank: 'Tank', generator: 'Generator', pump: 'Pump', other: 'Other' };
const statusVariants: Record<string, 'success' | 'default' | 'warning'> = { active: 'success', inactive: 'default', needs_service: 'warning' };

export function EquipmentListPage() {
  const { addToast } = useToast();
  const modal = useModal();

  const table = useTable<Equipment & Record<string, unknown>>({
    data: mockEquipment as (Equipment & Record<string, unknown>)[],
    searchKeys: ['name', 'customerName', 'serialNumber', 'qrCode'],
  });

  const columns: Column<Equipment & Record<string, unknown>>[] = [
    { key: 'name', header: 'Equipment', sortable: true, render: (e) => { const eq = e as unknown as Equipment; return (<div><p className="font-medium text-gray-900">{eq.name}</p><p className="text-xs text-gray-500">{eq.manufacturer} {eq.model}</p></div>); } },
    { key: 'type', header: 'Type', render: (e) => <Badge variant="default">{typeLabels[(e as unknown as Equipment).type]}</Badge> },
    { key: 'customerName', header: 'Customer', sortable: true },
    { key: 'siteName', header: 'Site' },
    { key: 'qrCode', header: 'QR Code', render: (e) => (<span className="flex items-center gap-1 font-mono text-xs"><QrCode className="h-3 w-3" />{(e as unknown as Equipment).qrCode}</span>) },
    { key: 'capacityGallons', header: 'Capacity', render: (e) => { const cap = (e as unknown as Equipment).capacityGallons; return cap ? formatGallons(cap) : '—'; } },
    { key: 'totalFuelingEvents', header: 'Fuelings', sortable: true },
    { key: 'totalGallonsDelivered', header: 'Gallons', sortable: true, render: (e) => formatGallons((e as unknown as Equipment).totalGallonsDelivered) },
    { key: 'lastFueledDate', header: 'Last Fueled', render: (e) => { const d = (e as unknown as Equipment).lastFueledDate; return d ? formatDate(d) : '—'; } },
    { key: 'status', header: 'Status', render: (e) => <Badge variant={statusVariants[(e as unknown as Equipment).status]}>{(e as unknown as Equipment).status}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Equipment & QR Codes" description="Register equipment, assign QR codes, and track fueling history" actions={
        <Button onClick={() => modal.open()}><Plus className="h-4 w-4" /> Register Equipment</Button>
      } />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <SearchInput value={table.searchTerm} onChange={table.setSearchTerm} placeholder="Search equipment, customer, QR code..." className="w-96" />
        <Select options={[{ label: 'Tank', value: 'tank' }, { label: 'Generator', value: 'generator' }, { label: 'Pump', value: 'pump' }]} placeholder="All Types" value={table.filters['type'] ?? ''} onChange={(e) => table.setFilter('type', e.target.value)} />
        <Select options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }, { label: 'Needs Service', value: 'needs_service' }]} placeholder="All Statuses" value={table.filters['status'] ?? ''} onChange={(e) => table.setFilter('status', e.target.value)} />
      </div>

      <DataTable columns={columns} data={table.filteredData} onSort={table.handleSort} sortConfig={table.sortConfig} keyExtractor={(e) => (e as unknown as Equipment).id} />
      <TablePagination page={table.page} totalPages={table.totalPages} totalItems={table.totalItems} pageSize={table.pageSize} onPageChange={table.setPage} />

      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Register Equipment" size="lg" footer={
        <><Button variant="outline" onClick={modal.close}>Cancel</Button><Button onClick={() => { addToast({ type: 'success', title: 'Equipment registered and QR code generated' }); modal.close(); }}>Register</Button></>
      }>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Equipment Name" placeholder="Generator Tank A" />
          <Select label="Type" options={[{ label: 'Tank', value: 'tank' }, { label: 'Generator', value: 'generator' }, { label: 'Pump', value: 'pump' }, { label: 'Other', value: 'other' }]} placeholder="Select type" />
          <Input label="Manufacturer" placeholder="Western Global" />
          <Input label="Model" placeholder="FuelCube 500" />
          <Input label="Serial Number" placeholder="WG-FC500-22018" />
          <Input label="Capacity (gallons)" type="number" placeholder="500" />
          <Select label="Fuel Type" options={FUEL_TYPES} placeholder="Select fuel" />
          <Input label="Install Date" type="date" />
        </div>
        <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">A QR code will be auto-generated upon registration.</p>
      </Modal>
    </div>
  );
}
