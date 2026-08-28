import { test, expect } from "@playwright/test";

// The headline flow through the browser: edit a markup, it persists, and it
// survives a reload. Selectors track the stepper's current aria-labels
// (`<service> markup`); if the layout renames them, update the two locators.
test.afterEach(async ({ request }) => {
  await request.delete("/api/quote");
});

test("editing a markup persists across a reload", async ({ page }) => {
  await page.goto("/");

  const increase = page.getByRole("button", { name: /Hemingways Nairobi.*markup increase/ });
  await expect(increase).toBeVisible();
  await increase.click();

  // Let the optimistic save reach the 600ms endpoint before reloading.
  await page.waitForTimeout(1500);
  await page.reload();

  // Target the input by role: the stepper's wrapper <div role="group"> shares the
  // same aria-label, so getByLabel would match both. role "textbox" is the input.
  const input = page.getByRole("textbox", { name: /^Hemingways Nairobi.*markup$/ });
  await expect(input).toHaveValue("19"); // seed 18 + one increment, persisted
});
