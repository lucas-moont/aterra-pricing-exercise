"use client";

import React from "react";
import type { LineItem, Quote, SectionName } from "@/lib/types";
import type { LinePricing, QuotePricing, SectionPricing } from "@/lib/pricing";
import { formatMoney, formatGpPct } from "@/lib/format";
import { PercentStepper } from "./PercentStepper";
import type { EditableField } from "@/lib/useQuote";
import {
  IconBed,
  IconCar,
  IconCheck,
  IconChevronDown,
  IconInfo,
  IconLeaf,
  IconList,
  IconSearch,
} from "./icons";

const COL_COUNT = 13;

function Money({ value, strong }: { value: number | null; strong?: boolean }) {
  if (value === null) return <span className="text-muted">No rate</span>;
  return <span className={`tabular-nums ${strong ? "font-semibold" : ""}`}>{formatMoney(value)}</span>;
}

function GpCell({ p }: { p: LinePricing }) {
  if (p.unpriced) return <span className="text-muted">—</span>;
  return (
    <div className="text-right">
      <div
        className={`tabular-nums ${
          p.belowCost ? "font-semibold text-danger" : "font-medium text-positive"
        }`}
      >
        {formatMoney(p.gp!)}
      </div>
      <div className={`text-[11px] ${p.belowCost ? "text-danger" : "text-muted"}`}>
        {p.belowCost ? "below cost" : formatGpPct(p.gpPct!)}
      </div>
    </div>
  );
}

function GpInfo() {
  return (
    <span
      title="GP excludes agent commission — it is measured on what the DMC banks (DMC Receives), not on what the client pays."
      aria-label="GP excludes agent commission"
      className="ml-0.5 inline-flex cursor-help align-middle text-muted"
    >
      <IconInfo size={11} />
    </span>
  );
}

function TypeIcon({ section }: { section: SectionName }) {
  const wrap = "grid h-7 w-7 shrink-0 place-items-center rounded-md bg-cream text-muted";
  if (section === "ACCOMMODATION")
    return (
      <span className={wrap}>
        <IconBed size={14} />
      </span>
    );
  if (section === "TRANSPORT")
    return (
      <span className={wrap}>
        <IconCar size={14} />
      </span>
    );
  return (
    <span className={wrap}>
      <IconLeaf size={14} />
    </span>
  );
}

function Confidence({ value }: { value: LineItem["rate"]["confidence"] }) {
  const label = value.charAt(0).toUpperCase() + value.slice(1);
  return <span>Confidence: {label}</span>;
}

function Row({
  line,
  p,
  onEdit,
  saving,
}: {
  line: LineItem;
  p: LinePricing;
  onEdit: (field: EditableField, value: number) => void;
  saving?: boolean;
}) {
  return (
    <tr
      id={`line-${line.id}`}
      className={`border-b border-line align-top transition-opacity ${
        p.unpriced ? "bg-warn-soft/80" : "bg-white/40 hover:bg-panel/80"
      } ${saving ? "opacity-60" : ""}`}
    >
      <td className="px-2 py-3">
        <input type="checkbox" className="accent-terracotta" aria-label={`Select ${line.service}`} />
      </td>
      <td className="py-3 pr-3">
        <div className="flex items-start gap-2">
          <TypeIcon section={line.section} />
          <div>
            <div className="font-medium leading-snug">{line.service}</div>
            <div className="text-[12px] text-muted">{line.supplier}</div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap py-3 pr-3 text-[12px]">
        <div className="flex items-center gap-1">
          {line.dates}
          {line.confirmed && (
            <span className="text-positive" title="Confirmed">
              <IconCheck size={12} />
            </span>
          )}
        </div>
      </td>
      <td className="whitespace-nowrap py-3 pr-3 text-[12px] text-muted">{line.units}</td>
      <td className="py-3 pr-3 text-right">
        <Money value={line.nett} />
      </td>
      <td className="py-3 pr-3 text-right text-muted">{p.unpriced ? "—" : `${line.vatPct}%`}</td>
      <td className="py-3 pr-3 text-right">
        <Money value={p.costPlusVat} />
      </td>
      <td className="py-3 pr-2 text-right">
        <PercentStepper
          value={line.commPct}
          onChange={(v) => onEdit("commPct", v)}
          ariaLabel={`${line.service} commission`}
        />
      </td>
      <td className="py-3 pr-2 text-right">
        <PercentStepper
          value={line.mrkpPct}
          onChange={(v) => onEdit("mrkpPct", v)}
          ariaLabel={`${line.service} markup`}
        />
      </td>
      <td className="py-3 pr-3 text-right">
        <Money value={p.clientPays} strong />
      </td>
      <td className="py-3 pr-3">
        <GpCell p={p} />
      </td>
      <td className="max-w-[220px] py-3 pr-3 text-[12px] leading-snug">
        <div>{line.rate.note}</div>
        <div className="mt-0.5 text-muted">
          Source:{" "}
          <span className="text-terracotta underline decoration-terracotta/30">{line.rate.document}</span>
          <span> · </span>
          <Confidence value={line.rate.confidence} />
        </div>
      </td>
      <td className="py-3 pr-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-line bg-panel px-2 py-1 text-[11px] text-ink/80 hover:bg-white"
          >
            <IconList size={12} />
            Details
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-line bg-panel px-2 py-1 text-[11px] text-ink/80 hover:bg-white"
          >
            <IconSearch size={12} />
            Search
          </button>
        </div>
      </td>
    </tr>
  );
}

