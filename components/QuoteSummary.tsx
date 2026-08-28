"use client";

import React from "react";
import type { Quote } from "@/lib/types";
import type { QuotePricing } from "@/lib/pricing";
import { formatMoney, formatGpPct } from "@/lib/format";
import {
  ceilingBreach,
  underwaterLines,
  provisionalTotal,
  blendedMarginFloor,
} from "@/lib/detectors";
import { BLENDED_MARGIN_FLOOR_PCT } from "@/lib/config";

export default function QuoteSummary({
  quote,
  pricing,
}: {
  quote: Quote;
  pricing: QuotePricing;
}) {
  const ceiling = ceilingBreach(quote, pricing);
  const underwater = underwaterLines(pricing);
  const prov = provisionalTotal(pricing);
  const floor = blendedMarginFloor(pricing, BLENDED_MARGIN_FLOOR_PCT);

  const supplierNett = quote.lines.reduce((sum, line) => sum + (line.nett ?? 0), 0);
  const vat = pricing.totals.costPlusVat - supplierNett;
  const clientPays = pricing.totals.clientPays;
  const gpHealthy = !floor.belowFloor;

  const clientPct = Math.min(100, (clientPays / quote.clientCeiling) * 100);
  const headroomPct = ceiling.over ? 0 : Math.max(0, 100 - clientPct);
  const showHeadroomInBar = !ceiling.over && headroomPct >= 10;

  function scrollToLine(id: string) {
    document.getElementById(`line-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-[12px] text-muted">
        <p className="min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink2">
            Budget
          </span>
          <span className="ml-2">
            client ceiling {formatMoney(quote.clientCeiling)}
            <span> · </span>
            <span className={ceiling.over ? "text-danger" : undefined}>
              {ceiling.over
                ? `over by ${formatMoney(-ceiling.delta)}`
                : `you are ${formatMoney(ceiling.delta)} under`}
            </span>
          </span>
        </p>
        <p className="tabular-nums">
          <span className="uppercase">Nett</span>{" "}
          <span className="font-semibold text-ink2">{formatMoney(supplierNett)}</span>
          <span> · </span>
          <span className="uppercase">Vat</span>{" "}
          <span className="font-semibold text-ink2">{formatMoney(vat)}</span>
          <span> · </span>
          <span className="uppercase">Gp</span>{" "}
          <span className="font-semibold text-ink2">{formatMoney(pricing.totals.gp)}</span>
          <span> · </span>
          <span className={`font-semibold ${gpHealthy ? "text-positive" : "text-warn"}`}>
            {formatGpPct(pricing.totals.blendedGpPct)}
          </span>
        </p>
      </div>

      <div className="mt-1.5">
        <div className="relative h-5 overflow-hidden rounded-full bg-sand">
          {ceiling.over ? (
            <div className="absolute inset-0 bg-danger" />
          ) : (
            <div
              className="absolute inset-y-0 left-0"
              style={{
                width: `${Math.min(100, clientPct)}%`,
                background:
                  "linear-gradient(90deg, rgb(var(--sand)) 0%, rgb(var(--terracotta)) 100%)",
              }}
            />
          )}
          <div className="relative z-[1] flex h-full items-center justify-between px-3">
            <span className="truncate text-[11px] font-semibold leading-none text-ink">
              {formatMoney(clientPays)} client price
            </span>
            {showHeadroomInBar && (
              <span className="shrink-0 text-[11px] leading-none text-muted">
                headroom {formatMoney(ceiling.delta)}
              </span>
            )}
          </div>
          {!ceiling.over && (
            <div
              className="pointer-events-none absolute inset-y-0 z-[2] w-[2px] -translate-x-1/2 rounded-full bg-ink/55"
              style={{ left: `${Math.min(99.4, Math.max(clientPct, 1.2))}%` }}
              aria-hidden
            />
          )}
        </div>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-4 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[1px] bg-sand" />
          supplier NETT
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-[1px] ${ceiling.over ? "bg-danger" : "bg-terracotta"}`} />
          client price
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-px bg-ink2" />
          client ceiling
        </span>
      </div>

      {(underwater.length > 0 || prov.provisional || floor.belowFloor || ceiling.over) && (
        <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
          {underwater.length > 0 && (
            <button
              type="button"
              onClick={() => scrollToLine(underwater[0])}
              className="rounded-full bg-danger-soft px-3 py-1 font-normal text-danger"
            >
              {underwater.length} line{underwater.length > 1 ? "s" : ""} below cost →
            </button>
          )}
          {ceiling.over && (
            <span className="rounded-full bg-danger-soft px-3 py-1 font-normal text-danger">
              Over ceiling by {formatMoney(-ceiling.delta)}
            </span>
          )}
          {prov.provisional && (
            <span className="rounded-full bg-warn-soft px-3 py-1 font-normal text-warn">
              Provisional total · from {formatMoney(prov.fromClientPays)} · excludes{" "}
              {prov.excludedCount} unpriced line{prov.excludedCount > 1 ? "s" : ""}
            </span>
          )}
          {floor.belowFloor && (
            <span className="rounded-full bg-warn-soft px-3 py-1 font-normal text-warn">
              Blended margin {formatGpPct(floor.blendedPct)} below {BLENDED_MARGIN_FLOOR_PCT}% floor
            </span>
          )}
        </div>
      )}
    </section>
  );
}
