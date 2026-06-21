export type RoyaltyBasis = 'revenue' | 'gallons' | 'margin';
export type RoyaltyRateType = 'percentage' | 'per_gallon' | 'fixed_monthly';
export type RoyaltyStatementStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'disputed';

/** Bilateral agreement: payer org pays payee org on each fuel delivery settlement. */
export interface RoyaltyAgreement {
  id: string;
  tenantId: string;
  name: string;
  payeeOrgId: string;
  payeeOrgName: string;
  payeeOrgType: string;
  payerOrgId: string;
  payerOrgName: string;
  payerOrgType: string;
  basis: RoyaltyBasis;
  rateType: RoyaltyRateType;
  rateValue: number;
  /** Territory overlay — master franchise fee on franchisors in region (not parent-child). */
  isTerritoryOverlay: boolean;
  status: 'active' | 'inactive';
  effectiveDate: string;
  notes?: string;
}

export interface RoyaltyStatementLineItem {
  id: string;
  sourceType: 'invoice' | 'fueling_event';
  sourceId: string;
  sourceRef: string;
  operatingOrgId: string;
  operatingOrgName: string;
  gallons: number;
  revenue: number;
  royaltyAmount: number;
  deliveryDate: string;
}

/** Periodic royalty bill from payee → payer (inter-org settlement). */
export interface RoyaltyStatement {
  id: string;
  tenantId: string;
  statementNumber: string;
  agreementId: string;
  agreementName: string;
  periodStart: string;
  periodEnd: string;
  payerOrgId: string;
  payerOrgName: string;
  payeeOrgId: string;
  payeeOrgName: string;
  status: RoyaltyStatementStatus;
  totalGallons: number;
  grossRevenue: number;
  royaltyAmount: number;
  dueDate: string;
  paidDate: string | null;
  lineItems: RoyaltyStatementLineItem[];
  createdAt: string;
}
