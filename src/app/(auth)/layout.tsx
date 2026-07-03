import Link from "next/link";
import { LockKeyhole, MailCheck, ShieldCheck, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: ShieldCheck,
    title: "Secure by default",
    desc: "Email verification, server-checked sessions, and rate limiting built in.",
  },
  {
    icon: MailCheck,
    title: "Real email flows",
    desc: "Verification and password reset, delivered with Resend.",
  },
  {
    icon: Zap,
    title: "Ready to extend",
    desc: "Better Auth + Neon Postgres + Drizzle, fully typed end to end.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-emerald-300/20 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />

        <Link
          href="/"
          className="relative z-10 flex items-center gap-2.5 font-heading text-lg font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
            <LockKeyhole className="size-4" />
          </span>
          better-auth-starter
        </Link>

        <div className="relative z-10 space-y-9">
          <div>
            <h2 className="font-heading text-4xl font-semibold leading-[1.1]">
              Authentication,
              <br />
              done right.
            </h2>
            <p className="mt-4 max-w-sm text-base text-white/80">
              A production-ready starter so you can ship secure sign-in in
              minutes, not weeks.
            </p>
          </div>
          <ul className="space-y-5">
            {features.map((f) => (
              <li key={f.title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                  <f.icon className="size-5" />
                </span>
                <div>
                  <p className="font-medium">{f.title}</p>
                  <p className="text-sm text-white/75">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-white/60">
          © {new Date().getFullYear()} better-auth-starter
        </p>
      </div>

      {/* Form panel */}
      <div className="bg-aurora relative flex flex-col items-center justify-center px-4 py-12">
        <div className="absolute right-4 top-4 z-10">
          <ThemeToggle />
        </div>

        <Link
          href="/"
          className="mb-8 flex items-center gap-2.5 font-heading text-lg font-semibold lg:hidden"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LockKeyhole className="size-4" />
          </span>
          better-auth-starter
        </Link>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
