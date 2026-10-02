"use client";

/**
 * components/three/ThreeScene.tsx
 *
 * The single shared Three.js canvas (lantern, medallion, particles). It is
 * sized to the portrait frame, fixed behind the content and never receives
 * pointer events. Lighting comes from config/theme.ts; the environment map is
 * built from local Lightformers so no HDRI is fetched.
 *
 * GLBs load through components/three/loadModel.ts (GLTFLoader + Draco).
 * Each sits in its own error boundary so one failure can't take down the
 * canvas; failures are logged and surfaced via ThreeDError — never replaced
 * with a 2D stand-in. R3F's ResizeObserver keeps the canvas sized through
 * resize and orientation changes.
 */

import { Component, Suspense, useMemo, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { animations } from "@/config/animations";
import { theme } from "@/config/theme";
import { setExperience, useExperience } from "@/lib/store/experienceStore";
import { Lantern } from "./Lantern";
import { preloadModels } from "./loadModel";
import { Medallion } from "./Medallion";
import { ParticleField } from "./ParticleField";

preloadModels();

class ModelBoundary extends Component<
  { label: string; onError: (reason: string) => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`[3D] GLB load error: ${this.props.label} — ${reason}`, error);
    this.props.onError(reason);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const c = theme.colors;
const L = theme.lighting;

export default function ThreeScene() {
  const reduced = useExperience((s) => s.reducedMotion);
  const desktop = useMemo(() => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches, []);
  const { camera, maxDpr } = animations.threeD;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-y-0 left-1/2 z-[2] w-full max-w-[var(--frame-width)] -translate-x-1/2"
    >
      <Canvas
        dpr={[1, maxDpr]}
        camera={{ fov: camera.fov, position: [0, 0, camera.z], near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
        onCreated={({ gl, size }) => {
          gl.setClearColor(0x000000, 0);
          gl.domElement.addEventListener("webglcontextlost", () => {
            console.error("[3D] WebGL context lost");
            setExperience({ threeDError: "The WebGL context was lost by the browser / GPU driver. Reload the page to restore 3D." });
          });
          gl.domElement.addEventListener("webglcontextrestored", () => {
            console.info("[3D] WebGL context restored");
            setExperience({ threeDError: null });
          });
          console.info("[3D] Renderer ready", {
            webgl2: gl.capabilities.isWebGL2,
            alpha: gl.getContextAttributes()?.alpha,
            canvasCss: [Math.round(size.width), Math.round(size.height)],
            pixelRatio: gl.getPixelRatio(),
          });
        }}
      >
        <ambientLight color={c[L.ambient.color]} intensity={L.ambient.intensity} />
        <directionalLight color={c[L.key.color]} intensity={L.key.intensity} position={[...L.key.position]} />
        <directionalLight color={c[L.fill.color]} intensity={L.fill.intensity} position={[...L.fill.position]} />
        <directionalLight color={c[L.rim.color]} intensity={L.rim.intensity} position={[...L.rim.position]} />

        <Environment resolution={64} frames={1}>
          <Lightformer form="rect" intensity={2.2} color={c.white} position={[0, 4, 3]} scale={[6, 2, 1]} />
          <Lightformer form="rect" intensity={1.4} color={c.goldLight} position={[-4, 0, 2]} rotation-y={Math.PI / 2} scale={[4, 4, 1]} />
          <Lightformer form="rect" intensity={0.8} color={c.burgundySoft} position={[4, -1, -2]} rotation-y={-Math.PI / 2} scale={[4, 3, 1]} />
        </Environment>

        <ModelBoundary
          label="lantern"
          onError={(reason) => setExperience({ lanternFailed: true, threeDError: `lantern.glb failed to load: ${reason}` })}
        >
          <Suspense fallback={null}>
            <Lantern />
          </Suspense>
        </ModelBoundary>
        <ModelBoundary
          label="medallion"
          onError={(reason) => setExperience({ medallionFailed: true, threeDError: `medallion.glb failed to load: ${reason}` })}
        >
          <Suspense fallback={null}>
            <Medallion />
          </Suspense>
        </ModelBoundary>

        {!(reduced && animations.reducedMotion.disableParticles) && <ParticleField desktop={desktop} />}
      </Canvas>
    </div>
  );
}
