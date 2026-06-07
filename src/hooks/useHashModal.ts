import { useCallback, useEffect, useRef, useState } from 'react';

const PREFIX = 'top100/';

export function slugify(value: string): string {
  return value
    .toLowerCase()
    // Preserve language-distinguishing symbols before stripping, so C++ and C#
    // don't both collapse to "c" and collide.
    .replace(/\+/g, 'plus')
    .replace(/#/g, 'sharp')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readHash(): string {
  if (typeof window === 'undefined') return '';
  const raw = window.location.hash.replace(/^#/, '');
  try {
    return decodeURIComponent(raw);
  } catch {
    // A malformed hash (stray % etc.) must not crash the app on mount/change.
    return raw;
  }
}

// Binds a modal's open state to the URL hash (#top100/<slug>) so the Top-100
// view is deep-linkable and survives reloads. slugify already yields URL-safe
// characters, so the hash is set directly (no encodeURIComponent, no %2F).
export function useHashModal(slug: string) {
  const target = `${PREFIX}${slug}`;
  const [isOpen, setIsOpen] = useState(() => readHash() === target);
  // Track whether this session opened the modal, so closing can pop the history
  // entry it pushed instead of stranding the user behind a dead Back button.
  const openedLocally = useRef(false);
  // Guards against a second close() (e.g. Escape + backdrop click in one tick)
  // firing history.back() twice before the async hashchange lands.
  const closing = useRef(false);

  useEffect(() => {
    const sync = () => {
      const open = readHash() === target;
      if (!open) closing.current = false;
      setIsOpen(open);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [target]);

  const open = useCallback(() => {
    openedLocally.current = true;
    window.location.hash = target;
  }, [target]);

  const close = useCallback(() => {
    if (closing.current || readHash() !== target) return;
    closing.current = true;
    if (openedLocally.current) {
      openedLocally.current = false;
      window.history.back();
    } else {
      // Deep-linked directly to the modal: just strip the hash. replaceState
      // doesn't emit hashchange, so reset the guard here ourselves — otherwise
      // it stays stuck and the modal could never be reopened.
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      closing.current = false;
      setIsOpen(false);
    }
  }, [target]);

  return { isOpen, open, close };
}
