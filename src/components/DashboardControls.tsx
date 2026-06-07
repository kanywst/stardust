import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { RepoSort } from '../lib/github';

const SORTS: { value: RepoSort; label: string }[] = [
  { value: 'stars', label: 'Stars' },
  { value: 'forks', label: 'Forks' },
  { value: 'updated', label: 'Updated' },
];

interface DashboardControlsProps {
  sort: RepoSort;
  onSortChange: (sort: RepoSort) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
}

export function DashboardControls({
  sort,
  onSortChange,
  filter,
  onFilterChange,
}: DashboardControlsProps) {
  // Keep the input instant while debouncing the parent update, so typing doesn't
  // re-render and re-filter every section (and modal) on each keystroke.
  const [text, setText] = useState(filter);

  // Hold the latest callback in a ref so an unstable parent callback can't reset
  // the debounce timer on unrelated re-renders.
  const onFilterChangeRef = useRef(onFilterChange);
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  useEffect(() => {
    if (text === filter) return; // skip the no-op on mount / after sync
    const id = setTimeout(() => onFilterChangeRef.current(text), 300);
    return () => clearTimeout(id);
  }, [text, filter]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
      <div className="relative w-full max-w-xs">
        <Search className="text-textMuted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Filter by name or owner…"
          aria-label="Filter repositories"
          className="border-surfaceHighlight bg-surface/60 text-text focus:border-primary w-full rounded-full border py-2 pr-9 pl-9 text-sm backdrop-blur-sm outline-none"
        />
        {text && (
          <button
            type="button"
            onClick={() => {
              setText('');
              onFilterChange(''); // clearing should feel instant, not debounced
            }}
            aria-label="Clear filter"
            className="text-textMuted hover:text-text absolute top-1/2 right-3 -translate-y-1/2"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div
        role="group"
        aria-label="Sort repositories"
        className="border-surfaceHighlight bg-surface/60 inline-flex items-center gap-1 rounded-full border p-1 backdrop-blur-sm"
      >
        {SORTS.map((option) => {
          const active = option.value === sort;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onSortChange(option.value)}
              className={
                active
                  ? 'bg-primary rounded-full px-4 py-1.5 text-sm font-semibold text-white'
                  : 'text-textMuted rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:text-white'
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
