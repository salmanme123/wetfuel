import { useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { mockDrivers, mockJobs, mockFuelingEvents, mockVehicles } from '@/mock';
import { formatGallons, formatDate, formatDateTime, formatCurrency } from '@/lib/format';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Truck,
  Droplets,
  Flame,
  Calendar,
  Clock,
  Shield,
  IdCard,
  Award,
  Gauge,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Driver, DriverStatus, ShiftStatus, DriverCertification } from '@/types';

const statusVariants: Record<DriverStatus, 'success' | 'default' | 'warning'> = {
  active: 'success',
  inactive: 'default',
  on_leave: 'warning',
};

const shiftVariants: Record<ShiftStatus, 'success' | 'default' | 'warning'> = {
  clocked_in: 'success',
  clocked_out: 'default',
  on_break: 'warning',
};

const shiftLabels: Record<ShiftStatus, string> = {
  clocked_in: 'Clocked In',
  clocked_out: 'Clocked Out',
  on_break: 'On Break',
};

const certVariants: Record<DriverCertification['status'], 'success' | 'warning' | 'error'> = {
  valid: 'success',
  expiring_soon: 'warning',
  expired: 'error',
};

function ComplianceRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const scoreColor =
    score >= 90 ? 'text-emerald-400' : score >= 80 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="relative mx-auto h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="oklch(0.24 0 0)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          className={cn('stroke-current', scoreColor)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-3xl font-bold', scoreColor)}>{score}%</span>
        <span className="text-xs text-muted-foreground">Compliance</span>
      </div>
    </div>
  );
}

