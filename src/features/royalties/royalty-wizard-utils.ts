import type { Organization, OrgType, RoyaltyAgreement, RoyaltyBasis, RoyaltyRateType } from '@/types';
import { ORG_TYPE_LABELS } from '@/types';

export type AgreementFlowType = 'hierarchy' | 'territory';

export interface RoyaltyWizardForm {
  flowType: AgreementFlowType;
  payerOrgId: string;
  payeeOrgId: string;
  name: string;
  basis: RoyaltyBasis;
  rateType: RoyaltyRateType;
  rateValue: string;
  effectiveDate: string;
  notes: string;
}

export const INITIAL_WIZARD_FORM: RoyaltyWizardForm = {
  flowType: 'hierarchy',
  payerOrgId: '',
  payeeOrgId: '',
  name: '',
  basis: 'revenue',
  rateType: 'percentage',
  rateValue: '',
  effectiveDate: new Date().toISOString().slice(0, 10),
  notes: '',
};

const PAYER_TYPES_HIERARCHY: OrgType[] = ['sub_franchise', 'franchise', 'franchisor'];
const PAYER_TYPES_TERRITORY: OrgType[] = ['franchisor'];
const PAYEE_TYPES_TERRITORY: OrgType[] = ['master_franchise'];

export function getOrgAncestors(orgs: Organization[], orgId: string): Organization[] {
  const ancestors: Organization[] = [];
  let current = orgs.find((o) => o.id === orgId);
  while (current?.parentId) {
    const parent = orgs.find((o) => o.id === current!.parentId);
    if (!parent) break;
    ancestors.push(parent);
    current = parent;
  }
  return ancestors;
}

export function getEligiblePayers(orgs: Organization[], flowType: AgreementFlowType): Organization[] {
  const types = flowType === 'territory' ? PAYER_TYPES_TERRITORY : PAYER_TYPES_HIERARCHY;
  return orgs.filter((o) => types.includes(o.type) && o.status === 'active');
}

export function getEligiblePayees(
  orgs: Organization[],
  flowType: AgreementFlowType,
  payerOrgId: string,
): Organization[] {
  if (flowType === 'territory') {
    return orgs.filter((o) => PAYEE_TYPES_TERRITORY.includes(o.type) && o.status === 'active');
  }
  if (!payerOrgId) return [];
  return getOrgAncestors(orgs, payerOrgId);
}

export function suggestAgreementName(
  orgs: Organization[],
  payerOrgId: string,
  payeeOrgId: string,
  flowType: AgreementFlowType,
): string {
  const payer = orgs.find((o) => o.id === payerOrgId);
  const payee = orgs.find((o) => o.id === payeeOrgId);
  if (!payer || !payee) return '';
  const suffix = flowType === 'territory' ? 'Territory Fee' : 'Royalty';
  return `${payer.name} → ${payee.name} ${suffix}`;
}

export function validateWizardStep(
  step: number,
  form: RoyaltyWizardForm,
  orgs: Organization[],
): string | null {
  if (step === 1) return null;

  if (step === 2) {
    if (!form.payerOrgId) return 'Select the organization that will pay royalties.';
    if (!form.payeeOrgId) return 'Select the organization that will receive royalties.';
    if (form.payerOrgId === form.payeeOrgId) return 'Payer and payee must be different organizations.';

    const payer = orgs.find((o) => o.id === form.payerOrgId);
    const payee = orgs.find((o) => o.id === form.payeeOrgId);
    if (!payer || !payee) return 'Invalid organization selection.';

    if (form.flowType === 'hierarchy') {
      const ancestors = getOrgAncestors(orgs, form.payerOrgId);
      if (!ancestors.some((a) => a.id === form.payeeOrgId)) {
        return 'For hierarchy agreements, the payee must be a parent org of the payer.';
      }
    } else {
      if (payer.type !== 'franchisor') return 'Territory fees require a franchisor as payer.';
      if (payee.type !== 'master_franchise') return 'Territory fees require a master franchise as payee.';
    }
    return null;
  }

  if (step === 3) {
    if (!form.name.trim()) return 'Agreement name is required.';
    const rate = Number(form.rateValue);
    if (!form.rateValue || Number.isNaN(rate) || rate <= 0) return 'Enter a valid rate greater than zero.';
    if (form.rateType === 'percentage' && rate > 100) return 'Percentage rate cannot exceed 100%.';
    if (!form.effectiveDate) return 'Effective date is required.';
    return null;
  }

  return null;
}

export function buildRoyaltyAgreement(form: RoyaltyWizardForm, orgs: Organization[]): RoyaltyAgreement {
  const payer = orgs.find((o) => o.id === form.payerOrgId)!;
  const payee = orgs.find((o) => o.id === form.payeeOrgId)!;

  return {
    id: `ra-${Date.now()}`,
    tenantId: payer.tenantId,
    name: form.name.trim(),
    payeeOrgId: payee.id,
    payeeOrgName: payee.name,
    payeeOrgType: payee.type,
    payerOrgId: payer.id,
    payerOrgName: payer.name,
    payerOrgType: payer.type,
    basis: form.basis,
    rateType: form.rateType,
    rateValue: Number(form.rateValue),
    isTerritoryOverlay: form.flowType === 'territory',
    status: 'active',
    effectiveDate: form.effectiveDate,
    notes: form.notes.trim() || undefined,
  };
}

export function orgOptionLabel(org: Organization): string {
  return `${org.name} (${ORG_TYPE_LABELS[org.type]})`;
}

export function basisOptionsForRateType(rateType: RoyaltyRateType): { value: RoyaltyBasis; label: string }[] {
  if (rateType === 'per_gallon') {
    return [{ value: 'gallons', label: 'Gallons delivered' }];
  }
  if (rateType === 'fixed_monthly') {
    return [{ value: 'revenue', label: 'Flat monthly fee' }];
  }
  return [
    { value: 'revenue', label: 'Fuel revenue (pre-tax subtotal)' },
    { value: 'margin', label: 'Fuel margin (markup only)' },
  ];
}
