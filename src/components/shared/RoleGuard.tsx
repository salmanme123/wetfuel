import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { state } = useAuth();
  if (!state.user || !allowedRoles.includes(state.user.role)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
