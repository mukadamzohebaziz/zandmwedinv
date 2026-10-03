"use client";

/**
 * components/wedding/envelope/EnvelopeIntro.tsx
 *
 * Visual Improvements:
 * - Theme-matched animated gradient background (Ivory, Sand, Gold, Burgundy)
 * - Elevated envelope shadows and depth planes
 * - Luxury typographic badge styling for "TAP TO OPEN"
 */

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import gsap from "gsap";
import { animations } from "@/config/animations";
import { media } from "@/config/media";
import { weddingData } from "@/config/weddingData";
import { assetFailed, getAssetText } from "@/lib/assets/assetStore";
import { playEnvelopeEntrance, playEnvelopeOpening, type EnvelopeRefs } from "@/lib/animations/envelopeAnimation";
import { playSparkle } from "@/lib/audio/audioController";
import { revokeLayerUrls, splitSvgLayers, type LayerUrls } from "@/lib/svg/splitSvgLayers";
import { useExperience } from "@/lib/store/experienceStore";
import { typeStyle } from "@/lib/theme/typeStyle";

type LayerName = keyof typeof media.envelope.layers;
type LayerId = (typeof media.envelope.layers)[LayerName];

const Z: Record<LayerName | "card", number> = {
  body: 0,
  card: 2,
  flapLeft: 3,
  flapRight: 3,
  flapBottom: 4,
  flapTop: 5,
  waxSeal: 6,
};

const ORIGIN: Partial<Record<LayerName, string>> = {
  flapTop: "50% 0%",
  flapLeft: "0% 50%",
  flapRight: "100% 50%",
  flapBottom: "50% 100%",
  waxSeal: "50% 44%",
};

type Props = {
  onOpenStart: () => void;
  onReveal: () => void;
  onComplete: () => void;
};

