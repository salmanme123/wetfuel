import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { SelectOption } from '@/types';

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  searchPlaceholder?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  className,
  searchPlaceholder = 'Search...',
}: SearchableSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number } | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const updateDropdownPosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownStyle({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  };

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter((opt) =>
      `${opt.label} ${opt.badge ?? ''}`.toLowerCase().includes(query),
    );
  }, [options, search]);

  const closeDropdown = () => {
    setOpen(false);
    setSearch('');
    setDropdownStyle(null);
  };

  useEffect(() => {
    if (!open) return;

    updateDropdownPosition();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      closeDropdown();
    };

    const handleReposition = () => updateDropdownPosition();

    document.addEventListener('click', handleClickOutside, true);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    closeDropdown();
  };

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onChange('');
    closeDropdown();
  };

  const toggleOpen = () => {
    setOpen((prev) => {
      if (prev) {
        setSearch('');
        setDropdownStyle(null);
        return false;
      }
      updateDropdownPosition();
      return true;
    });
  };

  const renderOptionContent = (opt: SelectOption, selected = false) => (
    <span className="flex min-w-0 items-center gap-2">
      <span className={cn('truncate', selected && 'font-medium')}>{opt.label}</span>
      {opt.badge && (
        <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {opt.badge}
        </span>
      )}
    </span>
  );

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
      )}
      <div
        className={cn(
          'flex w-full items-center rounded-lg border border-border bg-card shadow-sm transition-colors',
          'focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500',
        )}
      >
        <button
          type="button"
          onClick={toggleOpen}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-foreground"
        >
          {selectedOption ? (
            renderOptionContent(selectedOption, true)
          ) : (
            <span className="truncate text-muted-foreground/60">{placeholder}</span>
          )}
        </button>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 cursor-pointer rounded p-1 text-muted-foreground/60 hover:text-muted-foreground"
            aria-label="Clear selection"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={toggleOpen}
          className="shrink-0 cursor-pointer px-2 py-2 text-muted-foreground/60"
          aria-label="Toggle options"
        >
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
        </button>
      </div>

      {open && dropdownStyle && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropdownStyle.top,
            left: dropdownStyle.left,
            width: dropdownStyle.width,
          }}
          className="z-[200] overflow-hidden rounded-lg border border-border bg-card text-foreground shadow-xl"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="border-b border-border/50 p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect('')}
                className={cn(
                  'w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground hover:bg-muted/50',
                  !value && 'bg-primary/10 font-medium text-primary',
                )}
              >
                {placeholder}
              </button>
            </li>
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-muted-foreground">No results found</li>
            ) : (
              filteredOptions.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      'w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground hover:bg-muted/50',
                      value === opt.value && 'bg-primary/10 text-primary',
                    )}
                  >
                    {renderOptionContent(opt, value === opt.value)}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>,
        document.body,
      )}
    </div>
  );
}
