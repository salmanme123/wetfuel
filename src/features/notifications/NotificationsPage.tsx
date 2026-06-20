import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { mockNotifications } from '@/mock';
import { formatRelativeTime } from '@/lib/format';
import { Bell, Shield, Truck, FileText, Settings, User, CarFront, Check } from 'lucide-react';
import { cn } from '@/lib/cn';
const categoryIcons: Record<string, typeof Bell> = { compliance: Shield, job: Truck, invoice: FileText, system: Settings, driver: User, vehicle: CarFront };
const priorityColors: Record<string, 'default' | 'info' | 'warning' | 'error'> = { low: 'default', medium: 'info', high: 'warning', critical: 'error' };

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState('all');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = activeTab === 'all' ? notifications : activeTab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications.filter((n) => n.category === activeTab);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));

  const tabs = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'compliance', label: 'Compliance' },
    { key: 'job', label: 'Jobs' },
    { key: 'invoice', label: 'Invoices' },
    { key: 'vehicle', label: 'Vehicles' },
  ];

  return (
    <div>
      <PageHeader title="Notifications" description="Alerts for compliance, overdue jobs, expiring documents, and system events" actions={
        unreadCount > 0 ? <Button variant="outline" onClick={markAllRead}><Check className="h-4 w-4" /> Mark All Read</Button> : undefined
      } />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6 space-y-2">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No notifications</div>
        ) : (
          filtered.map((notif) => {
            const Icon = categoryIcons[notif.category] ?? Bell;
            return (
              <div
                key={notif.id}
                className={cn(
                  'flex items-start gap-4 rounded-lg border p-4 transition-colors cursor-pointer',
                  notif.isRead ? 'border-border bg-card' : 'border-brand-200 bg-primary/10',
                )}
                onClick={() => { markRead(notif.id); if (notif.link) navigate(notif.link); }}
              >
                <div className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  notif.priority === 'critical' ? 'bg-red-100 text-red-400' : notif.priority === 'high' ? 'bg-amber-500/15 text-amber-400' : 'bg-muted text-muted-foreground',
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={cn('text-sm', notif.isRead ? 'font-medium text-foreground' : 'font-semibold text-foreground')}>{notif.title}</h3>
                    <Badge variant={priorityColors[notif.priority]}>{notif.priority}</Badge>
                    {!notif.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{notif.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">{formatRelativeTime(notif.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
