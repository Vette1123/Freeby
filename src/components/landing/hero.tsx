"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EASE_OUT } from "@/components/motion/easing";

export function Hero({ isAuthenticated }: { isAuthenticated: boolean }) {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: EASE_OUT },
    },
  };

  return (
    <motion.section
      variants={reduce ? undefined : container}
      initial={reduce ? false : "hidden"}
      animate="visible"
      className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 pb-20 pt-12 text-center"
    >
      <motion.div variants={reduce ? undefined : item}>
        <span className="group mb-7 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur transition-colors hover:border-primary/30">
          <Sparkles className="size-3.5 text-primary" />
          Invoicing without the bloat
          <span className="ml-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
            new
          </span>
        </span>
      </motion.div>

      <motion.h1
        variants={reduce ? undefined : item}
        className="font-heading text-5xl font-semibold leading-[1.05] sm:text-6xl md:text-7xl"
      >
        Track time.
        <br />
        Send invoices.
        <br />
        <span className="text-gradient-animated">Get paid.</span>
      </motion.h1>

      <motion.p
        variants={reduce ? undefined : item}
        className="mt-7 max-w-xl text-lg text-muted-foreground sm:text-xl"
      >
        The freelancer billing tool with one unbroken flow — from a running
        timer to a paid invoice. No 47-tab nightmare. No bloat. Just getting
        paid.
      </motion.p>

      <motion.div
        variants={reduce ? undefined : item}
        className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
      >
        <Link
          href={isAuthenticated ? "/dashboard" : "/signup"}
          className={cn(
            buttonVariants({ size: "lg" }),
            "group h-12 rounded-xl px-7 text-[0.95rem]",
          )}
        >
          {isAuthenticated ? "Go to dashboard" : "Start free — it's $0"}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/pricing"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-12 rounded-xl px-7 text-[0.95rem]",
          )}
        >
          See pricing
        </Link>
      </motion.div>

      <motion.p
        variants={reduce ? undefined : item}
        className="mt-5 text-sm text-muted-foreground"
      >
        Free forever · Pro from $19/mo · No credit card to start
      </motion.p>
    </motion.section>
  );
}
