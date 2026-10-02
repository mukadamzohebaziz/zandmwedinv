/**
 * lib/maps/createMapUrl.ts
 *
 * Builds the Google Maps embed URL for an event from `event.mapEmbedQuery`.
 * Uses the key-less `output=embed` endpoint so no API credentials are needed.
 * Consumed by components/wedding/ui/MapEmbed.tsx.
 */

export function createMapUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}
