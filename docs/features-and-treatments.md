# Features & treatments — the Price screen

What the screen does, and — the point of the exercise — what it does in the
moments the founder never drew. Terms are defined in [CONTEXT.md](../CONTEXT.md).

## The pricing formula (canonical)

Per line, USD. This is the single source of truth for every derived number.

```
COST + VAT     =  NETT × (1 + VAT%)
DMC RECEIVES   =  (COST + VAT) × (1 + MRKP%)
CLIENT PAYS    =  DMC RECEIVES ÷ (1 − COMM%)
GP             =  DMC RECEIVES − (COST + VAT)
GP %           =  GP ÷ DMC RECEIVES
```

- Markup is added to cost; commission is taken out of the sell price. They never
  combine into one percentage.
- **GP excludes commission** — see [ADR 0001](./adr/0001-gp-excludes-commission.md).
  We deliberately diverge from the reference screen's GP.
- Markup may be negative (a discount). VAT differs by line.
- Section subtotals and trip totals are the sum of their lines.

Lives in a pure module (`lib/pricing.ts`) with no React, no I/O — so it is
exhaustively unit-testable. This is the thing the client's margin depends on.

## Core interaction — the numbers are live

- **Commission and markup are editable per line** (the founder's `− / +` steppers,
  kept). Direct entry is also allowed for speed.
- Any edit recomputes, in one pass: the line's derived columns, its **section
  subtotal**, and the **trip totals** at the top.
- Recompute is synchronous and instant in the UI; persistence is separate (see
  "Saving is not instant").

## The five states

The screen must read correctly in each of these, reusing the founder's visual
language so nothing looks bolted on.

### 1. Happy path

Everything priced, under ceiling, every line above cost. The reference design.

### 2. Ceiling Breach — trip total is over the client ceiling

*The most expensive mistake the screen allows.*

- Extend the existing budget bar. Under ceiling it reads "you are $X under" with
  headroom. Over ceiling it flips to **"over by $X"** in a warning treatment and
  the trip total takes a warning colour.
- **Persistent and loud**, but **does not block** — a consultant may legitimately
  price over and then go back to the client. We surface the fact, we don't
  gatekeep the workflow.
- The moment this matters: the consultant is deciding whether to trim a line or
  call the client. Give them the exact overage, always visible.

### 3. Underwater Line — a line priced below its cost (line GP < 0)

*Dangerous because it hides behind a healthy trip total.*

- Mark the offending line: its **GP cell** in a warning treatment plus a small
  **"below cost"** tag.
- **And** surface a **count at the top** — "1 line below cost" — because a
  consultant scanning a dense table under time pressure will miss a single red
  cell if that row has scrolled off. The top-level roll-up is the real fix; the
  cell marker alone is not enough.
- Clicking the counter jumps to / filters the offending line(s).

### 4. Unpriced Line — a service with no contracted rate (`nett = null`)

*Unknown, not zero. Coercing to $0 understates the trip by an unknown amount.*

- The line's derived columns show **"No rate"**, visually distinct — never a
  computed number, never $0.
- The line is **excluded from the trip total**, and the total declares itself a
  **Provisional Total**: "from $X · excludes N unpriced lines". A total that
  silently omits a missing number is a lie.
- Optional: a CTA to chase the supplier (the reasoning note already says
  "emailed 31 hours ago, no reply").

### 5. Blended Margin Floor — trip's overall margin is too thin (EXTENDED)

*The "other margin case": the mirror of the Underwater Line. Here no single line
is underwater, but the trip's blended margin has fallen below a healthy floor.*

- Compute the trip's **blended margin** (the dashboard's "Blended margin" KPI).
  When it drops below a **configurable business-rule floor**, warn at the trip
  level.
- The floor is a **business rule set by the DMC** — never a number invented by an
  AI or hard-coded as a guess. This is the "decisions outside the AI layer"
  principle showing up concretely on this screen.

## Saving is not instant (EXTENDED)

The PATCH endpoint has a deliberate 600ms delay.

- **Optimistic update**: apply the edit to the UI immediately (numbers recompute
  at once), while the save is in flight. Show a subtle per-line pending state
  (not a blocking spinner over the whole table).
- **On success**: pending state clears quietly.
- **On failure**: roll the line back to its last saved value, recompute, and show
  a non-destructive error (a toast / inline flag) inviting a retry. The consultant
  must never be left believing a change saved when it did not — on a margin screen
  that is the same class of error as a wrong number.

## pax — designed on paper, not built

Requested for the screen recording, not for construction (see the brief).

- Each line has a `basis`: **per_person** scales with pax, **per_unit** does not.
- Going 2 → 5 travellers, the naive answer (multiply per-person lines by 2.5) is
  the *floor* of the problem, not the solution: 5 people may not fit one villa
  (a per-unit line splits into two rooms), one vehicle (a second transfer), or
  one balloon basket. Capacity, not arithmetic.
- What we'd have to change in what we built: `units` is free text today
  ("2 pax", "1 veh"). Real pax support needs it **structured** — quantity and
  occupancy separated from pax — so the engine can reprice correctly. That data-
  model evolution is captured in [beyond-the-brief](./beyond-the-brief.md).

## Non-goals (the honest cut list, for the 250-word note)

- The surrounding product chrome (nav, stepper, most toolbar toggles) is a
  pixel-perfect **static shell**, not wired — see [spec-full-shell](./spec-full-shell.md).
- pax repricing is **designed, not built**.
- Real persistence (Supabase/Postgres) is **architected, not built** — the
  in-memory store ships, and resets on Vercel cold start, which the brief accepts.
- Not responsive — the dense desktop table is where the consultant lives.
