import { useCallback, useEffect, useState } from 'react';

const PREFIX = 'top100/';

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readHash(): string {
  if (typeof window === 'undefined') return '';
  return decodeURIComponent(window.location.hash.replace(/^#/, ''));
}

// Binds a modal's open state to the URL hash (#top100/<slug>) so the Top-100
// view is deep-linkable and survives reloads. Closing strips the hash without
// pushing a history entry.
export function useHashModal(slug: string) {
  const target = `${PREFIX}${slug}`;
  const [isOpen, setIsOpen] = useState(() => readHash() === target);

  useEffect(() => {
    const sync = () => setIsOpen(readHash() === target);
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [target]);

  const open = useCallback(() => {
    window.location.hash = encodeURIComponent(target);
  }, [target]);

  const close = useCallback(() => {
    if (readHash() === target) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setIsOpen(false);
    }
  }, [target]);

  return { isOpen, open, close };
}
