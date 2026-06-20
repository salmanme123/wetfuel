export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceLineItem {
  id: string;
  description: string;
  fuelType: string;
  gallons: number;
  pricePerGallon: number;
  subtotal: number;
  tax: number;
  total: number;
  jobId: string;
  jobNumber: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  organizationId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
  subtotal: number;
  taxTotal: number;
  total: number;
  lineItems: InvoiceLineItem[];
  quickbooksSynced: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
