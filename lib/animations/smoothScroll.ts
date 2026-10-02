/**
 * lib/animations/smoothScroll.ts
 *
 * Registers GSAP plugins once and connects Lenis smooth scrolling to
 * ScrollTrigger.
 *
 * Triggered by WeddingExperience when the phase becomes "revealed"
 * (scrolling is locked before that).
 *
 * Reads: animations.global.smoothScroll / lenisLerp.
 *
 * - Lenis is driven by the GSAP ticker so ScrollTrigger and Lenis share one
 *   clock (no double rAF loops).
 * - Reduced motion: Lenis is not created — the page uses native scrolling,
 *   and ScrollTrigger still works.
 *
 * Cleanup: the returned function destroys Lenis and removes the ticker hook.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { animations } from "@/config/animations";

let registered = false;

export function registerGsap(): void {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: animations.global.defaultEase });
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

export function startSmoothScroll(reducedMotion: boolean): () => void {
  registerGsap();
  window.scrollTo(0, 0);

  if (reducedMotion || !animations.global.smoothScroll) {
    ScrollTrigger.refresh();
    return () => undefined;
  }

  const lenis = new Lenis({ lerp: animations.global.lenisLerp, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  const raf = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.refresh();

  return () => {
    gsap.ticker.remove(raf);
    lenis.destroy();
  };
}
