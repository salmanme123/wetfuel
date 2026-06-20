import type { QuickBooksConfig, OpisConfig, NotificationPreferences, AutoAssignmentRule } from '@/types';

export const mockQuickBooksConfig: QuickBooksConfig = {
  isConnected: true,
  companyName: 'WetFuel Dallas-North',
  lastSyncAt: '2026-06-20T06:00:00Z',
  autoSyncInvoices: true,
  autoSyncCustomers: true,
  syncFrequency: 'hourly',
};

export const mockOpisConfig: OpisConfig = {
  isEnabled: true,
  region: 'Gulf Coast',
  feedUrl: 'https://api.opisnet.com/v2/rack-prices',
  lastFetchAt: '2026-06-20T05:00:00Z',
  autoFetchDaily: true,
};

export const mockNotificationPreferences: NotificationPreferences = {
  complianceAlerts: true,
  complianceAlertDays: 90,
  overdueJobAlerts: true,
  invoiceAlerts: true,
  driverAlerts: true,
  vehicleAlerts: true,
  emailNotifications: true,
  pushNotifications: false,
};

export const mockAutoAssignmentRules: AutoAssignmentRule[] = [
  { id: 'aar-001', tenantId: 'tenant-001', organizationId: 'org-003', name: 'Lone Star — Dave', strategy: 'fixed_pair', isActive: true, customerId: 'cust-001', customerName: 'Lone Star Construction', driverId: 'driver-001', driverName: 'Dave Henderson', priority: 1, createdAt: '2024-08-01T00:00:00Z' },
  { id: 'aar-002', tenantId: 'tenant-001', organizationId: 'org-003', name: 'DFW Medical — Carlos', strategy: 'fixed_pair', isActive: true, customerId: 'cust-002', customerName: 'DFW Medical Center', driverId: 'driver-002', driverName: 'Carlos Mendez', priority: 1, createdAt: '2024-08-01T00:00:00Z' },
  { id: 'aar-003', tenantId: 'tenant-001', organizationId: 'org-004', name: 'Houston Default — Round Robin', strategy: 'round_robin', isActive: true, customerId: null, customerName: null, driverId: null, driverName: null, priority: 10, createdAt: '2024-09-01T00:00:00Z' },
  { id: 'aar-004', tenantId: 'tenant-001', organizationId: 'org-007', name: 'Miami Default — Least Loaded', strategy: 'least_loaded', isActive: true, customerId: null, customerName: null, driverId: null, driverName: null, priority: 10, createdAt: '2025-03-01T00:00:00Z' },
  { id: 'aar-005', tenantId: 'tenant-001', organizationId: 'org-003', name: 'Dallas Fallback — Least Loaded', strategy: 'least_loaded', isActive: true, customerId: null, customerName: null, driverId: null, driverName: null, priority: 99, createdAt: '2024-08-01T00:00:00Z' },
];
