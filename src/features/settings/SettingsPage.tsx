import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { mockQuickBooksConfig, mockOpisConfig, mockNotificationPreferences, mockAutoAssignmentRules } from '@/mock';
import { formatDateTime } from '@/lib/format';
import { Link2, TrendingUp, Bell, Zap, Plus, Trash2 } from 'lucide-react';
const strategyLabels: Record<string, string> = { closest_driver: 'Closest Driver', fixed_pair: 'Fixed Pair', round_robin: 'Round Robin', least_loaded: 'Least Loaded' };
const strategyColors: Record<string, 'info' | 'success' | 'warning' | 'default'> = { closest_driver: 'info', fixed_pair: 'success', round_robin: 'warning', least_loaded: 'default' };

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('integrations');
  const { addToast } = useToast();
  const ruleModal = useModal();
  const [rules] = useState(mockAutoAssignmentRules);

  return (
    <div>
      <PageHeader title="Settings & Integrations" description="Configure integrations, notification preferences, and auto-assignment rules" />

      <Tabs tabs={[
        { key: 'integrations', label: 'Integrations' },
        { key: 'notifications', label: 'Notification Preferences' },
        { key: 'auto-assign', label: 'Auto-Assignment Rules', count: rules.length },
        { key: 'recurring', label: 'Recurring Schedules' },
      ]} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'integrations' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="QuickBooks Integration" description="Sync customers and invoices with QuickBooks">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Link2 className="h-5 w-5 text-muted-foreground/60" /><span className="font-medium">Status</span></div>
                  <Badge variant={mockQuickBooksConfig.isConnected ? 'success' : 'error'}>{mockQuickBooksConfig.isConnected ? 'Connected' : 'Disconnected'}</Badge>
                </div>
                {mockQuickBooksConfig.companyName && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Company</span><span className="font-medium">{mockQuickBooksConfig.companyName}</span></div>}
                {mockQuickBooksConfig.lastSyncAt && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Last Sync</span><span>{formatDateTime(mockQuickBooksConfig.lastSyncAt)}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Sync Frequency</span><span className="font-medium capitalize">{mockQuickBooksConfig.syncFrequency}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Auto-Sync Invoices</span><Badge variant={mockQuickBooksConfig.autoSyncInvoices ? 'success' : 'default'}>{mockQuickBooksConfig.autoSyncInvoices ? 'Enabled' : 'Disabled'}</Badge></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Auto-Sync Customers</span><Badge variant={mockQuickBooksConfig.autoSyncCustomers ? 'success' : 'default'}>{mockQuickBooksConfig.autoSyncCustomers ? 'Enabled' : 'Disabled'}</Badge></div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={() => addToast({ type: 'success', title: 'QuickBooks sync started' })}>Sync Now</Button>
                  <Button size="sm" variant="outline">Configure</Button>
                </div>
              </div>
            </Card>

            <Card title="OPIS Price Feed" description="Daily wholesale fuel pricing">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-muted-foreground/60" /><span className="font-medium">Status</span></div>
                  <Badge variant={mockOpisConfig.isEnabled ? 'success' : 'default'}>{mockOpisConfig.isEnabled ? 'Active' : 'Inactive'}</Badge>
                </div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Region</span><span className="font-medium">{mockOpisConfig.region}</span></div>
                {mockOpisConfig.lastFetchAt && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Last Fetch</span><span>{formatDateTime(mockOpisConfig.lastFetchAt)}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Auto-Fetch Daily</span><Badge variant={mockOpisConfig.autoFetchDaily ? 'success' : 'default'}>{mockOpisConfig.autoFetchDaily ? 'Enabled' : 'Disabled'}</Badge></div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={() => addToast({ type: 'success', title: 'OPIS rates fetched' })}>Fetch Now</Button>
                  <Button size="sm" variant="outline">Configure</Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <Card title="Notification Preferences" description="Configure which alerts you receive and how">
            <div className="max-w-lg space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Alert Types</h4>
                {([
                  ['Compliance Alerts', mockNotificationPreferences.complianceAlerts, 'Expiring licenses, certifications, and inspections'],
                  ['Overdue Job Alerts', mockNotificationPreferences.overdueJobAlerts, 'Jobs past their scheduled date'],
                  ['Invoice Alerts', mockNotificationPreferences.invoiceAlerts, 'Overdue and unpaid invoices'],
                  ['Driver Alerts', mockNotificationPreferences.driverAlerts, 'Hours violations and status changes'],
                  ['Vehicle Alerts', mockNotificationPreferences.vehicleAlerts, 'Maintenance due and registration expiry'],
                ] as [string, boolean, string][]).map(([label, enabled, desc]) => (
                  <div key={label} className="flex items-center justify-between rounded-lg border p-3">
                    <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
                    <Badge variant={enabled ? 'success' : 'default'}>{enabled ? 'On' : 'Off'}</Badge>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-t pt-4">
                <h4 className="text-sm font-semibold text-foreground">Advance Warning</h4>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Alert me</span>
                  <span className="rounded bg-primary/15 px-2 py-1 text-sm font-bold text-primary">{mockNotificationPreferences.complianceAlertDays}</span>
                  <span className="text-sm text-muted-foreground">days before document expiry</span>
                </div>
              </div>
              <div className="space-y-3 border-t pt-4">
                <h4 className="text-sm font-semibold text-foreground">Delivery Channels</h4>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-muted-foreground/60" /><span className="text-sm">In-App</span><Badge variant="success">Always On</Badge></div>
                  <div className="flex items-center gap-2"><span className="text-sm">Email</span><Badge variant={mockNotificationPreferences.emailNotifications ? 'success' : 'default'}>{mockNotificationPreferences.emailNotifications ? 'On' : 'Off'}</Badge></div>
                  <div className="flex items-center gap-2"><span className="text-sm">Push</span><Badge variant={mockNotificationPreferences.pushNotifications ? 'success' : 'default'}>{mockNotificationPreferences.pushNotifications ? 'On' : 'Off'}</Badge></div>
                </div>
              </div>
              <Button onClick={() => addToast({ type: 'success', title: 'Preferences saved' })}>Save Preferences</Button>
            </div>
          </Card>
        )}

        {activeTab === 'auto-assign' && (
          <div>
            <div className="mb-4 flex justify-end">
              <Button onClick={() => ruleModal.open()}><Plus className="h-4 w-4" /> Add Rule</Button>
            </div>
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead><tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Rule Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Strategy</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Driver</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border/50">
                    {rules.sort((a, b) => a.priority - b.priority).map((rule) => (
                      <tr key={rule.id}>
                        <td className="px-4 py-3 text-sm font-mono text-muted-foreground">#{rule.priority}</td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{rule.name}</td>
                        <td className="px-4 py-3"><Badge variant={strategyColors[rule.strategy]}>{strategyLabels[rule.strategy]}</Badge></td>
                        <td className="px-4 py-3 text-sm">{rule.customerName ?? <span className="text-muted-foreground/60">Any</span>}</td>
                        <td className="px-4 py-3 text-sm">{rule.driverName ?? <span className="text-muted-foreground/60">Auto</span>}</td>
                        <td className="px-4 py-3"><Badge variant={rule.isActive ? 'success' : 'default'}>{rule.isActive ? 'Active' : 'Inactive'}</Badge></td>
                        <td className="px-4 py-3"><button className="text-red-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <div className="mt-4 rounded-lg bg-sky-500/10 p-3 text-sm text-sky-400">
              <Zap className="mb-1 inline h-4 w-4" /> Rules are evaluated in priority order (lowest number first). Fixed-pair rules match specific customers to drivers. Fallback rules (e.g. "Least Loaded") apply when no specific rule matches.
            </div>

            <Modal isOpen={ruleModal.isOpen} onClose={ruleModal.close} title="Add Auto-Assignment Rule" size="lg" footer={
              <><Button variant="outline" onClick={ruleModal.close}>Cancel</Button><Button onClick={() => { addToast({ type: 'success', title: 'Rule created' }); ruleModal.close(); }}>Create Rule</Button></>
            }>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Rule Name" placeholder="e.g. Lone Star — Dave" />
                <Select label="Strategy" options={[{ label: 'Fixed Customer-Driver Pair', value: 'fixed_pair' }, { label: 'Closest Driver', value: 'closest_driver' }, { label: 'Round Robin', value: 'round_robin' }, { label: 'Least Loaded', value: 'least_loaded' }]} placeholder="Select strategy" />
                <Input label="Customer (optional)" placeholder="Leave blank for all customers" />
                <Input label="Driver (optional)" placeholder="Required for Fixed Pair" />
                <Input label="Priority" type="number" placeholder="1" helperText="Lower number = higher priority" />
              </div>
            </Modal>
          </div>
        )}

        {activeTab === 'recurring' && (
          <Card title="Recurring Job Schedules" description="Configure automatic job generation from recurring delivery schedules">
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Lone Star Construction — Weekly Diesel</p>
                    <p className="text-sm text-muted-foreground">Main Yard | 500 gal diesel | Every Monday 08:00-12:00</p>
                  </div>
                  <div className="flex items-center gap-2"><Badge variant="success">Active</Badge><span className="text-xs text-muted-foreground/60">Next: Jun 25</span></div>
                </div>
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground/60">
                  <span>Frequency: Weekly</span><span>Start: Jan 6, 2025</span><span>No end date</span><span>Generated: 78 jobs</span>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Gulf Coast Trucking — Weekly Diesel</p>
                    <p className="text-sm text-muted-foreground">Trucking Depot | 1,200 gal diesel | Every Wednesday 08:00-12:00</p>
                  </div>
                  <div className="flex items-center gap-2"><Badge variant="success">Active</Badge><span className="text-xs text-muted-foreground/60">Next: Jun 25</span></div>
                </div>
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground/60">
                  <span>Frequency: Weekly</span><span>Start: Mar 5, 2025</span><span>No end date</span><span>Generated: 68 jobs</span>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Tampa Bay Schools — Biweekly Diesel</p>
                    <p className="text-sm text-muted-foreground">Bus Depot A & B | 1,500 + 1,000 gal | Alternate Mondays 04:00-08:00</p>
                  </div>
                  <div className="flex items-center gap-2"><Badge variant="success">Active</Badge><span className="text-xs text-muted-foreground/60">Next: Jun 30</span></div>
                </div>
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground/60">
                  <span>Frequency: Biweekly</span><span>Start: Feb 3, 2025</span><span>Ends: Aug 15, 2026</span><span>Generated: 36 jobs</span>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Clearwater Resort — Monthly Diesel</p>
                    <p className="text-sm text-muted-foreground">Resort Facility | 400 gal diesel | 1st of each month 08:00-12:00</p>
                  </div>
                  <div className="flex items-center gap-2"><Badge variant="success">Active</Badge><span className="text-xs text-muted-foreground/60">Next: Jul 1</span></div>
                </div>
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground/60">
                  <span>Frequency: Monthly</span><span>Start: Apr 1, 2025</span><span>No end date</span><span>Generated: 15 jobs</span>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Hill Country Farms — Weekly Diesel</p>
                    <p className="text-sm text-muted-foreground">Ranch HQ | 350 gal diesel | Every Friday 08:00-12:00</p>
                  </div>
                  <div className="flex items-center gap-2"><Badge variant="success">Active</Badge><span className="text-xs text-muted-foreground/60">Next: Jun 27</span></div>
                </div>
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground/60">
                  <span>Frequency: Weekly</span><span>Start: Sep 6, 2024</span><span>No end date</span><span>Generated: 90 jobs</span>
                </div>
              </div>
              <Button onClick={() => addToast({ type: 'info', title: 'Create recurring schedules from the Jobs page using the "Create Job" form with the recurring option enabled.' })}>
                <Plus className="h-4 w-4" /> Add Recurring Schedule
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
