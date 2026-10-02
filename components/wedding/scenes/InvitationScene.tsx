"use client";

/**
 * components/wedding/scenes/InvitationScene.tsx
 *
 * The invitation title, one line at a time, scrubbed while the scene is pinned
 * (animations.invitation.pinDistance). Under reduced motion it simply shows.
 */

import { useRef } from "react";
import { animations } from "@/config/animations";
import { weddingData } from "@/config/weddingData";
import { pinnedTimeline } from "@/lib/animations/sceneAnimations";
import { splitLines } from "@/lib/text/lines";
import { typeStyle } from "@/lib/theme/typeStyle";
import { SceneWrapper } from "../ui/SceneWrapper";
import { useSceneAnimation } from "../ui/useSceneAnimation";

export function InvitationScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { invitation } = animations;

  useSceneAnimation(sectionRef, (reduced) => {
    const tl = pinnedTimeline(innerRef.current as HTMLDivElement, invitation.pinDistance, reduced);
    if (!tl) return;
    tl.fromTo("[data-rule]", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.6 });
    gsapLines(tl);
    tl.to({}, { duration: 0.5 });
  });

  function gsapLines(tl: gsap.core.Timeline) {
    tl.fromTo(
      "[data-line]",
      { opacity: 0, yPercent: invitation.lineYPercent, filter: `blur(${invitation.lineBlur}px)` },
      { opacity: 1, yPercent: 0, filter: "blur(0px)", duration: 1, stagger: 0.8 },
    );
  }

  return (
    <SceneWrapper scene="invitation" label="Invitation" sectionRef={sectionRef} innerRef={innerRef} innerClassName="gap-8">
      <span data-rule aria-hidden className="gold-rule w-20" />
      <h1 className="flex flex-col text-balance text-burgundy" style={typeStyle("heroTitle")}>
        {splitLines(weddingData.text.title).map((line) => (
          <span key={line} data-line className="block">
            {line}
          </span>
        ))}
      </h1>
      <span data-rule aria-hidden className="gold-rule w-20" />
    </SceneWrapper>
  );
}
