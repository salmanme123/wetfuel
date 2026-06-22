import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ROLES } from '@/lib/constants';
import { ChevronDown, LogOut, RefreshCw } from 'lucide-react';
import type { UserRole } from '@/types';

const roleVariants: Record<UserRole, 'info' | 'success' | 'warning'> = {
  corporate_super_admin: 'info',
  master_franchise_admin: 'warning',
  franchise_admin: 'success',
};

export function UserMenu() {
  const { state, switchRole, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
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

  if (!state.user) return null;

  const allRoles: UserRole[] = ['corporate_super_admin', 'master_franchise_admin', 'franchise_admin'];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 hover:bg-accent"
      >
        <Avatar firstName={state.user.firstName} lastName={state.user.lastName} size="sm" />
        <div className="hidden text-left md:block">
          <p className="text-sm font-medium text-foreground">
            {state.user.firstName} {state.user.lastName}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-card text-foreground shadow-2xl">
          <div className="border-b border-border p-4">
            <p className="font-medium text-foreground">
              {state.user.firstName} {state.user.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{state.user.email}</p>
            <Badge variant={roleVariants[state.user.role]} className="mt-2">
              {ROLES[state.user.role]}
            </Badge>
          </div>

          <div className="border-b border-border p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <RefreshCw className="h-3 w-3" /> Switch Role (Demo)
            </p>
            {allRoles.map((role) => (
              <button
                key={role}
                onClick={() => { switchRole(role); setIsOpen(false); }}
                className={`w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  state.user?.role === role ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {ROLES[role]}
              </button>
            ))}
          </div>

          <div className="p-2">
            <button
              onClick={() => { logout(); setIsOpen(false); }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
