import React from "react";
import {
  IconArrowLeftRight,
  IconBanknote,
  IconChart,
  IconChevronLeft,
  IconClipboard,
  IconFile,
  IconGrid,
  IconHome,
  IconImage,
  IconInbox,
  IconLayout,
  IconPlane,
  IconPlug,
  IconPlus,
  IconSliders,
  IconTrendingUp,
  IconUser,
  IconCheck,
  IconCircle,
} from "./icons";
import { ThemeToggle } from "./ThemeToggle";

type BadgeTone = "neutral" | "alert";

const NAV: {
  group: string;
  items: { label: string; icon: React.ReactNode; badge?: string; badgeTone?: BadgeTone }[];
}[] = [
  {
    group: "Work",
    items: [
      { label: "Today", icon: <IconGrid size={15} /> },
      { label: "Inbox", icon: <IconInbox size={15} />, badge: "9", badgeTone: "neutral" },
      { label: "Operations", icon: <IconArrowLeftRight size={15} />, badge: "2", badgeTone: "alert" },
    ],
  },
  {
    group: "Pipeline",
    items: [
      { label: "Sales", icon: <IconTrendingUp size={15} /> },
      { label: "Trips", icon: <IconPlane size={15} /> },
      { label: "CRM", icon: <IconUser size={15} /> },
    ],
  },
  {
    group: "Studio",
    items: [
      { label: "Itinerary builder", icon: <IconImage size={15} /> },
      { label: "Templates", icon: <IconLayout size={15} /> },
    ],
  },
  {
    group: "Supply",
    items: [{ label: "Supply", icon: <IconClipboard size={15} /> }],
  },
  {
    group: "Money",
    items: [
      { label: "Invoices", icon: <IconFile size={15} /> },
      { label: "Finance", icon: <IconBanknote size={15} /> },
      { label: "Analytics", icon: <IconChart size={15} /> },
    ],
  },
  {
    group: "System",
    items: [
      { label: "API & integrations", icon: <IconPlug size={15} /> },
      { label: "Settings", icon: <IconSliders size={15} /> },
    ],
  },
];

const STEPS = ["Brief", "Plan", "Price", "Design", "Review & send"];
const ACTIVE_STEP = "Price";

