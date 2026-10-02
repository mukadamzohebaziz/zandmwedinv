/**
 * components/wedding/ui/SceneWrapper.tsx
 *
 * One scroll-telling scene. The outer <section> carries `data-scene`, which the
 * environment director reads to know which background / arch / lantern state
 * (config/animations.ts → sceneStates) applies here. The inner element is the
 * portrait frame and is the element that gets pinned, so the section's own
 * position stays stable for measuring.
 */

import type { ReactNode, Ref } from "react";
import type { SceneStateKey } from "@/config/animations";
import { cn } from "@/lib/utils";

type Props = {
  scene: SceneStateKey;
  label: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  sectionRef?: Ref<HTMLElement>;
  innerRef?: Ref<HTMLDivElement>;
};

export function SceneWrapper({ scene, label, children, className, innerClassName, sectionRef, innerRef }: Props) {
  return (
    <section ref={sectionRef} data-scene={scene} aria-label={label} className={cn("relative", className)}>
      <div
        ref={innerRef}
        className={cn(
          "invitation-frame relative flex min-h-svh flex-col items-center justify-center px-[var(--gutter)] py-24 text-center",
          innerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
