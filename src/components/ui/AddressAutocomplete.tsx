import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/cn';
import { getGoogleMapsApiKey, loadGooglePlaces } from '@/lib/google-maps';
import type { PlaceLocation } from '@/types/place.types';

export interface AddressSuggestion {
  id: string;
  label: string;
  location: PlaceLocation;
}

interface AddressAutocompleteProps {
  value: PlaceLocation | null;
  onChange: (location: PlaceLocation | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  fallbackSuggestions?: AddressSuggestion[];
  className?: string;
}

function extractPlaceLocation(place: google.maps.places.PlaceResult): PlaceLocation | null {
  const formattedAddress = place.formatted_address;
  const lat = place.geometry?.location?.lat();
  const lng = place.geometry?.location?.lng();
  if (!formattedAddress || lat == null || lng == null) return null;
  return {
    formattedAddress,
    latitude: lat,
    longitude: lng,
    placeId: place.place_id,
  };
}

export function AddressAutocomplete({
  value,
  onChange,
  label = 'Exact Location',
  placeholder = 'Search address on Google Maps...',
  error,
  helperText,
  disabled = false,
  fallbackSuggestions = [],
  className,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value?.formattedAddress ?? '');
  const [googleReady, setGoogleReady] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number } | null>(null);

  const hasApiKey = Boolean(getGoogleMapsApiKey());
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const filteredFallback = fallbackSuggestions.filter((suggestion) => {
    const query = inputValue.trim().toLowerCase();
    if (!query) return true;
    return suggestion.label.toLowerCase().includes(query);
  });

  useEffect(() => {
    setInputValue(value?.formattedAddress ?? '');
  }, [value?.formattedAddress]);

  useEffect(() => {
    if (!hasApiKey || disabled) return;

    let cancelled = false;

    loadGooglePlaces()
      .then(() => {
        if (cancelled || !inputRef.current) return;

        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ['formatted_address', 'geometry', 'place_id', 'name'],
          types: ['geocode', 'establishment'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          const location = extractPlaceLocation(place);
          if (location) {
            setInputValue(location.formattedAddress);
            onChangeRef.current(location);
            setOpen(false);
          }
        });

        autocompleteRef.current = autocomplete;
        setGoogleReady(true);
        setGoogleError(null);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setGoogleError(err.message);
        }
      });

    return () => {
      cancelled = true;
      const instance = autocompleteRef.current;
      if (instance && typeof google !== 'undefined') {
        google.maps.event.clearInstanceListeners(instance);
      }
      autocompleteRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasApiKey, disabled]);

  const updateDropdownPosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownStyle({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (!open || hasApiKey) return;

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
  }, [open, hasApiKey]);

  const handleInputChange = (nextValue: string) => {
    setInputValue(nextValue);
    if (value && nextValue !== value.formattedAddress) {
      onChange(null);
    }
    if (!hasApiKey) {
      setOpen(true);
      updateDropdownPosition();
    }
  };

  const selectFallback = (suggestion: AddressSuggestion) => {
    setInputValue(suggestion.label);
    onChange(suggestion.location);
    setOpen(false);
    setDropdownStyle(null);
  };

  const resolvedHelperText = error
    ? undefined
    : helperText ?? (
      hasApiKey
        ? googleReady
          ? 'Start typing to search Google Maps for the exact equipment location.'
          : 'Loading Google Places...'
        : 'Add VITE_GOOGLE_MAPS_API_KEY for Google autocomplete, or pick from suggested addresses.'
    );

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
            if (!hasApiKey && !disabled) {
              setOpen(true);
              updateDropdownPosition();
            }
          }}
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
      {googleError && !error && (
        <p className="text-sm text-amber-600">{googleError}</p>
      )}
      {resolvedHelperText && !googleError && (
        <p className="text-sm text-gray-500">{resolvedHelperText}</p>
      )}

      {!hasApiKey && open && filteredFallback.length > 0 && dropdownStyle && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[300] max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          style={{ top: dropdownStyle.top, left: dropdownStyle.left, width: dropdownStyle.width }}
        >
          {filteredFallback.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              className="flex w-full cursor-pointer items-start gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectFallback(suggestion)}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <span>{suggestion.label}</span>
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}
