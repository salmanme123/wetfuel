import { useContext } from 'react';
import { NavLink } from 'react-router';
import { SidebarContext } from '@/context/SidebarContext';
import { useAuth } from '@/hooks/useAuth';
import { NAV_BY_ROLE } from '@/lib/role-permissions';
import { cn } from '@/lib/cn';
import { WetFuelLogo } from '@/components/brand/WetFuelLogo';
import {
  ChevronLeft, ChevronRight,
  LayoutDashboard, Building2, Network, Users, UserCheck, Truck,
  UserCog, CarFront, Droplets, QrCode, DollarSign, ShieldCheck, FileText, BarChart3,
  Flame, ScrollText, Settings,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Building2, Network, Users, UserCheck, Truck,
  UserCog, CarFront, Droplets, QrCode, DollarSign, ShieldCheck, FileText, BarChart3,
  Flame, ScrollText, Settings,
};

export function Sidebar() {
  const sidebar = useContext(SidebarContext);
  const { state } = useAuth();
  if (!sidebar || !state.user) return null;

  const navItems = NAV_BY_ROLE[state.user.role];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        sidebar.isCollapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className={cn('flex h-[4.5rem] items-center border-b border-sidebar-border px-3', sidebar.isCollapsed ? 'justify-center' : 'px-4')}>
        <WetFuelLogo
          variant={sidebar.isCollapsed ? 'symbol' : 'full'}
          className={sidebar.isCollapsed ? 'h-10 w-10' : 'h-12 w-auto max-w-[13.5rem]'}
        />
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] ?? LayoutDashboard;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-l-2 border-sidebar-primary bg-sidebar-primary/15 text-sidebar-primary'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                      sidebar.isCollapsed && 'justify-center border-l-0 px-2',
                    )
                  }
                  title={sidebar.isCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!sidebar.isCollapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={sidebar.toggle}
          className="flex w-full cursor-pointer items-center justify-center rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          {sidebar.isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  );
}
