import { NextResponse } from "next/server";
import { getQuote, updateLine, resetQuote } from "@/lib/store";
import type { LineItem } from "@/lib/types";

export const dynamic = "force-dynamic";

const EDITABLE_FIELDS = ["commPct", "mrkpPct", "nett"] as const;
type EditableField = (typeof EDITABLE_FIELDS)[number];

/** GET /api/quote -> the current quote */
export async function GET() {
  return NextResponse.json(getQuote());
}

/**
 * PATCH /api/quote
 * Body: { lineId: string, commPct?: number, mrkpPct?: number, nett?: number | null }
 * Returns the updated quote.
 */
export async function PATCH(request: Request) {
  const url = new URL(request.url);
  const body = await request.json().catch(() => null);

  if (!body || typeof body.lineId !== "string") {
    return NextResponse.json({ error: "lineId is required" }, { status: 400 });
  }

  // Accept only the editable fields; ignore anything else a caller sends, and
  // reject non-numbers so a bad payload can never write a wrong value.
  const patch: Partial<Pick<LineItem, EditableField>> = {};
  for (const field of EDITABLE_FIELDS) {
    const value = body[field];
    if (value === undefined) continue;
    if (field === "nett" && value === null) {
      patch.nett = null; // unknown rate is a legitimate value
      continue;
    }
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return NextResponse.json({ error: `${field} must be a number` }, { status: 400 });
    }
    patch[field] = value;
  }

  // The 600ms delay is deliberate: saving is not instant in the real product.
  await new Promise((r) => setTimeout(r, 600));

  // Deterministic failure seam for tests only: /api/quote?fail=1 fails the save
  // after the delay, so the optimistic-update rollback path is reproducible in
  // component and e2e tests. The normal client never sends it.
  if (url.searchParams.get("fail") === "1") {
    return NextResponse.json({ error: "Injected failure" }, { status: 500 });
  }

  try {
    const quote = updateLine(body.lineId, patch);
    return NextResponse.json(quote);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 404 });
  }
}

/** DELETE /api/quote -> restore the seed data */
export async function DELETE() {
  return NextResponse.json(resetQuote());
}
