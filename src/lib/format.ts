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

const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

// Compact "updated N ago" string from an ISO timestamp, picking the largest
// sensible unit. Returns '' for missing/unparseable input so callers can skip it.
export function formatRelativeTime(iso: string | undefined, now: Date = new Date()): string {
  if (!iso) return '';
  const then = new Date(iso);
  const ms = then.getTime();
  if (Number.isNaN(ms)) return '';

  const diffSeconds = Math.round((ms - now.getTime()) / 1000);
  const divisions: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.34524, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ];

  let value = diffSeconds;
  for (const [amount, unit] of divisions) {
    if (Math.abs(value) < amount) {
      return RELATIVE_FORMATTER.format(Math.round(value), unit);
    }
    value /= amount;
  }
  return RELATIVE_FORMATTER.format(Math.round(value), 'year');
}
