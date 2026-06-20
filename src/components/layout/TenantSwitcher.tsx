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
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-gray-50"
      >
        <Building2 className="h-4 w-4 text-brand-600" />
        <span className="font-medium text-gray-700">{activeTenant?.companyName ?? 'Select Tenant'}</span>
        <Badge variant="info" className="text-[10px]">{activeTenant?.tenantCode}</Badge>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase text-gray-400">Operating as Tenant</p>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {mockTenants.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => { setActiveTenantId(tenant.id); setIsOpen(false); }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  activeTenantId === tenant.id ? 'bg-brand-50 text-brand-700' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: tenant.branding.primaryColor }}
                />
                <div className="flex-1">
                  <p className="font-medium">{tenant.companyName}</p>
                  <p className="text-xs text-gray-500">{tenant.tenantCode} — {tenant.franchiseCount} franchises</p>
                </div>
                {activeTenantId === tenant.id && <Check className="h-4 w-4 text-brand-600" />}
                {tenant.status === 'suspended' && <Badge variant="error">Suspended</Badge>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
