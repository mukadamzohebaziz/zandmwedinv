/**
 * lib/theme/typeStyle.ts
 *
 * Resolves a named text role from config/typography.ts into inline CSS.
 *
 * Components call `typeStyle("eventTitle")` rather than hardcoding sizes,
 * weights or tracking. Font families resolve to the next/font CSS variables
 * (`--font-display`, `--font-body`, defined in app/fonts.ts) with the
 * configured family name as a fallback.
 */

import type { CSSProperties } from "react";
import { typography, type TypeRole } from "@/config/typography";

const cache = new Map<TypeRole, CSSProperties>();

export function typeStyle(role: TypeRole): CSSProperties {
  const cached = cache.get(role);
  if (cached) return cached;

  const spec = typography.roles[role];
  const family = typography.fonts[spec.font];
  const fallback = spec.font === "display" ? "serif" : "sans-serif";

  const style: CSSProperties = {
    fontFamily: `var(--font-${spec.font}), "${family}", ${fallback}`,
    fontSize: typography.sizes[spec.size],
    fontWeight: typography.weights[spec.weight],
    letterSpacing: typography.letterSpacing[spec.tracking],
    lineHeight: typography.lineHeights[spec.leading],
    textTransform: spec.transform,
    fontStyle: spec.italic ? "italic" : "normal",
  };

  cache.set(role, style);
  return style;
}
