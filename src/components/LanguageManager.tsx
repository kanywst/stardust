import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronUp, ChevronDown, Trash2, X, Plus, RotateCcw } from 'lucide-react';
import type { Language } from '../config/languages';
import type { ManagedLanguage } from '../hooks/useManagedLanguages';

interface LanguageManagerProps {
  items: ManagedLanguage[];
  onToggle: (name: string) => void;
  onMove: (name: string, direction: -1 | 1) => void;
  onAdd: (language: Language) => void;
  onRemove: (name: string) => void;
  onReset: () => void;
  onClose: () => void;
}

const EMPTY_DRAFT = { name: '', query: '', color: '#7c8aa5' };

export function LanguageManager({
  items,
  onToggle,
  onMove,
  onAdd,
  onRemove,
  onReset,
  onClose,
}: LanguageManagerProps) {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const submit = () => {
    const name = draft.name.trim();
    const query = draft.query.trim();
    if (!name || !query) {
      setError('Name and query are required.');
      return;
    }
    if (items.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      setError('That language name already exists.');
      return;
    }
    onAdd({ name, query, color: draft.color });
    setDraft(EMPTY_DRAFT);
    setError('');
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Manage languages"
        className="bg-surface border-surfaceHighlight relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl"
      >
        <div className="border-surfaceHighlight flex items-center justify-between border-b p-5">
          <h2 className="text-text text-xl font-bold">Manage languages</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-textMuted hover:text-text rounded-full p-1.5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="flex-1 space-y-2 overflow-y-auto p-5">
          {items.map((item, index) => (
            <li
              key={item.name}
              className="border-surfaceHighlight/60 bg-background flex items-center gap-3 rounded-lg border p-3"
            >
              <label className="flex flex-1 items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={() => onToggle(item.name)}
                  className="accent-primary h-4 w-4"
                />
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-text text-sm font-medium">{item.name}</span>
                <span className="text-textMuted truncate text-xs">{item.query}</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onMove(item.name, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${item.name} up`}
                  className="text-textMuted hover:text-text rounded p-1 disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(item.name, 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Move ${item.name} down`}
                  className="text-textMuted hover:text-text rounded p-1 disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                {item.custom && (
                  <button
                    type="button"
                    onClick={() => onRemove(item.name)}
                    aria-label={`Remove ${item.name}`}
                    className="text-textMuted rounded p-1 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="border-surfaceHighlight space-y-3 border-t p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex flex-wrap items-end gap-2"
          >
            <label className="flex flex-col text-xs">
              <span className="text-textMuted mb-1">Name</span>
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Elixir"
                maxLength={30}
                className="border-surfaceHighlight bg-background text-text focus:border-primary w-28 rounded-md border px-2 py-1.5 text-sm outline-none"
              />
            </label>
            <label className="flex flex-1 flex-col text-xs">
              <span className="text-textMuted mb-1">Search query</span>
              <input
                value={draft.query}
                onChange={(e) => setDraft((d) => ({ ...d, query: e.target.value }))}
                placeholder="language:elixir"
                maxLength={100}
                className="border-surfaceHighlight bg-background text-text focus:border-primary w-full rounded-md border px-2 py-1.5 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col text-xs">
              <span className="text-textMuted mb-1">Color</span>
              <input
                type="color"
                value={draft.color}
                onChange={(e) => setDraft((d) => ({ ...d, color: e.target.value }))}
                aria-label="Accent color"
                className="border-surfaceHighlight bg-background h-9 w-12 rounded-md border"
              />
            </label>
            <button
              type="submit"
              className="bg-primary inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </form>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  'Reset to default languages? This removes all custom languages and re-enables the defaults.'
                )
              ) {
                onReset();
              }
            }}
            className="text-textMuted inline-flex items-center gap-1.5 text-xs font-medium hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset to defaults
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
