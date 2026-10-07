"use client";

/**
 * components/wedding/WeddingExperience.tsx
 *
 * Orchestrates the whole invitation:
 *   preloading → envelope → opening → revealed
 *
 * - Detects reduced motion (live) and WebGL support into the experience store.
 * - Starts the environment director immediately so the preloader / envelope
 *   already sit in their own background state.
 * - Envelope tap (a user gesture) unlocks audio; when the card rises the main
 *   invitation fades in, scrolling unlocks, Lenis + ScrollTrigger start and
 *   the environment hands over from the intro state to the scroll stops.
 * - The shared 3D canvas mounts once preloading is done (so shaders compile
 *   behind the envelope). It mounts under reduced motion too (models stay
 *   static); only a missing WebGL context prevents it, shown via ThreeDError.
 *
 * The main content is server-rendered for SEO, but inert until revealed.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { animations } from "@/config/animations";
import { fadeInMusic, unlockAudio } from "@/lib/audio/audioController";
import {
  releaseIntro,
  setEnvironmentReducedMotion,
  setIntroState,
  startEnvironment,
  stopEnvironment,
} from "@/lib/animations/environmentDirector";
import { registerGsap, startSmoothScroll } from "@/lib/animations/smoothScroll";
import { getExperience, setExperience, useExperience } from "@/lib/store/experienceStore";
import { IslamicArch } from "./architecture/IslamicArch";
import { Atmosphere } from "./atmosphere/Atmosphere";
import { BackgroundMusic } from "./audio/BackgroundMusic";
import { SoundToggle } from "./audio/SoundToggle";
import { EnvelopeIntro } from "./envelope/EnvelopeIntro";
import { WeddingPreloader } from "./preloader/WeddingPreloader";
import { BismillahScene } from "./scenes/BismillahScene";
import { ClosingScene, ComplimentsScene, FinaleScene } from "./scenes/ClosingScenes";
import { CoupleScene } from "./scenes/CoupleScene";
import { DateRevealScene } from "./scenes/DateRevealScene";
import { EventsScenes } from "./scenes/EventsScenes";
import { InvitationScene } from "./scenes/InvitationScene";

import { ThreeDError } from "@/components/three/ThreeDError";

const ThreeScene = dynamic(() => import("@/components/three/ThreeScene"), { ssr: false });

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function WeddingExperience() {
  const phase = useExperience((s) => s.phase);
  const reduced = useExperience((s) => s.reducedMotion);
  const webgl = useExperience((s) => s.webgl);
  const [envelopeMounted, setEnvelopeMounted] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const webglAvailable = detectWebGL();
    if (!webglAvailable) console.error("[3D] WebGL unavailable: no webgl2/webgl context could be created");
    setExperience({
      reducedMotion: query.matches,
      webgl: webglAvailable,
      threeDError: webglAvailable
        ? null
        : "This browser or device could not create a WebGL context, so the 3D medallion and lantern cannot be drawn. Enable hardware acceleration or try another browser.",
    });
    setIntroState("preloader");
    startEnvironment(query.matches);

    const onChange = (event: MediaQueryListEvent) => {
      setExperience({ reducedMotion: event.matches });
      setEnvironmentReducedMotion(event.matches);
    };
    query.addEventListener("change", onChange);
    return () => {
      query.removeEventListener("change", onChange);
      stopEnvironment();
    };
  }, []);

  useEffect(() => {
    if (phase !== "revealed") return;
    document.documentElement.classList.remove("is-locked");
    const stopScroll = startSmoothScroll(getExperience().reducedMotion);
    releaseIntro();
    fadeInMusic();
    const fade = gsap.to(mainRef.current, {
      opacity: 1,
      duration: getExperience().reducedMotion ? animations.reducedMotion.fadeDuration : animations.mainReveal.duration,
      ease: "power2.out",
    });
    return () => {
      fade.kill();
      stopScroll();
    };
  }, [phase]);

  const handlePreloaded = useCallback(() => {
    setIntroState("envelope");
    setExperience({ phase: "envelope" });
  }, []);

  const handleOpenStart = useCallback(() => {
    unlockAudio();
    setExperience({ phase: "opening" });
  }, []);

  const handleReveal = useCallback(() => setExperience({ phase: "revealed" }), []);
  const handleEnvelopeDone = useCallback(() => setEnvelopeMounted(false), []);

  const show3D = phase !== "preloading" && webgl;

  return (
    <div className="invitation-frame">
      <Atmosphere />
      <IslamicArch />
      {show3D && <ThreeScene />}
      <ThreeDError />

      {phase === "preloading" && <WeddingPreloader onComplete={handlePreloaded} />}
      {phase !== "preloading" && envelopeMounted && (
        <EnvelopeIntro onOpenStart={handleOpenStart} onReveal={handleReveal} onComplete={handleEnvelopeDone} />
      )}

      <main ref={mainRef} inert={phase !== "revealed"} className="relative z-10 opacity-0">
        <BismillahScene />
        <InvitationScene />
        <CoupleScene />
        <DateRevealScene />
        <EventsScenes />
        <ClosingScene />
        <ComplimentsScene />
        <FinaleScene />
      </main>

      <SoundToggle />
      <BackgroundMusic />
    </div>
  );
}
