import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { seedQuote } from "./seed";

// The optimistic-save behaviour is the risky part of the hook, so mock the API
// and drive success, failure (rollback), and reset directly.
vi.mock("./apiClient", () => ({
  patchLine: vi.fn(),
  resetQuoteRequest: vi.fn(),
}));

import { patchLine, resetQuoteRequest } from "./apiClient";
import { useQuote } from "./useQuote";

const mockedPatch = vi.mocked(patchLine);
const mockedReset = vi.mocked(resetQuoteRequest);

function mrkpOf(quote: typeof seedQuote, id: string) {
  return quote.lines.find((l) => l.id === id)!.mrkpPct;
}

beforeEach(() => vi.clearAllMocks());

describe("useQuote", () => {
  it("applies an edit optimistically, before the save resolves", async () => {
    mockedPatch.mockResolvedValue(seedQuote);
    const { result } = renderHook(() => useQuote(seedQuote));

    act(() => result.current.setLineField("acc-1", "mrkpPct", 40));

    expect(mrkpOf(result.current.quote, "acc-1")).toBe(40);
    await waitFor(() => expect(result.current.savingLines["acc-1"]).toBe(false));
    expect(mockedPatch).toHaveBeenCalledWith("acc-1", "mrkpPct", 40);
  });

  it("rolls the line back and surfaces an error when the save fails", async () => {
    mockedPatch.mockRejectedValue(new Error("Save failed (500)"));
    const { result } = renderHook(() => useQuote(seedQuote));

    act(() => result.current.setLineField("acc-1", "mrkpPct", 40));
    expect(mrkpOf(result.current.quote, "acc-1")).toBe(40); // optimistic

    await waitFor(() => {
      expect(mrkpOf(result.current.quote, "acc-1")).toBe(18); // rolled back to saved
      expect(result.current.saveError).toBeTruthy();
    });
  });

  it("resets the markups and raises a notice", async () => {
    mockedReset.mockResolvedValue(seedQuote);
    const { result } = renderHook(() => useQuote(seedQuote));

    await act(async () => {
      await result.current.resetMarkups();
    });

    expect(mockedReset).toHaveBeenCalled();
    expect(result.current.notice).toBeTruthy();
  });
});
