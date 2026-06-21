import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { mockTenants } from '@/mock';
import { Badge } from '@/components/ui/Badge';
import { Building2, ChevronDown, Check } from 'lucide-react';

export function TenantSwitcher() {
  const { state } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTenantId, setActiveTenantId] = useState('tenant-001');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (state.user?.role !== 'corporate_super_admin') return null;

  const activeTenant = mockTenants.find((t) => t.id === activeTenantId);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm shadow-xs hover:bg-accent"
      >
        <Building2 className="h-4 w-4 text-primary" />
        <span className="font-medium text-foreground">{activeTenant?.companyName ?? 'Select Tenant'}</span>
        <Badge variant="info" className="text-[0.55rem]">{activeTenant?.tenantCode}</Badge>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-border bg-card shadow-2xl">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Operating as Tenant</p>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {mockTenants.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => { setActiveTenantId(tenant.id); setIsOpen(false); }}
                className={`flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  activeTenantId === tenant.id ? 'bg-primary/15 text-primary' : 'hover:bg-accent text-foreground'
                }`}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: tenant.branding.primaryColor }}
                />
                <div className="flex-1">
                  <p className="font-medium">{tenant.companyName}</p>
                  <p className="text-xs text-muted-foreground">{tenant.tenantCode} — {tenant.franchiseCount} franchises</p>
                </div>
                {activeTenantId === tenant.id && <Check className="h-4 w-4 text-primary" />}
                {tenant.status === 'suspended' && <Badge variant="error">Suspended</Badge>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
