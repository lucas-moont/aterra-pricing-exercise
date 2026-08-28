"use client";

import React from "react";
import type { LineItem, Quote, SectionName } from "@/lib/types";
import type { LinePricing, QuotePricing, SectionPricing } from "@/lib/pricing";
import { formatMoney, formatGpPct } from "@/lib/format";
import { PercentStepper } from "./PercentStepper";
import { Toolbar } from "./Shell";
import type { EditableField } from "@/lib/useQuote";
import {
  IconBed,
  IconCar,
  IconCheck,
  IconChevronDown,
  IconCircle,
  IconInfo,
  IconLeaf,
  IconSearch,
} from "./icons";

const COL_COUNT = 13;

const OPTIONS: Record<string, number> = {
  "acc-1": 2,
  "acc-2": 2,
  "acc-3": 2,
};

function Money({ value, strong }: { value: number | null; strong?: boolean }) {
  if (value === null) return <span className="font-semibold text-[#8A8178]">No rate</span>;
  return (
    <span className={`tabular-nums font-semibold ${strong ? "text-[#2C241E]" : "text-[#3A322C]"}`}>
      {formatMoney(value)}
    </span>
  );
}

function GpCell({ p }: { p: LinePricing }) {
  if (p.unpriced) return <span className="text-[#8A8178]">—</span>;
  return (
    <div className="text-right leading-tight">
      <div
        className={`tabular-nums ${
          p.belowCost ? "font-semibold text-danger" : "font-semibold text-positive"
        }`}
      >
        {formatMoney(p.gp!)}
      </div>
      <div className={`text-[11px] ${p.belowCost ? "text-danger" : "text-[#8A8178]"}`}>
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
      className="ml-0.5 inline-flex cursor-help align-middle text-[#8A8178]"
    >
      <IconInfo size={11} strokeWidth={2.2} />
    </span>
  );
}

function TypeIcon({ section }: { section: SectionName }) {
  const wrap =
    "grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#F3EDE4] text-[#5C4A3A]";
  if (section === "ACCOMMODATION")
    return (
      <span className={wrap}>
        <IconBed size={15} strokeWidth={2.2} />
      </span>
    );
  if (section === "TRANSPORT")
    return (
      <span className={wrap}>
        <IconCar size={15} strokeWidth={2.2} />
      </span>
    );
  return (
    <span className={wrap}>
      <IconLeaf size={15} strokeWidth={2.2} />
    </span>
  );
}

