"use client";

/**
 * components/three/Lantern.tsx
 *
 * The recurring champagne-gold lantern. Each frame it eases toward
 * `lanternTarget` (written from scroll by the environment director) and adds a
 * gentle idle float/sway — it never spins on its own. x / y are fractions of
 * the visible half-extent at the lantern's depth so the composition holds on
 * every phone width. Hidden entirely when transparent.
 */

import { use, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group, type PerspectiveCamera, type PointLight } from "three";
import { animations } from "@/config/animations";
import { media } from "@/config/media";
import { theme } from "@/config/theme";
import { lanternIdle, lanternTarget } from "@/lib/animations/lanternAnimation";
import { useExperience } from "@/lib/store/experienceStore";
import { loadModel } from "./loadModel";
import { prepareModel } from "./prepareModel";

const spec = theme.materials.lantern;
const { damp } = MathUtils;

export function Lantern() {
  const { scene } = use(loadModel(media.models.lantern, "lantern"));
  const { model, materials, size } = useMemo(() => prepareModel(scene, spec), [scene]);
  const reduced = useExperience((s) => s.reducedMotion);
  const groupRef = useRef<Group>(null);
  const lightRef = useRef<PointLight>(null);
  const current = useRef({ ...lanternTarget });
  const framingLogged = useRef(false);
  const normalise = animations.threeD.lanternBaseHeight / Math.max(size.y, 1e-3);

  useEffect(() => {
    console.info("[3D] Lantern added to scene", {
      inScene: !!groupRef.current?.parent,
      materials: materials.length,
      modelSize: size.toArray().map((n) => Number(n.toFixed(3))),
    });
    return () => materials.forEach((m) => m.dispose());
  }, [materials, size]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const dt = Math.min(delta, 0.1);
    const k = animations.threeD.lanternDamping;
    const cur = current.current;
    for (const key of Object.keys(cur) as (keyof typeof cur)[]) {
      cur[key] = reduced ? lanternTarget[key] : damp(cur[key], lanternTarget[key], k, dt);
    }

    group.visible = cur.opacity > 0.01;
    if (!group.visible) return;

    const camera = state.camera as PerspectiveCamera;
    const depth = camera.position.z - cur.z;
    const halfH = Math.tan(MathUtils.degToRad(camera.fov / 2)) * depth;
    const halfW = halfH * camera.aspect;
    const idle = reduced ? { floatPx: 0, tilt: 0, sway: 0 } : lanternIdle(state.clock.elapsedTime);
    const pxToWorld = (2 * halfH) / state.size.height;

    group.position.set(cur.x * halfW, cur.y * halfH + idle.floatPx * pxToWorld, cur.z);
    group.rotation.set(cur.rotationX + idle.tilt, cur.rotationY + idle.sway, 0);
    group.scale.setScalar(normalise * cur.scale * animations.threeD.lanternScale);

    if (!framingLogged.current) {
      framingLogged.current = true;
      const worldHeight = size.y * group.scale.y;
      console.info("[3D] Lantern first visible frame", {
        canvasPx: [Math.round(state.size.width), Math.round(state.size.height)],
        worldPosition: group.position.toArray().map((n) => Number(n.toFixed(3))),
        worldHeight: Number(worldHeight.toFixed(3)),
        frustumHalfExtent: [Number(halfW.toFixed(3)), Number(halfH.toFixed(3))],
        fitsVertically: worldHeight <= halfH * 2,
      });
    }

    for (const material of materials) {
      material.opacity = cur.opacity;
      material.depthWrite = cur.opacity > 0.6;
      material.emissiveIntensity = spec.emissiveIntensity * cur.glow;
    }
    if (lightRef.current) lightRef.current.intensity = theme.lighting.lanternPoint.intensity * cur.glow * cur.opacity;
  });

  return (
    <group ref={groupRef} visible={false}>
      <primitive object={model} />
      <pointLight
        ref={lightRef}
        color={theme.colors[theme.lighting.lanternPoint.color]}
        distance={theme.lighting.lanternPoint.distance / normalise}
        intensity={0}
      />
    </group>
  );
}
