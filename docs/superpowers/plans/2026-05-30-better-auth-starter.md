# better-auth-starter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready Next.js 15 auth starter using Better Auth + Neon Postgres + Drizzle, with full email/password (verification + reset), Google & GitHub OAuth, rate limiting, a protected dashboard, and an account-settings page — pushed to GitHub.

**Architecture:** App Router project. Better Auth runs server-side (`lib/auth.ts`) backed by Neon Postgres via Drizzle adapter, exposed through a catch-all API route. A typed client (`lib/auth-client.ts`) drives hand-built shadcn forms. Resend sends verification/reset emails (console fallback in dev). Middleware does optimistic cookie redirects; protected layouts re-validate sessions server-side.

**Tech Stack:** Next.js 15, TypeScript, Better Auth, Drizzle ORM, Neon (`@neondatabase/serverless`), Resend + React Email, shadcn/ui, Tailwind v4, react-hook-form + Zod, `@t3-oss/env-nextjs`, Vitest. Package manager: **pnpm** (always).

**Working directory:** `C:\Highspeed\Personal\Next\better-auth-starter` (git already initialized, contains `docs/` + `.gitignore`).

---

## Environment Variables (reference for all tasks)

```
# .env  (never commit — see .env.example)
DATABASE_URL=postgresql://...neon...
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=            # optional in dev → console fallback
EMAIL_FROM=onboarding@resend.dev
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

OAuth redirect/callback URLs to register later:
- Google: `http://localhost:3000/api/auth/callback/google`
- GitHub: `http://localhost:3000/api/auth/callback/github`

---

## Task 1: Scaffold the Next.js project

**Files:**
- Create: project files via `create-next-app` (into a temp dir, then merge to preserve `docs/` and `.git/`)

- [ ] **Step 1: Scaffold into a temp directory** (keeps existing `.git` and `docs/` intact)

```bash
cd "C:/Highspeed/Personal/Next"
pnpm create next-app@latest better-auth-starter-tmp --ts --app --tailwind --eslint --src-dir --turbopack --import-alias "@/*" --use-pnpm --no-git
```

- [ ] **Step 2: Merge scaffold into the real project, then remove temp**

```bash
# copy everything except node_modules and any .git
robocopy "better-auth-starter-tmp" "better-auth-starter" /E /XD node_modules .git /NFL /NDL /NJH /NJS
rm -rf "better-auth-starter-tmp"
cd "better-auth-starter"
pnpm install
```

- [ ] **Step 3: Verify dev server boots**

Run: `pnpm dev` (then Ctrl-C after it prints the local URL)
Expected: `▲ Next.js 15.x` and `Local: http://localhost:3000` with no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: scaffold next.js app with typescript and tailwind"
```

---

## Task 2: Install dependencies

**Files:** `package.json` (modified)

- [ ] **Step 1: Install runtime + dev dependencies**

```bash
pnpm add better-auth drizzle-orm @neondatabase/serverless resend react-email @react-email/components react-hook-form @hookform/resolvers zod @t3-oss/env-nextjs sonner
pnpm add -D drizzle-kit @better-auth/cli vitest @types/node
```

- [ ] **Step 2: Verify versions resolved**

Run: `pnpm list better-auth drizzle-orm resend zod`
Expected: all four print a resolved version (no "not found").

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: add auth, db, email, and form dependencies"
```

---

## Task 3: Typed environment validation (TDD)

**Files:**
- Create: `src/env.ts`
- Create: `.env`  (local, gitignored — fill with placeholders for now)
- Create: `src/env.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Add Vitest config**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
});
```

- [ ] **Step 2: Write the failing test**

```ts
// src/env.test.ts
import { describe, it, expect } from "vitest";

describe("env", () => {
  it("parses required vars and exposes them typed", async () => {
    process.env.DATABASE_URL = "postgresql://x";
    process.env.BETTER_AUTH_SECRET = "0123456789abcdef0123456789abcdef";
    process.env.BETTER_AUTH_URL = "http://localhost:3000";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.EMAIL_FROM = "test@example.com";
    const { env } = await import("./env");
    expect(env.DATABASE_URL).toBe("postgresql://x");
    expect(env.EMAIL_FROM).toBe("test@example.com");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run src/env.test.ts`
