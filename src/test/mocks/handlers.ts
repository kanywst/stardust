import { http, HttpResponse } from 'msw';
import type { GithubRepo, SearchResponse } from '../../types/github';

const stubRepo = (id: number): GithubRepo => ({
  id,
  name: `repo-${id}`,
  full_name: `owner${id}/repo-${id}`,
  html_url: `https://github.com/owner${id}/repo-${id}`,
  description: `Stub repository #${id}`,
  stargazers_count: 10_000 + id,
  language: 'TypeScript',
  forks_count: 1000 + id,
  open_issues_count: 10,
  pushed_at: '2026-06-01T00:00:00Z',
  owner: {
    login: `owner${id}`,
    avatar_url: `https://example.com/avatar/${id}.png`,
    html_url: `https://github.com/owner${id}`,
  },
  topics: ['testing', 'mock'],
});

export const handlers = [
  http.get('https://api.github.com/search/repositories', ({ request }) => {
    const url = new URL(request.url);
    const perPage = Number(url.searchParams.get('per_page') ?? '10');
    const items = Array.from({ length: Math.min(perPage, 6) }, (_, i) => stubRepo(i + 1));
    return HttpResponse.json<SearchResponse>({
      total_count: items.length,
      incomplete_results: false,
      items,
    });
  }),
];
