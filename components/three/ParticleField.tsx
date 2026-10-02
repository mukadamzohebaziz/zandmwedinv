"use client";

/**
 * components/three/ParticleField.tsx
 *
 * Very quiet champagne dust (one Points draw call across several depths) and a
 * handful of drifting rose petals (one instanced mesh). Overall visibility
 * follows `particleTarget.level`, set per scene by the environment director.
 * Counts are capped for mobile (animations.threeD.particleCount / petalCount).
 */

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  DoubleSide,
  MathUtils,
  MeshBasicMaterial,
  Object3D,
  PointsMaterial,
  type InstancedMesh,
  type Points,
} from "three";
import { animations } from "@/config/animations";
import { theme } from "@/config/theme";
import { particleTarget } from "@/lib/animations/lanternAnimation";

const t3 = animations.threeD;
const SPREAD = { x: 2.2, y: 3.4, zNear: 1.5, zFar: -1.5 - t3.particleDepth * 10 };

function dotTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.55)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new CanvasTexture(canvas);
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function ParticleField({ desktop }: { desktop: boolean }) {
  const dustCount = desktop ? t3.particleCount.desktop : t3.particleCount.mobile;
  const petalCount = desktop ? t3.petalCount.desktop : t3.petalCount.mobile;
  const pointsRef = useRef<Points>(null);
  const petalsRef = useRef<InstancedMesh>(null);
  const level = useRef(0);

  const dust = useMemo(() => {
    const positions = new Float32Array(dustCount * 3);
    const colors = new Float32Array(dustCount * 3);
    const seeds = new Float32Array(dustCount);
    const palette = theme.materials.particles.dust.map((token) => new Color(theme.colors[token]));
    for (let i = 0; i < dustCount; i += 1) {
      positions.set([rand(-SPREAD.x, SPREAD.x), rand(-SPREAD.y, SPREAD.y), rand(SPREAD.zFar, SPREAD.zNear)], i * 3);
      const color = palette[i % palette.length];
      colors.set([color.r, color.g, color.b], i * 3);
      seeds[i] = Math.random() * Math.PI * 2;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("color", new BufferAttribute(colors, 3));
    const material = new PointsMaterial({
      size: t3.particleSize,
      map: dotTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: AdditiveBlending,
      sizeAttenuation: true,
    });
    return { geometry, material, seeds };
  }, [dustCount]);

  const petals = useMemo(() => {
    const geometry = new CircleGeometry(t3.petalSize, 10);
    geometry.scale(1, 0.58, 1);
    const tokens = theme.materials.particles.petals;
    const material = new MeshBasicMaterial({
      color: new Color(1, 1, 1),
      side: DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const state = Array.from({ length: petalCount }, () => ({
      x: rand(-SPREAD.x, SPREAD.x),
      y: rand(-SPREAD.y, SPREAD.y),
      z: rand(-4, 0.5),
      spin: rand(0.2, 0.7),
      phase: rand(0, Math.PI * 2),
      tint: Math.random(),
    }));
    return { geometry, material, state, tints: tokens.map((t) => new Color(theme.colors[t])) };
  }, [petalCount]);

  useEffect(
    () => () => {
      dust.geometry.dispose();
      dust.material.map?.dispose();
      dust.material.dispose();
      petals.geometry.dispose();
      petals.material.dispose();
    },
    [dust, petals],
  );

  useEffect(() => {
    const mesh = petalsRef.current;
    if (!mesh) return;
    const color = new Color();
    petals.state.forEach((p, i) => mesh.setColorAt(i, color.copy(petals.tints[0]).lerp(petals.tints[1] ?? petals.tints[0], p.tint)));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [petals]);

  const dummy = useMemo(() => new Object3D(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const time = state.clock.elapsedTime;
    level.current = MathUtils.damp(level.current, particleTarget.level, 2, dt);
    const visible = level.current > 0.01;

    const points = pointsRef.current;
    if (points) {
      points.visible = visible;
      dust.material.opacity = level.current * 0.75;
      if (visible) {
        const pos = dust.geometry.attributes.position as BufferAttribute;
        for (let i = 0; i < dustCount; i += 1) {
          let y = pos.getY(i) + t3.particleSpeed * dt * (0.6 + (i % 5) * 0.12);
          if (y > SPREAD.y) y = -SPREAD.y;
          pos.setY(i, y);
          pos.setX(i, pos.getX(i) + Math.sin(time * 0.3 + dust.seeds[i]) * 0.0008);
        }
        pos.needsUpdate = true;
      }
    }

    const mesh = petalsRef.current;
    if (mesh) {
      mesh.visible = visible;
      petals.material.opacity = level.current * 0.4;
      if (visible) {
        petals.state.forEach((p, i) => {
          p.y -= t3.petalSpeed * dt;
          if (p.y < -SPREAD.y) {
            p.y = SPREAD.y;
            p.x = rand(-SPREAD.x, SPREAD.x);
          }
          dummy.position.set(p.x + Math.sin(time * 0.4 + p.phase) * 0.25, p.y, p.z);
          dummy.rotation.set(time * p.spin + p.phase, Math.sin(time * 0.5 + p.phase) * 1.2, time * p.spin * 0.5);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <>
      <points ref={pointsRef} geometry={dust.geometry} material={dust.material} frustumCulled={false} />
      <instancedMesh ref={petalsRef} args={[petals.geometry, petals.material, petalCount]} frustumCulled={false} />
    </>
  );
}