function SectionHeader({
  section,
  lines,
  open,
  onToggle,
}: {
  section: SectionPricing;
  lines: LineItem[];
  open: boolean;
  onToggle: () => void;
}) {
  const nett = lines.reduce((sum, l) => sum + (l.nett ?? 0), 0);
  const margin = section.dmcReceives === 0 ? 0 : section.gp / section.dmcReceives;
  return (
    <tr className="bg-panel">
      <td colSpan={COL_COUNT} className="px-2 py-2">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center gap-2 text-left"
        >
          <IconChevronDown
            size={14}
            className={`text-muted transition-transform ${open ? "" : "-rotate-90"}`}
          />
          <span className="text-[11px] font-semibold uppercase tracking-wide">
            {section.name} <span className="font-medium text-muted">({lines.length})</span>
          </span>
          <span className="ml-auto text-[12px] tabular-nums text-muted">
            {formatMoney(nett)} nett · {formatMoney(section.clientPays)} client · {formatGpPct(margin)} m
          </span>
        </button>
      </td>
    </tr>
  );
}

export default function PricingTable({
  quote,
  pricing,
  onEdit,
  savingLines,
}: {
  quote: Quote;
  pricing: QuotePricing;
  onEdit: (id: string, field: EditableField, value: number) => void;
  savingLines?: Record<string, boolean>;
}) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  function isOpen(name: string) {
    return open[name] !== false;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white/50">
      <table className="w-full min-w-[1180px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-line text-left text-[10px] font-medium uppercase tracking-[0.1em] text-muted">
            <th className="w-8 px-2 py-2" />
            <th className="py-2 pr-3">Service / Supplier</th>
            <th className="py-2 pr-3">Dates</th>
            <th className="py-2 pr-3">U.</th>
            <th className="py-2 pr-3 text-right">Nett</th>
            <th className="py-2 pr-3 text-right">VAT</th>
            <th className="py-2 pr-3 text-right">Cost + VAT</th>
            <th className="py-2 pr-3 text-right">Comm.</th>
            <th className="py-2 pr-3 text-right">Mrkp.</th>
            <th className="py-2 pr-3 text-right">Client pays</th>
            <th className="py-2 pr-3 text-right">
              GP <GpInfo />
            </th>
            <th className="py-2 pr-3">Reasoning</th>
            <th className="py-2 pr-3">Alternative</th>
          </tr>
        </thead>
        <tbody>
          {pricing.sections.map((section) => {
            const lines = quote.lines.filter((l) => l.section === section.name);
            const expanded = isOpen(section.name);
            return (
              <React.Fragment key={section.name}>
                <SectionHeader
                  section={section}
                  lines={lines}
                  open={expanded}
                  onToggle={() =>
                    setOpen((prev) => ({
                      ...prev,
                      [section.name]: prev[section.name] === false,
                    }))
                  }
                />
                {expanded &&
                  lines.map((line) => (
                    <Row
                      key={line.id}
                      line={line}
                      p={pricing.lines[line.id]}
                      onEdit={(field, value) => onEdit(line.id, field, value)}
                      saving={!!savingLines?.[line.id]}
                    />
                  ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
