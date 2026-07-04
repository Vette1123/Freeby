/**
 * Single source of truth for the Freeby brand mark.
 *
 * Freeby is a clean, fast invoicing + time-tracking tool for freelancers. The
 * mark is an indigo rounded-square badge with a white "f" monogram and a
 * white check badge at its foot, conveying "invoicing done." It is rendered
 * statically as `app/icon.svg` and reused by the generated `apple-icon` and
 * Open Graph routes via `svgToDataUri`.
 */
import { env } from "@/env";

/** The bare host (no protocol) for display contexts like the OG image / PDFs. */
export function brandHost(): string {
  try {
    return new URL(env.NEXT_PUBLIC_APP_URL).host;
  } catch {
    return "freeby.app";
  }
}

export const BRAND = {
  name: "Freeby",
  tagline: "Invoicing without the bloat",
  author: "Freeby",
  /** Full site URL — derived from NEXT_PUBLIC_APP_URL at runtime. */
  get site(): string {
    return env.NEXT_PUBLIC_APP_URL;
  },
  // Indigo scale (hue ~243) matching the `--primary` token in globals.css.
  indigoLight: "#818cf8",
  indigo: "#4f46e5",
  indigoDark: "#3730a3",
  check: "#ffffff",
  ink: "#0a0a0a",
} as const;

/** Renders the brand badge as a standalone SVG string at the given size. */
export function brandBadgeSvg({
  size = 512,
  radius = 112,
}: { size?: number; radius?: number } = {}): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" role="img" aria-label="${BRAND.name}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fb-bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${BRAND.indigoLight}"/>
      <stop offset=".5" stop-color="${BRAND.indigo}"/>
      <stop offset="1" stop-color="${BRAND.indigoDark}"/>
    </linearGradient>
    <linearGradient id="fb-sheen" x1="256" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity=".28"/>
      <stop offset=".5" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${radius}" fill="url(#fb-bg)"/>
  <rect width="512" height="512" rx="${radius}" fill="url(#fb-sheen)"/>
  <path d="M212 128 L340 128 L340 180 L262 180 L262 234 L320 234 L320 286 L262 286 L262 402 L212 402 Z" fill="${BRAND.check}"/>
  <circle cx="360" cy="352" r="70" fill="${BRAND.check}"/>
  <path d="M330 354 l20 22 l44 -52" fill="none" stroke="${BRAND.indigo}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

/** Base64 `data:` URI for embedding an SVG string as an `<img src>` in satori. */
export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
