import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  monthlyRevenueData,
  mockTenants,
  mockNotifications,
  mockInvoices,
  mockComplianceScorecards,
  mockComplianceDocuments,
  mockSafetyIncidents,
  mockJobs,
  mockAuditLog,
  mockQuickBooksConfig,
  mockOpisConfig,
  mockUsers,
} from '@/mock';
import { formatCurrency, formatGallons, formatNumber, formatRelativeTime } from '@/lib/format';
import { JOB_STATUSES } from '@/lib/constants';
import { cn } from '@/lib/cn';
import {
  AlertTriangle,
  Bell,
  Building2,
  CheckCircle2,
  DollarSign,
  Link2,
  Shield,
  ShieldAlert,
  Truck,
  Users,
  XCircle,
} from 'lucide-react';
import { AreaChart } from '@/components/charts';
import { monthlyRevenueTooltip } from '@/lib/chart-tooltips';

const priorityColors: Record<string, 'default' | 'info' | 'warning' | 'error'> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  critical: 'error',
};

const actionColors: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  create: 'success',
  update: 'info',
  delete: 'error',
  login: 'default',
  logout: 'default',
  assign: 'info',
  status_change: 'warning',
  sync: 'success',
  suspend: 'error',
  reactivate: 'success',
};

export function CorporateDashboard() {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const activeTenants = mockTenants.filter((t) => t.status === 'active').length;
    const suspendedTenants = mockTenants.filter((t) => t.status === 'suspended').length;
    const totalNetworkUsers = mockTenants.reduce((sum, t) => sum + t.userCount, 0);
    const totalFranchises = mockTenants.reduce((sum, t) => sum + t.franchiseCount, 0);

    const criticalAlerts = mockNotifications.filter(
      (n) => !n.isRead && (n.priority === 'critical' || n.priority === 'high'),
    ).length;
    const unreadAlerts = mockNotifications.filter((n) => !n.isRead).length;

    const outstanding = mockInvoices
      .filter((i) => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.total, 0);
    const overdueInvoices = mockInvoices.filter((i) => i.status === 'overdue');
    const overdueAmount = overdueInvoices.reduce((sum, i) => sum + i.total, 0);

    const avgCompliance = Math.round(
      mockComplianceScorecards.reduce((sum, s) => sum + s.overallScore, 0) / mockComplianceScorecards.length,
    );
    const expiredDocs = mockComplianceDocuments.filter((d) => d.status === 'expired').length;
    const expiringSoonDocs = mockComplianceDocuments.filter((d) => d.status === 'expiring_soon').length;
    const openIncidents = mockSafetyIncidents.filter((i) => i.status === 'investigating').length;

    const activeJobs = mockJobs.filter((j) => j.status === 'in_progress' || j.status === 'assigned').length;
    const unassignedJobs = mockJobs.filter(
      (j) => !j.driverId && j.status !== 'completed' && j.status !== 'cancelled',
    ).length;
    const gallonsThisMonth = mockJobs
      .filter((j) => j.status === 'completed')
      .reduce((sum, j) => sum + (j.deliveredGallons ?? 0), 0);

    const jobCounts = JOB_STATUSES.map((s) => ({
      ...s,
      count: mockJobs.filter((j) => j.status === s.value).length,
    }));
    const maxJobCount = Math.max(...jobCounts.map((j) => j.count), 1);

    const franchiseScores = Object.values(
      mockComplianceScorecards.reduce<Record<string, (typeof mockComplianceScorecards)[0]>>((acc, sc) => {
        const existing = acc[sc.organizationId];
        if (!existing || sc.overallScore < existing.overallScore) {
          acc[sc.organizationId] = sc;
        }
        return acc;
      }, {}),
    ).sort((a, b) => a.overallScore - b.overallScore);

    const attentionAlerts = mockNotifications
      .filter((n) => !n.isRead)
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 5);

    const recentActivity = [...mockAuditLog]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);

    const activeUsers = mockUsers.filter((u) => u.status === 'active').length;

    return {
      activeTenants,
      suspendedTenants,
      totalNetworkUsers,
      totalFranchises,
      criticalAlerts,
      unreadAlerts,
      outstanding,
      overdueInvoices: overdueInvoices.length,
      overdueAmount,
      avgCompliance,
      expiredDocs,
      expiringSoonDocs,
      openIncidents,
      activeJobs,
      unassignedJobs,
      gallonsThisMonth,
      jobCounts,
      maxJobCount,
      franchiseScores,
      attentionAlerts,
      recentActivity,
      activeUsers,
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        description="Network health, financial exposure, compliance risks, and platform activity at a glance"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          title="Critical Alerts"
          value={stats.criticalAlerts}
          icon={Bell}
          iconColor="text-red-400 bg-red-500/10"
        />
        <StatsCard
          title="Outstanding AR"
          value={formatCurrency(stats.outstanding)}
          icon={DollarSign}
          iconColor="text-amber-400 bg-amber-500/15"
        />
        <StatsCard
          title="Overdue Invoices"
          value={stats.overdueInvoices}
          icon={AlertTriangle}
          iconColor="text-red-400 bg-red-100"
        />
        <StatsCard
          title="Compliance Score"
          value={`${stats.avgCompliance}%`}
          icon={Shield}
          iconColor="text-emerald-600 bg-emerald-100"
        />
        <StatsCard
          title="Active Jobs"
          value={stats.activeJobs}
          icon={Truck}
          iconColor="text-sky-400 bg-sky-500/15"
        />
        <StatsCard
          title="Network Users"
          value={stats.totalNetworkUsers}
          icon={Users}
          iconColor="text-purple-600 bg-purple-100"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card
          title="Requires Attention"
          description={`${stats.unreadAlerts} unread alerts across the network`}
          className="lg:col-span-2"
          footer={
            <button
              onClick={() => navigate('/notifications')}
              className="cursor-pointer text-sm font-medium text-primary hover:underline"
            >
              View all notifications
            </button>
          }
        >
          {stats.attentionAlerts.length === 0 ? (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              No unread alerts — network is in good standing.
            </div>
          ) : (
            <div className="space-y-2">
              {stats.attentionAlerts.map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => alert.link && navigate(alert.link)}
                  className="flex w-full cursor-pointer items-start gap-3 rounded-lg border border-border/50 p-3 text-left transition-colors hover:bg-accent/50"
                >
                  <ShieldAlert
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0',
                      alert.priority === 'critical'
                        ? 'text-red-400'
                        : alert.priority === 'high'
                          ? 'text-amber-400'
                          : 'text-muted-foreground',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{alert.title}</p>
                      <Badge variant={priorityColors[alert.priority]}>{alert.priority}</Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{alert.message}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground/60">{formatRelativeTime(alert.createdAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card title="System Health">
          <div className="space-y-4">
            <div className="rounded-lg border border-border/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">QuickBooks</span>
                </div>
                <Badge variant={mockQuickBooksConfig.isConnected ? 'success' : 'error'}>
                  {mockQuickBooksConfig.isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              {mockQuickBooksConfig.isConnected && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {mockQuickBooksConfig.companyName} · Last sync {formatRelativeTime(mockQuickBooksConfig.lastSyncAt!)}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">OPIS Pricing</span>
                </div>
                <Badge variant={mockOpisConfig.isEnabled ? 'success' : 'error'}>
                  {mockOpisConfig.isEnabled ? 'Active' : 'Disabled'}
                </Badge>
              </div>
              {mockOpisConfig.isEnabled && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {mockOpisConfig.region} · Last fetch {formatRelativeTime(mockOpisConfig.lastFetchAt!)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{stats.activeTenants}</p>
                <p className="text-xs text-muted-foreground">Active tenants</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className={cn('text-2xl font-bold', stats.suspendedTenants > 0 ? 'text-red-400' : 'text-foreground')}>
                  {stats.suspendedTenants}
                </p>
                <p className="text-xs text-muted-foreground">Suspended</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Monthly Revenue">
          <div className="h-72 min-h-[288px]">
            <AreaChart
              data={monthlyRevenueData}
              categoryField="month"
              valueField="revenue"
              tooltipTextFormatter={monthlyRevenueTooltip}
              yAxisFormatter={(v) => `$${formatNumber(v / 1000)}k`}
            />
          </div>
        </Card>

        <Card
          title="Job Pipeline"
          description={`${stats.unassignedJobs} unassigned · ${formatGallons(stats.gallonsThisMonth)} delivered`}
          footer={
            <button onClick={() => navigate('/jobs')} className="cursor-pointer text-sm font-medium text-primary hover:underline">
              Manage jobs
            </button>
          }
        >
          <div className="space-y-2">
            {stats.jobCounts.map((job) => (
              <button
                key={job.value}
                type="button"
                onClick={() => navigate(`/jobs?status=${job.value}`)}
                className="w-full cursor-pointer rounded-lg p-2 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{job.label}</span>
                  <span className="font-medium text-foreground">{job.count}</span>
                </div>
                <div className="h-2 rounded-full bg-border">
                  <div
                    className={cn('h-2 rounded-full transition-all', job.color.split(' ').find((c) => c.startsWith('bg-')) ?? 'bg-primary')}
                    style={{ width: `${(job.count / stats.maxJobCount) * 100}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card
          title="Compliance & Risk"
          description="Franchises needing oversight"
          footer={
            <button onClick={() => navigate('/compliance')} className="cursor-pointer text-sm font-medium text-primary hover:underline">
              View compliance center
            </button>
          }
        >
          <div className="mb-4 flex flex-wrap gap-2">
            {stats.expiredDocs > 0 && <Badge variant="error">{stats.expiredDocs} expired docs</Badge>}
            {stats.expiringSoonDocs > 0 && <Badge variant="warning">{stats.expiringSoonDocs} expiring soon</Badge>}
            {stats.openIncidents > 0 && <Badge variant="warning">{stats.openIncidents} open incident</Badge>}
            {stats.expiredDocs === 0 && stats.expiringSoonDocs === 0 && stats.openIncidents === 0 && (
              <Badge variant="success">All clear</Badge>
            )}
          </div>
          <div className="space-y-3">
            {stats.franchiseScores.slice(0, 4).map((sc) => (
              <div key={sc.organizationId} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{sc.organizationName}</p>
                  <p className="text-xs text-muted-foreground">
                    {sc.expiredDocuments > 0 && <span className="text-red-400">{sc.expiredDocuments} expired · </span>}
                    {sc.expiringSoonDocuments > 0 && (
                      <span className="text-amber-400">{sc.expiringSoonDocuments} expiring · </span>
                    )}
                    {sc.totalDocuments} documents
                  </p>
                </div>
                <span
                  className={cn(
                    'text-xl font-bold',
                    sc.overallScore >= 90 ? 'text-emerald-400' : sc.overallScore >= 80 ? 'text-amber-400' : 'text-red-400',
                  )}
                >
                  {sc.overallScore}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Financial Snapshot"
          footer={
            <button onClick={() => navigate('/invoices')} className="cursor-pointer text-sm font-medium text-primary hover:underline">
              View invoices
            </button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border/50 p-4">
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className="mt-1 text-xl font-bold text-amber-400">{formatCurrency(stats.outstanding)}</p>
              </div>
              <div className="rounded-lg border border-border/50 p-4">
                <p className="text-xs text-muted-foreground">Overdue Amount</p>
                <p className="mt-1 text-xl font-bold text-red-400">{formatCurrency(stats.overdueAmount)}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="mb-3 text-sm font-medium text-foreground">Tenant Status</p>
              <div className="space-y-2">
                {mockTenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{tenant.companyName}</p>
                        <p className="text-xs text-muted-foreground">
                          {tenant.franchiseCount} franchises · {tenant.userCount} users
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={tenant.status} type="tenant" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card
          title="Recent Platform Activity"
          description={`${stats.activeUsers} active users across ${stats.totalFranchises} franchises`}
          footer={
            <button onClick={() => navigate('/audit')} className="cursor-pointer text-sm font-medium text-primary hover:underline">
              View full audit log
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Time</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">User</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Action</th>
                  <th className="hidden px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground sm:table-cell">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {stats.recentActivity.map((entry) => (
                  <tr key={entry.id} className="hover:bg-accent/30">
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted-foreground">
                      {formatRelativeTime(entry.timestamp)}
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-sm font-medium text-foreground">{entry.userName}</p>
                      <p className="text-xs text-muted-foreground">{entry.userRole}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={actionColors[entry.action] ?? 'default'}>
                          {entry.action.replace('_', ' ')}
                        </Badge>
                        {entry.action === 'suspend' && <XCircle className="h-3.5 w-3.5 text-red-400" />}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{entry.entityName}</p>
                    </td>
                    <td className="hidden px-3 py-2.5 text-sm text-muted-foreground sm:table-cell">
                      {entry.description}
                    </td>
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
