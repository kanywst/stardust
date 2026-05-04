import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Language } from '../config/languages';
import { fetchTrendingRepos } from '../lib/github';
import type { SearchResponse } from '../types/github';
import { RepoCard } from './RepoCard';
import { RepoList } from './RepoList';
import { RepoModal } from './RepoModal';
import { ArrowRight, Loader2, RefreshCw } from 'lucide-react';

interface LanguageSectionProps {
  language: Language;
}

const ONE_HOUR = 1000 * 60 * 60;

export function LanguageSection({ language }: LanguageSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();

  const previewKey = ['repos', language.query, 'preview'] as const;
  const fullKey = ['repos', language.query, 'full'] as const;

  const {
    data: previewData,
    isLoading: isPreviewLoading,
    isError: isPreviewError,
    refetch: refetchPreview,
    isFetching: isPreviewFetching,
  } = useQuery({
    queryKey: previewKey,
    queryFn: ({ signal }) => fetchTrendingRepos(language.query, 6, signal),
    staleTime: ONE_HOUR,
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

  if (isPreviewLoading) {
    return (
      <div className="bg-surface/30 flex min-h-[400px] animate-pulse flex-col items-center justify-center rounded-2xl p-8">
        <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
        <p className="text-textMuted">Finding best {language.name} projects...</p>
      </div>
    );
  }

  if (isPreviewError || !previewData) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-8">
        <p className="text-red-400">
          Failed to load {language.name} repositories. API rate limit might be exceeded.
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

  const top3 = previewData.items.slice(0, 3);
  const next3 = previewData.items.slice(3, 6);

  return (
    <div className="bg-surface/30 border-surfaceHighlight/50 flex flex-col gap-6 rounded-3xl border p-6 backdrop-blur-sm">
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
          onClick={() => setIsModalOpen(true)}
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

      {isModalOpen && (
        <RepoModal
          isOpen
          onClose={closeModal}
          language={language.name}
          repos={fullData?.items ?? previewData.items}
          isLoading={isFullLoading}
        />
      )}
    </div>
  );
}
