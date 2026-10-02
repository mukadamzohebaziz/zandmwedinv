/**
 * lib/animations/medallionAnimation.ts
 *
 * Bridges the DOM-based Date Reveal scene and the 3D medallion that lives in
 * the single shared Three.js canvas.
 *
 * - DateRevealScene registers its anchor element (`setMedallionAnchor`). Each
 *   frame Medallion.tsx reads the anchor's bounding box and places the GLB
 *   exactly over it, so the medallion scrolls with the page and follows any
 *   GSAP transform applied to the anchor (e.g. the post-reveal scale-down).
 * - `revealMedallion()` is triggered by the guest's tap. It tweens
 *   `medallionMotion.reveal` 0 → 1 over animations.threeD.medallionRevealDuration;
 *   Medallion.tsx converts that into the configured rotation
 *   (medallionRotation degrees) and a brief scale boost toward the viewer.
 * - `medallionMotion.tilt` is scrubbed by ScrollTrigger as the scene passes.
 *
 * Reduced motion: the reveal resolves immediately (duration = fadeDuration)
 * and the static fallback medallion is shown instead of the GLB.
 *
 * Cleanup: `setMedallionAnchor(null)` on unmount; the reveal tween is killed
 * by the caller's gsap.context.
 */

import gsap from "gsap";
import { animations } from "@/config/animations";

export const medallionMotion = {
  anchor: null as HTMLElement | null,
  reveal: 0,
  tilt: 0,
};

export function setMedallionAnchor(element: HTMLElement | null): void {
  medallionMotion.anchor = element;
}

export function revealMedallion(reducedMotion: boolean): gsap.core.Tween {
  return gsap.to(medallionMotion, {
    reveal: 1,
    duration: reducedMotion ? animations.reducedMotion.fadeDuration : animations.threeD.medallionRevealDuration,
    ease: "power3.inOut",
  });
}
