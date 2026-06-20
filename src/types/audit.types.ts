export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'assign' | 'status_change' | 'sync' | 'suspend' | 'reactivate';
export type AuditEntity = 'tenant' | 'organization' | 'user' | 'driver' | 'customer' | 'job' | 'vehicle' | 'equipment' | 'invoice' | 'pricing_rule' | 'tax_rule' | 'fuel_transfer' | 'compliance_document';

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  organizationId: string;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  entityName: string;
  description: string;
  changes: { field: string; oldValue: string; newValue: string }[] | null;
  ipAddress: string;
  timestamp: string;
}
