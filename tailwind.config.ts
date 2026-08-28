import type { Config } from "tailwindcss";

// Each colour is an RGB-channel CSS variable (defined in app/globals.css) wrapped
// so Tailwind's <alpha-value> opacity modifiers keep working. Light and dark both
// flow from the variables — the class names never change between themes.
const token = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: token("--bg"),
        panel: token("--surface"),
        surface2: token("--surface-2"),
        surface3: token("--surface-3"),
        elevated: token("--elevated"),
        row: token("--row"),
        ink: token("--ink"),
        ink2: token("--ink-2"),
        muted: token("--muted"),
        faint: token("--faint"),
        line: token("--line"),
        line2: token("--line-2"),
        hover: token("--hover"),
        sand: token("--sand"),
        terracotta: {
          DEFAULT: token("--terracotta"),
          dark: token("--terracotta-dark"),
          soft: token("--terracotta-soft"),
        },
        positive: { DEFAULT: token("--positive"), soft: token("--positive-soft") },
        danger: { DEFAULT: token("--danger"), soft: token("--danger-soft") },
        warn: { DEFAULT: token("--warn"), soft: token("--warn-soft") },
        link: token("--link"),
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
