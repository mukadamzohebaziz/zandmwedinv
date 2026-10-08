"use client";

import { useRef } from "react";
import { SceneWrapper } from "@/components/wedding/layout/SceneWrapper";
import { useSceneAnimation } from "@/hooks/useSceneAnimation";
import { pinnedTimeline } from "@/lib/animation/gsapUtils";
import { animations } from "@/config/animations";
import { weddingData } from "@/config/weddingData";
import { splitLines } from "@/lib/utils/formatters";
import { typeStyle } from "@/config/typography";

export function InvitationScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { invitation } = animations;

  useSceneAnimation(sectionRef, (reduced) => {
    const tl = pinnedTimeline(innerRef.current as HTMLDivElement, invitation.pinDistance, reduced);
    if (!tl) return;

    tl.fromTo(
      "[data-line]",
      { opacity: 0, y: 24, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, stagger: invitation.lineStagger }
    );
  });

  return (
    <SceneWrapper scene="invitation" label="Invitation" sectionRef={sectionRef} innerRef={innerRef}>
      <p className="flex flex-col gap-2 text-center text-burgundy" style={typeStyle("heroTitle")}>
        {splitLines(weddingData.text.invitationTitle).map((line) => (
          <span key={line} data-line className="block">
            {line}
          </span>
        ))}
      </p>
    </SceneWrapper>
  );
}