export function Sidebar() {
  const cornerBtn =
    "grid h-6 w-6 place-items-center rounded-md border border-line bg-surface2 text-ink/70 hover:bg-hover";
  return (
    <aside className="hidden h-screen w-[230px] shrink-0 flex-col border-r border-line bg-surface2 lg:flex">
      <div className="flex items-center gap-1.5 px-2.5 pt-3">
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-[7px] bg-terracotta text-[12px] font-semibold leading-none text-white">
          A
        </div>
        <span className="flex-1 font-sans text-[14px] font-medium tracking-[-0.01em] text-ink">
          AterraAI
        </span>
        <ThemeToggle className={cornerBtn} />
        <button type="button" className={cornerBtn} aria-label="Collapse sidebar">
          <IconChevronLeft size={13} />
        </button>
      </div>

      <div className="px-1.5 pt-3">
        <button
          type="button"
          className="flex h-[34px] w-full items-center justify-center gap-1.5 rounded-full bg-terracotta text-[13px] font-medium text-white hover:bg-terracotta-dark"
        >
          <IconPlus size={14} />
          New proposal
        </button>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-1.5 pb-4 text-[13px]">
        {NAV.map((g) => (
          <div key={g.group} className="mb-4">
            <div className="mb-1.5 px-2 text-[10px] font-normal uppercase tracking-[0.14em] text-faint">
              {g.group}
            </div>
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = item.label === "Sales";
                return (
                  <li key={item.label}>
                    <div
                      className={`flex cursor-default items-center gap-2 rounded-lg px-1.5 py-[6px] ${
                        active ? "bg-hover" : "text-ink2 hover:bg-hover"
                      }`}
                    >
                      <span
                        className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[5px] ${
                          active ? "bg-terracotta text-white" : "bg-sand text-muted"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className={`flex-1 truncate ${active ? "font-medium text-ink" : "font-normal"}`}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={`grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-medium ${
                            item.badgeTone === "alert"
                              ? "bg-danger-soft text-danger"
                              : "bg-sand text-muted"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-line px-2.5 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-terracotta text-[11px] font-semibold text-white">
            AK
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium text-ink">Amanda Kam</div>
            <div className="truncate text-[11px] text-muted">Aterra Africa</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function TopBar() {
  const iconBtn =
    "grid h-7 w-7 place-items-center rounded-md border border-line bg-elevated text-ink/80 hover:bg-hover";
  const ghostBtn =
    "rounded-md border border-line bg-elevated px-3 py-1.5 text-[13px] font-normal text-ink hover:bg-hover";

  return (
    <div className="flex items-center justify-between border-b border-line bg-surface3 px-5 py-2">
      <div className="flex items-center gap-2">
        <button type="button" className={iconBtn} aria-label="Back">
          <IconChevronLeft size={14} />
        </button>
        <button type="button" className={iconBtn} aria-label="Home">
          <IconHome size={14} />
        </button>
        <p className="ml-1 text-[13px] font-normal">
          <span className="text-muted">Sales</span>
          <span className="mx-1 text-faint">/</span>
          <span className="font-medium text-ink">New proposal</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className={ghostBtn}>
          Save draft
        </button>
        <button
          type="button"
          className="rounded-md bg-terracotta px-3 py-1.5 text-[13px] font-normal text-white hover:bg-terracotta-dark"
        >
          Preview as client
        </button>
      </div>
    </div>
  );
}

function StepDoneMark() {
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-line bg-positive-soft text-positive">
      <IconCheck size={11} strokeWidth={2.2} />
    </span>
  );
}

function StepCurrentMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
      <circle cx="10" cy="10" r="9" fill="rgb(var(--terracotta))" />
      <circle cx="10" cy="10" r="5.25" fill="none" stroke="rgb(var(--elevated))" strokeWidth="1.75" />
    </svg>
  );
}

function StepLaterMark() {
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center text-faint">
      <IconCircle size={18} />
    </span>
  );
}

export function Stepper() {
  const activeIndex = STEPS.indexOf(ACTIVE_STEP);
  return (
    <div className="flex gap-1.5">
      {STEPS.map((step, i) => {
        const done = i < activeIndex;
        const isActive = step === ACTIVE_STEP;
        return (
          <div
            key={step}
            className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-2.5 py-2 ${
              isActive ? "border-2 border-terracotta/40 bg-hover" : "border border-line bg-panel"
            }`}
          >
            {done ? <StepDoneMark /> : isActive ? <StepCurrentMark /> : <StepLaterMark />}
            <div className="min-w-0 leading-none">
              <div
                className={`text-[8px] font-semibold uppercase tracking-[0.12em] ${
                  isActive ? "text-terracotta" : "text-faint"
                }`}
              >
                Step {i + 1}
              </div>
              <div
                className={`mt-px truncate text-[12px] font-semibold leading-none ${
                  isActive || done ? "text-ink" : "text-muted"
                }`}
              >
                {step}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const PILL =
  "inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1.5 text-[12px] font-normal text-muted hover:bg-elevated";
const PILL_ON =
  "inline-flex items-center gap-1.5 rounded-full border border-terracotta bg-terracotta px-3 py-1.5 text-[12px] font-medium text-white";

export function Toolbar({
  pax,
  onReset,
  compact,
  onToggleDisplay,
}: {
  pax: number;
  onReset: () => void;
  compact?: boolean;
  onToggleDisplay?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="inline-flex rounded-full border border-line bg-surface2 p-0.5">
          <button
            type="button"
            className="rounded-full bg-terracotta px-3 py-1 text-[12px] font-medium text-white"
          >
            Itemized
          </button>
          <button type="button" className="rounded-full px-3 py-1 text-[12px] font-normal text-muted">
            Ranges
          </button>
        </div>
        <button
          type="button"
          onClick={onToggleDisplay}
          className={compact ? PILL_ON : PILL}
          aria-pressed={!!compact}
        >
          <IconSliders size={13} />
          Display
        </button>
        <button type="button" className={PILL}>
          <IconUser size={13} />
          Set pax · {pax}
        </button>
        <button type="button" className={PILL}>
          <IconBanknote size={13} />
          USD
        </button>
        <button type="button" className={PILL}>
          <IconFile size={13} />
          Summary
        </button>
      </div>
      <button type="button" onClick={onReset} className={PILL}>
        Reset markups
      </button>
    </div>
  );
}
