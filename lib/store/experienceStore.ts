/**
 * lib/store/experienceStore.ts
 *
 * A tiny external store (no dependency) holding the experience-wide state
 * that several unrelated components need to agree on:
 *
 * - `phase`: "preloading" → "envelope" → "opening" → "revealed".
 *     preloading  WeddingPreloader is visible, assets are fetched.
 *     envelope    EnvelopeIntro waits for the guest's tap.
 *     opening     The envelope timeline is running (audio already unlocked).
 *     revealed    Main invitation is visible, smooth scroll + 3D are active.
 * - `reducedMotion`: mirrors `prefers-reduced-motion` (live).
 * - `webgl`: whether a WebGL context can be created.
 * - `musicOn`: user-facing sound toggle state.
 * - `lanternFailed` / `medallionFailed` / `threeDError`: set when a GLB or the
 *   WebGL context fails; ThreeDError shows the technical reason (no 2D stand-in).
 * - `dateRevealed`: set when the guest taps the medallion.
 *
 * Components subscribe with `useExperience(selector)` (useSyncExternalStore),
 * so only the components whose selected slice changes re-render.
 */

import { useSyncExternalStore } from "react";

export type Phase = "preloading" | "envelope" | "opening" | "revealed";

export type ExperienceState = {
  phase: Phase;
  reducedMotion: boolean;
  webgl: boolean;
  musicOn: boolean;
  audioAvailable: boolean;
  lanternFailed: boolean;
  medallionFailed: boolean;
  /** Human-readable technical reason when 3D cannot render (WebGL / GLB). */
  threeDError: string | null;
  dateRevealed: boolean;
};

let state: ExperienceState = {
  phase: "preloading",
  reducedMotion: false,
  webgl: true,
  musicOn: false,
  audioAvailable: true,
  lanternFailed: false,
  medallionFailed: false,
  threeDError: null,
  dateRevealed: false,
};

const listeners = new Set<() => void>();

export function getExperience(): ExperienceState {
  return state;
}

export function setExperience(patch: Partial<ExperienceState>): void {
  let changed = false;
  for (const key of Object.keys(patch) as (keyof ExperienceState)[]) {
    if (state[key] !== patch[key]) changed = true;
  }
  if (!changed) return;
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

export function subscribeExperience(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useExperience<T>(selector: (s: ExperienceState) => T): T {
  return useSyncExternalStore(
    subscribeExperience,
    () => selector(state),
    () => selector(state),
  );
}
