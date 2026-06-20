import type { PricingRule, TaxRule, OpisRate } from '@/types';

export const mockOpisRates: OpisRate[] = [
  { id: 'opis-001', fuelType: 'diesel', rackPrice: 2.85, effectiveDate: '2026-06-20', source: 'OPIS Gulf Coast' },
  { id: 'opis-002', fuelType: 'gasoline_regular', rackPrice: 2.42, effectiveDate: '2026-06-20', source: 'OPIS Gulf Coast' },
  { id: 'opis-003', fuelType: 'gasoline_premium', rackPrice: 2.98, effectiveDate: '2026-06-20', source: 'OPIS Gulf Coast' },
  { id: 'opis-004', fuelType: 'propane', rackPrice: 1.15, effectiveDate: '2026-06-20', source: 'OPIS Mont Belvieu' },
  { id: 'opis-005', fuelType: 'kerosene', rackPrice: 3.10, effectiveDate: '2026-06-20', source: 'OPIS Gulf Coast' },
];

export const mockPricingRules: PricingRule[] = [
  { id: 'pr-001', tenantId: 'tenant-001', organizationId: 'org-003', name: 'Dallas Standard OPIS Diesel', type: 'opis', fuelType: 'diesel', marginType: 'fixed', marginValue: 1.15, minimumPrice: 3.50, isDefault: true, status: 'active', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'pr-002', tenantId: 'tenant-001', organizationId: 'org-003', name: 'Dallas Standard OPIS Gas', type: 'opis', fuelType: 'gasoline_regular', marginType: 'fixed', marginValue: 1.05, minimumPrice: 3.00, isDefault: true, status: 'active', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'pr-003', tenantId: 'tenant-001', organizationId: 'org-004', name: 'Houston Tank Cost Diesel', type: 'tank_cost', fuelType: 'diesel', marginType: 'percentage', marginValue: 25, minimumPrice: 3.50, isDefault: true, status: 'active', createdAt: '2024-07-01T00:00:00Z', updatedAt: '2026-05-15T00:00:00Z' },
  { id: 'pr-004', tenantId: 'tenant-001', organizationId: 'org-004', name: 'Houston OPIS Diesel', type: 'opis', fuelType: 'diesel', marginType: 'fixed', marginValue: 1.20, minimumPrice: 3.60, isDefault: false, status: 'active', createdAt: '2024-07-01T00:00:00Z', updatedAt: '2026-05-15T00:00:00Z' },
  { id: 'pr-005', tenantId: 'tenant-001', organizationId: 'org-005', name: 'Austin OPIS Diesel', type: 'opis', fuelType: 'diesel', marginType: 'fixed', marginValue: 1.25, minimumPrice: 3.75, isDefault: true, status: 'active', createdAt: '2025-03-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z' },
  { id: 'pr-006', tenantId: 'tenant-001', organizationId: 'org-005', name: 'Austin Hybrid Diesel', type: 'hybrid', fuelType: 'diesel', marginType: 'fixed', marginValue: 1.10, minimumPrice: 3.40, isDefault: true, status: 'active', createdAt: '2024-09-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
];

export const mockTaxRules: TaxRule[] = [
  { id: 'tax-001', tenantId: 'tenant-001', organizationId: 'org-003', name: 'Federal Excise Tax - Diesel', taxType: 'federal', fuelType: 'diesel', state: null, rate: 0.244, rateType: 'per_gallon', isActive: true, effectiveDate: '2024-01-01', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'tax-002', tenantId: 'tenant-001', organizationId: 'org-003', name: 'Texas State Fuel Tax', taxType: 'state', fuelType: 'diesel', state: 'TX', rate: 0.20, rateType: 'per_gallon', isActive: true, effectiveDate: '2024-01-01', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'tax-003', tenantId: 'tenant-001', organizationId: 'org-003', name: 'LUST Tax', taxType: 'lust', fuelType: 'diesel', state: null, rate: 0.001, rateType: 'per_gallon', isActive: true, effectiveDate: '2024-01-01', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'tax-004', tenantId: 'tenant-001', organizationId: 'org-005', name: 'Federal Excise Tax - Diesel', taxType: 'federal', fuelType: 'diesel', state: null, rate: 0.244, rateType: 'per_gallon', isActive: true, effectiveDate: '2024-01-01', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'tax-005', tenantId: 'tenant-001', organizationId: 'org-005', name: 'Texas State Fuel Tax', taxType: 'state', fuelType: 'diesel', state: 'TX', rate: 0.20, rateType: 'per_gallon', isActive: true, effectiveDate: '2024-01-01', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'tax-006', tenantId: 'tenant-001', organizationId: 'org-003', name: 'Federal Excise Tax - Gasoline', taxType: 'federal', fuelType: 'gasoline_regular', state: null, rate: 0.184, rateType: 'per_gallon', isActive: true, effectiveDate: '2024-01-01', createdAt: '2024-01-01T00:00:00Z' },
];
