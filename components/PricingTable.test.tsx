import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PricingTable from "./PricingTable";
import { seedQuote } from "@/lib/seed";
import { priceQuote } from "@/lib/pricing";

describe("PricingTable", () => {
  it("shows 'No rate' for the unpriced line and opens details on click", () => {
    const onOpenDetails = vi.fn();
    render(
      <PricingTable
        quote={seedQuote}
        pricing={priceQuote(seedQuote)}
        onEdit={() => {}}
        onReset={() => {}}
        onOpenDetails={onOpenDetails}
      />,
    );

    expect(screen.getAllByText(/No rate/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole("button", { name: /details/i })[0]);
    expect(onOpenDetails).toHaveBeenCalledTimes(1);
  });
});
