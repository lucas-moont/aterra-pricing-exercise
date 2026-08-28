import { describe, it, expect } from "vitest";
import { priceLine, priceQuote } from "./pricing";
import { seedQuote } from "./seed";
import type { LineItem, Quote } from "./types";

function line(partial: Partial<LineItem>): LineItem {
  return {
    id: "x",
    section: "ACCOMMODATION",
    service: "s",
    supplier: "sup",
    dates: "1 Jan",
    units: "1 u",
    basis: "per_unit",
    nett: 100,
    vatPct: 0,
    commPct: 0,
    mrkpPct: 0,
    confirmed: true,
    rate: { document: "d", note: "n", confidence: "high" },
    ...partial,
  };
}

describe("priceLine — the brief's worked example", () => {
  it("matches the brief exactly (nett 487, vat 16, comm 10, mrkp 18)", () => {
    const p = priceLine(line({ nett: 487, vatPct: 16, commPct: 10, mrkpPct: 18 }));
    expect(p.costPlusVat).toBeCloseTo(564.92, 2);
    expect(p.dmcReceives).toBeCloseTo(666.6056, 4);
    expect(p.clientPays).toBeCloseTo(740.67, 2); // brief: 740.67
    expect(p.gp).toBeCloseTo(101.69, 2); // brief: 101.69
    expect(p.gpPct).toBeCloseTo(0.1525, 3); // brief: 15.3%
    expect(p.unpriced).toBe(false);
    expect(p.belowCost).toBe(false);
  });
});

describe("priceLine — edge cases", () => {
  it("treats nett null as unpriced, never zero", () => {
    const p = priceLine(line({ nett: null }));
    expect(p.unpriced).toBe(true);
    expect(p.costPlusVat).toBeNull();
    expect(p.clientPays).toBeNull();
    expect(p.gp).toBeNull();
    expect(p.belowCost).toBe(false);
  });

  it("flags a negative-markup line as below cost (a discount)", () => {
    const p = priceLine(line({ nett: 1980, vatPct: 16, commPct: 10, mrkpPct: -15 }));
    expect(p.dmcReceives).toBeCloseTo(1952.28, 2);
    expect(p.gp!).toBeLessThan(0);
    expect(p.belowCost).toBe(true);
  });

  it("GP excludes commission — changing commission does not move GP", () => {
    const noComm = priceLine(line({ nett: 500, vatPct: 10, mrkpPct: 20, commPct: 0 }));
    const withComm = priceLine(line({ nett: 500, vatPct: 10, mrkpPct: 20, commPct: 25 }));
    expect(withComm.gp).toBeCloseTo(noComm.gp!, 6);
    // ...but commission does raise what the client pays.
    expect(withComm.clientPays!).toBeGreaterThan(noComm.clientPays!);
  });
});

describe("priceQuote — aggregates over the seed", () => {
  const pricing = priceQuote(seedQuote);

  it("excludes the one unpriced line and marks the total provisional", () => {
    expect(pricing.totals.unpricedCount).toBe(1);
    expect(pricing.totals.provisional).toBe(true);
  });

  it("trip total is the sum of section subtotals", () => {
    const sum = pricing.sections.reduce((a, s) => a + s.clientPays, 0);
    expect(pricing.totals.clientPays).toBeCloseTo(sum, 10);
  });

  it("blended GP% is trip GP over trip DMC receives", () => {
    expect(pricing.totals.blendedGpPct).toBeCloseTo(
      pricing.totals.gp / pricing.totals.dmcReceives,
      10,
    );
  });
});

describe("aggregates sum raw values, not rounded ones", () => {
  it("keeps sub-cent tails that per-line rounding would drop", () => {
    // 100 / 0.97 = 103.09278... each. Rounding each to 103.09 first and summing
    // gives 206.18; summing raw then rounding gives 206.19. The engine must do
    // the latter, so its raw total carries the full tail.
    const q: Quote = {
      ...seedQuote,
      lines: [
        line({ id: "a", nett: 100, vatPct: 0, mrkpPct: 0, commPct: 3 }),
        line({ id: "b", nett: 100, vatPct: 0, mrkpPct: 0, commPct: 3 }),
      ],
    };
    const p = priceQuote(q);
    expect(p.totals.clientPays).toBeCloseTo(206.1856, 3);
  });
});
