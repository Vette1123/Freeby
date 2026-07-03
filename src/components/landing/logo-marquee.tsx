"use client";

/**
 * Infinite marquee of "replaced from" tools — positioned as the switch story.
 * Pure CSS animation, pauses on hover, respects reduced motion via globals.
 */
const tools = [
  "FreshBooks",
  "Toggl",
  "Harvest",
  "QuickBooks",
  "Wave",
  "Clockify",
  "Bonsai",
  "Xero",
];

export function LogoMarquee() {
  return (
    <div className="relative overflow-hidden py-2">
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      <div className="flex w-max animate-marquee items-center gap-10 hover:[animation-play-state:paused]">
        {[...tools, ...tools].map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-2 whitespace-nowrap font-heading text-lg font-medium text-muted-foreground/50"
          >
            {t}
            <span className="text-muted-foreground/20">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
