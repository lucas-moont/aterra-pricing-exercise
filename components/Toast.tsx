"use client";

import React from "react";

// A small corner toast. "error" is assertive and stays until dismissed (a failed
// save the consultant must notice); "info" is polite and auto-dismisses (a
// confirmation like a markup reset). The message is passed in full — the caller
// owns the wording.
export function Toast({
  message,
  onDismiss,
  variant = "error",
  autoDismissMs,
}: {
  message: string;
  onDismiss: () => void;
  variant?: "error" | "info";
  autoDismissMs?: number;
}) {
  React.useEffect(() => {
    if (!autoDismissMs) return;
    const t = window.setTimeout(onDismiss, autoDismissMs);
    return () => window.clearTimeout(t);
  }, [autoDismissMs, onDismiss]);

  const tone =
    variant === "error"
      ? "border-danger/30 bg-danger-soft text-danger"
      : "border-line bg-panel text-ink";

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`fixed bottom-4 right-4 z-[60] flex items-center gap-3 rounded-lg border px-4 py-3 text-[13px] shadow-card ${tone}`}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded border border-current px-2 py-0.5 text-[12px] opacity-70 hover:opacity-100"
      >
        Dismiss
      </button>
    </div>
  );
}
