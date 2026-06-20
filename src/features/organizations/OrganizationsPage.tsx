import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { buildOrgTree, getVisibleOrganizations } from '@/lib/org-utils';
import { mockOrganizations } from '@/mock';
import type { Organization, OrgTreeNode } from '@/types';
import { ORG_TYPE_LABELS, ALLOWED_CHILD_TYPES, FRANCHISOR_MIN_FRANCHISES } from '@/types/organization.types';
import {
  Plus, Building2, Map, Store, Landmark, GitBranch, ChevronRight, ChevronDown,
  Users, Mail, Phone, MapPin, Network,
} from 'lucide-react';

const orgIcons = {
  corporate: Building2,
  master_franchise: Map,
  franchisor: Store,
  franchise: Landmark,
  sub_franchise: GitBranch,
};

const orgColors = {
  corporate: 'info' as const,
  master_franchise: 'warning' as const,
  franchisor: 'success' as const,
  franchise: 'info' as const,
  sub_franchise: 'default' as const,
};

function TreeNode({ node, selectedId, onSelect, depth = 0 }: {
  node: OrgTreeNode; selectedId: string | null; onSelect: (org: Organization) => void; depth?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = orgIcons[node.type];
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <button
        onClick={() => onSelect(node)}
        className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
          selectedId === node.id ? 'bg-brand-50 text-brand-700' : 'hover:bg-gray-50 text-gray-700'
        }`}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className="shrink-0 cursor-pointer">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate font-medium">{node.name}</span>
        <Badge variant={orgColors[node.type]}>{ORG_TYPE_LABELS[node.type]}</Badge>
      </button>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} selectedId={selectedId} onSelect={onSelect} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function getAddOrgTypeOptions(role: string | undefined, selected: Organization | null) {
  if (selected) {
    return ALLOWED_CHILD_TYPES[selected.type].map((type) => ({
      label: ORG_TYPE_LABELS[type],
      value: type,
    }));
  }

  if (role === 'corporate_super_admin') {
    return [
      { label: 'Master Franchise', value: 'master_franchise' },
      { label: 'Franchisor', value: 'franchisor' },
    ];
  }

  if (role === 'franchise_admin') {
    return [{ label: 'Franchise', value: 'franchise' }];
  }

  return [];
}

export function OrganizationsPage() {
  const { state } = useAuth();
  const { addToast } = useToast();
  const modal = useModal();
  const [selected, setSelected] = useState<Organization | null>(null);

  const visibleOrgs = useMemo(
    () => getVisibleOrganizations(mockOrganizations, state.user?.role, state.user?.organizationId),
    [state.user],
  );

  const tree = useMemo(() => {
    const roots = visibleOrgs.filter(
      (o) => o.parentId === null || !visibleOrgs.some((p) => p.id === o.parentId),
    );
    return roots.map((root) => ({ ...root, children: buildOrgTree(visibleOrgs, root.id) }));
  }, [visibleOrgs]);

  const parentOrg = selected?.parentId
    ? mockOrganizations.find((o) => o.id === selected.parentId)
    : null;

  const addTypeOptions = getAddOrgTypeOptions(state.user?.role, selected);

  return (
    <div>
      <PageHeader
        title="Organization Hierarchy"
        description="Corporate → Master Franchise & Franchisors (siblings) → Franchises → Sub-Franchises"
        actions={
          addTypeOptions.length > 0 ? (
            <Button onClick={() => modal.open()}>
              <Plus className="h-4 w-4" /> Add Organization
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card padding="sm">
            <div className="space-y-0.5">
              {tree.map((node) => (
                <TreeNode key={node.id} node={node} selectedId={selected?.id ?? null} onSelect={setSelected} />
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <Card>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selected.name}</h3>
                    <Badge variant={orgColors[selected.type]} className="mt-1">{ORG_TYPE_LABELS[selected.type]}</Badge>
                  </div>
                  <Badge variant={selected.status === 'active' ? 'success' : 'default'}>{selected.status}</Badge>
                </div>

                {selected.type === 'franchisor' && selected.childCount < FRANCHISOR_MIN_FRANCHISES && (
                  <div className="rounded-lg bg-amber-50 p-3">
                    <p className="text-sm font-medium text-amber-800">
                      Each franchisor must have at least one franchise.
                    </p>
                  </div>
                )}

                {parentOrg && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Reports to</p>
                    <p className="text-sm font-medium text-gray-900">
                      {parentOrg.name}{' '}
                      <span className="text-gray-500">({ORG_TYPE_LABELS[parentOrg.type]})</span>
                    </p>
                  </div>
                )}

                {selected.territory && (
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-sm font-medium text-blue-700">Territory: {selected.territory}</p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium">{selected.contactEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium">{selected.contactPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium">{selected.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Users</p>
                      <p className="text-sm font-medium">{selected.userCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Network className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Sub-Organizations</p>
                      <p className="text-sm font-medium">{selected.childCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Building2 className="h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">Select an organization to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Add Organization"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={modal.close}>Cancel</Button>
            <Button onClick={() => { addToast({ type: 'success', title: 'Organization created' }); modal.close(); }}>Create</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Organization Name" placeholder="e.g. Dallas-North" />
          <Select
            label="Type"
            options={addTypeOptions}
            placeholder="Select type"
          />
          <Input label="Territory" placeholder="e.g. Southern Texas" />
          <Input label="Contact Email" type="email" placeholder="email@company.com" />
          <Input label="Contact Phone" placeholder="(555) 000-0000" />
          <Input label="Address" placeholder="Full address" className="sm:col-span-2" />
        </div>
      </Modal>
    </div>
  );
}
