import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/cn';
import { searchMockPlaceSuggestions, type MockPlaceSuggestion } from '@/mock/places.mock';
import type { PlaceLocation } from '@/types/place.types';

interface AddressAutocompleteProps {
  value: PlaceLocation | null;
  onChange: (location: PlaceLocation | null) => void;
  customerId?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.trim().length);
  const after = text.slice(idx + query.trim().length);
  return (
    <>
      {before}
      <span className="font-semibold text-gray-900">{match}</span>
      {after}
    </>
  );
}

export function AddressAutocomplete({
  value,
  onChange,
  customerId = '',
  label = 'Exact Location',
  placeholder = 'Search address on Google Maps...',
  error,
  helperText,
  disabled = false,
  className,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState(value?.formattedAddress ?? '');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number } | null>(null);

  const suggestions = useMemo(() => {
    if (!customerId) return [];
    return searchMockPlaceSuggestions(customerId, inputValue);
  }, [customerId, inputValue]);

  useEffect(() => {
    setInputValue(value?.formattedAddress ?? '');
  }, [value?.formattedAddress]);

  const updateDropdownPosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownStyle({
      top: rect.bottom + 2,
      left: rect.left,
      width: rect.width,
    });
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
      setOpen(false);
      setDropdownStyle(null);
      setActiveIndex(-1);
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

  const handleInputChange = (nextValue: string) => {
    setInputValue(nextValue);
    if (value && nextValue !== value.formattedAddress) {
      onChange(null);
    }
    if (!disabled && customerId) {
      setOpen(true);
      setLoading(true);
      setActiveIndex(-1);
      updateDropdownPosition();
      window.setTimeout(() => setLoading(false), 180);
    }
  };

  const selectSuggestion = (suggestion: MockPlaceSuggestion) => {
    setInputValue(suggestion.location.formattedAddress);
    onChange(suggestion.location);
    setOpen(false);
    setDropdownStyle(null);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]!);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const resolvedHelperText = error
    ? undefined
    : helperText ?? (
      customerId
        ? 'Search like Google Maps — type an address or pick a suggested location.'
        : 'Select a customer first, then search for the exact equipment location.'
    );

  const showDropdown = open && customerId && !disabled && dropdownStyle;

  return (
    <div ref={containerRef} className={cn('space-y-1', className)}>
      {label && (
        <label htmlFor="address-autocomplete" className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          id="address-autocomplete"
          type="text"
          value={inputValue}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (!disabled && customerId) {
              setOpen(true);
              updateDropdownPosition();
            }
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            'block w-full rounded-lg border py-2 pl-9 pr-3 text-sm shadow-sm transition-colors',
            'focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
            'placeholder:text-gray-400',
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300',
            disabled && 'cursor-not-allowed bg-gray-50 text-gray-500',
          )}
        />
      </div>

      {value && (
        <p className="text-xs text-gray-500">
          GPS: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {resolvedHelperText && <p className="text-sm text-gray-500">{resolvedHelperText}</p>}

      {showDropdown && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[300] overflow-hidden rounded-sm border border-gray-200 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
          style={{ top: dropdownStyle.top, left: dropdownStyle.left, width: dropdownStyle.width }}
        >
          {loading ? (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-gray-500">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500" />
              Searching places...
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-3 py-3 text-sm text-gray-500">
              No places found. Try a street name or city.
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.id}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full cursor-pointer items-start gap-3 px-3 py-2.5 text-left transition-colors',
                      index === activeIndex ? 'bg-gray-100' : 'hover:bg-gray-50',
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.75} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-gray-800">
                        {highlightMatch(suggestion.primaryText, inputValue)}
                      </span>
                      <span className="block truncate text-xs text-gray-500">
                        {suggestion.secondaryText}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-end border-t border-gray-100 px-3 py-1.5">
            <span className="text-[10px] tracking-wide text-gray-400">
              powered by{' '}
              <span className="font-medium">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#4285F4]">g</span>
                <span className="text-[#34A853]">l</span>
                <span className="text-[#EA4335]">e</span>
              </span>
            </span>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
