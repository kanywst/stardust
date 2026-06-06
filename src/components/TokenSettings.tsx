import { useEffect, useId, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { KeyRound, Check } from 'lucide-react';
import { getStoredToken, setStoredToken } from '../lib/github';

// Lets the user supply a GitHub personal access token to raise the Search API
// rate limit (~10 req/min unauthenticated → ~30 req/min authenticated). The
// token lives only in localStorage and is sent solely to api.github.com.
export function TokenSettings() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [hasToken, setHasToken] = useState(() => Boolean(getStoredToken()));
  const panelRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const save = () => {
    setStoredToken(value);
    // Re-read from storage so the indicator reflects reality even if the write
    // was a no-op (private mode, storage disabled).
    setHasToken(Boolean(getStoredToken()));
    setValue('');
    setOpen(false);
    // Refetch everything so existing cards pick up the new auth ceiling.
    queryClient.invalidateQueries({ queryKey: ['repos'] });
  };

  const clear = () => {
    setStoredToken(null);
    setValue('');
    setHasToken(Boolean(getStoredToken()));
    queryClient.invalidateQueries({ queryKey: ['repos'] });
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="GitHub token settings"
        className="text-textMuted flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-sm font-medium transition-colors hover:text-white"
      >
        <KeyRound className="h-4 w-4" />
        {hasToken && <Check className="h-3.5 w-3.5 text-green-400" />}
      </button>

      {open && (
        <div className="bg-surface border-surfaceHighlight absolute right-0 z-50 mt-2 w-80 rounded-xl border p-4 shadow-2xl">
          <label htmlFor={inputId} className="text-text text-sm font-semibold">
            GitHub token
          </label>
          <p className="text-textMuted mt-1 mb-3 text-xs leading-relaxed">
            Optional. Stored locally in your browser, sent only to GitHub. Raises the API rate limit
            so cards load reliably.
          </p>
          <input
            id={inputId}
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={hasToken ? '•••••••• (saved)' : 'ghp_…'}
            autoComplete="new-password"
            className="bg-background border-surfaceHighlight text-text focus:border-primary w-full rounded-md border px-3 py-2 text-sm outline-none"
          />
          <div className="mt-3 flex items-center justify-between gap-2">
            {hasToken ? (
              <button
                type="button"
                onClick={clear}
                className="text-textMuted text-xs font-medium hover:text-red-400"
              >
                Remove saved token
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={save}
              disabled={!value.trim()}
              className="bg-primary rounded-md px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
