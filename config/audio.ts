/**
 * config/audio.ts
 *
 * Behaviour of the two audio sources (paths live in config/media.ts).
 *
 * Read by lib/audio/audioController.ts:
 * - Music only starts inside the envelope tap handler (browser autoplay
 *   policy), at volume 0, then fades to `music.volume` when the invitation
 *   is revealed.
 * - The sparkle is primed during the same tap and played when the flap opens.
 * - `pauseWhenHidden` pauses music while the tab is in the background and
 *   resumes it when the guest returns (if they had not muted it).
 */

export const audio = {
  music: {
    loop: true,
    volume: 0.42,
    fadeInDuration: 2.4,
    fadeOutDuration: 0.6,
    pauseWhenHidden: true,
  },
  sparkle: {
    volume: 0.7,
  },
} as const;

export type AudioConfig = typeof audio;
