import React from 'react';
import type { GithubRepo } from '../types/github';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface RepoListProps {
  repos: GithubRepo[];
  startRank: number;
}

export const RepoList: React.FC<RepoListProps> = ({ repos, startRank }) => {
  return (
    <div className="mt-4 flex flex-col gap-2">
      {repos.map((repo, index) => (
        <motion.a
          key={repo.id}
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          title={repo.name}
          className="bg-surface/50 hover:border-surfaceHighlight hover:bg-surface flex items-center gap-3 rounded-lg border border-transparent p-3 transition-colors"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + index * 0.05 }}
        >
          <span className="text-textMuted w-4 text-sm font-bold">{startRank + index}.</span>

          <img
            src={repo.owner.avatar_url}
            alt={repo.owner.login}
            className="h-6 w-6 rounded-full"
          />

          <div className="min-w-0 flex-1">
            <p className="text-text group-hover:text-primary line-clamp-2 text-sm leading-tight font-medium">
              {repo.name}
            </p>
          </div>

          <div className="text-textMuted flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 text-yellow-500" />
            <span>{(repo.stargazers_count / 1000).toFixed(1)}k</span>
          </div>
        </motion.a>
      ))}
    </div>
  );
};
