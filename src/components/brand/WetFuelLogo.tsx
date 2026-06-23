import { cn } from '@/lib/cn';
import logoFull from '@/assets/Wetfuel_Logo_full.webp';
import logoSymbol from '@/assets/Wetfuel_Black_SYMBOL.webp';

interface WetFuelLogoProps {
  variant?: 'full' | 'symbol';
  className?: string;
}

export function WetFuelLogo({ variant = 'full', className }: WetFuelLogoProps) {
  const src = variant === 'symbol' ? logoSymbol : logoFull;

  return (
    <img
      src={src}
      alt="WetFuel"
      className={cn('object-contain', className)}
      draggable={false}
    />
  );
}
