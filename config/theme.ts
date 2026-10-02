/**
 * config/theme.ts
 *
 * Single source of truth for every colour used by the invitation.
 *
 * - `palette` holds the raw brand colours (ivory, burgundy, champagne gold…).
 * - `theme` groups palette tokens into higher-level roles consumed by the
 *   atmosphere, architecture, map styling and the Three.js materials.
 *
 * How it is consumed:
 * - `lib/theme/cssVariables.ts` converts the palette into CSS custom
 *   properties that are injected on <html> by `app/layout.tsx`. Tailwind
 *   colour utilities (`bg-ivory`, `text-burgundy`…) are mapped onto those
 *   variables in `app/globals.css`, so changing a value here re-themes the UI.
 * - Three.js components read `theme.materials` / `theme.lighting` directly.
 * - The scroll-driven environment reads `theme.atmosphere`.
 *
 * Nothing in this file animates; it only describes colour and material.
 */

export const palette = {
  background: "#F5EFE4",
  backgroundSoft: "#EEE5D6",
  backgroundLight: "#FAF7F0",

  burgundy: "#641F2A",
  burgundyDark: "#42131C",
  burgundySoft: "#7D3A45",

  gold: "#B79A68",
  goldLight: "#D0BC91",

  textPrimary: "#2A211D",
  textSecondary: "#65584F",

  white: "#FFFDF8",

  border: "rgba(100, 31, 42, 0.16)",
  goldBorder: "rgba(183, 154, 104, 0.38)",

  glassBackground: "rgba(255, 253, 248, 0.55)",
} as const;

export type PaletteToken = keyof typeof palette;

/** Palette tokens that are plain hex values (safe to mix / tween numerically). */
export type SolidPaletteToken = {
  [K in PaletteToken]: (typeof palette)[K] extends `#${string}` ? K : never;
}[PaletteToken];

export const theme = {
  colors: palette,

  /** Portrait invitation frame. Desktop keeps this width and centres it. */
  layout: {
    frameWidth: "430px",
    gutter: "1.5rem",
  },

  /**
   * Global environment layers rendered by `components/wedding/atmosphere/Atmosphere.tsx`.
   * Opacities of these layers are scroll-tweened per scene (see config/animations.ts → sceneStates).
   */
  atmosphere: {
    glowColor: "goldLight" as SolidPaletteToken,
    mistColor: "burgundy" as SolidPaletteToken,
    vignetteColor: "burgundyDark" as SolidPaletteToken,
    /** Colour the base background mixes toward when a scene asks for "warmth". */
    warmthColor: "gold" as SolidPaletteToken,
    grainOpacity: 0,
    grainTileSize: "520px",
  },

  /** Tonal treatment applied to the supplied arch artwork so it sits in the palette cleanly without modification. */
  arch: {
    filter: "none",
    backBlurPx: 0,
  },

  /** Embedded Google Map treatment so the map belongs to the scene. */
  map: {
    filter: "grayscale(0.55) sepia(0.28) contrast(0.92) brightness(1.02)",
  },

  /**
   * Physically based materials applied at runtime to the neutral GLB models.
   * Colour values are palette tokens so the gold stays champagne, never yellow.
   */
  materials: {
    lantern: {
      color: "gold" as SolidPaletteToken,
      metalness: 0.88,
      roughness: 0.36,
      envMapIntensity: 1.15,
      emissive: "goldLight" as SolidPaletteToken,
      /** Emissive intensity at full glow (scaled by the scroll-driven glow value). */
      emissiveIntensity: 0.18,
    },
    medallion: {
      color: "goldLight" as SolidPaletteToken,
      metalness: 0.94,
      roughness: 0.3,
      envMapIntensity: 1.25,
      emissive: "gold" as SolidPaletteToken,
      emissiveIntensity: 0.22,
    },
    glowSprite: "goldLight" as SolidPaletteToken,
    particles: {
      dust: ["goldLight", "white", "gold"] as SolidPaletteToken[],
      petals: ["burgundy", "burgundySoft"] as SolidPaletteToken[],
    },
  },

  /** Scene lights shared by both 3D objects. */
  lighting: {
    ambient: { color: "white" as SolidPaletteToken, intensity: 0.55 },
    key: { color: "white" as SolidPaletteToken, intensity: 1.6, position: [2.5, 3, 4] as const },
    fill: { color: "goldLight" as SolidPaletteToken, intensity: 0.9, position: [-3, 1, 2] as const },
    rim: { color: "burgundySoft" as SolidPaletteToken, intensity: 0.6, position: [0, -2, -3] as const },
    lanternPoint: { color: "goldLight" as SolidPaletteToken, intensity: 2.4, distance: 3 },
  },
} as const;

export type Theme = typeof theme;
