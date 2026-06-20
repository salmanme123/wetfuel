export type OrgType = 'corporate' | 'master_franchise' | 'franchisor' | 'franchise' | 'sub_franchise';

export interface Organization {
  id: string;
  tenantId: string;
  parentId: string | null;
  name: string;
  type: OrgType;
  territory?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  status: 'active' | 'inactive';
  userCount: number;
  childCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrgTreeNode extends Organization {
  children: OrgTreeNode[];
}

export const ORG_TYPE_LABELS: Record<OrgType, string> = {
  corporate: 'Corporate',
  master_franchise: 'Master Franchise',
  franchisor: 'Franchisor',
  franchise: 'Franchise',
  sub_franchise: 'Sub-Franchise',
};

export const ALLOWED_CHILD_TYPES: Record<OrgType, OrgType[]> = {
  corporate: ['master_franchise', 'franchisor'],
  master_franchise: [],
  franchisor: ['franchise'],
  franchise: ['sub_franchise'],
  sub_franchise: ['sub_franchise'],
};

/** A franchisor must operate at least one franchise beneath it. */
export const FRANCHISOR_MIN_FRANCHISES = 1;
