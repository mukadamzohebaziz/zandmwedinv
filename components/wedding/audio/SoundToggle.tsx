"use client";

/**
 * components/wedding/audio/SoundToggle.tsx
 *
 * Minimal glass sound control, fixed bottom-right of the portrait frame.
 * Animated bars while music plays; a muted speaker with a slash when off.
 * Hidden entirely when audio is unavailable.
 */

import { VolumeOff } from "lucide-react";
import { weddingData } from "@/config/weddingData";
import { setMusicEnabled } from "@/lib/audio/audioController";
import { useExperience } from "@/lib/store/experienceStore";

const BARS = [0, 0.25, 0.5, 0.15];

export function SoundToggle() {
  const musicOn = useExperience((s) => s.musicOn);
  const available = useExperience((s) => s.audioAvailable);
  const phase = useExperience((s) => s.phase);

  if (!available || phase !== "revealed") return null;

  return (
    <button
      type="button"
      onClick={() => setMusicEnabled(!musicOn)}
      aria-pressed={musicOn}
      aria-label={musicOn ? weddingData.text.soundOnLabel : weddingData.text.soundOffLabel}
      className="fixed bottom-5 z-[60] flex size-11 items-center justify-center rounded-full border border-gold-line bg-glass text-burgundy shadow-sm backdrop-blur-md transition-transform active:scale-95"
      style={{ right: "max(1.25rem, calc(50vw - var(--frame-width) / 2 + 1.25rem))" }}
    >
      {musicOn ? (
        <span aria-hidden className="flex h-4 items-end gap-[3px]">
          {BARS.map((delay, i) => (
            <span
              key={i}
              className="h-full w-[2px] origin-bottom rounded-full bg-burgundy"
              style={{ animation: `eq-bar 1.1s ease-in-out ${delay}s infinite` }}
            />
          ))}
        </span>
      ) : (
        <VolumeOff aria-hidden className="size-4" strokeWidth={1.6} />
      )}
    </button>
  );
}
