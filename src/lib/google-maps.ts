import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

let initialized = false;
let placesPromise: Promise<google.maps.PlacesLibrary> | null = null;

export function getGoogleMapsApiKey(): string | undefined {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || undefined;
}

export function loadGooglePlaces(): Promise<google.maps.PlacesLibrary> {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key is not configured'));
  }

  if (!placesPromise) {
    if (!initialized) {
      setOptions({ key: apiKey, v: 'weekly' });
      initialized = true;
    }
    placesPromise = importLibrary('places');
  }

  return placesPromise;
}
