/**
 * config/animations.ts
 *
 * Every timing, easing, distance, angle and intensity in the experience.
 *
 * Sections:
 * - global / scene / reveal / parallax / threeD / envelope / reducedMotion:
 *   the values requested in the brief.
 * - preloader, bismillah, invitation, couple, dateReveal, events, closing,
 *   footer: per-scene choreography consumed by the matching scene component.
 * - sceneStates: the scroll-telling "environment" keyframes. Each scene
 *   (marked with `data-scene="<key>"`) declares how the background light,
 *   architecture, particles and lantern look while it is on screen.
 *   lib/animations/environmentDirector.ts scrubs between consecutive states
 *   as the visitor scrolls, so the background evolves continuously.
 *
 * Lantern coordinates in sceneStates:
 *   x / y are fractions of the visible half-width / half-height at the
 *   lantern's depth (-1 = left/bottom edge, 1 = right/top edge), z is depth
 *   in world units (negative = further away), rotationY in radians.
 */

import type { SolidPaletteToken } from "./theme";

export type SceneState = {
  atmosphere: {
    base: SolidPaletteToken;
    /** 0–1 mix of the base colour toward theme.atmosphere.warmthColor. */
    warmth: number;
    /** Champagne light opacity (0–1). */
    glow: number;
    /** Vertical position of the light, % of viewport height. */
    glowY: number;
    /** Burgundy atmospheric gradient opacity (0–1). */
    mist: number;
    /** Edge vignette opacity (0–1). */
    vignette: number;
  };
  arch: {
    opacity: number;
    /** Portal zoom; each layer applies it with its own depth multiplier. */
    scale: number;
    /** Vertical drift in %; multiplied per layer by the parallax intensities. */
    shift: number;
  };
  particles: number;
  lantern: {
    x: number;
    y: number;
    z: number;
    rotationY: number;
    rotationX: number;
    scale: number;
    opacity: number;
    glow: number;
  };
};

