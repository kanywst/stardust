import axios from 'axios';
import type { SearchResponse } from '../types/github';

const GITHUB_API_URL = 'https://api.github.com';

export const fetchTrendingRepos = async (
  query: string,
  limit: number = 10
): Promise<SearchResponse> => {
  const response = await axios.get<SearchResponse>(`${GITHUB_API_URL}/search/repositories`, {
    params: {
      q: `${query} stars:>100`,
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
