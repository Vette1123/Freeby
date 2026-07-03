# Design: `better-auth-starter`

**Date:** 2026-05-30
**Repo target:** https://github.com/Vette1123/better-auth-starter
**Status:** Approved design → implementation planning

A production-ready Next.js authentication starter with Better Auth, Neon Postgres,
and a complete email/password + social login flow. Built to be extended later.

---

## 1. Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router, TS, Turbopack) | Modern default, server components |
| Auth | **Better Auth** | TS-native, framework-agnostic, plugin ecosystem |
| Database | **Neon** (serverless Postgres) | Very generous free tier, scales to zero, native Vercel integration |
| ORM | **Drizzle ORM** | Better Auth's `drizzleAdapter`, type-safe, lightweight |
| Email | **Resend** | 3,000/mo free, TS-native, pairs with React Email |
| UI | **shadcn/ui + Tailwind** | Accessible, customizable, hand-built forms |
| Forms | **react-hook-form + Zod** | Validation + typed schemas |
| Env safety | **@t3-oss/env-nextjs** | Fail-fast typed env vars at boot |
| Package manager | **pnpm** | User preference (always) |
| Deploy | **Vercel** | Best Next.js host, auto-deploy from GitHub |

## 2. Feature Scope (all in this build)

- Email + password **signup**
- **Login** / **logout**
- **Email verification** — **REQUIRED before login** (verification link via email)
- **Forgot password** + **reset password** (token link via email)
- **Google OAuth** + **GitHub OAuth**
- **Rate limiting** on auth endpoints (Better Auth built-in)
- **Session management**
- **Protected `/dashboard`** route (middleware-guarded)
- **Account settings** page: update name, change password, view/revoke sessions

Out of scope (add later): 2FA, magic links, passkeys, org/teams, role-based access.

## 3. Architecture

```
src/
├── app/
│   ├── (auth)/                         # public auth routes, centered layout
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx     # consumes ?token=
│   │   └── verify-email/page.tsx       # post-signup "check your inbox" + status
│   ├── (dashboard)/                    # protected, app-shell layout
│   │   ├── layout.tsx                  # server-side session guard
│   │   ├── dashboard/page.tsx
│   │   └── settings/page.tsx
│   ├── api/auth/[...all]/route.ts      # Better Auth handler (toNextJsHandler)
│   ├── layout.tsx                      # root layout + Toaster
│   └── page.tsx                        # landing page
├── lib/
│   ├── auth.ts                         # server: betterAuth({...}) instance
│   ├── auth-client.ts                  # client: createAuthClient()
│   ├── db/
│   │   ├── index.ts                    # Neon + Drizzle connection
│   │   └── schema.ts                   # Better Auth tables (CLI-generated)
│   └── email/
│       ├── resend.ts                   # Resend client + send helpers
│       └── templates/
│           ├── verify-email.tsx        # React Email template
│           └── reset-password.tsx      # React Email template
├── components/
│   ├── ui/                             # shadcn primitives
│   └── auth/                           # LoginForm, SignupForm, ForgotForm, ResetForm, etc.
├── middleware.ts                       # cookie session check → guard routes
└── env.ts                              # typed env validation
drizzle.config.ts                       # drizzle-kit config (Neon URL)
.env.example                            # documents every required key
README.md                              # full setup guide
```

## 4. Data Flow

1. **Server auth instance** (`lib/auth.ts`):
   - `database: drizzleAdapter(db, { provider: "pg" })`
   - `emailAndPassword: { enabled: true, requireEmailVerification: true, sendResetPassword: ({user, url}) => ... }`
   - `emailVerification: { sendVerificationEmail: ({user, url}) => ..., sendOnSignUp: true, autoSignInAfterVerification: true }`
   - `socialProviders: { google: {...}, github: {...} }`
   - `rateLimit: { enabled: true }`
   - Tables (`user`, `session`, `account`, `verification`) generated via
     `pnpm dlx @better-auth/cli@latest generate` into `schema.ts`, applied with `pnpm drizzle-kit push`.
2. **API layer**: all auth requests hit `/api/auth/*` through the catch-all handler
   `export const { POST, GET } = toNextJsHandler(auth)`.
3. **Client**: `auth-client.ts` exposes `signIn`, `signUp`, `signOut`, `useSession`,
   `forgetPassword`, `resetPassword`, etc. Forms call these; Zod validates input.
4. **Email**: Better Auth callbacks render a React Email template and send via Resend.
   Dev fallback: if `RESEND_API_KEY` is absent, log the link to the server console
   (so local dev is never blocked).
5. **Route protection**: `middleware.ts` does a fast cookie-presence check for redirects;
   protected layouts/pages re-verify with `auth.api.getSession({ headers })` server-side
   (defense in depth — never trust the cookie check alone).

## 5. Error Handling & Security

- **Inline field errors** via Zod + react-hook-form.
- **Toast** for server errors: "email already in use", "invalid credentials",
  "email not verified", "too many requests".
- **Email verification required** before a session is granted.
- **Rate limiting** on auth endpoints (brute-force protection).
- **Env validation** at boot via `env.ts` — missing/invalid secrets fail fast.
- **Secrets** never committed; `.env.example` documents shape only.
- Server-side session re-check on every protected route.

## 6. External Accounts Required (user-provided keys)

The build runs locally before these exist (email-to-console fallback), so progress is never blocked.

| Service | Provides | Env var(s) |
|---|---|---|
| **Neon** | Postgres connection string | `DATABASE_URL` |
| **Resend** | Email API key + verified sender | `RESEND_API_KEY`, `EMAIL_FROM` |
| **Google Cloud** | OAuth client | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| **GitHub** | OAuth app | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` |
| (generated) | Better Auth secret | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` |

README documents each signup + credential step.

## 7. Repo & Deploy

- `git init` → commits → push to `https://github.com/Vette1123/better-auth-starter`.
- `.env.example` + README with full setup instructions.
- Optional Vercel deploy (link repo, add env vars, set OAuth redirect URLs to the prod domain).

## 8. Success Criteria

- [ ] `pnpm dev` runs; landing page loads.
- [ ] Signup creates a user; verification email is sent (or logged in dev).
- [ ] Login is blocked until email is verified; succeeds after.
- [ ] Forgot-password sends a reset link; reset works; old password rejected.
- [ ] Google and GitHub OAuth complete a full sign-in.
- [ ] `/dashboard` and `/settings` redirect to `/login` when unauthenticated.
- [ ] Settings: update name, change password, view/revoke sessions all work.
- [ ] Rate limiting blocks rapid repeated auth attempts.
- [ ] Repo pushed to GitHub with README + `.env.example`.
