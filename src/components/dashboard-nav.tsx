"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/timer", label: "Timer" },
  { href: "/invoices", label: "Invoices" },
  { href: "/clients", label: "Clients" },
  { href: "/projects", label: "Projects" },
  { href: "/billing", label: "Billing" },
  { href: "/settings", label: "Settings" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  // On small screens the nav scrolls horizontally; keep the active tab centred
  // in view so it never hides under the header controls or sits half-clipped.
  useEffect(() => {
    const nav = navRef.current;
    const el = activeRef.current;
    if (!nav || !el) return;
    // Position relative to the scroll container (offsetLeft is unreliable —
    // it depends on the nearest positioned ancestor, not the nav).
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const delta = elRect.left - navRect.left - (nav.clientWidth - el.offsetWidth) / 2;
    nav.scrollTo({ left: nav.scrollLeft + delta, behavior: "smooth" });
  }, [pathname]);

  return (
    <nav
      ref={navRef}
      className="flex min-w-0 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)] sm:[mask-image:none] [&::-webkit-scrollbar]:hidden"
    >
      {links.map((l) => {
        const active = l.exact
          ? pathname === l.href
          : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            ref={active ? activeRef : undefined}
            href={l.href}
            className={cn(
              "relative whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {active && (
              <span className="absolute inset-0 rounded-lg bg-primary/10 ring-1 ring-inset ring-primary/20" />
            )}
            <span className="relative">{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
