"use client";

import React from "react";
import type { LineItem } from "@/lib/types";
import { priceLine } from "@/lib/pricing";
import { formatMoney, formatGpPct, formatWholePct } from "@/lib/format";

// A bespoke slide-over that explains one line's number, opened by the row's
// "Details" button. Built from scratch (no library): backdrop, enter/exit
// animation, Escape to close, a focus trap, scroll lock, and focus restored to
// the trigger on close. The body is the full cost waterfall — how nett becomes
// what the client pays — with the agent's commission carved out and the rate's
// provenance shown. It is the product's "explain a number" promise, in place.

export function LineDetailDrawer({
  line,
  onClose,
}: {
  line: LineItem | null;
  onClose: () => void;
}) {
  const open = line !== null;
  const [show, setShow] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const previouslyFocused = React.useRef<HTMLElement | null>(null);

  const handleClose = React.useCallback(() => {
    setShow(false);
    window.setTimeout(onClose, 200); // let the exit animation finish
  }, [onClose]);

  // Open: remember focus, lock scroll, animate in, focus the panel.
  React.useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const inRaf = requestAnimationFrame(() => setShow(true));
    const focusRaf = requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      cancelAnimationFrame(inRaf);
      cancelAnimationFrame(focusRaf);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  // Escape to close + a focus trap that cycles Tab within the panel.
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        handleClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, handleClose]);

  if (!open) return null;

  const p = priceLine(line);
  const vatAmount = line.nett !== null ? line.nett * (line.vatPct / 100) : null;
  const markupAmount =
    p.dmcReceives !== null && p.costPlusVat !== null ? p.dmcReceives - p.costPlusVat : null;
  const commissionCut =
    p.clientPays !== null && p.dmcReceives !== null ? p.clientPays - p.dmcReceives : null;

  const confidenceTone =
    line.rate.confidence === "high"
      ? "text-positive"
      : line.rate.confidence === "medium"
        ? "text-warn"
        : "text-muted";

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 bg-ink/30 transition-opacity duration-200 ${
          show ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="line-drawer-title"
        tabIndex={-1}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-xl outline-none transition-transform duration-200 ${
          show ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-muted">{line.section}</div>
            <h2 id="line-drawer-title" className="font-serif text-[20px] leading-tight text-ink">
              {line.service}
            </h2>
            <div className="text-[12px] text-muted">
              {line.supplier} · {line.dates} · {line.units}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close details"
            className="shrink-0 rounded-md px-2 py-1 text-muted hover:bg-panel"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {p.unpriced ? (
            <div className="rounded-lg bg-warn-soft px-4 py-3 text-[13px] text-warn">
              No contracted rate found yet. This line is <strong>unknown, not zero</strong>, and is
              excluded from the trip total until a rate is confirmed.
            </div>
          ) : (
            <section aria-label="Price breakdown" className="text-[13px]">
              <BreakdownRow label="Nett — paid to supplier" value={formatMoney(line.nett!)} />
              <BreakdownRow
                label={`VAT · ${formatWholePct(line.vatPct)}`}
                value={`+ ${formatMoney(vatAmount!)}`}
                muted
              />
              <Divider />
              <BreakdownRow label="Cost + VAT" value={formatMoney(p.costPlusVat!)} strong />
              <BreakdownRow
                label={`Markup · ${formatWholePct(line.mrkpPct)}`}
                value={`${markupAmount! >= 0 ? "+" : "−"} ${formatMoney(Math.abs(markupAmount!))}`}
                muted
                tone={markupAmount! < 0 ? "danger" : undefined}
              />
              <Divider />
              <BreakdownRow label="DMC receives — what we bank" value={formatMoney(p.dmcReceives!)} strong />
              <BreakdownRow
                label={`Agent commission · ${formatWholePct(line.commPct)}`}
                value={`+ ${formatMoney(commissionCut!)}`}
                muted
              />
              <Divider />
              <BreakdownRow label="Client pays" value={formatMoney(p.clientPays!)} strong big />

              <div className="mt-5 rounded-lg border border-line bg-panel px-4 py-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[12px] uppercase tracking-wide text-muted">Gross profit</span>
                  <span
                    className={`tabular-nums font-semibold ${p.belowCost ? "text-danger" : "text-positive"}`}
                  >
                    {formatMoney(p.gp!)} · {formatGpPct(p.gpPct!)}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-muted">
                  Measured on what the DMC banks. <strong>Excludes</strong> the agent&apos;s
                  commission of {formatMoney(commissionCut!)} — that is the agent&apos;s money, never
                  the DMC&apos;s.
                </p>
                {p.belowCost && (
                  <p className="mt-2 text-[12px] font-medium text-danger">
                    This line is priced below cost.
                  </p>
                )}
              </div>
            </section>
          )}

          <section aria-label="Rate source" className="mt-5 border-t border-line pt-4 text-[13px]">
            <div className="text-[11px] uppercase tracking-wide text-muted">Rate source</div>
            <p className="mt-1 text-ink">{line.rate.note}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
              {line.rate.document !== "—" && (
                <span className="text-muted">
                  Source: <span className="text-ink">{line.rate.document}</span>
                </span>
              )}
              <span className="text-muted">
                Confidence:{" "}
                <span className={confidenceTone}>
                  {line.rate.confidence.charAt(0).toUpperCase() + line.rate.confidence.slice(1)}
                </span>
              </span>
              <span className={line.confirmed ? "text-positive" : "text-muted"}>
                {line.confirmed ? "Confirmed with supplier" : "Not yet confirmed"}
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  muted,
  strong,
  big,
  tone,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
  big?: boolean;
  tone?: "danger";
}) {
  return (
    <div className="flex items-baseline justify-between py-1.5">
      <span className={muted ? "text-muted" : "text-ink"}>{label}</span>
      <span
        className={`tabular-nums ${strong ? "font-semibold text-ink" : ""} ${
          big ? "text-[16px]" : ""
        } ${tone === "danger" ? "text-danger" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="my-1 border-t border-line/70" />;
}
