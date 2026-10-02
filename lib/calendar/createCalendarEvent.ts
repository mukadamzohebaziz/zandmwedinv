/**
 * lib/calendar/createCalendarEvent.ts
 *
 * Generates a standards-compliant .ics (iCalendar) file for one event.
 *
 * Triggered by CalendarButton on click. Reads `event.title`, `event.date`,
 * `event.venue` and the couple names from config/weddingData.ts, plus the
 * production URL from config/site.ts. Times are written in UTC (…Z) after
 * applying the venue offset, so the entry lands at the correct local time in
 * every guest's calendar app.
 *
 * `downloadCalendarEvent` creates a Blob URL, clicks a temporary anchor and
 * revokes the URL afterwards (cleanup) so nothing leaks.
 */

import { siteConfig } from "@/config/site";
import { weddingData, type WeddingEvent } from "@/config/weddingData";
import { eventInstant } from "@/lib/date/eventDate";

const pad = (value: number) => String(value).padStart(2, "0");

function toIcsUtc(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

/** Escapes characters that are special in iCalendar text values. */
function escapeIcs(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function toTitleCase(value: string): string {
  return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export function createCalendarEvent(event: WeddingEvent): string {
  const start = eventInstant(event);
  const end = new Date(start.getTime() + weddingData.calendarDurationHours * 3600 * 1000);
  const { partnerOne, partnerTwo } = weddingData.couple;
  const summary = `${toTitleCase(event.title)} — ${partnerOne} & ${partnerTwo}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}-${start.getTime()}@${new URL(siteConfig.url).hostname}`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `LOCATION:${escapeIcs(event.venue)}`,
    `DESCRIPTION:${escapeIcs(weddingData.text.calendarDescription)}`,
    `URL:${siteConfig.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function calendarFileName(event: WeddingEvent): string {
  return `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
}

export function downloadCalendarEvent(event: WeddingEvent): void {
  const blob = new Blob([createCalendarEvent(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = calendarFileName(event);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
