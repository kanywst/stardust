import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useInView } from 'motion/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Language } from '../config/languages';
import { fetchTrendingRepos } from '../lib/github';
import type { SearchResponse } from '../types/github';
import { RepoCard } from './RepoCard';
import { RepoList } from './RepoList';
import { ArrowRight, Loader2, RefreshCw } from 'lucide-react';

// Shown when the modal chunk can't be fetched (offline, or a stale hash after a
// deploy). Gives the user actionable feedback instead of a dead button.
const ModalLoadError = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
  isOpen
    ? createPortal(
        <div
          role="alertdialog"
          aria-label="Failed to load"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/80" onClick={onClose} aria-hidden="true" />
          <div className="bg-surface border-surfaceHighlight relative max-w-sm rounded-2xl border p-6 text-center">
            <p className="text-text mb-4 text-sm">
              Couldn’t load the Top 100 view. Please reload the page and try again.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="bg-primary rounded-md px-3 py-1.5 text-sm font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )
    : null;

// The Top-100 modal is only needed once the user opens it, so keep it out of the
// initial bundle and load its chunk on first open. A failed chunk import is
// logged (so it surfaces in monitoring) and degrades to ModalLoadError rather
// than crashing the app with a ChunkLoadError.
const RepoModal = lazy(() =>
  import('./RepoModal')
    .then((mod) => ({ default: mod.RepoModal }))
    .catch((error) => {
      console.error('Failed to load the Top-100 modal chunk', error);
      return { default: ModalLoadError as unknown as typeof import('./RepoModal').RepoModal };
    })
);

interface LanguageSectionProps {
  language: Language;
}

const ONE_HOUR = 1000 * 60 * 60;

export function LanguageSection({ language }: LanguageSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasOpenedModal, setHasOpenedModal] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Only fetch a card's preview once it is about to enter the viewport. With 10+
  // language cards, firing every preview eagerly on mount hits the unauthenticated
  // Search API rate limit (~10 req/min) on first load.
  const inView = useInView(sectionRef, { once: true, margin: '300px' });

  const previewKey = ['repos', language.query, 'preview'] as const;
  const fullKey = ['repos', language.query, 'full'] as const;

  const {
    data: previewData,
    isLoading: isPreviewLoading,
    isError: isPreviewError,
    error: previewError,
    refetch: refetchPreview,
    isFetching: isPreviewFetching,
  } = useQuery({
    queryKey: previewKey,
    queryFn: ({ signal }) => fetchTrendingRepos(language.query, 6, signal),
    staleTime: ONE_HOUR,
    enabled: inView,
  });

  const { data: fullData, isLoading: isFullLoading } = useQuery<SearchResponse>({
    queryKey: fullKey,
    queryFn: ({ signal }) => fetchTrendingRepos(language.query, 100, signal),
    staleTime: ONE_HOUR,
    enabled: isModalOpen,
    placeholderData: (previous) => previous ?? queryClient.getQueryData<SearchResponse>(previewKey),
  });

  const closeModal = () => {
    setIsModalOpen(false);
    triggerRef.current?.focus();
  };

  // Warm the full (top-100) query when the user signals intent by hovering or
  // focusing the trigger. Debounced so a mouse sweeping across several cards
  // doesn't fire a burst of requests into the strict Search API rate limit.
  const prefetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track the active intent sources so an overlapping hover+focus doesn't let
  // one ending (e.g. mouse-leave) cancel a prefetch the other still wants.
  const prefetchReasons = useRef(new Set<'hover' | 'focus'>());

  const prefetchFull = (reason: 'hover' | 'focus') => {
    prefetchReasons.current.add(reason);
    if (prefetchTimeoutRef.current) return;
    prefetchTimeoutRef.current = setTimeout(() => {
      prefetchTimeoutRef.current = null;
      queryClient.prefetchQuery({
        queryKey: fullKey,
        queryFn: ({ signal }) => fetchTrendingRepos(language.query, 100, signal),
        staleTime: ONE_HOUR,
      });
    }, 150);
  };

  const cancelPrefetch = (reason: 'hover' | 'focus') => {
    prefetchReasons.current.delete(reason);
    if (prefetchReasons.current.size === 0 && prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
      prefetchTimeoutRef.current = null;
    }
  };

  // Clear any pending prefetch timer on unmount, and also when the language
  // changes — otherwise a debounced timer could fire with the previous
  // language's query/key after the component is reused for a different language.
  useEffect(() => {
    const reasons = prefetchReasons.current;
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
        prefetchTimeoutRef.current = null;
      }
      reasons.clear();
    };
  }, [language.query]);

  // Before the card scrolls into view, render a completely static placeholder —
  // no animate-pulse/spin loops burning CPU/GPU on off-screen cards.
  if (!inView) {
    return <div ref={sectionRef} className="bg-surface/30 min-h-[400px] rounded-2xl" />;
  }

  if (isPreviewLoading) {
    return (
      <div
        ref={sectionRef}
        className="bg-surface/30 flex min-h-[400px] animate-pulse flex-col items-center justify-center rounded-2xl p-8"
      >
        <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
        <p className="text-textMuted">Finding best {language.name} projects...</p>
      </div>
    );
  }

  if (isPreviewError || !previewData) {
    const isUnauthorized = previewError instanceof Error && previewError.message.includes('401');
    return (
      <div
        ref={sectionRef}
        className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-8"
      >
        <p className="text-red-400">
          {isUnauthorized
            ? `Failed to load ${language.name} repositories. Your GitHub token may be invalid or expired.`
            : `Failed to load ${language.name} repositories. API rate limit might be exceeded.`}
        </p>
        <button
          type="button"
          onClick={() => refetchPreview()}
          disabled={isPreviewFetching}
          className="inline-flex items-center gap-2 rounded-md border border-red-400/40 px-3 py-1.5 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isPreviewFetching ? 'animate-spin' : ''}`} />
          Retry
        </button>
      </div>
    );
  }

  if (previewData.items.length === 0) {
    return (
      <div
        ref={sectionRef}
        className="border-surfaceHighlight/50 bg-surface/20 flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-8 text-center"
      >
        <h2
          className="flex items-center gap-3 text-2xl font-black tracking-tight"
          style={{ color: language.color }}
        >
          <span className="block h-8 w-3 rounded-full bg-current" />
          {language.name}
        </h2>
        <p className="text-textMuted text-sm">
          No repositories with more than 100 stars found yet. Check back as the ecosystem grows.
        </p>
      </div>
    );
  }

  const top3 = previewData.items.slice(0, 3);
  const next3 = previewData.items.slice(3, 6);

  return (
    <div
      ref={sectionRef}
      className="bg-surface/30 border-surfaceHighlight/50 flex flex-col gap-6 rounded-3xl border p-6 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between">
        <h2
          className="flex items-center gap-3 text-2xl font-black tracking-tight"
          style={{ color: language.color }}
        >
          <span className="block h-8 w-3 rounded-full bg-current" />
          {language.name}
        </h2>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            setHasOpenedModal(true);
            setIsModalOpen(true);
          }}
          onMouseEnter={() => prefetchFull('hover')}
          onMouseLeave={() => cancelPrefetch('hover')}
          onFocus={() => prefetchFull('focus')}
          onBlur={() => cancelPrefetch('focus')}
          className="group text-textMuted flex items-center gap-2 text-sm font-medium transition-colors hover:text-white"
        >
          View Top 100
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {top3.map((repo, i) => (
          <RepoCard key={repo.id} repo={repo} rank={i + 1} />
        ))}
      </div>

      {next3.length > 0 && <RepoList repos={next3} startRank={4} />}

      {hasOpenedModal && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
              <Loader2 className="text-primary relative z-10 h-12 w-12 animate-spin" />
            </div>
          }
        >
          <RepoModal
            isOpen={isModalOpen}
            onClose={closeModal}
            language={language.name}
            repos={fullData?.items ?? previewData.items}
            isLoading={isFullLoading}
          />
        </Suspense>
      )}
    </div>
  );
}
