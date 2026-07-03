import { cn } from "@/lib/utils";

/**
 * The Freeby brand mark — a rounded-square badge with an indigo gradient
 * and a white "f + check" glyph. Mirrors `app/icon.svg` exactly so the logo
 * reads identically in the browser tab, the header, and the footer.
 *
 * Inline SVG (not an <img>) so it stays razor-crisp at any size and inherits
 * theme via currentColor where relevant.
 */
export function BrandMark({
  className,
  size = 32,
  glow = false,
}: {
  className?: string;
  size?: number;
  /** Add an animated conic glow behind the badge (hero/nav hover). */
  glow?: boolean;
}) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {glow && (
        <span
          className="conic-glow absolute -inset-1 rounded-[28%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        role="img"
        aria-label="Freeby"
        className="relative h-full w-full"
      >
        <defs>
          <linearGradient id="fb-mark-bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#818cf8" />
            <stop offset="0.5" stopColor="#4f46e5" />
            <stop offset="1" stopColor="#3730a3" />
          </linearGradient>
          <linearGradient id="fb-mark-sheen" x1="256" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="112" fill="url(#fb-mark-bg)" />
        <rect width="512" height="512" rx="112" fill="url(#fb-mark-sheen)" />
        {/* "f" stem + top arm */}
        <path
          d="M212 128 L340 128 L340 180 L262 180 L262 234 L320 234 L320 286 L262 286 L262 402 L212 402 Z"
          fill="#ffffff"
        />
        {/* check tick at the foot */}
        <path
          d="M288 340 l-26 -26 a12 12 0 0 1 17 -17 l17 17 l40 -40 a12 12 0 0 1 17 17 z"
          fill="#4f46e5"
        />
      </svg>
    </span>
  );
}

/** Wordmark — the Freeby logotype next to the badge. */
export function BrandWordmark({
  className,
  size = 32,
  glow = false,
}: {
  className?: string;
  size?: number;
  glow?: boolean;
}) {
  return (
    <span className={cn("group inline-flex items-center gap-2.5", className)}>
      <BrandMark size={size} glow={glow} />
      <span className="font-heading text-lg font-semibold tracking-tight">
        Freeby
      </span>
    </span>
  );
}
