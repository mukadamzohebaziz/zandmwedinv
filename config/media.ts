/**
 * config/media.ts
 *
 * Every asset path used by the invitation. No component references a file
 * path directly — they all read from here.
 *
 * Only two real 3D models exist (lantern + medallion). The envelope and the
 * arch are layered SVG compositions whose named groups are listed in
 * `envelope.layers` / `arch.layers`; those IDs must match the supplied SVGs.
 *
 * `preload` lists what the preloader fetches before the envelope appears.
 * Each entry is optional: if it fails the preloader logs it, marks it failed
 * in the asset store, and the consuming component renders its fallback.
 */

export const media = {
  audio: {
    background: "/assets/bg-music.mp3",
    envelopeSparkle: "/assets/sparkles.mp3",
  },

  branding: {
    bismillah: "/assets/bismillah.svg",
  },

  envelope: {
    envelope: "/assets/envelope.svg",
    layers: {
      body: "envelope-body",
      flapLeft: "envelope-flap-left",
      flapRight: "envelope-flap-right",
      flapBottom: "envelope-flap-bottom",
      flapTop: "envelope-flap-top",
      waxSeal: "envelope-wax-seal",
    },
  },

  arch: {
    arch: "/assets/arch.svg",
    layers: {
      back: "arch-back",
      mid: "arch-mid",
      front: "arch-front",
    },
  },

  models: {
    lantern: "/assets/3d/lantern.glb",
    medallion: "/assets/3d/medallion.glb",
    /** Local Draco decoder (medallion.glb is Draco-compressed). */
    dracoDecoderPath: "/assets/draco/",
  },

  textures: {
    grain: "/assets/textures/grain.jpg",
  },

  /** Asset kinds understood by lib/assets/assetStore.ts. */
  preload: [
    { key: "bismillah", kind: "text", url: "/assets/bismillah.svg" },
    { key: "envelope", kind: "text", url: "/assets/envelope.svg" },
    { key: "arch", kind: "text", url: "/assets/arch.svg" },
    { key: "lantern", kind: "binary", url: "/assets/3d/lantern.glb" },
    { key: "medallion", kind: "binary", url: "/assets/3d/medallion.glb" },
    { key: "music", kind: "binary", url: "/assets/bg-music.mp3" },
    { key: "sparkle", kind: "binary", url: "/assets/sparkles.mp3" },
    { key: "grain", kind: "image", url: "/assets/textures/grain.jpg" },
  ] as const,
} as const;

export type Media = typeof media;
