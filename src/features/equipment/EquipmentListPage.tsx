import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, TablePagination, type Column } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useTable } from '@/hooks/useTable';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { mockEquipment, mockCustomers } from '@/mock';
import { formatGallons, formatDate } from '@/lib/format';
import { FUEL_TYPES } from '@/lib/constants';
import { Plus, QrCode, Eye, Trash2 } from 'lucide-react';
import type { Equipment, EquipmentType, PlaceLocation } from '@/types';

const typeLabels: Record<string, string> = { tank: 'Tank', generator: 'Generator', pump: 'Pump', other: 'Other' };
const statusVariants: Record<string, 'success' | 'default' | 'warning'> = { active: 'success', inactive: 'default', needs_service: 'warning' };

const EMPTY_REGISTER_FORM = {
  name: '',
  type: '',
  customerId: '',
  siteId: '',
  location: null as PlaceLocation | null,
  manufacturer: '',
  model: '',
  serialNumber: '',
  capacityGallons: '',
  fuelType: '',
  installDate: '',
};

function buildCustomerOptionsFromCustomers() {
  return mockCustomers
    .map((c) => ({ value: c.id, label: c.companyName }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function buildSiteOptionsForCustomer(customerId: string) {
  const customer = mockCustomers.find((c) => c.id === customerId);
  if (!customer) return [];
  return customer.sites
    .map((s) => ({
      value: s.id,
      label: `${s.name} — ${s.city}, ${s.state}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function formatSiteAddress(site: { address: string; city: string; state: string; zipCode: string }) {
  return `${site.address}, ${site.city}, ${site.state} ${site.zipCode}`;
}

function buildCustomerOptions(equipment: Equipment[]) {
  const seen = new Map<string, string>();
  equipment.forEach((e) => seen.set(e.customerId, e.customerName));
  return Array.from(seen, ([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function buildSiteOptions(equipment: Equipment[], customerId: string) {
  const filtered = customerId
    ? equipment.filter((e) => e.customerId === customerId)
    : equipment;
  const seen = new Map<string, string>();
  filtered.forEach((e) => seen.set(e.siteId, e.siteName));
  return Array.from(seen, ([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function EquipmentListPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const addModal = useModal();
  const [equipment, setEquipment] = useState(mockEquipment);
  const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null);
  const [customerFilter, setCustomerFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [registerForm, setRegisterForm] = useState(EMPTY_REGISTER_FORM);
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});

  const registerCustomerOptions = useMemo(() => buildCustomerOptionsFromCustomers(), []);
  const registerSiteOptions = useMemo(
    () => buildSiteOptionsForCustomer(registerForm.customerId),
    [registerForm.customerId],
  );

  const openRegisterModal = () => {
    setRegisterForm(EMPTY_REGISTER_FORM);
    setRegisterErrors({});
    addModal.open();
  };

  const closeRegisterModal = () => {
    addModal.close();
    setRegisterForm(EMPTY_REGISTER_FORM);
    setRegisterErrors({});
  };

  const updateRegisterForm = (patch: Partial<typeof registerForm>) => {
    setRegisterForm((prev) => ({ ...prev, ...patch }));
    setRegisterErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((key) => delete next[key]);
      return next;
    });
  };

  const handleRegisterCustomerChange = (customerId: string) => {
    updateRegisterForm({
      customerId,
      siteId: '',
      location: null,
    });
  };

  const handleRegisterSiteChange = (siteId: string) => {
    const customer = mockCustomers.find((c) => c.id === registerForm.customerId);
    const site = customer?.sites.find((s) => s.id === siteId);
    updateRegisterForm({
      siteId,
      location: site
        ? {
            formattedAddress: formatSiteAddress(site),
            latitude: site.latitude,
            longitude: site.longitude,
            placeId: site.id,
          }
        : null,
    });
  };

  const handleRegister = () => {
    const errors: Record<string, string> = {};
    if (!registerForm.name.trim()) errors.name = 'Equipment name is required';
    if (!registerForm.type) errors.type = 'Type is required';
    if (!registerForm.customerId) errors.customerId = 'Customer is required';
    if (!registerForm.location) errors.location = 'Select an exact location from the address search';
    if (!registerForm.fuelType) errors.fuelType = 'Fuel type is required';

    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      addToast({ type: 'error', title: 'Complete required fields before registering' });
      return;
    }

    const customer = mockCustomers.find((c) => c.id === registerForm.customerId)!;
    const site = customer.sites.find((s) => s.id === registerForm.siteId)
      ?? customer.sites.find((s) => s.isDefault)
      ?? customer.sites[0];
    const nextIndex = equipment.length + 1;
    const now = new Date().toISOString();

    const newEquipment: Equipment = {
      id: `eq-${String(nextIndex).padStart(3, '0')}`,
      tenantId: 'tenant-001',
      organizationId: customer.organizationId,
      customerId: customer.id,
      customerName: customer.companyName,
      siteId: site?.id ?? `site-new-${nextIndex}`,
      siteName: site?.name ?? registerForm.location!.formattedAddress,
      name: registerForm.name.trim(),
      type: registerForm.type as EquipmentType,
      manufacturer: registerForm.manufacturer.trim() || '—',
      model: registerForm.model.trim() || '—',
      serialNumber: registerForm.serialNumber.trim() || `SN-${Date.now()}`,
      capacityGallons: registerForm.capacityGallons ? Number(registerForm.capacityGallons) : null,
      fuelType: registerForm.fuelType,
      qrCode: `QR-WF-${String(nextIndex).padStart(5, '0')}`,
      status: 'active',
      latitude: registerForm.location!.latitude,
      longitude: registerForm.location!.longitude,
      photoUrl: null,
      lastFueledDate: null,
      totalFuelingEvents: 0,
      totalGallonsDelivered: 0,
      installDate: registerForm.installDate || now.slice(0, 10),
      createdAt: now,
      updatedAt: now,
    };

    setEquipment((prev) => [...prev, newEquipment]);
    addToast({ type: 'success', title: 'Equipment registered and QR code generated' });
    closeRegisterModal();
  };

  const customerOptions = useMemo(() => buildCustomerOptions(equipment), [equipment]);
  const siteOptions = useMemo(
    () => buildSiteOptions(equipment, customerFilter),
    [equipment, customerFilter],
  );

  const filteredEquipment = useMemo(() => {
    return equipment.filter((e) => {
      if (customerFilter && e.customerId !== customerFilter) return false;
      if (siteFilter && e.siteId !== siteFilter) return false;
      return true;
    });
  }, [equipment, customerFilter, siteFilter]);

  const table = useTable<Equipment & Record<string, unknown>>({
    data: filteredEquipment as (Equipment & Record<string, unknown>)[],
    searchKeys: ['name', 'customerName', 'siteName', 'serialNumber', 'qrCode'],
  });

  const handleCustomerFilter = (value: string) => {
    setCustomerFilter(value);
    if (siteFilter && value) {
      const siteStillValid = buildSiteOptions(equipment, value).some((s) => s.value === siteFilter);
      if (!siteStillValid) setSiteFilter('');
    }
    table.setPage(1);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setEquipment((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    addToast({ type: 'success', title: `${deleteTarget.name} removed` });
    setDeleteTarget(null);
  };

  const hasFilters = Boolean(customerFilter || siteFilter || table.searchTerm);

  const clearFilters = () => {
    setCustomerFilter('');
    setSiteFilter('');
    table.clearFilters();
  };

  const openEquipmentDetail = (eq: Equipment) => {
    navigate(`/equipment/${eq.id}`, { state: { equipment: eq } });
  };

  const columns: Column<Equipment & Record<string, unknown>>[] = [
    { key: 'name', header: 'Equipment', sortable: true, render: (e) => { const eq = e as unknown as Equipment; return (<div><p className="font-medium text-gray-900">{eq.name}</p><p className="text-xs text-gray-500">{eq.manufacturer} {eq.model}</p></div>); } },
    { key: 'type', header: 'Type', render: (e) => <Badge variant="default">{typeLabels[(e as unknown as Equipment).type]}</Badge> },
    { key: 'customerName', header: 'Customer', sortable: true },
    { key: 'siteName', header: 'Site' },
    { key: 'qrCode', header: 'QR Code', render: (e) => (<span className="flex items-center gap-1 font-mono text-xs"><QrCode className="h-3 w-3" />{(e as unknown as Equipment).qrCode}</span>) },
    { key: 'capacityGallons', header: 'Capacity', render: (e) => { const cap = (e as unknown as Equipment).capacityGallons; return cap ? formatGallons(cap) : '—'; } },
    { key: 'totalFuelingEvents', header: 'Fuelings', sortable: true },
    { key: 'lastFueledDate', header: 'Last Fueled', render: (e) => { const d = (e as unknown as Equipment).lastFueledDate; return d ? formatDate(d) : '—'; } },
    { key: 'status', header: 'Status', render: (e) => <Badge variant={statusVariants[(e as unknown as Equipment).status]}>{(e as unknown as Equipment).status}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      width: '120px',
      render: (e) => {
        const eq = e as unknown as Equipment;
        return (
          <div className="flex items-center gap-1" onClick={(ev) => ev.stopPropagation()}>
            <button
              type="button"
              onClick={() => openEquipmentDetail(eq)}
              className="cursor-pointer rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(eq)}
              className="cursor-pointer rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader title="Equipment & QR Codes" description="Register equipment, assign QR codes, and track fueling history" actions={
        <Button onClick={openRegisterModal}><Plus className="h-4 w-4" /> Register Equipment</Button>
      } />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <SearchInput value={table.searchTerm} onChange={table.setSearchTerm} placeholder="Search equipment, customer, QR code..." className="w-96" />
        <SearchableSelect
          options={customerOptions}
          placeholder="All Customers"
          value={customerFilter}
          onChange={handleCustomerFilter}
          className="w-52"
          searchPlaceholder="Search customers..."
        />
        <SearchableSelect
          options={siteOptions}
          placeholder="All Sites"
          value={siteFilter}
          onChange={(val) => { setSiteFilter(val); table.setPage(1); }}
          className="w-52"
          searchPlaceholder="Search sites..."
        />
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>Clear</Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={table.filteredData}
        onSort={table.handleSort}
        sortConfig={table.sortConfig}
        onRowClick={(e) => openEquipmentDetail(e as unknown as Equipment)}
        keyExtractor={(e) => (e as unknown as Equipment).id}
      />
      <TablePagination page={table.page} totalPages={table.totalPages} totalItems={table.totalItems} pageSize={table.pageSize} onPageChange={table.setPage} />

      <Modal
        isOpen={addModal.isOpen}
        onClose={closeRegisterModal}
        title="Register Equipment"
        size="lg"
        bodyClassName="overflow-visible"
        footer={
          <>
            <Button variant="outline" onClick={closeRegisterModal}>Cancel</Button>
            <Button onClick={handleRegister}>Register</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SearchableSelect
            label="Customer"
            options={registerCustomerOptions}
            placeholder="Select customer"
            value={registerForm.customerId}
            onChange={handleRegisterCustomerChange}
            searchPlaceholder="Search customers..."
            className={registerErrors.customerId ? 'sm:col-span-2' : 'sm:col-span-2'}
          />
          {registerErrors.customerId && (
            <p className="-mt-2 text-sm text-red-600 sm:col-span-2">{registerErrors.customerId}</p>
          )}

          <SearchableSelect
            label="Site"
            options={registerSiteOptions}
            placeholder={registerForm.customerId ? 'Select site (optional)' : 'Select a customer first'}
            value={registerForm.siteId}
            onChange={handleRegisterSiteChange}
            searchPlaceholder="Search sites..."
            className="sm:col-span-2"
          />

          <div className="sm:col-span-2">
            <AddressAutocomplete
              label="Exact Location"
              customerId={registerForm.customerId}
              value={registerForm.location}
              onChange={(location) => updateRegisterForm({ location })}
              placeholder="Search address on Google Maps..."
              error={registerErrors.location}
              disabled={!registerForm.customerId}
              helperText={
                registerForm.customerId
                  ? undefined
                  : 'Select a customer first, then search for the exact equipment location.'
              }
            />
          </div>

          <Input
            label="Equipment Name"
            placeholder="Generator Tank A"
            value={registerForm.name}
            onChange={(e) => updateRegisterForm({ name: e.target.value })}
            error={registerErrors.name}
          />
          <Select
            label="Type"
            options={[
              { label: 'Tank', value: 'tank' },
              { label: 'Generator', value: 'generator' },
              { label: 'Pump', value: 'pump' },
              { label: 'Other', value: 'other' },
            ]}
            placeholder="Select type"
            value={registerForm.type}
            onChange={(e) => updateRegisterForm({ type: e.target.value })}
            error={registerErrors.type}
          />
          <Input
            label="Manufacturer"
            placeholder="Western Global"
            value={registerForm.manufacturer}
            onChange={(e) => updateRegisterForm({ manufacturer: e.target.value })}
          />
          <Input
            label="Model"
            placeholder="FuelCube 500"
            value={registerForm.model}
            onChange={(e) => updateRegisterForm({ model: e.target.value })}
          />
          <Input
            label="Serial Number"
            placeholder="WG-FC500-22018"
            value={registerForm.serialNumber}
            onChange={(e) => updateRegisterForm({ serialNumber: e.target.value })}
          />
          <Input
            label="Capacity (gallons)"
            type="number"
            placeholder="500"
            value={registerForm.capacityGallons}
            onChange={(e) => updateRegisterForm({ capacityGallons: e.target.value })}
          />
          <Select
            label="Fuel Type"
            options={FUEL_TYPES}
            placeholder="Select fuel"
            value={registerForm.fuelType}
            onChange={(e) => updateRegisterForm({ fuelType: e.target.value })}
            error={registerErrors.fuelType}
          />
          <Input
            label="Install Date"
            type="date"
            value={registerForm.installDate}
            onChange={(e) => updateRegisterForm({ installDate: e.target.value })}
          />
        </div>
        <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          A QR code will be auto-generated upon registration. Search the exact equipment location — Google Places integration will be enabled in production.
        </p>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Equipment"
        message={deleteTarget ? `Remove ${deleteTarget.name} (${deleteTarget.qrCode})? This cannot be undone.` : ''}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
