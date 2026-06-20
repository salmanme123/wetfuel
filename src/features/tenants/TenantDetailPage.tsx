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
        <p className="text-muted-foreground">Tenant not found</p>
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
              <Mail className="h-5 w-5 text-muted-foreground/60" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{tenant.contactEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground/60" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground">{tenant.contactPhone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground/60" />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium text-foreground">{tenant.address}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Status & Statistics">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={tenant.status} type="tenant" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Platform Owner</span>
              <Badge variant={tenant.isPlatformOwner ? 'info' : 'default'}>
                {tenant.isPlatformOwner ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Franchises</span>
              <span className="font-medium text-foreground">{tenant.franchiseCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Users</span>
              <span className="font-medium text-foreground">{tenant.userCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="font-medium text-foreground">{formatDate(tenant.createdAt)}</span>
            </div>
          </div>
        </Card>

        <Card title="Branding" className="lg:col-span-2">
          <div className="flex items-center gap-6">
            <Palette className="h-8 w-8 text-muted-foreground/60" />
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="h-12 w-12 rounded-lg border" style={{ backgroundColor: tenant.branding.primaryColor }} />
                <p className="mt-1 text-xs text-muted-foreground">Primary</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-lg border" style={{ backgroundColor: tenant.branding.secondaryColor }} />
                <p className="mt-1 text-xs text-muted-foreground">Secondary</p>
              </div>
            </div>
            <div className="ml-6">
              <p className="text-sm text-muted-foreground">Primary: {tenant.branding.primaryColor}</p>
              <p className="text-sm text-muted-foreground">Secondary: {tenant.branding.secondaryColor}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
