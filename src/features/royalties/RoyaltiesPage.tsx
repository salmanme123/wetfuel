import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { useRoyaltyAgreements } from '@/hooks/useRoyaltyAgreements';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { mockRoyaltyStatements, mockOrganizations } from '@/mock';
import {
  filterAgreementsForRole,
  filterStatementsForRole,
  formatRoyaltyRate,
} from '@/lib/royalty-utils';
import { ORG_TYPE_LABELS } from '@/types';
import { formatCurrency, formatDate, formatGallons, formatNumber } from '@/lib/format';
import {
  ArrowDown,
  ArrowRight,
  Building2,
  CircleDollarSign,
  HandCoins,
  Landmark,
  Plus,
  TrendingUp,
} from 'lucide-react';
import type { RoyaltyStatement } from '@/types';

const statusColors: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  draft: 'default',
  issued: 'info',
  paid: 'success',
  overdue: 'error',
  disputed: 'warning',
};

const FLOW_LEVELS = [
  {
    level: 'L1',
    title: 'Sub-Franchise → Franchise',
    payer: 'Sub-Franchise (Frisco-East)',
    payee: 'Franchise (Frisco)',
    example: '2% of fuel revenue',
    note: 'Operating unit remits to immediate parent franchise.',
  },
  {
    level: 'L2',
    title: 'Franchise → Franchisor',
    payer: 'Franchise (Plano, Frisco, Katy…)',
    payee: 'Franchisor (Dallas-North, Houston…)',
    example: '5% of fuel revenue',
    note: 'Leaf franchises pay their regional franchisor.',
  },
  {
    level: 'L3',
    title: 'Franchisor → Corporate',
    payer: 'Franchisor',
    payee: 'WetFuel Corporate',
    example: '3% brand royalty + $0.02/gal tech fee',
    note: 'Brand, platform, and technology fees to corporate.',
  },
  {
    level: 'L4',
    title: 'Territory Overlay (Master Franchise)',
    payer: 'Franchisor in territory',
    payee: 'Master Franchise (Texas South)',
    example: '1.5% regional fee',
    note: 'Not parent-child — territorial rights fee on franchisors in region.',
  },
];

