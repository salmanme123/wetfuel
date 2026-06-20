import type { SelectOption } from '@/types';

export const ROLES: Record<string, string> = {
  corporate_super_admin: 'Corporate Super Admin',
  master_franchise_admin: 'Master Franchise Admin',
  franchise_admin: 'Franchise Admin',
};

export const JOB_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'assigned', label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-orange-100 text-orange-700' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
] as const;

export const JOB_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-600' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-600' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-600' },
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
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
  { value: 'suspended', label: 'Suspended', color: 'bg-red-100 text-red-700' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
] as const;

export const USER_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-700' },
  { value: 'invited', label: 'Invited', color: 'bg-blue-100 text-blue-700' },
] as const;
