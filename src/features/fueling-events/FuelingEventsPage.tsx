import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Modal } from '@/components/ui/Modal';
import { useModal } from '@/hooks/useModal';
import { mockFuelingEvents } from '@/mock';
import { formatCurrency, formatGallons, formatDateTime } from '@/lib/format';
import { CheckCircle, MapPin, QrCode, Gauge, Droplets, DollarSign, Calculator, CloudUpload } from 'lucide-react';
import type { FuelingEvent } from '@/types';

const stepIcons: Record<string, typeof CheckCircle> = {
  arrival: MapPin, qr_scan: QrCode, meter_connect: Gauge, volume_capture: Droplets,
  price_calculated: DollarSign, tax_calculated: Calculator, completed: CheckCircle, synced: CloudUpload,
};

function buildOptions(events: FuelingEvent[], idKey: keyof FuelingEvent, nameKey: keyof FuelingEvent) {
  const seen = new Map<string, string>();
  events.forEach((fe) => {
    const id = fe[idKey];
    const name = fe[nameKey];
    if (typeof id === 'string' && typeof name === 'string') {
      seen.set(id, name);
    }
  });
  return Array.from(seen, ([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function FuelingEventsPage() {
  const [searchParams] = useSearchParams();
  const modal = useModal<FuelingEvent>();
  const [driverId, setDriverId] = useState(() => searchParams.get('driverId') ?? '');
  const [customerId, setCustomerId] = useState('');
  const [equipmentId, setEquipmentId] = useState(() => searchParams.get('equipmentId') ?? '');

  useEffect(() => {
    const driver = searchParams.get('driverId');
    if (driver) setDriverId(driver);
    const eq = searchParams.get('equipmentId');
    if (eq) setEquipmentId(eq);
  }, [searchParams]);

  const driverOptions = useMemo(
    () => buildOptions(mockFuelingEvents, 'driverId', 'driverName'),
    [],
  );
  const customerOptions = useMemo(
    () => buildOptions(mockFuelingEvents, 'customerId', 'customerName'),
    [],
  );
  const equipmentOptions = useMemo(
    () => buildOptions(mockFuelingEvents, 'equipmentId', 'equipmentName'),
    [],
  );

  const filteredEvents = useMemo(() => {
    return mockFuelingEvents.filter((fe) => {
      if (driverId && fe.driverId !== driverId) return false;
      if (customerId && fe.customerId !== customerId) return false;
      if (equipmentId && fe.equipmentId !== equipmentId) return false;
      return true;
    });
  }, [driverId, customerId, equipmentId]);

  const hasFilters = Boolean(driverId || customerId || equipmentId);

  const clearFilters = () => {
    setDriverId('');
    setCustomerId('');
    setEquipmentId('');
  };

  return (
    <div>
      <PageHeader title="Fueling Events" description="Detailed audit trail of every fuel delivery — GPS, QR scan, meter data, pricing, and taxes" />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <SearchableSelect
          options={driverOptions}
          placeholder="All Drivers"
          value={driverId}
          onChange={setDriverId}
          className="w-52"
          searchPlaceholder="Search drivers..."
        />
        <SearchableSelect
          options={customerOptions}
          placeholder="All Customers"
          value={customerId}
          onChange={setCustomerId}
          className="w-52"
          searchPlaceholder="Search customers..."
        />
        <SearchableSelect
          options={equipmentOptions}
          placeholder="All Equipment"
          value={equipmentId}
          onChange={setEquipmentId}
          className="w-52"
          searchPlaceholder="Search equipment..."
        />
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>Clear</Button>
        )}
        <span className="text-sm text-muted-foreground">
          {filteredEvents.length} event{filteredEvents.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Job #</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Driver</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Equipment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">QR Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Fuel</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Gallons</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Steps</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No fueling events match the selected filters.
                </td>
              </tr>
            ) : (
              filteredEvents.map((fe) => (
                <tr key={fe.id} className="cursor-pointer hover:bg-muted/50" onClick={() => modal.open(fe)}>
                  <td className="px-4 py-3 text-sm font-mono text-primary">{fe.jobNumber}</td>
                  <td className="px-4 py-3 text-sm">{fe.driverName}</td>
                  <td className="px-4 py-3 text-sm">{fe.customerName}</td>
                  <td className="px-4 py-3 text-sm">{fe.equipmentName}</td>
                  <td className="px-4 py-3 text-sm font-mono text-xs">{fe.qrCode}</td>
                  <td className="px-4 py-3 text-sm">{fe.fuelType}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatGallons(fe.gallonsDelivered)}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatCurrency(fe.total)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDateTime(fe.createdAt)}</td>
                  <td className="px-4 py-3"><Badge variant="success">{fe.steps.length}/8</Badge></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal.isOpen} onClose={modal.close} title={`Fueling Event — ${modal.data?.jobNumber ?? ''}`} size="xl">
        {modal.data && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card padding="sm"><p className="text-xs text-muted-foreground">Volume</p><p className="text-xl font-bold">{formatGallons(modal.data.gallonsDelivered)}</p></Card>
              <Card padding="sm"><p className="text-xs text-muted-foreground">Price</p><p className="text-xl font-bold">{formatCurrency(modal.data.pricePerGallon)}/gal</p></Card>
              <Card padding="sm"><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold text-emerald-400">{formatCurrency(modal.data.total)}</p><p className="text-xs text-muted-foreground/60">Tax: {formatCurrency(modal.data.taxAmount)}</p></Card>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div><span className="text-muted-foreground">Driver:</span> <span className="font-medium">{modal.data.driverName}</span></div>
              <div><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{modal.data.customerName}</span></div>
              <div><span className="text-muted-foreground">Site:</span> <span className="font-medium">{modal.data.siteName}</span></div>
              <div><span className="text-muted-foreground">Equipment:</span> <span className="font-medium">{modal.data.equipmentName}</span></div>
              <div><span className="text-muted-foreground">Meter Reading:</span> <span className="font-medium">{modal.data.meterStartReading} → {modal.data.meterEndReading}</span></div>
              <div><span className="text-muted-foreground">GPS:</span> <span className="font-medium">{modal.data.latitude}, {modal.data.longitude}</span></div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">Delivery Steps</h4>
              <div className="space-y-0">
                {modal.data.steps.map((step, i) => {
                  const Icon = stepIcons[step.step] ?? CheckCircle;
                  return (
                    <div key={step.step} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                          <Icon className="h-4 w-4" />
                        </div>
                        {i < modal.data!.steps.length - 1 && <div className="h-6 w-0.5 bg-green-200" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">{step.label}</p>
                          <p className="text-xs text-muted-foreground/60">{formatDateTime(step.timestamp)}</p>
                        </div>
                        {step.data && (
                          <div className="mt-1 flex flex-wrap gap-2">
                            {Object.entries(step.data).map(([k, v]) => (
                              <span key={k} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{k}: {v}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
