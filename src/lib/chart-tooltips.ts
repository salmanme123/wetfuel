import type { ChartTooltipContext } from '@/components/charts';
import { formatCurrency, formatGallons } from './format';

export function deliveryDayTooltip({ category, value }: ChartTooltipContext): string {
  const noun = value === 1 ? 'delivery' : 'deliveries';
  return `${category}\n${value} completed fuel ${noun}`;
}

export function monthlyRevenueTooltip({ category, value }: ChartTooltipContext): string {
  return `${category} 2026\n${formatCurrency(value)} in fuel delivery revenue`;
}

export function fuelTypeVolumeTooltip({ category, value, data }: ChartTooltipContext): string {
  const pct = data.percentage;
  const share = pct !== undefined ? ` · ${pct}% of total volume` : '';
  return `${category}\n${formatGallons(value)} delivered${share}`;
}
