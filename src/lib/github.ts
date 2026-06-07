import type { SearchResponse } from '../types/github';

const GITHUB_API_URL = 'https://api.github.com';

const TOKEN_STORAGE_KEY = 'stardust-github-token';

// The browser hits api.github.com unauthenticated by default, which caps the
// Search API at ~10 requests/minute. Letting the user paste a personal access
// token (stored locally, never sent anywhere but GitHub) lifts that ceiling.
export function getStoredToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token && token.trim()) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token.trim());
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (private mode, disabled) — token simply won't persist.
  }
}

// Maps to the GitHub Search API `sort` field. `updated` surfaces recently active
// repos; the others rank by raw popularity.
export type RepoSort = 'stars' | 'forks' | 'updated';

export const fetchTrendingRepos = async (
  query: string,
  limit: number = 10,
  signal?: AbortSignal,
  sort: RepoSort = 'stars'
): Promise<SearchResponse> => {
  const url = new URL(`${GITHUB_API_URL}/search/repositories`);
  url.searchParams.set('q', `${query} stars:>100`);
  url.searchParams.set('sort', sort);
  url.searchParams.set('order', 'desc');
  url.searchParams.set('per_page', String(limit));

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };
  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { signal, headers });

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${response.statusText}`);
  }

  return (await response.json()) as SearchResponse;
};
