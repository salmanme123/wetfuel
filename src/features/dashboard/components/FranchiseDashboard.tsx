import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { franchiseKpis, monthlyRevenueData, dailyDeliveriesData } from '@/mock';
import { mockJobs } from '@/mock';
import { formatCurrency, formatGallons, formatDate, formatNumber } from '@/lib/format';
import { Truck, Droplets, Users, FileText, ShieldCheck, UserCheck } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function FranchiseDashboard() {
  const navigate = useNavigate();
  const recentJobs = mockJobs
    .filter((j) => j.status !== 'cancelled')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  return (
    <div>
      <PageHeader title="Operations Dashboard" description="Dallas-North franchise daily overview" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard title="Active Jobs" value={franchiseKpis.activeJobsToday} icon={Truck} trend={{ value: 20, direction: 'up' }} />
        <StatsCard title="Gallons Today" value={formatGallons(franchiseKpis.gallonsDeliveredToday)} icon={Droplets} iconColor="text-sky-400 bg-sky-500/15" />
        <StatsCard title="Active Drivers" value={franchiseKpis.activeDrivers} icon={Users} iconColor="text-purple-600 bg-purple-100" />
        <StatsCard title="Pending Invoices" value={franchiseKpis.pendingInvoices} icon={FileText} iconColor="text-amber-400 bg-amber-500/15" />
        <StatsCard title="Compliance" value={`${franchiseKpis.complianceScore}%`} icon={ShieldCheck} iconColor="text-emerald-600 bg-emerald-100" />
        <StatsCard title="Customers" value={franchiseKpis.totalCustomers} icon={UserCheck} iconColor="text-cyan-600 bg-cyan-100" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Monthly Revenue">
          <div className="h-64">
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

        <Card title="Daily Deliveries">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyDeliveriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Recent Jobs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Job #</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Customer</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Gallons</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentJobs.map((job) => (
                  <tr key={job.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/jobs/${job.id}`)}>
                    <td className="px-4 py-3 text-sm font-mono text-primary">{job.jobNumber}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{job.customerName}</td>
                    <td className="px-4 py-3"><StatusBadge status={job.status} type="job" /></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(job.scheduledDate)}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{formatGallons(job.requestedGallons)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
