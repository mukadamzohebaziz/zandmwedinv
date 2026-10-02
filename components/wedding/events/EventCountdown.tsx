"use client";

/**
 * components/wedding/events/EventCountdown.tsx
 *
 * Live countdown to `event.date`, interpreted in the venue timezone
 * (lib/date/eventDate.ts). Renders placeholders on the server and first paint
 * so hydration never mismatches, then ticks every animations.countdown.tickMs.
 * Once the moment passes it shows weddingData.text.countdown.arrived.
 */

import { useEffect, useState } from "react";
import { animations } from "@/config/animations";
import { weddingData, type WeddingEvent } from "@/config/weddingData";
import { countdownTo, type CountdownParts } from "@/lib/date/eventDate";
import { typeStyle } from "@/lib/theme/typeStyle";

const UNITS = ["days", "hours", "minutes", "seconds"] as const;

export function EventCountdown({ event }: { event: WeddingEvent }) {
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    const update = () => setParts(countdownTo(event, Date.now()));
    update();
    const id = window.setInterval(update, animations.countdown.tickMs);
    return () => window.clearInterval(id);
  }, [event]);

  if (parts?.arrived) {
    return (
      <p className="text-burgundy" style={typeStyle("eventTitle")}>
        {weddingData.text.countdown.arrived}
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-ink-soft" style={typeStyle("eyebrow")}>
        {event.countdownLabel}
      </p>
      <dl className="grid w-full grid-cols-4 border-y border-gold-line" role="timer" aria-live="off">
        {UNITS.map((unit, i) => (
          <div key={unit} className={`flex flex-col-reverse items-center gap-1 py-4 ${i > 0 ? "border-l border-gold-line" : ""}`}>
            <dt className="text-ink-soft" style={typeStyle("label")}>
              {weddingData.text.countdown[unit]}
            </dt>
            <dd className="tabular-nums text-burgundy" style={typeStyle("countdownValue")}>
              {parts ? String(parts[unit]).padStart(2, "0") : "--"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
