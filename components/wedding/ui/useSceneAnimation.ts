"use client";

/**
 * components/wedding/ui/useSceneAnimation.ts
 *
 * Runs a scene's GSAP setup once the invitation is revealed, scoped to the
 * scene root with gsap.context so every tween and ScrollTrigger is reverted on
 * unmount or when reduced-motion changes. Layout effects run in document
 * order, so pinned scenes are created top-to-bottom before the orchestrator
 * calls ScrollTrigger.refresh().
 */

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { registerGsap } from "@/lib/animations/smoothScroll";
import { useExperience } from "@/lib/store/experienceStore";

export function useSceneAnimation(
  scope: RefObject<HTMLElement | null>,
  setup: (reduced: boolean) => void,
): { revealed: boolean; reduced: boolean } {
  const revealed = useExperience((s) => s.phase === "revealed");
  const reduced = useExperience((s) => s.reducedMotion);

  useLayoutEffect(() => {
    if (!revealed || !scope.current) return;
    registerGsap();
    const ctx = gsap.context(() => setup(reduced), scope.current);
    return () => ctx.revert();
    // `setup` is defined inline by each scene; re-run only on phase / motion changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, reduced]);

  return { revealed, reduced };
}
