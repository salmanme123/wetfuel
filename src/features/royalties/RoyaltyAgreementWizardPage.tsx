import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useAuth } from '@/hooks/useAuth';
import { useRoyaltyAgreements } from '@/hooks/useRoyaltyAgreements';
import { useToast } from '@/hooks/useToast';
import { mockOrganizations } from '@/mock';
import { formatRoyaltyRate } from '@/lib/royalty-utils';
import { ORG_TYPE_LABELS } from '@/types';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import { ArrowLeft, ArrowRight, Check, MapPin, Network } from 'lucide-react';
import {
  INITIAL_WIZARD_FORM,
  basisOptionsForRateType,
  buildRoyaltyAgreement,
  getEligiblePayers,
  getEligiblePayees,
  orgOptionLabel,
  suggestAgreementName,
  validateWizardStep,
  type RoyaltyWizardForm,
} from './royalty-wizard-utils';

const STEPS = [
  { key: 1, label: 'Agreement Type' },
  { key: 2, label: 'Organizations' },
  { key: 3, label: 'Terms & Rate' },
  { key: 4, label: 'Review' },
];

export function RoyaltyAgreementWizardPage() {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { addToast } = useToast();
  const { addAgreement } = useRoyaltyAgreements();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<RoyaltyWizardForm>(INITIAL_WIZARD_FORM);
  const [error, setError] = useState<string | null>(null);

  const orgs = mockOrganizations;

  useEffect(() => {
    if (state.user?.role !== 'corporate_super_admin') {
      navigate('/royalties', { replace: true });
    }
  }, [state.user?.role, navigate]);

  const payerOptions = useMemo(
    () => getEligiblePayers(orgs, form.flowType).map((o) => ({ value: o.id, label: orgOptionLabel(o) })),
    [orgs, form.flowType],
  );

  const payeeOptions = useMemo(
    () => getEligiblePayees(orgs, form.flowType, form.payerOrgId).map((o) => ({ value: o.id, label: orgOptionLabel(o) })),
    [orgs, form.flowType, form.payerOrgId],
  );

  const payerOrg = orgs.find((o) => o.id === form.payerOrgId);
  const payeeOrg = orgs.find((o) => o.id === form.payeeOrgId);
  const basisOptions = basisOptionsForRateType(form.rateType);

  const previewAgreement = useMemo(() => {
    if (!payerOrg || !payeeOrg || !form.rateValue) return null;
    try {
      return buildRoyaltyAgreement(form, orgs);
    } catch {
      return null;
    }
  }, [form, orgs, payerOrg, payeeOrg]);

  useEffect(() => {
    const allowed = basisOptionsForRateType(form.rateType);
    if (!allowed.some((o) => o.value === form.basis)) {
      setForm((f) => ({ ...f, basis: allowed[0].value }));
    }
  }, [form.rateType, form.basis]);

  useEffect(() => {
    if (form.payerOrgId && form.payeeOrgId && !form.name) {
      const suggested = suggestAgreementName(orgs, form.payerOrgId, form.payeeOrgId, form.flowType);
      if (suggested) setForm((f) => ({ ...f, name: suggested }));
    }
  }, [form.payerOrgId, form.payeeOrgId, form.flowType, form.name, orgs]);

  const updateForm = (patch: Partial<RoyaltyWizardForm>) => {
    setForm((f) => {
      const next = { ...f, ...patch };
      if (patch.flowType && patch.flowType !== f.flowType) {
        next.payerOrgId = '';
        next.payeeOrgId = '';
        next.name = '';
      }
      if (patch.payerOrgId && patch.payerOrgId !== f.payerOrgId) {
        next.payeeOrgId = '';
        next.name = '';
      }
      if (patch.payeeOrgId && patch.payeeOrgId !== f.payeeOrgId) {
        next.name = suggestAgreementName(orgs, next.payerOrgId, patch.payeeOrgId, next.flowType);
      }
      return next;
    });
    setError(null);
  };

  const handleNext = () => {
    const validationError = validateWizardStep(step, form, orgs);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setError(null);
    if (step === 1) {
      navigate('/royalties');
      return;
    }
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = () => {
    const validationError = validateWizardStep(3, form, orgs);
    if (validationError) {
      setError(validationError);
      setStep(3);
      return;
    }
    const agreement = buildRoyaltyAgreement(form, orgs);
    addAgreement(agreement);
    addToast({
      type: 'success',
      title: 'Royalty agreement created',
      message: `${agreement.payerOrgName} → ${agreement.payeeOrgName} at ${formatRoyaltyRate(agreement)}`,
    });
    navigate('/royalties?tab=agreements');
  };

  if (state.user?.role !== 'corporate_super_admin') return null;

  return (
    <div>
      <PageHeader
        title="New Royalty Agreement"
        description={`Step ${step} of ${STEPS.length} — ${STEPS[step - 1].label}`}
        actions={
          <Button variant="outline" onClick={() => navigate('/royalties')}>
            <ArrowLeft className="h-4 w-4" /> Back to Royalties
          </Button>
        }
      />

      <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold',
                    step > s.key ? 'bg-emerald-500/15 text-emerald-400' :
                    step === s.key ? 'bg-primary text-primary-foreground' :
                    'bg-muted text-muted-foreground',
                  )}
                >
                  {step > s.key ? <Check className="h-5 w-5" /> : s.key}
                </div>
                <span className={cn('text-center text-xs', step === s.key ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('mx-2 h-px flex-1', step > s.key ? 'bg-emerald-500/50' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose how this royalty relationship is structured. Hierarchy agreements follow the org tree; territory fees apply to regional master franchises.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => updateForm({ flowType: 'hierarchy' })}
                className={cn(
                  'rounded-xl border p-5 text-left transition-colors',
                  form.flowType === 'hierarchy'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                    : 'border-border hover:border-primary/40 hover:bg-accent/50',
                )}
              >
                <Network className="mb-3 h-7 w-7 text-primary" />
                <h4 className="font-semibold text-foreground">Hierarchy Royalty</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sub-franchise → franchise → franchisor → corporate. Payee must be a parent of the payer.
                </p>
                <Badge variant="info" className="mt-4">Most common</Badge>
              </button>
              <button
                type="button"
                onClick={() => updateForm({ flowType: 'territory' })}
                className={cn(
                  'rounded-xl border p-5 text-left transition-colors',
                  form.flowType === 'territory'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                    : 'border-border hover:border-primary/40 hover:bg-accent/50',
                )}
              >
                <MapPin className="mb-3 h-7 w-7 text-amber-400" />
                <h4 className="font-semibold text-foreground">Territory Overlay</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Franchisor pays master franchise for regional rights. Not a parent-child relationship.
                </p>
                <Badge variant="warning" className="mt-4">Regional fee</Badge>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mx-auto max-w-xl space-y-5">
            <p className="text-sm text-muted-foreground">
              The <strong className="text-foreground">payer</strong> remits royalties on fuel deliveries. The <strong className="text-foreground">payee</strong> receives the settlement.
            </p>
            <SearchableSelect
              label="Payer Organization (owes royalties)"
              options={payerOptions}
              value={form.payerOrgId}
              onChange={(val) => updateForm({ payerOrgId: val })}
              placeholder="Select payer..."
              searchPlaceholder="Search organizations..."
            />
            <SearchableSelect
              label="Payee Organization (receives royalties)"
              options={payeeOptions}
              value={form.payeeOrgId}
              onChange={(val) => updateForm({ payeeOrgId: val })}
              placeholder={form.payerOrgId ? 'Select payee...' : 'Select payer first...'}
              searchPlaceholder="Search organizations..."
            />
            {payerOrg && payeeOrg && (
              <div className="flex items-center justify-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-5 text-sm">
                <span className="font-medium text-amber-400">{payerOrg.name}</span>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-emerald-400">{payeeOrg.name}</span>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
            <Input
              label="Agreement Name"
              value={form.name}
              onChange={(e) => updateForm({ name: e.target.value })}
              placeholder="e.g. Plano → Dallas-North Royalty"
              className="sm:col-span-2"
            />
            <Select
              label="Rate Type"
              options={[
                { label: 'Percentage (%)', value: 'percentage' },
                { label: 'Per Gallon ($/gal)', value: 'per_gallon' },
                { label: 'Fixed Monthly ($)', value: 'fixed_monthly' },
              ]}
              value={form.rateType}
              onChange={(e) => updateForm({ rateType: e.target.value as RoyaltyWizardForm['rateType'] })}
            />
            <Select
              label="Calculation Basis"
              options={basisOptions.map((o) => ({ label: o.label, value: o.value }))}
              value={form.basis}
              onChange={(e) => updateForm({ basis: e.target.value as RoyaltyWizardForm['basis'] })}
            />
            <Input
              label={form.rateType === 'percentage' ? 'Rate (%)' : form.rateType === 'per_gallon' ? 'Rate ($/gal)' : 'Monthly Amount ($)'}
              type="number"
              min="0"
              step={form.rateType === 'per_gallon' ? '0.01' : form.rateType === 'percentage' ? '0.1' : '1'}
              value={form.rateValue}
              onChange={(e) => updateForm({ rateValue: e.target.value })}
              placeholder={form.rateType === 'percentage' ? '5' : form.rateType === 'per_gallon' ? '0.02' : '500'}
            />
            <Input
              label="Effective Date"
              type="date"
              value={form.effectiveDate}
              onChange={(e) => updateForm({ effectiveDate: e.target.value })}
            />
            <Textarea
              label="Notes (optional)"
              value={form.notes}
              onChange={(e) => updateForm({ notes: e.target.value })}
              placeholder="Additional terms or context..."
              className="sm:col-span-2"
            />
          </div>
        )}

        {step === 4 && previewAgreement && payerOrg && payeeOrg && (
          <div className="mx-auto max-w-2xl space-y-5">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
              <h4 className="text-lg font-semibold text-foreground">{previewAgreement.name}</h4>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={form.flowType === 'territory' ? 'warning' : 'info'}>
                  {form.flowType === 'territory' ? 'Territory Overlay' : 'Hierarchy'}
                </Badge>
                <Badge variant="success">Active on create</Badge>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border/50 p-4">
                <p className="text-xs text-muted-foreground">Payer</p>
                <p className="font-medium text-amber-400">{payerOrg.name}</p>
                <p className="text-xs text-muted-foreground">{ORG_TYPE_LABELS[payerOrg.type]}</p>
              </div>
              <div className="rounded-lg border border-border/50 p-4">
                <p className="text-xs text-muted-foreground">Payee</p>
                <p className="font-medium text-emerald-400">{payeeOrg.name}</p>
                <p className="text-xs text-muted-foreground">{ORG_TYPE_LABELS[payeeOrg.type]}</p>
              </div>
              <div className="rounded-lg border border-border/50 p-4">
                <p className="text-xs text-muted-foreground">Rate</p>
                <p className="text-xl font-bold text-foreground">{formatRoyaltyRate(previewAgreement)}</p>
                <p className="text-xs capitalize text-muted-foreground">Basis: {previewAgreement.basis}</p>
              </div>
              <div className="rounded-lg border border-border/50 p-4">
                <p className="text-xs text-muted-foreground">Effective Date</p>
                <p className="font-medium">{formatDate(previewAgreement.effectiveDate)}</p>
              </div>
            </div>

            {form.notes && (
              <div className="rounded-lg border border-border/50 p-4">
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-sm">{form.notes}</p>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Monthly royalty statements will be generated from customer invoice and fueling event data for this payer–payee pair.
            </p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <Button variant="outline" onClick={handleBack}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          {step < 4 ? (
            <Button onClick={handleNext}>Continue</Button>
          ) : (
            <Button onClick={handleSubmit}>Create Agreement</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
