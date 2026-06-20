export interface QuickBooksConfig {
  isConnected: boolean;
  companyName: string | null;
  lastSyncAt: string | null;
  autoSyncInvoices: boolean;
  autoSyncCustomers: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
}

export interface OpisConfig {
  isEnabled: boolean;
  region: string;
  feedUrl: string | null;
  lastFetchAt: string | null;
  autoFetchDaily: boolean;
}

export interface NotificationPreferences {
  complianceAlerts: boolean;
  complianceAlertDays: number;
  overdueJobAlerts: boolean;
  invoiceAlerts: boolean;
  driverAlerts: boolean;
  vehicleAlerts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface RecurrenceConfig {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  daysOfWeek: number[] | null;
  dayOfMonth: number | null;
  customIntervalDays: number | null;
  startDate: string;
  endDate: string | null;
  maxOccurrences: number | null;
}

export interface AutoAssignmentRule {
  id: string;
  tenantId: string;
  organizationId: string;
  name: string;
  strategy: 'closest_driver' | 'fixed_pair' | 'round_robin' | 'least_loaded';
  isActive: boolean;
  customerId: string | null;
  customerName: string | null;
  driverId: string | null;
  driverName: string | null;
  priority: number;
  createdAt: string;
}
