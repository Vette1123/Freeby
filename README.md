<div align="center">

# ⏱️ Freeby

### Invoicing & time tracking that gets out of your way.

The freelancer's toolkit built around **one unbroken flow**:
**track time → bill it → get paid.**

No 47-tab nightmare. No learning curve. No bloat.

[![CI](https://github.com/Vette1123/Freeby/actions/workflows/ci.yml/badge.svg)](https://github.com/Vette1123/Freeby/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D24-brightgreen.svg)](./package.json)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Discussions](https://img.shields.io/badge/Discussions-welcome-9cf.svg)](https://github.com/Vette1123/Freeby/discussions)

[Features](#-features) ·
[Why Freeby](#-why-freeby) ·
[Get started](#-get-started-in-5-minutes) ·
[Self-host](#-self-hosting)

</div>

---

## ✨ Features

### ⏱️ Time tracking that doesn't quit
A live stopwatch that **survives page refreshes** — close your laptop, come back tomorrow, your timer is still running. Log hours against any client or project, then drop them straight onto an invoice.

### 🧾 Invoices that look professional
Build polished invoices in seconds — line items, automatic tax, your logo and brand colors, sequential numbering. Download a **PDF** or **email it to your client** with one click. No more fiddling with Word templates at midnight.

### 👥 Clients & projects, organized
Every client in one place with their outstanding balance, total billed, and full invoice history. Group work into projects, set hourly rates, and archive what's done.

### 📊 A dashboard that tells the truth
Outstanding revenue, hours tracked this week, who owes you, what's overdue — the numbers that matter, the second you log in.

### 🌍 Global payments handled
Powered by **Lemon Squeezy** (Merchant of Record) — they deal with sales tax, VAT, and GST in 100+ countries so you don't have to. You just get paid.

---

## 💡 Why Freeby

| The problem | Freeby's take |
|---|---|
| **Big invoicing tools feel like accounting software** | Freeby is one clean flow: timer → invoice → paid |
| **Time trackers and invoicing live in different apps** | Time entries flow straight into invoices — no copy-paste |
| **PDFs that look like spreadsheets** | Every invoice is a branded, designed document |
| **"Free" plans that watermark everything** | The free tier is genuinely usable: 1 client, 3 invoices/mo |
| **Tax compliance is a nightmare for solo founders** | Lemon Squeezy handles it as Merchant of Record |

### Pricing

| | Free | **Pro** |
|---|---|---|
| **Price** | $0 | **$19/mo** or **$190/yr** (2 months free) |
| Clients | 1 | Unlimited |
| Invoices / month | 3 | Unlimited |
| Time tracking | ✅ | ✅ |
| PDF invoices | ✅ | ✅ |
| Email invoices to clients | ✅ | ✅ |
| Remove Freeby branding | — | ✅ |
| Payment tracking | — | ✅ |

---

## 🚀 Get started in 5 minutes

**The hosted version** (recommended for most freelancers):

> Coming soon — Freeby is being prepared for launch.

**Self-hosting** (free, open):

```bash
git clone https://github.com/Vette1123/Freeby.git
cd freeby
pnpm install
cp .env.example .env   # then fill in your credentials
pnpm db:push           # create the database tables
pnpm dev               # → http://localhost:3000
```

Full self-hosting guide → [Self-hosting](#-self-hosting)

---

## 🛠️ The unbroken flow

```
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  Track   │ ──▶ │  Bill    │ ──▶ │  Send    │ ──▶ │  Get     │
   │  time    │     │  it      │     │  invoice │     │  paid    │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘
   Live stopwatch   Time entries →   Branded PDF     Client pays,
   per project/     line items,      emailed in one   you mark it
   client           auto tax         click            paid ✅
```

That's the whole product. Everything else exists to make those four steps effortless.

---

## 🧑‍💻 Self-hosting

### Prerequisites

- **Node 24+** and **pnpm**
- A **[Neon](https://neon.tech)** Postgres database (free tier)
- A **[Resend](https://resend.com)** account for email (optional in dev)
- A **[Lemon Squeezy](https://lemonsqueezy.com)** account for subscriptions (optional in dev)

### 1. Install & configure

```bash
pnpm install
cp .env.example .env
```

Open `.env` and fill in:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon dashboard → your project's connection string |
| `BETTER_AUTH_SECRET` | Run `openssl rand -base64 32` in your terminal |
| `BETTER_AUTH_URL` | `http://localhost:3000` (or your domain in prod) |
| `NEXT_PUBLIC_APP_URL` | Same as above |
| `EMAIL_FROM` | A verified sender in Resend (e.g. `noreply@yourdomain.com`) |
| `RESEND_API_KEY` | Resend dashboard → API keys |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud Console → OAuth credentials (optional) |

### 2. Create the database

```bash
pnpm db:push    # creates all tables from the schema
```

### 3. Set up Lemon Squeezy (subscriptions)

> ⚠️ **Note:** Lemon Squeezy's API no longer supports creating products or variants programmatically (they return `405`). You create those once in the dashboard, then Freeby auto-wires them.

**In the Lemon Squeezy dashboard:**

1. Go to **[Products](https://app.lemonsqueezy.com/products)** → **+ New Product** → name it `Freeby Pro`
2. Set pricing to **Subscription**, $19.00 every **1 Month**
3. **Add a variant**: `Pro — Yearly`, **Subscription**, $190.00 every **1 Year**
4. Go to **[Settings → API](https://app.lemonsqueezy.com/settings/api)** → create an API key

**Add to `.env`:**

```
LEMONSQUEEZY_API_KEY=<your key>
```

**Run the setup wizard** — it auto-detects your store and variants, creates the webhook, and writes the IDs back to `.env`:

```bash
pnpm setup
```

That's it. Re-run `pnpm setup` anytime (it's idempotent).

### 4. Run it

```bash
pnpm dev       # development → http://localhost:3000
# or
pnpm build && pnpm start   # production
```

---

## 🗄️ Database commands

| Command | What it does |
|---|---|
| `pnpm db:push` | Push schema directly to the DB (fastest for dev) |
| `pnpm db:generate` | Generate a migration from schema changes |
| `pnpm db:migrate` | Apply generated migrations |
| `pnpm db:studio` | Open Drizzle Studio — a visual DB browser |

---

## 🎨 For developers

<details>
<summary><strong>Tech stack</strong></summary>

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **Better Auth** — email/password, email verification, password reset, Google OAuth
- **Drizzle ORM** + **Neon** Postgres (serverless, HTTP driver)
- **shadcn-style UI** on **Base UI** primitives + **Tailwind v4** (OKLCH color tokens)
- **Resend** — transactional email with PDF attachments
- **Lemon Squeezy** — subscriptions + global tax handling (Merchant of Record)
- **@react-pdf/renderer** — server-side invoice PDF generation
- **decimal.js** — money math (round-half-up, no float drift)
- **Vitest** — unit tests

</details>

<details>
<summary><strong>Architecture notes</strong></summary>

#### Server actions (all mutations)
Every write goes through a server action (`"use server"` in each feature's `actions.ts`) that:
1. Resolves the user via `requireUser()` (throws if unauthenticated)
2. Enforces plan limits (freemium gating)
3. Validates input with zod
4. Scopes every query by `userId` (multi-tenant isolation)
5. Returns a typed `ActionResult`
6. Calls `revalidatePath` for fresh server-rendered data

#### Freemium gating
- **Free**: 1 client, 3 invoices/month
- **Pro**: unlimited everything

Entitlements are read via `getEntitlement(userId)` from the `subscription` table, synced from Lemon Squeezy webhooks. Pure gating logic lives in `src/lib/subscription-types.ts` (testable, no DB dependency).

#### Money
All monetary values are stored as Drizzle `numeric` strings and handled with `decimal.js` (`src/lib/money.ts`) — never floats. Tax uses round-half-up.

#### Invoice PDFs
Rendered server-side with `@react-pdf/renderer` (`src/lib/pdf/invoice-pdf.tsx`) and served at `/invoices/[id]/pdf`. The "Send" action attaches the PDF to a Resend email.

</details>

<details>
<summary><strong>Project structure</strong></summary>

```
src/
├── app/
│   ├── (auth)/              # Login, signup, forgot/reset password
│   ├── (dashboard)/         # Protected app
│   │   ├── dashboard/       # KPIs + overview
│   │   ├── timer/           # Live time tracking
│   │   ├── clients/         # Client CRUD + detail view
│   │   ├── projects/        # Project CRUD
│   │   ├── invoices/        # List, new, detail, PDF
│   │   ├── settings/        # Business profile, password, sessions
│   │   └── billing/         # Upgrade / manage subscription
│   ├── api/
│   │   ├── auth/[...all]/   # Better Auth catch-all
│   │   └── lemonsqueezy/    # checkout, cancel, webhook
│   ├── pricing/             # Public pricing page
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # Base primitives (button, card, dialog, select…)
│   ├── shared/              # StatCard, EmptyState, PageHeader, UpgradeBanner
│   ├── clients/ projects/ timer/ invoices/ billing/
└── lib/
    ├── db/                  # Drizzle schema + connection
    ├── lemonsqueezy/        # REST client + webhook processing
    ├── email/               # Resend + react-email templates
    ├── pdf/                 # Invoice PDF document
    ├── validations/         # Zod schemas
    ├── money.ts             # Money math (decimal.js)
    ├── invoice-number.ts    # Invoice numbering
    ├── subscription*.ts     # Entitlement + gating
    └── format.ts            # Duration/date formatting
```

</details>

<details>
<summary><strong>All scripts</strong></summary>

| Command | Description |
|---|---|
| `pnpm dev` | Start the dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Vitest |
| `pnpm setup` | Set up Lemon Squeezy (auto-wires store, variants, webhook) |
| `pnpm db:push` | Push schema to the database |
| `pnpm db:generate` | Generate a migration |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:studio` | Open Drizzle Studio |

</details>

---

## ☁️ Deploy to Vercel

Freeby is built for Vercel (serverless, Neon HTTP driver, edge-friendly).

### Step 1 — Create the database

```bash
pnpm db:push     # or: pnpm db:migrate  (uses the committed migrations)
```

### Step 2 — Set environment variables in Vercel

In your Vercel project → **Settings → Environment Variables**, add:

**Required (build fails without these):**

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `BETTER_AUTH_SECRET` | Run `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Your Vercel URL (e.g. `https://your-app.vercel.app`) |
| `NEXT_PUBLIC_APP_URL` | **Same as `BETTER_AUTH_URL`** |
| `EMAIL_FROM` | A verified Resend sender (e.g. `noreply@yourdomain.com`) |

**Optional (enable features):**

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | From Resend dashboard |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | From Google Cloud Console (enables Google login) |
| `LEMONSQUEEZY_API_KEY` | From Lemon Squeezy settings (enables billing) |
| `LEMONSQUEEZY_STORE_ID` | Auto-filled by `pnpm setup` |
| `LEMONSQUEEZY_VARIANT_MONTHLY` / `_YEARLY` | Auto-filled by `pnpm setup` |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Auto-filled by `pnpm setup` |
| `SEO_GOOGLE_VERIFICATION` | Google Search Console token (optional SEO) |

> ⚠️ **`BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` must match exactly.**
> When you add a custom domain later, update both env vars to the new domain
> and redeploy — the brand, OG image, PDF footer, and emails all adapt
> automatically.

### Step 3 — Deploy

```bash
vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard for auto-deploys on push.

### Step 4 — Wire Lemon Squeezy (after first deploy)

Once you have your production URL, run the setup wizard locally to create the
webhook endpoint on Lemon Squeezy:

```bash
# Point setup at your production URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app pnpm setup
```

Copy the resulting `LEMONSQUEEZY_WEBHOOK_SECRET` into Vercel's env vars and
redeploy.

---

## 🔒 Webhooks in production

When you deploy, set `NEXT_PUBLIC_APP_URL` to your real domain and run `pnpm setup` again — it creates the Lemon Squeezy webhook endpoint automatically and writes the signing secret to `.env`.

For **local webhook testing**, use a tunnel (ngrok / Cloudflare) to forward `https://<tunnel>/api/lemonsqueezy/webhook` to `localhost:3000`, then run `pnpm setup` with `NEXT_PUBLIC_APP_URL` set to the tunnel URL.

---

<div align="center">

**Freeby** — built for freelancers who'd rather work than do paperwork.

</div>
