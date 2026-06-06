import type { GithubRepo } from '../types/github';
import { Star, GitFork, Crown, Trophy, Medal, CircleDot, History } from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import { formatRelativeTime } from '../lib/format';

interface RepoCardProps {
  repo: GithubRepo;
  rank: number;
}

export function RepoCard({ repo, rank }: RepoCardProps) {
  const getRankIcon = (r: number) => {
    switch (r) {
      case 1:
        return <Crown className="h-8 w-8 fill-yellow-400 text-yellow-400 drop-shadow-lg" />;
      case 2:
        return <Trophy className="h-7 w-7 fill-gray-300 text-gray-300 drop-shadow-md" />;
      case 3:
        return <Medal className="h-6 w-6 fill-amber-700 text-amber-700 drop-shadow-md" />;
      default:
        return null;
    }
  };

  const glowColor =
    rank === 1 ? 'shadow-yellow-500/20' : rank === 2 ? 'shadow-gray-400/20' : 'shadow-amber-700/20';
  const borderColor =
    rank === 1 ? 'border-yellow-500/50' : rank === 2 ? 'border-gray-400/50' : 'border-amber-700/50';

  return (
    <motion.a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      title={repo.name}
      className={clsx(
        'bg-surface relative flex flex-col rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        borderColor,
        glowColor,
        'group shadow-lg'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
    >
      <div className="bg-surfaceHighlight border-surface absolute -top-4 -right-4 z-10 rounded-full border p-2 shadow-sm">
        {getRankIcon(rank)}
      </div>

      <div className="mb-3 flex items-center gap-3">
        <img
          src={repo.owner.avatar_url}
          alt=""
          width={40}
          height={40}
          loading="eager"
          decoding="async"
          className="border-surfaceHighlight h-10 w-10 rounded-full border"
        />
        <div className="overflow-hidden">
          <h3 className="text-text group-hover:text-primary line-clamp-2 text-lg leading-tight font-bold transition-colors">
            {repo.name}
          </h3>
          <p className="text-textMuted mt-1 flex items-center gap-1 truncate text-xs">
            {repo.owner.login}
          </p>
        </div>
      </div>

      <p className="text-textMuted mb-3 line-clamp-2 min-h-[40px] text-sm">
        {repo.description || 'No description available.'}
      </p>

      {repo.topics && repo.topics.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="bg-surfaceHighlight text-textMuted rounded-full px-2 py-0.5 text-[10px] font-medium"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="text-textMuted mt-auto flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-3">
          <div className="bg-surfaceHighlight flex items-center gap-1.5 rounded-md px-2 py-1">
            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
            <span>{repo.stargazers_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GitFork className="h-3.5 w-3.5" />
            <span>{repo.forks_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CircleDot className="h-3.5 w-3.5" />
            <span>{repo.open_issues_count.toLocaleString()}</span>
          </div>
        </div>
        {formatRelativeTime(repo.pushed_at) && (
          <div className="flex items-center gap-1" title={`Last pushed ${repo.pushed_at}`}>
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{formatRelativeTime(repo.pushed_at)}</span>
          </div>
        )}
      </div>
    </motion.a>
  );
}
