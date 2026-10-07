"use client";

/**
 * components/wedding/preloader/WeddingPreloader.tsx
 *
 * Refined Luxury Preloader:
 * - Animated 12-second background gradient transitioning through deep burgundy & royal violet tones.
 * - Elevated borderless glassmorphism card container (backdrop-blur-2xl).
 * - Interlocked gold wedding rings SVG graphic with dual swaying keyframe animations.
 * - Explicit Playfair Display SC inline font classes for initials, label, and percentage counter.
 * - Real-time asset tracking (lib/assets/assetStore.ts) bound to GSAP animations.
 * - Off-screen video element pre-warming for immediate curtains playback on user tap.
 */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { animations } from "@/config/animations";
import { media } from "@/config/media";
import { weddingData } from "@/config/weddingData";
import { preloadAssets } from "@/lib/assets/assetStore";

// -----------------------------------------------------------------------------
// Helper Utilities & Particle Data Generation
// -----------------------------------------------------------------------------
const P = animations.preloader;
const wait = (seconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, seconds * 1000));

/**
 * Pre-warms an MP4 video element by loading its first frame into browser VRAM.
 * Prevents black screen / buffer delays when the video component later mounts.
 */
const prewarmVideo = (url: string) => {
  return new Promise<void>((resolve) => {
    const video = document.createElement("video");
    video.src = url;
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    video.load();

    const onReady = () => {
      video.removeEventListener("canplaythrough", onReady);
      video.removeEventListener("error", onReady);
      resolve();
    };

    video.addEventListener("canplaythrough", onReady);
    video.addEventListener("error", onReady);

    // Timeout safety net to ensure execution continues if load fails
    setTimeout(resolve, 2000);
  });
};

// Generate positioning data for floating background gold particles
const PARTICLES = Array.from({ length: P.particleCount }, (_, i) => ({
  left: 18 + ((i * 37) % 64),
  top: 22 + ((i * 53) % 56),
  size: 2 + (i % 3),
}));

type Props = { onComplete: () => void };

