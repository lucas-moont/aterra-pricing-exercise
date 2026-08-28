"use client";

import React from "react";

const btn =
  "grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#E8DCC8] bg-white text-[14px] font-semibold leading-none text-[#2C241E] hover:bg-[#F7F1E8]";

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
    <div className="inline-flex items-center gap-0.5" role="group" aria-label={ariaLabel}>
      <button type="button" aria-label={`${ariaLabel} decrease`} onClick={() => commit(value - 1)} className={btn}>
        −
      </button>
      <span className="inline-flex items-center text-[12px] font-semibold tabular-nums text-[#2C241E]">
        <input
          aria-label={ariaLabel}
          className="w-5 bg-transparent text-center font-semibold outline-none"
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
        %
      </span>
      <button type="button" aria-label={`${ariaLabel} increase`} onClick={() => commit(value + 1)} className={btn}>
        +
      </button>
    </div>
  );
}
