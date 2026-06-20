import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { mockCustomers, mockJobs } from '@/mock';
import { formatCurrency, formatGallons, formatDate } from '@/lib/format';
import { ArrowLeft, Truck, Droplets, DollarSign, MapPin, Mail, Phone } from 'lucide-react';

export function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');

  const customer = mockCustomers.find((c) => c.id === id);
  const customerJobs = mockJobs.filter((j) => j.customerId === id);

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/customers')}>Back to Customers</Button>
      </div>
    );
  }

  const tabs = [
    { key: 'info', label: 'Information' },
    { key: 'sites', label: 'Sites', count: customer.sites.length },
    { key: 'history', label: 'Delivery History', count: customerJobs.length },
  ];

  return (
    <div>
      <PageHeader
        title={customer.companyName}
        description={`${customer.category} customer`}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/customers')}><ArrowLeft className="h-4 w-4" /> Back</Button>
            <Button>Edit Customer</Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Deliveries" value={customer.totalDeliveries} icon={Truck} />
        <StatsCard title="Total Gallons" value={formatGallons(customer.totalGallonsDelivered)} icon={Droplets} iconColor="text-blue-600 bg-blue-100" />
        <StatsCard title="Outstanding Balance" value={formatCurrency(customer.outstandingBalance)} icon={DollarSign} iconColor="text-green-600 bg-green-100" />
        <StatsCard title="Sites" value={customer.sites.length} icon={MapPin} iconColor="text-orange-600 bg-orange-100" />
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'info' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Contact Information">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{customer.contactName}</p>
                    <p className="text-sm text-gray-600">{customer.contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{customer.contactPhone}</p>
                  </div>
                </div>
              </div>
            </Card>
            <Card title="Billing & Pricing">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Category</span>
                  <Badge variant="info">{customer.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Billing Term</span>
                  <span className="font-medium">{customer.billingTerm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Pricing Model</span>
                  <span className="font-medium">{customer.pricingModel === 'opis' ? 'OPIS-Based' : customer.pricingModel === 'tank_cost' ? 'Tank Cost' : 'Hybrid'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <StatusBadge status={customer.status} type="user" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'sites' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Site Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">City/State</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Equipment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Default</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customer.sites.map((site) => (
                    <tr key={site.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{site.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{site.address}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{site.city}, {site.state} {site.zipCode}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{site.contactName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{site.equipmentCount}</td>
                      <td className="px-4 py-3">{site.isDefault && <Badge variant="success">Default</Badge>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'history' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Job #</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Fuel Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Gallons</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Driver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customerJobs.map((job) => (
                    <tr key={job.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/jobs/${job.id}`)}>
                      <td className="px-4 py-3 text-sm font-mono text-brand-600">{job.jobNumber}</td>
                      <td className="px-4 py-3"><StatusBadge status={job.status} type="job" /></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{job.fuelType}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatGallons(job.deliveredGallons ?? job.requestedGallons)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(job.scheduledDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{job.driverName ?? '—'}</td>
                    </tr>
                  ))}
                  {customerJobs.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">No deliveries found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
