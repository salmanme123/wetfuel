import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, TablePagination, type Column } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useTable } from '@/hooks/useTable';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { mockVehicles } from '@/mock';
import { formatDate, formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Plus, Truck, Wrench, AlertTriangle, FileUp } from 'lucide-react';
import type { Vehicle } from '@/types';

const statusVariants: Record<string, 'success' | 'warning' | 'error'> = {
  active: 'success',
  maintenance: 'warning',
  out_of_service: 'error',
};

function isVehicleExpired(vehicle: Vehicle): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const registration = new Date(vehicle.registrationExpiry);
  const insurance = new Date(vehicle.insuranceExpiry);
  registration.setHours(0, 0, 0, 0);
  insurance.setHours(0, 0, 0, 0);
  return registration < today || insurance < today;
}

function isRegistrationExpired(date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const registration = new Date(date);
  registration.setHours(0, 0, 0, 0);
  return registration < today;
}

export function FleetListPage() {
  const { addToast } = useToast();
  const modal = useModal<Vehicle>();
  const docModal = useModal();
  const [showExpiredOnly, setShowExpiredOnly] = useState(false);

  const activeCount = mockVehicles.filter((v) => v.status === 'active').length;
  const maintenanceCount = mockVehicles.filter((v) => v.status === 'maintenance').length;
  const expiredCount = mockVehicles.filter(isVehicleExpired).length;
  const expiringDocs = mockVehicles.filter((v) => new Date(v.registrationExpiry) < new Date('2026-09-01') || new Date(v.insuranceExpiry) < new Date('2026-09-01')).length;

  const driverOptions = useMemo(() => {
    const seen = new Map<string, string>();
    mockVehicles.forEach((v) => {
      if (v.assignedDriverId && v.assignedDriverName) {
        seen.set(v.assignedDriverId, v.assignedDriverName);
      }
    });
    const assigned = Array.from(seen, ([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
    const hasUnassigned = mockVehicles.some((v) => !v.assignedDriverId);
    return hasUnassigned
      ? [{ label: 'Unassigned', value: 'null' }, ...assigned]
      : assigned;
  }, []);

  const filteredVehicles = useMemo(() => {
    if (!showExpiredOnly) return mockVehicles;
    return mockVehicles.filter(isVehicleExpired);
  }, [showExpiredOnly]);

  const table = useTable<Vehicle & Record<string, unknown>>({
    data: filteredVehicles as (Vehicle & Record<string, unknown>)[],
    searchKeys: ['name', 'make', 'model', 'licensePlate', 'assignedDriverName'],
  });

  const hasActiveFilters = Object.keys(table.filters).length > 0 || table.searchTerm || showExpiredOnly;

  const clearFilters = () => {
    table.clearFilters();
    setShowExpiredOnly(false);
  };

  const columns: Column<Vehicle & Record<string, unknown>>[] = [
    { key: 'name', header: 'Vehicle', sortable: true, render: (v) => { const veh = v as unknown as Vehicle; return (<div><p className="font-medium text-gray-900">{veh.name}</p><p className="text-xs text-gray-500">{veh.year} {veh.make} {veh.model}</p></div>); } },
    { key: 'licensePlate', header: 'Plate' },
    { key: 'status', header: 'Status', render: (v) => { const veh = v as unknown as Vehicle; return <Badge variant={statusVariants[veh.status]}>{veh.status}</Badge>; } },
    { key: 'fuelCapacityGallons', header: 'Fuel Level', render: (v) => { const veh = v as unknown as Vehicle; const pct = Math.round((veh.currentFuelGallons / veh.fuelCapacityGallons) * 100); return (<div className="flex items-center gap-2"><div className="h-2 w-20 rounded-full bg-gray-200"><div className={`h-2 rounded-full ${pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} /></div><span className="text-xs text-gray-500">{pct}%</span></div>); } },
    { key: 'assignedDriverName', header: 'Driver', render: (v) => (v as unknown as Vehicle).assignedDriverName ?? <span className="text-gray-400">Unassigned</span> },
    { key: 'mileage', header: 'Mileage', sortable: true, render: (v) => `${formatNumber((v as unknown as Vehicle).mileage)} mi` },
    { key: 'registrationExpiry', header: 'Reg. Expiry', sortable: true, render: (v) => { const veh = v as unknown as Vehicle; const expired = isRegistrationExpired(veh.registrationExpiry); const soon = !expired && new Date(veh.registrationExpiry) < new Date('2026-09-01'); return <span className={cn(expired ? 'font-medium text-red-600' : soon && 'text-amber-600 font-medium')}>{formatDate(veh.registrationExpiry)}</span>; } },
    { key: 'nextInspectionDue', header: 'Next Inspection', sortable: true, render: (v) => formatDate((v as unknown as Vehicle).nextInspectionDue) },
  ];

  return (
    <div>
      <PageHeader title="Fleet & Vehicle Management" description="Track vehicles, maintenance, and compliance" actions={
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => docModal.open()}><FileUp className="h-4 w-4" /> Upload Document</Button>
          <Button onClick={() => modal.open()}><Plus className="h-4 w-4" /> Add Vehicle</Button>
        </div>
      } />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatsCard title="Active Vehicles" value={activeCount} icon={Truck} />
        <StatsCard title="In Maintenance" value={maintenanceCount} icon={Wrench} iconColor="text-yellow-600 bg-yellow-100" />
        <StatsCard title="Expired Documents" value={expiredCount} icon={AlertTriangle} iconColor="text-red-600 bg-red-100" />
        <StatsCard title="Docs Expiring Soon" value={expiringDocs} icon={AlertTriangle} iconColor="text-amber-600 bg-amber-100" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <SearchInput value={table.searchTerm} onChange={table.setSearchTerm} placeholder="Search vehicles..." className="w-80" />
        <SearchableSelect
          options={driverOptions}
          placeholder="All Drivers"
          value={table.filters['assignedDriverId'] ?? ''}
          onChange={(val) => table.setFilter('assignedDriverId', val)}
          className="w-52"
          searchPlaceholder="Search drivers..."
        />
        <Select
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Maintenance', value: 'maintenance' },
            { label: 'Out of Service', value: 'out_of_service' },
          ]}
          placeholder="All Statuses"
          value={table.filters['status'] ?? ''}
          onChange={(e) => table.setFilter('status', e.target.value)}
        />
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm">
          <input
            type="checkbox"
            checked={showExpiredOnly}
            onChange={(e) => {
              setShowExpiredOnly(e.target.checked);
              table.setPage(1);
            }}
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-gray-700">Expired only</span>
        </label>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters}>Clear</Button>
        )}
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

      <Modal isOpen={docModal.isOpen} onClose={docModal.close} title="Upload Vehicle Document" size="md" footer={
        <>
          <Button variant="outline" onClick={docModal.close}>Cancel</Button>
          <Button onClick={() => { addToast({ type: 'success', title: 'Document uploaded', message: 'Vehicle compliance record updated' }); docModal.close(); }}>Upload</Button>
        </>
      }>
        <div className="grid gap-4">
          <Select label="Vehicle" options={mockVehicles.map((v) => ({ label: `${v.name} (${v.licensePlate})`, value: v.id }))} placeholder="Select vehicle" />
          <Select label="Document Type" options={[
            { label: 'Vehicle Registration', value: 'registration' },
            { label: 'Insurance Certificate', value: 'insurance' },
            { label: 'DOT Inspection Report', value: 'dot_inspection' },
            { label: 'Maintenance Record', value: 'maintenance' },
            { label: 'Emissions Certificate', value: 'emissions' },
          ]} placeholder="Select document type" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Issued Date" type="date" />
            <Input label="Expiry Date" type="date" />
          </div>
          <Input label="Document Number (optional)" placeholder="e.g. REG-2026-TX-12345" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
              <FileUp className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Drag & drop or click to upload</p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
