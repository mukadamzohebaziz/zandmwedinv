"use client";

/**
 * components/wedding/events/EventActions.tsx
 *
 * "Add to Calendar" (downloads an .ics generated from the event) and
 * "Get Directions" (Google Maps directions to `event.mapQuery`).
 * Burgundy text on an ivory surface with a fine gold border; 48px tall.
 */

import { CalendarPlus, Navigation } from "lucide-react";
import { weddingData, type WeddingEvent } from "@/config/weddingData";
import { downloadCalendarEvent } from "@/lib/calendar/createCalendarEvent";
import { createDirectionsUrl } from "@/lib/maps/createDirectionsUrl";
import { typeStyle } from "@/lib/theme/typeStyle";

const buttonClass =
  "flex min-h-12 flex-1 items-center justify-center gap-2 border border-gold-line bg-ivory-light px-3 text-burgundy transition-colors duration-300 hover:border-gold hover:bg-paper active:scale-[0.98]";

export function EventActions({ event }: { event: WeddingEvent }) {
  return (
    <div className="flex w-full gap-3">
      <button type="button" onClick={() => downloadCalendarEvent(event)} className={buttonClass} style={typeStyle("button")}>
        <CalendarPlus className="size-4" aria-hidden />
        {weddingData.text.buttons.addToCalendar}
      </button>
      <a
        href={createDirectionsUrl(event.mapQuery)}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
        style={typeStyle("button")}
      >
        <Navigation className="size-4" aria-hidden />
        {weddingData.text.buttons.getDirections}
      </a>
    </div>
  );
}
