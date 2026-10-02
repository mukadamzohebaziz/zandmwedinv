"use client";

/**
 * components/wedding/scenes/CoupleScene.tsx
 *
 * Names are the largest element, parents secondary, the ampersand the focal
 * point. Depth (back → front): arch (global) → geometric ornament → lantern
 * (3D canvas) → names → parents. Pinned for animations.couple.pinDistance.
 */

import { Fragment, useRef } from "react";
import { animations } from "@/config/animations";
import { weddingData } from "@/config/weddingData";
import { pinnedTimeline } from "@/lib/animations/sceneAnimations";
import { splitLines } from "@/lib/text/lines";
import { typeStyle } from "@/lib/theme/typeStyle";
import { GeometricOrnament } from "../ui/GeometricOrnament";
import { SceneWrapper } from "../ui/SceneWrapper";
import { useSceneAnimation } from "../ui/useSceneAnimation";

const { couple } = weddingData;

export function CoupleScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const a = animations.couple;

  useSceneAnimation(sectionRef, (reduced) => {
    const tl = pinnedTimeline(innerRef.current as HTMLDivElement, a.pinDistance, reduced);
    if (!tl) return;
    const nameFrom = { opacity: 0, y: a.nameDistance, filter: `blur(${a.nameBlur}px)` };
    const nameTo = { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 };
    tl.fromTo("[data-ornament]", { opacity: 0, rotate: -a.ornamentRotation, scale: 0.85 }, { opacity: 1, rotate: 0, scale: 1, duration: 3 }, 0)
      .fromTo("[data-name='1']", nameFrom, nameTo, 0)
      .fromTo("[data-parents='1']", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, 0.6)
      .fromTo("[data-amp]", { opacity: 0, scale: a.ampersandFromScale }, { opacity: 1, scale: 1, duration: 1, ease: "back.out(1.4)" }, 1.3)
      .fromTo("[data-name='2']", nameFrom, nameTo, 2)
      .fromTo("[data-parents='2']", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, 2.6)
      .to({}, { duration: 0.6 });
  });

  const person = (index: 1 | 2, name: string, parents: string) => (
    <div className="flex flex-col items-center gap-3">
      <h2 data-name={index} className="text-burgundy" style={typeStyle("coupleName")}>
        {name}
      </h2>
      <p data-parents={index} className="flex flex-col text-ink-soft" style={typeStyle("parents")}>
        {splitLines(parents).map((line) => (
          <Fragment key={line}>
            <span className="block">{line}</span>
          </Fragment>
        ))}
      </p>
    </div>
  );

  return (
    <SceneWrapper scene="couple" label="The couple" sectionRef={sectionRef} innerRef={innerRef} innerClassName="gap-4">
      <div data-ornament aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center">
        <GeometricOrnament className="aspect-square w-[118%] max-w-none text-gold/30" strokeWidth={0.35} />
      </div>
      <div className="relative flex flex-col items-center gap-4">
        {person(1, couple.partnerOne, couple.partnerOneParents)}
        <span data-amp aria-hidden className="block text-gold" style={typeStyle("ampersand")}>
          {weddingData.text.ampersand}
        </span>
        {person(2, couple.partnerTwo, couple.partnerTwoParents)}
      </div>
    </SceneWrapper>
  );
}
