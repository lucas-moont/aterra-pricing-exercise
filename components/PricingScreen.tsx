"use client";

import React from "react";
import type { Quote } from "@/lib/types";
import { useQuote } from "@/lib/useQuote";
import PricingTable from "./PricingTable";
import QuoteSummary from "./QuoteSummary";
import { Sidebar, Stepper, Toolbar, TopBar } from "./Shell";
import { Toast } from "./Toast";

export default function PricingScreen({ initial }: { initial: Quote }) {
  const { quote, pricing, setLineField, resetMarkups, savingLines, saveError, dismissSaveError } =
    useQuote(initial);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />

        <div className="flex-1 overflow-auto px-6 py-5">
          <section className="mb-5 rounded-xl border border-line bg-white px-5 py-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                <h1 className="font-serif text-[26px] leading-tight tracking-tight text-ink">
                  New proposal
                </h1>
                <p className="text-[13px] text-[#8A8178]">
                  · {quote.client} · {quote.trip} · {quote.dates} · via {quote.advisor}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md border border-line bg-white px-3 py-1.5 text-[13px] font-normal text-ink hover:bg-[#F4DECF]"
                >
                  Back
                </button>
                <button
                  type="button"
                  className="rounded-md bg-terracotta px-3 py-1.5 text-[13px] font-normal text-white hover:bg-terracotta-dark"
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

          <Toolbar pax={quote.pax} onReset={resetMarkups} />

          <PricingTable
            quote={quote}
            pricing={pricing}
            onEdit={setLineField}
            savingLines={savingLines}
          />

          {saveError && <Toast message={saveError} onDismiss={dismissSaveError} />}
        </div>
      </main>
    </div>
  );
}
