import { useCallback, useEffect, useMemo, useState } from 'react';
import { languages as defaultLanguages, type Language } from '../config/languages';

export interface ManagedLanguage extends Language {
  enabled: boolean;
  // User-added entries can be removed entirely; built-in ones can only be hidden.
  custom?: boolean;
}

const STORAGE_KEY = 'stardust-languages';

const defaults = (): ManagedLanguage[] =>
  defaultLanguages.map((language) => ({ ...language, enabled: true }));

function loadInitial(): ManagedLanguage[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ManagedLanguage[];
      const valid =
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.every(
          (item) => item && typeof item.name === 'string' && typeof item.query === 'string'
        );
      if (valid) {
        // Reconcile the persisted list with the current defaults so code-side
        // changes propagate: built-ins pick up the latest query/color, removed
        // built-ins drop out, custom entries and enabled state are preserved,
        // and newly-shipped defaults are appended.
        const defaultByName = new Map(
          defaultLanguages.map((language) => [language.name.toLowerCase(), language])
        );
        const reconciled = parsed
          .filter((item) => item.custom || defaultByName.has(item.name.toLowerCase()))
          .map((item) => {
            if (item.custom) return item;
            const def = defaultByName.get(item.name.toLowerCase())!;
            return { ...def, enabled: item.enabled };
          });
        const known = new Set(reconciled.map((item) => item.name.toLowerCase()));
        const newDefaults = defaultLanguages
          .filter((language) => !known.has(language.name.toLowerCase()))
          .map((language) => ({ ...language, enabled: true }));
        return [...reconciled, ...newDefaults];
      }
    }
  } catch {
    // Ignore malformed/unavailable storage and fall back to defaults.
  }
  return defaults();
}

export function useManagedLanguages() {
  const [items, setItems] = useState<ManagedLanguage[]>(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Persisting is best-effort; the in-memory list still works this session.
    }
  }, [items]);

  const toggle = useCallback((name: string) => {
    setItems((prev) =>
      prev.map((item) => (item.name === name ? { ...item, enabled: !item.enabled } : item))
    );
  }, []);

  const move = useCallback((name: string, direction: -1 | 1) => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.name === name);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const add = useCallback((language: Language) => {
    const name = language.name.trim();
    const query = language.query.trim();
    if (!name || !query) return;
    // Dedupe inside the updater so the callback reference stays stable (no items
    // dep) and a StrictMode double-invoke can't add twice.
    setItems((prev) => {
      if (prev.some((item) => item.name.toLowerCase() === name.toLowerCase())) return prev;
      return [...prev, { name, query, color: language.color, enabled: true, custom: true }];
    });
  }, []);

  const remove = useCallback((name: string) => {
    setItems((prev) => prev.filter((item) => !(item.name === name && item.custom)));
  }, []);

  const reset = useCallback(() => setItems(defaults()), []);

  const enabled = useMemo(() => items.filter((item) => item.enabled), [items]);

  return { items, enabled, toggle, move, add, remove, reset };
}
