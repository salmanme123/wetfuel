import { mockCustomers } from './customers.mock';
import type { PlaceLocation } from '@/types';

export interface MockPlaceSuggestion {
  id: string;
  customerId: string;
  siteId?: string;
  primaryText: string;
  secondaryText: string;
  location: PlaceLocation;
}

/** Demo-only address data — styled like Google Places until live API is wired up. */
const EXTRA_SPOTS: Omit<MockPlaceSuggestion, 'customerId'>[] = [
  {
    id: 'spot-yard-gate',
    primaryText: 'Main Gate / Delivery Entrance',
    secondaryText: 'Near loading dock',
    location: {
      formattedAddress: 'Main Gate, 1200 Industrial Pkwy, Dallas, TX 75201',
      latitude: 32.7769,
      longitude: -96.7968,
      placeId: 'demo-gate-001',
    },
  },
  {
    id: 'spot-gen-pad',
    primaryText: 'Generator Pad — Building C',
    secondaryText: '1200 Industrial Pkwy, Dallas, TX 75201',
    location: {
      formattedAddress: 'Generator Pad, Building C, 1200 Industrial Pkwy, Dallas, TX 75201',
      latitude: 32.7765,
      longitude: -96.7972,
      placeId: 'demo-gen-001',
    },
  },
  {
    id: 'spot-fuel-island',
    primaryText: 'Fuel Island #2',
    secondaryText: '2400 Freight Rd, Houston, TX 77029',
    location: {
      formattedAddress: 'Fuel Island #2, 2400 Freight Rd, Houston, TX 77029',
      latitude: 29.7358,
      longitude: -95.2402,
      placeId: 'demo-island-001',
    },
  },
  {
    id: 'spot-emergency-gen',
    primaryText: 'Emergency Generator Bank — East Wing',
    secondaryText: '500 Health Way, Dallas, TX 75235',
    location: {
      formattedAddress: 'Emergency Generator Bank, East Wing, 500 Health Way, Dallas, TX 75235',
      latitude: 32.8123,
      longitude: -96.8598,
      placeId: 'demo-emergency-001',
    },
  },
];

function siteToSuggestion(
  customerId: string,
  site: (typeof mockCustomers)[0]['sites'][0],
): MockPlaceSuggestion {
  const secondaryText = `${site.city}, ${site.state} ${site.zipCode}, USA`;
  return {
    id: site.id,
    customerId,
    siteId: site.id,
    primaryText: site.address,
    secondaryText,
    location: {
      formattedAddress: `${site.address}, ${site.city}, ${site.state} ${site.zipCode}`,
      latitude: site.latitude,
      longitude: site.longitude,
      placeId: site.id,
    },
  };
}

function siteNamedSpot(
  customerId: string,
  site: (typeof mockCustomers)[0]['sites'][0],
  suffix: string,
  latOffset: number,
  lngOffset: number,
): MockPlaceSuggestion {
  const secondaryText = `${site.name} · ${site.city}, ${site.state}`;
  return {
    id: `${site.id}-${suffix}`,
    customerId,
    siteId: site.id,
    primaryText: `${site.name} — ${suffix}`,
    secondaryText,
    location: {
      formattedAddress: `${suffix}, ${site.address}, ${site.city}, ${site.state} ${site.zipCode}`,
      latitude: site.latitude + latOffset,
      longitude: site.longitude + lngOffset,
      placeId: `${site.id}-${suffix}`,
    },
  };
}

const generatedSpots: MockPlaceSuggestion[] = mockCustomers.flatMap((customer) =>
  customer.sites.flatMap((site) => [
    siteToSuggestion(customer.id, site),
    siteNamedSpot(customer.id, site, 'Equipment Yard', 0.0003, -0.0002),
    siteNamedSpot(customer.id, site, 'Fuel Storage Area', -0.0002, 0.0003),
  ]),
);

const linkedExtras: MockPlaceSuggestion[] = EXTRA_SPOTS.flatMap((spot) => {
  const match = generatedSpots.find((s) =>
    s.location.formattedAddress.includes(spot.secondaryText.split(',')[0]?.trim() ?? '___'),
  );
  if (!match) return [];
  return [{ ...spot, customerId: match.customerId, siteId: match.siteId }];
});

export const mockPlaceSuggestions: MockPlaceSuggestion[] = [
  ...generatedSpots,
  ...linkedExtras,
];

export function getMockPlaceSuggestions(customerId: string): MockPlaceSuggestion[] {
  if (!customerId) return [];
  return mockPlaceSuggestions.filter((s) => s.customerId === customerId);
}

export function searchMockPlaceSuggestions(
  customerId: string,
  query: string,
): MockPlaceSuggestion[] {
  const normalized = query.trim().toLowerCase();
  const pool = getMockPlaceSuggestions(customerId);
  if (!normalized) return pool.slice(0, 8);
  return pool
    .filter((s) =>
      `${s.primaryText} ${s.secondaryText} ${s.location.formattedAddress}`
        .toLowerCase()
        .includes(normalized),
    )
    .slice(0, 8);
}
