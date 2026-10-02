"use client";

/**
 * components/wedding/scenes/BismillahScene.tsx
 *
 * The supplied Bismillah SVG (media.branding.bismillah) — never typed Arabic —
 * followed by a gold divider and the English line. Entrance plays once the
 * envelope reveals the invitation; scrolling away gently recedes the artwork.
 */

import { useRef } from "react";
import gsap from "gsap";
import { animations } from "@/config/animations";
import { media } from "@/config/media";
import { weddingData } from "@/config/weddingData";
import { riseFrom, riseTo } from "@/lib/animations/sceneAnimations";
import { splitLines } from "@/lib/text/lines";
import { typeStyle } from "@/lib/theme/typeStyle";
import { SceneWrapper } from "../ui/SceneWrapper";
import { useSceneAnimation } from "../ui/useSceneAnimation";

export function BismillahScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const { bismillah, mainReveal } = animations;

  useSceneAnimation(sectionRef, (reduced) => {
    if (reduced) return;
    gsap
      .timeline({ delay: mainReveal.duration * 0.35 })
      .fromTo(
        "[data-art]",
        { opacity: 0, scale: bismillah.entranceScale, filter: "blur(10px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: bismillah.entranceDuration, ease: "power3.out" },
      )
      .fromTo("[data-divider]", { scaleX: 0 }, { scaleX: 1, duration: bismillah.dividerDuration, ease: "power2.inOut" }, "-=0.7")
      .fromTo("[data-line]", riseFrom(), { ...riseTo, duration: 1, stagger: bismillah.lineStagger }, "-=0.8");

    gsap.to("[data-art-wrap]", {
      scale: bismillah.exitScale,
      yPercent: bismillah.exitYPercent,
      opacity: bismillah.exitOpacity,
      ease: "none",
      scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: animations.reveal.scrub },
    });
  });

  return (
    <SceneWrapper scene="bismillah" label="Bismillah" sectionRef={sectionRef} innerClassName="gap-10">
      <div data-art-wrap className="flex w-[82%] justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- crisp vector artwork at any size */}
        <img data-art src={media.branding.bismillah} alt={weddingData.text.bismillahAlt} className="h-auto w-full" />
      </div>
      <span data-divider aria-hidden className="gold-rule w-28" />
      <p className="flex flex-col text-ink-soft" style={typeStyle("bismillahLine")}>
        {splitLines(weddingData.text.bismillahLine).map((line) => (
          <span key={line} data-line className="block">
            {line}
          </span>
        ))}
      </p>
      <p className="absolute bottom-10 text-gold" style={typeStyle("eyebrow")} aria-hidden>
        {weddingData.text.scrollHint}
      </p>
    </SceneWrapper>
  );
}
