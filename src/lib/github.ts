import axios from 'axios';
import type { SearchResponse } from '../types/github';

const GITHUB_API_URL = 'https://api.github.com';

export const fetchTrendingRepos = async (
  query: string,
  limit: number = 10
): Promise<SearchResponse> => {
  // Sort by stars, order desc, created within the last year to keep it fresh?
  // Or just general "most stars" as per request?
  // Request says "starが多いリポジトリ" (repositories with many stars), implying all-time or currently trending.
  // Usually "Trending" implies specific timeframe, but "most stars" implies all time.
  // I will stick to "most stars" for the language, but maybe filter by pushed date to ensure active projects if needed.
  // For now, simple "sort:stars" is safest for "most stars".

  const response = await axios.get<SearchResponse>(`${GITHUB_API_URL}/search/repositories`, {
    params: {
      q: `${query} stars:>100`, // basic filter
      sort: 'stars',
      order: 'desc',
      per_page: limit,
    },
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  });
  return response.data;
};
