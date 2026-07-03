/**
 * Single source of truth for the Freeby brand mark.
 *
 * Freeby is a clean, fast invoicing + time-tracking tool for freelancers. The
 * mark is an indigo "receipt-check" badge: a rounded square with a stylised
 * receipt and a checkmark, conveying "invoicing done." It is rendered
 * statically as `app/icon.svg` and reused by the generated `apple-icon` and
 * Open Graph routes via `svgToDataUri`.
 */

export const BRAND = {
  name: "Freeby",
  tagline: "Invoicing without the bloat",
  author: "Freeby",
  site: "https://freeby.app",
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
  radius = 120,
}: { size?: number; radius?: number } = {}): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" role="img" aria-label="${BRAND.name}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fb-bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${BRAND.indigoLight}"/>
      <stop offset=".5" stop-color="${BRAND.indigo}"/>
      <stop offset="1" stop-color="${BRAND.indigoDark}"/>
    </linearGradient>
    <linearGradient id="fb-sheen" x1="256" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff" stop-opacity=".25"/>
      <stop offset=".45" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${radius}" fill="url(#fb-bg)"/>
  <rect width="512" height="512" rx="${radius}" fill="url(#fb-sheen)"/>
  <rect x="168" y="120" width="176" height="272" rx="28" fill="#fff"/>
  <rect x="200" y="168" width="112" height="16" rx="8" fill="${BRAND.indigo}"/>
  <rect x="200" y="200" width="112" height="12" rx="6" fill="#c7d2fe"/>
  <rect x="200" y="224" width="80" height="12" rx="6" fill="#c7d2fe"/>
  <path d="M256 326 l-34 -34 a14 14 0 0 1 20 -20 l24 24 l46 -46 a14 14 0 0 1 20 20 z" fill="${BRAND.indigo}"/>
</svg>`;
}

/** Base64 `data:` URI for embedding an SVG string as an `<img src>` in satori. */
export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
