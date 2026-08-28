# UI opportunities — what I'd build next

There is no designer on this product; the interface is the product's taste. This
screen ships one bespoke overlay built from scratch — the line-detail drawer
(`components/LineDetailDrawer.tsx`). Here is what the rest of the design already
implies, ranked. Each is a from-scratch component, deliberately kept out of scope
so the submission stays disciplined.

## 1. Bulk actions on selected lines — the highest-leverage gap
Every row already has a checkbox, but the checkboxes do nothing yet. They are an
affordance with no behaviour — which reads as unfinished. They imply multi-select
plus a floating action bar: "apply 18% markup to the 4 selected lines", or set a
commission across a whole section. On a dense quote that is the fastest lever a
consultant has. Build: a selection state + a bottom action bar (from scratch)
that batches edits through the existing pricing engine and save.

## 2. Alternatives & swap — the "Search" button and the "N options" badge
Each row has a Search button, and some rows show "2 options / 3 options". Together
they imply a flow to see alternative suppliers or rates for a line and swap one in,
repricing instantly. Build: a searchable, comparable list in a drawer. Needs an
`alternatives` concept on the data model — today those counts are placeholder
(`OPTIONS` is hard-coded in `PricingTable`), which is worth making real.

## 3. "Trim to budget" assistant on a ceiling breach
When the trip is over the client ceiling, turn the warning into an action: a small
overlay that shows the cheapest ways back under — which lines to trim and by how
much. The screen already knows the overage; this closes the loop.

## 4. Resolve an unpriced line inline
The unpriced state could open a dialog to enter a found rate or trigger a supplier
chase (the reasoning note already says "emailed 31 hours ago, no reply"). It
resolves the single most dangerous state without leaving the screen.

## 5. A "Review & send" gate — echoing the product's errors modal
The product's error screen blocks sending until every error is cleared. The
"Review & send" step could gate the quote behind the five states: nothing reaches
the client while a line is unpriced or below cost, unless it is explicitly
acknowledged.

## 6. View toggles — Itemized / Ranges / Summary / Display / USD
The toolbar implies alternate presentations of the same data: a price-range view,
a client-facing summary, column visibility, a currency switch.

---

**Notes**
- These are presentation and behaviour; the pricing engine already supports them —
  it is pure and reused, so none of them re-implement a number.
- #1 and #2 are both highest-leverage and the most "designed but unbuilt": the
  checkboxes and the Search button are affordances waiting for behaviour.
