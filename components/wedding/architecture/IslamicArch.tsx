"use client";

/**
 * components/wedding/atmosphere/IslamicArch.tsx
 *
 * The supplied arch SVG split into its back / mid / front groups and stacked
 * as three depth planes inside the portrait frame. Each plane:
 *  - zooms and drifts with the scene state (--arch-scale / --arch-shift,
 *    written by the environment director) scaled by its own depth factor,
 *  - receives its own scroll parallax (lib/animations/archAnimation.ts).
 * If the SVG cannot be split, the complete arch is shown as a single plane.
 */

import { useEffect, useRef, useState } from "react";
import { animations } from "@/config/animations";
import { media } from "@/config/media";
import { theme } from "@/config/theme";
import { getAssetText, assetFailed } from "@/lib/assets/assetStore";
import { createArchParallax } from "@/lib/animations/archAnimation";
import { revokeLayerUrls, splitSvgLayers, type LayerUrls } from "@/lib/svg/splitSvgLayers";
import { useExperience } from "@/lib/store/experienceStore";

type LayerName = keyof typeof media.arch.layers;
type LayerId = (typeof media.arch.layers)[LayerName];

const LAYER_ORDER: LayerName[] = ["back", "mid", "front"];
const DEPTH: Record<LayerName, { zoom: number; drift: number; blur: number }> = {
  back: { zoom: 0.6, drift: animations.parallax.back * 10, blur: theme.arch.backBlurPx },
  mid: { zoom: 1, drift: animations.parallax.middle * 10, blur: 0 },
  front: { zoom: 1.5, drift: animations.parallax.foreground * 10, blur: 0 },
};

function planeStyle(layer: LayerName) {
  const depth = DEPTH[layer];
  const baseFilter = theme.arch.filter === "none" ? "" : theme.arch.filter;
  const blurFilter = depth.blur > 0 ? `blur(${depth.blur}px)` : "";
  const filter = [baseFilter, blurFilter].filter(Boolean).join(" ") || "none";

  return {
    transform: `translate3d(0, calc(var(--arch-shift, 0) * ${depth.drift.toFixed(2)}%), 0) scale(calc(1 + (var(--arch-scale, 1) - 1) * ${depth.zoom}))`,
    filter,
  };
}

export function IslamicArch() {
  const phase = useExperience((s) => s.phase);
  const reduced = useExperience((s) => s.reducedMotion);
  const [layers, setLayers] = useState<LayerUrls<LayerId> | null>(null);
  const planeRefs = useRef<Record<LayerName, HTMLDivElement | null>>({ back: null, mid: null, front: null });

  const ready = phase !== "preloading";

  useEffect(() => {
    if (!ready) return;
    const text = getAssetText("arch");
    const urls = text ? splitSvgLayers(text, Object.values(media.arch.layers) as LayerId[]) : {};
    setLayers(urls);
    return () => revokeLayerUrls(urls);
  }, [ready]);

  useEffect(() => {
    if (phase !== "revealed" || (reduced && animations.reducedMotion.disableParallax)) return;
    return createArchParallax(planeRefs.current);
  }, [phase, reduced]);

  if (!layers || assetFailed("arch")) return null;

  const split = LAYER_ORDER.every((name) => layers[media.arch.layers[name]]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-y-0 left-1/2 z-[1] w-full max-w-[var(--frame-width)] -translate-x-1/2 overflow-hidden"
      style={{ opacity: "var(--arch-opacity, 1)" }}
    >
      {split ? (
        LAYER_ORDER.map((name) => (
          <div
            key={name}
            ref={(el) => {
              planeRefs.current[name] = el;
            }}
            className="absolute inset-0 will-change-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- runtime blob URL from the split SVG */}
            <img
              src={layers[media.arch.layers[name]]}
              alt=""
              className="arch-svg h-full w-full object-cover"
              style={planeStyle(name)}
              draggable={false}
            />
          </div>
        ))
      ) : (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG artwork */}
          <img 
            src={media.arch.arch} 
            alt="" 
            className="arch-svg h-full w-full object-cover" 
            style={planeStyle("mid")} 
            draggable={false} 
          />
        </div>
      )}
    </div>
  );
}
