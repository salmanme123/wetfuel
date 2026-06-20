import { useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mockEquipment, mockCustomers, mockFuelingEvents } from '@/mock';
import { formatGallons, formatDate, formatDateTime, formatCurrency } from '@/lib/format';
import {
  ArrowLeft,
  QrCode,
  MapPin,
  Building2,
  Droplets,
  Flame,
  Truck,
  Calendar,
  Hash,
  Gauge,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Equipment, EquipmentStatus } from '@/types';

const typeLabels: Record<string, string> = {
  tank: 'Tank',
  generator: 'Generator',
  pump: 'Pump',
  other: 'Other',
};

const statusVariants: Record<EquipmentStatus, 'success' | 'default' | 'warning'> = {
  active: 'success',
  inactive: 'default',
  needs_service: 'warning',
};

function formatFuelType(fuelType: string) {
  if (fuelType === 'gasoline_regular') return 'Gasoline (Regular)';
  if (fuelType === 'gasoline_premium') return 'Gasoline (Premium)';
  return fuelType.charAt(0).toUpperCase() + fuelType.slice(1);
}

function QrCodeVisual({ code }: { code: string }) {
  const cells = useMemo(() => {
    return Array.from({ length: 121 }, (_, i) => {
      const seed = code.charCodeAt(i % code.length) + i;
      return seed % 3 !== 0;
    });
  }, [code]);

  return (
    <div className="mx-auto w-fit rounded-xl border-2 border-gray-900 bg-card p-4 shadow-sm">
      <div className="grid grid-cols-11 gap-0.5">
        {cells.map((filled, i) => (
          <div
            key={i}
            className={cn('h-2.5 w-2.5', filled ? 'bg-gray-900' : 'bg-card')}
          />
        ))}
      </div>
      <p className="mt-3 text-center font-mono text-xs font-semibold tracking-wider text-foreground">
        {code}
      </p>
    </div>
  );
}

