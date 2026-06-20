import type { Organization, OrgTreeNode } from '@/types';

export function buildOrgTree(orgs: Organization[], parentId: string | null = null): OrgTreeNode[] {
  return orgs
    .filter((o) => o.parentId === parentId)
    .map((o) => ({ ...o, children: buildOrgTree(orgs, o.id) }));
}

export function getDescendantIds(orgs: Organization[], rootId: string): Set<string> {
  const ids = new Set<string>();
  const queue = [rootId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const org of orgs) {
      if (org.parentId === current && !ids.has(org.id)) {
        ids.add(org.id);
        queue.push(org.id);
      }
    }
  }

  return ids;
}

export function filterOrgsToSubtree(orgs: Organization[], rootId: string): Organization[] {
  const descendantIds = getDescendantIds(orgs, rootId);
  return orgs.filter((o) => o.id === rootId || descendantIds.has(o.id));
}

export function getVisibleOrganizations(
  orgs: Organization[],
  role: string | undefined,
  organizationId: string | undefined,
): Organization[] {
  if (!role || role === 'corporate_super_admin') {
    return orgs;
  }

  if (!organizationId) {
    return orgs;
  }

  return filterOrgsToSubtree(orgs, organizationId);
}
