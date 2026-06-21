import type { Organization, RoyaltyAgreement, RoyaltyStatement, UserRole } from '@/types';
import { filterOrgsToSubtree } from './org-utils';

export function getOrgAncestorChain(orgs: Organization[], orgId: string): Organization[] {
  const chain: Organization[] = [];
  let current = orgs.find((o) => o.id === orgId);
  while (current) {
    chain.unshift(current);
    current = current.parentId ? orgs.find((o) => o.id === current!.parentId) : undefined;
  }
  return chain;
}

export function formatRoyaltyRate(agreement: RoyaltyAgreement): string {
  if (agreement.rateType === 'percentage') return `${agreement.rateValue}%`;
  if (agreement.rateType === 'per_gallon') return `$${agreement.rateValue.toFixed(2)}/gal`;
  return `$${agreement.rateValue.toFixed(2)}/mo`;
}

export function filterAgreementsForRole(
  agreements: RoyaltyAgreement[],
  orgs: Organization[],
  role: UserRole,
  userOrgId: string | undefined,
): RoyaltyAgreement[] {
  if (role === 'corporate_super_admin') return agreements;
  if (!userOrgId) return agreements;

  const visibleIds = new Set(filterOrgsToSubtree(orgs, userOrgId).map((o) => o.id));
  return agreements.filter(
    (a) => visibleIds.has(a.payerOrgId) || visibleIds.has(a.payeeOrgId),
  );
}

export function filterStatementsForRole(
  statements: RoyaltyStatement[],
  orgs: Organization[],
  role: UserRole,
  userOrgId: string | undefined,
): RoyaltyStatement[] {
  if (role === 'corporate_super_admin') return statements;
  if (!userOrgId) return statements;

  const visibleIds = new Set(filterOrgsToSubtree(orgs, userOrgId).map((o) => o.id));
  return statements.filter(
    (s) => visibleIds.has(s.payerOrgId) || visibleIds.has(s.payeeOrgId),
  );
}

export function computeStatementTotals(statements: RoyaltyStatement[], orgId: string) {
  const owed = statements
    .filter((s) => s.payerOrgId === orgId && s.status !== 'paid')
    .reduce((sum, s) => sum + s.royaltyAmount, 0);
  const receivable = statements
    .filter((s) => s.payeeOrgId === orgId && s.status !== 'paid')
    .reduce((sum, s) => sum + s.royaltyAmount, 0);
  return { owed, receivable };
}
