import { useContext } from 'react';
import { Outlet } from 'react-router';
import { SidebarContext } from '@/context/SidebarContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cn } from '@/lib/cn';

export function AppLayout() {
  const sidebar = useContext(SidebarContext);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          sidebar?.isCollapsed ? 'ml-16' : 'ml-64',
        )}
      >
        <Topbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