Expected: FAIL — cannot find module `./env`.

- [ ] **Step 4: Implement `src/env.ts`**

```ts
// src/env.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(16),
    BETTER_AUTH_URL: z.string().url(),
    EMAIL_FROM: z.string().email(),
    RESEND_API_KEY: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    EMAIL_FROM: process.env.EMAIL_FROM,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  emptyStringAsUndefined: true,
});
```

- [ ] **Step 5: Create local `.env` with placeholders** (gitignored)

```
DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
BETTER_AUTH_SECRET=devsecretdevsecretdevsecretdevse
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
EMAIL_FROM=onboarding@resend.dev
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm vitest run src/env.test.ts`
Expected: PASS (1 passed).

- [ ] **Step 7: Add the `test` script to package.json**

In `package.json` `"scripts"`, add: `"test": "vitest run"`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add typed env validation with vitest"
```

---

## Task 4: Database connection (Neon + Drizzle)

**Files:**
- Create: `src/lib/db/index.ts`
- Create: `drizzle.config.ts`

- [ ] **Step 1: Create the Drizzle + Neon connection**

```ts
// src/lib/db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "@/env";
import * as schema from "./schema";

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });
```

- [ ] **Step 2: Create a placeholder schema so imports resolve** (replaced in Task 6)

```ts
// src/lib/db/schema.ts
// Auto-generated by `@better-auth/cli generate` in Task 6. Placeholder for now.
export {};
```

- [ ] **Step 3: Create the drizzle-kit config**

```ts
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

- [ ] **Step 4: Verify it type-checks**

Run: `pnpm tsc --noEmit`
Expected: no errors referencing `db/index.ts` or `drizzle.config.ts`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add neon + drizzle database connection"
```

---

## Task 5: Better Auth server instance

**Files:**
- Create: `src/lib/auth.ts`

- [ ] **Step 1: Create the Better Auth instance** (email/password + verification + reset + rate limiting; email senders wired in Task 9, social in Task 15 — written now with console fallback)

```ts
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { env } from "@/env";
import { sendVerificationEmail, sendResetPasswordEmail } from "@/lib/email/resend";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({ to: user.email, url });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({ to: user.email, url });
    },
  },
  socialProviders: {},
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
  },
  plugins: [nextCookies()],
});
```

- [ ] **Step 2: Commit** (won't fully type-check until Task 9 creates the email module — that's expected; commit anyway as a checkpoint)

```bash
git add src/lib/auth.ts
git commit -m "feat: add better-auth server instance with email/password + rate limiting"
```

---

## Task 6: Generate auth schema and push to Neon

> **Prerequisite:** A real `DATABASE_URL` from Neon must be in `.env`. If not yet available, STOP and ask the user to create a Neon project and paste the connection string. The CLI `generate` step works offline; `push` requires the live DB.

**Files:**
- Modify (generated): `src/lib/db/schema.ts`

- [ ] **Step 1: Generate the Drizzle schema from the auth config**

```bash
pnpm dlx @better-auth/cli@latest generate --output ./src/lib/db/schema.ts -y
```
Expected: `schema.ts` now exports `user`, `session`, `account`, `verification` tables.

- [ ] **Step 2: Push the schema to Neon**

```bash
pnpm drizzle-kit push
```
Expected: tables created; prompt answered `yes` if asked (non-interactive: it applies).

- [ ] **Step 3: Verify tables type-check**

Run: `pnpm tsc --noEmit`
Expected: no errors in `schema.ts` / `db/index.ts`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: generate and push better-auth database schema"
```

---

## Task 7: Auth API route handler

**Files:**
- Create: `src/app/api/auth/[...all]/route.ts`

- [ ] **Step 1: Mount the catch-all handler**

```ts
// src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: mount better-auth api route handler"
```

---

## Task 8: Auth client

**Files:**
- Create: `src/lib/auth-client.ts`

- [ ] **Step 1: Create the typed client**

