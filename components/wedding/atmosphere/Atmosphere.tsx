/**
 * components/wedding/atmosphere/Atmosphere.tsx
 *
 * The persistent environment behind every scene: champagne light, burgundy
 * mist, and edge vignette. Nothing here animates by itself — the
 * environment director writes --env-* custom properties on <html> while the
 * visitor scrolls, so the light and depth evolve continuously across scenes.
 */

import { theme } from "@/config/theme";
import { tokenRgba } from "@/lib/theme/color";

const { glowColor, mistColor, vignetteColor } = theme.atmosphere;

export function Atmosphere() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Glow Layer */}
      <div
        className="absolute inset-0"
        style={{
          opacity: "var(--env-glow, 0)",
          background: `radial-gradient(60% 42% at 50% var(--env-glow-y, 50%), ${tokenRgba(glowColor, 0.75)} 0%, ${tokenRgba(glowColor, 0.22)} 45%, transparent 75%)`,
        }}
      />

      {/* Mist Layer */}
      <div
        className="absolute inset-0"
        style={{
          opacity: "var(--env-mist, 0)",
          background: `radial-gradient(90% 55% at 50% 105%, ${tokenRgba(mistColor, 0.55)} 0%, transparent 70%), radial-gradient(70% 40% at 50% -5%, ${tokenRgba(mistColor, 0.25)} 0%, transparent 70%)`,
        }}
      />

      {/* Vignette Layer */}
      <div
        className="absolute inset-0"
        style={{
          opacity: "var(--env-vignette, 0)",
          background: `radial-gradient(120% 85% at 50% 50%, transparent 52%, ${tokenRgba(vignetteColor, 0.42)} 100%)`,
        }}
      />
    </div>
  );
}
