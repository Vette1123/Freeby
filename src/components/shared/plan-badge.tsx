import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Plan } from "@/lib/subscription";

/** Shows the current plan as a badge; Pro links to nothing, Free nudges to billing. */
export function PlanBadge({ plan }: { plan: Plan }) {
  if (plan === "pro") {
    return (
      <Badge variant="default" className="hidden sm:inline-flex">
        Pro
      </Badge>
    );
  }
  return (
    <Link href="/billing" className="hidden sm:inline-flex">
      <Badge variant="muted">Free</Badge>
    </Link>
  );
}