export function DriverDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const certModal = useModal();
  const licenseModal = useModal();

  const driverFromState = (location.state as { driver?: Driver } | null)?.driver;
  const driver = driverFromState ?? mockDrivers.find((d) => d.id === id);

  const vehicle = driver?.assignedVehicleId
    ? mockVehicles.find((v) => v.id === driver.assignedVehicleId)
    : undefined;

  const recentJobs = useMemo(
    () =>
      driver
        ? mockJobs
            .filter((j) => j.driverId === driver.id)
            .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
        : [],
    [driver],
  );

  const fuelingEvents = useMemo(
    () =>
      driver
        ? mockFuelingEvents
            .filter((fe) => fe.driverId === driver.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [],
    [driver],
  );

  if (!driver) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Driver not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/drivers')}>
          Back to Drivers
        </Button>
      </div>
    );
  }

  const fullName = `${driver.firstName} ${driver.lastName}`;

  return (
    <div>
      <PageHeader
        title={fullName}
        description={`${driver.organizationName} · ${driver.license.type} License`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/drivers')}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="outline" onClick={() => navigate(`/jobs?driverId=${driver.id}`)}>
              <Truck className="h-4 w-4" /> View Jobs
            </Button>
            <Button onClick={() => navigate(`/fueling-events?driverId=${driver.id}`)}>
              <Flame className="h-4 w-4" /> Fueling Events
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant={statusVariants[driver.status]}>{driver.status.replace('_', ' ')}</Badge>
        <Badge variant={shiftVariants[driver.shiftStatus]}>{shiftLabels[driver.shiftStatus]}</Badge>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 font-mono text-xs text-foreground">
          <IdCard className="h-3.5 w-3.5" />
          {driver.license.type} · {driver.license.state}
        </span>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Deliveries"
          value={driver.totalDeliveries}
          icon={Truck}
          iconColor="text-primary bg-primary/15"
        />
        <StatsCard
          title="Gallons Delivered"
          value={formatGallons(driver.totalGallonsDelivered)}
          icon={Droplets}
          iconColor="text-sky-400 bg-sky-500/15"
        />
        <StatsCard
          title="Hours This Week"
          value={`${driver.hoursThisWeek}h`}
          icon={Clock}
          iconColor="text-amber-400 bg-amber-500/15"
        />
        <StatsCard
          title="Compliance Score"
          value={`${driver.complianceScore}%`}
          icon={Shield}
          iconColor={
            driver.complianceScore >= 90
              ? 'text-emerald-400 bg-emerald-500/10'
              : driver.complianceScore >= 80
                ? 'text-amber-600 bg-amber-100'
                : 'text-red-400 bg-red-100'
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Driver Profile" className="lg:col-span-1">
          <div className="flex flex-col items-center py-2">
            <Avatar firstName={driver.firstName} lastName={driver.lastName} size="lg" className="h-20 w-20 text-xl" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">{fullName}</h3>
            <p className="text-sm text-muted-foreground">{driver.organizationName}</p>

            <div className="mt-6 w-full space-y-3 border-t pt-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                <span className="text-foreground">{driver.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                <span className="text-foreground">{driver.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                <span className="text-foreground">{driver.organizationName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                <span className="text-foreground">Hired {formatDate(driver.hireDate)}</span>
              </div>
              {driver.lastClockIn && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                  <span className="text-foreground">Last clock-in {formatDateTime(driver.lastClockIn)}</span>
                </div>
              )}
            </div>

            <Button variant="outline" className="mt-4" size="sm">
              Edit Driver
            </Button>
          </div>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card title="License" footer={
              <Button size="sm" variant="outline" onClick={() => licenseModal.open()}>Update License</Button>
            }>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <IdCard className="mt-0.5 h-5 w-5 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm text-muted-foreground">License Type</p>
                    <p className="font-medium text-foreground">{driver.license.type}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm text-muted-foreground">License Number</p>
                    <p className="font-medium font-mono text-foreground">{driver.license.number}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 h-5 w-5 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm text-muted-foreground">State</p>
                    <p className="font-medium text-foreground">{driver.license.state}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm text-muted-foreground">Expiry Date</p>
                    <p className="font-medium text-foreground">{formatDate(driver.license.expiryDate)}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Compliance Overview">
              <div className="flex flex-col items-center py-2">
                <ComplianceRing score={driver.complianceScore} />
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Based on license validity, certifications, and delivery compliance history.
                </p>
              </div>
            </Card>
          </div>

          <Card title="Certifications" footer={
            <Button size="sm" variant="outline" onClick={() => certModal.open()}>
              <Plus className="h-4 w-4" /> Add Certification
            </Button>
          }>
            {driver.certifications.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No certifications on file.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Certification</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Issued</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Expires</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {driver.certifications.map((cert) => (
                      <tr key={cert.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          <span className="inline-flex items-center gap-2">
                            <Award className="h-4 w-4 text-muted-foreground/60" />
                            {cert.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(cert.issuedDate)}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(cert.expiryDate)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={certVariants[cert.status]}>
                            {cert.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card title="Assigned Vehicle">
            {!vehicle ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No vehicle currently assigned.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="overflow-hidden rounded-lg border border-border bg-gradient-to-br from-slate-50 to-brand-50">
                  <div className="flex h-32 items-center justify-center">
                    <div className="flex flex-col items-center">
                      <div className="rounded-full bg-primary p-3 shadow-lg">
                        <Truck className="h-6 w-6 text-white" />
                      </div>
                      <p className="mt-2 text-sm font-semibold text-foreground">{vehicle.name}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.licensePlate}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Truck className="mt-0.5 h-5 w-5 text-muted-foreground/60" />
                    <div>
                      <p className="text-sm text-muted-foreground">Make / Model</p>
                      <p className="font-medium text-foreground">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Gauge className="mt-0.5 h-5 w-5 text-muted-foreground/60" />
                    <div>
                      <p className="text-sm text-muted-foreground">Onboard Fuel</p>
                      <p className="font-medium text-foreground">
                        {formatGallons(vehicle.currentFuelGallons)} / {formatGallons(vehicle.fuelCapacityGallons)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground/60" />
                    <div>
                      <p className="text-sm text-muted-foreground">Next Inspection</p>
                      <p className="font-medium text-foreground">{formatDate(vehicle.nextInspectionDue)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Card title="Recent Jobs" className="mt-6">
        {recentJobs.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No jobs assigned to this driver yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Job #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Site</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Scheduled</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Gallons</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-primary">{job.jobNumber}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{job.customerName}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{job.siteName}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(job.scheduledDate)}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{formatGallons(job.requestedGallons)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={job.status === 'completed' ? 'success' : job.status === 'cancelled' ? 'error' : 'default'}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Recent Fueling Events" className="mt-6">
        {fuelingEvents.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No fueling events recorded for this driver yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Job #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Equipment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Gallons</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {fuelingEvents.map((fe) => (
                  <tr key={fe.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDateTime(fe.createdAt)}</td>
                    <td className="px-4 py-3 text-sm font-mono text-primary">{fe.jobNumber}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{fe.customerName}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{fe.equipmentName}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{formatGallons(fe.gallonsDelivered)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{formatCurrency(fe.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={certModal.isOpen} onClose={certModal.close} title="Add Certification" size="md" footer={
        <>
          <Button variant="outline" onClick={certModal.close}>Cancel</Button>
          <Button onClick={() => { addToast({ type: 'success', title: 'Certification added', message: `Added to ${fullName}'s profile` }); certModal.close(); }}>Add Certification</Button>
        </>
      }>
        <div className="grid gap-4">
          <Select label="Certification Type" options={[
            { label: 'HAZMAT Endorsement', value: 'hazmat' },
            { label: 'Tanker Endorsement', value: 'tanker' },
            { label: 'First Aid/CPR', value: 'first_aid' },
            { label: 'Defensive Driving', value: 'defensive_driving' },
            { label: 'Medical Certificate', value: 'medical' },
            { label: 'DOT Safety Training', value: 'dot_safety' },
          ]} placeholder="Select certification" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Issued Date" type="date" />
            <Input label="Expiry Date" type="date" />
          </div>
          <Input label="Certificate Number (optional)" placeholder="e.g. CERT-2026-00001" />
          <Input label="Issuing Authority" placeholder="e.g. Texas DPS" />
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Upload Document</label>
            <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
              <p className="text-xs text-muted-foreground/60 mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={licenseModal.isOpen} onClose={licenseModal.close} title="Update License" size="md" footer={
        <>
          <Button variant="outline" onClick={licenseModal.close}>Cancel</Button>
          <Button onClick={() => { addToast({ type: 'success', title: 'License updated', message: `Updated ${fullName}'s license` }); licenseModal.close(); }}>Update License</Button>
        </>
      }>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="License Type" options={[
            { label: 'CDL-A', value: 'CDL-A' },
            { label: 'CDL-B', value: 'CDL-B' },
            { label: 'CDL-C', value: 'CDL-C' },
            { label: 'Standard', value: 'standard' },
          ]} defaultValue={driver.license.type} />
          <Input label="License Number" defaultValue={driver.license.number} />
          <Input label="State" defaultValue={driver.license.state} />
          <Input label="Expiry Date" type="date" defaultValue={driver.license.expiryDate} />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">Upload License Copy</label>
            <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
              <p className="text-xs text-muted-foreground/60 mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
