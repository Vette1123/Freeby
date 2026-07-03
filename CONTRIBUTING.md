# Contributing to Freeby

Thanks for your interest in contributing! 🎉 This guide will get you set up
and productive.

## Quick start

```bash
git clone https://github.com/Vette1123/freeby.git
cd freeby
pnpm install
cp .env.example .env   # then fill in your credentials
pnpm db:push
pnpm dev               # → http://localhost:3000
```

See the [README](./README.md#-self-hosting) for full setup details.

## Development workflow

1. **Fork & branch** — create a branch off `main`:
   ```bash
   git checkout -b feat/your-feature
   ```
2. **Make your changes** — keep commits focused and atomic.
3. **Verify locally** — all four must pass before pushing:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```
4. **Open a PR** — fill in the pull request template and link any related
   issues.

## Code style

- **TypeScript everywhere** — no `any` without a comment explaining why.
- **Strict mode** is on; respect it.
- **Server actions** for all mutations (see existing `actions.ts` files for the
  pattern: auth → limit check → zod validation → scoped query → `ActionResult`).
- **Money** is always a string (`decimal.js`) — never a float. See
  `src/lib/money.ts`.
- **Components** follow the existing shadcn/Base UI conventions in
  `src/components/ui/`.
- **Match the surrounding code** — naming, imports, and comment density.

## Commit conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|---|---|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `docs:` | Documentation only |
| `refactor:` | Code change that neither fixes a bug nor adds a feature |
| `test:` | Adding or correcting tests |
| `chore:` | Build process, tooling, dependencies |
| `perf:` | A performance improvement |

Example: `feat(invoices): add multi-currency support`

## Project structure

```
src/
├── app/
│   ├── (auth)/        # Login, signup, password reset
│   ├── (dashboard)/   # Protected app (clients, projects, timer, invoices…)
│   ├── api/           # Auth + Lemon Squeezy routes
│   └── pricing/       # Public marketing pages
├── components/        # UI + feature components
└── lib/               # DB, money, validations, email, PDF, billing
```

Full layout in the [README](./README.md).

## Database changes

The schema lives in `src/lib/db/schema.ts`. After changing it:

```bash
pnpm db:generate    # generate a migration
pnpm db:migrate     # apply it
# or for dev: pnpm db:push  (syncs schema directly, no migration file)
```

## Testing

Tests run on [Vitest](https://vitest.dev):

```bash
pnpm test            # run once
pnpm test -- --watch # watch mode
```

Pure logic (money math, invoice numbering, subscription gating, validations)
is extracted from DB-dependent modules so it's unit-testable without a
database. Follow that pattern for new logic.

## Reporting bugs

Use the [bug report template](https://github.com/Vette1123/freeby/issues/new).
Include reproduction steps, expected vs. actual behavior, and your
browser/OS.

## Security vulnerabilities

**Do not open a public issue.** See [SECURITY.md](./SECURITY.md) for private
disclosure.

## Questions?

Open a [discussion](https://github.com/Vette1123/freeby/discussions) — happy to
help.
