"use client";

import React from "react";

const btn =
  "grid h-6 w-6 shrink-0 place-items-center rounded-md border border-line bg-elevated text-[14px] font-semibold leading-none text-ink hover:bg-hover";

// Editable percentage with − / + steppers. The "%" is fixed; the number is typed.
// Typing calls `onChange` on every keystroke (live recompute, no save); leaving the
// field (blur / Enter) or clicking a stepper calls `onCommit` (persist). Splitting
// the two lets the budget move as you type without a save on every key.
export function PercentStepper({
  value,
  onChange,
  onCommit,
  ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  onCommit: (v: number) => void;
  ariaLabel: string;
}) {
  const [draft, setDraft] = React.useState<string>(String(value));
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync from outside (reset, rollback) — but never while the field is focused, so
  // a live keystroke (or a partial entry like "1.") is not clobbered mid-edit.
  React.useEffect(() => {
    if (document.activeElement !== inputRef.current) setDraft(String(value));
  }, [value]);

  function step(next: number) {
    if (!Number.isFinite(next)) return;
    setDraft(String(next));
    onChange(next);
    onCommit(next);
  }

  return (
    <div className="inline-flex items-center gap-0.5" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        aria-label={`${ariaLabel} decrease`}
        onClick={() => step(value - 1)}
        className={btn}
      >
        −
      </button>
      <span className="inline-flex items-center rounded-md border border-line bg-elevated px-1 text-[12px] font-semibold tabular-nums text-ink focus-within:border-terracotta focus-within:ring-1 focus-within:ring-terracotta/30">
        <input
          ref={inputRef}
          aria-label={ariaLabel}
          title="Click to edit"
          className="w-7 cursor-text bg-transparent text-center font-semibold outline-none"
          value={draft}
          inputMode="numeric"
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const raw = e.target.value;
            setDraft(raw);
            const n = parseFloat(raw);
            if (Number.isFinite(n)) onChange(n); // live recompute, no save
          }}
          onBlur={() => {
            const n = parseFloat(draft);
            if (Number.isFinite(n)) onCommit(n); // persist on blur
            else setDraft(String(value));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
        />
        <span className="pl-0.5 text-muted">%</span>
      </span>
      <button
        type="button"
        aria-label={`${ariaLabel} increase`}
        onClick={() => step(value + 1)}
        className={btn}
      >
        +
      </button>
    </div>
  );
}
