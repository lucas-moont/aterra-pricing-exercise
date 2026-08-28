# AterraAI — Pricing screen

The Price step of AterraAI: a consultant applies commission and markup per line
and works out what the client pays. It's where the DMC makes or loses its margin.
Built for the Aterra full-stack exercise.

**Live:** https://aterra-pricing-exercise-two.vercel.app

## Run it

```
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests (Vitest)
npm run e2e        # end-to-end (Playwright)
```

Node 18+.

## What's here

- A pure, exhaustively-tested pricing engine (`lib/pricing.ts`) — the single
  source of truth for every derived number.
- A live, editable table with the five moments the founder's happy-path design
  didn't cover: over-ceiling, a below-cost line, an unpriced line (provisional
  total), a thin blended margin, and save failure.
- A bespoke, accessible line-detail drawer (`components/LineDetailDrawer.tsx`) —
  the full cost waterfall, built from scratch.
- Optimistic save with rollback; edits persist across a refresh.
- Vitest + Playwright + GitHub Actions CI + Vercel.

## Docs & decisions

- [NOTE.md](./NOTE.md) — the 250-word submission note.
- [CONTEXT.md](./CONTEXT.md) — the domain glossary.
- [docs/features-and-treatments.md](./docs/features-and-treatments.md) — the five
  states and how each is handled.
- [docs/adr/0001-gp-excludes-commission.md](./docs/adr/0001-gp-excludes-commission.md)
  — GP excludes commission; we diverge from the reference screen on purpose.
- [docs/adr/0002-nett-is-line-total-not-multiplied-by-pax.md](./docs/adr/0002-nett-is-line-total-not-multiplied-by-pax.md)
  — nett is the line total, not multiplied by pax.
- [docs/beyond-the-brief.md](./docs/beyond-the-brief.md) — how this scales
  (agent × Nest × Next, multi-tenant, decisions outside the AI layer).
- [docs/ui-opportunities.md](./docs/ui-opportunities.md) — from-scratch UI I'd
  build next.
- [docs/ci-cd.md](./docs/ci-cd.md) · [docs/spec-full-shell.md](./docs/spec-full-shell.md)
  · [docs/design-brief.md](./docs/design-brief.md) · [docs/tickets.md](./docs/tickets.md).

## The save endpoint

`GET / PATCH / DELETE /api/quote`. PATCH has a deliberate 600ms delay; `?fail=1`
forces a failure so the rollback path is testable. The store is in-memory and
resets on a Vercel cold start — expected and fine for this exercise; the seam for
real (Supabase) persistence is described in `docs/beyond-the-brief.md`.
