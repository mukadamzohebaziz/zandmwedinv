/**
 * lib/svg/splitSvgLayers.ts
 *
 * Splits one supplied SVG (envelope.svg / arch.svg) into one standalone SVG
 * document per named layer, preserving the original viewBox, <defs>,
 * <style> rules and every ancestor group (clip paths, masks) of the layer.
 *
 * Why: the supplied artwork is a single file, but each named group must be
 * animated independently in CSS 3D space. Each extracted layer is turned into
 * a Blob URL and rendered through an <img>, which keeps the layers isolated
 * (no duplicate-ID collisions between gradients), lets the browser rasterise
 * each one once on the GPU, and keeps the original artwork untouched.
 *
 * Called by EnvelopeLayers and IslamicArch once the SVG text is available
 * from lib/assets/assetStore.ts.
 *
 * Failure handling: if parsing fails or a layer ID is missing, that layer's
 * URL is omitted; callers render their CSS fallback when any layer is absent.
 *
 * Cleanup: callers must invoke `revokeLayerUrls` on unmount to release the
 * Blob URLs.
 */

export type LayerUrls<T extends string> = Partial<Record<T, string>>;

const KEEP_ALWAYS = new Set(["defs", "style"]);

function pruneToLayer(node: Element, target: Element): void {
  for (const child of Array.from(node.children)) {
    if (child === target) continue;
    if (KEEP_ALWAYS.has(child.tagName.toLowerCase())) continue;
    if (child.contains(target)) {
      pruneToLayer(child, target);
    } else {
      child.remove();
    }
  }
}

export function splitSvgLayers<T extends string>(svgText: string, layerIds: readonly T[]): LayerUrls<T> {
  const urls: LayerUrls<T> = {};

  try {
    const parser = new DOMParser();
    const source = parser.parseFromString(svgText, "image/svg+xml");
    if (source.querySelector("parsererror")) throw new Error("SVG parse error");

    const serializer = new XMLSerializer();

    for (const id of layerIds) {
      const documentCopy = source.cloneNode(true) as Document;
      const root = documentCopy.documentElement;
      const target = documentCopy.getElementById(id);
      if (!target) {
        console.warn(`[wedding] SVG layer "${id}" not found; fallback will be used.`);
        continue;
      }
      pruneToLayer(root, target);
      const blob = new Blob([serializer.serializeToString(documentCopy)], { type: "image/svg+xml" });
      urls[id] = URL.createObjectURL(blob);
    }
  } catch (error) {
    console.warn("[wedding] Could not split SVG layers; fallback will be used.", error);
  }

  return urls;
}

export function revokeLayerUrls<T extends string>(urls: LayerUrls<T>): void {
  for (const url of Object.values(urls)) {
    if (typeof url === "string") URL.revokeObjectURL(url);
  }
}
