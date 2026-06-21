import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Bell, Shield, Truck, FileText, Settings, User, CarFront } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { mockNotifications } from '@/mock';
import { formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/cn';

const categoryIcons: Record<string, typeof Bell> = { compliance: Shield, job: Truck, invoice: FileText, system: Settings, driver: User, vehicle: CarFront };
const priorityColors: Record<string, 'default' | 'info' | 'warning' | 'error'> = { low: 'default', medium: 'info', high: 'warning', critical: 'error' };

export function NotificationBell() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recent = mockNotifications.slice(0, 5);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && <Badge variant="error">{unreadCount} unread</Badge>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {recent.map((notif) => {
              const Icon = categoryIcons[notif.category] ?? Bell;
              return (
                <div
                  key={notif.id}
                  className={cn('flex items-start gap-3 border-b border-border/50 px-4 py-3 cursor-pointer hover:bg-accent/50', !notif.isRead && 'bg-primary/5')}
                  onClick={() => { setIsOpen(false); if (notif.link) navigate(notif.link); }}
                >
                  <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', notif.priority === 'critical' ? 'text-red-400' : notif.priority === 'high' ? 'text-amber-400' : 'text-muted-foreground')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={cn('text-xs truncate', notif.isRead ? 'text-foreground' : 'font-semibold text-foreground')}>{notif.title}</p>
                      <Badge variant={priorityColors[notif.priority]} className="text-[0.5rem] shrink-0">{notif.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatRelativeTime(notif.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-border p-2">
            <button onClick={() => { setIsOpen(false); navigate('/notifications'); }} className="w-full cursor-pointer rounded-lg py-2 text-center text-sm font-medium text-primary hover:bg-primary/10">View All Notifications</button>
          </div>
        </div>
      )}
    </div>
  );
}
