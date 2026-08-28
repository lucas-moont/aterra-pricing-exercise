"use client";

import React from "react";
import { IconCheck } from "./icons";

// A corner toast. "info" reads as a success confirmation (solid green, check
// icon, auto-dismisses) — loud enough to catch the eye. "error" is a failed save
// the consultant must notice, and stays until dismissed. The caller owns the copy.
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
  const isSuccess = variant === "info";

  // Animate in so the toast draws the eye instead of just appearing.
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const r = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(r);
  }, []);

  React.useEffect(() => {
    if (!autoDismissMs) return;
    const t = window.setTimeout(onDismiss, autoDismissMs);
    return () => window.clearTimeout(t);
  }, [autoDismissMs, onDismiss]);

  const tone = isSuccess
    ? "bg-positive text-white ring-1 ring-black/5"
    : "bg-danger text-white ring-1 ring-black/5";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={`fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-xl px-5 py-4 text-[14px] font-medium shadow-lg transition-all duration-300 ${tone} ${
        show ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20">
        {isSuccess ? (
          <IconCheck size={16} strokeWidth={3} />
        ) : (
          <span className="text-[15px] font-bold leading-none">!</span>
        )}
      </span>
      <span className="leading-snug">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-1 shrink-0 rounded-md px-2 py-1 text-[13px] opacity-80 hover:bg-white/15 hover:opacity-100"
      >
        Dismiss
      </button>
    </div>
  );
}
