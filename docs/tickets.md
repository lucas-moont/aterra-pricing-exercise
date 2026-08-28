# Tickets — finalisation backlog

Grouped into epics. Each ticket has acceptance criteria (AC). Order roughly
top-to-bottom. Terms: [CONTEXT.md](../CONTEXT.md). Behaviour:
[features-and-treatments](./features-and-treatments.md).

## Epic A — Pricing engine (correctness first)

**A1 · Pure pricing module `lib/pricing.ts`**
Implement the canonical formula: per-line derived values, section subtotals, trip
totals, blended margin. No React, no I/O.
*AC:* reproduces the brief's worked example exactly (487 / 16 / 10 / 18 →
Client 740.67, GP 101.69, GP% 15.3%); negative markup handled as a discount;
`nett = null` treated as unpriced (excluded from totals, never $0). GP excludes
commission per ADR 0001.

**A2 · State detectors**
Pure functions: `ceilingBreach`, `underwaterLines`, `unpricedLines`,
`provisionalTotal`, `blendedMarginFloor(floor)`.
*AC:* each is pure and fully unit-tested, including boundary cases.

## Epic B — Interactive table

**B1 · Live editing** — `− / +` steppers + direct entry for COMM/MRKP per line.
*AC:* editing either value recomputes the line, its section subtotal, and the trip
totals instantly and correctly.

**B2 · Faithful table render** — columns, section grouping, subtotals, reasoning,
matching the reference layout/typography/spacing.
*AC:* pixel-perfect on layout/type/colour/spacing; numbers are the correct
(brief-formula) values, not the reference's.

**B3 · Budget bar + Ceiling Breach** — headroom under ceiling; "over by $X"
warning state over ceiling.
*AC:* overage is exact and always visible; **does not block** the workflow.

**B4 · Underwater Line treatment** — GP cell marker + "below cost" tag + top
counter "N lines below cost", counter locates the line(s).
*AC:* a below-cost line is visible even when its row is scrolled off and the trip
total looks healthy.

**B5 · Unpriced Line treatment** — "No rate" on the line + Provisional Total.
*AC:* unpriced line never shows a number or $0; trip total declares itself
provisional with the excluded count.

**B6 · Blended Margin Floor warning** — trip-level warning below a configurable
floor.
*AC:* floor is a business-rule value (not hard-coded as a guess, not AI-derived).

**B7 · GP tooltip** — "GP excludes agent commission" on the GP header.
*AC:* present, matches ADR 0001 wording.

## Epic C — Persistence & save UX

**C1 · Wire PATCH `/api/quote`** — edits persist across refresh.
*AC:* change a markup, refresh, the change is still there.

**C2 · Optimistic save + failure handling** — apply edit immediately, per-line
pending state during the 600ms, roll back + non-destructive error on failure.
*AC:* the consultant is never left believing a change saved when it did not.

**C3 · Reset markups → DELETE `/api/quote`.**
*AC:* restores seed data.

## Epic D — Quality & delivery

**D1 · Test tooling** — Vitest + React Testing Library + Playwright; package
scripts (`typecheck`, `lint`, `test`, `test:cov`, `e2e`).

**D2 · Engine tests (deep)** — exhaustive unit tests for A1 + A2.
*AC:* high coverage on the pricing engine and detectors.

**D3 · Component tests** — each failure state renders its treatment; steppers
recompute downstream; optimistic save success + failure paths.

**D4 · E2E** — Playwright: edit → save → refresh persists.

**D5 · CI** — `.github/workflows/ci.yml` (quality + e2e jobs) per
[ci-cd](./ci-cd.md).
*AC:* green on PRs and pushes to `main`.

**D6 · Deploy** — import to Vercel; verify preview + production.
*AC:* live URL; edits stick within a warm instance.

**D7 · Submission** — 250-word note (what was cut, top-3 unbuilt, time spent,
where AI was overridden — the GP divergence) + 3–5 min recording including the
pax 2→5 walkthrough.
