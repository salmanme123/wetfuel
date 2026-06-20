import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { canAccessRoute } from '@/lib/role-permissions';

export function ProtectedRoute() {
  const { state } = useAuth();
  const location = useLocation();

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessRoute(state.user!.role, location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
