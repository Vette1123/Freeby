# Changelog

All notable changes to Freeby are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-07-03

### Added
- **Time tracking** — live stopwatch that survives page refreshes, logged
  against clients and projects.
- **Invoicing** — line items, automatic tax, sequential numbering, server-side
  PDF generation, and one-click email delivery with PDF attachment.
- **Client management** — per-client balances, total billed, and invoice history.
- **Projects** — hourly rates, status tracking, and archive support.
- **Dashboard** — outstanding revenue, hours tracked this week, and KPIs.
- **Auth** — email/password with verification and reset, plus Google OAuth.
- **Billing** — freemium gating (Free: 1 client, 3 invoices/mo → Pro:
  unlimited) with Lemon Squeezy as Merchant of Record.
- **Monthly ($19/mo) and yearly ($190/yr)** subscription variants.
- **Setup wizard** (`pnpm setup`) that auto-detects the LS store and variants
  and creates the webhook endpoint.
- **Branded favicon, Apple touch icon, and Open Graph / Twitter card images.**
- **SEO** — per-page metadata, JSON-LD structured data, robots.txt, sitemap.xml.
- **Security headers** (HSTS, X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy) and `poweredByHeader` disabled.
- **CI** — GitHub Actions workflow (lint, typecheck, test, build).
- **Contributor docs** — CONTRIBUTING.md, SECURITY.md, issue templates, PR
  template, CODEOWNERS.
- **Unit tests** — money math, invoice numbering, subscription gating, and
  validations (36 passing).

[Unreleased]: https://github.com/Vette1123/Freeby/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Vette1123/Freeby/releases/tag/v0.1.0
