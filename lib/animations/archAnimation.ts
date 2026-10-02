/**
 * lib/animations/archAnimation.ts
 *
 * Scroll parallax for the three arch layers (arch-back / arch-mid / arch-front).
 *
 * Triggered by IslamicArch once the invitation is revealed.
 *
 * Each layer has two transform sources on two nested elements:
 * - outer element: scene-driven scale / shift / opacity from the environment
 *   director (CSS variables; see IslamicArch).
 * - inner element (handled here): continuous scroll drift across the whole
 *   document. Distance = page progress × parallax intensity
 *   (config/animations.ts → parallax.back / middle / foreground), so the back
 *   layer moves slowest and the front slightly faster — the sensation of
 *   moving through a portal.
 *
 * Reduced motion: not created (animations.reducedMotion.disableParallax).
 *
 * Cleanup: returns a function that kills the ScrollTrigger and tweens.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animations } from "@/config/animations";

export type ArchLayerElements = {
  back: HTMLElement | null;
  mid: HTMLElement | null;
  front: HTMLElement | null;
};

export function createArchParallax(layers: ArchLayerElements): () => void {
  const { back, middle, foreground } = animations.parallax;
  const intensities: [HTMLElement | null, number][] = [
    [layers.back, back],
    [layers.mid, middle],
    [layers.front, foreground],
  ];

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: animations.reveal.scrub,
    },
  });

  for (const [element, intensity] of intensities) {
    if (!element) continue;
    timeline.fromTo(
      element,
      { yPercent: intensity * 40 },
      { yPercent: -intensity * 40, ease: "none" },
      0,
    );
  }

  return () => {
    timeline.scrollTrigger?.kill();
    timeline.kill();
    ScrollTrigger.refresh();
  };
}
