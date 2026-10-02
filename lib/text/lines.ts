/**
 * lib/text/lines.ts
 *
 * Copy in config/weddingData.ts marks editorial line breaks with "\n".
 * - `splitLines` returns the individual lines so scenes can reveal them one by one.
 * - `toSentence` joins them back for metadata, aria labels and calendar text.
 * - `splitVenue` breaks a comma-separated venue into address lines.
 */

export function splitLines(text: string): string[] {
  return text.split("\n").map((line) => line.trim()).filter(Boolean);
}

export function toSentence(text: string): string {
  return splitLines(text).join(" ");
}

export function splitVenue(venue: string): string[] {
  return venue
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part, index, all) => (index < all.length - 1 ? `${part},` : part));
}
