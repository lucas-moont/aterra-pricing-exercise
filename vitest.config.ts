import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirror the tsconfig "@/*" -> repo root alias so component tests can import
    // the same way the app does.
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    // jsdom so component tests have a DOM; the pure engine tests ignore it.
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["lib/**/*.test.ts", "components/**/*.test.tsx"],
  },
});
