import type { UserRole } from './auth.types';

export interface UserProfile {
  id: string;
  tenantId: string;
  organizationId: string;
  organizationName: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'invited';
  avatarUrl?: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}
