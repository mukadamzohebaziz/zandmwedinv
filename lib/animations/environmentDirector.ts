/**
 * lib/animations/environmentDirector.ts
 *
 * The background scroll-telling engine.
 *
 * Every scene root carries `data-scene="<key>"` where key is one of
 * config/animations.ts → sceneStates. The director:
 *
 * 1. Measures each scene's document position (on start and on every
 *    ScrollTrigger refresh, so pin spacers are accounted for).
 * 2. On every GSAP tick, finds the two scenes surrounding the current scroll
 *    position and blends their states. A scene's state is held while it is
 *    on screen and blended toward the next one over the last stretch before
 *    it arrives (smoothstep), so transitions are gentle, never hard cuts.
 * 3. Smooths the result over time (animations.scene.environmentScrub) so even
 *    fast flick-scrolling produces a calm atmospheric change.
 * 4. Writes the result:
 *    - CSS custom properties on <html> (background colour, light, mist,
 *      vignette, arch opacity/scale/shift) consumed by Atmosphere and
 *      IslamicArch purely through CSS — no React renders.
 *    - `lanternTarget` / `particleTarget` consumed inside the R3F frame loop.
 *
 * Before the invitation is revealed the director shows the "preloader" or
 * "envelope" state (`setIntroState`). `releaseIntro()` cross-fades from that
 * intro state into the scroll-driven state over mainReveal.environmentDuration.
 *
 * Reduced motion: colour/light still change (they are not motion) but arch
 * scale/shift are pinned to neutral values (animations.reducedMotion.disableParallax).
 *
 * Cleanup: `stop()` removes the ticker callback and refresh listener.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animations, type SceneState, type SceneStateKey } from "@/config/animations";
import { theme } from "@/config/theme";
import { mixTokens } from "@/lib/theme/color";
import { particleTarget, writeLanternTarget } from "./lanternAnimation";

type Flat = number[];

const LANTERN_KEYS = ["x", "y", "z", "rotationY", "rotationX", "scale", "opacity", "glow"] as const;

function flatten(state: SceneState): Flat {
  const bg = mixTokens(state.atmosphere.base, theme.atmosphere.warmthColor, state.atmosphere.warmth);
  return [
    bg.r,
    bg.g,
    bg.b,
    state.atmosphere.glow,
    state.atmosphere.glowY,
    state.atmosphere.mist,
    state.atmosphere.vignette,
    state.arch.opacity,
    state.arch.scale,
    state.arch.shift,
    state.particles,
    ...LANTERN_KEYS.map((key) => state.lantern[key]),
  ];
}

const flatStates = Object.fromEntries(
  Object.entries(animations.sceneStates).map(([key, value]) => [key, flatten(value)]),
) as Record<SceneStateKey, Flat>;

const smoothstep = (t: number) => t * t * (3 - 2 * t);
const lerpFlat = (a: Flat, b: Flat, t: number) => a.map((v, i) => v + (b[i] - v) * t);

type Stop = { position: number; key: SceneStateKey };

let stops: Stop[] = [];
let current: Flat = [...flatStates.preloader];
let introKey: SceneStateKey = "preloader";
const intro = { mix: 1 };
let reduced = false;
let running = false;
let lastWritten: Flat = [];
let root: HTMLElement | null = null;

function measure(): void {
  const viewport = window.innerHeight;
  stops = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"))
    .map((el) => ({
      position: el.getBoundingClientRect().top + window.scrollY - viewport * 0.45,
      key: el.dataset.scene as SceneStateKey,
    }))
    .filter((stop) => stop.key in flatStates)
    .sort((a, b) => a.position - b.position);
}

function scrollState(): Flat {
  if (stops.length === 0) return flatStates[introKey];
  const y = window.scrollY;
  if (y <= stops[0].position) return flatStates[stops[0].key];

  for (let i = 0; i < stops.length - 1; i += 1) {
    const a = stops[i];
    const b = stops[i + 1];
    if (y < b.position) {
      const span = Math.min(window.innerHeight * 0.75, b.position - a.position);
      const t = Math.min(Math.max((y - (b.position - span)) / span, 0), 1);
      return lerpFlat(flatStates[a.key], flatStates[b.key], smoothstep(t));
    }
  }
  return flatStates[stops[stops.length - 1].key];
}

function write(values: Flat): void {
  if (!root) return;
  const changed = lastWritten.length === 0 || values.some((v, i) => Math.abs(v - lastWritten[i]) > 0.0001);
  if (!changed) return;
  lastWritten = values;

  const [r, g, b, glow, glowY, mist, vignette, archOpacity, archScale, archShift, particles, ...lantern] = values;
  const style = root.style;
  style.setProperty("--env-bg", `${Math.round(r)} ${Math.round(g)} ${Math.round(b)}`);
  style.setProperty("--env-glow", glow.toFixed(3));
  style.setProperty("--env-glow-y", `${glowY.toFixed(2)}%`);
  style.setProperty("--env-mist", mist.toFixed(3));
  style.setProperty("--env-vignette", vignette.toFixed(3));
  style.setProperty("--arch-opacity", archOpacity.toFixed(4));
  style.setProperty("--arch-scale", reduced ? "1" : archScale.toFixed(4));
  style.setProperty("--arch-shift", reduced ? "0" : archShift.toFixed(3));

  particleTarget.level = particles;
  writeLanternTarget(
    Object.fromEntries(LANTERN_KEYS.map((key, i) => [key, lantern[i]])) as unknown as SceneState["lantern"],
  );
}

function tick(_time: number, deltaMs: number): void {
  const target = lerpFlat(scrollState(), flatStates[introKey], intro.mix);
  const alpha = 1 - Math.exp(-(deltaMs / 1000) * (3 / animations.scene.environmentScrub));
  current = current.map((v, i) => v + (target[i] - v) * alpha);
  write(current);
}

export function startEnvironment(reducedMotion: boolean): void {
  if (running) return;
  running = true;
  reduced = reducedMotion;
  root = document.documentElement;
  current = [...flatStates[introKey]];
  lastWritten = [];
  write(current);
  gsap.ticker.add(tick);
  ScrollTrigger.addEventListener("refresh", measure);
}

export function setIntroState(key: SceneStateKey): void {
  introKey = key;
  if (!running && root) {
    current = [...flatStates[introKey]];
    lastWritten = [];
    write(current);
  }
}

export function setEnvironmentReducedMotion(value: boolean): void {
  reduced = value;
  lastWritten = [];
}

/** Cross-fade from the intro state to the scroll-driven environment. */
export function releaseIntro(): gsap.core.Tween {
  measure();
  lastWritten = [];
  return gsap.to(intro, { mix: 0, duration: animations.mainReveal.environmentDuration, ease: "power2.inOut" });
}

export function remeasureEnvironment(): void {
  measure();
}

export function stopEnvironment(): void {
  running = false;
  gsap.ticker.remove(tick);
  ScrollTrigger.removeEventListener("refresh", measure);
}
