/**
 * lib/theme/cssVariables.ts
 *
 * Converts config/theme.ts into CSS custom properties.
 *
 * Triggered once on the server by app/layout.tsx, which spreads the result
 * into the <html style> attribute. app/globals.css maps Tailwind colour
 * utilities onto these variables (e.g. `--color-burgundy: var(--wm-burgundy)`),
 * so every colour class in the UI ultimately originates from theme.ts.
 *
 * Token names are converted from camelCase to kebab-case:
 *   backgroundSoft → --wm-background-soft
 */

import type { CSSProperties } from "react";
import { palette, theme } from "@/config/theme";

const toKebab = (value: string) => value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);

export function themeCssVariables(): CSSProperties {
  const vars: Record<string, string> = {};

  for (const [token, value] of Object.entries(palette)) {
    vars[`--wm-${toKebab(token)}`] = value;
  }

  vars["--frame-width"] = theme.layout.frameWidth;
  vars["--gutter"] = theme.layout.gutter;
  vars["--grain-opacity"] = String(theme.atmosphere.grainOpacity);
  vars["--grain-size"] = theme.atmosphere.grainTileSize;
  vars["--arch-filter"] = theme.arch.filter;
  vars["--map-filter"] = theme.map.filter;

  return vars as CSSProperties;
}