export const animations = {
  global: {
    smoothScroll: true,
    defaultEase: "power2.out",
    lenisLerp: 0.085,
  },

  scene: {
    scrub: true,
    pin: true,
    transitionDuration: 1.2,
    /** Where a scene's environment transition starts / ends (ScrollTrigger syntax). */
    environmentStart: "top bottom",
    environmentEnd: "top 30%",
    /** Smoothing (seconds) applied to environment scrubs. */
    environmentScrub: 0.8,
  },

  reveal: {
    duration: 1.1,
    stagger: 0.12,
    distance: 28,
    blur: 8,
    start: "top 86%",
    end: "top 56%",
    scrub: 0.6,
  },

  parallax: {
    background: 0.08,
    back: 0.12,
    middle: 0.18,
    foreground: 0.28,
  },

  threeD: {
    /** Max idle sway (radians) — the lantern never spins on its own. */
    lanternRotation: 0.25,
    /** Idle float amplitude in CSS pixels. */
    lanternFloat: 18,
    lanternScale: 1,
    /** Lantern height in world units at scale 1. */
    lanternBaseHeight: 0.95,
    /** Damping used to ease the lantern toward its scroll target (higher = snappier). */
    lanternDamping: 3.2,

    /** Degrees the medallion turns when the date is revealed. */
    medallionRotation: 360,
    medallionScale: 1,
    medallionRevealDuration: 1.8,
    medallionRevealBoost: 0.16,
    /** Idle sway (radians) and float (fraction of its size). */
    medallionIdleSway: 0.22,
    medallionIdleFloat: 0.025,
    /** Tilt applied as the medallion travels through the viewport (radians). */
    medallionScrollTilt: 0.35,

    particleDepth: 0.4,
    particleCount: { mobile: 70, desktop: 110 },
    petalCount: { mobile: 9, desktop: 14 },
    particleSpeed: 0.05,
    petalSpeed: 0.09,
    particleSize: 0.05,
    petalSize: 0.11,

    camera: { fov: 35, z: 6 },
    maxDpr: 1.75,
  },

  envelope: {
    sealDuration: 0.35,
    flapOpenDuration: 1.5,
    cameraDuration: 1.8,
    perspective: 900,
    flapRotation: 115,

    entranceDuration: 1.4,
    entranceRise: 36,
    idleTiltX: 9,
    idleTiltY: -5,
    idleFloat: 6,
    idleFloatDuration: 3.2,

    promptFadeDuration: 0.4,
    promptDrop: 10,
    promptPulseDuration: 1.6,
    promptPulseMin: 0.5,

    sealPressScale: 0.94,
    sealReleaseDuration: 0.6,
    sealReleaseY: -14,
    sealReleaseScale: 1.08,
    sealReleaseRotation: -8,

    sideFlapAngle: 7,
    bottomFlapAngle: 5,

    cardRise: 46,
    cardRiseDuration: 1.2,

    cameraPush: 140,
    recedeDepth: -420,
    recedeScale: 0.82,
    recedeBlur: 6,
  },

  reducedMotion: {
    /** The GLBs always render; reduced motion only stills them (no idle / scroll / reveal motion). */
    disableParallax: true,
    disableParticles: true,
    simplifyEnvelope: true,
    fadeDuration: 0.6,
  },

  preloader: {
    minDuration: 2.2,
    maxDuration: 9,
    ringRotationDuration: 14,
    breathingScale: 1.03,
    breathingDuration: 2.6,
    progressSmoothing: 0.5,
    exitDuration: 0.9,
    particleCount: 10,
  },

  mainReveal: {
    duration: 1.6,
    rise: 24,
    environmentDuration: 2,
  },

  bismillah: {
    entranceDuration: 1.6,
    entranceScale: 0.9,
    dividerDuration: 1.2,
    lineStagger: 0.18,
    exitScale: 0.92,
    exitYPercent: -14,
    exitOpacity: 0.15,
  },

  invitation: {
    pinDistance: "+=110%",
    lineYPercent: 60,
    lineBlur: 10,
  },

  couple: {
    pinDistance: "+=170%",
    nameDistance: 44,
    nameBlur: 12,
    ampersandFromScale: 0.55,
    ornamentRotation: 45,
  },

  dateReveal: {
    promptFadeDuration: 0.4,
    anchorScale: 0.56,
    anchorShiftPercent: -6,
    dateStagger: 0.14,
    dateDuration: 1,
    glowDuration: 1.6,
  },

  events: {
    triggerStart: "top 68%",
    stepDuration: 0.9,
    stepGap: 0.14,
    numberParallax: 60,
  },

  closing: {
    lineStagger: 0.2,
  },

  footer: {
    initialsScale: 0.9,
  },

  countdown: {
    tickMs: 1000,
  },

  sceneStates: {
    preloader: {
      atmosphere: { base: "background", warmth: 0.02, glow: 0.35, glowY: 48, mist: 0, vignette: 0.12 },
      arch: { opacity: 0, scale: 1.06, shift: 0 },
      particles: 0,
      lantern: { x: 0.4, y: 0.9, z: -6, rotationY: 0, rotationX: 0, scale: 0.6, opacity: 0, glow: 0 },
    },
    envelope: {
      atmosphere: { base: "backgroundSoft", warmth: 0.06, glow: 0.7, glowY: 50, mist: 0.12, vignette: 0.55 },
      arch: { opacity: 0, scale: 1.08, shift: 0 },
      particles: 0,
      lantern: { x: 0.4, y: 0.9, z: -6, rotationY: 0, rotationX: 0, scale: 0.6, opacity: 0, glow: 0 },
    },
    bismillah: {
      atmosphere: { base: "background", warmth: 0.04, glow: 0.75, glowY: 34, mist: 0, vignette: 0.22 },
      arch: { opacity: 0.42, scale: 1.04, shift: 0 },
      particles: 0.55,
      lantern: { x: 0.5, y: 0.55, z: -3.5, rotationY: 0.4, rotationX: 0.05, scale: 0.62, opacity: 0.4, glow: 0.25 },
    },
    invitation: {
      atmosphere: { base: "backgroundSoft", warmth: 0.05, glow: 0.45, glowY: 46, mist: 0.04, vignette: 0.3 },
      arch: { opacity: 0.3, scale: 1.1, shift: -6 },
      particles: 0.45,
      lantern: { x: -0.55, y: 0.42, z: -2.4, rotationY: 1.1, rotationX: -0.04, scale: 0.72, opacity: 0.55, glow: 0.3 },
    },
    couple: {
      atmosphere: { base: "backgroundLight", warmth: 0.02, glow: 0.55, glowY: 50, mist: 0.14, vignette: 0.2 },
      arch: { opacity: 0.6, scale: 1.18, shift: 4 },
      particles: 0.5,
      lantern: { x: 0.62, y: -0.52, z: -5.5, rotationY: 1.8, rotationX: 0.06, scale: 0.55, opacity: 0.5, glow: 0.22 },
    },
    date: {
      atmosphere: { base: "backgroundSoft", warmth: 0.14, glow: 1, glowY: 42, mist: 0.06, vignette: 0.5 },
      arch: { opacity: 0.22, scale: 1.24, shift: 0 },
      particles: 0.7,
      lantern: { x: -0.58, y: 0.66, z: -1.2, rotationY: 2.5, rotationX: -0.06, scale: 0.68, opacity: 0.85, glow: 0.85 },
    },
    functions: {
      atmosphere: { base: "background", warmth: 0.02, glow: 0.4, glowY: 30, mist: 0, vignette: 0.18 },
      arch: { opacity: 0.4, scale: 1.08, shift: -8 },
      particles: 0.35,
      lantern: { x: -1.6, y: 0.8, z: -2, rotationY: 3.0, rotationX: 0, scale: 0.6, opacity: 0, glow: 0.2 },
    },
    eventA: {
      atmosphere: { base: "backgroundLight", warmth: 0.02, glow: 0.38, glowY: 26, mist: 0.03, vignette: 0.18 },
      arch: { opacity: 0.34, scale: 1.12, shift: -3 },
      particles: 0.3,
      lantern: { x: -1.6, y: 0.8, z: -2, rotationY: 3.0, rotationX: 0, scale: 0.6, opacity: 0, glow: 0.2 },
    },
    eventB: {
      atmosphere: { base: "backgroundSoft", warmth: 0.05, glow: 0.42, glowY: 28, mist: 0.07, vignette: 0.24 },
      arch: { opacity: 0.4, scale: 1.06, shift: 5 },
      particles: 0.3,
      lantern: { x: -1.6, y: 0.8, z: -2, rotationY: 3.0, rotationX: 0, scale: 0.6, opacity: 0, glow: 0.2 },
    },
    closing: {
      atmosphere: { base: "background", warmth: 0.1, glow: 0.7, glowY: 40, mist: 0.02, vignette: 0.2 },
      arch: { opacity: 0.28, scale: 1.02, shift: 0 },
      particles: 0.3,
      lantern: { x: 0.35, y: 0.62, z: -7, rotationY: 3.4, rotationX: 0.04, scale: 0.5, opacity: 0.3, glow: 0.35 },
    },
    compliments: {
      atmosphere: { base: "backgroundLight", warmth: 0.06, glow: 0.5, glowY: 44, mist: 0, vignette: 0.16 },
      arch: { opacity: 0.2, scale: 1.0, shift: -2 },
      particles: 0.25,
      lantern: { x: 0.3, y: 0.85, z: -7.5, rotationY: 3.6, rotationX: 0, scale: 0.5, opacity: 0.2, glow: 0.3 },
    },
    finale: {
      atmosphere: { base: "backgroundSoft", warmth: 0.2, glow: 0.95, glowY: 36, mist: 0.1, vignette: 0.58 },
      arch: { opacity: 0.32, scale: 1.14, shift: 2 },
      particles: 0.55,
      lantern: { x: 0, y: 0.28, z: 0.4, rotationY: 5.4, rotationX: 0.04, scale: 1.25, opacity: 1, glow: 1 },
    },
    end: {
      atmosphere: { base: "backgroundLight", warmth: 0.02, glow: 0.3, glowY: 30, mist: 0, vignette: 0.06 },
      arch: { opacity: 0.12, scale: 1.2, shift: -4 },
      particles: 0.15,
      lantern: { x: 0, y: 1.5, z: -1, rotationY: 6.6, rotationX: 0, scale: 1.0, opacity: 0, glow: 0.4 },
    },
  } satisfies Record<string, SceneState>,

  /** Event scenes alternate between these state keys (index % length). */
  eventStateCycle: ["eventA", "eventB"] as const,
} as const;

export type SceneStateKey = keyof typeof animations.sceneStates;
export type Animations = typeof animations;
