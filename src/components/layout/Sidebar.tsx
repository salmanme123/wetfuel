import { useContext } from 'react';
import { NavLink } from 'react-router';
import { SidebarContext } from '@/context/SidebarContext';
import { useAuth } from '@/hooks/useAuth';
import { NAV_BY_ROLE } from '@/lib/role-permissions';
import { cn } from '@/lib/cn';
import {
  Fuel, ChevronLeft, ChevronRight,
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
        'fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300',
        sidebar.isCollapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className={cn('flex h-16 items-center border-b border-gray-200 px-4', sidebar.isCollapsed ? 'justify-center' : 'gap-3')}>
        <Fuel className="h-8 w-8 shrink-0 text-brand-600" />
        {!sidebar.isCollapsed && (
          <span className="text-lg font-bold text-gray-900">WetFuel</span>
        )}
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
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                      sidebar.isCollapsed && 'justify-center px-2',
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

      <div className="border-t border-gray-200 p-2">
        <button
          onClick={sidebar.toggle}
          className="flex w-full items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          {sidebar.isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  );
}
