import { describe, it, expect } from "vitest";
import { priceQuote } from "./pricing";
import { seedQuote } from "./seed";
import {
  ceilingBreach,
  underwaterLines,
  unpricedLines,
  provisionalTotal,
  blendedMarginFloor,
} from "./detectors";
import type { Quote } from "./types";

const pricing = priceQuote(seedQuote);

describe("detectors over the seed", () => {
  it("finds the unpriced line (acc-4)", () => {
    expect(unpricedLines(seedQuote)).toEqual(["acc-4"]);
  });

  it("finds the underwater line (trn-3, mrkp -15)", () => {
    expect(underwaterLines(pricing)).toContain("trn-3");
  });

  it("marks the total provisional with exactly one excluded line", () => {
    const p = provisionalTotal(pricing);
    expect(p.provisional).toBe(true);
    expect(p.excludedCount).toBe(1);
    expect(p.fromClientPays).toBeGreaterThan(0);
  });

  it("the seed sits under the client ceiling (headroom)", () => {
    const c = ceilingBreach(seedQuote, pricing);
    expect(c.over).toBe(false);
    expect(c.delta).toBeGreaterThan(0);
  });

  it("a large markup bump tips the trip over the ceiling", () => {
    const q: Quote = {
      ...seedQuote,
      lines: seedQuote.lines.map((l) => (l.id === "acc-2" ? { ...l, mrkpPct: 80 } : l)),
    };
    const c = ceilingBreach(q, priceQuote(q));
    expect(c.over).toBe(true);
    expect(c.delta).toBeLessThan(0);
  });
});

describe("blendedMarginFloor", () => {
  it("reports below-floor when the floor is above the blended margin", () => {
    expect(blendedMarginFloor(pricing, 100).belowFloor).toBe(true);
  });
  it("reports healthy when the floor is zero", () => {
    expect(blendedMarginFloor(pricing, 0).belowFloor).toBe(false);
  });
});
