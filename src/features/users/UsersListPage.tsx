import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { DataTable, TablePagination, type Column } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useTable } from '@/hooks/useTable';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { mockUsers } from '@/mock';
import { ROLES } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { Plus } from 'lucide-react';
import type { UserProfile } from '@/types';

const roleVariants: Record<string, 'info' | 'warning' | 'success'> = {
  corporate_super_admin: 'info',
  master_franchise_admin: 'warning',
  franchise_admin: 'success',
};

export function UsersListPage() {
  const { addToast } = useToast();
  const modal = useModal<UserProfile>();
  const [users] = useState(mockUsers);

  const table = useTable<UserProfile & Record<string, unknown>>({
    data: users as (UserProfile & Record<string, unknown>)[],
    searchKeys: ['firstName', 'lastName', 'email'],
  });

  const columns: Column<UserProfile & Record<string, unknown>>[] = [
    {
      key: 'name', header: 'Name', sortable: true,
      render: (u) => {
        const user = u as unknown as UserProfile;
        return (
          <div className="flex items-center gap-3">
            <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" />
            <div>
              <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role', header: 'Role', sortable: true,
      render: (u) => {
        const user = u as unknown as UserProfile;
        return <Badge variant={roleVariants[user.role]}>{ROLES[user.role]}</Badge>;
      },
    },
    { key: 'organizationName', header: 'Organization', sortable: true },
    {
      key: 'status', header: 'Status',
      render: (u) => <StatusBadge status={(u as unknown as UserProfile).status} type="user" />,
    },
    {
      key: 'lastLoginAt', header: 'Last Login', sortable: true,
      render: (u) => {
        const user = u as unknown as UserProfile;
        return user.lastLoginAt ? formatDate(user.lastLoginAt) : <span className="text-muted-foreground/60">Never</span>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Manage platform users and their roles"
        actions={
          <Button onClick={() => modal.open()}>
            <Plus className="h-4 w-4" /> Invite User
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <SearchInput value={table.searchTerm} onChange={table.setSearchTerm} placeholder="Search by name or email..." className="w-80" />
        <Select
          options={Object.entries(ROLES).map(([value, label]) => ({ value, label }))}
          placeholder="All Roles"
          value={table.filters['role'] ?? ''}
          onChange={(e) => table.setFilter('role', e.target.value)}
        />
        <Select
          options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }, { label: 'Invited', value: 'invited' }]}
          placeholder="All Statuses"
          value={table.filters['status'] ?? ''}
          onChange={(e) => table.setFilter('status', e.target.value)}
        />
        {Object.keys(table.filters).length > 0 && (
          <Button variant="ghost" onClick={table.clearFilters}>Clear Filters</Button>
        )}
      </div>

      <DataTable columns={columns} data={table.filteredData} onSort={table.handleSort} sortConfig={table.sortConfig} keyExtractor={(u) => (u as unknown as UserProfile).id} />
      <TablePagination page={table.page} totalPages={table.totalPages} totalItems={table.totalItems} pageSize={table.pageSize} onPageChange={table.setPage} />

      <Modal
        isOpen={modal.isOpen} onClose={modal.close}
        title={modal.data ? 'Edit User' : 'Invite User'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={modal.close}>Cancel</Button>
            <Button onClick={() => { addToast({ type: 'success', title: modal.data ? 'User updated' : 'Invitation sent' }); modal.close(); }}>
              {modal.data ? 'Save Changes' : 'Send Invitation'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First Name" placeholder="John" defaultValue={modal.data?.firstName} />
          <Input label="Last Name" placeholder="Doe" defaultValue={modal.data?.lastName} />
          <Input label="Email" type="email" placeholder="john@company.com" defaultValue={modal.data?.email} />
          <Input label="Phone" placeholder="(555) 000-0000" defaultValue={modal.data?.phone} />
          <Select label="Role" options={Object.entries(ROLES).map(([value, label]) => ({ value, label }))} placeholder="Select role" defaultValue={modal.data?.role} />
          <Select label="Status" options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} defaultValue={modal.data?.status ?? 'active'} />
        </div>
      </Modal>
    </div>
  );
}
