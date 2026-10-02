/**
 * lib/theme/color.ts
 *
 * Small colour helpers used by the scroll-driven environment and the 3D
 * materials. They operate on palette tokens from config/theme.ts so no
 * colour literal ever appears outside that file.
 *
 * - `tokenRgb` converts a hex palette token into numeric RGB so GSAP can
 *   tween the background colour channel-by-channel (reliable across browsers).
 * - `mixTokens` blends two tokens (used for scene "warmth").
 * - `tokenHex` returns the raw hex for Three.js `Color` construction.
 */

import { palette, type SolidPaletteToken } from "@/config/theme";

export type Rgb = { r: number; g: number; b: number };

export function hexToRgb(hex: string): Rgb {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const value = Number.parseInt(full, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

export function tokenHex(token: SolidPaletteToken): string {
  return palette[token];
}

export function tokenRgb(token: SolidPaletteToken): Rgb {
  return hexToRgb(palette[token]);
}

export function mixRgb(a: Rgb, b: Rgb, amount: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  };
}

export function mixTokens(from: SolidPaletteToken, to: SolidPaletteToken, amount: number): Rgb {
  return mixRgb(tokenRgb(from), tokenRgb(to), amount);
}

export function rgbToCss({ r, g, b }: Rgb, alpha = 1): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
}

export function tokenRgba(token: SolidPaletteToken, alpha: number): string {
  return rgbToCss(tokenRgb(token), alpha);
}
