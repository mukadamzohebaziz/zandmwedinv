"use client";

/**
 * components/wedding/preloader/WeddingPreloader.tsx
 *
 * Updated Ivory & Burgundy Preloader:
 * - Retains floating background particles & geometric ornament backdrop.
 * - Adds a subtle, infinite glowing breathing pulse on the initials.
 * - Integrates a custom CSS physics loader graphic styled in burgundy.
 * - Tracks asset loading (lib/assets/assetStore.ts) displaying real-time percentage.
 * - Displays visible preloader label and screen-reader accessibility texts.
 */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { animations } from "@/config/animations";
import { weddingData } from "@/config/weddingData";
import { preloadAssets } from "@/lib/assets/assetStore";
import { typeStyle } from "@/lib/theme/typeStyle";
import { GeometricOrnament } from "@/components/wedding/ui/GeometricOrnament";

// -----------------------------------------------------------------------------
// Configuration & Helper Utilities
// -----------------------------------------------------------------------------
const P = animations.preloader;
const wait = (seconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, seconds * 1000));

// Ambient Floating Particles Data Array
const PARTICLES = Array.from({ length: P.particleCount }, (_, i) => ({
  left: 18 + ((i * 37) % 64),
  top: 22 + ((i * 53) % 56),
  size: 2 + (i % 3),
}));

type Props = { onComplete: () => void };

export function WeddingPreloader({ onComplete }: Props) {
  // DOM References for GSAP Animations
  const rootRef = useRef<HTMLDivElement>(null);
  const breathRef = useRef<HTMLDivElement>(null);
  const initialsRef = useRef<HTMLDivElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  // Stable callback reference to prevent unnecessary effect re-runs
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  // Real-time Progress State (0 to 100)
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const progress = { value: 0 };

    // Function to render progress updates to DOM & React State
    const render = () => {
      const currentPercent = Math.round(progress.value * 100);
      setDisplayProgress(currentPercent);
      meterRef.current?.setAttribute("aria-valuenow", String(currentPercent));
    };

    // -------------------------------------------------------------------------
    // GSAP Animation Timelines & Loops
    // -------------------------------------------------------------------------
    const ctx = gsap.context(() => {
      // 1. Initial Fade & Scale-in of Central Container
      gsap.fromTo(
        breathRef.current,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }
      );

      // 2. Subtle Infinite Glowing Pulse on Couple Initials
      gsap.to(initialsRef.current, {
        opacity: 0.8,
        scale: 1.04,
        textShadow: "0 0 18px rgba(107, 29, 47, 0.4)",
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 3. Subtle Breathing Motion for Central Container
      gsap.to(breathRef.current, {
        scale: P.breathingScale,
        duration: P.breathingDuration / 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 1.2,
      });

      // 4. Ambient Floating Particle Animation
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
          }
        );
      }
    }, rootRef);

    // Smoothly updates asset preloading progress value
    const setProgress = (fraction: number) => {
      gsap.to(progress, {
        value: fraction,
        duration: P.progressSmoothing,
        ease: "power1.out",
        onUpdate: render,
        overwrite: true,
      });
    };

    // -------------------------------------------------------------------------
    // Asset Preloading Execution & Exit Sequence
    // -------------------------------------------------------------------------
    Promise.all([
      Promise.race([preloadAssets(setProgress), wait(P.maxDuration)]),
      wait(P.minDuration),
    ]).then(() => {
      if (cancelled) return;

      gsap
        .timeline()
        .to(progress, {
          value: 1,
          duration: P.progressSmoothing,
          onUpdate: render,
          overwrite: true,
        })
        .to(rootRef.current, {
          opacity: 0,
          duration: P.exitDuration,
          ease: "power2.inOut",
        })
        .call(() => {
          if (!cancelled) completeRef.current();
        });
    });

    // Cleanup phase on component unmount
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ivory text-gold select-none"
    >
      {/* Hidden Screen Reader Label for Accessibility */}
      <span className="sr-only">{weddingData.text.preloaderLabel}</span>

      {/* Floating Ambient Particles Layer */}
      <div ref={particlesRef} aria-hidden className="pointer-events-none absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-gold-light opacity-0"
            style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
          />
        ))}
      </div>

      {/* Main Center Preloader Container */}
      <div ref={breathRef} className="relative flex flex-col items-center justify-center size-72 opacity-0">
        
        {/* Background Geometric Ornament SVG Component */}
        <GeometricOrnament className="absolute inset-0 size-full text-gold/30 pointer-events-none" strokeWidth={0.4} />

        {/* Vertical Column: Monogram + Loader Graphic + Percentage + Label */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4 text-center">
          
          {/* 1. Couple Initials with Infinite Glowing Pulse */}
          <div
            ref={initialsRef}
            className="text-burgundy"
            style={{
              ...typeStyle("preloaderInitials"),
              textShadow: "0 0 6px rgba(107, 29, 47, 0.2)",
            }}
          >
            {weddingData.couple.initials}
          </div>

          {/* 2. Physics Loading Animation Graphic */}
          <div className="py-1">
            <div className="wedding-physics-loader" />
          </div>

          {/* 3. Progress Percentage Counter */}
          <div
            ref={meterRef}
            role="progressbar"
            aria-label={weddingData.text.preloaderLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={displayProgress}
            className="text-xs font-semibold tracking-widest text-burgundy/80 uppercase"
          >
            {displayProgress}%
          </div>

          {/* 4. Subtitle / Preloader Label Text */}
          <p className="text-xs tracking-wider text-burgundy/70 font-serif italic max-w-[200px] leading-tight">
            {weddingData.text.preloaderLabel}
          </p>

        </div>
      </div>

      {/* CSS Physics Loader Keyframes & Styles */}
      <style jsx global>{`
        .wedding-physics-loader {
          width: 40px;
          height: 20px;
          --c: no-repeat radial-gradient(farthest-side, #6B1D2F 93%, #0000);
          background:
            var(--c) 0 0,
            var(--c) 50% 0;
          background-size: 8px 8px;
          position: relative;
          clip-path: inset(-200% -100% 0 0);
          animation: l6-0 1.5s linear infinite;
        }
        .wedding-physics-loader:before {
          content: "";
          position: absolute;
          width: 8px;
          height: 12px;
          background: #6B1D2F;
          left: -16px;
          top: 0;
          animation: 
            l6-1 1.5s linear infinite,
            l6-2 0.5s cubic-bezier(0, 200, 0.8, 200) infinite;
        }
        .wedding-physics-loader:after {
          content: "";
          position: absolute;
          inset: 0 0 auto auto;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6B1D2F; 
          animation: l6-3 1.5s linear infinite;
        }

        @keyframes l6-0 {
          0%, 30%  { background-position: 0 0, 50% 0; }
          33%      { background-position: 0 100%, 50% 0; }
          41%, 63% { background-position: 0 0, 50% 0; }
          66%      { background-position: 0 0, 50% 100%; }
          74%, 100%{ background-position: 0 0, 50% 0; }
        }
        @keyframes l6-1 {
          90%  { transform: translateY(0); }
          95%  { transform: translateY(15px); }
          100% { transform: translateY(15px); left: calc(100% - 8px); }
        }
        @keyframes l6-2 {
          100% { top: -0.1px; }
        }
        @keyframes l6-3 {
          0%, 80%, 100% { transform: translate(0); }
          90%          { transform: translate(26px); }
        }
      `}</style>
    </div>
  );
}
