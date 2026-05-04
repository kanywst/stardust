import type { SearchResponse } from '../types/github';

const GITHUB_API_URL = 'https://api.github.com';

export const fetchTrendingRepos = async (
  query: string,
  limit: number = 10,
  signal?: AbortSignal
): Promise<SearchResponse> => {
  const url = new URL(`${GITHUB_API_URL}/search/repositories`);
  url.searchParams.set('q', `${query} stars:>100`);
  url.searchParams.set('sort', 'stars');
  url.searchParams.set('order', 'desc');
  url.searchParams.set('per_page', String(limit));

  const response = await fetch(url, {
    signal,
    headers: {
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${response.statusText}`);
  }

  return (await response.json()) as SearchResponse;
};
