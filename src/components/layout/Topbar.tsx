import { useContext } from 'react';
import { SidebarContext } from '@/context/SidebarContext';
import { UserMenu } from './UserMenu';
import { TenantSwitcher } from './TenantSwitcher';
import { NotificationBell } from './NotificationBell';
import { Breadcrumbs } from './Breadcrumbs';
import { Menu } from 'lucide-react';

export function Topbar() {
  const sidebar = useContext(SidebarContext);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={sidebar?.toggle}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-3">
        <TenantSwitcher />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
