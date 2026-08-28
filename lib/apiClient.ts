"use client";

import type { Quote } from "./types";
import type { EditableField } from "./useQuote";

// A thin client over /api/quote. Kept separate from the hook so it can be mocked
// in tests and swapped for a real backend later without touching the UI.

export async function patchLine(
  lineId: string,
  field: EditableField,
  value: number,
  opts?: { fail?: boolean },
): Promise<Quote> {
  // opts.fail routes to the route's test-only failure seam; never set in normal use.
  const query = opts?.fail ? "?fail=1" : "";
  const res = await fetch(`/api/quote${query}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ lineId, [field]: value }),
  });
  if (!res.ok) throw new Error(`Save failed (${res.status})`);
  return (await res.json()) as Quote;
}

export async function resetQuoteRequest(): Promise<Quote> {
  const res = await fetch("/api/quote", { method: "DELETE" });
  if (!res.ok) throw new Error(`Reset failed (${res.status})`);
  return (await res.json()) as Quote;
}
