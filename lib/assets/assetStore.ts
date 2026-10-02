/**
 * lib/assets/assetStore.ts
 *
 * Preloads every asset listed in `media.preload` (config/media.ts) and keeps
 * a record of what loaded and what failed.
 *
 * Triggered by WeddingPreloader on mount via `preloadAssets(onProgress)`.
 *
 * - "text" assets (SVGs) are kept in memory so EnvelopeLayers / IslamicArch
 *   can split them into independently animated layers without a second fetch.
 * - "binary" assets (GLB, MP3) are fetched to warm the HTTP cache; the GLB
 *   loader and audio elements then reuse the cached response.
 * - "image" assets are decoded through an Image element.
 *
 * Failure handling: every request is isolated. A failed asset is logged,
 * recorded as "failed" and simply counts as complete for progress purposes —
 * the preloader never waits forever on an optional asset (the hard cap lives
 * in config/animations.ts → preloader.maxDuration). Consumers check
 * `assetFailed(key)` / `getAssetText(key)` and render their fallback.
 *
 * Cleanup: nothing persistent is created besides the in-memory text cache.
 */

import { media } from "@/config/media";

export type AssetKey = (typeof media.preload)[number]["key"];
export type AssetStatus = "pending" | "loaded" | "failed";

const status = new Map<AssetKey, AssetStatus>();
const textCache = new Map<AssetKey, string>();
let inflight: Promise<void> | null = null;

export function assetStatus(key: AssetKey): AssetStatus {
  return status.get(key) ?? "pending";
}

export function assetFailed(key: AssetKey): boolean {
  return status.get(key) === "failed";
}

export function getAssetText(key: AssetKey): string | null {
  return textCache.get(key) ?? null;
}

async function loadOne(entry: (typeof media.preload)[number]): Promise<void> {
  try {
    if (entry.kind === "image") {
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("image failed to load"));
        img.src = entry.url;
      });
    } else {
      const response = await fetch(entry.url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (entry.kind === "text") {
        textCache.set(entry.key, await response.text());
      } else {
        await response.arrayBuffer();
      }
    }
    status.set(entry.key, "loaded");
  } catch (error) {
    status.set(entry.key, "failed");
    console.warn(`[wedding] Optional asset "${entry.key}" failed to load; using fallback.`, error);
  }
}

/** Loads all preload entries in parallel. Resolves once every entry has settled. */
export function preloadAssets(onProgress: (fraction: number) => void): Promise<void> {
  if (inflight) return inflight;

  const entries = media.preload;
  const total = entries.length + 1;
  let settled = 0;
  const tick = () => {
    settled += 1;
    onProgress(settled / total);
  };

  const fonts =
    typeof document !== "undefined" && "fonts" in document
      ? document.fonts.ready.then(() => undefined).catch(() => undefined)
      : Promise.resolve();

  inflight = Promise.all([
    fonts.then(tick),
    ...entries.map((entry) => loadOne(entry).then(tick)),
  ]).then(() => undefined);

  return inflight;
}
