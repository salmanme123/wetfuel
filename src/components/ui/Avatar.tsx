import { cn } from '@/lib/cn';
import { getInitials } from '@/lib/format';

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

interface AvatarProps {
  firstName: string;
  lastName: string;
  src?: string;
  size?: keyof typeof sizes;
  className?: string;
}

export function Avatar({ firstName, lastName, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        className={cn('rounded-full object-cover', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-primary/15 font-medium text-primary',
        sizes[size],
        className,
      )}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}
