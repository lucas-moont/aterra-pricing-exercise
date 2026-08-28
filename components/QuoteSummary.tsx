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
  const nettPct = Math.min(clientPct, (supplierNett / quote.clientCeiling) * 100);
  const headroomPct = ceiling.over ? 0 : Math.max(0, 100 - clientPct);

  function scrollToLine(id: string) {
    document.getElementById(`line-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-[12px]">
        <p>
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink">Budget</span>
          <span className="ml-2 text-[#6B635C]">
            client ceiling {formatMoney(quote.clientCeiling)}
            <span> · </span>
            <span className={ceiling.over ? "font-medium text-danger" : "text-ink"}>
              {ceiling.over
                ? `over by ${formatMoney(-ceiling.delta)}`
                : `you are ${formatMoney(ceiling.delta)} under`}
            </span>
          </span>
        </p>
        <p className="tabular-nums text-[#6B635C]">
          <span className="uppercase tracking-wide">Nett</span> {formatMoney(supplierNett)}
          <span> · </span>
          <span className="uppercase tracking-wide">Vat</span> {formatMoney(vat)}
          <span> · </span>
          GP {formatMoney(pricing.totals.gp)}
          <span> · </span>
          <span className={`font-medium ${gpHealthy ? "text-positive" : "text-warn"}`}>
            {formatGpPct(pricing.totals.blendedGpPct)}
          </span>
        </p>
      </div>

      <div className="relative mt-8">
        {!ceiling.over && (
          <div
            className="absolute -top-6 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-white px-2 py-0.5 text-[11px] text-ink shadow-card"
            style={{ left: `${clientPct}%` }}
          >
            {formatMoney(clientPays)} client price
            {prov.provisional ? " (provisional)" : ""}
          </div>
        )}

        <div className="flex h-8 overflow-hidden rounded-md bg-[#EDE4D6]">
          {ceiling.over ? (
            <div className="h-full w-full bg-danger" />
          ) : (
            <>
              <div className="h-full bg-[#E4D4C2]" style={{ width: `${nettPct}%` }} />
              <div
                className="h-full bg-terracotta"
                style={{ width: `${Math.max(0, clientPct - nettPct)}%` }}
              />
              {headroomPct > 0 && (
                <div
                  className="flex h-full items-center justify-end bg-[#EDE8E0] pr-2 text-[11px] text-[#8A8178]"
                  style={{ width: `${headroomPct}%` }}
                >
                  {headroomPct > 6 && <span className="whitespace-nowrap">headroom {formatMoney(ceiling.delta)}</span>}
                </div>
              )}
            </>
          )}
        </div>
        {!ceiling.over && (
          <div
            className="pointer-events-none absolute top-[-3px] h-[38px] w-px bg-ink/70"
            style={{ left: `${clientPct}%` }}
            aria-hidden
          />
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-[#8A8178]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[2px] bg-[#E4D4C2]" />
          supplier NETT
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-[2px] ${ceiling.over ? "bg-danger" : "bg-terracotta"}`} />
          client price
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-px bg-ink/70" />
          client ceiling
        </span>
      </div>

      {(underwater.length > 0 || prov.provisional || floor.belowFloor || ceiling.over) && (
        <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
          {underwater.length > 0 && (
            <button
              type="button"
              onClick={() => scrollToLine(underwater[0])}
              className="rounded-full bg-danger-soft px-3 py-1 font-medium text-danger"
            >
              {underwater.length} line{underwater.length > 1 ? "s" : ""} below cost →
            </button>
          )}
          {ceiling.over && (
            <span className="rounded-full bg-danger-soft px-3 py-1 font-medium text-danger">
              Over ceiling by {formatMoney(-ceiling.delta)}
            </span>
          )}
          {prov.provisional && (
            <span className="rounded-full bg-warn-soft px-3 py-1 font-medium text-warn">
              Provisional total · from {formatMoney(prov.fromClientPays)} · excludes{" "}
              {prov.excludedCount} unpriced line{prov.excludedCount > 1 ? "s" : ""}
            </span>
          )}
          {floor.belowFloor && (
            <span className="rounded-full bg-warn-soft px-3 py-1 font-medium text-warn">
              Blended margin {formatGpPct(floor.blendedPct)} below {BLENDED_MARGIN_FLOOR_PCT}% floor
            </span>
          )}
        </div>
      )}
    </section>
  );
}
