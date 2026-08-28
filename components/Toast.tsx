"use client";

import React from "react";

// A non-destructive save-failure notice. Presentational only — render it where
// `saveError` from useQuote is available (see the wiring note in Épico C).
export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      role="alert"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-[13px] text-danger shadow-card"
    >
      <span>{message} — your change was rolled back.</span>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded border border-danger/40 px-2 py-0.5 text-[12px] hover:bg-white/40"
      >
        Dismiss
      </button>
    </div>
  );
}
