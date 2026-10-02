"use client";

/**
 * components/wedding/audio/BackgroundMusic.tsx
 *
 * Lifecycle glue for lib/audio/audioController.ts: pauses music while the tab
 * is hidden, resumes on return, and releases audio on unmount. Playback itself
 * is unlocked by the envelope tap (browser autoplay policy).
 */

import { useEffect } from "react";
import { disposeAudio, handleVisibility } from "@/lib/audio/audioController";

export function BackgroundMusic() {
  useEffect(() => {
    const onVisibility = () => handleVisibility(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      disposeAudio();
    };
  }, []);

  return null;
}