export function RoyaltiesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state } = useAuth();
  const { addToast } = useToast();
  const { agreements: agreementList } = useRoyaltyAgreements();
  const detailModal = useModal<RoyaltyStatement>();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') ?? 'overview');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'overview') {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', key);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const agreements = useMemo(
    () => filterAgreementsForRole(
      agreementList,
      mockOrganizations,
      state.user!.role,
      state.user!.organizationId,
    ),
    [agreementList, state.user],
  );

  const statements = useMemo(
    () => filterStatementsForRole(
      mockRoyaltyStatements,
      mockOrganizations,
      state.user!.role,
      state.user!.organizationId,
    ),
    [state.user],
  );

  const stats = useMemo(() => {
    const activeAgreements = agreements.filter((a) => a.status === 'active').length;
    const totalPayable = statements
      .filter((s) => s.status !== 'paid' && s.payerOrgId === state.user?.organizationId)
      .reduce((sum, s) => sum + s.royaltyAmount, 0);
    const totalReceivable = statements
      .filter((s) => s.status !== 'paid' && s.payeeOrgId === state.user?.organizationId)
      .reduce((sum, s) => sum + s.royaltyAmount, 0);
    const networkRoyalties = statements.reduce((sum, s) => sum + s.royaltyAmount, 0);
    const overdueCount = statements.filter((s) => s.status === 'overdue').length;
    return { activeAgreements, totalPayable, totalReceivable, networkRoyalties, overdueCount };
  }, [agreements, statements, state.user?.organizationId]);

  const isCorporate = state.user?.role === 'corporate_super_admin';

  return (
    <div>
      <PageHeader
        title="Royalties & Settlements"
        description="Multi-level franchise royalty flow — who charges, who pays, and periodic settlements"
        actions={
          isCorporate ? (
            <Button onClick={() => navigate('/royalties/new')}>
              <Plus className="h-4 w-4" /> Add Agreement
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Active Agreements" value={stats.activeAgreements} icon={HandCoins} iconColor="text-purple-600 bg-purple-100" />
        <StatsCard
          title={isCorporate ? 'Network Royalties (Jun)' : 'You Owe'}
          value={formatCurrency(isCorporate ? stats.networkRoyalties : stats.totalPayable)}
          icon={ArrowDown}
          iconColor="text-amber-400 bg-amber-500/15"
        />
        <StatsCard
          title="Receivable"
          value={formatCurrency(stats.totalReceivable)}
          icon={TrendingUp}
          iconColor="text-emerald-400 bg-emerald-500/10"
        />
        <StatsCard title="Overdue Statements" value={stats.overdueCount} icon={CircleDollarSign} iconColor="text-red-400 bg-red-100" />
      </div>

      <Tabs
        tabs={[
          { key: 'overview', label: 'How It Works' },
          { key: 'agreements', label: 'Agreements', count: agreements.length },
          { key: 'statements', label: 'Statements', count: statements.length },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card title="Billing vs Royalties">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-border/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-sky-400" />
                    <h4 className="font-semibold text-foreground">Customer Invoicing (AR)</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Franchise bills the <strong>end customer</strong> for fuel delivered. This is standard accounts receivable — unrelated to inter-org royalties.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">Trigger: completed fueling event → customer invoice</p>
                </div>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-foreground">Royalty Settlements (Inter-Org)</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Each org in the chain <strong>pays upstream</strong> based on fuel revenue or gallons. Corporate and master franchise <strong>charge</strong>; lower levels <strong>pay</strong>.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">Trigger: monthly settlement from customer invoice / delivery data</p>
                </div>
              </div>
            </Card>

            <Card title="Multi-Level Royalty Flow" description="Yes — royalties cascade up the org tree plus territory overlays">
              <div className="space-y-4">
                {FLOW_LEVELS.map((step, i) => (
                  <div key={step.level} className="relative flex gap-4">
                    {i < FLOW_LEVELS.length - 1 && (
                      <div className="absolute left-5 top-12 h-full w-px bg-border" />
                    )}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                      {step.level}
                    </div>
                    <div className="flex-1 rounded-lg border border-border/50 p-4">
                      <h4 className="font-semibold text-foreground">{step.title}</h4>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        <Badge variant="warning">{step.payer} pays</Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="success">{step.payee} receives</Badge>
                        <Badge variant="info">{step.example}</Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{step.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Example: Frisco-East Delivery ($1,992 revenue)">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Step</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Payer</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Payee</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Rate</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {[
                      { step: 'Customer pays franchise', payer: 'Customer', payee: 'Frisco-East', rate: 'Invoice total', amount: 2151.36 },
                      { step: 'L1 Sub-franchise royalty', payer: 'Frisco-East', payee: 'Frisco', rate: '2%', amount: 39.84 },
                      { step: 'L2 Franchise royalty', payer: 'Frisco', payee: 'Dallas-North', rate: '5%', amount: 99.60 },
                      { step: 'L3 Brand royalty', payer: 'Dallas-North', payee: 'Corporate', rate: '3%', amount: 59.76 },
                      { step: 'L4 Territory fee', payer: 'Dallas-North', payee: 'Texas South', rate: '1.5%', amount: 29.88 },
                      { step: 'Tech fee', payer: 'Dallas-North', payee: 'Corporate', rate: '$0.02/gal', amount: 9.96 },
                    ].map((row) => (
                      <tr key={row.step}>
                        <td className="px-3 py-2.5 text-muted-foreground">{row.step}</td>
                        <td className="px-3 py-2.5">{row.payer}</td>
                        <td className="px-3 py-2.5">{row.payee}</td>
                        <td className="px-3 py-2.5"><Badge variant="default">{row.rate}</Badge></td>
                        <td className="px-3 py-2.5 text-right font-medium">{formatCurrency(row.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Customer invoice tax is excluded from royalty base. Royalties calculated on pre-tax fuel revenue (subtotal).
              </p>
            </Card>
          </div>
        )}

        {activeTab === 'agreements' && (
          <Card
            footer={
              isCorporate ? (
                <Button variant="outline" size="sm" onClick={() => navigate('/royalties/new')}>
                  <Plus className="h-4 w-4" /> New Agreement
                </Button>
              ) : undefined
            }
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Agreement</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Payer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Payee</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Basis</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Rate</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {agreements.map((a) => (
                    <tr key={a.id} className="hover:bg-accent/30">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{a.name}</p>
                        {a.notes && <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">{a.notes}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{a.payerOrgName}</p>
                        <p className="text-xs text-muted-foreground">{ORG_TYPE_LABELS[a.payerOrgType as keyof typeof ORG_TYPE_LABELS] ?? a.payerOrgType}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{a.payeeOrgName}</p>
                        <p className="text-xs text-muted-foreground">{ORG_TYPE_LABELS[a.payeeOrgType as keyof typeof ORG_TYPE_LABELS] ?? a.payeeOrgType}</p>
                      </td>
                      <td className="px-4 py-3 capitalize text-sm">{a.basis}</td>
                      <td className="px-4 py-3 font-medium">{formatRoyaltyRate(a)}</td>
                      <td className="px-4 py-3">
                        {a.isTerritoryOverlay ? (
                          <Badge variant="warning">Territory</Badge>
                        ) : (
                          <Badge variant="info">Hierarchy</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={a.status === 'active' ? 'success' : 'default'}>{a.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'statements' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Statement #</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Period</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Payer → Payee</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Gallons</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Revenue Base</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Royalty</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {statements.map((s) => (
                    <tr
                      key={s.id}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => detailModal.open(s)}
                    >
                      <td className="px-4 py-3 font-mono text-sm text-primary">{s.statementNumber}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(s.periodStart)} – {formatDate(s.periodEnd)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="text-amber-400">{s.payerOrgName}</span>
                        <span className="text-muted-foreground"> → </span>
                        <span className="text-emerald-400">{s.payeeOrgName}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">{formatGallons(s.totalGallons)}</td>
                      <td className="px-4 py-3 text-sm">{s.grossRevenue > 0 ? formatCurrency(s.grossRevenue) : '—'}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(s.royaltyAmount)}</td>
                      <td className="px-4 py-3"><Badge variant={statusColors[s.status]}>{s.status}</Badge></td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(s.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <Modal
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
        title={detailModal.data ? detailModal.data.statementNumber : 'Statement Detail'}
        size="lg"
        footer={
          detailModal.data?.status === 'issued' ? (
            <>
              <Button variant="outline" onClick={detailModal.close}>Close</Button>
              <Button onClick={() => { addToast({ type: 'success', title: 'Payment recorded' }); detailModal.close(); }}>
                Mark Paid
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={detailModal.close}>Close</Button>
          )
        }
      >
        {detailModal.data && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border/50 p-3">
                <p className="text-xs text-muted-foreground">Agreement</p>
                <p className="font-medium">{detailModal.data.agreementName}</p>
              </div>
              <div className="rounded-lg border border-border/50 p-3">
                <p className="text-xs text-muted-foreground">Royalty Amount</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(detailModal.data.royaltyAmount)}</p>
              </div>
              <div className="rounded-lg border border-border/50 p-3">
                <p className="text-xs text-muted-foreground">Payer (owes)</p>
                <p className="font-medium text-amber-400">{detailModal.data.payerOrgName}</p>
              </div>
              <div className="rounded-lg border border-border/50 p-3">
                <p className="text-xs text-muted-foreground">Payee (receives)</p>
                <p className="font-medium text-emerald-400">{detailModal.data.payeeOrgName}</p>
              </div>
            </div>

            {detailModal.data.lineItems.length > 0 ? (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Line Items</h4>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Ref</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Org</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-muted-foreground">Gallons</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-muted-foreground">Revenue</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-muted-foreground">Royalty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {detailModal.data.lineItems.map((li) => (
                        <tr key={li.id}>
                          <td className="px-3 py-2 font-mono text-primary">{li.sourceRef}</td>
                          <td className="px-3 py-2">{li.operatingOrgName}</td>
                          <td className="px-3 py-2 text-right">{formatNumber(li.gallons)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(li.revenue)}</td>
                          <td className="px-3 py-2 text-right font-medium">{formatCurrency(li.royaltyAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Line-item detail aggregated at statement level for this period.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