export function EquipmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const equipmentFromState = (location.state as { equipment?: Equipment } | null)?.equipment;
  const equipment = equipmentFromState ?? mockEquipment.find((e) => e.id === id);

  const customer = equipment
    ? mockCustomers.find((c) => c.id === equipment.customerId)
    : undefined;
  const site = customer?.sites.find((s) => s.id === equipment?.siteId);

  const fuelingEvents = useMemo(
    () =>
      equipment
        ? mockFuelingEvents
            .filter((fe) => fe.equipmentId === equipment.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [],
    [equipment],
  );

  if (!equipment) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Equipment not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/equipment')}>
          Back to Equipment
        </Button>
      </div>
    );
  }

  const siteAddress = site
    ? `${site.address}, ${site.city}, ${site.state} ${site.zipCode}`
    : null;

  return (
    <div>
      <PageHeader
        title={equipment.name}
        description={`${equipment.manufacturer} ${equipment.model} · ${equipment.customerName}`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/equipment')}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                navigate(`/jobs?siteId=${equipment.siteId}&customerId=${equipment.customerId}`)
              }
            >
              <Truck className="h-4 w-4" /> View Jobs
            </Button>
            <Button onClick={() => navigate(`/fueling-events?equipmentId=${equipment.id}`)}>
              <Flame className="h-4 w-4" /> Fueling Events
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant={statusVariants[equipment.status]}>{equipment.status.replace('_', ' ')}</Badge>
        <Badge variant="default">{typeLabels[equipment.type]}</Badge>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 font-mono text-xs text-foreground">
          <QrCode className="h-3.5 w-3.5" />
          {equipment.qrCode}
        </span>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Fuelings"
          value={equipment.totalFuelingEvents}
          icon={Flame}
          iconColor="text-amber-400 bg-amber-500/15"
        />
        <StatsCard
          title="Gallons Delivered"
          value={formatGallons(equipment.totalGallonsDelivered)}
          icon={Droplets}
          iconColor="text-sky-400 bg-sky-500/15"
        />
        <StatsCard
          title="Tank Capacity"
          value={equipment.capacityGallons ? formatGallons(equipment.capacityGallons) : '—'}
          icon={Gauge}
          iconColor="text-primary bg-primary/15"
        />
        <StatsCard
          title="Last Fueled"
          value={equipment.lastFueledDate ? formatDate(equipment.lastFueledDate) : 'Never'}
          icon={Calendar}
          iconColor="text-emerald-400 bg-emerald-500/10"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="QR Code" className="lg:col-span-1">
          <div className="flex flex-col items-center py-2">
            <QrCodeVisual code={equipment.qrCode} />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Scan at delivery to link fueling events to this equipment.
            </p>
            <Button variant="outline" className="mt-4" size="sm">
              Download QR Label
            </Button>
          </div>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card title="Equipment Details">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Wrench className="mt-0.5 h-5 w-5 text-muted-foreground/60" />
                <div>
                  <p className="text-sm text-muted-foreground">Manufacturer / Model</p>
                  <p className="font-medium text-foreground">
                    {equipment.manufacturer} {equipment.model}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Hash className="mt-0.5 h-5 w-5 text-muted-foreground/60" />
                <div>
                  <p className="text-sm text-muted-foreground">Serial Number</p>
                  <p className="font-medium font-mono text-foreground">{equipment.serialNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Droplets className="mt-0.5 h-5 w-5 text-muted-foreground/60" />
                <div>
                  <p className="text-sm text-muted-foreground">Fuel Type</p>
                  <p className="font-medium text-foreground">{formatFuelType(equipment.fuelType)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Gauge className="mt-0.5 h-5 w-5 text-muted-foreground/60" />
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-medium text-foreground">
                    {equipment.capacityGallons ? formatGallons(equipment.capacityGallons) : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground/60" />
                <div>
                  <p className="text-sm text-muted-foreground">Install Date</p>
                  <p className="font-medium text-foreground">{formatDate(equipment.installDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center">
                  <span
                    className={cn(
                      'h-2.5 w-2.5 rounded-full',
                      equipment.status === 'active' && 'bg-emerald-500/100',
                      equipment.status === 'inactive' && 'bg-gray-400',
                      equipment.status === 'needs_service' && 'bg-amber-500',
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium text-foreground capitalize">{equipment.status.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card title="Customer & Site">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 h-5 w-5 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium text-foreground">{equipment.customerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm text-muted-foreground">Site</p>
                    <p className="font-medium text-foreground">{equipment.siteName}</p>
                    {siteAddress && <p className="text-sm text-muted-foreground">{siteAddress}</p>}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Exact Location">
              <div className="overflow-hidden rounded-lg border border-border bg-gradient-to-br from-brand-50 to-slate-100">
                <div className="relative flex h-36 items-center justify-center">
                  <div className="absolute inset-0 opacity-20">
                    <div className="grid h-full w-full grid-cols-8 grid-rows-4">
                      {Array.from({ length: 32 }).map((_, i) => (
                        <div key={i} className="border border-border/60" />
                      ))}
                    </div>
                  </div>
                  <div className="relative flex flex-col items-center">
                    <div className="rounded-full bg-primary p-2 shadow-lg">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <p className="mt-2 text-xs font-medium text-foreground">Equipment pinned here</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-muted-foreground">
                  {siteAddress ?? 'Location coordinates on file'}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {equipment.latitude.toFixed(6)}, {equipment.longitude.toFixed(6)}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Card title="Recent Fueling Events" className="mt-6">
        {fuelingEvents.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No fueling events recorded for this equipment yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Job #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Driver</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Gallons</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {fuelingEvents.map((fe) => (
                  <tr key={fe.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDateTime(fe.createdAt)}</td>
                    <td className="px-4 py-3 text-sm font-mono text-primary">{fe.jobNumber}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{fe.driverName}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{formatGallons(fe.gallonsDelivered)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{formatCurrency(fe.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
