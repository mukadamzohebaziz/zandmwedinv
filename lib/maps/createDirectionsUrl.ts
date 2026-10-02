/**
 * lib/maps/createDirectionsUrl.ts
 *
 * Builds a universal Google Maps directions link from `event.mapQuery`.
 * On phones this opens the Google Maps app (or the browser) with the venue
 * as destination and the guest's current location as origin.
 * Consumed by components/wedding/ui/DirectionsButton.tsx.
 */

export function createDirectionsUrl(query: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}
