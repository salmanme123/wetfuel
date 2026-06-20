import type { UserRole } from '@/types';

export interface NavItem {
  label: string;
  icon: string;
  path: string;
}

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  corporate_super_admin: [
    { label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
    { label: 'Tenants', icon: 'Building2', path: '/tenants' },
    { label: 'Organizations', icon: 'Network', path: '/organizations' },
    { label: 'Users', icon: 'Users', path: '/users' },
    { label: 'Drivers', icon: 'UserCog', path: '/drivers' },
    { label: 'Customers', icon: 'UserCheck', path: '/customers' },
    { label: 'Jobs & Dispatch', icon: 'Truck', path: '/jobs' },
    { label: 'Fueling Events', icon: 'Flame', path: '/fueling-events' },
    { label: 'Fleet', icon: 'CarFront', path: '/fleet' },
    { label: 'Fuel Inventory', icon: 'Droplets', path: '/inventory' },
    { label: 'Equipment', icon: 'QrCode', path: '/equipment' },
    { label: 'Pricing & Tax', icon: 'DollarSign', path: '/pricing' },
    { label: 'Compliance', icon: 'ShieldCheck', path: '/compliance' },
    { label: 'Invoicing', icon: 'FileText', path: '/invoices' },
    { label: 'Reports', icon: 'BarChart3', path: '/reports' },
    { label: 'Audit Log', icon: 'ScrollText', path: '/audit-log' },
    { label: 'Settings', icon: 'Settings', path: '/settings' },
  ],
  master_franchise_admin: [
    { label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
    { label: 'Organizations', icon: 'Network', path: '/organizations' },
    { label: 'Users', icon: 'Users', path: '/users' },
    { label: 'Drivers', icon: 'UserCog', path: '/drivers' },
    { label: 'Customers', icon: 'UserCheck', path: '/customers' },
    { label: 'Jobs & Dispatch', icon: 'Truck', path: '/jobs' },
    { label: 'Fueling Events', icon: 'Flame', path: '/fueling-events' },
    { label: 'Fleet', icon: 'CarFront', path: '/fleet' },
    { label: 'Pricing & Tax', icon: 'DollarSign', path: '/pricing' },
    { label: 'Compliance', icon: 'ShieldCheck', path: '/compliance' },
    { label: 'Reports', icon: 'BarChart3', path: '/reports' },
    { label: 'Audit Log', icon: 'ScrollText', path: '/audit-log' },
    { label: 'Settings', icon: 'Settings', path: '/settings' },
  ],
  franchise_admin: [
    { label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
    { label: 'Users', icon: 'Users', path: '/users' },
    { label: 'Drivers', icon: 'UserCog', path: '/drivers' },
    { label: 'Customers', icon: 'UserCheck', path: '/customers' },
    { label: 'Jobs & Dispatch', icon: 'Truck', path: '/jobs' },
    { label: 'Fueling Events', icon: 'Flame', path: '/fueling-events' },
    { label: 'Fleet', icon: 'CarFront', path: '/fleet' },
    { label: 'Fuel Inventory', icon: 'Droplets', path: '/inventory' },
    { label: 'Equipment', icon: 'QrCode', path: '/equipment' },
    { label: 'Pricing & Tax', icon: 'DollarSign', path: '/pricing' },
    { label: 'Compliance', icon: 'ShieldCheck', path: '/compliance' },
    { label: 'Invoicing', icon: 'FileText', path: '/invoices' },
    { label: 'Reports', icon: 'BarChart3', path: '/reports' },
    { label: 'Audit Log', icon: 'ScrollText', path: '/audit-log' },
    { label: 'Settings', icon: 'Settings', path: '/settings' },
  ],
};

const ALLOWED_ROUTES: Record<UserRole, string[]> = {
  corporate_super_admin: ['/dashboard', '/tenants', '/organizations', '/users', '/drivers', '/customers', '/jobs', '/fueling-events', '/fleet', '/inventory', '/equipment', '/pricing', '/compliance', '/invoices', '/reports', '/audit-log', '/notifications', '/settings'],
  master_franchise_admin: ['/dashboard', '/organizations', '/users', '/drivers', '/customers', '/jobs', '/fueling-events', '/fleet', '/pricing', '/compliance', '/reports', '/audit-log', '/notifications', '/settings'],
  franchise_admin: ['/dashboard', '/users', '/drivers', '/customers', '/jobs', '/fueling-events', '/fleet', '/inventory', '/equipment', '/pricing', '/compliance', '/invoices', '/reports', '/audit-log', '/notifications', '/settings'],
};

export function canAccessRoute(role: UserRole, path: string): boolean {
  const routes = ALLOWED_ROUTES[role];
  return routes.some((route) => path === route || path.startsWith(route + '/'));
}
