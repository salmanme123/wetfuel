import { cn } from '@/lib/cn';

const variantClasses = {
  default: 'border-border bg-muted/50 text-muted-foreground',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  error: 'border-red-500/30 bg-red-500/10 text-red-400',
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variantClasses;
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[0.68rem] font-medium uppercase tracking-[0.18em]',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
