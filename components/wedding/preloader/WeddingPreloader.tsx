"use client";

/**
 * components/wedding/preloader/WeddingPreloader.tsx
 *
 * Elegant ivory preloader: the couple's initials inside a slowly turning
 * geometric ring, with a champagne progress arc that follows real asset
 * loading (lib/assets/assetStore.ts). It waits at least
 * animations.preloader.minDuration and never longer than maxDuration — failed
 * optional assets never block the experience.
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { animations } from "@/config/animations";
import { weddingData } from "@/config/weddingData";
import { preloadAssets } from "@/lib/assets/assetStore";
import { typeStyle } from "@/lib/theme/typeStyle";
import { GeometricOrnament } from "@/components/wedding/ui/GeometricOrnament";

const P = animations.preloader;
const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const wait = (seconds: number) => new Promise<void>((resolve) => window.setTimeout(resolve, seconds * 1000));

const PARTICLES = Array.from({ length: P.particleCount }, (_, i) => ({
  left: 18 + ((i * 37) % 64),
  top: 22 + ((i * 53) % 56),
  size: 2 + (i % 3),
}));

type Props = { onComplete: () => void };

export function WeddingPreloader({ onComplete }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGSVGElement>(null);
  const breathRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    let cancelled = false;
    const progress = { value: 0 };

    const render = () => {
      arcRef.current?.setAttribute("stroke-dashoffset", String(CIRCUMFERENCE * (1 - progress.value)));
      meterRef.current?.setAttribute("aria-valuenow", String(Math.round(progress.value * 100)));
    };

    const ctx = gsap.context(() => {
      gsap.fromTo(breathRef.current, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" });
      gsap.to(ringRef.current, { rotation: 360, duration: P.ringRotationDuration, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
      gsap.to(breathRef.current, {
        scale: P.breathingScale,
        duration: P.breathingDuration / 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 1.2,
      });
      const dots = particlesRef.current?.children;
      if (dots) {
        gsap.fromTo(
          dots,
          { opacity: 0, y: 8 },
          {
            opacity: () => gsap.utils.random(0.3, 0.8),
            y: () => gsap.utils.random(-26, -12),
            duration: () => gsap.utils.random(2.4, 4),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: { each: 0.35, from: "random" },
          },
        );
      }
    }, rootRef);

    const setProgress = (fraction: number) => {
      gsap.to(progress, { value: fraction, duration: P.progressSmoothing, ease: "power1.out", onUpdate: render, overwrite: true });
    };

    Promise.all([Promise.race([preloadAssets(setProgress), wait(P.maxDuration)]), wait(P.minDuration)]).then(() => {
      if (cancelled) return;
      gsap
        .timeline()
        .to(progress, { value: 1, duration: P.progressSmoothing, onUpdate: render, overwrite: true })
        .to(rootRef.current, { opacity: 0, duration: P.exitDuration, ease: "power2.inOut" })
        .call(() => {
          if (!cancelled) completeRef.current();
        });
    });

    return () => {
      cancelled = true;
      ctx.revert();
      gsap.killTweensOf(progress);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ivory text-gold"
    >
      <span className="sr-only">{weddingData.text.preloaderLabel}</span>
      <div ref={particlesRef} aria-hidden className="pointer-events-none absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-gold-light opacity-0"
            style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
          />
        ))}
      </div>

      <div ref={breathRef} className="relative size-56 opacity-0">
        <GeometricOrnament className="absolute inset-0 size-full text-gold/40" strokeWidth={0.4} />
        <svg ref={ringRef} viewBox="0 0 100 100" aria-hidden className="absolute inset-0 size-full">
          <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="currentColor" strokeOpacity={0.18} strokeWidth={0.5} />
          <circle
            ref={arcRef}
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.9}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div
          ref={meterRef}
          role="progressbar"
          aria-label={weddingData.text.preloaderLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          className="absolute inset-0 flex items-center justify-center text-burgundy"
        >
          <span style={typeStyle("preloaderInitials")}>{weddingData.couple.initials}</span>
        </div>
      </div>
    </div>
  );
}
