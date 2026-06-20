import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card } from '@/components/ui/Card';
import { masterFranchiseKpis, dailyDeliveriesData } from '@/mock';
import { formatCurrency, formatGallons } from '@/lib/format';
import { Boxes, DollarSign, Droplets, Clock, ShieldCheck, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function MasterFranchiseDashboard() {
  return (
    <div>
      <PageHeader title="Regional Overview" description="Texas South region metrics and franchise performance" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard title="Franchises" value={masterFranchiseKpis.franchisesInRegion} icon={Boxes} />
        <StatsCard title="Regional Revenue" value={formatCurrency(masterFranchiseKpis.regionalRevenue)} icon={DollarSign} iconColor="text-green-600 bg-green-100" trend={{ value: 11, direction: 'up' }} />
        <StatsCard title="Regional Gallons" value={formatGallons(masterFranchiseKpis.regionalGallons)} icon={Droplets} iconColor="text-blue-600 bg-blue-100" />
        <StatsCard title="Avg Delivery (min)" value={masterFranchiseKpis.avgDeliveryTime} icon={Clock} iconColor="text-orange-600 bg-orange-100" trend={{ value: 5, direction: 'down' }} />
        <StatsCard title="Compliance" value={`${masterFranchiseKpis.complianceScore}%`} icon={ShieldCheck} iconColor="text-emerald-600 bg-emerald-100" />
        <StatsCard title="Active Drivers" value={masterFranchiseKpis.activeDrivers} icon={Users} iconColor="text-purple-600 bg-purple-100" />
      </div>

      <div className="mt-6">
        <Card title="Daily Deliveries (Last 14 Days)">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyDeliveriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
