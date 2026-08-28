import { defineConfig } from "@playwright/test";

// E2E runs against a real Next build. Locally it reuses an already-running dev
// server; in CI it builds and starts the app itself. Browsers are installed in
// CI via `playwright install` — this machine's App Control policy blocks them,
// so E2E is a CI concern, not a local one.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // the in-memory store is shared server state
  retries: process.env.CI ? 1 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
