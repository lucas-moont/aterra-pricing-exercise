// The single place rounding happens.
//
// The pricing engine returns full-precision floats and never rounds (so per-line
// cent drift cannot accumulate across a quote). Every displayed number is rounded
// here, at the edge, and only here — so a table cell and a total can never
// disagree on formatting.

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(n: number): string {
  return money.format(n);
}

/** GP% is shown to one decimal to match the reference screen (e.g. "15.3%"). */
export function formatGpPct(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`;
}

/** Commission and markup are whole-number percentages in the UI (e.g. "18%"). */
export function formatWholePct(whole: number): string {
  return `${whole}%`;
}
