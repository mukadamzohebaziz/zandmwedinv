/**
 * config/typography.ts
 *
 * Controls every typographic decision: families, weights, responsive sizes,
 * letter spacing, line height and text transform.
 *
 * - `fonts` names the two families. The actual font files are loaded once in
 *   `app/fonts.ts` via next/font (which requires literal loader calls); that
 *   file exposes them as the CSS variables `--font-display` / `--font-body`.
 * - `roles` combine the scales below into named text styles. Components call
 *   `typeStyle("coupleName")` (lib/theme/typeStyle.ts) instead of hardcoding
 *   font sizes, so a designer can retune the whole invitation from here.
 *
 * Sizes use clamp() so they scale fluidly between 360px and 430px phones and
 * stay capped on desktop. They use `cqi` (container inline size) so they
 * scale with the 430px portrait frame rather than the desktop window.
 */

export const typography = {
  fonts: {
    display: "Cormorant Garamond",
    body: "Inter",
  },

  sizes: {
    bismillah: "clamp(2.4rem, 10cqi, 4.5rem)",
    heroTitle: "clamp(2rem, 8cqi, 4rem)",
    coupleName: "clamp(3rem, 15cqi, 6rem)",
    eventTitle: "clamp(2rem, 9cqi, 4rem)",
    sectionTitle: "clamp(2rem, 8cqi, 3.5rem)",
    body: "1rem",
    small: "0.78rem",

    lead: "clamp(1.3rem, 5.6cqi, 1.7rem)",
    ampersand: "clamp(4.5rem, 24cqi, 8rem)",
    parents: "clamp(1.05rem, 4.6cqi, 1.25rem)",
    eventNumber: "clamp(3.25rem, 17cqi, 5.5rem)",
    dateDay: "clamp(5.5rem, 32cqi, 9.5rem)",
    dateMonth: "clamp(1.5rem, 7cqi, 2.4rem)",
    countdownValue: "clamp(1.8rem, 8.6cqi, 2.6rem)",
    initials: "clamp(2.75rem, 13cqi, 4.25rem)",
    preloaderInitials: "clamp(2.4rem, 11cqi, 3.4rem)",
    venue: "clamp(1.15rem, 5cqi, 1.35rem)",
  },

  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
  },

  letterSpacing: {
    display: "0.02em",
    uppercase: "0.16em",
    small: "0.12em",
    wide: "0.32em",
    none: "0em",
  },

  lineHeights: {
    tight: 0.92,
    display: 1.08,
    title: 1.22,
    relaxed: 1.45,
    body: 1.6,
  },

  /**
   * Named text roles. `font` → fonts key, `size` → sizes key,
   * `weight` → weights key, `tracking` → letterSpacing key, `leading` → lineHeights key.
   */
  roles: {
    bismillahLine: { font: "display", size: "lead", weight: "regular", tracking: "display", leading: "relaxed", transform: "none", italic: true },
    heroTitle: { font: "display", size: "heroTitle", weight: "light", tracking: "display", leading: "title", transform: "none", italic: false },
    coupleName: { font: "display", size: "coupleName", weight: "light", tracking: "small", leading: "tight", transform: "uppercase", italic: false },
    ampersand: { font: "display", size: "ampersand", weight: "light", tracking: "none", leading: "tight", transform: "none", italic: true },
    parents: { font: "display", size: "parents", weight: "regular", tracking: "display", leading: "relaxed", transform: "none", italic: true },
    eyebrow: { font: "body", size: "small", weight: "medium", tracking: "wide", leading: "body", transform: "uppercase", italic: false },
    sectionTitle: { font: "display", size: "sectionTitle", weight: "light", tracking: "small", leading: "display", transform: "uppercase", italic: false },
    eventNumber: { font: "display", size: "eventNumber", weight: "light", tracking: "display", leading: "tight", transform: "none", italic: true },
    eventTitle: { font: "display", size: "eventTitle", weight: "regular", tracking: "small", leading: "display", transform: "uppercase", italic: false },
    lead: { font: "display", size: "lead", weight: "regular", tracking: "display", leading: "relaxed", transform: "none", italic: false },
    venue: { font: "display", size: "venue", weight: "regular", tracking: "display", leading: "relaxed", transform: "none", italic: true },
    body: { font: "body", size: "body", weight: "regular", tracking: "none", leading: "body", transform: "none", italic: false },
    dateDay: { font: "display", size: "dateDay", weight: "light", tracking: "none", leading: "tight", transform: "none", italic: false },
    dateMonth: { font: "display", size: "dateMonth", weight: "regular", tracking: "wide", leading: "display", transform: "uppercase", italic: false },
    countdownValue: { font: "display", size: "countdownValue", weight: "light", tracking: "display", leading: "tight", transform: "none", italic: false },
    label: { font: "body", size: "small", weight: "medium", tracking: "uppercase", leading: "body", transform: "uppercase", italic: false },
    button: { font: "body", size: "small", weight: "semibold", tracking: "uppercase", leading: "body", transform: "uppercase", italic: false },
    initials: { font: "display", size: "initials", weight: "light", tracking: "display", leading: "tight", transform: "none", italic: false },
    preloaderInitials: { font: "display", size: "preloaderInitials", weight: "light", tracking: "display", leading: "tight", transform: "none", italic: false },
    prompt: { font: "body", size: "small", weight: "medium", tracking: "wide", leading: "body", transform: "uppercase", italic: false },
  },
} as const;

export type Typography = typeof typography;
export type TypeRole = keyof typeof typography.roles;
