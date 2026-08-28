"use client";

import React from "react";
import { IconMoon, IconSun } from "./icons";

// Toggles the `dark` class on <html> and remembers the choice in localStorage.
// The initial class is set by a blocking script in the layout (no flash), so here
// we only read the current state on mount and flip it on click. The icon follows
// the mode: moon in light (tap for dark), sun in dark (tap for light).
export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // storage can be unavailable (private mode); the toggle still works for the session
    }
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      className={className}
    >
      {dark ? <IconSun size={13} /> : <IconMoon size={13} />}
    </button>
  );
}
