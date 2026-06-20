import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { corporateKpis, monthlyRevenueData } from '@/mock';
import { mockTenants } from '@/mock';
import { formatCurrency, formatGallons, formatNumber } from '@/lib/format';
import { Building2, Boxes, Droplets, DollarSign, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function CorporateDashboard() {
  return (
    <div>
      <PageHeader title="Network Overview" description="Platform-wide metrics across all tenants" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <StatsCard title="Total Tenants" value={corporateKpis.totalTenants} icon={Building2} trend={{ value: 33, direction: 'up' }} />
        <StatsCard title="Active Franchises" value={corporateKpis.totalFranchises} icon={Boxes} iconColor="text-purple-600 bg-purple-100" trend={{ value: 12, direction: 'up' }} />
        <StatsCard title="Gallons This Month" value={formatGallons(corporateKpis.totalGallonsThisMonth)} icon={Droplets} iconColor="text-blue-600 bg-blue-100" trend={{ value: 8, direction: 'up' }} />
        <StatsCard title="Network Revenue" value={formatCurrency(corporateKpis.networkRevenue)} icon={DollarSign} iconColor="text-green-600 bg-green-100" trend={{ value: 15, direction: 'up' }} />
        <StatsCard title="Compliance Score" value={`${corporateKpis.complianceScore}%`} icon={ShieldCheck} iconColor="text-emerald-600 bg-emerald-100" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Monthly Revenue">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${formatNumber(v / 1000)}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Tenant Status">
          <div className="space-y-3">
            {mockTenants.map((tenant) => (
              <div key={tenant.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                <div>
                  <p className="font-medium text-gray-900">{tenant.companyName}</p>
                  <p className="text-sm text-gray-500">{tenant.tenantCode}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">{tenant.franchiseCount} franchises</p>
                    <p className="text-xs text-gray-500">{tenant.userCount} users</p>
                  </div>
                  <StatusBadge status={tenant.status} type="tenant" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
