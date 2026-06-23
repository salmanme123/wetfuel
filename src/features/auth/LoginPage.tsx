import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { WetFuelLogo } from '@/components/brand/WetFuelLogo';
import { Building2, Map, Truck } from 'lucide-react';
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 50% at 20% -10%, oklch(0.62 0.24 27 / 0.08), transparent 60%), radial-gradient(ellipse 60% 40% at 100% 110%, oklch(0.62 0.24 27 / 0.04), transparent 60%)',
      }} />

      <div className="relative z-10 mb-8 flex flex-col items-center gap-3">
        <WetFuelLogo variant="full" className="h-14 w-auto max-w-xs" />
        <p className="text-sm text-muted-foreground">Digital Solution Ecosystem</p>
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold text-foreground">Select a Role to Continue</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a demo role to explore the platform
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {roles.map(({ role, label, description, icon: Icon }) => (
            <button
              key={role}
              onClick={() => handleRoleSelect(role)}
              className="group flex cursor-pointer flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:border-primary/50 hover:shadow-[0_0_24px_oklch(0.62_0.24_27_/_0.12)]"
            >
              <div className="rounded-lg bg-primary/15 p-3 transition-colors group-hover:bg-primary/25">
                <Icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{label}</h3>
              <p className="mt-2 text-xs text-muted-foreground">{description}</p>
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          This is a demo environment with mock data. No real authentication required.
        </p>
      </div>
    </div>
  );
}
