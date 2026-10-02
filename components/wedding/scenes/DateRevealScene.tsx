"use client";

/**
 * components/wedding/scenes/DateRevealScene.tsx
 *
 * "Tap to reveal the date" over the 3D medallion. The medallion itself lives
 * in the shared canvas and tracks the anchor element registered here
 * (lib/animations/medallionAnimation.ts). On tap: medallion turns and lifts
 * toward the viewer, the anchor settles smaller, then the date — taken from
 * weddingData.events[0] — becomes the focal point.
 *
 * There is no 2D stand-in: only medallion.glb is ever drawn here. Load or
 * WebGL failures surface through components/three/ThreeDError.tsx.
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animations } from "@/config/animations";
import { weddingData } from "@/config/weddingData";
import { eventDateParts, eventDisplayLines } from "@/lib/date/eventDate";
import { medallionMotion, revealMedallion, setMedallionAnchor } from "@/lib/animations/medallionAnimation";
import { riseFrom, riseTo } from "@/lib/animations/sceneAnimations";
import { setExperience, useExperience } from "@/lib/store/experienceStore";
import { typeStyle } from "@/lib/theme/typeStyle";
import { SceneWrapper } from "../ui/SceneWrapper";
import { useSceneAnimation } from "../ui/useSceneAnimation";

const firstEvent = weddingData.events[0];

export function DateRevealScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const revealed = useExperience((s) => s.dateRevealed);

  const { reduced } = useSceneAnimation(sectionRef, (isReduced) => {
    if (isReduced) return;
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        medallionMotion.tilt = (self.progress - 0.5) * 2 * animations.threeD.medallionScrollTilt;
      },
    });
  });

  const { day, month, year } = eventDateParts(firstEvent);
  const { timeLine } = eventDisplayLines(firstEvent);
  const d = animations.dateReveal;

  useEffect(() => {
    medallionMotion.reveal = 0;
    setMedallionAnchor(anchorRef.current);
    return () => setMedallionAnchor(null);
  }, []);

  const reveal = () => {
    if (revealed) return;
    setExperience({ dateRevealed: true });
    const section = sectionRef.current;
    if (!section) return;
    const q = gsap.utils.selector(section);
    const duration = reduced ? animations.reducedMotion.fadeDuration : animations.threeD.medallionRevealDuration;

    gsap.to(q("[data-prompt]"), { opacity: 0, y: 8, duration: d.promptFadeDuration });
    revealMedallion(reduced);
    gsap.fromTo(q("[data-glow]"), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: d.glowDuration, ease: "power2.out" });

    const tl = gsap.timeline({ delay: reduced ? 0 : duration * 0.55 });
    if (!reduced) tl.to(anchorRef.current, { scale: d.anchorScale, yPercent: d.anchorShiftPercent, duration: 1.1, ease: "power3.inOut" });
    tl.fromTo(
      q("[data-date]"),
      reduced ? { opacity: 0 } : riseFrom(),
      { ...riseTo, duration: reduced ? animations.reducedMotion.fadeDuration : d.dateDuration, stagger: reduced ? 0 : d.dateStagger },
      reduced ? 0 : "-=0.6",
    );
  };

  return (
    <SceneWrapper scene="date" label={weddingData.text.revealedDateLabel} sectionRef={sectionRef} innerClassName="gap-2">
      <div className="relative flex w-full flex-col items-center">
        <div ref={anchorRef} className="relative aspect-square w-[64%]" style={{ perspective: "800px" }}>
          <div
            data-glow
            aria-hidden
            className="pointer-events-none absolute -inset-[30%] rounded-full opacity-0"
            style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--wm-gold-light) 55%, transparent) 0%, transparent 62%)" }}
          />
          <button
            type="button"
            onClick={reveal}
            disabled={revealed}
            aria-label={weddingData.text.revealAriaLabel}
            aria-expanded={revealed}
            aria-controls="wedding-date"
            className="absolute inset-0 rounded-full disabled:cursor-default"
          />
        </div>

        <p data-prompt aria-hidden className="mt-6 animate-pulse text-burgundy" style={typeStyle("prompt")}>
          {weddingData.text.revealPrompt}
        </p>
      </div>

      <div id="wedding-date" aria-live="polite" className="-mt-4 flex flex-col items-center gap-1">
        {revealed && <span className="sr-only">{`${firstEvent.title}, ${day} ${month} ${year}, ${timeLine}`}</span>}
        <span data-date aria-hidden className="text-burgundy opacity-0" style={typeStyle("dateDay")}>
          {day}
        </span>
        <span data-date aria-hidden className="text-gold opacity-0" style={typeStyle("dateMonth")}>
          {month}
        </span>
        <span data-date aria-hidden className="text-ink-soft opacity-0" style={typeStyle("lead")}>
          {year}
        </span>
        <span data-date aria-hidden className="gold-rule my-4 w-24 opacity-0" />
        <span data-date aria-hidden className="text-burgundy opacity-0" style={typeStyle("eventTitle")}>
          {firstEvent.title}
        </span>
        <span data-date aria-hidden className="text-ink-soft opacity-0" style={typeStyle("venue")}>
          {timeLine}
        </span>
      </div>
    </SceneWrapper>
  );
}
