import type { Quote } from "./types";
import type { QuotePricing } from "./pricing";

// Detectors turn the engine's raw numbers into the "something is wrong" facts the
// UI renders. Each is a pure function over the quote and its computed pricing, so
// every failure-state in the interface is a pure function of tested engine output.

export interface CeilingStatus {
  over: boolean;
  /** clientCeiling − trip Client Pays. Positive = headroom, negative = overage. */
  delta: number;
}

// The client ceiling is what the TRAVELLER pays, so it is compared against the
// trip's Client Pays total — not DMC Receives. Comparing the wrong base would
// break the most expensive warning on the screen silently.
export function ceilingBreach(quote: Quote, pricing: QuotePricing): CeilingStatus {
  const delta = quote.clientCeiling - pricing.totals.clientPays;
  return { over: delta < 0, delta };
}

/** Ids of lines priced below their cost (GP < 0). Unpriced lines never qualify. */
export function underwaterLines(pricing: QuotePricing): string[] {
  return Object.entries(pricing.lines)
    .filter(([, p]) => p.belowCost)
    .map(([id]) => id);
}

/** Ids of lines with no contracted rate (nett === null). */
export function unpricedLines(quote: Quote): string[] {
  return quote.lines.filter((l) => l.nett === null).map((l) => l.id);
}

export interface ProvisionalStatus {
  provisional: boolean;
  excludedCount: number;
  /** The Client Pays total the "from $X" figure is built on. */
  fromClientPays: number;
}
export function provisionalTotal(pricing: QuotePricing): ProvisionalStatus {
  return {
    provisional: pricing.totals.provisional,
    excludedCount: pricing.totals.unpricedCount,
    fromClientPays: pricing.totals.clientPays,
  };
}

export interface MarginFloorStatus {
  belowFloor: boolean;
  /** Trip blended GP%, as a fraction. */
  blendedPct: number;
  /** The configured floor, as a fraction. */
  floorPct: number;
}
// The floor is a DMC business rule (see lib/config.ts), passed in — never a
// number invented here.
export function blendedMarginFloor(pricing: QuotePricing, floorPct: number): MarginFloorStatus {
  const floor = floorPct / 100;
  return {
    belowFloor: pricing.totals.blendedGpPct < floor,
    blendedPct: pricing.totals.blendedGpPct,
    floorPct: floor,
  };
}
