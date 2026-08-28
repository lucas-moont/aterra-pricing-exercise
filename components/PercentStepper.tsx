"use client";

import React from "react";

export function PercentStepper({
  value,
  onChange,
  ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  ariaLabel: string;
}) {
  const [draft, setDraft] = React.useState<string>(String(value));

  React.useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commit(next: number) {
    if (Number.isFinite(next)) onChange(next);
  }

  return (
    <div
      className="inline-flex items-center rounded-md border border-line bg-cream"
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        aria-label={`${ariaLabel} decrease`}
        onClick={() => commit(value - 1)}
        className="grid h-6 w-6 place-items-center text-[13px] text-muted hover:bg-panel"
      >
        −
      </button>
      <span className="inline-flex items-center border-x border-line px-0.5">
        <input
          aria-label={ariaLabel}
          className="w-8 bg-transparent text-center text-[12px] tabular-nums outline-none"
          value={draft}
          inputMode="numeric"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            const n = parseFloat(draft);
            if (Number.isFinite(n)) commit(n);
            else setDraft(String(value));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
        />
        <span className="pr-1 text-[11px] text-muted">%</span>
      </span>
      <button
        type="button"
        aria-label={`${ariaLabel} increase`}
        onClick={() => commit(value + 1)}
        className="grid h-6 w-6 place-items-center text-[13px] text-muted hover:bg-panel"
      >
        +
      </button>
    </div>
  );
}
