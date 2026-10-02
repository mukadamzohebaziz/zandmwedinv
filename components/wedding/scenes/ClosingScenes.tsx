"use client";

/**
 * components/wedding/scenes/ClosingScenes.tsx
 *
 * Closing invitation (line-by-line), compliments, and the final lantern scene.
 *
 * The finale is a 200svh track whose content stays sticky for one screen while
 * two invisible scene markers (`finale`, then `end`) hand the environment from
 * "lantern enters, warm glow" to "lantern floats upward, fade into ivory".
 */

import { useRef } from "react";
import gsap from "gsap";
import { animations } from "@/config/animations";
import { weddingData } from "@/config/weddingData";
import { revealOnScroll } from "@/lib/animations/sceneAnimations";
import { splitLines } from "@/lib/text/lines";
import { typeStyle } from "@/lib/theme/typeStyle";
import { SceneWrapper } from "../ui/SceneWrapper";
import { useSceneAnimation } from "../ui/useSceneAnimation";

export function ClosingScene() {
  const sectionRef = useRef<HTMLElement>(null);
  useSceneAnimation(sectionRef, (reduced) => {
    revealOnScroll("[data-line]", sectionRef.current as HTMLElement, reduced, {
      start: "top 65%",
      end: "center 50%",
      stagger: animations.closing.lineStagger,
    });
  });

  return (
    <SceneWrapper scene="closing" label="Closing" sectionRef={sectionRef}>
      <p className="flex flex-col text-balance text-burgundy" style={{ ...typeStyle("heroTitle"), fontStyle: "italic" }}>
        {splitLines(weddingData.text.closingInvitation).map((line) => (
          <span key={line} data-line className="block">
            {line}
          </span>
        ))}
      </p>
    </SceneWrapper>
  );
}

export function ComplimentsScene() {
  const sectionRef = useRef<HTMLElement>(null);
  useSceneAnimation(sectionRef, (reduced) => {
    revealOnScroll("[data-reveal]", sectionRef.current as HTMLElement, reduced, { start: "top 70%", end: "center 55%" });
  });

  return (
    <SceneWrapper scene="compliments" label={weddingData.text.complimentsTitle} sectionRef={sectionRef} innerClassName="min-h-[80svh] gap-6">
      <p data-reveal className="text-gold" style={typeStyle("eyebrow")}>
        {weddingData.text.complimentsTitle}
      </p>
      <span data-reveal aria-hidden className="gold-rule w-24" />
      <p data-reveal className="text-balance text-ink" style={typeStyle("parents")}>
        {weddingData.text.complimentsSubtext}
      </p>
    </SceneWrapper>
  );
}

export function FinaleScene() {
  const trackRef = useRef<HTMLDivElement>(null);
  useSceneAnimation(trackRef, (reduced) => {
    if (reduced) return;
    gsap.fromTo(
      "[data-initials]",
      { opacity: 0, scale: animations.footer.initialsScale, filter: "blur(10px)" },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        ease: "power2.out",
        scrollTrigger: { trigger: trackRef.current, start: "top 30%", end: "top -30%", scrub: animations.reveal.scrub },
      },
    );
    gsap.fromTo(
      "[data-credit]",
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, scrollTrigger: { trigger: trackRef.current, start: "top -20%", end: "top -60%", scrub: animations.reveal.scrub } },
    );
  });

  return (
    <div ref={trackRef} className="relative h-[200svh]">
      <div data-scene="finale" aria-hidden className="absolute inset-x-0 top-0 h-px" />
      <div data-scene="end" aria-hidden className="absolute inset-x-0 top-[100svh] h-px" />
      <footer className="invitation-frame sticky top-0 flex h-svh flex-col items-center justify-end gap-5 px-[var(--gutter)] pb-[14svh] text-center">
        <p data-initials className="text-burgundy" style={typeStyle("initials")}>
          {weddingData.couple.initials}
        </p>
        <span aria-hidden className="gold-rule w-16" />
        <a
          data-credit
          href={weddingData.footer.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center px-2 text-ink-soft underline-offset-4 transition-colors hover:text-burgundy hover:underline"
          style={typeStyle("label")}
        >
          {weddingData.footer.credit}
        </a>
      </footer>
    </div>
  );
}
