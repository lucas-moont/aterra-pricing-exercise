"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Quote } from "./types";
import { priceQuote } from "./pricing";
import { patchLine, resetQuoteRequest } from "./apiClient";

export type EditableField = "commPct" | "mrkpPct";

// Owns the live edit state, optimistic persistence, and rollback.
//
// Editing is split in two so the numbers can update on every keystroke without
// saving on every keystroke: `editLine` updates the working copy locally (the
// budget and totals recompute at once, no network); `commitLine` persists — it is
// called on blur / Enter / a stepper click. A failed commit rolls the line back
// to its last server-confirmed value and surfaces an error, so the consultant is
// never left believing a change saved when it did not.
export function useQuote(initial: Quote) {
  const [quote, setQuote] = useState<Quote>(initial);

  const savedRef = useRef<Quote>(initial);
  // Per-line in-flight token: a newer commit supersedes a slow older save
  // (latest-write-wins), so a stale response can't clobber a newer value.
  const tokenRef = useRef<Record<string, number>>({});

  const [savingLines, setSavingLines] = useState<Record<string, boolean>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const pricing = useMemo(() => priceQuote(quote), [quote]);

  // Live, local-only update — recompute as the consultant types, no persistence.
  const editLine = useCallback((id: string, field: EditableField, value: number) => {
    setQuote((q) => ({
      ...q,
      lines: q.lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    }));
  }, []);

  // Persist a value (blur / Enter / stepper). Rolls back on failure.
  const commitLine = useCallback(
    (id: string, field: EditableField, value: number) => {
      editLine(id, field, value);

      const token = (tokenRef.current[id] ?? 0) + 1;
      tokenRef.current[id] = token;
      setSavingLines((s) => ({ ...s, [id]: true }));

      patchLine(id, field, value)
        .then((serverQuote) => {
          if (tokenRef.current[id] !== token) return; // superseded by a newer commit
          savedRef.current = serverQuote;
          setSavingLines((s) => ({ ...s, [id]: false }));
        })
        .catch((err) => {
          if (tokenRef.current[id] !== token) return;
          const savedLine = savedRef.current.lines.find((l) => l.id === id);
          if (savedLine) editLine(id, field, savedLine[field]);
          setSavingLines((s) => ({ ...s, [id]: false }));
          setSaveError(err instanceof Error ? err.message : "Save failed");
        });
    },
    [editLine],
  );

  // Restore the seed on the server (DELETE) and locally, so a refresh keeps it.
  const resetMarkups = useCallback(async () => {
    try {
      const serverQuote = await resetQuoteRequest();
      savedRef.current = serverQuote;
      tokenRef.current = {};
      setSavingLines({});
      setSaveError(null);
      setQuote(serverQuote);
      setNotice("Markups reset to the original quote.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Reset failed");
    }
  }, []);

  const dismissSaveError = useCallback(() => setSaveError(null), []);
  const dismissNotice = useCallback(() => setNotice(null), []);

  return {
    quote,
    pricing,
    editLine,
    commitLine,
    resetMarkups,
    savingLines,
    saveError,
    dismissSaveError,
    notice,
    dismissNotice,
  };
}