function StatusMark({ confirmed }: { confirmed: boolean }) {
  if (confirmed) {
    return (
      <span
        className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#3E7C55] text-white"
        title="Confirmed"
      >
        <IconCheck size={9} strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="text-[#9AAABB]" title="Unconfirmed">
      <IconCircle size={16} strokeWidth={2.2} />
    </span>
  );
}

function Confidence({ value }: { value: LineItem["rate"]["confidence"] }) {
  const label = value.charAt(0).toUpperCase() + value.slice(1);
  const tone =
    value === "high" ? "text-positive" : value === "medium" ? "text-warn" : "text-[#8A8178]";
  return (
    <span>
      Confidence: <span className={`font-semibold ${tone}`}>{label}</span>
    </span>
  );
}

function unitCount(units: string): string {
  const match = units.match(/\d+/);
  return match ? match[0] : "1";
}

function Row({
  line,
  p,
  onEdit,
  saving,
  onOpenDetails,
}: {
  line: LineItem;
  p: LinePricing;
  onEdit: (field: EditableField, value: number) => void;
  saving?: boolean;
  onOpenDetails?: (id: string) => void;
}) {
  const vatAmount = line.nett === null ? null : line.nett * (line.vatPct / 100);
  const options = OPTIONS[line.id];

  return (
    <tr
      id={`line-${line.id}`}
      className={`border-b border-[#EDE6DC] bg-[#fdf6eb] align-middle ${saving ? "opacity-60" : ""}`}
    >
      <td className="px-3 py-3.5">
        <input type="checkbox" className="accent-terracotta" aria-label={`Select ${line.service}`} />
      </td>
      <td className="py-3.5 pr-3">
        <div className="flex items-center gap-2.5">
          <TypeIcon section={line.section} />
          <div className="min-w-0">
            <div className="font-semibold leading-snug text-[#2C241E]">{line.service}</div>
            <div className="text-[12px] font-medium text-[#8A8178]">{line.supplier}</div>
          </div>
          <StatusMark confirmed={line.confirmed} />
        </div>
      </td>
      <td className="whitespace-nowrap py-3.5 pr-3 leading-tight">
        <div className="text-[12px] font-semibold text-[#2C241E]">{line.dates}</div>
        <div className="text-[11px] font-medium text-[#8A8178]">{line.units.replace(/ x /g, " × ")}</div>
      </td>
      <td className="whitespace-nowrap py-3.5 pr-3 text-center text-[13px] font-semibold text-[#2C241E]">
        {unitCount(line.units)}
      </td>
      <td className="py-3.5 pr-3 text-right">
        <Money value={line.nett} />
      </td>
      <td className="py-3.5 pr-3 text-right leading-tight">
        {p.unpriced ? (
          <span className="font-semibold text-[#8A8178]">—</span>
        ) : (
          <>
            <div className="font-semibold tabular-nums">{formatMoney(vatAmount!)}</div>
            <div className="font-medium text-[#8A8178]">{line.vatPct}%</div>
          </>
        )}
      </td>
      <td className="py-3.5 pr-3 text-right">
        <Money value={p.costPlusVat} />
      </td>
      <td className="py-3.5 pr-2">
        <PercentStepper
          value={line.commPct}
          onChange={(v) => onEdit("commPct", v)}
          ariaLabel={`${line.service} commission`}
        />
      </td>
      <td className="py-3.5 pr-2">
        <PercentStepper
          value={line.mrkpPct}
          onChange={(v) => onEdit("mrkpPct", v)}
          ariaLabel={`${line.service} markup`}
        />
      </td>
      <td className="py-3.5 pr-3 text-right">
        <Money value={p.clientPays} strong />
      </td>
      <td className="py-3.5 pr-3">
        <GpCell p={p} />
      </td>
      <td className="max-w-[240px] py-3.5 pr-3 text-[12px] font-medium leading-snug text-[#3A322C]">
        <div>{line.rate.note}</div>
        {line.rate.document !== "—" && (
          <div className="mt-0.5">
            Source:{" "}
            <span className="font-semibold text-positive">{line.rate.document}</span>
            <span className="text-[#8A8178]"> · </span>
            <Confidence value={line.rate.confidence} />
          </div>
        )}
      </td>
      <td className="py-3.5 pr-3">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenDetails?.(line.id)}
            className="inline-flex items-center gap-1 rounded-full border border-[#E8DCC8] bg-white px-2.5 py-1 text-[11px] font-medium text-[#5C564E] hover:bg-[#FBF7F1]"
          >
            <IconInfo size={12} strokeWidth={2.2} />
            Details
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-[#E8DCC8] bg-white px-2.5 py-1 text-[11px] font-medium text-[#5C564E] hover:bg-[#FBF7F1]"
          >
            <IconSearch size={12} strokeWidth={2.2} />
            Search
          </button>
          {options ? (
            <span className="rounded-full bg-[#F4E0D2] px-2 py-0.5 text-[11px] font-medium text-terracotta">
              {options} options
            </span>
          ) : null}
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
    <tr className="bg-[#F0E8DD]">
      <td colSpan={COL_COUNT} className="px-3 py-2">
        <button type="button" onClick={onToggle} className="flex w-full items-center gap-2 text-left">
          <IconChevronDown
            size={14}
            className={`text-[#8A8178] transition-transform ${open ? "" : "-rotate-90"}`}
          />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3A322C]">
            {section.name} <span className="font-medium text-[#8A8178]">({lines.length})</span>
          </span>
          <span className="ml-auto text-[12px] tabular-nums text-[#8A8178]">
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
  onReset,
  onOpenDetails,
}: {
  quote: Quote;
  pricing: QuotePricing;
  onEdit: (id: string, field: EditableField, value: number) => void;
  savingLines?: Record<string, boolean>;
  onReset: () => void;
  onOpenDetails?: (id: string) => void;
}) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  function isOpen(name: string) {
    return open[name] !== false;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#E8DCC8] bg-[#fdf6eb]">
      <div className="bg-[#FCF5EB] px-3 py-2.5">
        <Toolbar pax={quote.pax} onReset={onReset} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] border-collapse text-[13px]">
          <thead>
            <tr className="border-t border-[#E8DCC8] bg-[#FCF5EB] text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A8178]">
              <th className="w-8 px-3 py-1" />
              <th className="py-1 pr-3">Service / Supplier</th>
              <th className="py-1 pr-3">Dates</th>
              <th className="py-1 pr-3">U.</th>
              <th className="py-1 pr-3 text-right">Nett</th>
              <th className="py-1 pr-3 text-right">Vat</th>
              <th className="py-1 pr-3 text-right">Cost + VAT</th>
              <th className="py-1 pr-3 text-right">Comm.</th>
              <th className="py-1 pr-3 text-right">Mrkp.</th>
              <th className="py-1 pr-3 text-right">Client pays</th>
              <th className="py-1 pr-3 text-right">
                GP <GpInfo />
              </th>
              <th className="py-1 pr-3">Reasoning</th>
              <th className="py-1 pr-3">Alternative</th>
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
                        onOpenDetails={onOpenDetails}
                      />
                    ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
