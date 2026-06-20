export type ComplianceCategory = 'driver' | 'vehicle' | 'operational' | 'safety';
export type DocumentStatus = 'valid' | 'expiring_soon' | 'expired';

export interface ComplianceDocument {
  id: string;
  tenantId: string;
  organizationId: string;
  category: ComplianceCategory;
  entityType: 'driver' | 'vehicle';
  entityId: string;
  entityName: string;
  documentName: string;
  documentType: string;
  issuedDate: string;
  expiryDate: string;
  status: DocumentStatus;
  daysUntilExpiry: number;
}

export interface ComplianceScorecard {
  organizationId: string;
  organizationName: string;
  driverScore: number;
  vehicleScore: number;
  operationalScore: number;
  safetyScore: number;
  overallScore: number;
  totalDocuments: number;
  expiredDocuments: number;
  expiringSoonDocuments: number;
}

export interface SafetyIncident {
  id: string;
  tenantId: string;
  organizationId: string;
  type: 'spill' | 'accident' | 'violation' | 'near_miss';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reportedBy: string;
  driverId: string | null;
  driverName: string | null;
  location: string;
  date: string;
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  correctiveAction: string | null;
  createdAt: string;
}
