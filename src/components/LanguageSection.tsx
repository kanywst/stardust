import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Language } from '../config/languages';
import { fetchTrendingRepos } from '../lib/github';
import { RepoCard } from './RepoCard';
import { RepoList } from './RepoList';
import { RepoModal } from './RepoModal';
import { ArrowRight, Loader2 } from 'lucide-react';

interface LanguageSectionProps {
  language: Language;
}

export const LanguageSection: React.FC<LanguageSectionProps> = ({ language }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Light fetch for the dashboard (only top 6)
  const {
    data: previewData,
    isLoading: isPreviewLoading,
    isError: isPreviewError,
  } = useQuery({
    queryKey: ['repos', language.query, 'preview'],
    queryFn: () => fetchTrendingRepos(language.query, 6),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // 2. Heavy fetch for the modal (only when opened)
  const { data: fullData, isLoading: isFullLoading } = useQuery({
    queryKey: ['repos', language.query, 'full'],
    queryFn: () => fetchTrendingRepos(language.query, 100),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: isModalOpen, // Only fetch when modal is open
  });

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
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 p-8">
        <p className="text-red-400">
          Failed to load {language.name} repositories. API rate limit might be exceeded.
        </p>
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

      {next3.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <RepoList repos={next3} startRank={4} />
          </div>
        </div>
      )}

      {/* 
        Pass "isLoading" to the modal so it can show a spinner if data isn't ready.
        If fullData is not yet available, fallback to previewData (at least show top 6) or empty array.
        Ideally, modal should handle loading state. 
      */}
      <RepoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        language={language.name}
        repos={fullData?.items || previewData.items}
        isLoading={isFullLoading}
      />
    </div>
  );
};
