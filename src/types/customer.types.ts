export type BillingTerm = 'COD' | 'Net7' | 'Net10' | 'Net15' | 'Net30';
export type PricingModel = 'opis' | 'tank_cost' | 'hybrid';
export type CustomerCategory = 'commercial' | 'residential' | 'government' | 'industrial';

export interface CustomerSite {
  id: string;
  customerId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  contactName: string;
  contactPhone: string;
  equipmentCount: number;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  tenantId: string;
  organizationId: string;
  companyName: string;
  category: CustomerCategory;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  billingTerm: BillingTerm;
  pricingModel: PricingModel;
  status: 'active' | 'inactive';
  sites: CustomerSite[];
  totalDeliveries: number;
  totalGallonsDelivered: number;
  outstandingBalance: number;
  createdAt: string;
  updatedAt: string;
}
