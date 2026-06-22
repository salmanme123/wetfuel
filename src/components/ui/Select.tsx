import { type SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';
import type { SelectOption } from '@/types';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={selectId} className="block cursor-pointer text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'block h-9 w-full rounded-md border bg-card px-3 py-1 text-sm text-foreground shadow-xs transition-colors',
            'focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/50',
            error ? 'border-red-500' : 'border-input',
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
