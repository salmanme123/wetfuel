export type PricingRuleType = 'opis' | 'tank_cost' | 'hybrid';

export interface OpisRate {
  id: string;
  fuelType: string;
  rackPrice: number;
  effectiveDate: string;
  source: string;
}

export interface PricingRule {
  id: string;
  tenantId: string;
  organizationId: string;
  name: string;
  type: PricingRuleType;
  fuelType: string;
  marginType: 'fixed' | 'percentage';
  marginValue: number;
  minimumPrice: number | null;
  isDefault: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface TaxRule {
  id: string;
  tenantId: string;
  organizationId: string;
  name: string;
  taxType: 'federal' | 'state' | 'fuel' | 'sales' | 'lust';
  fuelType: string | null;
  state: string | null;
  rate: number;
  rateType: 'per_gallon' | 'percentage';
  isActive: boolean;
  effectiveDate: string;
  createdAt: string;
}
