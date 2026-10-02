/**
 * components/three/prepareModel.ts
 *
 * Clones a loaded GLB scene, re-skins every mesh with a palette-driven
 * physically based gold material (keeping any supplied texture maps),
 * centres it at the origin and reports its size so callers can normalise
 * scale. Materials are returned for per-frame opacity / glow updates and
 * disposal.
 */

import { Box3, Color, Mesh, MeshStandardMaterial, Vector3, type Object3D } from "three";
import { theme } from "@/config/theme";

type MaterialSpec = (typeof theme.materials)["lantern" | "medallion"];

export function prepareModel(source: Object3D, spec: MaterialSpec, faceCamera = false) {
  const model = source.clone(true);
  const materials: MeshStandardMaterial[] = [];

  model.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    const original = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as MeshStandardMaterial;
    const material = new MeshStandardMaterial({
      color: new Color(theme.colors[spec.color]),
      metalness: spec.metalness,
      roughness: spec.roughness,
      envMapIntensity: spec.envMapIntensity,
      emissive: new Color(theme.colors[spec.emissive]),
      emissiveIntensity: 0,
      map: original?.map ?? null,
      normalMap: original?.normalMap ?? null,
      roughnessMap: original?.roughnessMap ?? null,
      metalnessMap: original?.metalnessMap ?? null,
      aoMap: original?.aoMap ?? null,
      transparent: true,
    });
    mesh.material = material;
    materials.push(material);
  });

  let size = new Box3().setFromObject(model).getSize(new Vector3());

  // Turn disc-like models so their thin axis faces the camera.
  if (faceCamera) {
    const thinnest = size.x <= size.y && size.x <= size.z ? "x" : size.y <= size.z ? "y" : "z";
    if (thinnest === "x") model.rotation.y = Math.PI / 2;
    if (thinnest === "y") model.rotation.x = Math.PI / 2;
    model.updateMatrixWorld(true);
    size = new Box3().setFromObject(model).getSize(new Vector3());
  }

  const center = new Box3().setFromObject(model).getCenter(new Vector3());
  model.position.sub(center);

  return { model, materials, size };
}