export function EnvelopeIntro({ onOpenStart, onReveal, onComplete }: Props) {
  const reduced = useExperience((s) => s.reducedMotion);
  const [layers, setLayers] = useState<LayerUrls<LayerId> | null>(null);
  const openedRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Partial<Record<LayerName, HTMLDivElement | null>>>({});

  useEffect(() => {
    const text = getAssetText("envelope");
    const urls = text ? splitSvgLayers(text, Object.values(media.envelope.layers) as LayerId[]) : {};
    setLayers(urls);
    return () => revokeLayerUrls(urls);
  }, []);

  const split = !!layers && (Object.keys(media.envelope.layers) as LayerName[]).every((n) => layers[media.envelope.layers[n]]);
  const simplified = reduced && animations.reducedMotion.simplifyEnvelope;

  const refs = (): EnvelopeRefs => ({
    rig: rigRef.current as HTMLElement,
    prompt: promptRef.current,
    seal: layerRefs.current.waxSeal ?? null,
    flapTop: layerRefs.current.flapTop ?? null,
    flapLeft: layerRefs.current.flapLeft ?? null,
    flapRight: layerRefs.current.flapRight ?? null,
    flapBottom: layerRefs.current.flapBottom ?? null,
    card: cardRef.current,
    shadow: shadowRef.current,
  });

  useLayoutEffect(() => {
    if (!layers || !rigRef.current) return;
    const tl = playEnvelopeEntrance(refs(), simplified);
    stageRef.current?.focus({ preventScroll: true });
    return () => {
      tl.kill();
    };
  }, [layers, simplified]);

  useEffect(() => () => void timelineRef.current?.kill(), []);

  const open = () => {
    if (openedRef.current || !rigRef.current) return;
    openedRef.current = true;
    onOpenStart();
    timelineRef.current = playEnvelopeOpening(refs(), simplified || !split, {
      onSparkle: playSparkle,
      onReveal,
      onComplete,
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  };

  const showArtwork = !!layers && !assetFailed("envelope");

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden">
      {/* Dynamic Keyframes for Theme-Matched Animated Background */}
      <style jsx global>{`
        @keyframes envelopeGradientShift {
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

        .animated-ivory-burgundy-bg {
          background: linear-gradient(
            135deg,
            #FAF7F0 0%,
            #EEE5D6 25%,
            #D0BC91 50%,
            #641F2A 78%,
            #42131C 100%
          );
          background-size: 220% 220%;
          animation: envelopeGradientShift 16s ease infinite;
        }
      `}</style>

      {/* Animated Color Gradient Background Layer */}
      <div className="animated-ivory-burgundy-bg pointer-events-none absolute inset-0 size-full" />

      {/* Subtle Central Radial Glow Behind Envelope */}
      <div 
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(255,253,248,0.6)_0%,transparent_65%)] mix-blend-soft-light" 
      />

      {/* Interactive Main Envelope Stage Container */}
      <div
        ref={stageRef}
        role="button"
        tabIndex={0}
        aria-label={weddingData.text.envelopeAriaLabel}
        onClick={open}
        onKeyDown={handleKeyDown}
        className="invitation-frame relative z-10 flex h-svh cursor-pointer items-center justify-center px-[var(--gutter)] outline-none"
        style={{ perspective: `${animations.envelope.perspective}px` }}
      >
        <div
          ref={rigRef}
          className="relative aspect-[3/2] w-[92%] opacity-0 transition-transform duration-300 ease-out hover:scale-[1.01]"
          style={{ perspective: `${animations.envelope.perspective}px`, transformStyle: "preserve-3d" }}
        >
          {/* Realistic Multi-Layer Envelope Drop Shadow */}
          <div
            ref={shadowRef}
            aria-hidden
            className="absolute -bottom-[12%] left-[4%] right-[4%] h-[20%] rounded-[50%] bg-[#2A0B10]/35 blur-2xl transition-all duration-500"
          />

          {/* Invitation Card inside the Envelope */}
          <div
            ref={cardRef}
            className="absolute inset-x-[6%] top-[5%] bottom-[7%] flex flex-col items-center justify-center gap-3 border border-gold-line bg-paper px-6 text-burgundy shadow-lg"
            style={{ zIndex: Z.card }}
          >
            <span aria-hidden className="gold-rule w-16" />
            <span style={typeStyle("initials")}>{weddingData.couple.initials}</span>
            <span aria-hidden className="gold-rule w-16" />
          </div>

          {/* SVG Artwork Planes */}
          {showArtwork &&
            (split ? (
              (Object.keys(media.envelope.layers) as LayerName[]).map((name) => (
                <div
                  key={name}
                  ref={(el) => {
                    layerRefs.current[name] = el;
                  }}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 drop-shadow-[0_4px_8px_rgba(66,19,28,0.12)]"
                  style={{ zIndex: Z[name], transformOrigin: ORIGIN[name] ?? "50% 50%", backfaceVisibility: "visible" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- runtime blob URL from split SVG */}
                  <img src={layers[media.envelope.layers[name]]} alt="" className="size-full" draggable={false} />
                </div>
              ))
            ) : (
              <div aria-hidden className="pointer-events-none absolute inset-0 drop-shadow-[0_10px_20px_rgba(66,19,28,0.2)]" style={{ zIndex: Z.flapTop }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- static SVG artwork */}
                <img src={media.envelope.envelope} alt="" className="size-full" draggable={false} />
              </div>
            ))}

          {/* Elevated Call-To-Action Text Pill */}
          <p
            ref={promptRef}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[68%] flex justify-center text-center opacity-0"
            style={{ zIndex: 7 }}
          >
            <span 
              className="inline-flex items-center rounded-full border border-[#B79A68]/40 bg-[#FFFDF8]/90 px-5 py-1.5 text-[0.72rem] font-medium tracking-[0.25em] text-[#641F2A] uppercase shadow-md backdrop-blur-md transition-all duration-300"
              style={{ ...typeStyle("prompt") }}
            >
              {weddingData.text.envelopePrompt}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
