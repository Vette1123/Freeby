"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Clock, ReceiptText, TrendingUp, Users } from "lucide-react";
import { EASE_OUT } from "@/components/motion/easing";

/** Animated count-up for currency/number stats. */
function CountUp({
  to,
  prefix = "",
  decimals = 0,
  duration = 1400,
}: {
  to: number;
  prefix?: string;
  decimals?: number;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const [val, setVal] = useState(reduce ? to : 0);

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, reduce]);

  return (
    <span className="tabular-nums">
      {prefix}
      {val.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}

/** Live ticking timer — counts up from a base value. */
function LiveTimer({ base = 5025 }: { base?: number }) {
  const [secs, setSecs] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <span className="tabular-nums">
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}

const invoiceRows = [
  { num: "INV-0042", client: "Acme Co.", amount: "$2,400", status: "paid" },
  { num: "INV-0041", client: "Northwind", amount: "$1,850", status: "sent" },
  { num: "INV-0040", client: "Globex", amount: "$3,200", status: "paid" },
  { num: "INV-0039", client: "Initech", amount: "$950", status: "overdue" },
];

const statusStyles: Record<string, string> = {
  paid: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  sent: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  overdue: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
};

export function DashboardMockup() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.3, ease: EASE_OUT }}
      style={{ transformPerspective: 1200 }}
      className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-2xl shadow-primary/5 backdrop-blur"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <span className="size-3 rounded-full bg-rose-400/70" />
        <span className="size-3 rounded-full bg-amber-400/70" />
        <span className="size-3 rounded-full bg-emerald-400/70" />
        <span className="ml-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ReceiptText className="size-3" />
          freeby.app/dashboard
        </span>
      </div>

      {/* App body */}
      <div className="grid gap-4 p-5 sm:grid-cols-3">
        <div className="rounded-xl bg-muted/40 p-4 ring-1 ring-border/40">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-3.5 text-amber-500" />
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Outstanding
            </p>
          </div>
          <p className="mt-1.5 font-heading text-2xl font-semibold text-amber-600 dark:text-amber-400">
            <CountUp to={4250} prefix="$" />
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">3 invoices</p>
        </div>
        <div className="rounded-xl bg-muted/40 p-4 ring-1 ring-border/40">
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 text-primary" />
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tracked (7d)
            </p>
          </div>
          <p className="mt-1.5 font-heading text-2xl font-semibold">
            <CountUp to={32.25} decimals={1} />
            h
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">across 4 clients</p>
        </div>
        <div className="rounded-xl bg-muted/40 p-4 ring-1 ring-border/40">
          <div className="flex items-center gap-2">
            <Users className="size-3.5 text-primary" />
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Clients
            </p>
          </div>
          <p className="mt-1.5 font-heading text-2xl font-semibold">
            <CountUp to={12} />
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">2 active</p>
        </div>
      </div>

      {/* Timer row */}
      <div className="flex items-center gap-3 px-5 pb-4">
        <div className="flex items-center gap-3 rounded-xl bg-primary/5 px-4 py-3 ring-1 ring-primary/20">
          <span className="relative flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Clock className="size-4" />
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-emerald-400 pulse-dot" />
          </span>
          <div>
            <p className="font-heading text-lg font-semibold text-primary">
              <LiveTimer />
            </p>
            <p className="text-xs text-muted-foreground">Website redesign · Acme</p>
          </div>
        </div>
      </div>

      {/* Invoice rows */}
      <div className="space-y-1.5 px-5 pb-5">
        {invoiceRows.map((row, i) => (
          <motion.div
            key={row.num}
            initial={reduce ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
            className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium">{row.num}</span>
              <span className="text-muted-foreground">{row.client}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium tabular-nums">{row.amount}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${statusStyles[row.status]}`}
              >
                {row.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
