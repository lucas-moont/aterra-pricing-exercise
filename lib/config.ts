// DMC-configured business rules.
//
// These are values a destination management company sets for itself. They are
// deliberately NOT hard-coded guesses dressed up as real thresholds, and never
// AI-derived — keeping the numbers that drive decisions outside the AI layer is
// the governing principle of this product (docs/beyond-the-brief.md). The value
// below is an exercise placeholder standing in for a per-tenant setting.

/** Minimum healthy blended gross-profit margin for a trip, as a percentage. */
export const BLENDED_MARGIN_FLOOR_PCT = 15;
