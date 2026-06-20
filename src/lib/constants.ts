import type { SelectOption } from '@/types';

export const ROLES: Record<string, string> = {
  corporate_super_admin: 'Corporate Super Admin',
  master_franchise_admin: 'Master Franchise Admin',
  franchise_admin: 'Franchise Admin',
};

export const JOB_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'border-border bg-muted/50 text-muted-foreground' },
  { value: 'pending', label: 'Pending', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
  { value: 'assigned', label: 'Assigned', color: 'border-sky-500/30 bg-sky-500/10 text-sky-400' },
  { value: 'in_progress', label: 'In Progress', color: 'border-primary/30 bg-primary/10 text-primary' },
  { value: 'completed', label: 'Completed', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
  { value: 'cancelled', label: 'Cancelled', color: 'border-red-500/30 bg-red-500/10 text-red-400' },
] as const;

export const JOB_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'border-border bg-muted/50 text-muted-foreground' },
  { value: 'normal', label: 'Normal', color: 'border-sky-500/30 bg-sky-500/10 text-sky-400' },
  { value: 'high', label: 'High', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
  { value: 'urgent', label: 'Urgent', color: 'border-red-500/30 bg-red-500/10 text-red-400' },
] as const;

export const BILLING_TERMS: SelectOption[] = [
  { label: 'COD (Cash on Delivery)', value: 'COD' },
  { label: 'Net 7', value: 'Net7' },
  { label: 'Net 10', value: 'Net10' },
  { label: 'Net 15', value: 'Net15' },
  { label: 'Net 30', value: 'Net30' },
];

export const PRICING_MODELS: SelectOption[] = [
  { label: 'OPIS-Based', value: 'opis' },
  { label: 'Tank Cost', value: 'tank_cost' },
  { label: 'Hybrid', value: 'hybrid' },
];

export const FUEL_TYPES: SelectOption[] = [
  { label: 'Diesel', value: 'diesel' },
  { label: 'Gasoline (Regular)', value: 'gasoline_regular' },
  { label: 'Gasoline (Premium)', value: 'gasoline_premium' },
  { label: 'Propane', value: 'propane' },
  { label: 'Kerosene', value: 'kerosene' },
];

export const CUSTOMER_CATEGORIES: SelectOption[] = [
  { label: 'Commercial', value: 'commercial' },
  { label: 'Residential', value: 'residential' },
  { label: 'Government', value: 'government' },
  { label: 'Industrial', value: 'industrial' },
];

export const TENANT_STATUSES = [
  { value: 'active', label: 'Active', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
  { value: 'suspended', label: 'Suspended', color: 'border-red-500/30 bg-red-500/10 text-red-400' },
  { value: 'pending', label: 'Pending', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
] as const;

export const USER_STATUSES = [
  { value: 'active', label: 'Active', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
  { value: 'inactive', label: 'Inactive', color: 'border-border bg-muted/50 text-muted-foreground' },
  { value: 'invited', label: 'Invited', color: 'border-sky-500/30 bg-sky-500/10 text-sky-400' },
] as const;
