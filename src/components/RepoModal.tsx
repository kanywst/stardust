import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { GithubRepo } from '../types/github';
import { X, Star, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  repos: GithubRepo[];
  isLoading?: boolean;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function RepoModal({ isOpen, onClose, language, repos, isLoading }: RepoModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusables = () => Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    focusables()[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="bg-surface border-surfaceHighlight relative flex h-[90vh] w-[95vw] max-w-none flex-col overflow-hidden rounded-3xl border shadow-2xl"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header - Huge and Bold */}
            <div className="border-surfaceHighlight bg-surfaceHighlight/30 flex items-center justify-between border-b p-8 md:p-10">
              <div>
                <div className="mb-2 flex items-center gap-4">
                  <span className="bg-primary block h-12 w-3 rounded-full" />
                  <h2
                    id={titleId}
                    className="text-text text-4xl font-black tracking-tight md:text-5xl"
                  >
                    Top 100 {language}
                  </h2>
                </div>
                <p className="text-textMuted ml-7 text-xl font-medium">
                  The most starred repositories in the galaxy.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="hover:bg-surfaceHighlight text-textMuted hover:text-text rounded-full p-4 transition-colors"
              >
                <X className="h-8 w-8" />
              </button>
            </div>

            {/* List */}
            <div className="custom-scrollbar relative space-y-3 overflow-y-auto p-6 md:p-10">
              {isLoading && repos.length <= 6 ? (
                <div className="bg-surface/50 absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
                  <Loader2 className="text-primary mb-4 h-12 w-12 animate-spin" />
                  <p className="text-text text-xl font-bold">Accessing {language} Archives...</p>
                </div>
              ) : null}

              {repos.map((repo, index) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={repo.name}
                  className="bg-background hover:bg-surfaceHighlight border-surfaceHighlight/50 group flex items-center gap-6 rounded-2xl border p-5 transition-all duration-200 hover:translate-x-2"
                >
                  <div className="text-textMuted/50 group-hover:text-primary w-12 flex-shrink-0 text-center text-xl font-bold transition-colors">
                    #{index + 1}
                  </div>

                  <img
                    src={repo.owner.avatar_url}
                    alt=""
                    width={56}
                    height={56}
                    loading="lazy"
                    decoding="async"
                    className="border-surface group-hover:border-primary/50 h-14 w-14 rounded-full border-2 transition-colors"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-3">
                      <span className="text-textMuted text-sm font-medium">
                        {repo.owner.login} /
                      </span>
                      <h3 className="text-text group-hover:text-primary truncate text-2xl font-bold transition-colors">
                        {repo.name}
                      </h3>
                    </div>
                    <p className="text-textMuted w-full truncate text-base">{repo.description}</p>
                  </div>

                  <div className="text-textMuted flex shrink-0 items-center gap-6 text-base font-medium">
                    <div className="bg-surfaceHighlight/50 flex items-center gap-1.5 rounded-lg px-3 py-1.5">
                      <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      <span>{repo.stargazers_count.toLocaleString()}</span>
                    </div>
                    <ExternalLink className="text-primary h-6 w-6 translate-x-[-10px] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
