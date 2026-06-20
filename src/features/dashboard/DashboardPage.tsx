import { useAuth } from '@/hooks/useAuth';
import { CorporateDashboard } from './components/CorporateDashboard';
import { MasterFranchiseDashboard } from './components/MasterFranchiseDashboard';
import { FranchiseDashboard } from './components/FranchiseDashboard';

export function DashboardPage() {
  const { state } = useAuth();

  switch (state.user?.role) {
    case 'corporate_super_admin':
      return <CorporateDashboard />;
    case 'master_franchise_admin':
      return <MasterFranchiseDashboard />;
    case 'franchise_admin':
      return <FranchiseDashboard />;
    default:
      return null;
  }
}
