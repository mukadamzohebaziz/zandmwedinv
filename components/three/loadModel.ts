/**
 * components/three/loadModel.ts
 *
 * Explicit Three.js GLTFLoader pipeline for the two GLBs. One shared loader
 * (with a local Draco decoder — medallion.glb is Draco-compressed) and a
 * per-URL promise cache, so React's `use()` can suspend on it and every
 * component asking for the same URL shares one request.
 *
 * Every stage is logged with a `[3D]` prefix: request, progress,
 * parse success (mesh / vertex count, bounds) and failures with the reason.
 */

import { Box3, Vector3, type Mesh } from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { media } from "@/config/media";

const TAG = "[3D]";
const title = (label: string) => label.charAt(0).toUpperCase() + label.slice(1);

let loader: GLTFLoader | null = null;
const cache = new Map<string, Promise<GLTF>>();

function getLoader(): GLTFLoader {
  if (loader) return loader;
  const draco = new DRACOLoader();
  draco.setDecoderPath(media.models.dracoDecoderPath);
  draco.setDecoderConfig({ type: "wasm" });
  draco.preload();
  loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  return loader;
}

function describe(gltf: GLTF) {
  let meshes = 0;
  let vertices = 0;
  gltf.scene.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    meshes += 1;
    vertices += mesh.geometry.attributes.position?.count ?? 0;
  });
  const size = new Box3().setFromObject(gltf.scene).getSize(new Vector3());
  return { meshes, vertices, size: size.toArray().map((n) => Number(n.toFixed(3))) };
}

export function loadModel(url: string, label: string): Promise<GLTF> {
  const cached = cache.get(url);
  if (cached) return cached;

  console.info(`${TAG} Loading ${label}... (${url})`);
  const startedAt = performance.now();
  let lastLoggedPct = -1;

  const promise = new Promise<GLTF>((resolve, reject) => {
    getLoader().load(
      url,
      (gltf) => {
        const ms = Math.round(performance.now() - startedAt);
        const info = describe(gltf);
        if (info.meshes === 0) {
          const error = new Error(`${url} parsed but contains no meshes`);
          console.error(`${TAG} GLB load error: ${label} — ${error.message}`);
          reject(error);
          return;
        }
        console.info(`${TAG} ${title(label)} loaded (${ms}ms)`, info);
        resolve(gltf);
      },
      (event) => {
        if (!event.lengthComputable) return;
        const pct = Math.floor((event.loaded / event.total) * 4) * 25;
        if (pct === lastLoggedPct) return;
        lastLoggedPct = pct;
        console.info(`${TAG} ${title(label)} ${pct}% (${event.loaded}/${event.total} bytes)`);
      },
      (error) => {
        const reason = error instanceof Error ? error.message : String(error);
        console.error(`${TAG} GLB load error: ${label} (${url}) — ${reason}`, error);
        cache.delete(url);
        reject(error instanceof Error ? error : new Error(reason));
      },
    );
  });

  cache.set(url, promise);
  return promise;
}

/** Kicks off both requests early. Errors are already logged inside loadModel and rethrown to the suspending component. */
export function preloadModels(): void {
  for (const [url, label] of [
    [media.models.lantern, "lantern"],
    [media.models.medallion, "medallion"],
  ] as const) {
    loadModel(url, label).catch(() => undefined);
  }
}
