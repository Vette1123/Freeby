"use client";

import Link from "next/link";
import { Clock, FileText, Receipt, TrendingUp } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { BRAND } from "@/lib/brand";
import { EASE_OUT } from "@/components/motion/easing";

const proofPoints = [
  {
    icon: Clock,
    title: "Track time in one tap",
    desc: "Start a timer, switch clients, and every second is logged to the right project.",
  },
  {
    icon: FileText,
    title: "Send invoices in minutes",
    desc: "Clean, professional invoices generated from your tracked hours — no spreadsheets.",
  },
  {
    icon: TrendingUp,
    title: "Get paid faster",
    desc: "See what's outstanding, what's paid, and what's overdue — all on one dashboard.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        {/* Drifting aurora blobs */}
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 animate-aurora-drift rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-96 animate-float-slow rounded-full bg-indigo-300/20 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />

        <motion.div
          initial={reduce ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          <Link
            href="/"
            className="relative z-10 flex items-center gap-2.5 font-heading text-lg font-semibold"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25 backdrop-blur">
              <Receipt className="size-4" />
            </span>
            {BRAND.name}
          </Link>
        </motion.div>

        <div className="relative z-10 space-y-9">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT }}
          >
            <h2 className="font-heading text-4xl font-semibold leading-[1.1]">
              Invoicing,
              <br />
              without the bloat.
            </h2>
            <p className="mt-4 max-w-sm text-base text-white/80">
              The freelancer toolkit that does the boring stuff for you —
              time tracking, invoices, and chasing payments.
            </p>
          </motion.div>

          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
            }}
            className="space-y-5"
          >
            {proofPoints.map((p) => (
              <motion.li
                key={p.title}
                variants={
                  reduce
                    ? undefined
                    : {
                        hidden: { opacity: 0, x: -16 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: { duration: 0.5, ease: EASE_OUT },
                        },
                      }
                }
                className="flex gap-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                  <p.icon className="size-5" />
                </span>
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-white/75">{p.desc}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <p className="relative z-10 text-sm text-white/60">
          © {new Date().getFullYear()} {BRAND.name}. Built by Mohamed Gado.
        </p>
      </div>

      {/* Form panel */}
      <div className="bg-aurora relative flex flex-col items-center justify-center px-4 py-12">
        <div className="absolute right-4 top-4 z-10">
          <ThemeToggle />
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE_OUT }}
          className="w-full max-w-sm"
        >
          <Link
            href="/"
            className="mb-8 flex items-center gap-2.5 font-heading text-lg font-semibold lg:hidden"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Receipt className="size-4" />
            </span>
            {BRAND.name}
          </Link>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
