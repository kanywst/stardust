import { TIME_RANGES, type TimeRange } from '../lib/timeRange';

interface TimeRangeToggleProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export function TimeRangeToggle({ value, onChange }: TimeRangeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Trending time range"
      className="border-surfaceHighlight bg-surface/60 inline-flex items-center gap-1 rounded-full border p-1 backdrop-blur-sm"
    >
      {TIME_RANGES.map((range) => {
        const active = range.value === value;
        return (
          <button
            key={range.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(range.value)}
            className={
              active
                ? 'bg-primary rounded-full px-4 py-1.5 text-sm font-semibold text-white'
                : 'text-textMuted rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:text-white'
            }
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}
