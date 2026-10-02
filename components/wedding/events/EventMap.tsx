/**
 * components/wedding/events/EventMap.tsx
 *
 * Google Maps embed generated from `event.mapEmbedQuery`. Framed as a slim
 * arched window (echoing the architecture) with the palette-matched filter
 * from config/theme.ts so it belongs to the scene rather than reading as a card.
 */

import { theme } from "@/config/theme";
import { weddingData, type WeddingEvent } from "@/config/weddingData";
import { createMapUrl } from "@/lib/maps/createMapUrl";

export function EventMap({ event }: { event: WeddingEvent }) {
  return (
    <div className="w-full border border-gold-line bg-ivory-light p-1.5" style={{ borderRadius: "999px 999px 6px 6px" }}>
      <iframe
        src={createMapUrl(event.mapEmbedQuery)}
        title={`${weddingData.text.mapTitlePrefix} ${event.title.toLowerCase()}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block aspect-[4/5] w-full border-0"
        style={{ borderRadius: "999px 999px 4px 4px", filter: theme.map.filter }}
      />
    </div>
  );
}
