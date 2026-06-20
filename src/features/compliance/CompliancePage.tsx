import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { mockComplianceDocuments, mockComplianceScorecards, mockSafetyIncidents, mockDrivers } from '@/mock';
import { formatDate } from '@/lib/format';
import { Shield, AlertTriangle, FileCheck, AlertCircle, Plus } from 'lucide-react';

const docStatusColors: Record<string, 'success' | 'warning' | 'error'> = { valid: 'success', expiring_soon: 'warning', expired: 'error' };
const incidentSeverityColors: Record<string, 'default' | 'warning' | 'error'> = { low: 'default', medium: 'warning', high: 'error', critical: 'error' };
const incidentStatusColors: Record<string, 'info' | 'warning' | 'success' | 'default'> = { reported: 'info', investigating: 'warning', resolved: 'success', closed: 'default' };

export function CompliancePage() {
  const [activeTab, setActiveTab] = useState('scorecards');
  const { addToast } = useToast();
  const incidentModal = useModal();

  const expiredCount = mockComplianceDocuments.filter((d) => d.status === 'expired').length;
  const expiringSoonCount = mockComplianceDocuments.filter((d) => d.status === 'expiring_soon').length;
  const avgScore = Math.round(mockComplianceScorecards.reduce((s, c) => s + c.overallScore, 0) / mockComplianceScorecards.length);

  return (
    <div>
      <PageHeader title="Compliance" description="Track licenses, certifications, inspections, and safety across franchises" />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatsCard title="Avg Compliance Score" value={`${avgScore}%`} icon={Shield} iconColor="text-emerald-600 bg-emerald-100" />
        <StatsCard title="Expired Documents" value={expiredCount} icon={AlertCircle} iconColor="text-red-400 bg-red-100" />
        <StatsCard title="Expiring Soon" value={expiringSoonCount} icon={AlertTriangle} iconColor="text-amber-400 bg-yellow-100" />
        <StatsCard title="Total Documents" value={mockComplianceDocuments.length} icon={FileCheck} iconColor="text-sky-400 bg-sky-500/15" />
      </div>

      <Tabs tabs={[
        { key: 'scorecards', label: 'Franchise Scorecards' },
        { key: 'documents', label: 'Documents', count: mockComplianceDocuments.length },
        { key: 'incidents', label: 'Safety Incidents', count: mockSafetyIncidents.length },
      ]} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'scorecards' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockComplianceScorecards.map((sc) => (
              <Card key={sc.organizationId}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{sc.organizationName}</h3>
                    <span className={`text-2xl font-bold ${sc.overallScore >= 90 ? 'text-emerald-400' : sc.overallScore >= 80 ? 'text-amber-400' : 'text-red-400'}`}>{sc.overallScore}%</span>
                  </div>
                  <div className="space-y-2">
                    {([['Driver', sc.driverScore], ['Vehicle', sc.vehicleScore], ['Operational', sc.operationalScore], ['Safety', sc.safetyScore]] as [string, number][]).map(([label, score]) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-border">
                            <div className={`h-2 rounded-full ${score >= 90 ? 'bg-emerald-500/100' : score >= 80 ? 'bg-amber-500/100' : 'bg-red-500/100'}`} style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-sm font-medium w-10 text-right">{score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 border-t pt-3 text-xs text-muted-foreground">
                    <span>{sc.totalDocuments} docs</span>
                    {sc.expiredDocuments > 0 && <Badge variant="error">{sc.expiredDocuments} expired</Badge>}
                    {sc.expiringSoonDocuments > 0 && <Badge variant="warning">{sc.expiringSoonDocuments} expiring</Badge>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'documents' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead><tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Document</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Entity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Expiry Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Days Left</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-border/50">
                  {mockComplianceDocuments.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry).map((d) => (
                    <tr key={d.id}>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{d.documentName}</td>
                      <td className="px-4 py-3"><Badge variant="default">{d.category}</Badge></td>
                      <td className="px-4 py-3"><div><p className="text-sm">{d.entityName}</p><p className="text-xs text-muted-foreground">{d.entityType}</p></div></td>
                      <td className="px-4 py-3 text-sm">{formatDate(d.expiryDate)}</td>
                      <td className="px-4 py-3 text-sm font-medium"><span className={d.daysUntilExpiry < 0 ? 'text-red-400' : d.daysUntilExpiry < 90 ? 'text-amber-400' : 'text-emerald-400'}>{d.daysUntilExpiry < 0 ? `${Math.abs(d.daysUntilExpiry)}d overdue` : `${d.daysUntilExpiry}d`}</span></td>
                      <td className="px-4 py-3"><Badge variant={docStatusColors[d.status]}>{d.status.replace('_', ' ')}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'incidents' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => incidentModal.open()}><Plus className="h-4 w-4" /> Report Incident</Button>
            </div>
            {mockSafetyIncidents.map((inc) => (
              <Card key={inc.id}>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={incidentSeverityColors[inc.severity]}>{inc.severity}</Badge>
                      <Badge variant="default">{inc.type}</Badge>
                      <Badge variant={incidentStatusColors[inc.status]}>{inc.status}</Badge>
                    </div>
                    <p className="text-sm text-foreground">{inc.description}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Date: {formatDate(inc.date)}</span>
                      {inc.driverName && <span>Driver: {inc.driverName}</span>}
                      <span>Location: {inc.location}</span>
                    </div>
                    {inc.correctiveAction && (
                      <div className="rounded-lg bg-emerald-500/10 p-2">
                        <p className="text-xs font-medium text-emerald-400">Corrective Action: {inc.correctiveAction}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={incidentModal.isOpen} onClose={incidentModal.close} title="Report Safety Incident" size="lg" footer={
        <>
          <Button variant="outline" onClick={incidentModal.close}>Cancel</Button>
          <Button onClick={() => { addToast({ type: 'success', title: 'Incident reported', message: 'Safety team has been notified' }); incidentModal.close(); }}>Submit Report</Button>
        </>
      }>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Incident Type" options={[
            { label: 'Fuel Spill', value: 'spill' },
            { label: 'Accident', value: 'accident' },
            { label: 'Violation', value: 'violation' },
            { label: 'Near Miss', value: 'near_miss' },
          ]} placeholder="Select type" />
          <Select label="Severity" options={[
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Critical', value: 'critical' },
          ]} placeholder="Select severity" />
          <Select label="Driver (if applicable)" options={mockDrivers.map((d) => ({ label: `${d.firstName} ${d.lastName}`, value: d.id }))} placeholder="Select driver" />
          <Input label="Date of Incident" type="date" />
          <Input label="Location" placeholder="e.g. 2400 Freight Rd, Houston, TX" className="sm:col-span-2" />
          <Textarea label="Description" placeholder="Describe what happened in detail..." className="sm:col-span-2" />
          <Textarea label="Immediate Actions Taken" placeholder="What was done immediately after the incident..." className="sm:col-span-2" />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">Attach Photos/Evidence</label>
            <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">Drag & drop or click to upload photos</p>
              <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG up to 10MB each, max 5 files</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
