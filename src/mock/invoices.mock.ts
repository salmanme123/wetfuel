import type { Invoice } from '@/types';

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001', tenantId: 'tenant-001', organizationId: 'org-003', invoiceNumber: 'INV-2026-00089',
    customerId: 'cust-001', customerName: 'Lone Star Construction', status: 'sent',
    issueDate: '2026-06-18', dueDate: '2026-07-18', paidDate: null,
    subtotal: 1992.0, taxTotal: 159.36, total: 2151.36,
    lineItems: [
      { id: 'li-001', description: 'Diesel delivery — Main Yard', fuelType: 'diesel', gallons: 498, pricePerGallon: 4.0, subtotal: 1992.0, tax: 159.36, total: 2151.36, jobId: 'job-001', jobNumber: 'JOB-2026-00142' },
    ],
    quickbooksSynced: true, notes: '', createdAt: '2026-06-18T12:00:00Z', updatedAt: '2026-06-18T12:00:00Z',
  },
  {
    id: 'inv-002', tenantId: 'tenant-001', organizationId: 'org-003', invoiceNumber: 'INV-2026-00090',
    customerId: 'cust-002', customerName: 'DFW Medical Center', status: 'paid',
    issueDate: '2026-06-15', dueDate: '2026-06-30', paidDate: '2026-06-17',
    subtotal: 2640.0, taxTotal: 211.20, total: 2851.20,
    lineItems: [
      { id: 'li-002', description: 'Diesel delivery — Hospital Campus', fuelType: 'diesel', gallons: 600, pricePerGallon: 4.40, subtotal: 2640.0, tax: 211.20, total: 2851.20, jobId: 'job-014', jobNumber: 'JOB-2026-00155' },
    ],
    quickbooksSynced: true, notes: '', createdAt: '2026-06-15T09:00:00Z', updatedAt: '2026-06-17T14:00:00Z',
  },
  {
    id: 'inv-003', tenantId: 'tenant-001', organizationId: 'org-003', invoiceNumber: 'INV-2026-00091',
    customerId: 'cust-002', customerName: 'DFW Medical Center', status: 'sent',
    issueDate: '2026-06-18', dueDate: '2026-07-03', paidDate: null,
    subtotal: 3520.0, taxTotal: 281.60, total: 3801.60,
    lineItems: [
      { id: 'li-003', description: 'Diesel emergency delivery — Hospital Campus', fuelType: 'diesel', gallons: 800, pricePerGallon: 4.40, subtotal: 3520.0, tax: 281.60, total: 3801.60, jobId: 'job-002', jobNumber: 'JOB-2026-00143' },
    ],
    quickbooksSynced: false, notes: 'Emergency priority delivery', createdAt: '2026-06-18T10:00:00Z', updatedAt: '2026-06-18T10:00:00Z',
  },
  {
    id: 'inv-004', tenantId: 'tenant-001', organizationId: 'org-004', invoiceNumber: 'INV-2026-00092',
    customerId: 'cust-010', customerName: 'Port Houston Logistics', status: 'overdue',
    issueDate: '2026-06-03', dueDate: '2026-06-10', paidDate: null,
    subtotal: 11920.0, taxTotal: 953.60, total: 12873.60,
    lineItems: [
      { id: 'li-004', description: 'Diesel delivery — Port Terminal', fuelType: 'diesel', gallons: 2980, pricePerGallon: 4.0, subtotal: 11920.0, tax: 953.60, total: 12873.60, jobId: 'job-010', jobNumber: 'JOB-2026-00151' },
    ],
    quickbooksSynced: true, notes: '', createdAt: '2026-06-03T08:00:00Z', updatedAt: '2026-06-10T00:00:00Z',
  },
  {
    id: 'inv-005', tenantId: 'tenant-001', organizationId: 'org-004', invoiceNumber: 'INV-2026-00093',
    customerId: 'cust-004', customerName: 'Bayou Data Center', status: 'paid',
    issueDate: '2026-06-12', dueDate: '2026-07-12', paidDate: '2026-06-14',
    subtotal: 11250.0, taxTotal: 900.0, total: 12150.0,
    lineItems: [
      { id: 'li-005', description: 'Diesel emergency overnight delivery', fuelType: 'diesel', gallons: 2500, pricePerGallon: 4.50, subtotal: 11250.0, tax: 900.0, total: 12150.0, jobId: 'job-018', jobNumber: 'JOB-2026-00159' },
    ],
    quickbooksSynced: true, notes: 'Emergency rate applied', createdAt: '2026-06-12T06:00:00Z', updatedAt: '2026-06-14T10:00:00Z',
  },
  {
    id: 'inv-006', tenantId: 'tenant-001', organizationId: 'org-005', invoiceNumber: 'INV-2026-00094',
    customerId: 'cust-006', customerName: 'Sunshine Marina', status: 'paid',
    issueDate: '2026-06-14', dueDate: '2026-06-14', paidDate: '2026-06-14',
    subtotal: 1881.60, taxTotal: 150.53, total: 2032.13,
    lineItems: [
      { id: 'li-006', description: 'Diesel delivery — Marina Dock', fuelType: 'diesel', gallons: 448, pricePerGallon: 4.20, subtotal: 1881.60, tax: 150.53, total: 2032.13, jobId: 'job-016', jobNumber: 'JOB-2026-00157' },
    ],
    quickbooksSynced: true, notes: 'COD — paid on delivery', createdAt: '2026-06-14T10:00:00Z', updatedAt: '2026-06-14T10:00:00Z',
  },
  {
    id: 'inv-007', tenantId: 'tenant-001', organizationId: 'org-003', invoiceNumber: 'INV-2026-00095',
    customerId: 'cust-001', customerName: 'Lone Star Construction', status: 'draft',
    issueDate: '2026-06-20', dueDate: '2026-07-20', paidDate: null,
    subtotal: 0, taxTotal: 0, total: 0,
    lineItems: [],
    quickbooksSynced: false, notes: 'Pending job completion', createdAt: '2026-06-20T00:00:00Z', updatedAt: '2026-06-20T00:00:00Z',
  },
];
