/**
 * config/site.ts
 *
 * Production URL, SEO copy and branding used by:
 * - app/layout.tsx  → Next.js metadata (canonical, Open Graph, Twitter, icons, robots)
 *                     and viewport theme colour.
 * - app/manifest.ts → web app manifest.
 * - components/seo/StructuredData.tsx → JSON-LD URLs.
 *
 * The URL is defined exactly once here; everything else derives from it.
 */

import { palette } from "./theme";

export const siteConfig = {
  url: "https://zohebwedsmuskan27dec2026.vercel.app/",

  title: "Zoheb & Muskan | Wedding Invitation",

  description:
    "With the grace of Almighty Allah, we cordially invite you to celebrate the wedding of Zoheb & Muskan.",

  ogImage: "/assets/og-image.jpg",
  ogImageWidth: 600,
  ogImageHeight: 315,
  ogImageAlt: "Zoheb & Muskan wedding invitation",

  favicon: "/assets/icon.svg",

  initials: "Z & M",

  locale: "en_IN",
  language: "en",

  themeColor: palette.background,
} as const;

export type SiteConfig = typeof siteConfig;
