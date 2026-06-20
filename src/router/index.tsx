import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { TenantsListPage } from '@/features/tenants/TenantsListPage';
import { TenantDetailPage } from '@/features/tenants/TenantDetailPage';
import { OrganizationsPage } from '@/features/organizations/OrganizationsPage';
import { UsersListPage } from '@/features/users/UsersListPage';
import { DriversListPage } from '@/features/drivers/DriversListPage';
import { CustomersListPage } from '@/features/customers/CustomersListPage';
import { CustomerDetailPage } from '@/features/customers/CustomerDetailPage';
import { JobsListPage } from '@/features/jobs/JobsListPage';
import { JobDetailPage } from '@/features/jobs/JobDetailPage';
import { FleetListPage } from '@/features/fleet/FleetListPage';
import { InventoryPage } from '@/features/inventory/InventoryPage';
import { EquipmentListPage } from '@/features/equipment/EquipmentListPage';
import { EquipmentDetailPage } from '@/features/equipment/EquipmentDetailPage';
import { PricingPage } from '@/features/pricing/PricingPage';
import { CompliancePage } from '@/features/compliance/CompliancePage';
import { InvoicesListPage } from '@/features/invoices/InvoicesListPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { AuditLogPage } from '@/features/audit/AuditLogPage';
import { FuelingEventsPage } from '@/features/fueling-events/FuelingEventsPage';
import { NotificationsPage } from '@/features/notifications/NotificationsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'tenants', element: <TenantsListPage /> },
          { path: 'tenants/:id', element: <TenantDetailPage /> },
          { path: 'organizations', element: <OrganizationsPage /> },
          { path: 'users', element: <UsersListPage /> },
          { path: 'drivers', element: <DriversListPage /> },
          { path: 'customers', element: <CustomersListPage /> },
          { path: 'customers/:id', element: <CustomerDetailPage /> },
          { path: 'jobs', element: <JobsListPage /> },
          { path: 'jobs/:id', element: <JobDetailPage /> },
          { path: 'fleet', element: <FleetListPage /> },
          { path: 'inventory', element: <InventoryPage /> },
          { path: 'equipment', element: <EquipmentListPage /> },
          { path: 'equipment/:id', element: <EquipmentDetailPage /> },
          { path: 'pricing', element: <PricingPage /> },
          { path: 'compliance', element: <CompliancePage /> },
          { path: 'invoices', element: <InvoicesListPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'audit-log', element: <AuditLogPage /> },
          { path: 'fueling-events', element: <FuelingEventsPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: '*', element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
]);
