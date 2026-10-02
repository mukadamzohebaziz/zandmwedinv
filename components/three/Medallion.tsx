"use client";

/**
 * components/three/Medallion.tsx
 *
 * The Islamic medallion for the date reveal. Every frame it maps the DOM
 * anchor registered by DateRevealScene into world space (so it scrolls with
 * the page and follows the anchor's GSAP transforms), then applies:
 * idle sway + float, the scroll tilt, and the tap reveal — a configured
 * rotation with a brief lift toward the viewer and a warm glow.
 * Not rendered while its anchor is off screen.
 */

import { use, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group, type PerspectiveCamera } from "three";
import { animations } from "@/config/animations";
import { media } from "@/config/media";
import { theme } from "@/config/theme";
import { medallionMotion } from "@/lib/animations/medallionAnimation";
import { useExperience } from "@/lib/store/experienceStore";
import { loadModel } from "./loadModel";
import { prepareModel } from "./prepareModel";

const spec = theme.materials.medallion;
const t3 = animations.threeD;

export function Medallion() {
  const { scene } = use(loadModel(media.models.medallion, "medallion"));
  const { model, materials, size } = useMemo(() => prepareModel(scene, spec, true), [scene]);
  const reduced = useExperience((s) => s.reducedMotion);
  const groupRef = useRef<Group>(null);
  const tilt = useRef(0);
  const framingLogged = useRef(false);
  const diameter = Math.max(size.x, size.y, 1e-3);

  useEffect(() => {
    for (const m of materials) {
      m.transparent = false;
      m.opacity = 1;
    }
    console.info("[3D] Medallion added to scene", {
      inScene: !!groupRef.current?.parent,
      materials: materials.length,
      modelSize: size.toArray().map((n) => Number(n.toFixed(3))),
    });
    return () => materials.forEach((m) => m.dispose());
  }, [materials, size]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const anchor = medallionMotion.anchor;
    if (!group) return;
    if (!anchor) {
      group.visible = false;
      return;
    }
    const rect = anchor.getBoundingClientRect();
    const onScreen = rect.bottom > -rect.height * 0.5 && rect.top < window.innerHeight + rect.height * 0.5;
    group.visible = onScreen;
    if (!onScreen) return;

    const canvas = state.gl.domElement.getBoundingClientRect();
    const camera = state.camera as PerspectiveCamera;
    const halfH = Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const pxToWorld = (2 * halfH) / state.size.height;
    const time = reduced ? 0 : state.clock.elapsedTime;
    const motion = reduced ? 0 : 1;
    const reveal = medallionMotion.reveal;
    const lift = Math.sin(reveal * Math.PI) * motion;
    const worldSize = rect.width * pxToWorld;

    const cx = rect.left + rect.width / 2 - canvas.left - state.size.width / 2;
    const cy = rect.top + rect.height / 2 - canvas.top - state.size.height / 2;
    const float = Math.sin(time * 0.9) * t3.medallionIdleFloat * worldSize * motion;

    tilt.current = reduced ? 0 : MathUtils.damp(tilt.current, medallionMotion.tilt, 4, Math.min(delta, 0.1));

    group.position.set(cx * pxToWorld, -cy * pxToWorld + float, lift * 0.6);
    group.scale.setScalar((worldSize / diameter) * 0.92 * t3.medallionScale * (1 + lift * t3.medallionRevealBoost));
    group.rotation.set(
      tilt.current + Math.sin(time * 0.5 + 0.8) * t3.medallionIdleSway * 0.4 * motion,
      MathUtils.degToRad(t3.medallionRotation) * reveal * motion + Math.sin(time * 0.6) * t3.medallionIdleSway * motion,
      0,
    );

    if (!framingLogged.current) {
      framingLogged.current = true;
      const halfW = halfH * camera.aspect;
      const radius = (worldSize * 0.92) / 2;
      console.info("[3D] Medallion first visible frame", {
        canvasPx: [Math.round(state.size.width), Math.round(state.size.height)],
        worldPosition: group.position.toArray().map((n) => Number(n.toFixed(3))),
        worldDiameter: Number((radius * 2).toFixed(3)),
        frustumHalfExtent: [Number(halfW.toFixed(3)), Number(halfH.toFixed(3))],
        fitsHorizontally: radius <= halfW,
      });
    }

    const glow = 0.35 + lift * 1.6 + reveal * 0.5;
    for (const m of materials) m.emissiveIntensity = spec.emissiveIntensity * glow;
  });

  return (
    <group ref={groupRef} visible={false}>
      <primitive object={model} />
    </group>
  );
}