```ts
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  forgetPassword,
  resetPassword,
  changePassword,
  updateUser,
  sendVerificationEmail,
  listSessions,
  revokeSession,
} = authClient;
```

- [ ] **Step 2: Verify type-check**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add better-auth react client"
```

---

## Task 9: Email — Resend client + React Email templates

**Files:**
- Create: `src/lib/email/resend.ts`
- Create: `src/lib/email/templates/verify-email.tsx`
- Create: `src/lib/email/templates/reset-password.tsx`

- [ ] **Step 1: Create the verify-email template**

```tsx
// src/lib/email/templates/verify-email.tsx
import { Body, Button, Container, Head, Heading, Html, Text } from "@react-email/components";

export function VerifyEmail({ url }: { url: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif", background: "#f6f6f6", padding: "24px" }}>
        <Container style={{ background: "#fff", borderRadius: 8, padding: 32 }}>
          <Heading>Verify your email</Heading>
          <Text>Click the button below to verify your email address.</Text>
          <Button href={url} style={{ background: "#111", color: "#fff", padding: "12px 20px", borderRadius: 6 }}>
            Verify email
          </Button>
          <Text style={{ color: "#888", fontSize: 12 }}>If you didn&apos;t create an account, ignore this email.</Text>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 2: Create the reset-password template**

```tsx
// src/lib/email/templates/reset-password.tsx
import { Body, Button, Container, Head, Heading, Html, Text } from "@react-email/components";

export function ResetPassword({ url }: { url: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif", background: "#f6f6f6", padding: "24px" }}>
        <Container style={{ background: "#fff", borderRadius: 8, padding: 32 }}>
          <Heading>Reset your password</Heading>
          <Text>Click the button below to choose a new password.</Text>
          <Button href={url} style={{ background: "#111", color: "#fff", padding: "12px 20px", borderRadius: 6 }}>
            Reset password
          </Button>
          <Text style={{ color: "#888", fontSize: 12 }}>If you didn&apos;t request this, ignore this email.</Text>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 3: Create the Resend sender with dev console fallback**

```ts
// src/lib/email/resend.ts
import { Resend } from "resend";
import { render } from "@react-email/components";
import { env } from "@/env";
import { VerifyEmail } from "./templates/verify-email";
import { ResetPassword } from "./templates/reset-password";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

async function deliver(opts: { to: string; subject: string; html: string; devLabel: string; url: string }) {
  if (!resend) {
    // Dev fallback: no API key → log the link so local flows are never blocked.
    console.log(`\n[email:${opts.devLabel}] to=${opts.to}\n${opts.url}\n`);
    return;
  }
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}

export async function sendVerificationEmail({ to, url }: { to: string; url: string }) {
  const html = await render(VerifyEmail({ url }));
  await deliver({ to, subject: "Verify your email", html, devLabel: "verify", url });
}

export async function sendResetPasswordEmail({ to, url }: { to: string; url: string }) {
  const html = await render(ResetPassword({ url }));
  await deliver({ to, subject: "Reset your password", html, devLabel: "reset", url });
}
```

- [ ] **Step 4: Verify type-check (auth.ts now resolves its email imports)**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add resend email sender with react-email templates and dev fallback"
```

---

## Task 10: shadcn/ui setup + base components

**Files:**
- Modify: shadcn config + `src/components/ui/*`, `src/app/layout.tsx`

- [ ] **Step 1: Initialize shadcn**

```bash
pnpm dlx shadcn@latest init -d
```
Expected: creates `components.json`, `src/lib/utils.ts`, base CSS variables.

- [ ] **Step 2: Add the components used by auth forms**

```bash
pnpm dlx shadcn@latest add button input label card form sonner -y
```

- [ ] **Step 3: Mount the Toaster in the root layout**

In `src/app/layout.tsx`, import and render `<Toaster />` inside `<body>`:
```tsx
import { Toaster } from "@/components/ui/sonner";
// ... inside <body>{children}<Toaster richColors /></body>
```

- [ ] **Step 4: Verify build**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: set up shadcn/ui and base components"
```

---

## Task 11: Auth route group layout + shared validation schemas

**Files:**
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/lib/validations/auth.ts`

- [ ] **Step 1: Create shared Zod schemas**

```ts
// src/lib/validations/auth.ts
import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const forgotSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotInput = z.infer<typeof forgotSchema>;
export type ResetInput = z.infer<typeof resetSchema>;
```

- [ ] **Step 2: Create the centered auth layout**

```tsx
// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add auth layout and shared validation schemas"
```

---

## Task 12: Signup form + page

**Files:**
- Create: `src/components/auth/signup-form.tsx`
- Create: `src/app/(auth)/signup/page.tsx`

- [ ] **Step 1: Create the signup form**

```tsx
// src/components/auth/signup-form.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SocialButtons } from "@/components/auth/social-buttons";

export function SignupForm() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupInput) {
    const { error } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: "/dashboard",
    });
    if (error) return toast.error(error.message ?? "Something went wrong");
    toast.success("Account created — check your email to verify.");
    router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Enter your details to get started.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Sign up"}
          </Button>
        </form>
        <SocialButtons />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="underline">Log in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create the signup page**

```tsx
// src/app/(auth)/signup/page.tsx
import { SignupForm } from "@/components/auth/signup-form";
export default function SignupPage() {
  return <SignupForm />;
}
```

- [ ] **Step 3: Commit** (will compile after Task 15 adds `SocialButtons`; commit as checkpoint)

```bash
git add -A
git commit -m "feat: add signup form and page"
```

---

## Task 13: Login form + page

**Files:**
- Create: `src/components/auth/login-form.tsx`
- Create: `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Create the login form**

```tsx
// src/components/auth/login-form.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SocialButtons } from "@/components/auth/social-buttons";

export function LoginForm() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    const { error } = await signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: "/dashboard",
    });
    if (error) {
      if (error.status === 403) return toast.error("Please verify your email before logging in.");
      return toast.error(error.message ?? "Invalid email or password");
    }
    router.push("/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Log in to your account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm underline">Forgot?</Link>
            </div>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </Button>
        </form>
        <SocialButtons />
        <p className="text-center text-sm text-muted-foreground">
          No account? <Link href="/signup" className="underline">Sign up</Link>
        </p>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create the login page**

```tsx
// src/app/(auth)/login/page.tsx
import { LoginForm } from "@/components/auth/login-form";
export default function LoginPage() {
  return <LoginForm />;
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add login form and page"
```

---

## Task 14: Verify-email page

**Files:**
- Create: `src/app/(auth)/verify-email/page.tsx`
- Create: `src/components/auth/resend-verification.tsx`

- [ ] **Step 1: Create the resend-verification client component**

```tsx
// src/components/auth/resend-verification.tsx
"use client";
import { useState } from "react";
import { toast } from "sonner";
import { sendVerificationEmail } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function ResendVerification({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  async function resend() {
    if (!email) return toast.error("No email provided.");
    setLoading(true);
    const { error } = await sendVerificationEmail({ email, callbackURL: "/dashboard" });
    setLoading(false);
    if (error) return toast.error(error.message ?? "Could not resend.");
    toast.success("Verification email sent.");
  }
  return (
    <Button onClick={resend} disabled={loading} variant="outline" className="w-full">
      {loading ? "Sending..." : "Resend verification email"}
    </Button>
  );
}
```

- [ ] **Step 2: Create the verify-email page** (reads `?email=`)

```tsx
// src/app/(auth)/verify-email/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResendVerification } from "@/components/auth/resend-verification";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email = "" } = await searchParams;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Check your inbox</CardTitle>
        <CardDescription>
          We sent a verification link{email ? ` to ${email}` : ""}. Click it to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResendVerification email={email} />
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add verify-email page with resend"
```

---

## Task 15: Social providers (Google + GitHub)

**Files:**
- Modify: `src/lib/auth.ts:socialProviders`
- Create: `src/components/auth/social-buttons.tsx`

- [ ] **Step 1: Enable providers in the auth config**

Replace `socialProviders: {},` in `src/lib/auth.ts` with:
```ts
  socialProviders: {
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } }
      : {}),
    ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
      ? { github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET } }
      : {}),
  },
