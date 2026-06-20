export type NotificationCategory = 'compliance' | 'job' | 'invoice' | 'system' | 'driver' | 'vehicle';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AppNotification {
  id: string;
  tenantId: string;
  organizationId: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}
