/**
 * lib/animations/envelopeAnimation.ts
 *
 * GSAP choreography for the layered SVG envelope (components/wedding/envelope).
 * All timings / angles come from config/animations.ts → envelope.
 *
 * Depth model: the stage has CSS `perspective`; the rig (whole envelope) tilts
 * and moves in Z; each layer rotates about its real fold:
 *   flap-top    → rotateX about its top edge (opens up toward the viewer)
 *   flap-left   → rotateY about its left edge (eases outward)
 *   flap-right  → rotateY about its right edge (eases outward)
 *   flap-bottom → small rotateX about its bottom edge (stays grounded)
 * When the top flap passes vertical it drops behind the invitation card
 * (z-index swap) so the card can rise in front of it — exactly as paper does.
 */

import gsap from "gsap";
import { animations } from "@/config/animations";

export type EnvelopeRefs = {
  rig: HTMLElement;
  prompt: HTMLElement | null;
  seal: HTMLElement | null;
  flapTop: HTMLElement | null;
  flapLeft: HTMLElement | null;
  flapRight: HTMLElement | null;
  flapBottom: HTMLElement | null;
  card: HTMLElement | null;
  shadow: HTMLElement | null;
};

export type OpeningCallbacks = {
  onSparkle: () => void;
  onReveal: () => void;
  onComplete: () => void;
};

const E = animations.envelope;

/** Rise-in, then a gentle idle float + tilt and the breathing "Tap to open" prompt. */
export function playEnvelopeEntrance(refs: EnvelopeRefs, reduced: boolean): gsap.core.Timeline {
  const tl = gsap.timeline();

  if (reduced) {
    tl.fromTo(refs.rig, { opacity: 0 }, { opacity: 1, duration: animations.reducedMotion.fadeDuration });
    if (refs.prompt) tl.fromTo(refs.prompt, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    return tl;
  }

  tl.fromTo(
    refs.rig,
    { opacity: 0, y: E.entranceRise, rotationX: E.idleTiltX * 1.6, rotationY: 0, scale: 0.94 },
    {
      opacity: 1,
      y: 0,
      rotationX: E.idleTiltX,
      rotationY: E.idleTiltY,
      scale: 1,
      duration: E.entranceDuration,
      ease: "power3.out",
    },
  );

  if (refs.shadow) {
    tl.fromTo(refs.shadow, { opacity: 0, scaleX: 0.7 }, { opacity: 1, scaleX: 1, duration: E.entranceDuration }, 0);
  }

  tl.add(
    gsap.to(refs.rig, {
      y: -E.idleFloat,
      rotationY: -E.idleTiltY * 0.4,
      duration: E.idleFloatDuration,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    }),
  );

  if (refs.prompt) {
    tl.fromTo(refs.prompt, { opacity: 0 }, { opacity: 1, duration: 0.8 }, E.entranceDuration * 0.6);
    tl.add(
      gsap.fromTo(
        refs.prompt,
        { opacity: 1 },
        {
          opacity: E.promptPulseMin,
          duration: E.promptPulseDuration / 2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        },
      ),
      E.entranceDuration * 0.6 + 0.8,
    );
  }

  return tl;
}

export function playEnvelopeOpening(
  refs: EnvelopeRefs,
  reduced: boolean,
  callbacks: OpeningCallbacks,
): gsap.core.Timeline {
  gsap.killTweensOf([refs.rig, refs.prompt]);
  const tl = gsap.timeline({ onComplete: callbacks.onComplete });

  if (reduced) {
    const fade = animations.reducedMotion.fadeDuration;
    if (refs.prompt) tl.to(refs.prompt, { opacity: 0, duration: fade * 0.5 });
    tl.call(callbacks.onSparkle);
    tl.call(callbacks.onReveal);
    tl.to(refs.rig, { opacity: 0, duration: fade });
    if (refs.shadow) tl.to(refs.shadow, { opacity: 0, duration: fade }, "<");
    return tl;
  }

  // 1. Prompt fades down.
  if (refs.prompt) {
    tl.to(refs.prompt, { opacity: 0, y: E.promptDrop, duration: E.promptFadeDuration, ease: "power2.in" });
  }

  // 2–3. Seal compresses, then releases with a small lift — never a violent break.
  if (refs.seal) {
    tl.to(refs.seal, { scale: E.sealPressScale, duration: E.sealDuration * 0.5, ease: "power2.in" }, "<0.1");
    tl.to(refs.seal, { scale: 1, duration: E.sealDuration * 0.5, ease: "power2.out" });
    tl.to(refs.seal, {
      y: E.sealReleaseY,
      scale: E.sealReleaseScale,
      rotation: E.sealReleaseRotation,
      opacity: 0,
      duration: E.sealReleaseDuration,
      ease: "power2.out",
    });
  }

  tl.addLabel("flap", refs.seal ? "-=0.35" : ">");

  // The envelope settles square to the viewer while it opens.
  tl.to(refs.rig, { y: 0, rotationX: E.idleTiltX * 0.4, rotationY: 0, duration: E.flapOpenDuration, ease: "power2.inOut" }, "flap");

  // 4. Top flap rotates open around its fold, dropping behind the card once past vertical.
  if (refs.flapTop) {
    tl.to(refs.flapTop, { rotationX: E.flapRotation, duration: E.flapOpenDuration, ease: "power2.inOut" }, "flap");
    tl.set(refs.flapTop, { zIndex: 1 }, `flap+=${E.flapOpenDuration * 0.5}`);
  }

  // 5. Side and bottom flaps move subtly.
  if (refs.flapLeft) tl.to(refs.flapLeft, { rotationY: -E.sideFlapAngle, duration: E.flapOpenDuration }, "flap");
  if (refs.flapRight) tl.to(refs.flapRight, { rotationY: E.sideFlapAngle, duration: E.flapOpenDuration }, "flap");
  if (refs.flapBottom) tl.to(refs.flapBottom, { rotationX: -E.bottomFlapAngle, duration: E.flapOpenDuration }, "flap");

  // 6 + 9. Interior card rises out of the envelope; sparkle at that moment.
  const riseAt = `flap+=${E.flapOpenDuration * 0.62}`;
  if (refs.card) {
    tl.to(refs.card, { yPercent: -E.cardRise, duration: E.cardRiseDuration, ease: "power3.out" }, riseAt);
  }
  tl.call(callbacks.onSparkle, undefined, riseAt);

  // 7. Camera-like push toward the envelope.
  const pushAt = `${riseAt}+=${E.cardRiseDuration * 0.55}`;
  tl.to(refs.rig, { z: E.cameraPush, scale: 1.03, duration: E.cameraDuration * 0.42, ease: "power2.inOut" }, pushAt);

  // 8 + 10. Envelope recedes and blurs as the invitation takes focus.
  tl.addLabel("recede", `${pushAt}+=${E.cameraDuration * 0.42}`);
  tl.call(callbacks.onReveal, undefined, "recede");
  tl.to(
    refs.rig,
    {
      z: E.recedeDepth,
      scale: E.recedeScale,
      opacity: 0,
      filter: `blur(${E.recedeBlur}px)`,
      duration: E.cameraDuration * 0.58,
      ease: "power2.in",
    },
    "recede",
  );
  if (refs.shadow) tl.to(refs.shadow, { opacity: 0, duration: E.cameraDuration * 0.4 }, "recede");

  return tl;
}