```

- [ ] **Step 2: Create the social buttons component**

```tsx
// src/components/auth/social-buttons.tsx
"use client";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SocialButtons() {
  async function social(provider: "google" | "github") {
    const { error } = await signIn.social({ provider, callbackURL: "/dashboard" });
    if (error) toast.error(error.message ?? "Sign-in failed");
  }
  return (
    <div className="space-y-2">
      <div className="relative py-2 text-center text-xs text-muted-foreground">
        <span className="bg-card px-2">or continue with</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={() => social("google")}>Google</Button>
        <Button type="button" variant="outline" onClick={() => social("github")}>GitHub</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify type-check + full build** (signup/login now resolve `SocialButtons`)

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add google and github oauth with social buttons"
```

---

## Task 16: Forgot-password + reset-password flows

**Files:**
- Create: `src/components/auth/forgot-form.tsx`
- Create: `src/app/(auth)/forgot-password/page.tsx`
- Create: `src/components/auth/reset-form.tsx`
- Create: `src/app/(auth)/reset-password/page.tsx`

- [ ] **Step 1: Create the forgot-password form**

```tsx
// src/components/auth/forgot-form.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { forgetPassword } from "@/lib/auth-client";
import { forgotSchema, type ForgotInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ForgotInput>({ resolver: zodResolver(forgotSchema) });

  async function onSubmit(values: ForgotInput) {
    const { error } = await forgetPassword({ email: values.email, redirectTo: "/reset-password" });
    if (error) return toast.error(error.message ?? "Something went wrong");
    setSent(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>We&apos;ll email you a reset link.</CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <p className="text-sm text-muted-foreground">If that email exists, a reset link is on its way.</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create the forgot-password page**

```tsx
// src/app/(auth)/forgot-password/page.tsx
import { ForgotForm } from "@/components/auth/forgot-form";
export default function ForgotPasswordPage() {
  return <ForgotForm />;
}
```

- [ ] **Step 3: Create the reset-password form** (reads `token` prop)

```tsx
// src/components/auth/reset-form.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resetPassword } from "@/lib/auth-client";
import { resetSchema, type ResetInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ResetInput>({ resolver: zodResolver(resetSchema) });

  async function onSubmit(values: ResetInput) {
    if (!token) return toast.error("Invalid or missing reset token.");
    const { error } = await resetPassword({ newPassword: values.password, token });
    if (error) return toast.error(error.message ?? "Reset failed");
    toast.success("Password updated. Please log in.");
    router.push("/login");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Choose a new password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Create the reset-password page** (reads `?token=`)

```tsx
// src/app/(auth)/reset-password/page.tsx
import { ResetForm } from "@/components/auth/reset-form";
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  return <ResetForm token={token} />;
}
```

- [ ] **Step 5: Verify type-check**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add forgot-password and reset-password flows"
```

---

## Task 17: Middleware + protected dashboard

**Files:**
- Create: `src/middleware.ts`
- Create: `src/lib/get-session.ts`
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Create the optimistic middleware**

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  if (sessionCookie && ["/login", "/signup"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (!sessionCookie && (pathname.startsWith("/dashboard") || pathname.startsWith("/settings"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/login", "/signup"],
};
```

- [ ] **Step 2: Create a server-side session helper (defense in depth)**

```ts
// src/lib/get-session.ts
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session;
}
```

- [ ] **Step 3: Create the protected dashboard layout (re-validates)**

```tsx
// src/app/(dashboard)/layout.tsx
import Link from "next/link";
import { requireSession } from "@/lib/get-session";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return (
    <div className="min-h-svh">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <nav className="flex gap-4">
          <Link href="/dashboard" className="font-semibold">Dashboard</Link>
          <Link href="/settings" className="text-muted-foreground">Settings</Link>
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{session.user.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Create the sign-out button**

```tsx
// src/components/auth/sign-out-button.tsx
"use client";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await signOut();
        router.push("/login");
      }}
    >
      Sign out
    </Button>
  );
}
```

- [ ] **Step 5: Create the dashboard page**

```tsx
// src/app/(dashboard)/dashboard/page.tsx
import { requireSession } from "@/lib/get-session";

export default async function DashboardPage() {
  const session = await requireSession();
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
      <p className="text-muted-foreground">You are signed in as {session.user.email}.</p>
    </div>
  );
}
```

- [ ] **Step 6: Verify type-check**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add middleware and protected dashboard"
```

---

## Task 18: Account settings page

**Files:**
- Create: `src/app/(dashboard)/settings/page.tsx`
- Create: `src/components/settings/update-name-form.tsx`
- Create: `src/components/settings/change-password-form.tsx`
- Create: `src/components/settings/sessions-list.tsx`

- [ ] **Step 1: Create the update-name form**

```tsx
// src/components/settings/update-name-form.tsx
"use client";
import { useState } from "react";
import { toast } from "sonner";
import { updateUser } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UpdateNameForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  async function save() {
    setLoading(true);
    const { error } = await updateUser({ name });
    setLoading(false);
    if (error) return toast.error(error.message ?? "Update failed");
    toast.success("Name updated.");
  }
  return (
    <Card>
      <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create the change-password form**

```tsx
// src/components/settings/change-password-form.tsx
"use client";
import { useState } from "react";
import { toast } from "sonner";
import { changePassword } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [loading, setLoading] = useState(false);
  async function save() {
    if (next.length < 8) return toast.error("New password must be at least 8 characters.");
    setLoading(true);
    const { error } = await changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true,
    });
    setLoading(false);
    if (error) return toast.error(error.message ?? "Change failed");
    setCurrent(""); setNext("");
    toast.success("Password changed.");
  }
  return (
    <Card>
      <CardHeader><CardTitle>Password</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="current">Current password</Label>
          <Input id="current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="next">New password</Label>
          <Input id="next" type="password" value={next} onChange={(e) => setNext(e.target.value)} />
        </div>
        <Button onClick={save} disabled={loading}>{loading ? "Saving..." : "Change password"}</Button>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Create the sessions list**

```tsx
// src/components/settings/sessions-list.tsx
"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listSessions, revokeSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SessionRow = { id: string; token: string; userAgent?: string | null; createdAt: string | Date };

export function SessionsList() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  async function load() {
    const { data } = await listSessions();
    setSessions((data as SessionRow[]) ?? []);
  }
  useEffect(() => { load(); }, []);
  async function revoke(token: string) {
    const { error } = await revokeSession({ token });
    if (error) return toast.error(error.message ?? "Revoke failed");
    toast.success("Session revoked.");
    load();
  }
  return (
    <Card>
      <CardHeader><CardTitle>Active sessions</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {sessions.length === 0 && <p className="text-sm text-muted-foreground">No other sessions.</p>}
        {sessions.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded border p-2 text-sm">
            <span className="truncate">{s.userAgent ?? "Unknown device"}</span>
            <Button variant="ghost" size="sm" onClick={() => revoke(s.token)}>Revoke</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Create the settings page**

```tsx
// src/app/(dashboard)/settings/page.tsx
import { requireSession } from "@/lib/get-session";
import { UpdateNameForm } from "@/components/settings/update-name-form";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { SessionsList } from "@/components/settings/sessions-list";

export default async function SettingsPage() {
  const session = await requireSession();
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <UpdateNameForm initialName={session.user.name} />
      <ChangePasswordForm />
      <SessionsList />
    </div>
  );
}
```

- [ ] **Step 5: Verify type-check**

Run: `pnpm tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add account settings (name, password, sessions)"
```

---

## Task 19: Landing page + production build check

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace the default landing page**

```tsx
// src/app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold">better-auth-starter</h1>
      <p className="max-w-md text-muted-foreground">
        A production-ready Next.js auth starter: email/password, verification, reset, Google &amp; GitHub OAuth.
      </p>
      <div className="flex gap-3">
        <Button asChild><Link href="/signup">Get started</Link></Button>
        <Button asChild variant="outline"><Link href="/login">Log in</Link></Button>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Run the full production build**

Run: `pnpm build`
Expected: build completes; routes for `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`, `/dashboard`, `/settings`, `/api/auth/[...all]` all listed.

- [ ] **Step 3: Run tests**

Run: `pnpm test`
Expected: env test passes.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add landing page"
```

---

## Task 20: Manual end-to-end verification

> Requires real `DATABASE_URL` (Neon). Email/OAuth optional — without them, verification/reset links print to the server console and social buttons error gracefully.

- [ ] **Step 1: Start dev server** — `pnpm dev`
- [ ] **Step 2: Sign up** with a real email → redirected to `/verify-email`; verification link appears in email (or server console).
- [ ] **Step 3: Try to log in before verifying** → blocked with "Please verify your email."
- [ ] **Step 4: Click the verification link** → email verified, auto-signed-in, lands on `/dashboard`.
- [ ] **Step 5: Visit `/dashboard` in a logged-out browser** → redirected to `/login`.
- [ ] **Step 6: Forgot password** → reset link in email/console → set new password → old password rejected, new one works.
- [ ] **Step 7: Settings** → update name (persists on reload), change password (revokes other sessions), revoke a session.
- [ ] **Step 8 (if OAuth keys set):** Sign in with Google and GitHub → both land on `/dashboard`.
- [ ] **Step 9: Rate limiting** → submit login ~25 times rapidly → eventually "too many requests."

---

## Task 21: README + .env.example + push to GitHub

**Files:**
- Create: `.env.example`
- Create/Modify: `README.md`

- [ ] **Step 1: Create `.env.example`**

```
# Database (Neon — https://neon.tech)
DATABASE_URL=

# Better Auth
BETTER_AUTH_SECRET=   # generate: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (Resend — https://resend.com). Leave RESEND_API_KEY blank in dev to log links to console.
RESEND_API_KEY=
EMAIL_FROM=onboarding@resend.dev

# Google OAuth (https://console.cloud.google.com) — callback: /api/auth/callback/google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth (https://github.com/settings/developers) — callback: /api/auth/callback/github
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

- [ ] **Step 2: Write the README** — sections: Features, Tech stack, Prerequisites, Setup (clone, `pnpm install`, copy `.env.example`→`.env`, create Neon DB, `pnpm drizzle-kit push`, `pnpm dev`), Getting OAuth credentials (Google + GitHub steps with callback URLs), Resend setup, Deployment to Vercel (env vars + update OAuth callback URLs to prod domain + set `BETTER_AUTH_URL`/`NEXT_PUBLIC_APP_URL`), Scripts table.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "docs: add README and .env.example"
```

- [ ] **Step 4: Create the GitHub repo and push**

```bash
gh repo create Vette1123/better-auth-starter --public --source=. --remote=origin --push
```
If `gh` is unavailable, create the repo manually in the GitHub UI, then:
```bash
git remote add origin https://github.com/Vette1123/better-auth-starter.git
git push -u origin main
```

- [ ] **Step 5: Verify** — `gh repo view Vette1123/better-auth-starter --web` (or open the URL). Confirm files are present and `.env` is NOT in the repo.

---

## Self-Review Notes

- **Spec coverage:** Neon+Drizzle (T4,T6) · Better Auth instance (T5) · email verification required (T5,T13) · reset (T16) · Google/GitHub (T15) · rate limiting (T5) · protected dashboard + middleware (T17) · account settings name/password/sessions (T18) · Resend + console fallback (T9) · env validation (T3) · repo+README+push (T21). All spec sections mapped.
- **Type consistency:** `sendVerificationEmail`/`sendResetPasswordEmail` defined in T9 and consumed in T5; `requireSession` defined T17 used in T17/T18; `SocialButtons` defined T15 consumed by T12/T13 (committed-as-checkpoint note included); client method names match Better Auth (`signUp.email`, `signIn.email`, `signIn.social`, `forgetPassword`, `resetPassword`, `changePassword`, `updateUser`, `listSessions`, `revokeSession`, `sendVerificationEmail`).
- **Ordering note:** T12/T13 import `SocialButtons` created in T15, and T5 imports the email module created in T9. Commits in those tasks are explicit checkpoints; the codebase fully type-checks at the end of T15 (Step 3) and T9 (Step 4). An executor should not panic about intermediate red states — they are called out.
```
