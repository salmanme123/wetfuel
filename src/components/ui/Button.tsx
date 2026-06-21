import { type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary/50',
  outline: 'border border-border bg-transparent text-foreground shadow-xs hover:bg-accent focus:ring-ring/50',
  ghost: 'text-muted-foreground hover:bg-accent hover:text-foreground focus:ring-ring/50',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50',
};

const sizes = {
  sm: 'h-8 px-3 text-sm rounded-md',
  md: 'h-9 px-4 text-sm rounded-md',
  lg: 'h-10 px-6 text-sm rounded-md',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
