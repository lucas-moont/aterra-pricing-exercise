import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import QuoteSummary from "./QuoteSummary";
import { seedQuote } from "@/lib/seed";
import { priceQuote } from "@/lib/pricing";
import type { Quote } from "@/lib/types";

function withMarkups(map: Record<string, number>): Quote {
  return {
    ...seedQuote,
    lines: seedQuote.lines.map((l) => (map[l.id] !== undefined ? { ...l, mrkpPct: map[l.id] } : l)),
  };
}

describe("QuoteSummary roll-ups", () => {
  it("surfaces the seed's below-cost line, provisional total, and headroom", () => {
    render(<QuoteSummary quote={seedQuote} pricing={priceQuote(seedQuote)} />);
    expect(screen.getByText(/below cost/i)).toBeInTheDocument();
    expect(screen.getByText(/Provisional total/i)).toBeInTheDocument();
    expect(screen.getByText(/you are .* under/i)).toBeInTheDocument();
  });

  it("warns when the trip goes over the client ceiling", () => {
    const q = withMarkups({ "acc-2": 90 });
    render(<QuoteSummary quote={q} pricing={priceQuote(q)} />);
    expect(screen.getByText(/Over ceiling by/i)).toBeInTheDocument();
  });

  it("warns when the blended margin drops below the floor", () => {
    const q: Quote = { ...seedQuote, lines: seedQuote.lines.map((l) => ({ ...l, mrkpPct: 1 })) };
    render(<QuoteSummary quote={q} pricing={priceQuote(q)} />);
    expect(screen.getByText(/below 15% floor/i)).toBeInTheDocument();
  });
});
