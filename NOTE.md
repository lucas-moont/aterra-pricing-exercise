# Submission note

**Built.** The Price screen as a correctness-first system. A pure pricing engine
(`lib/pricing.ts`, exhaustively unit-tested) drives every number; editing
commission or markup updates the line, its section subtotal, and the trip totals
live, with an optimistic save and rollback. I designed the five moments the
founder didn't: over-ceiling (loud, non-blocking), a below-cost line (flagged on
the row and counted at the top so it can't hide behind a healthy total), an
unpriced line (shown as unknown, never zero, with a provisional total), the thin
blended-margin case, and save failure. Vitest + Playwright + CI + Vercel.

**One deliberate override.** The reference screen computes GP including the
agent's commission ($176 / 23.7% on the Hemingways line). The brief says
commission is never the DMC's money, so I followed the formula (GP $101.69 /
15.3%) and diverged on purpose — recorded in `docs/adr/0001`.

**Cut.** The surrounding chrome (static, pixel-faithful, not wired); pax
repricing (designed on paper — `units` is free text and needs structuring); real
Supabase persistence (architected in `docs/beyond-the-brief.md`, in-memory store
ships); responsiveness.

**Most needed, unbuilt, ranked.** (1) Structured `units` + pax-aware repricing —
first, because the naive "×pax" is wrong (five travellers need a second room or
vehicle) and it's a daily need; not done because it is a data-model change. (2)
The AI rate-ingestion seam feeding `RateSource` with provenance. (3) Multi-tenant
persistence with row-level security.

**Time.** ~2.5 hours.
