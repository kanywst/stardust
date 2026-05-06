const COMPACT_FORMATTER = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

// Intl emits "K" for thousands; the design uses lowercase k while keeping M.
// Use a global regex so future locale or ICU variants that produce more than
// one "K" still get normalized.
export function formatCompactStars(count: number): string {
  return COMPACT_FORMATTER.format(count).replace(/K/g, 'k');
}
