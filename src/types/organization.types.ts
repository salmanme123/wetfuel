export type OrgType = 'corporate' | 'master_franchise' | 'franchise';

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
