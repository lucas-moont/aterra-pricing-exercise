import type { LineItem, Quote, SectionName } from "./types";

// The pricing engine: the single source of truth for every derived number on the
// screen. Pure — no React, no I/O — so the same inputs always give the same
// outputs and it is exhaustively unit-testable. The company's margin lives here.
//
// Decisions baked in:
//  - Rounding: the engine NEVER rounds. It returns full-precision floats and
//    aggregates are summed raw (sum-of-raw, not sum-of-rounded), so per-line cent
//    drift cannot accumulate across a quote. All rounding happens at display time
//    in lib/format.ts.
//  - GP excludes the agent's commission and is measured on what the DMC banks
//    (DMC RECEIVES), never on what the traveller pays. This deliberately diverges
//    from the founder's reference screen — see docs/adr/0001-gp-excludes-commission.md.
//  - nett === null means the rate is UNKNOWN, not zero: the line is excluded from
//    every aggregate and never coerced to 0.
//  - Per-person lines are NOT multiplied by pax; nett is the line total as given
//    — see docs/adr/0002-nett-is-line-total-not-multiplied-by-pax.md.

export interface LinePricing {
  costPlusVat: number | null;
  dmcReceives: number | null;
  clientPays: number | null;
  /** DMC RECEIVES − (COST + VAT). Excludes commission. */
  gp: number | null;
  /** GP ÷ DMC RECEIVES, as a fraction (0.153 = 15.3%). */
  gpPct: number | null;
  /** nett was null: no contracted rate found yet. */
  unpriced: boolean;
  /** Priced, but GP < 0 — sold below cost (usually a discount). */
  belowCost: boolean;
}

const UNPRICED: LinePricing = {
  costPlusVat: null,
  dmcReceives: null,
  clientPays: null,
  gp: null,
  gpPct: null,
  unpriced: true,
  belowCost: false,
};

export function priceLine(line: LineItem): LinePricing {
  if (line.nett === null) return UNPRICED;

  const costPlusVat = line.nett * (1 + line.vatPct / 100);
  const dmcReceives = costPlusVat * (1 + line.mrkpPct / 100);

  // Commission comes out of the sell price. Guard the divide-by-zero at 100%
  // commission even though the seed never reaches it — a wrong number is the one
  // thing this screen must never show.
  const commFraction = line.commPct / 100;
  const clientPays = commFraction >= 1 ? Infinity : dmcReceives / (1 - commFraction);

  const gp = dmcReceives - costPlusVat;
  const gpPct = dmcReceives === 0 ? 0 : gp / dmcReceives;

  return {
    costPlusVat,
    dmcReceives,
    clientPays,
    gp,
    gpPct,
    unpriced: false,
    belowCost: gp < 0,
  };
}

export interface SectionPricing {
  name: SectionName;
  clientPays: number;
  dmcReceives: number;
  costPlusVat: number;
  gp: number;
  /** Lines in this section with no contracted rate, excluded from the sums above. */
  unpricedCount: number;
}

export interface QuoteTotals {
  clientPays: number;
  dmcReceives: number;
  costPlusVat: number;
  gp: number;
  /** GP ÷ DMC RECEIVES across the whole trip, as a fraction. */
  blendedGpPct: number;
  unpricedCount: number;
  /** True when at least one line is unpriced, so the total is incomplete. */
  provisional: boolean;
}

export interface QuotePricing {
  /** Per-line pricing, keyed by line id. */
  lines: Record<string, LinePricing>;
  sections: SectionPricing[];
  totals: QuoteTotals;
}

export function priceQuote(quote: Quote): QuotePricing {
  const lines: Record<string, LinePricing> = {};
  for (const line of quote.lines) lines[line.id] = priceLine(line);

  // Section order follows first appearance, so the table renders deterministically
  // regardless of how the lines happen to be ordered.
  const sectionNames: SectionName[] = [];
  for (const line of quote.lines) {
    if (!sectionNames.includes(line.section)) sectionNames.push(line.section);
  }

  const sections: SectionPricing[] = sectionNames.map((name) => {
    const section: SectionPricing = {
      name,
      clientPays: 0,
      dmcReceives: 0,
      costPlusVat: 0,
      gp: 0,
      unpricedCount: 0,
    };
    for (const line of quote.lines) {
      if (line.section !== name) continue;
      const p = lines[line.id];
      if (p.unpriced) {
        // Unknown, not zero: excluded from the sums entirely.
        section.unpricedCount += 1;
        continue;
      }
      section.clientPays += p.clientPays!;
      section.dmcReceives += p.dmcReceives!;
      section.costPlusVat += p.costPlusVat!;
      section.gp += p.gp!;
    }
    return section;
  });

  const totals: QuoteTotals = {
    clientPays: 0,
    dmcReceives: 0,
    costPlusVat: 0,
    gp: 0,
    blendedGpPct: 0,
    unpricedCount: 0,
    provisional: false,
  };
  for (const s of sections) {
    totals.clientPays += s.clientPays;
    totals.dmcReceives += s.dmcReceives;
    totals.costPlusVat += s.costPlusVat;
    totals.gp += s.gp;
    totals.unpricedCount += s.unpricedCount;
  }
  totals.blendedGpPct = totals.dmcReceives === 0 ? 0 : totals.gp / totals.dmcReceives;
  totals.provisional = totals.unpricedCount > 0;

  return { lines, sections, totals };
}
