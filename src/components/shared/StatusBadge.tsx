import { cn } from '@/lib/cn';
import { JOB_STATUSES, TENANT_STATUSES, USER_STATUSES, JOB_PRIORITIES } from '@/lib/constants';

type StatusType = 'job' | 'tenant' | 'user' | 'priority';

interface StatusBadgeProps {
  status: string;
  type: StatusType;
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  let config: { label: string; color: string } | undefined;

  switch (type) {
    case 'job':
      config = JOB_STATUSES.find((s) => s.value === status);
      break;
    case 'tenant':
      config = TENANT_STATUSES.find((s) => s.value === status);
      break;
    case 'user':
      config = USER_STATUSES.find((s) => s.value === status);
      break;
    case 'priority':
      config = JOB_PRIORITIES.find((s) => s.value === status);
      break;
  }

  if (!config) {
    return <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">{status}</span>;
  }

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.color)}>
      {config.label}
    </span>
  );
}
