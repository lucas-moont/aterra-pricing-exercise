"use client";

import React from "react";
import type { Quote } from "@/lib/types";
import { useQuote } from "@/lib/useQuote";
import PricingTable from "./PricingTable";
import QuoteSummary from "./QuoteSummary";
import { Sidebar, Stepper, TopBar } from "./Shell";
import { Toast } from "./Toast";
import { LineDetailDrawer } from "./LineDetailDrawer";

export default function PricingScreen({ initial }: { initial: Quote }) {
  const {
    quote,
    pricing,
    setLineField,
    resetMarkups,
    savingLines,
    saveError,
    dismissSaveError,
    notice,
    dismissNotice,
  } = useQuote(initial);
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const detailLine = quote.lines.find((l) => l.id === detailId) ?? null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />

        <div className="flex-1 overflow-auto px-6 py-5">
          <section className="mb-5 rounded-xl border border-line bg-white px-5 py-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <h1 className="font-serif text-[26px] font-normal leading-none tracking-tight text-ink">
                  New proposal
                </h1>
                <p className="text-[13px] font-normal leading-none text-[#8A8178]">
                  · {quote.client} · {quote.trip} · {quote.dates} · via {quote.advisor}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md border border-line bg-white px-5 py-1 text-[13px] font-normal text-ink hover:bg-[#F4DECF]"
                >
                  Back
                </button>
                <button
                  type="button"
                  className="rounded-md bg-terracotta px-5 py-1 text-[13px] font-normal text-white hover:bg-terracotta-dark"
                >
                  Next: Design
                </button>
              </div>
            </div>

            <div className="mb-5">
              <Stepper />
            </div>

            <QuoteSummary quote={quote} pricing={pricing} />
          </section>

          <PricingTable
            quote={quote}
            pricing={pricing}
            onEdit={setLineField}
            savingLines={savingLines}
            onReset={resetMarkups}
            onOpenDetails={setDetailId}
          />

          {saveError && (
            <Toast
              variant="error"
              message={`${saveError} — your change was rolled back.`}
              onDismiss={dismissSaveError}
            />
          )}
          {notice && (
            <Toast variant="info" autoDismissMs={2500} message={notice} onDismiss={dismissNotice} />
          )}
        </div>
      </main>

      <LineDetailDrawer line={detailLine} onClose={() => setDetailId(null)} />
    </div>
  );
}
