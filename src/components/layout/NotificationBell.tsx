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
      <button onClick={() => setIsOpen(!isOpen)} className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && <Badge variant="error">{unreadCount} unread</Badge>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {recent.map((notif) => {
              const Icon = categoryIcons[notif.category] ?? Bell;
              return (
                <div
                  key={notif.id}
                  className={cn('flex items-start gap-3 border-b border-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-50', !notif.isRead && 'bg-brand-50')}
                  onClick={() => { setIsOpen(false); if (notif.link) navigate(notif.link); }}
                >
                  <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', notif.priority === 'critical' ? 'text-red-500' : notif.priority === 'high' ? 'text-orange-500' : 'text-gray-400')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={cn('text-xs truncate', notif.isRead ? 'text-gray-700' : 'font-semibold text-gray-900')}>{notif.title}</p>
                      <Badge variant={priorityColors[notif.priority]} className="text-[9px] shrink-0">{notif.priority}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatRelativeTime(notif.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-gray-100 p-2">
            <button onClick={() => { setIsOpen(false); navigate('/notifications'); }} className="w-full rounded-lg py-2 text-center text-sm font-medium text-brand-600 hover:bg-brand-50">View All Notifications</button>
          </div>
        </div>
      )}
    </div>
  );
}
