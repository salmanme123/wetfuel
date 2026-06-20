export type TenantStatus = 'active' | 'suspended' | 'pending';

export interface TenantBranding {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface Tenant {
  id: string;
  tenantCode: string;
  companyName: string;
  isPlatformOwner: boolean;
  status: TenantStatus;
  branding: TenantBranding;
  contactEmail: string;
  contactPhone: string;
  address: string;
  franchiseCount: number;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}
