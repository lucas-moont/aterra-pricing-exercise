# Design brief — input for the /design and /prototype round

The treatments are already decided (in [features-and-treatments](./features-and-treatments.md)).
Design's job is to make them **beautiful and native to the founder's language** —
not to re-decide behaviour. This doc is the bridge into `/design` and `/prototype`.

## Visual language (extracted from the three reference images)

- **Palette:** warm cream / ivory grounds; **terracotta / rust** as the primary
  accent (the "New proposal" button, active states); **muted green** for positive
  deltas and healthy margin (`+12`, `22.7%`); **maroon / rust-red** for warnings
  and errors (the errors modal header); soft warm neutrals for text and borders.
- **Typography:** an elegant **serif** for display headings ("Good morning,
  Amanda", "New proposal"); a clean **sans** for body and the dense table; small
  **uppercase, letter-spaced** labels for section headers (WORK, THIS MONTH,
  NEEDS A DECISION).
- **Density & tone:** data-rich tables, controlled spacing, luxury restraint.
  Nothing shouts unless something is wrong. It should read as software a luxury
  travel company puts in front of a client.
- **Components in the language:** pill/chip toggles (Itemized/Ranges), a stepper
  with checkmarks, thin progress bars (budget headroom), `− / +` steppers, the
  right-rail "Ask Aterra" panel, numbered error cards.

## States to prototype (the artboards)

Each must be **unmistakable at a glance** to a consultant scanning under time
pressure, and must **not look bolted on**.

1. **Happy path** — baseline, matches the reference faithfully.
2. **Ceiling Breach** — budget bar in its "over by $X" state; trip total in
   warning colour; persistent, non-blocking.
3. **Underwater Line** — the line's GP cell marked + "below cost" tag, **and** the
   top-level "N lines below cost" counter.
4. **Unpriced Line** — "No rate" on the line + the **Provisional Total**
   ("from $X · excludes N unpriced lines").
5. **Blended Margin Floor** — trip-level margin warning when below the floor.
6. **Saving states** — per-line optimistic pending; quiet success; failure with
   rollback + non-destructive error.

## Reference for error language

The errors screen (image 3) shows the product's existing hard-block pattern:
rust-red header, numbered "Errors to clear", "Nothing is sent to the client until
every error is cleared". Our Price-screen states are mostly **inline and
non-blocking** (a consultant may knowingly price over ceiling), so they should
**echo that colour/tone language** without adopting the full-stop modal — the
blocking modal is for a different moment.

## Handoff note to /design + /prototype

- Respect the client's visual identity above; treat the reference images as the
  source of truth for palette, type, spacing.
- Behaviour is fixed; explore *presentation* only.
- Deliver the six states as artboards, then prototype the interactive transitions
  (edit → recompute, save → pending → success/failure).
