# Spec — the full interactive shell (stretch, only if time remains)

The graded build ships the pricing **engine + failure states** as fully
functional, wrapped in a **pixel-perfect static shell** (nav, stepper, most
toolbar toggles look real but are not wired). This spec describes what each
chrome element *would* do if made interactive — the stretch goal, and the future
`main → branch` work. **Out of scope for the submission**, documented so the
intent is legible.

## Chrome inventory (from the reference screen)

- **Left nav:** WORK (Today, Inbox, Operations), PIPELINE (Sales, Trips, CRM),
  STUDIO (Itinerary builder, Templates), SUPPLY, MONEY (Invoices, Finance,
  Analytics), SYSTEM (API & integrations, Settings), user footer.
- **Top bar:** breadcrumb (Sales / New proposal), **Save draft**, **Preview as
  client**, **Back**, **Next: Design**.
- **Stepper (5):** Brief ✓ · Plan ✓ · **Price** (active) · Design · Review & send.
- **Toolbar:** Itemized / Ranges · Display · Set pax · USD · Summary · Reset markups.

## What each would do if wired

| Element | Behaviour |
|---|---|
| **Reset markups** | Restore seed via `DELETE /api/quote`. **Wired in the core build** — the one exception. |
| **Itemized / Ranges** | Two views of the same data: line-by-line vs price ranges (min–max). |
| **Display** | Column visibility toggles for the dense table. |
| **Set pax** | Opens a pax editor; triggers deterministic repricing. Depends on structured `units`. |
| **USD** | Currency switch (display + conversion source). |
| **Summary** | A rolled-up, client-readable summary of the quote. |
| **Preview as client** | Renders the downstream client-facing proposal view. |
| **Stepper** | Navigation across the five proposal steps. |
| **Save draft** | Explicit persist of the whole quote (vs the per-line optimistic saves). |
| **Left nav** | Routing to the other product surfaces (out of this exercise entirely). |

## Priority if attempted

1. **Set pax** (highest product value; needs structured units).
2. **Summary / Preview as client** (the client-facing payoff).
3. **Itemized / Ranges** and **Display** (view ergonomics).
4. **USD** (currency).
5. Nav routing (only meaningful once other surfaces exist).
