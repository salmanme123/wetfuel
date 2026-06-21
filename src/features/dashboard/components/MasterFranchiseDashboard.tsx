import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card } from '@/components/ui/Card';
import { BarChart } from '@/components/charts';
import { masterFranchiseKpis, dailyDeliveriesData } from '@/mock';
import { formatCurrency, formatGallons } from '@/lib/format';
import { Boxes, DollarSign, Droplets, Clock, ShieldCheck, Users } from 'lucide-react';

export function MasterFranchiseDashboard() {
  return (
    <div>
      <PageHeader title="Regional Overview" description="Texas South region metrics and franchise performance" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard title="Franchises" value={masterFranchiseKpis.franchisesInRegion} icon={Boxes} />
        <StatsCard title="Regional Revenue" value={formatCurrency(masterFranchiseKpis.regionalRevenue)} icon={DollarSign} iconColor="text-emerald-400 bg-emerald-500/10" trend={{ value: 11, direction: 'up' }} />
        <StatsCard title="Regional Gallons" value={formatGallons(masterFranchiseKpis.regionalGallons)} icon={Droplets} iconColor="text-sky-400 bg-sky-500/15" />
        <StatsCard title="Avg Delivery (min)" value={masterFranchiseKpis.avgDeliveryTime} icon={Clock} iconColor="text-amber-400 bg-amber-500/15" trend={{ value: 5, direction: 'down' }} />
        <StatsCard title="Compliance" value={`${masterFranchiseKpis.complianceScore}%`} icon={ShieldCheck} iconColor="text-emerald-600 bg-emerald-100" />
        <StatsCard title="Active Drivers" value={masterFranchiseKpis.activeDrivers} icon={Users} iconColor="text-purple-600 bg-purple-100" />
      </div>

      <div className="mt-6">
        <Card title="Daily Deliveries (Last 14 Days)">
          <div className="h-72">
            <BarChart data={dailyDeliveriesData} categoryField="date" valueField="count" />
          </div>
        </Card>
      </div>
    </div>
  );
}
