import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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

export function FuelingEventsPage() {
  const modal = useModal<FuelingEvent>();

  return (
    <div>
      <PageHeader title="Fueling Events" description="Detailed audit trail of every fuel delivery — GPS, QR scan, meter data, pricing, and taxes" />

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Job #</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Driver</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Equipment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">QR Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Fuel</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Gallons</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Steps</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {mockFuelingEvents.map((fe) => (
              <tr key={fe.id} className="cursor-pointer hover:bg-gray-50" onClick={() => modal.open(fe)}>
                <td className="px-4 py-3 text-sm font-mono text-brand-600">{fe.jobNumber}</td>
                <td className="px-4 py-3 text-sm">{fe.driverName}</td>
                <td className="px-4 py-3 text-sm">{fe.customerName}</td>
                <td className="px-4 py-3 text-sm">{fe.equipmentName}</td>
                <td className="px-4 py-3 text-sm font-mono text-xs">{fe.qrCode}</td>
                <td className="px-4 py-3 text-sm">{fe.fuelType}</td>
                <td className="px-4 py-3 text-sm font-medium">{formatGallons(fe.gallonsDelivered)}</td>
                <td className="px-4 py-3 text-sm font-medium">{formatCurrency(fe.total)}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(fe.createdAt)}</td>
                <td className="px-4 py-3"><Badge variant="success">{fe.steps.length}/8</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal.isOpen} onClose={modal.close} title={`Fueling Event — ${modal.data?.jobNumber ?? ''}`} size="xl">
        {modal.data && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card padding="sm"><p className="text-xs text-gray-500">Volume</p><p className="text-xl font-bold">{formatGallons(modal.data.gallonsDelivered)}</p></Card>
              <Card padding="sm"><p className="text-xs text-gray-500">Price</p><p className="text-xl font-bold">{formatCurrency(modal.data.pricePerGallon)}/gal</p></Card>
              <Card padding="sm"><p className="text-xs text-gray-500">Total</p><p className="text-xl font-bold text-green-700">{formatCurrency(modal.data.total)}</p><p className="text-xs text-gray-400">Tax: {formatCurrency(modal.data.taxAmount)}</p></Card>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div><span className="text-gray-500">Driver:</span> <span className="font-medium">{modal.data.driverName}</span></div>
              <div><span className="text-gray-500">Customer:</span> <span className="font-medium">{modal.data.customerName}</span></div>
              <div><span className="text-gray-500">Site:</span> <span className="font-medium">{modal.data.siteName}</span></div>
              <div><span className="text-gray-500">Equipment:</span> <span className="font-medium">{modal.data.equipmentName}</span></div>
              <div><span className="text-gray-500">Meter Reading:</span> <span className="font-medium">{modal.data.meterStartReading} → {modal.data.meterEndReading}</span></div>
              <div><span className="text-gray-500">GPS:</span> <span className="font-medium">{modal.data.latitude}, {modal.data.longitude}</span></div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-700">Delivery Steps</h4>
              <div className="space-y-0">
                {modal.data.steps.map((step, i) => {
                  const Icon = stepIcons[step.step] ?? CheckCircle;
                  return (
                    <div key={step.step} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                          <Icon className="h-4 w-4" />
                        </div>
                        {i < modal.data!.steps.length - 1 && <div className="h-6 w-0.5 bg-green-200" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{step.label}</p>
                          <p className="text-xs text-gray-400">{formatDateTime(step.timestamp)}</p>
                        </div>
                        {step.data && (
                          <div className="mt-1 flex flex-wrap gap-2">
                            {Object.entries(step.data).map(([k, v]) => (
                              <span key={k} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{k}: {v}</span>
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
