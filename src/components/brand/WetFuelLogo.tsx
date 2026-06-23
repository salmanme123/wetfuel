import { cn } from '@/lib/cn';
import logoFull from '@/assets/Wetfuel_Logo_full.webp';
import logoSymbol from '@/assets/Wetfuel_Black_SYMBOL.webp';

interface WetFuelLogoProps {
  variant?: 'full' | 'symbol';
  className?: string;
}

export function WetFuelLogo({ variant = 'full', className }: WetFuelLogoProps) {
  const src = variant === 'symbol' ? logoSymbol : logoFull;
  const isSymbol = variant === 'symbol';

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        'rounded-lg bg-[oklch(10%_0_0)]',
        isSymbol ? 'p-1.5' : 'px-2.5 py-1.5',
        'dark:bg-transparent dark:p-0',
      )}
    >
      <img
        src={src}
        alt="WetFuel"
        className={cn('object-contain', className)}
        draggable={false}
      />
    </span>
  );
}
