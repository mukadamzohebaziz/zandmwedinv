"use client";

/**
 * components/three/ThreeDError.tsx
 *
 * Plain technical notice shown when WebGL is unavailable or a GLB failed.
 * It deliberately draws no stand-in model — it states what broke.
 */

import { useExperience } from "@/lib/store/experienceStore";

export function ThreeDError() {
  const message = useExperience((s) => s.threeDError);
  if (!message) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-sm flex-col gap-1 rounded-md border border-gold bg-burgundy px-4 py-3 font-sans text-sm leading-relaxed text-gold-light"
    >
      <strong className="font-semibold">3D rendering unavailable</strong>
      <span className="text-pretty">{message}</span>
    </div>
  );
}
