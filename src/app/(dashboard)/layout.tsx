import Link from "next/link";
import { requireSession } from "@/lib/get-session";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { DashboardNav } from "@/components/dashboard-nav";
import { getEntitlement } from "@/lib/subscription";
import { PlanBadge } from "@/components/shared/plan-badge";
import { BrandMark } from "@/components/brand/brand-mark";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const entitlement = await getEntitlement(session.user.id);

  return (
    <div className="min-h-svh">
      <header className="glass-strong sticky top-0 z-40 border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-6">
            <Link
              href="/dashboard"
              className="flex shrink-0 items-center gap-2 font-heading font-semibold"
            >
              <BrandMark size={32} />
              <span className="hidden sm:inline">Freeby</span>
            </Link>
            <DashboardNav />
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <PlanBadge plan={entitlement.plan} />
            <span className="hidden text-sm text-muted-foreground lg:inline">
              {session.user.email}
            </span>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
