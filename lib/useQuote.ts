"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Quote } from "./types";
import { priceQuote } from "./pricing";
import { patchLine, resetQuoteRequest } from "./apiClient";

export type EditableField = "commPct" | "mrkpPct";

// Owns the live edit state, optimistic persistence, and rollback for the screen.
//
// The working `quote` is the single source of truth for rendering; every derived
// number is recomputed from it via the pure engine, so the table can never drift.
// An edit is applied to the working copy immediately (so the numbers move at
// once), then saved in the background. On a failed save the line is rolled back
// to its last server-confirmed value and an error is surfaced — the consultant is
// never left believing a change saved when it did not.
export function useQuote(initial: Quote) {
  const [quote, setQuote] = useState<Quote>(initial);

  // Last server-confirmed quote, used to roll a line back when its save fails.
  const savedRef = useRef<Quote>(initial);
  // Per-line in-flight token: a newer edit supersedes a slow older save
  // (latest-write-wins), so a stale response can't clobber a newer value.
  const tokenRef = useRef<Record<string, number>>({});

  const [savingLines, setSavingLines] = useState<Record<string, boolean>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  const pricing = useMemo(() => priceQuote(quote), [quote]);

  const setLineField = useCallback((id: string, field: EditableField, value: number) => {
    // Optimistic: update the working copy now so everything recomputes at once.
    setQuote((q) => ({
      ...q,
      lines: q.lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    }));

    const token = (tokenRef.current[id] ?? 0) + 1;
    tokenRef.current[id] = token;
    setSavingLines((s) => ({ ...s, [id]: true }));

    patchLine(id, field, value)
      .then((serverQuote) => {
        if (tokenRef.current[id] !== token) return; // superseded by a newer edit
        savedRef.current = serverQuote;
        setSavingLines((s) => ({ ...s, [id]: false }));
      })
      .catch((err) => {
        if (tokenRef.current[id] !== token) return;
        // Roll the edited field back to its last confirmed value.
        const savedLine = savedRef.current.lines.find((l) => l.id === id);
        if (savedLine) {
          setQuote((q) => ({
            ...q,
            lines: q.lines.map((l) => (l.id === id ? { ...l, [field]: savedLine[field] } : l)),
          }));
        }
        setSavingLines((s) => ({ ...s, [id]: false }));
        setSaveError(err instanceof Error ? err.message : "Save failed");
      });
  }, []);

  // Restore the seed on the server (DELETE) and locally, so a refresh keeps it.
  const resetMarkups = useCallback(async () => {
    try {
      const serverQuote = await resetQuoteRequest();
      savedRef.current = serverQuote;
      tokenRef.current = {};
      setSavingLines({});
      setSaveError(null);
      setQuote(serverQuote);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Reset failed");
    }
  }, []);

  const dismissSaveError = useCallback(() => setSaveError(null), []);

  return {
    quote,
    pricing,
    setLineField,
    resetMarkups,
    // Épico C state — the layout can opt in to show these, but persistence and
    // rollback work whether or not they are rendered.
    savingLines,
    saveError,
    dismissSaveError,
  };
}
