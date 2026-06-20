import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { mockOpisRates, mockPricingRules, mockTaxRules } from '@/mock';
import { FUEL_TYPES } from '@/lib/constants';
import { formatCurrency } from '@/lib/format';
import { Plus, TrendingUp } from 'lucide-react';

const typeLabels: Record<string, string> = { opis: 'OPIS-Based', tank_cost: 'Tank Cost', hybrid: 'Hybrid' };
const typeColors: Record<string, 'info' | 'success' | 'warning'> = { opis: 'info', tank_cost: 'success', hybrid: 'warning' };
const taxTypeLabels: Record<string, string> = { federal: 'Federal', state: 'State', fuel: 'Fuel', sales: 'Sales', lust: 'LUST' };

export function PricingPage() {
  const [activeTab, setActiveTab] = useState('opis');
  const { addToast } = useToast();
  const pricingModal = useModal();
  const taxModal = useModal();

  return (
    <div>
      <PageHeader title="Pricing & Tax Configuration" description="Manage fuel pricing rules, OPIS rates, and tax configuration" />

      <Tabs tabs={[
        { key: 'opis', label: 'OPIS Rates' },
        { key: 'pricing', label: 'Pricing Rules', count: mockPricingRules.length },
        { key: 'taxes', label: 'Tax Rules', count: mockTaxRules.length },
      ]} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'opis' && (
          <div>
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-700">Daily OPIS rack prices — last updated June 20, 2026 (Gulf Coast)</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockOpisRates.map((rate) => (
                <Card key={rate.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{rate.fuelType.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(rate.rackPrice)}<span className="text-sm font-normal text-gray-500">/gal</span></p>
                    </div>
                    <Badge variant="info">{rate.source}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">Effective: {rate.effectiveDate}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div>
            <div className="mb-4 flex justify-end">
              <Button onClick={() => pricingModal.open()}><Plus className="h-4 w-4" /> Add Pricing Rule</Button>
            </div>
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Fuel</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Margin</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Min Price</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Default</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockPricingRules.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.name}</td>
                        <td className="px-4 py-3"><Badge variant={typeColors[r.type]}>{typeLabels[r.type]}</Badge></td>
                        <td className="px-4 py-3 text-sm">{r.fuelType}</td>
                        <td className="px-4 py-3 text-sm font-medium">{r.marginType === 'fixed' ? `+${formatCurrency(r.marginValue)}/gal` : `+${r.marginValue}%`}</td>
                        <td className="px-4 py-3 text-sm">{r.minimumPrice ? formatCurrency(r.minimumPrice) : '—'}</td>
                        <td className="px-4 py-3">{r.isDefault && <Badge variant="success">Default</Badge>}</td>
                        <td className="px-4 py-3"><Badge variant={r.status === 'active' ? 'success' : 'default'}>{r.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'taxes' && (
          <div>
            <div className="mb-4 flex justify-end">
              <Button onClick={() => taxModal.open()}><Plus className="h-4 w-4" /> Add Tax Rule</Button>
            </div>
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Tax Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Fuel</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">State</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockTaxRules.map((t) => (
                      <tr key={t.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.name}</td>
                        <td className="px-4 py-3"><Badge variant="info">{taxTypeLabels[t.taxType]}</Badge></td>
                        <td className="px-4 py-3 text-sm">{t.fuelType ?? 'All'}</td>
                        <td className="px-4 py-3 text-sm">{t.state ?? 'Federal'}</td>
                        <td className="px-4 py-3 text-sm font-medium">{t.rateType === 'per_gallon' ? `$${t.rate}/gal` : `${t.rate}%`}</td>
                        <td className="px-4 py-3"><Badge variant={t.isActive ? 'success' : 'default'}>{t.isActive ? 'Active' : 'Inactive'}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>

      <Modal isOpen={pricingModal.isOpen} onClose={pricingModal.close} title="Add Pricing Rule" size="lg" footer={
        <><Button variant="outline" onClick={pricingModal.close}>Cancel</Button><Button onClick={() => { addToast({ type: 'success', title: 'Pricing rule created' }); pricingModal.close(); }}>Create</Button></>
      }>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Rule Name" placeholder="Dallas Standard OPIS Diesel" />
          <Select label="Type" options={[{ label: 'OPIS-Based', value: 'opis' }, { label: 'Tank Cost', value: 'tank_cost' }, { label: 'Hybrid', value: 'hybrid' }]} placeholder="Select type" />
          <Select label="Fuel Type" options={FUEL_TYPES} placeholder="Select fuel" />
          <Select label="Margin Type" options={[{ label: 'Fixed ($/gal)', value: 'fixed' }, { label: 'Percentage (%)', value: 'percentage' }]} placeholder="Select" />
          <Input label="Margin Value" type="number" placeholder="1.15" />
          <Input label="Minimum Price" type="number" placeholder="3.50" />
        </div>
      </Modal>

      <Modal isOpen={taxModal.isOpen} onClose={taxModal.close} title="Add Tax Rule" size="lg" footer={
        <><Button variant="outline" onClick={taxModal.close}>Cancel</Button><Button onClick={() => { addToast({ type: 'success', title: 'Tax rule created' }); taxModal.close(); }}>Create</Button></>
      }>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Tax Name" placeholder="Federal Excise Tax - Diesel" />
          <Select label="Tax Type" options={[{ label: 'Federal', value: 'federal' }, { label: 'State', value: 'state' }, { label: 'Fuel', value: 'fuel' }, { label: 'Sales', value: 'sales' }, { label: 'LUST', value: 'lust' }]} placeholder="Select type" />
          <Select label="Fuel Type" options={FUEL_TYPES} placeholder="All fuels" />
          <Input label="State" placeholder="TX (leave blank for federal)" />
          <Input label="Rate" type="number" placeholder="0.244" />
          <Select label="Rate Type" options={[{ label: 'Per Gallon', value: 'per_gallon' }, { label: 'Percentage', value: 'percentage' }]} placeholder="Select" />
        </div>
      </Modal>
    </div>
  );
}
