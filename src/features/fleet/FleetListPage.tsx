import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
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
import { mockVehicles } from '@/mock';
import { formatDate, formatNumber } from '@/lib/format';
import { Plus, Truck, Wrench, AlertTriangle } from 'lucide-react';
import type { Vehicle } from '@/types';

const statusVariants: Record<string, 'success' | 'warning' | 'error'> = { active: 'success', maintenance: 'warning', out_of_service: 'error' };

export function FleetListPage() {
  const { addToast } = useToast();
  const modal = useModal<Vehicle>();

  const activeCount = mockVehicles.filter((v) => v.status === 'active').length;
  const maintenanceCount = mockVehicles.filter((v) => v.status === 'maintenance').length;
  const expiringDocs = mockVehicles.filter((v) => new Date(v.registrationExpiry) < new Date('2026-09-01') || new Date(v.insuranceExpiry) < new Date('2026-09-01')).length;

  const table = useTable<Vehicle & Record<string, unknown>>({
    data: mockVehicles as (Vehicle & Record<string, unknown>)[],
    searchKeys: ['name', 'make', 'model', 'licensePlate'],
  });

  const columns: Column<Vehicle & Record<string, unknown>>[] = [
    { key: 'name', header: 'Vehicle', sortable: true, render: (v) => { const veh = v as unknown as Vehicle; return (<div><p className="font-medium text-gray-900">{veh.name}</p><p className="text-xs text-gray-500">{veh.year} {veh.make} {veh.model}</p></div>); } },
    { key: 'licensePlate', header: 'Plate' },
    { key: 'status', header: 'Status', render: (v) => { const veh = v as unknown as Vehicle; return <Badge variant={statusVariants[veh.status]}>{veh.status}</Badge>; } },
    { key: 'fuelCapacityGallons', header: 'Fuel Level', render: (v) => { const veh = v as unknown as Vehicle; const pct = Math.round((veh.currentFuelGallons / veh.fuelCapacityGallons) * 100); return (<div className="flex items-center gap-2"><div className="h-2 w-20 rounded-full bg-gray-200"><div className={`h-2 rounded-full ${pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} /></div><span className="text-xs text-gray-500">{pct}%</span></div>); } },
    { key: 'assignedDriverName', header: 'Driver', render: (v) => (v as unknown as Vehicle).assignedDriverName ?? <span className="text-gray-400">Unassigned</span> },
    { key: 'mileage', header: 'Mileage', sortable: true, render: (v) => `${formatNumber((v as unknown as Vehicle).mileage)} mi` },
    { key: 'registrationExpiry', header: 'Reg. Expiry', sortable: true, render: (v) => { const d = (v as unknown as Vehicle).registrationExpiry; const soon = new Date(d) < new Date('2026-09-01'); return <span className={soon ? 'text-red-600 font-medium' : ''}>{formatDate(d)}</span>; } },
    { key: 'nextInspectionDue', header: 'Next Inspection', sortable: true, render: (v) => formatDate((v as unknown as Vehicle).nextInspectionDue) },
  ];

  return (
    <div>
      <PageHeader title="Fleet & Vehicle Management" description="Track vehicles, maintenance, and compliance" actions={
        <Button onClick={() => modal.open()}><Plus className="h-4 w-4" /> Add Vehicle</Button>
      } />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatsCard title="Active Vehicles" value={activeCount} icon={Truck} />
        <StatsCard title="In Maintenance" value={maintenanceCount} icon={Wrench} iconColor="text-yellow-600 bg-yellow-100" />
        <StatsCard title="Docs Expiring Soon" value={expiringDocs} icon={AlertTriangle} iconColor="text-red-600 bg-red-100" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <SearchInput value={table.searchTerm} onChange={table.setSearchTerm} placeholder="Search vehicles..." className="w-80" />
        <Select options={[{ label: 'Active', value: 'active' }, { label: 'Maintenance', value: 'maintenance' }, { label: 'Out of Service', value: 'out_of_service' }]} placeholder="All Statuses" value={table.filters['status'] ?? ''} onChange={(e) => table.setFilter('status', e.target.value)} />
      </div>

      <DataTable columns={columns} data={table.filteredData} onSort={table.handleSort} sortConfig={table.sortConfig} keyExtractor={(v) => (v as unknown as Vehicle).id} />
      <TablePagination page={table.page} totalPages={table.totalPages} totalItems={table.totalItems} pageSize={table.pageSize} onPageChange={table.setPage} />

      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Add Vehicle" size="lg" footer={
        <><Button variant="outline" onClick={modal.close}>Cancel</Button><Button onClick={() => { addToast({ type: 'success', title: 'Vehicle added' }); modal.close(); }}>Add Vehicle</Button></>
      }>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Vehicle Name" placeholder="Truck #101" />
          <Input label="Make" placeholder="Ford" />
          <Input label="Model" placeholder="F-750" />
          <Input label="Year" type="number" placeholder="2024" />
          <Input label="VIN" placeholder="1FDWF7DC5PDA12345" />
          <Input label="License Plate" placeholder="TX-FUL-101" />
          <Input label="Fuel Capacity (gallons)" type="number" placeholder="2500" />
          <Input label="Registration Expiry" type="date" />
          <Input label="Insurance Expiry" type="date" />
        </div>
      </Modal>
    </div>
  );
}
