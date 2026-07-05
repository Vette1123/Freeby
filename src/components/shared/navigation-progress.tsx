"use client";
// Slim top progress bar that animates on client-side route changes. Gives
// instant feedback when clicking nav links or after a mutation triggers
// router.push / router.refresh. No external dependency — re-mounts on each
// pathname change (via key) so the effect only ever schedules timers.
// Skipped entirely under prefers-reduced-motion.
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type Phase = "loading" | "finishing";

export function NavigationProgress() {
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  if (reduced) return null;
  // keying the inner component on pathname forces a fresh mount per route,
  // which restarts the animation without a setState-in-effect.
  return <Bar key={pathname} />;
}

function Bar() {
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("finishing"), 60);
    const t2 = setTimeout(() => setPhase("loading"), 460);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "finishing") return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
    >
      <div
        className="h-full bg-primary shadow-[0_0_10px_0_var(--primary)] transition-all duration-300 ease-out"
        style={{ width: "82%" }}
      />
    </div>
  );
}
