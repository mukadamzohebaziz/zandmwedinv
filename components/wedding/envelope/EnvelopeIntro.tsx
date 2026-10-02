"use client";

/**
 * components/wedding/envelope/EnvelopeIntro.tsx
 *
 * The opening scene. The supplied envelope SVG is split at runtime into its
 * named groups (body, four flaps, wax seal — IDs in config/media.ts) and each
 * group becomes an independently transformable plane, so the envelope opens
 * like real paper: the seal releases, the top flap rotates about its fold,
 * the side flaps ease outward and an invitation card rises out.
 *
 * The whole envelope is one large tap target with "Tap to open" printed on
 * the paper below the seal. Choreography lives in
 * lib/animations/envelopeAnimation.ts.
 *
 * Fallbacks: if the SVG cannot be split the complete artwork is shown as a
 * single plane; if it cannot be loaded at all the card alone is shown.
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

/** Paper stacking order while closed. The top flap drops to z-1 once it passes vertical. */
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
    // refs() reads stable element refs; re-run only when the artwork is ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div
        ref={stageRef}
        role="button"
        tabIndex={0}
        aria-label={weddingData.text.envelopeAriaLabel}
        onClick={open}
        onKeyDown={handleKeyDown}
        className="invitation-frame flex h-svh cursor-pointer items-center justify-center px-[var(--gutter)] outline-none"
        style={{ perspective: `${animations.envelope.perspective}px` }}
      >
        <div
          ref={rigRef}
          className="relative aspect-[3/2] w-[92%] opacity-0"
          style={{ perspective: `${animations.envelope.perspective}px`, transformStyle: "preserve-3d" }}
        >
          <div
            ref={shadowRef}
            aria-hidden
            className="absolute -bottom-[9%] left-[6%] right-[6%] h-[16%] rounded-[50%] bg-burgundy-dark/25 blur-xl"
          />

          <div
            ref={cardRef}
            className="absolute inset-x-[6%] top-[5%] bottom-[7%] flex flex-col items-center gap-3 border border-gold-line bg-paper px-6 pt-[9%] text-burgundy shadow-sm"
            style={{ zIndex: Z.card }}
          >
            <span aria-hidden className="gold-rule w-16" />
            <span style={typeStyle("initials")}>{weddingData.couple.initials}</span>
            <span aria-hidden className="gold-rule w-16" />
          </div>

          {showArtwork &&
            (split ? (
              (Object.keys(media.envelope.layers) as LayerName[]).map((name) => (
                <div
                  key={name}
                  ref={(el) => {
                    layerRefs.current[name] = el;
                  }}
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{ zIndex: Z[name], transformOrigin: ORIGIN[name] ?? "50% 50%", backfaceVisibility: "visible" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- runtime blob URL from the split SVG */}
                  <img src={layers[media.envelope.layers[name]]} alt="" className="size-full" draggable={false} />
                </div>
              ))
            ) : (
              <div aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: Z.flapTop }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- static SVG artwork */}
                <img src={media.envelope.envelope} alt="" className="size-full" draggable={false} />
              </div>
            ))}

          <p
            ref={promptRef}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[66%] text-center text-burgundy opacity-0"
            style={{ ...typeStyle("prompt"), zIndex: 7 }}
          >
            {weddingData.text.envelopePrompt}
          </p>
        </div>
      </div>
    </div>
  );
}
