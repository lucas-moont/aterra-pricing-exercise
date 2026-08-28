import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LineDetailDrawer } from "./LineDetailDrawer";
import { seedQuote } from "@/lib/seed";

const priced = seedQuote.lines.find((l) => l.id === "acc-1")!;
const unpriced = seedQuote.lines.find((l) => l.id === "acc-4")!;

describe("LineDetailDrawer", () => {
  it("renders nothing when no line is selected", () => {
    const { container } = render(<LineDetailDrawer line={null} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the cost waterfall and the commission carve-out for a priced line", () => {
    render(<LineDetailDrawer line={priced} onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(priced.service)).toBeInTheDocument();
    expect(screen.getByText(/Client pays/i)).toBeInTheDocument();
    expect(screen.getByText(/Gross profit/i)).toBeInTheDocument();
    expect(screen.getByText(/Excludes/i)).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    render(<LineDetailDrawer line={priced} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("shows an unknown-rate message for an unpriced line, never a number", () => {
    render(<LineDetailDrawer line={unpriced} onClose={() => {}} />);
    expect(screen.getByText(/No contracted rate found yet/i)).toBeInTheDocument();
  });
});
