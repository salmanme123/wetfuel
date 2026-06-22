import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { AreaChart, BarChart, HorizontalBarChart, PieChart } from '@/components/charts';
import { deliveryDayTooltip, fuelTypeVolumeTooltip, monthlyRevenueTooltip } from '@/lib/chart-tooltips';
import { mockCustomers, mockDrivers, mockInvoices, dailyDeliveriesData, monthlyRevenueData, fuelTypeBreakdown } from '@/mock';
import { formatCurrency, formatGallons, formatNumber } from '@/lib/format';

const PIE_COLORS = ['#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState('fuel');

  const topCustomers = mockCustomers.sort((a, b) => b.totalGallonsDelivered - a.totalGallonsDelivered).slice(0, 5);
  const topDrivers = mockDrivers.sort((a, b) => b.totalDeliveries - a.totalDeliveries).slice(0, 5);

  return (
    <div>
      <PageHeader title="Reporting & Analytics" description="Fuel, financial, driver, and compliance reports" />

      <Tabs tabs={[
        { key: 'fuel', label: 'Fuel Reports' },
        { key: 'financial', label: 'Financial' },
        { key: 'driver', label: 'Driver Performance' },
        { key: 'inventory', label: 'Inventory' },
      ]} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'fuel' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Daily Deliveries">
              <div className="h-72">
                <BarChart
                  data={dailyDeliveriesData}
                  categoryField="date"
                  valueField="count"
                  tooltipTextFormatter={deliveryDayTooltip}
                />
              </div>
            </Card>

            <Card title="Fuel Type Breakdown">
              <div className="h-72">
                <PieChart
                  data={fuelTypeBreakdown}
                  categoryField="type"
                  valueField="gallons"
                  colors={PIE_COLORS}
                  tooltipTextFormatter={fuelTypeVolumeTooltip}
                />
              </div>
            </Card>

            <Card title="Top Customers by Gallons" className="lg:col-span-2">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead><tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">#</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Customer</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Deliveries</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Total Gallons</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border/50">
                    {topCustomers.map((c, i) => (
                      <tr key={c.id}>
                        <td className="px-4 py-3 text-sm font-medium">{i + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{c.companyName}</td>
                        <td className="px-4 py-3"><Badge variant="info">{c.category}</Badge></td>
                        <td className="px-4 py-3 text-sm">{c.totalDeliveries}</td>
                        <td className="px-4 py-3 text-sm font-medium">{formatGallons(c.totalGallonsDelivered)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Monthly Revenue Trend">
              <div className="h-72">
                <AreaChart
                  data={monthlyRevenueData}
                  categoryField="month"
                  valueField="revenue"
                  color="#10b981"
                  fillColor="#d1fae5"
                  tooltipTextFormatter={monthlyRevenueTooltip}
                  yAxisFormatter={(v) => `$${formatNumber(v / 1000)}k`}
                />
              </div>
            </Card>

            <Card title="Invoice Summary">
              <div className="space-y-4">
                {(['paid', 'sent', 'overdue', 'draft'] as const).map((status) => {
                  const invoices = mockInvoices.filter((i) => i.status === status);
                  const total = invoices.reduce((s, i) => s + i.total, 0);
                  return (
                    <div key={status} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={status === 'paid' ? 'success' : status === 'overdue' ? 'error' : status === 'sent' ? 'info' : 'default'}>{status}</Badge>
                        <span className="text-sm text-muted-foreground">{invoices.length} invoices</span>
                      </div>
                      <span className="font-medium">{formatCurrency(total)}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'driver' && (
          <Card title="Top Drivers by Deliveries">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead><tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">#</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Driver</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Franchise</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Deliveries</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Total Gallons</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Hours/Week</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Compliance</th>
                </tr></thead>
                <tbody className="divide-y divide-border/50">
                  {topDrivers.map((d, i) => (
                    <tr key={d.id}>
                      <td className="px-4 py-3 text-sm font-medium">{i + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{d.firstName} {d.lastName}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{d.organizationName}</td>
                      <td className="px-4 py-3 text-sm">{d.totalDeliveries}</td>
                      <td className="px-4 py-3 text-sm">{formatGallons(d.totalGallonsDelivered)}</td>
                      <td className="px-4 py-3 text-sm">{d.hoursThisWeek}h</td>
                      <td className="px-4 py-3"><span className={`font-medium ${d.complianceScore >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{d.complianceScore}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'inventory' && (
          <Card title="Fuel Type Distribution (Total Gallons Delivered This Month)">
            <div className="h-80">
              <HorizontalBarChart
                data={fuelTypeBreakdown}
                categoryField="type"
                valueField="gallons"
                tooltipTextFormatter={fuelTypeVolumeTooltip}
                xAxisFormatter={(v) => formatNumber(v)}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
