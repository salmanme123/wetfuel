import { Link, useLocation } from 'react-router';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  tenants: 'Tenants',
  organizations: 'Organizations',
  users: 'Users',
  drivers: 'Drivers',
  customers: 'Customers',
  jobs: 'Jobs & Dispatch',
  fleet: 'Fleet',
  inventory: 'Fuel Inventory',
  equipment: 'Equipment',
  pricing: 'Pricing & Tax',
  compliance: 'Compliance',
  invoices: 'Invoicing',
  reports: 'Reports',
  'audit-log': 'Audit Log',
  'fueling-events': 'Fueling Events',
  notifications: 'Notifications',
  settings: 'Settings',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link to="/dashboard" className="cursor-pointer text-muted-foreground hover:text-foreground">
        <Home className="h-4 w-4" />
      </Link>
      {pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/');
        const prevSegment = pathSegments[index - 1];
        const label =
          (prevSegment === 'equipment' || prevSegment === 'drivers') && index === pathSegments.length - 1
            ? 'Details'
            : routeLabels[segment] ?? segment;
        const isLast = index === pathSegments.length - 1;

        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link to={path} className="cursor-pointer text-muted-foreground hover:text-foreground">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
