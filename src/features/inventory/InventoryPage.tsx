import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { mockFuelStorage, mockFuelTransfers } from '@/mock';
import { formatGallons, formatDateTime } from '@/lib/format';
import { FUEL_TYPES } from '@/lib/constants';
import { Droplets, Database, ArrowLeftRight, Plus } from 'lucide-react';

const transferLabels: Record<string, string> = { tank_to_truck: 'Tank → Truck', truck_to_truck: 'Truck → Truck', truck_to_tank: 'Truck → Tank', purchase: 'Purchase', return: 'Return' };
const transferColors: Record<string, 'info' | 'success' | 'warning' | 'default'> = { tank_to_truck: 'info', truck_to_truck: 'default', truck_to_tank: 'warning', purchase: 'success', return: 'warning' };

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState('storage');
  const { addToast } = useToast();
  const modal = useModal();

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
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">By</th>
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
                      <td className="px-4 py-3 text-sm text-gray-600">{t.performedBy}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <Modal isOpen={modal.isOpen} onClose={modal.close} title="Record Fuel Transfer" size="lg" footer={
        <><Button variant="outline" onClick={modal.close}>Cancel</Button><Button onClick={() => { addToast({ type: 'success', title: 'Transfer recorded' }); modal.close(); }}>Record</Button></>
      }>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Transfer Type" options={[{ label: 'Tank → Truck', value: 'tank_to_truck' }, { label: 'Truck → Truck', value: 'truck_to_truck' }, { label: 'Truck → Tank', value: 'truck_to_tank' }, { label: 'Purchase', value: 'purchase' }, { label: 'Return', value: 'return' }]} placeholder="Select type" />
          <Select label="Fuel Type" options={FUEL_TYPES} placeholder="Select fuel" />
          <Input label="From" placeholder="Source tank/truck" />
          <Input label="To" placeholder="Destination tank/truck" />
          <Input label="Gallons" type="number" placeholder="1000" />
          <Input label="Performed By" placeholder="Driver/admin name" />
        </div>
      </Modal>
    </div>
  );
}
