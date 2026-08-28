import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { seedQuote } from "./seed";

// Mock the API and drive editLive (no save), commit (save), failure (rollback),
// and reset directly.
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
  it("editLine updates the working copy live, without saving", () => {
    const { result } = renderHook(() => useQuote(seedQuote));
    act(() => result.current.editLine("acc-1", "mrkpPct", 40));
    expect(mrkpOf(result.current.quote, "acc-1")).toBe(40);
    expect(mockedPatch).not.toHaveBeenCalled();
  });

  it("commitLine persists the value", async () => {
    mockedPatch.mockResolvedValue(seedQuote);
    const { result } = renderHook(() => useQuote(seedQuote));

    act(() => result.current.commitLine("acc-1", "mrkpPct", 40));
    expect(mrkpOf(result.current.quote, "acc-1")).toBe(40);

    await waitFor(() => expect(result.current.savingLines["acc-1"]).toBe(false));
    expect(mockedPatch).toHaveBeenCalledWith("acc-1", "mrkpPct", 40);
  });

  it("rolls the line back and surfaces an error when the commit fails", async () => {
    mockedPatch.mockRejectedValue(new Error("Save failed (500)"));
    const { result } = renderHook(() => useQuote(seedQuote));

    act(() => result.current.commitLine("acc-1", "mrkpPct", 40));
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
