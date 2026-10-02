/**
 * lib/animations/sceneAnimations.ts
 *
 * Small, reusable GSAP / ScrollTrigger building blocks shared by the scene
 * components. Every value comes from config/animations.ts.
 *
 * - revealOnScroll: scroll-scrubbed "rise + unblur" for a list of elements.
 * - pinnedTimeline: a scrubbed timeline that pins its scene for a configured
 *   distance (used by the Invitation and Couple scenes only — the site is
 *   never pinned as one enormous section).
 * - riseFrom: the shared "from" state for revealed typography.
 *
 * Under reduced motion every helper becomes a no-op and content is simply
 * shown, so nothing is ever left hidden.
 */

import gsap from "gsap";
import { animations } from "@/config/animations";

type Targets = gsap.TweenTarget;

export function riseFrom(distance: number = animations.reveal.distance, blur: number = animations.reveal.blur) {
  return { opacity: 0, y: distance, filter: `blur(${blur}px)` };
}

export const riseTo = { opacity: 1, y: 0, filter: "blur(0px)" };

export function revealOnScroll(
  targets: Targets,
  trigger: Element,
  reduced: boolean,
  options: { start?: string; end?: string; stagger?: number } = {},
): void {
  if (reduced) {
    gsap.set(targets, { opacity: 1, clearProps: "filter,transform" });
    return;
  }
  const { start, end, scrub, stagger } = animations.reveal;
  gsap.fromTo(targets, riseFrom(), {
    ...riseTo,
    ease: "power2.out",
    stagger: options.stagger ?? stagger,
    scrollTrigger: {
      trigger,
      start: options.start ?? start,
      end: options.end ?? end,
      scrub,
    },
  });
}

export function pinnedTimeline(trigger: Element, distance: string, reduced: boolean): gsap.core.Timeline | null {
  if (reduced) return null;
  return gsap.timeline({
    defaults: { ease: "power2.out" },
    scrollTrigger: {
      trigger,
      start: "top top",
      end: distance,
      pin: animations.scene.pin,
      scrub: animations.reveal.scrub,
      anticipatePin: 1,
    },
  });
}
