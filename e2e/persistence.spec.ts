import { test, expect } from "@playwright/test";

// The persistence contract, tested at the API level so it is robust to layout
// changes: a save sticks, the failure seam fails without mutating state, and
// DELETE restores the seed.
test.describe("quote API persistence", () => {
  test.afterEach(async ({ request }) => {
    await request.delete("/api/quote"); // restore seed between tests
  });

  test("a saved markup persists and reads back", async ({ request }) => {
    const patch = await request.patch("/api/quote", { data: { lineId: "acc-1", mrkpPct: 42 } });
    expect(patch.ok()).toBeTruthy();

    const quote = await (await request.get("/api/quote")).json();
    const line = quote.lines.find((l: { id: string }) => l.id === "acc-1");
    expect(line.mrkpPct).toBe(42);
  });

  test("the failure seam returns 500 and does not mutate state", async ({ request }) => {
    await request.patch("/api/quote", { data: { lineId: "acc-1", mrkpPct: 42 } });

    const failed = await request.patch("/api/quote?fail=1", {
      data: { lineId: "acc-1", mrkpPct: 99 },
    });
    expect(failed.status()).toBe(500);

    const quote = await (await request.get("/api/quote")).json();
    const line = quote.lines.find((l: { id: string }) => l.id === "acc-1");
    expect(line.mrkpPct).toBe(42); // 99 never applied
  });

  test("DELETE restores the seed markup", async ({ request }) => {
    await request.patch("/api/quote", { data: { lineId: "acc-1", mrkpPct: 42 } });
    const quote = await (await request.delete("/api/quote")).json();
    const line = quote.lines.find((l: { id: string }) => l.id === "acc-1");
    expect(line.mrkpPct).toBe(18); // seed value
  });
});
