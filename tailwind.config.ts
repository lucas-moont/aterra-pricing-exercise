import type { Config } from "tailwindcss";

// Palette + type from the founder reference screens (docs/design-brief.md).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F9F4F0",
        panel: "#FBF7F1",
        ink: "#26221C",
        muted: "#8A8178",
        line: "#E8DCC8",
        terracotta: { DEFAULT: "#B86844", dark: "#A76141", soft: "#F4DECF" },
        positive: "#3E7C55",
        danger: { DEFAULT: "#B94332", soft: "#F6E4DF" },
        warn: { DEFAULT: "#9C7620", soft: "#F5EBD5" },
        sand: "#E8D9C8",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(43, 37, 33, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
