/**
 * lib/animations/lanternAnimation.ts
 *
 * Shared, mutable motion targets for the 3D lantern and particle field.
 *
 * Why mutable objects instead of React state: the values change every frame
 * while scrolling. The environment director (lib/animations/environmentDirector.ts)
 * writes them from the scroll position; Lantern.tsx / ParticleField.tsx read
 * them inside `useFrame`. No React re-render ever happens during scroll.
 *
 * Scroll choreography (where the lantern sits per scene) is configured in
 * config/animations.ts → sceneStates[*].lantern. This file only adds the
 * gentle idle float/sway on top — the lantern never spins continuously.
 *
 * Reduced motion: the canvas stays mounted and the model is drawn static;
 * so these targets are simply ignored.
 */

import { animations, type SceneState } from "@/config/animations";

export type LanternTarget = SceneState["lantern"];

export const lanternTarget: LanternTarget = { ...animations.sceneStates.preloader.lantern };

export const particleTarget = { level: 0 };

export function writeLanternTarget(next: LanternTarget): void {
  Object.assign(lanternTarget, next);
}

/**
 * Idle offsets added on top of the scroll target.
 * `floatPx` is converted to world units by the caller (it depends on depth).
 */
export function lanternIdle(time: number) {
  const { lanternRotation, lanternFloat } = animations.threeD;
  return {
    floatPx: Math.sin(time * 0.8) * lanternFloat * 0.5,
    sway: Math.sin(time * 0.45) * lanternRotation * 0.35,
    tilt: Math.sin(time * 0.6 + 1.3) * lanternRotation * 0.12,
  };
}
