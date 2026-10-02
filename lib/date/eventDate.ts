/**
 * lib/date/eventDate.ts
 *
 * Timezone-safe helpers for wedding events.
 *
 * `event.date` is written as the venue's local wall-clock time. We append the
 * configured venue offset (weddingData.timezone.offset) so the resulting
 * instant is identical for every guest, regardless of their device timezone.
 *
 * Used by: DateRevealScene (day / month / year), EventScene (two display
 * lines), EventCountdown (remaining time), createCalendarEvent (.ics UTC
 * times) and StructuredData (ISO dates with offset).
 */

import { weddingData, type WeddingEvent } from "@/config/weddingData";

export function eventIsoWithOffset(event: WeddingEvent): string {
  return `${event.date}${weddingData.timezone.offset}`;
}

export function eventInstant(event: WeddingEvent): Date {
  return new Date(eventIsoWithOffset(event));
}

/** Day / month / year formatted in the venue's timezone (deterministic on server and client). */
export function eventDateParts(event: WeddingEvent) {
  const instant = eventInstant(event);
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: weddingData.timezone.iana, ...options }).format(instant);

  return {
    day: format({ day: "numeric" }),
    month: format({ month: "long" }),
    year: format({ year: "numeric" }),
  };
}

/** Splits "27 Dec 2026, 11:00 AM onwards" into its date line and time line. */
export function eventDisplayLines(event: WeddingEvent) {
  const [dateLine, ...rest] = event.displayDate.split(",");
  return { dateLine: dateLine.trim(), timeLine: rest.join(",").trim() };
}

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  arrived: boolean;
};

export function countdownTo(event: WeddingEvent, now: number): CountdownParts {
  const diff = eventInstant(event).getTime() - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, arrived: true };

  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    arrived: false,
  };
}

/** The events actually rendered (capped at weddingData.maxEvents). */
export function visibleEvents(): WeddingEvent[] {
  return weddingData.events.slice(0, weddingData.maxEvents);
}
