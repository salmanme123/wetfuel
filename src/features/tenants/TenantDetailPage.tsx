import { useParams, useNavigate } from 'react-router';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mockTenants } from '@/mock';
import { formatDate } from '@/lib/format';
import { ArrowLeft, Mail, Phone, MapPin, Palette } from 'lucide-react';

export function TenantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tenant = mockTenants.find((t) => t.id === id);

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tenant not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/tenants')}>Back to Tenants</Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={tenant.companyName}
        description={`Tenant Code: ${tenant.tenantCode}`}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/tenants')}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button>Edit Tenant</Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Company Information">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{tenant.contactEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{tenant.contactPhone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900">{tenant.address}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Status & Statistics">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <StatusBadge status={tenant.status} type="tenant" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Platform Owner</span>
              <Badge variant={tenant.isPlatformOwner ? 'info' : 'default'}>
                {tenant.isPlatformOwner ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Franchises</span>
              <span className="font-medium text-gray-900">{tenant.franchiseCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Users</span>
              <span className="font-medium text-gray-900">{tenant.userCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Created</span>
              <span className="font-medium text-gray-900">{formatDate(tenant.createdAt)}</span>
            </div>
          </div>
        </Card>

        <Card title="Branding" className="lg:col-span-2">
          <div className="flex items-center gap-6">
            <Palette className="h-8 w-8 text-gray-400" />
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="h-12 w-12 rounded-lg border" style={{ backgroundColor: tenant.branding.primaryColor }} />
                <p className="mt-1 text-xs text-gray-500">Primary</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-lg border" style={{ backgroundColor: tenant.branding.secondaryColor }} />
                <p className="mt-1 text-xs text-gray-500">Secondary</p>
              </div>
            </div>
            <div className="ml-6">
              <p className="text-sm text-gray-500">Primary: {tenant.branding.primaryColor}</p>
              <p className="text-sm text-gray-500">Secondary: {tenant.branding.secondaryColor}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
