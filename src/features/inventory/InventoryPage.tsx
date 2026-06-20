import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { mockFuelStorage, mockFuelTransfers, mockVehicles, mockDrivers, mockUsers } from '@/mock';
import { formatGallons, formatDateTime } from '@/lib/format';
import { FUEL_TYPES, ROLES } from '@/lib/constants';
import { Droplets, Database, ArrowLeftRight, Plus } from 'lucide-react';
import type { TransferPerformer, SelectOption } from '@/types';

const transferLabels: Record<string, string> = {
  tank_to_truck: 'Tank → Truck',
  truck_to_truck: 'Truck → Truck',
  truck_to_tank: 'Truck → Tank',
  purchase: 'Purchase',
  return: 'Return',
};
const transferColors: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
  tank_to_truck: 'info',
  truck_to_truck: 'default',
  truck_to_tank: 'warning',
  purchase: 'success',
  return: 'warning',
};

const EXTERNAL_SOURCES: SelectOption[] = [
  { label: 'Valero Terminal', value: 'ext-valero' },
  { label: 'Shell Terminal', value: 'ext-shell' },
  { label: 'Marathon Terminal', value: 'ext-marathon' },
];

function buildLocationOptions(): SelectOption[] {
  const tanks = mockFuelStorage.map((s) => ({
    label: `[Tank] ${s.name}`,
    value: s.id,
  }));
  const trucks = mockVehicles.map((v) => ({
    label: `[Truck] ${v.name}`,
    value: v.id,
  }));
  return [...tanks, ...trucks, ...EXTERNAL_SOURCES].sort((a, b) => a.label.localeCompare(b.label));
}

function buildPerformerOptions(): SelectOption[] {
  const drivers = mockDrivers.map((d) => ({
    value: d.id,
    label: `${d.firstName} ${d.lastName}`,
    badge: 'Driver',
  }));
  const users = mockUsers.map((u) => ({
    value: u.id,
    label: `${u.firstName} ${u.lastName}`,
    badge: ROLES[u.role] ?? u.role,
  }));
  return [...drivers, ...users].sort((a, b) => a.label.localeCompare(b.label));
}

function formatPerformerName(performer: TransferPerformer): string {
  return `${performer.firstName} ${performer.lastName}`;
}

function PerformerCell({ performer }: { performer: TransferPerformer }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-medium text-gray-900">{formatPerformerName(performer)}</span>
      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
        {performer.role}
      </span>
    </span>
  );
}

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState('storage');
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [performedById, setPerformedById] = useState('');
  const { addToast } = useToast();
  const modal = useModal();

  const locationOptions = useMemo(() => buildLocationOptions(), []);
  const performerOptions = useMemo(() => buildPerformerOptions(), []);

  const resetTransferForm = () => {
    setFromId('');
    setToId('');
    setPerformedById('');
  };

  const handleCloseModal = () => {
    resetTransferForm();
    modal.close();
  };

  const totalCapacity = mockFuelStorage.reduce((s, t) => s + t.capacityGallons, 0);
  const totalCurrent = mockFuelStorage.reduce((s, t) => s + t.currentGallons, 0);
  const overallPct = Math.round((totalCurrent / totalCapacity) * 100);

  return (
    <div>
      <PageHeader title="Fuel Inventory" description="Track bulk fuel storage, truck loads, and transfers" actions={
        <Button onClick={() => modal.open()}><Plus className="h-4 w-4" /> Record Transfer</Button>
      } />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatsCard title="Total On-Hand" value={formatGallons(totalCurrent)} icon={Droplets} />
        <StatsCard title="Total Capacity" value={formatGallons(totalCapacity)} icon={Database} iconColor="text-blue-600 bg-blue-100" />
        <StatsCard title="Fill Level" value={`${overallPct}%`} icon={ArrowLeftRight} iconColor="text-green-600 bg-green-100" />
      </div>

      <Tabs tabs={[{ key: 'storage', label: 'Storage Tanks', count: mockFuelStorage.length }, { key: 'transfers', label: 'Recent Transfers', count: mockFuelTransfers.length }]} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'storage' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockFuelStorage.map((tank) => {
              const pct = Math.round((tank.currentGallons / tank.capacityGallons) * 100);
              return (
                <Card key={tank.id}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{tank.name}</h3>
                      <Badge variant={pct > 50 ? 'success' : pct > 20 ? 'warning' : 'error'}>{pct}%</Badge>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-200">
                      <div className={`h-3 rounded-full ${pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{formatGallons(tank.currentGallons)}</span>
                      <span>/ {formatGallons(tank.capacityGallons)}</span>
                    </div>
                    <p className="text-xs text-gray-400">{tank.location}</p>
                    <p className="text-xs text-gray-400">Fuel: {tank.fuelType} | Type: {tank.type === 'bulk_tank' ? 'Bulk Tank' : 'Truck'}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === 'transfers' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Transfer #</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">From</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">To</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Fuel</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Gallons</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Performed By</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockFuelTransfers.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-3 text-sm font-mono text-brand-600">{t.transferNumber}</td>
                      <td className="px-4 py-3"><Badge variant={transferColors[t.type]}>{transferLabels[t.type]}</Badge></td>
                      <td className="px-4 py-3 text-sm">{t.fromStorageName}</td>
                      <td className="px-4 py-3 text-sm">{t.toStorageName}</td>
                      <td className="px-4 py-3 text-sm">{t.fuelType}</td>
                      <td className="px-4 py-3 text-sm font-medium">{formatGallons(t.gallons)}</td>
                      <td className="px-4 py-3 text-sm"><PerformerCell performer={t.performedBy} /></td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        title="Record Fuel Transfer"
        size="lg"
        bodyClassName="overflow-visible"
        footer={
        <><Button variant="outline" onClick={handleCloseModal}>Cancel</Button><Button onClick={() => { addToast({ type: 'success', title: 'Transfer recorded' }); handleCloseModal(); }}>Record</Button></>
      }>
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label="Transfer Type" options={[{ label: 'Tank → Truck', value: 'tank_to_truck' }, { label: 'Truck → Truck', value: 'truck_to_truck' }, { label: 'Truck → Tank', value: 'truck_to_tank' }, { label: 'Purchase', value: 'purchase' }, { label: 'Return', value: 'return' }]} placeholder="Select type" />
          <Select label="Fuel Type" options={FUEL_TYPES} placeholder="Select fuel" />
          <SearchableSelect
            label="From"
            options={locationOptions}
            value={fromId}
            onChange={setFromId}
            placeholder="Select source tank, truck, or terminal"
            searchPlaceholder="Search from location..."
          />
          <SearchableSelect
            label="To"
            options={locationOptions}
            value={toId}
            onChange={setToId}
            placeholder="Select destination tank or truck"
            searchPlaceholder="Search to location..."
          />
          <Input label="Gallons" type="number" placeholder="1000" />
          <SearchableSelect
            label="Performed By"
            options={performerOptions}
            value={performedById}
            onChange={setPerformedById}
            placeholder="Select driver or admin"
            searchPlaceholder="Search by name or role..."
          />
        </div>
      </Modal>
    </div>
  );
}
