/**
 * lib/audio/audioController.ts
 *
 * Owns the two audio sources: looping background music and the one-shot
 * envelope sparkle. Paths come from config/media.ts, behaviour from
 * config/audio.ts.
 *
 * Lifecycle:
 * 1. `unlockAudio()` — MUST be called synchronously inside the envelope
 *    tap/click handler. It creates the AudioContext and both <audio>
 *    elements, routes them through gain nodes, and starts the music at gain 0
 *    so the browser's autoplay policy is satisfied by the user gesture.
 *    Nothing plays during the preloader.
 * 2. `playSparkle()` — called by the envelope timeline when the flap opens.
 * 3. `fadeInMusic()` — called when the invitation is revealed; ramps gain to
 *    `audio.music.volume` over `fadeInDuration`.
 * 4. `setMusicEnabled(bool)` — SoundToggle; fades out and pauses, or resumes
 *    and fades in.
 * 5. `handleVisibility(hidden)` — BackgroundMusic pauses while the tab is in
 *    the background and resumes afterwards (only if the guest had music on).
 *
 * Gain nodes are used instead of `audio.volume` because iOS Safari ignores
 * the volume property; if Web Audio is unavailable we fall back to it.
 *
 * Failure handling: every play() promise is caught. If audio cannot start,
 * `audioAvailable` becomes false in the experience store, the sound toggle
 * hides, and the invitation continues silently.
 *
 * Reduced motion: audio behaviour is unchanged (it is not motion).
 *
 * Cleanup: `disposeAudio()` pauses both elements, disconnects nodes and
 * closes the AudioContext.
 */

import { audio } from "@/config/audio";
import { media } from "@/config/media";
import { setExperience } from "@/lib/store/experienceStore";

type Channel = {
  element: HTMLAudioElement;
  gain: GainNode | null;
};

let context: AudioContext | null = null;
let music: Channel | null = null;
let sparkle: Channel | null = null;
let userWantsMusic = true;
let hiddenPause = false;

function createChannel(src: string, loop: boolean): Channel {
  const element = new Audio(src);
  element.loop = loop;
  element.preload = "auto";
  element.crossOrigin = "anonymous";

  let gain: GainNode | null = null;
  if (context) {
    try {
      const source = context.createMediaElementSource(element);
      gain = context.createGain();
      gain.gain.value = 0;
      source.connect(gain).connect(context.destination);
    } catch {
      gain = null;
    }
  }
  if (!gain) element.volume = 0;
  return { element, gain };
}

function rampTo(channel: Channel, target: number, seconds: number): void {
  if (channel.gain && context) {
    const now = context.currentTime;
    channel.gain.gain.cancelScheduledValues(now);
    channel.gain.gain.setValueAtTime(channel.gain.gain.value, now);
    channel.gain.gain.linearRampToValueAtTime(target, now + Math.max(seconds, 0.01));
    return;
  }
  const start = channel.element.volume;
  const startedAt = performance.now();
  const step = () => {
    const t = Math.min((performance.now() - startedAt) / (seconds * 1000), 1);
    channel.element.volume = start + (target - start) * t;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function markUnavailable(error: unknown): void {
  console.warn("[wedding] Audio unavailable; continuing silently.", error);
  setExperience({ audioAvailable: false, musicOn: false });
}

export function unlockAudio(): void {
  if (music) return;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    context = Ctor ? new Ctor() : null;
    void context?.resume();
  } catch {
    context = null;
  }

  music = createChannel(media.audio.background, audio.music.loop);
  sparkle = createChannel(media.audio.envelopeSparkle, false);
  music.element.addEventListener("error", () => markUnavailable("music element error"), { once: true });

  music.element.play().catch(markUnavailable);

  // Prime the sparkle within the gesture so it can play later without a new gesture.
  const sparkleElement = sparkle.element;
  sparkleElement
    .play()
    .then(() => {
      sparkleElement.pause();
      sparkleElement.currentTime = 0;
    })
    .catch(() => undefined);
}

export function playSparkle(): void {
  if (!sparkle) return;
  const channel = sparkle;
  channel.element.currentTime = 0;
  if (channel.gain) channel.gain.gain.value = audio.sparkle.volume;
  else channel.element.volume = audio.sparkle.volume;
  channel.element.play().catch((error) => console.warn("[wedding] Sparkle sound failed.", error));
}

export function fadeInMusic(): void {
  if (!music || !userWantsMusic) return;
  setExperience({ musicOn: true });
  rampTo(music, audio.music.volume, audio.music.fadeInDuration);
}

export function setMusicEnabled(enabled: boolean): void {
  userWantsMusic = enabled;
  if (!music) return;
  const channel = music;
  setExperience({ musicOn: enabled });

  if (enabled) {
    void context?.resume();
    channel.element
      .play()
      .then(() => rampTo(channel, audio.music.volume, audio.music.fadeInDuration))
      .catch(markUnavailable);
  } else {
    rampTo(channel, 0, audio.music.fadeOutDuration);
    window.setTimeout(() => {
      if (!userWantsMusic) channel.element.pause();
    }, audio.music.fadeOutDuration * 1000);
  }
}

export function handleVisibility(hidden: boolean): void {
  if (!music || !audio.music.pauseWhenHidden) return;
  if (hidden && !music.element.paused) {
    hiddenPause = true;
    music.element.pause();
  } else if (!hidden && hiddenPause && userWantsMusic) {
    hiddenPause = false;
    void context?.resume();
    music.element.play().catch(() => undefined);
  }
}

export function disposeAudio(): void {
  for (const channel of [music, sparkle]) {
    if (!channel) continue;
    channel.element.pause();
    channel.element.removeAttribute("src");
    channel.element.load();
    channel.gain?.disconnect();
  }
  music = null;
  sparkle = null;
  void context?.close().catch(() => undefined);
  context = null;
}
