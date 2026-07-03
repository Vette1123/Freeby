"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

const freeFeatures = [
  "1 client",
  "3 invoices / month",
  "Time tracking",
  "PDF download",
];

const proFeatures = [
  "Unlimited clients",
  "Unlimited invoices",
  "Email invoices + PDF",
  "No Freeby branding",
  "Payment tracking",
  "Global tax handling",
];

const PLANS = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 19, yearly: 190 },
};

export function PricingPreview({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [yearly, setYearly] = useState(false);

  const proPrice = yearly ? PLANS.pro.yearly : PLANS.pro.monthly;
  const proSuffix = yearly ? "/year" : "/month";

  return (
    <div>
      <Reveal as="div" className="mx-auto mb-10 max-w-2xl text-center">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Pricing
        </span>
        <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
          Free to start.
          <br />
          Pro when you grow.
        </h2>
        <p className="mt-4 text-muted-foreground">
          No hidden fees. No per-invoice charges. No nonsense.
        </p>
      </Reveal>

      {/* Billing toggle */}
      <Reveal className="mb-10 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/50 p-1 backdrop-blur">
          <button
            type="button"
            onClick={() => setYearly(false)}
            className={cn(
              "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              !yearly ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {!yearly && (
              <motion.span
                layoutId="billing-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">Monthly</span>
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={cn(
              "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              yearly ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {yearly && (
              <motion.span
                layoutId="billing-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              Yearly
              <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                2 months free
              </span>
            </span>
          </button>
        </div>
      </Reveal>

      <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
        {/* Free */}
        <Reveal direction="right">
          <div className="h-full rounded-2xl border border-border/60 bg-card/50 p-8 backdrop-blur">
            <h3 className="font-heading text-lg font-semibold">Free</h3>
            <p className="mt-1 text-sm text-muted-foreground">For getting started</p>
            <div className="mt-6 flex items-end gap-1">
              <span className="font-heading text-5xl font-bold">$0</span>
            </div>
            <p className="text-sm text-muted-foreground">forever</p>

            <Link
              href={isAuthenticated ? "/dashboard" : "/signup"}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "mt-6 w-full rounded-xl",
              )}
            >
              {isAuthenticated ? "Current plan" : "Start free"}
            </Link>

            <ul className="mt-8 space-y-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <Check className="size-4 shrink-0 text-muted-foreground" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Pro */}
        <Reveal direction="left">
          <div className="gradient-border relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-transparent p-8 backdrop-blur">
            <div className="absolute right-5 top-5">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-sm shadow-primary/30">
                <Sparkles className="size-3" />
                Popular
              </span>
            </div>
            <h3 className="font-heading text-lg font-semibold">Pro</h3>
            <p className="mt-1 text-sm text-muted-foreground">For serious freelancers</p>

            <div className="mt-6 flex items-end gap-1">
              <motion.span
                key={proPrice}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="font-heading text-5xl font-bold"
              >
                ${proPrice}
              </motion.span>
            </div>
            <p className="text-sm text-muted-foreground">{proSuffix}</p>

            <Link
              href={isAuthenticated ? "/billing" : "/signup"}
              className={cn(buttonVariants(), "mt-6 w-full rounded-xl shadow-sm shadow-primary/30")}
            >
              {isAuthenticated ? "Upgrade to Pro" : "Start free, upgrade later"}
              <ArrowRight className="size-4" />
            </Link>

            <ul className="mt-8 space-y-3">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        All plans include time tracking, PDF invoices, and the dashboard.{" "}
        <Link href="/pricing" className="font-medium text-primary hover:underline">
          Full pricing details →
        </Link>
      </p>
    </div>
  );
}
