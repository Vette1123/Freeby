"use client";
import { useState } from "react";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UpgradeCard() {
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);

  async function upgrade(plan: "monthly" | "yearly") {
    setLoading(plan);
    try {
      const res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Failed to start checkout");
      }
      // Redirect to Lemon Squeezy hosted checkout.
      window.location.href = data.url;
    } catch (err) {
      setLoading(null);
      toast.error(
        err instanceof Error ? err.message : "Checkout failed. Try again.",
      );
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-card p-6 ring-1 ring-foreground/10",
        )}
      >
        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Monthly
          </span>
        </div>
        <p className="font-heading text-3xl font-semibold">$19</p>
        <p className="text-sm text-muted-foreground">per month</p>
        <Button
          className="mt-5 w-full"
          variant="outline"
          onClick={() => upgrade("monthly")}
          disabled={loading !== null}
        >
          {loading === "monthly" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
          Upgrade monthly
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 ring-1 ring-primary/30">
        <div className="absolute right-4 top-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
            <Sparkles className="size-3" />
            Save 17%
          </span>
        </div>
        <p className="font-heading text-3xl font-semibold">$190</p>
        <p className="text-sm text-muted-foreground">
          per year · <span className="line-through">$228</span>
        </p>
        <Button
          className="mt-5 w-full"
          onClick={() => upgrade("yearly")}
          disabled={loading !== null}
        >
          {loading === "yearly" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Upgrade yearly
        </Button>
      </div>
    </div>
  );
}
