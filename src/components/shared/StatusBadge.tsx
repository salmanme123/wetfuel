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
    return <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2.5 py-1 font-mono text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">{status}</span>;
  }

  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[0.68rem] font-medium uppercase tracking-[0.18em]', config.color)}>
      {config.label}
    </span>
  );
}
