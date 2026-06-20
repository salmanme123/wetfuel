import { useParams, useNavigate } from 'react-router';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { mockJobs } from '@/mock';
import { formatGallons, formatDate, formatDateTime } from '@/lib/format';
import { ArrowLeft, MapPin, User, Truck, Droplets, Calendar, Clock, FileText, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { JobStatus } from '@/types';

const statusSteps: JobStatus[] = ['draft', 'pending', 'assigned', 'in_progress', 'completed'];
const stepLabels: Record<string, string> = { draft: 'Draft', pending: 'Pending', assigned: 'Assigned', in_progress: 'In Progress', completed: 'Completed' };

export function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const job = mockJobs.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Job not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/jobs')}>Back to Jobs</Button>
      </div>
    );
  }

  const currentStepIndex = job.status === 'cancelled' ? -1 : statusSteps.indexOf(job.status);

  const getActions = () => {
    switch (job.status) {
      case 'draft':
        return (
          <>
            <Button onClick={() => addToast({ type: 'success', title: 'Job submitted for dispatch' })}>Submit</Button>
            <Button variant="danger" onClick={() => addToast({ type: 'warning', title: 'Job cancelled' })}>Cancel</Button>
          </>
        );
      case 'pending':
        return (
          <>
            <Button onClick={() => addToast({ type: 'success', title: 'Driver assigned' })}>Assign Driver</Button>
            <Button variant="danger" onClick={() => addToast({ type: 'warning', title: 'Job cancelled' })}>Cancel</Button>
          </>
        );
      case 'assigned':
        return <Button onClick={() => addToast({ type: 'success', title: 'Job started' })}>Start Delivery</Button>;
      case 'in_progress':
        return <Button onClick={() => addToast({ type: 'success', title: 'Job completed' })}>Mark Complete</Button>;
      default:
        return null;
    }
  };

  return (
    <div>
      <PageHeader
        title={job.jobNumber}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/jobs')}><ArrowLeft className="h-4 w-4" /> Back</Button>
            {getActions()}
          </div>
        }
      />

      {job.status !== 'cancelled' && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium',
                      isCompleted ? 'border-green-500 bg-green-500 text-white' :
                      isCurrent ? 'border-brand-600 bg-brand-600 text-white' :
                      'border-gray-300 bg-white text-gray-400',
                    )}>
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : index + 1}
                    </div>
                    <p className={cn('mt-2 text-xs font-medium', isCurrent ? 'text-brand-600' : isCompleted ? 'text-green-600' : 'text-gray-400')}>
                      {stepLabels[step]}
                    </p>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div className={cn('mx-2 h-0.5 flex-1', index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200')} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {job.status === 'cancelled' && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">This job has been cancelled.</p>
          {job.notes && <p className="mt-1 text-sm text-red-600">{job.notes}</p>}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Job Information">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <StatusBadge status={job.status} type="job" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Priority</span>
              <StatusBadge status={job.priority} type="priority" />
            </div>
            <div className="flex items-center gap-3">
              <Droplets className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Fuel Type</p>
                <p className="font-medium">{job.fuelType}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Droplets className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Requested Gallons</p>
                <p className="font-medium">{formatGallons(job.requestedGallons)}</p>
              </div>
            </div>
            {job.deliveredGallons && (
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Delivered Gallons</p>
                  <p className="font-medium text-green-700">{formatGallons(job.deliveredGallons)}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Scheduled Date</p>
                <p className="font-medium">{formatDate(job.scheduledDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Time Window</p>
                <p className="font-medium">{job.scheduledTimeWindow}</p>
              </div>
            </div>
            {job.completedAt && (
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Completed At</p>
                  <p className="font-medium text-green-700">{formatDateTime(job.completedAt)}</p>
                </div>
              </div>
            )}
            {job.notes && (
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-sm text-gray-700">{job.notes}</p>
                </div>
              </div>
            )}
            {job.isRecurring && <Badge variant="info">Recurring Job</Badge>}
          </div>
        </Card>

        <Card title="Assignment">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium text-gray-900">{job.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Site</p>
                <p className="font-medium">{job.siteName}</p>
                <p className="text-sm text-gray-600">{job.siteAddress}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Driver</p>
                <p className="font-medium">{job.driverName ?? <span className="text-gray-400">Not assigned</span>}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Vehicle</p>
                <p className="font-medium">{job.vehicleName ?? <span className="text-gray-400">Not assigned</span>}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
