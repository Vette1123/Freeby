# The Pro branding promise

## What

The pricing card and billing page sold "No Freeby branding" on Pro. The invoice PDF printed Freeby in the header and footer on every plan. `showsBranding()` in `src/lib/subscription-types.ts` now gates both on an active Pro plan. Pro PDFs show the business name in the header and have no footer. The pricing lists also moved payment tracking and tax rates to Free, since neither is gated, and the README plan table now marks emailing invoices as Pro-only, as `send.tsx` enforces.

## Mistakes

- The promise shipped with nothing behind it. No test tied a pricing line to the code that delivers it, and the gap only surfaced during a README audit from another repo.
- The README agent's first fix deleted the claim from the README. That would have left the live pricing card still selling it.

- Lapsed subscribers kept unlimited Pro. The webhook stores `plan: "pro"` for every paid status, including expired, and both limit checks read `LIMITS[entitlement.plan]` without looking at `isActive`. Cancelling also cut access at once, though Lemon Squeezy keeps it until `ends_at` and the row stores `cancelAtPeriodEnd`. `deriveEntitlement()` now makes `plan` the effective plan, and its tests cover active, expired, cancelled-in-period, cancelled-past-end and paused.

## What worked

- Reading the PDF renderer, not the pricing copy, to decide what Pro actually gets.
- A pure helper (`showsBranding`) with tests for free, active Pro and lapsed Pro.

## Rules

- `entitlement.plan` means what the user gets now. Never read the raw stored plan for gating.
- Every line on a pricing card points at code that enforces it. When adding a plan feature, add the gate and its test in the same commit.
