"use client";

/**
 * components/wedding/scenes/EventsScenes.tsx
 *
 * "Wedding Functions" heading followed by one cinematic scene per entry in
 * weddingData.events (capped at weddingData.maxEvents). Each scene alternates
 * its environment state (animations.eventStateCycle) and reveals in order:
 * number → title → date → countdown → venue → map → buttons.
 */

import { useRef } from "react";
import gsap from "gsap";
import { animations } from "@/config/animations";
import { weddingData, type WeddingEvent } from "@/config/weddingData";
import { eventDisplayLines, visibleEvents } from "@/lib/date/eventDate";
import { revealOnScroll, riseFrom, riseTo } from "@/lib/animations/sceneAnimations";
import { splitVenue } from "@/lib/text/lines";
import { typeStyle } from "@/lib/theme/typeStyle";
import { EventActions } from "../events/EventActions";
import { EventCountdown } from "../events/EventCountdown";
import { EventMap } from "../events/EventMap";
import { SceneWrapper } from "../ui/SceneWrapper";
import { useSceneAnimation } from "../ui/useSceneAnimation";

const STEPS = ["number", "title", "date", "countdown", "venue", "map", "actions"] as const;

function FunctionsHeading() {
  const sectionRef = useRef<HTMLElement>(null);
  useSceneAnimation(sectionRef, (reduced) => {
    revealOnScroll("[data-reveal]", sectionRef.current as HTMLElement, reduced, { start: "top 70%", end: "center 55%" });
  });

  return (
    <SceneWrapper scene="functions" label={weddingData.text.weddingFunctionsTitle} sectionRef={sectionRef} innerClassName="min-h-[70svh] gap-6">
      <span data-reveal aria-hidden className="gold-rule w-20" />
      <h2 data-reveal className="text-burgundy" style={typeStyle("sectionTitle")}>
        {weddingData.text.weddingFunctionsTitle}
      </h2>
      <span data-reveal aria-hidden className="gold-rule w-20" />
    </SceneWrapper>
  );
}

function EventScene({ event, index }: { event: WeddingEvent; index: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { events } = animations;
  const { dateLine, timeLine } = eventDisplayLines(event);
  const scene = animations.eventStateCycle[index % animations.eventStateCycle.length];

  useSceneAnimation(sectionRef, (reduced) => {
    if (reduced) return;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: sectionRef.current, start: events.triggerStart, toggleActions: "play none none none" },
    });
    STEPS.forEach((step, i) => {
      tl.fromTo(`[data-step='${step}']`, riseFrom(), { ...riseTo, duration: events.stepDuration, ease: "power3.out" }, i * (events.stepGap + 0.08));
    });
    gsap.fromTo(
      "[data-number-parallax]",
      { y: events.numberParallax },
      { y: -events.numberParallax, ease: "none", scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: true } },
    );
  });

  return (
    <SceneWrapper scene={scene} label={event.title} sectionRef={sectionRef} innerClassName="gap-8">
      <div data-number-parallax className="flex flex-col items-center gap-2">
        <span data-step="number" aria-hidden className="text-gold" style={typeStyle("eventNumber")}>
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div data-step="title" className="flex flex-col items-center gap-4">
        <h3 className="text-balance text-burgundy" style={typeStyle("eventTitle")}>
          {event.title}
        </h3>
        <span aria-hidden className="gold-rule w-16" />
      </div>

      <p data-step="date" className="flex flex-col text-ink">
        <span style={typeStyle("lead")}>{dateLine}</span>
        <span className="text-ink-soft" style={typeStyle("label")}>
          {timeLine}
        </span>
      </p>

      <div data-step="countdown" className="w-full">
        <EventCountdown event={event} />
      </div>

      <address data-step="venue" className="flex flex-col not-italic text-ink-soft" style={typeStyle("venue")}>
        {splitVenue(event.venue).map((line) => (
          <span key={line}>{line}</span>
        ))}
      </address>

      <div data-step="map" className="w-[86%]">
        <EventMap event={event} />
      </div>

      <div data-step="actions" className="w-full">
        <EventActions event={event} />
      </div>
    </SceneWrapper>
  );
}

export function EventsScenes() {
  return (
    <>
      <FunctionsHeading />
      {visibleEvents().map((event, index) => (
        <EventScene key={event.id} event={event} index={index} />
      ))}
    </>
  );
}
