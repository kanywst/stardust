// Time windows for the trending view. "All-time" keeps the original behaviour
// (most-starred established projects); the bounded windows narrow results to
// repositories pushed recently, surfacing what is actively trending.
export type TimeRange = 'day' | 'week' | 'month' | 'all';

export const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All-time' },
];

const RANGE_DAYS: Record<Exclude<TimeRange, 'all'>, number> = {
  day: 1,
  week: 7,
  month: 30,
};

// Returns a GitHub search qualifier (e.g. `pushed:>2026-05-30`) constraining
// results to repos pushed within the window, or '' for the all-time view.
export function timeRangeQualifier(range: TimeRange, now: Date = new Date()): string {
  if (range === 'all') return '';
  const since = new Date(now);
  since.setUTCDate(since.getUTCDate() - RANGE_DAYS[range]);
  return `pushed:>${since.toISOString().slice(0, 10)}`;
}
