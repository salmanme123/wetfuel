import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { Fuel, Building2, Map, Truck } from 'lucide-react';
import type { UserRole } from '@/types';

const roles: { role: UserRole; label: string; description: string; icon: typeof Building2 }[] = [
  {
    role: 'corporate_super_admin',
    label: 'Corporate Super Admin',
    description: 'Full platform access — manage tenants, franchises, and network-wide operations',
    icon: Building2,
  },
  {
    role: 'master_franchise_admin',
    label: 'Master Franchise Admin',
    description: 'Regional management — oversee franchises, pricing, and compliance in your territory',
    icon: Map,
  },
  {
    role: 'franchise_admin',
    label: 'Franchise Admin',
    description: 'Daily operations — manage drivers, customers, jobs, dispatch, and fuel inventory',
    icon: Truck,
  },
];

export function LoginPage() {
  const { state, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [state.isAuthenticated, navigate]);

  const handleRoleSelect = (role: UserRole) => {
    login(role);
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-fuel-50 p-4">
      <div className="mb-8 flex items-center gap-3">
        <Fuel className="h-12 w-12 text-brand-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WetFuel</h1>
          <p className="text-sm text-gray-500">Digital Solution Ecosystem</p>
        </div>
      </div>

      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Select a Role to Continue</h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose a demo role to explore the platform
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {roles.map(({ role, label, description, icon: Icon }) => (
            <button
              key={role}
              onClick={() => handleRoleSelect(role)}
              className="group flex flex-col items-center rounded-xl border-2 border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:border-brand-500 hover:shadow-md"
            >
              <div className="rounded-lg bg-brand-100 p-3 transition-colors group-hover:bg-brand-200">
                <Icon className="h-8 w-8 text-brand-600" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-gray-900">{label}</h3>
              <p className="mt-2 text-xs text-gray-500">{description}</p>
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          This is a demo environment with mock data. No real authentication required.
        </p>
      </div>
    </div>
  );
}
