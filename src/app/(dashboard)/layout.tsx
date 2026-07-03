import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { requireSession } from "@/lib/get-session";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { DashboardNav } from "@/components/dashboard-nav";
import { getEntitlement } from "@/lib/subscription";
import { PlanBadge } from "@/components/shared/plan-badge";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const entitlement = await getEntitlement(session.user.id);

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-heading font-semibold"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ReceiptText className="size-4" />
              </span>
              <span className="hidden sm:inline">Freeby</span>
            </Link>
            <DashboardNav />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
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
