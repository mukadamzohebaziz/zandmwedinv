"use client";

/**
 * components/wedding/envelope/EnvelopeIntro.tsx
 *
 * Video-Based Curtain Reveal Component
 * -------------------------------------
 * Replaces the SVG envelope animation with an MP4 curtain reveal video.
 *
 * Flow:
 * 1. Initial State: Video stays paused at frame 0 (curtains closed with burgundy bow).
 * 2. User Tap: Triggers `handlePlay()`, hiding the prompt badge and starting video playback.
 * 3. Mid-Playback: Fires `onReveal()` when curtains start opening.
 * 4. Video End: Triggers a 600ms CSS crossfade out to cleanly transition into the main site.
 */

import { useRef, useState, type KeyboardEvent } from "react";
import { weddingData } from "@/config/weddingData";
import { playSparkle } from "@/lib/audio/audioController";
import { typeStyle } from "@/lib/theme/typeStyle";

type Props = {
  onOpenStart: () => void; // Triggered immediately when user taps to initiate audio/state changes
  onReveal: () => void;    // Triggered mid-animation as the background scene becomes visible
  onComplete: () => void;  // Triggered after video ends to unmount intro overlay
};

export function EnvelopeIntro({ onOpenStart, onReveal, onComplete }: Props) {
  // Reference to the HTML5 video element for imperative playback control (.play())
  const videoRef = useRef<HTMLVideoElement>(null);

  // Local state flags to drive component lifecycle animations
  const [hasStarted, setHasStarted] = useState(false); // Tracks if user has tapped screen
  const [isFadingOut, setIsFadingOut] = useState(false); // Controls the final opacity fade-out transition

  /**
   * Primary interaction handler triggered when user clicks or taps anywhere on the screen.
   */
  const handlePlay = () => {
    // Prevent duplicate triggers if the video is already playing
    if (hasStarted) return;

    // 1. Mark state as started (fades out the "TAP TO UNVEIL" text prompt)
    setHasStarted(true);

    // 2. Play optional entrance audio effect
    playSparkle();

    // 3. Inform parent component that the opening sequence has begun
    onOpenStart();

    // 4. Start video playback
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => {
          // Trigger `onReveal()` as the video begins playing so background elements prepare
          onReveal();
        })
        .catch((err) => {
          console.error("Video autoplay policy blocked playback:", err);
          // Fallback: Immediately complete transition if media playback fails (e.g. low power mode)
          onComplete();
        });
    }
  };

  /**
   * Event handler fired automatically by the browser when `curtains.mp4` reaches its final frame.
   */
  const handleEnded = () => {
    // 1. Trigger CSS opacity fade out (opacity-100 -> opacity-0 over 600ms)
    setIsFadingOut(true);

    // 2. Wait for the 600ms CSS transition to complete before unmounting via onComplete
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  /**
   * Accessibility handler to allow keyboard users to open the scene using Space or Enter key.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handlePlay();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={weddingData.text.envelopeAriaLabel}
      onClick={handlePlay}
      onKeyDown={handleKeyDown}
      // Fixed viewport overlay styled with z-40 to sit above persistent background atmosphere
      className={`fixed inset-0 z-40 flex cursor-pointer items-center justify-center bg-[#0F0F12] outline-none transition-opacity duration-600 ease-out ${
        isFadingOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* 9:16 Aspect-Ratio Container Frame constrained for mobile-first viewport design */}
      <div className="relative h-svh w-full max-w-[430px] overflow-hidden shadow-2xl">
        {/* HTML5 Video Element rendering public/assets/curtains.mp4 */}
        <video
          ref={videoRef}
          src="/assets/curtains.mp4"
          playsInline // Essential for iOS Safari to play video inline rather than launching native fullscreen
          muted       // Required for instant playback on iOS/Android without click block
          preload="auto"
          onEnded={handleEnded} // Fired when curtains are completely open at final frame
          className="size-full object-cover"
        />

        {/* Floating Call-To-Action Badge Layer */}
        <div
          aria-hidden
          // Positioned in lower third to avoid obstructing the burgundy sash center bow
          className={`pointer-events-none absolute inset-x-0 bottom-[20%] flex flex-col items-center justify-center transition-all duration-500 ${
            hasStarted ? "translate-y-3 opacity-0" : "opacity-100"
          }`}
        >
          <span
            className="inline-flex items-center rounded-full border border-[#B79A68]/40 bg-[#FFFDF8]/20 px-6 py-2.5 text-[0.72rem] font-medium tracking-[0.3em] text-[#FFFDF8] uppercase shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-105"
            style={{ ...typeStyle("prompt") }}
          >
            TAP TO UNVEIL
          </span>
        </div>
      </div>
    </div>
  );
}