export function WeddingPreloader({ onComplete }: Props) {
  // DOM references for GSAP timeline targeting
  const rootRef = useRef<HTMLDivElement>(null);
  const breathRef = useRef<HTMLDivElement>(null);
  const initialsRef = useRef<HTMLDivElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  // Stable callback ref to prevent unnecessary effect resets
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  // Real-time loading percentage state (0 to 100)
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const progress = { value: 0 };

    // Update state and aria progress attributes on GSAP frame updates
    const render = () => {
      const currentPercent = Math.round(progress.value * 100);
      setDisplayProgress(currentPercent);
      meterRef.current?.setAttribute("aria-valuenow", String(currentPercent));
    };

    // -------------------------------------------------------------------------
    // GSAP Timelines: Entry Fade, Monogram Pulse, Ambient Floating Particles
    // -------------------------------------------------------------------------
    const ctx = gsap.context(() => {
      // 1. Smooth Fade & Scale-in for the Central Glass Card
      gsap.fromTo(
        breathRef.current,
        { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }
      );

      // 2. Subtle Glowing Pulse on Couple Initials
      gsap.to(initialsRef.current, {
        opacity: 0.85,
        scale: 1.03,
        textShadow: "0 0 16px rgba(212, 175, 55, 0.5)",
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 3. Floating Ambient Particles Animation
      const dots = particlesRef.current?.children;
      if (dots) {
        gsap.fromTo(
          dots,
          { opacity: 0, y: 10 },
          {
            opacity: () => gsap.utils.random(0.3, 0.7),
            y: () => gsap.utils.random(-24, -10),
            duration: () => gsap.utils.random(3, 5),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: { each: 0.3, from: "random" },
          }
        );
      }
    }, rootRef);

    // Smoothly interpolate loading progress using GSAP tweening
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
    // Preloader Execution & Exit Timeline
    // -------------------------------------------------------------------------
    Promise.all([
      Promise.race([preloadAssets(setProgress), wait(P.maxDuration)]),
      prewarmVideo(media.video.curtains),
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
      className="fixed inset-0 z-50 flex items-center justify-center animate-violet-burgundy-12s select-none overflow-hidden p-6"
    >
      {/* Hidden Screen Reader Label for Accessibility */}
      <span className="sr-only">{weddingData.text.preloaderLabel}</span>

      {/* --------------------------------------------------------------------- */}
      {/* 1. Ambient Floating Gold Dust Particles                               */}
      {/* --------------------------------------------------------------------- */}
      <div ref={particlesRef} aria-hidden className="pointer-events-none absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-gold-light/60 opacity-0"
            style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
          />
        ))}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. Borderless Glassmorphism Card Container                            */}
      {/* --------------------------------------------------------------------- */}
      <div
        ref={breathRef}
        className="relative z-10 w-full max-w-[340px] rounded-3xl bg-black/25 backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.5)] p-8 flex flex-col items-center text-center space-y-6 opacity-0"
      >
        {/* Couple Initials (Inline Font: Playfair Display SC) */}
        <div
          ref={initialsRef}
          className="font-['Playfair_Display_SC'] text-5xl font-bold tracking-[0.2em] text-ivory pl-[0.2em] drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)]"
        >
          {weddingData.couple.initials}
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 3. Swaying Interlocked Gold Wedding Rings Vector Graphics           */}
        {/* ------------------------------------------------------------------- */}
        <div className="relative size-36 flex items-center justify-center py-1">
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="size-full overflow-visible drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
          >
            <defs>
              {/* Metallic Gold Ring Gradient */}
              <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F3E5AB" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#AA820A" />
              </linearGradient>

              {/* Diamond Glow Radial Filter */}
              <filter id="diamond-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* RING 1 (Left Ring - Sway Motion A) */}
            <g className="origin-[80px_100px] animate-ring-sway-a">
              <circle cx="80" cy="100" r="36" stroke="url(#gold-gradient)" strokeWidth="3" />
              <g transform="translate(80, 62)" filter="url(#diamond-glow)">
                <polygon points="0,-8 6,-2 0,4 -6,-2" fill="#FFFDF8" stroke="#D4AF37" strokeWidth="0.8" />
                <line x1="0" y1="-8" x2="0" y2="4" stroke="#D4AF37" strokeWidth="0.5" />
              </g>
            </g>

            {/* RING 2 (Right Ring - Sway Motion B) */}
            <g className="origin-[120px_100px] animate-ring-sway-b">
              <circle cx="120" cy="100" r="36" stroke="url(#gold-gradient)" strokeWidth="3" />
              <g transform="translate(120, 62)" filter="url(#diamond-glow)">
                <polygon points="0,-8 6,-2 0,4 -6,-2" fill="#FFFDF8" stroke="#D4AF37" strokeWidth="0.8" />
                <line x1="0" y1="-8" x2="0" y2="4" stroke="#D4AF37" strokeWidth="0.5" />
              </g>
            </g>

            {/* INTERLOCK OVERLAY ARC (Redraws section of Ring 1 over Ring 2 for interlocked depth) */}
            <g className="origin-[80px_100px] animate-ring-sway-a">
              <path d="M 116 100 A 36 36 0 0 1 80 136" stroke="url(#gold-gradient)" strokeWidth="3" fill="none" />
            </g>
          </svg>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 4. Preloader Status Label, Progress Track & Percentage Counter      */}
        {/* ------------------------------------------------------------------- */}
        <div className="w-full flex flex-col items-center space-y-3 pt-1">
          {/* Status Label (Inline Font: Playfair Display SC) */}
          <p className="font-['Playfair_Display_SC'] text-xs font-medium tracking-[0.2em] text-ivory/90 uppercase">
            {weddingData.text.preloaderLabel}
          </p>

          {/* Dynamic Gold Progress Bar Track */}
          <div className="w-full h-[2px] bg-white/15 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-gold-light via-gold to-gold-dark shadow-[0_0_8px_#D4AF37] transition-all duration-300 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>

          {/* Accessible Percentage Counter (Inline Font: Playfair Display SC) */}
          <div
            ref={meterRef}
            role="progressbar"
            aria-label={weddingData.text.preloaderLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={displayProgress}
            className="font-['Playfair_Display_SC'] text-xs font-semibold tracking-[0.25em] text-gold-light uppercase pt-0.5"
          >
            {displayProgress}%
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 5. Custom Keyframes & Global Animations                               */}
      {/* --------------------------------------------------------------------- */}
      <style jsx global>{`
        /* 12-Second Smooth Looping Mesh Gradient Animation */
        @keyframes violetBurgundyGradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-violet-burgundy-12s {
          background: linear-gradient(
            -45deg,
            #120306,
            #4a154b,
            #2a0810,
            #32103c,
            #521422,
            #23082b,
            #120306
          );
          background-size: 300% 300%;
          animation: violetBurgundyGradient 12s ease-in-out infinite;
        }

        /* Swaying Motion Keyframes for Interlocked Rings SVG */
        @keyframes ringSwayA {
          0%, 100% {
            transform: rotate(-22deg);
          }
          50% {
            transform: rotate(22deg);
          }
        }

        @keyframes ringSwayB {
          0%, 100% {
            transform: rotate(22deg);
          }
          50% {
            transform: rotate(-22deg);
          }
        }

        .animate-ring-sway-a {
          animation: ringSwayA 3.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }

        .animate-ring-sway-b {
          animation: ringSwayB 3.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
      `}</style>
    </div>
  );
}
