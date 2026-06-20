export type UserRole = 'corporate_super_admin' | 'master_franchise_admin' | 'franchise_admin';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  organizationId: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}
